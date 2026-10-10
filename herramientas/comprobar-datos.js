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
  'rutas',
  'tramos',
  'rutas-provincia',
  'tramos-provincia',
  'pueblos',
  'contenido',
  'geometria',
  'alfoz',
  'tiempo',
  'carreteras',
  'provincia',
  'carreteras-provincia',
  'habitantes',
  'parques',
  'firebase',
  'palabras'
];
const codigo =
  datos.map(d => leer('js/datos/' + d + '.js')).join('\n;\n') +
  '\n;({ NOMBRES_GRUPOS, ZONAS_GRANDES, ZONAS, OTROS_NOMBRES, SEMILLAS_REPARTO, MONUMENTOS, RUTAS, TRAMOS_RUTAS, PUEBLOS, CURIOSIDADES, LEYENDAS, FOTOS, DONDE_COMER,' +
  ' POSICION_EXACTA, LIMITES_BARRIOS, ZONAS_NO_OFICIALES, CARRETERAS, ESCUDOS, AVENIDAS, INFO_VIAS, INFO_AVENIDAS, PROVINCIA, ALFOZ, LIMITES_ALFOZ, LIMITES_VECINOS, CONFIG_FIREBASE, ETAPAS, EPOCA_ZONA, MURALLA, PALABRAS_CHARRAS, FUENTES_PALABRAS, RUTAS_PROVINCIA, SALIDA_PROVINCIA, TRAMOS_PROVINCIA, CARRETERAS_PROVINCIA, HABITANTES, PARQUES })';
const D = vm.runInNewContext(codigo, {});

const WEB_PUBLICA = 'https://alvarorzhz.github.io/mapa-charro/';
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
// Municipios vecinos que asoman por el mapa (fondo): nombres de la provincia, fuera del alfoz y con anillos
Object.entries(D.LIMITES_VECINOS).forEach(([nombre, anillos]) => {
  comprobar(
    D.PROVINCIA.m.some(m => m.n == nombre) && !D.ALFOZ[nombre] && nombre != 'Salamanca',
    `LIMITES_VECINOS: «${nombre}» no es un municipio vecino de la provincia`
  );
  comprobar(
    anillos.length &&
      anillos.every(a => a.length >= 3 && a.every(q => q.length == 2 && q.every(Number.isFinite))),
    `LIMITES_VECINOS ${nombre}: anillos mal formados`
  );
});
// Configuración de Firebase (cuenta con Google en la web): null o los datos que da la consola de Firebase
comprobar(
  D.CONFIG_FIREBASE === null ||
    ['apiKey', 'authDomain', 'projectId', 'appId'].every(
      k => typeof D.CONFIG_FIREBASE[k] == 'string' && D.CONFIG_FIREBASE[k]
    ),
  'CONFIG_FIREBASE: tiene que ser null o llevar apiKey, authDomain, projectId y appId'
);
D.ZONAS.filter(z => z[3] == 5).forEach(z =>
  comprobar(Object.values(D.ALFOZ).includes(z[0]), `Zona ${z[0]}: pueblo de alrededor sin entrada en ALFOZ`)
);

// Otros nombres (en la ficha y el buscador) y puntos de más para los límites aproximados
for (const id in D.OTROS_NOMBRES)
  comprobar(
    idsZona.has(id) &&
      D.OTROS_NOMBRES[id].length &&
      D.OTROS_NOMBRES[id].every(n => n && typeof n == 'string'),
    `OTROS_NOMBRES: «${id}» no es una zona o tiene nombres vacíos`
  );
for (const id in D.SEMILLAS_REPARTO)
  comprobar(
    D.ZONAS_NO_OFICIALES.has(id),
    `SEMILLAS_REPARTO: «${id}» no tiene límite aproximado (ZONAS_NO_OFICIALES)`
  );

// Claves repetidas en los datos: en un objeto de JavaScript la segunda pisa a la primera sin avisar
for (const f of datos) {
  const texto = leer('js/datos/' + f + '.js');
  for (const [, nombre, cuerpo] of texto.matchAll(/^const (\w+) = \{\n([\s\S]*?)\n\};/gm)) {
    const claves = [...cuerpo.matchAll(/^ {2}'?([\w-]+)'?: /gm)].map(m => m[1]);
    claves
      .filter((k, i) => claves.indexOf(k) != i)
      .forEach(k => comprobar(false, `${f}.js: «${k}» aparece dos veces en ${nombre}`));
  }
}

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

// --- Rutas a pie --------------------------------------------------------------
const idsRuta = new Set();
D.RUTAS.forEach(r => {
  comprobar(r.id && !idsRuta.has(r.id), `Rutas: id «${r.id}» vacío o repetido`);
  idsRuta.add(r.id);
  comprobar(r.nombre && r.icono && r.resumen, `Ruta ${r.id}: falta nombre, icono o resumen`);
  if (r.fuente) comprobar(/^https?:\/\//.test(r.fuente[1]), `Ruta ${r.id}: la fuente del resumen sin enlace`);
  const idParada = p => (typeof p == 'string' ? p : p.id);
  r.paradas.forEach(p => {
    if (typeof p == 'string')
      return comprobar(idsMonumento.has(p), `Ruta ${r.id}: la parada «${p}» no es un monumento`);
    for (const campo of ['id', 'n', 'dir', 'texto'])
      comprobar(p[campo], `Ruta ${r.id}: la parada «${p.n || p.id}» sin «${campo}»`);
    comprobar(
      p.la > 40.9 && p.la < 41.05 && p.lo > -5.75 && p.lo < -5.55,
      `Ruta ${r.id}: la parada «${p.n}» cae fuera del mapa`
    );
    comprobar(
      Array.isArray(p.fuente) && p.fuente[0] && /^https?:\/\//.test(p.fuente[1]),
      `Ruta ${r.id}: la parada «${p.n}» sin fuente con enlace`
    );
  });
  comprobar(new Set(r.paradas.map(idParada)).size == r.paradas.length, `Ruta ${r.id}: hay paradas repetidas`);
  const T = D.TRAMOS_RUTAS[r.id] || [];
  comprobar(
    T.length == r.paradas.length - 1 &&
      T.every((t, i) => t.de == idParada(r.paradas[i]) && t.a == idParada(r.paradas[i + 1])),
    `Ruta ${r.id}: los tramos no unen las paradas en orden (node herramientas/rutas.js ${r.id})`
  );
  T.forEach((t, i) => comprobar(t.m > 0 && t.p.length >= 2, `Ruta ${r.id}: el tramo ${i + 1} está vacío`));
});
for (const id in D.TRAMOS_RUTAS) comprobar(idsRuta.has(id), `TRAMOS_RUTAS: «${id}» no es una ruta`);

// --- Rutas por la provincia (en coche) -----------------------------------------------
const enlaceValido = f => Array.isArray(f) && f[0] && /^https:\/\//.test(f[1] || '');
// --- Parques (los genera herramientas/parques.js) ------------------------------------------------------
D.PARQUES.forEach(p =>
  comprobar(
    p.n &&
      p.ha > 0 &&
      p.R.length &&
      p.R.every(
        r =>
          r.length >= 6 &&
          r.length % 2 == 0 &&
          r.every((v, i) => (i % 2 ? v > -5.75 && v < -5.58 : v > 40.9 && v < 41.02))
      ),
    `Parque «${p.n}»: datos raros`
  )
);

// --- Habitantes de cada municipio (los genera herramientas/habitantes.js) ---------------------------------
D.PROVINCIA.m.forEach(m =>
  comprobar(
    Number.isInteger(D.HABITANTES.m[m.ine]) && D.HABITANTES.m[m.ine] > 0,
    `Habitantes: falta ${m.n} (${m.ine}); ejecuta node herramientas/habitantes.js`
  )
);
comprobar(/^\d+ de \w+ de \d{4}$/.test(D.HABITANTES.fecha), 'Habitantes: fecha rara');

// --- Carreteras del mapa de la provincia (las genera herramientas/carreteras-provincia.js) ---------------
D.CARRETERAS_PROVINCIA.forEach(c => {
  comprobar(
    /^(A|N|CL)-\d+$/.test(c.ref) && 'anc'.includes(c.t) && c.t.length == 1,
    `Carretera ${c.ref}: ref o tipo raros`
  );
  comprobar(c.n && Array.isArray(c.l) && c.l.length, `Carretera ${c.ref}: sin nombre o sin líneas`);
  (c.l || []).forEach(l => {
    let la = 0,
      lo = 0,
      dentro = l.length >= 4 && l.length % 2 == 0;
    for (let i = 0; i < l.length; i += 2) {
      la += l[i];
      lo += l[i + 1];
      dentro = dentro && la > 40200 && la < 41400 && lo > -7100 && lo < -4800;
    }
    comprobar(dentro, `Carretera ${c.ref}: una línea se sale de la provincia`);
  });
});

D.RUTAS_PROVINCIA.forEach(r => {
  comprobar(/^[a-z0-9-]+$/.test(r.id), `Ruta de la provincia «${r.id}»: id no válido`);
  comprobar(!idsRuta.has(r.id), `Ruta de la provincia «${r.id}»: ese id ya es de una ruta a pie`);
  comprobar(
    r.nombre && r.icono && r.tema && r.resumen,
    `Ruta ${r.id}: le falta nombre, icono, tema o resumen`
  );
  comprobar(['medio', 'dia'].includes(r.duracion), `Ruta ${r.id}: duración «${r.duracion}» (medio o dia)`);
  comprobar(enlaceValido(r.fuente), `Ruta ${r.id}: sin fuente con enlace`);
  comprobar(
    r.paradas.length >= 2 && r.paradas.length <= 9,
    `Ruta ${r.id}: entre 2 y 9 paradas (Google Maps)`
  );
  const ids = r.paradas.map(p => p.id);
  comprobar(ids.length == new Set(ids).size, `Ruta ${r.id}: paradas repetidas`);
  r.paradas.forEach(p => {
    comprobar(
      p.n && p.municipio && p.ver && p.min > 0,
      `Ruta ${r.id}, ${p.id}: falta nombre, municipio, qué ver o minutos`
    );
    comprobar(
      p.la > 40.2 && p.la < 41.35 && p.lo > -7.0 && p.lo < -5.0,
      `Ruta ${r.id}, ${p.id}: fuera de la provincia`
    );
    comprobar(enlaceValido(p.fuente), `Ruta ${r.id}, ${p.id}: sin fuente con enlace`);
    (p.masFuentes || []).forEach(f =>
      comprobar(enlaceValido(f), `Ruta ${r.id}, ${p.id}: otra fuente sin enlace`)
    );
    if (p.foto) {
      comprobar(existe(p.foto[0]), `Ruta ${r.id}, ${p.id}: no existe la foto ${p.foto[0]}`);
      comprobar(
        /Foto: .+ · .+ · /.test(p.foto[1]),
        `Ruta ${r.id}, ${p.id}: pie de foto sin autor y licencia`
      );
    }
  });
  // Los tramos tienen que ser de estas paradas, en este orden y en este sitio
  const firma = [
    { id: 'salida', ...D.SALIDA_PROVINCIA },
    ...r.paradas,
    { id: 'salida', ...D.SALIDA_PROVINCIA }
  ].map(p => p.id + '@' + p.la + ',' + p.lo);
  const T = D.TRAMOS_PROVINCIA[r.id];
  comprobar(
    T && T.firma.join() == firma.join() && T.tramos.length == r.paradas.length + 1,
    `Ruta ${r.id}: los tramos en coche no son de estas paradas: node herramientas/rutas-provincia.js ${r.id}`
  );
});

// --- Pueblos de la provincia --------------------------------------------------
const municipios = new Set(D.PROVINCIA.m.map(m => m.n));
for (const n in D.PUEBLOS) {
  const p = D.PUEBLOS[n];
  comprobar(municipios.has(n), `Pueblo «${n}»: no está en PROVINCIA (el nombre tiene que coincidir)`);
  comprobar(p.cur && p.cur.length, `Pueblo «${n}»: le faltan curiosidades`);
  comprobar(p.fuente && p.fuente.length, `Pueblo «${n}»: sin fuente`);
  if (p.mon) comprobar(pictogramas.has(p.mon.tipo), `Pueblo «${n}»: no hay pictograma «${p.mon.tipo}»`);
  if (p.comer) revisarSitios(p.comer, n);
}
for (const n in D.ALFOZ)
  comprobar(municipios.has(n) && idsZona.has(D.ALFOZ[n]), `ALFOZ: «${n}» mal enlazado`);

// --- Carreteras ---------------------------------------------------------------
D.ESCUDOS.forEach(([n]) => comprobar(D.INFO_VIAS[n], `Escudo «${n}» sin ficha en INFO_VIAS`));
D.AVENIDAS.forEach(([n]) => n && comprobar(D.INFO_AVENIDAS[n], `Avenida «${n}» sin ficha en INFO_AVENIDAS`));

// --- Palabras charras -----------------------------------------------------------
const idsPalabra = D.PALABRAS_CHARRAS.map(w => w.id);
comprobar(idsPalabra.length == new Set(idsPalabra).size, 'Palabras charras: hay ids repetidos');
for (const clave in D.FUENTES_PALABRAS) {
  const [nombre, url] = D.FUENTES_PALABRAS[clave];
  comprobar(nombre && /^https:\/\//.test(url), `FUENTES_PALABRAS: «${clave}» sin nombre o sin enlace`);
}
D.PALABRAS_CHARRAS.forEach(w => {
  comprobar(/^[a-z0-9]+$/.test(w.id || ''), `Palabra «${w.p}»: id no válido`);
  comprobar(w.p && w.s && w.e, `Palabra ${w.id}: le falta la palabra, el significado o el ejemplo`);
  comprobar(D.FUENTES_PALABRAS[w.f], `Palabra ${w.id}: sin fuente (o la fuente «${w.f}» no existe)`);
  (w.z || []).forEach(z => comprobar(idsZona.has(z), `Palabra ${w.id}: «${z}» no es una zona`));
});

// --- Salamanca en el tiempo ------------------------------------------------------
const esFuente = f => Array.isArray(f) && f[0] && /^https?:\/\//.test(f[1]);
D.ETAPAS.forEach(([anio, nombre, texto, hitos, fuentes], i) => {
  comprobar(
    anio && nombre && texto && Array.isArray(hitos),
    `Etapa ${i}: le falta año, nombre, texto o hitos`
  );
  fuentes.forEach(f => comprobar(esFuente(f), `Etapa «${nombre}»: fuente mal escrita`));
});
for (const id in D.EPOCA_ZONA) {
  const [etapa, motivo, fuente] = D.EPOCA_ZONA[id];
  comprobar(idsZona.has(id) && id != 'resto', `EPOCA_ZONA: «${id}» no es una zona del mapa`);
  comprobar(
    Number.isInteger(etapa) && etapa >= 0 && etapa < D.ETAPAS.length,
    `EPOCA_ZONA ${id}: etapa ${etapa} no existe`
  );
  comprobar(motivo, `EPOCA_ZONA ${id}: falta el porqué`);
  // Sin fuente propia, el dato sale de su ficha (curiosidades) o de la muralla y el castro
  if (fuente !== undefined) comprobar(esFuente(fuente), `EPOCA_ZONA ${id}: fuente mal escrita`);
  else
    comprobar(
      (D.CURIOSIDADES[id] || []).length || /cerca nueva|castro|Puente Romano|Catedrales/.test(motivo),
      `EPOCA_ZONA ${id}: sin fuente propia ni curiosidades en su ficha`
    );
}
{
  const M = D.MURALLA,
    enCasco = ([la, lo]) => la > 40.95 && la < 40.98 && lo > -5.68 && lo < -5.65;
  comprobar(M.anillo.length > 10 && M.anillo.every(enCasco), 'MURALLA: el anillo se sale del casco');
  M.puertas.forEach(p =>
    comprobar(p[0] && enCasco([p[1], p[2]]), `MURALLA: puerta «${p[0]}» fuera del casco`)
  );
  comprobar(
    M.levantada < M.derribada && M.derribada < D.ETAPAS.length,
    'MURALLA: etapas de levantada y derribada'
  );
}

// --- index.html y sw.js -------------------------------------------------------
const html = leer('index.html');
const enlazados = [...html.matchAll(/(?:src|href)="([^"#:]+?)(\?v=(\d+))?"/g)];
enlazados.forEach(m => comprobar(existe(m[1]), `index.html enlaza ${m[1]}, que no existe`));
// La frase de arriba cuenta lo mismo que el marcador: barrios, pueblos y el resto de la provincia
const barrios = D.ZONAS.filter(z => z[3] < 5).length,
  pueblosMapa = D.ZONAS.filter(z => z[3] == 5).length;
comprobar(
  html.includes(`class="sub">${barrios} barrios, ${pueblosMapa} pueblos y el resto de la provincia.`),
  `index.html: la frase de arriba debe decir «${barrios} barrios, ${pueblosMapa} pueblos y el resto de la provincia»`
);
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
const listaSw = (sw.match(/\/\/ <archivos>([\s\S]*?)\/\/ <\/archivos>/) || [null, ''])[1],
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

// Versión visible: la de package.json, con formato 1.4.0, copiada en index.html por version.js
const versionPaquete = JSON.parse(leer('package.json')).version;
comprobar(
  /^\d+\.\d+\.\d+$/.test(versionPaquete),
  `package.json: la versión ${versionPaquete} no tiene formato 1.4.0`
);
comprobar(
  html.includes('<meta name="version" content="' + versionPaquete + '">'),
  'index.html no tiene la versión de package.json: ejecuta node herramientas/version.js'
);

// Novedades: una entrada por versión, de la más nueva a la más vieja; la primera es la de package.json
{
  let novedades = [];
  try {
    novedades = JSON.parse(leer('novedades.json'));
  } catch (e) {
    mal('novedades.json no se puede leer: ' + e.message);
  }
  const num = v => v.split('.').map(Number),
    mayor = (a, b) => {
      const [x, y] = [num(a), num(b)];
      return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
    };
  comprobar(
    novedades.length && novedades[0].version == versionPaquete,
    `novedades.json: falta la entrada de la ${versionPaquete}`
  );
  novedades.forEach((n, i) => {
    comprobar(/^\d+\.\d+\.\d+$/.test(n.version), `novedades.json: versión «${n.version}» mal escrita`);
    comprobar(
      /^\d{4}-\d\d-\d\d$/.test(n.fecha),
      `novedades.json ${n.version}: fecha «${n.fecha}» (AAAA-MM-DD)`
    );
    comprobar(
      n.titulo &&
        n.tecnico &&
        Array.isArray(n.usuario) &&
        n.usuario.length &&
        n.usuario.every(t => t && typeof t == 'string'),
      `novedades.json ${n.version}: falta título, técnico o los puntos para el usuario (una lista de frases)`
    );
    if (i)
      comprobar(
        mayor(novedades[i - 1].version, n.version) > 0,
        `novedades.json: ${n.version} fuera de orden`
      );
  });
}

// Tarjetas de las zonas (herramientas/tarjetas.js): página e imagen por zona, al día con los datos
{
  const medidasJpg = b => {
    // Busca el marcador SOF del JPG, donde van el alto y el ancho
    for (let i = 2; i < b.length - 9;) {
      if (b[i] != 0xff) return null;
      const m = b[i + 1],
        largo = b.readUInt16BE(i + 2);
      if (m >= 0xc0 && m <= 0xc3) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
      i += 2 + largo;
    }
    return null;
  };
  const esc = s =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  D.ZONAS.forEach(([id, n, , , , , c]) => {
    const pag = 'z/' + id + '.html',
      img = 'z/' + id + '.jpg',
      regenerar = ': node herramientas/tarjetas.js zonas';
    if (!existe(pag) || !existe(img)) return mal(`Falta la tarjeta de ${id} (${pag} o ${img})` + regenerar);
    const h = leer(pag);
    comprobar(
      h.includes('og:title" content="' + esc(n) + ' · '),
      `${pag}: el nombre no coincide con los datos` + regenerar
    );
    comprobar(
      h.includes('og:description" content="' + esc(c || '') + '"'),
      `${pag}: la frase no coincide` + regenerar
    );
    comprobar(h.includes("location.replace('../#" + id + "'"), `${pag}: no lleva a la ficha #${id}`);
    const m = medidasJpg(fs.readFileSync(path.join(RAIZ, img)));
    comprobar(m && m[0] == 1200 && m[1] == 630, `${img} debería medir 1200×630`);
  });
  const sobran = fs.existsSync(path.join(RAIZ, 'z'))
    ? fs
        .readdirSync(path.join(RAIZ, 'z'))
        .filter(f => !D.ZONAS.some(z => f == z[0] + '.html' || f == z[0] + '.jpg'))
    : [];
  comprobar(!sobran.length, 'z/ tiene archivos de zonas que ya no existen: ' + sobran.join(', '));
}

// Tarjeta Open Graph: la imagen tiene que estar en el repositorio y medir 1200×630
const imagenOg = (html.match(/property="og:image" content="https:\/\/[^/]+\/mapa-charro\/([^"]+)"/) || [])[1];
comprobar(imagenOg, 'index.html no tiene og:image de la web pública');
if (imagenOg) {
  comprobar(
    existe(imagenOg),
    `og:image apunta a ${imagenOg}, que no existe: node herramientas/tarjetas.js general`
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

// --- sitemap.xml y tipografías propias ---------------------------------------------
{
  const mapa = fs.readFileSync(path.join(RAIZ, 'sitemap.xml'), 'utf8'),
    urls = [...mapa.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  comprobar(mapa.startsWith('<?xml') && mapa.includes('</urlset>'), 'sitemap.xml no está bien formado');
  urls.forEach(u => {
    comprobar(u.startsWith(WEB_PUBLICA), `sitemap.xml: ${u} no es de la web`);
    const archivo = u.slice(WEB_PUBLICA.length) || 'index.html';
    comprobar(fs.existsSync(path.join(RAIZ, archivo)), `sitemap.xml: no existe ${archivo}`);
  });
  comprobar(urls.includes(WEB_PUBLICA), 'sitemap.xml: falta la página principal');
  comprobar(!html.includes('fonts.googleapis.com'), 'index.html pide las fuentes a Google: van en fuentes/');
  for (const f of ['alfa-slab-one.woff2', 'lora.woff2'])
    comprobar(fs.existsSync(path.join(RAIZ, 'fuentes', f)), `falta fuentes/${f}`);
}

// --- Resultado ----------------------------------------------------------------
avisos.forEach(a => console.log('! Aviso: ' + a));
if (errores.length) {
  console.log('✗ ' + errores.length + ' problema' + (errores.length > 1 ? 's' : '') + ' en los datos:');
  errores.forEach(e => console.log('  - ' + e));
  process.exit(1);
}
console.log(
  `✓ Datos correctos: ${ids.length} zonas, ${D.MONUMENTOS.length} monumentos, ${D.RUTAS.length} rutas a pie, ${D.PALABRAS_CHARRAS.length} palabras charras, ${D.RUTAS_PROVINCIA.length} ${D.RUTAS_PROVINCIA.length == 1 ? 'ruta' : 'rutas'} por la provincia, ` +
    `${Object.keys(D.PUEBLOS).length} pueblos con ficha, ${Object.keys(D.DONDE_COMER).length} zonas con dónde comer.`
);
