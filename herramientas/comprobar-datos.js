// Comprueba que los datos son coherentes: ids, fuentes, fotos, monumentos, ruta, pueblos y lista sin conexión.
// Uso, desde la raíz del repositorio:  node herramientas/comprobar-datos.js   (sale con error si algo falla)
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAIZ = path.join(__dirname, '..');
const leer = f => fs.readFileSync(path.join(RAIZ, f), 'utf8');
const existe = f => fs.existsSync(path.join(RAIZ, f));

// Carga los archivos de datos como lo haría el navegador (scripts clásicos que comparten ámbito)
const datos = [
  'zonas',
  'monumentos',
  'ruta',
  'pueblos',
  'contenido',
  'geometria',
  'alfoz',
  'carreteras',
  'provincia'
];
const codigo =
  datos.map(d => leer('js/datos/' + d + '.js')).join('\n;\n') +
  '\n;({ NOMBRES_GRUPOS, ZONAS_GRANDES, ZONAS, MONUMENTOS, RUTA, PUEBLOS, CURIOSIDADES, LEYENDAS, FOTOS, DONDE_COMER,' +
  ' POSICION_EXACTA, LIMITES_BARRIOS, ZONAS_NO_OFICIALES, CARRETERAS, ESCUDOS, AVENIDAS, INFO_VIAS, INFO_AVENIDAS, PROVINCIA, ALFOZ, LIMITES_ALFOZ })';
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
// Pueblos de alrededor: cada uno con su término municipal, y el pueblo dentro de él
const dentro = (P, la, lo) => {
  let d = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++)
    if (
      P[i][0] > la != P[j][0] > la &&
      lo < ((P[j][1] - P[i][1]) * (la - P[i][0])) / (P[j][0] - P[i][0]) + P[i][1]
    )
      d = !d;
  return d;
};
Object.entries(D.ALFOZ).forEach(([nombre, id]) => {
  const z = D.ZONAS.find(q => q[0] == id),
    P = D.LIMITES_ALFOZ[id];
  comprobar(z, `ALFOZ: «${id}» (${nombre}) no es una zona`);
  comprobar(
    P && P.length > 10,
    `${nombre}: falta su término en LIMITES_ALFOZ (node herramientas/lindes-alfoz.js)`
  );
  if (z && P) comprobar(dentro(P, z[4], z[5]), `${nombre}: el pueblo queda fuera de su término municipal`);
});
D.ZONAS.filter(z => z[3] == 5).forEach(z =>
  comprobar(Object.values(D.ALFOZ).includes(z[0]), `Zona ${z[0]}: pueblo de alrededor sin entrada en ALFOZ`)
);

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
// Y al revés: lo que guarda sw.js tiene que existir (si falta uno solo, el service worker no se
// instala y la web se queda sin modo sin conexión, sin ningún error a la vista), y tiene que guardar
// todo lo de img/ e icons/, las fotos de las fichas y los iconos del manifest
const listaSw = (sw.match(/\/\/ <archivos>([\s\S]*?)\/\/ <\/archivos>/) || [, ''])[1],
  enSw = new Set([...listaSw.matchAll(/'([^']+)'/g)].map(m => m[1]));
comprobar(enSw.size > 0, 'sw.js no tiene lista de archivos: ejecuta node herramientas/version.js');
enSw.forEach(a => {
  const f = a.split('?')[0];
  comprobar(f == './' || existe(f), `sw.js guarda ${f}, que no existe: ejecuta node herramientas/version.js`);
});
for (const d of ['img', 'icons'])
  for (const f of fs.readdirSync(path.join(RAIZ, d)).filter(f => !f.startsWith('.')))
    comprobar(enSw.has(d + '/' + f), `sw.js no guarda ${d}/${f}: ejecuta node herramientas/version.js`);
const usadasEnDatos = [
  ...Object.entries(D.FOTOS).map(([id, [ruta]]) => [ruta, 'la foto de ' + id]),
  ...JSON.parse(leer('manifest.webmanifest')).icons.map(i => [i.src, 'el manifest'])
];
usadasEnDatos.forEach(([ruta, quien]) => {
  if (/^(https?:|data:)/.test(ruta)) return;
  comprobar(existe(ruta), `${quien} usa ${ruta}, que no existe`);
  comprobar(enSw.has(ruta), `sw.js no guarda ${ruta} (${quien}) para usar sin conexión`);
});

// Tarjeta Open Graph: la imagen tiene que estar en el repositorio y medir 1200×630
const imagenOg = (html.match(/property="og:image" content="https:\/\/[^/]+\/mapa-charro\/([^"]+)"/) || [])[1];
comprobar(imagenOg, 'index.html no tiene og:image de la web pública');
if (imagenOg) {
  comprobar(
    existe(imagenOg),
    `og:image apunta a ${imagenOg}, que no existe: node herramientas/tarjeta-og.js`
  );
  if (existe(imagenOg)) {
    const png = fs.readFileSync(path.join(RAIZ, imagenOg));
    comprobar(
      png.readUInt32BE(16) == 1200 && png.readUInt32BE(20) == 630,
      `${imagenOg} debería medir 1200×630 para la tarjeta al compartir`
    );
  }
}

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
