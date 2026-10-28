// Mapa de la ciudad: carreteras, avenidas, nudos y escudos, la etiqueta de la avenida y el resaltado de
// la vía con la ficha abierta. Va después de mapa-fondo.js.

// --- Carreteras y avenidas --------------------------------------------------

const tramosAvenidas = {}; // nombre -> trazos de sus tramos
let viaResaltada = null; // nombre de la vía cuya ficha está abierta
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
    capaRondas = crearSvg('g', { class: 'avp' }, $('#rd')),
    // Trazos invisibles y más anchos que la avenida, para poder pulsarla con el dedo
    capaToque = crearSvg('g', { class: 'avp' }, $('#rd'));
  AVENIDAS.forEach(([nombre, tipo, tramos]) => {
    const ronda = tipo == 't',
      els = [],
      rellenos = [];
    tramos.forEach(P => {
      const d = trazoSuave(P);
      els.push(
        crearSvg('path', atributosTrazo(ronda ? 5 : 3.6, 'var(--linea)', d, ronda ? 0.6 : 0.38), capaBorde)
      );
      const relleno = crearSvg(
        'path',
        atributosTrazo(ronda ? 3.4 : 2.2, ronda ? 'var(--ronda)' : 'var(--calle)', d, ronda ? 1 : 0.85),
        ronda ? capaRondas : capaAvenidas
      );
      els.push(relleno);
      rellenos.push(relleno);
    });
    if (nombre) {
      tramosAvenidas[nombre] = rellenos;
      rellenos.forEach((relleno, i) => {
        const toque = crearSvg(
          'path',
          atributosTrazo(10, 'transparent', relleno.getAttribute('d'), 1),
          capaToque
        );
        toque.style.pointerEvents = 'stroke';
        toque.style.cursor = 'pointer';
        toque.onclick = () => {
          if (gestosMapa.arrastre <= UMBRAL_TOQUE) abrirFichaVia(nombre, i);
        };
      });
    }
    trazosVias.push({ nm: nombre, els });
  });

  // Carreteras: a = autovía, n = nacional, c = autonómica. Primero todos los bordes y luego los
  // colores, de menor a mayor categoría, para que las autovías queden encima.
  const COLOR = { a: 'var(--autovia)', n: 'var(--nacional)', c: 'var(--comarcal)' },
    ANCHO = { a: [6.8, 3.4], n: [4.8, 2.3], c: [4, 1.9] }, // [borde, color]
    ORDEN = ['c', 'n', 'a'];
  ORDEN.forEach(k =>
    CARRETERAS.filter(r => r[0] == k).forEach(([, nombre, P]) => {
      const d = trazoSuave(P);
      trazosVias.push({
        nm: nombre,
        k,
        d,
        els: [crearSvg('path', atributosTrazo(ANCHO[k][0], 'var(--tarjeta)', d, 0.85), $('#rd'))]
      });
    })
  );
  ORDEN.forEach(k =>
    trazosVias
      .filter(r => r.k == k)
      .forEach(r => r.els.push(crearSvg('path', atributosTrazo(ANCHO[k][1], COLOR[k], r.d, 1), $('#rd'))))
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
    {
      r: r * 0.85,
      fill: 'var(--tarjeta)',
      stroke: k == 'a' ? 'var(--autovia)' : 'var(--nacional)',
      'stroke-width': 1.8
    },
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
      fill: k == 'a' ? 'var(--autovia)' : k == 'c' ? 'var(--comarcal)' : 'var(--nacional)',
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

// Nombre de la avenida seleccionada: no se pintan todos (lían el mapa), solo el de la que se pulsa,
// en una etiqueta junto al tramo pulsado
const etiquetaAvenida = { g: crearSvg('g', { class: 'ava' }, $('#sd')), x: 0, y: 0, nombre: null };
etiquetaAvenida.fondo = crearSvg('rect', { y: -9, height: 18, rx: 9 }, etiquetaAvenida.g);
etiquetaAvenida.texto = crearSvg('text', { y: 4, 'text-anchor': 'middle' }, etiquetaAvenida.g);
etiquetaAvenida.g.style.display = 'none';

function ponerEtiquetaAvenida(nombre, tramo = 0) {
  const e = etiquetaAvenida,
    rellenos = tramosAvenidas[nombre];
  e.nombre = rellenos ? nombre : null;
  if (!rellenos) return;
  const trazo = rellenos[tramo] || rellenos[0],
    q = trazo.getPointAtLength(trazo.getTotalLength() / 2);
  e.x = q.x;
  e.y = q.y;
  e.texto.textContent = nombre.replace(/^Avenida /, 'Av. ').replace(/^Paseo /, 'P.º ');
  e.g.style.display = '';
  const ancho = (e.texto.getComputedTextLength() || e.texto.textContent.length * 6.2) + 16;
  e.fondo.setAttribute('x', -ancho / 2);
  e.fondo.setAttribute('width', ancho);
}

// u = unidades del mapa por píxel de pantalla
function mostrarEtiquetaAvenida(u) {
  const e = etiquetaAvenida,
    ver = e.nombre && e.nombre == viaResaltada && vistaMapa.w <= 240;
  e.g.style.display = ver ? '' : 'none';
  if (ver) e.g.setAttribute('transform', escalaFija(e.x, e.y, u) + ' translate(0 -13)');
}

// Atenúa todas las vías menos la de nombre «nombre» (null: todas normales)
function resaltarVia(nombre) {
  viaResaltada = nombre;
  if (ultimaEscala) mostrarEtiquetaAvenida(ultimaEscala);
  trazosVias.forEach(r =>
    r.els.forEach(e => {
      e.style.opacity = nombre && r.nm != nombre ? 0.2 : '';
    })
  );
}

// Interruptor «Carreteras» del panel de capas
$('#rb').onclick = () => {
  const visibles = $('#rd').style.display != 'none';
  $('#rd').style.display = $('#al').style.display = $('#sd').style.display = visibles ? 'none' : '';
  marcarInterruptor($('#rb'), !visibles);
};
