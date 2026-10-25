// Calcula hacia dónde mira cada fachada de la hora dorada (js/datos/fachadas.js) con la planta del edificio
// en OpenStreetMap y lo guarda en js/datos/orientacion-fachadas.js. De la planta toma el lado más cercano a
// «delante» y su perpendicular, hacia fuera del edificio (o hacia dentro de la plaza).
// Uso, desde la raíz del repositorio:  node herramientas/fachadas.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { sinExport } = require('./datos');
const { execFileSync } = require('child_process');

const RAIZ = path.join(__dirname, '..');
const leer = f => fs.readFileSync(path.join(RAIZ, f), 'utf8');
const { FACHADAS } = vm.runInNewContext(sinExport(leer('js/datos/fachadas.js')) + ';({ FACHADAS })', {});
const SALIDA = 'js/datos/orientacion-fachadas.js';
const LADO_MINIMO = 6; // metros: los lados más cortos son esquinas o retranqueos, no fachadas

// Lo que cambia la orientación; comprobar-datos avisa si no coincide con lo guardado
const firmaFachada = f => [f.edificio, f.delante, f.hacia].join(' ');

const cache = {};
function descargar(elemento) {
  if (cache[elemento]) return cache[elemento];
  const url =
    'https://api.openstreetmap.org/api/0.6/' +
    elemento +
    (elemento.startsWith('node') ? '' : '/full') +
    '.json';
  const texto = execFileSync('curl', ['-sS', '-f', '--max-time', '60', url], { encoding: 'utf8' });
  return (cache[elemento] = JSON.parse(texto).elements);
}

// Puntos en metros alrededor de una referencia (basta un plano local para unos cientos de metros)
const REF = [40.965, -5.664];
const aMetros = (la, lo) => [
  (lo - REF[1]) * 111320 * Math.cos((REF[0] * Math.PI) / 180),
  (la - REF[0]) * 110540
];

// Lados (pares de puntos) de un elemento: los de sus vías exteriores
function lados(elemento) {
  const els = descargar(elemento),
    nodos = Object.fromEntries(els.filter(e => e.type == 'node').map(e => [e.id, aMetros(e.lat, e.lon)])),
    vias = els.filter(e => e.type == 'way'),
    rel = els.find(e => e.type == 'relation'),
    exteriores = rel
      ? rel.members.filter(m => m.type == 'way' && m.role != 'inner').map(m => vias.find(v => v.id == m.ref))
      : vias;
  return exteriores.flatMap(v => v.nodes.slice(1).map((n, i) => [nodos[v.nodes[i]], nodos[n]]));
}
function centro(elemento) {
  const els = descargar(elemento).filter(e => e.type == 'node'),
    p = els.map(e => aMetros(e.lat, e.lon));
  return [p.reduce((s, q) => s + q[0], 0) / p.length, p.reduce((s, q) => s + q[1], 0) / p.length];
}
function distanciaALado(p, [a, b]) {
  const dx = b[0] - a[0],
    dy = b[1] - a[1],
    t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}

// El lado de la fachada: el más cercano a «delante» de los que lo tienen enfrente (la perpendicular hacia él
// se aparta menos de FRENTE grados), juntando los tramos seguidos que van en la misma dirección (una fachada
// suele estar partida en varios lados cortos en la planta). En una plaza («hacia: 'dentro'») vale el lado más
// cercano a «delante», que es un punto de sus soportales.
const FRENTE = 35,
  MISMO_LADO = 25,
  HOLGURA = 4, // metros
  EN_EL_LADO = 2; // metros
const grados = r => (r * 180) / Math.PI;
const angulo = ([a, b]) => Math.atan2(b[1] - a[1], b[0] - a[0]);
const diferencia = (x, y) => {
  const d = Math.abs(x - y) % Math.PI;
  return Math.min(d, Math.PI - d);
};
const largo = ([a, b]) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const medioDe = ([a, b]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
// Perpendicular unitaria del lado que apunta hacia el punto p
function perpendicularHacia(l, p) {
  const [a, b] = l,
    L = largo(l);
  let n = [(b[1] - a[1]) / L, -(b[0] - a[0]) / L];
  const m = medioDe(l);
  if ((p[0] - m[0]) * n[0] + (p[1] - m[1]) * n[1] < 0) n = [-n[0], -n[1]];
  return n;
}
const deFrente = (l, p) => {
  if (distanciaALado(p, l) < EN_EL_LADO) return true;
  const m = medioDe(l),
    n = perpendicularHacia(l, p),
    d = Math.hypot(p[0] - m[0], p[1] - m[1]);
  return ((p[0] - m[0]) * n[0] + (p[1] - m[1]) * n[1]) / d > Math.cos((FRENTE * Math.PI) / 180);
};

const resultado = {};
for (const f of FACHADAS) {
  const delante = centro(f.delante),
    medio = centro(f.edificio),
    todos = lados(f.edificio)
      .filter(l => largo(l) >= LADO_MINIMO)
      .sort((x, y) => distanciaALado(delante, x) - distanciaALado(delante, y)),
    lado = f.hacia == 'dentro' ? todos[0] : todos.find(l => deFrente(l, delante));
  if (!lado) throw new Error(f.id + ': ningún lado de la planta tiene delante ' + f.delante);
  const cerca = distanciaALado(delante, lado),
    base = angulo(lado),
    tramo = todos.filter(
      l => distanciaALado(delante, l) <= cerca + HOLGURA && grados(diferencia(angulo(l), base)) < MISMO_LADO
    );
  // Dirección media del lado, pesada por la longitud de cada tramo (todos orientados como el primero)
  let v = [0, 0];
  for (const [a, b] of tramo) {
    let d = [b[0] - a[0], b[1] - a[1]];
    if (d[0] * Math.cos(base) + d[1] * Math.sin(base) < 0) d = [-d[0], -d[1]];
    v = [v[0] + d[0], v[1] + d[1]];
  }
  // Hacia dónde mira: hacia «delante» o, si está en el mismo lado, lejos del centro del edificio; el lado de
  // una plaza mira hacia el centro de la plaza
  const m = medioDe(lado),
    reflejo = [2 * m[0] - medio[0], 2 * m[1] - medio[1]],
    hacia = f.hacia == 'dentro' ? medio : distanciaALado(delante, lado) < EN_EL_LADO ? reflejo : delante,
    n = perpendicularHacia([[0, 0], v], [hacia[0] - m[0], hacia[1] - m[1]]);
  const rumbo = Math.round((grados(Math.atan2(n[0], n[1])) + 360) % 360);
  resultado[f.id] = [rumbo, firmaFachada(f)];
  const metros = Math.round(tramo.reduce((s, l) => s + largo(l), 0));
  console.log(f.id.padEnd(18), String(rumbo).padStart(3) + '°', metros + ' m de lado');
}

const lineas = Object.entries(resultado).map(
  ([id, v]) => '  ' + JSON.stringify(id) + ': ' + JSON.stringify(v)
);
fs.writeFileSync(
  path.join(RAIZ, SALIDA),
  '// Generado con `node herramientas/fachadas.js` a partir de OpenStreetMap (© colaboradores de OpenStreetMap,\n' +
    '// ODbL). No editar a mano. { id de FACHADAS: [hacia dónde mira, en grados desde el norte, firma] }\n' +
    'export const ORIENTACION_FACHADAS = {\n' +
    lineas.join(',\n') +
    '\n};\n'
);
console.log('Guardado en ' + SALIDA);
