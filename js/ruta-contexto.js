// Contexto de las rutas: dificultad, desnivel, escaleras y si el recorrido es circular. Solo calcula (sin
// pintar nada) y va antes de ruta.js y ruta-provincia.js, que lo usan en sus fichas y en la lista de rutas.
// Datos: js/datos/perfil-rutas.js (PERFIL_RUTAS, generado con node herramientas/perfil-rutas.js),
// js/datos/tramos.js y js/datos/tramos-provincia.js. Si no hay dato, cada función devuelve null y no se muestra.

const textoDistancia = m => (m < 1000 ? m + ' m' : (m / 1000).toFixed(1).replace('.', ',') + ' km');
const perfilDe = r => (typeof PERFIL_RUTAS != 'undefined' && PERFIL_RUTAS[r.id]) || null;
const metrosEntrePuntos = ([a, b], [c, d]) =>
  Math.round(Math.hypot((a - c) * 111195, (b - d) * 111195 * Math.cos((a * Math.PI) / 180)));

// Metros en línea recta entre el principio y el final del camino (null si no hay tramos)
function metrosDelFinAlInicio(tramos) {
  if (!tramos || !tramos.length) return null;
  const ultimo = tramos[tramos.length - 1].p;
  return metrosEntrePuntos(tramos[0].p[0], ultimo[ultimo.length - 1]);
}
const ES_CIRCULAR = 150; // m: si acaba a menos de esto de donde empieza, es circular
function textoRecorrido(tramos) {
  const m = metrosDelFinAlInicio(tramos);
  if (m == null) return null;
  return m < ES_CIRCULAR
    ? 'Circular'
    : 'De ida: acaba a ' + textoDistancia(Math.round(m / 10) * 10) + ' del inicio';
}

// Dificultad, solo por distancia y subida: fácil hasta 3 km y 30 m; moderada hasta 6 km y 100 m; exigente, lo demás
const DIFICULTADES = [
  ['Fácil', 3000, 30],
  ['Moderada', 6000, 100]
];
function dificultadRuta(metros, perfil) {
  if (!perfil) return null;
  const nivel = DIFICULTADES.find(([, m, sube]) => metros <= m && perfil.sube <= sube);
  return nivel ? nivel[0] : 'Exigente';
}
const textoDesnivel = perfil => (perfil ? '↗ ' + perfil.sube + ' m · ↘ ' + perfil.baja + ' m' : null);
const tieneEscaleras = (perfil, t) => !!perfil && perfil.escaleras.includes(t.de + '>' + t.a);

// Rutas en coche: circulares si el camino acaba donde empieza (salen y vuelven a la capital)
const esCircularProvincia = r => {
  const T = typeof TRAMOS_PROVINCIA != 'undefined' && TRAMOS_PROVINCIA[r.id];
  return !!T && T.firma.length > 1 && T.firma[0] == T.firma[T.firma.length - 1];
};
