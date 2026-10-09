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
  reintentado: false
};
// Errores con los que no tiene sentido volver a intentarlo: se pasa a solo lectura
const ERRORES_DEFINITIVOS = [
  'invalid_argument',
  'not_granted',
  'revoked',
  'capability_disabled',
  'capability_removed'
];

function mostrarEstadoGuardado(estado) {
  const [texto, clase] = {
    local: ['Guardado en este navegador', ''],
    sync: ['Conectando con tu cuenta…', 'sy'],
    ok: [nube.textoOk, 'ok'],
    ro: ['Solo lectura: tu progreso se guarda en este navegador', ''],
    err: ['No se pudo guardar en tu cuenta; queda en este navegador', 'er']
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
    } else mostrarEstadoGuardado('err');
  }
  nube.ocupada = false;
  if (nube.pendiente) {
    nube.pendiente = false;
    subirANube();
  }
}

// Guarda tras cualquier cambio: al momento en el navegador y, agrupando cambios seguidos, en la cuenta
const guardar = () => {
  progreso.t = Date.now();
  guardarLocal();
  if (nube.ref) {
    clearTimeout(nube.temporizador);
    nube.temporizador = setTimeout(subirANube, 700);
  }
};

function aplicarDesdeNube(datos) {
  progreso = datos;
  guardarLocal();
  todasLasZonas.forEach(pintarZona);
  actualizar();
}

const tieneProgreso = p => Object.keys(p.z).length || Object.keys(p.p || {}).length || p.f;

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
      r: Object.fromEntries(
        RUTAS.map(ruta => [ruta.id, [...((ja.r || {})[ruta.id] || []), ...((jb.r || {})[ruta.id] || [])]])
      )
    },
    t: Date.now()
  });
}

// Conecta el progreso con su documento en la cuenta. Normalmente gana la copia (navegador o cuenta)
// modificada más tarde; con juntar (al entrar en la cuenta desde un navegador), se juntan las dos.
// Devuelve false si no se ha podido leer la cuenta (y se queda en el navegador).
async function conectarNube(ref, textoOk, juntar = false) {
  nube.textoOk = textoOk;
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
  const enCuenta = instantanea.exists ? limpiarProgreso(instantanea.data()) : null;
  if (enCuenta && juntar && tieneProgreso(progreso)) {
    aplicarDesdeNube(juntarProgresos(enCuenta, progreso));
    subirANube();
  } else if (enCuenta) {
    nube.ultimoSubido = JSON.stringify(datosParaGuardar(enCuenta));
    if ((enCuenta.t || 0) >= (progreso.t || 0)) aplicarDesdeNube(enCuenta);
    else subirANube();
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
      const nuevo = limpiarProgreso(sn.data());
      if ((nuevo.t || 0) > (progreso.t || 0)) {
        nube.ultimoSubido = JSON.stringify(datosParaGuardar(nuevo));
        aplicarDesdeNube(nuevo);
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
  Object.assign(nube, { ref: null, cancelar: null, ultimoSubido: '', pendiente: false });
  mostrarEstadoGuardado('local');
}

// Al arrancar: dentro de Claude, su cuenta; si no, la de Google si se entró antes (cuenta.js)
async function iniciarNube() {
  mostrarEstadoGuardado('local');
  try {
    if (window.claude && window.claude.use) {
      const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
      const id = db && user && (await user.id());
      if (id) return conectarNube(db.doc('data/users/' + id + '/progreso'), 'Guardado en tu cuenta');
    }
  } catch (e) {
    console.error(e);
    mostrarEstadoGuardado('local');
  }
  iniciarCuentaWeb();
}
