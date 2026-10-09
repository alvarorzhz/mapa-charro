// Arranque
const formatoFecha = f =>
  new Date(f + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
async function mostrarNovedades() {
  let lista = [];
  try {
    // Con el ?v= de la versión, como el resto de archivos: si no, el navegador o el modo sin conexión
    // podían seguir enseñando las novedades de una versión anterior
    const enlace = document.querySelector('link[href^="novedades.json"]');
    lista = await (await fetch(enlace ? enlace.getAttribute('href') : 'novedades.json')).json();
  } catch (e) {
    aviso('No se han podido cargar las novedades. Comprueba la conexión', { tipo: 'error' });
    return;
  }
  const caja = crear(
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
  abrirVentana('Novedades', caja, [['Cerrar', cerrarVentana]], $('#ver button'));
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
    try {
      localStorage.setItem(CLAVE_TEMA, nuevo);
    } catch (e) {}
    pintar();
  };
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', pintar);
  pintar();
  $('#ver').append(' · ', boton);
}
// Privacidad (qué se guarda con la cuenta de Google); dentro de Claude no hay esa cuenta
if (!EN_MARCO) {
  const enlace = crear('a', '', 'Privacidad');
  enlace.href = 'privacidad.html';
  $('#ver').append(' · ', enlace);
}
ajustarVista();
actualizar();
aplicarEnlace();
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
    })
    .catch(e => console.warn('Sin modo sin conexión:', e));
}

// La primera vez, la bienvenida (bienvenida.js), cuando ya se ha pintado el mapa
if (tocaBienvenida()) setTimeout(() => mostrarBienvenida(), 300);
