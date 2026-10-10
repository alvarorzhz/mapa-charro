// ESLint: busca variables sin definir, errores típicos y código que no se usa.
// La app son scripts clásicos que comparten el ámbito global (ver index.html), así que lo que un archivo
// declara arriba del todo lo pueden usar los demás: esa lista se saca aquí leyendo los propios archivos,
// y así una función renombrada o borrada salta como «no definida» en vez de fallar en silencio.
const fs = require('fs');
const path = require('path');
const espree = require('espree');
const js = require('@eslint/js');
const globals = require('globals');

const RAIZ = __dirname;
const archivosApp = dir =>
  fs
    .readdirSync(path.join(RAIZ, dir), { withFileTypes: true })
    .flatMap(e =>
      e.isDirectory()
        ? archivosApp(path.join(dir, e.name))
        : e.name.endsWith('.js')
          ? [path.join(dir, e.name)]
          : []
    );

// Nombres declarados arriba del todo en cada archivo de la app (const, let, var, function, class)
const globalesApp = {};
for (const archivo of archivosApp('js')) {
  const arbol = espree.parse(fs.readFileSync(path.join(RAIZ, archivo), 'utf8'), { ecmaVersion: 'latest' });
  for (const n of arbol.body) {
    if (n.type == 'VariableDeclaration')
      n.declarations.forEach(d => d.id.type == 'Identifier' && (globalesApp[d.id.name] = 'writable'));
    else if ((n.type == 'FunctionDeclaration' || n.type == 'ClassDeclaration') && n.id)
      globalesApp[n.id.name] = 'writable';
    // Un var dentro de un bloque { … } de arriba del todo también es global (mapa.js: limiteFoco)
    else if (n.type == 'BlockStatement')
      n.body
        .filter(m => m.type == 'VariableDeclaration' && m.kind == 'var')
        .forEach(m => m.declarations.forEach(d => (globalesApp[d.id.name] = 'writable')));
  }
}

module.exports = [
  {
    ignores: [
      'node_modules/**',
      'z/**',
      'js/datos/geometria.js',
      'js/datos/carreteras.js',
      'js/datos/provincia.js',
      'js/datos/alfoz.js',
      'js/datos/tramos.js'
    ]
  },
  js.configs.recommended,
  {
    files: ['js/**/*.js'],
    languageOptions: {
      sourceType: 'script',
      globals: { ...globals.browser, ...globalesApp, firebase: 'readonly' }
    },
    rules: {
      // Lo declarado arriba se usa desde otros archivos: solo se avisa de lo que sobra dentro de una función
      'no-unused-vars': ['error', { vars: 'local', args: 'none', caughtErrors: 'none' }],
      'no-redeclare': ['error', { builtinGlobals: false }],
      'no-empty': ['error', { allowEmptyCatch: true }]
    }
  },
  {
    files: ['sw.js'],
    languageOptions: { sourceType: 'script', globals: globals.serviceworker },
    rules: { 'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }] }
  },
  {
    // Herramientas de Node; el código que va dentro de page.evaluate() se ejecuta en la app
    files: ['herramientas/*.js', 'eslint.config.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { ...globals.node, ...globals.browser, ...globalesApp, axe: 'readonly' }
    },
    rules: {
      'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }],
      'no-empty': ['error', { allowEmptyCatch: true }]
    }
  }
];
