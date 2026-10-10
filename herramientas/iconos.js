// Iconos de la app (la V de vítor) a partir de icons/icono.svg: icon-512.png (también adaptable: lo
// importante cabe en el círculo central), icon-192.png y icon-180.png (iPhone). La letra es Alfa Slab
// One, que se carga de Google Fonts al generarlos. Uso: node herramientas/iconos.js
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const RAIZ = path.join(__dirname, '..');
const svg = fs.readFileSync(path.join(RAIZ, 'icons/icono.svg'), 'utf8');

(async () => {
  const navegador = await chromium.launch();
  for (const lado of [512, 192, 180]) {
    const pagina = await navegador.newPage({ viewport: { width: lado, height: lado } });
    await pagina.setContent(
      `<!doctype html><html><head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Alfa+Slab+One&display=block"><style>html,body{margin:0}svg{display:block;width:${lado}px;height:${lado}px}</style></head><body>${svg}</body></html>`
    );
    await pagina.evaluate(() => document.fonts.load('250px "Alfa Slab One"'));
    await pagina.waitForTimeout(200);
    await pagina.screenshot({ path: path.join(RAIZ, `icons/icon-${lado}.png`) });
    await pagina.close();
    console.log(`icons/icon-${lado}.png`);
  }
  await navegador.close();
})();
