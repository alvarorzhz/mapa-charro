// Lo que comparten las pruebas de todas las zonas: la lista de pruebas, las comprobaciones y los falsos
// que usa más de una zona. Cada archivo de esta carpeta apunta sus pruebas con prueba(); las pasa
// herramientas/pruebas.js.
const pruebas = [];
const prueba = (nombre, fn, opciones = {}) => pruebas.push({ nombre, fn, opciones });
// Compara por valor: el orden de las claves de un objeto no cuenta (el de las listas, sí)
const ordenarClaves = x =>
  Array.isArray(x)
    ? x.map(ordenarClaves)
    : x && typeof x == 'object'
      ? Object.fromEntries(
          Object.keys(x)
            .sort()
            .map(k => [k, ordenarClaves(x[k])])
        )
      : x;
const igual = (a, b, que) => {
  if (!mismoValor(a, b)) throw new Error(`${que}: esperaba ${JSON.stringify(b)} y es ${JSON.stringify(a)}`);
};
const cierto = (c, que) => {
  if (!c) throw new Error(que);
};
// Esperas a una condición en vez de a un tiempo fijo: leer() se repite hasta que da lo esperado (o algo
// cierto) y, si a los 5 s no lo da, falla como igual() o cierto(). Solo para lo que tiene que llegar a pasar:
// para comprobar que algo sigue igual pasado un tiempo, el reloj de Playwright (p.clock)
const ESPERA_MAXIMA = 5000;
const mismoValor = (a, b) => JSON.stringify(ordenarClaves(a)) === JSON.stringify(ordenarClaves(b));
async function repetirHasta(leer, vale) {
  const fin = Date.now() + ESPERA_MAXIMA;
  let valor = await leer();
  while (!vale(valor) && Date.now() < fin) {
    await new Promise(ok => setTimeout(ok, 50));
    valor = await leer();
  }
  return valor;
}
// Espera a que acaben las transiciones y animaciones CSS que hay en marcha (las que no acaban nunca, no)
const sinTransiciones = p =>
  p.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter(a => a.effect && a.effect.getComputedTiming().endTime != Infinity)
        .map(a => a.finished.catch(() => {}))
    )
  );
const llegaA = async (leer, esperado, que) =>
  igual(await repetirHasta(leer, v => mismoValor(v, esperado)), esperado, que);
const hastaQue = async (leer, que) => cierto(await repetirHasta(leer, Boolean), que);
const texto = (p, s) => p.$eval(s, e => e.textContent.trim());
const fichaAbierta = p => p.$eval('#sh', e => e.classList.contains('o'));

// MapLibre falso (sin red): apunta el encuadre que le pide la app y cuántas veces se pide
const MAPLIBRE_FALSO = `window.maplibregl = { Map: class {
  constructor(o) { window.estiloFondo = o.style; }
  jumpTo(c) { window.camaraFondo = c; }
  resize() {} setStyle(s) { window.estiloFondo = s; }
} };`;
const huellaSri = texto => 'sha384-' + require('crypto').createHash('sha384').update(texto).digest('base64');
const servirMapLibreFalso = p =>
  p.route('https://cdnjs.cloudflare.com/**', r => {
    p.pedidasMapLibre++;
    r.fulfill({
      contentType: 'text/javascript',
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: MAPLIBRE_FALSO
    });
  });
const mapLibreFalso = async p => {
  p.pedidasMapLibre = 0;
  // La app solo ejecuta el MapLibre de verdad (SRI): aquí se le da la huella del falso
  await p.route(/\/js\/mapa-real\.js/, async r => {
    const res = await r.fetch();
    r.fulfill({
      response: res,
      body: (await res.text()).replace(/sha384-[A-Za-z0-9+/=]+/, huellaSri(MAPLIBRE_FALSO))
    });
  });
  await servirMapLibreFalso(p);
};

module.exports = {
  pruebas,
  prueba,
  igual,
  cierto,
  llegaA,
  hastaQue,
  sinTransiciones,
  texto,
  fichaAbierta,
  mapLibreFalso,
  servirMapLibreFalso
};
