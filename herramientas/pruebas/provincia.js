// Pruebas · Pestaña Provincia, fichas de pueblos, población y rutas en coche.
// Se pasan desde herramientas/pruebas.js (PRUEBAS_ZONA=provincia pasa solo estas).
const { prueba, igual, cierto, texto, fichaAbierta, llegaA, hastaQue } = require('./comun');

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

prueba('Evolución de la población en la ficha del municipio', async (p, url) => {
  await p.goto(url + '#pueblo/la-alberca');
  cierto(await p.$eval('#demo', e => !e.hidden), 'sale en la ficha del pueblo');
  const datos = await p.evaluate(() => {
    const s = HABITANTES.serie['37010'],
      a = HABITANTES.anios;
    return {
      n: s.filter(n => n != null).length,
      primero: s[0],
      ultimo: s[s.length - 1],
      a0: a[0],
      a1: a[a.length - 1]
    };
  });
  igual(await p.$$eval('#demo .demo-tabla tbody tr', f => f.length), datos.n, 'una fila por año con cifra');
  cierto((await p.$$('#demo svg.demo-graf')).length == 1, 'con su gráfico');
  // La variación desde el primer año, calculada de las cifras
  const dif = datos.ultimo - datos.primero,
    esperado =
      (dif < 0 ? '−' : '+') +
      (await p.evaluate(n => conMiles(n), Math.abs(dif))) +
      ' (' +
      (dif < 0 ? '−' : '+') +
      new Intl.NumberFormat('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(
        Math.abs((dif / datos.primero) * 100)
      ) +
      ' %)';
  igual(await texto(p, '#demo .dato b'), esperado, 'variación desde ' + datos.a0);
  cierto((await texto(p, '#demo .demo-fte')).includes('INE'), 'con su fuente');
  cierto((await texto(p, '#demo .demo-leyenda')).includes('oficial'), 'dice que las cifras son oficiales');
  // Sin cifras comparables no hay variación: una cifra no definitiva no se compara
  igual(
    await p.evaluate(() => {
      const puntos = [
        { anio: 2014, n: 10, oficial: true },
        { anio: 2024, n: 8, oficial: false }
      ];
      return variacionHabitantes(puntos, 2014, 2024);
    }),
    null,
    'no compara con una cifra no definitiva'
  );
  // Al tocar el gráfico sale el año y la cifra
  const caja = await (await p.$('#demo .demo-graf')).boundingBox();
  await p.evaluate(() => document.querySelector('#demo .demo-graf').scrollIntoView({ block: 'center' }));
  await p.waitForTimeout(400);
  const caja2 = await (await p.$('#demo .demo-graf')).boundingBox();
  await p.mouse.move(caja2.x + caja2.width - 14, caja2.y + caja2.height / 2);
  cierto(caja && (await p.$eval('#demo .demo-guia', g => g.style.display != 'none')), 'guía al pasar');
  igual(
    await p.$eval('#demo .demo-guia-anio', t => t.textContent),
    String(datos.a1),
    'el último año, al final'
  );
  // Pueblos de alrededor del mapa de la capital: también; barrios y otras fichas: no
  await p.goto(url + '#villamayor');
  cierto(await p.$eval('#demo', e => !e.hidden), 'en la ficha de un pueblo de alrededor');
  await p.goto(url + '#centro');
  cierto(await p.$eval('#demo', e => e.hidden), 'no en un barrio');
  await p.goto(url + '#monumento/catedrales');
  cierto(await p.$eval('#demo', e => e.hidden), 'no en un monumento');
});

prueba('La ficha del pueblo deja ver el mapa de la provincia', async p => {
  await p.click('#vprov');
  await p.evaluate(() => abrirPueblo(PROVINCIA.m.find(m => m.n == 'Ledesma')));
  await p.waitForTimeout(600);
  const [mapa, ficha] = await p.evaluate(() =>
    ['#pm', '#sh'].map(s => document.querySelector(s).getBoundingClientRect().top)
  );
  // En el móvil el mapa sube hasta arriba, por encima del panel; en el escritorio la ficha va al lado
  if (!(await p.evaluate(() => esEscritorio())))
    cierto(mapa >= 0 && mapa < ficha - 200, 'el mapa queda a la vista');
  igual(await texto(p, '#nm'), 'Ledesma', 'ficha abierta');
});

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
  igual(await p.evaluate(() => estadoApp.progreso.j.rs), { 'arribes-norte': 'w' }, 'la quiere hacer');
  await p.click('.bt button[data-s=v]');
  igual(await p.evaluate(() => estadoApp.progreso.j.rs), { 'arribes-norte': 'v' }, 'la ha hecho');
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
    await p.evaluate(() => estadoApp.progreso.j.hi.some(e => e[1] == 'rh' && e[2] == 'arribes-norte')),
    'historial'
  );
  cierto(await p.$eval('.bt button[data-s=v]', b => b.classList.contains('on')), 'botón marcado');
  igual(
    await p.evaluate(
      () =>
        juntarProgresos({ z: {}, j: { rs: { 'arribes-norte': 'w', sierra: 'w' } } }, estadoApp.progreso).j.rs
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
  igual(await p.evaluate(() => estadoApp.progreso.j.rs), {}, 'pulsar otra vez la quita');
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
  igual(
    await p.evaluate(() => estadoApp.progreso.j.r['arribes-norte']),
    ['cabeza-framontanos'],
    'parada visitada'
  );
  cierto(
    await p.evaluate(() => calcularLogros().some(a => a.id == 'ru-arribes-norte' && a.c == 1 && a.m == 9)),
    'cuenta para su logro'
  );
  await p.click('#nb .navruta button.principal');
  igual(await p.evaluate(() => location.hash), '#ruta-arribes-norte/6', 'la siguiente');
  // Todas las rutas de la provincia se abren sin errores
  for (const id of await p.evaluate(() => RUTAS_PROVINCIA.map(r => r.id))) {
    await p.evaluate(h => (location.hash = h), '#ruta-' + id + '/1');
    await hastaQue(() => fichaAbierta(p), 'abre ' + id);
  }
  // Enlace directo a una parada y búsqueda
  await p.goto(url + '#ruta-arribes-norte/2');
  await llegaA(() => texto(p, '#nm'), 'Trabanca y su mercadillo portugués', 'enlace a la parada');
  await p.fill('#q', 'cabeza de framontanos');
  cierto((await texto(p, '#sr')).includes('Arribes del norte'), 'el buscador la encuentra');
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
  'Provincia: «Estoy aquí» en el minimapa',
  async p => {
    await p.click('#vprov');
    await p.click('.pmw .pzl');
    await p.waitForFunction(() => puebloSeleccionado && puebloSeleccionado.n == 'La Alberca');
    cierto(
      (await texto(p, '#psb')).includes('Estás en el término de La Alberca'),
      'elige el pueblo donde estás'
    );
    igual(await p.$$eval('#pm .pmp circle', a => a.length), 3, 'y pinta el punto azul con su precisión');
    cierto(
      await p.evaluate(
        () =>
          !Object.keys(localStorage).some(k => /ubica|posici/i.test(k)) &&
          !/40\.48/.test(localStorage.charro2 || '')
      ),
      'la ubicación no se guarda'
    );
    // En la capital: lo dice y ofrece ir a su mapa
    // (el navegador da por buena una posición de hace menos de un minuto: las demás se pasan directamente)
    await p.evaluate(() =>
      alLocalizarEnProvincia({ coords: { latitude: 40.9651, longitude: -5.6641, accuracy: 20 } })
    );
    await p.waitForFunction(() => !document.querySelector('#pgm').hidden);
    cierto((await texto(p, '#pgm')).includes('Estás en la capital'), 'en la capital avisa');
    await p.click('#pgm button');
    await p.waitForSelector('#sh.o');
    igual(await p.evaluate(() => estadoApp.pestana), 'map', 'y lleva al mapa de la capital');
    // Fuera de la provincia (antes se cierra la ficha: en el escritorio, al subir hasta las pestañas, la tapa)
    await p.evaluate(() => cerrarFicha());
    await p.click('#vprov');
    await p.evaluate(() =>
      alLocalizarEnProvincia({ coords: { latitude: 40.4168, longitude: -3.7038, accuracy: 20 } })
    );
    await p.waitForFunction(() =>
      document.querySelector('#pgm').textContent.includes('fuera de la provincia')
    );
    igual(await p.$$eval('#pm .pmp circle', a => a.length), 0, 'sin punto fuera de la provincia');
  },
  { geolocation: { latitude: 40.4889, longitude: -6.1103 }, permissions: ['geolocation'] }
);
