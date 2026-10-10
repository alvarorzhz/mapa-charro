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
  igual(
    await p.$$eval('#zg polygon', a => a.length),
    await p.evaluate(() => zonas.length),
    'polígonos de zonas'
  );
  igual(
    await texto(p, '#cn'),
    `0 de ${await p.evaluate(() => todasLasZonas.length)} zonas pisadas, 0 por visitar`,
    'contador'
  );
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
    igual(await texto(p, '.modal h2'), '¡Bienvenido al Mapa charro!', 'sale al entrar la primera vez');
    for (let i = 0; i < 3; i++) await p.click('.modal .botones button.on');
    igual(await texto(p, '.modal .botones button.on'), '¡A pisar Salamanca!', 'cuatro pasos');
    await p.click('.modal .botones button:first-child');
    igual(await texto(p, '.modal h2'), 'Mucho por descubrir', '«Anterior» vuelve un paso');
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
  igual(
    await p.$$eval('#zg [role=button]', es => es.length),
    await p.evaluate(() => zonas.length),
    'cada zona es un botón'
  );
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
    /^Versión \d+\.\d+\.\d+ \(\d+\)$/.test(await texto(p, '#ver button:first-child')),
    'versión al pie, con la interna entre paréntesis'
  );
  await p.click('#ver button');
  await p.waitForSelector('.modal .novedades h4');
  cierto(
    (await texto(p, '.modal .novedades h4')).startsWith(
      (await texto(p, '#ver button:first-child')).split(' ')[1]
    ),
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
  // «Aparecen ahora»: un botón por zona que lleva a ella y dice de dónde sale su fecha
  const nacen = await p.$$eval('.tzona', bs => bs.map(b => b.textContent));
  cierto(nacen.length > 5 && nacen.includes('Úrsulas-San Marcos'), 'botones de las zonas que aparecen');
  await p.click('.tzona:text-is("Úrsulas-San Marcos")');
  cierto((await texto(p, '.tmotivo')).startsWith('Úrsulas-San Marcos: '), 'dice por qué se sabe');
  cierto(await p.evaluate(() => limiteFoco.getAttribute('d') != ''), 'marca su contorno en el mapa');
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
      ['#lista', null],
      ['#provincia', null],
      ['#pueblo/la-alberca', null],
      ['#monumento/catedrales', null],
      ['#rutas', null],
      ['#ruta-arribes-norte', null],
      ['#ruta-arribes-norte/5', null],
      ['#perfil', null]
    ]) {
      await p.emulateMedia({ colorScheme: tema });
      await p.goto(url + 'index.html?' + tema + hash);
      await p.waitForTimeout(250);
      if (pulsar) await p.click(pulsar);
      // Con una ficha abierta (fija en escritorio) y la página de detrás con scroll, axe confunde el fondo de
      // la ficha con el de la página: se cierra Logros (que en escritorio sale abierto) y se esconde la tarjeta
      // de la palabra charra (su contraste se mira sin ficha, en «inicio») para que no haya scroll
      if (hash && hash != '#lista' && hash != '#provincia')
        await p.evaluate(() => {
          $('#lgr').open = false;
          $('#palabra').style.display = 'none';
        });
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

prueba('Buscador', async p => {
  const resultados = () => p.$$eval('#sr button', bs => bs.map(b => b.textContent));
  await p.fill('#q', 'catedral');
  cierto((await resultados())[0].startsWith('Catedrales Nueva y Vieja'), 'monumentos');
  await p.fill('#q', 'muralla');
  cierto(
    (await resultados()).some(t => t.includes('Salamanca en el tiempo')),
    'etapas de la historia'
  );
  await p.fill('#q', 'rana');
  cierto(
    (await resultados())[0].startsWith('Universidad') && (await resultados())[0].includes('Curiosidad'),
    'palabras de las curiosidades, antes que lo que solo lo lleva en medio (Fuente Serrana)'
  );
  // Al pulsar fuera se recogen; al volver a la caja, vuelven
  await p.click('h1');
  igual(await p.$$eval('#sr button', b => b.length), 0, 'se recogen al pulsar fuera');
  await p.focus('#q');
  cierto((await resultados()).length > 0, 'vuelven al volver a la caja');
  await p.fill('#q', 'garrido norte');
  igual((await resultados())[0].split(/Zona/)[0], 'Garrido Norte', 'varias palabras');
  await p.fill('#q', 'chamberri');
  cierto(
    (await texto(p, '#sr')).startsWith('¿Querías decir…?') && (await resultados())[0].startsWith('Chamberí'),
    '¿Querías decir…?'
  );
  // Con flechas y Intro, y luego aparece en recientes
  await p.fill('#q', 'tejares');
  await p.keyboard.press('ArrowDown');
  await p.keyboard.press('Enter');
  igual(await texto(p, '#nm'), 'Tejares', 'flechas e Intro abren el resultado');
  await p.click('#x');
  await p.focus('#q');
  cierto((await texto(p, '#sr')).startsWith('Búsquedas recientes'), 'búsquedas recientes con la caja vacía');
  cierto((await resultados())[0].startsWith('Tejares'), 'con lo último elegido');
  // Una pedanía lleva a su municipio en la pestaña Provincia
  const pedania = await p.evaluate(() => pedanias[0].n);
  await p.fill('#q', pedania);
  await p.click('#sr button');
  igual(await p.evaluate(() => pestana), 'prov', 'pedanía, en Provincia');
});

prueba('Con ratón: globo, «/» y atajos', async p => {
  const escritorio = await p.evaluate(() => esEscritorio());
  // Globo con el nombre al pasar por una zona
  // Un punto de la zona que no tape ningún rótulo
  const caja = await p.evaluate(() => {
    const z = buscarZona('prosperidad');
    document.querySelector('.mw').scrollIntoView({ block: 'center' });
    const r = z.e.getBoundingClientRect();
    for (let i = 1; i < 10; i++)
      for (let j = 1; j < 10; j++) {
        const x = r.x + (r.width * i) / 10,
          y = r.y + (r.height * j) / 10;
        if (document.elementFromPoint(x, y) == z.e) return { x, y };
      }
  });
  await p.mouse.move(caja.x, caja.y);
  await p.mouse.move(caja.x + 2, caja.y + 2);
  cierto(!(await p.$eval('.globo', e => e.hidden)), 'aparece el globo');
  cierto((await texto(p, '.globo')).startsWith('ProsperidadSin pisar'), 'dice el nombre y cómo está la zona');
  await p.mouse.move(2, 2);
  cierto(await p.$eval('.globo', e => e.hidden), 'se va al salir del mapa');
  // Por el fondo, el nombre del término o del municipio vecino; al pulsarlo, un aviso con él
  const vecino = await p.evaluate(() => {
    Object.assign(vistaMapa, { x: 0, y: 0, w: 400, h: 480 }); // el mapa entero, con los vecinos a la vista
    ajustarVista();
    document.querySelector('.mw').scrollIntoView({ block: 'center' });
    const r = $('#m').getBoundingClientRect();
    for (let i = 1; i < 20; i++)
      for (let j = 1; j < 20; j++) {
        const x = r.x + (r.width * i) / 20,
          y = r.y + (r.height * j) / 20,
          m = document.elementFromPoint(x, y) == $('#m') && municipioFondoEn(x, y);
        if (m && m.n != 'Término de Salamanca') return { x, y, n: m.n };
      }
  });
  await p.mouse.move(vecino.x - 1, vecino.y - 1);
  await p.mouse.move(vecino.x, vecino.y);
  cierto(
    (await texto(p, '.globo')).startsWith(vecino.n + 'Municipio vecino'),
    'globo con el municipio vecino'
  );
  await p.mouse.click(vecino.x, vecino.y);
  cierto((await texto(p, '#ts')).startsWith(vecino.n), 'al pulsarlo, aviso con su nombre');
  // «/» lleva al buscador
  await p.click('h1');
  await p.keyboard.press('/');
  igual(await p.evaluate(() => document.activeElement.id), 'q', '«/» enfoca el buscador');
  // Atajos a la vista y Logros abierto, solo en escritorio
  igual(await p.$eval('.atajos', e => getComputedStyle(e).display != 'none'), escritorio, 'línea de atajos');
  igual(await p.$eval('#lgr', e => e.open), escritorio, 'Logros abierto');
});

prueba('Tema claro y oscuro', async (p, url) => {
  const tema = () => p.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await p.emulateMedia({ colorScheme: 'light' });
  const claro = await tema();
  cierto((await texto(p, '#ver .tema')).includes('oscuro'), 'en claro ofrece el oscuro');
  await p.click('#ver .tema');
  cierto((await tema()) != claro, 'cambia a oscuro');
  cierto((await texto(p, '#ver .tema')).includes('claro'), 'y ofrece volver al claro');
  await p.goto(url);
  await p.waitForTimeout(250);
  cierto((await tema()) != claro, 'se recuerda al volver');
  await p.click('#ver .tema');
  igual(await tema(), claro, 'vuelve a claro');
});

prueba('Barrios nuevos y otros nombres', async p => {
  for (const id of ['ciudadjardin', 'huertaotea', 'salasbajas'])
    cierto(await p.evaluate(id => !!buscarZona(id).e, id), 'en el mapa: ' + id);
  // Un nombre popular lleva a su barrio, y la ficha lo dice
  await p.fill('#q', 'las claras');
  await p.press('#q', 'Enter');
  igual(await texto(p, '#nm'), 'San Cristóbal', 'el buscador encuentra los otros nombres');
  igual(await texto(p, '#otros'), 'También: Las Claras', 'la ficha los muestra');
  await p.fill('#q', 'huerta otea');
  await p.press('#q', 'Enter');
  igual(await texto(p, '#nm'), 'Huerta Otea', 'barrio nuevo');
  cierto(await p.$eval('#otros', e => e.hidden), 'sin otros nombres, no sale la línea');
  cierto(
    (await texto(p, '#ap')).includes('límite en el mapa es aproximado'),
    'avisa de que su límite es aproximado'
  );
});

prueba('Buscar, abrir ficha y marcar', async p => {
  await p.fill('#q', 'tejares');
  await p.press('#q', 'Enter');
  igual(await texto(p, '#nm'), 'Tejares', 'ficha abierta');
  igual(await p.evaluate(() => location.hash), '#tejares', 'enlace');
  await p.click('.bt button[data-s=v]');
  igual(
    await texto(p, '#cn'),
    `1 de ${await p.evaluate(() => todasLasZonas.length)} zonas pisadas, 0 por visitar`,
    'contador tras marcar'
  );
  igual(
    await p.evaluate(() => JSON.parse(localStorage.charro2).z),
    { tejares: 'v' },
    'guardado en el navegador'
  );
  await p.reload();
  igual(
    await texto(p, '#cn'),
    `1 de ${await p.evaluate(() => todasLasZonas.length)} zonas pisadas, 0 por visitar`,
    'sigue tras recargar'
  );
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
  // Dos pestañas, Capital y Provincia; la lista de zonas se abre con un botón del mapa
  igual(await p.$$eval('.seg button', a => a.map(b => b.textContent)), ['Capital', 'Provincia'], 'pestañas');
  await p.click('#vlist');
  igual(await p.evaluate(() => location.hash), '#lista', 'enlace a la lista');
  cierto(await p.$eval('#vmap', b => b.classList.contains('on')), 'la lista es parte de la capital');
  igual(
    await p.$$eval('#ls .lr', a => a.length),
    await p.evaluate(() => todasLasZonas.length),
    'filas de la lista'
  );
  await p.click('#ls .volver-mapa');
  cierto(await p.$eval('#ls', e => e.style.display == 'none'), 'se cierra la lista');
  await p.click('#vprov');
  igual(await p.$$eval('#pm path.pmm', a => a.length), 362, 'municipios en el minimapa');
  igual(
    (await p.$$eval('#pm .pmv-e text', a => a.map(t => t.textContent))).sort(),
    ['A-50', 'A-62', 'A-66', 'CL-517', 'N-501', 'N-620', 'N-630'],
    'autovías y nacionales en el minimapa'
  );
  // Leyenda de carreteras y habitantes en la lista de comarcas (cada pueblo y el total de la comarca)
  igual(await p.$$eval('.pml span', a => a.length), 3, 'leyenda de carreteras');
  cierto(
    await p.$eval('#pcl .pg', e => getComputedStyle(e).display != 'grid'),
    'la lista de pueblos no coge el estilo de las barras del perfil'
  );
  igual(
    await p.evaluate(() =>
      vistaProvincia.comarcas.reduce(
        (s, c) => s + +c.titulo.querySelector('.habc').textContent.replace(/\D/g, ''),
        0
      )
    ),
    328779,
    'las comarcas suman la provincia'
  );
  cierto(/^[\d.]+ hab\.$/.test(await texto(p, '#pcl .pr .habm')), 'habitantes junto a cada pueblo');
  await p.fill('#pq', 'ledesma');
  await p.click('#prs .nm');
  igual(
    await texto(p, '#pm .pms-e text'),
    'Ledesma',
    'el pueblo elegido se resalta en el mapa con su nombre'
  );
  igual(await p.$$eval('#pm .pms-t', a => a.length), 1, 'y solo él');
  cierto(
    /^👥 [\d.]+ habitantes \(INE, 2025\), contando sus pedanías$/.test(await texto(p, '#psb .habitantes')),
    'habitantes con las pedanías'
  );
  await p.click('#psb .q[data-s=v]');
  cierto((await texto(p, '#pcn')).startsWith('1 de 361 pueblos'), 'pueblo marcado');
  // Los pueblos del mapa de la capital también los llevan
  await p.evaluate(() => abrirFicha('santamarta'));
  cierto(
    /^Alrededores · [\d.]+ habitantes \(INE, 2025\)$/.test(await texto(p, '#k')),
    'en los pueblos del alfoz'
  );
  igual(
    await p.evaluate(() => [conMiles(148), conMiles(1045), conMiles(328779)]),
    ['148', '1.045', '328.779'],
    'cifras con punto'
  );
  cierto(await p.$('#psb .verficha'), 'botón de ficha del pueblo');
});

prueba('Ficha de pueblo', async (p, url) => {
  await p.goto(url + '#pueblo/la-alberca');
  igual(await texto(p, '#nm'), 'La Alberca', 'abre la ficha');
  igual(
    (await texto(p, '#info .hab')).split(' ·')[0],
    (await p.evaluate(() => conMiles(HABITANTES.m[37010]))) + ' habitantes (INE, 2025)',
    'habitantes del INE'
  );
  cierto((await texto(p, '#ap')).includes('INE'), 'con su fuente');
  cierto((await p.$$('#cu p')).length >= 2, 'curiosidades');
  await p.click('.bt button[data-s=w]');
  igual(await p.evaluate(() => JSON.parse(localStorage.charro2).p), { m37010: 'w' }, 'marca el pueblo');
});

prueba('Monumentos', async (p, url) => {
  await p.goto(url + '#monumento/catedrales');
  igual(await texto(p, '#nm'), 'Catedrales Nueva y Vieja', 'abre el monumento');
  cierto((await p.$$('#info .dato')).length >= 2, 'datos clave');
  igual(
    await p.$$eval('.bt button', a => a.map(b => (b.hidden ? '' : b.textContent || 'compartir'))),
    ['He estado aquí', '', 'compartir'],
    'He estado aquí y Compartir'
  );
  // Visitarlo cuenta para los logros de monumentos, y se puede deshacer
  await p.click('.bt button[data-s=v]');
  igual(await p.evaluate(() => progreso.j.mo), ['catedrales'], 'visitado');
  cierto(
    await p.evaluate(() => calcularLogros().find(a => a.id == 'mo5').c == 1),
    'suma al logro de monumentos'
  );
  await p.click('.bt button[data-s=v]');
  await p.click('#ts button');
  igual(await p.evaluate(() => progreso.j.mo), ['catedrales'], 'quitar se deshace');
  await p.click('#nb button');
  igual(await p.evaluate(() => location.hash), '#univ', 'Ver el barrio');
  cierto((await p.$$('#mz button')).length >= 3, 'monumentos del barrio');
  await p.click('#x');
  await p.click('#zc');
  await p.click('#mb');
  igual(await p.$eval('#mon', e => e.style.display), 'none', 'el interruptor oculta los monumentos');
});

prueba('Panel de capas y leyenda', async p => {
  cierto(await p.$eval('#capas', e => e.hidden), 'cerrado al empezar');
  await p.click('#zc');
  cierto(!(await p.$eval('#capas', e => e.hidden)), 'el botón lo abre');
  igual(await p.$eval('#zc', e => e.getAttribute('aria-expanded')), 'true', 'y lo anuncia');
  igual((await p.$$('#capas .lg span')).length, 11, 'con la leyenda dentro');
  // Los parques, manchas verdes con su interruptor
  igual(
    await p.$$eval('#pk path', a => a.length),
    await p.evaluate(() => PARQUES.length),
    'parques en el mapa'
  );
  await p.click('#pkb');
  igual(await p.$eval('#pk', e => e.style.display), 'none', 'Parques se apaga');
  await p.click('#pkb');
  await p.click('#rb');
  igual(await p.$eval('#rd', e => e.style.display), 'none', 'Carreteras se apaga');
  igual(await p.$eval('#rb', e => e.getAttribute('aria-pressed')), 'false', 'y el interruptor lo dice');
  await p.click('#rb');
  igual(await p.$eval('#rd', e => e.style.display), '', 'y se vuelve a encender');
  await p.keyboard.press('Escape');
  cierto(await p.$eval('#capas', e => e.hidden), 'Esc lo cierra');
  await p.click('#zc');
  await p.mouse.click(5, 5);
  cierto(await p.$eval('#capas', e => e.hidden), 'tocar fuera lo cierra');
  // La ruta a pie y Salamanca en el tiempo, a la vista: en el móvil con los demás accesos de arriba;
  // en escritorio bajo el mapa, donde no los tapa la ficha
  const dondeAccesos = (await p.evaluate(() => esEscritorio())) ? '.modos' : '.acc';
  cierto(await p.$eval(dondeAccesos + ' #rt', e => e.offsetParent != null), 'Rutas a pie a la vista');
  cierto(
    await p.$eval(dondeAccesos + ' #tm', e => e.offsetParent != null),
    'Salamanca en el tiempo a la vista'
  );
  igual(
    await p.$eval('#cmp', e => e.getAttribute('aria-label')),
    'Compartir este sitio',
    'Compartir, como icono con nombre'
  );
});

prueba('Sellos «V» y rutas sobre zonas pisadas', async p => {
  await p.evaluate(() => {
    progreso.z.centro = 'v';
    todasLasZonas.forEach(pintarZona);
  });
  // De lejos no se ven los sellos; al acercar, sí
  await p.evaluate(() => {
    vistaMapa.w = 300;
    ajustarVista();
  });
  cierto(await p.$eval('#sg', e => getComputedStyle(e).display == 'none'), 'sin sellos de lejos');
  await p.evaluate(() => {
    vistaMapa = { x: 180, y: 220, w: 80, h: 80 };
    ajustarVista();
  });
  cierto(await p.$eval('#sg', e => getComputedStyle(e).display != 'none'), 'con sellos de cerca');
  // Con una ruta, las zonas pisadas se aclaran, sin sellos, y la ruta lleva borde blanco
  await p.click('#rt');
  await p.click('.tarjeta-ruta >> nth=0');
  cierto(await p.evaluate(() => document.body.classList.contains('con-ruta')), 'modo ruta');
  igual(await p.$eval('.z.v', e => getComputedStyle(e).fillOpacity), '0.35', 'zonas pisadas aclaradas');
  cierto(await p.$eval('#sg', e => getComputedStyle(e).display == 'none'), 'sin sellos con la ruta');
  cierto((await p.$$('.ruta-monumental .rt-borde')).length > 0, 'borde blanco de la ruta');
});

prueba(
  'Tu perfil: estadísticas e historial',
  async (p, url) => {
    // Lo que ya estaba marcado se apunta sin fecha; lo nuevo, con la de hoy
    igual(
      await p.evaluate(() => progreso.j.hi),
      [
        ['', 'z', 'centro'],
        ['', 'lo', 'p']
      ],
      'lo de antes (la zona y su logro), sin fecha'
    );
    await p.evaluate(() => marcarZona('vidal', 'v'));
    igual(
      await p.evaluate(() => progreso.j.hi.find(e => e[2] == 'vidal')[0]),
      await p.evaluate(() => fechaHoy()),
      'lo nuevo, con fecha'
    );
    await p.click('#perfil');
    igual(await p.evaluate(() => location.hash), '#perfil', 'abre el perfil');
    cierto((await texto(p, '#info')).includes('2 de 63 zonas pisadas'), 'zonas pisadas');
    cierto((await texto(p, '.historial')).includes('Pisaste Vidal'), 'historial');
    cierto(await p.isVisible('.actividad'), 'actividad de las últimas semanas');
    cierto((await texto(p, '#info')).includes('Te faltan 8 zonas para ser «Paseante»'), 'el siguiente nivel');
    cierto((await texto(p, '#info')).includes('Sin cuenta'), 'sin cuenta');
    // Con la cuenta de Claude (o de Google) saluda por el nombre, que no se guarda en el progreso
    await p.evaluate(() => {
      nombreClaude = 'Álvaro Rodríguez';
      abrirPerfil();
    });
    igual(await texto(p, '#nm'), 'Hola, Álvaro', 'saluda por el nombre');
    cierto((await texto(p, '.perfil-nombre')) == 'Álvaro Rodríguez', 'y lo pone entero');
    cierto(!JSON.stringify(await p.evaluate(() => progreso)).includes('Álvaro'), 'sin guardarlo');
    await p.evaluate(() => (nombreClaude = ''));
    // Quitar la marca la quita del historial
    await p.evaluate(() => marcarZona('vidal', 'v'));
    cierto(!(await p.evaluate(() => progreso.j.hi.some(e => e[2] == 'vidal'))), 'sin la marca quitada');
    // El historial se limpia y se junta sin repetir, con la fecha más antigua
    igual(
      await p.evaluate(
        () =>
          juntarHistoriales(
            [
              ['2026-10-05', 'z', 'vega'],
              ['', 'z', 'teso']
            ],
            [
              ['2026-10-01', 'z', 'vega'],
              ['2026-10-02', 'z', 'teso'],
              ['mal', 'z', 'x']
            ]
          ).length
      ),
      3,
      'junta sin repetir'
    );
    igual(
      await p.evaluate(
        () =>
          limpiarProgreso({
            z: {},
            j: {
              hi: [
                ['mal', 'z', 'x'],
                ['2026-10-01', 'z', 'vega']
              ]
            }
          }).j.hi
      ),
      [['2026-10-01', 'z', 'vega']],
      'se guarda limpio'
    );
    // Enlace directo
    await p.goto(url + '#perfil');
    await p.waitForTimeout(300);
    cierto((await texto(p, '#k')) == 'Tu perfil', 'enlace al perfil');
  },
  {
    antes: () => {
      if (!sessionStorage.getItem('cargado')) {
        sessionStorage.setItem('cargado', '1');
        localStorage.setItem('charro2', JSON.stringify({ z: { centro: 'v' }, t: 5 }));
      }
    }
  }
);

prueba('Rutas por la provincia', async (p, url) => {
  // La lista única tiene las rutas a pie y las de la provincia, con filtros
  await p.click('#rt');
  cierto((await texto(p, '#info')).includes('Por la provincia, en coche'), 'apartado de la provincia');
  await p.click('#info .fl button:text-is("A pie")');
  cierto(!(await texto(p, '#info')).includes('Arribes del norte'), 'el filtro A pie la esconde');
  await p.click('#info .fl button:text-is("Por la provincia")');
  igual(
    await p.$$eval('.tarjeta-ruta', a => a.length),
    await p.evaluate(() => RUTAS_PROVINCIA.length),
    'solo las de la provincia'
  );
  await p.click('.tarjeta-ruta:has-text("Arribes del norte")');
  igual(await p.evaluate(() => location.hash), '#ruta-arribes-norte', 'abre la ruta');
  cierto(await p.isVisible('.mapa-ruta-prov'), 'con su mapa');
  igual(await p.$$eval('.mapa-ruta-prov .rpn', a => a.length), 8, 'nueve paradas en ocho marcadores');
  igual(await texto(p, '.mapa-ruta-prov .rpn.varias text'), '8–9', 'los dos miradores de la presa, juntos');
  const datos = await texto(p, '#info .datos');
  cierto(
    /Día completo/.test(datos) && /\d+ km/.test(datos) && /Al volante/.test(datos),
    'duración, km y tiempo'
  );
  const google = await p.$eval('#nb a.principal', a => a.href);
  cierto(
    google.startsWith('https://www.google.com/maps/dir/?api=1') && google.includes('waypoints='),
    'Google Maps'
  );
  cierto(await p.isVisible('.mapa-ruta-prov .pmv-t.a'), 'con las autovías de referencia');
  // Seguimiento: «La quiero hacer», luego «La he hecho» (va al historial) y en la lista lleva su etiqueta
  igual(
    await p.$$eval('.bt button[data-s]:not([hidden])', a => a.map(b => b.textContent)),
    ['La he hecho', 'La quiero hacer'],
    'botones de seguimiento'
  );
  await p.click('.bt button[data-s=w]');
  igual(await p.evaluate(() => progreso.j.rs), { 'arribes-norte': 'w' }, 'la quiere hacer');
  await p.click('.bt button[data-s=v]');
  igual(await p.evaluate(() => progreso.j.rs), { 'arribes-norte': 'v' }, 'la ha hecho');
  cierto(
    await p.evaluate(() => calcularLogros().some(a => a.id == 'rh1' && a.c >= a.m)),
    'logro de la primera ruta hecha'
  );
  igual(
    await p.evaluate(() => {
      const a = calcularLogros().find(a => a.id == 'rhp');
      return [a.c, a.m];
    }),
    [1, await p.evaluate(() => RUTAS_PROVINCIA.length)],
    'y cuenta para hacer todas las de la provincia'
  );
  cierto(
    await p.evaluate(() => progreso.j.hi.some(e => e[1] == 'rh' && e[2] == 'arribes-norte')),
    'historial'
  );
  cierto(await p.$eval('.bt button[data-s=v]', b => b.classList.contains('on')), 'botón marcado');
  igual(
    await p.evaluate(
      () => juntarProgresos({ z: {}, j: { rs: { 'arribes-norte': 'w', sierra: 'w' } } }, progreso).j.rs
    ),
    { 'arribes-norte': 'v' },
    'al juntar, gana «la he hecho» y se quitan las rutas que no existen'
  );
  await p.evaluate(() => abrirRutas());
  cierto(
    (await texto(p, '.tarjeta-ruta:has-text("Arribes del norte") .marca-ruta')).includes('La has hecho'),
    'etiqueta en la lista'
  );
  await p.click('.tarjeta-ruta:has-text("Arribes del norte")');
  await p.click('.bt button[data-s=v]');
  igual(await p.evaluate(() => progreso.j.rs), {}, 'pulsar otra vez la quita');
  // Las paradas: desde el mapa y con «Siguiente»; foto, cómo llegar, más fuentes y «He estado aquí»
  await p.$eval('.mapa-ruta-prov .rpn >> nth=4', g =>
    g.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  );
  igual(await p.evaluate(() => location.hash), '#ruta-arribes-norte/5', 'abre la parada del mapa');
  igual(await texto(p, '#nm'), 'Cabeza de Framontanos', 'su ficha');
  cierto(
    await p.waitForSelector('#ph', { state: 'visible', timeout: 3000 }).then(
      () => true,
      () => false
    ),
    'con foto'
  );
  igual(await p.$$eval('#nb a.llegar', a => a.length), 2, 'cómo llegar en Google Maps y OpenStreetMap');
  cierto((await p.$$('#ap a')).length > 1, 'y todas sus fuentes');
  await p.click('.bt button[data-s=v]');
  igual(await p.evaluate(() => progreso.j.r['arribes-norte']), ['cabeza-framontanos'], 'parada visitada');
  cierto(
    await p.evaluate(() => calcularLogros().some(a => a.id == 'ru-arribes-norte' && a.c == 1 && a.m == 9)),
    'cuenta para su logro'
  );
  await p.click('#nb .navruta button.principal');
  igual(await p.evaluate(() => location.hash), '#ruta-arribes-norte/6', 'la siguiente');
  // Todas las rutas de la provincia se abren sin errores
  for (const id of await p.evaluate(() => RUTAS_PROVINCIA.map(r => r.id))) {
    await p.evaluate(h => (location.hash = h), '#ruta-' + id + '/1');
    await p.waitForTimeout(150);
    cierto(await fichaAbierta(p), 'abre ' + id);
  }
  // Enlace directo a una parada y búsqueda
  await p.goto(url + '#ruta-arribes-norte/2');
  await p.waitForTimeout(300);
  igual(await texto(p, '#nm'), 'Trabanca y su mercadillo portugués', 'enlace a la parada');
  await p.fill('#q', 'cabeza de framontanos');
  cierto((await texto(p, '#sr')).includes('Arribes del norte'), 'el buscador la encuentra');
});

prueba('Rutas a pie', async p => {
  // El botón abre la lista de rutas
  await p.click('#rt');
  igual(await p.evaluate(() => location.hash), '#rutas', 'abre la lista');
  igual(
    await p.$$eval('.tarjeta-ruta', a => a.length),
    await p.evaluate(() => RUTAS.length + RUTAS_PROVINCIA.length),
    'las de a pie y las de la provincia'
  );
  // La monumental: sus paradas son monumentos
  await p.click('.tarjeta-ruta >> nth=0');
  igual(await p.evaluate(() => location.hash), '#ruta', 'abre la ruta monumental');
  igual(await p.$$eval('#info ol.paradas li', a => a.length), 9, 'paradas');
  await p.click('#nb button.principal');
  igual(await p.evaluate(() => location.hash), '#ruta/1', 'primera parada');
  await p.click('.navruta button.principal');
  igual(await p.evaluate(() => location.hash), '#ruta/2', 'siguiente parada');
  cierto(await p.$eval('#ruta', e => e.style.display != 'none'), 'camino dibujado');
  // El botón la apaga, también con una parada abierta
  await p.click('#rt');
  cierto(await p.$eval('#ruta', e => e.style.display == 'none'), 'el botón quita la ruta');
  cierto(!(await fichaAbierta(p)), 'y cierra la ficha de la parada');
  igual(await p.$eval('#rt', e => e.getAttribute('aria-pressed')), 'false', 'botón desmarcado');
  // Los murales: paradas propias, con su ficha, su fuente y su enlace
  await p.click('#rt');
  await p.click('.tarjeta-ruta:has-text("Murales")');
  igual(await p.evaluate(() => location.hash), '#ruta-murales', 'abre la de los murales');
  await p.click('#nb button.principal');
  igual(await p.evaluate(() => location.hash), '#ruta-murales/1', 'primer mural');
  igual(await texto(p, '#nm'), 'Diáspora', 'su ficha');
  cierto((await texto(p, '#ap')).startsWith('Fuente: '), 'con su fuente');
  cierto(await p.$eval('.ruta-murales', e => e.style.display != 'none'), 'se ve su camino');
  cierto(await p.$eval('.ruta-monumental', e => e.style.display == 'none'), 'y no el de otra ruta');
  // Un enlace directo a una parada de otra ruta
  await p.evaluate(() => (location.hash = '#ruta-vandyck/2'));
  await p.waitForTimeout(200);
  igual(await texto(p, '#nm'), 'Café de Chinitas', 'enlace a una parada de Van Dyck');
  // Desde el buscador, un mural
  await p.click('#x');
  await p.fill('#q', 'geppetto');
  await p.press('#q', 'Enter');
  igual(await texto(p, '#nm'), 'Geppetto', 'el buscador encuentra los murales');
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

prueba(
  'Cuenta con Google (simulada)',
  async p => {
    await p.waitForTimeout(200);
    cierto(
      (await texto(p, '#cuenta')).startsWith('Para no perder tu progreso: Entrar con Google'),
      'ofrece entrar si hay progreso'
    );
    await p.click('#cuenta button');
    await p.waitForTimeout(300);
    igual(await texto(p, '#sv'), 'Guardado en tu cuenta (prueba@ejemplo.es)', 'entra y conecta');
    igual(
      await p.evaluate(() => progreso.z),
      { centro: 'v', vega: 'v' },
      'junta lo del navegador con lo de la cuenta'
    );
    await p.waitForTimeout(1000);
    igual(await p.evaluate(() => window.__nubeGoogle.datos.z), { centro: 'v', vega: 'v' }, 'y lo sube');
    igual(await p.evaluate(() => localStorage.getItem('charro-cuenta')), 'u1', 'recuerda la cuenta');
    // Salir: el progreso se queda en el navegador
    await p.click('#cuenta button');
    await p.click('.modal .botones button:text-is("Salir")');
    igual(await texto(p, '#sv'), 'Guardado en este navegador', 'sale');
    cierto((await texto(p, '#cuenta')).endsWith('Entrar con Google'), 'vuelve a ofrecer entrar');
    igual(await p.evaluate(() => Object.keys(progreso.z).length), 2, 'el progreso sigue');
    // Borrar la cuenta borra lo de la nube
    await p.click('#cuenta button');
    await p.waitForTimeout(300);
    await p.click('#cuenta button');
    await p.click('.modal .botones button:text-is("Borrar mi cuenta")');
    await p.click('.modal .botones button:text-is("Borrar")');
    await p.waitForTimeout(200);
    igual(await p.evaluate(() => window.__nubeGoogle.datos), null, 'borra el progreso de la nube');
    igual(await p.evaluate(() => localStorage.getItem('charro-cuenta')), null, 'y olvida la cuenta');
  },
  {
    antes: () => {
      // Firebase falso: una cuenta de Google y su documento de progreso en memoria
      localStorage.setItem('charro2', JSON.stringify({ z: { vega: 'v' }, t: 5 }));
      const nube = { datos: { z: { centro: 'v' }, t: 9, v: 1 } },
        oyentes = [];
      let usuario = null;
      window.__nubeGoogle = nube;
      const avisar = () => oyentes.forEach(f => f(usuario)),
        auth = {
          onAuthStateChanged: f => {
            oyentes.push(f);
            setTimeout(() => f(usuario));
            return () => {};
          },
          signInWithPopup: async () => {
            usuario = { uid: 'u1', email: 'prueba@ejemplo.es', delete: async () => (usuario = null) };
            avisar();
          },
          signOut: async () => {
            usuario = null;
            avisar();
          }
        },
        doc = {
          get: async () => ({ exists: !!nube.datos, data: () => nube.datos }),
          set: async d => (nube.datos = d),
          delete: async () => (nube.datos = null),
          onSnapshot: () => () => {}
        };
      window.firebase = {
        prueba: true,
        apps: [1],
        auth: Object.assign(() => auth, { GoogleAuthProvider: function () {} }),
        firestore: () => ({ collection: () => ({ doc: () => doc }) })
      };
    }
  }
);

prueba(
  'Cuenta de Claude en un dispositivo nuevo con enlace a una zona',
  async p => {
    // La ficha de la zona se abre antes de que llegue la cuenta: lo de la cuenta no se puede perder
    await p.waitForTimeout(1200);
    igual(await p.evaluate(() => progreso.z), { centro: 'v', vega: 'w' }, 'trae lo de la cuenta');
    cierto(await p.evaluate(() => progreso.j.fl.includes('tejares')), 'y conserva la ficha leída');
    igual(await p.evaluate(() => window.__guardado.z), { centro: 'v', vega: 'w' }, 'la cuenta sigue entera');
    igual(
      await p.evaluate(() => localStorage.getItem('charro-cuenta-claude')),
      'prueba',
      'recuerda la cuenta'
    );
  },
  {
    hash: '#tejares',
    antes: () => {
      window.__guardado = { z: { centro: 'v', vega: 'w' }, t: 9, v: 1 };
      window.claude = {
        use: async k =>
          k == 'user'
            ? { id: async () => 'prueba' }
            : {
                doc: () => ({
                  get: () =>
                    new Promise(r =>
                      setTimeout(() => r({ exists: true, data: () => window.__guardado }), 300)
                    ),
                  set: async d => (window.__guardado = d),
                  onSnapshot: () => () => {}
                })
              }
      };
    }
  }
);

prueba(
  'Cuenta con Google tras abrir solo fichas',
  async p => {
    // En un navegador nuevo se lee una ficha (solo cuenta para los logros) y luego se entra
    await p.evaluate(() => abrirFicha('vega'));
    await p.evaluate(() => cerrarFicha());
    igual(await p.evaluate(() => progreso.t), 0, 'leer una ficha no hace la copia más nueva');
    await p.click('#cuenta button');
    await p.waitForTimeout(1300);
    igual(await p.evaluate(() => progreso.z), { centro: 'v', tejares: 'w' }, 'trae lo de la cuenta');
    igual(await p.evaluate(() => window.__nubeGoogle.datos.z), { centro: 'v', tejares: 'w' }, 'sin pisarla');
    cierto(await p.evaluate(() => window.__nubeGoogle.datos.j.fl.includes('vega')), 'y suma la ficha leída');
  },
  {
    antes: () => {
      const nube = { datos: { z: { centro: 'v', tejares: 'w' }, t: 9, v: 1 } };
      let usuario = null;
      const oyentes = [];
      window.__nubeGoogle = nube;
      const auth = {
          onAuthStateChanged: f => {
            oyentes.push(f);
            setTimeout(() => f(usuario));
            return () => {};
          },
          signInWithPopup: async () => {
            usuario = { uid: 'u1', email: 'prueba@ejemplo.es' };
            oyentes.forEach(f => f(usuario));
          }
        },
        doc = {
          get: async () => ({ exists: !!nube.datos, data: () => nube.datos }),
          set: async d => (nube.datos = d),
          onSnapshot: () => () => {}
        };
      window.firebase = {
        prueba: true,
        apps: [1],
        auth: Object.assign(() => auth, { GoogleAuthProvider: function () {} }),
        firestore: () => ({ collection: () => ({ doc: () => doc }) })
      };
    }
  }
);

prueba('Las fichas no se desplazan de lado', async p => {
  // Nada más ancho que la ficha: en el móvil, si no, se puede arrastrar hacia los lados
  const fichas = [
    () => abrirFicha('centro'),
    () => abrirPerfil(),
    () => abrirRutas(),
    () => abrirRuta(0),
    () => (location.hash = '#ruta-arribes-norte'),
    () => (location.hash = '#ruta-arribes-norte/5'),
    () => abrirMonumento(MONUMENTOS[0].id)
  ];
  for (const abrir of fichas) {
    await p.evaluate(abrir);
    await p.waitForTimeout(250);
    const [ancho, visible, k] = await p.$eval('.sb', e => [
      e.scrollWidth,
      e.clientWidth,
      document.querySelector('#nm').textContent
    ]);
    cierto(ancho <= visible, 'sin desplazamiento lateral en «' + k + '» (' + ancho + ' > ' + visible + ')');
  }
});

prueba('Accesibilidad: estados, nombres y avisos', async p => {
  // La ficha cerrada no se alcanza con el tabulador (en el móvil estaba fuera de la pantalla pero enfocable)
  cierto(await p.$eval('#sh', e => getComputedStyle(e).visibility == 'hidden'), 'ficha cerrada, oculta');
  await p.evaluate(() => abrirFicha('centro'));
  await p.waitForTimeout(400);
  cierto(await p.$eval('#sh', e => getComputedStyle(e).visibility == 'visible'), 'abierta, visible');
  // Los botones dicen su estado y, en la lista, de qué zona son
  await p.click('.bt button[data-s=v]');
  igual(
    await p.$eval('.bt button[data-s=v]', b => b.getAttribute('aria-pressed')),
    'true',
    'He estado pulsado'
  );
  igual(await p.$eval('#vmap', b => b.getAttribute('aria-pressed')), 'true', 'pestaña elegida');
  await p.evaluate(() => cambiarPestana('list'));
  igual(
    await p.$eval('#ls .lr .q', b => b.getAttribute('aria-label')),
    await p.evaluate(() => 'He estado: ' + document.querySelector('#ls .lr .nm').textContent),
    'el botón de la lista nombra su zona'
  );
  igual(await p.$eval('#ls .fl', e => e.getAttribute('aria-label')), 'Mostrar', 'filtros con nombre');
  // «Deshacer» dura 10 s
  await p.evaluate(() => cambiarPestana('map'));
  await p.evaluate(() => marcarZona('centro', 'v'));
  await p.waitForTimeout(6000);
  cierto(await p.$eval('#ts', e => e.classList.contains('con-accion')), '«Deshacer» sigue a los 6 s');
  // El buscador anuncia cuántos resultados hay
  await p.fill('#q', 'garrido');
  await p.waitForTimeout(200);
  cierto(/^\d+ resultados?\./.test(await texto(p, '#srn')), 'el buscador anuncia los resultados');
  await p.fill('#q', 'zzzzqqq');
  await p.waitForTimeout(200);
  cierto((await texto(p, '#srn')).startsWith('Sin resultados'), 'y cuando no hay');
  // Las medallas no se leen
  cierto(await p.$$eval('.medalla', a => a.every(e => e.getAttribute('aria-hidden') == 'true')), 'medallas');
});

prueba('Un enlace mal formado no rompe el arranque', async (p, url) => {
  await p.goto(url + '#%E0%A4%A');
  await p.waitForTimeout(300);
  cierto(await p.isVisible('#m'), 'carga el mapa');
  await p.evaluate(() => abrirFicha('centro'));
  igual(await texto(p, '#nm'), 'Centro', 'y la app funciona');
});

prueba('Ficha de «Resto de la provincia»', async p => {
  await p.evaluate(() => abrirFicha('resto'));
  cierto(await fichaAbierta(p), 'se abre');
  igual(await texto(p, '#nm'), 'Resto de la provincia', 'con su nombre');
  await p.evaluate(() => cerrarFicha());
  await p.click('#vlist');
  await p.click('.lr .nm:text-is("Resto de la provincia")');
  cierto(await fichaAbierta(p), 'también desde la Lista');
});

prueba(
  'Cuenta con Google: ventanita bloqueada en el móvil',
  async p => {
    await p.click('#cuenta button');
    await p.waitForTimeout(300);
    igual(
      await texto(p, '#cuenta'),
      'Pulsa aquí para elegir tu cuenta de Google',
      'si el navegador bloquea la ventanita, pide otra pulsación'
    );
    await p.click('#cuenta button');
    await p.waitForTimeout(300);
    igual(await p.evaluate(() => window.__intentos), 2, 'y a la segunda la abre');
  },
  {
    antes: () => {
      window.__intentos = 0;
      const auth = {
        onAuthStateChanged: f => {
          setTimeout(() => f(null));
          return () => {};
        },
        signInWithPopup: async () => {
          if (++window.__intentos == 1)
            throw Object.assign(new Error('bloqueada'), { code: 'auth/popup-blocked' });
        }
      };
      window.firebase = {
        prueba: true,
        apps: [1],
        auth: Object.assign(() => auth, { GoogleAuthProvider: function () {} }),
        firestore: () => ({})
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

prueba('Quitar una marca se puede deshacer', async p => {
  await p.fill('#q', 'tejares');
  await p.press('#q', 'Enter');
  await p.click('.bt button[data-s=v]');
  cierto(await p.$eval('#ts', e => e.classList.contains('exito')), 'marcar es un aviso de éxito');
  await p.waitForTimeout(2600); // que pase también el aviso del logro
  await p.click('.bt button[data-s=v]');
  igual(await texto(p, '#ts span'), 'Tejares: quitada de «He estado»', 'avisa al quitarla');
  igual(await p.evaluate(() => progreso.z.tejares), undefined, 'quitada');
  await p.click('#ts button');
  igual(await p.evaluate(() => progreso.z.tejares), 'v', 'y Deshacer la recupera');
  cierto(
    await p.$eval('.bt button[data-s=v]', b => b.classList.contains('on')),
    'el botón vuelve a estar marcado'
  );
  // Los errores se ven distintos
  await p.evaluate(() => aviso('Algo ha fallado', { tipo: 'error' }));
  igual(
    await p.$eval('#ts', e => [e.className.includes('error'), e.getAttribute('role')]),
    [true, 'alert'],
    'error con su estilo'
  );
});

prueba('Palabras charras: tarjeta, ficha y logros', async p => {
  // La tarjeta bajo el mapa enseña una palabra con su fuente; «Otra palabra» cambia y cuenta las dos
  cierto(await p.isVisible('#palabra'), 'tarjeta a la vista');
  const antes = await texto(p, '#palabra .pal-def');
  cierto((await p.$$('#palabra a[href^="https://"]')).length == 1, 'con su fuente');
  await p.click('#palabra .pal-cab button');
  cierto((await texto(p, '#palabra .pal-def')) != antes, 'otra palabra');
  igual(await p.evaluate(() => progreso.j.pv.length), 2, 'dos palabras vistas');
  // La ficha del Centro trae la suya; una zona sin palabra propia, siempre la misma
  await p.evaluate(() => abrirFicha('centro'));
  cierto((await texto(p, '#pch')).includes('debajo del reloj'), 'palabra del Centro');
  await p.evaluate(() => abrirFicha('vidal'));
  const deVidal = await texto(p, '#pch');
  await p.evaluate(() => abrirFicha('tejares'));
  await p.evaluate(() => abrirFicha('vidal'));
  igual(await texto(p, '#pch'), deVidal, 'la misma palabra en la misma zona');
  // Índice de la ficha: lleva a cada apartado
  igual(
    await p.$$eval('#idx button', b => b.map(x => x.textContent)),
    ['Curiosidades', 'Dónde comer', 'Palabra charra'],
    'índice de la ficha de Vidal'
  );
  // En otras fichas no salen ni la palabra ni el índice
  await p.evaluate(() => abrirRutas());
  cierto(await p.isHidden('#pch'), 'sin palabra fuera de las zonas');
  cierto(await p.isHidden('#idx'), 'sin índice fuera de las zonas');
  await p.evaluate(() => cerrarFicha());
  // Logros
  const ids = await p.evaluate(() => calcularLogros().map(a => a.id));
  for (const id of ['pa1', 'pam', 'pat']) cierto(ids.includes(id), 'logro ' + id);
  // Lista de logros plegada por categorías: todos los logros caen en alguna
  igual(
    await p.evaluate(() =>
      calcularLogros()
        .filter(a => !CATEGORIAS_LOGRO.some(c => c[2].includes(a.cat)))
        .map(a => a.id)
    ),
    [],
    'cada logro en una categoría'
  );
  igual(
    await p.$$eval('#lga .ac', a => a.length),
    await p.evaluate(() => calcularLogros().length),
    'todos en la lista'
  );
  igual(
    await p.evaluate(() => calcularLogros().find(a => a.id == 'pa1').c >= 1),
    true,
    '«Hablas charro» conseguido'
  );
  // Se guardan limpias
  igual(
    await p.evaluate(() => limpiarProgreso({ z: {}, j: { pv: ['candar', 'nada', 'candar'] } }).j.pv),
    ['candar'],
    'palabras vistas limpias'
  );
});

prueba('Salir del reto a medias pregunta', async p => {
  await p.click('#jug');
  await p.waitForTimeout(300);
  // Sin responder nada, sale sin preguntar
  await p.click('#jp .jx');
  cierto(await p.evaluate(() => !juego.activo), 'sin empezar, sale directamente');
  await p.click('#jug');
  await p.waitForTimeout(300);
  await p.evaluate(() => responderJuego(juego.preguntas[0].zona));
  await p.click('#jp .jx');
  igual(await texto(p, '.modal h2'), '¿Dejar el reto del día?', 'a medias, pregunta');
  await p.click('.modal .botones button:text-is("Seguir jugando")');
  cierto(await p.evaluate(() => juego.activo), 'Seguir jugando no lo deja');
  // Esc también pregunta, y otra Esc cierra la pregunta sin volver a abrirla
  await p.keyboard.press('Escape');
  igual(await texto(p, '.modal h2'), '¿Dejar el reto del día?', 'Esc pregunta');
  await p.keyboard.press('Escape');
  cierto(!(await p.$('.modal')) && (await p.evaluate(() => juego.activo)), 'otra Esc cierra la pregunta');
  await p.evaluate(() => cambiarPestana('list')); // en escritorio, el panel del juego tapa las pestañas
  cierto(!!(await p.$('.modal')), 'cambiar de pestaña también pregunta');
  await p.click('.modal .botones button:text-is("Salir")');
  igual(await p.evaluate(() => [juego.activo, pestana]), [false, 'list'], 'Salir lo deja y va a la pestaña');
});

prueba('Logros: los que salen de los datos, el siguiente y su barra', async p => {
  const ids = await p.evaluate(() => calcularLogros().map(a => a.id));
  for (const id of [
    'ep5',
    'ru-monumental',
    'ru-murales',
    'ru-vandyck',
    'ru-todas',
    'mo5',
    'jr7',
    'j10',
    'jn1',
    'co0',
    'tch',
    'pfi',
    'pe1',
    'z25',
    'g15',
    'fl10',
    'et',
    'es-plateresco',
    'ms',
    'cp3'
  ])
    cierto(ids.includes(id), 'logro ' + id);
  cierto(!ids.includes('pc'), 'sin el logro repetido «Comarca completa»');
  igual(new Set(ids).size, ids.length, 'sin ids repetidos');
  cierto(
    (await texto(p, '#sig')).startsWith('📍Siguiente logro: Primer vítor'),
    'siguiente logro a la vista'
  );
  // Marcar una zona dice cuánto falta para el logro de su grupo
  await p.fill('#q', 'vidal');
  await p.press('#q', 'Enter');
  await p.click('.bt button[data-s=v]');
  cierto((await texto(p, '#ts span')).includes('en «Oeste completo»'), 'el aviso dice lo que falta');
  // Una parada propia de una ruta cuenta para el logro de esa ruta
  await p.evaluate(() => (location.hash = '#ruta-murales/1'));
  await p.waitForTimeout(200);
  await p.click('.bt button[data-s=v]');
  igual(await p.evaluate(() => progreso.j.r), { murales: ['diaspora'] }, 'parada visitada');
  // Abrir una ficha cuenta para el logro de lectura
  await p.evaluate(() => abrirFicha('tejares'));
  cierto(await p.evaluate(() => progreso.j.fl.includes('tejares')), 'ficha leída apuntada');
  await p.evaluate(() => cerrarFicha());
  // Racha del reto del día, a partir de los días guardados
  const racha = await p.evaluate(() => {
    const d = new Date(),
      dia = n => {
        const f = new Date(d);
        f.setDate(d.getDate() - n);
        return (
          f.getFullYear() +
          '-' +
          String(f.getMonth() + 1).padStart(2, '0') +
          '-' +
          String(f.getDate()).padStart(2, '0')
        );
      };
    progreso.j.h = [dia(0), dia(1), dia(2), dia(4)];
    return rachaReto();
  });
  igual(racha, 3, 'racha de días seguidos');
  // Lo nuevo se conserva al limpiar el progreso (navegador o cuenta)
  igual(
    await p.evaluate(() => {
      const l = limpiarProgreso({
        z: {},
        j: { mo: ['catedrales', 'nada'], r: { murales: ['nido', 'x'] }, pf: 1 }
      }).j;
      return [l.mo, l.r, l.pf];
    }),
    [['catedrales'], { murales: ['nido'] }, 1],
    'se guarda limpio'
  );
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

prueba(
  'Funciona sin conexión',
  async (p, url, ctx) => {
    await p.evaluate(() => navigator.serviceWorker.ready);
    await p.waitForTimeout(1500);
    await ctx.setOffline(true);
    await p.goto(url + '#sanesteban');
    igual(await texto(p, '#nm'), 'San Esteban', 'abre una ficha sin red');
    cierto(await p.$eval('#ph', e => e.complete && e.naturalWidth > 0), 'carga la foto sin red');
    // Abrir otra página de la web no cambia la copia de la app (la guardada como index.html)
    await ctx.setOffline(false);
    await p.goto(url + 'privacidad.html');
    await p.waitForTimeout(500);
    const copias = await p.evaluate(async () => {
      const r = await caches.match('index.html');
      const q = await caches.match(new URL('privacidad.html', location.href).href);
      return [r ? await r.text() : '', q ? await q.text() : ''];
    });
    cierto(
      copias[0].includes('id="m"'),
      'la copia de la app sigue siendo el mapa, no la última página vista'
    );
    cierto(copias[1].includes('<h1>Privacidad</h1>'), 'y la privacidad tiene su propia copia');
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
  // PRUEBAS_TAMANO=movil o =escritorio pasa solo esas (en GitHub Actions van las dos a la vez)
  const soloTamano = process.env.PRUEBAS_TAMANO;
  for (const [ancho, alto, nombre] of [
    [390, 844, 'móvil'],
    [1280, 860, 'escritorio']
  ].filter(([, , n]) => !soloTamano || n.normalize('NFD').replace(/[\u0300-\u036f]/g, '') == soloTamano)) {
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
        await p.goto(url + (opciones.hash || ''));
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
