// Comprueba que los datos son coherentes: ids, fuentes, fotos, monumentos, ruta, pueblos y lista sin conexión.
// Uso, desde la raíz del repositorio:  node herramientas/comprobar-datos.js   (sale con error si algo falla)
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAIZ = path.join(__dirname, '..');
const leer = f => fs.readFileSync(path.join(RAIZ, f), 'utf8');
const existe = f => fs.existsSync(path.join(RAIZ, f));

// Carga los archivos de datos como lo haría el navegador (scripts clásicos que comparten ámbito)
const datos = ['zonas', 'monumentos', 'ruta', 'pueblos', 'contenido', 'geometria', 'carreteras', 'provincia'];
const codigo =
  datos.map(d => leer('js/datos/' + d + '.js')).join('\n;\n') +
  '\n;({ NOMBRES_GRUPOS, ZONAS_GRANDES, ZONAS, MONUMENTOS, RUTA, PUEBLOS, CURIOSIDADES, LEYENDAS, FOTOS, DONDE_COMER,' +
  ' POSICION_EXACTA, LIMITES_BARRIOS, ZONAS_NO_OFICIALES, CARRETERAS, ESCUDOS, AVENIDAS, INFO_VIAS, INFO_AVENIDAS, PROVINCIA, ALFOZ })';
const D = vm.runInNewContext(codigo, {});

const errores = [],
  avisos = [];
const mal = texto => errores.push(texto);
const comprobar = (condicion, texto) => condicion || mal(texto);

// --- Zonas ------------------------------------------------------------------
const ids = D.ZONAS.map(z => z[0]);
const idsZona = new Set([...ids, 'resto']);
comprobar(ids.length == new Set(ids).size, 'Hay ids de zona repetidos');
D.ZONAS.forEach(([id, n, l, g, la, lo]) => {
  comprobar(D.NOMBRES_GRUPOS[g], `Zona ${id}: grupo ${g} no existe`);
  comprobar(la > 40.8 && la < 41.1 && lo > -5.9 && lo < -5.4, `Zona ${id}: coordenadas fuera de Salamanca`);
  comprobar(n && l, `Zona ${id}: le falta nombre o etiqueta`);
});
for (const conjunto of ['ZONAS_GRANDES', 'POSICION_EXACTA', 'ZONAS_NO_OFICIALES'])
  for (const id of D[conjunto]) comprobar(idsZona.has(id), `${conjunto}: «${id}» no es una zona`);
for (const id in D.LIMITES_BARRIOS) comprobar(idsZona.has(id), `LIMITES_BARRIOS: «${id}» no es una zona`);

// --- Contenido de las fichas ------------------------------------------------
for (const obj of ['CURIOSIDADES', 'LEYENDAS', 'FOTOS', 'DONDE_COMER'])
  for (const id in D[obj]) comprobar(idsZona.has(id), `${obj}: «${id}» no es una zona`);
for (const id in D.CURIOSIDADES)
  D.CURIOSIDADES[id].forEach((t, i) => comprobar(t && t.trim(), `Curiosidad vacía en ${id} (${i})`));
for (const id in D.FOTOS) {
  const [ruta, pie] = D.FOTOS[id];
  comprobar(existe(ruta), `Foto de ${id}: no existe ${ruta}`);
  comprobar(/Foto: .+·/.test(pie), `Foto de ${id}: el pie debe llevar «Foto: autor · licencia»`);
}
const revisarSitios = (sitios, donde) =>
  sitios.forEach(s => {
    for (const campo of ['n', 'a', 'p', 's'])
      comprobar(s[campo], `Dónde comer en ${donde}: «${s.n || '?'}» sin campo «${campo}»`);
    if (!/\d{4}/.test(s.s || '')) avisos.push(`Dónde comer en ${donde}: «${s.n}» sin fecha en la fuente`);
  });
for (const id in D.DONDE_COMER) revisarSitios(D.DONDE_COMER[id], id);

// --- Monumentos ---------------------------------------------------------------
const bloque = leer('js/monumentos.js').split('const PICTOGRAMAS = {')[1].split('};')[0];
const pictogramas = new Set([...bloque.matchAll(/^\s{2}(\w+):/gm)].map(m => m[1]));
const idsMonumento = new Set();
D.MONUMENTOS.forEach(m => {
  comprobar(!idsMonumento.has(m.id), `Monumento repetido: ${m.id}`);
  idsMonumento.add(m.id);
  comprobar(idsZona.has(m.zona), `Monumento ${m.id}: la zona «${m.zona}» no existe`);
  comprobar(pictogramas.has(m.tipo), `Monumento ${m.id}: no hay pictograma «${m.tipo}»`);
  comprobar(
    m.la > 40.9 && m.la < 41.02 && m.lo > -5.75 && m.lo < -5.6,
    `Monumento ${m.id}: coordenadas fuera del mapa`
  );
  comprobar(m.datos && m.datos.length, `Monumento ${m.id}: sin datos clave`);
  comprobar(m.curiosidades && m.curiosidades.length, `Monumento ${m.id}: sin curiosidades`);
  comprobar(
    m.fuente && m.fuente.length && m.fuente.every(f => /^https:\/\//.test(f[1])),
    `Monumento ${m.id}: sin fuente con enlace`
  );
  if (m.foto) comprobar(D.FOTOS[m.foto], `Monumento ${m.id}: la foto «${m.foto}» no está en FOTOS`);
});

// --- Ruta a pie ---------------------------------------------------------------
D.RUTA.paradas.forEach(id => comprobar(idsMonumento.has(id), `Ruta: la parada «${id}» no es un monumento`));
comprobar(
  D.RUTA.tramos.length == D.RUTA.paradas.length - 1,
  'Ruta: tiene que haber un tramo menos que paradas'
);
D.RUTA.tramos.forEach((t, i) => {
  comprobar(
    t.de == D.RUTA.paradas[i] && t.a == D.RUTA.paradas[i + 1],
    `Ruta: el tramo ${i + 1} no une las paradas en orden`
  );
  comprobar(t.m > 0 && t.p.length >= 2, `Ruta: el tramo ${i + 1} está vacío`);
});

// --- Pueblos de la provincia --------------------------------------------------
const municipios = new Set(D.PROVINCIA.m.map(m => m.n));
for (const n in D.PUEBLOS) {
  const p = D.PUEBLOS[n];
  comprobar(municipios.has(n), `Pueblo «${n}»: no está en PROVINCIA (el nombre tiene que coincidir)`);
  comprobar(p.hab && p.cur && p.cur.length, `Pueblo «${n}»: le faltan habitantes o curiosidades`);
  comprobar(p.fuente && p.fuente.length, `Pueblo «${n}»: sin fuente`);
  if (p.mon) comprobar(pictogramas.has(p.mon.tipo), `Pueblo «${n}»: no hay pictograma «${p.mon.tipo}»`);
  if (p.comer) revisarSitios(p.comer, n);
}
for (const n in D.ALFOZ)
  comprobar(municipios.has(n) && idsZona.has(D.ALFOZ[n]), `ALFOZ: «${n}» mal enlazado`);

// --- Carreteras ---------------------------------------------------------------
D.ESCUDOS.forEach(([n]) => comprobar(D.INFO_VIAS[n], `Escudo «${n}» sin ficha en INFO_VIAS`));
D.AVENIDAS.forEach(([n]) => n && comprobar(D.INFO_AVENIDAS[n], `Avenida «${n}» sin ficha en INFO_AVENIDAS`));

// --- index.html y sw.js -------------------------------------------------------
const html = leer('index.html');
const enlazados = [...html.matchAll(/(?:src|href)="([^"#:]+?)(\?v=(\d+))?"/g)];
enlazados.forEach(m => comprobar(existe(m[1]), `index.html enlaza ${m[1]}, que no existe`));
const versiones = new Set(enlazados.filter(m => m[3]).map(m => m[3]));
comprobar(
  versiones.size == 1,
  'index.html mezcla números de versión (?v=): ejecuta node herramientas/version.js'
);
const sw = leer('sw.js');
const v = [...versiones][0];
comprobar(
  new RegExp('const VERSION = ' + v + ';').test(sw),
  'sw.js no tiene la versión de index.html: ejecuta node herramientas/version.js'
);
enlazados
  .filter(m => m[3])
  .forEach(m =>
    comprobar(sw.includes("'" + m[1] + '?v=' + v + "'"), `sw.js no guarda ${m[1]} para usar sin conexión`)
  );
for (const f of fs.readdirSync(path.join(RAIZ, 'js')).filter(f => f.endsWith('.js')))
  comprobar(html.includes('js/' + f + '?'), `js/${f} no está enlazado en index.html`);
for (const f of fs.readdirSync(path.join(RAIZ, 'js/datos')).filter(f => f.endsWith('.js')))
  comprobar(html.includes('js/datos/' + f + '?'), `js/datos/${f} no está enlazado en index.html`);

// --- Resultado ----------------------------------------------------------------
avisos.forEach(a => console.log('! Aviso: ' + a));
if (errores.length) {
  console.log('✗ ' + errores.length + ' problema' + (errores.length > 1 ? 's' : '') + ' en los datos:');
  errores.forEach(e => console.log('  - ' + e));
  process.exit(1);
}
console.log(
  `✓ Datos correctos: ${ids.length} zonas, ${D.MONUMENTOS.length} monumentos, ruta de ${D.RUTA.paradas.length} paradas, ` +
    `${Object.keys(D.PUEBLOS).length} pueblos con ficha, ${Object.keys(D.DONDE_COMER).length} zonas con dónde comer.`
);
