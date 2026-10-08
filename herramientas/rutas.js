// Calcula el camino a pie por calles reales entre las paradas de una ruta (js/datos/rutas.js) y lo
// guarda en js/datos/tramos.js. Usa el enrutador a pie de OpenStreetMap (routing.openstreetmap.de, OSRM).
// Uso, desde la raíz del repositorio:  node herramientas/rutas.js murales vandyck
// (sin nombres, calcula las rutas que aún no tienen tramos o cuyas paradas han cambiado)
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const RAIZ = path.join(__dirname, '..');
const leer = f => fs.readFileSync(path.join(RAIZ, f), 'utf8');
const { RUTAS, MONUMENTOS, TRAMOS_RUTAS } = vm.runInNewContext(
  ['js/datos/monumentos.js', 'js/datos/rutas.js', 'js/datos/tramos.js'].map(leer).join('\n;\n') +
    ';({ RUTAS, MONUMENTOS, TRAMOS_RUTAS })',
  {}
);

const punto = p => {
  if (typeof p != 'string') return { id: p.id, la: p.la, lo: p.lo };
  const m = MONUMENTOS.find(m => m.id == p);
  if (!m) throw new Error('No hay monumento ' + p);
  return { id: p, la: m.la, lo: m.lo };
};

// Simplifica una línea quitando puntos que se desvían menos de «tol» grados (Douglas-Peucker)
function simplificar(P, tol = 0.00003) {
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
  const url = `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${a.lo},${a.la};${b.lo},${b.la}?overview=full&geometries=geojson`;
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
      +la.toFixed(5),
      +lo.toFixed(5)
    ]);
  execFileSync('sleep', ['1']);
  return { de: a.id, a: b.id, m: Math.round(ruta.distance), p: P };
}

const pedidas = process.argv.slice(2);
const coincide = (r, T) =>
  T &&
  T.length == r.paradas.length - 1 &&
  T.every((t, i) => t.de == punto(r.paradas[i]).id && t.a == punto(r.paradas[i + 1]).id);
const nuevos = { ...TRAMOS_RUTAS };
for (const r of RUTAS) {
  if (pedidas.length ? !pedidas.includes(r.id) : coincide(r, TRAMOS_RUTAS[r.id])) continue;
  const ps = r.paradas.map(punto);
  nuevos[r.id] = ps.slice(1).map((b, i) => tramo(ps[i], b));
  console.log(
    r.id.padEnd(12),
    nuevos[r.id].reduce((s, t) => s + t.m, 0),
    'm en',
    nuevos[r.id].length,
    'tramos'
  );
}
for (const id in nuevos) if (!RUTAS.some(r => r.id == id)) delete nuevos[id];
fs.writeFileSync(
  path.join(RAIZ, 'js/datos/tramos.js'),
  '// Tramos de las rutas a pie: el camino por calles reales entre cada parada y la siguiente.\n' +
    '// Generado con node herramientas/rutas.js (OpenStreetMap, © colaboradores de OpenStreetMap, ODbL); no editar a mano.\n' +
    '// { idRuta: [{ de, a, m (metros), p: [[lat, lon], ...] }, ...] }\n' +
    'const TRAMOS_RUTAS = ' +
    JSON.stringify(nuevos) +
    ';\n'
);
