// Mapa de la ciudad: la animación de ¡Vítor!, el encuadre, el zoom, el movimiento suave y los gestos.
// Va después de mapa-vias.js.

// --- ¡Vítor! ------------------------------------------------------------------
// Al marcar una zona como «He estado»: una onda y un estallido de rayos desde su centro, a tamaño fijo en
// pantalla, y una vibración corta en los móviles que la permiten. Con «reducir movimiento», nada.
const capaVitor = crearSvg(
  'g',
  { id: 'vitor', 'aria-hidden': 'true', style: 'pointer-events:none' },
  mapaSvg
);
function animarVitor(z) {
  try {
    if (navigator.vibrate) navigator.vibrate([18, 40, 28]);
  } catch (e) {
    // algunos navegadores bloquean la vibración (dentro de marcos, sin gesto…): no hace falta
  }
  if (movimientoReducido() || !z.e) return;
  const u = ultimaEscala || vistaMapa.w / (tamMapa.w || 380),
    g = crearSvg('g', { transform: escalaFija(z.x, z.y, u), class: 'vitor' }, capaVitor);
  crearSvg('circle', { r: 10, class: 'vitor-onda' }, g);
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    crearSvg(
      'line',
      {
        x1: Math.cos(a) * 14,
        y1: Math.sin(a) * 14,
        x2: Math.cos(a) * 24,
        y2: Math.sin(a) * 24,
        class: 'vitor-rayo'
      },
      g
    );
  }
  setTimeout(() => g.remove(), 1000);
}

// --- Encuadre ---------------------------------------------------------------

const escalaFija = (x, y, u) => 'translate(' + x.toFixed(2) + ' ' + y.toFixed(2) + ') scale(' + u + ')';

// Ajusta vistaMapa para no salirse del mapa y, si aplicar, la pone en el SVG
function limitarVista(aplicar = true) {
  const AR = proporcionMapa(),
    anchoMaximo = Math.max(ANCHO_MAPA, ALTO_MAPA / AR),
    v = vistaMapa;
  v.w = Math.min(anchoMaximo, Math.max(ANCHO_MINIMO, v.w));
  v.h = v.w * AR;
  v.x = v.w >= ANCHO_MAPA ? (ANCHO_MAPA - v.w) / 2 : Math.max(0, Math.min(ANCHO_MAPA - v.w, v.x));
  v.y = v.h >= ALTO_MAPA ? (ALTO_MAPA - v.h) / 2 : Math.max(0, Math.min(ALTO_MAPA - v.h, v.y));
  if (aplicar) ponerViewBox();
}
function ponerViewBox() {
  const v = vistaMapa;
  mapaSvg.setAttribute('viewBox', v.x + ' ' + v.y + ' ' + v.w + ' ' + v.h);
  mapaSvg.style.transform = '';
  vistaPintada = { x: v.x, y: v.y, w: v.w };
}

// Al arrastrar o deslizar sin cambiar la escala, redibujar todo el SVG en cada fotograma es lo que
// más cuesta. En vez de eso se mueve con una transformación CSS la imagen ya pintada (la mueve la
// tarjeta gráfica) y solo se redibuja de verdad cuando se ha movido bastante, o al terminar.
let vistaPintada = null; // la vista que tiene puesta el viewBox del SVG
const MOVER_SIN_REDIBUJAR = 0.15; // fracción del mapa que se puede mover antes de redibujar
function moverSinRedibujar() {
  const v = vistaMapa,
    p = vistaPintada,
    r = rectInicioGesto;
  if (!p || !r || !r.width || Math.abs(p.w - v.w) > 1e-9) return false;
  const pxPorUnidad = r.width / v.w,
    dx = (p.x - v.x) * pxPorUnidad,
    dy = (p.y - v.y) * pxPorUnidad;
  if (Math.abs(dx) > r.width * MOVER_SIN_REDIBUJAR || Math.abs(dy) > r.height * MOVER_SIN_REDIBUJAR)
    return false;
  mapaSvg.style.transform = 'translate(' + dx.toFixed(1) + 'px, ' + dy.toFixed(1) + 'px)';
  return true;
}

// Encuadre completo: limita la vista y recoloca todo lo que depende del zoom
function ajustarVista() {
  limitarVista();
  recolocarSegunZoom(true);
}

// Durante los gestos y animaciones (arrastrar, pellizcar, rueda, deslizar, botones +/−) el mapa se
// redibuja en directo, como mucho una vez por fotograma: se aplica la vista y, si ha cambiado la
// escala, se recolocan etiquetas y pictogramas. Al terminar se hace un encuadre completo.
let enGesto = false, // hay un gesto o animación en marcha
  rectInicioGesto = null, // posición del mapa en pantalla, medida una vez por gesto
  marcoPendiente = 0,
  temporizadorGesto = 0;
const ESPERA_FIN_GESTO = 160; // ms sin movimiento para dar el gesto por terminado

function ajustarVistaPronto() {
  if (!enGesto) {
    enGesto = true;
    rectInicioGesto = mapaSvg.getBoundingClientRect();
    mapaSvg.classList.add('en-gesto'); // sin efectos al pasar por encima mientras se mueve (estilos.css)
  }
  if (!marcoPendiente)
    marcoPendiente = requestAnimationFrame(() => {
      marcoPendiente = 0;
      limitarVista(false);
      if (moverSinRedibujar()) return;
      ponerViewBox();
      recolocarSegunZoom(false);
    });
  // Con los dedos apoyados o una animación en marcha, se espera a que acaben; si no (rueda), a una pausa
  clearTimeout(temporizadorGesto);
  const enCurso = (typeof gestosMapa != 'undefined' && gestosMapa.dedos) || animacionMapa;
  if (!enCurso) temporizadorGesto = setTimeout(terminarGesto, ESPERA_FIN_GESTO);
}

function terminarGesto() {
  clearTimeout(temporizadorGesto);
  if (animacionMapa) return; // la animación lo llamará al acabar
  if (!enGesto) return;
  enGesto = false;
  rectInicioGesto = null;
  mapaSvg.classList.remove('en-gesto');
  cancelAnimationFrame(marcoPendiente);
  marcoPendiente = 0;
  ajustarVista();
}

// Qué etiquetas caben y a qué tamaño, puntos, sellos, nombres de avenidas, escudos, monumentos y la
// marca de «Estoy aquí». Con siempre=false no hace nada si la escala no ha cambiado.
let ultimaEscala = 0;
const ANCHO_SELLOS = 120; // ancho de la vista (unidades del mapa) a partir del cual no se ven los sellos
function recolocarSegunZoom(siempre) {
  const v = vistaMapa,
    u = v.w / (tamMapa.w || 380); // unidades del mapa por píxel de pantalla
  if (!siempre && Math.abs(u - ultimaEscala) < 1e-9) return;
  ultimaEscala = u;

  zonas.forEach(z => {
    const anchoPx = z.cw / u,
      altoPx = z.ch / u,
      k = z.t ? 0.64 : 0.6, // ancho medio de una letra respecto a su tamaño
      maximo = z.t ? 13.5 : 11,
      tam1 = Math.min(maximo, (anchoPx * 0.92) / (z.w1 * k), (altoPx * 0.85) / 1.25),
      tam2 = z.tx2 ? Math.min(maximo, (anchoPx * 0.92) / (z.w2 * k), (altoPx * 0.85) / 2.5) : 0,
      forzar = (z.t && v.w <= 260) || zonaAbierta == z.id;
    let tam = Math.max(tam1, tam2),
      dosLineas = tam2 > tam1;
    const mostrar = tam >= 8 || forzar;
    if (mostrar && tam < 8) {
      tam = z.t ? 12 : 10.5;
      dosLineas = !!z.tx2;
    }
    const visible = dosLineas ? z.tx2 : z.tx,
      oculta = dosLineas ? z.tx : z.tx2;
    visible.style.display = mostrar ? '' : 'none';
    if (oculta) oculta.style.display = 'none';
    z.dt.style.display = mostrar ? 'none' : '';
    z.dt.setAttribute('r', 2.3 * u);
    visible.style.fontSize = tam * u + 'px';
    visible.style.strokeWidth = 2.5 * u + 'px';
    visible.style.fontWeight = z.t ? 800 : 600;
    z.etiqueta = mostrar
      ? { el: visible, tam, lineas: dosLineas ? 2 : 1, ancho: dosLineas ? z.w2 : z.w1 }
      : null;
    z.sg.setAttribute('transform', escalaFija(z.x, z.y, u));
    z.so.setAttribute(
      'transform',
      'translate(0 ' + (mostrar ? -((dosLineas ? 2 : 1) * tam * 0.6 + 6.5) : -9) + ')'
    );
  });

  quitarEtiquetasQueSeTapan(u);
  // Los sellos «V» de las zonas pisadas, solo de cerca: de lejos, con muchas zonas, tapan el mapa
  $('#sg').classList.toggle('lejos', v.w > ANCHO_SELLOS);
  document.querySelectorAll('.avp').forEach(e => (e.style.display = v.w <= 240 ? '' : 'none'));
  mostrarEtiquetaAvenida(u);
  colocarEtiquetasFondo(u);
  $('#rl').style.fontSize = 11 * u + 'px';
  escudosEscalables.forEach(q => q.g.setAttribute('transform', escalaFija(q.x, q.y, u)));
  // monumentos.js carga después: en la primera llamada puede no existir aún
  if (typeof colocarMonumentos == 'function') colocarMonumentos(u);
  if (typeof colocarTiempo == 'function') colocarTiempo(u); // tiempo.js: puertas de la muralla
  // marcaPosicion se declara en ubicacion.js, que carga después: aquí puede no existir aún
  if (typeof marcaPosicion != 'undefined' && marcaPosicion)
    marcaPosicion.m.setAttribute('transform', escalaFija(marcaPosicion.x, marcaPosicion.y, u));
}

// Si el nombre de una zona pisa el de otra, se queda el de la más importante (la abierta, luego las
// grandes, luego la de letra más grande) y la otra se queda con su punto, hasta que se acerque el mapa
function quitarEtiquetasQueSeTapan(u) {
  const caja = z => {
      const e = z.etiqueta,
        ancho = e.ancho * (z.t ? 0.64 : 0.6) * e.tam * u,
        alto = e.lineas * e.tam * 1.15 * u;
      return [z.x - ancho / 2, z.y - alto / 2, z.x + ancho / 2, z.y + alto / 2];
    },
    pisan = (a, b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3],
    puestas = [];
  zonas
    .filter(z => z.etiqueta)
    .sort(
      (a, b) => (b.id == zonaAbierta) - (a.id == zonaAbierta) || b.t - a.t || b.etiqueta.tam - a.etiqueta.tam
    )
    .forEach(z => {
      const c = caja(z);
      if (z.id != zonaAbierta && puestas.some(o => pisan(c, o))) {
        z.etiqueta.el.style.display = 'none';
        z.dt.style.display = '';
        z.etiqueta = null;
      } else puestas.push(c);
    });
}

// Encuadra el mapa con ancho «ancho» y el punto (x, y) centrado y un poco hacia arriba
function centrarMapaEn(x, y, ancho) {
  vistaMapa.w = ancho;
  vistaMapa.h = vistaMapa.w * proporcionMapa();
  vistaMapa.x = x - vistaMapa.w / 2;
  // En escritorio el panel va al lado y basta con subir un poco el punto; en el móvil el panel tapa
  // la parte de abajo, así que el punto va al centro del trozo de mapa que queda a la vista
  const fraccion = esEscritorio() || !tamMapa.h ? 0.3 : Math.min(0.5, mapaVisiblePx() / 2 / tamMapa.h);
  vistaMapa.y = y - vistaMapa.h * fraccion;
}

// Alto en píxeles del mapa que se ve con la ficha abierta (en el móvil el panel ocupa la parte de abajo)
const ALTO_PANEL_MOVIL = 0.42; // fracción de la pantalla; igual que .sh{max-height:42vh} en estilos.css
function mapaVisiblePx() {
  if (esEscritorio()) return tamMapa.h || 400;
  return Math.max(120, Math.min(tamMapa.h || 400, innerHeight * (1 - ALTO_PANEL_MOVIL) - 16));
}

// Acerca (factor > 1) o aleja alrededor del punto (cx, cy)
// diferido: desde un gesto (rueda o pinza), recolocando una vez por fotograma
function zoomMapa(factor, cx = vistaMapa.x + vistaMapa.w / 2, cy = vistaMapa.y + vistaMapa.h / 2, diferido) {
  const w = Math.min(
      Math.max(ANCHO_MAPA, ALTO_MAPA / proporcionMapa()),
      Math.max(ANCHO_MINIMO, vistaMapa.w / factor)
    ),
    r = w / vistaMapa.w;
  vistaMapa.x = cx - (cx - vistaMapa.x) * r;
  vistaMapa.y = cy - (cy - vistaMapa.y) * r;
  vistaMapa.w = w;
  if (diferido) ajustarVistaPronto();
  else {
    terminarGesto();
    ajustarVista();
  }
}

// --- Movimiento suave --------------------------------------------------------
// Una sola animación a la vez: o se va hacia un encuadre (zoom suave) o se sigue deslizando (inercia).
let animacionMapa = null;

function pararAnimacion() {
  if (!animacionMapa) return;
  cancelAnimationFrame(animacionMapa.marco);
  animacionMapa = null;
}

// Lleva la vista al encuadre «destino» en «ms» milisegundos, frenando al final
function animarVista(destino, ms = 260) {
  pararAnimacion();
  if (movimientoReducido()) {
    vistaMapa.x = destino.x;
    vistaMapa.y = destino.y;
    vistaMapa.w = destino.w;
    terminarGesto();
    ajustarVista();
    return;
  }
  const desde = { ...vistaMapa },
    inicio = performance.now(),
    suave = t => 1 - Math.pow(1 - t, 3);
  animacionMapa = { destino };
  const paso = ahora => {
    const t = Math.min(1, (ahora - inicio) / ms),
      k = suave(t),
      w = desde.w * Math.pow(destino.w / desde.w, k); // el zoom se interpola en escala logarítmica
    // Con punto fijo, se acerca o aleja alrededor de él (no se mueve en pantalla); si al final no
    // cae justo en el destino (p. ej. al encadenar dos zooms), la diferencia se reparte poco a poco
    const fijo = destino.fijo;
    if (fijo) {
      const alrededor = (f, d, r) => f - (f - d) * r,
        rFinal = destino.w / desde.w,
        r = w / desde.w;
      vistaMapa.x = alrededor(fijo[0], desde.x, r) + (destino.x - alrededor(fijo[0], desde.x, rFinal)) * k;
      vistaMapa.y = alrededor(fijo[1], desde.y, r) + (destino.y - alrededor(fijo[1], desde.y, rFinal)) * k;
    } else {
      vistaMapa.x = desde.x + (destino.x - desde.x) * k;
      vistaMapa.y = desde.y + (destino.y - desde.y) * k;
    }
    vistaMapa.w = w;
    ajustarVistaPronto();
    if (t < 1) animacionMapa.marco = requestAnimationFrame(paso);
    else {
      animacionMapa = null;
      terminarGesto();
    }
  };
  animacionMapa.marco = requestAnimationFrame(paso);
}

// Zoom animado alrededor de (cx, cy). Si ya había uno en marcha, se suma a su destino.
function zoomSuave(factor, cx = vistaMapa.x + vistaMapa.w / 2, cy = vistaMapa.y + vistaMapa.h / 2, ms) {
  const base = animacionMapa && animacionMapa.destino ? animacionMapa.destino : vistaMapa,
    w = Math.min(Math.max(ANCHO_MAPA, ALTO_MAPA / proporcionMapa()), Math.max(ANCHO_MINIMO, base.w / factor)),
    r = w / base.w;
  animarVista({ x: cx - (cx - base.x) * r, y: cy - (cy - base.y) * r, w, fijo: [cx, cy] }, ms);
}

// Al soltar un arrastre rápido, el mapa sigue deslizándose y frena poco a poco
function deslizar(vx, vy) {
  if (Math.hypot(vx, vy) < 0.15 || movimientoReducido()) return terminarGesto(); // px/ms: si iba despacio, se para en seco
  pararAnimacion();
  const rapidez = Math.hypot(vx, vy),
    tope = Math.min(1, 2.5 / rapidez); // no más de 2,5 px/ms, para que un tirón no lo mande lejos
  vx *= tope;
  vy *= tope;
  let ultimo = performance.now();
  animacionMapa = {};
  const paso = ahora => {
    const dt = Math.min(40, ahora - ultimo),
      roce = Math.pow(0.92, dt / 16);
    ultimo = ahora;
    vistaMapa.x -= ((vx * dt) / (tamMapa.w || 380)) * vistaMapa.w;
    vistaMapa.y -= ((vy * dt) / (tamMapa.h || 456)) * vistaMapa.h;
    vx *= roce;
    vy *= roce;
    ajustarVistaPronto();
    if (Math.hypot(vx, vy) > 0.04) animacionMapa.marco = requestAnimationFrame(paso);
    else {
      animacionMapa = null;
      terminarGesto();
    }
  };
  animacionMapa.marco = requestAnimationFrame(paso);
}

$('#zi').onclick = () => zoomSuave(1.6);
$('#zo').onclick = () => zoomSuave(1 / 1.6);
// Alterna entre la ciudad y el mapa entero
$('#zr').onclick = () => {
  const AR = proporcionMapa(),
    destino = vistaMapa.w < 300 ? { w: Math.max(ANCHO_MAPA, ALTO_MAPA / AR) } : encuadreInicial();
  if (destino.x === undefined) {
    destino.x = (ANCHO_MAPA - destino.w) / 2;
    destino.y = (ALTO_MAPA - destino.w * AR) / 2;
  }
  animarVista(destino, 380);
};

const gestosMapa = activarGestos(mapaSvg, {
  aPunto: (cx, cy) => {
    const r = rectInicioGesto || mapaSvg.getBoundingClientRect();
    return [
      vistaMapa.x + ((cx - r.left) / r.width) * vistaMapa.w,
      vistaMapa.y + ((cy - r.top) / r.height) * vistaMapa.h
    ];
  },
  zoom: (factor, x, y) => zoomMapa(factor, x, y, true),
  mover: (fx, fy) => {
    vistaMapa.x -= fx * vistaMapa.w;
    vistaMapa.y -= fy * vistaMapa.h;
    ajustarVistaPronto();
  },
  medir: () => rectInicioGesto || mapaSvg.getBoundingClientRect(),
  // Rueda: zoom animado proporcional al giro (suave con ratón y con el panel táctil del portátil)
  rueda: (delta, x, y) => zoomSuave(Math.exp(-delta * 0.0022), x, y, 180),
  alTocar: () => {
    if (animacionMapa) {
      pararAnimacion(); // apoyar el dedo para el deslizamiento o el zoom en marcha
      terminarGesto();
    }
  },
  alSoltar: deslizar
});

// Si cambia el tamaño del mapa en pantalla (girar el móvil, cambiar de pestaña…), se vuelve a medir
new ResizeObserver(() => {
  const antes = tamMapa.w + 'x' + tamMapa.h;
  medirMapa();
  if (tamMapa.w + 'x' + tamMapa.h != antes) ajustarVista();
}).observe(mapaSvg);
