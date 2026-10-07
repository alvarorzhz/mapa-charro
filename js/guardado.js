// Guardado: siempre en el navegador y, dentro de Claude, también en la cuenta del usuario (capacidades db y user).
// En la web window.claude no existe y todo queda en el navegador.

const nube = {
  ref: null, // documento data/users/<id>/progreso; null si no hay cuenta o es de solo lectura
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
    ok: ['Guardado en tu cuenta', 'ok'],
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

// Conecta con la cuenta. Gana la copia (navegador o cuenta) modificada más tarde.
async function iniciarNube() {
  mostrarEstadoGuardado('local');
  try {
    if (!window.claude || !window.claude.use) return;
    const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
    if (!db || !user) return;
    const id = await user.id();
    if (!id) return;
    mostrarEstadoGuardado('sync');
    const ref = db.doc('data/users/' + id + '/progreso');
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
          return;
        }
      } else {
        mostrarEstadoGuardado(e && e.code == 'invalid_argument' ? 'ro' : 'local');
        return;
      }
    }
    nube.ref = ref;
    const enCuenta = instantanea.exists ? limpiarProgreso(instantanea.data()) : null;
    if (enCuenta) {
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
    ref.onSnapshot(
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
  } catch (e) {
    console.error(e);
    mostrarEstadoGuardado('local');
  }
}
