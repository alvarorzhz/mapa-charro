// Service worker: deja la app guardada en el móvil para que funcione sin conexión.
// No edites VERSION ni ARCHIVOS a mano: los actualiza `node herramientas/version.js`.
const VERSION = 233;
const CACHE = 'mapa-charro-v' + VERSION;
// <archivos>
const ARCHIVOS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'novedades.json?v=d9343bfd23',
  'icons/icon-180.png',
  'icons/icon-192.png',
  'fuentes/alfa-slab-one.woff2',
  'fuentes/lora.woff2',
  'css/estilos.css?v=fbcbf008f0',
  'js/util.js?v=e5c86be39e',
  'js/medicion.js?v=4da82b4f68',
  'js/datos-globales.js?v=23fd9d852e',
  'js/estado.js?v=baac35a8c8',
  'js/guardado.js?v=f0f4e4ca28',
  'js/mapa.js?v=ff092c1482',
  'js/mapa-fondo.js?v=51114c85cb',
  'js/mapa-vias.js?v=6f2a08cfa1',
  'js/mapa-vista.js?v=10940ddde5',
  'js/ficha.js?v=dfbc28b573',
  'js/monumentos.js?v=313ae5b061',
  'js/ruta.js?v=12031d18b8',
  'js/ruta-provincia.js?v=44c50f3087',
  'js/logros.js?v=f19e745de6',
  'js/palabras.js?v=aaf06869cb',
  'js/vistas.js?v=25de770b92',
  'js/ubicacion.js?v=f7ee88537d',
  'js/mapa-real.js?v=9a9d591a02',
  'js/provincia.js?v=a1cfa7d1c5',
  'js/pueblos.js?v=285aa0bb22',
  'js/perfil.js?v=9311ccb1ef',
  'js/imagen.js?v=535085a37f',
  'js/explorar.js?v=2dab22c584',
  'js/cultura.js?v=abb5f36015',
  'js/agenda.js?v=fd791db272',
  'js/detalles.js?v=a773f7a301',
  'js/hora-dorada.js?v=173974d03d',
  'js/copia.js?v=a03a0ca579',
  'js/hoy.js?v=8b2ea9e239',
  'js/mi-salamanca-calculos.js?v=d81423862b',
  'js/mi-salamanca-piezas.js?v=3fb6b7f883',
  'js/mi-salamanca.js?v=c155f2b9f6',
  'js/juego.js?v=2416129615',
  'js/mapa-teclado.js?v=f81b0634d9',
  'js/escritorio.js?v=4275af6af1',
  'js/bienvenida.js?v=0d15c4607f',
  'js/paseo.js?v=e31bc92df0',
  'js/tiempo.js?v=0c1b14c5bd',
  'js/desaparecida.js?v=aafba75e56',
  'js/buscador.js?v=208e29d964',
  'js/enlaces.js?v=72a75b7c5b',
  'js/cuenta.js?v=bc6ea470b9',
  'js/inicio.js?v=e67f46647e',
  'js/avisar.js?v=45bc2af670',
  'js/datos/zonas.js?v=93312c76ad',
  'js/datos/monumentos.js?v=685b27a0c9',
  'js/datos/rutas-provincia.js?v=35e5630e8b',
  'js/datos/tramos-provincia.js?v=6362361a74',
  'js/datos/rutas.js?v=809a14cd59',
  'js/datos/tramos.js?v=7743d34b2b',
  'js/datos/habitantes.js?v=784dd5e707',
  'js/datos/pueblos.js?v=0a29658abf',
  'js/datos/cultura.js?v=d468671a05',
  'js/datos/detalles.js?v=2570fdde20',
  'js/datos/fachadas.js?v=57a82798d6',
  'js/datos/orientacion-fachadas.js?v=1924a819a6',
  'js/datos/desaparecida.js?v=70d1d65043',
  'js/datos/contenido.js?v=a7bcc72793',
  'js/datos/geometria.js?v=049169f6eb',
  'js/datos/alfoz.js?v=e86a83f1e9',
  'js/datos/tiempo.js?v=54f5f3632b',
  'js/datos/carreteras.js?v=909cad59ab',
  'js/datos/parques.js?v=e6e84b7308',
  'js/datos/carreteras-provincia.js?v=887eb19856',
  'js/datos/provincia.js?v=92d7bcff39',
  'js/datos/firebase.js?v=dace485241',
  'js/datos/palabras.js?v=507b85b1cf',
  'icons/icon-512.png',
  'icons/icono.svg',
  'img/alambres.jpg?v=5e728cfaae',
  'img/alamedilla.jpg?v=40af6eb718',
  'img/aldeatejada.jpg?v=88f3f48d53',
  'img/arrabal.jpg?v=cf9752f0de',
  'img/blanco.jpg?v=5359ec7030',
  'img/cabrerizos.jpg?v=ed1550efaa',
  'img/carbajosa.jpg?v=765c6442ec',
  'img/carmelitas.jpg?v=f7525f9b1f',
  'img/carmen.jpg?v=8950818544',
  'img/carrascal.jpg?v=7fdd5d1548',
  'img/castmoriscos.jpg?v=5ad3bd34ad',
  'img/castvilliquera.jpg?v=f94feb2e58',
  'img/centro.jpg?v=4acb1a4caa',
  'img/chamberi.jpg?v=eb7bfd82aa',
  'img/chinchibarra.jpg?v=43afd68810',
  'img/ciudadjardin.jpg?v=36c63730f2',
  'img/cultura-beatriz-galindo.jpg?v=3d0d5e01d7',
  'img/cultura-cancioneros-salmantinos.jpg?v=e47280c5a6',
  'img/cultura-carnaval-del-toro.jpg?v=e31e4faae0',
  'img/cultura-celestina.jpg?v=103d29caad',
  'img/cultura-charrada.jpg?v=eaacaca969',
  'img/cultura-corpus-bejar.jpg?v=6a99591224',
  'img/cultura-farinato.jpg?v=06d48b04ca',
  'img/cultura-filigrana.jpg?v=c5217e9003',
  'img/cultura-francisco-maldonado.jpg?v=deb81c9848',
  'img/cultura-francisco-salinas.jpg?v=1d051e57f3',
  'img/cultura-fray-luis-de-leon.jpg?v=49ad974e93',
  'img/cultura-gabriel-y-galan.jpg?v=65b23fb509',
  'img/cultura-gaita-y-tamboril.jpg?v=8ba26c161a',
  'img/cultura-hornazo.jpg?v=83aded2466',
  'img/cultura-jamon-guijuelo.jpg?v=6164bd7586',
  'img/cultura-juan-del-encina.jpg?v=82f9800bf4',
  'img/cultura-julian-sanchez.jpg?v=385b431dae',
  'img/cultura-la-alberca.jpg?v=97575b0be7',
  'img/cultura-lazarillo.jpg?v=2a54063606',
  'img/cultura-lenteja-armuna.jpg?v=7db2ab3bab',
  'img/cultura-lunes-de-aguas.jpg?v=f385ea7fd6',
  'img/cultura-martin-gaite.jpg?v=b55fa2d2ef',
  'img/cultura-mayalde.jpg?v=faade8d489',
  'img/cultura-nebrija.jpg?v=9531106db6',
  'img/cultura-penaparda.jpg?v=6e3d05abf5',
  'img/cultura-rafael-farina.jpg?v=59002258fc',
  'img/cultura-santa-teresa.jpg?v=1cb7bc22d2',
  'img/cultura-semana-santa.jpg?v=113be473db',
  'img/cultura-tomas-breton.jpg?v=99715b4e10',
  'img/cultura-torres-villarroel.jpg?v=c72ffff35e',
  'img/cultura-unamuno.jpg?v=9ac751912b',
  'img/delicias.jpg?v=9f09d4f684',
  'img/detalle-astronauta.jpg?v=48fa2bc80e',
  'img/detalle-dragon-helado.jpg?v=22565d52e6',
  'img/detalle-rana.jpg?v=3cec5ad977',
  'img/doninos.jpg?v=57f4d74549',
  'img/estacion.jpg?v=3059b17c44',
  'img/fontana.jpg?v=af8ad0f243',
  'img/garridonorte.jpg?v=b6baa5202a',
  'img/garridosur.jpg?v=b06f2ad6f7',
  'img/glorieta.jpg?v=6a0e23c7f3',
  'img/hospitales.jpg?v=ddfd66f426',
  'img/labradores.jpg?v=e4cb8f6449',
  'img/mon-anaya.jpg?v=13b0d9c040',
  'img/mon-calatrava.jpg?v=925a39ae94',
  'img/mon-casalis.jpg?v=b09ded5a4d',
  'img/mon-catedrales.jpg?v=d7cb7f341b',
  'img/mon-cementerio.jpg?v=b509d45165',
  'img/mon-clavero.jpg?v=c69dad2a85',
  'img/mon-clerecia.jpg?v=2c1de36c61',
  'img/mon-conchas.jpg?v=d01a3baaa0',
  'img/mon-cueva.jpg?v=3300d75174',
  'img/mon-duenas.jpg?v=2f69974f32',
  'img/mon-eltormes.jpg?v=7d1dc9e318',
  'img/mon-estacionbus.jpg?v=b714c7ab0c',
  'img/mon-estaciontren.jpg?v=2b7aa3f507',
  'img/mon-estevan.jpg?v=7aa811ea9c',
  'img/mon-helmantico.jpg?v=78031ddf44',
  'img/mon-huerto.jpg?v=c3655b9620',
  'img/mon-mercado.jpg?v=935d839b88',
  'img/mon-monterrey.jpg?v=ae83208343',
  'img/mon-muertes.jpg?v=e8893ff2ed',
  'img/mon-salina.jpg?v=fcce76f8d3',
  'img/mon-sanmarcos.jpg?v=e8fb4dd6e4',
  'img/montalvos.jpg?v=41b6927908',
  'img/moriscos.jpg?v=54ec237043',
  'img/pelabravo.jpg?v=776aa32ba8',
  'img/pizarrales.jpg?v=b8600265c9',
  'img/platina.jpg?v=a47e0a9670',
  'img/prosperidad.jpg?v=291dd16bb4',
  'img/pueblo-arapiles.jpg?v=636754e24d',
  'img/pueblo-babilafuente.jpg?v=6effeef1f4',
  'img/pueblo-cantalapiedra.jpg?v=ad595a6d22',
  'img/pueblo-congosto.jpg?v=93b2834896',
  'img/pueblo-fuentes.jpg?v=e9ca350aa7',
  'img/pueblo-fuentesanesteban.jpg?v=e9ca11303a',
  'img/pueblo-guijuelo.jpg?v=cc7c5ada36',
  'img/pueblo-linares.jpg?v=33de1eef61',
  'img/pueblo-lumbrales.jpg?v=c1de6970df',
  'img/pueblo-macotera.jpg?v=53c1f4a576',
  'img/pueblo-monleon.jpg?v=021f3d45cb',
  'img/pueblo-montemayor.jpg?v=4530c46d08',
  'img/pueblo-penaranda.jpg?v=2b64bdd82b',
  'img/pueblo-perena.jpg?v=25cb49b6f3',
  'img/pueblo-sequeros.jpg?v=4f2e25e796',
  'img/pueblo-sotoserrano.jpg?v=3a28eac994',
  'img/pueblo-tamames.jpg?v=7fb8ef56b8',
  'img/pueblo-terradillos.jpg?v=256dc08a71',
  'img/pueblo-villaryegua.jpg?v=08eeae096d',
  'img/pueblo-villoria.jpg?v=7545d1e0ef',
  'img/pueblo-vitigudino.jpg?v=0daca4ea5c',
  'img/puenteladrillo.jpg?v=2e7df6ee1d',
  'img/rollo.jpg?v=6466212304',
  'img/ruta-bejar.jpg?v=c5a1b92f56',
  'img/ruta-bodega-corporario.jpg?v=cfd4dd1691',
  'img/ruta-cabeza-framontanos.jpg?v=7a3bceab04',
  'img/ruta-candelario.jpg?v=aab8582562',
  'img/ruta-convento-carmelitas.jpg?v=3851b1cce9',
  'img/ruta-crcastillo.jpg?v=6597304868',
  'img/ruta-crcatedral.jpg?v=7c48fbe1ee',
  'img/ruta-crmuralla.jpg?v=8cc0d61af4',
  'img/ruta-crplaza.jpg?v=b2de761d92',
  'img/ruta-fortaleza-ledesma.jpg?v=846c12b282',
  'img/ruta-hinojosa-cristo.jpg?v=036b385ef2',
  'img/ruta-la-alberca.jpg?v=efe14328a1',
  'img/ruta-ledrada.jpg?v=742fa1d9d9',
  'img/ruta-mercadocentral.jpg?v=660ab7b5a0',
  'img/ruta-mirador-code.jpg?v=0f13a99986',
  'img/ruta-mirador-fraile.jpg?v=ae294daf6f',
  'img/ruta-miranda-castanar.jpg?v=f02bc71343',
  'img/ruta-mogarraz.jpg?v=1fea8ec97a',
  'img/ruta-pena-francia.jpg?v=7502e3c761',
  'img/ruta-picon-felipe.jpg?v=c5d86d4ec0',
  'img/ruta-picon-moro.jpg?v=ff9bfdcf19',
  'img/ruta-pozo-humos.jpg?v=2c48d0e94d',
  'img/ruta-presa-almendra.jpg?v=3839e39d60',
  'img/ruta-puente-alba.jpg?v=2369e88073',
  'img/ruta-puente-ledesma.jpg?v=921ea8211f',
  'img/ruta-san-martin-castanar.jpg?v=beb350c926',
  'img/ruta-sanfelices.jpg?v=b64241f547',
  'img/ruta-santa-maria-ledesma.jpg?v=e57b9fa3ad',
  'img/ruta-santiago-alfareria.jpg?v=ef1a13ca77',
  'img/ruta-torre-armeria.jpg?v=20c78254ee',
  'img/ruta-trabanca.jpg?v=b876466f74',
  'img/ruta-vega-terron.jpg?v=645c5a18df',
  'img/ruta-vilvestre-castillo.jpg?v=e32558d593',
  'img/salasbajas.jpg?v=07e3a8cc8f',
  'img/salesas.jpg?v=e7ed6026cc',
  'img/sanbernardo.jpg?v=dd1147bee4',
  'img/sancristobal.jpg?v=fc59a32174',
  'img/sancti.jpg?v=7d93e5b5a7',
  'img/sanesteban.jpg?v=bc9767f303',
  'img/sanisidro.jpg?v=af31a99aec',
  'img/sanjose.jpg?v=72f0f4044d',
  'img/sanjuan.jpg?v=2485e8da3f',
  'img/santamarta.jpg?v=554834b8e4',
  'img/santotomas.jpg?v=3d1ba50840',
  'img/sanvicente.jpg?v=2a9706e5bb',
  'img/tejares.jpg?v=5ec0baf2e7',
  'img/tenerias.jpg?v=7f55b3c4e2',
  'img/teso.jpg?v=22b8bf8d75',
  'img/tormes.jpg?v=d9de60aa1f',
  'img/univ.jpg?v=5dca0a9274',
  'img/ursulas.jpg?v=50fce91f82',
  'img/villamayor.jpg?v=bc76ab418f',
  'img/villares.jpg?v=a636b332cd',
  'img/vistahermosa.jpg?v=d583ebc05a',
  'img/zurguen.jpg?v=adbe285850'
];
// </archivos>
const ESPERA_RED = 4000; // ms que se espera a la red antes de tirar de la copia guardada

// Lo que lleva ?v= (la huella de su contenido) y ya estaba guardado de la versión anterior es igual: se copia
// de allí en vez de bajarlo otra vez. Lo demás (index.html, iconos, manifest) se baja siempre
const copiaAnterior = async archivo => {
  if (!archivo.includes('?v=')) return null;
  for (const k of await caches.keys())
    if (k.startsWith('mapa-charro-') && k != CACHE) {
      const r = await (await caches.open(k)).match(archivo);
      if (r) return r;
    }
  return null;
};
self.addEventListener('install', e => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then(c =>
        Promise.all(
          ARCHIVOS.map(async a => {
            const guardada = await copiaAnterior(a);
            if (guardada) return c.put(a, guardada);
            const res = await fetch(a, { cache: 'no-cache' });
            if (!res.ok) throw new Error('No se pudo guardar ' + a);
            return c.put(a, res);
          })
        )
      )
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

// Solo se guardan respuestas buenas de esta web (nunca de otras ni redirecciones)
const guardar = (req, res) => {
  if (res && res.ok && res.type == 'basic' && !res.redirected) {
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

  // Las grabaciones (audio/) van siempre por la red: pesan, se piden a trozos (Range) y no hacen falta sin conexión
  if (url.origin == location.origin && /\/audio\//.test(url.pathname)) return;

  // Archivos de la app (llevan ?v= con la huella de su contenido, así que si cambian son otra dirección).
  // Las fotos se piden sin ?v= y se guardan con él (herramientas/version.js): se buscan sin mirarlo
  if (url.origin == location.origin) {
    const opciones = /\/img\//.test(url.pathname) ? { ignoreSearch: true } : undefined;
    e.respondWith(
      caches
        .open(CACHE)
        .then(c => c.match(req, opciones))
        .then(guardada => guardada || fetch(req).then(res => guardar(req, res)))
    );
  }
});
