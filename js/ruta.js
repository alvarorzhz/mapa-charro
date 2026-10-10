// Rutas a pie: el camino en el mapa, paradas numeradas y navegación parada a parada.
// Datos en js/datos/rutas.js (RUTAS) y js/datos/tramos.js (TRAMOS_RUTAS). Las paradas son monumentos
// (se abre su ficha) o sitios propios (murales, bares…, con su propia ficha).
// Enlaces: #rutas (la lista), #ruta y #ruta/3 (la monumental), #ruta-murales y #ruta-murales/3 (las demás).

const VELOCIDAD_A_PIE = 4.2; // km/h, paseando
let rutaActiva = false;
let rutaElegida = 0; // índice en RUTAS de la ruta que se ve
let paradaActual = -1; // índice en sus paradas de la parada abierta, o -1

const rutaActual = () => RUTAS[rutaElegida];
const tramosDe = r => TRAMOS_RUTAS[r.id] || [];
const metrosRuta = (r = rutaActual()) => tramosDe(r).reduce((s, t) => s + t.m, 0);
const minutosA = m => Math.max(1, Math.round((m / 1000 / VELOCIDAD_A_PIE) * 60));
const textoDistancia = m => (m < 1000 ? m + ' m' : (m / 1000).toFixed(1).replace('.', ',') + ' km');
const textoTiempo = min => (min < 60 ? min + ' min' : Math.floor(min / 60) + ' h ' + (min % 60) + ' min');
const hashRuta = (r = rutaActual()) => (r.id == 'monumental' ? 'ruta' : 'ruta-' + r.id);
const hashParada = (i, r = rutaActual()) => hashRuta(r) + '/' + (i + 1);

// Una parada como objeto común: { id, n, x, y, la, lo, monumento (si lo es), sitio (si es propio) }
function datosParada(p) {
  if (typeof p == 'string') {
    const m = buscarMonumento(p);
    return { id: p, n: m.n, x: m.x, y: m.y, la: m.la, lo: m.lo, monumento: m };
  }
  const [x, y] = proyectar(p.la, p.lo);
  return { id: p.id, n: p.n, x, y, la: p.la, lo: p.lo, sitio: p };
}

// --- Dibujo: una capa por ruta, solo se ve la elegida -----------------------------
const capaRuta = $('#ruta');
capaRuta.style.display = 'none';
const dibujosRutas = RUTAS.map((r, k) => {
  const g = crearSvg('g', { class: 'ruta-' + r.id }, capaRuta),
    // Cada tramo lleva debajo un borde blanco: así la ruta se ve sobre cualquier color, también sobre
    // las zonas pisadas, que son del mismo rojo
    trazos = tramosDe(r).map(t => {
      const d = 'M' + t.p.map(q => puntoTexto(proyectar(q[0], q[1]))).join('L'),
        borde = crearSvg('path', { d, class: 'rt-borde', 'vector-effect': 'non-scaling-stroke' }, g),
        trazo = crearSvg('path', { d, class: 'rt', 'vector-effect': 'non-scaling-stroke' }, g);
      return { borde, trazo };
    }),
    // Números de las paradas: junto al pictograma si es un monumento; si no, en el sitio y se pueden pulsar
    numeros = r.paradas.map((p, i) => {
      const d = datosParada(p),
        n = crearSvg('g', { class: 'rtn' + (d.sitio ? ' sitio' : '') }, g);
      crearSvg('circle', { r: 8 }, n);
      crearSvg('text', { y: 3.5, 'text-anchor': 'middle' }, n).textContent = i + 1;
      if (d.sitio) {
        crearSvg('title', {}, n).textContent = d.n;
        n.onclick = () => gestosMapa.arrastre <= UMBRAL_TOQUE && abrirParada(i, k);
      }
      return { g: n, x: d.x, y: d.y, sitio: !!d.sitio };
    });
  g.style.display = 'none';
  return { g, trazos, numeros };
});

// Llamada desde colocarMonumentos: números a tamaño fijo (arriba a la derecha del pictograma, o encima del sitio)
function colocarRuta(u) {
  if (!rutaActiva) return;
  const d = dibujosRutas[rutaElegida];
  d.numeros.forEach(n =>
    n.g.setAttribute(
      'transform',
      n.sitio
        ? escalaFija(n.x, n.y, u)
        : 'translate(' + (n.x + 12 * u).toFixed(3) + ' ' + (n.y - 12 * u).toFixed(3) + ') scale(' + u + ')'
    )
  );
  d.trazos.forEach((t, i) => {
    t.trazo.classList.toggle('act', i == paradaActual);
    t.borde.classList.toggle('act', i == paradaActual);
  });
  d.numeros.forEach((n, i) => n.g.classList.toggle('sel', i == paradaActual));
}

function activarRuta(si, k = rutaElegida) {
  rutaActiva = si;
  rutaElegida = k;
  capaRuta.style.display = si ? '' : 'none';
  document.body.classList.toggle('con-ruta', si); // las zonas pisadas se aclaran para que se vea la ruta
  dibujosRutas.forEach((d, i) => (d.g.style.display = si && i == k ? '' : 'none'));
  $('#rt').classList.toggle('on', si);
  $('#rt').setAttribute('aria-pressed', si);
  if (!si) paradaActual = -1;
  ajustarVista();
}

// Encuadra la ruta entera, con margen
function encuadrarRuta(r = rutaActual()) {
  const ps = tramosDe(r)
      .flatMap(t => t.p)
      .map(q => proyectar(q[0], q[1])),
    xs = ps.map(p => p[0]),
    ys = ps.map(p => p[1]),
    AR = proporcionMapa(),
    ancho = Math.max(
      ANCHO_MINIMO * 1.2,
      Math.max(Math.max(...xs) - Math.min(...xs), (Math.max(...ys) - Math.min(...ys)) / AR) * 1.35
    );
  vistaMapa.w = ancho;
  vistaMapa.h = ancho * AR;
  vistaMapa.x = (Math.min(...xs) + Math.max(...xs)) / 2 - vistaMapa.w / 2;
  vistaMapa.y = (Math.min(...ys) + Math.max(...ys)) / 2 - vistaMapa.h / 2;
}

// Deja la ficha lista para un contenido propio (ni zona ni monumento)
function fichaLimpia(antetitulo, titulo) {
  zonaAbierta = null;
  olvidarMonumento();
  $('#here').hidden = true;
  $('#k').textContent = antetitulo;
  $('#nm').textContent = titulo;
  $('#hc').hidden = $('#hl').hidden = $('#he').hidden = $('#mz').hidden = true;
  $('#cu').textContent = $('#ri').textContent = $('#eat').textContent = $('#ap').textContent = '';
  pintarFoto(null);
  const caja = $('#info');
  caja.textContent = '';
  caja.hidden = false;
  $('#nb').textContent = '';
  modoBotonesFicha('monumento');
  resaltarVia(null);
  return caja;
}
const cajaDatos = pares =>
  crear(
    'div',
    'datos',
    ...pares.map(([e, v]) => crear('div', 'dato', crear('small', '', e), crear('b', '', v)))
  );
const enlaceFuente = ([medio, url]) => {
  const a = crear('a', '', medio);
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener';
  return a;
};

// --- Seguimiento: «La he hecho» / «La quiero hacer» (progreso.j.rs) -------------------------------
let rutaSeguida = null; // id de la ruta cuya ficha está abierta (sus botones de abajo la marcan)
const todasLasRutas = () => [...RUTAS, ...RUTAS_PROVINCIA];
const buscarRuta = id => todasLasRutas().find(r => r.id == id);
const estadoRuta = id => ((progreso.j || {}).rs || {})[id] || '';
function ponerEstadoRuta(id, s) {
  const j = (progreso.j = progreso.j || {});
  j.rs = { ...(j.rs || {}) };
  if (s) j.rs[id] = s;
  else delete j.rs[id];
  guardar();
  pintarBotonesFicha();
}
// Pulsar el botón marcado lo quita (con «Deshacer»); pulsar el otro cambia la marca
function marcarRuta(id, s) {
  const antes = estadoRuta(id),
    n = buscarRuta(id).nombre;
  if (antes == s) {
    ponerEstadoRuta(id, '');
    aviso(n + ': quitada de «' + (s == 'v' ? 'La he hecho' : 'La quiero hacer') + '»', {
      accion: ['Deshacer', () => ponerEstadoRuta(id, s)]
    });
  } else {
    ponerEstadoRuta(id, s);
    aviso(s == 'v' ? '¡Vítor! Ruta hecha: ' + n : 'Apuntada para hacerla: ' + n, {
      tipo: s == 'v' ? 'exito' : 'info'
    });
  }
}
// La etiqueta de las tarjetas de la lista
const ETIQUETAS_RUTA = { v: '✔ La has hecho', w: '★ La quieres hacer' };
const etiquetaRuta = id =>
  estadoRuta(id) ? crear('span', 'marca-ruta m' + estadoRuta(id), ETIQUETAS_RUTA[estadoRuta(id)]) : null;
function abrirRutaPorId(id) {
  const k = RUTAS.findIndex(r => r.id == id);
  if (k >= 0) abrirRuta(k);
  else abrirRutaProvincia(RUTAS_PROVINCIA.findIndex(r => r.id == id));
}
function seguirRuta(id) {
  modoBotonesFicha('ruta');
  rutaSeguida = id;
  pintarBotonesFicha();
}

// --- Lista única de rutas (el botón «Rutas»): a pie por la ciudad y en coche por la provincia ---------
let filtroRutas = 'todas'; // 'todas' | 'pie' | 'coche'
const FILTROS_RUTAS = [
  ['todas', 'Todas'],
  ['pie', 'A pie'],
  ['coche', 'Por la provincia']
];
const tarjetaRuta = (id, icono, nombre, detalle, resumen, abrir) => {
  const b = crear(
    'button',
    'tarjeta-ruta',
    crear('span', 'icono', icono),
    crear(
      'span',
      'texto',
      etiquetaRuta(id),
      crear('b', '', nombre),
      crear('small', '', detalle),
      crear('span', 'resumen', resumen)
    )
  );
  b.onclick = abrir;
  return b;
};
function abrirRutas() {
  activarRuta(false);
  const caja = fichaLimpia('Rutas', 'Rutas');
  caja.appendChild(
    crear(
      'p',
      'hab',
      'A pie por la ciudad, parada a parada por calles y sin atrochar, o en coche por la provincia.'
    )
  );
  const filtros = crear('div', 'fl');
  FILTROS_RUTAS.forEach(([clave, texto]) => {
    const b = crear('button', clave == filtroRutas ? 'on' : '', texto);
    b.setAttribute('aria-pressed', clave == filtroRutas);
    b.onclick = () => {
      filtroRutas = clave;
      abrirRutas();
    };
    filtros.appendChild(b);
  });
  caja.appendChild(filtros);
  if (filtroRutas != 'coche') {
    caja.appendChild(crear('h3', '', 'A pie, por la ciudad'));
    const lista = crear('div', 'rutas');
    RUTAS.forEach((r, k) => {
      const m = metrosRuta(r);
      lista.appendChild(
        tarjetaRuta(
          r.id,
          r.icono,
          r.nombre,
          'Medio día · ' +
            r.paradas.length +
            ' paradas · ' +
            textoDistancia(m) +
            ' · ' +
            textoTiempo(minutosA(m)) +
            ' andando',
          r.resumen,
          () => abrirRuta(k)
        )
      );
    });
    caja.appendChild(lista);
  }
  if (filtroRutas != 'pie') {
    caja.appendChild(crear('h3', '', 'Por la provincia, en coche'));
    const lista = crear('div', 'rutas');
    RUTAS_PROVINCIA.forEach((r, k) =>
      lista.appendChild(
        tarjetaRuta(
          r.id,
          r.icono,
          r.nombre,
          DURACIONES[r.duracion] +
            ' · ' +
            r.tema +
            ' · ' +
            r.paradas.length +
            ' paradas · ' +
            kmProvincia(r) +
            ' km',
          r.resumen,
          () => abrirRutaProvincia(k)
        )
      )
    );
    caja.appendChild(lista);
  }
  $('#ap').textContent =
    'Caminos por calles y carreteras reales de OpenStreetMap. Los tiempos son orientativos y no cuentan las paradas.';
  mostrarFicha();
  enlaceFicha('rutas', 'Rutas');
}

// --- Resumen de una ruta --------------------------------------------------------------
function abrirRuta(k = rutaElegida) {
  activarRuta(true, k);
  const r = rutaActual(),
    total = metrosRuta(r),
    caja = fichaLimpia('Ruta a pie', r.nombre);
  paradaActual = -1;
  caja.appendChild(crear('p', 'hab', r.resumen));
  if (r.id == 'monumental')
    caja.appendChild(
      crear('p', 'mu', 'Para empezar, queda donde siempre: en el Toscano o debajo del reloj.')
    );
  caja.appendChild(
    cajaDatos([
      ['Distancia', textoDistancia(total)],
      ['Andando', textoTiempo(minutosA(total))],
      ['Paradas', String(r.paradas.length)]
    ])
  );
  const lista = crear('ol', 'paradas');
  r.paradas.forEach((p, i) => {
    const d = datosParada(p),
      tramo = tramosDe(r)[i],
      b = crear(
        'button',
        '',
        d.monumento ? iconoMonumento(d.monumento.tipo, 22) : null,
        crear('span', '', d.n),
        tramo ? crear('small', '', textoDistancia(tramo.m) + ' hasta la siguiente') : null
      );
    b.onclick = () => abrirParada(i);
    lista.appendChild(crear('li', '', b));
  });
  caja.appendChild(lista);
  const ap = $('#ap');
  ap.append(
    'Camino por calles reales de OpenStreetMap. El tiempo es andando sin prisa, sin contar las paradas.'
  );
  if (r.fuente) ap.append(' Fuente: ', enlaceFuente(r.fuente), '.');
  const empezar = crear('button', 'principal', 'Empezar la ruta');
  empezar.onclick = () => abrirParada(0);
  const cerca = crear('button', '', 'Empezar por la más cercana a mí');
  cerca.onclick = empezarPorLaMasCercana;
  const otras = crear('button', '', 'Ver todas las rutas');
  otras.onclick = abrirRutas;
  const quitar = crear('button', '', 'Quitar la ruta del mapa');
  quitar.onclick = () => {
    activarRuta(false);
    $('#x').click();
  };
  $('#nb').append(empezar, cerca, otras, quitar);
  encuadrarRuta(r);
  seguirRuta(r.id);
  mostrarFicha();
  enlaceFicha(hashRuta(r), r.nombre);
}

// --- Cada parada ----------------------------------------------------------------------
function abrirParada(i, k = rutaElegida) {
  activarRuta(true, k);
  const d = datosParada(rutaActual().paradas[i]);
  if (d.monumento) return abrirMonumento(d.id, i);
  abrirSitio(d, i);
}

// Ficha de un sitio propio de una ruta (un mural, un bar…)
function abrirSitio(d, i) {
  const s = d.sitio,
    caja = fichaLimpia('', d.n);
  if (s.detalle) caja.appendChild(crear('p', 'hab', s.detalle));
  caja.appendChild(cajaDatos([['Dónde', s.dir]]));
  caja.appendChild(crear('p', 'curio', s.texto));
  const llegar = crear('a', 'llegar', 'Cómo llegar');
  llegar.href =
    'https://www.openstreetmap.org/directions?engine=fossgis_osrm_foot&route=;' + s.la + ',' + s.lo;
  llegar.target = '_blank';
  llegar.rel = 'noopener';
  $('#nb').append(llegar);
  $('#ap').append('Fuente: ', enlaceFuente(s.fuente), '.');
  visitaAbierta = { tipo: 'ru', ruta: rutaActual().id, id: d.id, n: d.n }; // para los logros (logros.js)
  modoBotonesFicha('visita');
  pintarNavegacionRuta(i);
  centrarMapaEn(d.x, d.y, Math.min(vistaMapa.w, 20));
  mostrarFicha();
  enlaceFicha(hashParada(i), d.n);
}

// Anterior / siguiente (también la llama abrirMonumento cuando el monumento se abre como parada)
function pintarNavegacionRuta(i) {
  const r = rutaActual(),
    paradas = r.paradas.map(datosParada);
  paradaActual = i;
  $('#k').textContent = r.nombre + ' · parada ' + (i + 1) + ' de ' + paradas.length;
  const nav = crear('div', 'navruta');
  if (i > 0) {
    const ant = crear('button', '', '← ' + paradas[i - 1].n);
    ant.onclick = () => abrirParada(i - 1);
    nav.appendChild(ant);
  }
  if (i < paradas.length - 1) {
    const t = tramosDe(r)[i],
      sig = crear(
        'button',
        'principal',
        'Siguiente: ' + paradas[i + 1].n + ' (' + textoDistancia(t.m) + ', ' + minutosA(t.m) + ' min) →'
      );
    sig.onclick = () => abrirParada(i + 1);
    nav.appendChild(sig);
  } else
    nav.appendChild(
      crear('p', 'fin', '¡Fin de la ruta! Has recorrido ' + textoDistancia(metrosRuta(r)) + '.')
    );
  const resumen = crear('button', '', 'Ver toda la ruta');
  resumen.onclick = () => abrirRuta();
  nav.appendChild(resumen);
  $('#nb').prepend(nav);
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
        paradas = rutaActual().paradas.map(datosParada),
        distancias = paradas.map(d => distanciaKm(la, lo, d.la, d.lo)),
        i = distancias.indexOf(Math.min(...distancias));
      aviso(
        'La más cercana: ' + paradas[i].n + ', a ' + textoDistancia(Math.round(distancias[i] * 100) * 10)
      );
      abrirParada(i);
    },
    () => {
      aviso('No te he podido localizar: empiezo por la primera', { tipo: 'error' });
      abrirParada(0);
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
  );
}

// El botón abre la lista de rutas; si hay una en el mapa, la quita (y cierra su ficha si estaba abierta)
$('#rt').onclick = () => {
  if (pestana != 'map' && !esEscritorio()) cambiarPestana('map'); // en el móvil, la ruta se ve en el mapa
  if (!rutaActiva) return abrirRutas();
  const fichaDeRuta = $('#sh').classList.contains('o') && hashActual().split('/')[0].startsWith('ruta');
  activarRuta(false);
  if (fichaDeRuta) $('#x').click();
};
