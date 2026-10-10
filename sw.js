// Service worker: deja la app guardada en el móvil para que funcione sin conexión.
// No edites VERSION ni ARCHIVOS a mano: los actualiza `node herramientas/version.js`.
const VERSION = 127;
const CACHE = 'mapa-charro-v' + VERSION;
// <archivos>
const ARCHIVOS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'novedades.json?v=127',
  'icons/icon-180.png',
  'icons/icon-192.png',
  'css/estilos.css?v=127',
  'js/util.js?v=127',
  'js/datos/zonas.js?v=127',
  'js/datos/monumentos.js?v=127',
  'js/datos/rutas-provincia.js?v=127',
  'js/datos/tramos-provincia.js?v=127',
  'js/datos/rutas.js?v=127',
  'js/datos/tramos.js?v=127',
  'js/datos/habitantes.js?v=127',
  'js/datos/pueblos.js?v=127',
  'js/datos/contenido.js?v=127',
  'js/datos/geometria.js?v=127',
  'js/datos/alfoz.js?v=127',
  'js/datos/tiempo.js?v=127',
  'js/datos/carreteras.js?v=127',
  'js/datos/parques.js?v=127',
  'js/datos/carreteras-provincia.js?v=127',
  'js/datos/provincia.js?v=127',
  'js/datos/firebase.js?v=127',
  'js/datos/palabras.js?v=127',
  'js/estado.js?v=127',
  'js/guardado.js?v=127',
  'js/mapa.js?v=127',
  'js/ficha.js?v=127',
  'js/monumentos.js?v=127',
  'js/ruta.js?v=127',
  'js/ruta-provincia.js?v=127',
  'js/logros.js?v=127',
  'js/palabras.js?v=127',
  'js/vistas.js?v=127',
  'js/ubicacion.js?v=127',
  'js/provincia.js?v=127',
  'js/pueblos.js?v=127',
  'js/perfil.js?v=127',
  'js/imagen.js?v=127',
  'js/juego.js?v=127',
  'js/mapa-teclado.js?v=127',
  'js/escritorio.js?v=127',
  'js/bienvenida.js?v=127',
  'js/tiempo.js?v=127',
  'js/buscador.js?v=127',
  'js/enlaces.js?v=127',
  'js/cuenta.js?v=127',
  'js/inicio.js?v=127',
  'icons/icon-512.png',
  'icons/icono.svg',
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
  'img/chamberi.jpg',
  'img/chinchibarra.jpg',
  'img/ciudadjardin.jpg',
  'img/delicias.jpg',
  'img/doninos.jpg',
  'img/estacion.jpg',
  'img/fontana.jpg',
  'img/garridonorte.jpg',
  'img/garridosur.jpg',
  'img/glorieta.jpg',
  'img/hospitales.jpg',
  'img/labradores.jpg',
  'img/montalvos.jpg',
  'img/moriscos.jpg',
  'img/pelabravo.jpg',
  'img/pizarrales.jpg',
  'img/platina.jpg',
  'img/prosperidad.jpg',
  'img/puenteladrillo.jpg',
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
  'img/salasbajas.jpg',
  'img/salesas.jpg',
  'img/sanbernardo.jpg',
  'img/sancristobal.jpg',
  'img/sancti.jpg',
  'img/sanesteban.jpg',
  'img/sanisidro.jpg',
  'img/sanjose.jpg',
  'img/sanjuan.jpg',
  'img/santamarta.jpg',
  'img/santotomas.jpg',
  'img/sanvicente.jpg',
  'img/tejares.jpg',
  'img/tenerias.jpg',
  'img/teso.jpg',
  'img/tormes.jpg',
  'img/univ.jpg',
  'img/ursulas.jpg',
  'img/villamayor.jpg',
  'img/villares.jpg',
  'img/vistahermosa.jpg',
  'img/zurguen.jpg'
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

  // Las páginas: primero la red (para ver siempre la última versión) y, si no hay, la copia. La app (la
  // raíz o index.html) se guarda como index.html; las demás páginas (privacidad, tarjetas de zona) con su
  // propia dirección, para no servir nunca una en lugar de otra
  if (req.mode == 'navigate') {
    const esLaApp =
      url.origin == location.origin &&
      new URL('./', self.registration.scope).pathname == url.pathname.replace(/index\.html$/, '');
    const copia = esLaApp ? new Request('index.html') : new Request(url.origin + url.pathname);
    e.respondWith(
      conLimite(fetch(req), ESPERA_RED)
        .then(res => guardar(copia, res))
        .catch(() => caches.match(copia).then(guardada => guardada || caches.match('index.html')))
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
