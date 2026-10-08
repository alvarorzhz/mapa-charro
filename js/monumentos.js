// Monumentos: pictogramas en el mapa y mini infografía en el panel de la ficha

// Pictogramas en una caja de 24 × 24, solo trazos
const PICTOGRAMAS = {
  plaza: 'M3 20V8h18v12M2 8l10-4 10 4M3 20h18M6 20v-4a2 2 0 0 1 4 0v4M14 20v-4a2 2 0 0 1 4 0v4M6 11h12',
  catedral:
    'M12 2v3M10.5 3.5h3M12 5l-3.5 5v12h7V10zM4 22v-8l4.5-3M20 22v-8l-4.5-3M10.5 22v-3a1.5 1.5 0 0 1 3 0v3M3 22h18',
  universidad: 'M3 9l9-5 9 5zM5.5 9v9M9.5 9v9M14.5 9v9M18.5 9v9M3 18h18M2 21h20',
  iglesia: 'M12 2v4M10 3.8h4M5 22V11l7-5 7 5v11M10 22v-4a2 2 0 0 1 4 0v4M3 22h18M12 11v2',
  redonda: 'M12 2v4M10 3.8h4M4 22v-9a8 6 0 0 1 16 0v9M10 22v-4a2 2 0 0 1 4 0v4M3 22h18',
  concha: 'M12 20L3.5 10.5a9.5 9 0 0 1 17 0zM12 20L7 7M12 20V5.5M12 20l5-13M9 22h6',
  palacio: 'M3 22V9h4v3h10V9h4v13M3 22h18M3 9l2-3 2 3M17 9l2-3 2 3M10 22v-4h4v4M10 15h4',
  torre: 'M7 22V10h10v12M6 10V5h2.5v2h2V5h3v2h2V5H18v5M11 22v-4h2v4M5 22h14M10.5 13h3',
  puente: 'M2 9h20M2 9v11h1.5a4.25 4.25 0 0 1 8.5 0 4.25 4.25 0 0 1 8.5 0H22V9',
  toros:
    'M3 14a9 5.5 0 1 0 18 0 9 5.5 0 1 0-18 0M8 14a4 2.2 0 1 0 8 0 4 2.2 0 1 0-8 0M12 8.5V3l3.5 1.2L12 5.4',
  estadio:
    'M2.5 7h19v11h-19zM12 7v11M9.5 12.5a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0M2.5 10h2.5v5H2.5M21.5 10H19v5h2.5',
  jardin: 'M12 22v-6M12 16a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM9.5 11.5l2.5 2 2.5-2M7 22h10',
  cueva: 'M2 21c2-9 6-15 10-15s8 6 10 15zM8 21c1-4 2.5-7 4-7s3 3 4 7',
  museo: 'M5 22V10a7 7 0 0 1 14 0v12zM12 3v19M5 14h14M8.5 9.5a3.5 3.5 0 0 1 7 0',
  presa: 'M2 6h20M5 6l2 14h10l2-14M8 10h8M8.5 14h7M3 21h18',
  roca: 'M2 20l3-9 5-4 5 2 4-2 3 13zM8 15l2-3 3 1 2-2M9.5 17.5h4',
  mercado: 'M3 9l2-5h14l2 5zM3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0M5 12v10h14V12M10 22v-5h4v5'
};

const ANCHO_MAX_IMPRESCINDIBLES = 260; // con el mapa más alejado que esto no se ve ningún monumento
const ANCHO_MAX_RESTO = 110; // los demás, solo al acercar
const SEPARACION_PX = 24; // si dos pictogramas quedan más cerca, se dibuja solo el primero
let monumentoAbierto = null;
const buscarMonumento = id => MONUMENTOS.find(m => m.id == id);

// Dibuja el pictograma de un tipo dentro de «padre» (una caja de 24 × 24 centrada en 0,0 y escalada)
function dibujarPictograma(tipo, padre, escala = 1) {
  return crearSvg(
    'path',
    { d: PICTOGRAMAS[tipo], transform: 'scale(' + escala + ') translate(-12 -12)' },
    padre
  );
}

// Pictograma suelto en un <svg> para el panel y las listas
function iconoMonumento(tipo, tam) {
  const svg = crearSvg('svg', {
    viewBox: '-14 -14 28 28',
    width: tam,
    height: tam,
    class: 'mon-ico',
    'aria-hidden': 'true'
  });
  crearSvg('rect', { x: -13, y: -13, width: 26, height: 26, rx: 6 }, svg);
  dibujarPictograma(tipo, svg, 0.8);
  return svg;
}

// --- Capa del mapa ----------------------------------------------------------
MONUMENTOS.forEach(m => {
  [m.x, m.y] = proyectar(m.la, m.lo);
  m.g = crearSvg('g', { class: 'mon' + (m.top ? ' imp' : ''), role: 'button', 'aria-label': m.n }, $('#mon'));
  crearSvg('title', {}, m.g).textContent = m.n;
  crearSvg('rect', { x: -11, y: -11, width: 22, height: 22, rx: 5 }, m.g);
  dibujarPictograma(m.tipo, m.g, 0.72);
  m.g.onclick = () => {
    if (gestosMapa.arrastre <= UMBRAL_TOQUE) abrirMonumento(m.id);
  };
});

// Llamada desde ajustarVista: qué pictogramas caben y dónde, con tamaño fijo en pantalla
function colocarMonumentos(u) {
  const v = vistaMapa,
    puestos = [];
  MONUMENTOS.forEach(m => {
    const px = (m.x - v.x) / u,
      py = (m.y - v.y) / u,
      tocaZoom = v.w <= (m.top ? ANCHO_MAX_IMPRESCINDIBLES : ANCHO_MAX_RESTO),
      libre = !puestos.some(p => Math.abs(p[0] - px) < SEPARACION_PX && Math.abs(p[1] - py) < SEPARACION_PX),
      enRuta = typeof rutaActiva != 'undefined' && rutaActiva && RUTA.paradas.includes(m.id),
      ver = (tocaZoom && libre) || m.id == monumentoAbierto || enRuta;
    m.g.style.display = ver ? '' : 'none';
    if (!ver) return;
    puestos.push([px, py]);
    m.g.setAttribute('transform', escalaFija(m.x, m.y, u));
  });
  apartarEtiquetas(puestos, u);
  // ruta.js carga después: en la primera llamada puede no existir aún
  if (typeof colocarRuta == 'function') colocarRuta(u);
}

// Si un pictograma tapa el nombre de una zona, aparta el nombre justo por encima o por debajo;
// si ahí choca con otro nombre, lo oculta (queda el punto de la zona)
function apartarEtiquetas(puestos, u) {
  const v = vistaMapa,
    cajas = [];
  zonas.forEach(z => {
    [z.tx, z.tx2].forEach(t => t && t.removeAttribute('transform'));
    const e = z.etiqueta;
    if (!e) return;
    cajas.push({
      z,
      e,
      cx: (z.x - v.x) / u,
      cy: (z.y - v.y) / u,
      mx: (e.ancho * e.tam * 0.62) / 2,
      my: (e.lineas * e.tam * 1.15) / 2
    });
  });
  if ($('#mon').style.display == 'none') return;
  // ¿El nombre, con su centro en cy, chocaría con otro nombre o con algún pictograma?
  const choca = (c, cy) =>
    cajas.some(
      o => o != c && !o.oculta && Math.abs(o.cx - c.cx) < o.mx + c.mx && Math.abs(o.cy - cy) < o.my + c.my
    ) || puestos.some(([px, py]) => Math.abs(px - c.cx) < c.mx + 11 && Math.abs(py - cy) < c.my + 11);
  cajas.forEach(c => {
    const tapa = puestos.filter(
      ([px, py]) => Math.abs(px - c.cx) < c.mx + 12 && Math.abs(py - c.cy) < c.my + 12
    );
    if (!tapa.length) return;
    // Dos opciones: justo por debajo de todos los pictogramas que lo tapan o justo por encima; la más corta que no choque
    const ys = tapa.map(([, py]) => py),
      opciones = [Math.max(...ys) + 13 + c.my - c.cy, Math.min(...ys) - 13 - c.my - c.cy].sort(
        (a, b) => Math.abs(a) - Math.abs(b)
      ),
      mover = opciones.find(m => !choca(c, c.cy + m));
    if (mover === undefined) {
      c.oculta = true;
      c.e.el.style.display = 'none';
      c.z.dt.style.display = '';
      return;
    }
    c.cy += mover;
    c.e.el.setAttribute('transform', 'translate(0 ' + mover * u + ')');
  });
}

// Botón «Monumentos» de la leyenda: muestra u oculta la capa
$('#mb').onclick = () => {
  const visibles = $('#mon').style.display != 'none';
  $('#mon').style.display = visibles ? 'none' : '';
  $('#mb').style.opacity = visibles ? 0.5 : 1;
  ajustarVista();
};

// --- Mini infografía --------------------------------------------------------
function pintarInfografia(m) {
  const caja = $('#info');
  caja.textContent = '';
  caja.hidden = false;
  const zona = buscarZona(m.zona);
  caja.appendChild(
    crear(
      'div',
      'cab',
      iconoMonumento(m.tipo, 46),
      crear('div', 'epo', crear('b', '', m.epoca), m.estilo ? crear('span', '', m.estilo) : null)
    )
  );
  caja.appendChild(
    crear(
      'div',
      'datos',
      ...m.datos.map(([etiqueta, valor]) =>
        crear('div', 'dato', crear('small', '', etiqueta), crear('b', '', valor))
      )
    )
  );
  m.curiosidades.forEach((t, i) => caja.appendChild(crear('p', i ? 'curio mas' : 'curio', t)));
  const fuentes = crear('p', 'fte', 'Fuente: ');
  m.fuente.forEach(([nombre, url], i) => {
    const a = crear('a', '', nombre);
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    fuentes.append(i ? ' · ' : '', a);
  });
  caja.appendChild(fuentes);
  // Botones: ir al barrio y cómo llegar
  const nb = $('#nb');
  nb.textContent = '';
  const barrio = crear('button', '', 'Ver ' + zona.n);
  barrio.onclick = () => abrirFicha(zona.id);
  const llegar = crear('a', 'llegar', 'Cómo llegar');
  llegar.href = 'https://www.google.com/maps/dir/?api=1&destination=' + m.la + ',' + m.lo;
  llegar.target = '_blank';
  llegar.rel = 'noopener';
  nb.append(barrio, llegar);
}

// parada: índice en la ruta a pie si se abre como parada de la ruta
function abrirMonumento(id, parada) {
  const m = buscarMonumento(id),
    zona = buscarZona(m.zona);
  zonaAbierta = null;
  monumentoAbierto = id;
  MONUMENTOS.forEach(o => o.g.classList.toggle('sel', o == m));
  $('#here').hidden = true;
  $('#k').textContent = 'Monumento · ' + zona.n;
  $('#nm').textContent = m.n;
  $('#hc').hidden = $('#hl').hidden = $('#he').hidden = true;
  $('#cu').textContent = $('#ri').textContent = $('#eat').textContent = '';
  $('#mz').hidden = true;
  $('#ap').textContent = '';
  pintarFoto(m.foto);
  pintarInfografia(m);
  const comoParada = typeof parada == 'number';
  if (comoParada) pintarNavegacionRuta(parada);
  else if (typeof paradaActual != 'undefined') paradaActual = -1;
  modoBotonesFicha('monumento');
  resaltarVia(null);
  centrarMapaEn(m.x, m.y, Math.min(vistaMapa.w, 70));
  mostrarFicha();
  enlaceFicha(comoParada ? 'ruta/' + (parada + 1) : 'monumento/' + id, m.n);
}

// Quita la selección de monumento (al abrir otra ficha o cerrar)
function olvidarMonumento() {
  monumentoAbierto = null;
  if (typeof salirTiempo == 'function') salirTiempo(); // tiempo.js: el mapa vuelve a ser el de hoy
  if (typeof puebloAbierto != 'undefined') puebloAbierto = null;
  if (typeof paradaActual != 'undefined') paradaActual = -1;
  $('#info').hidden = true;
  MONUMENTOS.forEach(o => o.g.classList.remove('sel'));
}

// Sección «Monumentos» en la ficha de una zona
function pintarMonumentosDeZona(z) {
  const caja = $('#mz'),
    lista = MONUMENTOS.filter(m => m.zona == z.id);
  caja.textContent = '';
  caja.hidden = !lista.length;
  if (!lista.length) return;
  caja.append('Monumentos: ');
  lista.forEach(m => {
    const b = crear('button', 'conico', iconoMonumento(m.tipo, 18), m.n);
    b.onclick = () => abrirMonumento(m.id);
    caja.appendChild(b);
  });
}
