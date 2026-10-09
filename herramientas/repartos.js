// Calcula el límite aproximado de las zonas que no tienen uno propio en OpenStreetMap (ZONAS_NO_OFICIALES):
// dentro de cada límite de LINDES_OFICIALES, cada punto va a la zona más cercana (su punto en ZONAS y,
// si las tiene, sus SEMILLAS_REPARTO, para afinar dónde cae un edificio conocido). Guarda el resultado
// en LIMITES_BARRIOS (js/datos/geometria.js).
// Uso, desde la raíz del repositorio:  node herramientas/repartos.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { union } = require('polygon-clipping');

const RAIZ = path.join(__dirname, '..');
const archivo = path.join(RAIZ, 'js/datos/geometria.js');
let geometria = fs.readFileSync(archivo, 'utf8');
const D = vm.runInNewContext(
  fs.readFileSync(path.join(RAIZ, 'js/datos/zonas.js'), 'utf8') +
    '\n;\n' +
    geometria +
    ';({ ZONAS, SEMILLAS_REPARTO, LIMITES_BARRIOS, ZONAS_NO_OFICIALES, LINDES_OFICIALES })',
  {}
);

const dentro = (P, [la, lo]) => {
  let d = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    const [yi, xi] = P[i],
      [yj, xj] = P[j];
    if (yi > la != yj > la && lo < ((xj - xi) * (la - yi)) / (yj - yi) + xi) d = !d;
  }
  return d;
};
// Con la longitud escalada por cos(latitud), las distancias en grados se parecen a las reales
const K = Math.cos((40.965 * Math.PI) / 180),
  aPlano = ([la, lo]) => [lo * K, la],
  aGrados = ([x, y]) => [+y.toFixed(5), +(x / K).toFixed(5)];
// Medio plano más cerca de a que de b (como recortarSemiplano en util.js, en coordenadas planas)
function recortar(P, a, b) {
  const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2],
    n = [b[0] - a[0], b[1] - a[1]],
    lado = q => (q[0] - m[0]) * n[0] + (q[1] - m[1]) * n[1],
    r = [];
  P.forEach((q, i) => {
    const s = P[(i + 1) % P.length],
      dq = lado(q),
      ds = lado(s);
    if (dq <= 0) r.push(q);
    if (dq * ds < 0) {
      const t = dq / (dq - ds);
      r.push([q[0] + (s[0] - q[0]) * t, q[1] + (s[1] - q[1]) * t]);
    }
  });
  return r;
}

const zonas = Object.fromEntries(D.ZONAS.map(z => [z[0], [z[4], z[5]]]));
const nuevos = {};
D.LINDES_OFICIALES.forEach((base, k) => {
  const ids = [...D.ZONAS_NO_OFICIALES].filter(id => dentro(base, zonas[id]));
  if (ids.length < 2) throw new Error('El límite ' + k + ' tiene menos de dos zonas: ' + ids);
  const semillas = ids.flatMap(id =>
    [zonas[id], ...(D.SEMILLAS_REPARTO[id] || [])].map(p => ({ id, p: aPlano(p) }))
  );
  const plano = base.map(aPlano);
  ids.forEach(id => {
    const trozos = semillas
      .filter(s => s.id == id)
      .map(s => semillas.filter(o => o.id != id).reduce((P, o) => recortar(P, s.p, o.p), plano))
      .filter(P => P.length >= 3)
      .map(P => [[...P, P[0]]]);
    const u = union(...trozos);
    if (u.length != 1) throw new Error(id + ': su límite sale en ' + u.length + ' trozos');
    nuevos[id] = u[0][0].slice(0, -1).map(aGrados);
    console.log(('límite ' + k).padEnd(10), id.padEnd(14), nuevos[id].length, 'puntos');
  });
});
for (const id of D.ZONAS_NO_OFICIALES)
  if (!nuevos[id]) throw new Error(id + ' no cae dentro de ningún límite de LINDES_OFICIALES');

const limites = { ...D.LIMITES_BARRIOS, ...nuevos };
geometria = geometria.replace(
  /const LIMITES_BARRIOS=.*;\n/,
  () => 'const LIMITES_BARRIOS=' + JSON.stringify(limites) + ';\n'
);
fs.writeFileSync(archivo, geometria);
