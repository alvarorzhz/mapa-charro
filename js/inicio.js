// Arranque
vb();
upd();
aplicarEnlace();
cloudInit();
// Sin conexión: solo en la web (dentro de Claude la app va en un marco y no hace falta)
if ('serviceWorker' in navigator && !FRAMED && (location.protocol == 'https:' || location.hostname == 'localhost')) {
  const primeraVez = !navigator.serviceWorker.controller;
  navigator.serviceWorker.register('sw.js').then(reg => {
    const w = reg.installing;
    if (w && primeraVez) w.addEventListener('statechange', () => { if (w.state == 'activated') toast('Listo: ya puedes usar el mapa sin conexión') });
  }).catch(e => console.warn('Sin modo sin conexión:', e));
}
