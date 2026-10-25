// Pruebas · Guardado en el navegador, sincronización, «Deshacer» y copia de seguridad.
// Se pasan desde herramientas/pruebas.js (PRUEBAS_ZONA=guardado pasa solo estas).
const { prueba, igual, cierto, texto } = require('./comun');

const leerGuardado = p => p.evaluate(() => JSON.parse(localStorage.getItem('charro2')));

prueba(
  'Deshacer devuelve la marca con su fecha de antes',
  async p => {
    await p.fill('#q', 'tejares');
    await p.press('#q', 'Enter');
    await p.click('.bt button[data-s=v]');
    await p.click('#ts button');
    const fecha = await p.evaluate(() => estadoApp.progreso.j.hi.find(e => e[1] == 'z' && e[2] == 'tejares'));
    igual(fecha, ['2025-03-01', 'z', 'tejares'], 'conserva la fecha en que se pisó');
  },
  {
    antes: () =>
      localStorage.setItem(
        'charro2',
        JSON.stringify({ z: { tejares: 'v' }, t: 5, v: 1, j: { hi: [['2025-03-01', 'z', 'tejares']] } })
      )
  }
);

prueba('Quitar una marca se puede deshacer', async p => {
  await p.fill('#q', 'tejares');
  await p.press('#q', 'Enter');
  await p.click('.bt button[data-s=v]');
  cierto(await p.$eval('#ts', e => e.classList.contains('exito')), 'marcar es un aviso de éxito');
  await p.waitForTimeout(2600); // que pase también el aviso del logro
  await p.click('.bt button[data-s=v]');
  igual(await texto(p, '#ts span'), 'Tejares: quitada de «He estado»', 'avisa al quitarla');
  igual(await p.evaluate(() => estadoApp.progreso.z.tejares), undefined, 'quitada');
  await p.click('#ts button');
  igual(await p.evaluate(() => estadoApp.progreso.z.tejares), 'v', 'y Deshacer la recupera');
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

prueba('Copia de seguridad: descargar y cargar', async p => {
  await p.evaluate(() => marcarZona('vega', 'v'));
  const copia = await p.evaluate(() => textoCopia());
  cierto(JSON.parse(copia).app == 'mapa-charro', 'la copia dice de qué app es');
  // En otro navegador (aquí: progreso vacío) se carga y se junta
  await p.evaluate(() => {
    estadoApp.progreso.z = { tejares: 'w' };
  });
  cierto(await p.evaluate(c => cargarCopia(c), copia), 'se carga');
  igual(
    await p.evaluate(() => [estadoApp.progreso.z.vega, estadoApp.progreso.z.tejares]),
    ['v', 'w'],
    'junta la copia con lo que había'
  );
  igual(await p.evaluate(() => JSON.parse(localStorage.charro2).z.vega), 'v', 'y lo guarda');
  cierto(!(await p.evaluate(() => cargarCopia('{"no":1}'))), 'un archivo que no es copia no se carga');
  // De momento el botón está oculto (index.html): se abre la ventana directamente
  cierto(!(await p.isVisible('#copia')), 'el botón de la copia está oculto de momento');
  await p.evaluate(() => abrirCopia());
  cierto(await p.isVisible('.modal >> text=Descargar copia'), 'ventana con descargar');
  const [descarga] = await Promise.all([
    p.waitForEvent('download'),
    p.click('.modal >> text=Descargar copia')
  ]);
  cierto(/^mapa-charro-copia-\d{4}-\d\d-\d\d\.json$/.test(descarga.suggestedFilename()), 'archivo con fecha');
});

prueba('Guardado: primera ejecución y recarga', async p => {
  igual(await p.evaluate(() => Object.keys(estadoApp.progreso.z).length), 0, 'sin nada marcado');
  await p.evaluate(() => marcarZona('vega', 'v'));
  const g = await leerGuardado(p);
  igual(g.z, { vega: 'v' }, 'se guarda al momento en el navegador');
  cierto(g.t > 0 && typeof g.j == 'object', 'con su hora y sus datos de logros');
  await p.reload();
  igual(await p.evaluate(() => estadoApp.progreso.z), { vega: 'v' }, 'y sigue ahí al recargar');
});

prueba(
  'Guardado: datos existentes, antiguos o de una versión más nueva',
  async p => {
    // Lo válido se usa; lo que no es válido se descarta; lo que esta versión no conoce se conserva
    igual(await p.evaluate(() => estadoApp.progreso.z), { centro: 'v' }, 'usa lo válido');
    igual(await p.evaluate(() => estadoApp.progreso.j.mo), ['catedrales'], 'sin repetir monumentos');
    igual(await p.evaluate(() => estadoApp.progreso.f), 1, 'la rana');
    await p.evaluate(() => marcarZona('vega', 'w'));
    const g = await leerGuardado(p);
    igual(g.z, { 'barrio-futuro': 'v', centro: 'v', vega: 'w' }, 'conserva la zona que no conoce');
    igual(g.z.tejares, undefined, 'y descarta las marcas que no son válidas');
    cierto(
      g.j.mo.includes('monumento-futuro') && g.j.mo.includes('catedrales'),
      'conserva el monumento nuevo'
    );
    igual(g.j.campoNuevo, { a: 1 }, 'y los campos nuevos');
    igual(g.j.m, 120, 'sin tocar los demás campos');
    igual(g.j.rs, { monumental: 'v' }, 'ni el seguimiento de rutas');
    cierto(Array.isArray(g.j.hi) && g.j.hi.every(e => Array.isArray(e)), 'historial limpio');
  },
  {
    antes: () =>
      localStorage.setItem(
        'charro2',
        JSON.stringify({
          z: { centro: 'v', 'barrio-futuro': 'v', tejares: 'x', __proto__: 'v' },
          p: 'raro',
          gv: 'raro',
          f: 1,
          t: 50,
          j: {
            m: 120,
            mo: ['catedrales', 'catedrales', 'monumento-futuro'],
            rs: { monumental: 'v' },
            campoNuevo: { a: 1 },
            hi: [['2026-01-01', 'z', 'centro'], 'basura', [3, 'x']]
          }
        })
      )
  }
);

prueba(
  'Guardado: datos dañados',
  async p => {
    cierto((await texto(p, '#ts')).includes('estaba dañado'), 'lo avisa');
    igual(
      await p.evaluate(() => localStorage.getItem('charro2-danado')),
      '{roto',
      'aparta el original sin borrarlo'
    );
    await p.evaluate(() => marcarZona('vega', 'v'));
    igual((await leerGuardado(p)).z, { vega: 'v' }, 'y la app sigue funcionando');
    igual(
      await p.evaluate(() => localStorage.getItem('charro2-danado')),
      '{roto',
      'sin pisar la copia apartada'
    );
  },
  { antes: () => localStorage.getItem('charro2-danado') || localStorage.setItem('charro2', '{roto') }
);

prueba(
  'Guardado: si el navegador no deja guardar',
  async p => {
    await p.evaluate(() => marcarZona('vega', 'v'));
    cierto(
      (await texto(p, '#sv')).startsWith('No se puede guardar en este navegador'),
      'lo dice en el estado'
    );
    igual(
      await p.evaluate(() => estadoApp.progreso.z.vega),
      'v',
      'y la marca sigue en la app mientras está abierta'
    );
  },
  {
    antes: () => {
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = function (k, v) {
        if (k == 'charro2') throw new DOMException('Lleno', 'QuotaExceededError');
        return original.call(this, k, v);
      };
    }
  }
);

prueba('Guardado: marcar dos veces no duplica y no borra otros campos', async p => {
  await p.evaluate(() => {
    estadoApp.progreso.j.m = 300;
    estadoApp.progreso.j.rs = { monumental: 'w' };
    guardar();
    // Marcar, quitar y volver a marcar la misma zona; visitar dos veces el mismo monumento; leer dos veces
    marcarZona('vega', 'v');
    marcarZona('vega', 'v');
    marcarZona('vega', 'v');
    ponerVisita({ tipo: 'mo', id: 'catedrales', n: 'Catedrales' }, true);
    ponerVisita({ tipo: 'mo', id: 'catedrales', n: 'Catedrales' }, true);
    apuntarUso('fl', 'centro');
    apuntarUso('fl', 'centro');
  });
  const g = await leerGuardado(p);
  igual(g.z, { vega: 'v' }, 'la zona, una vez');
  igual(g.j.mo, ['catedrales'], 'el monumento, una vez');
  igual(g.j.fl.filter(x => x == 'centro').length, 1, 'la ficha leída, una vez');
  igual(g.j.hi.filter(e => e[1] == 'z' && e[2] == 'vega').length, 1, 'una sola entrada en el historial');
  igual([g.j.m, g.j.rs], [300, { monumental: 'w' }], 'y el resto de campos sigue igual');
});

// En estas pruebas la cuenta de Claude va simulada, con su documento en memoria (window.__nube)
prueba(
  'Sincronización: si cambian los dos lados, se juntan',
  async p => {
    await p.waitForFunction(() => window.__nube.subidas > 0, null, { timeout: 4000 });
    igual(
      await p.evaluate(() => estadoApp.progreso.z),
      { centro: 'v', vega: 'v' },
      'lo de aquí y lo de la cuenta'
    );
    igual(
      await p.evaluate(() => window.__nube.datos.z),
      { centro: 'v', vega: 'v', 'barrio-futuro': 'w' },
      'y sube todo, también lo que no conoce'
    );
    // Llega un cambio de otro dispositivo mientras aquí hay algo sin subir: se juntan
    await p.evaluate(() => {
      estadoApp.progreso.z.tejares = 'v';
      estadoApp.progreso.t = Date.now();
      window.__nube.avisar({ z: { centro: 'v', vega: 'v', chamberi: 'v' }, t: Date.now() + 5000, v: 1 });
    });
    igual(
      await p.evaluate(() => Object.keys(estadoApp.progreso.z).sort()),
      ['centro', 'chamberi', 'tejares', 'vega'],
      'no se pisa lo que aún no había subido'
    );
  },
  {
    antes: () => {
      // Sincronizados la última vez en t=100; desde entonces cambiaron este navegador (t=300) y la cuenta (t=200)
      localStorage.setItem('charro2', JSON.stringify({ z: { centro: 'v' }, t: 300 }));
      localStorage.setItem('charro-sincronizado', JSON.stringify({ cuenta: 'claude:prueba', t: 100 }));
      localStorage.setItem('charro-cuenta-claude', 'prueba');
      window.__nube = {
        datos: { z: { vega: 'v', 'barrio-futuro': 'w' }, t: 200, v: 1 },
        subidas: 0,
        fallar: 0
      };
      window.claude = {
        use: async k =>
          k == 'user'
            ? { id: async () => 'prueba' }
            : {
                doc: () => ({
                  get: async () => ({ exists: true, data: () => window.__nube.datos }),
                  set: async d => {
                    window.__nube.datos = d;
                    window.__nube.subidas++;
                  },
                  onSnapshot: f => {
                    window.__nube.avisar = d => f({ exists: true, metadata: {}, data: () => d });
                    return () => {};
                  }
                })
              }
      };
    }
  }
);

prueba(
  'Sincronización: sin conexión y recuperación',
  async p => {
    await p.waitForTimeout(300);
    await p.evaluate(() => {
      window.__nube.fallar = 2; // la subida falla (y su reintento también)
      marcarZona('vega', 'v');
    });
    await p.waitForFunction(
      () => document.querySelector('#sv').textContent.startsWith('No se pudo guardar'),
      null,
      {
        timeout: 5000
      }
    );
    igual((await leerGuardado(p)).z, { vega: 'v' }, 'mientras, queda en el navegador');
    await p.evaluate(() => dispatchEvent(new Event('online')));
    await p.waitForFunction(() => window.__nube.datos && window.__nube.datos.z.vega == 'v', null, {
      timeout: 3000
    });
    igual(await texto(p, '#sv'), 'Guardado en tu cuenta', 'al volver la conexión, sube');
    // Al cerrar o cambiar de app, lo pendiente sube sin esperar
    await p.evaluate(() => {
      marcarZona('tejares', 'v');
      Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await p.waitForTimeout(150);
    igual(await p.evaluate(() => window.__nube.datos.z.tejares), 'v', 'sube al ocultar la página');
    // Recargar: viene lo mismo
    await p.reload();
    await p.waitForTimeout(400);
    igual(
      await p.evaluate(() => estadoApp.progreso.z),
      { tejares: 'v', vega: 'v' },
      'y tras recargar sigue todo'
    );
  },
  {
    antes: () => {
      if (!window.__nube) {
        localStorage.setItem('charro-cuenta-claude', 'prueba');
        window.__nube = { datos: null, subidas: 0, fallar: 0 };
      }
      window.claude = {
        use: async k =>
          k == 'user'
            ? { id: async () => 'prueba' }
            : {
                doc: () => ({
                  get: async () => ({ exists: !!window.__nube.datos, data: () => window.__nube.datos }),
                  set: async d => {
                    if (window.__nube.fallar > 0) {
                      window.__nube.fallar--;
                      throw { code: 'unavailable' };
                    }
                    window.__nube.datos = d;
                  },
                  onSnapshot: () => () => {}
                })
              }
      };
    }
  }
);

prueba('Guardado: con la app abierta en dos pestañas no se pisan', async (p, url, ctx) => {
  const otra = await ctx.newPage();
  await otra.goto(url);
  await otra.waitForTimeout(300);
  await p.evaluate(() => marcarZona('vega', 'v'));
  await otra.waitForTimeout(150);
  igual(await otra.evaluate(() => estadoApp.progreso.z), { vega: 'v' }, 'la otra pestaña se entera');
  await otra.evaluate(() => marcarZona('tejares', 'v'));
  await p.waitForTimeout(150);
  igual(await leerGuardado(p).then(g => g.z), { tejares: 'v', vega: 'v' }, 'y lo de las dos queda guardado');
  igual(await p.evaluate(() => estadoApp.progreso.z), { tejares: 'v', vega: 'v' }, 'también en la primera');
  await otra.close();
});
