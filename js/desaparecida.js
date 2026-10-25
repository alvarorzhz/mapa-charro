// Salamanca desaparecida (#desaparecida y #desaparecida/<id>): conventos, colegios e iglesias que ya no existen
// (datos/desaparecida.js). En el mapa se ven como fantasmas en su sitio: con su lista o su ficha abiertas, y en
// «Salamanca en el tiempo», donde aparecen en la etapa en que se levantan, se ven en pie mientras duran y se
// quedan como fantasmas desde la etapa en que se pierden. La lista se abre desde Monumentos y desde cada etapa.

let desaparecidoAbierto = null; // id con su ficha abierta
let listaDesaparecidaAbierta = false;
const buscarDesaparecido = id => DESAPARECIDOS.find(d => d.id == id);
const SEPARACION_FANTASMAS = 24; // píxeles entre dos fantasmas del mismo sitio

// --- Capa del mapa ----------------------------------------------------------
const capaDesaparecidos = crearSvg('g', { id: 'desap', style: 'display:none' });
mapaSvg.insertBefore(capaDesaparecidos, $('#me'));
DESAPARECIDOS.forEach(d => {
  [d.x, d.y] = proyectar(d.la, d.lo);
  d.g = crearSvg('g', { class: 'desap', role: 'button', 'aria-label': d.n }, capaDesaparecidos);
  crearSvg('title', {}, d.g).textContent = d.n + (d.aproximada ? ' (sitio aproximado)' : '');
  crearSvg('rect', { x: -11, y: -11, width: 22, height: 22, rx: 5 }, d.g);
  dibujarPictograma(d.tipo, d.g, 0.72);
  d.g.onclick = () => {
    if (gestosMapa.arrastre <= UMBRAL_TOQUE) abrirDesaparecido(d.id);
  };
});
// Los que comparten sitio (el Botánico) van uno al lado de otro, a tamaño fijo en pantalla
const delMismoSitio = d => DESAPARECIDOS.filter(o => o.la == d.la && o.lo == d.lo);

// Qué se ve y cómo: en pie («viva»), fantasma o nada («no», aún no se ha levantado en esa etapa)
function estadoDesaparecido(d, etapa) {
  if (etapa < 0) return 'fantasma';
  return etapa < d.levantado[1] ? 'no' : etapa < d.perdido[1] ? 'viva' : 'fantasma';
}

// Llamada al cambiar de etapa, al abrir o cerrar su lista o su ficha, y al salir de «Salamanca en el tiempo»
function pintarDesaparecidos() {
  const etapa = typeof etapaTiempo != 'undefined' ? etapaTiempo : -1,
    ver = etapa >= 0 || !!desaparecidoAbierto || listaDesaparecidaAbierta;
  capaDesaparecidos.style.display = ver ? '' : 'none';
  if (!ver) return;
  DESAPARECIDOS.forEach(d => {
    d.g.dataset.estado = estadoDesaparecido(d, etapa);
    d.g.classList.toggle('sel', d.id == desaparecidoAbierto);
  });
  colocarDesaparecidos(ultimaEscala || vistaMapa.w / (tamMapa.w || 380));
}

// Llamada desde recolocarSegunZoom
function colocarDesaparecidos(u) {
  if (capaDesaparecidos.style.display == 'none') return;
  DESAPARECIDOS.forEach(d => {
    const juntos = delMismoSitio(d).filter(o => o.g.dataset.estado != 'no'),
      k = juntos.indexOf(d),
      dx = k < 0 ? 0 : (k - (juntos.length - 1) / 2) * SEPARACION_FANTASMAS * u;
    d.g.setAttribute('transform', escalaFija(d.x + dx, d.y, u));
  });
}

// Al abrir otra ficha o cerrar (olvidarMonumento lo llama)
function olvidarDesaparecido() {
  if (!desaparecidoAbierto && !listaDesaparecidaAbierta) return;
  desaparecidoAbierto = null;
  listaDesaparecidaAbierta = false;
  pintarDesaparecidos();
}

// --- La lista ---------------------------------------------------------------
const iconoFantasma = (tipo, tam) => {
  const svg = iconoMonumento(tipo, tam);
  svg.classList.add('fantasma');
  return svg;
};
const textoVida = d => 'Se levantó: ' + d.levantado[0] + ' · Se perdió: ' + d.perdido[0];

function abrirSalamancaDesaparecida() {
  activarRuta(false);
  const caja = fichaLimpia('Lo que la ciudad perdió', 'Salamanca desaparecida'),
    volver = crear('button', 'volver-hoy', '← Monumentos');
  listaDesaparecidaAbierta = true;
  volver.onclick = () => abrirMonumentos();
  caja.append(
    volver,
    crear(
      'p',
      'hab',
      'Conventos, colegios e iglesias que ya no están. La mayoría cayó con la guerra de la Independencia, cuando los franceses convirtieron la ciudad en una fortaleza; otros se derribaron después. En el mapa se ven como fantasmas, en su sitio.'
    )
  );
  const tiempo = crear('button', 'conico', '📜 Verlo en «Salamanca en el tiempo»');
  tiempo.onclick = () => abrirTiempo(4);
  caja.appendChild(crear('div', 'nb', tiempo));
  const lista = crear('div', 'lista-explora');
  [...DESAPARECIDOS]
    .sort((a, b) => a.perdido[1] - b.perdido[1] || a.n.localeCompare(b.n, 'es'))
    .forEach(d => {
      const b = crear(
        'button',
        'fila-explora',
        crear('span', 'icono-hoy', iconoFantasma(d.tipo, 26)),
        crear('span', 'texto', crear('b', '', d.n), crear('small', '', textoVida(d)))
      );
      b.onclick = () => abrirDesaparecido(d.id);
      lista.appendChild(b);
    });
  caja.appendChild(lista);
  $('#ap').textContent =
    'Cada ficha lleva sus fuentes. Los sitios salen de OpenStreetMap: lo que hay hoy donde estaban (≈ si las fuentes solo dan la zona).';
  centrarMapaEn(209, 292, Math.min(vistaMapa.w, 90));
  estadoApp.fichaAlta = true;
  mostrarFicha();
  pintarDesaparecidos();
  enlaceFicha('desaparecida', 'Salamanca desaparecida');
}

// --- La ficha ---------------------------------------------------------------
function abrirDesaparecido(id) {
  const d = buscarDesaparecido(id);
  if (!d) return abrirSalamancaDesaparecida();
  activarRuta(false);
  const caja = fichaLimpia('👻 Salamanca desaparecida', d.n),
    volver = crear('button', 'volver-hoy', '← Salamanca desaparecida');
  desaparecidoAbierto = d.id;
  volver.onclick = () => abrirSalamancaDesaparecida();
  caja.append(
    volver,
    cajaDatos([
      ['Se levantó', conMayuscula(d.levantado[0])],
      ['Se perdió', conMayuscula(d.perdido[0])]
    ]),
    crear('p', 'hab', crear('b', '', d.aproximada ? 'Dónde estaba (≈): ' : 'Dónde estaba: '), d.donde)
  );
  const textos = crear('div', 'cul-textos');
  d.textos.forEach(([tipo, texto]) =>
    textos.appendChild(
      crear('p', 'cul-t ' + tipo, crear('span', 'cul-tipo', TIPOS_TEXTO_CULTURA[tipo]), texto)
    )
  );
  caja.appendChild(textos);
  // Ir a su época y a lo que sigue en pie cerca
  const enElTiempo = crear('button', 'conico', '📜 Verlo en «Salamanca en el tiempo»');
  enElTiempo.onclick = () => abrirTiempo(d.perdido[1]);
  const botones = crear('div', 'nb', enElTiempo);
  monumentosCercaDe(d).forEach(([metros, m]) => {
    const b = crear(
      'button',
      'conico',
      iconoMonumento(m.tipo, 18),
      m.n,
      crear('small', '', ' · a ' + metros)
    );
    b.onclick = () => abrirMonumento(m.id);
    botones.appendChild(b);
  });
  caja.appendChild(botones);
  const ap = $('#ap');
  ap.textContent = 'Fuentes: ';
  d.fuentes.forEach((f, i) => ap.append(i ? ', ' : '', enlaceFuente(f)));
  ap.append('. Revisado el ' + textoFechaRevision(d.revisado) + '.');
  centrarMapaEn(d.x, d.y, Math.min(vistaMapa.w, 70));
  mostrarFicha();
  pintarDesaparecidos();
  enlaceFicha('desaparecida/' + d.id, d.n);
}

// Lo que sigue en pie cerca, en línea recta: hasta dos monumentos a menos de DISTANCIA_CERCA_MONUMENTO
function monumentosCercaDe(d) {
  return MONUMENTOS.map(m => [Math.round(distanciaKm(d.la, d.lo, m.la, m.lo) * 1000), m])
    .filter(([metros]) => metros <= DISTANCIA_CERCA_MONUMENTO)
    .sort((a, b) => a[0] - b[0])
    .slice(0, 2)
    .map(([metros, m]) => [textoDistancia(redondearMetros(metros)), m]);
}

// --- En otras fichas ---------------------------------------------------------
// «Salamanca en el tiempo»: lo que se levanta y lo que se pierde en cada etapa
function apartadoDesaparecidosEtapa(i) {
  const caja = crear('div', 'tetapa-rel tdesap', crear('h4', '', '👻 Salamanca desaparecida')),
    fila = (titulo, lista) => {
      if (!lista.length) return;
      const nb = crear('div', 'nb', titulo + ': ');
      lista.forEach(d => {
        const b = crear('button', 'conico', iconoFantasma(d.tipo, 18), d.n);
        b.onclick = () => abrirDesaparecido(d.id);
        nb.appendChild(b);
      });
      caja.appendChild(nb);
    };
  const seLevantan = DESAPARECIDOS.filter(d => d.levantado[1] == i),
    sePierden = DESAPARECIDOS.filter(d => d.perdido[1] == i),
    enPie = DESAPARECIDOS.filter(d => estadoDesaparecido(d, i) == 'viva');
  fila('Se pierden ahora', sePierden);
  fila('Se levantan ahora', seLevantan);
  caja.appendChild(
    crear(
      'p',
      'mu',
      sePierden.length || enPie.length
        ? 'En el mapa, lo que sigue en pie va en sepia y lo que ya se ha perdido, en fantasma.'
        : 'En esta etapa aún no se ha levantado nada de lo que la ciudad perdería.'
    )
  );
  const todo = crear('button', 'enlace', 'Ver todo lo desaparecido');
  todo.onclick = () => abrirSalamancaDesaparecida();
  caja.appendChild(todo);
  return caja;
}

// Ficha de zona, «Para seguir explorando»: lo desaparecido que estaba dentro de su límite
function filaDesaparecidosDeZona(z) {
  return [
    'Aquí hubo',
    DESAPARECIDOS.filter(d => zonaDePunto(d.la, d.lo) == z.id).map(d => ({
      icono: iconoFantasma(d.tipo, 18),
      texto: d.n,
      detalle: 'se perdió: ' + d.perdido[0],
      abrir: () => abrirDesaparecido(d.id)
    }))
  ];
}
