// Cuenta con Google en la web, para no perder el progreso y usarlo en otro dispositivo (Firebase:
// Authentication con Google y el progreso en Firestore, en progreso/<uid>). Es opcional: sin entrar,
// todo sigue guardándose en el navegador. Dentro de Claude no se usa: allí va la cuenta de Claude.
// Firebase solo se descarga si hace falta: al pulsar «Entrar con Google» o si ya se entró antes en
// este navegador (CLAVE_CUENTA guarda el uid; también sirve para saber si hay que juntar progresos).

const VERSION_FIREBASE = '12.19.0',
  CLAVE_CUENTA = 'charro-cuenta';
const cuentaWeb = { auth: null, db: null, usuario: null, escuchando: false };

// Las pruebas ponen un Firebase falso (window.firebase.prueba) en vez de la configuración real
const configFirebase = () =>
  CONFIG_FIREBASE || (window.firebase && window.firebase.prueba ? { prueba: true } : null);
const puedeUsarCuenta = () => !!configFirebase() && !EN_MARCO;
const leerCuentaGuardada = () => {
  try {
    return localStorage.getItem(CLAVE_CUENTA);
  } catch (e) {
    return null;
  }
};
const recordarCuenta = uid => {
  try {
    if (uid) localStorage.setItem(CLAVE_CUENTA, uid);
    else localStorage.removeItem(CLAVE_CUENTA);
  } catch (e) {}
};

// --- Cargar Firebase (de su web, en orden: primero app) -------------------------------
const cargarScript = src =>
  new Promise((bien, mal) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = bien;
    s.onerror = () => mal(new Error('No se pudo cargar ' + src));
    document.head.appendChild(s);
  });
let cargaFirebase = null;
function cargarFirebase() {
  if (!cargaFirebase)
    cargaFirebase = (async () => {
      if (!window.firebase)
        for (const parte of ['app', 'auth', 'firestore'])
          await cargarScript(
            `https://www.gstatic.com/firebasejs/${VERSION_FIREBASE}/firebase-${parte}-compat.js`
          );
      if (!firebase.apps.length) firebase.initializeApp(configFirebase());
      cuentaWeb.auth = firebase.auth();
      cuentaWeb.db = firebase.firestore();
    })().catch(e => {
      cargaFirebase = null;
      throw e;
    });
  return cargaFirebase;
}

// --- Entrar, salir y borrar -----------------------------------------------------------
function escucharCuenta() {
  if (cuentaWeb.escuchando) return;
  cuentaWeb.escuchando = true;
  cuentaWeb.auth.onAuthStateChanged(async usuario => {
    if (usuario && usuario.uid != (cuentaWeb.usuario && cuentaWeb.usuario.uid)) {
      cuentaWeb.usuario = usuario;
      // Si en este navegador no se había entrado con esta cuenta, se junta lo que hubiera en él
      const juntar = leerCuentaGuardada() != usuario.uid;
      const ref = cuentaWeb.db.collection('progreso').doc(usuario.uid),
        conectada = await conectarNube(
          ref,
          'Guardado en tu cuenta' + (usuario.email ? ' (' + usuario.email + ')' : ''),
          juntar
        );
      if (conectada) recordarCuenta(usuario.uid);
    } else if (!usuario && cuentaWeb.usuario) {
      cuentaWeb.usuario = null;
      desconectarNube();
    } else if (!usuario) {
      recordarCuenta(null);
      mostrarEstadoGuardado('local');
    }
    pintarCuenta();
  });
}

async function entrarConGoogle() {
  try {
    await cargarFirebase();
    escucharCuenta();
    const proveedor = new firebase.auth.GoogleAuthProvider();
    try {
      await cuentaWeb.auth.signInWithPopup(proveedor);
    } catch (e) {
      // Si el navegador bloquea la ventanita, se entra cambiando de página y volviendo
      if (e && e.code == 'auth/popup-blocked') {
        recordarCuenta('pendiente'); // para cargar Firebase al volver y recoger la entrada
        await cuentaWeb.auth.signInWithRedirect(proveedor);
      } else throw e;
    }
  } catch (e) {
    if (e && ['auth/popup-closed-by-user', 'auth/cancelled-popup-request'].includes(e.code)) return;
    console.error(e);
    aviso('No se ha podido entrar. Comprueba la conexión y vuelve a probar');
  }
}

async function salirDeCuenta() {
  cerrarVentana();
  desconectarNube();
  cuentaWeb.usuario = null;
  recordarCuenta(null);
  try {
    await cuentaWeb.auth.signOut();
  } catch (e) {}
  pintarCuenta();
  aviso('Has salido. Tu progreso sigue en este navegador');
}

// Borra el progreso de la nube y la cuenta (en el navegador se queda). Google pide haber entrado
// hace poco para borrar una cuenta: si hace falta, vuelve a preguntar con la ventanita.
async function borrarCuenta() {
  const usuario = cuentaWeb.usuario;
  if (!usuario) return;
  try {
    const ref = cuentaWeb.db.collection('progreso').doc(usuario.uid);
    desconectarNube();
    await ref.delete();
    try {
      await usuario.delete();
    } catch (e) {
      if (!e || e.code != 'auth/requires-recent-login') throw e;
      await usuario.reauthenticateWithPopup(new firebase.auth.GoogleAuthProvider());
      await usuario.delete();
    }
    cuentaWeb.usuario = null;
    recordarCuenta(null);
    cerrarVentana();
    pintarCuenta();
    aviso('Cuenta borrada. Tu progreso sigue en este navegador');
  } catch (e) {
    console.error(e);
    aviso('No se ha podido borrar la cuenta. Vuelve a probar');
  }
}

// --- Botón junto al estado del guardado ----------------------------------------------
function ventanaCuenta() {
  const u = cuentaWeb.usuario,
    privacidad = crear('a', '', 'Privacidad');
  privacidad.href = 'privacidad.html';
  privacidad.target = '_blank';
  privacidad.rel = 'noopener';
  const contenido = crear(
    'div',
    'cuenta-info',
    crear(
      'p',
      '',
      'Has entrado como ',
      crear('b', '', u.email || u.displayName || 'tu cuenta de Google'),
      '.'
    ),
    crear(
      'p',
      '',
      'Tu progreso se guarda en tu cuenta y lo verás en cualquier dispositivo donde entres con ella. ',
      privacidad
    )
  );
  abrirVentana('Tu cuenta', contenido, [
    ['Salir', salirDeCuenta],
    [
      'Borrar mi cuenta',
      () =>
        abrirVentana(
          '¿Borrar tu cuenta?',
          crear(
            'p',
            '',
            'Se borra tu progreso guardado en la cuenta. En este navegador se queda; en tus otros dispositivos, también lo que tuvieran.'
          ),
          [
            ['Borrar', borrarCuenta, 'on'],
            ['Cancelar', cerrarVentana]
          ]
        ),
      'secundario'
    ]
  ]);
}

function pintarCuenta() {
  const caja = $('#cuenta');
  caja.textContent = '';
  caja.hidden = !puedeUsarCuenta();
  if (caja.hidden) return;
  const b = crear('button', 'enlace');
  if (cuentaWeb.usuario) {
    b.textContent = 'Tu cuenta';
    b.onclick = ventanaCuenta;
  } else {
    b.textContent = 'Entrar con Google';
    b.onclick = entrarConGoogle;
    // La razón, solo cuando ya hay algo que perder
    if (tieneProgreso(progreso)) caja.append(crear('span', '', 'Para no perder tu progreso: '));
  }
  caja.append(b);
}

// Al arrancar fuera de Claude (lo llama iniciarNube)
function iniciarCuentaWeb() {
  pintarCuenta();
  if (!puedeUsarCuenta() || !leerCuentaGuardada()) return;
  mostrarEstadoGuardado('sync');
  cargarFirebase()
    .then(escucharCuenta)
    .catch(() => mostrarEstadoGuardado('local'));
}
