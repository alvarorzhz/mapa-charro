// «¿Qué puedo descubrir hoy?»: la ficha de inicio (#hoy). Sale sola la primera vez que se abre la app
// cada día (salvo si se entra por un enlace o toca la bienvenida) y se puede abrir desde el perfil.
// No guarda nada en el progreso: todo sale de `progreso` y de los datos (zonas, monumentos, pueblos con
// ficha y rutas). Solo recuerda en este navegador qué día se enseñó y si se quiere ver sola.
// La ubicación solo se usa si ya hay permiso (o se pulsa el botón): nunca se pide sola.

const CLAVE_HOY = 'charro-hoy'; // último día que se enseñó sola
const CLAVE_HOY_AUTO = 'charro-hoy-auto'; // '0': no enseñarla sola cada día
const leerLocal = k => {
  try {
    return localStorage.getItem(k);
  } catch (e) {
    return null;
  }
};
const escribirLocal = (k, v) => {
  try {
    localStorage.setItem(k, v);
  } catch (e) {}
};
const hoyAutomatica = () => leerLocal(CLAVE_HOY_AUTO) != '0';
const tocaHoy = () => !location.hash && hoyAutomatica() && leerLocal(CLAVE_HOY) != fechaHoy();

// --- Lugares ----------------------------------------------------------------------------------------
// Todos los lugares con ficha, en un orden fijo: zonas del mapa, monumentos y pueblos con ficha.
// Cada uno: { tipo, id (el del historial), n, sub, la, lo, hecho, cur (curiosidad real), foto, abrir }
const centroMunicipio = m => {
  const puntos = m.R.flat();
  return [
    puntos.reduce((s, p) => s + p[0], 0) / puntos.length,
    puntos.reduce((s, p) => s + p[1], 0) / puntos.length
  ];
};
function todosLosLugares() {
  const visitados = monumentosVisitados(),
    lista = [];
  zonas.forEach(z =>
    lista.push({
      tipo: 'z',
      id: z.id,
      n: z.n,
      sub: z.g == 5 ? 'Pueblo de alrededor' : NOMBRES_GRUPOS[z.g],
      la: z.la,
      lo: z.lo,
      hecho: progreso.z[z.id] == 'v',
      cur: z.cur[0] || z.c,
      foto: FOTOS[z.id],
      abrir: () => abrirFicha(z.id)
    })
  );
  MONUMENTOS.forEach(m =>
    lista.push({
      tipo: 'mo',
      id: m.id,
      n: m.n,
      sub: 'Monumento · ' + buscarZona(m.zona).n,
      la: m.la,
      lo: m.lo,
      hecho: visitados.includes(m.id),
      cur: (m.curiosidades || [])[0],
      foto: FOTOS[m.foto],
      abrir: () => abrirMonumento(m.id)
    })
  );
  PROVINCIA.m
    .filter(m => PUEBLOS[m.n] && !m.z && !m.cap)
    .forEach(m => {
      const [la, lo] = centroMunicipio(m);
      lista.push({
        tipo: 'p',
        id: m.k,
        n: m.n,
        sub: 'Pueblo · ' + PROVINCIA.com[m.c],
        la,
        lo,
        hecho: estadoMunicipio(m) == 'v',
        cur: (PUEBLOS[m.n].cur || [])[0],
        foto: null,
        abrir: () => abrirPueblo(m)
      });
    });
  return lista;
}
// ¿Se marcó hoy? (el historial apunta la fecha de lo nuevo: perfil.js)
const hechoHoy = l =>
  ((progreso.j || {}).hi || []).some(([f, t, id]) => f == fechaHoy() && t == l.tipo && id == l.id);

// La última zona pisada (la más reciente del historial), o null
function ultimaZonaPisada() {
  const hi = ((progreso.j || {}).hi || []).filter(([f, t, id]) => t == 'z' && progreso.z[id] == 'v');
  hi.sort((a, b) => (a[0] || '').localeCompare(b[0] || ''));
  const ultima = hi.length ? buscarZona(hi[hi.length - 1][2]) : null;
  return ultima && ultima.id != 'resto' ? ultima : null;
}

// --- Recomendación del día: determinista con la fecha, sin servicios de fuera ------------------------
// Se parte de un punto del listado fijo que depende solo del día y se avanza hasta el primer lugar
// pendiente (o el que se ha completado hoy, para que no cambie en mitad del día).
const semillaDia = f => [...f].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 7);
function recomendacionDelDia(excluir = new Set()) {
  const lugares = todosLosLugares().filter(l => l.cur),
    inicio = semillaDia(fechaHoy()) % lugares.length;
  for (let i = 0; i < lugares.length; i++) {
    const l = lugares[(inicio + i) % lugares.length];
    if (excluir.has(l.tipo + l.id)) continue;
    if (!l.hecho)
      return { lugar: l, porque: 'Aún no lo has pisado. Cada día te proponemos otro sitio pendiente.' };
    if (hechoHoy(l)) return { lugar: l, hechoHoy: true, porque: '¡Ya lo has marcado hoy! Mañana, otro.' };
  }
  return null; // ya está todo pisado
}
// Si no queda ningún lugar pendiente: una ruta por hacer o una etapa de «Salamanca en el tiempo»
function recomendacionGeneral() {
  const semilla = semillaDia(fechaHoy()),
    rutas = todasLasRutas().filter(r => estadoRuta(r.id) != 'v');
  if (rutas.length) {
    const r = rutas[semilla % rutas.length];
    return {
      titulo: r.nombre,
      sub: RUTAS.includes(r) ? 'Ruta a pie' : 'Ruta en coche por la provincia',
      texto: r.resumen,
      porque:
        'Ya has pisado todos los sitios con ficha: por eso te proponemos una ruta que aún no has hecho.',
      abrir: () => abrirRutaPorId(r.id)
    };
  }
  const i = semilla % ETAPAS.length;
  return {
    titulo: ETAPAS[i][1] + ' (' + ETAPAS[i][0] + ')',
    sub: 'Salamanca en el tiempo',
    texto: 'Mira cómo era la ciudad en esa etapa y qué barrios existían ya.',
    porque: 'Lo has visto todo y has hecho todas las rutas: te proponemos repasar la historia de la ciudad.',
    abrir: () => abrirTiempo(i)
  };
}

// --- Continúa explorando: lo que está a medias o apuntado -------------------------------------------
function cosasAMedias() {
  const cosas = [];
  todasLasRutas().forEach(r => {
    const hechas = r.paradas.filter(p => paradaVisitada(r, p)).length;
    if (estadoRuta(r.id) == 'v' || hechas == r.paradas.length) return;
    const pie = RUTAS.includes(r),
      k = (pie ? RUTAS : RUTAS_PROVINCIA).indexOf(r);
    if (hechas > 0) {
      const i = r.paradas.findIndex(p => !paradaVisitada(r, p)),
        p = r.paradas[i],
        nombre = typeof p == 'string' ? buscarMonumento(p).n : p.n;
      cosas.push({
        icono: r.icono,
        titulo: r.nombre,
        texto: 'Llevas ' + hechas + ' de ' + r.paradas.length + ' paradas. Sigue por ' + nombre + '.',
        abrir: () => (pie ? abrirParada(i, k) : abrirParadaProvincia(i, k))
      });
    } else if (estadoRuta(r.id) == 'w')
      cosas.push({
        icono: r.icono,
        titulo: r.nombre,
        texto: 'La tienes en «La quiero hacer».',
        abrir: () => abrirRutaPorId(r.id)
      });
  });
  // Zonas y pueblos en «Quiero ir», lo último apuntado primero
  Object.keys(progreso.z)
    .filter(id => progreso.z[id] == 'w' && buscarZona(id) && id != 'resto')
    .reverse()
    .forEach(id =>
      cosas.push({
        icono: '☆',
        titulo: buscarZona(id).n,
        texto: 'La tienes en «Quiero ir».',
        abrir: () => abrirFicha(id)
      })
    );
  Object.keys(progreso.p || {})
    .filter(k => progreso.p[k] == 'w')
    .reverse()
    .forEach(k => {
      const m = PROVINCIA.m.find(m => m.k == k);
      if (!m) return;
      cosas.push({
        icono: '☆',
        titulo: m.n,
        texto: 'Lo tienes en «Quiero ir».',
        abrir: () => {
          if (PUEBLOS[m.n]) abrirPueblo(m);
          else {
            cerrarFicha();
            cambiarPestana('prov');
            seleccionarPueblo(m, true);
          }
        }
      });
    });
  return cosas;
}

// --- Objetivo: terminar la parte de la ciudad a la que menos le falta, o un monumento -----------------
function objetivoDelDia() {
  const pisadas = zonas.filter(z => progreso.z[z.id] == 'v').length;
  if (!pisadas)
    return {
      titulo: 'Pisa tu primera zona',
      texto: 'El Centro es buen sitio para empezar: la Plaza Mayor está ahí.',
      hecho: 0,
      total: 1,
      lugares: [buscarZona('centro')].map(z => [z.n, () => abrirFicha(z.id)])
    };
  const grupos = NOMBRES_GRUPOS.slice(0, 6)
      .map((nombre, g) => {
        const todas = zonas.filter(z => z.g == g);
        return { nombre, todas, faltan: todas.filter(z => progreso.z[z.id] != 'v') };
      })
      .filter(x => x.faltan.length)
      .sort((a, b) => a.faltan.length - b.faltan.length),
    visitados = monumentosVisitados(),
    monumentos = MONUMENTOS.filter(m => !visitados.includes(m.id));
  const grupo = grupos[0];
  if (grupo && (grupo.faltan.length <= 3 || !monumentos.length))
    return {
      titulo: 'Completa ' + (grupo.nombre.startsWith('Zona') ? 'la ' : 'el ') + grupo.nombre.split(',')[0],
      texto:
        'Te ' +
        (grupo.faltan.length == 1 ? 'falta 1 zona' : 'faltan ' + grupo.faltan.length + ' zonas') +
        ' de ' +
        grupo.todas.length +
        '.',
      hecho: grupo.todas.length - grupo.faltan.length,
      total: grupo.todas.length,
      lugares: grupo.faltan.slice(0, 4).map(z => [z.n, () => abrirFicha(z.id)])
    };
  if (monumentos.length) {
    // El monumento pendiente más cerca de la última zona pisada
    const ref = ultimaZonaPisada() || buscarZona('centro');
    monumentos.sort(
      (a, b) => distanciaKm(ref.la, ref.lo, a.la, a.lo) - distanciaKm(ref.la, ref.lo, b.la, b.lo)
    );
    return {
      titulo: 'Descubre un monumento',
      texto:
        'Llevas ' +
        visitados.length +
        ' de ' +
        MONUMENTOS.length +
        '. Marca «He estado aquí» en su ficha cuando vayas.',
      hecho: visitados.length,
      total: MONUMENTOS.length,
      lugares: monumentos.slice(0, 3).map(m => [m.n, () => abrirMonumento(m.id)])
    };
  }
  return null;
}

// --- Cerca de ti --------------------------------------------------------------------------------------
async function permisoUbicacion() {
  if (EN_MARCO || ubicacionBloqueada()) return 'bloqueada';
  if (!navigator.geolocation || !window.isSecureContext) return 'no';
  try {
    return (await navigator.permissions.query({ name: 'geolocation' })).state;
  } catch (e) {
    return 'prompt';
  }
}
const posicionActual = () =>
  new Promise((ok, mal) =>
    navigator.geolocation.getCurrentPosition(p => ok([p.coords.latitude, p.coords.longitude]), mal, {
      enableHighAccuracy: false,
      timeout: 12000,
      maximumAge: 10 * 60 * 1000
    })
  );
const textoKm = km =>
  km < 1 ? Math.round(km * 10) * 100 + ' m' : (Math.round(km * 10) / 10).toLocaleString('es-ES') + ' km';

function filaLugar(l, detalle) {
  const b = crear(
    'button',
    'fila-explora',
    crear(
      'span',
      'texto',
      crear('b', '', l.n),
      crear('small', '', [l.sub, detalle].filter(Boolean).join(' · '))
    )
  );
  b.onclick = desdeHoy(l.abrir);
  return b;
}

async function pintarCercaDeTi(caja, pedir = false) {
  caja.textContent = '';
  const permiso = await permisoUbicacion();
  let punto = ubicacionReciente() && ubicacion.la ? [ubicacion.la, ubicacion.lo] : null;
  if (!punto && (permiso == 'granted' || (pedir && permiso == 'prompt'))) {
    caja.appendChild(crear('p', 'mu', 'Buscando dónde estás…'));
    try {
      punto = await posicionActual();
    } catch (e) {
      punto = null;
    }
    caja.textContent = '';
  }
  const pendientes = todosLosLugares().filter(l => !l.hecho);
  if (punto) {
    const cerca = pendientes
      .map(l => [distanciaKm(punto[0], punto[1], l.la, l.lo), l])
      .sort((a, b) => a[0] - b[0]);
    if (!cerca.length) {
      caja.appendChild(crear('p', 'mu', 'No te queda nada pendiente con ficha. ¡Enhorabuena!'));
      return;
    }
    const proximos = cerca.filter(([d]) => d <= 15).slice(0, 3);
    caja.appendChild(
      crear(
        'p',
        'mu',
        proximos.length
          ? 'Lo pendiente más cerca de donde estás (distancia en línea recta, no por calles):'
          : 'No tienes nada pendiente a menos de 15 km. Lo más cercano (en línea recta):'
      )
    );
    const lista = crear('div', 'lista-explora');
    (proximos.length ? proximos : cerca.slice(0, 1)).forEach(([d, l]) =>
      lista.appendChild(filaLugar(l, 'a ' + textoKm(d)))
    );
    caja.appendChild(lista);
    return;
  }
  // Sin ubicación: lo que queda junto a la última zona pisada (o junto al Centro)
  const ref = ultimaZonaPisada(),
    base = ref || buscarZona('centro'),
    cercanas = new Set([base, ...(base.vecinos || [])].map(z => z.id)),
    junto = pendientes.filter(
      l =>
        (l.tipo == 'z' && cercanas.has(l.id)) || (l.tipo == 'mo' && cercanas.has(buscarMonumento(l.id).zona))
    );
  const motivo = {
    bloqueada: 'Aquí dentro no se puede usar tu ubicación.',
    no: 'Este navegador no puede usar tu ubicación.',
    denied: 'No has dado permiso para usar tu ubicación (se puede activar en el navegador).',
    prompt: ''
  }[permiso];
  caja.appendChild(
    crear(
      'p',
      'mu',
      (motivo ? motivo + ' ' : '') +
        (ref
          ? 'Esto es lo que te queda junto a ' + ref.n + ', lo último que pisaste:'
          : 'Para empezar, lo que hay en el Centro y alrededor:')
    )
  );
  const lista = crear('div', 'lista-explora');
  junto.slice(0, 4).forEach(l => lista.appendChild(filaLugar(l, '')));
  if (junto.length) caja.appendChild(lista);
  else caja.appendChild(crear('p', 'mu', 'Ya lo tienes todo pisado por esa zona.'));
  if (permiso == 'prompt') {
    const usar = crear('button', 'boton-hoy', '📍 Usar mi ubicación');
    usar.onclick = () => pintarCercaDeTi(caja, true);
    caja.appendChild(
      crear('p', 'mu', 'Si quieres, mira lo que tienes cerca. La ubicación no se guarda ni se envía.')
    );
    caja.appendChild(usar);
  }
}

// --- Ir a una ficha desde «Hoy» y volver ---------------------------------------------------------------
// La ficha que se abre lleva el botón «← ¿Qué puedo descubrir hoy?» (ficha.js) para volver aquí. Como las
// demás fichas, sustituye a esta en el historial: la × y «Atrás» la cierran y se vuelve al mapa.
const desdeHoy = abrir => () => {
  fichaDesdeHoy = true;
  try {
    abrir();
  } finally {
    fichaDesdeHoy = false;
  }
};

// --- La ficha ----------------------------------------------------------------------------------------
const saludo = () => {
  const h = new Date().getHours();
  return h >= 6 && h < 14 ? 'Buenos días' : h >= 14 && h < 21 ? 'Buenas tardes' : 'Buenas noches';
};
const apartadoHoy = (titulo, ...contenido) =>
  crear('section', 'hoy-apartado', crear('h3', '', titulo), ...contenido);

function abrirHoy() {
  activarRuta(false);
  escribirLocal(CLAVE_HOY, fechaHoy());
  const nombre = nombreUsuario(),
    pisadas = todasLasZonas.filter(z => progreso.z[z.id] == 'v').length,
    visitados = monumentosVisitados().length,
    pueblosPisados = pueblos.filter(m => estadoMunicipio(m) == 'v').length,
    nuevo = !pisadas && !visitados && !pueblosPisados,
    fecha = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const caja = fichaLimpia('¿Qué puedo descubrir hoy? · ' + fecha, saludo() + (nombre ? ', ' + nombre : ''));

  // 1. Resumen
  caja.appendChild(
    crear(
      'p',
      'hab',
      nuevo
        ? 'Aún no has marcado nada: hoy es buen día para empezar. Te proponemos por dónde.'
        : 'Llevas ' +
            pisadas +
            ' de ' +
            todasLasZonas.length +
            ' zonas (' +
            nivel(pisadas, todasLasZonas.length) +
            '), ' +
            visitados +
            ' de ' +
            MONUMENTOS.length +
            ' monumentos y ' +
            pueblosPisados +
            (pueblosPisados == 1 ? ' pueblo' : ' pueblos') +
            ' de la provincia.'
    )
  );

  // 2. Recomendación del día (arriba: es lo que cambia cada día)
  const continua = cosasAMedias(),
    rec = recomendacionDelDia();
  const tarjeta = crear('div', 'hoy-rec');
  if (rec) {
    const l = rec.lugar;
    if (l.foto) {
      const img = crear('img');
      img.src = l.foto[0];
      img.alt = l.foto[1].split('. Foto')[0];
      img.loading = 'lazy';
      tarjeta.appendChild(img);
    }
    const abrir = crear('button', 'boton-hoy', rec.hechoHoy ? '✓ Ver su ficha' : 'Ver su ficha');
    abrir.onclick = desdeHoy(l.abrir);
    tarjeta.append(
      crear('small', '', l.sub),
      crear('b', '', l.n),
      crear('p', '', l.cur),
      crear('p', 'mu', 'Por qué hoy: ' + rec.porque),
      abrir
    );
  } else {
    const g = recomendacionGeneral(),
      abrir = crear('button', 'boton-hoy', 'Verla');
    abrir.onclick = desdeHoy(g.abrir);
    tarjeta.append(
      crear('small', '', g.sub),
      crear('b', '', g.titulo),
      crear('p', '', g.texto),
      crear('p', 'mu', 'Por qué hoy: ' + g.porque),
      abrir
    );
  }
  caja.appendChild(apartadoHoy('🌟 La recomendación de hoy', tarjeta));

  // 3. Continúa explorando
  const medias = crear('div', 'lista-explora');
  continua.slice(0, 3).forEach(c => {
    const b = crear(
      'button',
      'fila-explora',
      crear('span', 'icono-hoy', c.icono),
      crear('span', 'texto', crear('b', '', c.titulo), crear('small', '', c.texto))
    );
    b.onclick = desdeHoy(c.abrir);
    medias.appendChild(b);
  });
  if (continua.length) caja.appendChild(apartadoHoy('↩️ Continúa explorando', medias));
  else {
    const rutas = crear('button', 'boton-hoy', 'Ver las rutas');
    rutas.onclick = desdeHoy(abrirRutas);
    caja.appendChild(
      apartadoHoy(
        '↩️ Continúa explorando',
        crear(
          'p',
          'mu',
          'Aún no tienes nada a medias. Cuando marques «Quiero ir» en una zona o empieces una ruta, saldrá aquí para que sigas.'
        ),
        rutas
      )
    );
  }

  // 4. Cerca de ti (se rellena aparte: puede tardar en saber la ubicación)
  const cerca = crear('div', 'hoy-cerca');
  caja.appendChild(apartadoHoy('📍 Cerca de ti', cerca));
  pintarCercaDeTi(cerca);

  // 5. Objetivo
  const obj = objetivoDelDia();
  if (obj) {
    const chips = crear('div', 'nb');
    obj.lugares.forEach(([n, abrir]) => {
      const b = crear('button', '', n);
      b.onclick = desdeHoy(abrir);
      chips.appendChild(b);
    });
    const barra = crear('div', 'pb hoy-barra', crear('i'));
    barra.firstChild.style.width = Math.round((obj.hecho / obj.total) * 100) + '%';
    barra.setAttribute('role', 'img');
    barra.setAttribute('aria-label', obj.hecho + ' de ' + obj.total);
    caja.appendChild(
      apartadoHoy(
        '🎯 Tu objetivo',
        crear('b', 'hoy-obj', obj.titulo),
        crear('p', '', obj.texto),
        barra,
        chips
      )
    );
  }

  // 6. Accesos directos
  const accesos = crear('div', 'hoy-accesos');
  [
    ['🗺️', 'Mapa', () => cerrarFicha()],
    [
      '🔍',
      'Buscar',
      () => {
        cerrarFicha();
        $('#q').focus();
      }
    ],
    ['🚶', 'Rutas', desdeHoy(abrirRutas)]
  ].forEach(([icono, texto, alPulsar]) => {
    const b = crear('button', '', crear('span', 'ico', icono), texto);
    b.onclick = alPulsar;
    accesos.appendChild(b);
  });
  caja.appendChild(accesos);

  // Que salga sola cada día o no
  const auto = crear('input');
  auto.type = 'checkbox';
  auto.id = 'hoyauto';
  auto.checked = hoyAutomatica();
  auto.onchange = () => escribirLocal(CLAVE_HOY_AUTO, auto.checked ? '1' : '0');
  const etiqueta = crear(
    'label',
    'hoy-auto',
    auto,
    ' Enseñarme esto la primera vez que abra la app cada día'
  );
  caja.appendChild(etiqueta);

  $('#ap').textContent =
    'Todo sale de lo que has marcado y de las fichas de la app; la recomendación cambia cada día. Nada de esto se envía a ningún sitio.';
  mostrarFicha();
  if (!esEscritorio()) $('#sh').classList.add('grande');
  enlaceFicha('hoy', '¿Qué puedo descubrir hoy?');
}

$('#volverhoy').onclick = () => abrirHoy();
