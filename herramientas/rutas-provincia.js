// Calcula el camino en coche de las rutas por la provincia (js/datos/rutas-provincia.js): de la capital a
// la primera parada, de parada en parada y vuelta a la capital, con sus km y su tiempo al volante. Usa el
// enrutador en coche de OpenStreetMap (routing.openstreetmap.de, OSRM) y lo guarda en
// js/datos/tramos-provincia.js. Uso:  node herramientas/rutas-provincia.js arribes
// (sin nombres, calcula las rutas que aún no tienen tramos o cuyas paradas han cambiado)
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const RAIZ = path.join(__dirname, '..');
const leer = f => fs.readFileSync(path.join(RAIZ, f), 'utf8');
const { RUTAS_PROVINCIA, SALIDA_PROVINCIA, TRAMOS_PROVINCIA } = vm.runInNewContext(
  ['js/datos/rutas-provincia.js', 'js/datos/tramos-provincia.js']
    .filter(f => fs.existsSync(path.join(RAIZ, f)))
    .map(leer)
    .join('\n;\n') +
    ';({ RUTAS_PROVINCIA, SALIDA_PROVINCIA, TRAMOS_PROVINCIA: typeof TRAMOS_PROVINCIA == "undefined" ? {} : TRAMOS_PROVINCIA })',
  {}
);

// Simplifica una línea quitando puntos que se desvían menos de «tol» grados (Douglas-Peucker)
function simplificar(P, tol = 0.0006) {
  if (P.length < 3) return P;
  const [a, b] = [P[0], P[P.length - 1]];
  let max = 0,
    k = 0;
  for (let i = 1; i < P.length - 1; i++) {
    const [x, y] = P[i],
      dx = b[0] - a[0],
      dy = b[1] - a[1],
      l = Math.hypot(dx, dy) || 1e-12,
      d = Math.abs(dy * x - dx * y + b[0] * a[1] - b[1] * a[0]) / l;
    if (d > max) [max, k] = [d, i];
  }
  if (max <= tol) return [a, b];
  return [...simplificar(P.slice(0, k + 1), tol).slice(0, -1), ...simplificar(P.slice(k), tol)];
}

function tramo(a, b) {
  const url = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${a.lo},${a.la};${b.lo},${b.la}?overview=full&geometries=geojson`;
  const r = JSON.parse(
    execFileSync('curl', [
      '-s',
      '--max-time',
      '60',
      '-A',
      'mapa-charro (github.com/alvarorzhz/mapa-charro)',
      url
    ])
  );
  if (r.code != 'Ok') throw new Error('Sin camino de ' + a.id + ' a ' + b.id + ': ' + r.code);
  const ruta = r.routes[0],
    P = simplificar(ruta.geometry.coordinates.map(([lo, la]) => [la, lo])).map(([la, lo]) => [
      +la.toFixed(4),
      +lo.toFixed(4)
    ]);
  execFileSync('sleep', ['1']);
  return { de: a.id, a: b.id, m: Math.round(ruta.distance), s: Math.round(ruta.duration), p: P };
}

const salida = { id: 'salida', la: SALIDA_PROVINCIA.la, lo: SALIDA_PROVINCIA.lo };
const puntosDe = r => [salida, ...r.paradas, salida];
// Los tramos valen si unen las mismas paradas, en el mismo orden y en el mismo sitio
const firma = r => puntosDe(r).map(p => p.id + '@' + p.la + ',' + p.lo);
const pedidas = process.argv.slice(2);
const nuevos = { ...TRAMOS_PROVINCIA };
for (const r of RUTAS_PROVINCIA) {
  const hecha = TRAMOS_PROVINCIA[r.id] && TRAMOS_PROVINCIA[r.id].firma.join() == firma(r).join();
  if (pedidas.length ? !pedidas.includes(r.id) : hecha) continue;
  const ps = puntosDe(r),
    tramos = ps.slice(1).map((b, i) => tramo(ps[i], b));
  nuevos[r.id] = { firma: firma(r), tramos };
  console.log(
    r.id.padEnd(12),
    Math.round(tramos.reduce((s, t) => s + t.m, 0) / 1000),
    'km,',
    Math.round(tramos.reduce((s, t) => s + t.s, 0) / 60),
    'min al volante,',
    tramos.reduce((s, t) => s + t.p.length, 0),
    'puntos'
  );
}
for (const id in nuevos) if (!RUTAS_PROVINCIA.some(r => r.id == id)) delete nuevos[id];
fs.writeFileSync(
  path.join(RAIZ, 'js/datos/tramos-provincia.js'),
  '// Tramos en coche de las rutas por la provincia: de la capital a cada parada y vuelta.\n' +
    '// Generado con node herramientas/rutas-provincia.js (OpenStreetMap, © colaboradores de OpenStreetMap, ODbL); no editar a mano.\n' +
    '// { idRuta: { firma, tramos: [{ de, a, m (metros), s (segundos al volante), p: [[lat, lon], ...] }] } }\n' +
    'const TRAMOS_PROVINCIA = ' +
    JSON.stringify(nuevos) +
    ';\n'
);
