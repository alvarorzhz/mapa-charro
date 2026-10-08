// Salamanca en el tiempo: con el botón de la leyenda, el mapa va de etapa en etapa
// (datos en js/datos/tiempo.js). Cada zona se pinta según cuándo aparece: ya existía (sepia),
// nace en esta etapa (dorado), aún no existe (apagada) o sin fecha documentada todavía (rayada).
// La cerca nueva se dibuja desde que se levanta y, tras su derribo, queda como un rastro discontinuo.
// Mientras dura, las marcas de «He estado» y «Quiero ir» no se ven (estilos.css, body.tiempo): al
// salir vuelven tal cual, porque no se tocan.

let etapaTiempo = -1; // etapa a la vista, o -1 si el modo está apagado
let temporizadorTiempo = 0;

// Trama de las zonas sin fecha todavía
{
  const t = crearSvg(
    'pattern',
    { id: 'tnd', width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' },
    mapaSvg.querySelector('defs')
  );
  crearSvg('rect', { width: 6, height: 6, style: 'fill:var(--map)' }, t);
  crearSvg('rect', { width: 1.6, height: 6, style: 'fill:var(--ink);opacity:.28' }, t);
}

// --- Capa de la muralla -------------------------------------------------------
const capaMuralla = crearSvg('g', {
  id: 'mur',
  'aria-hidden': 'true',
  style: 'pointer-events:none;display:none'
});
mapaSvg.insertBefore(capaMuralla, $('#rl'));
const trazoMuralla = 'M' + MURALLA.anillo.map(q => puntoTexto(proyectar(q[0], q[1]))).join('L') + 'Z';
crearSvg('path', { d: trazoMuralla, class: 'mur-base', 'vector-effect': 'non-scaling-stroke' }, capaMuralla);
crearSvg(
  'path',
  { d: trazoMuralla, class: 'mur-almenas', 'vector-effect': 'non-scaling-stroke' },
  capaMuralla
);
const puertasMuralla = MURALLA.puertas.map(([nombre, la, lo, aproximada]) => {
  const [x, y] = proyectar(la, lo),
    g = crearSvg('g', { class: 'mur-puerta' }, capaMuralla);
  crearSvg('rect', { x: -5, y: -5, width: 10, height: 10, rx: 2 }, g);
  const t = crearSvg('text', { y: -9, 'text-anchor': 'middle' }, g);
  t.textContent =
    nombre.replace(/^Puerta (de |del )?/, '').replace(/^\w/, l => l.toUpperCase()) + (aproximada ? ' ≈' : '');
  crearSvg('title', {}, g).textContent = nombre + (aproximada ? ' (posición aproximada)' : '');
  return { g, t, x, y };
});

// Llamada desde recolocarSegunZoom: puertas a tamaño fijo en pantalla
function colocarTiempo(u) {
  if (etapaTiempo < 0) return;
  // Los nombres, solo de cerca: alejado, once nombres sobre el casco se amontonan
  const nombres = vistaMapa.w <= 70;
  puertasMuralla.forEach(p => {
    p.g.setAttribute('transform', escalaFija(p.x, p.y, u));
    p.t.style.display = nombres ? '' : 'none';
  });
}

// --- Pintar una etapa ----------------------------------------------------------
function pintarEtapa(i) {
  etapaTiempo = i;
  document.body.classList.add('tiempo');
  zonas.forEach(z => {
    const e = EPOCA_ZONA[z.id],
      estado = !e ? (i == ETAPAS.length - 1 ? 'ya' : 'nd') : e[0] < i ? 'ya' : e[0] == i ? 'nueva' : 'no';
    z.e.dataset.ep = estado; // atributo y no clase: pintarZona reescribe las clases
    [z.tx, z.tx2].forEach(t => t && t.classList.toggle('ep-no', estado == 'no'));
  });
  const levantada = i >= MURALLA.levantada;
  capaMuralla.style.display = levantada ? '' : 'none';
  capaMuralla.classList.toggle('derribada', i >= MURALLA.derribada);
  colocarTiempo(ultimaEscala || vistaMapa.w / (tamMapa.w || 380));
  pintarPanelTiempo(i);
  // Cada etapa tiene su enlace (#tiempo/1 … #tiempo/7); al cambiar de etapa se sustituye, sin llenar el historial
  if ($('#sh').classList.contains('o') && hashActual().split('/')[0] == 'tiempo') {
    nombreFicha = 'Salamanca en el tiempo: ' + ETAPAS[i][1];
    ponerTitulo();
    escribirHash(hashEtapa(i), false);
  }
}
const hashEtapa = i => 'tiempo/' + (i + 1);

function pintarPanelTiempo(i) {
  const [anio, nombre, texto, hitos, fuentes] = ETAPAS[i],
    nacen = zonas.filter(z => EPOCA_ZONA[z.id] && EPOCA_ZONA[z.id][0] == i);
  $('#k').textContent = 'Salamanca en el tiempo';
  $('#nm').textContent = nombre;
  const caja = $('#info');
  caja.textContent = '';
  caja.hidden = false;
  const barra = crear('input');
  barra.type = 'range';
  barra.min = 0;
  barra.max = ETAPAS.length - 1;
  barra.value = i;
  barra.className = 'tbarra';
  barra.setAttribute('aria-label', 'Etapa');
  barra.setAttribute('aria-valuetext', anio + ': ' + nombre);
  barra.oninput = () => {
    pararReproduccion();
    pintarEtapa(+barra.value);
    $('#info .tbarra').focus();
  };
  const reproducir = crear('button', 'tplay', temporizadorTiempo ? '⏸' : '▶');
  reproducir.setAttribute('aria-label', temporizadorTiempo ? 'Pausar' : 'Reproducir las etapas');
  reproducir.onclick = () => (temporizadorTiempo ? pararReproduccion() : reproducirEtapas());
  caja.append(
    crear('p', 'tanio', anio),
    crear('div', 'tfila', reproducir, barra),
    crear(
      'div',
      'tmarcas',
      ...ETAPAS.map((e, k) => {
        const b = crear('button', k == i ? 'on' : '', e[0]);
        b.onclick = () => {
          pararReproduccion();
          pintarEtapa(k);
        };
        return b;
      })
    ),
    crear('p', 'curio', texto),
    ...hitos.map(h => crear('p', 'curio mas', h))
  );
  if (nacen.length)
    caja.appendChild(
      crear(
        'p',
        'tnacen',
        crear('b', '', 'Aparecen ahora: '),
        nacen.map(z => z.n + ' (' + EPOCA_ZONA[z.id][1].toLowerCase() + ')').join(' · ')
      )
    );
  caja.appendChild(
    crear(
      'div',
      'tleyenda',
      crear('span', 'ya', 'Ya existía'),
      crear('span', 'nueva', 'Nace ahora'),
      crear('span', 'no', 'Aún no'),
      crear('span', 'nd', 'Sin fecha todavía')
    )
  );
  caja.appendChild(
    crear(
      'p',
      'mu',
      'Las zonas rayadas aún no tienen una fecha documentada. La muralla sigue los paseos que ocuparon su sitio, así que su trazado es aproximado; las puertas van donde las sitúan las fuentes (≈: aproximada). Acerca el mapa para ver sus nombres.'
    )
  );
  // Fuentes de la etapa y de las zonas que aparecen en ella (las demás, en la ficha de cada zona)
  const todas = [...fuentes];
  nacen.forEach(z => {
    const f = EPOCA_ZONA[z.id][2];
    if (f && !todas.some(o => o[1] == f[1])) todas.push(f);
  });
  const ap = $('#ap');
  ap.textContent = todas.length ? 'Fuentes: ' : 'Datos de las fichas de cada zona.';
  todas.forEach(([n, url], k) => {
    const a = crear('a', '', n);
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    ap.append(k ? ' · ' : '', a);
  });
}

function reproducirEtapas() {
  if (etapaTiempo >= ETAPAS.length - 1) pintarEtapa(0);
  const avanzar = () => {
    if (etapaTiempo >= ETAPAS.length - 1) return pararReproduccion();
    pintarEtapa(etapaTiempo + 1);
    temporizadorTiempo = setTimeout(avanzar, 2600);
  };
  temporizadorTiempo = setTimeout(avanzar, 1600);
  pintarPanelTiempo(etapaTiempo);
}
function pararReproduccion() {
  clearTimeout(temporizadorTiempo);
  temporizadorTiempo = 0;
  if (etapaTiempo >= 0) pintarPanelTiempo(etapaTiempo);
}

// --- «Nació en…» en la ficha de cada zona -----------------------------------------
function pintarNacimiento(z) {
  const caja = $('#nac'),
    e = EPOCA_ZONA[z.id];
  caja.textContent = '';
  caja.hidden = z.id == 'resto';
  if (caja.hidden) return;
  const ver = crear(
    'button',
    'enlace',
    e ? 'Verlo en «Salamanca en el tiempo»' : 'Ver «Salamanca en el tiempo»'
  );
  ver.onclick = () => abrirTiempo(e ? e[0] : 0);
  if (!e) {
    caja.append(crear('b', '', 'Nació: '), 'su fecha aún no está documentada. ', ver);
    return;
  }
  const [etapa, motivo, fuente] = e,
    [anio, nombre] = ETAPAS[etapa];
  caja.append(crear('b', '', 'Nació: '), anio + ', en la etapa «' + nombre + '». ' + motivo + '. ');
  if (fuente) {
    const a = crear('a', '', 'Fuente: ' + fuente[0]);
    a.href = fuente[1];
    a.target = '_blank';
    a.rel = 'noopener';
    caja.append(a, ' ');
  }
  caja.append(ver);
}

// --- Abrir y salir -------------------------------------------------------------
function abrirTiempo(i = 0) {
  zonaAbierta = null;
  olvidarMonumento();
  resaltarVia(null);
  $('#here').hidden = true;
  $('#hc').hidden = $('#hl').hidden = $('#he').hidden = $('#mz').hidden = true;
  $('#cu').textContent = $('#ri').textContent = $('#eat').textContent = $('#nb').textContent = '';
  pintarFoto(null);
  modoBotonesFicha('monumento');
  // La ciudad entera a la vista
  centrarMapaEn(209, 292, esEscritorio() ? 150 : 120);
  pintarEtapa(i);
  $('#tm').classList.add('on');
  $('#tm').setAttribute('aria-pressed', 'true');
  mostrarFicha();
  enlaceFicha(hashEtapa(i), 'Salamanca en el tiempo: ' + ETAPAS[i][1]);
}

// Al abrir otra ficha o cerrar (olvidarMonumento lo llama): el mapa vuelve a ser el de hoy
function salirTiempo() {
  if (etapaTiempo < 0) return;
  clearTimeout(temporizadorTiempo);
  temporizadorTiempo = 0;
  etapaTiempo = -1;
  document.body.classList.remove('tiempo');
  capaMuralla.style.display = 'none';
  zonas.forEach(z => {
    delete z.e.dataset.ep;
    [z.tx, z.tx2].forEach(t => t && t.classList.remove('ep-no'));
  });
  $('#tm').classList.remove('on');
  $('#tm').setAttribute('aria-pressed', 'false');
}

$('#tm').onclick = () => (etapaTiempo >= 0 ? $('#x').click() : abrirTiempo());
