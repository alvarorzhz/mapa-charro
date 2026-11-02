// Calcula el perfil de las rutas a pie (js/datos/tramos.js) y lo guarda en js/datos/perfil-rutas.js:
// - desnivel (cuánto se sube y se baja) con el modelo de elevación EU-DEM de 25 m (Copernicus), a través de
//   la API pública de OpenTopoData (api.opentopodata.org);
// - escaleras en el camino: se vuelve a pedir cada tramo al enrutador a pie de OpenStreetMap con los nodos
//   del camino y se miran en la API de OpenStreetMap las vías que los unen (highway=steps).
// Uso, desde la raíz del repositorio:  node herramientas/perfil-rutas.js monumental
// (sin nombres, calcula las rutas que aún no tienen perfil o cuyos tramos han cambiado)
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { sinExport } = require('./datos');
const { execFileSync } = require('child_process');

const RAIZ = path.join(__dirname, '..');
const leer = f => fs.readFileSync(path.join(RAIZ, f), 'utf8');
const ARCHIVO = 'js/datos/perfil-rutas.js';
const { TRAMOS_RUTAS, PERFIL_RUTAS } = vm.runInNewContext(
  sinExport(
    leer('js/datos/tramos.js') +
      '\n;\n' +
      (fs.existsSync(path.join(RAIZ, ARCHIVO)) ? leer(ARCHIVO) : 'const PERFIL_RUTAS = {};')
  ) + ';({ TRAMOS_RUTAS, PERFIL_RUTAS })',
  {}
);
// La firma es la misma que comprueba herramientas/comprobar-datos.js: si cambian los tramos, hay que recalcular
const firmaTramos = T => T.map(t => t.de + '>' + t.a + ':' + t.m);

const pedir = url => {
  const salida = execFileSync(
    'curl',
    ['-s', '--max-time', '90', '-A', 'mapa-charro (github.com/alvarorzhz/mapa-charro)', url],
    { maxBuffer: 1 << 28 }
  ).toString();
  execFileSync('sleep', ['1.1']);
  return salida;
};

// --- Desnivel --------------------------------------------------------------------------------------
const metrosEntre = ([a, b], [c, d]) =>
  Math.hypot((a - c) * 111195, (b - d) * 111195 * Math.cos((a * Math.PI) / 180));
// Puntos cada «paso» metros a lo largo de la línea (incluidos el primero y el último)
function muestrear(P, paso = 25) {
  const salida = [P[0]];
  let sobra = 0;
  for (let i = 1; i < P.length; i++) {
    const d = metrosEntre(P[i - 1], P[i]);
    let recorrido = paso - sobra;
    while (recorrido <= d) {
      const f = recorrido / d;
      salida.push([P[i - 1][0] + (P[i][0] - P[i - 1][0]) * f, P[i - 1][1] + (P[i][1] - P[i - 1][1]) * f]);
      recorrido += paso;
    }
    sobra = d - (recorrido - paso);
  }
  salida.push(P[P.length - 1]);
  return salida;
}
function alturas(puntos) {
  const salida = [];
  for (let i = 0; i < puntos.length; i += 100) {
    const lote = puntos.slice(i, i + 100).map(([la, lo]) => la.toFixed(5) + ',' + lo.toFixed(5));
    const r = JSON.parse(pedir('https://api.opentopodata.org/v1/eudem25m?locations=' + lote.join('|')));
    if (r.status != 'OK') throw new Error('OpenTopoData: ' + (r.error || r.status));
    salida.push(...r.results.map(x => x.elevation));
  }
  return salida;
}
// Subida y bajada acumuladas, sin contar los vaivenes de menos de «umbral» metros (ruido del modelo)
function desnivel(z, umbral = 3) {
  let sube = 0,
    baja = 0,
    ref = z[0];
  for (const h of z) {
    if (h - ref >= umbral) ((sube += h - ref), (ref = h));
    else if (ref - h >= umbral) ((baja += ref - h), (ref = h));
  }
  return { sube: Math.round(sube), baja: Math.round(baja) };
}

// --- Escaleras -------------------------------------------------------------------------------------
const nodosTramo = (a, b) => {
  const url = `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${a[1]},${a[0]};${b[1]},${b[0]}?overview=false&annotations=nodes`;
  const r = JSON.parse(pedir(url));
  if (r.code != 'Ok') throw new Error('Sin camino: ' + r.code);
  return r.routes[0].legs[0].annotation.nodes;
};
// Vías de OpenStreetMap en cuadros de ~0,004° alrededor de los puntos (la API limita el tamaño de cada petición)
const vias = new Map(),
  cuadrosPedidos = new Set();
function cargarVias(puntos) {
  const lado = 0.004;
  for (const [la, lo] of puntos) {
    const cuadro = Math.floor(la / lado) + ',' + Math.floor(lo / lado);
    if (cuadrosPedidos.has(cuadro)) continue;
    cuadrosPedidos.add(cuadro);
    const [i, j] = cuadro.split(',').map(Number);
    const bbox = [j * lado, i * lado, (j + 1) * lado, (i + 1) * lado].map(x => x.toFixed(4)).join(',');
    const datos = JSON.parse(pedir('https://api.openstreetmap.org/api/0.6/map.json?bbox=' + bbox));
    for (const e of datos.elements) if (e.type == 'way' && e.tags && e.tags.highway) vias.set(e.id, e);
  }
}
function esEscalera(n1, n2) {
  for (const v of vias.values()) {
    if (v.tags.highway != 'steps') continue;
    const k = v.nodes.indexOf(n1);
    if (k >= 0 && (v.nodes[k + 1] == n2 || v.nodes[k - 1] == n2)) return true;
  }
  return false;
}

// --- Cada ruta ---------------------------------------------------------------------------------------
const pedidas = process.argv.slice(2);
const nuevos = { ...PERFIL_RUTAS };
for (const [id, T] of Object.entries(TRAMOS_RUTAS)) {
  const firma = firmaTramos(T);
  if (
    pedidas.length ? !pedidas.includes(id) : PERFIL_RUTAS[id] && PERFIL_RUTAS[id].firma.join() == firma.join()
  )
    continue;
  const puntos = muestrear(T.flatMap((t, i) => (i ? t.p.slice(1) : t.p)));
  const z = alturas(puntos);
  cargarVias(T.flatMap(t => t.p));
  const conEscaleras = [];
  for (const t of T) {
    const nodos = nodosTramo(t.p[0], t.p[t.p.length - 1]);
    if (nodos.some((n, i) => i && esEscalera(nodos[i - 1], n))) conEscaleras.push(t.de + '>' + t.a);
  }
  nuevos[id] = {
    firma,
    ...desnivel(z),
    alta: Math.round(Math.max(...z)),
    escaleras: conEscaleras
  };
  console.log(id.padEnd(12), JSON.stringify({ ...nuevos[id], firma: undefined }));
}
for (const id in nuevos) if (!TRAMOS_RUTAS[id]) delete nuevos[id];
fs.writeFileSync(
  path.join(RAIZ, ARCHIVO),
  '// Perfil de las rutas a pie: desnivel y tramos con escaleras.\n' +
    '// Generado con node herramientas/perfil-rutas.js; no editar a mano. Alturas: EU-DEM 25 m (Copernicus, vía\n' +
    '// OpenTopoData); escaleras: OpenStreetMap (© colaboradores de OpenStreetMap, ODbL).\n' +
    '// { idRuta: { firma (de los tramos), sube y baja (m), alta (m, altura máxima),\n' +
    '//   escaleras: ["de>a", ...] (tramos con algún tramo de escalera) } }\n' +
    'export const PERFIL_RUTAS = ' +
    JSON.stringify(nuevos) +
    ';\n'
);
