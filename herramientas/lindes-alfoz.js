// Descarga de OpenStreetMap (Nominatim) el término municipal de cada pueblo de alrededor del mapa de
// la ciudad (ALFOZ en js/datos/provincia.js) y lo guarda en js/datos/alfoz.js como LIMITES_ALFOZ, el
// del propio municipio de Salamanca como TERMINO_SALAMANCA (el campo entre la ciudad y los pueblos) y
// el de los demás municipios que asoman por el mapa (Valverdón, Monterrubio…) como LIMITES_VECINOS: las
// lindes de la pestaña Provincia son demasiado bastas para verlas de cerca junto a las otras.
// Uso, desde la raíz del repositorio:  node herramientas/lindes-alfoz.js
// Solo hace falta volver a ejecutarlo si se añade un pueblo o cambian los límites en OpenStreetMap.
// Usa curl (respeta el proxy del sistema) y espera entre peticiones, como pide Nominatim.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const RAIZ = path.join(__dirname, '..');
const { ALFOZ, ZONAS, PROVINCIA } = vm.runInNewContext(
  ['zonas', 'provincia']
    .map(f => fs.readFileSync(path.join(RAIZ, 'js/datos/' + f + '.js'), 'utf8'))
    .join('\n;\n') + ';({ ALFOZ, ZONAS, PROVINCIA })',
  {}
);
// La proyección del mapa, tal cual está en js/util.js
const proyectar = vm.runInNewContext(
  fs.readFileSync(path.join(RAIZ, 'js/util.js'), 'utf8').match(/const proyectar = ([^;]+);/)[1]
);
const UMBRAL = 0.0001, // simplificación de Nominatim en grados (unos 10 m)
  UMBRAL_VECINOS = 0.0003; // los vecinos son solo fondo: unos 30 m bastan y pesan menos
const esperar = ms => execFileSync('sleep', [String(ms / 1000)]);

function buscar(nombre, umbral = UMBRAL) {
  const url =
    'https://nominatim.openstreetmap.org/search?format=json&polygon_geojson=1&polygon_threshold=' +
    umbral +
    '&countrycodes=es&q=' +
    encodeURIComponent(nombre + ', Salamanca, Castilla y León');
  // Si Nominatim pide calma (responde con un error en XML en vez de JSON), se espera y se reintenta
  let r;
  for (let intento = 1; !r; intento++) {
    const texto = execFileSync('curl', [
      '-s',
      '--max-time',
      '60',
      '-A',
      'mapa-charro (github.com/alvarorzhz/mapa-charro)',
      url
    ]).toString();
    try {
      r = JSON.parse(texto);
    } catch (e) {
      if (intento == 5) throw new Error('Nominatim no responde para ' + nombre + ': ' + texto.slice(0, 200));
      console.log('  (Nominatim pide esperar; reintento ' + intento + ')');
      esperar(intento * 10000);
    }
  }
  const termino = r.find(
    x => x.osm_type == 'relation' && x.class == 'boundary' && x.type == 'administrative' && x.geojson
  );
  if (!termino) throw new Error('Sin término municipal para ' + nombre);
  return termino;
}

// ¿Está el punto (lon, lat) dentro del anillo [[lon, lat]...]?
const dentro = (anillo, lo, la) => {
  let d = false;
  for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
    const [xi, yi] = anillo[i],
      [xj, yj] = anillo[j];
    if (yi > la != yj > la && lo < ((xj - xi) * (la - yi)) / (yj - yi) + xi) d = !d;
  }
  return d;
};

// Área con signo (para quedarse con el anillo exterior más grande)
const area = anillo =>
  anillo.reduce(
    (s, p, i) => s + p[0] * anillo[(i + 1) % anillo.length][1] - anillo[(i + 1) % anillo.length][0] * p[1],
    0
  ) / 2;

const limites = {},
  vecinos = {},
  fuentes = [];
for (const [nombre, id] of Object.entries(ALFOZ)) {
  const t = buscar(nombre),
    g = t.geojson,
    poligonos = g.type == 'Polygon' ? [g.coordinates] : g.coordinates,
    // El trozo donde está el pueblo (los términos con enclaves traen varios); si no, el más grande
    [, , , , la, lo] = ZONAS.find(z => z[0] == id),
    exteriores = poligonos.map(p => p[0]),
    exterior =
      exteriores.find(a => dentro(a, lo, la)) ||
      exteriores.sort((a, b) => Math.abs(area(b)) - Math.abs(area(a)))[0];
  limites[id] = exterior.slice(0, -1).map(([lo, la]) => [+la.toFixed(5), +lo.toFixed(5)]);
  fuentes.push(nombre + ': relación ' + t.osm_id);
  console.log(nombre.padEnd(28), 'relación', t.osm_id, '·', limites[id].length, 'puntos');
  esperar(1200);
}

// El término de Salamanca (un solo polígono, el que contiene el centro)
const sal = buscar('Salamanca'),
  pSal = sal.geojson.type == 'Polygon' ? [sal.geojson.coordinates] : sal.geojson.coordinates,
  exteriorSal = pSal.map(p => p[0]).find(a => dentro(a, -5.6645, 40.9652)) || pSal[0][0],
  termino = exteriorSal.slice(0, -1).map(([lo, la]) => [+la.toFixed(5), +lo.toFixed(5)]);
fuentes.push('Salamanca: relación ' + sal.osm_id);
console.log('Salamanca'.padEnd(28), 'relación', sal.osm_id, '·', termino.length, 'puntos');

// Los demás municipios que caen, aunque sea en parte, dentro del lienzo del mapa (400×480)
const decodificar = r => {
  let la = 0,
    lo = 0;
  const puntos = [];
  for (let i = 0; i < r.length; i += 2) puntos.push([(la += r[i]) / 1000, (lo += r[i + 1]) / 1000]);
  return puntos;
};
const enLienzo = m => {
  const P = m.r.flatMap(decodificar).map(q => proyectar(q[0], q[1])),
    xs = P.map(q => q[0]),
    ys = P.map(q => q[1]);
  return !(Math.max(...xs) < 0 || Math.min(...xs) > 400 || Math.max(...ys) < 0 || Math.min(...ys) > 480);
};
for (const m of PROVINCIA.m.filter(m => !ALFOZ[m.n] && m.n != 'Salamanca' && enLienzo(m))) {
  esperar(1200);
  const t = buscar(m.n, UMBRAL_VECINOS),
    g = t.geojson,
    poligonos = g.type == 'Polygon' ? [g.coordinates] : g.coordinates;
  // Todos los trozos (algún término tiene enclaves), solo el anillo exterior de cada uno
  vecinos[m.n] = poligonos.map(p => p[0].slice(0, -1).map(([lo, la]) => [+la.toFixed(5), +lo.toFixed(5)]));
  fuentes.push(m.n + ': relación ' + t.osm_id);
  console.log(m.n.padEnd(28), 'relación', t.osm_id, '·', vecinos[m.n].flat().length, 'puntos');
}

const salida =
  '// Términos municipales de los pueblos de alrededor del mapa de la ciudad, de Salamanca y de los\n// municipios vecinos que asoman por el mapa, [lat, lon].\n' +
  '// © colaboradores de OpenStreetMap (ODbL), vía Nominatim, simplificados a unos 10 m (los vecinos, a 30 m).\n' +
  '// Generado con node herramientas/lindes-alfoz.js; no editar a mano.\n' +
  '// ' +
  fuentes.join(' · ') +
  '\n' +
  'const LIMITES_ALFOZ=' +
  JSON.stringify(limites) +
  ';\n' +
  'const TERMINO_SALAMANCA=' +
  JSON.stringify(termino) +
  ';\n' +
  '// Municipios vecinos que asoman por el mapa: { nombre: [anillo, …] }\n' +
  'const LIMITES_VECINOS=' +
  JSON.stringify(vecinos) +
  ';\n';
fs.writeFileSync(path.join(RAIZ, 'js/datos/alfoz.js'), salida);
console.log(
  'js/datos/alfoz.js: ' +
    Object.keys(limites).length +
    ' términos y ' +
    Object.keys(vecinos).length +
    ' vecinos'
);
