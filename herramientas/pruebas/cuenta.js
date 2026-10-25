// Pruebas · Cuentas: la de Claude y la de Google (simuladas), también desde la app del iPhone.
// Se pasan desde herramientas/pruebas.js (PRUEBAS_ZONA=cuenta pasa solo estas).
const { prueba, igual, cierto, texto, fichaAbierta } = require('./comun');

// Firebase falso para entrar desde la app del iPhone: solo con la credencial que devuelve Google
function firebaseConCredencial() {
  let usuario = null;
  const oyentes = [],
    nube = { datos: null };
  window.__nubeGoogle = nube;
  const auth = {
    onAuthStateChanged: f => {
      oyentes.push(f);
      setTimeout(() => f(usuario));
      return () => {};
    },
    signInWithPopup: async () => {
      throw new Error('en la app del iPhone no se usa la ventanita');
    },
    signInWithCredential: async c => {
      window.__credencial = c;
      usuario = { uid: 'u2', email: 'iphone@ejemplo.es' };
      oyentes.forEach(f => f(usuario));
    },
    signOut: async () => {}
  };
  const doc = {
    get: async () => ({ exists: !!nube.datos, data: () => nube.datos }),
    set: async d => (nube.datos = d),
    onSnapshot: () => () => {}
  };
  window.firebase = {
    prueba: true,
    apps: [1],
    auth: Object.assign(() => auth, {
      GoogleAuthProvider: Object.assign(function () {}, { credential: t => ({ token: t }) })
    }),
    firestore: () => ({ collection: () => ({ doc: () => doc }) })
  };
  Object.defineProperty(navigator, 'standalone', { get: () => true });
}

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
      await p.evaluate(() => estadoApp.progreso.z),
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
    igual(await p.evaluate(() => Object.keys(estadoApp.progreso.z).length), 2, 'el progreso sigue');
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
          // Como Firestore de verdad: no admite listas dentro de listas
          set: d => {
            const anidadas = x =>
              Array.isArray(x)
                ? x.some(e => Array.isArray(e) || anidadas(e))
                : !!x && typeof x == 'object' && Object.values(x).some(anidadas);
            if (anidadas(d)) {
              const e = new Error('Nested arrays are not supported');
              e.code = 'invalid-argument';
              throw e;
            }
            nube.datos = d;
            return Promise.resolve();
          },
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
  'Cuenta con Google desde la app del iPhone: va a la página de Google',
  async p => {
    await p.waitForTimeout(200);
    const aqui = await p.evaluate(() => location.origin + location.pathname),
      ida = p.waitForRequest(r => r.url().startsWith('https://accounts.google.com/'));
    // Lo apuntado antes de irse (luego la página ya es la de Google)
    const guardada = await p.evaluate(() => {
      document.querySelector('#cuenta button').click();
      return JSON.parse(localStorage.getItem('charro-ida-google'));
    });
    const url = new URL((await ida).url());
    igual(url.searchParams.get('response_type'), 'id_token', 'pide la credencial');
    igual(url.searchParams.get('redirect_uri'), aqui, 'vuelve aquí');
    igual(url.searchParams.get('state'), guardada.estado, 'con el estado apuntado');
    igual(url.searchParams.get('nonce'), guardada.nonce, 'y el nonce');
    igual(guardada.hash, '#tejares', 'recuerda dónde estaba');
  },
  {
    hash: '#tejares',
    antes: firebaseConCredencial,
    rutas: p => p.route('https://accounts.google.com/**', r => r.fulfill({ body: 'Google' }))
  }
);

prueba(
  'Cuenta con Google desde la app del iPhone: vuelve de Google y entra',
  async p => {
    await p.waitForTimeout(400);
    igual(await texto(p, '#sv'), 'Guardado en tu cuenta (iphone@ejemplo.es)', 'entra y conecta');
    igual(await p.evaluate(() => location.hash), '#tejares', 'deja el enlace de antes');
    cierto(await fichaAbierta(p), 'y abre su ficha');
    igual(await p.evaluate(() => localStorage.getItem('charro-ida-google')), null, 'olvida la ida');
    cierto(await p.evaluate(() => window.__credencial.token.includes('.')), 'con la credencial de Google');
    igual(await p.evaluate(() => localStorage.getItem('charro-cuenta')), 'u2', 'recuerda la cuenta');
  },
  {
    hash:
      '#state=e1&id_token=' +
      ['{"alg":"none"}', '{"nonce":"n1","email":"iphone@ejemplo.es"}']
        .map(t => Buffer.from(t).toString('base64url'))
        .join('.') +
      '.firma',
    antes:
      `localStorage.setItem('charro-ida-google', '{"estado":"e1","nonce":"n1","hash":"#tejares"}');` +
      `(${firebaseConCredencial})();`
  }
);

prueba(
  'Cuenta con Google desde la app del iPhone: no acepta una vuelta que no es suya',
  async p => {
    await p.waitForTimeout(400);
    igual(await texto(p, '#sv'), 'Guardado en este navegador', 'no entra');
    igual(await p.evaluate(() => window.__credencial), undefined, 'ni le da nada a Firebase');
    igual(await p.evaluate(() => location.hash), '', 'y limpia la dirección');
  },
  {
    hash:
      '#state=otro&id_token=' +
      ['{"alg":"none"}', '{"nonce":"n1"}'].map(t => Buffer.from(t).toString('base64url')).join('.') +
      '.firma',
    antes:
      `localStorage.setItem('charro-ida-google', '{"estado":"e1","nonce":"n1","hash":""}');` +
      `(${firebaseConCredencial})();`
  }
);

prueba(
  'Cuenta de Claude en un dispositivo nuevo con enlace a una zona',
  async p => {
    // La ficha de la zona se abre antes de que llegue la cuenta: lo de la cuenta no se puede perder
    await p.waitForTimeout(1200);
    igual(await p.evaluate(() => estadoApp.progreso.z), { centro: 'v', vega: 'w' }, 'trae lo de la cuenta');
    cierto(await p.evaluate(() => estadoApp.progreso.j.fl.includes('tejares')), 'y conserva la ficha leída');
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
  'Cuenta con Google: el historial se sube sin listas anidadas y lo que no llegó a subir se junta',
  async p => {
    // Ya se había entrado en este navegador, pero ninguna subida salió bien (no hay base sincronizada):
    // la cuenta tiene lo de un móvil y aquí hay otra cosa más nueva. No se pierde ninguna de las dos
    await p.waitForTimeout(1500);
    igual(
      await p.evaluate(() => Object.keys(estadoApp.progreso.z).sort()),
      ['centro', 'vega'],
      'junta lo del navegador y lo de la cuenta'
    );
    igual(await texto(p, '#sv'), 'Guardado en tu cuenta (prueba@ejemplo.es)', 'y se guarda en la cuenta');
    const enCuenta = await p.evaluate(() => window.__nubeGoogle.datos);
    cierto(enCuenta.z.centro == 'v' && enCuenta.z.vega == 'v', 'la cuenta tiene las dos');
    cierto(
      enCuenta.j.hi.length >= 2 && enCuenta.j.hi.every(e => Array.isArray(e._a) && e._a.length == 3),
      'el historial va envuelto para Firestore'
    );
    cierto(
      await p.evaluate(() => estadoApp.progreso.j.hi.every(e => Array.isArray(e))),
      'y en la app sigue como siempre'
    );
    // Marcar algo nuevo también sube
    await p.evaluate(() => marcarZona('tejares', 'v'));
    await p.waitForTimeout(1200);
    igual(await p.evaluate(() => window.__nubeGoogle.datos.z.tejares), 'v', 'lo nuevo llega a la cuenta');
    igual(await texto(p, '#sv'), 'Guardado en tu cuenta (prueba@ejemplo.es)', 'sin error');
  },
  {
    antes: () => {
      if (!sessionStorage.getItem('ya')) {
        sessionStorage.setItem('ya', '1');
        localStorage.setItem('charro-cuenta', 'u1');
        localStorage.setItem(
          'charro2',
          JSON.stringify({ z: { vega: 'v' }, t: 50, j: { hi: [['2026-10-11', 'z', 'vega']] } })
        );
      }
      const nube = {
        datos: { z: { centro: 'v' }, t: 20, v: 1, j: { hi: [{ _a: ['2026-10-01', 'z', 'centro'] }] } }
      };
      const usuario = { uid: 'u1', email: 'prueba@ejemplo.es' };
      window.__nubeGoogle = nube;
      const auth = {
          onAuthStateChanged: f => {
            setTimeout(() => f(usuario));
            return () => {};
          },
          signInWithPopup: async () => {}
        },
        doc = {
          get: async () => ({ exists: !!nube.datos, data: () => nube.datos }),
          set: d => {
            const anidadas = x =>
              Array.isArray(x)
                ? x.some(e => Array.isArray(e) || anidadas(e))
                : !!x && typeof x == 'object' && Object.values(x).some(anidadas);
            if (anidadas(d)) {
              const e = new Error('Nested arrays are not supported');
              e.code = 'invalid-argument';
              throw e;
            }
            nube.datos = d;
            return Promise.resolve();
          },
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
  'Cuenta con Google tras abrir solo fichas',
  async p => {
    // En un navegador nuevo se lee una ficha (solo cuenta para los logros) y luego se entra
    await p.evaluate(() => abrirFicha('vega'));
    await p.evaluate(() => cerrarFicha());
    igual(await p.evaluate(() => estadoApp.progreso.t), 0, 'leer una ficha no hace la copia más nueva');
    await p.click('#cuenta button');
    await p.waitForTimeout(1300);
    igual(
      await p.evaluate(() => estadoApp.progreso.z),
      { centro: 'v', tejares: 'w' },
      'trae lo de la cuenta'
    );
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
          // Como Firestore de verdad: no admite listas dentro de listas
          set: d => {
            const anidadas = x =>
              Array.isArray(x)
                ? x.some(e => Array.isArray(e) || anidadas(e))
                : !!x && typeof x == 'object' && Object.values(x).some(anidadas);
            if (anidadas(d)) {
              const e = new Error('Nested arrays are not supported');
              e.code = 'invalid-argument';
              throw e;
            }
            nube.datos = d;
            return Promise.resolve();
          },
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
