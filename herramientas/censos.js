// Población de cada municipio de la provincia en los Censos de Población desde 1842, según el INE
// («Alteraciones de los municipios en los Censos de Población desde 1842»). Por cada censo, la población de
// hecho y la de derecho, tal como las publica el INE (sin estimar las que faltan), y las notas del INE sobre
// el municipio: cambios de nombre y de término (incorporaciones, segregaciones). Lo guarda en
// js/datos/censos.js. Uso:
//   node herramientas/censos.js [carpeta]
// Sin carpeta, pide al INE la página de cada municipio (una a una, sin prisa). Con carpeta, guarda ahí cada
// página (37xxx.html) y, si ya está, la usa sin volver a pedirla.
// Solo cambia cuando el INE publica un censo nuevo (cada diez años; el último, el de 2021).
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');
const { sinExport } = require('./datos');

const RAIZ = path.join(__dirname, '..');
const URL_PORTADA = 'https://www.ine.es/intercensal/';
const urlMunicipio = ine =>
  `https://www.ine.es/intercensal/intercensal.do?search=3&codigoProvincia=${+ine.slice(0, 2)}` +
  `&codigoMunicipio=${+ine.slice(2)}&btnBuscarCod=Consultar+selecci%C3%B3n`;

const { PROVINCIA } = vm.runInNewContext(
  sinExport(fs.readFileSync(path.join(RAIZ, 'js/datos/provincia.js'), 'utf8')) + ';({ PROVINCIA })',
  {}
);
const carpeta = process.argv[2];
if (carpeta) fs.mkdirSync(carpeta, { recursive: true });

const esperar = ms => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
function pagina(ine) {
  const guardada = carpeta && path.join(carpeta, ine + '.html');
  if (guardada && fs.existsSync(guardada)) return fs.readFileSync(guardada, 'utf8');
  for (let intento = 1; ; intento++) {
    try {
      const html = execFileSync('curl', ['-sS', '-m', '60', urlMunicipio(ine)], { encoding: 'utf8' });
      if (!html.includes('Población de Derecho')) throw new Error('página sin datos');
      if (guardada) fs.writeFileSync(guardada, html);
      esperar(1000);
      return html;
    } catch (e) {
      if (intento == 5) throw new Error(`${ine}: ${e.message}`, { cause: e });
      esperar(2000 * 2 ** intento);
    }
  }
}

const texto = h =>
  h
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n))
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

// De la página de un municipio: { anios, hecho, derecho, notas: [[texto, [años]]] }
function leer(ine, html) {
  // Cabecera: un censo por columna, con la llamada de su nota ([1], (*)…) si la tiene. El INE repite a
  // veces una columna (dos de 1857 con las mismas cifras): se queda una.
  const columnas = [...html.matchAll(/<th[^>]*headers="censo" id="(\d{4})">([\s\S]*?)<\/th>/g)].map(c => ({
    anio: +c[1],
    llamada: texto(c[2]).slice(4).trim()
  }));
  const cifras = fila =>
    [...html.matchAll(new RegExp(`headers="${fila} \\d{4}">([\\s\\S]*?)</td>`, 'g'))].map(c => {
      const v = texto(c[1]);
      if (v == '..') return null; // «Falta de dato o inexistente»
      if (!/^\d+$/.test(v)) throw new Error(`${ine}: cifra rara «${v}»`);
      return +v;
    });
  const hecho = cifras('pHecho'),
    derecho = cifras('pDerecho');
  if (!columnas.length || hecho.length != columnas.length || derecho.length != columnas.length)
    throw new Error(`${ine}: la tabla no cuadra`);
  const r = { anios: [], hecho: [], derecho: [], llamadas: {} };
  columnas.forEach((c, i) => {
    const j = r.anios.indexOf(c.anio);
    if (j >= 0) {
      if (r.hecho[j] !== hecho[i] || r.derecho[j] !== derecho[i])
        throw new Error(`${ine}: ${c.anio} repetido`);
    } else {
      r.anios.push(c.anio);
      r.hecho.push(hecho[i]);
      r.derecho.push(derecho[i]);
    }
    if (c.llamada) (r.llamadas[c.llamada] = r.llamadas[c.llamada] || new Set()).add(c.anio);
  });
  // Notas del INE (debajo de la tabla): cada una con los censos a los que se refiere su llamada
  const bloque = html.slice(html.indexOf('summary="alteraciones"'));
  r.notas = html.includes('summary="alteraciones"')
    ? [...bloque.slice(0, bloque.indexOf('</table>')).matchAll(/<p>([\s\S]*?)<\/p>/g)]
        .map(p => texto(p[1]))
        .filter(Boolean)
        .map(t => {
          const m = t.match(/^(\[\d+\]|\(\*+\))\s*(.*)$/);
          return m ? [m[2], [...(r.llamadas[m[1]] || [])].sort()] : [t, []];
        })
    : [];
  return r;
}

const porMunicipio = {};
PROVINCIA.m.forEach((m, i) => {
  porMunicipio[m.ine] = leer(m.ine, pagina(m.ine));
  if (!carpeta && i % 50 == 49) console.log(`${i + 1} de ${PROVINCIA.m.length}…`);
});
const anios = [...new Set(Object.values(porMunicipio).flatMap(r => r.anios))].sort((a, b) => a - b);
const alinear = (r, clave) => anios.map(a => (r.anios.includes(a) ? r[clave][r.anios.indexOf(a)] : null));
const filas = clave =>
  PROVINCIA.m.map(m => `    "${m.ine}": ${JSON.stringify(alinear(porMunicipio[m.ine], clave))}`);
const notas = Object.fromEntries(
  PROVINCIA.m.filter(m => porMunicipio[m.ine].notas.length).map(m => [m.ine, porMunicipio[m.ine].notas])
);
const total = clave =>
  PROVINCIA.m.reduce((s, m) => s + (alinear(porMunicipio[m.ine], clave)[anios.length - 1] || 0), 0);
console.log(
  `${PROVINCIA.m.length} municipios, censos de ${anios.join(', ')}; ` +
    `${total('derecho')} habitantes de derecho en ${anios[anios.length - 1]}; ` +
    `${Object.keys(notas).length} municipios con notas`
);

fs.writeFileSync(
  path.join(RAIZ, 'js/datos/censos.js'),
  '// Población de cada municipio (código INE) en los Censos de Población desde 1842, según el INE.\n' +
    '// Generado con node herramientas/censos.js: no editar a mano.\n' +
    '// hecho y derecho: una cifra por censo de «anios» (null si el INE no la da). En 2001 la población es la\n' +
    '// residente, equivalente a la de derecho. notas: [texto del INE, [censos a los que se refiere]].\n' +
    '// prettier-ignore\n' +
    'export const CENSOS = {\n' +
    `  fuente: ['INE, Alteraciones de los municipios en los Censos de Población desde 1842', '${URL_PORTADA}'],\n` +
    `  anios: ${JSON.stringify(anios)},\n` +
    `  notas: ${JSON.stringify(notas)},\n` +
    '  derecho: {\n' +
    filas('derecho').join(',\n') +
    '\n  },\n' +
    '  hecho: {\n' +
    filas('hecho').join(',\n') +
    '\n  }\n};\n'
);
