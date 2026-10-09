// Palabras charras (datos en js/datos/palabras.js): una tarjeta bajo el mapa con una palabra al azar
// («Otra palabra» pasa a la siguiente) y una en cada ficha de zona. Las vistas se apuntan en
// progreso.j.pv para los logros «Hablas charro», «Pejilguero» y «Charro lígrimo».

const palabrasVistas = () => (progreso.j && progreso.j.pv) || [];
const verPalabra = w => {
  if (typeof apuntarUso == 'function') apuntarUso('pv', w.id);
};

// Palabra, significado, ejemplo y fuente
function contenidoPalabra(w) {
  const [medio, url] = FUENTES_PALABRAS[w.f],
    fuente = crear('a', '', medio);
  fuente.href = url;
  fuente.target = '_blank';
  fuente.rel = 'noopener';
  return [
    crear('p', 'pal-def', crear('b', '', w.p), ': ', w.s.charAt(0).toLowerCase() + w.s.slice(1)),
    crear('p', 'pal-ej', '«' + w.e + '»'),
    crear('small', 'pal-fuente', 'Fuente: ', fuente)
  ];
}

// La de la zona si tiene una propia; si no, una fija para esa zona (siempre la misma)
function palabraDeZona(id) {
  const propia = PALABRAS_CHARRAS.find(w => w.z && w.z.includes(id));
  if (propia) return propia;
  const libres = PALABRAS_CHARRAS.filter(w => !w.z);
  return libres[(semillaDeTexto(id) >>> 0) % libres.length];
}
// abrirFicha la pide; mostrarFicha (ficha.js) esconde la caja en las demás fichas
let fichaConPalabra = false;
function pintarPalabraDeZona(z) {
  const caja = $('#pch');
  caja.textContent = '';
  if (z.id == 'resto') return;
  const w = palabraDeZona(z.id);
  caja.append(crear('h3', '', '🗣️ Palabra charra'), ...contenidoPalabra(w));
  fichaConPalabra = true;
  verPalabra(w);
}

// --- Tarjeta bajo el mapa ---------------------------------------------------------------
let palabraTarjeta = null;
// Al azar, mejor una que no se haya visto todavía (y nunca la misma que ya está)
function palabraAlAzar() {
  const otras = PALABRAS_CHARRAS.filter(w => w != palabraTarjeta),
    nuevas = otras.filter(w => !palabrasVistas().includes(w.id)),
    donde = nuevas.length ? nuevas : otras;
  return donde[Math.floor(Math.random() * donde.length)];
}
function pintarTarjetaPalabra(w) {
  palabraTarjeta = w;
  const caja = $('#palabra'),
    otra = crear('button', 'enlace', 'Otra palabra');
  otra.onclick = () => {
    verPalabra(palabraTarjeta); // la que ya se estaba viendo también cuenta
    const siguiente = palabraAlAzar();
    pintarTarjetaPalabra(siguiente);
    verPalabra(siguiente);
  };
  caja.textContent = '';
  caja.append(crear('div', 'pal-cab', crear('span', '', '🗣️ Palabra charra'), otra), ...contenidoPalabra(w));
  caja.hidden = false;
}
function iniciarPalabras() {
  pintarTarjetaPalabra(palabraAlAzar());
}
