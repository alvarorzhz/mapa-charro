// Descarga de OpenStreetMap (Nominatim) el término municipal de cada pueblo de alrededor del mapa de
// la ciudad (ALFOZ en js/datos/provincia.js) y lo guarda en js/datos/alfoz.js como LIMITES_ALFOZ, y el
// del propio municipio de Salamanca como TERMINO_SALAMANCA (el campo entre la ciudad y los pueblos).
// Uso, desde la raíz del repositorio:  node herramientas/lindes-alfoz.js
// Solo hace falta volver a ejecutarlo si se añade un pueblo o cambian los límites en OpenStreetMap.
// Usa curl (respeta el proxy del sistema) y espera entre peticiones, como pide Nominatim.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const RAIZ = path.join(__dirname, '..');
const { ALFOZ, ZONAS } = vm.runInNewContext(
  ['zonas', 'provincia']
    .map(f => fs.readFileSync(path.join(RAIZ, 'js/datos/' + f + '.js'), 'utf8'))
    .join('\n;\n') + ';({ ALFOZ, ZONAS })',
  {}
);
const UMBRAL = 0.0001; // simplificación de Nominatim en grados (unos 10 m)
const esperar = ms => execFileSync('sleep', [String(ms / 1000)]);

function buscar(nombre) {
  const url =
    'https://nominatim.openstreetmap.org/search?format=json&polygon_geojson=1&polygon_threshold=' +
    UMBRAL +
    '&countrycodes=es&q=' +
    encodeURIComponent(nombre + ', Salamanca, Castilla y León');
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

const salida =
  '// Términos municipales de los pueblos de alrededor del mapa de la ciudad y de Salamanca, [lat, lon].\n' +
  '// © colaboradores de OpenStreetMap (ODbL), vía Nominatim, simplificados a unos 10 m.\n' +
  '// Generado con node herramientas/lindes-alfoz.js; no editar a mano.\n' +
  '// ' +
  fuentes.join(' · ') +
  '\n' +
  'const LIMITES_ALFOZ=' +
  JSON.stringify(limites) +
  ';\n' +
  'const TERMINO_SALAMANCA=' +
  JSON.stringify(termino) +
  ';\n';
fs.writeFileSync(path.join(RAIZ, 'js/datos/alfoz.js'), salida);
console.log('js/datos/alfoz.js: ' + Object.keys(limites).length + ' términos');
