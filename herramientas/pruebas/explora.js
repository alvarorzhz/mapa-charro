// Pruebas · «Explora»: ¿Qué puedo descubrir hoy?, Monumentos y Dónde comer, rutas a pie, Salamanca en el tiempo, Cultura, Agenda, la hora dorada, Salamanca desaparecida, detalles escondidos y el juego.
// Se pasan desde herramientas/pruebas.js (PRUEBAS_ZONA=explora pasa solo estas).
const { prueba, igual, cierto, texto, fichaAbierta, llegaA } = require('./comun');

prueba('Salamanca en el tiempo: cada etapa enlazada con monumentos, personajes y pueblos', async (p, url) => {
  await p.goto(url + '#tiempo/5');
  await p.waitForSelector('#sh.o .tetapa-rel');
  const rel = await texto(p, '.tetapa-rel');
  cierto(rel.includes('Plaza de Toros') || rel.includes('Glorieta'), 'el monumento de su época');
  cierto(rel.includes('Julián Sánchez') && rel.includes('Tomás Bretón'), 'personajes de su época');
  // Los pueblos salen por los años de sus fichas: Arapiles (1812) está en esta etapa y no en otra
  cierto(rel.includes('Arapiles') && rel.includes('1812'), 'pueblos con un hecho fechado en la etapa');
  igual(
    await p.evaluate(() => etapasDePueblo(municipioPorNombre('Arapiles'))),
    [4],
    'Arapiles solo en su etapa'
  );
  // Ida y vuelta: del personaje a la etapa, y de la etapa al pueblo
  await p.evaluate(() => abrirElementoCultura('tomas-breton'));
  cierto((await texto(p, '#info')).includes('📜 1812–1899'), 'la ficha cultural lleva a su etapa');
  await p.evaluate(() =>
    [...document.querySelectorAll('#info button')].find(b => b.textContent.startsWith('📜')).click()
  );
  igual(await p.evaluate(() => location.hash), '#tiempo/5', 'y la abre');
  await p.evaluate(() => abrirPueblo(municipioPorNombre('Arapiles')));
  cierto((await texto(p, '#rel')).includes('📜 1812–1899'), 'la ficha del pueblo también');
  await p.evaluate(() => abrirMonumento('glorieta'));
  cierto((await texto(p, '#rel')).includes('📜 1812–1899'), 'y la del monumento');
});

prueba('Ruta «Personajes en bronce»: cada estatua con su personaje', async (p, url) => {
  const k = await p.evaluate(() => RUTAS.findIndex(r => r.id == 'personajes'));
  cierto(k >= 0, 'la ruta existe');
  await p.goto(url + '#ruta-personajes/2');
  await p.waitForSelector('#sh.o');
  igual(await texto(p, '#nm'), 'Monumento a Carmen Martín Gaite', 'la parada');
  await p.evaluate(() =>
    [...document.querySelectorAll('#nb button')].find(b => b.textContent.includes('su historia')).click()
  );
  igual(await p.evaluate(() => location.hash), '#cultura/martin-gaite', 'lleva a su ficha de cultura');
  cierto(
    (await texto(p, '#info')).includes('Personajes en bronce, parada 2'),
    'que a su vez lleva a la parada'
  );
});

prueba('Salamanca en el tiempo', async p => {
  // Una zona marcada como «He estado»: en este modo no se ve la marca y al salir vuelve
  // (el color cambia con una transición de 0,25 s: se espera a que acabe)
  const relleno = async () => {
    await p.waitForTimeout(400);
    return p.evaluate(() => getComputedStyle(zonas.find(z => z.id == 'vega').e).fill);
  };
  await p.evaluate(() => {
    estadoApp.progreso.z.vega = 'v';
    pintarZona(zonas.find(z => z.id == 'vega'));
  });
  const rojo = await relleno();
  igual(rojo, 'rgb(168, 34, 28)', 'marcada en rojo (--vitor)');
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

prueba('Enlace a una etapa', async (p, url) => {
  await p.goto(url + '#tiempo/3');
  await llegaA(() => texto(p, '#nm'), 'Repoblación y murallas', 'abre la etapa del enlace');
  cierto(await p.$eval('#mur', e => e.style.display != 'none'), 'con la muralla');
  await p.goto(url + '#tiempo/99');
  await llegaA(() => texto(p, '#nm'), 'El castro vetón', 'una etapa que no existe abre la primera');
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
  await llegaA(() => texto(p, '#nm'), 'Café de Chinitas', 'enlace a una parada de Van Dyck');
  // Desde el buscador, un mural
  await p.click('#x');
  await p.fill('#q', 'geppetto');
  await p.press('#q', 'Enter');
  igual(await texto(p, '#nm'), 'Geppetto', 'el buscador encuentra los murales');
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
  igual(
    await p.evaluate(() => [juego.activo, estadoApp.pestana]),
    [false, 'list'],
    'Salir lo deja y va a la pestaña'
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
  // Tocar la zona buena en el mapa (en el móvil, cuando la página acaba de subir hasta él)
  await p.waitForFunction(
    () => esEscritorio() || Math.abs(document.querySelector('.mw').getBoundingClientRect().top - 8) < 3,
    null,
    { timeout: 3000 }
  );
  const buena = await p.evaluate(() => juego.preguntas[0].zona.id);
  // Que se vea: la pista del día puede ser de una zona del borde (Blanco, al norte), fuera del mapa
  // visible o, en escritorio, por encima de lo que se ve de la página
  await p.evaluate(id => {
    const z = zonas.find(q => q.id == id);
    llevarZonaALaVista(z); // mapa-teclado.js
    z.e.scrollIntoView({ block: 'center', inline: 'center' });
  }, buena);
  await p.waitForTimeout(400);
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
    j: estadoApp.progreso.j,
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

prueba('Cultura y tradiciones: lista, búsqueda y filtros', async p => {
  await p.click('#cult');
  igual(await texto(p, '#nm'), 'Cultura y tradiciones', 'abre la lista');
  igual(await p.evaluate(() => location.hash), '#cultura', 'con su enlace');
  const total = await p.evaluate(() => CULTURA.length),
    filas = () => p.$$eval('#info .cul-lista .fila-explora', a => a.length);
  igual(await filas(), total, 'están todos');
  // Solo hay botones de las categorías con contenido
  igual(
    await p.$$eval('#info [aria-label="Categoría"] button', a => a.length),
    1 + (await p.evaluate(() => CATEGORIAS_CULTURA.filter(([k]) => CULTURA.some(c => c.cat == k)).length)),
    'categorías con contenido, más «Todas»'
  );
  await p.click('#info [aria-label="Categoría"] button:has-text("Gastronomía")');
  igual(
    await filas(),
    await p.evaluate(() => CULTURA.filter(c => c.cat == 'gastronomia').length),
    'filtro por categoría'
  );
  await p.click('#info [aria-label="Categoría"] button:first-child');
  await p.selectOption('#cterr', 'capital');
  igual(await filas(), await p.evaluate(() => CULTURA.filter(esDeCapital).length), 'solo la capital');
  const armuna = await p.evaluate(() => 'c' + PROVINCIA.com.indexOf('La Armuña'));
  await p.selectOption('#cterr', armuna);
  cierto((await texto(p, '#info .cul-lista')).includes('Lenteja de La Armuña'), 'por comarca');
  await p.selectOption('#cterr', 'todo');
  await p.fill('#cq', 'lisboa');
  igual(
    await p.$$eval('#info .cul-lista .fila-explora b', a => a.map(b => b.textContent)),
    ['El Mariquelo'],
    'busca en los textos'
  );
  await p.fill('#cq', '');
  // El buscador general también las encuentra
  await p.click('#x');
  await p.fill('#q', 'farinato');
  await p.waitForSelector('#sr button');
  cierto((await texto(p, '#sr')).includes('Cultura · Gastronomía tradicional'), 'en el buscador general');
});

prueba('Cultura y tradiciones: literatura y la jota de La Dolores', async (p, url) => {
  await p.goto(url + '#cultura/lazarillo-de-tormes');
  await p.waitForSelector('#sh.o');
  cierto((await texto(p, '#k')).includes('Literatura'), 'categoría Literatura');
  cierto((await texto(p, '#info')).includes('Personajes en bronce, parada 6'), 'y su estatua en la ruta');
  await p.evaluate(() => abrirElementoCultura('tomas-breton'));
  igual(
    await p.$eval('#sh .cul-audio audio', a => a.getAttribute('src')),
    'audio/cultura-tomas-breton.mp3',
    'Bretón con su grabación'
  );
});

prueba('Cultura y tradiciones: grabaciones para escuchar', async (p, url) => {
  await p.goto(url + '#cultura/pandero-cuadrado-penaparda');
  await p.waitForSelector('#sh.o .cul-audio audio');
  const audio = () =>
    p.$eval('#sh .cul-audio audio', a => ({
      src: a.getAttribute('src'),
      preload: a.preload,
      parado: a.paused,
      controles: a.controls
    }));
  igual(
    await audio(),
    { src: 'audio/cultura-pandero-cuadrado-penaparda.mp3', preload: 'none', parado: true, controles: true },
    'reproductor con controles, que no suena ni descarga nada solo'
  );
  cierto((await texto(p, '#info .cul-audio')).includes('García Matos en 1955'), 'dice quién, dónde y cuándo');
  cierto(
    await p.$('#ap a[href*="Ajechao_y_sorteado"]'),
    'la grabación lleva su autor, licencia y enlace en las fuentes'
  );
  // El archivo existe y se sirve como audio
  const respuesta = await p.evaluate(() =>
    fetch('audio/cultura-pandero-cuadrado-penaparda.mp3').then(r => [r.status, r.headers.get('content-type')])
  );
  igual(respuesta[0], 200, 'el archivo está');
  // Si suena y se cambia de ficha, se para
  await p.evaluate(() => {
    const a = document.querySelector('#sh .cul-audio audio');
    window.__pausado = false;
    a.pause = () => (window.__pausado = true);
    abrirFicha('centro');
  });
  cierto(await p.evaluate(() => window.__pausado), 'al cambiar de ficha la grabación se para');
  // En la lista, las que tienen grabación lo dicen
  await p.evaluate(() => abrirCultura());
  cierto((await texto(p, '#info')).includes('🎵 con grabación'), 'la lista avisa de las grabaciones');
});

prueba('Cultura y tradiciones: ficha, mapa sin puntos inventados y enlaces con el resto', async (p, url) => {
  await p.goto(url + '#cultura/lenteja-de-la-armuna');
  await p.waitForSelector('#sh.o');
  igual(await texto(p, '#nm'), 'Lenteja de La Armuña', 'abre por su enlace');
  // Varios municipios: se marcan sus términos (polígonos), sin puntos
  igual(
    await p.$$eval('#info .mapa-cultura .cul-m', a => a.length),
    await p.evaluate(() => elementoCultura('lenteja-de-la-armuna').municipios.length),
    'un término por municipio'
  );
  igual(await p.$$eval('#info .mapa-cultura circle', a => a.length), 0, 'ningún punto en el mapa');
  cierto((await texto(p, '#info')).includes('no hay un único punto'), 'y lo explica');
  // Tipos de texto y fuentes con fecha de revisión
  cierto(await p.$('#info .cul-t.hecho .cul-tipo'), 'textos documentados marcados');
  cierto((await texto(p, '#ap')).includes('Revisado el'), 'fecha de revisión');
  cierto((await p.$$('#ap a')).length >= 2, 'fuentes con enlace');
  // Una con foto: autor, licencia y enlace a Commons
  await p.goto(url + '#cultura/hornazo');
  await p.waitForFunction(() => document.querySelector('#nm').textContent == 'Hornazo');
  cierto(await p.isVisible('#ph'), 'foto');
  cierto((await texto(p, '#pc')).includes('CC0'), 'con su licencia en el pie');
  cierto(await p.$('#ap a[href^="https://commons.wikimedia.org/wiki/File:"]'), 'y enlace a su página');
  // De una pedanía: se marca el término al que pertenece y se dice
  await p.evaluate(() => abrirElementoCultura('julian-sanchez-el-charro'));
  cierto((await texto(p, '#info')).includes('Muñoz (pedanía de La Fuente de San Esteban)'), 'la pedanía');
  cierto(await p.$('#info .mapa-cultura .cul-m.ped'), 'su término, marcado como de una pedanía');
  // Enlaces con el resto: ficha de pueblo, monumento, provincia
  await p.evaluate(() => abrirPueblo(PROVINCIA.m.find(m => m.n == 'Tamames')));
  cierto((await texto(p, '#culf')).includes('Julián Sánchez'), 'en la ficha del pueblo');
  await p.evaluate(() => abrirMonumento('catedrales'));
  cierto((await texto(p, '#culf')).includes('El Mariquelo'), 'en la ficha del monumento');
  await p.evaluate(() => abrirFicha('tejares'));
  cierto(!(await p.isVisible('#culf')), 'y no en las que no tienen nada');
  await p.click('#x');
  await p.click('#vprov');
  await p.evaluate(() =>
    seleccionarPueblo(
      PROVINCIA.m.find(m => m.n == 'Béjar'),
      true
    )
  );
  await p.click('#psb .cul-psb button');
  igual(
    await texto(p, '#nm'),
    'Corpus Christi y hombres de musgo',
    'desde el pueblo elegido en la provincia'
  );
  await p.click('#x');
  await p.click('.ver-cultura');
  igual(
    await p.$$eval('#pm path.cul', a => a.length),
    await p.evaluate(() => PROVINCIA.m.filter(m => culturaDeMunicipio(m).length).length),
    'el mapa de la provincia marca los pueblos con tradiciones'
  );
  cierto((await texto(p, '#pcl')).includes('Cultura y tradiciones'), 'y las comarcas las enlazan');
});

prueba('Agenda: fechas fijas, fechas desde la Pascua y en las fichas', async (p, url) => {
  // Domingo de Resurrección de años conocidos
  igual(
    await p.evaluate(() =>
      [2024, 2025, 2026, 2027].map(a => domingoDeResurreccion(a).toISOString().slice(0, 10))
    ),
    ['2024-03-31', '2025-04-20', '2026-04-05', '2027-03-28'].map(f =>
      new Date(f + 'T00:00:00').toISOString().slice(0, 10)
    ),
    'Pascua bien calculada'
  );
  // Con un día dado: lo que está pasando cuenta, lo pasado salta al año siguiente
  const citas = await p.evaluate(() =>
    proximasCitas(new Date(2026, 9, 18)).map(x => [
      x.c.id,
      x.desde.getMonth() + 1,
      x.desde.getDate(),
      x.dentro
    ])
  );
  igual(citas[0], ['santa-teresa-alba', 10, 15, 0], 'Santa Teresa ya ha empezado y va primero');
  igual(citas[1], ['mariquelo', 10, 31, 13], 'luego el Mariquelo');
  cierto(
    citas.some(([id, m, d]) => id == 'carnaval-del-toro' && m == 2 && d == 7),
    'el Carnaval de 2027, contado desde la Pascua'
  );
  igual(
    await p.evaluate(() =>
      textoFechasCita(proximasCitas(new Date(2026, 6, 1)).find(x => x.c.id == 'diagosto-y-la-loa'))
    ),
    '15 y 16 de agosto',
    'texto de dos días seguidos'
  );
  // «Este mes» es el mes natural: el 20 de octubre, lo de noviembre ya va en «Más adelante»
  igual(
    await p.evaluate(() => {
      const hoy = new Date(2026, 9, 20),
        cita = d => ({ desde: d, dentro: diasEntre(hoy, d) });
      return [new Date(2026, 9, 31), new Date(2026, 10, 15)].map(
        d => GRUPOS_AGENDA.find(([, entra]) => entra(cita(d), hoy))[0]
      );
    }),
    ['Este mes', 'Más adelante'],
    'grupos por mes natural'
  );
  // Añadir al calendario: un .ics con eventos de día entero (el final, el día siguiente)
  const ics = await p.evaluate(() =>
    textoCalendario([proximasCitas(new Date(2026, 9, 18)).find(x => x.c.id == 'santa-teresa-alba')])
  );
  cierto(ics.startsWith('BEGIN:VCALENDAR\r\n') && ics.endsWith('END:VCALENDAR\r\n'), 'calendario completo');
  cierto(ics.includes('DTSTART;VALUE=DATE:20261015\r\n'), 'empieza el 15 de octubre');
  cierto(ics.includes('DTEND;VALUE=DATE:20261023\r\n'), 'y acaba al terminar el 22');
  cierto(
    ics.split('\r\n').every(l => new TextEncoder().encode(l).length <= 75),
    'líneas de 75 bytes como mucho'
  );
  // La lista, desde Cultura, con su enlace y su botón
  await p.click('#cult');
  await p.click('#iragn');
  igual(await texto(p, '#nm'), 'Agenda', 'abre la agenda');
  cierto(
    await p.$$eval('#info .cita-con-cal .boton-cal', a => a.length > 0),
    'cada fila con su botón del calendario'
  );
  igual(await p.evaluate(() => location.hash), '#agenda', 'con su enlace');
  igual(
    await p.$$eval('#info .fila-cita', a => a.length),
    await p.evaluate(() => CULTURA.reduce((n, c) => n + (c.fechas || []).length, 0)),
    'una fila por cada fecha'
  );
  await p.click('#info .fila-cita');
  cierto(await p.evaluate(() => location.hash.startsWith('#cultura/')), 'la fila abre la ficha cultural');
  // La ficha cultural dice la próxima vez
  await p.goto(url + '#cultura/mariquelo');
  await p.waitForSelector('#sh.o');
  cierto((await texto(p, '#info')).includes('Próxima vez: 31 de octubre'), 'próxima vez en la ficha');
  await p.goto(url + '#cultura/farinato');
  await p.waitForSelector('#sh.o');
  cierto(!(await texto(p, '#info')).includes('Próxima vez'), 'sin fechas, sin próxima vez');
});

prueba('La hora dorada: sol, fachadas, ficha y enlaces', async (p, url) => {
  // El cálculo del sol, con horas de Salamanca sea cual sea la zona horaria del navegador
  const dia = await p.evaluate(() =>
    ['2026-10-21', '2026-06-21', '2026-12-21'].map(d => {
      const h = horaDorada(d);
      return [horaSalamanca(h.salida), horaSalamanca(h.puesta), h.tarde.map(x => x.f.id)];
    })
  );
  igual(dia[0].slice(0, 2), ['08:41', '19:34'], 'sale y se pone el 21 de octubre');
  igual(dia[1][1], '21:58', 'se pone tarde en verano');
  igual(dia[2][1], '17:57', 'y pronto en invierno');
  igual(dia[0][2][0], 'sanesteban', 'en octubre, al atardecer, la que más de frente es San Esteban');
  cierto(
    dia[1][2].includes('universidad') && !dia[0][2].includes('pm-petrineros'),
    'cada fachada según hacia dónde mira'
  );
  cierto(
    await p.evaluate(() => FACHADAS.every(f => ORIENTACION_FACHADAS[f.id] && buscarMonumento(f.monumento))),
    'todas las fachadas con orientación y monumento'
  );
  // La ficha, desde Monumentos
  await p.click('#mns');
  await p.click('#irhd');
  igual(await texto(p, '#nm'), 'La hora dorada', 'abre la ficha desde Monumentos');
  igual(await p.evaluate(() => location.hash), '#hora-dorada', 'con su enlace');
  igual(await texto(p, '#info .hd-dia b'), 'Hoy', 'empieza por hoy');
  igual(
    await p.$$eval('#info .hd-rato h3', a => a.map(h => h.textContent.split(' · ')[0])),
    ['🌅 Al amanecer', '🌇 Al atardecer'],
    'al amanecer y al atardecer'
  );
  await p.click('#info .hd-dia-b[aria-label="Día siguiente"]');
  igual(await texto(p, '#info .hd-dia b'), 'Mañana', 'pasa al día siguiente');
  await p.click('#info .hd-hoy');
  igual(await texto(p, '#info .hd-dia b'), 'Hoy', 'y vuelve a hoy');
  await p.click('#info .hd-rato .fila-explora');
  cierto(await p.evaluate(() => location.hash.startsWith('#monumento/')), 'cada fachada abre su monumento');
  // En la ficha del monumento, lo de hoy
  const enFicha = await p.evaluate(() => {
    const m = buscarMonumento(FACHADAS[0].monumento);
    return filaHoraDoradaDeMonumento(m)[1].length;
  });
  const deHoy = await p.evaluate(() => {
    const h = horaDorada();
    return [...h.manana, ...h.tarde].filter(x => x.f.monumento == FACHADAS[0].monumento).length;
  });
  igual(enFicha, deHoy, 'el monumento dice a qué hora le da el sol hoy');
  // En «¿Qué puedo descubrir hoy?»
  await p.goto(url + '#hoy');
  await p.waitForSelector('#sh.o');
  cierto((await texto(p, '#info')).includes('La hora dorada'), 'sale en «¿Qué puedo descubrir hoy?»');
  cierto(/el sol (sale|se pone) a las \d\d:\d\d/.test(await texto(p, '#info')), 'con la hora del sol');
});

prueba('Salamanca desaparecida: lista, ficha, fantasmas y línea del tiempo', async (p, url) => {
  // La lista, desde Monumentos
  await p.click('#mns');
  await p.click('#irdes');
  igual(await texto(p, '#nm'), 'Salamanca desaparecida', 'abre la lista desde Monumentos');
  igual(await p.evaluate(() => location.hash), '#desaparecida', 'con su enlace');
  igual(
    await p.$$eval('#info .lista-explora .fila-explora', a => a.length),
    await p.evaluate(() => DESAPARECIDOS.length),
    'una fila por cada sitio'
  );
  cierto(await p.$eval('#desap', e => e.style.display != 'none'), 'los fantasmas se ven en el mapa');
  // La ficha de uno
  await p.click('#info .lista-explora .fila-explora');
  cierto(await p.evaluate(() => location.hash.startsWith('#desaparecida/')), 'cada fila abre su ficha');
  cierto((await texto(p, '#info')).includes('Se perdió'), 'dice cuándo se perdió');
  cierto((await texto(p, '#ap')).startsWith('Fuentes:'), 'con sus fuentes');
  cierto(await p.$eval('#desap .desap.sel', e => !!e), 'y su fantasma, marcado en el mapa');
  // Al cerrar, los fantasmas se van
  await p.click('#x');
  cierto(
    await p.$eval('#desap', e => e.style.display == 'none'),
    'al cerrar, el mapa vuelve a ser el de hoy'
  );
  // En «Salamanca en el tiempo»: en pie en su época, fantasma después, nada antes
  await p.goto(url + '#tiempo/4');
  await p.waitForSelector('#sh.o');
  const estado = async () =>
    p.$eval('#desap .desap[aria-label="Iglesia de San Adrián"]', e => e.dataset.estado);
  igual(await estado(), 'viva', 'San Adrián en pie en el Siglo de Oro');
  cierto((await texto(p, '#info')).includes('Salamanca desaparecida'), 'la etapa dice lo que se pierde');
  await p.evaluate(() => pintarEtapa(4));
  igual(await estado(), 'fantasma', 'y fantasma desde 1812');
  await p.evaluate(() => pintarEtapa(0));
  igual(await estado(), 'no', 'antes de levantarse no se ve');
  // En la ficha de su zona
  const zona = await p.evaluate(() =>
    zonaDePunto(buscarDesaparecido('san-adrian').la, buscarDesaparecido('san-adrian').lo)
  );
  if (zona) {
    await p.goto(url + '#' + zona);
    await p.waitForSelector('#sh.o');
    cierto((await texto(p, '#rel')).includes('Iglesia de San Adrián'), 'la zona dice lo que hubo en ella');
  }
});

prueba('Detalles escondidos: pista, encontrarlo, foto, logros y guardado', async (p, url) => {
  await p.click('#mns');
  await p.click('#irdet');
  igual(await texto(p, '#nm'), 'Detalles escondidos', 'abre la lista, desde Monumentos');
  igual(await p.evaluate(() => location.hash), '#detalles', 'con su enlace');
  igual(
    await p.$$eval('#info .fila-explora', a => a.length),
    await p.evaluate(() => DETALLES.length),
    'están todos'
  );
  await p.goto(url + '#detalle/astronauta');
  await p.waitForSelector('#sh.o');
  cierto((await texto(p, '#info')).includes('Pista'), 'enseña la pista');
  cierto(await p.$eval('#ph', e => e.hidden), 'sin la foto hasta encontrarlo');
  cierto(!(await texto(p, '#info')).includes('Miguel Romero'), 'ni la explicación');
  cierto(!(await texto(p, '#ap')).includes('Foto:'), 'ni el enlace a la foto en las fuentes');
  await p.click('#info button:has-text("enséñamelo")');
  cierto(!(await p.$eval('#ph', e => e.hidden)), '«Enséñamelo» enseña la foto');
  cierto((await texto(p, '#ap')).includes('Foto:'), 'y ya el enlace a la foto');
  igual(await p.evaluate(() => estadoApp.progreso.j.de), [], 'pero no lo cuenta');
  cierto(
    !(await p.$('#info button:has-text("¡Lo he encontrado!")')),
    'y ya no deja marcarlo como encontrado sin ayuda'
  );
  await p.click('#info button:has-text("Detalles escondidos")');
  await p.click('#info .fila-explora:has-text("astronauta")');
  cierto(!(await p.$('#info button:has-text("¡Lo he encontrado!")')), 'ni al volver a abrirlo');
  // La próxima vez que se abre la app, sí
  await p.reload();
  await p.waitForSelector('#sh.o');
  await p.click('#info button:has-text("¡Lo he encontrado!")');
  igual(await p.evaluate(() => estadoApp.progreso.j.de), ['astronauta'], 'encontrado');
  cierto((await texto(p, '#info')).includes('Miguel Romero'), 'con su explicación');
  cierto(
    await p.$eval('#info', e => {
      const hijos = [...e.children];
      return hijos.indexOf(e.querySelector('.cul-textos')) < hijos.indexOf(e.querySelector('.det-pista'));
    }),
    'la explicación va antes que la pista'
  );
  cierto(
    await p.evaluate(() =>
      (estadoApp.progreso.j.hi || []).some(([, tipo, id]) => tipo == 'de' && id == 'astronauta')
    ),
    'se apunta en el historial'
  );
  cierto(
    await p.evaluate(() => {
      const h = estadisticas().historial;
      return h.conFecha.length + h.sinFecha.capital == 1;
    }),
    'y cuenta en el mes a mes de Mi Salamanca'
  );
  cierto(
    await p.evaluate(() => calcularLogros().some(a => a.id == 'de1' && a.c >= a.m)),
    'logro del primer detalle'
  );
  cierto(
    await p.evaluate(() => JSON.parse(localStorage.getItem('charro2')).j.de.includes('astronauta')),
    'guardado en el navegador'
  );
  // En la ficha del monumento, con su ✓
  await p.goto(url + '#monumento/catedrales');
  await p.waitForSelector('#sh.o');
  cierto((await texto(p, '#rel')).includes('El astronauta ✓'), 'en la ficha del monumento');
  // Un id que esta versión no conoce no se pierde al guardar; uno conocido sigue
  await p.evaluate(() => {
    const o = JSON.parse(localStorage.getItem('charro2'));
    o.j.de.push('detalle-futuro');
    localStorage.setItem('charro2', JSON.stringify(o));
  });
  await p.reload();
  await p.waitForTimeout(300);
  await p.evaluate(() => guardar());
  igual(
    await p.evaluate(() => JSON.parse(localStorage.getItem('charro2')).j.de.sort()),
    ['astronauta', 'detalle-futuro'],
    'lo desconocido se conserva'
  );
  igual(await p.evaluate(() => estadoApp.progreso.j.de), ['astronauta'], 'y la app solo usa lo que conoce');
  // Quitar la marca
  await p.goto(url + '#detalle/astronauta');
  await p.waitForSelector('#sh.o');
  await p.click('#info button:has-text("Quitar la marca")');
  igual(await p.evaluate(() => estadoApp.progreso.j.de), [], 'marca quitada');
});

prueba('Monumentos y Dónde comer, en listas', async (p, url) => {
  await p.click('#mns');
  igual(await texto(p, '#nm'), 'Monumentos', 'abre la lista de monumentos');
  const monumentos = '#info .fila-explora:not(.fila-destacada)';
  igual(await p.$$eval(monumentos, a => a.length), await p.evaluate(() => MONUMENTOS.length), 'están todos');
  cierto((await texto(p, '#irdet')).includes('Detalles escondidos'), 'y arriba, los detalles escondidos');
  await p.evaluate(() => {
    estadoApp.progreso.j.mo = ['catedrales'];
    guardar();
  });
  await p.click('#info .fl button:nth-child(2)'); // Visitados
  igual(await p.$$eval(monumentos, a => a.length), 1, 'el filtro deja el visitado');
  await p.click(monumentos);
  igual(await p.evaluate(() => location.hash), '#monumento/catedrales', 'abre su ficha');
  await p.goto(url + '#comer');
  igual(await texto(p, '#nm'), 'Dónde comer', 'el enlace abre la lista de sitios');
  const total = await p.evaluate(
    () =>
      Object.values(DONDE_COMER).flat().length +
      Object.values(PUEBLOS).reduce((s, f) => s + (f.comer || []).length, 0)
  );
  igual(await p.$$eval('#info .fila-explora', a => a.length), total, 'todos los sitios con fuente');
  await p.click('#info .fl button:nth-child(3)'); // En los pueblos
  cierto(
    (await p.$$eval('#info .fila-explora', a => a.length)) < total,
    'el filtro deja solo los de los pueblos'
  );
  await p.click('#info .fila-explora');
  cierto(
    await p.$eval('#eat .plegable', d => d.open),
    'abre la ficha del pueblo con «Dónde comer» desplegado'
  );
});

prueba(
  '«¿Qué puedo descubrir hoy?»: sola la primera vez del día',
  async (p, url) => {
    await p.waitForSelector('#sh.o');
    igual(await p.evaluate(() => location.hash), '#hoy', 'sale sola y con su enlace');
    cierto((await texto(p, '#k')).startsWith('¿Qué puedo descubrir hoy?'), 'con su título');
    // Usuario nuevo: estados vacíos útiles y una recomendación con su porqué
    cierto((await texto(p, '#info')).includes('Aún no has marcado nada'), 'resumen para quien empieza');
    cierto((await texto(p, '#info')).includes('Aún no tienes nada a medias'), 'Continúa explorando, vacío');
    cierto((await texto(p, '.hoy-rec')).includes('Por qué hoy'), 'la recomendación explica por qué');
    cierto((await texto(p, '#info')).includes('Pisa tu primera zona'), 'objetivo para empezar');
    // Sin permiso de ubicación: la alternativa, y el botón para usarla solo si se pulsa
    cierto((await texto(p, '.hoy-cerca')).includes('Centro'), 'Cerca de ti sin ubicación: junto al Centro');
    igual(
      await p.$$eval('.hoy-accesos button', a => a.map(b => b.textContent.replace(/[^\p{L}]/gu, ''))),
      ['Mapa', 'Buscar', 'Rutas'],
      'accesos directos'
    );
    // Al recargar el mismo día ya no sale
    await p.goto(url);
    await p.waitForTimeout(600);
    cierto(!(await fichaAbierta(p)), 'el mismo día no vuelve a salir');
  },
  { conHoy: true }
);

prueba('«¿Qué puedo descubrir hoy?»: recomendación, ir a la ficha y volver', async (p, url) => {
  await p.evaluate(() => {
    // Se pisa un barrio que no sea el del día: si lo fuera, Hoy lo enseña como «ya lo has marcado hoy»
    marcarZona(recomendacionDelDia().lugar.id == 'centro' ? 'tejares' : 'centro', 'v');
    marcarZona('vega', 'w');
  });
  await p.goto(url + '#hoy');
  await p.waitForSelector('#sh.o');
  // La recomendación es la misma durante el día y no es algo ya pisado
  const rec = await p.evaluate(() => recomendacionDelDia().lugar);
  igual(await p.evaluate(() => recomendacionDelDia().lugar.id), rec.id, 'misma recomendación en el día');
  cierto(!rec.hecho, 'recomienda algo pendiente');
  cierto((await texto(p, '.hoy-rec b')) == rec.n, 'se ve en la tarjeta');
  cierto((await texto(p, '#info')).includes('La Vega'), 'Continúa explorando: lo de «Quiero ir»');
  cierto((await texto(p, '#info')).includes('Llevas 1 de'), 'resumen del progreso');
  // Abrir la recomendación en su ficha y volver con el botón
  await p.click('.hoy-rec .boton-hoy');
  igual(await texto(p, '#nm'), rec.n, 'abre su ficha');
  cierto(await p.isVisible('#volverhoy'), 'con el botón para volver');
  await p.click('#volverhoy');
  cierto((await texto(p, '#k')).startsWith('¿Qué puedo descubrir hoy?'), 'el botón vuelve a Hoy');
  await p.click('.lista-explora .fila-explora:not(.fila-cita)');
  igual(await texto(p, '#nm'), 'La Vega', 'Continúa explorando abre su ficha');
  // La × cierra la ficha (no se queda dando vueltas entre Hoy y la ficha)
  await p.click('#x');
  cierto(!(await fichaAbierta(p)), 'la × la cierra');
  // Abrir una ficha normal no enseña el botón de volver
  await p.evaluate(() => abrirFicha('tejares'));
  cierto(!(await p.isVisible('#volverhoy')), 'sin botón en las fichas que no vienen de Hoy');
  // Desde «Explora» (en escritorio la ficha tapa el botón: se cierra antes)
  await p.click('#x');
  cierto(!(await fichaAbierta(p)), 'la × cierra la ficha');
  await p.click('#hy');
  cierto((await texto(p, '#k')).startsWith('¿Qué puedo descubrir hoy?'), 'se abre desde «Explora»');
  // Que no salga sola cada día
  await p.click('#hoyauto');
  igual(await p.evaluate(() => localStorage.getItem('charro-hoy-auto')), '0', 'se puede quitar');
});

prueba('«¿Qué puedo descubrir hoy?»: con todo pisado, una recomendación general', async p => {
  await p.evaluate(() => {
    todosLosLugares().forEach(l => {
      if (l.tipo == 'z') estadoApp.progreso.z[l.id] = 'v';
      else if (l.tipo == 'p') estadoApp.progreso.p[l.id] = 'v';
    });
    estadoApp.progreso.j.mo = MONUMENTOS.map(m => m.id);
    guardar();
    // Pisado antes de hoy (si no, sería «lo has marcado hoy»)
    estadoApp.progreso.j.hi = estadoApp.progreso.j.hi.map(([, t, id]) => ['', t, id]);
    abrirHoy();
  });
  cierto(
    (await texto(p, '.hoy-rec')).includes('Ya has pisado todos los sitios con ficha'),
    'explica por qué la recomendación es general'
  );
});

prueba(
  '«¿Qué puedo descubrir hoy?»: cerca de ti, con permiso de ubicación',
  async p => {
    await p.evaluate(() => abrirHoy());
    await p.waitForFunction(() => document.querySelector('.hoy-cerca').textContent.includes('línea recta'));
    const filas = await p.$$eval('.hoy-cerca .fila-explora', a => a.map(b => b.textContent));
    cierto(filas.length >= 1 && filas.length <= 3, 'hasta tres sitios pendientes cerca');
    cierto(
      filas.every(t => / a \d/.test(t)),
      'con la distancia calculada'
    );
    cierto(!(await p.$('.hoy-cerca .boton-hoy')), 'sin botón de pedir permiso: ya lo hay');
  },
  { geolocation: { latitude: 40.9651, longitude: -5.6641 }, permissions: ['geolocation'] }
);
