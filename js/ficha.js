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

// Sin leyendas, el apartado no se muestra
function pintarLeyendas(z) {
  $('#hl').hidden = !z.ly.length;
  pintarParrafos($('#ri'), z.ly);
}

function pintarFoto(id) {
  pintarFotoDe(FOTOS[id]);
}
// foto: [ruta, pie de foto con autor y licencia] (o nada)
function pintarFotoDe(foto) {
  $('#ph').hidden = $('#pc').hidden = !foto;
  if (!foto) return;
  $('#ph').src = foto[0];
  $('#ph').alt = foto[1].split('. Foto')[0];
  $('#pc').textContent = foto[1];
}

// sitios: [{ n, t, a, p, s }]; lugar: para buscarlos en Google Maps. Sin sitios, el apartado no se muestra.
function pintarSitiosComer(sitios, lugar) {
  const el = $('#eat');
  el.textContent = '';
  $('#he').hidden = !(sitios && sitios.length);
  if (sitios && sitios.length) {
    el.appendChild(
      crear(
        'p',
        'mu',
        'Para cuando preguntes «¿qué hay de comer?» y no quieras oír «canguingos y patas de peces».'
      )
    );
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
  }
}

function pintarDondeComer(id) {
  pintarSitiosComer(DONDE_COMER[id], 'Salamanca');
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

// Botones de abajo: en una zona, He estado / Quiero ir / Compartir; en un monumento o una parada de una
// ruta ('visita'), He estado aquí / Compartir (para los logros); en una ruta, La he hecho / La quiero hacer
// (rutaSeguida, ruta.js); en lo demás, solo Compartir
const TEXTOS_BOTONES = {
  zona: ['He estado', 'Quiero ir'],
  visita: ['He estado aquí', ''],
  ruta: ['La he hecho', 'La quiero hacer']
};
function modoBotonesFicha(modo) {
  if (modo != 'ruta' && typeof rutaSeguida != 'undefined') rutaSeguida = null;
  document.querySelector('.bt').style.display = '';
  const textos = TEXTOS_BOTONES[modo] || ['', ''];
  document.querySelectorAll('.bt button[data-s]').forEach(b => {
    const texto = textos[b.dataset.s == 'v' ? 0 : 1];
    b.hidden = !texto;
    if (texto) b.textContent = texto;
  });
  pintarBotonesFicha();
}

// Índice de la ficha de zona: un botón por apartado que lleva a él (en el móvil, agrandando la ficha)
let fichaConIndice = false;
const APARTADOS_FICHA = [
  ['#hc', 'Curiosidades'],
  ['#hl', 'Leyenda'],
  ['#he', 'Dónde comer'],
  ['#pch', 'Palabra charra']
];
function pintarIndiceFicha() {
  const indice = $('#idx'),
    apartados = APARTADOS_FICHA.filter(([sel]) => !$(sel).hidden || (sel == '#pch' && fichaConPalabra));
  indice.textContent = '';
  fichaConIndice = apartados.length > 1;
  apartados.forEach(([sel, texto]) => {
    const b = crear('button', '', texto);
    b.onclick = () => {
      if (!esEscritorio()) $('#sh').classList.add('grande');
      // Después de agrandar la ficha, para que el apartado quede arriba
      requestAnimationFrame(() => $(sel).scrollIntoView({ behavior: comoDesplazar(), block: 'start' }));
    };
    indice.appendChild(b);
  });
}

// Dónde estaba el foco antes de abrir la ficha, para devolverlo al cerrarla
let focoAntesDeFicha = null;

function mostrarFicha() {
  if (!$('#sh').classList.contains('o')) focoAntesDeFicha = document.activeElement;
  if (typeof juego != 'undefined' && juego.activo) salirJuego(); // abrir una ficha (p. ej. desde el buscador) deja el juego
  document.querySelector('.sb').scrollTop = 0;
  $('#sh').classList.remove('grande');
  // La palabra charra y el índice solo van en las fichas de zona (los pinta abrirFicha justo antes)
  $('#pch').hidden = !fichaConPalabra;
  $('#idx').hidden = !fichaConIndice;
  fichaConPalabra = fichaConIndice = false;
  // En el móvil, sube la página hasta el mapa para que se vea por encima del panel
  if (!esEscritorio() && pestana == 'map') {
    const arriba = document.querySelector('.mw').getBoundingClientRect().top;
    if (Math.abs(arriba - 8) > 4)
      window.scrollTo({ top: window.scrollY + arriba - 8, behavior: comoDesplazar() });
  }
  ajustarVista();
  $('#sh').classList.add('o');
  $('#mn').classList.add('o');
  todasLasZonas.forEach(pintarZona);
  // El foco va al título: un lector de pantalla empieza a leer la ficha por ahí
  $('#nm').focus({ preventScroll: true });
}

function abrirFicha(id) {
  const z = buscarZona(id);
  zonaAbierta = id;
  olvidarMonumento();
  modoBotonesFicha('zona');
  mostrarAvisoAqui(id);
  // Los pueblos del alfoz que salen en el mapa llevan sus habitantes (INE, con las pedanías; pueblos.js)
  const municipio = PROVINCIA.m.find(m => m.z == id && !m.cap);
  $('#k').textContent = NOMBRES_GRUPOS[z.g] + (municipio ? ' · ' + textoHabitantes(municipio) : '');
  $('#nm').textContent = z.n;
  if (id != 'resto' && typeof apuntarUso == 'function') apuntarUso('fl', id); // para los logros de lectura
  $('#otros').hidden = !z.otros.length;
  $('#otros').textContent = z.otros.length ? 'También: ' + z.otros.join(' · ') : '';
  $('#hc').hidden = false;
  pintarMonumentosDeZona(z);
  pintarCuriosidades(z);
  pintarLeyendas(z);
  pintarPalabraDeZona(z); // palabras.js
  $('#ap').textContent = [
    POSICION_EXACTA.has(id) || id == 'resto'
      ? ''
      : 'Posición aproximada: estimada, no de una coordenada exacta.',
    ZONAS_NO_OFICIALES.has(id) ? 'Su límite en el mapa es aproximado: no hay uno publicado.' : ''
  ]
    .filter(Boolean)
    .join(' ');
  resaltarVia(null);
  pintarFoto(id);
  if (typeof pintarNacimiento == 'function') pintarNacimiento(z); // tiempo.js
  pintarDondeComer(id);
  pintarCercanas(z);
  pintarIndiceFicha();
  // Acerca el mapa a la zona, según su tamaño (sin alejarlo si ya estaba más cerca). En el móvil,
  // además, que la zona quepa entera en el trozo de mapa que deja libre el panel.
  if (id != 'resto') {
    const W = tamMapa.w || 380,
      cabe = esEscritorio() ? 0 : (z.ch * W) / (0.7 * mapaVisiblePx());
    centrarMapaEn(
      z.x,
      z.y,
      Math.max(cabe, Math.min(vistaMapa.w, Math.max(16, Math.min(220, (W * z.cw) / 70))))
    );
  }
  pintarBotonesFicha();
  mostrarFicha();
  enlaceFicha(id, z.n);
}

// INFO_VIAS[nombre] = [tipo, nombre largo, descripción]
// tramo: en una avenida, el tramo que se ha pulsado en el mapa (se encuadra ese)
function abrirFichaVia(nombre, tramo = 0) {
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
  ponerEtiquetaAvenida(nombre, tramo);
  resaltarVia(nombre);
  // Las avenidas se encuadran en el punto medio del tramo pulsado (o del primero)
  const avenida = AVENIDAS.find(a => a[0] == nombre);
  if (avenida) {
    const P = avenida[2][tramo] || avenida[2][0],
      [x, y] = proyectar(...P[P.length >> 1]);
    centrarMapaEn(x, y, Math.min(vistaMapa.w, 90));
  }
  mostrarFicha();
  enlaceFicha('via/' + slug(nombre), nombre);
}

// Marca o desmarca (si ya lo estaba) una zona del mapa con 'v' (He estado) o 'w' (Quiero ir)
function marcarZona(id, marca) {
  conAvisoDeLogros(() => {
    progreso.gv = progreso.gv || [];
    if (progreso.z[id] == marca) {
      // Quitar una marca se puede deshacer (y con ella, si la tenía, la prueba de haberla pisado con GPS)
      const conGpsAntes = progreso.gv.includes(id);
      delete progreso.z[id];
      aviso(buscarZona(id).n + ': quitada de «' + (marca == 'v' ? 'He estado' : 'Quiero ir') + '»', {
        accion: ['Deshacer', () => recuperarMarca(id, marca, conGpsAntes)]
      });
    } else {
      progreso.z[id] = marca;
      const conGps = ubicacionReciente() && ubicacion.id == id;
      if (marca == 'v' && conGps && !progreso.gv.includes(id)) progreso.gv.push(id);
      // Con lo que queda para el logro de su zona del mapa («· 5 de 7 en Norte completo»)
      const falta = marca == 'v' ? progresoDeZona(buscarZona(id)) : '';
      aviso(
        (marca == 'v' ? (conGps ? '¡Vítor! Pisado con GPS' : '¡Vítor!') : 'Apuntada en «Quiero ir»') +
          (falta ? ' · ' + falta : ''),
        { tipo: 'exito' }
      );
      if (marca == 'v') animarVitor(buscarZona(id));
    }
    if (progreso.z[id] != 'v') progreso.gv = progreso.gv.filter(k => k != id);
    guardar();
    pintarZona(buscarZona(id));
    pintarBotonesFicha();
    mostrarAvisoAqui(id);
    actualizar();
  });
}

// «Deshacer» después de quitar una marca: la deja como estaba
function recuperarMarca(id, marca, conGps) {
  progreso.z[id] = marca;
  if (conGps && !progreso.gv.includes(id)) progreso.gv.push(id);
  guardar();
  pintarZona(buscarZona(id));
  pintarBotonesFicha();
  actualizar();
  aviso('Recuperada: ' + buscarZona(id).n, { tipo: 'exito' });
}

// En la ficha de un pueblo de la provincia (pueblos.js) los botones marcan el pueblo
const fichaDePueblo = () => typeof puebloAbierto != 'undefined' && puebloAbierto;

const fichaDeVisita = () => typeof visitaAbierta != 'undefined' && visitaAbierta;

function pintarBotonesFicha() {
  const marca =
    typeof rutaSeguida != 'undefined' && rutaSeguida
      ? estadoRuta(rutaSeguida)
      : fichaDeVisita()
        ? estaVisitada(visitaAbierta)
          ? 'v'
          : ''
        : fichaDePueblo()
          ? estadoMunicipio(puebloAbierto)
          : progreso.z[zonaAbierta];
  document
    .querySelectorAll('.bt button[data-s]')
    .forEach(b => b.classList.toggle('on', marca == b.dataset.s));
}

function cerrarFicha() {
  const volver = focoAntesDeFicha,
    focoEnFicha = $('#sh').contains(document.activeElement) || document.activeElement == document.body;
  focoAntesDeFicha = null;
  resaltarVia(null);
  zonaAbierta = null;
  olvidarMonumento();
  $('#sh').classList.remove('o');
  $('#mn').classList.remove('o');
  todasLasZonas.forEach(pintarZona);
  ajustarVista();
  // El foco vuelve a donde estaba (la zona del mapa, el buscador…), si sigue en la página
  if (focoEnFicha && volver && volver.isConnected && volver != document.body)
    volver.focus({ preventScroll: true });
}

document.querySelectorAll('.bt button[data-s]').forEach(
  b =>
    (b.onclick = () => {
      if (typeof rutaSeguida != 'undefined' && rutaSeguida) marcarRuta(rutaSeguida, b.dataset.s);
      else if (fichaDeVisita()) marcarVisita();
      else if (fichaDePueblo()) {
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

// Asa del panel en el móvil: tocarla o arrastrarla hacia arriba lo agranda; hacia abajo lo reduce o lo cierra
{
  const asa = $('#asa');
  let inicio = null;
  const alternar = () => $('#sh').classList.toggle('grande');
  asa.addEventListener('pointerdown', e => {
    inicio = e.clientY;
    asa.setPointerCapture(e.pointerId);
  });
  asa.addEventListener('pointerup', e => {
    if (inicio === null) return;
    const dy = e.clientY - inicio;
    inicio = null;
    const sh = $('#sh');
    if (Math.abs(dy) < 8) alternar();
    else if (dy < 0) sh.classList.add('grande');
    else if (sh.classList.contains('grande')) sh.classList.remove('grande');
    else $('#x').click();
  });
  asa.addEventListener('keydown', e => {
    if (e.key == 'Enter' || e.key == ' ') {
      e.preventDefault();
      alternar();
    }
  });
}
