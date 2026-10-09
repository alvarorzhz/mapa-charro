// Juego «¿Dónde está?»: 10 pistas (curiosidades, leyendas, fotos y monumentos) y hay que tocar en el
// mapa la zona a la que pertenecen. Acertar da 100 puntos; fallar, menos cuanto más lejos.
// El reto del día es el mismo para todos (se elige con la fecha); después se puede jugar libre.
// Progreso: progreso.j = { m: mejor puntuación, d: fecha del último reto del día, s: sus puntos }

const RONDAS_JUEGO = 10,
  PUNTOS_ACIERTO = 100;
const juego = {
  activo: false,
  diario: false,
  preguntas: [],
  ronda: 0,
  puntos: 0,
  resultados: [], // puntos de cada ronda
  respondida: false
};

// Fecha local AAAA-MM-DD
const fechaHoy = () => {
  const d = new Date();
  return (
    d.getFullYear() +
    '-' +
    String(d.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(d.getDate()).padStart(2, '0')
  );
};

// Números al azar repetibles a partir de una semilla (mulberry32)
function azarConSemilla(semilla) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const semillaDeTexto = s => [...s].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261);

// Quita de la pista el nombre de la zona (y sus palabras principales) para no regalar la respuesta
const PALABRAS_COMUNES = new Set(['Barrio', 'Ciudad', 'Puente', 'Santa', 'Santo', 'Calle', 'Plaza']);
function taparNombre(texto, z) {
  const nombres = new Set([z.n, z.n.replace(/^(El|La|Los|Las) /, ''), z.l.replace(/\|/g, ' ')]);
  z.n.split(/[\s-]+/).forEach(p => p.length >= 5 && !PALABRAS_COMUNES.has(p) && nombres.add(p));
  [...nombres]
    .filter(n => n.length >= 4)
    .sort((a, b) => b.length - a.length)
    .forEach(n => {
      const escapado = n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      texto = texto.replace(new RegExp('(?<!\\p{L})' + escapado + '(?!\\p{L})', 'gu'), '…');
    });
  return texto;
}

// Las primeras frases de un texto, sin pasar de «maximo» caracteres
function primerasFrases(texto, maximo) {
  if (texto.length <= maximo) return texto;
  const frases = texto.match(/[^.!?]+[.!?]+/g) || [texto];
  let r = '';
  for (const f of frases) {
    if ((r + f).length > maximo) break;
    r += f;
  }
  return (r || texto.slice(0, maximo - 1) + '…').trim();
}

// Todas las pistas posibles: { tipo, texto | foto, zona }
function pistasPosibles() {
  const lista = [];
  zonas.forEach(z => {
    z.cur.forEach(t => lista.push({ tipo: 'Curiosidad', texto: taparNombre(t, z), zona: z }));
    z.ly.forEach(t =>
      lista.push({ tipo: 'Leyenda', texto: taparNombre(primerasFrases(t, 260), z), zona: z })
    );
    if (FOTOS[z.id]) lista.push({ tipo: 'Foto', foto: FOTOS[z.id][0], zona: z });
  });
  MONUMENTOS.forEach(m => {
    const z = zonas.find(q => q.id == m.zona);
    if (z) lista.push({ tipo: 'Monumento', texto: '¿En qué zona está «' + m.n + '»?', zona: z });
  });
  return lista;
}

// Elige las pistas de una partida: una por zona y variadas (como mucho 3 fotos y 2 monumentos)
function elegirPistas(azar) {
  const todas = pistasPosibles(),
    maximo = { Foto: 3, Monumento: 2, Leyenda: 2, Curiosidad: RONDAS_JUEGO },
    cuenta = {},
    usadas = new Set(),
    elegidas = [];
  // Barajar (Fisher-Yates)
  for (let i = todas.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [todas[i], todas[j]] = [todas[j], todas[i]];
  }
  for (const p of todas) {
    if (elegidas.length == RONDAS_JUEGO) break;
    if (usadas.has(p.zona.id) || (cuenta[p.tipo] || 0) >= maximo[p.tipo]) continue;
    usadas.add(p.zona.id);
    cuenta[p.tipo] = (cuenta[p.tipo] || 0) + 1;
    elegidas.push(p);
  }
  return elegidas;
}

// Puntos según la distancia en km entre el centro de la zona tocada y el de la buena
const puntosPorDistancia = km => Math.round(80 * Math.exp(-km / 1.2));
const formatoKm = km => (km < 1 ? Math.round(km * 1000) + ' m' : km.toFixed(1).replace('.', ',') + ' km');

// --- Capa del mapa con la solución ------------------------------------------
const capaJuego = crearSvg('g', { id: 'jgo', style: 'pointer-events:none', 'aria-hidden': 'true' });
mapaSvg.insertBefore(capaJuego, $('#rl'));

function pintarSolucion(tocada, buena) {
  capaJuego.textContent = '';
  if (tocada != buena) {
    crearSvg('path', { d: trazoAnillo(tocada.P), class: 'jmal' }, capaJuego);
    crearSvg('line', { x1: tocada.x, y1: tocada.y, x2: buena.x, y2: buena.y, class: 'jlin' }, capaJuego);
  }
  crearSvg('path', { d: trazoAnillo(buena.P), class: 'jbien' }, capaJuego);
}

// Que la zona buena quede a la vista (en el móvil, por encima del panel): si no se ve, se aleja el
// mapa lo justo para que quepan lo que se estaba viendo y la zona buena
function verZonaBuena(z) {
  const v = vistaMapa,
    W = tamMapa.w || 380,
    visible = mapaVisiblePx(),
    altoVisible = (visible / (tamMapa.h || 400)) * v.h;
  if (z.x > v.x && z.x < v.x + v.w && z.y > v.y && z.y < v.y + altoVisible) return;
  const margen = v.w * 0.08,
    x0 = Math.min(v.x, z.x - margen),
    x1 = Math.max(v.x + v.w, z.x + margen),
    y0 = Math.min(v.y, z.y - margen),
    y1 = Math.max(v.y + altoVisible, z.y + margen),
    w = Math.max(x1 - x0, ((y1 - y0) * W) / visible);
  animarVista({ x: (x0 + x1) / 2 - w / 2, y: y0, w }, 420);
}

// Encuadra la ciudad entera en lo que queda de mapa a la vista
function encuadrarCiudad() {
  pararAnimacion();
  terminarGesto();
  const P = zonas.filter(z => z.g < 5).flatMap(z => z.P),
    xs = P.map(q => q[0]),
    ys = P.map(q => q[1]),
    ancho = Math.max(...xs) - Math.min(...xs),
    alto = Math.max(...ys) - Math.min(...ys),
    W = tamMapa.w || 380;
  // Centrada en lo que queda a la vista (en el móvil, la parte de arriba que deja el panel)
  const fraccionVisible = mapaVisiblePx() / (tamMapa.h || 400);
  vistaMapa.w = Math.max(ancho, (alto * W) / mapaVisiblePx()) * 1.04;
  vistaMapa.h = vistaMapa.w * proporcionMapa();
  vistaMapa.x = (Math.max(...xs) + Math.min(...xs)) / 2 - vistaMapa.w / 2;
  vistaMapa.y = (Math.max(...ys) + Math.min(...ys)) / 2 - (vistaMapa.h * fraccionVisible) / 2;
  ajustarVista();
}

// --- Panel -----------------------------------------------------------------
const panelJuego = crear('aside', 'sh jg');
panelJuego.id = 'jp';
panelJuego.setAttribute('aria-live', 'polite');
panelJuego.setAttribute('role', 'region');
panelJuego.setAttribute('aria-label', 'Juego ¿Dónde está?');
document.body.appendChild(panelJuego);

function pintarPanelJuego() {
  const p = panelJuego,
    q = juego.preguntas[juego.ronda],
    cerrar = crear('button', 'jx', '×');
  cerrar.setAttribute('aria-label', 'Salir del juego');
  cerrar.onclick = () => pedirSalirJuego();
  p.textContent = '';
  p.append(
    cerrar,
    crear(
      'small',
      '',
      (juego.diario ? 'Reto del día' : 'Partida libre') +
        ' · ' +
        (juego.ronda + 1) +
        ' de ' +
        RONDAS_JUEGO +
        ' · ' +
        juego.puntos +
        ' puntos'
    ),
    crear('h2', '', q.tipo)
  );
  const cuerpo = crear('div', 'sb');
  if (q.foto) {
    const img = crear('img', 'jfoto');
    img.src = q.foto;
    img.alt = 'Foto de la pista';
    cuerpo.appendChild(img);
  } else cuerpo.appendChild(crear('p', 'jpista', q.texto));
  if (!juego.respondida)
    cuerpo.appendChild(
      crear(
        'p',
        'mu',
        'Pulsa en el mapa la zona (puedes acercar y mover el mapa). Con teclado: flechas para moverte e Intro para responder.'
      )
    );
  else {
    const r = juego.ultima;
    cuerpo.appendChild(
      crear(
        'p',
        'jres ' + (r.acierto ? 'ok' : 'mal'),
        r.acierto
          ? '¡Vítor! Era ' + q.zona.n + '. +' + r.puntos
          : 'Era ' + q.zona.n + '; has tocado ' + r.tocada.n + ', a ' + formatoKm(r.km) + '. +' + r.puntos
      )
    );
    const ultima = juego.ronda == RONDAS_JUEGO - 1,
      seguir = crear('button', 'on', ultima ? 'Ver resultado' : 'Siguiente');
    seguir.onclick = ultima ? terminarJuego : siguientePregunta;
    cuerpo.appendChild(crear('div', 'botones', seguir));
  }
  p.appendChild(cuerpo);
}

// Cuadros de colores de cada ronda, para compartir el resultado
const cuadroResultado = pts => (pts >= PUNTOS_ACIERTO ? '🟩' : pts >= 40 ? '🟨' : pts > 0 ? '🟧' : '🟥');

function pintarFinalJuego(mejorAntes) {
  const p = panelJuego,
    cerrar = crear('button', 'jx', '×'),
    total = RONDAS_JUEGO * PUNTOS_ACIERTO,
    aciertos = juego.resultados.filter(x => x >= PUNTOS_ACIERTO).length,
    record = juego.puntos > mejorAntes;
  cerrar.setAttribute('aria-label', 'Salir del juego');
  cerrar.onclick = salirJuego;
  p.textContent = '';
  const compartirBoton = crear('button', 'on', 'Compartir resultado'),
    otra = crear('button', '', 'Otra partida'),
    salir = crear('button', '', 'Salir');
  compartirBoton.onclick = compartirResultadoJuego;
  otra.onclick = () => empezarJuego(false);
  salir.onclick = salirJuego;
  p.append(
    cerrar,
    crear(
      'small',
      '',
      juego.diario ? 'Reto del día · ' + fechaHoy().split('-').reverse().join('/') : 'Partida libre'
    ),
    crear('h2', '', juego.puntos + ' de ' + total + ' puntos'),
    crear(
      'div',
      'sb',
      crear('p', 'jcuadros', juego.resultados.map(cuadroResultado).join('')),
      crear(
        'p',
        '',
        aciertos +
          (aciertos == 1 ? ' acierto' : ' aciertos') +
          ' de ' +
          RONDAS_JUEGO +
          '. ' +
          (record ? '¡Nuevo récord!' : 'Tu récord: ' + mejorAntes + ' puntos.')
      ),
      juego.diario
        ? crear('p', 'mu', 'Mañana hay un reto nuevo. Mientras, puedes jugar partidas libres.')
        : null,
      crear('div', 'botones', compartirBoton, otra, salir)
    )
  );
}

// --- Partida ----------------------------------------------------------------
function empezarJuego(diario) {
  if (typeof cerrarFicha == 'function' && $('#sh').classList.contains('o')) {
    cerrarFicha();
    volverEnlace();
  }
  cerrarVentana();
  if (pestana != 'map') cambiarPestana('map');
  const j = progreso.j || {};
  juego.diario = diario && j.d != fechaHoy();
  juego.preguntas = elegirPistas(
    juego.diario
      ? azarConSemilla(semillaDeTexto(fechaHoy()))
      : azarConSemilla(Date.now() ^ (Math.random() * 1e9))
  );
  juego.ronda = juego.puntos = 0;
  juego.resultados = [];
  juego.respondida = false;
  juego.porTeclado = false;
  juego.activo = true;
  capaJuego.textContent = '';
  document.body.classList.add('jugando');
  encuadrarCiudad();
  pintarPanelJuego();
  panelJuego.classList.add('o');
  $('#mn').classList.add('o');
  // En el móvil, que el mapa quede arriba, a la vista
  if (!esEscritorio()) {
    const arriba = document.querySelector('.mw').getBoundingClientRect().top;
    if (Math.abs(arriba - 8) > 4)
      window.scrollTo({ top: window.scrollY + arriba - 8, behavior: comoDesplazar() });
  }
}

function responderJuego(z) {
  if (!juego.activo || juego.respondida) return;
  const buena = juego.preguntas[juego.ronda].zona,
    acierto = z == buena,
    km = acierto ? 0 : distanciaKm(z.la, z.lo, buena.la, buena.lo),
    puntos = acierto ? PUNTOS_ACIERTO : puntosPorDistancia(km);
  juego.respondida = true;
  juego.ultima = { acierto, km, puntos, tocada: z };
  juego.puntos += puntos;
  juego.resultados.push(puntos);
  pintarSolucion(z, buena);
  verZonaBuena(buena);
  pintarPanelJuego();
  if (acierto) aviso('¡Vítor! +' + puntos, { tipo: 'exito' });
}

function siguientePregunta() {
  juego.ronda++;
  juego.respondida = false;
  capaJuego.textContent = '';
  pintarPanelJuego();
  panelJuego.querySelector('.sb').scrollTop = 0;
  // Con teclado, de vuelta al mapa para responder la siguiente (mapa-teclado.js)
  if (juego.porTeclado) zonaConFoco.e.focus({ preventScroll: true });
}

function terminarJuego() {
  conAvisoDeLogros(terminarJuegoYGuardar);
}
function terminarJuegoYGuardar() {
  const j = progreso.j || {},
    mejorAntes = j.m || 0;
  progreso.j = {
    ...j,
    m: Math.max(mejorAntes, juego.puntos),
    d: juego.diario ? fechaHoy() : j.d || '',
    s: juego.diario ? juego.puntos : j.s || 0,
    h: juego.diario ? [...new Set([...(j.h || []), fechaHoy()])] : j.h || [],
    pf: j.pf || juego.resultados.every(x => x >= PUNTOS_ACIERTO) ? 1 : 0,
    n: (j.n || 0) + 1
  };
  guardar();
  capaJuego.textContent = '';
  encuadrarCiudad();
  pintarFinalJuego(mejorAntes);
}

// ¿Hay una partida empezada y sin terminar? (con alguna pista ya respondida)
const juegoAMedias = () =>
  juego.activo && juego.resultados.length < RONDAS_JUEGO && (juego.ronda > 0 || juego.respondida);

// Salir del juego a petición de la persona: si va a medias, antes se pregunta. «luego», si se sale.
function pedirSalirJuego(luego = () => {}) {
  if (!juegoAMedias()) {
    salirJuego();
    return luego();
  }
  const hechas = juego.ronda + (juego.respondida ? 1 : 0);
  abrirVentana(
    juego.diario ? '¿Dejar el reto del día?' : '¿Dejar la partida?',
    crear(
      'p',
      '',
      'Llevas ' +
        juego.puntos +
        ' puntos en ' +
        hechas +
        ' de ' +
        RONDAS_JUEGO +
        ' pistas. Si sales, esta partida se pierde' +
        (juego.diario ? '; el reto de hoy lo podrás volver a empezar.' : '.')
    ),
    [
      ['Seguir jugando', cerrarVentana, 'on'],
      [
        'Salir',
        () => {
          cerrarVentana();
          salirJuego();
          luego();
        }
      ]
    ]
  );
}

function salirJuego() {
  juego.activo = false;
  capaJuego.textContent = '';
  document.body.classList.remove('jugando');
  panelJuego.classList.remove('o');
  if (!$('#sh').classList.contains('o')) $('#mn').classList.remove('o');
  ajustarVista();
}

async function compartirResultadoJuego() {
  const texto =
    '🎯 ¿Dónde está? · Mapa charro\n' +
    (juego.diario ? 'Reto del ' + fechaHoy().split('-').reverse().join('/') : 'Partida libre') +
    ': ' +
    juego.puntos +
    '/' +
    RONDAS_JUEGO * PUNTOS_ACIERTO +
    '\n' +
    juego.resultados.map(cuadroResultado).join('') +
    '\n' +
    WEB;
  try {
    if (navigator.share) {
      await navigator.share({ text: texto });
      return;
    }
  } catch (e) {
    if (e && e.name == 'AbortError') return;
  }
  try {
    await navigator.clipboard.writeText(texto);
    aviso('Resultado copiado', { tipo: 'exito' });
  } catch (e) {
    aviso('No se ha podido copiar el resultado', { tipo: 'error' });
  }
}

// Botón: el reto del día si aún no se ha jugado hoy; si ya, una partida libre.
// Pulsado con el teclado (e.detail == 0), el foco pasa al mapa para responder con las flechas.
$('#jug').onclick = e => {
  const yaHoy = (progreso.j || {}).d == fechaHoy();
  empezarJuego(true);
  if (yaHoy) aviso('Reto de hoy hecho: partida libre');
  if (e.detail == 0) {
    juego.porTeclado = true;
    zonaConFoco.e.focus({ preventScroll: true });
  }
};
