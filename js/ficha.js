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
  else pintarParrafos($('#ri'), [z.id == 'resto' ? '' : 'Aún sin leyenda: la iremos recopilando.'], 'mu');
}

function pintarFoto(id) {
  const foto = FOTOS[id]; // [ruta, pie de foto con autor y licencia]
  $('#ph').hidden = $('#pc').hidden = !foto;
  if (!foto) return;
  $('#ph').src = foto[0];
  $('#ph').alt = foto[1].split('. Foto')[0];
  $('#pc').textContent = foto[1];
}

function pintarDondeComer(id) {
  const el = $('#eat'),
    sitios = DONDE_COMER[id];
  el.textContent = '';
  $('#he').hidden = id == 'resto';
  if (sitios && sitios.length) {
    sitios.forEach(s => {
      const mapa = crear('a', '', 'Ver en Google Maps');
      mapa.href =
        'https://www.google.com/maps/search/?api=1&query=' +
        encodeURIComponent(s.n + ' ' + s.a + ' Salamanca');
      mapa.target = '_blank';
      mapa.rel = 'noopener';
      el.appendChild(
        crear(
          'div',
          'er',
          crear('b', '', s.n),
          ' · ' + s.t,
          crear('p', '', s.a + '. ' + s.p + ' Fuente: ' + s.s + '.'),
          mapa
        )
      );
    });
  } else if (id != 'resto') {
    el.appendChild(crear('p', 'mu', 'Aún sin recomendación para este barrio.'));
  }
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

function mostrarFicha() {
  ajustarVista();
  $('#sh').classList.add('o');
  $('#mn').classList.add('o');
  todasLasZonas.forEach(pintarZona);
}

function abrirFicha(id) {
  const z = buscarZona(id);
  zonaAbierta = id;
  document.querySelector('.bt').style.display = '';
  mostrarAvisoAqui(id);
  $('#k').textContent = NOMBRES_GRUPOS[z.g];
  $('#nm').textContent = z.n;
  $('#hc').hidden = false;
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
  $('#here').hidden = true;
  $('#k').textContent = tipo;
  $('#nm').textContent = nombre;
  $('#hc').hidden = $('#hl').hidden = $('#he').hidden = $('#ph').hidden = $('#pc').hidden = true;
  $('#eat').textContent = '';
  $('#nb').textContent = '';
  $('#ap').textContent = 'Trazado real de OpenStreetMap, simplificado.';
  $('#cu').textContent = nombreLargo;
  $('#ri').textContent = descripcion;
  document.querySelector('.bt').style.display = 'none';
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

function pintarBotonesFicha() {
  document
    .querySelectorAll('.bt button[data-s]')
    .forEach(b => b.classList.toggle('on', progreso.z[zonaAbierta] == b.dataset.s));
}

function cerrarFicha() {
  resaltarVia(null);
  zonaAbierta = null;
  $('#sh').classList.remove('o');
  $('#mn').classList.remove('o');
  todasLasZonas.forEach(pintarZona);
  ajustarVista();
}

document
  .querySelectorAll('.bt button[data-s]')
  .forEach(b => (b.onclick = () => marcarZona(zonaAbierta, b.dataset.s)));
$('#x').onclick = () => {
  cerrarFicha();
  volverEnlace();
};
$('#cmp').onclick = () => compartir();
$('#rs').onclick = () => abrirFicha('resto');
