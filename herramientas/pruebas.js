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
  await p.waitForFunction(() => !enGesto && !animacionMapa, null, { timeout: 3000 });
  cierto((await vb()) != antes, 'el arrastre mueve el mapa');
  cierto(await p.evaluate(() => !enGesto), 'al soltar se da el gesto por terminado');
  cierto(!(await fichaAbierta(p)), 'arrastrar no abre fichas');
  const w0 = +(await vb()).split(' ')[2];
  await p.mouse.wheel(0, -300);
  await p.waitForTimeout(400);
  cierto(+(await vb()).split(' ')[2] < w0, 'la rueda acerca');
  // Un punto cerca del centro que caiga en una zona (no encima de una avenida o un pictograma)
  const punto = await p.evaluate(([x, y]) => {
    for (let d = 0; d < 120; d += 6)
      for (const [dx, dy] of [
        [d, 0],
        [-d, 0],
        [0, d],
        [0, -d]
      ]) {
        const e = document.elementFromPoint(x + dx, y + dy);
        if (e && e.parentNode.id == 'zg') return [x + dx, y + dy];
      }
    return [x, y];
  }, r);
  await p.mouse.click(punto[0], punto[1]);
  cierto(await fichaAbierta(p), 'un toque abre la zona');
  cierto((await p.$eval('.lim.sel', e => e.getAttribute('d'))).length > 10, 'se marca el límite de la zona');
});

prueba('Zoom suave y deslizamiento', async p => {
  const ancho = () => p.$eval('#m', e => +e.getAttribute('viewBox').split(' ')[2]);
  const quieto = () => p.waitForFunction(() => !enGesto && !animacionMapa, null, { timeout: 3000 });
  const w0 = await ancho();
  await p.click('#zi');
  await p.waitForTimeout(90);
  const aMedias = await ancho();
  cierto(aMedias < w0 && aMedias > w0 / 1.6 + 0.5, 'el botón + acerca poco a poco, viéndose en directo');
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
    if (i > 1) await p.waitForTimeout(16);
    await p.mouse.move(r[0] - i * 12, r[1]);
  }
  await p.mouse.up();
  const xSoltar = await p.evaluate(() => vistaMapa.x);
  await quieto();
  const x1 = await p.$eval('#m', e => +e.getAttribute('viewBox').split(' ')[0]);
  cierto(x1 > x0, 'el mapa ha avanzado hacia donde se arrastró');
  cierto(x1 > xSoltar + 0.5, 'y sigue deslizándose después de soltar');
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

prueba(
  'Bienvenida la primera vez',
  async (p, url) => {
    await p.waitForSelector('.modal .bienvenida');
    igual(await texto(p, '.modal h3'), '¡Bienvenido al Mapa charro!', 'sale al entrar la primera vez');
    for (let i = 0; i < 3; i++) await p.click('.modal .botones button.on');
    igual(await texto(p, '.modal .botones button.on'), '¡A pisar Salamanca!', 'cuatro pasos');
    await p.click('.modal .botones button:first-child');
    igual(await texto(p, '.modal h3'), 'Mucho por descubrir', '«Anterior» vuelve un paso');
    await p.keyboard.press('Escape');
    cierto(!(await p.$('.modal')), 'Esc la cierra');
    await p.reload();
    await p.waitForTimeout(600);
    cierto(!(await p.$('.modal')), 'la segunda vez ya no sale');
    await p.click('#ayuda');
    cierto(!!(await p.$('.modal .bienvenida')), 'el botón «?» la vuelve a abrir');
    await p.click('.modal .cerrar');
    // Entrando por un enlace a una ficha, no tapa la ficha
    await p.evaluate(() => localStorage.removeItem('charro-bienvenida'));
    await p.goto(url + '#tejares');
    await p.waitForTimeout(600);
    cierto(!(await p.$('.modal')) && (await fichaAbierta(p)), 'con un enlace a una ficha no sale');
  },
  { conBienvenida: true }
);

prueba('Mapa con teclado y lector de pantalla', async p => {
  const foco = () =>
    p.evaluate(() => {
      const e = document.activeElement,
        z = zonas.find(q => q.e == e);
      return z ? z.id : e.id || e.tagName;
    });
  igual(await p.$eval('#m', e => e.getAttribute('role')), 'group', 'el mapa no es una imagen opaca');
  igual(await p.$$eval('#zg [role=button]', es => es.length), 59, 'cada zona es un botón');
  igual(await p.$$eval('#zg [tabindex="0"]', es => es.length), 1, 'una sola parada de Tab');
  cierto(
    await p.evaluate(() => {
      const orden = [...document.querySelectorAll('#zg polygon')].map(e => zonas.find(z => z.e == e).g),
        ultimoPueblo = orden.lastIndexOf(5),
        primerBarrio = orden.findIndex(g => g < 5);
      return ultimoPueblo < primerBarrio;
    }),
    'los pueblos de alrededor se pintan debajo de los barrios'
  );
  // Con Tab desde el buscador se llega al mapa, y con un Tab más se sale
  await p.focus('#q');
  let i = 0;
  while (
    i++ < 15 &&
    !(await p.evaluate(() => document.activeElement.closest && !!document.activeElement.closest('#zg')))
  )
    await p.keyboard.press('Tab');
  igual(await foco(), 'centro', 'se entra en el mapa por el Centro');
  igual(
    await p.evaluate(() => document.activeElement.getAttribute('aria-label')),
    'Centro, Centro histórico',
    'el lector dice nombre y parte de la ciudad'
  );
  cierto(
    (await p.$eval('.lim.foco', e => e.getAttribute('d'))).length > 10,
    'se ve el contorno de la zona con el foco'
  );
  // Flecha a la derecha: a una vecina que está más al este
  await p.keyboard.press('ArrowRight');
  const este = await p.evaluate(() => {
    const c = zonas.find(z => z.id == 'centro'),
      z = zonas.find(q => q.e == document.activeElement);
    return { id: z.id, alEste: z.x > c.x, vecina: c.vecinos.includes(z) };
  });
  cierto(este.alEste && este.vecina, 'la flecha lleva a la zona vecina en esa dirección');
  // Intro abre la ficha con el foco en el título; Esc la cierra y el foco vuelve a la zona
  await p.keyboard.press('Enter');
  cierto(await fichaAbierta(p), 'Intro abre la ficha');
  igual(await foco(), 'nm', 'el foco pasa al título de la ficha');
  await p.keyboard.press('Escape');
  cierto(!(await fichaAbierta(p)), 'Esc cierra la ficha');
  igual(await foco(), este.id, 'y el foco vuelve a la zona');
  await p.keyboard.press('Home');
  igual(await foco(), 'centro', 'Inicio vuelve al Centro');
  await p.keyboard.press('t');
  cierto(
    /^T/.test(await p.evaluate(() => zonas.find(q => q.e == document.activeElement).n)),
    'una letra salta a una zona por esa letra'
  );
  // Un Tab más sale del mapa
  await p.keyboard.press('Tab');
  cierto(await p.evaluate(() => !document.activeElement.closest('#zg')), 'con Tab se sale del mapa');
  // Versión al pie y sin el botón de «Resto de la provincia»
  cierto(
    /^Versión \d+\.\d+\.\d+ \(\d+\)$/.test(await texto(p, '#ver')),
    'versión al pie, con la interna entre paréntesis'
  );
  await p.click('#ver button');
  await p.waitForSelector('.modal .novedades h4');
  cierto(
    (await texto(p, '.modal .novedades h4')).startsWith((await texto(p, '#ver')).split(' ')[1]),
    'al pulsarla salen las novedades, empezando por esta versión'
  );
  await p.click('.modal .cerrar');
  cierto(!(await p.$('#rs')), 'sin botón de Resto de la provincia');
});

prueba('Salamanca en el tiempo', async p => {
  // Una zona marcada como «He estado»: en este modo no se ve la marca y al salir vuelve
  // (el color cambia con una transición de 0,25 s: se espera a que acabe)
  const relleno = async () => {
    await p.waitForTimeout(400);
    return p.evaluate(() => getComputedStyle(zonas.find(z => z.id == 'vega').e).fill);
  };
  await p.evaluate(() => {
    progreso.z.vega = 'v';
    pintarZona(zonas.find(z => z.id == 'vega'));
  });
  const rojo = await relleno();
  igual(rojo, 'rgb(168, 34, 28)', 'marcada en rojo (--vit)');
  await p.click('#tm');
  cierto((await relleno()) != rojo, 'las marcas de He estado se apagan');
  igual(await p.evaluate(() => location.hash), '#tiempo/1', 'enlace de la primera etapa');
  igual(await texto(p, '#nm'), 'El castro vetón', 'empieza por la primera etapa');
  const estado = id => p.evaluate(id => 'ep-' + zonas.find(z => z.id == id).e.dataset.ep, id);
  igual(await estado('sanvicente'), 'ep-nueva', 'San Vicente nace en la primera etapa');
  igual(await estado('labradores'), 'ep-no', 'Labradores aún no existe');
  cierto(await p.$eval('#mur', e => e.style.display == 'none'), 'sin muralla medieval todavía');
  await p.click('.tmarcas button:nth-child(3)');
  igual(await estado('sanvicente'), 'ep-ya', 'después ya existía');
  cierto(
    await p.$eval('#mur', e => e.style.display != 'none' && !e.classList.contains('derribada')),
    'la cerca nueva en pie'
  );
  await p.$eval('.tbarra', e => {
    e.value = 4;
    e.dispatchEvent(new Event('input'));
  });
  cierto(await p.$eval('#mur', e => e.classList.contains('derribada')), 'derribada en el siglo XIX');
  igual(await p.evaluate(() => location.hash), '#tiempo/5', 'cada etapa cambia el enlace');
  await p.click('#x');
  cierto(
    await p.evaluate(
      () => !document.body.classList.contains('tiempo') && !document.querySelector('#zg [data-ep]')
    ),
    'al cerrar, el mapa vuelve a ser el de hoy'
  );
  igual(await relleno(), rojo, 'y las marcas vuelven');
});

prueba('Término de Salamanca y municipios vecinos', async p => {
  cierto(
    (await p.$eval('#fondo .termino', e => e.getAttribute('d'))).length > 500,
    'se dibuja el término de Salamanca'
  );
  cierto((await p.$$('#fondo .vecino')).length >= 10, 'y los municipios vecinos');
  const rotulo = () =>
    p.$$eval('#lgf text', ts => ts.filter(t => t.style.display != 'none').map(t => t.textContent));
  await p.evaluate(() => {
    vistaMapa.x = vistaMapa.y = 0;
    vistaMapa.w = 400;
    ajustarVista();
  });
  cierto((await rotulo()).includes('Término de Salamanca'), 'con su nombre al alejar el mapa');
  cierto((await rotulo()).length > 3, 'y los nombres de los vecinos');
  await p.evaluate(() => {
    centrarMapaEn(209, 292, 60);
    ajustarVista();
  });
  igual(await rotulo(), [], 'de cerca no estorban');
});

prueba('Nació en… en la ficha', async (p, url) => {
  await p.goto(url + '#labradores');
  await p.waitForTimeout(300);
  cierto(
    (await texto(p, '#nac')).startsWith('Nació: 1900–1962, en la etapa «Ensanche y barrios obreros»'),
    'con su etapa'
  );
  await p.click('#nac button');
  igual(await texto(p, '#nm'), 'Ensanche y barrios obreros', 'el enlace abre esa etapa');
  igual(await p.evaluate(() => location.hash), '#tiempo/6', 'con su dirección');
  await p.goto(url + '#vidal');
  await p.waitForTimeout(300);
  cierto(!!(await p.$('#nac a[href^="https://"]')), 'con la fuente cuando no viene de la ficha');
  await p.goto(url + '#marin');
  await p.waitForTimeout(300);
  cierto((await texto(p, '#nac')).includes('aún no está documentada'), 'sin fecha, lo dice');
  await p.goto(url + '#monumento/catedrales');
  await p.waitForTimeout(300);
  cierto(await p.$eval('#nac', e => e.hidden), 'no sale en otras fichas');
});

prueba('Enlace a una etapa', async (p, url) => {
  await p.goto(url + '#tiempo/3');
  await p.waitForTimeout(300);
  igual(await texto(p, '#nm'), 'Repoblación y murallas', 'abre la etapa del enlace');
  cierto(await p.$eval('#mur', e => e.style.display != 'none'), 'con la muralla');
  await p.goto(url + '#tiempo/99');
  await p.waitForTimeout(300);
  igual(await texto(p, '#nm'), 'El castro vetón', 'una etapa que no existe abre la primera');
});

// Contraste de los textos (WCAG AA) con axe, en tema claro y oscuro, en las pantallas principales
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
prueba('Contraste de los textos', async (p, url) => {
  const fallos = [];
  for (const tema of ['light', 'dark'])
    for (const [hash, pulsar] of [
      ['', null],
      ['#vidal', null],
      ['#tiempo/3', null],
      ['', '#jug'],
      ['#lista', null]
    ]) {
      await p.emulateMedia({ colorScheme: tema });
      await p.goto(url + 'index.html?' + tema + hash);
      await p.waitForTimeout(250);
      if (pulsar) await p.click(pulsar);
      await p.waitForTimeout(450); // que acaben las transiciones de los paneles
      await p.addScriptTag({ content: AXE });
      const malos = await p.evaluate(async () =>
        (await axe.run(document, { runOnly: ['color-contrast'] })).violations.flatMap(v =>
          v.nodes.map(n => n.target.join(' '))
        )
      );
      malos.forEach(m => fallos.push(tema + ' ' + (hash || pulsar || 'inicio') + ': ' + m));
    }
  igual(fallos, [], 'textos con poco contraste');
});

prueba('Tarjeta de cada zona al compartir', async (p, url) => {
  // La página de la zona lleva su tarjeta y abre su ficha
  await p.goto(url + 'z/tejares.html');
  await p.waitForURL(/#tejares$/);
  await p.waitForTimeout(300);
  igual(await texto(p, '#nm'), 'Tejares', 'abre la ficha de la zona');
  const r = await p.request.get(url + 'z/tejares.html'),
    h = await r.text();
  cierto(/og:image" content="https:\/\/[^"]+\/z\/tejares\.jpg"/.test(h), 'con su imagen');
  cierto(h.includes('og:title" content="Tejares · '), 'y su título');
  // Compartir desde la ficha de una zona usa su página; desde otra ficha, el enlace de siempre
  igual(
    await p.evaluate(() => urlParaCompartir()),
    'https://alvarorzhz.github.io/mapa-charro/z/tejares.html',
    'zona'
  );
  await p.goto(url + '#monumento/catedrales');
  await p.waitForTimeout(300);
  igual(
    await p.evaluate(() => urlParaCompartir()),
    'https://alvarorzhz.github.io/mapa-charro/#monumento/catedrales',
    'otras fichas'
  );
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
  // El botón la apaga, también con una parada abierta, y la vuelve a encender
  await p.click('#rt');
  cierto(await p.$eval('#ruta', e => e.style.display == 'none'), 'el botón quita la ruta');
  cierto(!(await fichaAbierta(p)), 'y cierra la ficha de la parada');
  igual(await p.$eval('#rt', e => e.getAttribute('aria-pressed')), 'false', 'botón desmarcado');
  await p.click('#rt');
  cierto(await p.$eval('#ruta', e => e.style.display != 'none'), 'otra vez se enciende');
  await p.click('#x');
  await p.click('#rt');
  cierto(await p.$eval('#ruta', e => e.style.display == 'none'), 'con la ficha cerrada también se apaga');
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

prueba('Imagen «Mi Salamanca»', async p => {
  await p.evaluate(() => {
    progreso.z.centro = progreso.z.tejares = 'v';
    progreso.z.vidal = 'w';
    guardar();
    actualizar();
  });
  const info = await p.evaluate(async () => {
    const b = await crearImagenMiSalamanca(),
      img = await createImageBitmap(b);
    return { tipo: b.type, ancho: img.width, alto: img.height, resumen: resumenProgreso() };
  });
  igual([info.tipo, info.ancho, info.alto], ['image/png', 1080, 1350], 'imagen PNG de 1080×1350');
  igual([info.resumen.pisadas, info.resumen.porVisitar], [2, 1], 'cuenta lo pisado y lo pendiente');
  await p.click('#foto');
  await p.waitForSelector('.modal img');
  cierto(
    await p.$eval('.modal img', i => i.complete && i.naturalWidth == 1080),
    'vista previa en la ventana'
  );
  igual(
    await p.$$eval('.modal .botones button', bs => bs.map(b => b.textContent)),
    ['Compartir', 'Guardar imagen'],
    'botones'
  );
  await p.click('.modal .cerrar');
  cierto(!(await p.$('.modal')), 'la ventana se cierra');
});

prueba('Juego «¿Dónde está?»', async p => {
  // El reto del día es el mismo para todos: mismas pistas con la misma fecha
  const mismas = await p.evaluate(() => {
    const a = elegirPistas(azarConSemilla(semillaDeTexto('2026-10-07'))),
      b = elegirPistas(azarConSemilla(semillaDeTexto('2026-10-07')));
    return [
      a.length,
      new Set(a.map(q => q.zona.id)).size,
      a.map(q => q.zona.id + q.tipo).join() == b.map(q => q.zona.id + q.tipo).join()
    ];
  });
  igual(mismas, [10, 10, true], '10 pistas de zonas distintas, iguales con la misma fecha');
  // Ninguna pista dice el nombre de su zona
  const chivatas = await p.evaluate(() =>
    pistasPosibles()
      .filter(q => q.texto && q.tipo != 'Monumento' && q.texto.includes(q.zona.n))
      .map(q => q.zona.n)
  );
  igual(chivatas, [], 'las pistas no regalan el nombre');
  await p.click('#jug');
  cierto(await p.$eval('#jp', e => e.classList.contains('o')), 'se abre el panel del juego');
  cierto(
    await p.$eval('#lg', e => getComputedStyle(e).display != 'none'),
    'con los nombres de las zonas para orientarse'
  );
  igual(
    await p.$eval('#mon', e => getComputedStyle(e).display),
    'none',
    'sin pictogramas, que darían pistas'
  );
  // Tocar la zona buena en el mapa
  const buena = await p.evaluate(() => juego.preguntas[0].zona.id);
  const xy = await p.evaluate(id => {
    const z = zonas.find(q => q.id == id),
      m = z.e.getScreenCTM();
    return [m.a * z.x + m.c * z.y + m.e, m.b * z.x + m.d * z.y + m.f];
  }, buena);
  await p.mouse.click(xy[0], xy[1]);
  // Si justo ahí había otra zona encima del centro, vale igual: lo importante es que responde
  const r = await p.evaluate(() => ({
    respondida: juego.respondida,
    puntos: juego.puntos,
    ficha: document.querySelector('#sh').classList.contains('o')
  }));
  cierto(r.respondida && r.puntos > 0, 'tocar una zona responde y suma puntos');
  cierto(!r.ficha, 'durante el juego no se abren fichas');
  cierto(await p.$eval('#jgo', g => g.querySelectorAll('.jbien').length == 1), 'se marca la zona buena');
  // Las otras 9, respondiendo una zona cualquiera
  for (let i = 1; i < 10; i++) {
    await p.click('#jp .botones button');
    await p.evaluate(() => responderJuego(zonas.find(z => z.id == 'tejares')));
  }
  await p.click('#jp .botones button');
  const final = await p.evaluate(() => ({
    j: progreso.j,
    guardado: JSON.parse(localStorage.charro2).j,
    texto: document.querySelector('#jp h2').textContent
  }));
  cierto(final.j.m > 0 && final.j.d.length == 10 && final.j.s == final.j.m, 'guarda récord y reto del día');
  igual(final.guardado, final.j, 'también en el navegador');
  cierto(/de 1000 puntos/.test(final.texto), 'pantalla final');
  // Volver a pulsar el botón el mismo día: partida libre
  await p.click('#jp .botones button:nth-child(2)');
  cierto(await p.evaluate(() => juego.activo && !juego.diario), 'otra partida es libre');
  await p.click('#jp .jx');
  cierto(
    await p.evaluate(() => !juego.activo && !document.body.classList.contains('jugando')),
    'salir deja el mapa normal'
  );
  await p.click('#jug');
  await p.fill('#q', 'tejares');
  await p.press('#q', 'Enter');
  cierto(await p.evaluate(() => !juego.activo), 'abrir una ficha desde el buscador sale del juego');
});

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
      // La bienvenida de la primera vez taparía la app: se da por vista salvo en su propia prueba
      if (!opciones.conBienvenida)
        await p.addInitScript(() => localStorage.setItem('charro-bienvenida', '1'));
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
