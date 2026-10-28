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
// Cada prueba va en su propio contexto del navegador (como una ventana de incógnito nueva), así que se pueden
// pasar varias a la vez: PRUEBAS_HILOS=1 las pasa de una en una (por defecto, tantas como núcleos, hasta 4)
const HILOS = +process.env.PRUEBAS_HILOS || Math.min(4, require('os').availableParallelism());

async function pasarPrueba(navegador, url, [ancho, alto], { fn, opciones }) {
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
  if (!opciones.conBienvenida) await p.addInitScript(() => localStorage.setItem('charro-bienvenida', '1'));
  // «¿Qué puedo descubrir hoy?» sale sola una vez al día: se da por vista hoy salvo en sus pruebas
  if (!opciones.conHoy)
    await p.addInitScript(() =>
      // El día de Salamanca, como fechaHoy() en util.js
      localStorage.setItem('charro-hoy', new Date().toLocaleDateString('sv', { timeZone: 'Europe/Madrid' }))
    );
  // Las calles reales (encendidas de entrada) piden mapas a otras webs, y las novedades de una versión
  // nueva taparían la app: apagadas y vistas salvo en sus propias pruebas
  if (!opciones.conFondoReal)
    await p.addInitScript(() => {
      if (!localStorage.getItem('charro-fondo-real')) localStorage.setItem('charro-fondo-real', '0');
    });
  if (!opciones.conNovedades)
    await p.addInitScript(() => {
      if (!localStorage.getItem('charro-version-vista')) localStorage.setItem('charro-version-vista', '999');
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
  } finally {
    await ctx.close();
  }
}

(async () => {
  const srv = await servir();
  const url = 'http://localhost:' + srv.address().port + '/';
  // PRUEBAS_NAVEGADOR=/ruta/a/chromium usa ese navegador en vez del que instala Playwright
  const navegador = await chromium.launch({ executablePath: process.env.PRUEBAS_NAVEGADOR || undefined });
  // PRUEBAS_TAMANO=movil o =escritorio pasa solo esas (en GitHub Actions van las dos a la vez)
  const soloTamano = process.env.PRUEBAS_TAMANO;
  const tamanos = [
    [390, 844, 'móvil'],
    [1280, 860, 'escritorio']
  ].filter(([, , n]) => !soloTamano || n.normalize('NFD').replace(/[̀-ͯ]/g, '') == soloTamano);
  // PRUEBAS_SOLO=texto pasa solo las pruebas cuyo nombre lo contiene (para ir más rápido mientras se trabaja)
  const elegidas = pruebas.filter(
    x =>
      (!process.env.PRUEBAS_SOLO || x.nombre.includes(process.env.PRUEBAS_SOLO)) &&
      (!soloZonas || soloZonas.includes(x.zona))
  );
  const pendientes = tamanos.flatMap(tamano => elegidas.map(prueba => ({ tamano, prueba })));
  const tiempos = [];
  let fallos = 0;
  const hilo = async () => {
    for (let t; (t = pendientes.shift());) {
      const titulo = `${t.tamano[2]} · ${t.prueba.nombre}`,
        inicio = Date.now();
      try {
        await pasarPrueba(navegador, url, t.tamano, t.prueba);
        console.log(`✓ ${titulo}`);
      } catch (e) {
        fallos++;
        console.log(`✗ ${titulo}\n    ${process.env.PRUEBAS_DETALLE ? e.message : e.message.split('\n')[0]}`);
      }
      tiempos.push([Date.now() - inicio, titulo]);
    }
  };
  // Las que miran tiempos de verdad (opción aParte) se pasan al final, solas
  const aParte = pendientes.filter(t => t.prueba.opciones.aParte);
  pendientes.splice(0, pendientes.length, ...pendientes.filter(t => !t.prueba.opciones.aParte));
  await Promise.all(Array.from({ length: HILOS }, hilo));
  pendientes.push(...aParte);
  await hilo();
  await navegador.close();
  srv.close();
  // Las más lentas, para saber dónde mirar si las pruebas tardan
  console.log(
    '\nLas más lentas:\n' +
      tiempos
        .sort((a, b) => b[0] - a[0])
        .slice(0, 5)
        .map(([ms, titulo]) => `  ${(ms / 1000).toFixed(1)} s  ${titulo}`)
        .join('\n')
  );
  console.log(
    fallos
      ? `\n${fallos} prueba(s) fallida(s)`
      : `\nTodas las pruebas pasan (${tiempos.length}), de ${HILOS} en ${HILOS}.`
  );
  process.exit(fallos ? 1 : 0);
})();
