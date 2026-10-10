// Tarjetas para compartir (Open Graph): la imagen que sale al pegar un enlace en WhatsApp, Telegram, redes…
//   - General: og.png (1200×630), la de la web entera.
//   - Por zona: z/<id>.html + z/<id>.jpg para cada una de las 59 zonas del mapa. La página lleva su
//     propia tarjeta (nombre, frase e imagen con la zona resaltada en el mapa) y lleva al momento a la
//     ficha (#<id>). El botón Compartir de una ficha de zona comparte esa página (enlaces.js).
// Usa el mismo dibujo del mapa que la imagen «Mi Salamanca» (js/imagen.js), en un navegador.
// Uso, desde la raíz del repositorio:
//   node herramientas/tarjetas.js            las dos
//   node herramientas/tarjetas.js general    solo og.png
//   node herramientas/tarjetas.js zonas      solo las de las zonas
// Hay que volver a generarlas si cambia el diseño o el nombre, la frase o el dibujo de una zona
// (comprobar-datos avisa si una página no coincide con los datos).
const http = require('http');
const fs = require('fs');
const path = require('path');

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch (e) {
  const global = require('child_process').execSync('npm root -g').toString().trim();
  ({ chromium } = require(path.join(global, 'playwright')));
}

const RAIZ = path.join(__dirname, '..');
const TIPOS = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg'
};
const que = process.argv[2] || 'todas';
if (!['todas', 'general', 'zonas'].includes(que)) {
  console.error('Uso: node herramientas/tarjetas.js [general|zonas]');
  process.exit(1);
}
// Escapa texto para meterlo en HTML
const html = s =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Página de una zona: su tarjeta y, al abrirla, la ficha
function paginaZona(z, web, titulo) {
  const url = web + 'z/' + z.id + '.html',
    ficha = '../#' + z.id;
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${html(z.n)} · ${html(titulo)}</title>
<meta name="description" content="${html(z.c)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Mapa charro">
<meta property="og:locale" content="es_ES">
<meta property="og:title" content="${html(z.n)} · ${html(titulo)}">
<meta property="og:description" content="${html(z.c)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${web}z/${z.id}.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${html(z.n)} resaltado en el mapa de Salamanca">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="${web}#${z.id}">
<meta http-equiv="refresh" content="0; url=${ficha}">
<script>location.replace('${ficha}' + location.search)</script>
</head>
<body>
<p><a href="${ficha}">Abrir ${html(z.n)} en el Mapa charro de Salamanca</a></p>
</body>
</html>
`;
}

(async () => {
  const srv = http.createServer((req, res) => {
    let f = decodeURIComponent(req.url.split('?')[0]);
    if (f.endsWith('/')) f += 'index.html';
    const ruta = path.join(RAIZ, f);
    if (!ruta.startsWith(RAIZ) || !fs.existsSync(ruta)) {
      res.writeHead(404);
      return res.end();
    }
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(ruta)] || 'application/octet-stream' });
    fs.createReadStream(ruta).pipe(res);
  });
  await new Promise(ok => srv.listen(0, '127.0.0.1', ok));
  const navegador = await chromium.launch();
  const pagina = await navegador.newPage();
  await pagina.addInitScript(() => localStorage.setItem('charro-bienvenida', '1'));
  await pagina.goto('http://127.0.0.1:' + srv.address().port + '/');
  await pagina.evaluate(() =>
    Promise.all([
      document.fonts.load('80px "Alfa Slab One"'),
      document.fonts.load('600 40px Lora'),
      document.fonts.load('400 40px Lora')
    ])
  );

  // --- General -------------------------------------------------------------------
  if (que != 'zonas') {
    // Capital y provincia: el título, tres cifras sacadas de los datos y la provincia entera con la capital en
    // rojo y, en un recuadro, el mapa de la capital (sin nada marcado)
    const base64 = await pagina.evaluate(() => {
      progreso = { z: {}, p: {}, f: 0, t: 0, gv: [] }; // sin zonas marcadas (solo en memoria)
      const C = COLORES_IMAGEN,
        lienzo = document.createElement('canvas');
      lienzo.width = 1200;
      lienzo.height = 630;
      const ctx = lienzo.getContext('2d');
      ctx.fillStyle = C.fondo;
      ctx.fillRect(0, 0, 1200, 630);
      ctx.save();
      ctx.translate(64, 150);
      ctx.rotate((-1.5 * Math.PI) / 180);
      ctx.fillStyle = C.rojo;
      ctx.font = '80px "Alfa Slab One", Georgia, serif';
      ctx.fillText('Mapa', 0, 0);
      ctx.fillText('charro', 0, 83);
      ctx.restore();
      ctx.fillStyle = C.tinta;
      ctx.font = '600 36px Lora, Georgia, serif';
      ctx.fillText('Capital y provincia', 68, 290);
      [
        [zonas.filter(z => z.g < 5).length, 'barrios de la capital'],
        [pueblos.length, 'pueblos con sus pedanías'],
        [RUTAS.length + RUTAS_PROVINCIA.length, 'rutas a pie y en coche']
      ].forEach(([n, texto], i) => {
        ctx.fillStyle = C.rojo;
        ctx.font = '44px "Alfa Slab One", Georgia, serif';
        ctx.fillText(String(n), 68, 370 + i * 62);
        ctx.fillStyle = C.tinta;
        ctx.font = '400 26px Lora, Georgia, serif';
        ctx.fillText(texto, 198, 368 + i * 62);
      });
      ctx.globalAlpha = 0.8;
      ctx.font = '400 23px Lora, Georgia, serif';
      ctx.fillText(WEB.replace('https://', ''), 68, 575);
      ctx.globalAlpha = 1;
      // La provincia, con la proyección plana de su latitud
      const todos = PROVINCIA.m.flatMap(m => m.R).flat(),
        las = todos.map(q => q[0]),
        los = todos.map(q => q[1]),
        [x0, x1, y0, y1] = [Math.min(...los), Math.max(...los), Math.min(...las), Math.max(...las)],
        k = Math.cos((41 * Math.PI) / 180),
        escala = Math.min(600 / ((x1 - x0) * k), 550 / (y1 - y0)),
        dx = 560 + (600 - (x1 - x0) * k * escala) / 2,
        dy = 40 + (550 - (y1 - y0) * escala) / 2,
        punto = q => [dx + (q[1] - x0) * k * escala, dy + (y1 - q[0]) * escala],
        trazar = anillos => {
          ctx.beginPath();
          anillos.forEach(r => {
            r.forEach((q, i) => (i ? ctx.lineTo(...punto(q)) : ctx.moveTo(...punto(q))));
            ctx.closePath();
          });
        };
      ctx.strokeStyle = C.linea;
      ctx.lineWidth = 0.6;
      PROVINCIA.m.forEach(m => {
        trazar(m.R);
        ctx.fillStyle = m.cap ? C.rojo : PUEBLOS[m.n] ? C.claro : C.tarjeta;
        ctx.fill();
        ctx.stroke();
      });
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6;
      PROVINCIA.co.forEach(rs => {
        trazar(rs.map(decodificarLinde));
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
      // La capital, en un recuadro
      ctx.fillStyle = C.tarjeta;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(900, 360, 260, 230, 18);
      ctx.fill();
      ctx.stroke();
      dibujarMapaImagen(ctx, 908, 368, 244, 214, null, false);
      return lienzo.toDataURL('image/png').split(',')[1];
    });
    fs.writeFileSync(path.join(RAIZ, 'og.png'), Buffer.from(base64, 'base64'));
    console.log('og.png (general, 1200×630)');
  }

  // --- Una por zona ------------------------------------------------------------------
  if (que != 'general') {
    const { lista, web, titulo } = await pagina.evaluate(() => ({
      lista: zonas.map(z => ({ id: z.id, n: z.n, c: z.c })),
      web: WEB,
      titulo: TITULO
    }));
    const carpeta = path.join(RAIZ, 'z');
    fs.mkdirSync(carpeta, { recursive: true });
    for (const z of lista) {
      const base64 = await pagina.evaluate(id => {
        const z = zonas.find(q => q.id == id),
          C = COLORES_IMAGEN,
          lienzo = document.createElement('canvas');
        progreso = { z: { [id]: 'v' }, p: {}, f: 0, t: 0, gv: [] }; // solo esta zona, en rojo
        lienzo.width = 1200;
        lienzo.height = 630;
        const ctx = lienzo.getContext('2d');
        ctx.fillStyle = C.fondo;
        ctx.fillRect(0, 0, 1200, 630);

        // Texto a la izquierda: el grupo, el nombre (que quepa) y la frase en varias líneas
        const ancho = 470;
        ctx.fillStyle = C.oro;
        ctx.font = '600 26px Lora, Georgia, serif';
        ctx.fillText(NOMBRES_GRUPOS[z.g], 64, 92);
        let tam = 74;
        ctx.font = tam + 'px "Alfa Slab One", Georgia, serif';
        const palabras = z.n.split(' '),
          lineasNombre = [];
        // Nombre en una o dos líneas, bajando el tamaño si hace falta
        for (; tam >= 40; tam -= 4) {
          ctx.font = tam + 'px "Alfa Slab One", Georgia, serif';
          lineasNombre.length = 0;
          let l = '';
          palabras.forEach(p => {
            const prueba = l ? l + ' ' + p : p;
            if (ctx.measureText(prueba).width > ancho && l) {
              lineasNombre.push(l);
              l = p;
            } else l = prueba;
          });
          lineasNombre.push(l);
          if (lineasNombre.length <= 2 && lineasNombre.every(t => ctx.measureText(t).width <= ancho)) break;
        }
        ctx.fillStyle = C.rojo;
        let y = 92 + tam + 10;
        lineasNombre.forEach(t => {
          ctx.fillText(t, 62, y);
          y += tam * 1.05;
        });
        ctx.fillStyle = C.tinta;
        ctx.font = '400 27px Lora, Georgia, serif';
        let linea = '',
          n = 0;
        y += 18;
        for (const p of z.c.split(' ')) {
          const prueba = linea ? linea + ' ' + p : p;
          if (ctx.measureText(prueba).width > ancho && linea) {
            if (n == 5) break;
            ctx.fillText(linea, 64, y);
            y += 38;
            n++;
            linea = p;
          } else linea = prueba;
        }
        if (n < 6) ctx.fillText(linea, 64, y);
        ctx.fillStyle = C.rojo;
        ctx.font = '26px "Alfa Slab One", Georgia, serif';
        ctx.fillText('Mapa charro', 64, 566);
        ctx.fillStyle = C.tinta;
        ctx.globalAlpha = 0.8;
        ctx.font = '400 21px Lora, Georgia, serif';
        ctx.fillText(WEB.replace('https://', ''), 64, 596);
        ctx.globalAlpha = 1;

        // Mapa a la derecha, encuadrado en la zona con margen (y sin acercarse demasiado)
        const xs = z.P.map(q => q[0]),
          ys = z.P.map(q => q[1]),
          W = 570,
          H = 550,
          cx = (Math.min(...xs) + Math.max(...xs)) / 2,
          cy = (Math.min(...ys) + Math.max(...ys)) / 2,
          lado = Math.max(
            60,
            (Math.max(...xs) - Math.min(...xs)) * 1.6,
            ((Math.max(...ys) - Math.min(...ys)) * 1.6 * W) / H
          ),
          alto = (lado * H) / W;
        dibujarMapaImagen(
          ctx,
          590,
          40,
          W,
          H,
          [cx - lado / 2, cy - alto / 2, cx + lado / 2, cy + alto / 2],
          false
        );
        return lienzo.toDataURL('image/jpeg', 0.84).split(',')[1];
      }, z.id);
      fs.writeFileSync(path.join(carpeta, z.id + '.jpg'), Buffer.from(base64, 'base64'));
      fs.writeFileSync(path.join(carpeta, z.id + '.html'), paginaZona(z, web, titulo));
    }
    console.log('z/: ' + lista.length + ' zonas (página + imagen)');
  }
  await navegador.close();
  srv.close();
})().catch(e => {
  console.error(e);
  process.exit(1);
});
