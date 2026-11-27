// Edificios de los monumentos para el mapa en 3D (js/mapa-3d.js): la planta y la altura del edificio de
// OpenStreetMap en el que cae el punto de cada monumento (MONUMENTOS), con sus partes (torres, cúpulas:
// building:part) si las tiene. En el 3D se pintan de otro color, un poco más anchos y altos que los edificios
// de OpenFreeMap para taparlos. Los monumentos cuyo punto no cae dentro de un edificio (puentes, parques,
// plazas abiertas) se quedan sin él. Los tejados con forma en OSM (cúpulas, chapiteles, a dos aguas) se
// hacen en rodajas. Lo guarda en js/datos/edificios-monumentos.js (qué monumentos tienen edificio) y en
// datos-3d/monumentos.json (las piezas), que el 3D pide al abrirse. Uso:
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
// Monumentos que son más de un edificio de OSM: el punto cae en uno y los demás se añaden aquí (la torre de
// las campanas de la Catedral Nueva está dibujada dentro de la planta de la Catedral Vieja)
const MAS_EDIFICIOS = { catedrales: ['way/59010501'] };

const resultado = [];
let sinEdificio = [];
for (const m of MONUMENTOS.filter(m => !SIN_EDIFICIO[m.id])) {
  const hallado = edificioDePunto([m.lo, m.la], edificios);
  if (!hallado) {
    sinEdificio.push(m.id);
    continue;
  }
  const { ed, cercano } = hallado;
  const mas = (MAS_EDIFICIOS[m.id] || []).map(id => {
    const otro = edificios.find(e => e.id == id);
    if (!otro) throw new Error(`${m.id}: no está el edificio ${id} en OSM`);
    return otro;
  });
  // Cada parte va solo con el primer edificio que la contiene, para no dibujarla dos veces
  const usadas = new Set();
  const piezas = [ed, ...mas].flatMap(e =>
    piezasDeEdificio(
      e,
      partes.filter(p => !usadas.has(p.id)),
      ENSANCHE,
      true,
      usadas
    )
  );
  resultado.push({ m: m.id, osm: ed.id, ...(mas.length ? { mas: mas.map(e => e.id) } : {}), piezas });
  console.log(
    `${m.id} → ${[ed, ...mas].map(e => e.id + ' ' + e.n).join(' + ')}${cercano ? ' (cercano)' : ''}`
  );
}

// La lista (qué monumento tiene edificio) va con la app; las piezas, aparte, en datos-3d/monumentos.json, que
// el 3D pide solo al abrirse (con los tejados pesan unos 200 KB)
fs.writeFileSync(
  path.join(RAIZ, 'js/datos/edificios-monumentos.js'),
  '// Monumentos con su edificio de OpenStreetMap en el mapa en 3D (las piezas, en datos-3d/monumentos.json).\n' +
    '// Generado por herramientas/edificios-monumentos.js: no editar a mano.\n' +
    'export const EDIFICIOS_MONUMENTOS = ' +
    JSON.stringify(resultado.map(({ piezas, ...e }) => e)) +
    ';\n'
);
const recortar = r => r.map(a => a.map(([x, y]) => [+x.toFixed(5), +y.toFixed(5)]));
fs.mkdirSync(path.join(RAIZ, 'datos-3d'), { recursive: true });
fs.writeFileSync(
  path.join(RAIZ, 'datos-3d/monumentos.json'),
  JSON.stringify({
    type: 'FeatureCollection',
    fuente: '© colaboradores de OpenStreetMap (ODbL). Generado por herramientas/edificios-monumentos.js',
    features: resultado.flatMap(e =>
      e.piezas.map(p => ({
        type: 'Feature',
        properties: { id: e.m, h: p.h, b: p.b, ...(p.t ? { t: 1 } : {}) },
        geometry: { type: 'Polygon', coordinates: recortar(p.r) }
      }))
    )
  })
);
console.log(
  `${resultado.length} monumentos con edificio (${resultado.reduce((s, e) => s + e.piezas.length, 0)} piezas); ` +
    `sin edificio: ${sinEdificio.join(', ')}`
);
