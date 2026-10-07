// Estado de la app: zonas del mapa, municipios de la provincia, progreso del usuario y vista actual

// Cada zona del mapa es un objeto con:
//   id, n (nombre), l (etiqueta del mapa, | = salto de línea), g (grupo, índice de NOMBRES_GRUPOS),
//   la, lo (coordenadas), x, y (posición en el mapa), t (1 si es un barrio grande),
//   c (frase corta), cur (curiosidades), ly (leyendas).
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
    cur: CURIOSIDADES[id] || [],
    ly: LEYENDAS[id] || []
  };
});
// «Resto de la provincia»: una zona más, sin dibujo, que se marca con su botón o al pisar un pueblo
const zonaResto = {
  id: 'resto',
  n: 'Resto de la provincia',
  g: 6,
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
//   j  { m, d, s }                 juego «¿Dónde está?»: mejor puntuación, fecha del último reto del día y sus puntos
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
    t: o && +o.t > 0 ? +o.t : 0,
    gv,
    p,
    j: { m: puntosJuego(j.m), d: /^\d{4}-\d\d-\d\d$/.test(j.d) ? j.d : '', s: puntosJuego(j.s) }
  };
}
const datosParaGuardar = o => ({
  z: o.z,
  f: o.f,
  t: o.t || 0,
  gv: o.gv || [],
  p: o.p || {},
  j: o.j || { m: 0, d: '', s: 0 },
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
