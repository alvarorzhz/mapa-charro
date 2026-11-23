// Mapa en 3D de la provincia (botón «3D» del minimapa de Provincia): el relieve de verdad, con los pueblos
// coloreados según «He estado» / «Quiero ir» encima, y vuelos preparados (VUELOS_3D). Usa MapLibre
// (cargarMapLibre, mapa-real.js) y las teselas de relieve de la propia web (relieve/, RELIEVE), que se
// piden solo al abrirlo: el mapa normal y la primera visita no bajan nada de esto. Calles, ríos y nombres
// de OpenFreeMap. Dentro de Claude no hay botón (EN_MARCO): el visor no deja pedir mapas a otras webs.

const mapa3d = { capa: null, mapa: null, info: null, seleccionado: null, volverA: null };
const DUREZA_RELIEVE = 1.6; // el relieve se exagera un poco: la meseta es casi llana a esta escala

// Colores y estado de cada municipio para pintarlos encima del relieve (mismo criterio que el minimapa)
function municipiosEnGeojson() {
  const capitalPisada = zonas.some(z => z.g < 5 && estadoApp.progreso.z[z.id] == 'v');
  return {
    type: 'FeatureCollection',
    features: PROVINCIA.m.map((m, i) => ({
      type: 'Feature',
      id: i,
      properties: { i, n: m.n, marca: marcaDeMunicipio(m, capitalPisada) },
      geometry: {
        type: 'MultiPolygon',
        // [lat, lon] → [lon, lat]; cada anillo, cerrado
        coordinates: m.R.map(r => [[...r, r[0]].map(([la, lo]) => [lo, la])])
      }
    }))
  };
}

function estiloMapa3d() {
  const css = getComputedStyle(document.documentElement),
    color = v => css.getPropertyValue(v).trim(),
    relieve = {
      type: 'raster-dem',
      tiles: [new URL('relieve/', document.baseURI).href + '{z}/{x}/{y}.png'],
      encoding: 'terrarium',
      tileSize: RELIEVE.tam,
      minzoom: RELIEVE.zoomMin,
      maxzoom: RELIEVE.zoomMax,
      bounds: RELIEVE.limites
    },
    clase = lista => ['in', ['get', 'class'], ['literal', lista]];
  return {
    version: 8,
    glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
    sources: {
      osm: { type: 'vector', url: 'https://tiles.openfreemap.org/planet' },
      relieve,
      sombras: { ...relieve },
      municipios: { type: 'geojson', data: municipiosEnGeojson() }
    },
    terrain: { source: 'relieve', exaggeration: DUREZA_RELIEVE },
    sky: {
      'sky-color': color('--tarjeta'),
      'horizon-color': color('--campo'),
      'fog-color': color('--campo'),
      'sky-horizon-blend': 0.6,
      'horizon-fog-blend': 0.6,
      'fog-ground-blend': 0.4
    },
    layers: [
      { id: 'campo', type: 'background', paint: { 'background-color': color('--campo') } },
      {
        id: 'municipios',
        type: 'fill',
        source: 'municipios',
        paint: {
          'fill-color': [
            'match',
            ['get', 'marca'],
            'v',
            color('--vitor'),
            'pv',
            color('--vitor'),
            'w',
            color('--ronda'),
            color('--zona-1')
          ],
          'fill-opacity': ['match', ['get', 'marca'], 'v', 0.6, 'w', 0.55, 'pv', 0.3, 0.25]
        }
      },
      {
        id: 'sombras',
        type: 'hillshade',
        source: 'sombras',
        paint: {
          'hillshade-shadow-color': color('--tinta'),
          'hillshade-highlight-color': color('--tarjeta'),
          'hillshade-accent-color': color('--linea'),
          'hillshade-exaggeration': 0.55
        }
      },
      {
        id: 'ciudad',
        type: 'fill',
        source: 'osm',
        'source-layer': 'landuse',
        filter: clase(['residential', 'commercial', 'industrial', 'retail']),
        paint: { 'fill-color': color('--zona-3'), 'fill-opacity': 0.7 }
      },
      {
        id: 'casas',
        type: 'fill',
        source: 'osm',
        'source-layer': 'building',
        minzoom: 13,
        paint: { 'fill-color': color('--zona-4'), 'fill-opacity': 0.9 }
      },
      {
        id: 'agua',
        type: 'fill',
        source: 'osm',
        'source-layer': 'water',
        paint: { 'fill-color': color('--rio') }
      },
      {
        id: 'rios',
        type: 'line',
        source: 'osm',
        'source-layer': 'waterway',
        filter: clase(['river']),
        paint: { 'line-color': color('--rio'), 'line-width': 1.4 }
      },
      {
        id: 'carreteras',
        type: 'line',
        source: 'osm',
        'source-layer': 'transportation',
        filter: clase(['motorway', 'trunk', 'primary']),
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': color('--linea'),
          'line-width': ['interpolate', ['linear'], ['zoom'], 8, 0.5, 13, 2.5],
          'line-opacity': 0.55
        }
      },
      {
        id: 'lindes',
        type: 'line',
        source: 'municipios',
        paint: {
          'line-color': color('--linea'),
          'line-width': ['interpolate', ['linear'], ['zoom'], 8, 0.3, 12, 1.2],
          'line-opacity': 0.6
        }
      },
      {
        id: 'seleccion',
        type: 'line',
        source: 'municipios',
        filter: ['==', ['get', 'i'], -1],
        paint: { 'line-color': color('--tinta'), 'line-width': 3 }
      },
      {
        id: 'nombres',
        type: 'symbol',
        source: 'osm',
        'source-layer': 'place',
        filter: clase(['city', 'town', 'village']),
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Noto Sans Regular'],
          'text-size': ['match', ['get', 'class'], 'city', 15, 'town', 12, 11],
          'symbol-sort-key': ['match', ['get', 'class'], 'city', 0, 'town', 1, 2]
        },
        paint: {
          'text-color': color('--tinta'),
          'text-halo-color': color('--tarjeta'),
          'text-halo-width': 1.4
        }
      },
      {
        id: 'picos',
        type: 'symbol',
        source: 'osm',
        'source-layer': 'mountain_peak',
        minzoom: 10,
        layout: {
          'text-field': ['concat', '▲ ', ['get', 'name']],
          'text-font': ['Noto Sans Italic'],
          'text-size': 11,
          'text-offset': [0, -0.8]
        },
        paint: {
          'text-color': color('--linea'),
          'text-halo-color': color('--tarjeta'),
          'text-halo-width': 1.2
        }
      }
    ]
  };
}

// Vista de toda la provincia, inclinada
const encuadreProvincia3d = () => ({
  bounds: [
    [RELIEVE.limites[0], RELIEVE.limites[1]],
    [RELIEVE.limites[2], RELIEVE.limites[3]]
  ],
  pitch: 50,
  bearing: 0
});

function volar3d(v) {
  const m = mapa3d.mapa;
  if (!m) return;
  if (!v) {
    const { bounds, pitch, bearing } = encuadreProvincia3d();
    m.fitBounds(bounds, { pitch, bearing, padding: 10, duration: comoDesplazar() == 'smooth' ? 2500 : 0 });
    return;
  }
  m.flyTo({
    center: [v.lo, v.la],
    zoom: v.zoom,
    pitch: v.pitch,
    bearing: v.rumbo,
    duration: comoDesplazar() == 'smooth' ? 5000 : 0,
    essential: false
  });
}

// MapLibre no recalcula la altura del centro cuando llega el relieve después de moverse (se queda apuntando
// al nivel del mar y la cumbre sale por arriba): se ajusta poco a poco (easeTo no mueve la altura)
function ajustarAltura3d() {
  const m = mapa3d.mapa,
    h = m && m.queryTerrainElevation(m.getCenter());
  if (h == null || mapa3d.subiendo || Math.abs(h - m.getCenterElevation()) < 20) return;
  const desde = m.getCenterElevation(),
    inicio = performance.now(),
    duracion = comoDesplazar() == 'smooth' ? 500 : 0;
  mapa3d.subiendo = true;
  const paso = ahora => {
    const t = duracion ? Math.min(1, (ahora - inicio) / duracion) : 1;
    if (mapa3d.mapa != m || m.isMoving()) return (mapa3d.subiendo = false); // la persona ya lo mueve
    m.jumpTo({ elevation: desde + (h - desde) * (1 - (1 - t) ** 3) });
    if (t < 1) requestAnimationFrame(paso);
    else mapa3d.subiendo = false;
  };
  requestAnimationFrame(paso);
}

// La barra de abajo con el municipio pulsado: nombre y botones He estado / Quiero ir
function mostrarMunicipio3d(m) {
  mapa3d.seleccionado = m;
  if (mapa3d.mapa) mapa3d.mapa.setFilter('seleccion', ['==', ['get', 'i'], m ? PROVINCIA.m.indexOf(m) : -1]);
  const info = mapa3d.info;
  info.textContent = '';
  if (!m) {
    info.appendChild(crear('span', 'mu', 'Pulsa un pueblo para marcarlo.'));
    return;
  }
  const botones = m.cap ? null : botonesMunicipio(m);
  info.append(crear('strong', '', m.n), crear('small', 'mu', PROVINCIA.com[m.c]));
  if (botones) {
    info.appendChild(botones);
    pintarBotonesMarcar(botones);
  }
}

// Cuando cambia el progreso (marcar desde el 3D o desde otro sitio), los colores del relieve también
function repintarMapa3d() {
  const m = mapa3d.mapa;
  if (!m || !mapa3d.capa || mapa3d.capa.hidden) return;
  const fuente = m.getSource('municipios');
  if (fuente) fuente.setData(municipiosEnGeojson());
  const botones = mapa3d.info && mapa3d.info.querySelector('.qb');
  if (botones) pintarBotonesMarcar(botones);
}

function cerrarMapa3d() {
  if (!mapa3d.capa || mapa3d.capa.hidden) return;
  mapa3d.capa.hidden = true;
  document.documentElement.classList.remove('con-ventana');
  // Se suelta el mapa: en el iPhone, un mapa 3D escondido sigue gastando memoria
  if (mapa3d.mapa) mapa3d.mapa.remove();
  mapa3d.mapa = null;
  if (mapa3d.volverA && mapa3d.volverA.isConnected) mapa3d.volverA.focus({ preventScroll: true });
}

function construirCapa3d() {
  const cerrar = crear('button', 'cerrar', '×');
  cerrar.setAttribute('aria-label', 'Cerrar el mapa en 3D');
  cerrar.onclick = cerrarMapa3d;
  const titulo = crear('h2', '', 'La provincia en 3D');
  titulo.id = 't3d';
  const lienzo = crear('div', 'm3d-mapa');
  lienzo.setAttribute('aria-hidden', 'true'); // el mapa es para mirar; lo mismo está en la lista de Provincia
  const vuelos = crear(
    'div',
    'm3d-vuelos',
    ...VUELOS_3D.map(v => {
      const b = crear('button', '', v.n);
      b.title = v.texto;
      b.onclick = () => volar3d(v);
      return b;
    })
  );
  const todo = crear('button', '', '⌂ Toda la provincia');
  todo.onclick = () => volar3d(null);
  vuelos.appendChild(todo);
  mapa3d.info = crear('div', 'm3d-info');
  mapa3d.info.setAttribute('aria-live', 'polite');
  const leyenda = crear(
    'div',
    'm3d-leyenda',
    crear('span', 'v', 'He estado'),
    crear('span', 'w', 'Quiero ir'),
    crear('span', 'cargando', 'Cargando el relieve…')
  );
  const enlace = (texto, href) =>
    Object.assign(crear('a', '', texto), { href, target: '_blank', rel: 'noopener' });
  const credito = crear(
    'p',
    'm3d-credito',
    'Relieve: ',
    enlace('MDT25 © Instituto Geográfico Nacional', 'https://www.ign.es'),
    ' (Portugal: ',
    enlace('Terrain Tiles', 'https://registry.opendata.aws/terrain-tiles/'),
    ') · ',
    enlace('OpenFreeMap', 'https://openfreemap.org'),
    ' © ',
    enlace('OpenStreetMap', 'https://www.openstreetmap.org/copyright')
  );
  const caja = crear(
    'div',
    'm3d-caja',
    crear('div', 'm3d-cab', titulo, cerrar),
    lienzo,
    vuelos,
    mapa3d.info,
    leyenda,
    credito
  );
  caja.setAttribute('role', 'dialog');
  caja.setAttribute('aria-modal', 'true');
  caja.setAttribute('aria-labelledby', 't3d');
  mapa3d.capa = crear('div', 'm3d', caja);
  mapa3d.capa.hidden = true;
  mapa3d.capa.addEventListener('keydown', e => {
    if (e.key == 'Escape') cerrarMapa3d();
  });
  document.body.appendChild(mapa3d.capa);
  mapa3d.lienzo = lienzo;
}

async function abrirMapa3d(boton = document.activeElement) {
  if (!mapa3d.capa) construirCapa3d();
  mapa3d.volverA = boton;
  mapa3d.capa.hidden = false;
  mapa3d.capa.classList.add('cargando');
  document.documentElement.classList.add('con-ventana');
  mapa3d.capa.querySelector('.cerrar').focus({ preventScroll: true });
  mostrarMunicipio3d(null);
  try {
    await cargarMapLibre();
  } catch (e) {
    cerrarMapa3d();
    aviso('No se ha podido cargar el mapa en 3D. Comprueba la conexión y vuelve a probar.', {
      tipo: 'error'
    });
    return;
  }
  if (mapa3d.capa.hidden || mapa3d.mapa) return;
  const { bounds, pitch, bearing } = encuadreProvincia3d(),
    m = new window.maplibregl.Map({
      container: mapa3d.lienzo,
      style: estiloMapa3d(),
      bounds,
      fitBoundsOptions: { padding: 10 },
      pitch,
      bearing,
      minZoom: RELIEVE.zoomMin,
      maxZoom: 15,
      maxPitch: 75,
      maxBounds: [
        [RELIEVE.limites[0] - 0.3, RELIEVE.limites[1] - 0.3],
        [RELIEVE.limites[2] + 0.3, RELIEVE.limites[3] + 0.3]
      ],
      attributionControl: false,
      fadeDuration: 0,
      // En pantallas muy densas (iPhone), menos píxeles: va más fluido y gasta menos batería
      pixelRatio: Math.min(window.devicePixelRatio || 1, 2)
    });
  mapa3d.mapa = m;
  // Con la cámara quieta, cada vez que llega relieve: la altura del centro, bien puesta, y fuera el «Cargando»
  // cuando ya están las sombras a la vista
  const alLlegarRelieve = () => {
    if (mapa3d.mapa != m || m.isMoving()) return;
    ajustarAltura3d();
    try {
      if (m.isSourceLoaded('sombras')) mapa3d.capa.classList.remove('cargando');
    } catch (e) {
      // el estilo aún no está
    }
  };
  m.on('moveend', alLlegarRelieve);
  m.on('sourcedata', e => (e.sourceId == 'relieve' || e.sourceId == 'sombras') && alLlegarRelieve());
  m.on('idle', () => mapa3d.capa.classList.remove('cargando'));
  m.on('click', 'municipios', e => {
    const f = e.features && e.features[0];
    if (f) mostrarMunicipio3d(PROVINCIA.m[f.properties.i]);
  });
}

// Botón «3D» para el minimapa de Provincia (provincia.js lo pone si se puede: fuera de Claude)
function botonMapa3d() {
  if (EN_MARCO) return null;
  const b = crear('button', 'b3d', '3D');
  b.setAttribute('aria-label', 'Ver la provincia en 3D');
  b.title = 'Ver la provincia en 3D';
  b.onclick = () => abrirMapa3d(b);
  return b;
}
