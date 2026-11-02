// Orden de carga y dependencias entre los scripts de la app.
//
// La lógica de js/*.js son scripts clásicos que comparten el ámbito global y se ejecutan en el orden de
// index.html (los datos llegan antes, con js/datos-globales.js). Lo que un script usa DENTRO de una función
// que se llama más tarde (un clic, el arranque de inicio.js…) puede estar en cualquier archivo; pero lo que
// usa AL CARGARSE (código suelto arriba del todo, o funciones que se llaman ahí mismo) tiene que estar en un
// archivo que vaya antes en index.html: si no, la app se rompe al abrirla con «X is not defined».
//
// Este script lo mira solo leyendo el código y escribe el resumen en docs/notas/dependencias.md:
//   node herramientas/dependencias.js              comprueba el orden y rehace la nota
//   node herramientas/dependencias.js --comprobar  comprueba el orden y que la nota esté al día (CI)
// Falla si un script usa al cargarse algo de un archivo que va detrás.
const fs = require('fs');
const path = require('path');
const espree = require('espree');
const eslintScope = require('eslint-scope');
const { KEYS } = require('eslint-visitor-keys');

const RAIZ = path.join(__dirname, '..');
const NOTA = 'docs/notas/dependencias.md';
const leer = f => fs.readFileSync(path.join(RAIZ, f), 'utf8');

// Métodos que llaman a su función en el momento (no la guardan para luego): lo que va dentro se ejecuta ya
const LLAMAN_YA = new Set([
  'forEach',
  'map',
  'flatMap',
  'filter',
  'find',
  'findIndex',
  'findLast',
  'findLastIndex',
  'some',
  'every',
  'reduce',
  'reduceRight',
  'sort',
  'toSorted',
  'from',
  'fromEntries'
]);

// 1. Scripts de index.html, en su orden (src="js/…")
const scriptsEnOrden = html => [...html.matchAll(/<script\b[^>]*\bsrc="(js\/[^"?]+)/g)].map(m => m[1]);

// 2. Lo que declara arriba del todo un archivo (export const … en los datos)
const analizar = archivo => {
  const modulo = archivo.startsWith('js/datos/') || archivo == 'js/datos-globales.js';
  const arbol = espree.parse(leer(archivo), {
    ecmaVersion: 'latest',
    sourceType: modulo ? 'module' : 'script',
    range: true,
    loc: true
  });
  return { arbol, modulo };
};

const declaradosArriba = arbol => {
  const nombres = [];
  const cuerpo = arbol.body.map(n => (n.type == 'ExportNamedDeclaration' && n.declaration) || n);
  for (const n of cuerpo) {
    if (n.type == 'VariableDeclaration')
      n.declarations.forEach(d => d.id.type == 'Identifier' && nombres.push(d.id.name));
    else if ((n.type == 'FunctionDeclaration' || n.type == 'ClassDeclaration') && n.id)
      nombres.push(n.id.name);
    else if (n.type == 'BlockStatement')
      n.body
        .filter(m => m.type == 'VariableDeclaration' && m.kind == 'var')
        .forEach(m => m.declarations.forEach(d => nombres.push(d.id.name)));
  }
  return nombres;
};

// Padre de cada nodo, para saber dónde está una función (llamada en el momento, guardada…)
const ponerPadres = arbol => {
  const padre = new Map();
  const recorrer = (nodo, p) => {
    padre.set(nodo, p);
    for (const clave of KEYS[nodo.type] || []) {
      const hijo = nodo[clave];
      if (Array.isArray(hijo)) hijo.forEach(h => h && h.type && recorrer(h, nodo));
      else if (hijo && hijo.type) recorrer(hijo, nodo);
    }
  };
  recorrer(arbol, null);
  return padre;
};

const esFuncion = n =>
  n &&
  (n.type == 'FunctionDeclaration' || n.type == 'FunctionExpression' || n.type == 'ArrowFunctionExpression');

// Nombre con el que se llama a una función de arriba del todo (function f() o const f = () => …)
const nombreDeFuncion = (f, padre) => {
  if (f.type == 'FunctionDeclaration' && f.id && padre.get(f)?.type == 'Program') return f.id.name;
  const d = padre.get(f);
  if (d?.type == 'VariableDeclarator' && d.init == f && d.id.type == 'Identifier') {
    const decl = padre.get(d);
    if (padre.get(decl)?.type == 'Program') return d.id.name;
  }
  return null;
};

// Una función anónima se ejecuta en el momento si se llama ahí mismo, (() => …)(), o va a un método que
// la llama ya (lista.forEach(…), Array.from(…, f)…)
const seLlamaYa = (f, padre) => {
  const p = padre.get(f);
  if (p?.type == 'CallExpression' && p.callee == f) return true;
  if (p?.type == 'CallExpression' && p.arguments.includes(f)) {
    const c = p.callee;
    return c.type == 'MemberExpression' && !c.computed && LLAMAN_YA.has(c.property.name);
  }
  return false;
};

// Un nombre usado «como llamada»: f(…) o lista.forEach(f)
const usoComoLlamada = (id, padre) => {
  const p = padre.get(id);
  if (p?.type == 'CallExpression' && p.callee == id) return true;
  if (p?.type == 'CallExpression' && p.arguments.includes(id)) {
    const c = p.callee;
    return c.type == 'MemberExpression' && !c.computed && LLAMAN_YA.has(c.property.name);
  }
  return false;
};

// Nombres que comprueba un «typeof X != 'undefined'» (o similar) en una condición
const nombresConTypeof = nodo => {
  const nombres = [];
  const visitar = n => {
    if (n.type == 'UnaryExpression' && n.operator == 'typeof' && n.argument.type == 'Identifier')
      nombres.push(n.argument.name);
    for (const clave of KEYS[n.type] || []) {
      const h = n[clave];
      if (Array.isArray(h)) h.forEach(x => x && x.type && visitar(x));
      else if (h && h.type) visitar(h);
    }
  };
  visitar(nodo);
  return nombres;
};

const calcular = (html = leer('index.html')) => {
  const orden = scriptsEnOrden(html);
  const posicion = new Map(orden.map((a, i) => [a, i]));

  // Quién declara cada nombre global. Los datos los declara js/datos/…, pero llegan con js/datos-globales.js
  const archivoDe = new Map();
  const datos = fs
    .readdirSync(path.join(RAIZ, 'js/datos'))
    .filter(f => f.endsWith('.js'))
    .map(f => 'js/datos/' + f);
  for (const archivo of datos)
    for (const nombre of declaradosArriba(analizar(archivo).arbol))
      archivoDe.set(nombre, 'js/datos-globales.js');

  const info = new Map();
  for (const archivo of orden) {
    if (archivo == 'js/datos-globales.js') continue;
    const { arbol } = analizar(archivo);
    const padre = ponerPadres(arbol);
    const gestor = eslintScope.analyze(arbol, { ecmaVersion: 2024, sourceType: 'script' });
    info.set(archivo, { arbol, padre, gestor });
    for (const nombre of declaradosArriba(arbol)) archivoDe.set(nombre, archivo);
  }

  // Funciones de arriba del todo de cada archivo, por nombre
  const funcionPorNombre = new Map();
  for (const [archivo, { arbol, padre }] of info) {
    const visitar = n => {
      if (esFuncion(n)) {
        const nombre = nombreDeFuncion(n, padre);
        if (nombre) funcionPorNombre.set(nombre, { archivo, nodo: n });
      }
      for (const clave of KEYS[n.type] || []) {
        const h = n[clave];
        if (Array.isArray(h)) h.forEach(x => x && x.type && visitar(x));
        else if (h && h.type) visitar(h);
      }
    };
    visitar(arbol);
  }

  // Lo que va dentro de «if (typeof X != 'undefined') …» solo corre si el archivo de X ya está cargado: así se
  // puede usar a propósito algo de un archivo de detrás (mapa.js pinta la selección si mapa-fondo.js ya está)
  const protegido = (id, deDonde, padre) => {
    for (let hijo = id, p = padre.get(id); p; hijo = p, p = padre.get(p)) {
      const condicion =
        ((p.type == 'IfStatement' || p.type == 'ConditionalExpression') && p.consequent == hijo && p.test) ||
        (p.type == 'LogicalExpression' && p.operator == '&&' && p.right == hijo && p.left);
      if (condicion && nombresConTypeof(condicion).some(n => archivoDe.get(n) == deDonde)) return true;
    }
    return false;
  };

  // Referencias a nombres globales de cada archivo, con la función que las contiene (null = arriba del todo)
  const referencias = new Map();
  for (const [archivo, { padre, gestor }] of info) {
    const lista = [];
    for (const ambito of gestor.scopes)
      for (const ref of ambito.references) {
        const v = ref.resolved;
        if (v && v.scope.type != 'global') continue;
        const nombre = ref.identifier.name;
        if (!archivoDe.has(nombre)) continue; // del navegador (document, window…) o de otra web (firebase)
        if (
          padre.get(ref.identifier)?.type == 'UnaryExpression' &&
          padre.get(ref.identifier).operator == 'typeof'
        )
          continue; // typeof X no falla aunque X no exista
        const conTypeof = protegido(ref.identifier, archivoDe.get(nombre), padre);
        let f = padre.get(ref.identifier);
        while (f && !esFuncion(f)) f = padre.get(f);
        lista.push({ nombre, funcion: f || null, nodo: ref.identifier, conTypeof });
      }
    referencias.set(archivo, lista);
  }

  // 3. Qué se ejecuta al cargar. Se empieza por el código suelto de cada archivo (en su turno) y se siguen las
  //    funciones que llama en el momento, aunque estén en otro archivo: corren en el turno de quien las llama.
  const problemas = [];
  const alCargar = new Map(orden.map(a => [a, new Set()])); // archivo → archivos que necesita ya cargados
  const usaLuego = new Map(orden.map(a => [a, new Set()]));
  const visto = new Set();
  const pendientes = [];
  const funcionEsInmediata = new Map(); // función anónima → ¿se ejecuta en cuanto se ejecuta la de fuera?
  const inmediata = (f, padre) => {
    if (!funcionEsInmediata.has(f)) funcionEsInmediata.set(f, seLlamaYa(f, padre));
    return funcionEsInmediata.get(f);
  };
  // ¿La referencia se ejecuta cuando se ejecuta «contexto» (null = el código suelto del archivo)?
  const corre = (ref, contexto, padre) => {
    let f = ref.funcion;
    while (f && f != contexto) {
      if (!inmediata(f, padre)) return false;
      let g = padre.get(f);
      while (g && !esFuncion(g)) g = padre.get(g);
      f = g;
    }
    return f == contexto;
  };
  for (const archivo of info.keys()) pendientes.push({ archivo, contexto: null, turno: archivo, via: [] });
  while (pendientes.length) {
    const { archivo, contexto, turno, via } = pendientes.shift();
    const clave = archivo + '|' + (contexto ? contexto.range[0] : 'arriba') + '|' + turno;
    if (visto.has(clave)) continue;
    visto.add(clave);
    const { padre } = info.get(archivo);
    for (const ref of referencias.get(archivo)) {
      if (ref.conTypeof || !corre(ref, contexto, padre)) continue;
      const deDonde = archivoDe.get(ref.nombre);
      if (deDonde != turno) alCargar.get(turno).add(deDonde);
      if (posicion.get(deDonde) > posicion.get(turno))
        problemas.push(
          `${turno} usa al cargarse «${ref.nombre}» (${deDonde}, que va detrás en index.html)` +
            (via.length ? ` a través de ${via.join(' → ')}` : '') +
            ` [${archivo}:${ref.nodo.loc.start.line}]`
        );
      const fn = funcionPorNombre.get(ref.nombre);
      if (fn && usoComoLlamada(ref.nodo, padre))
        pendientes.push({ archivo: fn.archivo, contexto: fn.nodo, turno, via: [...via, ref.nombre] });
    }
  }
  for (const [archivo, lista] of referencias)
    for (const ref of lista) {
      const deDonde = archivoDe.get(ref.nombre);
      if (deDonde != archivo && !alCargar.get(archivo).has(deDonde)) usaLuego.get(archivo).add(deDonde);
    }

  const lo = new Map(orden.map(a => [a, new Set()]));
  for (const a of orden) for (const b of [...alCargar.get(a), ...usaLuego.get(a)]) lo.get(b).add(a);

  return { orden, alCargar, usaLuego, lo, problemas: [...new Set(problemas)] };
};

// 4. La nota
const corto = a => a.replace(/^js\//, '');
const listaCorta = (conjunto, orden) =>
  orden
    .filter(a => conjunto.has(a))
    .map(a => '`' + corto(a) + '`')
    .join(', ') || '—';

const escribirNota = ({ orden, alCargar, usaLuego, lo }) => {
  const filas = orden.map(
    (a, i) =>
      `| ${i + 1} | \`${corto(a)}\` | ${listaCorta(alCargar.get(a), orden)} | ${listaCorta(usaLuego.get(a), orden)} | ${lo.get(a).size} |`
  );
  return `# Orden de carga y dependencias entre scripts

<!-- Generado por herramientas/dependencias.js: no lo edites a mano. -->

La lógica son scripts clásicos que comparten el ámbito global y se ejecutan en el orden de \`index.html\`. Hay dos tipos de dependencia:

- **Al cargarse**: código suelto arriba del todo (o funciones que se llaman ahí mismo, aunque sean de otro archivo). Lo que use tiene que venir de un script **anterior**; si no, la app se rompe al abrirla con «X is not defined». \`node herramientas/dependencias.js\` lo comprueba y falla si no se cumple (va en \`antes-del-commit\` y en GitHub Actions).
- **Después**: lo que se usa dentro de funciones que se llaman más tarde (un clic, el arranque de \`inicio.js\`, que va casi al final y pone todo en marcha cuando ya está cargado). Eso puede estar en cualquier archivo, también en uno de detrás.

Reglas para ampliar la app:

- Un archivo nuevo va en \`index.html\` detrás de todo lo que use al cargarse y delante de quien lo use al cargarse; si solo tiene funciones, delante de \`inicio.js\` basta.
- No pongas código suelto que llame a funciones de otros archivos: mételo en una función y llámala desde el arranque (\`inicio.js\`).
- Los datos (\`js/datos/\`) llegan con \`datos-globales.js\`: \`util.js\` y \`medicion.js\` van antes y no pueden usarlos al cargarse.
- Lo que varios archivos cambian va en \`estadoApp\` (\`estado.js\`), no en un \`let\` suelto.
- Si mueves un script de sitio, ejecuta \`node herramientas/dependencias.js\`: dice qué se rompe y rehace esta tabla.

| # | Script | Necesita ya cargados (al cargarse) | Usa después (en funciones) | Lo usan |
| - | ------ | ---------------------------------- | -------------------------- | ------- |
${filas.join('\n')}

«Lo usan» es cuántos scripts usan algo suyo (al cargarse o después): cuanto más alto, más cuidado al cambiarle nombres. El análisis es solo leyendo el código: una función guardada para luego (un \`addEventListener\`, un \`setTimeout\`) cuenta como «después», y las que van a \`forEach\`, \`map\`, \`filter\`… o se llaman ahí mismo cuentan como «al cargarse».
`;
};

if (require.main == module) {
  const resultado = calcular();
  const nota = escribirNota(resultado);
  let falla = false;
  if (resultado.problemas.length) {
    console.error('Orden de scripts roto en index.html:\n  ' + resultado.problemas.join('\n  '));
    falla = true;
  }
  const actual = fs.existsSync(path.join(RAIZ, NOTA)) ? leer(NOTA) : '';
  if (process.argv.includes('--comprobar')) {
    if (actual != nota) {
      console.error(`${NOTA} no está al día: ejecuta node herramientas/dependencias.js`);
      falla = true;
    }
  } else if (actual != nota) {
    fs.writeFileSync(path.join(RAIZ, NOTA), nota);
    console.log(`${NOTA} actualizada`);
  }
  if (falla) process.exit(1);
  console.log(`Orden de los ${resultado.orden.length} scripts: bien`);
}

module.exports = { calcular, scriptsEnOrden };
