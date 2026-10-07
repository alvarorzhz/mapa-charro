// Prepara una versión nueva: sube ?v=N en index.html y actualiza sw.js
// (número de versión y lista de archivos que se guardan para usar sin conexión).
// Uso, desde la raíz del repositorio:  node herramientas/version.js
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const leer = f => fs.readFileSync(path.join(RAIZ, f), 'utf8');
const escribir = (f, s) => fs.writeFileSync(path.join(RAIZ, f), s);

// 1. index.html: todas las etiquetas al número siguiente
let html = leer('index.html');
const usadas = [...html.matchAll(/\?v=(\d+)"/g)].map(m => +m[1]);
const v = Math.max(0, ...usadas) + 1;
html = html.replace(/\?v=\d+"/g, '?v=' + v + '"');
escribir('index.html', html);

// 2. Lista de archivos para guardar sin conexión
const locales = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(m => m[1]).filter(u => !/^(https?:|data:|#)/.test(u));
const carpeta = d => fs.readdirSync(path.join(RAIZ, d)).filter(f => !f.startsWith('.')).sort().map(f => d + '/' + f);
const archivos = [...new Set(['./', 'index.html', 'manifest.webmanifest', ...locales, ...carpeta('icons'), ...carpeta('img')])];

for (const a of archivos) {
  const f = a.split('?')[0];
  if (f != './' && !fs.existsSync(path.join(RAIZ, f))) throw new Error('No existe ' + f + ' (referenciado en index.html)');
}

// 3. sw.js
let sw = leer('sw.js');
sw = sw.replace(/const VERSION = \d+;/, 'const VERSION = ' + v + ';');
sw = sw.replace(/\/\/ <archivos>[\s\S]*?\/\/ <\/archivos>/, '// <archivos>\nconst ARCHIVOS = [\n' + archivos.map(a => "  '" + a + "',").join('\n') + '\n];\n// </archivos>');
escribir('sw.js', sw);

console.log('Versión ' + v + ': ' + archivos.length + ' archivos para usar sin conexión.');
