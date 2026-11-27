// Mapa en 3D de la provincia y de la capital (botones «3D» del minimapa de Provincia y del mapa de la capital):
// el relieve de verdad, con los pueblos y las zonas de la capital coloreados según «He estado» / «Quiero ir»
// encima, los edificios con su altura (OpenFreeMap), los monumentos rotulados y vuelos preparados
// (VUELOS_3D). Usa MapLibre
// (cargarMapLibre, mapa-real.js) y las teselas de relieve de la propia web (relieve/, RELIEVE), que se
// piden solo al abrirlo: el mapa normal y la primera visita no bajan nada de esto. Calles, ríos y nombres
// de OpenFreeMap. Dentro de Claude no hay botón (EN_MARCO): el visor no deja pedir mapas a otras webs.

const mapa3d = { capa: null, mapa: null, info: null, seleccionado: null, volverA: null, recorrido: 0 };
const DUREZA_RELIEVE = 1.6; // el relieve se exagera un poco: la meseta es casi llana a esta escala
const ZOOM_MONUMENTOS_MENORES = 16; // desde aquí, el nombre de los monumentos que no son de los principales
const MAX_RECORRIDO = 12; // pueblos como mucho en el vuelo «Mis pueblos» (cada uno lleva unos 5 s)
const PAUSA_RECORRIDO = 1800; // ms quieto sobre cada pueblo
const ZOOM_EDIFICIOS = 14; // desde aquí, los edificios con altura (antes serían demasiados para el iPhone)

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

// Zonas de la capital (con su polígono del mapa, pasado a latitud y longitud) y su marca
function zonasEnGeojson() {
  return {
    type: 'FeatureCollection',
    features: zonas
      .filter(z => z.P)
      .map(z => ({
        type: 'Feature',
        properties: { id: z.id, n: z.n, marca: estadoApp.progreso.z[z.id] || '' },
        geometry: {
          type: 'Polygon',
          coordinates: [[...z.P, z.P[0]].map(([x, y]) => desproyectar(x, y).reverse())]
        }
      }))
  };
}

// ed: 1 si tiene su edificio en dorado (EDIFICIOS_MONUMENTOS), que ya lo señala y no necesita punto
const monumentosEnGeojson = () => ({
  type: 'FeatureCollection',
  features: MONUMENTOS.map(m => ({
    type: 'Feature',
    properties: {
      id: m.id,
      n: m.n,
      top: m.top ? 1 : 0,
      ed: EDIFICIOS_MONUMENTOS.some(e => e.m == m.id) ? 1 : 0
    },
    geometry: { type: 'Point', coordinates: [m.lo, m.la] }
  }))
});

// Edificios de los monumentos (EDIFICIOS_MONUMENTOS): cada pieza, con su altura y su monumento
const edificiosMonumentosEnGeojson = () => ({
  type: 'FeatureCollection',
  features: EDIFICIOS_MONUMENTOS.flatMap(e =>
    e.piezas.map(p => ({
      type: 'Feature',
      properties: { id: e.m, h: p.h, b: p.b },
      geometry: { type: 'Polygon', coordinates: p.r }
    }))
  )
});

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
      municipios: { type: 'geojson', data: municipiosEnGeojson() },
      zonas: { type: 'geojson', data: zonasEnGeojson() },
      monumentos: { type: 'geojson', data: monumentosEnGeojson() },
      'edificios-monumentos': { type: 'geojson', data: edificiosMonumentosEnGeojson() }
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
          // De cerca se apagan: en la capital mandan sus zonas
          'fill-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            11,
            ['match', ['get', 'marca'], 'v', 0.6, 'w', 0.55, 'pv', 0.3, 0.25],
            13,
            0.08
          ]
        }
      },
      {
        id: 'zonas',
        type: 'fill',
        source: 'zonas',
        minzoom: 11,
        paint: {
          'fill-color': ['match', ['get', 'marca'], 'v', color('--vitor'), color('--ronda')],
          'fill-opacity': ['match', ['get', 'marca'], 'v', 0.4, 'w', 0.45, 0]
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
        id: 'lindes-zonas',
        type: 'line',
        source: 'zonas',
        minzoom: 12,
        paint: {
          'line-color': color('--linea'),
          'line-width': 1,
          'line-dasharray': [3, 2],
          'line-opacity': 0.7
        }
      },
      // Edificios con su altura (render_height de OpenStreetMap; si no la tienen, una planta y poco), con la
      // misma exageración que el relieve para que no queden aplastados contra él
      {
        id: 'edificios',
        type: 'fill-extrusion',
        source: 'osm',
        'source-layer': 'building',
        minzoom: ZOOM_EDIFICIOS,
        paint: {
          'fill-extrusion-color': color('--zona-4'),
          'fill-extrusion-height': ['*', DUREZA_RELIEVE, ['coalesce', ['get', 'render_height'], 6]],
          'fill-extrusion-base': ['*', DUREZA_RELIEVE, ['coalesce', ['get', 'render_min_height'], 0]],
          'fill-extrusion-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            ZOOM_EDIFICIOS,
            0,
            ZOOM_EDIFICIOS + 0.5,
            0.9
          ],
          'fill-extrusion-vertical-gradient': true
        }
      },
      // Los monumentos, en otro color y un poco más altos y anchos que su edificio de OpenFreeMap, que tapan
      {
        id: 'monumentos-edificios',
        type: 'fill-extrusion',
        source: 'edificios-monumentos',
        minzoom: ZOOM_EDIFICIOS,
        paint: {
          'fill-extrusion-color': color('--oro'),
          'fill-extrusion-height': ['*', DUREZA_RELIEVE, ['+', 0.6, ['get', 'h']]],
          'fill-extrusion-base': ['*', DUREZA_RELIEVE, ['get', 'b']],
          'fill-extrusion-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            ZOOM_EDIFICIOS,
            0,
            ZOOM_EDIFICIOS + 0.5,
            0.95
          ],
          'fill-extrusion-vertical-gradient': true
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
      },
      {
        id: 'monumentos-punto',
        type: 'circle',
        source: 'monumentos',
        minzoom: 12.5,
        // Solo los que no tienen edificio dorado (puentes, plazas, jardines): los otros ya los señala su edificio
        filter: ['==', ['get', 'ed'], 0],
        paint: {
          'circle-color': color('--oro'),
          'circle-radius': ['match', ['get', 'top'], 1, 5, 3.5],
          'circle-stroke-color': color('--tarjeta'),
          'circle-stroke-width': 1.5
        }
      },
      {
        id: 'monumentos',
        type: 'symbol',
        source: 'monumentos',
        minzoom: 12.5,
        // Los principales desde lejos; los demás, solo de cerca (monumentos-menores), para no llenar la ciudad
        filter: ['==', ['get', 'top'], 1],
        layout: {
          'text-field': ['get', 'n'],
          'text-font': ['Noto Sans Regular'],
          'text-size': 13,
          'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
          'text-radial-offset': 0.8,
          'text-max-width': 9
        },
        paint: {
          'text-color': color('--oro-texto'),
          'text-halo-color': color('--tarjeta'),
          'text-halo-width': 1.6
        }
      },
      {
        id: 'monumentos-menores',
        type: 'symbol',
        source: 'monumentos',
        minzoom: ZOOM_MONUMENTOS_MENORES,
        filter: ['==', ['get', 'top'], 0],
        layout: {
          'text-field': ['get', 'n'],
          'text-font': ['Noto Sans Regular'],
          'text-size': 11,
          'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
          'text-radial-offset': 0.8,
          'text-max-width': 9
        },
        paint: {
          'text-color': color('--oro-texto'),
          'text-halo-color': color('--tarjeta'),
          'text-halo-width': 1.6
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
  pararRecorrido3d();
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

// Orden del vuelo «Mis pueblos»: de cada pueblo al más cercano que falta, empezando por el más cercano a
// desde ([lat, lon]). puntos: [{ p: [lat, lon], … }]; la longitud se encoge con la latitud, como en el mapa
function ordenarRecorrido(puntos, desde) {
  const k = Math.cos((desde[0] * Math.PI) / 180),
    d2 = (a, b) => (a[0] - b[0]) ** 2 + ((a[1] - b[1]) * k) ** 2,
    faltan = [...puntos],
    orden = [];
  let aqui = desde;
  while (faltan.length) {
    let mejor = 0;
    faltan.forEach((x, i) => d2(x.p, aqui) < d2(faltan[mejor].p, aqui) && (mejor = i));
    const [siguiente] = faltan.splice(mejor, 1);
    orden.push(siguiente);
    aqui = siguiente.p;
  }
  return orden;
}

const pararRecorrido3d = () => mapa3d.recorrido++;

// Vuelo «Mis pueblos»: de pueblo en pueblo de los marcados (He estado, Quiero ir), desde la capital, y al
// final todos a la vista. Se para si la persona mueve el mapa o pide otro vuelo. Con menos movimiento, solo
// el encuadre final
async function recorrerMisPueblos3d() {
  const m = mapa3d.mapa;
  if (!m) return;
  const vuelta = pararRecorrido3d() + 1,
    sigue = () => mapa3d.mapa == m && mapa3d.recorrido == vuelta,
    capitalPisada = zonas.some(z => z.g < 5 && estadoApp.progreso.z[z.id] == 'v'),
    marcados = PROVINCIA.m
      .filter(x => !x.cap && marcaDeMunicipio(x, capitalPisada))
      .map(x => ({ m: x, p: centroDeMunicipio(x) }));
  if (!marcados.length) {
    mostrarMunicipio3d(null);
    mapa3d.info.textContent = '';
    mapa3d.info.appendChild(
      crear('span', 'mu', 'Marca pueblos con «He estado» o «Quiero ir» y aquí te los enseño volando.')
    );
    return;
  }
  const orden = ordenarRecorrido(marcados, [40.965, -5.664]).slice(0, MAX_RECORRIDO),
    suave = comoDesplazar() == 'smooth';
  if (suave)
    for (const [i, x] of orden.entries()) {
      const llega = new Promise(r => m.once('moveend', r));
      mostrarMunicipio3d(x.m);
      m.flyTo({
        center: [x.p[1], x.p[0]],
        zoom: 12.2,
        pitch: 62,
        bearing: (i * 50) % 360,
        duration: 3500,
        essential: false
      });
      await llega;
      if (!sigue()) return;
      await new Promise(r => setTimeout(r, PAUSA_RECORRIDO));
      if (!sigue()) return;
    }
  const las = marcados.map(x => x.p[0]),
    los = marcados.map(x => x.p[1]);
  m.fitBounds(
    [
      [Math.min(...los) - 0.08, Math.min(...las) - 0.08],
      [Math.max(...los) + 0.08, Math.max(...las) + 0.08]
    ],
    { pitch: 50, bearing: 0, padding: 20, maxZoom: 12, duration: suave ? 3000 : 0 }
  );
  mostrarMunicipio3d(null);
  mapa3d.info.textContent = '';
  mapa3d.info.appendChild(
    crear('span', 'mu', marcados.length + (marcados.length == 1 ? ' pueblo marcado' : ' pueblos marcados'))
  );
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
    info.appendChild(crear('span', 'mu', 'Pulsa un pueblo, una zona o un monumento.'));
    return;
  }
  const botones = m.cap ? null : botonesMunicipio(m);
  info.append(crear('strong', '', m.n), crear('small', 'mu', PROVINCIA.com[m.c]));
  if (botones) {
    info.appendChild(botones);
    pintarBotonesMarcar(botones);
  }
}

// Una zona de la capital pulsada: nombre y botones He estado / Quiero ir
function mostrarZona3d(z) {
  mostrarMunicipio3d(null);
  const info = mapa3d.info,
    botones = crearBotonesMarcar(
      () => estadoApp.progreso.z[z.id],
      marca => {
        marcarZona(z.id, marca);
        actualizarProvincia(); // la capital cuenta en Provincia; desde ahí se repinta el 3D
        repintarMapa3d();
      },
      z.n
    );
  info.textContent = '';
  info.append(crear('strong', '', z.n), crear('small', 'mu', 'Zona de la capital'), botones);
  pintarBotonesMarcar(botones);
}

// Un monumento pulsado: su nombre y un botón para abrir su ficha (cierra el 3D)
function mostrarMonumento3d(mon) {
  mostrarMunicipio3d(null);
  const ficha = crear('button', '', '📖 Ver ficha');
  ficha.onclick = () => {
    cerrarMapa3d();
    abrirMonumento(mon.id);
  };
  mapa3d.info.textContent = '';
  mapa3d.info.append(crear('strong', '', mon.n), crear('small', 'mu', 'Monumento'), ficha);
}

// Cuando cambia el progreso (marcar desde el 3D o desde otro sitio), los colores del relieve también
function repintarMapa3d() {
  const m = mapa3d.mapa;
  if (!m || !mapa3d.capa || mapa3d.capa.hidden) return;
  const municipios = m.getSource('municipios'),
    zonasCapital = m.getSource('zonas');
  if (municipios) municipios.setData(municipiosEnGeojson());
  if (zonasCapital) zonasCapital.setData(zonasEnGeojson());
  const botones = mapa3d.info && mapa3d.info.querySelector('.qb');
  if (botones) pintarBotonesMarcar(botones);
}

function cerrarMapa3d() {
  if (!mapa3d.capa || mapa3d.capa.hidden) return;
  mapa3d.capa.hidden = true;
  pararRecorrido3d();
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
  const titulo = crear('h2');
  titulo.id = 't3d';
  mapa3d.titulo = titulo;
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
  const mios = crear('button', '', '★ Mis pueblos');
  mios.title = 'Un vuelo por los pueblos que has marcado';
  mios.onclick = recorrerMisPueblos3d;
  vuelos.prepend(mios);
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
    crear('span', 'mo', 'Monumento'),
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

// Cámara para abrir la capital donde se está mirando en su mapa (como sincronizarFondoReal, mapa-real.js),
// inclinada y lo bastante cerca para ver los edificios
function camaraCapital3d() {
  const v = vistaMapa,
    [la, lo] = desproyectar(v.x + v.w / 2, v.y + v.h / 2),
    zoom = tamMapa.w ? Math.log2(((tamMapa.w / v.w) * 1850.2 * 360) / 512) : 15;
  return {
    center: [lo, la],
    zoom: Math.min(16.5, Math.max(ZOOM_EDIFICIOS + 0.8, zoom)),
    pitch: 60,
    bearing: 0
  };
}

// donde: 'provincia' (toda la provincia) o 'capital' (lo que se ve del mapa de la capital)
async function abrirMapa3d(boton = document.activeElement, donde = 'provincia') {
  if (!mapa3d.capa) construirCapa3d();
  mapa3d.titulo.textContent = donde == 'capital' ? 'Salamanca en 3D' : 'La provincia en 3D';
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
  const camara =
      donde == 'capital'
        ? camaraCapital3d()
        : { ...encuadreProvincia3d(), fitBoundsOptions: { padding: 10 } },
    m = new window.maplibregl.Map({
      container: mapa3d.lienzo,
      style: estiloMapa3d(),
      ...camara,
      minZoom: RELIEVE.zoomMin,
      maxZoom: 17.5,
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
  // Si la persona mueve el mapa con el dedo o el ratón, el vuelo «Mis pueblos» se para
  m.on('movestart', e => e.originalEvent && pararRecorrido3d());
  m.on('sourcedata', e => (e.sourceId == 'relieve' || e.sourceId == 'sombras') && alLlegarRelieve());
  m.on('idle', () => mapa3d.capa.classList.remove('cargando'));
  // Un toque: lo de más arriba manda (monumento, luego zona de la capital, luego municipio)
  m.on('click', e => {
    const tocado = capa => m.queryRenderedFeatures(e.point, { layers: [capa] })[0],
      mon =
        tocado('monumentos') ||
        tocado('monumentos-menores') ||
        tocado('monumentos-punto') ||
        tocado('monumentos-edificios'),
      zona = !mon && m.getZoom() >= 11 && tocado('zonas'),
      municipio = !mon && !zona && tocado('municipios');
    if (mon) mostrarMonumento3d(MONUMENTOS.find(x => x.id == mon.properties.id));
    else if (zona) mostrarZona3d(zonas.find(z => z.id == zona.properties.id));
    else if (municipio) mostrarMunicipio3d(PROVINCIA.m[municipio.properties.i]);
  });
}

// Botón «3D» para el minimapa de Provincia (provincia.js lo pone si se puede: fuera de Claude) y para el
// mapa de la capital (se pone aquí, debajo de «Estoy aquí»)
function botonMapa3d(donde = 'provincia') {
  if (EN_MARCO) return null;
  const b = crear('button', 'b3d', '3D'),
    texto = donde == 'capital' ? 'Ver la capital en 3D' : 'Ver la provincia en 3D';
  b.setAttribute('aria-label', texto);
  b.title = texto;
  b.onclick = () => abrirMapa3d(b, donde);
  return b;
}
{
  const capital = botonMapa3d('capital');
  if (capital) {
    capital.id = 'z3d';
    $('.mw .zb').appendChild(capital);
  }
}
