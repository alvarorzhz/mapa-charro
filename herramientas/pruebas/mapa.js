// Pruebas · Mapa de la capital: carga, gestos, zoom, avenidas, calles reales de fondo, capas, filtros y «Estoy aquí».
// Se pasan desde herramientas/pruebas.js (PRUEBAS_ZONA=mapa pasa solo estas).
const { prueba, igual, cierto, texto, fichaAbierta, mapLibreFalso } = require('./comun');

prueba('Carga el mapa', async p => {
  igual(
    await p.$$eval('#zg polygon', a => a.length),
    await p.evaluate(() => zonas.length),
    'polígonos de zonas'
  );
  igual(
    await texto(p, '#cn'),
    `0 de ${await p.evaluate(() => todasLasZonas.length)} zonas pisadas`,
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
  'Mapa real de fondo: encendido de entrada, sigue al mapa y se recuerda si se apaga',
  async (p, url) => {
    const camara = () => p.evaluate(() => window.camaraFondo);
    await p.waitForFunction(() => window.camaraFondo);
    cierto(await p.$eval('.mw', e => e.classList.contains('fondo-real')), 'encendido de entrada');
    igual(await p.getAttribute('#frb', 'aria-pressed'), 'true', 'el interruptor lo dice');
    igual(await p.evaluate(() => localStorage.getItem('charro-fondo-real')), null, 'sin guardar nada');
    const antes = await camara();
    cierto(
      Math.abs(antes.center[0] + 5.66) < 0.05 && Math.abs(antes.center[1] - 40.965) < 0.05,
      'centrado en Salamanca'
    );
    await p.click('#zi');
    await p.waitForTimeout(700);
    cierto((await camara()).zoom > antes.zoom + 0.3, 'al acercar el dibujo, el fondo se acerca con él');
    await p.evaluate(() => {
      vistaMapa.w = 120;
      ajustarVista();
    });
    igual(
      await p.$$eval('.avp, .ava', a => a.filter(e => getComputedStyle(e).display != 'none').length),
      0,
      'sin nuestras avenidas ni sus nombres'
    );
    igual(await p.$eval('#pk', e => getComputedStyle(e).display), 'none', 'ni nuestros parques');
    // Apagado: se recuerda y ya no se pide MapLibre al volver
    await p.click('#zc');
    await p.click('#frb');
    cierto(!(await p.$eval('.mw', e => e.classList.contains('fondo-real'))), 'se apaga');
    cierto(await p.$eval('#pk', e => getComputedStyle(e).display != 'none'), 'y vuelven los parques');
    igual(await p.evaluate(() => localStorage.getItem('charro-fondo-real')), '0', 'y se recuerda');
    p.pedidasMapLibre = 0;
    await p.goto(url);
    await p.waitForTimeout(400);
    cierto(!(await p.$eval('.mw', e => e.classList.contains('fondo-real'))), 'sigue apagado al volver');
    igual(p.pedidasMapLibre, 0, 'sin pedir MapLibre');
    // Encendido otra vez a mano
    await p.click('#zc');
    await p.click('#frb');
    await p.waitForFunction(() => window.camaraFondo);
    igual(await p.evaluate(() => localStorage.getItem('charro-fondo-real')), '1', 'encendido otra vez');
  },
  { conFondoReal: true, rutas: mapLibreFalso }
);

prueba(
  'Mapa real de fondo: sin poder cargarlo de entrada, se queda apagado sin avisar',
  async p => {
    await p.waitForTimeout(600);
    cierto(!(await p.$eval('.mw', e => e.classList.contains('fondo-real'))), 'apagado');
    igual(await texto(p, '#ts'), '', 'sin aviso de error');
    igual(await p.evaluate(() => localStorage.getItem('charro-fondo-real')), null, 'sin guardar nada');
  },
  {
    conFondoReal: true,
    rutas: p => p.route('https://cdnjs.cloudflare.com/**', r => r.abort())
  }
);

prueba('Panel de capas y leyenda', async p => {
  cierto(await p.$eval('#capas', e => e.hidden), 'cerrado al empezar');
  await p.click('#zc');
  cierto(!(await p.$eval('#capas', e => e.hidden)), 'el botón lo abre');
  igual(await p.$eval('#zc', e => e.getAttribute('aria-expanded')), 'true', 'y lo anuncia');
  igual((await p.$$('#capas .lg span')).length, 11, 'con la leyenda dentro');
  // Los parques, manchas verdes sin interruptor propio: las esconden las calles reales
  igual(
    await p.$$eval('#pk path', a => a.length),
    await p.evaluate(() => PARQUES.length),
    'parques en el mapa'
  );
  cierto(!(await p.$('#pkb')), 'sin interruptor de parques');
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
  // «Explora», bajo el mapa (en escritorio no lo tapa la ficha)
  for (const [id, que] of [
    ['#hy', '¿Qué puedo descubrir hoy?'],
    ['#mns', 'Monumentos'],
    ['#rt', 'Rutas'],
    ['#tm', 'Salamanca en el tiempo'],
    ['#dc', 'Dónde comer'],
    ['#jug', '¿Dónde está?']
  ])
    cierto(await p.$eval('#explorar ' + id, e => e.offsetParent != null), que + ' a la vista en «Explora»');
  igual(
    await p.$eval('#cmp', e => e.getAttribute('aria-label')),
    'Compartir este sitio',
    'Compartir, como icono con nombre'
  );
});

prueba('Sellos «V» y rutas sobre zonas pisadas', async p => {
  await p.evaluate(() => {
    estadoApp.progreso.z.centro = 'v';
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

prueba('Filtros combinables del mapa', async p => {
  const atenuadas = () => p.$$eval('#zg .z.fuera', a => a.length);
  igual(await atenuadas(), 0, 'sin filtros no se atenúa nada');
  await p.evaluate(() => marcarZona('tejares', 'v'));
  await p.click('#zc');
  // Solo «Sin pisar» y solo el sur: se combinan
  await p.click('#fmap [aria-label="Zonas"] button:nth-child(1)');
  await p.click('#fmap [aria-label="Zonas"] button:nth-child(2)');
  const sinPisarSur = await p.evaluate(
    () => zonas.filter(z => z.g == 4 && !estadoApp.progreso.z[z.id]).length
  );
  await p.evaluate(() => GRUPOS_FILTRO.forEach(([g]) => g != 4 && filtrosMapa.grupos.delete(g)));
  await p.evaluate(() => aplicarFiltrosMapa());
  igual(
    await p.$$eval('#zg .z:not(.fuera)', a => a.length),
    sinPisarSur,
    'quedan a la vista las zonas del sur sin pisar'
  );
  cierto(
    await p.evaluate(() => buscarZona('tejares').e.classList.contains('fuera')),
    'Tejares (pisada) se atenúa'
  );
  cierto(
    (await texto(p, '#fmap .fmap-r')).startsWith('Se ven ' + sinPisarSur + ' de '),
    'el resumen lo cuenta'
  );
  cierto(await p.$eval('#zc', e => e.classList.contains('filtrado')), 'el botón de capas avisa del filtro');
  // Monumentos: quitar «Iglesias» los quita del mapa
  await p.click('#fmap [aria-label="Monumentos"] button:nth-child(1)');
  cierto(
    await p.evaluate(() =>
      MONUMENTOS.filter(m => categoriaMonumento(m) == 'religioso').every(m => m.g.style.display == 'none')
    ),
    'sin iglesias en el mapa'
  );
  await p.click('#fmap .fmap-r button');
  igual(await atenuadas(), 0, '«Quitar filtros» lo deja como estaba');
  cierto(!(await p.$eval('#zc', e => e.classList.contains('filtrado'))), 'y el aviso se quita');
});
