// Pruebas de la app en un navegador de verdad (Chromium con Playwright), en móvil y escritorio.
// Uso, desde la raíz del repositorio:  node herramientas/pruebas.js
// Necesita Playwright:  npm install  (lo instala como dependencia de desarrollo) y  npx playwright install chromium
const http = require('http');
const fs = require('fs');
const path = require('path');

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch (e) {
  const global = require('child_process').execSync('npm root -g').toString().trim();
  ({ chromium } = require(path.join(global, 'playwright')));
}

const RAIZ = path.join(__dirname, '..');
const TIPOS = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webmanifest': 'application/manifest+json'
};

// Servidor estático mínimo en localhost (el modo sin conexión necesita localhost o https)
function servir() {
  const srv = http.createServer((req, res) => {
    let f = decodeURIComponent(req.url.split('?')[0]);
    if (f.endsWith('/')) f += 'index.html';
    const ruta = path.join(RAIZ, f);
    if (!ruta.startsWith(RAIZ) || !fs.existsSync(ruta)) {
      res.writeHead(404);
      return res.end();
    }
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(ruta)] || 'application/octet-stream' });
    fs.createReadStream(ruta).pipe(res);
  });
  return new Promise(ok => srv.listen(0, '127.0.0.1', () => ok(srv)));
}

const pruebas = [];
const prueba = (nombre, fn, opciones = {}) => pruebas.push({ nombre, fn, opciones });
const igual = (a, b, que) => {
  if (JSON.stringify(a) !== JSON.stringify(b))
    throw new Error(`${que}: esperaba ${JSON.stringify(b)} y es ${JSON.stringify(a)}`);
};
const cierto = (c, que) => {
  if (!c) throw new Error(que);
};
const texto = (p, s) => p.$eval(s, e => e.textContent.trim());
const fichaAbierta = p => p.$eval('#sh', e => e.classList.contains('o'));

// --- Pruebas ------------------------------------------------------------------

prueba('Carga el mapa', async p => {
  igual(await p.$$eval('#zg polygon', a => a.length), 59, 'polígonos de zonas');
  igual(await texto(p, '#cn'), '0 de 60 zonas pisadas, 0 por visitar', 'contador');
  cierto(
    (await p.$$eval('.mon', a => a.filter(e => e.style.display != 'none').length)) >= 3,
    'se ven monumentos'
  );
});

prueba('Arrastrar y acercar el mapa', async p => {
  const vb = () => p.$eval('#m', e => e.getAttribute('viewBox'));
  const antes = await vb();
  const r = await p.$eval('#m', e => {
    const b = e.getBoundingClientRect();
    return [b.x + b.width / 2, b.y + b.height / 2];
  });
  await p.mouse.move(r[0], r[1]);
  await p.mouse.down();
  await p.mouse.move(r[0] + 60, r[1] + 30, { steps: 6 });
  await p.mouse.up();
  // Al soltar puede seguir deslizándose un poco: se espera a que pare
  await p.waitForFunction(() => !document.querySelector('#m').style.transform, null, { timeout: 3000 });
  cierto((await vb()) != antes, 'el arrastre mueve el mapa');
  igual(await p.$eval('#m', e => e.style.transform), '', 'al soltar no queda transformación');
  cierto(!(await fichaAbierta(p)), 'arrastrar no abre fichas');
  const w0 = +(await vb()).split(' ')[2];
  await p.mouse.wheel(0, -300);
  await p.waitForTimeout(400);
  cierto(+(await vb()).split(' ')[2] < w0, 'la rueda acerca');
  await p.mouse.click(r[0], r[1]);
  cierto(await fichaAbierta(p), 'un toque abre la zona');
  cierto((await p.$eval('.lim.sel', e => e.getAttribute('d'))).length > 10, 'se marca el límite de la zona');
});

prueba('Zoom suave y deslizamiento', async p => {
  const ancho = () => p.$eval('#m', e => +e.getAttribute('viewBox').split(' ')[2]);
  const quieto = () =>
    p.waitForFunction(() => !document.querySelector('#m').style.transform, null, { timeout: 3000 });
  const w0 = await ancho();
  await p.click('#zi');
  await p.waitForTimeout(60);
  cierto((await p.$eval('#m', e => e.style.transform)) != '', 'el botón + acerca con animación');
  await quieto();
  cierto(Math.abs((await ancho()) - w0 / 1.6) < 1, 'acaba acercado 1,6 veces');
  // Dos toques seguidos se suman
  await p.click('#zo');
  await p.click('#zo');
  await quieto();
  const maximo = await p.evaluate(() => Math.max(ANCHO_MAPA, ALTO_MAPA / proporcionMapa()));
  cierto(Math.abs((await ancho()) - Math.min(w0 * 1.6, maximo)) < 1, 'dos «−» seguidos se suman');
  // Un arrastre rápido sigue deslizándose después de soltar
  const r = await p.$eval('#m', e => {
    const b = e.getBoundingClientRect();
    return [b.x + b.width / 2, b.y + b.height / 2];
  });
  await p.click('#zi');
  await quieto();
  const x0 = await p.$eval('#m', e => +e.getAttribute('viewBox').split(' ')[0]);
  await p.mouse.move(r[0], r[1]);
  await p.mouse.down();
  for (let i = 1; i <= 5; i++) {
    await p.mouse.move(r[0] - i * 12, r[1]);
    await p.waitForTimeout(16);
  }
  await p.mouse.up();
  await p.waitForTimeout(30);
  cierto(await p.evaluate(() => !!animacionMapa), 'sigue deslizándose al soltar');
  await quieto();
  const x1 = await p.$eval('#m', e => +e.getAttribute('viewBox').split(' ')[0]);
  cierto(x1 > x0, 'el mapa ha avanzado hacia donde se arrastró');
  igual(await p.evaluate(() => animacionMapa), null, 'la animación termina');
});

prueba('Nombres de avenidas solo al pulsarlas', async p => {
  const etiqueta = () => p.$eval('.ava', g => (g.style.display == 'none' ? '' : g.textContent));
  // Cerca, sobre una avenida, sin nada pulsado: no hay ningún nombre
  const nombre = await p.evaluate(() => {
    const nombre = Object.keys(tramosAvenidas).find(n => /Mirat/.test(n)),
      trazo = tramosAvenidas[nombre][0],
      q = trazo.getPointAtLength(trazo.getTotalLength() / 2);
    centrarMapaEn(q.x, q.y, 60);
    ajustarVista();
    return nombre;
  });
  igual(await etiqueta(), '', 'sin pulsar, no se ve ningún nombre de avenida');
  // Pulsar en el centro del tramo
  const xy = await p.evaluate(nombre => {
    const trazo = tramosAvenidas[nombre][0],
      q = trazo.getPointAtLength(trazo.getTotalLength() / 2),
      m = trazo.getScreenCTM();
    return [m.a * q.x + m.c * q.y + m.e, m.b * q.x + m.d * q.y + m.f];
  }, nombre);
  await p.mouse.click(xy[0], xy[1]);
  await p.waitForTimeout(150);
  igual(await texto(p, '#nm'), nombre, 'pulsar la avenida abre su ficha');
  igual(await etiqueta(), 'Av. de Mirat', 'y se ve su nombre');
  await p.click('#x');
  igual(await etiqueta(), '', 'al cerrar la ficha, el nombre desaparece');
});

prueba('Buscar, abrir ficha y marcar', async p => {
  await p.fill('#q', 'tejares');
  await p.press('#q', 'Enter');
  igual(await texto(p, '#nm'), 'Tejares', 'ficha abierta');
  igual(await p.evaluate(() => location.hash), '#tejares', 'enlace');
  await p.click('.bt button[data-s=v]');
  igual(await texto(p, '#cn'), '1 de 60 zonas pisadas, 0 por visitar', 'contador tras marcar');
  igual(
    await p.evaluate(() => JSON.parse(localStorage.charro2).z),
    { tejares: 'v' },
    'guardado en el navegador'
  );
  await p.reload();
  igual(await texto(p, '#cn'), '1 de 60 zonas pisadas, 0 por visitar', 'sigue tras recargar');
});

prueba('Ficha sin apartados vacíos y panel del móvil', async (p, url) => {
  await p.goto(url + '#platina');
  cierto(await p.$eval('#hl', e => e.hidden), 'sin leyendas no sale el apartado Leyenda');
  await p.goto(url + '#centro');
  cierto(!(await p.$eval('#hl', e => e.hidden)), 'con leyendas sí sale');
  if (!(await p.evaluate(() => esEscritorio()))) {
    const alto = () => p.$eval('#sh', e => e.getBoundingClientRect().height);
    const antes = await alto();
    await p.click('#asa');
    await p.waitForTimeout(400);
    cierto((await alto()) > antes, 'el asa agranda el panel');
  }
});

prueba('Enlaces y botón atrás', async (p, url) => {
  await p.goto(url + '#tenerias');
  igual(await texto(p, '#nm'), 'Tenerías', 'abre #tenerias');
  await p.click('#nb button');
  cierto(await fichaAbierta(p), 'abre la zona cercana');
  await p.click('#x');
  cierto(!(await fichaAbierta(p)), 'la × cierra');
  await p.click('#vlist');
  await p.click('#ls .lr .nm');
  await p.goBack();
  await p.waitForTimeout(100);
  cierto(!(await fichaAbierta(p)), 'atrás cierra la ficha');
  igual(await p.evaluate(() => location.hash), '#lista', 'vuelve a la lista');
  await p.goto(url + '#via/a-62');
  igual(await texto(p, '#nm'), 'A-62', 'abre una carretera');
});

prueba('Lista y provincia', async p => {
  await p.click('#vlist');
  igual(await p.$$eval('#ls .lr', a => a.length), 60, 'filas de la lista');
  await p.click('#vprov');
  igual(await p.$$eval('#pm path.pmm', a => a.length), 362, 'municipios en el minimapa');
  await p.fill('#pq', 'ledesma');
  await p.click('#prs .nm');
  await p.click('#psb .q[data-s=v]');
  cierto((await texto(p, '#pcn')).startsWith('1 de 361 pueblos'), 'pueblo marcado');
  cierto(await p.$('#psb .verficha'), 'botón de ficha del pueblo');
});

prueba('Ficha de pueblo', async (p, url) => {
  await p.goto(url + '#pueblo/la-alberca');
  igual(await texto(p, '#nm'), 'La Alberca', 'abre la ficha');
  cierto((await texto(p, '#info')).includes('habitantes'), 'habitantes');
  cierto((await p.$$('#cu p')).length >= 2, 'curiosidades');
  await p.click('.bt button[data-s=w]');
  igual(await p.evaluate(() => JSON.parse(localStorage.charro2).p), { m37010: 'w' }, 'marca el pueblo');
});

prueba('Monumentos', async (p, url) => {
  await p.goto(url + '#monumento/catedrales');
  igual(await texto(p, '#nm'), 'Catedrales Nueva y Vieja', 'abre el monumento');
  cierto((await p.$$('#info .dato')).length >= 2, 'datos clave');
  igual(await p.$$eval('.bt button', a => a.map(b => b.hidden)), [true, true, false], 'solo Compartir');
  await p.click('#nb button');
  igual(await p.evaluate(() => location.hash), '#univ', 'Ver el barrio');
  cierto((await p.$$('#mz button')).length >= 3, 'monumentos del barrio');
  await p.click('#x');
  await p.click('#mb');
  igual(await p.$eval('#mon', e => e.style.display), 'none', 'el botón oculta los monumentos');
});

prueba('Ruta a pie', async p => {
  await p.click('#rt');
  igual(await p.evaluate(() => location.hash), '#ruta', 'abre la ruta');
  igual(await p.$$eval('#info ol.paradas li', a => a.length), 9, 'paradas');
  await p.click('#nb button.principal');
  igual(await p.evaluate(() => location.hash), '#ruta/1', 'primera parada');
  await p.click('.navruta button.principal');
  igual(await p.evaluate(() => location.hash), '#ruta/2', 'siguiente parada');
  cierto(await p.$eval('#ruta', e => e.style.display != 'none'), 'camino dibujado');
});

prueba(
  'Estoy aquí (GPS)',
  async p => {
    await p.click('#zl');
    await p.waitForTimeout(400);
    igual(await texto(p, '#nm'), 'Tejares', 'localiza la zona');
    cierto((await texto(p, '#here')).startsWith('Estás aquí'), 'aviso de que estás aquí');
    await p.click('.bt button[data-s=v]');
    igual(await p.evaluate(() => JSON.parse(localStorage.charro2).gv), ['tejares'], 'pisado con GPS');
  },
  { geolocation: { latitude: 40.9575, longitude: -5.697 }, permissions: ['geolocation'] }
);

prueba(
  'Guardado en la cuenta (simulada)',
  async p => {
    await p.waitForTimeout(200);
    igual(await texto(p, '#sv'), 'Guardado en tu cuenta', 'conecta');
    await p.fill('#q', 'vega');
    await p.press('#q', 'Enter');
    await p.click('.bt button[data-s=v]');
    await p.waitForTimeout(1000);
    igual(
      await p.evaluate(() => window.__guardado && window.__guardado.z),
      { vega: 'v' },
      'sube el progreso'
    );
  },
  {
    antes: () => {
      window.claude = {
        use: async k =>
          k == 'user'
            ? { id: async () => 'prueba' }
            : {
                doc: () => ({
                  get: async () => ({ exists: false }),
                  set: async d => (window.__guardado = d),
                  onSnapshot: () => {}
                })
              }
      };
    }
  }
);

prueba('Copia de seguridad', async p => {
  await p.evaluate(() => {
    document.querySelectorAll('details').forEach(d => (d.open = true));
    $('#cd').value = btoa(JSON.stringify({ z: { centro: 'v', univ: 'w' } }));
  });
  await p.click('#ld');
  igual(await texto(p, '#cn'), '1 de 60 zonas pisadas, 1 por visitar', 'carga el código');
  await p.evaluate(() => ($('#cd').value = 'basura'));
  await p.click('#ld');
  igual(await texto(p, '#ts'), 'Código no válido', 'rechaza un código malo');
});

prueba(
  'Funciona sin conexión',
  async (p, url, ctx) => {
    await p.evaluate(() => navigator.serviceWorker.ready);
    await p.waitForTimeout(1500);
    await ctx.setOffline(true);
    await p.goto(url + '#sanesteban');
    igual(await texto(p, '#nm'), 'San Esteban', 'abre una ficha sin red');
    cierto(await p.$eval('#ph', e => e.complete && e.naturalWidth > 0), 'carga la foto sin red');
    await ctx.setOffline(false);
  },
  { conServiceWorker: true }
);

// --- Ejecución ----------------------------------------------------------------
(async () => {
  const srv = await servir();
  const url = 'http://localhost:' + srv.address().port + '/';
  const navegador = await chromium.launch();
  let fallos = 0;
  for (const [ancho, alto, nombre] of [
    [390, 844, 'móvil'],
    [1280, 860, 'escritorio']
  ]) {
    for (const { nombre: n, fn, opciones } of pruebas) {
      const ctx = await navegador.newContext({
        viewport: { width: ancho, height: alto },
        serviceWorkers: opciones.conServiceWorker ? 'allow' : 'block',
        geolocation: opciones.geolocation,
        permissions: opciones.permissions
      });
      const p = await ctx.newPage();
      const errores = [];
      p.on('pageerror', e => errores.push(e.message));
      await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
      if (opciones.antes) await p.addInitScript(opciones.antes);
      try {
        await p.goto(url);
        await p.waitForTimeout(250);
        await fn(p, url, ctx);
        if (errores.length) throw new Error('errores de JavaScript: ' + errores.join(' | '));
        console.log(`✓ ${nombre} · ${n}`);
      } catch (e) {
        fallos++;
        console.log(`✗ ${nombre} · ${n}\n    ${e.message.split('\n')[0]}`);
      }
      await ctx.close();
    }
  }
  await navegador.close();
  srv.close();
  console.log(
    fallos ? `\n${fallos} prueba(s) fallida(s)` : `\nTodas las pruebas pasan (${pruebas.length * 2}).`
  );
  process.exit(fallos ? 1 : 0);
})();
