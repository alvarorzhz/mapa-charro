// Ruta monumental a pie: el camino en el mapa, paradas numeradas y navegación parada a parada
// Datos en js/datos/ruta.js (RUTA). Enlaces: #ruta (resumen) y #ruta/1, #ruta/2… (cada parada).

const VELOCIDAD_A_PIE = 4.2; // km/h, paseando
let rutaActiva = false;
let paradaActual = -1; // índice en RUTA.paradas de la parada abierta, o -1

const metrosRuta = () => RUTA.tramos.reduce((s, t) => s + t.m, 0);
const minutosA = m => Math.max(1, Math.round((m / 1000 / VELOCIDAD_A_PIE) * 60));
const textoDistancia = m => (m < 1000 ? m + ' m' : (m / 1000).toFixed(1).replace('.', ',') + ' km');
const textoTiempo = min => (min < 60 ? min + ' min' : Math.floor(min / 60) + ' h ' + (min % 60) + ' min');

// --- Dibujo ------------------------------------------------------------------
const capaRuta = $('#ruta');
capaRuta.style.display = 'none';
const trazosRuta = RUTA.tramos.map(t =>
  crearSvg(
    'path',
    {
      d: 'M' + t.p.map(q => puntoTexto(proyectar(q[0], q[1]))).join('L'),
      class: 'rt',
      'vector-effect': 'non-scaling-stroke'
    },
    capaRuta
  )
);
// Números de las paradas, junto a su pictograma
const numerosRuta = RUTA.paradas.map((id, i) => {
  const m = buscarMonumento(id),
    g = crearSvg('g', { class: 'rtn' }, capaRuta);
  crearSvg('circle', { r: 8 }, g);
  crearSvg('text', { y: 3.5, 'text-anchor': 'middle' }, g).textContent = i + 1;
  return { g, x: m.x, y: m.y };
});

// Llamada desde colocarMonumentos: números a tamaño fijo, arriba a la derecha de cada pictograma
function colocarRuta(u) {
  if (!rutaActiva) return;
  numerosRuta.forEach(n =>
    n.g.setAttribute(
      'transform',
      'translate(' + (n.x + 12 * u).toFixed(3) + ' ' + (n.y - 12 * u).toFixed(3) + ') scale(' + u + ')'
    )
  );
  trazosRuta.forEach((t, i) => t.classList.toggle('act', i == paradaActual));
}

function activarRuta(si) {
  rutaActiva = si;
  capaRuta.style.display = si ? '' : 'none';
  $('#rt').classList.toggle('on', si);
  if (!si) paradaActual = -1;
  ajustarVista();
}

// Encuadra la ruta entera, con margen
function encuadrarRuta() {
  const ps = RUTA.tramos.flatMap(t => t.p).map(q => proyectar(q[0], q[1])),
    xs = ps.map(p => p[0]),
    ys = ps.map(p => p[1]),
    AR = proporcionMapa(),
    ancho = Math.max(Math.max(...xs) - Math.min(...xs), (Math.max(...ys) - Math.min(...ys)) / AR) * 1.35;
  vistaMapa.w = ancho;
  vistaMapa.h = ancho * AR;
  vistaMapa.x = (Math.min(...xs) + Math.max(...xs)) / 2 - vistaMapa.w / 2;
  vistaMapa.y = (Math.min(...ys) + Math.max(...ys)) / 2 - vistaMapa.h / 2;
}

// --- Panel de la ruta ---------------------------------------------------------
function abrirRuta() {
  activarRuta(true);
  paradaActual = -1;
  zonaAbierta = null;
  olvidarMonumento();
  const total = metrosRuta();
  $('#here').hidden = true;
  $('#k').textContent = 'Ruta a pie';
  $('#nm').textContent = RUTA.nombre;
  $('#hc').hidden = $('#hl').hidden = $('#he').hidden = $('#mz').hidden = true;
  $('#cu').textContent = $('#ri').textContent = $('#eat').textContent = '';
  $('#ap').textContent =
    'Camino por calles reales de OpenStreetMap. El tiempo es andando sin prisa, sin contar las visitas.';
  pintarFoto(null);
  const caja = $('#info');
  caja.textContent = '';
  caja.hidden = false;
  caja.appendChild(
    crear(
      'div',
      'datos',
      ...[
        ['Distancia', textoDistancia(total)],
        ['Andando', textoTiempo(minutosA(total))],
        ['Paradas', String(RUTA.paradas.length)]
      ].map(([e, v]) => crear('div', 'dato', crear('small', '', e), crear('b', '', v)))
    )
  );
  const lista = crear('ol', 'paradas');
  RUTA.paradas.forEach((id, i) => {
    const m = buscarMonumento(id),
      tramo = RUTA.tramos[i],
      b = crear(
        'button',
        '',
        iconoMonumento(m.tipo, 22),
        crear('span', '', m.n),
        tramo ? crear('small', '', textoDistancia(tramo.m) + ' hasta la siguiente') : null
      );
    b.onclick = () => abrirParada(i);
    lista.appendChild(crear('li', '', b));
  });
  caja.appendChild(lista);
  const nb = $('#nb');
  nb.textContent = '';
  const empezar = crear('button', 'principal', 'Empezar la ruta');
  empezar.onclick = () => abrirParada(0);
  const cerca = crear('button', '', 'Empezar por la más cercana a mí');
  cerca.onclick = empezarPorLaMasCercana;
  const quitar = crear('button', '', 'Quitar la ruta del mapa');
  quitar.onclick = () => {
    activarRuta(false);
    $('#x').click();
  };
  nb.append(empezar, cerca, quitar);
  modoBotonesFicha('monumento');
  resaltarVia(null);
  encuadrarRuta();
  mostrarFicha();
  enlaceFicha('ruta', RUTA.nombre);
}

function abrirParada(i) {
  activarRuta(true);
  abrirMonumento(RUTA.paradas[i], i);
}

// La llama abrirMonumento cuando el monumento se abre como parada: añade anterior / siguiente
function pintarNavegacionRuta(i) {
  paradaActual = i;
  $('#k').textContent = 'Ruta a pie · parada ' + (i + 1) + ' de ' + RUTA.paradas.length;
  const nb = $('#nb'),
    nav = crear('div', 'navruta');
  if (i > 0) {
    const ant = crear('button', '', '← ' + buscarMonumento(RUTA.paradas[i - 1]).n);
    ant.onclick = () => abrirParada(i - 1);
    nav.appendChild(ant);
  }
  if (i < RUTA.paradas.length - 1) {
    const t = RUTA.tramos[i],
      sig = crear(
        'button',
        'principal',
        'Siguiente: ' +
          buscarMonumento(RUTA.paradas[i + 1]).n +
          ' (' +
          textoDistancia(t.m) +
          ', ' +
          minutosA(t.m) +
          ' min) →'
      );
    sig.onclick = () => abrirParada(i + 1);
    nav.appendChild(sig);
  } else
    nav.appendChild(
      crear('p', 'fin', '¡Fin de la ruta! Has recorrido ' + textoDistancia(metrosRuta()) + '.')
    );
  const resumen = crear('button', '', 'Ver toda la ruta');
  resumen.onclick = abrirRuta;
  nav.appendChild(resumen);
  nb.prepend(nav);
}

// Con el GPS, abre la parada más cercana (fuera de Claude; dentro no hay permiso de ubicación)
function empezarPorLaMasCercana() {
  if (ubicacionBloqueada() || !navigator.geolocation || !window.isSecureContext) {
    aviso('Aquí no puedo usar tu ubicación: empiezo por la primera');
    abrirParada(0);
    return;
  }
  aviso('Buscando dónde estás…');
  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude: la, longitude: lo } = pos.coords,
        distancias = RUTA.paradas.map(id => {
          const m = buscarMonumento(id);
          return distanciaKm(la, lo, m.la, m.lo);
        }),
        i = distancias.indexOf(Math.min(...distancias));
      aviso(
        'La más cercana: ' +
          buscarMonumento(RUTA.paradas[i]).n +
          ', a ' +
          textoDistancia(Math.round(distancias[i] * 100) * 10)
      );
      abrirParada(i);
    },
    () => {
      aviso('No te he podido localizar: empiezo por la primera');
      abrirParada(0);
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
  );
}

$('#rt').onclick = () =>
  rutaActiva && $('#sh').classList.contains('o') && paradaActual < 0 ? activarRuta(false) : abrirRuta();
