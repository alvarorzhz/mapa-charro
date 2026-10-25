// Pruebas · «Tu Salamanca»: perfil, Mi Salamanca, la imagen para compartir y los logros.
// Se pasan desde herramientas/pruebas.js (PRUEBAS_ZONA=tu-salamanca pasa solo estas).
const { prueba, igual, cierto, texto, fichaAbierta } = require('./comun');

// Progreso de prueba para «Mi Salamanca»: ids sacados de los datos para no depender de ninguno en concreto
const progresoDePrueba = () => {
  const alfoz = zonas.find(z => z.g == 5),
    deAlfoz = PROVINCIA.m.find(m => m.z == alfoz.id),
    sueltos = pueblos.filter(m => !m.z),
    muni = sueltos[0],
    muni2 = sueltos.find(m => m.c != muni.c),
    ped = pedanias.find(p => p.m != muni),
    pie = RUTAS.find(r => r.paradas.some(x => typeof x != 'string')),
    propia = pie.paradas.find(x => typeof x != 'string'),
    coche = RUTAS_PROVINCIA[0];
  return {
    ids: {
      alfoz: alfoz.id,
      deAlfoz: deAlfoz.k,
      muni: muni.k,
      muni2: muni2.k,
      ped: ped.k,
      pie: pie.id,
      coche: coche.id
    },
    comarcas: new Set([muni.c, deAlfoz.c]).size,
    progreso: {
      z: { centro: 'v', univ: 'v', vega: 'w', [alfoz.id]: 'v', resto: 'v' },
      p: { [muni.k]: 'v', [muni2.k]: 'w', [ped.k]: 'v' },
      gv: [],
      f: 0,
      t: 5,
      j: {
        mo: ['catedrales', 'catedrales', 'no-existe'],
        r: { [pie.id]: [propia.id] },
        rs: { [pie.id]: 'v', [coche.id]: 'w' },
        hi: [
          ['2026-08-03', 'z', 'centro'],
          ['2026-09-10', 'z', 'univ'],
          ['', 'z', alfoz.id],
          ['2026-09-11', 'p', muni.k],
          ['2026-09-11', 'p', muni.k],
          ['2026-09-12', 'mo', 'catedrales'],
          ['2026-09-12', 'lo', 'p']
        ]
      }
    }
  };
};

prueba(
  'Tu Salamanca: perfil, estadísticas e historial',
  async (p, url) => {
    // Lo que ya estaba marcado se apunta sin fecha; lo nuevo, con la de hoy
    igual(
      await p.evaluate(() => estadoApp.progreso.j.hi),
      [
        ['', 'z', 'centro'],
        ['', 'lo', 'p']
      ],
      'lo de antes (la zona y su logro), sin fecha'
    );
    await p.evaluate(() => marcarZona('vidal', 'v'));
    igual(
      await p.evaluate(() => estadoApp.progreso.j.hi.find(e => e[2] == 'vidal')[0]),
      await p.evaluate(() => fechaHoy()),
      'lo nuevo, con fecha'
    );
    cierto((await texto(p, '#perfil')).includes('2 zonas pisadas'), 'el botón de «Lo tuyo» lleva el resumen');
    await p.click('#perfil');
    igual(await p.evaluate(() => location.hash), '#tu-salamanca', 'abre «Tu Salamanca»');
    igual(await texto(p, '#nm'), 'Lo que llevas', 'sin nombre, el título no repite «Tu Salamanca»');
    cierto(
      await p.$eval('.bt', e => e.classList.contains('solo-compartir')),
      'compartir lleva texto cuando va solo'
    );
    cierto((await texto(p, '#info')).includes('2 de 63 zonas pisadas'), 'zonas pisadas');
    igual(
      await p.$$eval('#info [aria-label="Apartado"] button', a => a.map(b => b.textContent)),
      ['Resumen', 'Diario', 'Logros'],
      'tres pestañas'
    );
    cierto(!(await p.$('#info .historial')), 'el historial no está en el resumen');
    await p.click('#info [aria-label="Apartado"] button:nth-child(2)');
    igual(await p.evaluate(() => location.hash), '#tu-salamanca/actividad', 'la pestaña, con su enlace');
    cierto((await texto(p, '.historial')).includes('Pisaste Vidal'), 'historial');
    cierto(await p.isVisible('.actividad'), 'actividad de las últimas semanas');
    cierto((await texto(p, '#info')).includes('Te faltan 8 zonas para ser «Paseante»'), 'el siguiente nivel');
    cierto((await texto(p, '#ap')).includes('Sin cuenta'), 'sin cuenta');
    await p.click('#info [aria-label="Apartado"] button:nth-child(3)');
    igual(await p.evaluate(() => location.hash), '#tu-salamanca/logros', 'los logros, con su enlace');
    igual(
      await p.$$eval('#info .lista-logros .ac', a => a.length),
      await p.evaluate(() => calcularLogros().length),
      'todos los logros en su pestaña'
    );
    cierto((await texto(p, '#info')).includes('Partidas'), 'y el juego');
    // Con la cuenta de Claude (o de Google) saluda por el nombre, que no se guarda en el progreso
    await p.evaluate(() => {
      nombreClaude = 'Álvaro Rodríguez';
      abrirTuSalamanca();
    });
    igual(await texto(p, '#nm'), 'Hola, Álvaro', 'saluda por el nombre');
    cierto((await texto(p, '.perfil-nombre')) == 'Álvaro Rodríguez', 'y lo pone entero');
    cierto(!JSON.stringify(await p.evaluate(() => estadoApp.progreso)).includes('Álvaro'), 'sin guardarlo');
    await p.evaluate(() => (nombreClaude = ''));
    // Quitar la marca la quita del historial
    await p.evaluate(() => marcarZona('vidal', 'v'));
    cierto(
      !(await p.evaluate(() => estadoApp.progreso.j.hi.some(e => e[2] == 'vidal'))),
      'sin la marca quitada'
    );
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
    // Enlaces directos, también los de antes (#perfil y #mi-salamanca abren el resumen)
    for (const [enlace, boton] of [
      ['#perfil', 'Resumen'],
      ['#mi-salamanca', 'Resumen'],
      ['#tu-salamanca/actividad', 'Diario']
    ]) {
      await p.goto(url + enlace);
      await p.waitForTimeout(300);
      cierto((await texto(p, '#k')) == 'Tu Salamanca', 'enlace ' + enlace);
      igual(
        await texto(p, '#info [aria-label="Apartado"] [aria-pressed="true"]'),
        boton,
        enlace + ' en su pestaña'
      );
    }
    // Los logros del marcador llevan a su pestaña
    await p.click('#x');
    await p.click('#lgr');
    igual(await p.evaluate(() => location.hash), '#tu-salamanca/logros', 'los logros del marcador');
    // El siguiente logro (a la vista solo si está al alcance) lleva a su categoría, abierta
    await p.click('#x');
    await p.evaluate(() => $('#sig').click());
    igual(
      await p.evaluate(() => location.hash),
      '#tu-salamanca/logros',
      'el siguiente logro abre los logros'
    );
    cierto(await p.$('#info .cat-logros[open]'), 'con su categoría abierta');
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

prueba('Imagen «Mi Salamanca»', async p => {
  await p.evaluate(() => {
    estadoApp.progreso.z.centro = estadoApp.progreso.z.tejares = 'v';
    estadoApp.progreso.z.vidal = 'w';
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
  await p.click('#perfil'); // abre «Tu Salamanca»; la imagen, con su botón
  await p.click('text=Crear mi imagen para compartir');
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

prueba(
  'Los logros conseguidos no se pierden',
  async p => {
    const logro = id => p.evaluate(i => conseguido(calcularLogros().find(a => a.id == i)), id);
    cierto(await logro('jr3'), 'la racha de tres días sigue aunque hoy no se haya jugado');
    igual(await p.evaluate(() => estadoApp.progreso.j.rm), 3, 'y se apunta la mejor racha');
    // Si la app trae más monumentos, «Guía de la ciudad» sigue conseguida; si se quita una visita, no
    const todos = await p.evaluate(() => MONUMENTOS.filter(esMonumento).map(m => m.id));
    await p.evaluate(ids => {
      estadoApp.progreso.j.mo = ids;
      guardar();
    }, todos);
    cierto(await logro('mot'), 'conseguida con todos');
    igual(await p.evaluate(() => estadoApp.progreso.j.lg.mot), todos.length, 'apunta con cuántos');
    await p.evaluate(() => (estadoApp.progreso.j.lg.mot = estadoApp.progreso.j.lg.mot - 1)); // como si antes hubiera uno menos
    await p.evaluate(ids => {
      estadoApp.progreso.j.mo = ids.slice(1);
      guardar();
    }, todos);
    cierto(await logro('mot'), 'con un monumento nuevo sin visitar, se mantiene');
    await p.evaluate(ids => {
      estadoApp.progreso.j.mo = ids.slice(2);
      guardar();
    }, todos);
    cierto(!(await logro('mot')), 'quitando una visita, se pierde');
    cierto(
      !(await p.evaluate(() => estadoApp.progreso.j.hi.some(e => e[1] == 'lo' && e[2] == 'mot'))),
      'y sale del historial'
    );
    // Las estaciones, cines y demás no cuentan como monumentos
    const sitios = await p.evaluate(() => MONUMENTOS.filter(m => !esMonumento(m)).length);
    cierto(sitios > 0, 'hay sitios de la ciudad');
    igual(
      await p.evaluate(() => calcularLogros().find(a => a.id == 'mot').m),
      todos.length,
      '«Guía de la ciudad» cuenta solo los monumentos'
    );
  },
  {
    antes: () => {
      const dia = n => {
        const d = new Date();
        d.setDate(d.getDate() - n);
        return d.toLocaleDateString('sv');
      };
      localStorage.setItem(
        'charro2',
        JSON.stringify({ z: {}, t: 5, v: 1, j: { h: [dia(9), dia(8), dia(7), dia(2)] } })
      );
    }
  }
);

prueba('Palabras charras: tarjeta, ficha y logros', async p => {
  // La tarjeta bajo el mapa enseña una palabra con su fuente; «Otra palabra» cambia y cuenta las dos
  cierto(await p.isVisible('#palabra'), 'tarjeta a la vista');
  const antes = await texto(p, '#palabra .pal-def');
  cierto((await p.$$('#palabra a[href^="https://"]')).length == 1, 'con su fuente');
  await p.click('#palabra .pal-otra');
  cierto((await texto(p, '#palabra .pal-def')) != antes, 'otra palabra');
  igual(await p.evaluate(() => estadoApp.progreso.j.pv.length), 2, 'dos palabras vistas');
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
    await p.evaluate(() => listaDeLogros().querySelectorAll('.ac').length),
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
  // Solo se enseña si está al alcance; los conseguidos van al lado de lo explorado
  igual(
    await p.evaluate(() => [
      logroAlAlcance({ c: 0, m: 1 }),
      logroAlAlcance({ c: 4, m: 6 }),
      logroAlAlcance({ c: 2, m: 20 })
    ]),
    [true, true, false],
    'el siguiente logro, solo al alcance'
  );
  cierto(/^🏅0\/\d+ logros$/.test(await texto(p, '#lgr')), 'logros conseguidos en el marcador');
  // Marcar una zona dice cuánto falta para el logro de su grupo
  await p.fill('#q', 'vidal');
  await p.press('#q', 'Enter');
  await p.click('.bt button[data-s=v]');
  cierto((await texto(p, '#ts span')).includes('en «Oeste completo»'), 'el aviso dice lo que falta');
  // Una parada propia de una ruta cuenta para el logro de esa ruta
  await p.evaluate(() => (location.hash = '#ruta-murales/1'));
  await p.waitForTimeout(200);
  await p.click('.bt button[data-s=v]');
  igual(await p.evaluate(() => estadoApp.progreso.j.r), { murales: ['diaspora'] }, 'parada visitada');
  // Abrir una ficha cuenta para el logro de lectura
  await p.evaluate(() => abrirFicha('tejares'));
  cierto(await p.evaluate(() => estadoApp.progreso.j.fl.includes('tejares')), 'ficha leída apuntada');
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
    estadoApp.progreso.j.h = [dia(0), dia(1), dia(2), dia(4)];
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

prueba('Mi Salamanca: progreso vacío', async p => {
  await p.click('#perfil');
  igual(await texto(p, '#k'), 'Tu Salamanca', 'abre el panel');
  igual(await p.evaluate(() => location.hash), '#tu-salamanca', 'con su enlace');
  cierto((await texto(p, '#info')).includes('Aún no has marcado nada'), 'estado vacío útil');
  cierto(await p.isVisible('#info .ms-vacio button'), 'con atajos para empezar');
  cierto(!(await p.$('#info [aria-label="Periodo"]')), 'sin fechas no hay filtro de periodo');
  cierto(!(await texto(p, '#info')).includes('Mes a mes'), 'ni gráfico');
  const e = await p.evaluate(() => estadisticas());
  igual([e.capital.barrios.v, e.provincia.municipios.v, e.capital.monumentos.v], [0, 0, 0], 'todo a cero');
});

prueba('Mi Salamanca: porcentajes, categorías, por dónde seguir y objetivos', async (p, url) => {
  const prueba = await p.evaluate(`(${progresoDePrueba.toString()})()`);
  await p.evaluate(pr => localStorage.setItem('charro2', JSON.stringify(pr)), prueba.progreso);
  await p.goto(url + '#mi-salamanca');
  await p.reload();
  await p.waitForSelector('#sh.o .ms-resumen');
  const antes = await p.evaluate(() => localStorage.charro2);
  // Porcentajes con su total dicho
  const resumen = await texto(p, '.ms-resumen');
  const barrios = await p.evaluate(() => zonas.filter(z => z.g < 5).length);
  cierto(
    resumen.includes(
      Math.round((2 / barrios) * 100) + ' % de los barrios de la capital (2 de ' + barrios + ' barrios)'
    ),
    'barrios en porcentaje, con su total'
  );
  cierto(resumen.includes('municipios, sin la capital'), 'municipios con su denominador explicado');
  cierto(resumen.includes('de las pedanías (1 de '), 'pedanías');
  // Categorías: cada una con su total, sin mezclar; lo más explorado y lo que falta
  const cats = await p.evaluate(() => estadisticas().categorias);
  const casco = cats.find(c => c.tipo == 'barrios' && c.v == 2);
  cierto(casco && casco.total >= 2, 'la parte de la ciudad con los dos barrios pisados');
  cierto(
    cats.filter(c => c.tipo == 'municipios').reduce((s, c) => s + c.total, 0) ==
      (await p.evaluate(() => pueblos.length)),
    'las comarcas suman todos los municipios, cada uno una vez'
  );
  cierto(
    (await texto(p, '.ms-apartado')).length > 0 && (await texto(p, '#info')).includes('Sin empezar:'),
    'lo que está sin empezar'
  );
  // Por dónde seguir no se repite aquí: lo tiene «¿Qué puedo descubrir hoy?»
  cierto(!(await texto(p, '#info')).includes('Para seguir explorando'), 'sin repetir lo de hoy');
  // Logros (su pestaña): el último conseguido, con fecha, y los próximos objetivos
  await p.click('#info [aria-label="Apartado"] button:nth-child(3)');
  cierto((await texto(p, '.ms-recientes')).includes('Primer vítor'), 'último logro con su fecha');
  cierto((await texto(p, '#info')).includes('Tus próximos objetivos'), 'próximos objetivos');
  // Mirar y filtrar las cifras no cambia nada de lo guardado
  await p.evaluate(() => {
    ambitoEstadisticas = 'provincia';
    pintarEstadisticas(true);
    ambitoEstadisticas = 'todo';
    pintarEstadisticas(true);
  });
  igual(await p.evaluate(() => localStorage.charro2), antes, 'mirar las cifras no cambia el progreso');
  // «Por dónde seguir» lleva a «¿Qué puedo descubrir hoy?», con lo pendiente
  await p.click('#info [aria-label="Apartado"] button:nth-child(1)');
  await p.click('#info button:has-text("Por dónde seguir")');
  igual(await p.evaluate(() => location.hash), '#hoy', 'abre lo de hoy');
  cierto((await texto(p, '#info')).includes('Vega'), 'con el barrio en «Quiero ir»');
});

prueba('Mi Salamanca: cálculos con datos controlados y capital y provincia por separado', async (p, url) => {
  // La función se evalúa en la página (usa los datos de la app)
  const prueba = await p.evaluate(`(${progresoDePrueba.toString()})()`);
  await p.evaluate(pr => localStorage.setItem('charro2', JSON.stringify(pr)), prueba.progreso);
  await p.goto(url + '#mi-salamanca');
  await p.reload();
  await p.waitForSelector('#sh.o');
  const e = await p.evaluate(() => estadisticas()),
    totales = await p.evaluate(() => ({
      barrios: zonas.filter(z => z.g < 5).length,
      municipios: PROVINCIA.m.filter(m => !m.cap).length,
      pedanias: pedanias.length,
      propiasPie: RUTAS.flatMap(r => r.paradas.filter(x => typeof x != 'string')).length
    }));
  // Capital: solo barrios de la ciudad (ni los pueblos de alrededor ni «resto»)
  igual(
    [e.capital.barrios.v, e.capital.barrios.total],
    [2, totales.barrios],
    'barrios pisados de los de la ciudad'
  );
  igual(e.capital.quiero, 1, 'un barrio en «Quiero ir»');
  igual(e.capital.monumentos.v, 1, 'un monumento, sin repetir ni contar ids que no existen');
  igual(
    [e.capital.sitios.v, e.capital.sitios.total],
    [1, totales.propiasPie],
    'sitios propios de las rutas a pie'
  );
  igual(e.capital.rutas.v, 1, 'una ruta a pie hecha');
  // Provincia: el pueblo de alrededor cuenta como municipio (por su zona), no como barrio
  igual(
    [e.provincia.municipios.v, e.provincia.municipios.total],
    [2, totales.municipios],
    'municipios sin la capital'
  );
  igual(e.provincia.quiero, 1, 'un municipio en «Quiero ir»');
  igual(
    [e.provincia.pedanias.v, e.provincia.pedanias.total],
    [1, totales.pedanias],
    'pedanías aparte de los municipios'
  );
  igual(e.provincia.comarcas.v, prueba.comarcas, 'comarcas con algún pueblo pisado');
  igual(e.provincia.rutas.w, 1, 'una ruta en coche en «La quiero hacer»');
  // Historial: cada cosa una vez; lo que no tiene fecha no va a ningún mes; los logros no son visitas
  igual(e.historial.conFecha.length, 4, 'cuatro visitas con fecha (sin el duplicado ni el logro)');
  igual(e.historial.sinFecha, { capital: 0, provincia: 1 }, 'el pueblo de alrededor sin fecha, aparte');
  igual(
    await p.evaluate(() => visitasPorMes(estadisticas().historial.conFecha, 'todo', new Date(2026, 9, 15))),
    {
      '2026-08': { capital: 1, provincia: 0 },
      '2026-09': { capital: 2, provincia: 1 },
      '2026-10': { capital: 0, provincia: 0 }
    },
    'visitas por mes, con los meses sin nada'
  );
  igual(
    Object.keys(
      await p.evaluate(() => visitasPorMes(estadisticas().historial.conFecha, 'año', new Date(2027, 1, 1)))
    ),
    ['2027-01', '2027-02'],
    '«Este año» empieza en enero'
  );
  // Lo que se ve
  const info = await texto(p, '#info');
  cierto(info.includes('Salamanca capital') && info.includes('Provincia de Salamanca'), 'dos apartados');
  // El mes a mes, en «Actividad»
  await p.click('#info [aria-label="Apartado"] button:nth-child(2)');
  const actividad = await texto(p, '#info');
  cierto(actividad.includes('Mes a mes') && (await p.$('.ms-grafico')), 'gráfico con dos meses con datos');
  cierto(
    actividad.includes('1 sitio marcado antes de que la app apuntara las fechas'),
    'avisa de lo que no tiene fecha'
  );
  await p.click('#info [aria-label="Apartado"] button:nth-child(1)');
  igual(
    await p.$eval('.ms-barra', b => b.getAttribute('aria-valuetext')),
    `2 de ${totales.barrios} (${Math.round((2 / totales.barrios) * 100)} %)`,
    'barra con texto accesible'
  );
  // Filtro por ámbito
  await p.click('#info [aria-label="Mostrar"] button:nth-child(3)');
  cierto(!(await texto(p, '#info')).includes('Salamanca capital'), 'solo la provincia');
  await p.click('#info [aria-label="Mostrar"] button:nth-child(2)');
  cierto(!(await texto(p, '#info')).includes('Provincia de Salamanca'), 'solo la capital');
  // El periodo solo en el diario (el resumen es lo que llevas hasta hoy)
  cierto(!(await p.$('#info [aria-label="Periodo"]')), 'el resumen, sin periodo');
  await p.click('#info [aria-label="Apartado"] button:nth-child(2)');
  cierto(await p.$('#info [aria-label="Periodo"]'), 'con fechas, filtro de periodo en el diario');
  // Recargar: las cifras salen otra vez del progreso guardado
  await p.reload();
  await p.waitForSelector('#sh.o');
  igual(await p.evaluate(() => estadisticas().capital.barrios.v), 2, 'igual tras recargar');
});

prueba('Mi Salamanca: cambios de estado, sincronización y acceso al mapa filtrado', async p => {
  await p.evaluate(() => marcarZona('centro', 'v'));
  await p.click('#perfil');
  const barrios = () => p.$eval('.ms-tarjeta .ms-cifra b', b => b.textContent);
  igual(await barrios(), '1', 'un barrio');
  // Un cambio con el panel abierto (como los que llegan de la cuenta) lo repinta
  await p.evaluate(() => marcarZona('vega', 'v'));
  igual(await barrios(), '2', 'se actualiza al marcar');
  igual(await p.evaluate(() => estadisticas().historial.conFecha.length), 2, 'con fecha de hoy');
  await p.evaluate(() =>
    aplicarDesdeNube({ ...estadoApp.progreso, z: { ...estadoApp.progreso.z, tejares: 'v' } })
  );
  igual(await barrios(), '3', 'y al llegar cambios de la cuenta');
  // Una entrada repetida en el historial (p. ej. al juntar dos copias) no cuenta dos veces
  const antes = await p.evaluate(() => estadisticas().historial.conFecha.length);
  await p.evaluate(() =>
    estadoApp.progreso.j.hi.push([...estadoApp.progreso.j.hi[estadoApp.progreso.j.hi.length - 1]])
  );
  igual(
    await p.evaluate(() => estadisticas().historial.conFecha.length),
    antes,
    'una visita no cuenta dos veces'
  );
  // Desde la cifra, al mapa ya filtrado
  await p.click('.ms-tarjeta .ms-ir');
  cierto(!(await fichaAbierta(p)), 'se cierra el panel');
  igual(await p.evaluate(() => [...filtrosMapa.estados]), ['v'], 'mapa con solo lo pisado');
  igual(
    await p.$$eval('#zg .z:not(.fuera)', a => a.length),
    await p.evaluate(() => zonas.filter(z => z.g < 5 && estadoApp.progreso.z[z.id] == 'v').length),
    'se ven solo los barrios pisados'
  );
  await p.evaluate(() => quitarFiltrosMapa());
  // Y a la provincia, con su filtro
  await p.evaluate(() => verProvinciaFiltrada('v'));
  igual(
    await p.evaluate(() => [estadoApp.pestana, estadoApp.filtroProvincia]),
    ['prov', 'v'],
    'la provincia, con lo pisado'
  );
});

prueba('Tu Salamanca: logros con medallas y objetivos', async p => {
  await p.evaluate(() => ['centro', 'univ'].forEach(z => marcarZona(z, 'v')));
  await p.evaluate(() => abrirTuSalamanca('logros'));
  cierto((await texto(p, '.explica-ts')).includes('medallas'), 'dice qué es la pestaña');
  cierto((await texto(p, '.medallero')).includes('Primer vítor'), 'la medalla conseguida, a la vista');
  igual(
    await p.$$eval('#info .lista-logros .ac .medalla', a => a.length),
    await p.evaluate(() => calcularLogros().length),
    'cada logro con su medalla'
  );
  await p.click('#info .objetivo');
  cierto(await p.$('#info .cat-logros[open]'), 'un objetivo abre su categoría');
  await p.click('#info [aria-label="Apartado"] button:nth-child(2)');
  cierto((await texto(p, '.explica-ts')).includes('cuándo'), 'el diario dice que va de cuándo');
});
