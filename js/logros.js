// Logros. Cada logro es { id, n (nombre), d (descripción), c (llevas), m (meta), cat (categoría, para su
// medalla) }; está conseguido si c >= m. Los ids solo se usan para saber cuáles acaban de conseguirse
// (no se guardan), pero conviene no cambiarlos.
//
// Se generan solos a partir de los datos, con dos moldes:
//   escalones(): de un contador (zonas pisadas, monumentos, partidas…) salen varios logros con metas
//                crecientes; «mitad» y «todo» se calculan con el total, así que crecen con los datos
//   coleccion(): «todas las de…» un grupo de cosas; se crea uno por cada grupo de zonas, época, ruta,
//                comarca y estilo de monumento. Al añadir una ruta, una época o un estilo, su logro sale solo.

// Visitas y usos guardados en progreso.j (ver estado.js)
const datoJ = (campo, vacio) => (progreso.j && progreso.j[campo]) || vacio;
const monumentosVisitados = () => datoJ('mo', []);
const paradasVisitadas = idRuta => datoJ('r', {})[idRuta] || [];
const paradaVisitada = (ruta, p) =>
  typeof p == 'string' ? monumentosVisitados().includes(p) : paradasVisitadas(ruta.id).includes(p.id);
const rutaCompleta = r => r.paradas.every(p => paradaVisitada(r, p));

// Días seguidos con el reto del día hecho, hasta hoy (o hasta ayer, si hoy aún no se ha jugado)
function rachaReto() {
  const dias = new Set(datoJ('h', [])),
    d = new Date(),
    texto = f =>
      f.getFullYear() +
      '-' +
      String(f.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(f.getDate()).padStart(2, '0');
  if (!dias.has(texto(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (dias.has(texto(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

// Moldes
const escalones = (cat, c, total, metas) =>
  metas
    .map(([id, meta, n, d]) => {
      const m = meta == 'todo' ? total : meta == 'mitad' ? Math.ceil(total / 2) : meta;
      return { id, cat, n, d: d.replace('{m}', m), c, m };
    })
    .filter((a, i, l) => a.m > 0 && a.m <= total && l.findIndex(o => o.m == a.m) == i); // sin metas repetidas
const coleccion = (id, cat, n, d, cosas, hecha) =>
  cosas.length >= 2 ? [{ id, cat, n, d, c: cosas.filter(hecha).length, m: cosas.length }] : [];
const slugLogro = t =>
  t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-');

// Nombre del logro de cada grupo de zonas (NOMBRES_GRUPOS); si se añade un grupo, sale «<grupo> completo»
const LOGRO_DE_GRUPO = [
  'Casco completo',
  'Norte completo',
  'Este completo',
  'Oeste completo',
  'Sur completo',
  'Vuelta al alfoz'
];
// Estilos de los monumentos que dan logro, si hay dos o más de ese estilo
const ESTILOS_LOGRO = [
  ['Plateresco', 'Ruta plateresca'],
  ['Barroco', 'Ruta barroca'],
  ['Románico', 'Ruta románica'],
  ['Gótico', 'Ruta gótica'],
  ['Renacentista', 'Ruta renacentista'],
  ['Modernista', 'Ruta modernista']
];

function calcularLogros() {
  const pisada = id => progreso.z[id] == 'v',
    pisadas = todasLasZonas.filter(z => pisada(z.id)),
    j = progreso.j || {},
    gps = (progreso.gv || []).length,
    pueblosPisados = pueblos.filter(m => estadoMunicipio(m) == 'v'),
    pedaniasPisadas = pedanias.filter(p => estadoClave(p.k) == 'v'),
    ciudad = z => z.g < 5;
  return [
    // --- Zonas del mapa ---
    ...escalones('zonas', pisadas.length, todasLasZonas.length, [
      ['p', 1, 'Primer vítor', 'Marca tu primer sitio como «He estado»'],
      ['e', 10, 'Explorador', 'Pisa {m} zonas'],
      ['z25', 25, 'Callejero', 'Pisa {m} zonas'],
      ['h', 'mitad', 'Medio mapa', 'Pisa la mitad de las zonas ({m})'],
      ['t', 'todo', 'Charro de pura cepa', 'Pisa todas las zonas ({m})']
    ]),
    ...NOMBRES_GRUPOS.flatMap((nombre, g) =>
      coleccion(
        'k' + g,
        'grupo',
        LOGRO_DE_GRUPO[g] || nombre + ': completo',
        g == 5
          ? 'Pisa los pueblos de alrededor'
          : 'Pisa toda la ' + nombre.toLowerCase().replace('zona sur, al otro lado del tormes', 'zona sur'),
        todasLasZonas.filter(z => z.g == g),
        z => pisada(z.id)
      )
    ).map(a => (a.id == 'k0' ? { ...a, d: 'Pisa todo el casco histórico' } : a)),
    ...coleccion(
      'gr',
      'zonas',
      'Los grandes',
      'Pisa los grandes barrios (Garrido, Pizarrales, Prosperidad…)',
      zonas.filter(z => z.t && ciudad(z)),
      z => pisada(z.id)
    ),
    ...coleccion(
      'ly',
      'leyendas',
      'Cazador de leyendas',
      'Pisa todas las zonas que tienen leyenda',
      zonas.filter(z => z.ly.length),
      z => pisada(z.id)
    ),
    {
      id: 'rv',
      cat: 'rio',
      n: 'Cruzar el Tormes',
      d: 'Pisa 3 barrios del sur y 3 del norte',
      c: Math.min(pisadas.filter(z => z.g == 4).length, 3) + Math.min(pisadas.filter(z => z.g < 4).length, 3),
      m: 6
    },
    {
      id: 'wi',
      cat: 'deseo',
      n: 'Soñador',
      d: 'Apunta 5 sitios como «Quiero ir»',
      c: Object.values(progreso.z).filter(x => x == 'w').length,
      m: 5
    },
    {
      id: 'fr',
      cat: 'rana',
      n: 'Rana a la vista',
      d: 'Encuentra la rana escondida en el mapa',
      c: progreso.f ? 1 : 0,
      m: 1
    },
    ...escalones('gps', gps, Infinity, [
      ['g1', 1, 'Aquí mismo', 'Marca un sitio estando en él, con el botón Estoy aquí'],
      ['g5', 5, 'Con las botas puestas', 'Marca {m} sitios estando en ellos'],
      ['g15', 15, 'Suela gastada', 'Marca {m} sitios estando en ellos']
    ]),
    // --- Fichas y «Salamanca en el tiempo» ---
    ...escalones('lectura', datoJ('fl', []).length, zonas.length, [
      ['fl10', 10, 'Curioso', 'Abre la ficha de {m} zonas'],
      ['flt', 'todo', 'Enciclopedia charra', 'Abre la ficha de todas las zonas ({m})']
    ]),
    ...coleccion(
      'et',
      'epoca',
      'Viaje en el tiempo',
      'Recorre todas las etapas de «Salamanca en el tiempo»',
      ETAPAS.map((_, i) => i),
      i => datoJ('et', []).includes(i)
    ),
    ...ETAPAS.flatMap(([anio, nombre], i) =>
      coleccion(
        'ep' + i,
        'epoca',
        nombre,
        'Pisa las zonas que nacen en esta época (' + anio + ')',
        zonas.filter(z => EPOCA_ZONA[z.id] && EPOCA_ZONA[z.id][0] == i),
        z => pisada(z.id)
      )
    ),
    // --- Monumentos y rutas a pie ---
    ...escalones('monumento', monumentosVisitados().length, MONUMENTOS.length, [
      ['mo1', 1, 'Primera visita', 'Visita un monumento (pulsa «He estado aquí» en su ficha)'],
      ['mo5', 5, 'Turista de primera', 'Visita {m} monumentos'],
      ['mot', 'todo', 'Guía de la ciudad', 'Visita todos los monumentos del mapa ({m})']
    ]),
    ...ESTILOS_LOGRO.flatMap(([estilo, nombre]) =>
      coleccion(
        'es-' + slugLogro(estilo),
        'monumento',
        nombre,
        'Visita los monumentos de estilo ' + estilo.toLowerCase(),
        MONUMENTOS.filter(m => (m.estilo || '').toLowerCase().includes(estilo.toLowerCase())),
        m => monumentosVisitados().includes(m.id)
      )
    ),
    ...[...RUTAS, ...RUTAS_PROVINCIA].map(r => ({
      id: 'ru-' + r.id,
      cat: 'ruta',
      n: r.nombre,
      d: 'Pasa por todas sus paradas (pulsa «He estado aquí» en cada una)',
      c: r.paradas.filter(p => paradaVisitada(r, p)).length,
      m: r.paradas.length
    })),
    ...coleccion('ru-todas', 'ruta', 'Andarín', 'Completa todas las rutas a pie', RUTAS, rutaCompleta),
    // Rutas marcadas con «La he hecho» (j.rs, ruta.js)
    ...escalones('ruta', rutasHechas().length, RUTAS.length + RUTAS_PROVINCIA.length, [
      ['rh1', 1, 'Primera ruta', 'Marca una ruta como «La he hecho»'],
      ['rh3', 3, 'Rutero', 'Haz {m} rutas'],
      ['rht', 'todo', 'Trotamundos charro', 'Haz todas las rutas, a pie y en coche ({m})']
    ]),
    ...coleccion(
      'rhp',
      'ruta',
      'De ruta por la provincia',
      'Haz todas las rutas en coche por la provincia',
      RUTAS_PROVINCIA,
      r => estadoRuta(r.id) == 'v'
    ),
    // --- Reto del día ---
    ...escalones('reto', datoJ('n', 0), Infinity, [
      ['jn1', 1, 'Primera partida', 'Termina una partida de «¿Dónde está?»'],
      ['jn10', 10, 'Jugador habitual', 'Termina {m} partidas']
    ]),
    ...escalones('reto', rachaReto(), Infinity, [
      ['jr3', 3, 'Tres en raya', 'Haz el reto del día {m} días seguidos'],
      ['jr7', 7, 'Semana charra', 'Haz el reto del día {m} días seguidos'],
      ['jr30', 30, 'Mes charro', 'Haz el reto del día {m} días seguidos']
    ]),
    {
      id: 'j8',
      cat: 'reto',
      n: 'Buen ojo',
      d: 'Saca 800 puntos o más en una partida',
      c: j.m >= 800 ? 1 : 0,
      m: 1
    },
    { id: 'j10', cat: 'reto', n: 'Pleno', d: 'Acierta las 10 pistas de una partida', c: j.pf ? 1 : 0, m: 1 },
    // --- Compartir ---
    {
      id: 'ms',
      cat: 'compartir',
      n: 'Mi Salamanca',
      d: 'Crea la imagen de «Mi Salamanca»',
      c: datoJ('ms', 0) ? 1 : 0,
      m: 1
    },
    ...escalones('compartir', datoJ('cp', 0), Infinity, [
      ['cp3', 3, 'Embajador', 'Comparte {m} sitios con alguien']
    ]),
    // --- Palabras charras (palabras.js) ---
    ...escalones('palabras', datoJ('pv', []).length, PALABRAS_CHARRAS.length, [
      ['pa1', 1, 'Hablas charro', 'Descubre tu primera palabra charra'],
      ['pam', 'mitad', 'Pejilguero', 'Descubre {m} palabras charras'],
      ['pat', 'todo', 'Charro lígrimo', 'Descubre las {m} palabras charras']
    ]),
    // --- Provincia ---
    ...escalones('provincia', pueblosPisados.filter(m => !m.z).length, Infinity, [
      ['p1', 1, 'Saliendo del alfoz', 'Pisa tu primer pueblo de la provincia (pestaña Provincia)']
    ]),
    ...escalones('provincia', pueblosPisados.length, pueblos.length, [
      ['pu10', 10, 'Dominguero', 'Pisa {m} pueblos de la provincia'],
      ['p25', 25, 'Trotapueblos', 'Pisa {m} pueblos de la provincia'],
      ['p100', 100, 'Charro de mapa entero', 'Pisa {m} pueblos de la provincia']
    ]),
    ...escalones('provincia', pedaniasPisadas.length, pedanias.length, [
      ['pe1', 1, 'De anejo en anejo', 'Pisa una pedanía'],
      ['pe10', 10, 'Pedáneo', 'Pisa {m} pedanías']
    ]),
    ...coleccion(
      'pfi',
      'provincia',
      'Pueblos con historia',
      'Pisa los pueblos que tienen ficha',
      pueblos.filter(m => PUEBLOS[m.n]),
      m => estadoMunicipio(m) == 'v'
    ),
    ...coleccion(
      'tch',
      'comarca',
      'Tierra charra',
      'Pisa un pueblo de cada comarca',
      PROVINCIA.com.map((_, ci) => ci),
      ci => pueblosPisados.some(m => m.c == ci)
    ),
    ...PROVINCIA.com.flatMap((nombre, ci) =>
      coleccion(
        'co' + ci,
        'comarca',
        nombre + ' al completo',
        'Pisa todos los pueblos de la comarca',
        pueblos.filter(m => m.c == ci),
        m => estadoMunicipio(m) == 'v'
      )
    )
  ];
}

// Cosas hechas con la app que cuentan para los logros (en progreso.j): con valor, lo añade a esa
// lista (fichas abiertas, etapas vistas); sin valor, suma 1 (partidas, veces que se comparte)
function apuntarUso(campo, valor) {
  const j = (progreso.j = progreso.j || {});
  if (valor !== undefined && (j[campo] || []).includes(valor)) return;
  conAvisoDeLogros(() => {
    if (valor === undefined) j[campo] = (j[campo] || 0) + 1;
    else j[campo] = [...(j[campo] || []), valor];
    guardar({ uso: true });
    actualizar();
  });
}

// --- Visitar un monumento o una parada propia de una ruta ---------------------------------
// visitaAbierta: lo que muestra la ficha ahora, si se puede marcar como visitado
//   { tipo: 'mo', id, n } o { tipo: 'ru', ruta, id, n }
let visitaAbierta = null;
const estaVisitada = v =>
  v.tipo == 'mo' ? monumentosVisitados().includes(v.id) : paradasVisitadas(v.ruta).includes(v.id);
function ponerVisita(v, si) {
  const j = (progreso.j = progreso.j || {});
  if (v.tipo == 'mo') {
    const mo = new Set(j.mo || []);
    si ? mo.add(v.id) : mo.delete(v.id);
    j.mo = [...mo];
  } else {
    j.r = j.r || {};
    const r = new Set(j.r[v.ruta] || []);
    si ? r.add(v.id) : r.delete(v.id);
    j.r[v.ruta] = [...r];
  }
  guardar();
  actualizar();
  pintarBotonesFicha();
}
function marcarVisita(v = visitaAbierta) {
  if (!v) return;
  conAvisoDeLogros(() => {
    if (estaVisitada(v)) {
      ponerVisita(v, false);
      aviso(v.n + ': quitado de «He estado aquí»', {
        accion: [
          'Deshacer',
          () => {
            ponerVisita(v, true);
            aviso('Recuperado: ' + v.n, { tipo: 'exito' });
          }
        ]
      });
    } else {
      ponerVisita(v, true);
      aviso('¡Vítor! ' + v.n + (progresoDeLogro(v) ? ' · ' + progresoDeLogro(v) : ''), { tipo: 'exito' });
    }
  });
}
// «3 de 9 en Ruta monumental»: cómo va el logro al que suma una visita
function progresoDeLogro(v) {
  const id = v.tipo == 'ru' ? 'ru-' + v.ruta : rutaActiva ? 'ru-' + rutaActual().id : 'mot',
    a = calcularLogros().find(x => x.id == id);
  return a && a.c < a.m ? a.c + ' de ' + a.m + ' en «' + a.n + '»' : '';
}

// --- Pintar: el siguiente logro, a la vista, y la lista con medallas -----------------------
const MEDALLAS = {
  zonas: '📍',
  grupo: '🧭',
  leyendas: '📜',
  rio: '🌉',
  deseo: '⭐',
  rana: '🐸',
  gps: '🥾',
  provincia: '🗺️',
  comarca: '🌾',
  epoca: '🏰',
  ruta: '🚶',
  monumento: '🏛️',
  reto: '🎯',
  lectura: '📖',
  compartir: '📣',
  palabras: '🗣️'
};
const conseguido = a => a.c >= a.m;
// El siguiente: el empezado al que menos le falta (en proporción); si no hay, el primero sin empezar
function siguienteLogro(logros) {
  const pendientes = logros.filter(a => !conseguido(a));
  return (
    pendientes.filter(a => a.c > 0).sort((a, b) => b.c / b.m - a.c / a.m || a.m - a.c - (b.m - b.c))[0] ||
    pendientes[0]
  );
}
const barra = fraccion => {
  const i = crear('i');
  i.style.width = Math.round(Math.min(1, fraccion) * 100) + '%';
  return crear('span', 'pb', i);
};

// Logro al que suma una zona al marcarla («5 de 7 en Norte completo»): el de su grupo
function progresoDeZona(z) {
  const a = calcularLogros().find(x => x.id == 'k' + z.g);
  return a && a.c < a.m ? a.c + ' de ' + a.m + ' en «' + a.n + '»' : '';
}

function pintarLogros() {
  const logros = calcularLogros(),
    caja = $('#lga'),
    hechos = logros.filter(conseguido).length;
  // Resumen plegado: cuántos, con su barra
  const resumen = $('#lgs');
  resumen.textContent = '';
  resumen.append('Logros (' + hechos + '/' + logros.length + ')', barra(hechos / logros.length));
  // El siguiente, siempre a la vista bajo el marcador; al pulsarlo se abre la lista
  const sig = siguienteLogro(logros),
    linea = $('#sig');
  linea.textContent = '';
  linea.hidden = !sig;
  if (sig) {
    linea.append(
      crear('span', 'medalla', MEDALLAS[sig.cat] || '🏆'),
      crear(
        'span',
        'texto',
        crear('b', '', 'Siguiente logro: ' + sig.n),
        crear('small', '', sig.d + ' · ' + Math.min(sig.c, sig.m) + ' de ' + sig.m)
      ),
      crear('span', 'cuenta-sig', Math.min(sig.c, sig.m) + '/' + sig.m), // en el móvil, en vez de la descripción
      barra(sig.c / sig.m)
    );
    linea.onclick = () => {
      $('#lgr').open = true;
      const categoria = CATEGORIAS_LOGRO.find(c => c[2].includes(sig.cat));
      if (categoria) {
        categoriasAbiertas.add(categoria[0]);
        pintarLogros();
      }
      $('#lgr').scrollIntoView({ behavior: comoDesplazar(), block: 'start' });
    };
  }
  // Lista plegada por categorías: en cada cabecera, su medalla, cuántos y su barra. Dentro, primero los
  // empezados (los más cerca, arriba), luego los que faltan y al final los conseguidos.
  const orden = a => (conseguido(a) ? 2 : a.c > 0 ? 0 : 1);
  caja.textContent = '';
  CATEGORIAS_LOGRO.forEach(([nombre, medalla, cats]) => {
    const deLaCategoria = logros.filter(a => cats.includes(a.cat));
    if (!deLaCategoria.length) return;
    const hechosCat = deLaCategoria.filter(conseguido).length,
      plegable = crear(
        'details',
        'cat-logros' + (hechosCat == deLaCategoria.length ? ' completa' : ''),
        crear(
          'summary',
          '',
          crear('span', 'medalla' + (hechosCat ? ' con' : ''), medalla),
          crear(
            'span',
            'texto',
            crear('b', '', nombre),
            crear('small', '', hechosCat + ' de ' + deLaCategoria.length)
          ),
          barra(hechosCat / deLaCategoria.length)
        )
      );
    plegable.dataset.cat = nombre;
    plegable.open = categoriasAbiertas.has(nombre);
    plegable.ontoggle = () =>
      plegable.open ? categoriasAbiertas.add(nombre) : categoriasAbiertas.delete(nombre);
    [...deLaCategoria]
      .sort((a, b) => orden(a) - orden(b) || b.c / b.m - a.c / a.m)
      .forEach(a => {
        const hecho = conseguido(a),
          cuenta = Math.min(a.c, a.m);
        plegable.appendChild(
          crear(
            'div',
            'ac' + (hecho ? ' ok' : ''),
            crear('span', 'st', hecho ? '✓' : ''),
            crear(
              'div',
              'texto',
              crear('b', '', a.n),
              crear('small', '', a.d + ' · ' + (hecho ? 'conseguido' : cuenta + ' de ' + a.m))
            ),
            barra(cuenta / a.m)
          )
        );
      });
    caja.appendChild(plegable);
  });
}
// Categorías de la lista de logros: [nombre, medalla, categorías de los logros (cat)]
const CATEGORIAS_LOGRO = [
  ['Barrios y zonas', '📍', ['zonas', 'grupo']],
  ['Pisado con GPS', '🥾', ['gps']],
  ['Provincia', '🗺️', ['provincia']],
  ['Comarcas', '🌾', ['comarca']],
  ['Monumentos', '🏛️', ['monumento']],
  ['Rutas', '🚶', ['ruta']],
  ['Historia', '🏰', ['epoca']],
  ['Lectura', '📖', ['lectura']],
  ['Reto «¿Dónde está?»', '🎯', ['reto']],
  ['Palabras charras', '🗣️', ['palabras']],
  ['Compartir', '📣', ['compartir']],
  ['Sorpresas', '🐸', ['leyendas', 'rio', 'deseo', 'rana']]
];
const categoriasAbiertas = new Set(); // las que se han abierto, para que sigan abiertas al repintar

// Ejecuta «cambio» y, si con él se consigue algún logro nuevo, lo anuncia después del aviso del cambio
function conAvisoDeLogros(cambio) {
  const antes = new Set(
    calcularLogros()
      .filter(a => a.c >= a.m)
      .map(a => a.id)
  );
  cambio();
  const nuevos = calcularLogros().filter(a => a.c >= a.m && !antes.has(a.id));
  // Después del aviso del cambio; si hay uno con «Deshacer» a la vista, se espera a que se vaya
  const avisarLogro = () =>
    $('#ts').classList.contains('con-accion')
      ? setTimeout(avisarLogro, 800)
      : aviso(
          '🏆 Logro: ' + nuevos[0].n + (nuevos.length > 1 ? ' (y ' + (nuevos.length - 1) + ' más)' : ''),
          {
            tipo: 'logro'
          }
        );
  if (nuevos.length) setTimeout(avisarLogro, 2100);
}

// La rana escondida en una esquina del mapa
$('#fr').onclick = () => {
  const primeraVez = !progreso.f;
  progreso.f = 1;
  guardar();
  actualizar();
  aviso('¡Has encontrado la rana!', { tipo: 'logro' });
  if (primeraVez) setTimeout(() => aviso('🏆 Logro: Rana a la vista', { tipo: 'logro' }), 2100);
};
