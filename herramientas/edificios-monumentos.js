// Edificios de los monumentos para el mapa en 3D (js/mapa-3d.js): la planta y la altura del edificio de
// OpenStreetMap en el que cae el punto de cada monumento (MONUMENTOS), con sus partes (torres, cúpulas:
// building:part) si las tiene. En el 3D se pintan de otro color, un poco más anchos y altos que los edificios
// de OpenFreeMap para taparlos. Los monumentos cuyo punto no cae dentro de un edificio (puentes, parques,
// plazas abiertas) se quedan sin él. Lo guarda en js/datos/edificios-monumentos.js. Uso:
//   node herramientas/edificios-monumentos.js            (descarga de Overpass)
//   node herramientas/edificios-monumentos.js datos.json (desde una respuesta de Overpass ya guardada)
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');
const { sinExport } = require('./datos');

const RAIZ = path.join(__dirname, '..');
const ENSANCHE = 0.7; // metros que se ensancha cada planta para tapar las paredes del edificio de debajo
const SERVIDORES = [
  'https://overpass-api.de/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter'
];

const contexto = {};
vm.runInNewContext(
  sinExport(fs.readFileSync(path.join(RAIZ, 'js/datos/monumentos.js'), 'utf8')) + ';this.M = MONUMENTOS;',
  contexto
);
const MONUMENTOS = contexto.M;
const las = MONUMENTOS.map(m => m.la),
  los = MONUMENTOS.map(m => m.lo),
  caja = [
    Math.min(...las) - 0.002,
    Math.min(...los) - 0.002,
    Math.max(...las) + 0.002,
    Math.max(...los) + 0.002
  ]
    .map(v => v.toFixed(4))
    .join(',');
const CONSULTA = `[out:json][timeout:180];
(
 way["building"](${caja});
 relation["building"]["type"="multipolygon"](${caja});
 way["building:part"](${caja});
);
out body geom;`;

function descargar() {
  for (const url of SERVIDORES) {
    try {
      const texto = execFileSync(
        'curl',
        [
          '-sS',
          '-m',
          '240',
          '-A',
          'mapa-charro (github.com/alvarorzhz/mapa-charro)',
          '--data-urlencode',
          'data=' + CONSULTA,
          url
        ],
        { encoding: 'utf8', maxBuffer: 1 << 29 }
      );
      const datos = JSON.parse(texto);
      if (datos.elements && datos.elements.length) return datos;
    } catch (e) {
      console.warn('Falla ' + url + ': ' + e.message.split('\n')[0]);
    }
  }
  throw new Error('Ningún servidor de Overpass ha respondido');
}
const datos = process.argv[2] ? JSON.parse(fs.readFileSync(process.argv[2], 'utf8')) : descargar();

// --- Geometría (en metros alrededor de un punto, para ensanchar y medir) -----------------------------
const anillo = geometria => geometria.map(p => [p.lon, p.lat]);
const cerrado = r => r.length > 3 && r[0][0] == r[r.length - 1][0] && r[0][1] == r[r.length - 1][1];
// Une los trozos de los «outer» de una relación en anillos cerrados
function unirTrozos(trozos) {
  const anillos = [],
    sueltos = trozos.map(t => [...t]);
  while (sueltos.length) {
    let r = sueltos.shift();
    for (let cambio = true; cambio && !cerrado(r);) {
      cambio = false;
      for (let i = 0; i < sueltos.length; i++) {
        const t = sueltos[i],
          fin = r[r.length - 1],
          igual = (a, b) => a[0] == b[0] && a[1] == b[1];
        if (igual(fin, t[0])) r = r.concat(t.slice(1));
        else if (igual(fin, t[t.length - 1])) r = r.concat([...t].reverse().slice(1));
        else continue;
        sueltos.splice(i, 1);
        cambio = true;
        break;
      }
    }
    if (cerrado(r)) anillos.push(r);
  }
  return anillos;
}
const dentroDe = ([x, y], r) => {
  let si = false;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++)
    if (
      r[i][1] > y != r[j][1] > y &&
      x < ((r[j][0] - r[i][0]) * (y - r[i][1])) / (r[j][1] - r[i][1]) + r[i][0]
    )
      si = !si;
  return si;
};
const areaM2 = r => {
  const k = 111320 * Math.cos((r[0][1] * Math.PI) / 180);
  let a = 0;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++)
    a += (r[j][0] - r[i][0]) * k * (r[j][1] + r[i][1]) * 111320;
  return Math.abs(a / 2);
};
const centro = r => {
  const p = r.slice(0, -1);
  return [p.reduce((s, q) => s + q[0], 0) / p.length, p.reduce((s, q) => s + q[1], 0) / p.length];
};
// Ensancha un anillo ENSANCHE metros desde su centro (basta para tapar las paredes de debajo); con
// hacia = -1 lo estrecha (los patios, para que tampoco asomen sus paredes)
function ensanchar(r, hacia = 1) {
  const [cx, cy] = centro(r),
    k = 111320 * Math.cos((cy * Math.PI) / 180);
  return r.map(([x, y]) => {
    const dx = (x - cx) * k,
      dy = (y - cy) * 111320,
      d = Math.hypot(dx, dy) || 1,
      f = Math.max(0.1, (d + hacia * ENSANCHE) / d);
    return [+(cx + (dx * f) / k).toFixed(6), +(cy + (dy * f) / 111320).toFixed(6)];
  });
}
// Altura como la calcula OpenMapTiles (render_height): height, o plantas × 3,66 m; si no, 5 m
const metros = v => {
  const n = parseFloat(String(v || '').replace(',', '.'));
  return isFinite(n) ? n : null;
};
const altura = t =>
  metros(t.height) ?? (metros(t['building:levels']) != null ? metros(t['building:levels']) * 3.66 : 5);
const base = t =>
  metros(t.min_height) ??
  (metros(t['building:min_level']) != null ? metros(t['building:min_level']) * 3.66 : 0);

// --- Edificios y partes ------------------------------------------------------------------------------
const edificios = [],
  partes = [];
for (const e of datos.elements) {
  const t = e.tags || {};
  let anillos = [],
    patios = [];
  const trozos = papel =>
    unirTrozos((e.members || []).filter(m => m.role == papel && m.geometry).map(m => anillo(m.geometry)));
  if (e.type == 'way' && e.geometry) anillos = [anillo(e.geometry)].filter(cerrado);
  else if (e.type == 'relation') [anillos, patios] = [trozos('outer'), trozos('inner')];
  if (!anillos.length) continue;
  const elemento = { id: e.type + '/' + e.id, n: t.name || '', t, anillos, patios };
  (t['building:part'] && !t.building ? partes : edificios).push(elemento);
}

const CERCA = 30;
// Monumentos que no son un edificio, o cuyo punto cae en el edificio de al lado: sin edificio
const SIN_EDIFICIO = {
  huerto: 'es un jardín',
  cueva: 'es una cripta bajo una plaza',
  helmantico: 'el punto cae en el hotel de al lado del estadio'
};
const distanciaM = ([x, y], r) => {
  const k = 111320 * Math.cos((y * Math.PI) / 180);
  let menor = Infinity;
  for (let i = 1; i < r.length; i++) {
    const ax = (r[i - 1][0] - x) * k,
      ay = (r[i - 1][1] - y) * 111320,
      bx = (r[i][0] - x) * k,
      by = (r[i][1] - y) * 111320,
      dx = bx - ax,
      dy = by - ay,
      t = Math.max(0, Math.min(1, -(ax * dx + ay * dy) / (dx * dx + dy * dy || 1)));
    menor = Math.min(menor, Math.hypot(ax + t * dx, ay + t * dy));
  }
  return menor;
};
const destacado = t =>
  !!(t.name || t.historic || t.heritage || t.tourism || t.amenity == 'place_of_worship') ||
  /^(church|cathedral|chapel|university|palace|monastery|convent|museum|civic|public)$/.test(t.building);
function cercano(punto) {
  const lista = edificios
    .map(e => ({ e, d: Math.min(...e.anillos.map(r => distanciaM(punto, r))) }))
    .filter(x => x.d < CERCA)
    .sort((a, b) => a.d - b.d);
  const conNombre = lista.find(x => destacado(x.e.t));
  return conNombre ? conNombre.e : lista[0] && lista[0].d < CERCA / 2 ? lista[0].e : null;
}

const resultado = [];
let sinEdificio = [];
for (const m of MONUMENTOS.filter(m => !SIN_EDIFICIO[m.id])) {
  const punto = [m.lo, m.la],
    candidatos = edificios
      .filter(e => e.anillos.some(r => dentroDe(punto, r)))
      .sort((a, b) => areaM2(a.anillos[0]) - areaM2(b.anillos[0]));
  // Si el punto cae en la calle o en un patio: el edificio con nombre o histórico más cercano (a menos de
  // CERCA metros); si no hay ninguno, el más cercano a menos de la mitad
  const ed = candidatos[0] || cercano(punto);
  if (!ed) {
    sinEdificio.push(m.id);
    continue;
  }
  const suyas = partes.filter(p => ed.anillos.some(r => dentroDe(centro(p.anillos[0]), r)));
  // Cada pieza: su planta y, si los tiene, sus patios (anillos interiores)
  const piezas = [ed, ...suyas].flatMap(p =>
    p.anillos.map(r => ({
      h: +altura(p.t).toFixed(1),
      b: +base(p.t).toFixed(1),
      r: [ensanchar(r), ...p.patios.filter(q => dentroDe(centro(q), r)).map(q => ensanchar(q, -1))]
    }))
  );
  // La planta del edificio llega hasta la más alta de sus partes si no tiene altura propia
  if (suyas.length && piezas[0].h <= 5) piezas[0].h = Math.min(...suyas.map(p => altura(p.t)), 15);
  resultado.push({ m: m.id, osm: ed.id, piezas });
  console.log(`${m.id} → ${ed.id} ${ed.n}${candidatos[0] ? '' : ' (cercano)'}`);
}

const archivo = path.join(RAIZ, 'js/datos/edificios-monumentos.js');
fs.writeFileSync(
  archivo,
  '// Edificios de los monumentos para el mapa en 3D (anillos r: planta ensanchada y patios; altura h y base b,\n' +
    '// en metros), de OpenStreetMap (© colaboradores de OpenStreetMap, ODbL). Generado por\n' +
    '// herramientas/edificios-monumentos.js: no editar a mano.\n' +
    'export const EDIFICIOS_MONUMENTOS = ' +
    JSON.stringify(resultado) +
    ';\n'
);
console.log(
  `${resultado.length} monumentos con edificio (${resultado.reduce((s, e) => s + e.piezas.length, 0)} piezas); ` +
    `sin edificio: ${sinEdificio.join(', ')}`
);
