// Habitantes de cada municipio de la provincia según el INE (cifras oficiales del Padrón municipal, tabla
// 2891 «Salamanca: Población por municipios y sexo»). La cifra de un municipio ya cuenta todas sus pedanías.
// Lo guarda en js/datos/habitantes.js. Uso:  node herramientas/habitantes.js
// (cada diciembre o enero el INE publica las cifras a 1 de enero de ese año: basta con volver a ejecutarlo)
// Guarda también la serie anual de cada municipio para la evolución de la ficha (pueblos.js).
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

// Toda la serie anual (el INE la publica desde 1996; no hay cifras a 1 de enero de 1997). Uso:
//   node herramientas/habitantes.js [respuesta-guardada.json]   (sin argumento, la pide al INE)
const series = JSON.parse(
  process.argv[2]
    ? fs.readFileSync(process.argv[2], 'utf8')
    : execFileSync(
        'curl',
        ['-sS', '-m', '600', `https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/${TABLA}?nult=60&tip=AM`],
        { encoding: 'utf8', maxBuffer: 1 << 28 }
      )
);

// Por municipio: { año: [personas, tipo de dato del INE] }. Solo el total de personas (no por sexo).
const porMunicipio = {};
series.forEach(s => {
  const dato = (k, v) => s.MetaData.find(m => m.T3_Variable == k && (v === undefined || m.Codigo == v));
  const municipio = dato('Municipios');
  if (!municipio || !/^37\d{3}$/.test(municipio.Codigo) || !dato('Sexo', '0')) return;
  const serie = (porMunicipio[municipio.Codigo] = {});
  s.Data.forEach(d => {
    if (d.Valor != null && !d.Secreto) serie[d.Anyo] = [Math.round(d.Valor), d.T3_TipoDato || ''];
  });
});

const faltan = PROVINCIA.m.filter(m => !porMunicipio[m.ine] || !Object.keys(porMunicipio[m.ine]).length);
if (faltan.length) throw new Error('Sin habitantes en el INE: ' + faltan.map(m => m.n).join(', '));
const anios = [...new Set(PROVINCIA.m.flatMap(m => Object.keys(porMunicipio[m.ine]).map(Number)))].sort(
  (a, b) => a - b
);
const anio = anios[anios.length - 1];
// La cifra más reciente de cada municipio (la que sale en las fichas y en la pestaña Provincia)
const habitantes = Object.fromEntries(
  PROVINCIA.m.map(m => {
    const serie = porMunicipio[m.ine];
    if (!serie[anio]) throw new Error(`${m.n}: sin cifra de ${anio}`);
    return [m.ine, serie[anio][0]];
  })
);
// La serie de cada municipio, alineada con «anios» (null si ese año no hay cifra). Lo que el INE no da
// como «Definitivo» (provisional o estimado) se apunta aparte en «tipos» para distinguirlo en la ficha.
const serieDe = m => anios.map(a => (porMunicipio[m.ine][a] ? porMunicipio[m.ine][a][0] : null));
const tipos = {};
PROVINCIA.m.forEach(m =>
  anios.forEach((a, i) => {
    const d = porMunicipio[m.ine][a];
    if (d && d[1] != 'Definitivo') (tipos[m.ine] = tipos[m.ine] || {})[i] = d[1] || 'Sin clasificar';
  })
);
const total = PROVINCIA.m.reduce((s, m) => s + habitantes[m.ine], 0);
console.log(
  `${PROVINCIA.m.length} municipios, ${total} habitantes a 1 de enero de ${anio}; serie de ${anios[0]} a ${anio} ` +
    `(${anios.length} años), ${Object.keys(tipos).length} municipios con cifras no definitivas`
);

const serieTexto = PROVINCIA.m.map(m => `    "${m.ine}": ${JSON.stringify(serieDe(m))}`).join(',\n');
fs.writeFileSync(
  path.join(RAIZ, 'js/datos/habitantes.js'),
  '// Habitantes de cada municipio (código INE: personas), con todas sus pedanías, según el Padrón municipal.\n' +
    '// Generado con node herramientas/habitantes.js: no editar a mano.\n' +
    '// m: la cifra más reciente. serie: una cifra por año de «anios» (a 1 de enero; null si no la hay).\n' +
    '// tipos: { código: { posición en anios: tipo de dato del INE } } de las que no son definitivas.\n' +
    '// prettier-ignore\n' +
    'const HABITANTES = {\n' +
    `  fecha: '1 de enero de ${anio}',\n` +
    `  fuente: ['INE, Padrón municipal (cifras oficiales)', '${URL_TABLA}'],\n` +
    '  m: ' +
    JSON.stringify(habitantes) +
    ',\n' +
    `  anios: ${JSON.stringify(anios)},\n` +
    `  tipos: ${JSON.stringify(tipos)},\n` +
    '  serie: {\n' +
    serieTexto +
    '\n  }\n};\n'
);
