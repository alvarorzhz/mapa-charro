// Mapa de la ciudad: dibujo de zonas, río y carreteras, encuadre, zoom y arrastre

const ANCHO_MAPA = 400,
  ALTO_MAPA = 480; // tamaño del viewBox completo
const ANCHO_MINIMO = 16; // zoom máximo (ancho del encuadre en unidades del mapa)

// --- Zonas ------------------------------------------------------------------

// Colores y sello «V» de una zona según su marca
function pintarZona(z) {
  const marca = progreso.z[z.id];
  if (z.id == 'resto') {
    $('#rs').className = 'rs' + (marca ? ' ' + marca : '');
    return;
  }
  const clase = 'z c' + z.g + (ZONAS_NO_OFICIALES.has(z.id) ? ' sub' : '');
  z.e.setAttribute(
    'class',
    clase + ' t' + (z.tono || 0) + (marca ? ' ' + marca : '') + (zonaAbierta == z.id ? ' sel' : '')
  );
  if (typeof limiteSeleccion != 'undefined') {
    if (zonaAbierta == z.id) limiteSeleccion.setAttribute('d', trazoAnillo(z.P));
    else if (!zonaAbierta) limiteSeleccion.setAttribute('d', '');
  }
  [z.tx, z.tx2].forEach(t => t && t.setAttribute('class', 'lb' + (marca == 'v' ? ' v' : '')));
  z.dt.setAttribute('class', 'dt' + (marca == 'v' ? ' v' : ''));
  if (z.st && marca != 'v') {
    z.st.remove();
    z.st = 0;
  }
  if (marca == 'v' && !z.st) {
    z.st = crearSvg('g', { class: 'st' }, z.so);
    crearSvg('circle', { r: 5.5, fill: 'none', stroke: '#fff', 'stroke-width': 1.2 }, z.st);
    const v = crearSvg(
      'text',
      { y: 2.7, 'text-anchor': 'middle', 'font-size': 7.5, 'font-weight': 700, fill: '#fff' },
      z.st
    );
    v.textContent = 'V';
  }
}

// Dibuja los polígonos y etiquetas de un grupo de zonas. Las que tienen límite oficial lo usan;
// las demás se reparten el polígono «base» por cercanía (cada punto va a la zona más próxima).
function construirZonas(grupo, base) {
  grupo.forEach(z => {
    let P = base;
    if (LIMITES_BARRIOS[z.id]) P = LIMITES_BARRIOS[z.id].map(q => proyectar(q[0], q[1]));
    else grupo.forEach(o => o != z && (P = recortarSemiplano(P, [z.x, z.y], [o.x, o.y])));
    z.P = P;
    const xs = P.map(q => q[0]),
      ys = P.map(q => q[1]);
    z.ch = Math.max(...ys) - Math.min(...ys);
    z.cw = Math.min(Math.max(...xs) - Math.min(...xs), z.ch * 1.7);
    z.e = crearSvg(
      'polygon',
      { points: P.map(q => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' ') },
      $('#zg')
    );
    z.e.onclick = () => {
      if (gestosMapa.arrastre <= UMBRAL_TOQUE) abrirFicha(z.id);
    };
    z.dt = crearSvg('circle', { cx: z.x, cy: z.y }, $('#dg'));
    // Etiqueta en una línea (tx) y, si tiene «|», también en dos (tx2); ajustarVista elige cuál cabe
    const lineas = z.l.split('|');
    z.w1 = lineas.join(' ').length;
    z.w2 = lineas.length > 1 ? Math.max(...lineas.map(w => w.length)) : 0;
    z.tx = crearSvg('text', { x: z.x, y: z.y }, $('#lg'));
    crearSvg('tspan', { x: z.x, dy: '.3em' }, z.tx).textContent = lineas.join(' ');
    if (lineas.length > 1) {
      z.tx2 = crearSvg('text', { x: z.x, y: z.y }, $('#lg'));
      lineas.forEach((w, i) => {
        crearSvg('tspan', { x: z.x, dy: i ? '1.1em' : '-.2em' }, z.tx2).textContent = w;
      });
    }
    z.sg = crearSvg('g', {}, $('#sg'));
    z.so = crearSvg('g', {}, z.sg);
    pintarZona(z);
  });
}

// Pueblos de alrededor: se reparten todo el lienzo; barrios: el contorno de la ciudad
construirZonas(
  zonas.filter(z => z.g == 5),
  [
    [0, 0],
    [ANCHO_MAPA, 0],
    [ANCHO_MAPA, ALTO_MAPA],
    [0, ALTO_MAPA]
  ]
);
construirZonas(
  zonas.filter(z => z.g < 5),
  LIMITE_CIUDAD.map(q => proyectar(q[0], q[1]))
);
pintarZona(zonaResto);

// Tonos alternos: dos zonas vecinas nunca llevan el mismo tono (coloreado voraz con 4 tonos)
{
  const cerca = (a, b) => {
    let comunes = 0;
    for (const p of a.P)
      if (b.P.some(q => Math.abs(p[0] - q[0]) < 0.6 && Math.abs(p[1] - q[1]) < 0.6) && ++comunes >= 2)
        return true;
    return false;
  };
  const vecinos = new Map(zonas.map(z => [z, zonas.filter(o => o != z && cerca(z, o))]));
  [...zonas]
    .sort((a, b) => vecinos.get(b).length - vecinos.get(a).length)
    .forEach(z => {
      const usados = new Set(vecinos.get(z).map(o => o.tono));
      z.tono = [0, 1, 2, 3].find(t => !usados.has(t)) ?? 0;
      z.e.classList.add('t' + z.tono);
    });
}

// --- Límites y río ----------------------------------------------------------
// Los límites se dibujan encima de las carreteras (capa #lim), con un halo claro para que se lean
// sobre cualquier cosa: es lo más importante del mapa.
const trazoAnillo = P => 'M' + P.map(puntoTexto).join('L') + 'Z';
{
  const capa = $('#lim'),
    barrios = zonas.filter(z => z.g < 5),
    oficiales = barrios.filter(z => !ZONAS_NO_OFICIALES.has(z.id)),
    repartos = barrios.filter(z => ZONAS_NO_OFICIALES.has(z.id)),
    alrededores = zonas.filter(z => z.g == 5),
    lindes = LINDES_OFICIALES.map(P => trazoAnillo(P.map(q => proyectar(q[0], q[1])))).join(''),
    ciudad = trazoAnillo(LIMITE_CIUDAD.map(q => proyectar(q[0], q[1]))),
    trazo = (d, clase) =>
      crearSvg('path', { d, class: 'lim ' + clase, 'vector-effect': 'non-scaling-stroke' }, capa);
  trazo(alrededores.map(z => trazoAnillo(z.P)).join(''), 'alfoz');
  trazo(oficiales.map(z => trazoAnillo(z.P)).join('') + lindes + ciudad, 'halo');
  trazo(repartos.map(z => trazoAnillo(z.P)).join(''), 'reparto');
  trazo(oficiales.map(z => trazoAnillo(z.P)).join('') + lindes, 'linde');
  trazo(ciudad, 'ciudad');
  // Contorno de la zona seleccionada, encima de todo
  var limiteSeleccion = trazo('', 'sel');
}

// --- Río ----------------------------------------------------------------------

{
  // El río, suavizado con curvas que pasan por el punto medio de cada tramo
  const rp = RIO_TORMES.map(q => proyectar(q[0], q[1]));
  let d = 'M' + puntoTexto(rp[0]) + 'L' + puntoTexto(puntoMedio(rp[0], rp[1]));
  for (let i = 1; i < rp.length - 1; i++)
    d += 'Q' + puntoTexto(rp[i]) + ' ' + puntoTexto(puntoMedio(rp[i], rp[i + 1]));
  $('#rv').setAttribute('d', d + 'L' + puntoTexto(rp[rp.length - 1]));
  const [x, y] = proyectar(40.9615, -5.6175);
  $('#rl').setAttribute('x', x);
  $('#rl').setAttribute('y', y);
}

// --- Carreteras y avenidas --------------------------------------------------

const etiquetasAvenidas = []; // textos que siguen el trazado de las avenidas
const trazosVias = []; // { nm, k, d, els } por cada tramo, para resaltarlos
Object.assign(INFO_VIAS, INFO_AVENIDAS);

// Curva suave (Catmull-Rom) que pasa por todos los puntos
function trazoSuave(P) {
  const r = P.map(q => proyectar(q[0], q[1]));
  let d = 'M' + puntoTexto(r[0]);
  for (let i = 0; i < r.length - 1; i++) {
    const a = r[i - 1] || r[i],
      b = r[i],
      c = r[i + 1],
      e = r[i + 2] || c;
    d +=
      'C' +
      puntoTexto([b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6]) +
      ' ' +
      puntoTexto([c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6]) +
      ' ' +
      puntoTexto(c);
  }
  return d;
}
const atributosTrazo = (ancho, color, d, opacidad, discontinua) =>
  Object.assign(
    {
      d,
      fill: 'none',
      stroke: color,
      'stroke-width': ancho + 'px',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'vector-effect': 'non-scaling-stroke',
      opacity: opacidad
    },
    discontinua ? { 'stroke-dasharray': discontinua } : {}
  );

try {
  // Avenidas y rondas (k = 't' ronda/acceso, otra cosa = avenida): borde + relleno; solo se ven de cerca
  const capaBorde = crearSvg('g', { class: 'avp' }, $('#rd')),
    capaAvenidas = crearSvg('g', { class: 'avp' }, $('#rd')),
    capaRondas = crearSvg('g', { class: 'avp' }, $('#rd'));
  AVENIDAS.forEach(([nombre, tipo, tramos]) => {
    const ronda = tipo == 't',
      els = [];
    let primerTramo = null;
    tramos.forEach(P => {
      const d = trazoSuave(P);
      els.push(
        crearSvg('path', atributosTrazo(ronda ? 5.4 : 3.8, 'var(--line)', d, ronda ? 0.7 : 0.45), capaBorde)
      );
      const relleno = crearSvg(
        'path',
        atributosTrazo(ronda ? 3.4 : 2.2, ronda ? 'var(--ronda)' : 'var(--street)', d, ronda ? 1 : 0.85),
        ronda ? capaRondas : capaAvenidas
      );
      els.push(relleno);
      if (!primerTramo) {
        primerTramo = relleno;
        relleno.id = 'av' + etiquetasAvenidas.length;
      }
    });
    if (nombre) {
      const t = crearSvg('text', { class: 'avl' }, $('#al')),
        tp = crearSvg('textPath', { startOffset: '50%', 'text-anchor': 'middle' }, t);
      tp.setAttribute('href', '#' + primerTramo.id);
      tp.textContent = nombre.replace(/^Avenida /, 'Av. ').replace(/^Paseo /, 'P.º ');
      t._p = primerTramo;
      t._n = tp.textContent.length;
      etiquetasAvenidas.push(t);
    }
    trazosVias.push({ nm: nombre, els });
  });

  // Carreteras: a = autovía, n = nacional, c = autonómica. Primero todos los bordes y luego los
  // colores, de menor a mayor categoría, para que las autovías queden encima.
  const COLOR = { a: 'var(--auv)', n: 'var(--nac)', c: 'var(--cl)' },
    ANCHO = { a: [8, 4.2], n: [5.5, 2.8], c: [4.5, 2.2] }, // [borde, color]
    ORDEN = ['c', 'n', 'a'];
  ORDEN.forEach(k =>
    CARRETERAS.filter(r => r[0] == k).forEach(([, nombre, P]) => {
      const d = trazoSuave(P);
      trazosVias.push({
        nm: nombre,
        k,
        d,
        els: [crearSvg('path', atributosTrazo(ANCHO[k][0], 'var(--card)', d, 0.9), $('#rd'))]
      });
    })
  );
  ORDEN.forEach(k =>
    trazosVias
      .filter(r => r.k == k)
      .forEach(r =>
        r.els.push(
          crearSvg('path', atributosTrazo(ANCHO[k][1], COLOR[k], r.d, 1, k == 'n' ? '7 4' : 0), $('#rd'))
        )
      )
  );
} catch (e) {
  console.error(e);
}

// Nudos (círculos en los enlaces) y escudos con el nombre de la carretera: no cambian de tamaño con el zoom
const escudosEscalables = [];
NUDOS.forEach(([p, k, r]) => {
  const [x, y] = proyectar(p[0], p[1]),
    g = crearSvg('g', {}, $('#sd'));
  crearSvg(
    'circle',
    { r, fill: 'var(--card)', stroke: k == 'a' ? 'var(--auv)' : 'var(--nac)', 'stroke-width': 2.2 },
    g
  );
  escudosEscalables.push({ g, x, y });
});
ESCUDOS.forEach(([nombre, k, la, lo]) => {
  const [x, y] = proyectar(la, lo),
    g = crearSvg('g', {}, $('#sd')),
    w = nombre.length * 5.4 + 8;
  crearSvg(
    'rect',
    {
      x: -w / 2,
      y: -7,
      width: w,
      height: 14,
      rx: 3,
      fill: k == 'a' ? 'var(--auv)' : k == 'c' ? 'var(--cl)' : 'var(--nac)',
      stroke: '#fff',
      'stroke-width': 1
    },
    g
  );
  const tx = crearSvg(
    'text',
    { y: 3.3, 'text-anchor': 'middle', 'font-size': 9, 'font-weight': 700, fill: '#fff' },
    g
  );
  tx.textContent = nombre;
  g.style.pointerEvents = 'auto';
  g.style.cursor = 'pointer';
  g.onclick = () => abrirFichaVia(nombre);
  escudosEscalables.push({ g, x, y });
});

// Atenúa todas las vías menos la de nombre «nombre» (null: todas normales)
function resaltarVia(nombre) {
  trazosVias.forEach(r =>
    r.els.forEach(e => {
      e.style.opacity = nombre && r.nm != nombre ? 0.2 : '';
    })
  );
}

$('#rb').onclick = () => {
  const visibles = $('#rd').style.display != 'none';
  $('#rd').style.display = $('#al').style.display = $('#sd').style.display = visibles ? 'none' : '';
  $('#rb').style.opacity = visibles ? 0.5 : 1;
};

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
  if (aplicar) mapaSvg.setAttribute('viewBox', v.x + ' ' + v.y + ' ' + v.w + ' ' + v.h);
}

// Encuadre completo: limita la vista y recoloca todo lo que depende del zoom
function ajustarVista() {
  limitarVista();
  recolocarSegunZoom(true);
}

// Durante los gestos (arrastrar, pellizcar, rueda) no se redibuja el SVG: se desplaza y escala como
// una imagen con transform de CSS, que mueve la tarjeta gráfica sin repintar. Al soltar (o tras una
// pausa de la rueda) se aplica la vista de verdad y se recolocan etiquetas y pictogramas.
let vistaInicioGesto = null, // viewBox que está pintado mientras dura el gesto
  rectInicioGesto = null, // posición del mapa en pantalla sin transformar
  temporizadorGesto = 0;
const ESPERA_FIN_GESTO = 160; // ms sin movimiento para dar el gesto por terminado

function ajustarVistaPronto() {
  if (!vistaInicioGesto) {
    rectInicioGesto = mapaSvg.getBoundingClientRect();
    const vb = mapaSvg.viewBox.baseVal;
    vistaInicioGesto = { x: vb.x, y: vb.y, w: vb.width, h: vb.height };
  }
  limitarVista(false);
  const v = vistaMapa,
    a = vistaInicioGesto,
    s = a.w / v.w,
    tx = ((a.x - v.x) / v.w) * (tamMapa.w || rectInicioGesto.width),
    ty = ((a.y - v.y) / v.h) * (tamMapa.h || rectInicioGesto.height);
  mapaSvg.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + s + ')';
  clearTimeout(temporizadorGesto);
  temporizadorGesto = setTimeout(terminarGesto, ESPERA_FIN_GESTO);
}

function terminarGesto() {
  clearTimeout(temporizadorGesto);
  if (!vistaInicioGesto) return;
  vistaInicioGesto = rectInicioGesto = null;
  mapaSvg.style.transform = '';
  ajustarVista();
}

// Qué etiquetas caben y a qué tamaño, puntos, sellos, nombres de avenidas, escudos, monumentos y la
// marca de «Estoy aquí». Con siempre=false no hace nada si la escala no ha cambiado.
let ultimaEscala = 0;
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
    z.dt.setAttribute('r', 2.8 * u);
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

  document.querySelectorAll('.avp').forEach(e => (e.style.display = v.w <= 240 ? '' : 'none'));
  etiquetasAvenidas.forEach(t => {
    if (t._largo === undefined)
      try {
        t._largo = t._p.getTotalLength(); // en unidades del mapa: no cambia con el zoom
      } catch (e) {
        t._largo = 0;
      }
    const largo = t._largo / u;
    t.style.display = v.w <= 90 && largo > t._n * 8.5 * 0.52 * 1.3 + 12 ? '' : 'none';
    t.style.fontSize = 8.5 * u + 'px';
    t.style.strokeWidth = 2.5 * u + 'px';
  });
  $('#rl').style.fontSize = 11 * u + 'px';
  escudosEscalables.forEach(q => q.g.setAttribute('transform', escalaFija(q.x, q.y, u)));
  // monumentos.js carga después: en la primera llamada puede no existir aún
  if (typeof colocarMonumentos == 'function') colocarMonumentos(u);
  // marcaPosicion se declara en ubicacion.js, que carga después: aquí puede no existir aún
  if (typeof marcaPosicion != 'undefined' && marcaPosicion)
    marcaPosicion.m.setAttribute('transform', escalaFija(marcaPosicion.x, marcaPosicion.y, u));
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
const ALTO_PANEL_MOVIL = 0.46; // fracción de la pantalla; igual que .sh{max-height:46vh} en estilos.css
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

$('#zi').onclick = () => zoomMapa(1.6);
$('#zo').onclick = () => zoomMapa(1 / 1.6);
// Alterna entre la ciudad y el mapa entero
$('#zr').onclick = () => {
  vistaMapa = vistaMapa.w < 300 ? { x: 0, y: 0, w: 9999, h: 9999 } : encuadreInicial();
  ajustarVista();
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
  alSoltar: terminarGesto
});

// Si cambia el tamaño del mapa en pantalla (girar el móvil, cambiar de pestaña…), se vuelve a medir
new ResizeObserver(() => {
  const antes = tamMapa.w + 'x' + tamMapa.h;
  medirMapa();
  if (tamMapa.w + 'x' + tamMapa.h != antes) ajustarVista();
}).observe(mapaSvg);
