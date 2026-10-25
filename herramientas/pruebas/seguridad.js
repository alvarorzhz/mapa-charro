// Pruebas · Seguridad: CSP, SRI y copias que no se leen.
// Se pasan desde herramientas/pruebas.js (PRUEBAS_ZONA=seguridad pasa solo estas).
const { prueba, igual, cierto, texto, servirMapLibreFalso } = require('./comun');

prueba(
  'Seguridad: un MapLibre cambiado en cdnjs no se ejecuta (SRI) y el fondo se queda apagado',
  async p => {
    await p.waitForTimeout(600);
    cierto(p.pedidasMapLibre > 0, 'se pidió');
    cierto(!(await p.evaluate(() => !!window.maplibregl)), 'pero no se ejecutó');
    cierto(!(await p.$eval('.mw', e => e.classList.contains('fondo-real'))), 'apagado');
    igual(await texto(p, '#ts'), '', 'sin aviso de error');
  },
  {
    conFondoReal: true,
    rutas: p => {
      p.pedidasMapLibre = 0;
      return servirMapLibreFalso(p);
    }
  }
);

prueba(
  'Seguridad: la página lleva su CSP y no deja ejecutar scripts metidos en ella',
  async p => {
    const csp = await p.$eval('meta[http-equiv="Content-Security-Policy"]', m => m.content);
    cierto(csp.includes("object-src 'none'") && !csp.includes('unsafe-eval'), 'CSP estricta');
    const ejecutado = await p.evaluate(async () => {
      const s = document.createElement('script');
      s.textContent = 'window.inyectado = 1';
      document.body.appendChild(s);
      const img = document.createElement('img');
      img.setAttribute('onerror', 'window.inyectado = 2');
      img.src = 'no-existe.png';
      document.body.appendChild(img);
      await new Promise(ok => setTimeout(ok, 300));
      return window.inyectado;
    });
    igual(ejecutado, undefined, 'ni un <script> escrito ni un onerror se ejecutan');
    cierto(p.violacionesCSP.length >= 2, 'el navegador los bloquea por la CSP');
  },
  { conViolacionCSP: true }
);

prueba('Seguridad: una copia demasiado grande no se lee', async p => {
  await p.evaluate(() => abrirCopia());
  const antes = await p.evaluate(() => JSON.stringify(estadoApp.progreso));
  await p.setInputFiles('.copia input[type=file]', {
    name: 'grande.json',
    mimeType: 'application/json',
    buffer: Buffer.alloc(5e6 + 10, ' ')
  });
  await p.waitForTimeout(200);
  cierto((await texto(p, '#ts')).includes('demasiado grande'), 'avisa');
  igual(await p.evaluate(() => JSON.stringify(estadoApp.progreso)), antes, 'y no cambia nada');
});
