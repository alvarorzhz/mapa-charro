// Tu perfil, dentro de «Tu Salamanca» (mi-salamanca.js): la cabecera con el nivel, la actividad de las últimas
// semanas, el historial y el juego.
// El historial se guarda en progreso.j.hi como [fecha, tipo, id]: tipo 'z' zona pisada, 'p' pueblo o pedanía
// pisados, 'mo' monumento visitado, 'ru' parada de una ruta («ruta:parada»), 'rh' ruta hecha, 'de' detalle
// escondido encontrado, 'lo' logro conseguido (TIPOS_HISTORIAL, en estado.js).
// No hace falta apuntarlo en cada sitio: cada vez que se guarda, anotarHistorial compara lo que hay marcado
// con el historial, apunta con la fecha de hoy lo nuevo y quita lo que ya no está marcado. Lo que ya estaba
// marcado antes de existir el historial se apunta sin fecha ('').

const claveHistorial = (tipo, id) => tipo + '|' + id;

// Todo lo que cuenta para el historial ahora mismo: claves «tipo|id»
function marcasActuales() {
  const j = estadoApp.progreso.j || {},
    claves = [];
  for (const id in estadoApp.progreso.z)
    if (estadoApp.progreso.z[id] == 'v' && id != 'resto') claves.push(claveHistorial('z', id));
  for (const k in estadoApp.progreso.p || {})
    if (estadoApp.progreso.p[k] == 'v') claves.push(claveHistorial('p', k));
  (j.mo || []).forEach(id => claves.push(claveHistorial('mo', id)));
  for (const ruta in j.r || {}) j.r[ruta].forEach(id => claves.push(claveHistorial('ru', ruta + ':' + id)));
  for (const ruta in j.rs || {}) if (j.rs[ruta] == 'v') claves.push(claveHistorial('rh', ruta));
  (j.de || []).forEach(id => claves.push(claveHistorial('de', id)));
  calcularLogros()
    .filter(conseguido)
    .forEach(a => claves.push(claveHistorial('lo', a.id)));
  return claves;
}

// Lo que se quita del historial en esta visita, con su fecha: si vuelve («Deshacer», o se marca otra vez
// sin cerrar la app), vuelve con la fecha de antes y no con la de hoy. No se guarda.
const quitadosDelHistorial = new Map();
function anotarHistorial() {
  estadoApp.progreso.j = estadoApp.progreso.j || {};
  apuntarLogros(); // logros.js: que no se pierdan los ya conseguidos
  const j = estadoApp.progreso.j,
    primeraVez = !Array.isArray(j.hi),
    actuales = new Set(marcasActuales()),
    hi = [],
    hoy = primeraVez ? '' : fechaHoy();
  (primeraVez ? [] : j.hi).forEach(e => {
    const k = claveHistorial(e[1], e[2]);
    if (actuales.has(k)) hi.push(e);
    else quitadosDelHistorial.set(k, e);
  });
  const yaEstan = new Set(hi.map(([, tipo, id]) => claveHistorial(tipo, id)));
  actuales.forEach(k => {
    if (yaEstan.has(k)) return;
    const i = k.indexOf('|');
    hi.push(quitadosDelHistorial.get(k) || [hoy, k.slice(0, i), k.slice(i + 1)]);
    quitadosDelHistorial.delete(k);
  });
  j.hi = hi;
}

// --- Textos del historial ------------------------------------------------------------------------
function textoHistorial([, tipo, id]) {
  if (tipo == 'z') return 'Pisaste ' + ((buscarZona(id) || {}).n || id);
  if (tipo == 'p') {
    const m = PROVINCIA.m.find(m => m.k == id) || pedanias.find(p => p.k == id);
    return 'Pisaste ' + (m ? m.n + (m.m ? ' (' + m.m.n + ')' : '') : id);
  }
  if (tipo == 'mo') return 'Visitaste ' + ((buscarMonumento(id) || {}).n || id);
  if (tipo == 'ru') {
    const [ruta, parada] = id.split(':'),
      r = [...RUTAS, ...RUTAS_PROVINCIA].find(r => r.id == ruta),
      p = r && r.paradas.find(p => typeof p != 'string' && p.id == parada);
    return (p ? p.n : parada) + (r ? ', en la ruta ' + r.nombre : '');
  }
  if (tipo == 'rh') return '🥾 Hiciste la ruta ' + ((buscarRuta(id) || {}).nombre || id);
  if (tipo == 'de') return '🔍 Encontraste ' + ((buscarDetalle(id) || {}).n || id);
  const logro = calcularLogros().find(a => a.id == id);
  return '🏆 Logro: ' + (logro ? logro.n : id);
}
const fechaLarga = f => {
  const t = textoFecha(f, { weekday: 'long', day: 'numeric', month: 'long' });
  return t.charAt(0).toUpperCase() + t.slice(1);
};

// --- Nivel según las zonas pisadas ------------------------------------------------------------------
const NIVELES = [
  [0, 'Forastero'],
  [1, 'Turista'],
  [0.15, 'Paseante'],
  [0.35, 'Vecino'],
  [0.6, 'Charro de barrio'],
  [0.85, 'Charro de pura cepa'],
  [1, 'Charro lígrimo']
];
function nivel(pisadas, total) {
  const f = pisadas / total;
  let n = NIVELES[0][1];
  NIVELES.forEach(([minimo, nombre], i) => {
    if (i == 1 ? pisadas >= 1 : f >= minimo) n = nombre;
  });
  return n;
}
// El siguiente nivel y cuántas zonas faltan para él (null si ya está en el último)
function siguienteNivel(pisadas, total) {
  for (let i = 1; i < NIVELES.length; i++) {
    const hacen = i == 1 ? 1 : Math.ceil(NIVELES[i][0] * total - 1e-9);
    if (pisadas < hacen) return { nombre: NIVELES[i][1], faltan: hacen - pisadas };
  }
  return null;
}

// --- Actividad: un cuadro por día de las últimas 12 semanas --------------------------------------------
function mapaActividad() {
  const j = estadoApp.progreso.j || {},
    cuenta = {};
  (j.hi || []).forEach(([f]) => f && (cuenta[f] = (cuenta[f] || 0) + 1));
  (j.h || []).forEach(f => (cuenta[f] = (cuenta[f] || 0) + 1));
  const SEMANAS = 12,
    hoy = hoyEnSalamanca(),
    // Empieza en lunes, hace 11 semanas
    inicio = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate() - ((hoy.getDay() + 6) % 7) - 7 * (SEMANAS - 1)
    ),
    lado = 11,
    hueco = 3,
    sv = crearSvg('svg', {
      class: 'actividad',
      viewBox: `0 0 ${SEMANAS * (lado + hueco)} ${7 * (lado + hueco)}`,
      role: 'img'
    });
  let dias = 0;
  for (let s = 0; s < SEMANAS; s++)
    for (let d = 0; d < 7; d++) {
      const f = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + s * 7 + d);
      if (f > hoy) continue;
      const clave =
          f.getFullYear() +
          '-' +
          String(f.getMonth() + 1).padStart(2, '0') +
          '-' +
          String(f.getDate()).padStart(2, '0'),
        n = cuenta[clave] || 0;
      if (n) dias++;
      const c = crearSvg(
        'rect',
        {
          x: s * (lado + hueco),
          y: d * (lado + hueco),
          width: lado,
          height: lado,
          rx: 2,
          class: 'dia n' + Math.min(n, 4)
        },
        sv
      );
      crearSvg('title', {}, c).textContent =
        fechaLarga(clave) + ': ' + (n ? n + (n == 1 ? ' cosa' : ' cosas') : 'nada');
    }
  sv.setAttribute(
    'aria-label',
    'Actividad de las últimas 12 semanas: ' + dias + (dias == 1 ? ' día' : ' días') + ' con algo nuevo'
  );
  return { sv, dias };
}

// --- La ficha del perfil ----------------------------------------------------------------------------
// El nombre de la cuenta con la que se ha entrado: Google en la web (cuenta.js) o Claude (guardado.js,
// nombreClaude). No se guarda en el progreso: se lee de la cuenta cada vez.
function cuentaDelPerfil() {
  const u = typeof cuentaWeb != 'undefined' && cuentaWeb.usuario;
  if (u && u.displayName) return { nombre: u.displayName, cuenta: 'Google' };
  if (nombreClaude) return { nombre: nombreClaude, cuenta: 'Claude' };
  return null;
}
const nombreUsuario = () => {
  const c = cuentaDelPerfil();
  return c ? c.nombre.trim().split(/\s+/)[0] : '';
};

// La cabecera de «Tu Salamanca» (mi-salamanca.js): nombre, nivel, zonas pisadas y el siguiente nivel
function cabeceraPerfil() {
  const zonasPisadas = todasLasZonas.filter(z => estadoApp.progreso.z[z.id] == 'v').length,
    total = todasLasZonas.length,
    hechos = calcularLogros().filter(conseguido).length,
    cuenta = cuentaDelPerfil(),
    nombre = nombreUsuario(),
    siguiente = siguienteNivel(zonasPisadas, total);
  return crear(
    'div',
    'perfil-cab',
    crear('span', 'avatar', nombre ? nombre[0].toUpperCase() : '🧑'),
    crear(
      'div',
      '',
      cuenta ? crear('span', 'perfil-nombre', cuenta.nombre) : null,
      crear('b', '', nivel(zonasPisadas, total)),
      crear(
        'small',
        '',
        zonasPisadas + ' de ' + total + ' zonas pisadas · ' + hechos + (hechos == 1 ? ' logro' : ' logros')
      ),
      barra(zonasPisadas / total),
      crear(
        'small',
        'mu',
        siguiente
          ? 'Te ' +
              (siguiente.faltan == 1 ? 'falta 1 zona' : 'faltan ' + siguiente.faltan + ' zonas') +
              ' para ser «' +
              siguiente.nombre +
              '»'
          : '¡Has llegado a lo más alto!'
      )
    )
  );
}
const textoCuentaPerfil = () => {
  const cuenta = cuentaDelPerfil();
  return cuenta
    ? 'Has entrado con tu cuenta de ' + cuenta.cuenta + ': tu progreso se guarda en ella.'
    : 'Sin cuenta: tu progreso se guarda solo en este navegador.';
};

// Pestaña «Actividad»: el cuadro de las últimas 12 semanas y el historial, lo más reciente primero
function apartadosActividad() {
  const j = estadoApp.progreso.j || {},
    { sv, dias } = mapaActividad(),
    conFecha = (j.hi || []).filter(e => e[0]).sort((a, b) => (a[0] < b[0] ? 1 : a[0] > b[0] ? -1 : 0)),
    sinFecha = (j.hi || []).filter(e => !e[0]).length,
    historial = crear('div', 'historial');
  let dia = '';
  conFecha.slice(0, 40).forEach(e => {
    if (e[0] != dia) {
      dia = e[0];
      historial.appendChild(crear('b', 'hdia', fechaLarga(dia)));
    }
    historial.appendChild(crear('p', '', textoHistorial(e)));
  });
  if (!conFecha.length)
    historial.appendChild(crear('p', 'mu', 'Lo que marques desde ahora aparecerá aquí, con su fecha.'));
  if (sinFecha)
    historial.appendChild(
      crear(
        'p',
        'mu',
        'Y ' +
          sinFecha +
          (sinFecha == 1 ? ' cosa' : ' cosas') +
          ' de antes de que la app apuntara las fechas.'
      )
    );
  return [
    crear(
      'section',
      'ms-apartado',
      crear('h3', '', '🗓️ Las últimas 12 semanas'),
      crear(
        'p',
        'mu',
        dias
          ? dias + (dias == 1 ? ' día' : ' días') + ' con algo nuevo en las últimas 12 semanas.'
          : 'Aún no hay actividad con fecha.'
      ),
      sv
    ),
    crear('section', 'ms-apartado', crear('h3', '', '📜 Historial'), historial)
  ];
}

// Pestaña «Logros»: juego y lectura
function apartadoJuego() {
  const j = estadoApp.progreso.j || {},
    racha = rachaReto();
  return crear(
    'section',
    'ms-apartado',
    crear('h3', '', '🎯 Juego y lectura'),
    cajaDatos([
      ['Partidas', String(j.n || 0)],
      ['Récord', (j.m || 0) + ' puntos'],
      ['Racha del reto', racha + (racha == 1 ? ' día' : ' días')],
      ['Fichas leídas', (j.fl || []).length + ' / ' + zonas.length],
      ['Palabras charras', (j.pv || []).length + ' / ' + PALABRAS_CHARRAS.length]
    ])
  );
}
