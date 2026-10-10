// Pestañas, marcador general, lista, panel de capas y teclado

// Repinta todo lo que depende del progreso: barra y contador, rana, logros y la pestaña abierta
function actualizar() {
  const marcas = Object.values(progreso.z),
    pisadas = marcas.filter(x => x == 'v').length,
    porVisitar = marcas.filter(x => x == 'w').length,
    total = todasLasZonas.length;
  $('#pg').style.width = (pisadas / total) * 100 + '%';
  $('#cn').textContent =
    pisadas +
    ' de ' +
    total +
    ' zonas pisadas, ' +
    porVisitar +
    ' por visitar' +
    (progreso.f ? '. Rana encontrada 🐸' : '');
  $('#fr').style.opacity = progreso.f ? 1 : 0.45;
  try {
    pintarLogros();
    pintarFiltrosMapa();
    if (typeof pintarCuenta == 'function') pintarCuenta(); // cuenta.js: «para no perder tu progreso»
    if (pestana == 'list') pintarLista();
    if (pestana == 'prov') actualizarProvincia();
  } catch (e) {
    console.error(e);
  }
}

// En el móvil cada pestaña ocupa la pantalla; en escritorio el mapa se ve siempre a la izquierda
function cambiarPestana(nueva) {
  // Cambiar de pestaña deja el juego; si va a medias, antes se pregunta (juego.js)
  if (nueva != 'map' && typeof juego != 'undefined' && juego.activo)
    return pedirSalirJuego(() => cambiarPestana(nueva));
  pestana = nueva;
  const enMapa = nueva == 'map',
    mapaVisible = enMapa || esEscritorio();
  document.querySelector('.mw').style.display =
    $('#explorar').style.display =
    $('#palabra').style.display =
      mapaVisible ? '' : 'none';
  if (!mapaVisible) abrirCapas(false);
  $('#gm').hidden = mapaVisible ? !$('#gm').textContent : true;
  $('#ls').style.display = nueva == 'list' ? '' : 'none';
  $('#pv').style.display = nueva == 'prov' ? '' : 'none';
  marcarInterruptor($('#vmap'), nueva != 'prov'); // la lista es parte de la capital
  marcarInterruptor($('#vprov'), nueva == 'prov');
  if (nueva == 'list') pintarLista();
  else if (nueva == 'prov') {
    if (!vistaProvincia) construirProvincia();
    else actualizarProvincia();
  } else ajustarVista();
  if (esEscritorio()) ajustarVista();
  enlaceVista();
}

// Lo que dice la lista cuando un filtro no deja ninguna zona
const LISTA_VACIA = {
  v: 'Aún no has pisado ninguna zona. ¡Avíate, que te están esperando!',
  w: 'Nada en «Quiero ir». ¿Vas a salir de guindas a brevas? Apunta algún sitio.',
  n: 'No queda ninguna sin marcar: o la has pisado o está en «Quiero ir».'
};

// La lista de zonas de la capital (se abre con el botón del mapa, #vlist): zonas por grupo con sus botones
function pintarLista() {
  const caja = $('#ls'),
    volver = crear('button', 'volver-mapa', esEscritorio() ? '× Cerrar la lista' : '← Volver al mapa');
  caja.textContent = '';
  volver.onclick = () => cambiarPestana('map');
  caja.append(volver, crear('h2', 'lista-titulo', 'Las zonas de la capital'));
  caja.appendChild(
    crearBotonesFiltro(filtroLista, clave => {
      filtroLista = clave;
      pintarLista();
    })
  );
  let alguna = false;
  NOMBRES_GRUPOS.forEach((nombreGrupo, g) => {
    const delGrupo = todasLasZonas.filter(z => z.g == g),
      visibles = delGrupo
        .filter(z => cumpleFiltro(filtroLista, progreso.z[z.id]))
        .sort((a, b) => a.n.localeCompare(b.n, 'es'));
    if (!visibles.length) return;
    alguna = true;
    const pisadas = delGrupo.filter(z => progreso.z[z.id] == 'v').length;
    caja.appendChild(crear('div', 'lh', nombreGrupo + ' · ' + pisadas + '/' + delGrupo.length));
    visibles.forEach(z => {
      const nombre = crear('button', 'nm', z.n),
        fila = crear('div', 'lr', nombre);
      nombre.onclick = () => abrirFicha(z.id);
      ESTADOS_MARCA.forEach(([marca, texto]) => {
        const b = crear('button', 'q' + (progreso.z[z.id] == marca ? ' on ' + marca : ''), texto);
        b.setAttribute('aria-pressed', progreso.z[z.id] == marca);
        b.setAttribute('aria-label', texto + ': ' + z.n);
        b.onclick = () => marcarZona(z.id, marca);
        fila.appendChild(b);
      });
      caja.appendChild(fila);
    });
  });
  if (!alguna)
    caja.appendChild(crear('p', 'mu', LISTA_VACIA[filtroLista] || 'Nada que mostrar con este filtro.'));
}

$('#vmap').onclick = () => cambiarPestana('map');
$('#vprov').onclick = () => cambiarPestana('prov');
$('#vlist').onclick = () => cambiarPestana('list');

// --- Filtros del mapa (en el panel de capas): estado de la zona, parte de la ciudad y monumentos ---
// Se combinan: p. ej. «Sin pisar» + «Sur» deja a la vista las zonas del sur que faltan.
function pintarFiltrosMapa() {
  const caja = $('#fmap');
  caja.textContent = '';
  const grupo = (titulo, opciones, conjunto) => {
    const fila = crear('div', 'fl');
    fila.setAttribute('role', 'group');
    fila.setAttribute('aria-label', titulo);
    opciones.forEach(([clave, texto]) => {
      const b = crear('button', '', texto);
      marcarInterruptor(b, conjunto.has(clave));
      b.onclick = () => {
        if (conjunto.has(clave)) conjunto.delete(clave);
        else conjunto.add(clave);
        aplicarFiltrosMapa();
        $('#fmap [aria-label="' + titulo + '"]').children[opciones.findIndex(o => o[0] == clave)].focus();
      };
      fila.appendChild(b);
    });
    caja.append(crear('small', 'fmap-t', titulo), fila);
  };
  grupo('Zonas', ESTADOS_FILTRO, filtrosMapa.estados);
  grupo('Parte de la ciudad', GRUPOS_FILTRO, filtrosMapa.grupos);
  grupo(
    'Monumentos',
    CATEGORIAS_MONUMENTO.map(([clave, texto]) => [clave, texto]),
    filtrosMapa.monumentos
  );
  const visibles = zonas.filter(zonaPasaFiltros).length,
    resumen = crear('p', 'fmap-r', 'Se ven ' + visibles + ' de ' + zonas.length + ' zonas');
  if (hayFiltrosMapa()) {
    const quitar = crear('button', 'enlace', 'Quitar filtros');
    quitar.onclick = () => {
      filtrosMapa.estados = new Set(ESTADOS_FILTRO.map(f => f[0]));
      filtrosMapa.grupos = new Set(GRUPOS_FILTRO.map(f => f[0]));
      filtrosMapa.monumentos = new Set(CATEGORIAS_MONUMENTO.map(c => c[0]));
      aplicarFiltrosMapa();
      $('#fmap button').focus();
    };
    resumen.append(' · ', quitar);
  }
  caja.appendChild(resumen);
  // El botón de capas avisa de que hay filtros puestos aunque el panel esté cerrado
  $('#zc').classList.toggle('filtrado', hayFiltrosMapa());
  $('#zc').setAttribute(
    'aria-label',
    hayFiltrosMapa() ? 'Capas, leyenda y filtros (hay filtros puestos)' : 'Capas, leyenda y filtros'
  );
}
function aplicarFiltrosMapa() {
  todasLasZonas.forEach(pintarZona);
  ajustarVista(); // vuelve a colocar los monumentos
  pintarFiltrosMapa();
}
pintarFiltrosMapa();

// --- Panel de capas: interruptores de carreteras y monumentos, y la leyenda ----------
function abrirCapas(abrir = $('#capas').hidden) {
  $('#capas').hidden = !abrir;
  $('#zc').setAttribute('aria-expanded', abrir);
  $('#zc').classList.toggle('on', abrir);
  if (abrir) $('#rb').focus({ preventScroll: true });
}
$('#zc').onclick = () => abrirCapas();
$('#capx').onclick = () => {
  abrirCapas(false);
  $('#zc').focus({ preventScroll: true });
};
// Se cierra al tocar fuera o con Esc
document.addEventListener('pointerdown', e => {
  if (!$('#capas').hidden && !e.target.closest('#capas, #zc')) abrirCapas(false);
});
$('#capas').addEventListener('keydown', e => {
  if (e.key == 'Escape') {
    e.stopPropagation();
    $('#capx').click();
  }
});

// (El buscador principal está en buscador.js)

// --- Tamaño de pantalla y teclado -------------------------------------------
addEventListener('resize', () => {
  medirMapa();
  ajustarVista();
});
matchMedia('(min-width:900px)').addEventListener('change', () => {
  cambiarPestana(pestana);
  ajustarVista();
});
// Esc cierra la ficha; + y - acercan y alejan el mapa
addEventListener('keydown', e => {
  if (e.key == 'Escape' && !$('#capas').hidden) abrirCapas(false);
  else if (e.key == 'Escape' && $('.modal'))
    return; // la cierra imagen.js (cerrarVentana)
  else if (e.key == 'Escape' && typeof juego != 'undefined' && juego.activo) {
    e.preventDefault(); // que imagen.js no cierre en el acto la pregunta que se abre ahora
    pedirSalirJuego(); // pregunta si la partida va a medias
  } else if (e.key == 'Escape' && $('#sh').classList.contains('o')) $('#x').click();
  else if (
    e.target.tagName != 'INPUT' &&
    e.target.tagName != 'TEXTAREA' &&
    (pestana == 'map' || esEscritorio())
  ) {
    if (e.key == '+' || e.key == '=') zoomSuave(1.6);
    else if (e.key == '-') zoomSuave(1 / 1.6);
  }
});
