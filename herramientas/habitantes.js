// Habitantes de cada municipio de la provincia según el INE (cifras oficiales del Padrón municipal, tabla
// 2891 «Salamanca: Población por municipios y sexo»). La cifra de un municipio ya cuenta todas sus pedanías.
// Lo guarda en js/datos/habitantes.js. Uso:  node herramientas/habitantes.js
// (cada diciembre o enero el INE publica las cifras a 1 de enero de ese año: basta con volver a ejecutarlo)
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const RAIZ = path.join(__dirname, '..');
const TABLA = 2891;
const URL_TABLA = 'https://www.ine.es/jaxiT3/Tabla.htm?t=' + TABLA;

const { PROVINCIA } = vm.runInNewContext(
  fs.readFileSync(path.join(RAIZ, 'js/datos/provincia.js'), 'utf8') + ';({ PROVINCIA })',
  {}
);

const series = JSON.parse(
  execFileSync(
    'curl',
    ['-sS', '-m', '180', `https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/${TABLA}?nult=1&tip=AM`],
    { encoding: 'utf8', maxBuffer: 1 << 28 }
  )
);

const habitantes = {};
let anio = 0;
series.forEach(s => {
  const dato = (k, v) => s.MetaData.find(m => m.T3_Variable == k && (v === undefined || m.Codigo == v));
  const municipio = dato('Municipios');
  // Solo el total de personas (no por sexo) de cada municipio
  if (!municipio || !/^37\d{3}$/.test(municipio.Codigo) || !dato('Sexo', '0')) return;
  const d = s.Data[0];
  if (!d || d.Valor == null) return;
  habitantes[municipio.Codigo] = Math.round(d.Valor);
  anio = Math.max(anio, d.Anyo);
});

const faltan = PROVINCIA.m.filter(m => !(String(m.ine) in habitantes));
if (faltan.length) throw new Error('Sin habitantes en el INE: ' + faltan.map(m => m.n).join(', '));
const total = PROVINCIA.m.reduce((s, m) => s + habitantes[m.ine], 0);
console.log(`${PROVINCIA.m.length} municipios, ${total} habitantes a 1 de enero de ${anio}`);

const ordenados = Object.fromEntries(PROVINCIA.m.map(m => [m.ine, habitantes[m.ine]]));
fs.writeFileSync(
  path.join(RAIZ, 'js/datos/habitantes.js'),
  '// Habitantes de cada municipio (código INE: personas), con todas sus pedanías, según el Padrón municipal.\n' +
    '// Generado con node herramientas/habitantes.js: no editar a mano.\n' +
    'const HABITANTES = {\n' +
    `  fecha: '1 de enero de ${anio}',\n` +
    `  fuente: ['INE, Padrón municipal (cifras oficiales)', '${URL_TABLA}'],\n` +
    '  m: ' +
    JSON.stringify(ordenados) +
    '\n};\n'
);
