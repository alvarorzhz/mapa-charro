// Pruebas · Fichas de zonas y monumentos, el buscador y marcar.
// Se pasan desde herramientas/pruebas.js (PRUEBAS_ZONA=fichas pasa solo estas).
const { prueba, igual, cierto, texto, hastaQue, sinTransiciones } = require('./comun');

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
  await hastaQue(() => p.$eval('#nac', e => e.hidden), 'no sale en otras fichas');
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
  igual(await p.evaluate(() => estadoApp.pestana), 'prov', 'pedanía, en Provincia');
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
  // Atajos a la vista, solo en escritorio
  igual(await p.$eval('.atajos', e => getComputedStyle(e).display != 'none'), escritorio, 'línea de atajos');
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
    `1 de ${await p.evaluate(() => todasLasZonas.length)} zonas pisadas`,
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
    `1 de ${await p.evaluate(() => todasLasZonas.length)} zonas pisadas`,
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

prueba('Los avisos no tapan la ficha', async (p, url) => {
  await p.goto(url + '#centro');
  await p.waitForSelector('#sh.o');
  await sinTransiciones(p);
  await p.evaluate(() => aviso('Prueba de aviso'));
  await sinTransiciones(p);
  const { aviso: abajoAviso, techo } = await p.evaluate(() => ({
    aviso: $('#ts').getBoundingClientRect().bottom,
    techo: (esEscritorio() ? $('#sh .bt') : $('#sh')).getBoundingClientRect().top
  }));
  cierto(abajoAviso <= techo, 'el aviso queda por encima (en el móvil, de toda la ficha)');
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
  igual(await p.evaluate(() => estadoApp.progreso.j.mo), ['catedrales'], 'visitado');
  cierto(
    await p.evaluate(() => calcularLogros().find(a => a.id == 'mo5').c == 1),
    'suma al logro de monumentos'
  );
  await p.click('.bt button[data-s=v]');
  await p.click('#ts button');
  igual(await p.evaluate(() => estadoApp.progreso.j.mo), ['catedrales'], 'quitar se deshace');
  await p.click('#nb button');
  igual(await p.evaluate(() => location.hash), '#univ', 'Ver el barrio');
  cierto((await p.$$('#mz button')).length >= 3, 'monumentos del barrio');
  await p.click('#x');
  await p.click('#zc');
  await p.click('#mb');
  igual(await p.$eval('#mon', e => e.style.display), 'none', 'el interruptor oculta los monumentos');
});

prueba('Fichas: para seguir explorando', async (p, url) => {
  const filas = () =>
    p.$$eval('#rel .rel-fila', fs =>
      fs.map(f => [f.querySelector('.rel-t').textContent, f.querySelectorAll('button,.rel-etq').length])
    );
  // Monumento: la ruta que pasa (con su parada) y lo que hay cerca, con distancia calculada
  await p.goto(url + '#monumento/catedrales');
  const mo = await filas();
  igual(mo[0], ['En la ruta:', 1], 'la ruta monumental');
  cierto((await texto(p, '#rel')).includes('parada 5 de 9'), 'con su número de parada');
  cierto(
    mo.some(f => f[0] == 'Cerca, en línea recta:' && f[1] >= 1),
    'monumentos cercanos'
  );
  cierto(
    mo.some(f => f[0] == 'En «Salamanca en el tiempo»:'),
    'y su etapa de la historia'
  );
  await p.evaluate(() =>
    [...document.querySelectorAll('#rel button')].find(b => b.textContent.includes('Casa Lis')).click()
  );
  igual(await p.evaluate(() => location.hash), '#monumento/casalis', 'y se abren');
  // Zona: rutas a pie y parques dentro de su límite; los monumentos visitados, con ✓
  await p.evaluate(() => {
    ponerVisita({ tipo: 'mo', id: 'catedrales', n: 'Catedrales' }, true);
    abrirFicha('univ');
  });
  cierto((await texto(p, '#rel')).includes('Ruta monumental'), 'la ruta que pasa por el barrio');
  cierto((await texto(p, '#mz')).includes('Catedrales Nueva y Vieja ✓'), 'monumento visitado marcado');
  // En la zona van abajo, tras curiosidades, leyenda y dónde comer, en líneas plegadas con su número
  cierto(
    await p.evaluate(() =>
      ['#mz', '#culf', '#rel'].every(
        s => $('#eat').compareDocumentPosition($(s)) & Node.DOCUMENT_POSITION_FOLLOWING
      )
    ),
    'monumentos, cultura y rutas, debajo de lo principal'
  );
  igual(
    await p.$$eval('#mz details, #culf details, #rel details', ds =>
      ds.map(d => [
        d.open,
        [...d.querySelectorAll('summary span')]
          .map(s => s.textContent)
          .join('|')
          .replace(/\d+/g, 'N')
      ])
    ),
    [
      [false, 'Monumentos|N|N ✓'],
      [false, 'Cultura y tradiciones|N'],
      [false, 'Rutas a pie que pasan por aquí|N'],
      [false, 'Aquí hubo|N']
    ],
    'plegados, con cuántos hay y cuántos visitados'
  );
  await p.evaluate(() => abrirFicha('arrabal'));
  cierto((await texto(p, '#rel')).includes('Parque Elio Antonio de Nebrija'), 'sus parques');
  await p.evaluate(() => abrirFicha('garridosur'));
  cierto(await p.$eval('#rel', e => e.hidden), 'sin nada relacionado, no sale');
  // Pueblo: qué ver (paradas de las rutas, con su tiempo de visita), rutas en coche, pedanías, foto y cercanos
  await p.goto(url + '#pueblo/la-alberca');
  const pu = await filas();
  igual(
    pu.map(f => f[0]),
    [
      'Qué ver:',
      'Rutas en coche que pasan por aquí:',
      'En «Salamanca en el tiempo»:',
      'Otros pueblos cerca, en línea recta:'
    ],
    'apartados del pueblo'
  );
  cierto(
    await p.evaluate(
      () => !!($('#rel').compareDocumentPosition($('#hc')) & Node.DOCUMENT_POSITION_FOLLOWING)
    ),
    'en el pueblo, «Qué ver» sigue arriba'
  );
  cierto((await texto(p, '#rel')).includes('unos 90 min'), 'tiempo de visita de los datos de la ruta');
  cierto((await texto(p, '#info .peds')).includes('Las Batuecas'), 'nombres de las pedanías');
  cierto(!(await p.$eval('#ph', e => e.hidden)), 'con foto (de la parada de la ruta)');
  cierto((await texto(p, '#pc')).includes('Wikimedia Commons'), 'y su autoría');
  await p.click('#rel button');
  igual(await p.evaluate(() => location.hash), '#ruta-sierra-francia/2', 'Qué ver abre la parada');
  cierto(
    (await texto(p, '#nb')).includes('Ver la ficha de La Alberca'),
    'y la parada lleva de vuelta al pueblo'
  );
  // Un sitio propio de una ruta a pie lleva a su barrio
  await p.goto(url + '#ruta-murales/3');
  cierto((await texto(p, '#nb')).includes('Ver Barrio del Oeste'), 'el mural lleva a su barrio');
});

prueba('Fotos de monumentos y pueblos, y sitios de la ciudad de hoy', async (p, url) => {
  // Todos los monumentos tienen foto con autor y licencia, salvo los que no la tienen libre
  const sinFoto = await p.evaluate(() => MONUMENTOS.filter(m => !fotoDeMonumento(m)).map(m => m.id));
  cierto(sinFoto.length <= 2, 'casi todos los monumentos con foto (faltan: ' + sinFoto.join(', ') + ')');
  await p.goto(url + '#monumento/catedrales');
  await p.waitForSelector('#sh.o');
  cierto(await p.isVisible('#ph'), 'las Catedrales, con su foto');
  cierto((await texto(p, '#pc')).includes('Foto: Zarateman · CC0'), 'y su autoría');
  // Un sitio de la ciudad de hoy: se presenta como sitio, no como monumento
  await p.evaluate(() => abrirMonumento('estacion-tren'));
  cierto((await texto(p, '#k')).startsWith('Sitio · '), 'la estación es un sitio');
  cierto((await texto(p, '#info')).includes('1877'), 'con su historia');
  // Pueblo con foto propia y pueblo nuevo con ficha
  await p.goto(url + '#pueblo/penaranda-de-bracamonte');
  await p.waitForSelector('#sh.o');
  cierto(await p.isVisible('#ph'), 'Peñaranda, con foto');
  await p.goto(url + '#pueblo/la-fregeneda');
  await p.waitForSelector('#sh.o');
  igual(await texto(p, '#nm'), 'La Fregeneda', 'ficha nueva de La Fregeneda');
  cierto((await texto(p, '#rel')).includes('Qué ver'), 'con lo que se ve allí en las rutas');
});

prueba('Las estaciones y los cines salen como «Sitio» en el buscador', async p => {
  await p.fill('#q', 'estación de tren');
  await p.waitForTimeout(200);
  cierto((await texto(p, '#sr')).includes('Sitio ·'), 'dice «Sitio»');
  await p.fill('#q', 'catedral nueva');
  await p.waitForTimeout(200);
  cierto((await texto(p, '#sr')).includes('Monumento ·'), 'y los monumentos, «Monumento»');
});
