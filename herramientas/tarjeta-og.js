// Genera og.png (1200×630), la tarjeta que sale al compartir el enlace de la web en WhatsApp,
// Telegram, redes… Usa el mismo dibujo del mapa que la imagen «Mi Salamanca» (js/imagen.js), con
// unas zonas de ejemplo marcadas para que se entienda de qué va la app.
// Uso, desde la raíz del repositorio:  node herramientas/tarjeta-og.js   (solo hace falta si cambia el diseño)
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
  '.png': 'image/png',
  '.jpg': 'image/jpeg'
};
const PISADAS_EJEMPLO = [
    'centro',
    'univ',
    'sanvicente',
    'sanjuan',
    'sancti',
    'labradores',
    'tejares',
    'vidal',
    'arrabal'
  ],
  QUIERO_IR_EJEMPLO = ['chamberi', 'capuchinos'];

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
  await pagina.goto('http://127.0.0.1:' + srv.address().port + '/');
  const base64 = await pagina.evaluate(
    async ([pisadas, quieroIr]) => {
      // Progreso de ejemplo, solo en memoria (no se guarda)
      progreso = { z: {}, p: {}, f: 0, t: 0, gv: [] };
      pisadas.forEach(id => idsValidos.has(id) && (progreso.z[id] = 'v'));
      quieroIr.forEach(id => idsValidos.has(id) && (progreso.z[id] = 'w'));
      await Promise.all([
        document.fonts.load('80px "Alfa Slab One"'),
        document.fonts.load('600 40px Lora'),
        document.fonts.load('400 40px Lora')
      ]);
      const W = 1200,
        H = 630,
        C = COLORES_IMAGEN,
        lienzo = document.createElement('canvas');
      lienzo.width = W;
      lienzo.height = H;
      const ctx = lienzo.getContext('2d');
      ctx.fillStyle = C.fondo;
      ctx.fillRect(0, 0, W, H);

      // Texto a la izquierda
      ctx.save();
      ctx.translate(64, 176);
      ctx.rotate((-1.5 * Math.PI) / 180);
      ctx.fillStyle = C.rojo;
      ctx.font = '92px "Alfa Slab One", Georgia, serif';
      ctx.fillText('Mapa', 0, 0);
      ctx.fillText('charro', 0, 96);
      ctx.restore();
      ctx.fillStyle = C.tinta;
      ctx.font = '600 38px Lora, Georgia, serif';
      ctx.fillText('de Salamanca', 68, 330);
      ctx.font = '400 27px Lora, Georgia, serif';
      [
        'Marca los barrios que has pisado,',
        'descubre curiosidades, leyendas',
        'y dónde comer en cada uno.'
      ].forEach((linea, i) => ctx.fillText(linea, 68, 392 + i * 38));
      ctx.globalAlpha = 0.8;
      ctx.font = '400 23px Lora, Georgia, serif';
      ctx.fillText(WEB.replace('https://', ''), 68, 570);
      ctx.globalAlpha = 1;

      // Mapa a la derecha
      dibujarMapaImagen(ctx, 590, 40, 570, 550);
      return lienzo.toDataURL('image/png').split(',')[1];
    },
    [PISADAS_EJEMPLO, QUIERO_IR_EJEMPLO]
  );
  fs.writeFileSync(path.join(RAIZ, 'og.png'), Buffer.from(base64, 'base64'));
  await navegador.close();
  srv.close();
  console.log('og.png creada (1200×630)');
})().catch(e => {
  console.error(e);
  process.exit(1);
});
