// Tu perfil (#perfil): nivel, estadísticas de todo lo que llevas, actividad de las últimas semanas e historial.
// El historial se guarda en progreso.j.hi como [fecha, tipo, id]: tipo 'z' zona pisada, 'p' pueblo o pedanía
// pisados, 'mo' monumento visitado, 'ru' parada de una ruta («ruta:parada»), 'rh' ruta hecha, 'lo' logro
// conseguido (TIPOS_HISTORIAL, en estado.js).
// No hace falta apuntarlo en cada sitio: cada vez que se guarda, anotarHistorial compara lo que hay marcado
// con el historial, apunta con la fecha de hoy lo nuevo y quita lo que ya no está marcado. Lo que ya estaba
// marcado antes de existir el historial se apunta sin fecha ('').

const claveHistorial = (tipo, id) => tipo + '|' + id;

// Todo lo que cuenta para el historial ahora mismo: claves «tipo|id»
function marcasActuales() {
  const j = progreso.j || {},
    claves = [];
  for (const id in progreso.z)
    if (progreso.z[id] == 'v' && id != 'resto') claves.push(claveHistorial('z', id));
  for (const k in progreso.p || {}) if (progreso.p[k] == 'v') claves.push(claveHistorial('p', k));
  (j.mo || []).forEach(id => claves.push(claveHistorial('mo', id)));
  for (const ruta in j.r || {}) j.r[ruta].forEach(id => claves.push(claveHistorial('ru', ruta + ':' + id)));
  for (const ruta in j.rs || {}) if (j.rs[ruta] == 'v') claves.push(claveHistorial('rh', ruta));
  calcularLogros()
    .filter(conseguido)
    .forEach(a => claves.push(claveHistorial('lo', a.id)));
  return claves;
}

function anotarHistorial() {
  const j = (progreso.j = progreso.j || {}),
    primeraVez = !Array.isArray(j.hi),
    actuales = new Set(marcasActuales()),
    hi = (primeraVez ? [] : j.hi).filter(([, tipo, id]) => actuales.has(claveHistorial(tipo, id))),
    yaEstan = new Set(hi.map(([, tipo, id]) => claveHistorial(tipo, id))),
    hoy = primeraVez ? '' : fechaHoy();
  actuales.forEach(k => {
    if (yaEstan.has(k)) return;
    const i = k.indexOf('|');
    hi.push([hoy, k.slice(0, i), k.slice(i + 1)]);
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
  const logro = calcularLogros().find(a => a.id == id);
  return '🏆 Logro: ' + (logro ? logro.n : id);
}
const fechaLarga = f => {
  const t = new Date(f + 'T12:00:00').toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
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
  const j = progreso.j || {},
    cuenta = {};
  (j.hi || []).forEach(([f]) => f && (cuenta[f] = (cuenta[f] || 0) + 1));
  (j.h || []).forEach(f => (cuenta[f] = (cuenta[f] || 0) + 1));
  const SEMANAS = 12,
    hoy = new Date(),
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

function abrirPerfil() {
  if (!Array.isArray((progreso.j || {}).hi)) anotarHistorial(); // primera vez: lo de antes, sin fecha
  const j = progreso.j || {},
    zonasPisadas = todasLasZonas.filter(z => progreso.z[z.id] == 'v'),
    porVisitar = todasLasZonas.filter(z => progreso.z[z.id] == 'w'),
    logros = calcularLogros(),
    hechos = logros.filter(conseguido),
    pueblosPisados = pueblos.filter(m => estadoMunicipio(m) == 'v'),
    pedaniasPisadas = pedanias.filter(p => estadoClave(p.k) == 'v'),
    comarcas = new Set(pueblosPisados.map(m => m.c)),
    todasRutas = [...RUTAS, ...RUTAS_PROVINCIA],
    paradas = todasRutas.reduce((s, r) => s + r.paradas.filter(p => paradaVisitada(r, p)).length, 0),
    cuenta = cuentaDelPerfil(),
    nombre = nombreUsuario(),
    titulo = nivel(zonasPisadas.length, todasLasZonas.length),
    siguiente = siguienteNivel(zonasPisadas.length, todasLasZonas.length),
    rutasHechas = todasRutas.filter(r => estadoRuta(r.id) == 'v'),
    rutasQuiero = todasRutas.filter(r => estadoRuta(r.id) == 'w');

  const caja = fichaLimpia('Tu perfil', nombre ? 'Hola, ' + nombre : 'Tu progreso');
  caja.appendChild(
    crear(
      'div',
      'perfil-cab',
      crear('span', 'avatar', nombre ? nombre[0].toUpperCase() : '🧑'),
      crear(
        'div',
        '',
        cuenta ? crear('span', 'perfil-nombre', cuenta.nombre) : null,
        crear('b', '', titulo),
        crear(
          'small',
          '',
          zonasPisadas.length +
            ' de ' +
            todasLasZonas.length +
            ' zonas pisadas · ' +
            hechos.length +
            (hechos.length == 1 ? ' logro' : ' logros')
        ),
        barra(zonasPisadas.length / todasLasZonas.length),
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
    )
  );
  caja.appendChild(
    crear(
      'p',
      'mu perfil-cuenta',
      cuenta
        ? 'Has entrado con tu cuenta de ' + cuenta.cuenta + ': tu progreso se guarda en ella.'
        : 'Sin cuenta: tu progreso se guarda solo en este navegador.'
    )
  );
  // La pantalla de inicio del día (hoy.js), también desde aquí
  const hoy = crear('button', 'boton-hoy perfil-hoy', '🌅 ¿Qué puedo descubrir hoy?');
  hoy.onclick = () => desdeHoy(abrirHoy)();
  caja.appendChild(hoy);

  const apartado = (titulo, ...hijos) => caja.append(crear('h3', '', titulo), ...hijos);
  apartado(
    'La ciudad',
    cajaDatos([
      ['Zonas pisadas', zonasPisadas.length + ' / ' + todasLasZonas.length],
      ['Quiero ir', String(porVisitar.length)],
      ['Con GPS', String((progreso.gv || []).length)],
      ['Monumentos', (j.mo || []).length + ' / ' + MONUMENTOS.length]
    ]),
    crear(
      'div',
      'perfil-grupos',
      ...NOMBRES_GRUPOS.map((n, g) => {
        const del = todasLasZonas.filter(z => z.g == g),
          pis = del.filter(z => progreso.z[z.id] == 'v').length;
        return crear(
          'div',
          'pg',
          crear('span', '', n),
          crear('small', '', pis + '/' + del.length),
          barra(pis / del.length)
        );
      })
    )
  );
  apartado(
    'La provincia y las rutas',
    cajaDatos([
      ['Pueblos', pueblosPisados.length + ' / ' + pueblos.length],
      ['Pedanías', String(pedaniasPisadas.length)],
      ['Comarcas', comarcas.size + ' / ' + PROVINCIA.com.length],
      ['Rutas hechas', rutasHechas.length + ' / ' + todasRutas.length],
      ['Quieres hacer', String(rutasQuiero.length)],
      ['Con todas sus paradas', String(todasRutas.filter(rutaCompleta).length)],
      ['Paradas de ruta', String(paradas)]
    ])
  );
  // Atajos a las rutas: las que quieres hacer y las hechas
  const botonesRutas = lista => {
    const nb = crear('div', 'nb');
    lista.forEach(r => {
      const b = crear('button', '', r.icono + ' ' + r.nombre);
      b.onclick = () => abrirRutaPorId(r.id);
      nb.appendChild(b);
    });
    return nb;
  };
  if (rutasQuiero.length) apartado('Rutas que quieres hacer', botonesRutas(rutasQuiero));
  if (rutasHechas.length) apartado('Rutas hechas', botonesRutas(rutasHechas));
  if (!rutasQuiero.length && !rutasHechas.length) {
    const ver = crear('button', '', '🥾 Ver las rutas');
    ver.onclick = abrirRutas;
    apartado(
      'Tus rutas',
      crear('p', 'mu', 'En cada ruta puedes marcar «La he hecho» o «La quiero hacer» para llevar la cuenta.'),
      crear('div', 'nb', ver)
    );
  }
  apartado(
    'Juego, lectura y logros',
    cajaDatos([
      ['Partidas', String(j.n || 0)],
      ['Récord', (j.m || 0) + ' puntos'],
      ['Racha del reto', rachaReto() + (rachaReto() == 1 ? ' día' : ' días')],
      ['Fichas leídas', (j.fl || []).length + ' / ' + zonas.length],
      ['Palabras charras', (j.pv || []).length + ' / ' + PALABRAS_CHARRAS.length],
      ['Logros', hechos.length + ' / ' + logros.length]
    ])
  );
  // Los últimos logros conseguidos (los que tienen fecha)
  const ultimosLogros = (j.hi || [])
    .filter(e => e[1] == 'lo' && e[0])
    .sort((a, b) => (a[0] < b[0] ? 1 : a[0] > b[0] ? -1 : 0))
    .slice(0, 3);
  if (ultimosLogros.length)
    apartado(
      'Últimos logros',
      crear(
        'div',
        'historial',
        ...ultimosLogros.map(e =>
          crear(
            'p',
            '',
            textoHistorial(e).replace('🏆 Logro: ', '🏆 '),
            crear('small', '', ' · ' + fechaLarga(e[0]))
          )
        )
      )
    );
  // «Quiero ir»: atajos a esas zonas
  if (porVisitar.length) {
    const lista = crear('div', 'nb');
    porVisitar.slice(0, 12).forEach(z => {
      const b = crear('button', '', z.n);
      b.onclick = () => abrirFicha(z.id);
      lista.appendChild(b);
    });
    apartado('Te quedan por ir', lista);
  }

  const { sv, dias } = mapaActividad();
  apartado(
    'Actividad',
    crear(
      'p',
      'mu',
      dias
        ? dias + (dias == 1 ? ' día' : ' días') + ' con algo nuevo en las últimas 12 semanas.'
        : 'Aún no hay actividad con fecha.'
    ),
    sv
  );

  // Historial: lo más reciente primero, agrupado por día
  const conFecha = (j.hi || []).filter(e => e[0]).sort((a, b) => (a[0] < b[0] ? 1 : a[0] > b[0] ? -1 : 0)),
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
  apartado('Historial', historial);

  const foto = crear('button', 'principal', '📸 Crear mi imagen «Mi Salamanca»');
  foto.onclick = () => $('#foto').click();
  $('#nb').append(foto);
  $('#ap').textContent =
    'Todo esto sale de tu progreso: se guarda en este navegador y, si has entrado, en tu cuenta. Nadie más lo ve.';
  mostrarFicha();
  enlaceFicha('perfil', 'Tu perfil');
}

$('#perfil').onclick = abrirPerfil;
