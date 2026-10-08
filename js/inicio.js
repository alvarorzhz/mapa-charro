// Arranque
const formatoFecha = f =>
  new Date(f + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
async function mostrarNovedades() {
  let lista = [];
  try {
    lista = await (await fetch('novedades.json')).json();
  } catch (e) {
    aviso('No se han podido cargar las novedades');
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
        crear('p', '', n.usuario)
      )
    )
  );
  abrirVentana('Novedades', caja, [['Cerrar', cerrarVentana]], $('#ver button'));
}
// Versión al pie de la página: la de package.json (1.4.0) y, entre paréntesis, el número interno ?v=
// que sube herramientas/version.js en cada cambio (el que hace que el móvil baje los archivos nuevos).
// Al pulsarla salen las novedades de cada versión (novedades.json, el párrafo para el usuario).
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
          if (w.state == 'activated') aviso('Listo: ya puedes usar el mapa sin conexión');
        });
    })
    .catch(e => console.warn('Sin modo sin conexión:', e));
}

// La primera vez, la bienvenida (bienvenida.js), cuando ya se ha pintado el mapa
if (tocaBienvenida()) setTimeout(() => mostrarBienvenida(), 300);
