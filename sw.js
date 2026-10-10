// Service worker: deja la app guardada en el móvil para que funcione sin conexión.
// No edites VERSION ni ARCHIVOS a mano: los actualiza `node herramientas/version.js`.
const VERSION = 109;
const CACHE = 'mapa-charro-v' + VERSION;
// <archivos>
const ARCHIVOS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'novedades.json?v=109',
  'icons/icon-180.png',
  'icons/icon-192.png',
  'css/estilos.css?v=109',
  'js/util.js?v=109',
  'js/datos/zonas.js?v=109',
  'js/datos/monumentos.js?v=109',
  'js/datos/rutas-provincia.js?v=109',
  'js/datos/tramos-provincia.js?v=109',
  'js/datos/rutas.js?v=109',
  'js/datos/tramos.js?v=109',
  'js/datos/pueblos.js?v=109',
  'js/datos/contenido.js?v=109',
  'js/datos/geometria.js?v=109',
  'js/datos/alfoz.js?v=109',
  'js/datos/tiempo.js?v=109',
  'js/datos/carreteras.js?v=109',
  'js/datos/carreteras-provincia.js?v=109',
  'js/datos/provincia.js?v=109',
  'js/datos/firebase.js?v=109',
  'js/datos/palabras.js?v=109',
  'js/estado.js?v=109',
  'js/guardado.js?v=109',
  'js/mapa.js?v=109',
  'js/ficha.js?v=109',
  'js/monumentos.js?v=109',
  'js/ruta.js?v=109',
  'js/ruta-provincia.js?v=109',
  'js/logros.js?v=109',
  'js/palabras.js?v=109',
  'js/vistas.js?v=109',
  'js/ubicacion.js?v=109',
  'js/provincia.js?v=109',
  'js/pueblos.js?v=109',
  'js/perfil.js?v=109',
  'js/imagen.js?v=109',
  'js/juego.js?v=109',
  'js/mapa-teclado.js?v=109',
  'js/escritorio.js?v=109',
  'js/bienvenida.js?v=109',
  'js/tiempo.js?v=109',
  'js/buscador.js?v=109',
  'js/enlaces.js?v=109',
  'js/cuenta.js?v=109',
  'js/inicio.js?v=109',
  'icons/icon-512.png',
  'img/alambres.jpg',
  'img/alamedilla.jpg',
  'img/aldeatejada.jpg',
  'img/arrabal.jpg',
  'img/blanco.jpg',
  'img/cabrerizos.jpg',
  'img/carbajosa.jpg',
  'img/carmelitas.jpg',
  'img/carmen.jpg',
  'img/carrascal.jpg',
  'img/castmoriscos.jpg',
  'img/castvilliquera.jpg',
  'img/centro.jpg',
  'img/chinchibarra.jpg',
  'img/delicias.jpg',
  'img/doninos.jpg',
  'img/estacion.jpg',
  'img/fontana.jpg',
  'img/glorieta.jpg',
  'img/hospitales.jpg',
  'img/labradores.jpg',
  'img/montalvos.jpg',
  'img/moriscos.jpg',
  'img/pelabravo.jpg',
  'img/platina.jpg',
  'img/prosperidad.jpg',
  'img/rollo.jpg',
  'img/ruta-bejar.jpg',
  'img/ruta-bodega-corporario.jpg',
  'img/ruta-cabeza-framontanos.jpg',
  'img/ruta-candelario.jpg',
  'img/ruta-convento-carmelitas.jpg',
  'img/ruta-crcastillo.jpg',
  'img/ruta-crcatedral.jpg',
  'img/ruta-crmuralla.jpg',
  'img/ruta-crplaza.jpg',
  'img/ruta-fortaleza-ledesma.jpg',
  'img/ruta-hinojosa-cristo.jpg',
  'img/ruta-la-alberca.jpg',
  'img/ruta-ledrada.jpg',
  'img/ruta-mercadocentral.jpg',
  'img/ruta-mirador-code.jpg',
  'img/ruta-mirador-fraile.jpg',
  'img/ruta-miranda-castanar.jpg',
  'img/ruta-mogarraz.jpg',
  'img/ruta-pena-francia.jpg',
  'img/ruta-picon-felipe.jpg',
  'img/ruta-picon-moro.jpg',
  'img/ruta-pozo-humos.jpg',
  'img/ruta-presa-almendra.jpg',
  'img/ruta-puente-alba.jpg',
  'img/ruta-puente-ledesma.jpg',
  'img/ruta-san-martin-castanar.jpg',
  'img/ruta-sanfelices.jpg',
  'img/ruta-santa-maria-ledesma.jpg',
  'img/ruta-santiago-alfareria.jpg',
  'img/ruta-torre-armeria.jpg',
  'img/ruta-trabanca.jpg',
  'img/ruta-vega-terron.jpg',
  'img/ruta-vilvestre-castillo.jpg',
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
  'img/villares.jpg',
  'img/vistahermosa.jpg'
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
