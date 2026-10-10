// Rutas por la provincia, en coche (datos en js/datos/rutas-provincia.js y tramos-provincia.js).
// Se abren desde la lista única de rutas (ruta.js, abrirRutas). Cada ruta lleva en su ficha un mapa propio
// de la provincia con el camino y las paradas numeradas (la provincia no cabe en el mapa de la ciudad), la
// navegación en Google Maps y, parada a parada, qué ver, cuánto tiempo y «Cómo llegar».
// Enlaces: #ruta-<id> (la ruta) y #ruta-<id>/N (su parada N).

const DURACIONES = { medio: 'Medio día', dia: 'Día completo' };
let rutaProvinciaAbierta = 0; // índice en RUTAS_PROVINCIA de la última ruta abierta

const tramosProvincia = r => (TRAMOS_PROVINCIA[r.id] || { tramos: [] }).tramos;
const kmProvincia = r => Math.round(tramosProvincia(r).reduce((s, t) => s + t.m, 0) / 1000);
const minutosVolante = r => Math.round(tramosProvincia(r).reduce((s, t) => s + t.s, 0) / 60);
const minutosVisitas = r => r.paradas.reduce((s, p) => s + p.min, 0);
const redondear5 = min => Math.max(5, Math.round(min / 5) * 5);
const hashRutaProvincia = (r, i) => 'ruta-' + r.id + (i >= 0 ? '/' + (i + 1) : '');
const coordenadas = p => p.la + ',' + p.lo;
const enlaceExterno = (texto, href, clase = 'llegar') => {
  const a = crear('a', clase, texto);
  a.href = href;
  a.target = '_blank';
  a.rel = 'noopener';
  return a;
};
// Google Maps con toda la ruta: de la capital, por las paradas, y vuelta (admite hasta 9 intermedias)
const urlGoogleRuta = r =>
  'https://www.google.com/maps/dir/?api=1&travelmode=driving&origin=' +
  coordenadas(SALIDA_PROVINCIA) +
  '&destination=' +
  coordenadas(SALIDA_PROVINCIA) +
  '&waypoints=' +
  encodeURIComponent(r.paradas.map(coordenadas).join('|'));
const urlGoogleParada = p =>
  'https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=' + coordenadas(p);
const urlOsmParada = p =>
  'https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=;' + coordenadas(p);

// --- Mapa de la ruta en la provincia ------------------------------------------------------------
// Misma proyección que el mapa de la pestaña Provincia; se encuadra el camino con margen.
const aLienzoProvincia = ([la, lo]) => [(lo + 6.94) * 75.5, (41.3 - la) * 100];
function mapaRutaProvincia(r, sel = -1) {
  const tramos = tramosProvincia(r),
    puntos = tramos.flatMap(t => t.p).map(aLienzoProvincia),
    xs = puntos.map(q => q[0]),
    ys = puntos.map(q => q[1]),
    margen = 6,
    x0 = Math.min(...xs) - margen,
    y0 = Math.min(...ys) - margen,
    w = Math.max(...xs) - x0 + margen,
    h = Math.max(...ys) - y0 + margen;
  const sv = crearSvg('svg', {
    class: 'mapa-ruta-prov',
    viewBox: [x0, y0, w, h].map(v => v.toFixed(1)).join(' '),
    role: 'img',
    'aria-label': 'Mapa de la ruta ' + r.nombre + ': ' + r.paradas.map(p => p.n).join(', ')
  });
  const linea = P =>
    'M' +
    P.map(q =>
      aLienzoProvincia(q)
        .map(v => v.toFixed(2))
        .join(' ')
    ).join('L');
  // Lindes de las comarcas, de fondo, y el término de la capital
  PROVINCIA.co.forEach(rs =>
    crearSvg(
      'path',
      {
        d: rs.map(decodificarLinde).map(linea).join('') + 'Z',
        class: 'rpc',
        'vector-effect': 'non-scaling-stroke'
      },
      sv
    )
  );
  const escala = Math.max(w / 300, h / 200); // los círculos, de tamaño fijo en pantalla
  // Autovías y nacionales, de referencia
  pintarCarreterasProvincia(
    crearSvg('g', { class: 'pmv', 'aria-hidden': 'true' }, sv),
    aLienzoProvincia
  )(escala * 0.85);
  tramos.forEach((t, i) => {
    const d = linea(t.p),
      actual = sel >= 0 && (i == sel || i == sel + 1);
    crearSvg('path', { d, class: 'rpb', 'vector-effect': 'non-scaling-stroke' }, sv);
    crearSvg('path', { d, class: 'rpr' + (actual ? ' act' : ''), 'vector-effect': 'non-scaling-stroke' }, sv);
  });
  const [sx, sy] = aLienzoProvincia([SALIDA_PROVINCIA.la, SALIDA_PROVINCIA.lo]);
  const salida = crearSvg('g', { class: 'rps', transform: `translate(${sx} ${sy}) scale(${escala})` }, sv);
  crearSvg('rect', { x: -6, y: -6, width: 12, height: 12, rx: 3 }, salida);
  crearSvg('title', {}, salida).textContent = 'Salida y llegada: ' + SALIDA_PROVINCIA.n;
  // Paradas seguidas a menos de 1,5 km (las de un mismo pueblo) van en un solo marcador «1–4»: si no, se tapan
  const grupos = [];
  r.paradas.forEach((p, i) => {
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && distanciaKm(p.la, p.lo, r.paradas[ultimo[0]].la, r.paradas[ultimo[0]].lo) < 1.5)
      ultimo.push(i);
    else grupos.push([i]);
  });
  grupos.forEach(grupo => {
    const p = r.paradas[grupo[0]],
      [x, y] = aLienzoProvincia([p.la, p.lo]),
      varias = grupo.length > 1,
      g = crearSvg(
        'g',
        {
          class: 'rpn' + (grupo.includes(sel) ? ' sel' : '') + (varias ? ' varias' : ''),
          transform: `translate(${x} ${y}) scale(${escala})`
        },
        sv
      );
    if (varias) crearSvg('rect', { x: -14, y: -8, width: 28, height: 16, rx: 8 }, g);
    else crearSvg('circle', { r: 8 }, g);
    crearSvg('text', { y: 3.5, 'text-anchor': 'middle' }, g).textContent = varias
      ? grupo[0] + 1 + '–' + (grupo[grupo.length - 1] + 1)
      : grupo[0] + 1;
    crearSvg('title', {}, g).textContent = grupo.map(i => r.paradas[i].n).join(', ');
    // Pulsar abre la parada (en un grupo, la elegida si está dentro; si no, la primera)
    g.onclick = () => abrirParadaProvincia(grupo.includes(sel) ? sel : grupo[0], RUTAS_PROVINCIA.indexOf(r));
  });
  return sv;
}

// --- Ficha de la ruta -----------------------------------------------------------------------------
function abrirRutaProvincia(k = rutaProvinciaAbierta) {
  if (typeof rutaActiva != 'undefined' && rutaActiva) activarRuta(false); // la ruta a pie, fuera del mapa
  rutaProvinciaAbierta = k;
  const r = RUTAS_PROVINCIA[k],
    caja = fichaLimpia('Ruta en coche · ' + r.tema, r.icono + ' ' + r.nombre);
  caja.appendChild(crear('p', 'hab', r.resumen));
  caja.appendChild(
    cajaDatos([
      ['Duración', DURACIONES[r.duracion]],
      ['Distancia', kmProvincia(r) + ' km'],
      ['Al volante', 'unas ' + textoTiempo(redondear5(minutosVolante(r)))],
      ['Visitas', 'unas ' + textoTiempo(redondear5(minutosVisitas(r)))]
    ])
  );
  caja.appendChild(mapaRutaProvincia(r));
  if (r.epoca)
    caja.appendChild(crear('p', 'mu', 'Mejor época: ' + r.epoca.replace(/^./, c => c.toLowerCase())));
  const lista = crear('ol', 'paradas');
  r.paradas.forEach((p, i) => {
    const b = crear(
      'button',
      '',
      crear('span', '', p.n),
      crear('small', '', p.municipio + ' · ' + p.min + ' min')
    );
    b.onclick = () => abrirParadaProvincia(i, k);
    lista.appendChild(crear('li', '', b));
  });
  caja.appendChild(lista);
  const empezar = crear('button', 'principal', 'Empezar: ' + r.paradas[0].n);
  empezar.onclick = () => abrirParadaProvincia(0, k);
  const otras = crear('button', '', 'Ver todas las rutas');
  otras.onclick = abrirRutas;
  $('#nb').append(
    enlaceExterno('Abrir la ruta en Google Maps', urlGoogleRuta(r), 'llegar principal'),
    empezar,
    otras
  );
  $('#ap').append(
    'Sale y vuelve a ' +
      SALIDA_PROVINCIA.n +
      '. Camino por carreteras de OpenStreetMap; los tiempos al volante son orientativos y no cuentan las paradas para comer. Fuente: ',
    enlaceFuente(r.fuente),
    '.'
  );
  seguirRuta(r.id);
  mostrarFicha();
  enlaceFicha(hashRutaProvincia(r), r.nombre);
}

// --- Cada parada ------------------------------------------------------------------------------------
function abrirParadaProvincia(i, k = rutaProvinciaAbierta) {
  if (typeof rutaActiva != 'undefined' && rutaActiva) activarRuta(false);
  rutaProvinciaAbierta = k;
  const r = RUTAS_PROVINCIA[k],
    p = r.paradas[i],
    caja = fichaLimpia(r.nombre + ' · parada ' + (i + 1) + ' de ' + r.paradas.length, p.n);
  pintarFotoDe(p.foto);
  caja.appendChild(
    cajaDatos([
      ['Municipio', p.municipio],
      ['Visita', 'unos ' + p.min + ' min']
    ])
  );
  caja.appendChild(crear('p', 'curio', p.ver));
  if (p.consejo) caja.appendChild(crear('p', 'consejo', crear('b', '', 'Consejo: '), p.consejo));
  caja.appendChild(mapaRutaProvincia(r, i));
  // Anterior / siguiente, con lo que se tarda en coche hasta la siguiente
  const nav = crear('div', 'navruta');
  if (i > 0) {
    const ant = crear('button', '', '← ' + r.paradas[i - 1].n);
    ant.onclick = () => abrirParadaProvincia(i - 1, k);
    nav.appendChild(ant);
  }
  const siguiente = tramosProvincia(r)[i + 1];
  if (i < r.paradas.length - 1) {
    const sig = crear(
      'button',
      'principal',
      'Siguiente: ' +
        r.paradas[i + 1].n +
        (siguiente
          ? ' (' +
            Math.max(1, Math.round(siguiente.m / 1000)) +
            ' km, ' +
            redondear5(siguiente.s / 60) +
            ' min) →'
          : ' →')
    );
    sig.onclick = () => abrirParadaProvincia(i + 1, k);
    nav.appendChild(sig);
  } else
    nav.appendChild(
      crear(
        'p',
        'fin',
        '¡Última parada! Vuelta a ' +
          SALIDA_PROVINCIA.n +
          (siguiente
            ? ': ' + Math.round(siguiente.m / 1000) + ' km, unas ' + textoTiempo(redondear5(siguiente.s / 60))
            : '') +
          '.'
      )
    );
  const resumen = crear('button', '', 'Ver toda la ruta');
  resumen.onclick = () => abrirRutaProvincia(k);
  nav.appendChild(resumen);
  $('#nb').append(
    nav,
    enlaceExterno('Cómo llegar (Google Maps)', urlGoogleParada(p)),
    enlaceExterno('Cómo llegar (OpenStreetMap)', urlOsmParada(p))
  );
  $('#ap').append('Fuente: ', enlaceFuente(p.fuente));
  (p.masFuentes || []).forEach(f => $('#ap').append(' · ', enlaceFuente(f)));
  $('#ap').append('.');
  visitaAbierta = { tipo: 'ru', ruta: r.id, id: p.id, n: p.n }; // «He estado aquí», para los logros
  modoBotonesFicha('visita');
  mostrarFicha();
  enlaceFicha(hashRutaProvincia(r, i), p.n);
}
