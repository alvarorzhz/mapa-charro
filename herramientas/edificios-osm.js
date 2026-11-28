// Ayudantes para sacar edificios de OpenStreetMap (Overpass) para el mapa en 3D: los usan
// herramientas/edificios-monumentos.js y herramientas/edificios-3d.js
const { execFileSync } = require('child_process');
const recortes = require('polygon-clipping');

const SERVIDORES = [
  'https://overpass-api.de/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter'
];

// Pide la consulta a los servidores de Overpass, uno tras otro, hasta que uno responde con algo
function descargar(consulta) {
  for (const url of SERVIDORES) {
    try {
      const texto = execFileSync(
        'curl',
        [
          '-sS',
          '-m',
          '240',
          '-A',
          'mapa-charro (github.com/alvarorzhz/mapa-charro)',
          '--data-urlencode',
          'data=' + consulta,
          url
        ],
        { encoding: 'utf8', maxBuffer: 1 << 29 }
      );
      const datos = JSON.parse(texto);
      if (datos.elements && datos.elements.length) return datos;
    } catch (e) {
      console.warn('Falla ' + url + ': ' + e.message.split('\n')[0]);
    }
  }
  throw new Error('Ningún servidor de Overpass ha respondido');
}

// --- Geometría (en metros alrededor de un punto, para ensanchar y medir) -----------------------------
const anillo = geometria => geometria.map(p => [p.lon, p.lat]);
const cerrado = r => r.length > 3 && r[0][0] == r[r.length - 1][0] && r[0][1] == r[r.length - 1][1];
// Une los trozos de los «outer» de una relación en anillos cerrados
function unirTrozos(trozos) {
  const anillos = [],
    sueltos = trozos.map(t => [...t]);
  while (sueltos.length) {
    let r = sueltos.shift();
    for (let cambio = true; cambio && !cerrado(r);) {
      cambio = false;
      for (let i = 0; i < sueltos.length; i++) {
        const t = sueltos[i],
          fin = r[r.length - 1],
          igual = (a, b) => a[0] == b[0] && a[1] == b[1];
        if (igual(fin, t[0])) r = r.concat(t.slice(1));
        else if (igual(fin, t[t.length - 1])) r = r.concat([...t].reverse().slice(1));
        else continue;
        sueltos.splice(i, 1);
        cambio = true;
        break;
      }
    }
    if (cerrado(r)) anillos.push(r);
  }
  return anillos;
}
const dentroDe = ([x, y], r) => {
  let si = false;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++)
    if (
      r[i][1] > y != r[j][1] > y &&
      x < ((r[j][0] - r[i][0]) * (y - r[i][1])) / (r[j][1] - r[i][1]) + r[i][0]
    )
      si = !si;
  return si;
};
const areaM2 = r => {
  const k = 111320 * Math.cos((r[0][1] * Math.PI) / 180);
  let a = 0;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++)
    a += (r[j][0] - r[i][0]) * k * (r[j][1] + r[i][1]) * 111320;
  return Math.abs(a / 2);
};
const centro = r => {
  const p = r.slice(0, -1);
  return [p.reduce((s, q) => s + q[0], 0) / p.length, p.reduce((s, q) => s + q[1], 0) / p.length];
};
// Ensancha un anillo «metros» desde su centro (basta para tapar las paredes de debajo); con hacia = -1 lo
// estrecha (los patios, para que tampoco asomen sus paredes). decimales: precisión de las coordenadas
function ensanchar(r, metros, hacia = 1, decimales = 6) {
  const [cx, cy] = centro(r),
    k = 111320 * Math.cos((cy * Math.PI) / 180);
  return r.map(([x, y]) => {
    const dx = (x - cx) * k,
      dy = (y - cy) * 111320,
      d = Math.hypot(dx, dy) || 1,
      f = Math.max(0.1, (d + hacia * metros) / d);
    return [+(cx + (dx * f) / k).toFixed(decimales), +(cy + (dy * f) / 111320).toFixed(decimales)];
  });
}
// Quita los puntos que se separan menos de «metros» de la línea entre sus vecinos (Douglas-Peucker): en un
// edificio, los que no cambian su forma a la vista
function simplificar(r, metros) {
  const k = 111320 * Math.cos((r[0][1] * Math.PI) / 180),
    m = r.map(([x, y]) => [x * k, y * 111320]),
    guardar = new Array(r.length).fill(false);
  guardar[0] = guardar[r.length - 1] = true;
  const tramo = (a, b) => {
    let peor = -1,
      dmax = metros;
    for (let i = a + 1; i < b; i++) {
      const [ax, ay] = m[a],
        [bx, by] = m[b],
        [px, py] = m[i],
        largo = Math.hypot(bx - ax, by - ay),
        d = largo
          ? Math.abs((bx - ax) * (ay - py) - (ax - px) * (by - ay)) / largo
          : Math.hypot(px - ax, py - ay);
      if (d > dmax) [peor, dmax] = [i, d];
    }
    if (peor < 0) return;
    guardar[peor] = true;
    tramo(a, peor);
    tramo(peor, b);
  };
  // El anillo empieza y acaba en el mismo punto: se parte por el más lejano a él para no perder esa esquina
  const lejos = m.reduce(
    (mejor, q, i) =>
      Math.hypot(q[0] - m[0][0], q[1] - m[0][1]) > Math.hypot(m[mejor][0] - m[0][0], m[mejor][1] - m[0][1])
        ? i
        : mejor,
    0
  );
  guardar[lejos] = true;
  tramo(0, lejos);
  tramo(lejos, r.length - 1);
  const queda = r.filter((_, i) => guardar[i]);
  return queda.length >= 4 ? queda : r;
}

// Altura como la calcula OpenMapTiles (render_height): height, o plantas × 3,66 m; si no, 5 m
const metros = v => {
  const n = parseFloat(String(v || '').replace(',', '.'));
  return isFinite(n) ? n : null;
};
const altura = t =>
  metros(t.height) ?? (metros(t['building:levels']) != null ? metros(t['building:levels']) * 3.66 : 5);
const base = t =>
  metros(t.min_height) ??
  (metros(t['building:min_level']) != null ? metros(t['building:min_level']) * 3.66 : 0);
const distanciaM = ([x, y], r) => {
  const k = 111320 * Math.cos((y * Math.PI) / 180);
  let menor = Infinity;
  for (let i = 1; i < r.length; i++) {
    const ax = (r[i - 1][0] - x) * k,
      ay = (r[i - 1][1] - y) * 111320,
      bx = (r[i][0] - x) * k,
      by = (r[i][1] - y) * 111320,
      dx = bx - ax,
      dy = by - ay,
      t = Math.max(0, Math.min(1, -(ax * dx + ay * dy) / (dx * dx + dy * dy || 1)));
    menor = Math.min(menor, Math.hypot(ax + t * dx, ay + t * dy));
  }
  return menor;
};

// Edificios y partes (building:part) de una respuesta de Overpass, con sus anillos y patios
function edificiosYPartes(datos) {
  const edificios = [],
    partes = [];
  for (const e of datos.elements) {
    const t = e.tags || {};
    let anillos = [],
      patios = [];
    const trozos = papel =>
      unirTrozos((e.members || []).filter(m => m.role == papel && m.geometry).map(m => anillo(m.geometry)));
    if (e.type == 'way' && e.geometry) anillos = [anillo(e.geometry)].filter(cerrado);
    else if (e.type == 'relation') [anillos, patios] = [trozos('outer'), trozos('inner')];
    if (!anillos.length) continue;
    const elemento = { id: e.type + '/' + e.id, n: t.name || '', t, anillos, patios };
    (t['building:part'] && !t.building ? partes : edificios).push(elemento);
  }
  return { edificios, partes };
}

// El edificio en el que cae un punto ([lon, lat]) o, si cae en la calle o un patio, el edificio con nombre o
// histórico más cercano (a menos de cerca metros); si no hay ninguno, el más cercano a menos de la mitad
const destacado = t =>
  !!(t.name || t.historic || t.heritage || t.tourism || t.amenity == 'place_of_worship') ||
  /^(church|cathedral|chapel|university|palace|monastery|convent|museum|civic|public|castle)$/.test(
    t.building
  );
function edificioDePunto(punto, edificios, cerca = 30) {
  const candidatos = edificios
    .filter(e => e.anillos.some(r => dentroDe(punto, r)))
    .sort((a, b) => areaM2(a.anillos[0]) - areaM2(b.anillos[0]));
  if (candidatos[0]) return { ed: candidatos[0], cercano: false };
  const lista = edificios
    .map(e => ({ e, d: Math.min(...e.anillos.map(r => distanciaM(punto, r))) }))
    .filter(x => x.d < cerca)
    .sort((a, b) => a.d - b.d);
  const conNombre = lista.find(x => destacado(x.e.t));
  const ed = conNombre ? conNombre.e : lista[0] && lista[0].d < cerca / 2 ? lista[0].e : null;
  return ed && { ed, cercano: true };
}

// --- Tejados ---------------------------------------------------------------------------------------
// MapLibre solo levanta prismas: un tejado (roof:shape y roof:height de OSM) se hace con rodajas cada vez
// más estrechas. Cúpula: perfil de círculo; chapitel o pirámide: recto; a dos aguas: solo se estrecha de
// lado (hacia la cumbrera, a lo largo del lado más largo o de roof:orientation)
const FORMA_TEJADO = {
  dome: t => Math.sqrt(Math.max(0, 1 - t * t)),
  onion: t => Math.sqrt(Math.max(0, 1 - t * t)),
  pyramidal: t => 1 - t,
  cone: t => 1 - t,
  hipped: t => 1 - t,
  gabled: t => 1 - t
};
const RODAJAS = 5;
// Escala un anillo hacia su centro: f en todas direcciones o, con eje (vector unitario en metros), solo en
// la dirección perpendicular a él
function escalar(r, f, eje, decimales = 6) {
  const [cx, cy] = centro(r),
    k = 111320 * Math.cos((cy * Math.PI) / 180);
  return r.map(([x, y]) => {
    let dx = (x - cx) * k,
      dy = (y - cy) * 111320;
    if (eje) {
      const a = dx * eje[0] + dy * eje[1]; // a lo largo de la cumbrera, se queda
      [dx, dy] = [eje[0] * a + (dx - eje[0] * a) * f, eje[1] * a + (dy - eje[1] * a) * f];
    } else [dx, dy] = [dx * f, dy * f];
    return [+(cx + dx / k).toFixed(decimales), +(cy + dy / 111320).toFixed(decimales)];
  });
}
// Dirección del lado más largo (la cumbrera de un tejado a dos aguas); con roof:orientation=across, la otra
function ejeCumbrera(r, orientacion) {
  const k = 111320 * Math.cos((r[0][1] * Math.PI) / 180);
  let mejor = [1, 0],
    largo = 0;
  for (let i = 1; i < r.length; i++) {
    const dx = (r[i][0] - r[i - 1][0]) * k,
      dy = (r[i][1] - r[i - 1][1]) * 111320,
      l = Math.hypot(dx, dy);
    if (l > largo) [mejor, largo] = [[dx / l, dy / l], l];
  }
  return orientacion == 'across' ? [-mejor[1], mejor[0]] : mejor;
}
// Las piezas de una parte con tejado: las paredes hasta donde empieza y el tejado en rodajas
function piezasConTejado(r, t, h, b, ensanche) {
  const forma = FORMA_TEJADO[t['roof:shape']],
    alto =
      metros(t['roof:height']) ?? (t['roof:shape'] == 'dome' || t['roof:shape'] == 'onion' ? (h - b) / 3 : 0);
  if (!forma || !(alto > 0.5) || alto >= h - b) return null;
  const planta = ensanchar(r, ensanche),
    paredes = h - alto,
    eje = t['roof:shape'] == 'gabled' ? ejeCumbrera(r, t['roof:orientation']) : null,
    piezas = [{ h: +paredes.toFixed(1), b: +b.toFixed(1), r: [planta] }];
  for (let i = 0; i < RODAJAS; i++) {
    const f = forma((i + 0.5) / RODAJAS);
    if (f < 0.05) break;
    piezas.push({
      h: +(paredes + (alto * (i + 1)) / RODAJAS).toFixed(1),
      b: +(paredes + (alto * i) / RODAJAS).toFixed(1),
      t: 1, // rodaja de tejado: el 3D esconde los edificios de OpenFreeMap que asoman por ella
      r: [escalar(planta, f, eje)]
    });
  }
  return piezas;
}

// El edificio sin lo que ocupan sus partes (polygon-clipping), con la misma altura y etiquetas
function sinPartes(ed, partes) {
  const conPatios = e => e.anillos.map(r => [r, ...e.patios.filter(q => dentroDe(centro(q), r))]);
  const resto = recortes.difference(conPatios(ed), ...partes.map(conPatios));
  return {
    ...ed,
    anillos: resto.map(poligono => poligono[0]),
    patios: resto.flatMap(poligono => poligono.slice(1))
  };
}

// Las piezas de un edificio para el 3D: su planta (y la de sus partes) ensanchada, sus patios y su altura;
// con tejados, los que tienen forma en OSM se hacen en rodajas (piezasConTejado)
// usadas: si se pasa, se apuntan en él los ids de las partes que se han tomado. vaciar: la planta del edificio
// se dibuja sin lo que ocupan sus partes, para que se vean los huecos bajo las que empiezan por encima del suelo
// (los soportales de la Plaza Mayor)
function piezasDeEdificio(ed, partes, ensanche, tejados = false, usadas = null, vaciar = false) {
  const suyas = partes.filter(p => ed.anillos.some(r => dentroDe(centro(p.anillos[0]), r)));
  if (usadas) suyas.forEach(p => usadas.add(p.id));
  const planta = vaciar && suyas.length ? sinPartes(ed, suyas) : ed;
  const piezas = [planta, ...suyas].flatMap(p =>
    p.anillos.flatMap(r => {
      const h = altura(p.t),
        b = base(p.t),
        conTejado = tejados && !p.patios.length && piezasConTejado(r, p.t, h, b, ensanche);
      return (
        conTejado || [
          {
            h: +h.toFixed(1),
            b: +b.toFixed(1),
            r: [
              ensanchar(r, ensanche),
              ...p.patios.filter(q => dentroDe(centro(q), r)).map(q => ensanchar(q, ensanche, -1))
            ]
          }
        ]
      );
    })
  );
  // La planta del edificio llega hasta la más alta de sus partes si no tiene altura propia
  if (suyas.length && piezas[0].h <= 5) piezas[0].h = Math.min(...suyas.map(p => altura(p.t)), 15);
  return piezas;
}

module.exports = {
  descargar,
  dentroDe,
  centro,
  ensanchar,
  simplificar,
  altura,
  base,
  edificiosYPartes,
  edificioDePunto,
  piezasDeEdificio,
  distanciaM,
  areaM2
};
