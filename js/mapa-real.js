// Mapa real de fondo (interruptor del panel de capas, encendido de entrada): calles, casas, parques y
// agua de OpenStreetMap por OpenFreeMap, con los colores de la app, debajo del dibujo de la capital.
// MapLibre se carga de cdnjs al encenderlo; no se puede tocar: sigue al encuadre del SVG
// (sincronizarFondoReal, desde mapa-vista.js). Si se apaga, se recuerda en este navegador
// (charro-fondo-real '0'). Sin conexión, se queda apagado sin avisar. Dentro de Claude no hay
// interruptor: el visor no deja pedir mapas a otras webs. Va después de ubicacion.js (EN_MARCO).

const CLAVE_FONDO_REAL = 'charro-fondo-real';
const MAPLIBRE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/maplibre-gl/4.7.1/maplibre-gl.min.js',
  // Huella del archivo (SRI): si se cambia la versión, hay que poner la del archivo nuevo
  MAPLIBRE_SRI = 'sha384-KKgyz2mG25bKJ1O2PyqTJPlAF8Kw2BpDmsLTNBXslICOBvhTAyF5F0XhLWF2ZovY';
const fondoReal = { encendido: false, mapa: null, capa: null, cargando: null };

// Inversa de proyectar (util.js): punto del mapa → [latitud, longitud]
const desproyectar = (x, y) => [40.985 - (y - 240) / 2446.4, (x - 200) / 1850.2 - 5.671];

// Estilo del fondo con los colores del tema actual (variables de estilos.css)
function estiloFondoReal() {
  const css = getComputedStyle(document.documentElement),
    color = v => css.getPropertyValue(v).trim(),
    ancho = (z13, z16) => ['interpolate', ['exponential', 1.6], ['zoom'], 11, z13 / 4, 13, z13, 16, z16],
    lineas = (id, filtro, colorLinea, anchoLinea, extra = {}) => ({
      id,
      type: 'line',
      source: 'osm',
      'source-layer': 'transportation',
      filter: filtro,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': colorLinea, 'line-width': anchoLinea },
      ...extra
    }),
    clase = lista => ['in', ['get', 'class'], ['literal', lista]];
  return {
    version: 8,
    glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
    sources: { osm: { type: 'vector', url: 'https://tiles.openfreemap.org/planet' } },
    layers: [
      { id: 'campo', type: 'background', paint: { 'background-color': color('--campo') } },
      {
        id: 'ciudad',
        type: 'fill',
        source: 'osm',
        'source-layer': 'landuse',
        filter: clase(['residential', 'commercial', 'industrial', 'retail']),
        paint: { 'fill-color': color('--zona-3') }
      },
      {
        id: 'parques',
        type: 'fill',
        source: 'osm',
        'source-layer': 'park',
        paint: { 'fill-color': color('--parque') }
      },
      {
        id: 'verde',
        type: 'fill',
        source: 'osm',
        'source-layer': 'landcover',
        filter: clase(['grass', 'wood']),
        paint: { 'fill-color': color('--parque'), 'fill-opacity': 0.55 }
      },
      {
        id: 'agua',
        type: 'fill',
        source: 'osm',
        'source-layer': 'water',
        paint: { 'fill-color': color('--rio') }
      },
      {
        id: 'casas',
        type: 'fill',
        source: 'osm',
        'source-layer': 'building',
        minzoom: 14,
        paint: {
          'fill-color': color('--zona-4'),
          'fill-opacity': ['interpolate', ['linear'], ['zoom'], 14, 0, 15, 0.9]
        }
      },
      lineas('calles', clase(['minor', 'service', 'tertiary', 'secondary']), color('--calle'), ancho(1, 6)),
      lineas('avenidas', clase(['primary', 'trunk']), color('--calle'), ancho(2, 9)),
      lineas('autovias', ['==', ['get', 'class'], 'motorway'], color('--ronda'), ancho(2.5, 9)),
      {
        id: 'nombres',
        type: 'symbol',
        source: 'osm',
        'source-layer': 'transportation_name',
        minzoom: 14.6,
        layout: {
          'symbol-placement': 'line',
          'text-field': ['get', 'name'],
          'text-font': ['Noto Sans Italic'],
          'text-size': 10
        },
        paint: { 'text-color': color('--linea'), 'text-halo-color': color('--calle'), 'text-halo-width': 1 }
      }
    ]
  };
}

// Lleva el mapa real al mismo encuadre que el SVG (el viewBox ocupa el SVG entero: misma proporción)
function sincronizarFondoReal() {
  const m = fondoReal.mapa;
  if (!m || !fondoReal.encendido || !tamMapa.w) return;
  const v = vistaMapa,
    [la, lo] = desproyectar(v.x + v.w / 2, v.y + v.h / 2);
  // A zoom z, MapLibre pinta 512·2^z píxeles por cada 360° de longitud
  m.jumpTo({ center: [lo, la], zoom: Math.log2(((tamMapa.w / v.w) * 1850.2 * 360) / 512) });
}
// Mientras se arrastra, el SVG se mueve con una transformación CSS: el fondo, con él
const moverFondoReal = transformacion => {
  if (fondoReal.capa) fondoReal.capa.style.transform = transformacion;
};

// La capa ocupa exactamente el dibujo del SVG (sin su borde)
function colocarCapaFondoReal() {
  const c = fondoReal.capa;
  if (!c) return;
  Object.assign(c.style, {
    left: mapaSvg.offsetLeft + mapaSvg.clientLeft + 'px',
    top: mapaSvg.offsetTop + mapaSvg.clientTop + 'px',
    width: mapaSvg.clientWidth + 'px',
    height: mapaSvg.clientHeight + 'px'
  });
  if (fondoReal.mapa) fondoReal.mapa.resize();
  sincronizarFondoReal();
}

const cargarMapLibre = () =>
  (fondoReal.cargando ||= window.maplibregl
    ? Promise.resolve()
    : cargarScriptExterno(MAPLIBRE_URL, MAPLIBRE_SRI).catch(e => {
        fondoReal.cargando = null; // se podrá volver a intentar
        throw e;
      }));

// recordar: lo ha elegido la persona (se guarda y, si falla, se avisa); si no, es el encendido de entrada
async function ponerFondoReal(encender, recordar = true) {
  fondoReal.encendido = encender;
  marcarInterruptor($('#frb'), encender);
  if (recordar) escribirLocal(CLAVE_FONDO_REAL, encender ? '1' : '0');
  $('.mw').classList.toggle('fondo-real', encender);
  if (!encender) return;
  if (!fondoReal.capa) {
    fondoReal.capa = crear('div', 'capa-fondo-real');
    fondoReal.capa.setAttribute('aria-hidden', 'true');
    $('.mw').insertBefore(fondoReal.capa, mapaSvg);
    const enlace = (texto, href) =>
      Object.assign(crear('a', '', texto), { href, target: '_blank', rel: 'noopener' });
    $('.mw').appendChild(
      crear(
        'div',
        'credito-fondo-real',
        enlace('OpenFreeMap', 'https://openfreemap.org'),
        ' © ',
        enlace('OpenStreetMap', 'https://www.openstreetmap.org/copyright')
      )
    );
  }
  colocarCapaFondoReal();
  if (fondoReal.mapa) return sincronizarFondoReal();
  try {
    await cargarMapLibre();
  } catch (e) {
    if (recordar)
      aviso('No se ha podido cargar el mapa real. Comprueba la conexión y vuelve a probar.', {
        tipo: 'error'
      });
    return ponerFondoReal(false, false);
  }
  if (fondoReal.mapa || !fondoReal.encendido) return;
  fondoReal.mapa = new window.maplibregl.Map({
    container: fondoReal.capa,
    style: estiloFondoReal(),
    interactive: false,
    attributionControl: false,
    fadeDuration: 0
  });
  sincronizarFondoReal();
}

// Al cambiar de tema, los colores del fondo cambian con él
function repintarFondoReal() {
  if (fondoReal.mapa) fondoReal.mapa.setStyle(estiloFondoReal());
}

if (EN_MARCO) $('#fondo-real-opcion').remove();
else {
  $('#frb').onclick = () => ponerFondoReal(!fondoReal.encendido);
  new ResizeObserver(colocarCapaFondoReal).observe(mapaSvg);
  if (leerLocal(CLAVE_FONDO_REAL) != '0' && navigator.onLine !== false) ponerFondoReal(true, false);
}
