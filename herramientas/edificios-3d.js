// Edificios de OpenStreetMap para el mapa en 3D (js/mapa-3d.js) que se piden solo al abrirlo:
//  - los del centro histórico de la capital (las zonas del grupo «Centro histórico», como cascoEnGeojson), que
//    se pintan en la piedra de Villamayor por encima de los de OpenFreeMap (un poco más anchos y altos);
//  - los de las paradas de las rutas por la provincia que son un edificio (PARADAS_CON_EDIFICIO), en dorado
//    como los monumentos de la capital, con un punto para su nombre.
// Lo guarda en datos-3d/edificios.json (GeoJSON). Uso:
//   node herramientas/edificios-3d.js            (descarga de Overpass)
//   node herramientas/edificios-3d.js datos.json (desde una respuesta de Overpass ya guardada)
const fs = require('fs');
const path = require('path');
const http = require('http');
const vm = require('vm');
const { sinExport } = require('./datos');
const {
  descargar,
  dentroDe,
  centro,
  ensanchar,
  simplificar,
  altura,
  base,
  edificiosYPartes,
  edificioDePunto,
  piezasDeEdificio
} = require('./edificios-osm');

const RAIZ = path.join(__dirname, '..');
const ENSANCHE_CASCO = 0.5; // metros: tapa el edificio de OpenFreeMap sin comerse las calles estrechas
const ENSANCHE_PROVINCIA = 0.7;
const DECIMALES = 5; // ~1 m: basta para un edificio y el archivo pesa menos
const SIMPLIFICAR = 0.4; // metros: puntos de las plantas del centro histórico que no cambian su forma
// Paradas de RUTAS_PROVINCIA que son un edificio (las demás son miradores, pueblos enteros o paisajes)
const PARADAS_CON_EDIFICIO = [
  'pena-francia',
  'hinojosa-cristo',
  'crcatedral',
  'crplaza',
  'crcastillo',
  'sanfelices',
  'guijuelo',
  'convento-carmelitas',
  'torre-armeria',
  'santiago-alfareria',
  'santa-maria-ledesma'
];

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch (e) {
  const global = require('child_process').execSync('npm root -g', { encoding: 'utf8' }).trim();
  ({ chromium } = require(path.join(global, 'playwright')));
}

// El polígono del centro histórico sale de la propia app (cascoEnGeojson, mapa-3d.js): las zonas se
// recortan en el navegador (construirZonas, mapa.js)
async function poligonoCasco() {
  const tipos = { '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
  const srv = http.createServer((req, res) => {
    const archivo = path.join(RAIZ, decodeURIComponent(req.url.split('?')[0]).replace(/\/$/, '/index.html'));
    fs.readFile(archivo, (e, d) => {
      if (e) return res.writeHead(404).end();
      res.writeHead(200, { 'Content-Type': tipos[path.extname(archivo)] || 'text/html' }).end(d);
    });
  });
  await new Promise(r => srv.listen(0, r));
  const navegador = await chromium.launch(
    process.env.PRUEBAS_NAVEGADOR ? { executablePath: process.env.PRUEBAS_NAVEGADOR } : {}
  );
  const pagina = await navegador.newPage();
  await pagina.goto(`http://localhost:${srv.address().port}/`);
  await pagina.waitForFunction(() => typeof cascoEnGeojson == 'function' && zonas.every(z => z.g || z.P));
  const casco = await pagina.evaluate(() => cascoEnGeojson());
  await navegador.close();
  srv.close();
  return casco.coordinates.map(p => p[0]);
}

(async () => {
  const casco = await poligonoCasco();
  const contexto = {};
  vm.runInNewContext(
    sinExport(fs.readFileSync(path.join(RAIZ, 'js/datos/rutas-provincia.js'), 'utf8')) +
      ';this.R = RUTAS_PROVINCIA;',
    contexto
  );
  vm.runInNewContext(
    sinExport(fs.readFileSync(path.join(RAIZ, 'js/datos/edificios-monumentos.js'), 'utf8')) +
      ';this.E = EDIFICIOS_MONUMENTOS;',
    contexto
  );
  const paradas = contexto.R.flatMap(r => r.paradas).filter(p => PARADAS_CON_EDIFICIO.includes(p.id));
  // Los edificios de los monumentos ya van en dorado (datos-3d/monumentos.json): si también fueran en piedra,
  // las dos capas casi a la misma altura parpadearían al moverse
  const deMonumentos = new Set(contexto.E.flatMap(e => [e.osm, ...(e.mas || [])]));
  const puntos = casco.flat(),
    caja = [
      Math.min(...puntos.map(p => p[1])),
      Math.min(...puntos.map(p => p[0])),
      Math.max(...puntos.map(p => p[1])),
      Math.max(...puntos.map(p => p[0]))
    ]
      .map(v => v.toFixed(4))
      .join(',');
  const cerca = paradas.map(p => `(around:80,${p.la},${p.lo})`);
  const consulta = `[out:json][timeout:180];
(
 way["building"](${caja});
 relation["building"]["type"="multipolygon"](${caja});
${cerca.map(c => ` way["building"]${c};\n relation["building"]["type"="multipolygon"]${c};\n way["building:part"]${c};`).join('\n')}
);
out body geom;`;
  const datos = process.argv[2] ? JSON.parse(fs.readFileSync(process.argv[2], 'utf8')) : descargar(consulta);
  const { edificios, partes } = edificiosYPartes(datos);
  const features = [];

  // Centro histórico: cada edificio cuyo centro cae dentro (sin sus partes: basta la planta y la altura),
  // menos los de los monumentos
  let enCasco = 0;
  for (const ed of edificios.filter(e => !deMonumentos.has(e.id)))
    for (const r of ed.anillos) {
      if (!casco.some(c => dentroDe(centro(r), c))) continue;
      enCasco++;
      features.push({
        type: 'Feature',
        properties: { c: 1, h: +altura(ed.t).toFixed(1), b: +base(ed.t).toFixed(1) },
        geometry: {
          type: 'Polygon',
          coordinates: [
            ensanchar(simplificar(r, SIMPLIFICAR), ENSANCHE_CASCO, 1, DECIMALES),
            ...ed.patios
              .filter(q => dentroDe(centro(q), r))
              .map(q => ensanchar(simplificar(q, SIMPLIFICAR), ENSANCHE_CASCO, -1, DECIMALES))
          ]
        }
      });
    }

  // Paradas de la provincia: su edificio en dorado y un punto con su nombre
  const sinEdificio = [];
  for (const p of paradas) {
    const hallado = edificioDePunto([p.lo, p.la], edificios);
    if (!hallado) {
      sinEdificio.push(p.id);
      continue;
    }
    const { ed, cercano } = hallado;
    for (const pieza of piezasDeEdificio(ed, partes, ENSANCHE_PROVINCIA))
      features.push({
        type: 'Feature',
        properties: { p: p.id, h: pieza.h, b: pieza.b },
        geometry: { type: 'Polygon', coordinates: pieza.r }
      });
    features.push({
      type: 'Feature',
      properties: { p: p.id, n: p.n },
      geometry: { type: 'Point', coordinates: [p.lo, p.la] }
    });
    console.log(`${p.id} → ${ed.id} ${ed.n}${cercano ? ' (cercano)' : ''}`);
  }

  fs.mkdirSync(path.join(RAIZ, 'datos-3d'), { recursive: true });
  fs.writeFileSync(
    path.join(RAIZ, 'datos-3d/edificios.json'),
    JSON.stringify({
      type: 'FeatureCollection',
      fuente: '© colaboradores de OpenStreetMap (ODbL). Generado por herramientas/edificios-3d.js',
      features
    })
  );
  console.log(
    `${enCasco} edificios en el centro histórico; ${paradas.length - sinEdificio.length} paradas con ` +
      `edificio; sin edificio: ${sinEdificio.join(', ') || 'ninguna'}`
  );
})();
