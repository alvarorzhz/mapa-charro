// Parques principales de la capital y los pueblos de alrededor para el mapa (manchas verdes). Los saca de
// OpenStreetMap (Overpass): los que tienen nombre y al menos MIN_HA hectáreas, sin los huertos urbanos.
// Los simplifica y los guarda en js/datos/parques.js. Uso:
//   node herramientas/parques.js            (descarga de Overpass)
//   node herramientas/parques.js datos.json (desde una respuesta de Overpass ya guardada)
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const RAIZ = path.join(__dirname, '..');
const MIN_HA = 1;
const SERVIDORES = [
  'https://overpass-api.de/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter'
];
const CONSULTA = `[out:json][timeout:120];
(
 way["leisure"="park"](40.925,-5.72,41.005,-5.60);
 relation["leisure"="park"](40.925,-5.72,41.005,-5.60);
);
out geom;`;

function descargar() {
  for (const url of SERVIDORES) {
    try {
      const texto = execFileSync(
        'curl',
        [
          '-sS',
          '-m',
          '200',
          '-A',
          'mapa-charro (github.com/alvarorzhz/mapa-charro)',
          '--data-urlencode',
          'data=' + CONSULTA,
          url
        ],
        { encoding: 'utf8', maxBuffer: 1 << 28 }
      );
      if (texto.trim().startsWith('{')) return JSON.parse(texto);
      console.error(url + ': no ha devuelto JSON');
    } catch (e) {
      console.error(url + ': ' + e.message.split('\n')[0]);
    }
  }
  throw new Error('Ningún servidor de Overpass ha respondido');
}

const COS = Math.cos((41 * Math.PI) / 180);
// Área en hectáreas de un anillo [lat, lon]
const hectareas = P => {
  let a = 0;
  for (let i = 0; i < P.length; i++) {
    const [y1, x1] = P[i],
      [y2, x2] = P[(i + P.length - 1) % P.length];
    a += x1 * COS * y2 - x2 * COS * y1;
  }
  return (Math.abs(a) / 2) * 111320 * 111320 * 1e-4;
};
function simplificar(P, tol) {
  if (P.length < 3) return P;
  const [a, b] = [P[0], P[P.length - 1]];
  let max = 0,
    k = 0;
  for (let i = 1; i < P.length - 1; i++) {
    const dx = (b[1] - a[1]) * COS,
      dy = b[0] - a[0],
      l = Math.hypot(dx, dy) || 1e-12,
      d = Math.abs(dy * (P[i][1] - a[1]) * COS - dx * (P[i][0] - a[0])) / l;
    if (d > max) [max, k] = [d, i];
  }
  if (max <= tol) return [a, b];
  return [...simplificar(P.slice(0, k + 1), tol).slice(0, -1), ...simplificar(P.slice(k), tol)];
}
// Un anillo cerrado empieza y acaba en el mismo punto: se parte por el punto más lejano del inicio
function simplificarAnillo(P, tol) {
  const lejos = P.reduce(
    (k, q, i) =>
      Math.hypot(q[0] - P[0][0], (q[1] - P[0][1]) * COS) >
      Math.hypot(P[k][0] - P[0][0], (P[k][1] - P[0][1]) * COS)
        ? i
        : k,
    0
  );
  return [...simplificar(P.slice(0, lejos + 1), tol).slice(0, -1), ...simplificar(P.slice(lejos), tol)];
}
// Junta los trozos de una relación (que pueden venir sueltos) en anillos cerrados
const clave = ([la, lo]) => la.toFixed(7) + ',' + lo.toFixed(7);
function anillos(trozos) {
  const libres = [...trozos],
    hechos = [];
  while (libres.length) {
    let anillo = libres.shift();
    for (let sigue = true; sigue && clave(anillo[0]) != clave(anillo[anillo.length - 1]);) {
      sigue = false;
      const fin = clave(anillo[anillo.length - 1]);
      const i = libres.findIndex(t => clave(t[0]) == fin || clave(t[t.length - 1]) == fin);
      if (i >= 0) {
        const t = libres.splice(i, 1)[0];
        anillo = [...anillo, ...(clave(t[0]) == fin ? t : [...t].reverse()).slice(1)];
        sigue = true;
      }
    }
    hechos.push(anillo);
  }
  return hechos;
}

const datos = process.argv[2] ? JSON.parse(fs.readFileSync(process.argv[2], 'utf8')) : descargar();
const parques = [];
datos.elements.forEach(e => {
  const n = (e.tags || {}).name;
  if (!n || /huerto/i.test(n)) return;
  const geo = g => g.map(p => [p.lat, p.lon]);
  const R =
    e.type == 'way'
      ? [geo(e.geometry)]
      : anillos((e.members || []).filter(m => m.role == 'outer' && m.geometry).map(m => geo(m.geometry)));
  const ha = R.reduce((s, r) => s + hectareas(r), 0);
  if (ha < MIN_HA) return;
  parques.push({
    n,
    ha: Math.round(ha * 10) / 10,
    R: R.map(r => simplificarAnillo(r, 0.00002).flatMap(([la, lo]) => [+la.toFixed(5), +lo.toFixed(5)]))
  });
});
parques.sort((a, b) => b.ha - a.ha);
console.log(parques.length + ' parques: ' + parques.map(p => p.n + ' (' + p.ha + ' ha)').join(', '));

fs.writeFileSync(
  path.join(RAIZ, 'js/datos/parques.js'),
  '// Parques de más de ' +
    MIN_HA +
    ' ha de la capital y alrededores, de OpenStreetMap (© colaboradores de OpenStreetMap, ODbL).\n' +
    '// Generado con node herramientas/parques.js: no editar a mano.\n' +
    '// { n: nombre, ha: hectáreas, R: anillos [lat, lon, lat, lon, ...] }\n' +
    'const PARQUES = [\n' +
    parques.map(p => '  ' + JSON.stringify(p)).join(',\n') +
    '\n];\n'
);
