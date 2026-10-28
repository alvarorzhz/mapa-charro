// Pruebas · Arranque y primera vez: primer paseo, novedades, enlaces, sin conexión, los tres niveles de la página, fuentes, «Avisar de un error» y Laboratorio.
// Se pasan desde herramientas/pruebas.js (PRUEBAS_ZONA=inicio pasa solo estas).
const { prueba, igual, cierto, texto, fichaAbierta, llegaA, hastaQue } = require('./comun');

prueba(
  'Primer paseo la primera vez: tres pasos con lo de verdad',
  async (p, url) => {
    await p.waitForSelector('#paseo');
    cierto(!(await p.$('.modal')), 'sin ventana que tape la app');
    cierto((await texto(p, '#paseo')).includes('paso 1 de 3'), 'empieza por el primer paso');
    // Paso 1: la recomendación principal abre su ficha
    await p.click('#paseo button.on');
    cierto(await fichaAbierta(p), 'abre el Centro');
    await p.waitForFunction(() => document.querySelector('#paseo').textContent.includes('paso 2 de 3'));
    cierto(
      await p.$eval('.bt button[data-s="v"]', e => e.classList.contains('paseo-foco')),
      'señala «He estado» de la ficha abierta'
    );
    // Paso 2: marcar de verdad
    await p.click('.bt button[data-s="v"]');
    await p.waitForFunction(() => document.querySelector('#paseo').textContent.includes('paso 3 de 3'));
    // Saltar y retomar desde Ayuda, donde se quedó
    await p.click('#paseo .cerrar');
    cierto(!(await p.$('#paseo')), 'se puede saltar');
    await p.reload();
    await p.waitForTimeout(400);
    cierto(!(await p.$('#paseo')), 'saltado no vuelve a salir solo');
    if (await fichaAbierta(p)) await p.click('#x'); // en el escritorio la ficha tapa la ayuda
    await p.click('#ayuda');
    await p.click('.modal button:has-text("Seguir el primer paseo (paso 3 de 3)")');
    cierto((await texto(p, '#paseo')).includes('paso 3 de 3'), 'se retoma desde Ayuda');
    // Paso 3: lo de hoy
    await p.click('#paseo button.on');
    igual(await p.evaluate(() => location.hash), '#hoy', 'abre «¿Qué puedo descubrir hoy?»');
    cierto((await texto(p, '#paseo')).includes('Primer paseo hecho'), 'y se acaba');
    await p.click('#paseo button.on');
    cierto(!(await p.$('#paseo')), '«Vale» lo cierra');
    // «Cómo se usa» sigue en Ayuda: las cuatro pantallas de antes
    await p.click('#x');
    await p.click('#ayuda');
    await p.click('.modal button:has-text("Cómo se usa")');
    igual(await texto(p, '.modal h2'), '¡Bienvenido al Mapa charro!', 'la bienvenida, desde Ayuda');
    for (let i = 0; i < 3; i++) await p.click('.modal .botones button.on');
    igual(await texto(p, '.modal .botones button.on'), '¡A pisar Salamanca!', 'cuatro pasos');
    await p.click('.modal .botones button:first-child');
    igual(await texto(p, '.modal h2'), 'Mucho por descubrir', '«Anterior» vuelve un paso');
    await p.keyboard.press('Escape');
    cierto(!(await p.$('.modal')), 'Esc la cierra');
    // Entrando por un enlace a una ficha, no sale
    await p.evaluate(() => {
      localStorage.removeItem('charro-bienvenida');
      localStorage.removeItem('charro-paseo');
    });
    await p.goto(url + '#tejares');
    await p.waitForTimeout(600);
    cierto(!(await p.$('#paseo')) && (await fichaAbierta(p)), 'con un enlace a una ficha no sale');
    // Lo del paseo no va en el progreso
    cierto(
      !(await p.evaluate(() => JSON.stringify(estadoApp.progreso).includes('paseo'))),
      'fuera del progreso'
    );
  },
  { conBienvenida: true }
);

prueba(
  'Novedades al llegar una versión nueva',
  async (p, url) => {
    const version = await p.evaluate(() => versionApp());
    // Venía de antes de existir esto: salen las de esta versión
    await p.waitForSelector('.modal .novedades h4');
    igual(await texto(p, '.modal h2'), '¡Novedades de la ' + version + '!', 'título con la versión');
    igual(await p.$$eval('.modal .novedades h4', a => a.length), 1, 'solo las de esta versión');
    await p.click('.modal button:has-text("¡Vale!")');
    cierto(!(await p.$('.modal')), 'se cierran');
    igual(await p.evaluate(() => localStorage.getItem('charro-version-vista')), version, 'quedan vistas');
    await p.goto(url);
    await p.waitForTimeout(600);
    cierto(!(await p.$('.modal')), 'y no vuelven a salir');
    // Desde una versión de hace tiempo: las de las versiones que faltan, hasta tres
    await p.evaluate(() => localStorage.setItem('charro-version-vista', '1.0.0'));
    await p.goto(url);
    await p.waitForSelector('.modal .novedades h4');
    igual(await texto(p, '.modal h2'), '¡Novedades desde la última vez!', 'varias versiones');
    igual(await p.$$eval('.modal .novedades h4', a => a.length), 3, 'tres como mucho');
    cierto((await texto(p, '.modal .novedades h4')).startsWith(version), 'la más nueva primero');
    await p.click('.modal button:has-text("Ver todas")');
    await p.waitForFunction(() => document.querySelectorAll('.modal .novedades h4').length > 3);
    igual(await texto(p, '.modal h2'), 'Novedades', '«Ver todas» las enseña todas');
    // Por un enlace a una ficha no salen (saldrán la próxima vez)
    await p.evaluate(() => localStorage.setItem('charro-version-vista', '1.0.0'));
    await p.goto(url + '#tejares');
    await p.reload();
    await p.waitForTimeout(600);
    cierto(!(await p.$('.modal')), 'no tapan un enlace');
    igual(await p.evaluate(() => localStorage.getItem('charro-version-vista')), '1.0.0', 'quedan pendientes');
  },
  { conNovedades: true }
);

prueba(
  'La primera vez, el primer paseo y no las novedades',
  async p => {
    await p.waitForSelector('#paseo');
    cierto(!(await p.$('.modal')), 'sin novedades');
    igual(
      await p.evaluate(() => localStorage.getItem('charro-version-vista')),
      await p.evaluate(() => versionApp()),
      'esta versión queda vista'
    );
  },
  { conBienvenida: true, conNovedades: true }
);

prueba('Tarjeta de cada zona al compartir', async (p, url) => {
  // La página de la zona lleva su tarjeta y abre su ficha
  await p.goto(url + 'z/tejares.html');
  await p.waitForURL(/#tejares$/);
  await llegaA(() => texto(p, '#nm'), 'Tejares', 'abre la ficha de la zona');
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
  await llegaA(
    () => p.evaluate(() => urlParaCompartir()),
    'https://alvarorzhz.github.io/mapa-charro/#monumento/catedrales',
    'otras fichas'
  );
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

prueba('Un enlace mal formado no rompe el arranque', async (p, url) => {
  await p.goto(url + '#%E0%A4%A');
  await hastaQue(() => p.isVisible('#m'), 'carga el mapa');
  await p.evaluate(() => abrirFicha('centro'));
  igual(await texto(p, '#nm'), 'Centro', 'y la app funciona');
});

prueba('Versión nueva con la app abierta: aviso para actualizar', async p => {
  const mirado = await p.evaluate(() => {
    let veces = 0;
    vigilarVersionNueva({ update: async () => veces++ }, false);
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
    return veces;
  });
  igual(mirado, 0, 'al volver enseguida no mira otra vez');
  cierto(!(await p.$('#nueva')), 'sin versión nueva, sin aviso');
  await p.evaluate(() => navigator.serviceWorker.dispatchEvent(new Event('controllerchange')));
  igual(await texto(p, '#nueva span'), '✨ Hay una versión nueva del mapa', 'avisa');
  await p.clock.install();
  await p.clock.runFor(2500);
  cierto(!!(await p.$('#nueva')), 'y no se va solo');
  await p.click('#nueva .cerrar');
  cierto(!(await p.$('#nueva')), 'se puede cerrar');
  await p.evaluate(() => {
    avisarVersionNueva();
    window.__antesDeRecargar = 1;
  });
  await Promise.all([p.waitForNavigation(), p.click('#nueva button.on')]);
  igual(await p.evaluate(() => window.__antesDeRecargar), undefined, '«Actualizar» recarga la app');
});

prueba(
  'Funciona sin conexión',
  async (p, url, ctx) => {
    await p.evaluate(() => navigator.serviceWorker.ready);
    await p.waitForFunction(() => navigator.serviceWorker.controller); // ya guardada y al mando
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

prueba('Tres niveles: lo principal, «Explora» y «Lo tuyo»', async p => {
  const arriba = s => p.$eval(s, e => e.getBoundingClientRect().top + scrollY);
  // En el móvil el mapa sale antes que «Explora» y esta antes que «Lo tuyo»
  if (!(await p.evaluate(() => esEscritorio()))) {
    cierto((await arriba('.mw')) < 400, 'el mapa se ve sin bajar');
    cierto((await arriba('.mw')) < (await arriba('#explorar')), 'Explora, bajo el mapa');
    cierto((await arriba('#explorar')) < (await arriba('#tuyo')), 'Lo tuyo, después');
  }
  for (const id of ['#perfil', '#sv']) cierto(await p.$('#tuyo ' + id), id + ' en «Lo tuyo»');
  cierto(await p.isVisible('#error'), '«Avisar de un error» a la vista arriba');
});

prueba('Avisar de un error', async p => {
  await p.evaluate(() => abrirFicha('vega'));
  await p.click('#errf');
  cierto((await texto(p, '.modal')).includes('La Vega'), 'apunta lo que se está viendo');
  const correo = await p.$eval('.modal a[href^="mailto:"]', a => decodeURIComponent(a.href));
  cierto(correo.includes('Error en el Mapa charro: La Vega'), 'asunto con el sitio');
  cierto(correo.includes('#vega'), 'y su enlace');
  cierto(
    await p.$eval('.modal a[href^="mailto:"]', a => !a.target),
    'el correo se abre sin otra pestaña (si no, muchos navegadores no lo pasan al programa de correo)'
  );
  cierto(
    await p.$eval('.modal a[href^="https://mail.google.com/"]', a => a.href.includes('to=alvarorzhz')),
    'también con Gmail'
  );
  cierto(
    await p.$eval('.modal a[href*="github.com"]', a => a.href.includes('/issues/new')),
    'también por GitHub'
  );
  await p.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await p.click('.modal button:has-text("Copiar el aviso")');
  await p.waitForTimeout(200);
  cierto(
    (await p.evaluate(() => navigator.clipboard.readText())).includes(
      'Asunto: Error en el Mapa charro: La Vega'
    ),
    'y se puede copiar el aviso entero'
  );
  await p.click('.modal .cerrar');
  cierto(await p.$('#ver button >> text=Avisar de un error'), 'también al pie');
});

prueba('Las fuentes, al pie y antes de «Avisar de un error»', async p => {
  const pie = await p.$$eval('#ver button, #ver a', a => a.map(e => e.textContent));
  cierto(
    pie.indexOf('Fuentes') >= 0 && pie.indexOf('Fuentes') == pie.indexOf('Avisar de un error') - 1,
    'justo antes: ' + pie.join(' · ')
  );
  cierto(!(await p.isVisible('#fuentes')), 'no ocupan el final de la página');
  await p.click('#ver button:has-text("Fuentes")');
  igual(await texto(p, '.modal h2'), 'Fuentes', 'en una ventana');
  cierto((await texto(p, '.modal')).includes('OpenStreetMap'), 'con la lista');
  igual(await p.$$eval('[id="dt"]', a => a.length), 1, 'sin repetir ids');
});

prueba('Laboratorio: medición en el navegador, sin datos personales', async p => {
  await p.evaluate(() => {
    abrirFicha('tejares');
    marcarZona('tejares', 'v');
  });
  // Los tiempos de carga se apuntan un poco después de cargar
  await p.waitForFunction(() => leerMedicion().c.length > 0, null, { timeout: 5000 });
  const m = await p.evaluate(() => leerMedicion());
  cierto(m.u.zona >= 1 && m.u.marca >= 1, 'cuenta lo que se hace');
  cierto(m.s[0].t.zona >= 0, 'y cuándo, la primera vez de la visita');
  cierto(m.c[0].mapa > 0, 'el tiempo hasta tener el mapa');
  cierto(!JSON.stringify(m).includes('tejares'), 'nunca qué sitio');
  cierto(!JSON.stringify(await p.evaluate(() => estadoApp.progreso)).includes('"u"'), 'fuera del progreso');
  // Una prueba de tarea: se cronometra y se cuentan los toques
  await p.click('#x');
  await p.click('#ayuda');
  await p.click('.modal button:has-text("Laboratorio")');
  cierto((await texto(p, '.modal')).includes('Mapa listo'), 'el panel enseña los tiempos');
  const resumen = await p.evaluate(() => resumenMedicion());
  cierto(
    resumen.includes('Abrir una zona') && !resumen.includes('tejares'),
    'el resumen para enviar, sin sitios'
  );
  await p.click('.prueba-lab:has-text("Mira cuántos logros llevas") button');
  cierto(await p.isVisible('#prueba'), 'la prueba en marcha, a la vista');
  await p.click('#perfil');
  await p.click('#info [aria-label="Apartado"] button:nth-child(3)');
  cierto(!(await p.$('#prueba')), 'acaba sola al hacer la tarea');
  const prueba = await p.evaluate(() => leerMedicion().p.pop());
  cierto(prueba.ok && prueba.id == 'logros' && prueba.toques >= 2 && prueba.ms > 0, 'con su tiempo y toques');
  // Se puede borrar
  await p.click('#x');
  await p.click('#ayuda');
  await p.click('.modal button:has-text("Laboratorio")');
  await p.click('.modal button:has-text("Borrar mediciones")');
  igual(await p.evaluate(() => leerMedicion().p.length), 0, 'se borra');
});

prueba(
  'Laboratorio: compartir los datos de uso es voluntario y anónimo',
  async p => {
    await p.evaluate(() => {
      abrirFicha('tejares');
      marcarZona('tejares', 'v');
    });
    await p.waitForTimeout(300); // lo que no tiene que pasar: no hay nada a lo que esperar
    igual(await p.evaluate(() => window.subidas.length), 0, 'apagado de entrada: no se sube nada');
    await p.click('#x');
    await p.click('#ayuda');
    await p.click('.modal button:has-text("Laboratorio")');
    await p.click('.modal button:has-text("Compartir mis datos de uso")');
    await p.waitForFunction(() => window.subidas.length > 0);
    const [coleccion, id, datos] = await p.evaluate(() => window.subidas[0]);
    igual(coleccion, 'uso', 'a su colección');
    cierto(/^[0-9a-f]{32}$/.test(id), 'con un id al azar');
    igual(
      Object.keys(datos).sort(),
      ['cargas', 'f', 'mapa', 'movil', 'primeras', 'pruebas', 'usos', 'v'],
      'solo cifras'
    );
    cierto(datos.usos.marca >= 1, 'con lo que se usa');
    const todo = JSON.stringify(datos);
    cierto(!todo.includes('tejares') && !todo.includes(id), 'sin sitios ni el id dentro');
    // Una vez por semana: al recargar no se vuelve a subir
    await p.reload();
    await p.waitForTimeout(300);
    await p.evaluate(() => subirUso());
    igual(await p.evaluate(() => window.subidas.length), 0, 'no se repite en la semana');
    // Al apagarlo se borra lo subido
    await p.click('#ayuda');
    await p.click('.modal button:has-text("Laboratorio")');
    await p.click('.modal button:has-text("Compartir mis datos de uso")');
    await p.waitForFunction(() => window.borrados.length > 0);
    igual(await p.evaluate(() => window.borrados[0]), id, 'se borra al apagarlo');
  },
  {
    antes: () => {
      window.subidas = [];
      window.borrados = [];
      window.firebase = {
        prueba: true,
        apps: [1],
        auth: Object.assign(() => ({ onAuthStateChanged: () => () => {} }), {
          GoogleAuthProvider: function () {}
        }),
        firestore: () => ({
          collection: c => ({
            doc: id => ({
              set: async d => window.subidas.push([c, id, d]),
              delete: async () => window.borrados.push(id),
              onSnapshot: () => () => {}
            })
          })
        })
      };
    }
  }
);
