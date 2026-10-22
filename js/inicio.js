// Arranque
const formatoFecha = f =>
  new Date(f + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
// Con el ?v= de la versión, como el resto de archivos: si no, el navegador o el modo sin conexión
// podían seguir enseñando las novedades de una versión anterior
async function cargarNovedades() {
  const enlace = document.querySelector('link[href^="novedades.json"]');
  return (await fetch(enlace ? enlace.getAttribute('href') : 'novedades.json')).json();
}
async function mostrarNovedades() {
  let lista;
  try {
    lista = await cargarNovedades();
  } catch (e) {
    aviso('No se han podido cargar las novedades. Comprueba la conexión', { tipo: 'error' });
    return;
  }
  escribirLocal(CLAVE_VERSION_VISTA, versionApp());
  abrirVentana('Novedades', cajaNovedades(lista), [['Cerrar', cerrarVentana]], $('#ver button'));
}
const cajaNovedades = lista =>
  crear(
    'div',
    'novedades',
    ...lista.map(n =>
      crear(
        'section',
        '',
        crear('h4', '', n.version + ' · ' + n.titulo),
        crear('small', '', formatoFecha(n.fecha)),
        // En puntos (desde la 1.2.2); si alguna viniera como párrafo, tal cual
        Array.isArray(n.usuario)
          ? crear('ul', '', ...n.usuario.map(t => crear('li', '', t)))
          : crear('p', '', n.usuario)
      )
    )
  );

// Al llegar una versión nueva, una ventana con sus novedades (y las de las versiones que no se vieron,
// hasta tres). La última vista se recuerda en este navegador (charro-version-vista); quien entra por
// primera vez hace el primer paseo y no ve las novedades.
const CLAVE_VERSION_VISTA = 'charro-version-vista',
  MAX_VERSIONES_NUEVAS = 3;
function compararVersiones(a, b) {
  const x = String(a).split('.').map(Number),
    y = String(b).split('.').map(Number);
  for (let i = 0; i < 3; i++) if ((x[i] || 0) != (y[i] || 0)) return (x[i] || 0) - (y[i] || 0);
  return 0;
}
// ¿Hay una versión que esta persona aún no ha visto? (sin ninguna apuntada: venía de antes de existir esto)
const tocaNovedades = () => {
  const vista = leerLocal(CLAVE_VERSION_VISTA);
  return !!versionApp() && !location.hash && (!vista || compararVersiones(vista, versionApp()) < 0);
};
async function mostrarNovedadesNuevas() {
  const vista = leerLocal(CLAVE_VERSION_VISTA),
    actual = versionApp();
  let lista;
  try {
    lista = await cargarNovedades();
  } catch (e) {
    return; // sin conexión: ya saldrán la próxima vez
  }
  const nuevas = lista
    .filter(n => compararVersiones(n.version, actual) <= 0)
    .filter(n => (vista ? compararVersiones(n.version, vista) > 0 : n.version == actual))
    .slice(0, MAX_VERSIONES_NUEVAS);
  escribirLocal(CLAVE_VERSION_VISTA, actual);
  if (!nuevas.length) return;
  abrirVentana(
    nuevas.length == 1 ? '¡Novedades de la ' + actual + '!' : '¡Novedades desde la última vez!',
    cajaNovedades(nuevas),
    [
      ['Ver todas', mostrarNovedades],
      ['¡Vale!', cerrarVentana, 'on']
    ]
  );
  const botones = document.querySelectorAll('.modal .botones button');
  botones[botones.length - 1].focus({ preventScroll: true });
}
// Versión al pie de la página: la de package.json (1.4.0) y, entre paréntesis, el número interno ?v=
// que sube herramientas/version.js en cada cambio (el que hace que el móvil baje los archivos nuevos).
// Al pulsarla salen las novedades de cada versión (novedades.json, los puntos para el usuario).
{
  const meta = document.querySelector('meta[name="version"]'),
    v = (document.querySelector('script[src*="?v="]') || {}).src,
    boton = crear(
      'button',
      'enlace',
      (meta ? 'Versión ' + meta.content : '') +
        (v ? (meta ? ' (' : 'Versión ') + v.split('?v=')[1] + (meta ? ')' : '') : '')
    );
  boton.setAttribute('aria-label', boton.textContent + ': ver las novedades');
  boton.onclick = mostrarNovedades;
  $('#ver').appendChild(boton);
}

// Tema claro u oscuro, al pie. Sin elegir, el del sistema; lo elegido se recuerda en este navegador
// (lo aplica antes de pintar un script en el <head> de index.html, para que no parpadee)
const CLAVE_TEMA = 'charro-tema';
const temaActual = () =>
  document.documentElement.dataset.theme ||
  (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
{
  const boton = crear('button', 'enlace tema');
  const pintar = () => {
    const oscuro = temaActual() == 'dark';
    boton.textContent = oscuro ? '☀️ Tema claro' : '🌙 Tema oscuro';
    boton.setAttribute('aria-label', oscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
  };
  boton.onclick = () => {
    const nuevo = temaActual() == 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nuevo;
    escribirLocal(CLAVE_TEMA, nuevo);
    pintar();
    repintarFondoReal();
  };
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    pintar();
    repintarFondoReal();
  });
  pintar();
  $('#ver').append(' · ', boton);
}
// Privacidad (qué se guarda con la cuenta de Google); dentro de Claude no hay esa cuenta
if (!EN_MARCO) {
  const enlace = crear('a', '', 'Privacidad');
  enlace.href = 'privacidad.html';
  $('#ver').append(' · ', enlace);
}
// Las fuentes, al pie (antes de «Avisar de un error»): en una ventana, para no cargar el final de la página
{
  const boton = crear('button', 'enlace', 'Fuentes');
  boton.onclick = () => {
    const lista = crear('div', 'lista-fuentes');
    lista.append(...[...$('#fuentes').cloneNode(true).childNodes]); // el texto está en index.html
    lista.querySelector('#dt').removeAttribute('id');
    abrirVentana('Fuentes', lista, [['Cerrar', cerrarVentana]], boton);
  };
  $('#ver').append(' · ', boton);
}
// Si lo guardado en el navegador estaba ilegible, se apartó sin borrarlo (estado.js) y se avisa
if (progresoDanado)
  aviso(
    'Lo guardado en este navegador estaba dañado y no se ha podido leer. Lo hemos apartado sin borrarlo; si tienes cuenta, tu progreso vuelve de ella.',
    { tipo: 'error' }
  );
// Historial del perfil: lo que ya estaba marcado antes de que existiera queda apuntado sin fecha
if (!Array.isArray(progreso.j.hi)) {
  anotarHistorial();
  guardarLocal();
}
ajustarVista();
actualizar();
iniciarPalabras();
aplicarEnlace();
marcarMapaListo(); // medicion.js: el tiempo de carga hasta aquí
iniciarNube();
// Sin conexión: solo en la web (dentro de Claude la app va en un marco y no hace falta)
if (
  'serviceWorker' in navigator &&
  !EN_MARCO &&
  (location.protocol == 'https:' || location.hostname == 'localhost')
) {
  const primeraVez = !navigator.serviceWorker.controller;
  navigator.serviceWorker
    .register('sw.js')
    .then(reg => {
      const w = reg.installing;
      if (w && primeraVez)
        w.addEventListener('statechange', () => {
          if (w.state == 'activated')
            aviso('✓ Listo: el mapa ya funciona sin conexión', { tipo: 'exito', discreto: true });
        });
      vigilarVersionNueva(reg, primeraVez);
    })
    .catch(e => console.warn('Sin modo sin conexión:', e));
}

// Versión nueva con la app abierta (en el iPhone, la de la pantalla de inicio puede llevar días abierta):
// al volver a ella se mira si hay otro sw.js (como mucho cada 10 minutos). El nuevo toma el control solo
// (sw.js: skipWaiting y clients.claim) y entonces sale arriba «Hay una versión nueva · Actualizar», que no
// se va hasta pulsarlo o cerrarlo. No se recarga sola, para no cortar lo que se esté haciendo; al recargar
// salen sus novedades.
const ESPERA_VERSION_NUEVA = 10 * 60 * 1000;
function vigilarVersionNueva(reg, primeraVez) {
  let ultimaVez = Date.now();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState != 'visible' || Date.now() - ultimaVez < ESPERA_VERSION_NUEVA) return;
    ultimaVez = Date.now();
    reg.update().catch(() => {}); // sin conexión: ya se mirará otra vez
  });
  // La primera vez también cambia el control (de nadie al primer sw.js): eso no es una versión nueva
  if (!primeraVez) navigator.serviceWorker.addEventListener('controllerchange', avisarVersionNueva);
}
function avisarVersionNueva() {
  if ($('#nueva')) return;
  const actualizar = crear('button', 'on', 'Actualizar'),
    cerrar = crear('button', 'cerrar', '×'),
    caja = crear('div', '', crear('span', '', '✨ Hay una versión nueva del mapa'), actualizar, cerrar);
  caja.id = 'nueva';
  caja.setAttribute('role', 'status');
  cerrar.setAttribute('aria-label', 'Cerrar el aviso de versión nueva');
  actualizar.onclick = () => location.reload();
  cerrar.onclick = () => caja.remove();
  document.body.append(caja);
}

// La primera vez, el primer paseo (paseo.js), cuando ya se ha pintado el mapa. Si no, las novedades
// si hay una versión nueva y, si no, la primera vez de cada día, «¿Qué puedo descubrir hoy?» (hoy.js); el
// día del primer paseo ya no sale, y el de las novedades sale la próxima vez que se abra
if (tocaBienvenida()) {
  escribirLocal(CLAVE_HOY, fechaHoy());
  escribirLocal(CLAVE_VERSION_VISTA, versionApp());
  marcarBienvenidaVista();
  setTimeout(() => empezarPaseo(), 300);
} else if (tocaNovedades()) setTimeout(() => mostrarNovedadesNuevas(), 300);
else if (tocaHoy()) setTimeout(() => abrirHoy(), 300);
