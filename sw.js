// Service worker: deja la app guardada en el móvil para que funcione sin conexión.
// No edites VERSION ni ARCHIVOS a mano: los actualiza `node herramientas/version.js`.
const VERSION = 78;
const CACHE = 'mapa-charro-v' + VERSION;
// <archivos>
const ARCHIVOS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'novedades.json?v=78',
  'icons/icon-180.png',
  'icons/icon-192.png',
  'css/estilos.css?v=78',
  'js/util.js?v=78',
  'js/datos/zonas.js?v=78',
  'js/datos/monumentos.js?v=78',
  'js/datos/rutas.js?v=78',
  'js/datos/tramos.js?v=78',
  'js/datos/pueblos.js?v=78',
  'js/datos/contenido.js?v=78',
  'js/datos/geometria.js?v=78',
  'js/datos/alfoz.js?v=78',
  'js/datos/tiempo.js?v=78',
  'js/datos/carreteras.js?v=78',
  'js/datos/provincia.js?v=78',
  'js/datos/firebase.js?v=78',
  'js/estado.js?v=78',
  'js/guardado.js?v=78',
  'js/mapa.js?v=78',
  'js/ficha.js?v=78',
  'js/monumentos.js?v=78',
  'js/ruta.js?v=78',
  'js/logros.js?v=78',
  'js/vistas.js?v=78',
  'js/ubicacion.js?v=78',
  'js/provincia.js?v=78',
  'js/pueblos.js?v=78',
  'js/imagen.js?v=78',
  'js/juego.js?v=78',
  'js/mapa-teclado.js?v=78',
  'js/escritorio.js?v=78',
  'js/bienvenida.js?v=78',
  'js/tiempo.js?v=78',
  'js/buscador.js?v=78',
  'js/enlaces.js?v=78',
  'js/cuenta.js?v=78',
  'js/inicio.js?v=78',
  'icons/icon-512.png',
  'img/alamedilla.jpg',
  'img/aldeatejada.jpg',
  'img/arrabal.jpg',
  'img/cabrerizos.jpg',
  'img/carbajosa.jpg',
  'img/carmelitas.jpg',
  'img/carrascal.jpg',
  'img/castmoriscos.jpg',
  'img/castvilliquera.jpg',
  'img/centro.jpg',
  'img/chinchibarra.jpg',
  'img/delicias.jpg',
  'img/doninos.jpg',
  'img/estacion.jpg',
  'img/glorieta.jpg',
  'img/hospitales.jpg',
  'img/labradores.jpg',
  'img/moriscos.jpg',
  'img/pelabravo.jpg',
  'img/platina.jpg',
  'img/prosperidad.jpg',
  'img/rollo.jpg',
  'img/salesas.jpg',
  'img/sanbernardo.jpg',
  'img/sancristobal.jpg',
  'img/sancti.jpg',
  'img/sanesteban.jpg',
  'img/sanjuan.jpg',
  'img/santamarta.jpg',
  'img/santotomas.jpg',
  'img/sanvicente.jpg',
  'img/tejares.jpg',
  'img/tenerias.jpg',
  'img/univ.jpg',
  'img/ursulas.jpg',
  'img/villamayor.jpg',
  'img/villares.jpg'
];
// </archivos>
const ESPERA_RED = 4000; // ms que se espera a la red antes de tirar de la copia guardada

self.addEventListener('install', e => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then(c => c.addAll(ARCHIVOS))
      .then(() => self.skipWaiting())
  );
});

// Borra las copias de versiones anteriores
self.addEventListener('activate', e => {
  e.waitUntil(
    caches
      .keys()
      .then(ks =>
        Promise.all(ks.filter(k => k.startsWith('mapa-charro-') && k != CACHE).map(k => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

const guardar = (req, res) => {
  if (res && (res.ok || res.type == 'opaque')) {
    const copia = res.clone();
    caches.open(CACHE).then(c => c.put(req, copia));
  }
  return res;
};

const conLimite = (p, ms) =>
  new Promise((ok, mal) => {
    const t = setTimeout(() => mal(new Error('tiempo')), ms);
    p.then(
      r => {
        clearTimeout(t);
        ok(r);
      },
      e => {
        clearTimeout(t);
        mal(e);
      }
    );
  });

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method != 'GET') return;
  const url = new URL(req.url);

  // La página: primero la red (para ver siempre la última versión) y, si no hay, la copia
  if (req.mode == 'navigate') {
    e.respondWith(
      conLimite(fetch(req), ESPERA_RED)
        .then(res => guardar(new Request('index.html'), res))
        .catch(() => caches.match('index.html'))
    );
    return;
  }

  // Tipografías de Google: la copia guardada al momento y se refresca por detrás
  if (/^fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(
      caches.match(req).then(guardada => {
        const red = fetch(req)
          .then(res => guardar(req, res))
          .catch(() => guardada);
        return guardada || red;
      })
    );
    return;
  }

  // Archivos de la app (llevan ?v=N, así que una versión nueva es otra dirección)
  if (url.origin == location.origin) {
    e.respondWith(caches.match(req).then(guardada => guardada || fetch(req).then(res => guardar(req, res))));
  }
});
