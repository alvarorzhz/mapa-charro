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
// Dónde se declara cada nombre: si dos archivos usan el mismo, el segundo pisaría al primero sin avisar
const archivoDe = {};
const repetidos = [];
const apuntar = (nombre, archivo) => {
  if (archivoDe[nombre] && archivoDe[nombre] != archivo)
    repetidos.push(`${nombre} (${archivoDe[nombre]} y ${archivo})`);
  archivoDe[nombre] = archivo;
  globalesApp[nombre] = 'writable';
};
// Los datos (js/datos/) y su puente (js/datos-globales.js) son módulos; el resto, scripts clásicos
const MODULOS = ['js/datos/**/*.js', 'js/datos-globales.js'];
const esModulo = archivo =>
  archivo.startsWith(path.join('js', 'datos') + path.sep) || archivo == path.join('js', 'datos-globales.js');
for (const archivo of archivosApp('js')) {
  const arbol = espree.parse(fs.readFileSync(path.join(RAIZ, archivo), 'utf8'), {
    ecmaVersion: 'latest',
    sourceType: esModulo(archivo) ? 'module' : 'script'
  });
  // Lo que exporta un archivo de datos acaba en globalThis (lo pone ahí js/datos-globales.js)
  const cuerpo = arbol.body.map(n => (n.type == 'ExportNamedDeclaration' && n.declaration) || n);
  for (const n of cuerpo) {
    if (n.type == 'VariableDeclaration')
      n.declarations.forEach(d => d.id.type == 'Identifier' && apuntar(d.id.name, archivo));
    else if ((n.type == 'FunctionDeclaration' || n.type == 'ClassDeclaration') && n.id)
      apuntar(n.id.name, archivo);
    // Un var dentro de un bloque { … } de arriba del todo también es global (mapa-fondo.js: limiteFoco)
    else if (n.type == 'BlockStatement')
      n.body
        .filter(m => m.type == 'VariableDeclaration' && m.kind == 'var')
        .forEach(m => m.declarations.forEach(d => apuntar(d.id.name, archivo)));
  }
}
if (repetidos.length) throw new Error('Nombres declarados en dos archivos de js/: ' + repetidos.join(', '));

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
      'no-empty': ['error', { allowEmptyCatch: true }],
      // Seguridad: el HTML se construye con crear()/textContent, nunca con texto que el navegador interprete
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'MemberExpression[property.name=/^(innerHTML|outerHTML)$/]',
          message: 'Nada de innerHTML/outerHTML: usa crear(), textContent o cloneNode (seguridad, CSP).'
        },
        {
          selector: 'Property[key.name=/^(innerHTML|outerHTML)$/]',
          message: 'Nada de innerHTML/outerHTML: usa crear(), textContent o cloneNode (seguridad, CSP).'
        },
        {
          selector:
            'CallExpression[callee.property.name=/^(insertAdjacentHTML|write|writeln|createContextualFragment)$/]',
          message: 'No insertes HTML como texto: usa crear() (seguridad, CSP).'
        }
      ]
    }
  },
  {
    files: MODULOS,
    languageOptions: { sourceType: 'module' }
  },
  {
    files: ['sw.js'],
    languageOptions: { sourceType: 'script', globals: globals.serviceworker },
    rules: { 'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }] }
  },
  {
    // Herramientas de Node; el código que va dentro de page.evaluate() se ejecuta en la app
    files: ['herramientas/**/*.js', 'eslint.config.js'],
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
