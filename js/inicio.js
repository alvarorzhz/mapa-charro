// Arranque
// Versión al pie de la página: el número ?v= que pone herramientas/version.js en cada cambio
{
  const v = (document.querySelector('script[src*="?v="]') || {}).src;
  $('#ver').textContent = v ? 'Versión ' + v.split('?v=')[1] : '';
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
