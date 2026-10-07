// Ficha de zona y de carretera, y marcado He estado / Quiero ir

// Rellena el contenedor «el» con un párrafo por texto
function pintarParrafos(el, textos, clase) {
  el.textContent = '';
  textos.filter(Boolean).forEach(t => el.appendChild(crear('p', clase, t)));
}

function pintarCuriosidades(z) {
  if (z.cur && z.cur.length) pintarParrafos($('#cu'), z.cur);
  else pintarParrafos($('#cu'), [z.c], 'ld'); // sin curiosidades: la frase corta, destacada
}

function pintarLeyendas(z) {
  $('#hl').hidden = z.id == 'resto';
  if (z.ly.length) pintarParrafos($('#ri'), z.ly);
  else pintarParrafos($('#ri'), [z.id == 'resto' ? '' : 'Sin leyenda conocida.'], 'mu');
}

function pintarFoto(id) {
  const foto = FOTOS[id]; // [ruta, pie de foto con autor y licencia]
  $('#ph').hidden = $('#pc').hidden = !foto;
  if (!foto) return;
  $('#ph').src = foto[0];
  $('#ph').alt = foto[1].split('. Foto')[0];
  $('#pc').textContent = foto[1];
}

// sitios: [{ n, t, a, p, s }]; lugar: para buscarlos en Google Maps
function pintarSitiosComer(sitios, lugar, vacio) {
  const el = $('#eat');
  el.textContent = '';
  if (sitios && sitios.length) {
    sitios.forEach(s => {
      const mapa = crear('a', '', 'Ver en Google Maps');
      mapa.href =
        'https://www.google.com/maps/search/?api=1&query=' +
        encodeURIComponent(s.n + ' ' + s.a + ' ' + lugar);
      mapa.target = '_blank';
      mapa.rel = 'noopener';
      el.appendChild(
        crear(
          'div',
          'er',
          crear('b', '', s.n),
          s.t ? ' · ' + s.t : '',
          crear('p', '', (s.a ? s.a + '. ' : '') + s.p + ' Fuente: ' + s.s + '.'),
          mapa
        )
      );
    });
  } else if (vacio) el.appendChild(crear('p', 'mu', vacio));
}

function pintarDondeComer(id) {
  $('#he').hidden = id == 'resto';
  pintarSitiosComer(
    DONDE_COMER[id],
    'Salamanca',
    id == 'resto' ? '' : 'Ningún sitio con buena nota y bastantes opiniones en Gastroranking.'
  );
}

// Botones con las 4 zonas más cercanas
function pintarCercanas(z) {
  const nb = $('#nb');
  nb.textContent = '';
  if (z.id == 'resto') return;
  nb.append('Cerca: ');
  todasLasZonas
    .filter(q => q != z && q.id != 'resto')
    .map(q => [Math.hypot(q.x - z.x, q.y - z.y), q])
    .sort((a, b) => a[0] - b[0])
    .slice(0, 4)
    .forEach(([, q]) => {
      const b = crear('button', '', q.n);
      b.onclick = () => abrirFicha(q.id);
      nb.appendChild(b);
    });
}

// Botones de abajo: en una zona, He estado / Quiero ir / Compartir; en una vía o un monumento, solo Compartir
function modoBotonesFicha(modo) {
  document.querySelector('.bt').style.display = '';
  document.querySelectorAll('.bt button[data-s]').forEach(b => (b.hidden = modo != 'zona'));
}

function mostrarFicha() {
  document.querySelector('.sb').scrollTop = 0;
  ajustarVista();
  $('#sh').classList.add('o');
  $('#mn').classList.add('o');
  todasLasZonas.forEach(pintarZona);
}

function abrirFicha(id) {
  const z = buscarZona(id);
  zonaAbierta = id;
  olvidarMonumento();
  modoBotonesFicha('zona');
  mostrarAvisoAqui(id);
  $('#k').textContent = NOMBRES_GRUPOS[z.g];
  $('#nm').textContent = z.n;
  $('#hc').hidden = false;
  pintarMonumentosDeZona(z);
  pintarCuriosidades(z);
  pintarLeyendas(z);
  $('#ap').textContent =
    POSICION_EXACTA.has(id) || id == 'resto'
      ? ''
      : 'Posición aproximada: estimada, no de una coordenada exacta.';
  resaltarVia(null);
  pintarFoto(id);
  pintarDondeComer(id);
  pintarCercanas(z);
  // Acerca el mapa a la zona, según su tamaño (sin alejarlo si ya estaba más cerca)
  if (id != 'resto')
    centrarMapaEn(
      z.x,
      z.y,
      Math.min(vistaMapa.w, Math.max(16, Math.min(220, ((mapaSvg.clientWidth || 380) * z.cw) / 70)))
    );
  pintarBotonesFicha();
  mostrarFicha();
  enlaceFicha(id, z.n);
}

// INFO_VIAS[nombre] = [tipo, nombre largo, descripción]
function abrirFichaVia(nombre) {
  const [tipo, nombreLargo, descripcion] = INFO_VIAS[nombre];
  zonaAbierta = null;
  olvidarMonumento();
  $('#mz').hidden = true;
  $('#here').hidden = true;
  $('#k').textContent = tipo;
  $('#nm').textContent = nombre;
  $('#hc').hidden = $('#hl').hidden = $('#he').hidden = $('#ph').hidden = $('#pc').hidden = true;
  $('#eat').textContent = '';
  $('#nb').textContent = '';
  $('#ap').textContent = 'Trazado real de OpenStreetMap, simplificado.';
  $('#cu').textContent = nombreLargo;
  $('#ri').textContent = descripcion;
  modoBotonesFicha('via');
  resaltarVia(nombre);
  // Las avenidas se encuadran en el punto medio de su primer tramo
  const avenida = AVENIDAS.find(a => a[0] == nombre);
  if (avenida) {
    const tramo = avenida[2][0],
      [x, y] = proyectar(...tramo[tramo.length >> 1]);
    centrarMapaEn(x, y, Math.min(vistaMapa.w, 90));
  }
  mostrarFicha();
  enlaceFicha('via/' + slug(nombre), nombre);
}

// Marca o desmarca (si ya lo estaba) una zona del mapa con 'v' (He estado) o 'w' (Quiero ir)
function marcarZona(id, marca) {
  conAvisoDeLogros(() => {
    progreso.gv = progreso.gv || [];
    if (progreso.z[id] == marca) delete progreso.z[id];
    else {
      progreso.z[id] = marca;
      const conGps = ubicacionReciente() && ubicacion.id == id;
      if (marca == 'v' && conGps && !progreso.gv.includes(id)) progreso.gv.push(id);
      aviso(marca == 'v' ? (conGps ? '¡Vítor! Pisado con GPS' : '¡Vítor!') : 'Apuntada');
    }
    if (progreso.z[id] != 'v') progreso.gv = progreso.gv.filter(k => k != id);
    guardar();
    pintarZona(buscarZona(id));
    pintarBotonesFicha();
    mostrarAvisoAqui(id);
    actualizar();
  });
}

// En la ficha de un pueblo de la provincia (pueblos.js) los botones marcan el pueblo
const fichaDePueblo = () => typeof puebloAbierto != 'undefined' && puebloAbierto;

function pintarBotonesFicha() {
  const marca = fichaDePueblo() ? estadoMunicipio(puebloAbierto) : progreso.z[zonaAbierta];
  document
    .querySelectorAll('.bt button[data-s]')
    .forEach(b => b.classList.toggle('on', marca == b.dataset.s));
}

function cerrarFicha() {
  resaltarVia(null);
  zonaAbierta = null;
  olvidarMonumento();
  $('#sh').classList.remove('o');
  $('#mn').classList.remove('o');
  todasLasZonas.forEach(pintarZona);
  ajustarVista();
}

document.querySelectorAll('.bt button[data-s]').forEach(
  b =>
    (b.onclick = () => {
      if (fichaDePueblo()) {
        marcarMunicipio(puebloAbierto, b.dataset.s);
        pintarBotonesFicha();
      } else marcarZona(zonaAbierta, b.dataset.s);
    })
);
$('#x').onclick = () => {
  cerrarFicha();
  volverEnlace();
};
$('#cmp').onclick = () => compartir();
$('#rs').onclick = () => abrirFicha('resto');
