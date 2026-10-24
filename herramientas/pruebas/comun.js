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
  if (JSON.stringify(ordenarClaves(a)) !== JSON.stringify(ordenarClaves(b)))
    throw new Error(`${que}: esperaba ${JSON.stringify(b)} y es ${JSON.stringify(a)}`);
};
const cierto = (c, que) => {
  if (!c) throw new Error(que);
};
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
  texto,
  fichaAbierta,
  mapLibreFalso,
  servirMapLibreFalso
};
