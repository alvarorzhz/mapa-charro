// Pestaña Provincia: municipios, pedanías, minimapa, comarcas y buscador

// Marca de un municipio (los del alfoz que están en el mapa usan la de su zona) o de una clave
const estadoMunicipio = m => (m.z ? progreso.z[m.z] : (progreso.p || {})[m.k]);
const estadoClave = k => (progreso.p || {})[k];
const tienePedaniaPisada = m => m.P.some(p => estadoClave(p.k) == 'v');

let filtroProvincia = 'all';
let puebloSeleccionado = null;
// Se construye la primera vez que se abre la pestaña:
//   { filas: [{ botones, el, grupo }], caminos: Map(municipio -> path), comarcas: [...], filtros, botonesSeleccion, encuadrar(m) }
let vistaProvincia = null;

// Marca o desmarca un pueblo (m<INE>) o una pedanía (p<INE>:<slug>). Pisar cualquiera marca también «Resto de la provincia».
function marcarEnProvincia(clave, marca, nombre) {
  conAvisoDeLogros(() => {
    progreso.p = progreso.p || {};
    progreso.gv = progreso.gv || [];
    if (progreso.p[clave] == marca) {
      const conGpsAntes = progreso.gv.includes(clave);
      delete progreso.p[clave];
      aviso(nombre + ': quitado de «' + (marca == 'v' ? 'He estado' : 'Quiero ir') + '»', {
        accion: [
          'Deshacer',
          () => {
            progreso.p[clave] = marca;
            if (conGpsAntes && !progreso.gv.includes(clave)) progreso.gv.push(clave);
            guardar();
            actualizar();
            if (typeof pintarBotonesFicha == 'function') pintarBotonesFicha();
            aviso('Recuperado: ' + nombre, { tipo: 'exito' });
          }
        ]
      });
    } else {
      progreso.p[clave] = marca;
      // Con GPS si estás en ese municipio (o en el municipio de esa pedanía)
      const conGps =
        ubicacionReciente() &&
        ubicacion.pid &&
        (ubicacion.pid == clave || clave.startsWith('p' + ubicacion.pid.slice(1) + ':'));
      if (marca == 'v' && conGps && !progreso.gv.includes(clave)) progreso.gv.push(clave);
      if (marca == 'v' && progreso.z.resto != 'v') {
        progreso.z.resto = 'v';
        pintarZona(zonaResto);
      }
      aviso(
        marca == 'v'
          ? conGps
            ? '¡Vítor! ' + nombre + ', con GPS'
            : '¡Vítor! ' + nombre
          : nombre + ': apuntado en «Quiero ir»',
        { tipo: 'exito' }
      );
    }
    if (progreso.p[clave] != 'v') progreso.gv = progreso.gv.filter(x => x != clave);
    guardar();
    actualizar();
  });
}

function marcarMunicipio(m, marca) {
  if (m.z) {
    marcarZona(m.z, marca);
    actualizarProvincia();
  } else marcarEnProvincia(m.k, marca, m.n);
}

// Pareja de botones He estado / Quiero ir. leer() da la marca actual; marcar(marca) la cambia.
function crearBotonesMarcar(leer, marcar, nombre) {
  const caja = crear('span', 'qb');
  ESTADOS_MARCA.forEach(([marca, texto]) => {
    const b = crear('button', 'q', texto);
    b.dataset.s = marca;
    if (nombre) b.setAttribute('aria-label', texto + ': ' + nombre); // si no, el lector oye «He estado» 400 veces
    b.onclick = e => {
      e.stopPropagation();
      marcar(marca);
    };
    caja.appendChild(b);
  });
  caja._leer = leer;
  return caja;
}
function pintarBotonesMarcar(caja) {
  const marca = caja._leer();
  caja.querySelectorAll('.q').forEach(b => {
    b.className = 'q' + (marca == b.dataset.s ? ' on ' + marca : '');
    b.setAttribute('aria-pressed', marca == b.dataset.s);
  });
}
const botonesMunicipio = m =>
  crearBotonesMarcar(
    () => estadoMunicipio(m),
    marca => marcarMunicipio(m, marca),
    m.n
  );
const botonesPedania = p =>
  crearBotonesMarcar(
    () => estadoClave(p.k),
    marca => marcarEnProvincia(p.k, marca, p.n),
    p.n
  );

// --- Construcción de la pestaña ---------------------------------------------

// Minimapa de municipios con zoom y arrastre. Devuelve { caminos, encuadrar(m) }.
// Autovías, nacionales y la CL-517 (datos/carreteras-provincia.js) en una capa «capa» de un mapa de la
// provincia con la proyección aLienzo. Devuelve una función que pone los escudos (A-62…) a la escala «f»,
// para que no crezcan al acercar el mapa.
function pintarCarreterasProvincia(capa, aLienzo) {
  const linea = l =>
    'M' +
    decodificarLinde(l)
      .map(q =>
        aLienzo(q)
          .map(v => v.toFixed(2))
          .join(' ')
      )
      .join('L');
  const orden = [...CARRETERAS_PROVINCIA].sort((a, b) => 'cna'.indexOf(a.t) - 'cna'.indexOf(b.t)),
    caminos = orden.map(c => c.l.map(linea).join(''));
  // Primero todos los bordes y luego los trazos, para que los cruces queden limpios
  orden.forEach((c, i) => crearSvg('path', { d: caminos[i], class: 'pmv-b ' + c.t }, capa));
  orden.forEach((c, i) => crearSvg('path', { d: caminos[i], class: 'pmv-t ' + c.t }, capa));
  // Un escudo por carretera, a mitad de su tramo más largo
  const escudos = orden.map(c => {
    const P = c.l.map(decodificarLinde).sort((a, b) => b.length - a.length)[0],
      [x, y] = aLienzo(P[Math.floor(P.length / 2)]),
      g = crearSvg('g', { class: 'pmv-e ' + c.t }, capa),
      w = c.ref.length * 5.4 + 8;
    crearSvg('rect', { x: -w / 2, y: -7, width: w, height: 14, rx: 3 }, g);
    crearSvg('text', { y: 3.3, 'text-anchor': 'middle' }, g).textContent = c.ref;
    crearSvg('title', {}, g).textContent = c.ref + ': ' + c.n;
    return { g, x, y };
  });
  return f =>
    escudos.forEach(({ g, x, y }) =>
      g.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${f.toFixed(4)})`)
    );
}

function construirMinimapa(contenedor) {
  const caja = crear('div', 'pmw');
  contenedor.appendChild(caja);
  const sv = crearSvg(
    'svg',
    { id: 'pm', role: 'img', 'aria-label': 'Mapa de los municipios de la provincia de Salamanca' },
    caja
  );
  const zb = crear('div', 'zb');
  zb.innerHTML =
    '<button aria-label="Acercar">+</button><button aria-label="Alejar">−</button><button aria-label="Ver toda la provincia" title="Ver toda la provincia">⌂</button>';
  caja.appendChild(zb);
  // Leyenda de las carreteras, debajo del mapa
  contenedor.appendChild(
    crear(
      'div',
      'pml',
      crear('span', 'a', 'Autovía'),
      crear('span', 'n', 'Nacional'),
      crear('span', 'c', 'CL-517 (a las Arribes)')
    )
  );

  // Proyección propia: toda la provincia en un lienzo de W x H
  const LON0 = -6.94,
    LAT0 = 41.3,
    K = 100,
    aLienzo = ([la, lo]) => [(lo - LON0) * 0.755 * K, (LAT0 - la) * K],
    W = 1.86 * 0.755 * K,
    H = 1.07 * K;
  const vista = { x: 0, y: 0, w: W, h: H };
  const ajustar = () => {
    vista.w = Math.min(W, Math.max(W / 8, vista.w));
    vista.h = (vista.w * H) / W;
    vista.x = Math.max(0, Math.min(W - vista.w, vista.x));
    vista.y = Math.max(0, Math.min(H - vista.h, vista.y));
    sv.setAttribute('viewBox', vista.x + ' ' + vista.y + ' ' + vista.w + ' ' + vista.h);
    escalarEscudos((0.36 * vista.w) / W);
  };
  const zoom = (factor, cx = vista.x + vista.w / 2, cy = vista.y + vista.h / 2) => {
    const w = Math.min(W, Math.max(W / 8, vista.w / factor)),
      r = w / vista.w;
    vista.x = cx - (cx - vista.x) * r;
    vista.y = cy - (cy - vista.y) * r;
    vista.w = w;
    ajustar();
  };

  // Trama para los pueblos con marca «Quiero ir»
  const trama = crearSvg(
    'pattern',
    { id: 'ph2', width: 4, height: 4, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' },
    crearSvg('defs', {}, sv)
  );
  crearSvg('rect', { width: 4, height: 4, style: 'fill:var(--b)' }, trama);
  crearSvg('rect', { width: 1.6, height: 4, style: 'fill:var(--gold);opacity:.7' }, trama);

  const capaMunicipios = crearSvg('g', {}, sv),
    capaComarcas = crearSvg('g', { style: 'pointer-events:none' }, sv);
  const trazo = anillos =>
    anillos
      .map(
        r =>
          'M' +
          r
            .map(q =>
              aLienzo(q)
                .map(v => v.toFixed(1))
                .join(' ')
            )
            .join('L') +
          'Z'
      )
      .join('');
  const caminos = new Map();
  PROVINCIA.m.forEach(m => {
    const p = crearSvg('path', { d: trazo(m.R), class: 'pmm' }, capaMunicipios);
    p.onclick = () => {
      if (gestos.arrastre <= UMBRAL_TOQUE) seleccionarPueblo(m);
    };
    caminos.set(m, p);
  });
  PROVINCIA.co.forEach(rs =>
    crearSvg('path', { d: trazo(rs.map(decodificarLinde)), class: 'pmc' }, capaComarcas)
  );
  const escalarEscudos = pintarCarreterasProvincia(
    crearSvg('g', { class: 'pmv', 'aria-hidden': 'true' }, sv),
    aLienzo
  );

  const [acercar, alejar, todo] = zb.querySelectorAll('button');
  acercar.onclick = () => zoom(1.6);
  alejar.onclick = () => zoom(1 / 1.6);
  todo.onclick = () => {
    vista.x = vista.y = 0;
    vista.w = W;
    ajustar();
  };
  const gestos = activarGestos(sv, {
    aPunto: (cx, cy) => {
      const r = sv.getBoundingClientRect();
      return [vista.x + ((cx - r.left) / r.width) * vista.w, vista.y + ((cy - r.top) / r.height) * vista.h];
    },
    zoom,
    mover: (fx, fy) => {
      vista.x -= fx * vista.w;
      vista.y -= fy * vista.h;
      ajustar();
    },
    puedeMover: () => vista.w < W // con la provincia entera a la vista no hay nada que arrastrar
  });
  ajustar();

  // Acerca el minimapa al municipio m (sin alejarlo si ya estaba cerca)
  const encuadrar = m => {
    const ps = m.R.flat().map(aLienzo),
      xs = ps.map(q => q[0]),
      ys = ps.map(q => q[1]),
      cx = (Math.min(...xs) + Math.max(...xs)) / 2,
      cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    vista.w = Math.max(W / 6, vista.w > W / 3 ? W / 3 : vista.w);
    vista.h = (vista.w * H) / W;
    vista.x = cx - vista.w / 2;
    vista.y = cy - vista.h / 2;
    ajustar();
  };
  return { caminos, encuadrar };
}

// Lista desplegable por comarcas, con cada municipio y sus pedanías
function construirComarcas(contenedor) {
  PROVINCIA.com.forEach((nombre, ci) => {
    const titulo = crear('summary'),
      cuerpo = crear('div'),
      det = crear('details', 'pcd', titulo, cuerpo);
    const municipios = PROVINCIA.m.filter(m => m.c == ci).sort((a, b) => a.n.localeCompare(b.n, 'es'));
    municipios.forEach(m => {
      const grupo = crear('div', 'pg'),
        nombreBoton = crear('button', 'nm', m.n),
        fila = crear('div', 'pr', nombreBoton);
      nombreBoton.onclick = () => seleccionarPueblo(m, true);
      // Habitantes según el INE, con sus pedanías (datos/habitantes.js)
      nombreBoton.appendChild(crear('small', 'habm', conMiles(HABITANTES.m[m.ine]) + ' hab.'));
      if (m.cap) fila.appendChild(crear('small', 'mu', 'la capital: se marca por barrios en el mapa'));
      else {
        if (m.z) nombreBoton.appendChild(crear('small', 'tagm', 'en el mapa'));
        if (PUEBLOS[m.n]) nombreBoton.appendChild(crear('small', 'tagm tagf', 'con ficha'));
        const botones = botonesMunicipio(m);
        fila.appendChild(botones);
        vistaProvincia.filas.push({ botones, el: fila, grupo });
      }
      grupo.appendChild(fila);
      m.P.forEach(p => {
        const botones = botonesPedania(p),
          filaP = crear('div', 'pr pd', crear('span', 'nm', p.n), botones);
        vistaProvincia.filas.push({ botones, el: filaP, grupo });
        grupo.appendChild(filaP);
      });
      cuerpo.appendChild(grupo);
    });
    contenedor.appendChild(det);
    const habitantes = municipios.reduce((s, m) => s + HABITANTES.m[m.ine], 0);
    vistaProvincia.comarcas.push({ det, titulo, municipios, nombre, habitantes });
  });
}

function construirProvincia() {
  const caja = $('#pv');
  caja.textContent = '';
  vistaProvincia = { filas: [], comarcas: [] };
  const cabecera = crear('div', 'pvh');
  cabecera.innerHTML =
    '<input id="pq" type="search" placeholder="Buscar pueblo o pedanía..." autocomplete="off" aria-label="Buscar pueblo o pedanía"><div id="pcn" class="pcn"></div>';
  caja.appendChild(cabecera);
  Object.assign(vistaProvincia, construirMinimapa(caja));

  const seleccion = crear('div', 'psb');
  seleccion.id = 'psb';
  seleccion.innerHTML = '<p class="mu" style="margin:0">Pulsa un municipio del mapa para verlo aquí.</p>';
  caja.appendChild(seleccion);

  vistaProvincia.filtros = crearBotonesFiltro(filtroProvincia, clave => {
    filtroProvincia = clave;
    aplicarFiltroProvincia();
  });
  caja.appendChild(vistaProvincia.filtros);

  const resultados = crear('div');
  resultados.id = 'prs';
  caja.appendChild(resultados);

  const lista = crear('div');
  lista.id = 'pcl';
  caja.appendChild(lista);
  construirComarcas(lista);

  caja.appendChild(
    crear(
      'p',
      'mu pvn',
      'Municipios, pedanías y anejos según el anexo de municipios de Wikipedia; comarcas tradicionales según Llorente Maldonado (1976), que no son oficiales. Lindes de OpenStreetMap, simplificadas.'
    )
  );
  $('#pq').addEventListener('input', buscarEnProvincia);
  actualizarProvincia();
}

// --- Uso ----------------------------------------------------------------------

// Muestra un municipio en la barra de selección; con encuadrar=true también acerca el minimapa
function seleccionarPueblo(m, encuadrar) {
  puebloSeleccionado = m;
  const barra = $('#psb');
  barra.textContent = '';
  const detalle =
    ' · ' +
    PROVINCIA.com[m.c] +
    (m.P.length ? ' · ' + m.P.length + (m.P.length == 1 ? ' pedanía' : ' pedanías') : '');
  barra.appendChild(crear('div', 'pst', crear('b', '', m.n), crear('small', '', detalle)));
  // Habitantes según el INE, con las pedanías (pueblos.js carga después, pero esto solo se llama al usarla)
  barra.appendChild(
    crear(
      'p',
      'habitantes',
      '👥 ' +
        textoHabitantes(m) +
        (m.P.length ? ', contando ' + (m.P.length == 1 ? 'su pedanía' : 'sus pedanías') : '')
    )
  );
  if (ubicacionReciente() && ubicacion.pid == m.k) {
    const aqui = crear('p', 'here', 'Estás en el término de ' + m.n + '.');
    aqui.style.margin = '6px 0';
    barra.appendChild(aqui);
  }
  if (m.cap) {
    const nota = crear('p', 'mu', 'La capi se marca por barrios en la pestaña Mapa.');
    nota.style.margin = '4px 0 0';
    barra.appendChild(nota);
  } else {
    const botones = botonesMunicipio(m);
    botones.classList.add('big');
    barra.appendChild(botones);
    pintarBotonesMarcar(botones);
    vistaProvincia.botonesSeleccion = botones;
  }
  // pueblos.js carga después, pero esto solo se llama al usar la pestaña
  const ficha = botonFichaPueblo(m);
  if (ficha) barra.appendChild(ficha);
  vistaProvincia.caminos.forEach((p, mm) => p.classList.toggle('sel', mm == m));
  enlaceVista();
  if (encuadrar) {
    vistaProvincia.encuadrar(m);
    $('#pm').scrollIntoView({ behavior: comoDesplazar(), block: 'center' });
  }
}

// Oculta las filas que no cumplen el filtro. Si una pedanía cumple y su municipio no, el municipio
// se deja visible pero atenuado (clase ctx) para dar contexto.
function aplicarFiltroProvincia() {
  if (!vistaProvincia) return;
  vistaProvincia.filtros
    .querySelectorAll('button')
    .forEach(b => marcarInterruptor(b, b.dataset.f == filtroProvincia));
  const gruposVisibles = new Set();
  vistaProvincia.filas.forEach(f => {
    const ok = cumpleFiltro(filtroProvincia, f.botones._leer());
    f.el.hidden = !ok;
    if (ok) gruposVisibles.add(f.grupo);
  });
  document.querySelectorAll('#pcl .pg').forEach(g => {
    g.hidden = !gruposVisibles.has(g);
    if (gruposVisibles.has(g)) {
      const filaMunicipio = g.firstChild;
      if (filaMunicipio.hidden) {
        filaMunicipio.hidden = false;
        filaMunicipio.classList.add('ctx');
      } else filaMunicipio.classList.remove('ctx');
    }
  });
  vistaProvincia.comarcas.forEach(c => {
    const alguno = [...c.det.querySelectorAll('.pg')].some(g => !g.hidden);
    c.det.hidden = !alguno;
    if (filtroProvincia != 'all' && alguno) c.det.open = true;
  });
}

// Repinta botones, colores del minimapa, contadores y filtros
function actualizarProvincia() {
  if (!vistaProvincia) return;
  vistaProvincia.filas.forEach(f => pintarBotonesMarcar(f.botones));
  if (vistaProvincia.botonesSeleccion) pintarBotonesMarcar(vistaProvincia.botonesSeleccion);
  const capitalPisada = zonas.some(z => z.g < 5 && progreso.z[z.id] == 'v');
  vistaProvincia.caminos.forEach((p, m) => {
    const marca = m.cap ? (capitalPisada ? 'v' : '') : estadoMunicipio(m);
    const color = marca == 'v' ? ' v' : marca == 'w' ? ' w' : tienePedaniaPisada(m) ? ' pv' : '';
    p.setAttribute('class', 'pmm' + color + (m == puebloSeleccionado ? ' sel' : ''));
  });
  const pueblosPisados = pueblos.filter(m => estadoMunicipio(m) == 'v').length,
    pedaniasPisadas = pedanias.filter(p => estadoClave(p.k) == 'v').length,
    porVisitar =
      pueblos.filter(m => estadoMunicipio(m) == 'w').length +
      pedanias.filter(p => estadoClave(p.k) == 'w').length;
  $('#pcn').textContent =
    pueblosPisados +
    ' de ' +
    pueblos.length +
    ' pueblos y ' +
    pedaniasPisadas +
    ' de ' +
    pedanias.length +
    ' pedanías pisados' +
    (porVisitar ? ', ' + porVisitar + ' por visitar' : '');
  vistaProvincia.comarcas.forEach(c => {
    const marcables = c.municipios.filter(m => !m.cap),
      pisados = marcables.filter(m => estadoMunicipio(m) == 'v').length;
    c.titulo.textContent = c.nombre + ' · ' + pisados + '/' + marcables.length;
    c.titulo.appendChild(crear('small', 'habc', conMiles(c.habitantes) + ' habitantes'));
  });
  aplicarFiltroProvincia();
  if ($('#pq').value) buscarEnProvincia();
}

function buscarEnProvincia() {
  const q = normalizar($('#pq').value.trim()),
    resultados = $('#prs');
  resultados.textContent = '';
  $('#pcl').hidden = !!q;
  vistaProvincia.filtros.hidden = !!q;
  if (!q) return;
  const encontrados = [
    ...PROVINCIA.m.map(m => ({ m, n: m.n })),
    ...pedanias.map(p => ({ p, m: p.m, n: p.n }))
  ]
    .map(h => [normalizar(h.n).indexOf(q), h])
    .filter(a => a[0] >= 0)
    .sort((a, b) => a[0] - b[0] || a[1].n.length - b[1].n.length) // primero los que empiezan así, y los más cortos
    .slice(0, 40);
  if (!encontrados.length) {
    resultados.appendChild(crear('p', 'mu', 'Ningún pueblo ni pedanía con ese nombre.'));
    return;
  }
  encontrados.forEach(([, h]) => {
    const nombre = crear(
        'button',
        'nm',
        h.n,
        crear('small', '', h.p ? 'pedanía de ' + h.m.n : PROVINCIA.com[h.m.c])
      ),
      fila = crear('div', 'pr sr2', nombre);
    nombre.onclick = () => seleccionarPueblo(h.m, true);
    if (h.p || !h.m.cap) {
      const botones = h.p ? botonesPedania(h.p) : botonesMunicipio(h.m);
      pintarBotonesMarcar(botones);
      fila.appendChild(botones);
    }
    resultados.appendChild(fila);
  });
}
