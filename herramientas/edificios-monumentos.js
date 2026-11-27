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
const { sinExport } = require('./datos');
const { descargar, edificiosYPartes, edificioDePunto, piezasDeEdificio } = require('./edificios-osm');

const RAIZ = path.join(__dirname, '..');
const ENSANCHE = 0.7; // metros que se ensancha cada planta para tapar las paredes del edificio de debajo

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

const datos = process.argv[2] ? JSON.parse(fs.readFileSync(process.argv[2], 'utf8')) : descargar(CONSULTA);
const { edificios, partes } = edificiosYPartes(datos);

// Monumentos que no son un edificio, o cuyo punto cae en el edificio de al lado: sin edificio
const SIN_EDIFICIO = {
  huerto: 'es un jardín',
  cueva: 'es una cripta bajo una plaza',
  helmantico: 'el punto cae en el hotel de al lado del estadio'
};

const resultado = [];
let sinEdificio = [];
for (const m of MONUMENTOS.filter(m => !SIN_EDIFICIO[m.id])) {
  const hallado = edificioDePunto([m.lo, m.la], edificios);
  if (!hallado) {
    sinEdificio.push(m.id);
    continue;
  }
  const { ed, cercano } = hallado;
  resultado.push({ m: m.id, osm: ed.id, piezas: piezasDeEdificio(ed, partes, ENSANCHE) });
  console.log(`${m.id} → ${ed.id} ${ed.n}${cercano ? ' (cercano)' : ''}`);
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
