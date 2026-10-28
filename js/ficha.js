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

// sitios: [{ n, t, a, p, s }]; lugar: para buscarlos en Google Maps. Van en una línea plegada «Dónde comer · N»,
// como monumentos y rutas: lo principal de la ficha son las curiosidades. Sin sitios, no se muestra.
function pintarSitiosComer(sitios, lugar) {
  const el = $('#eat');
  el.textContent = '';
  if (sitios && sitios.length) {
    const contenido = crear(
      'div',
      'plegable-c',
      crear(
        'p',
        'mu',
        'Para cuando preguntes «¿qué hay de comer?» y no quieras oír «canguingos y patas de peces».'
      )
    );
    el.appendChild(
      crear(
        'details',
        'plegable',
        crear(
          'summary',
          '',
          crear('span', 'rel-t', 'Dónde comer'),
          crear('span', 'plegable-n', String(sitios.length))
        ),
        contenido
      )
    );
    sitios.forEach(s => {
      const mapa = crear('a', '', 'Ver en Google Maps');
      mapa.href =
        'https://www.google.com/maps/search/?api=1&query=' +
        encodeURIComponent(s.n + ' ' + s.a + ' ' + lugar);
      mapa.target = '_blank';
      mapa.rel = 'noopener';
      contenido.appendChild(
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

// --- Para seguir explorando: lo relacionado con la ficha, sacado de los datos que ya hay -------------
// filas: [[título, [{ texto, detalle, icono, hecho, abrir }]]]. Las filas vacías no salen; sin «abrir», el
// elemento es solo texto. «hecho»: ya visitado o hecho (✓, también para el lector de pantalla).
// plegadas: cada fila es una línea que se despliega (en las fichas de zona, para que no tapen lo principal)
function pintarRelacionados(filas, plegadas = false) {
  const caja = $('#rel');
  caja.textContent = '';
  const conAlgo = filas.filter(([, items]) => items.length);
  caja.hidden = !conAlgo.length;
  conAlgo.forEach(([titulo, items]) => {
    const elementos = items.map(elementoRelacionado);
    caja.appendChild(
      plegadas
        ? filaPlegable(titulo, elementos, items.filter(it => it.hecho).length, 'rel-fila')
        : crear('div', 'nb rel-fila', crear('span', 'rel-t', titulo + ':'), ...elementos)
    );
  });
}

function elementoRelacionado(it) {
  const e = crear(
    it.abrir ? 'button' : 'span',
    it.abrir ? (it.icono ? 'conico' : '') : 'rel-etq',
    it.icono || '',
    it.texto,
    it.detalle ? crear('small', '', ' · ' + it.detalle) : null,
    it.hecho ? crear('span', 'rel-hecho', ' ✓') : null
  );
  if (it.hecho) e.title = 'Ya has estado';
  if (it.abrir) {
    e.onclick = it.abrir;
    e.setAttribute(
      'aria-label',
      [it.texto, it.detalle, it.hecho ? 'ya has estado' : ''].filter(Boolean).join(', ')
    );
  }
  return e;
}

// Una línea «Título · cuántos (✓ hechos)» que se despliega para enseñar sus botones, cerrada de entrada
function filaPlegable(titulo, elementos, hechos = 0, clase = '') {
  return crear(
    'details',
    ('plegable ' + clase).trim(),
    crear(
      'summary',
      '',
      crear('span', 'rel-t', titulo),
      crear('span', 'plegable-n', String(elementos.length)),
      hechos ? crear('span', 'plegable-hechos', hechos + ' ✓') : null
    ),
    crear('div', 'nb plegable-c', ...elementos)
  );
}

// Zona del mapa que contiene un punto, solo si cae dentro de un límite dibujado (sin aproximar por cercanía)
const zonaDePunto = (la, lo) =>
  Object.keys(LIMITES_BARRIOS).find(id => dentroDePoligono(LIMITES_BARRIOS[id], la, lo)) || null;

// Rutas a pie con alguna parada en la zona (monumentos de la zona o sitios propios dentro de su límite)
function rutasDeZona(z) {
  return RUTAS.map((r, k) => {
    const aqui = r.paradas.filter(p =>
      typeof p == 'string' ? buscarMonumento(p).zona == z.id : zonaDePunto(p.la, p.lo) == z.id
    ).length;
    return { r, k, aqui };
  }).filter(x => x.aqui);
}

// Centro aproximado de un anillo de coordenadas [la, lo] (media de sus puntos)
const centroDe = P => [
  P.reduce((s, q) => s + q[0], 0) / P.length,
  P.reduce((s, q) => s + q[1], 0) / P.length
];

// Parques con nombre (parques.js) cuyo centro cae dentro del límite de la zona, de mayor a menor
function parquesDeZona(z) {
  if (!LIMITES_BARRIOS[z.id]) return [];
  return PARQUES.filter(pq => {
    const R = pq.R[0],
      P = [];
    for (let i = 0; i < R.length; i += 2) P.push([R[i], R[i + 1]]);
    const [la, lo] = centroDe(P);
    return dentroDePoligono(LIMITES_BARRIOS[z.id], la, lo);
  }).sort((a, b) => b.ha - a.ha);
}

function relacionadosDeZona(z) {
  return [
    [
      'Rutas a pie que pasan por aquí',
      rutasDeZona(z).map(({ r, k, aqui }) => ({
        icono: r.icono + ' ',
        texto: r.nombre,
        detalle: aqui == 1 ? '1 parada aquí' : aqui + ' paradas aquí',
        hecho: estadoRuta(r.id) == 'v',
        abrir: () => abrirRuta(k)
      }))
    ],
    ['Parques', parquesDeZona(z).map(pq => ({ texto: '🌳 ' + pq.n, detalle: conMiles(pq.ha) + ' ha' }))],
    filaDesaparecidosDeZona(z) // desaparecida.js
  ];
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
  if (modo != 'ruta' && typeof estadoApp.rutaSeguida != 'undefined') estadoApp.rutaSeguida = null;
  document.querySelector('.bt').style.display = '';
  const textos = TEXTOS_BOTONES[modo] || ['', ''];
  // Si solo queda el botón de compartir, lleva también su texto (un icono suelto se entiende peor)
  document.querySelector('.bt').classList.toggle('solo-compartir', !textos[0] && !textos[1]);
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
  ['#demo', 'Población'],
  ['#hc', 'Curiosidades'],
  ['#hl', 'Leyenda'],
  ['#pch', 'Palabra charra']
];
function pintarIndiceFicha() {
  const indice = $('#idx'),
    apartados = APARTADOS_FICHA.filter(([sel]) =>
      sel == '#demo'
        ? estadoApp.fichaConDemografia
        : !$(sel).hidden || (sel == '#pch' && estadoApp.fichaConPalabra)
    );
  indice.textContent = '';
  fichaConIndice = apartados.length > 1;
  apartados.forEach(([sel, texto]) => {
    const b = crear('button', '', texto);
    b.onclick = () => irAApartado(sel);
    indice.appendChild(b);
  });
}

// Lleva a un apartado de la ficha abierta (en el móvil, agrandándola antes para que quede arriba)
function irAApartado(sel, agrandar = true) {
  if (agrandar && !esEscritorio()) $('#sh').classList.add('grande');
  requestAnimationFrame(() => $(sel).scrollIntoView({ behavior: comoDesplazar(), block: 'start' }));
}

// Abre la línea plegada «Dónde comer» de la ficha abierta y lleva hasta ella (desde Explora → Dónde comer)
function irADondeComer(agrandar = false) {
  const fila = $('#eat .plegable');
  if (!fila) return;
  fila.open = true;
  irAApartado('#eat', agrandar);
}

// Dónde estaba el foco antes de abrir la ficha, para devolverlo al cerrarla
let focoAntesDeFicha = null;

function mostrarFicha() {
  if (!$('#sh').classList.contains('o')) focoAntesDeFicha = document.activeElement;
  if (typeof juego != 'undefined' && juego.activo) salirJuego(); // abrir una ficha (p. ej. desde el buscador) deja el juego
  document.querySelector('.sb').scrollTop = 0;
  // Con la pantalla baja (móvil en horizontal, zoom al 200 %) la ficha se abre grande: si no, se leen dos líneas
  $('#sh').classList.toggle('grande', !esEscritorio() && (innerHeight < 520 || estadoApp.fichaAlta));
  estadoApp.fichaAlta = false;
  // La palabra charra y el índice solo van en las fichas de zona (los pinta abrirFicha justo antes)
  $('#pch').hidden = !estadoApp.fichaConPalabra;
  $('#idx').hidden = !fichaConIndice;
  estadoApp.fichaConPalabra = fichaConIndice = false;
  $('#volverhoy').hidden = !estadoApp.fichaDesdeHoy;
  $('#culf').hidden = !estadoApp.fichaConCultura;
  estadoApp.fichaConCultura = false;
  $('#demo').hidden = !estadoApp.fichaConDemografia;
  estadoApp.fichaConDemografia = false;
  // En las fichas de zona, monumentos, cultura y lo relacionado van abajo, tras lo principal (curiosidades,
  // leyenda y dónde comer); en las demás, arriba, donde son lo principal
  const extras = [$('#mz'), $('#culf'), $('#rel')];
  if (estadoApp.fichaConExtrasAbajo) $('#nb').before(...extras);
  else $('#demo').before(...extras);
  estadoApp.fichaConExtrasAbajo = false;
  // En el móvil, sube la página hasta el mapa (el de la provincia en su pestaña) para que se vea por encima del panel
  const mapaVisible = { map: '.mw', prov: '#pm' }[estadoApp.pestana];
  if (!esEscritorio() && mapaVisible && document.querySelector(mapaVisible)) {
    const arriba = document.querySelector(mapaVisible).getBoundingClientRect().top;
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
  estadoApp.zonaAbierta = id;
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
  pintarCulturaEnFicha(culturaDeZona(z), true);
  pintarRelacionados(relacionadosDeZona(z), true);
  estadoApp.fichaConExtrasAbajo = true;
  // Pueblos de alrededor: evolución de la población de su municipio (pueblos.js)
  if (municipio && typeof pintarDemografia == 'function') pintarDemografia(municipio);
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
  estadoApp.zonaAbierta = null;
  olvidarMonumento();
  $('#mz').hidden = true;
  $('#here').hidden = true;
  $('#k').textContent = tipo;
  $('#nm').textContent = nombre;
  $('#hc').hidden = $('#hl').hidden = $('#ph').hidden = $('#pc').hidden = true;
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
  apuntarTarea('marca'); // medicion.js
  conAvisoDeLogros(() => {
    estadoApp.progreso.gv = estadoApp.progreso.gv || [];
    if (estadoApp.progreso.z[id] == marca) {
      // Quitar una marca se puede deshacer (y con ella, si la tenía, la prueba de haberla pisado con GPS)
      const conGpsAntes = estadoApp.progreso.gv.includes(id);
      delete estadoApp.progreso.z[id];
      aviso(buscarZona(id).n + ': quitada de «' + (marca == 'v' ? 'He estado' : 'Quiero ir') + '»', {
        accion: ['Deshacer', () => recuperarMarca(id, marca, conGpsAntes)]
      });
    } else {
      estadoApp.progreso.z[id] = marca;
      const conGps = ubicacionReciente() && ubicacion.id == id;
      if (marca == 'v' && conGps && !estadoApp.progreso.gv.includes(id)) estadoApp.progreso.gv.push(id);
      // Con lo que queda para el logro de su zona del mapa («· 5 de 7 en Norte completo»)
      const falta = marca == 'v' ? progresoDeZona(buscarZona(id)) : '';
      aviso(
        (marca == 'v' ? (conGps ? '¡Vítor! Pisado con GPS' : '¡Vítor!') : 'Apuntada en «Quiero ir»') +
          (falta ? ' · ' + falta : ''),
        { tipo: 'exito' }
      );
      if (marca == 'v') animarVitor(buscarZona(id));
    }
    if (estadoApp.progreso.z[id] != 'v') estadoApp.progreso.gv = estadoApp.progreso.gv.filter(k => k != id);
    guardar();
    pintarZona(buscarZona(id));
    pintarBotonesFicha();
    mostrarAvisoAqui(id);
    actualizar();
  });
}

// «Deshacer» después de quitar una marca: la deja como estaba
function recuperarMarca(id, marca, conGps) {
  estadoApp.progreso.z[id] = marca;
  if (conGps && !estadoApp.progreso.gv.includes(id)) estadoApp.progreso.gv.push(id);
  guardar();
  pintarZona(buscarZona(id));
  pintarBotonesFicha();
  actualizar();
  aviso('Recuperada: ' + buscarZona(id).n, { tipo: 'exito' });
}

// En la ficha de un pueblo de la provincia (pueblos.js) los botones marcan el pueblo
const fichaDePueblo = () => typeof estadoApp.puebloAbierto != 'undefined' && estadoApp.puebloAbierto;

const fichaDeVisita = () => typeof estadoApp.visitaAbierta != 'undefined' && estadoApp.visitaAbierta;

function pintarBotonesFicha() {
  const marca =
    typeof estadoApp.rutaSeguida != 'undefined' && estadoApp.rutaSeguida
      ? estadoRuta(estadoApp.rutaSeguida)
      : fichaDeVisita()
        ? estaVisitada(estadoApp.visitaAbierta)
          ? 'v'
          : ''
        : fichaDePueblo()
          ? estadoMunicipio(estadoApp.puebloAbierto)
          : estadoApp.progreso.z[estadoApp.zonaAbierta];
  document.querySelectorAll('.bt button[data-s]').forEach(b => marcarInterruptor(b, marca == b.dataset.s));
}

function cerrarFicha() {
  const volver = focoAntesDeFicha,
    focoEnFicha = $('#sh').contains(document.activeElement) || document.activeElement == document.body;
  focoAntesDeFicha = null;
  resaltarVia(null);
  estadoApp.zonaAbierta = null;
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
      if (typeof estadoApp.rutaSeguida != 'undefined' && estadoApp.rutaSeguida)
        marcarRuta(estadoApp.rutaSeguida, b.dataset.s);
      else if (fichaDeVisita()) marcarVisita();
      else if (fichaDePueblo()) {
        marcarMunicipio(estadoApp.puebloAbierto, b.dataset.s);
        pintarBotonesFicha();
      } else marcarZona(estadoApp.zonaAbierta, b.dataset.s);
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
