// Pruebas · Accesibilidad y aspecto: teclado, contraste (axe), tema claro y oscuro, foco y fichas en el móvil.
// Se pasan desde herramientas/pruebas.js (PRUEBAS_ZONA=accesibilidad pasa solo estas).
const fs = require('fs');
const { prueba, igual, cierto, texto, fichaAbierta } = require('./comun');

// Contraste de los textos (WCAG AA) con axe, en tema claro y oscuro, en las pantallas principales
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

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
      ['#tu-salamanca', null],
      ['#hoy', null],
      ['#tu-salamanca/logros', null],
      ['#cultura', null],
      ['#cultura/lunes-de-aguas', null]
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
          $('#palabra').style.display = 'none';
        });
      await p.waitForTimeout(450); // que acaben las transiciones de los paneles
      await p.evaluate(AXE); // no con addScriptTag: la CSP de la página no deja scripts escritos dentro
      const malos = await p.evaluate(async () =>
        (await axe.run(document, { runOnly: ['color-contrast'] })).violations.flatMap(v =>
          v.nodes.map(n => n.target.join(' '))
        )
      );
      malos.forEach(m => fallos.push(tema + ' ' + (hash || pulsar || 'inicio') + ': ' + m));
    }
  igual(fallos, [], 'textos con poco contraste');
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

prueba('Las fichas no se desplazan de lado', async p => {
  // Nada más ancho que la ficha: en el móvil, si no, se puede arrastrar hacia los lados
  const fichas = [
    () => abrirFicha('centro'),
    () => abrirTuSalamanca('actividad'),
    () => abrirRutas(),
    () => abrirRuta(0),
    () => (location.hash = '#ruta-arribes-norte'),
    () => (location.hash = '#ruta-arribes-norte/5'),
    () => abrirMonumento(MONUMENTOS[0].id),
    () => abrirHoy(),
    () => abrirEstadisticas(),
    () => abrirMonumentos(),
    () => abrirDondeComer(),
    () => abrirCultura(),
    () => abrirElementoCultura('lenteja-de-la-armuna'),
    () => abrirElementoCultura('julian-sanchez-el-charro'),
    () => abrirPueblo(PROVINCIA.m.find(m => m.n == 'Ciudad Rodrigo'))
  ];
  // Tampoco la página: nada se sale por los lados en el móvil (360 px, el más estrecho habitual)
  if (!(await p.evaluate(() => esEscritorio()))) {
    await p.setViewportSize({ width: 360, height: 760 });
    await p.waitForTimeout(200);
    igual(
      await p.evaluate(() => document.documentElement.scrollWidth),
      360,
      'la página no se sale por los lados a 360 px'
    );
  }
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
  // Y las ventanas (la de «Avisar de un error», la más cargada)
  await p.evaluate(() => abrirAvisoError());
  const [ancho, visible] = await p.$eval('.modal .caja', e => [e.scrollWidth, e.clientWidth]);
  cierto(ancho <= visible, 'la ventana de avisar de un error no se sale');
});

prueba('Coherencia visual: alturas, foco y enlaces', async p => {
  // Los botones de «Avisar de un error» tienen la misma altura
  await p.evaluate(() => abrirAvisoError());
  const alturas = await p.$$eval('.botones-aviso > *', a =>
    a.map(b => Math.round(b.getBoundingClientRect().height))
  );
  igual(new Set(alturas).size, 1, 'botones del aviso de la misma altura (' + alturas.join(', ') + ')');
  // Los enlaces de las ventanas llevan el color de la app (no el azul del navegador)
  const [colorEnlace, colorApp] = await p.evaluate(() => [
    getComputedStyle(document.querySelector('.modal .caja p a')).color,
    getComputedStyle(document.querySelector('.modal h2')).color
  ]);
  igual(colorEnlace, colorApp, 'enlace de la ventana con el color de la app');
  await p.evaluate(() => cerrarVentana());
  // «Explora»: todos los accesos con la misma altura
  const explora = await p.$$eval('#explorar .acc button', a =>
    a.map(b => Math.round(b.getBoundingClientRect().height))
  );
  igual(new Set(explora).size, 1, 'accesos de «Explora» iguales (' + explora.join(', ') + ')');
  // Foco visible en los campos, como en los botones
  await p.focus('#q');
  await p.keyboard.press('Shift+Tab');
  await p.keyboard.press('Tab');
  igual(
    await p.$eval('#q', e => getComputedStyle(e).outlineStyle),
    'solid',
    'el buscador enseña el foco con el mismo borde que los botones'
  );
  // El enlace «¿Algo está mal…?» de la ficha es un enlace, no un botón con borde
  await p.evaluate(() => abrirFicha('centro'));
  igual(await p.$eval('#errf', e => getComputedStyle(e).borderTopWidth), '0px', '«Avísanos», como enlace');
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

prueba('Ventanas largas: solo se desplaza su contenido, no la página de detrás', async p => {
  await p.evaluate(() => mostrarNovedades());
  await p.waitForSelector('.modal .cuerpo .novedades');
  cierto(
    await p.evaluate(() => document.documentElement.classList.contains('con-ventana')),
    'la página queda quieta'
  );
  const medidas = await p.$eval('.modal .caja', caja => {
    const cuerpo = caja.querySelector('.cuerpo');
    cuerpo.scrollTop = 1e6;
    const r = caja.getBoundingClientRect(),
      dentro = e => {
        const b = e.getBoundingClientRect();
        return b.top >= r.top && b.bottom <= r.bottom;
      };
    return {
      seDesplaza: cuerpo.scrollTop > 0,
      cabe: r.bottom <= innerHeight,
      botones: dentro(caja.querySelector('.botones')),
      cerrar: dentro(caja.querySelector('.cerrar'))
    };
  });
  igual(
    medidas,
    { seDesplaza: true, cabe: true, botones: true, cerrar: true },
    'título, × y botones a la vista'
  );
  await p.click('.modal .botones button');
  cierto(
    !(await p.evaluate(() => document.documentElement.classList.contains('con-ventana'))),
    'al cerrar, se suelta'
  );
});

prueba('En el móvil, Tu Salamanca y las listas que no usan el mapa se abren altas', async p => {
  if (await p.evaluate(() => esEscritorio())) return; // en el escritorio la ficha va al lado, siempre alta
  const alta = () => p.$eval('#sh', e => e.classList.contains('grande'));
  await p.click('#perfil');
  cierto(await alta(), 'Tu Salamanca');
  await p.evaluate(() => abrirCultura());
  cierto(await alta(), 'Cultura');
  await p.evaluate(() => abrirFicha('tejares'));
  cierto(!(await alta()), 'una zona, a su altura de siempre (se ve en el mapa)');
  await p.evaluate(() => abrirDondeComer());
  cierto(await alta(), 'Dónde comer');
  await p.click('#info .fila-explora');
  cierto(!(await alta()), 'al elegir un sitio, a su altura para ver su zona');
  await p.evaluate(() => {
    filtroRutas = 'coche';
    abrirRutas();
  });
  cierto(await alta(), 'las rutas por la provincia');
  await p.evaluate(() => abrirRutaProvincia(0));
  cierto(await alta(), 'y cada ruta en coche, con su mapa');
  await p.evaluate(() => {
    filtroRutas = 'pie';
    abrirRutas();
  });
  cierto(!(await alta()), 'las de a pie, con el mapa de la ciudad a la vista');
});
