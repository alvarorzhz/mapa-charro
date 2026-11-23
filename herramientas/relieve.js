// Teselas de relieve para el mapa en 3D (js/mapa-3d.js): la provincia de Salamanca y un margen alrededor,
// en PNG con la codificación «Terrarium» (altura = R·256 + G + B/256 − 32768, en metros enteros), de
// 512 píxeles, en relieve/{z}/{x}/{y}.png, y sus límites en js/datos/relieve.js. Uso:
//   node herramientas/relieve.js [carpeta]   (con carpeta, guarda ahí lo descargado y lo reutiliza)
//
// Fuentes: el Modelo Digital del Terreno MDT25 del Instituto Geográfico Nacional (servicio WCS de la
// IDEE, a 50 m), libre citando la fuente (CC BY 4.0 scne.es). El MDT solo cubre España: lo que cae en
// Portugal (la otra orilla de las Arribes) y lo que queda fuera de lo descargado se completa con las
// «Terrain Tiles» de Mapzen en AWS (Open Data, sobre todo SRTM). Los archivos no se editan a mano.

const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');
const zlib = require('zlib');
const { execFileSync } = require('child_process');
const { sinExport } = require('./datos');

const RAIZ = path.join(__dirname, '..');
const ZOOM_MIN = 7,
  ZOOM_MAX = 10,
  TAM = 512,
  MARGEN = 0.12, // grados alrededor de la provincia
  PASO_IGN = 0.5, // grados de cada trozo pedido al WCS
  SOLAPE_IGN = 0.01;
const WCS = 'https://servicios.idee.es/wcs-inspire/mdt';
const AWS = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium';
const CARPETA = process.argv[2] || path.join(os.tmpdir(), 'relieve-salamanca');
fs.mkdirSync(CARPETA, { recursive: true });

// --- Límites de la provincia --------------------------------------------------
const contexto = {};
vm.runInNewContext(
  sinExport(fs.readFileSync(path.join(RAIZ, 'js/datos/provincia.js'), 'utf8')) + ';this.P = PROVINCIA;',
  contexto
);
let [sur, oeste, norte, este] = [90, 180, -90, -180];
for (const m of contexto.P.m)
  for (const r of m.r) {
    let la = 0,
      lo = 0;
    for (let i = 0; i < r.length; i += 2) {
      la += r[i];
      lo += r[i + 1];
      [sur, norte] = [Math.min(sur, la / 1000), Math.max(norte, la / 1000)];
      [oeste, este] = [Math.min(oeste, lo / 1000), Math.max(este, lo / 1000)];
    }
  }
const redondear = v => Math.round(v * 1000) / 1000;
const LIMITES = [oeste - MARGEN, sur - MARGEN, este + MARGEN, norte + MARGEN].map(redondear);

// --- Mercator ---------------------------------------------------------------------
const aTeselaX = (lon, z) => Math.floor(((lon + 180) / 360) * 2 ** z);
const aTeselaY = (lat, z) => {
  const r = (lat * Math.PI) / 180;
  return Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** z);
};
const longitud = (px, total) => (px / total) * 360 - 180;
const latitud = (py, total) => (Math.atan(Math.sinh(Math.PI * (1 - (2 * py) / total))) * 180) / Math.PI;
const teselasDe = z => {
  const lista = [];
  for (let x = aTeselaX(LIMITES[0], z); x <= aTeselaX(LIMITES[2], z); x++)
    for (let y = aTeselaY(LIMITES[3], z); y <= aTeselaY(LIMITES[1], z); y++) lista.push([x, y]);
  return lista;
};

// --- Descargas -------------------------------------------------------------------
function descargar(url, archivo) {
  const destino = path.join(CARPETA, archivo);
  if (fs.existsSync(destino) && fs.statSync(destino).size) return fs.readFileSync(destino);
  for (let intento = 1; ; intento++)
    try {
      execFileSync('curl', ['-sSf', '-m', '180', '-o', destino, url]);
      return fs.readFileSync(destino);
    } catch (e) {
      if (intento == 5) throw e;
      execFileSync('sleep', [String(intento * 3)]);
    }
}

// --- GeoTIFF del WCS (sin comprimir, en tiras, enteros con signo de 16 o 32 bits) -----
function leerTiff(b) {
  if (b.toString('latin1', 0, 2) != 'II') throw new Error('TIFF no esperado');
  const ifd = b.readUInt32LE(4),
    etiquetas = {},
    tamTipo = { 1: 1, 2: 1, 3: 2, 4: 4, 11: 4, 12: 8 };
  for (let i = 0, n = b.readUInt16LE(ifd); i < n; i++) {
    const e = ifd + 2 + i * 12,
      tipo = b.readUInt16LE(e + 2),
      cuenta = b.readUInt32LE(e + 4),
      bytes = tamTipo[tipo] * cuenta,
      inicio = bytes > 4 ? b.readUInt32LE(e + 8) : e + 8,
      valor = j =>
        tipo == 3
          ? b.readUInt16LE(inicio + j * 2)
          : tipo == 4
            ? b.readUInt32LE(inicio + j * 4)
            : tipo == 12
              ? b.readDoubleLE(inicio + j * 8)
              : b[inicio + j];
    etiquetas[b.readUInt16LE(e)] = Array.from({ length: cuenta }, (_, j) => valor(j));
  }
  const ancho = etiquetas[256][0],
    alto = etiquetas[257][0];
  const bits = etiquetas[258][0];
  if (etiquetas[259][0] != 1 || ![16, 32].includes(bits) || etiquetas[339][0] != 2)
    throw new Error('El WCS ha cambiado de formato (se esperaban enteros con signo sin comprimir)');
  const datos = new Int32Array(ancho * alto);
  let k = 0;
  etiquetas[273].forEach((desde, t) => {
    for (let j = 0; j < etiquetas[279][t]; j += bits / 8)
      datos[k++] = bits == 16 ? b.readInt16LE(desde + j) : b.readInt32LE(desde + j);
  });
  const [dLon, dLat] = etiquetas[33550],
    [, , , lon0, lat0] = etiquetas[33922];
  return { ancho, alto, dLon, dLat, lon0, lat0, datos };
}

// --- PNG (lo justo: leer RGB/RGBA de 8 bits y escribir RGB) ------------------------
const paeth = (a, b, c) => {
  const p = a + b - c,
    pa = Math.abs(p - a),
    pb = Math.abs(p - b),
    pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
};
function leerPng(b) {
  let i = 8,
    ancho,
    alto,
    tipo;
  const trozos = [];
  while (i < b.length) {
    const largo = b.readUInt32BE(i),
      nombre = b.toString('latin1', i + 4, i + 8),
      d = b.subarray(i + 8, i + 8 + largo);
    if (nombre == 'IHDR') [ancho, alto, tipo] = [d.readUInt32BE(0), d.readUInt32BE(4), d[9]];
    if (nombre == 'IDAT') trozos.push(d);
    i += 12 + largo;
  }
  const canales = tipo == 6 ? 4 : 3,
    fila = ancho * canales,
    crudo = zlib.inflateSync(Buffer.concat(trozos)),
    px = Buffer.alloc(fila * alto);
  for (let y = 0; y < alto; y++) {
    const f = crudo[y * (fila + 1)];
    for (let x = 0; x < fila; x++) {
      const c = crudo[y * (fila + 1) + 1 + x],
        a = x >= canales ? px[y * fila + x - canales] : 0,
        arriba = y ? px[(y - 1) * fila + x] : 0,
        ac = x >= canales && y ? px[(y - 1) * fila + x - canales] : 0;
      px[y * fila + x] = (c + [0, a, arriba, (a + arriba) >> 1, paeth(a, arriba, ac)][f]) & 255;
    }
  }
  return { ancho, canales, px };
}
const CRC = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc = b => {
  let c = 0xffffffff;
  for (const v of b) c = CRC[(c ^ v) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const trozoPng = (nombre, d) => {
  const t = Buffer.alloc(12 + d.length);
  t.writeUInt32BE(d.length, 0);
  t.write(nombre, 4, 'latin1');
  d.copy(t, 8);
  t.writeUInt32BE(crc(t.subarray(4, 8 + d.length)), 8 + d.length);
  return t;
};
// Cada fila con el filtro que deja menos bytes (la suma de los valores más pequeña)
function escribirPng(rgb, ancho, alto) {
  const fila = ancho * 3,
    salida = Buffer.alloc((fila + 1) * alto),
    prueba = Buffer.alloc(fila);
  for (let y = 0; y < alto; y++) {
    let menor = Infinity;
    for (let f = 0; f < 5; f++) {
      let suma = 0;
      for (let x = 0; x < fila; x++) {
        const c = rgb[y * fila + x],
          a = x >= 3 ? rgb[y * fila + x - 3] : 0,
          arriba = y ? rgb[(y - 1) * fila + x] : 0,
          ac = x >= 3 && y ? rgb[(y - 1) * fila + x - 3] : 0,
          v = (c - [0, a, arriba, (a + arriba) >> 1, paeth(a, arriba, ac)][f]) & 255;
        prueba[x] = v;
        suma += v < 128 ? v : 256 - v;
      }
      if (suma < menor) {
        menor = suma;
        salida[y * (fila + 1)] = f;
        prueba.copy(salida, y * (fila + 1) + 1);
      }
    }
  }
  const cabecera = Buffer.alloc(13);
  cabecera.writeUInt32BE(ancho, 0);
  cabecera.writeUInt32BE(alto, 4);
  cabecera[8] = 8;
  cabecera[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    trozoPng('IHDR', cabecera),
    trozoPng('IDAT', zlib.deflateSync(salida, { level: 9 })),
    trozoPng('IEND', Buffer.alloc(0))
  ]);
}

// --- Alturas del IGN: trozos de PASO_IGN grados que cubren las teselas del zoom mayor ----------------
const extremo = teselasDe(ZOOM_MAX),
  totalMax = TAM * 2 ** ZOOM_MAX,
  xs = extremo.map(t => t[0]),
  ys = extremo.map(t => t[1]),
  IGN_O = Math.floor(longitud(Math.min(...xs) * TAM, totalMax) / PASO_IGN) * PASO_IGN,
  IGN_E = longitud((Math.max(...xs) + 1) * TAM, totalMax),
  IGN_S = Math.floor(latitud((Math.max(...ys) + 1) * TAM, totalMax) / PASO_IGN) * PASO_IGN,
  IGN_N = latitud(Math.min(...ys) * TAM, totalMax),
  trozos = [];
for (let lat = IGN_S; lat < IGN_N; lat += PASO_IGN) {
  const filaTrozos = [];
  for (let lon = IGN_O; lon < IGN_E; lon += PASO_IGN) {
    const caja = [
      lat - SOLAPE_IGN,
      lat + PASO_IGN + SOLAPE_IGN,
      lon - SOLAPE_IGN,
      lon + PASO_IGN + SOLAPE_IGN
    ];
    const url =
      `${WCS}?service=WCS&request=GetCoverage&version=2.0.1&coverageId=Elevacion4258_25` +
      `&subset=Lat(${caja[0]},${caja[1]})&subset=Long(${caja[2]},${caja[3]})&format=image/tiff&SCALEFACTOR=0.5`;
    process.stdout.write(`IGN ${lat.toFixed(1)} ${lon.toFixed(1)}\r`);
    filaTrozos.push(leerTiff(descargar(url, `ign_${lat.toFixed(2)}_${lon.toFixed(2)}.tif`)));
  }
  trozos.push(filaTrozos);
}
console.log(`IGN: ${trozos.length * trozos[0].length} trozos`);

// Altura bilineal del IGN, o null si no hay dato (fuera de lo descargado o de España: el WCS da 0)
function alturaIgn(lat, lon) {
  const fila = trozos[Math.floor((lat - IGN_S) / PASO_IGN)],
    t = fila && fila[Math.floor((lon - IGN_O) / PASO_IGN)];
  if (!t) return null;
  const fx = (lon - t.lon0) / t.dLon - 0.5,
    fy = (t.lat0 - lat) / t.dLat - 0.5,
    x = Math.floor(fx),
    y = Math.floor(fy);
  if (x < 0 || y < 0 || x + 1 >= t.ancho || y + 1 >= t.alto) return null;
  const v = (i, j) => t.datos[(y + j) * t.ancho + x + i],
    a = v(0, 0),
    b = v(1, 0),
    c = v(0, 1),
    d = v(1, 1);
  if (a <= 0 || b <= 0 || c <= 0 || d <= 0) return null;
  const dx = fx - x,
    dy = fy - y;
  return (a * (1 - dx) + b * dx) * (1 - dy) + (c * (1 - dx) + d * dx) * dy;
}

// Alturas de AWS para una tesela de 512 px a zoom z: las cuatro de 256 px del zoom z+1
function alturasAws(z, x, y) {
  const alturas = new Float32Array(TAM * TAM);
  for (let j = 0; j < 2; j++)
    for (let i = 0; i < 2; i++) {
      const [zz, xx, yy] = [z + 1, 2 * x + i, 2 * y + j],
        png = leerPng(descargar(`${AWS}/${zz}/${xx}/${yy}.png`, `aws_${zz}_${xx}_${yy}.png`));
      for (let py = 0; py < 256; py++)
        for (let px = 0; px < 256; px++) {
          const k = (py * 256 + px) * png.canales;
          alturas[(j * 256 + py) * TAM + i * 256 + px] =
            png.px[k] * 256 + png.px[k + 1] + png.px[k + 2] / 256 - 32768;
        }
    }
  return alturas;
}

// --- Teselas ------------------------------------------------------------------------
const SALIDA = path.join(RAIZ, 'relieve');
fs.rmSync(SALIDA, { recursive: true, force: true });
let bytes = 0,
  cuantas = 0,
  deAws = 0;
for (let z = ZOOM_MIN; z <= ZOOM_MAX; z++) {
  const total = TAM * 2 ** z,
    sub = 2 ** (ZOOM_MAX - z); // muestras por lado de cada píxel (media), como si fuera el zoom mayor
  for (const [x, y] of teselasDe(z)) {
    let aws = null;
    const rgb = Buffer.alloc(TAM * TAM * 3);
    for (let py = 0; py < TAM; py++)
      for (let px = 0; px < TAM; px++) {
        let suma = 0,
          validas = 0;
        for (let j = 0; j < sub; j++)
          for (let i = 0; i < sub; i++) {
            const gx = x * TAM + px + (i + 0.5) / sub,
              gy = y * TAM + py + (j + 0.5) / sub,
              h = alturaIgn(latitud(gy, total), longitud(gx, total));
            if (h != null) [suma, validas] = [suma + h, validas + 1];
          }
        let h;
        if (validas * 2 >= sub * sub) h = suma / validas;
        else {
          aws ||= alturasAws(z, x, y);
          h = aws[py * TAM + px];
          deAws++;
        }
        const v = Math.max(0, Math.round(h) + 32768),
          k = (py * TAM + px) * 3;
        rgb[k] = v >> 8;
        rgb[k + 1] = v & 255;
      }
    const png = escribirPng(rgb, TAM, TAM),
      archivo = path.join(SALIDA, String(z), String(x), y + '.png');
    fs.mkdirSync(path.dirname(archivo), { recursive: true });
    fs.writeFileSync(archivo, png);
    bytes += png.length;
    cuantas++;
    process.stdout.write(`z${z} ${x}/${y}   \r`);
  }
}
console.log(
  `${cuantas} teselas, ${(bytes / 1048576).toFixed(1)} MB; ` +
    `${((100 * deAws) / (cuantas * TAM * TAM)).toFixed(1)} % de píxeles de AWS`
);

fs.writeFileSync(
  path.join(RAIZ, 'js/datos/relieve.js'),
  '// Teselas de relieve del mapa en 3D (relieve/{z}/{x}/{y}.png, Terrarium, 512 px). Generado por\n' +
    '// herramientas/relieve.js: no editar a mano.\n' +
    'export const RELIEVE = ' +
    JSON.stringify({
      zoomMin: ZOOM_MIN,
      zoomMax: ZOOM_MAX,
      tam: TAM,
      limites: LIMITES,
      teselas: cuantas
    }) +
    ';\n'
);
