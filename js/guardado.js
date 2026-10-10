// Guardado: siempre en el navegador y, además, en una cuenta si la hay:
// - dentro de Claude, en la cuenta de Claude (capacidades db y user), sin que la persona haga nada;
// - en la web, en su cuenta de Google si entra con ella (Firebase, ver cuenta.js).
// Las dos cuentas usan el mismo documento con get, set y onSnapshot: conectarNube sirve para ambas.

const nube = {
  ref: null, // documento del progreso en la cuenta; null si no hay cuenta o es de solo lectura
  textoOk: 'Guardado en tu cuenta', // lo que dice el estado cuando está guardado
  cancelar: null, // para dejar de escuchar los cambios de otros dispositivos (al salir de la cuenta)
  ocupada: false, // hay una subida en marcha
  pendiente: false, // ha habido cambios durante la subida: hay que volver a subir
  ultimoSubido: '', // JSON de lo último que hay en la cuenta, para no subir lo mismo
  temporizador: 0,
  reintentado: false,
  cuenta: '' // id de la cuenta conectada (Claude o Google), para saber hasta dónde se sincronizó
};
// Hasta dónde están sincronizados este navegador y la cuenta: { cuenta, t } con la hora (t) del progreso
// que se subió o se trajo por última vez. Sirve para saber si, mientras tanto, han cambiado los dos lados
// (entonces se juntan en vez de que uno pise al otro).
const CLAVE_SINCRONIZADO = 'charro-sincronizado';
function baseSincronizada() {
  try {
    const s = JSON.parse(localStorage.getItem(CLAVE_SINCRONIZADO));
    return s && s.cuenta == nube.cuenta && +s.t > 0 ? +s.t : 0;
  } catch (e) {
    return 0;
  }
}
function marcarSincronizado(t) {
  if (!nube.cuenta || !(t > 0)) return;
  try {
    localStorage.setItem(CLAVE_SINCRONIZADO, JSON.stringify({ cuenta: nube.cuenta, t }));
  } catch (e) {}
}
// Errores con los que no tiene sentido volver a intentarlo: se pasa a solo lectura
const ERRORES_DEFINITIVOS = [
  'invalid_argument',
  'not_granted',
  'revoked',
  'capability_disabled',
  'capability_removed'
];

function mostrarEstadoGuardado(estado) {
  // Mientras el navegador no deje guardar, el estado lo sigue diciendo aunque la cuenta vaya bien
  if (guardadoLocalFalla && (estado == 'local' || estado == 'ok')) estado = 'errlocal';
  const [texto, clase] = {
    local: ['Guardado en este navegador', ''],
    sync: ['Conectando con tu cuenta…', 'sy'],
    ok: [nube.textoOk, 'ok'],
    ro: ['Solo lectura: tu progreso se guarda en este navegador', ''],
    err: ['No se pudo guardar en tu cuenta; queda en este navegador', 'er'],
    errlocal: ['No se puede guardar en este navegador (¿modo privado o sin espacio?)', 'er']
  }[estado];
  const e = $('#sv');
  e.textContent = texto;
  e.className = 'svs ' + clase;
}

async function subirANube() {
  if (!nube.ref) return;
  if (nube.ocupada) {
    nube.pendiente = true;
    return;
  }
  const datos = datosParaGuardar(progreso),
    json = JSON.stringify(datos);
  if (json === nube.ultimoSubido) return;
  nube.ocupada = true;
  try {
    await nube.ref.set(datos);
    nube.ultimoSubido = json;
    nube.reintentado = false;
    nube.fallo = false;
    marcarSincronizado(datos.t);
    mostrarEstadoGuardado('ok');
  } catch (e) {
    const codigo = e && e.code;
    if (ERRORES_DEFINITIVOS.includes(codigo)) {
      nube.ref = null;
      mostrarEstadoGuardado('ro');
    } else if (codigo == 'unavailable' && !nube.reintentado) {
      // Un solo reintento, al cabo de un rato al azar
      nube.reintentado = true;
      nube.ocupada = false;
      setTimeout(subirANube, 600 + Math.random() * 900);
      return;
    } else {
      nube.fallo = true; // se reintenta al volver la conexión o en el siguiente cambio
      mostrarEstadoGuardado('err');
    }
  }
  nube.ocupada = false;
  if (nube.pendiente) {
    nube.pendiente = false;
    subirANube();
  }
}

// Guarda tras cualquier cambio: al momento en el navegador y, agrupando cambios seguidos, en la cuenta.
// uso: datos que solo cuentan para los logros (fichas leídas, palabras vistas…). Sin cuenta conectada no
// cambian la hora del progreso: así, al abrir una ficha antes de conectar, esa copia casi vacía del
// navegador no parece más nueva que la de la cuenta y no la pisa.
const guardar = ({ uso = false } = {}) => {
  if (!uso || nube.ref) progreso.t = Math.max(Date.now(), (progreso.t || 0) + 1);
  anotarHistorial(); // perfil.js: fecha de lo nuevo que se ha marcado
  guardarLocal();
  if (nube.ref) {
    clearTimeout(nube.temporizador);
    nube.temporizador = setTimeout(subirANube, 700);
  }
};

// Si no se puede guardar en el navegador (inicio en modo privado, sin espacio…), se avisa una vez
function avisarFalloLocal() {
  mostrarEstadoGuardado('errlocal');
  aviso(
    'No se puede guardar en este navegador (¿modo privado o sin espacio?): lo que marques ahora se perderá al cerrarlo' +
      (nube.ref ? ', salvo lo que llegue a tu cuenta.' : '.'),
    { tipo: 'error' }
  );
}

function aplicarDesdeNube(datos) {
  progreso = datos;
  guardarLocal();
  todasLasZonas.forEach(pintarZona);
  actualizar();
}

// ¿Hay algo que guardar? Marcas, la rana o cualquier dato de los logros y del juego
const tieneProgreso = p => {
  const j = p.j || {};
  return !!(
    Object.keys(p.z || {}).length ||
    Object.keys(p.p || {}).length ||
    p.f ||
    j.m ||
    j.n ||
    j.ms ||
    j.cp ||
    ['h', 'mo', 'fl', 'et', 'pv'].some(k => (j[k] || []).length) ||
    Object.keys(j.r || {}).length ||
    Object.keys(j.rs || {}).length
  );
};

// Junta dos progresos sin perder nada: una zona pisada en cualquiera de los dos queda pisada; si no,
// «quiero ir» si lo está en alguno. Para cuando alguien entra en su cuenta con progreso en el navegador.
function juntarProgresos(a, b) {
  const juntar = (x = {}, y = {}) => {
    const r = { ...x };
    for (const k in y) if (r[k] != 'v') r[k] = y[k];
    return r;
  };
  const ja = a.j || {},
    jb = b.j || {};
  return limpiarProgreso({
    z: juntar(a.z, b.z),
    p: juntar(a.p, b.p),
    gv: [...(a.gv || []), ...(b.gv || [])],
    f: a.f || b.f ? 1 : 0,
    j: {
      ...((ja.d || '') >= (jb.d || '') ? ja : jb),
      m: Math.max(ja.m || 0, jb.m || 0),
      h: [...(ja.h || []), ...(jb.h || [])],
      pf: ja.pf || jb.pf ? 1 : 0,
      mo: [...(ja.mo || []), ...(jb.mo || [])],
      fl: [...(ja.fl || []), ...(jb.fl || [])],
      et: [...(ja.et || []), ...(jb.et || [])],
      pv: [...(ja.pv || []), ...(jb.pv || [])],
      hi: juntarHistoriales(ja.hi, jb.hi),
      rs: juntar(ja.rs, jb.rs), // «la he hecho» gana a «la quiero hacer»
      n: Math.max(ja.n || 0, jb.n || 0),
      ms: Math.max(ja.ms || 0, jb.ms || 0),
      cp: Math.max(ja.cp || 0, jb.cp || 0),
      r: Object.fromEntries(
        [...RUTAS, ...RUTAS_PROVINCIA].map(ruta => [
          ruta.id,
          [...((ja.r || {})[ruta.id] || []), ...((jb.r || {})[ruta.id] || [])]
        ])
      )
    },
    t: Date.now()
  });
}

// Junta dos historiales: cada cosa una vez, con la fecha más antigua que se conozca
function juntarHistoriales(a, b) {
  if (!Array.isArray(a) && !Array.isArray(b)) return undefined;
  const por = new Map();
  [...(a || []), ...(b || [])].forEach(e => {
    if (!Array.isArray(e)) return;
    const k = e[1] + '|' + e[2],
      antes = por.get(k);
    if (!antes || (e[0] && (!antes[0] || e[0] < antes[0]))) por.set(k, e);
  });
  return [...por.values()];
}

// Conecta el progreso con su documento en la cuenta. Normalmente gana la copia (navegador o cuenta)
// modificada más tarde; con juntar (la primera vez que esa cuenta se conecta en este navegador), se
// juntan siempre las dos, para que nada de lo que haya en la cuenta se pierda.
// Devuelve false si no se ha podido leer la cuenta (y se queda en el navegador).
async function conectarNube(ref, textoOk, juntar = false, cuenta = '') {
  nube.textoOk = textoOk;
  nube.cuenta = cuenta;
  mostrarEstadoGuardado('sync');
  let instantanea;
  try {
    instantanea = await ref.get();
  } catch (e) {
    if (e && e.code == 'unavailable') {
      await new Promise(r => setTimeout(r, 800));
      try {
        instantanea = await ref.get();
      } catch (e2) {
        mostrarEstadoGuardado('err');
        return false;
      }
    } else {
      mostrarEstadoGuardado(e && e.code == 'invalid_argument' ? 'ro' : 'local');
      return false;
    }
  }
  nube.ref = ref;
  const crudo = instantanea.exists ? instantanea.data() : null;
  if (crudo) apartarDesconocidos(crudo); // lo que esta versión no conoce no se pierde al volver a subir
  const enCuenta = crudo ? limpiarProgreso(crudo) : null,
    base = baseSincronizada();
  if (enCuenta && juntar) {
    aplicarDesdeNube(juntarProgresos(enCuenta, progreso));
    subirANube();
  } else if (enCuenta) {
    nube.ultimoSubido = JSON.stringify(datosParaGuardar(enCuenta));
    // ¿Han cambiado los dos lados desde la última vez que se sincronizaron? Entonces se juntan
    const cambioAqui = (progreso.t || 0) > base,
      cambioEnCuenta = (enCuenta.t || 0) > base;
    if (base && cambioAqui && cambioEnCuenta) {
      aplicarDesdeNube(juntarProgresos(enCuenta, progreso));
      subirANube();
      aviso('Se han juntado tus cambios de este dispositivo con los de tu cuenta');
    } else if ((enCuenta.t || 0) >= (progreso.t || 0)) {
      aplicarDesdeNube(enCuenta);
      marcarSincronizado(enCuenta.t);
    } else subirANube();
  } else if (tieneProgreso(progreso)) {
    if (!progreso.t) progreso.t = Date.now();
    guardarLocal();
    subirANube();
  }
  if (!nube.ocupada) mostrarEstadoGuardado('ok');
  // Cambios hechos desde otro dispositivo
  nube.cancelar = ref.onSnapshot(
    sn => {
      if (!sn.exists || sn.metadata.hasPendingWrites) return;
      const crudo = sn.data();
      apartarDesconocidos(crudo);
      const nuevo = limpiarProgreso(crudo),
        base = baseSincronizada();
      if ((nuevo.t || 0) > (progreso.t || 0)) {
        if (base && (progreso.t || 0) > base) {
          // Aquí hay cambios que aún no han subido: se juntan con los que llegan, no se pisan
          aplicarDesdeNube(juntarProgresos(nuevo, progreso));
          subirANube();
        } else {
          nube.ultimoSubido = JSON.stringify(datosParaGuardar(nuevo));
          aplicarDesdeNube(nuevo);
          marcarSincronizado(nuevo.t);
        }
        aviso('Progreso actualizado desde otro dispositivo');
      }
    },
    () => {}
  );
  return true;
}

// Deja la cuenta (al salir de ella): el progreso sigue en el navegador
function desconectarNube() {
  if (typeof nube.cancelar == 'function') nube.cancelar();
  clearTimeout(nube.temporizador);
  Object.assign(nube, { ref: null, cancelar: null, ultimoSubido: '', pendiente: false, cuenta: '' });
  mostrarEstadoGuardado('local');
}

let nombreClaude = ''; // el nombre de la cuenta de Claude (perfil.js), si Claude lo da
const CLAVE_NUBE_CLAUDE = 'charro-cuenta-claude'; // la cuenta de Claude ya conectada en este dispositivo
const leerClave = k => {
  try {
    return localStorage.getItem(k);
  } catch (e) {
    return null;
  }
};
const escribirClave = (k, v) => {
  try {
    localStorage.setItem(k, v);
  } catch (e) {}
};

// Al arrancar: dentro de Claude, su cuenta; si no, la de Google si se entró antes (cuenta.js)
async function iniciarNube() {
  mostrarEstadoGuardado('local');
  try {
    if (window.claude && window.claude.use) {
      const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
      const id = db && user && (await user.id());
      if (id) {
        // El nombre, solo para saludar en el perfil (no se guarda; hace falta el permiso «profile»)
        Promise.resolve()
          .then(() => user.me())
          .then(yo => {
            nombreClaude = (yo && yo.name) || '';
            if (nombreClaude && location.hash == '#perfil') abrirPerfil();
          })
          .catch(() => {});
        // La primera vez que esta cuenta de Claude se conecta en este dispositivo, se juntan las copias
        const juntar = leerClave(CLAVE_NUBE_CLAUDE) != id,
          conectada = await conectarNube(
            db.doc('data/users/' + id + '/progreso'),
            'Guardado en tu cuenta',
            juntar,
            'claude:' + id
          );
        if (conectada) escribirClave(CLAVE_NUBE_CLAUDE, id);
        return conectada;
      }
    }
  } catch (e) {
    console.error(e);
    mostrarEstadoGuardado('local');
  }
  iniciarCuentaWeb();
}

// --- Que no se pierda nada al cerrar, al quedarse sin conexión o con la app abierta en dos pestañas ----
// Al ocultar la página (cerrar la pestaña, cambiar de app en el móvil) sube ya lo pendiente
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState == 'hidden' && nube.ref) {
    clearTimeout(nube.temporizador);
    subirANube();
  }
});
// Al volver la conexión, reintenta la subida que falló
addEventListener('online', () => {
  if (nube.ref && nube.fallo) subirANube();
});
// Otra pestaña de este navegador ha guardado: se usa su progreso si es igual de nuevo o más (si no, al
// guardar aquí se pisaría lo que se marcó allí)
addEventListener('storage', e => {
  if (e.key != CLAVE_LOCAL || !e.newValue) return;
  let otro;
  try {
    otro = JSON.parse(e.newValue);
  } catch (x) {
    return;
  }
  apartarDesconocidos(otro);
  otro = limpiarProgreso(otro);
  if ((otro.t || 0) < (progreso.t || 0)) return;
  progreso = otro;
  todasLasZonas.forEach(pintarZona);
  actualizar();
});
