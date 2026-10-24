// Pruebas de la app en un navegador de verdad (Chromium con Playwright), en móvil y escritorio.
// Uso, desde la raíz del repositorio:  node herramientas/pruebas.js
// Las pruebas están en herramientas/pruebas/, un archivo por zona de la app (ZONAS, abajo); este archivo
// solo las junta y las pasa. PRUEBAS_ZONA=mapa (o varias: mapa,fichas) pasa solo las de esas zonas.
// Necesita Playwright:  npm install  (lo instala como dependencia de desarrollo) y  npx playwright install chromium
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
  '.jpg': 'image/jpeg',
  '.webmanifest': 'application/manifest+json'
};

// Servidor estático mínimo en localhost (el modo sin conexión necesita localhost o https)
function servir() {
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
  return new Promise(ok => srv.listen(0, '127.0.0.1', () => ok(srv)));
}

// --- Pruebas, por zonas -------------------------------------------------------
const { pruebas } = require('./pruebas/comun');
const ZONAS = [
  'inicio',
  'mapa',
  'fichas',
  'provincia',
  'explora',
  'tu-salamanca',
  'guardado',
  'cuenta',
  'accesibilidad',
  'seguridad'
];
for (const zona of ZONAS) {
  const desde = pruebas.length;
  require('./pruebas/' + zona);
  pruebas.slice(desde).forEach(x => (x.zona = zona));
}
const soloZonas = process.env.PRUEBAS_ZONA && process.env.PRUEBAS_ZONA.split(',');
if (soloZonas && soloZonas.some(z => !ZONAS.includes(z))) {
  console.log(`PRUEBAS_ZONA no conocida: ${process.env.PRUEBAS_ZONA} (hay ${ZONAS.join(', ')})`);
  process.exit(1);
}

// --- Ejecución ----------------------------------------------------------------
(async () => {
  const srv = await servir();
  const url = 'http://localhost:' + srv.address().port + '/';
  const navegador = await chromium.launch();
  let fallos = 0,
    pasadas = 0;
  // PRUEBAS_TAMANO=movil o =escritorio pasa solo esas (en GitHub Actions van las dos a la vez)
  const soloTamano = process.env.PRUEBAS_TAMANO;
  for (const [ancho, alto, nombre] of [
    [390, 844, 'móvil'],
    [1280, 860, 'escritorio']
  ].filter(([, , n]) => !soloTamano || n.normalize('NFD').replace(/[\u0300-\u036f]/g, '') == soloTamano)) {
    // PRUEBAS_SOLO=texto pasa solo las pruebas cuyo nombre lo contiene (para ir más rápido mientras se trabaja)
    for (const { nombre: n, fn, opciones } of pruebas.filter(
      x =>
        (!process.env.PRUEBAS_SOLO || x.nombre.includes(process.env.PRUEBAS_SOLO)) &&
        (!soloZonas || soloZonas.includes(x.zona))
    )) {
      const ctx = await navegador.newContext({
        viewport: { width: ancho, height: alto },
        serviceWorkers: opciones.conServiceWorker ? 'allow' : 'block',
        geolocation: opciones.geolocation,
        permissions: opciones.permissions
      });
      const p = await ctx.newPage();
      const errores = [];
      p.on('pageerror', e => errores.push(e.message));
      // Lo que bloquee la CSP de la página es un fallo (salvo en la prueba que lo provoca a propósito)
      p.violacionesCSP = [];
      await p.exposeFunction('avisarCSP', t => p.violacionesCSP.push(t));
      await p.addInitScript(() =>
        document.addEventListener('securitypolicyviolation', e =>
          window.avisarCSP(e.effectiveDirective + ' ' + (e.blockedURI || 'inline'))
        )
      );
      await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
      // La bienvenida de la primera vez taparía la app: se da por vista salvo en su propia prueba
      if (!opciones.conBienvenida)
        await p.addInitScript(() => localStorage.setItem('charro-bienvenida', '1'));
      // «¿Qué puedo descubrir hoy?» sale sola una vez al día: se da por vista hoy salvo en sus pruebas
      if (!opciones.conHoy)
        await p.addInitScript(() => {
          const d = new Date();
          localStorage.setItem(
            'charro-hoy',
            d.getFullYear() +
              '-' +
              String(d.getMonth() + 1).padStart(2, '0') +
              '-' +
              String(d.getDate()).padStart(2, '0')
          );
        });
      // Las calles reales (encendidas de entrada) piden mapas a otras webs, y las novedades de una versión
      // nueva taparían la app: apagadas y vistas salvo en sus propias pruebas
      if (!opciones.conFondoReal)
        await p.addInitScript(() => {
          if (!localStorage.getItem('charro-fondo-real')) localStorage.setItem('charro-fondo-real', '0');
        });
      if (!opciones.conNovedades)
        await p.addInitScript(() => {
          if (!localStorage.getItem('charro-version-vista'))
            localStorage.setItem('charro-version-vista', '999');
        });
      if (opciones.antes) await p.addInitScript(opciones.antes);
      if (opciones.rutas) await opciones.rutas(p);
      try {
        await p.goto(url + (opciones.hash || ''));
        await p.waitForTimeout(250);
        await fn(p, url, ctx);
        if (errores.length) throw new Error('errores de JavaScript: ' + errores.join(' | '));
        if (p.violacionesCSP.length && !opciones.conViolacionCSP)
          throw new Error('bloqueado por la CSP: ' + p.violacionesCSP.join(' | '));
        pasadas++;
        console.log(`✓ ${nombre} · ${n}`);
      } catch (e) {
        fallos++;
        console.log(
          `✗ ${nombre} · ${n}\n    ${process.env.PRUEBAS_DETALLE ? e.message : e.message.split('\n')[0]}`
        );
      }
      await ctx.close();
    }
  }
  await navegador.close();
  srv.close();
  console.log(fallos ? `\n${fallos} prueba(s) fallida(s)` : `\nTodas las pruebas pasan (${pasadas}).`);
  process.exit(fallos ? 1 : 0);
})();
