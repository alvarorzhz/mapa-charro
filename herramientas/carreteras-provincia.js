// Autovías, carreteras nacionales y la CL-517 (la de las Arribes) de la provincia para su mapa (pestaña Provincia y mapas de las rutas en
// coche). Las saca de OpenStreetMap (Overpass), junta los trozos de cada carretera, deja una sola calzada
// en las autovías, las simplifica y las guarda en js/datos/carreteras-provincia.js. Uso:
//   node herramientas/carreteras-provincia.js            (descarga de Overpass)
//   node herramientas/carreteras-provincia.js datos.json (desde una respuesta de Overpass ya guardada)
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const RAIZ = path.join(__dirname, '..');
// [ref, tipo: 'a' autovía | 'n' nacional | 'c' autonómica (solo la de las Arribes), nombre]
const CARRETERAS = [
  ['A-62', 'a', 'Autovía de Castilla'],
  ['A-66', 'a', 'Autovía Ruta de la Plata'],
  ['A-50', 'a', 'Autovía de Ávila'],
  ['N-620', 'n', 'Burgos – Portugal'],
  ['N-630', 'n', 'Gijón – Sevilla'],
  ['N-501', 'n', 'Ávila – Salamanca'],
  ['CL-517', 'c', 'Salamanca – Vitigudino – Portugal']
];
const SERVIDORES = [
  'https://overpass-api.de/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter'
];
const CONSULTA = `[out:json][timeout:150];
area["name"="Salamanca"]["admin_level"="6"]->.p;
way(area.p)["highway"~"^(motorway|trunk|primary)$"]["ref"~"^(${CARRETERAS.map(c => c[0]).join('|')})"];
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

const clave = ([la, lo]) => la.toFixed(6) + ',' + lo.toFixed(6);
// Junta los trozos que se tocan por los extremos en líneas largas
function encadenar(trozos) {
  const libres = new Set(trozos.map((t, i) => i)),
    lineas = [];
  const buscar = (punto, salvo) => {
    for (const i of libres)
      if (i != salvo) {
        const t = trozos[i];
        if (clave(t[0]) == punto) return [i, t];
        if (clave(t[t.length - 1]) == punto) return [i, [...t].reverse()];
      }
    return null;
  };
  while (libres.size) {
    const i0 = libres.values().next().value;
    libres.delete(i0);
    let linea = trozos[i0];
    for (let sigue = true; sigue;) {
      sigue = false;
      const fin = buscar(clave(linea[linea.length - 1]));
      if (fin) {
        libres.delete(fin[0]);
        linea = [...linea, ...fin[1].slice(1)];
        sigue = true;
      }
      const inicio = buscar(clave(linea[0]));
      if (inicio) {
        libres.delete(inicio[0]);
        linea = [...[...inicio[1]].reverse(), ...linea.slice(1)];
        sigue = true;
      }
    }
    lineas.push(linea);
  }
  return lineas;
}

// En grados «planos» (longitud por el coseno de la latitud)
const COS = Math.cos((41 * Math.PI) / 180);
const distancia = (a, b) => Math.hypot(a[0] - b[0], (a[1] - b[1]) * COS);
const largo = P => P.slice(1).reduce((s, q, i) => s + distancia(q, P[i]), 0);
function simplificar(P, tol) {
  if (P.length < 3) return P;
  const [a, b] = [P[0], P[P.length - 1]];
  let max = 0,
    k = 0;
  for (let i = 1; i < P.length - 1; i++) {
    const x = P[i][0],
      y = P[i][1] * COS,
      ax = a[0],
      ay = a[1] * COS,
      dx = b[0] - ax,
      dy = b[1] * COS - ay,
      l = Math.hypot(dx, dy) || 1e-12,
      d = Math.abs(dy * (x - ax) - dx * (y - ay)) / l;
    if (d > max) [max, k] = [d, i];
  }
  if (max <= tol) return [a, b];
  return [...simplificar(P.slice(0, k + 1), tol).slice(0, -1), ...simplificar(P.slice(k), tol)];
}

// Quita las líneas que van pegadas a otras ya puestas (la otra calzada de una autovía, ramales)
function sinDuplicados(lineas, cerca = 0.0025) {
  const puestas = [];
  lineas
    .sort((a, b) => b.length - a.length)
    .forEach(l => {
      const pegados = l.filter(q => puestas.some(m => m.some(r => distancia(q, r) < cerca))).length;
      if (pegados < l.length * 0.7) puestas.push(l);
    });
  return puestas;
}

// Incrementos en milésimas de grado, como las lindes de la provincia (decodificarLinde, util.js)
function codificar(P) {
  const r = [];
  let la = 0,
    lo = 0;
  P.forEach(([a, b]) => {
    const A = Math.round(a * 1000),
      B = Math.round(b * 1000);
    if (r.length && A == la && B == lo) return;
    r.push(A - la, B - lo);
    la = A;
    lo = B;
  });
  return r;
}

const datos = process.argv[2] ? JSON.parse(fs.readFileSync(process.argv[2], 'utf8')) : descargar();
const salida = CARRETERAS.map(([ref, t, n]) => {
  const trozos = datos.elements
    .filter(e => e.type == 'way' && e.geometry && (e.tags.ref || '').split(';').includes(ref))
    .map(e => e.geometry.map(g => [g.lat, g.lon]));
  // Primero se simplifica fino para comparar calzadas y luego se deja a la escala del mapa
  const lineas = sinDuplicados(encadenar(trozos).map(l => simplificar(l, 0.0003)))
    .map(l => simplificar(l, 0.0012))
    .filter(l => largo(l) > 0.015); // fuera los trocitos de menos de 1,5 km (travesías, enlaces)
  const puntos = lineas.reduce((s, l) => s + l.length, 0);
  console.log(ref + ': ' + trozos.length + ' trozos → ' + lineas.length + ' líneas, ' + puntos + ' puntos');
  return { ref, t, n, l: lineas.map(codificar) };
});

fs.writeFileSync(
  path.join(RAIZ, 'js/datos/carreteras-provincia.js'),
  '// Autovías (t: a), carreteras nacionales (t: n) y la CL-517 (t: c) de la provincia, de OpenStreetMap (© colaboradores de\n' +
    '// OpenStreetMap, ODbL). Generado con node herramientas/carreteras-provincia.js: no editar a mano.\n' +
    '// l: líneas en incrementos de milésimas de grado [dLat, dLon, ...], como las lindes (decodificarLinde).\n' +
    'const CARRETERAS_PROVINCIA = [\n' +
    salida
      .map(
        c =>
          '  { ref: ' +
          JSON.stringify(c.ref) +
          ', t: ' +
          JSON.stringify(c.t) +
          ', n: ' +
          JSON.stringify(c.n) +
          ', l: ' +
          JSON.stringify(c.l) +
          ' }'
      )
      .join(',\n') +
    '\n];\n'
);
