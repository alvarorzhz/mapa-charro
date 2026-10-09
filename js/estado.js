// Estado de la app: zonas del mapa, municipios de la provincia, progreso del usuario y vista actual

// Cada zona del mapa es un objeto con:
//   id, n (nombre), l (etiqueta del mapa, | = salto de línea), g (grupo, índice de NOMBRES_GRUPOS),
//   la, lo (coordenadas), x, y (posición en el mapa), t (1 si es un barrio grande),
//   c (frase corta), otros (otros nombres), cur (curiosidades), ly (leyendas).
// mapa.js le añade al dibujarla: e (polígono), tx/tx2 (etiqueta en 1 o 2 líneas), dt (punto),
//   sg/so/st (grupo del sello «V»), cw/ch (ancho/alto útil para la etiqueta), w1/w2 (largo de la etiqueta).
const zonas = ZONAS.map(([id, n, l, g, la, lo, c]) => {
  const [x, y] = proyectar(la, lo);
  return {
    id,
    n,
    l,
    g,
    x,
    y,
    la,
    lo,
    t: ZONAS_GRANDES.has(id) ? 1 : 0,
    c: c || '',
    otros: OTROS_NOMBRES[id] || [],
    cur: CURIOSIDADES[id] || [],
    ly: LEYENDAS[id] || []
  };
});
// «Resto de la provincia»: una zona más, sin dibujo, que se marca con su botón o al pisar un pueblo
const zonaResto = {
  id: 'resto',
  n: 'Resto de la provincia',
  g: 6,
  otros: [],
  cur: [],
  ly: [],
  c: 'Ciudad Rodrigo, Béjar, La Alberca, las Arribes... Márcala cuando salgas de la zona de la capital.'
};
const todasLasZonas = [...zonas, zonaResto];
const buscarZona = id => todasLasZonas.find(z => z.id == id);

// Municipios: a cada uno de PROVINCIA.m se le añade
//   k (clave de progreso), z (id de zona si está en el mapa de la capital), cap (si es Salamanca),
//   R (lindes decodificadas) y P (pedanías: {n, k, m}).
PROVINCIA.m.forEach(m => {
  m.k = 'm' + m.ine;
  m.z = ALFOZ[m.n] || null;
  m.cap = m.n == 'Salamanca';
  m.R = m.r.map(decodificarLinde);
  m.P = m.ped.map(p => ({ n: p, k: 'p' + m.ine + ':' + slug(p), m }));
});
const pueblos = PROVINCIA.m.filter(m => !m.cap);
const pedanias = PROVINCIA.m.flatMap(m => m.P);

// --- Progreso del usuario ---------------------------------------------------
// Formato (se guarda tal cual en el navegador y en la cuenta; no cambiar los nombres de los campos):
//   z  { idZona: 'v' | 'w' }       zonas del mapa: v = He estado, w = Quiero ir
//   p  { clave: 'v' | 'w' }        pueblos (m<INE>) y pedanías (p<INE>:<slug>) de la provincia
//   gv [clave]                     sitios marcados estando allí con el GPS
//   f  0 | 1                       rana encontrada
//   t  milisegundos                última modificación (para elegir entre la copia local y la de la cuenta)
//   j  { m, d, s, h, pf, mo, r }   juego «¿Dónde está?»: mejor puntuación, fecha del último reto del día y sus
//                                  puntos, días con el reto hecho (h), 1 si alguna partida fue perfecta (pf);
//                                  y, para los logros, monumentos visitados (mo: [id]) y paradas propias de cada
//                                  ruta visitadas (r: { idRuta: [idParada] }), fichas de zona abiertas (fl),
//                                  etapas de «Salamanca en el tiempo» vistas (et), partidas terminadas (n) y
//                                  veces que se ha creado «Mi Salamanca» (ms) o compartido (cp) y palabras charras vistas (pv). Van dentro de j para no añadir
//                                  campos nuevos a lo guardado (las reglas de la cuenta de Google solo aceptan estos)
const CLAVE_LOCAL = 'charro2';
const ESTADOS_MARCA = [
  ['v', 'He estado'],
  ['w', 'Quiero ir']
];
const idsValidos = new Set(todasLasZonas.map(z => z.id));
const clavesProvincia = new Set();
PROVINCIA.m.forEach(m => {
  if (!m.z && !m.cap) clavesProvincia.add(m.k);
  m.P.forEach(p => clavesProvincia.add(p.k));
});

// Deja solo datos válidos (sirve para lo leído del navegador, de la cuenta o de un código pegado)
function limpiarProgreso(o) {
  const marcaValida = x => x == 'v' || x == 'w';
  const z = {};
  if (o && typeof o.z == 'object' && o.z)
    for (const k in o.z) if (idsValidos.has(k) && marcaValida(o.z[k])) z[k] = o.z[k];
  const p = {};
  if (o && o.p && typeof o.p == 'object')
    for (const k in o.p) if (clavesProvincia.has(k) && marcaValida(o.p[k])) p[k] = o.p[k];
  const gv = Array.isArray(o && o.gv)
    ? [...new Set(o.gv.filter(k => typeof k == 'string' && (z[k] == 'v' || p[k] == 'v')))]
    : [];
  const j = o && o.j && typeof o.j == 'object' ? o.j : {},
    puntosJuego = x => Math.max(0, Math.min(1000, Math.round(+x) || 0));
  return {
    z,
    f: o && o.f ? 1 : 0,
    t: o && +o.t > 0 ? Math.min(+o.t, Date.now() + 864e5) : 0, // como mucho, un día por delante (relojes mal puestos)
    gv,
    p,
    j: {
      m: puntosJuego(j.m),
      d: esFecha(j.d) ? j.d : '',
      s: puntosJuego(j.s),
      h: Array.isArray(j.h) ? [...new Set(j.h.filter(esFecha))].sort().slice(-90) : [],
      pf: j.pf ? 1 : 0,
      mo: Array.isArray(j.mo) ? [...new Set(j.mo.filter(id => idsMonumentos.has(id)))] : [],
      r: limpiarParadas(j.r),
      fl: Array.isArray(j.fl) ? [...new Set(j.fl.filter(id => idsValidos.has(id)))] : [],
      et: Array.isArray(j.et)
        ? [...new Set(j.et.filter(i => Number.isInteger(i) && i >= 0 && i < ETAPAS.length))]
        : [],
      n: contador(j.n),
      ms: contador(j.ms),
      cp: contador(j.cp),
      pv: Array.isArray(j.pv) ? [...new Set(j.pv.filter(id => idsPalabras.has(id)))] : []
    }
  };
}
const contador = x => Math.max(0, Math.min(1e6, Math.round(+x) || 0));
const esFecha = x => typeof x == 'string' && /^\d{4}-\d\d-\d\d$/.test(x);
const idsMonumentos = new Set(MONUMENTOS.map(m => m.id));
const idsPalabras = new Set(PALABRAS_CHARRAS.map(w => w.id));
// Paradas propias (no monumentos) de cada ruta que existan
function limpiarParadas(r) {
  const limpio = {};
  if (!r || typeof r != 'object') return limpio;
  RUTAS.forEach(ruta => {
    const ids = new Set(ruta.paradas.filter(p => typeof p != 'string').map(p => p.id)),
      vistas = Array.isArray(r[ruta.id]) ? [...new Set(r[ruta.id].filter(id => ids.has(id)))] : [];
    if (vistas.length) limpio[ruta.id] = vistas;
  });
  return limpio;
}
const datosParaGuardar = o => ({
  z: o.z,
  f: o.f,
  t: o.t || 0,
  gv: o.gv || [],
  p: o.p || {},
  j: o.j || { m: 0, d: '', s: 0, h: [], pf: 0, mo: [], r: {}, fl: [], et: [], n: 0, ms: 0, cp: 0, pv: [] },
  v: 1
});

let progreso = { z: {}, f: 0 };
try {
  progreso = JSON.parse(localStorage.getItem(CLAVE_LOCAL)) || progreso;
} catch (e) {}
progreso = limpiarProgreso(progreso);
const guardarLocal = () => {
  try {
    localStorage.setItem(CLAVE_LOCAL, JSON.stringify(progreso));
  } catch (e) {}
};

// --- Vista actual -----------------------------------------------------------
let pestana = 'map'; // 'map' | 'list' | 'prov'
let filtroLista = 'all'; // filtro de la pestaña Lista (ver FILTROS)
let zonaAbierta = null; // id de la zona cuya ficha está abierta
// Encuadre inicial del mapa (viewBox): el centro de la ciudad
const encuadreInicial = () => ({ x: 131, y: 200, w: esEscritorio() ? 190 : 150, h: 180 });
let vistaMapa = encuadreInicial();
