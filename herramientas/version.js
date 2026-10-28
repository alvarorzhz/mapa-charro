// Prepara una versión nueva: pone en index.html y js/datos-globales.js la huella (?v=) de cada archivo y
// actualiza sw.js (número de versión y lista de archivos que se guardan para usar sin conexión).
// Uso, desde la raíz del repositorio:  node herramientas/version.js
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const leer = f => fs.readFileSync(path.join(RAIZ, f), 'utf8');
const escribir = (f, s) => fs.writeFileSync(path.join(RAIZ, f), s);

// Cada archivo de la app lleva en su dirección (?v=) una huella de su contenido: si no cambia, la dirección
// tampoco, y el navegador y el modo sin conexión siguen usando la copia que ya tienen. Solo se baja lo que
// ha cambiado de verdad (antes cada versión volvía a bajar todo).
const huella = f =>
  crypto
    .createHash('sha256')
    .update(fs.readFileSync(path.join(RAIZ, f)))
    .digest('hex')
    .slice(0, 10);

// 0. Novedades: novedades.json se queda con las últimas NOVEDADES_RECIENTES (se baja al entrar y se guarda
//    sin conexión); las demás pasan, la más nueva primero, a novedades-anteriores.json, que solo se pide al
//    pulsar «Ver las anteriores»
const NOVEDADES_RECIENTES = 10;
const novedades = JSON.parse(leer('novedades.json'));
if (novedades.length > NOVEDADES_RECIENTES) {
  const anteriores = fs.existsSync(path.join(RAIZ, 'novedades-anteriores.json'))
    ? JSON.parse(leer('novedades-anteriores.json'))
    : [];
  escribir(
    'novedades-anteriores.json',
    JSON.stringify([...novedades.slice(NOVEDADES_RECIENTES), ...anteriores], null, 2) + '\n'
  );
  escribir('novedades.json', JSON.stringify(novedades.slice(0, NOVEDADES_RECIENTES), null, 2) + '\n');
}

// El número interno (el de sw.js, que cambia la caché) sube en uno en cada versión
let sw = leer('sw.js');
const v = +(sw.match(/const VERSION = (\d+);/) || [0, 0])[1] + 1;

// 1. Los datos (js/datos/) son módulos que importa js/datos-globales.js: cada import, con la huella de su archivo
const PUENTE = 'js/datos-globales.js';
const puente = leer(PUENTE).replace(
  /from '\.\/(datos\/[^'?]+)(\?v=[^']*)?'/g,
  (_, f) => `from './${f}?v=${huella('js/' + f)}'`
);
escribir(PUENTE, puente);

// 2. index.html: la versión «humana» de package.json (1.4.0: la primera cifra para cambios grandes, la segunda
//    para funciones nuevas y la tercera para arreglos; se sube a mano en package.json, este script solo la
//    copia), el número interno y la huella de cada archivo enlazado con ?v= (después del puente, que acaba
//    de cambiar)
let html = leer('index.html');
const versionApp = JSON.parse(leer('package.json')).version;
const metas =
  '<meta name="version" content="' + versionApp + '"><meta name="version-interna" content="' + v + '">';
html = /<meta name="version" content="[^"]*">(<meta name="version-interna" content="[^"]*">)?/.test(html)
  ? html.replace(
      /<meta name="version" content="[^"]*">(<meta name="version-interna" content="[^"]*">)?/,
      metas
    )
  : html.replace('<meta charset="utf-8">', '<meta charset="utf-8">' + metas);
html = html.replace(/((?:src|href)=")([^"?#:]+)\?v=[^"]*"/g, (_, antes, f) => `${antes}${f}?v=${huella(f)}"`);
escribir('index.html', html);

// Lista de archivos para guardar sin conexión. Las fotos (img/) llevan su huella solo aquí: la app las pide
// sin ?v= y sw.js las busca sin mirarlo, pero así una foto que no cambia no se vuelve a bajar
const locales = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map(m => m[1])
  .filter(u => !/^(https?:|data:|#)/.test(u));
const datos = [...puente.matchAll(/from '\.\/(datos\/[^']+)'/g)].map(m => 'js/' + m[1]);
const carpeta = d =>
  fs
    .readdirSync(path.join(RAIZ, d))
    .filter(f => !f.startsWith('.'))
    .sort()
    .map(f => d + '/' + f);
const archivos = [
  ...new Set([
    './',
    'index.html',
    'manifest.webmanifest',
    ...locales,
    ...datos,
    ...carpeta('icons'),
    ...carpeta('img').map(f => f + '?v=' + huella(f))
  ])
];

for (const a of archivos) {
  const f = a.split('?')[0];
  if (f != './' && !fs.existsSync(path.join(RAIZ, f)))
    throw new Error('No existe ' + f + ' (referenciado en index.html o en ' + PUENTE + ')');
}

// 3. sw.js
sw = sw.replace(/const VERSION = \d+;/, 'const VERSION = ' + v + ';');
sw = sw.replace(
  /\/\/ <archivos>[\s\S]*?\/\/ <\/archivos>/,
  '// <archivos>\nconst ARCHIVOS = [\n' +
    archivos.map(a => "  '" + a + "'").join(',\n') + // sin coma final, como pide Prettier
    '\n];\n// </archivos>'
);
escribir('sw.js', sw);

console.log(
  'Versión ' + versionApp + ' (' + v + '): ' + archivos.length + ' archivos para usar sin conexión.'
);
