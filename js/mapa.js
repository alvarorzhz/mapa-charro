// Mapa de la ciudad: tamaño del mapa y dibujo de las zonas. Lo sigue mapa-fondo.js (fondo, límites, río),
// mapa-vias.js (carreteras y avenidas) y mapa-vista.js (encuadre, zoom y gestos).

const ANCHO_MAPA = 400,
  ALTO_MAPA = 480; // tamaño del viewBox completo
const ANCHO_MINIMO = 16; // zoom máximo (ancho del encuadre en unidades del mapa)

// --- Zonas ------------------------------------------------------------------

// Lo que dice un lector de pantalla al llegar a la zona: «Tejares, Zona oeste, pisada»
const etiquetaAccesible = (z, marca) =>
  z.n + ', ' + NOMBRES_GRUPOS[z.g] + (marca == 'v' ? ', pisada' : marca == 'w' ? ', quieres ir' : '');

// Colores y sello «V» de una zona según su marca
function pintarZona(z) {
  const marca = progreso.z[z.id];
  if (z.id == 'resto') return; // sin dibujo en el mapa
  const fuera = !zonaPasaFiltros(z); // los filtros del mapa la atenúan
  z.e.setAttribute('aria-label', etiquetaAccesible(z, marca));
  const clase = 'z c' + z.g + (ZONAS_NO_OFICIALES.has(z.id) ? ' sub' : '');
  z.e.setAttribute(
    'class',
    clase +
      ' t' +
      (z.tono || 0) +
      (marca ? ' ' + marca : '') +
      (zonaAbierta == z.id ? ' sel' : '') +
      (fuera ? ' fuera' : '')
  );
  if (typeof limiteSeleccion != 'undefined') {
    if (zonaAbierta == z.id) limiteSeleccion.setAttribute('d', trazoAnillo(z.P));
    else if (!zonaAbierta) limiteSeleccion.setAttribute('d', '');
  }
  [z.tx, z.tx2].forEach(
    t => t && t.setAttribute('class', 'lb' + (marca == 'v' ? ' v' : '') + (fuera ? ' fuera' : ''))
  );
  z.dt.setAttribute('class', 'dt' + (marca == 'v' ? ' v' : '') + (fuera ? ' fuera' : ''));
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
    const limite = LIMITES_BARRIOS[z.id] || LIMITES_ALFOZ[z.id]; // barrio oficial o término municipal
    if (limite) P = limite.map(q => proyectar(q[0], q[1]));
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
    // Cada zona es un botón para el teclado y los lectores de pantalla (mapa-teclado.js)
    z.e.setAttribute('role', 'button');
    z.e.setAttribute('tabindex', '-1');
    z.e.onclick = () => {
      if (gestosMapa.arrastre > UMBRAL_TOQUE) return;
      // Durante el juego «¿Dónde está?» (juego.js), tocar una zona es responder
      if (typeof juego != 'undefined' && juego.activo) responderJuego(z);
      else abrirFicha(z.id);
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

// Pueblos de alrededor: su término municipal real (LIMITES_ALFOZ); barrios: el contorno de la ciudad.
// (El lienzo entero solo hace falta como base si a algún pueblo le faltara su término.)
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
