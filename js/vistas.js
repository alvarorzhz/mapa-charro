// Pestañas, marcador general, lista, buscador, copia de seguridad y teclado

// Repinta todo lo que depende del progreso: barra y contador, rana, código de copia, logros y la pestaña abierta
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
  $('#cd').value = btoa(JSON.stringify(progreso));
  try {
    pintarLogros();
    if (pestana == 'list') pintarLista();
    if (pestana == 'prov') actualizarProvincia();
  } catch (e) {
    console.error(e);
  }
}

// En el móvil cada pestaña ocupa la pantalla; en escritorio el mapa se ve siempre a la izquierda
function cambiarPestana(nueva) {
  if (nueva != 'map' && typeof juego != 'undefined' && juego.activo) salirJuego();
  pestana = nueva;
  const enMapa = nueva == 'map',
    mapaVisible = enMapa || esEscritorio();
  document.querySelector('.mw').style.display = document.querySelector('.lg').style.display = mapaVisible
    ? ''
    : 'none';
  $('#gm').hidden = mapaVisible ? !$('#gm').textContent : true;
  $('#ls').style.display = nueva == 'list' ? '' : 'none';
  $('#pv').style.display = nueva == 'prov' ? '' : 'none';
  $('#vmap').classList.toggle('on', enMapa);
  $('#vlist').classList.toggle('on', nueva == 'list');
  $('#vprov').classList.toggle('on', nueva == 'prov');
  if (nueva == 'list') pintarLista();
  else if (nueva == 'prov') {
    if (!vistaProvincia) construirProvincia();
    else actualizarProvincia();
  } else ajustarVista();
  if (esEscritorio()) ajustarVista();
  enlaceVista();
}

// Pestaña Lista: zonas por grupo con sus botones
function pintarLista() {
  const caja = $('#ls');
  caja.textContent = '';
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
        b.onclick = () => marcarZona(z.id, marca);
        fila.appendChild(b);
      });
      caja.appendChild(fila);
    });
  });
  if (!alguna) caja.appendChild(crear('p', 'mu', 'Nada que mostrar con este filtro.'));
}

$('#vmap').onclick = () => cambiarPestana('map');
$('#vprov').onclick = () => cambiarPestana('prov');
$('#vlist').onclick = () => cambiarPestana('list');

// --- Copia de seguridad: el progreso en base64 ------------------------------
$('#cp').onclick = () => {
  try {
    navigator.clipboard.writeText($('#cd').value);
    aviso('Código copiado');
  } catch (e) {
    $('#cd').select();
  }
};
$('#ld').onclick = () => {
  try {
    const leido = JSON.parse(atob($('#cd').value.trim()));
    if (!leido || typeof leido.z != 'object') throw 0;
    progreso = limpiarProgreso(leido);
    guardar();
    todasLasZonas.forEach(pintarZona);
    actualizar();
    aviso('Mapa cargado');
  } catch (e) {
    aviso('Código no válido');
  }
};

// --- Buscador principal: zonas, restaurantes y carreteras --------------------
function buscar() {
  const q = normalizar($('#q').value.trim()),
    caja = $('#sr');
  caja.textContent = '';
  if (!q) return;
  // Cada candidato: [texto, subtítulo, qué hacer al elegirlo]
  const candidatos = [
    ...todasLasZonas.map(z => [z.n, NOMBRES_GRUPOS[z.g], () => abrirFicha(z.id)]),
    ...Object.entries(DONDE_COMER).flatMap(([id, sitios]) =>
      sitios.map(s => [s.n, 'Dónde comer · ' + buscarZona(id).n, () => abrirFicha(id)])
    ),
    ...Object.keys(PUEBLOS).map(n => [
      n,
      'Pueblo · ' + PROVINCIA.com[municipioPorNombre(n).c],
      () => abrirPueblo(municipioPorNombre(n))
    ]),
    [RUTA.nombre + ' a pie', 'Ruta · ' + RUTA.paradas.length + ' paradas', () => abrirRuta()],
    ...MONUMENTOS.map(m => [m.n, 'Monumento · ' + buscarZona(m.zona).n, () => abrirMonumento(m.id)]),
    ...Object.keys(INFO_VIAS).map(k => [k + ' · ' + INFO_VIAS[k][1], INFO_VIAS[k][0], () => abrirFichaVia(k)])
  ];
  const encontrados = candidatos
    .map(c => [normalizar(c[0]).indexOf(q), c])
    .filter(a => a[0] >= 0)
    .sort((a, b) => a[0] - b[0])
    .slice(0, 6);
  if (!encontrados.length) {
    caja.textContent = 'Sin resultados';
    return;
  }
  encontrados.forEach(([, [texto, subtitulo, abrir]]) => {
    const b = crear('button', '', texto, crear('small', '', subtitulo));
    b.onclick = () => {
      abrir();
      $('#q').value = '';
      caja.textContent = '';
      document.querySelector('.mw').scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    caja.appendChild(b);
  });
}
$('#q').addEventListener('input', buscar);
$('#q').addEventListener('keydown', e => {
  if (e.key == 'Enter') {
    const primero = document.querySelector('#sr button');
    if (primero) primero.click();
  }
});

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
  if (e.key == 'Escape' && $('#sh').classList.contains('o')) $('#x').click();
  else if (
    e.target.tagName != 'INPUT' &&
    e.target.tagName != 'TEXTAREA' &&
    (pestana == 'map' || esEscritorio())
  ) {
    if (e.key == '+' || e.key == '=') zoomSuave(1.6);
    else if (e.key == '-') zoomSuave(1 / 1.6);
  }
});
