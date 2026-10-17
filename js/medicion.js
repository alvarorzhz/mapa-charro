// Medición local: tiempos de carga, lo que se usa y pruebas de tareas, para saber si un cambio mejora de
// verdad. Se ve en el «Laboratorio» (Ayuda). Todo se queda en este navegador (charro-medicion, en
// localStorage, no en el progreso ni en la cuenta): no se envía a ningún sitio y no lleva nada personal.
// Solo se apuntan tipos de tarea («abrir una zona», «marcar»), nunca qué sitio; tiempos en milisegundos;
// la fecha (sin hora) y la versión de la app. Se puede borrar desde el propio panel.

const CLAVE_MEDICION = 'charro-medicion';
const MAX_CARGAS = 30;
const MAX_VISITAS = 30;
const MAX_PRUEBAS = 60;
// { c: cargas [{ v, f, dom, todo, mapa, lcp, cache }], s: visitas [{ v, f, t: { tarea: ms desde que se
// abrió la app } }], u: usos { tarea: veces }, p: pruebas [{ id, v, f, ms, toques, ok }] }
const leerMedicion = () => {
  const m = leerLocalJson(CLAVE_MEDICION, {});
  return {
    c: Array.isArray(m.c) ? m.c : [],
    s: Array.isArray(m.s) ? m.s : [],
    u: m.u && typeof m.u == 'object' ? m.u : {},
    p: Array.isArray(m.p) ? m.p : []
  };
};
const guardarMedicion = m => escribirLocal(CLAVE_MEDICION, JSON.stringify(m));
// La versión de la app (la de package.json, que version.js copia en index.html)
const versionApp = () => (document.querySelector('meta[name="version"]') || {}).content || '';
const fechaMedida = () => new Date().toISOString().slice(0, 10);

// Esta visita: lo primero que se hace y cuándo (se guarda la primera vez de cada tarea)
const visitaMedida = { v: versionApp(), f: fechaMedida(), t: {} };
let visitaGuardada = false;

// Una tarea hecha: la cuenta, su primera vez en esta visita, la prueba en curso y el primer paseo
function apuntarTarea(tarea) {
  if (!tarea) return;
  const m = leerMedicion();
  m.u[tarea] = (m.u[tarea] || 0) + 1;
  if (!(tarea in visitaMedida.t)) {
    visitaMedida.t[tarea] = Math.round(performance.now());
    if (!visitaGuardada) m.s = [...m.s, visitaMedida].slice(-MAX_VISITAS);
    else m.s[m.s.length - 1] = visitaMedida;
    visitaGuardada = true;
  }
  guardarMedicion(m);
  if (pruebaEnCurso && pruebaEnCurso.prueba[2].includes(tarea)) terminarPrueba(true);
  if (typeof avanzarPaseo == 'function') avanzarPaseo(tarea); // paseo.js
}

// El tipo de ficha por su dirección (enlaces.js), sin el sitio concreto
function tareaDeFicha(h) {
  const [a, b] = h.split('/');
  if (typeof todasLasZonas != 'undefined' && todasLasZonas.some(z => z.id == a)) return 'zona';
  if (a == 'tu-salamanca') return b == 'logros' ? 'logros' : b == 'actividad' ? 'diario' : 'resumen';
  if (a == 'cultura') return b ? 'cultura-ficha' : 'cultura';
  if (a.startsWith('ruta-') && RUTAS_PROVINCIA.some(r => a == 'ruta-' + r.id)) return 'ruta-coche';
  if (a == 'ruta' || a.startsWith('ruta-')) return 'ruta-pie';
  return a || '';
}
const apuntarFicha = h => apuntarTarea(tareaDeFicha(h));

// --- Tiempos de carga -------------------------------------------------------------------------------
// «mapa»: cuando el mapa ya está pintado y la app responde (lo llama inicio.js); «lcp»: lo más grande
// que se pinta (si el navegador lo dice); «cache»: si la página la sirvió el modo sin conexión
let mapaListo = 0,
  mayorPintado = 0;
const marcarMapaListo = () => (mapaListo = Math.round(performance.now()));
try {
  new PerformanceObserver(lista => {
    const ultima = lista.getEntries().pop();
    if (ultima) mayorPintado = Math.round(ultima.startTime);
  }).observe({ type: 'largest-contentful-paint', buffered: true });
} catch (e) {
  // sin ese dato en este navegador
}
addEventListener('load', () =>
  setTimeout(() => {
    const n = (performance.getEntriesByType && performance.getEntriesByType('navigation')[0]) || {},
      m = leerMedicion();
    m.c = [
      ...m.c,
      {
        v: versionApp(),
        f: fechaMedida(),
        dom: Math.round(n.domContentLoadedEventEnd || 0),
        todo: Math.round(n.loadEventEnd || performance.now()),
        mapa: mapaListo,
        lcp: mayorPintado,
        cache: !!(navigator.serviceWorker && navigator.serviceWorker.controller)
      }
    ].slice(-MAX_CARGAS);
    guardarMedicion(m);
  }, 2000)
);

// --- Pruebas de tareas ------------------------------------------------------------------------------
// [id, qué hay que hacer, tareas que la dan por hecha]. Se cronometra desde «Empezar» y se cuentan los toques.
const PRUEBAS_TAREAS = [
  ['marcar', 'Marca un barrio como «He estado» o «Quiero ir»', ['marca']],
  ['monumento', 'Abre la ficha de un monumento', ['monumento']],
  ['comer', 'Encuentra un sitio para comer y abre su ficha', ['comer-sitio']],
  ['ruta-coche', 'Abre una ruta en coche por la provincia', ['ruta-coche']],
  ['agenda', 'Encuentra la próxima fiesta en la Agenda', ['agenda']],
  ['logros', 'Mira cuántos logros llevas', ['logros']]
];
let pruebaEnCurso = null; // { prueba, inicio, toques, reloj }

function empezarPrueba(id) {
  const prueba = PRUEBAS_TAREAS.find(p => p[0] == id);
  if (!prueba) return;
  cerrarVentana();
  if ($('#sh').classList.contains('o')) cerrarFicha();
  window.scrollTo({ top: 0 });
  if (pruebaEnCurso) terminarPrueba(false, true);
  const abandonar = crear('button', 'enlace', 'Abandonar'),
    reloj = crear('span', 'reloj', '0 s'),
    caja = crear('div', '', crear('span', '', '🧪 ', crear('b', '', prueba[1])), reloj, abandonar);
  caja.id = 'prueba';
  caja.setAttribute('role', 'status');
  abandonar.onclick = () => terminarPrueba(false);
  document.body.appendChild(caja);
  pruebaEnCurso = {
    prueba,
    inicio: performance.now(),
    toques: 0,
    reloj: setInterval(() => (reloj.textContent = segundos(performance.now() - pruebaEnCurso.inicio)), 1000)
  };
}
// Los toques (y clics) durante la prueba, sin contar los de su propia barra
addEventListener(
  'pointerdown',
  e => pruebaEnCurso && !e.target.closest('#prueba') && pruebaEnCurso.toques++,
  true
);

function terminarPrueba(hecha, sinAviso = false) {
  if (!pruebaEnCurso) return;
  const { prueba, inicio, toques, reloj } = pruebaEnCurso,
    ms = Math.round(performance.now() - inicio),
    m = leerMedicion();
  clearInterval(reloj);
  pruebaEnCurso = null;
  if ($('#prueba')) $('#prueba').remove();
  m.p = [...m.p, { id: prueba[0], v: versionApp(), f: fechaMedida(), ms, toques, ok: hecha }].slice(
    -MAX_PRUEBAS
  );
  guardarMedicion(m);
  if (!sinAviso)
    aviso(
      hecha
        ? '🧪 Prueba hecha: ' + segundos(ms) + ' y ' + toques + (toques == 1 ? ' toque' : ' toques')
        : '🧪 Prueba abandonada',
      { tipo: hecha ? 'exito' : 'info', discreto: true }
    );
}

// --- El laboratorio ---------------------------------------------------------------------------------
const segundos = ms => (ms / 1000).toFixed(ms < 10000 ? 1 : 0).replace('.', ',') + ' s';
const mediana = lista => {
  const l = [...lista].sort((a, b) => a - b);
  return l.length ? (l.length % 2 ? l[(l.length - 1) / 2] : (l[l.length / 2 - 1] + l[l.length / 2]) / 2) : 0;
};
const NOMBRES_TAREAS = {
  zona: 'Abrir una zona',
  marca: 'Marcar algo',
  monumento: 'Ficha de monumento',
  monumentos: 'Lista de monumentos',
  pueblo: 'Ficha de pueblo',
  hoy: '¿Qué puedo descubrir hoy?',
  buscar: 'Buscar',
  rutas: 'Lista de rutas',
  'ruta-pie': 'Ruta a pie',
  'ruta-coche': 'Ruta en coche',
  comer: 'Dónde comer',
  'comer-sitio': 'Un sitio para comer',
  cultura: 'Cultura',
  'cultura-ficha': 'Ficha de cultura',
  agenda: 'Agenda',
  detalles: 'Detalles escondidos',
  detalle: 'Un detalle escondido',
  resumen: 'Tu Salamanca: resumen',
  diario: 'Tu Salamanca: diario',
  logros: 'Tu Salamanca: logros',
  tiempo: 'Salamanca en el tiempo',
  via: 'Carretera o avenida',
  'paseo-hecho': 'Primer paseo hecho',
  'paseo-saltado': 'Primer paseo saltado'
};

// Una fila «qué · cifra»
const filaLab = (que, cifra) => crear('div', 'fila-lab', crear('span', '', que), crear('b', '', cifra));

function apartadoCargas(m) {
  const caja = crear('section', 'lab-apartado', crear('h3', '', '⏱️ Tiempos de carga'));
  if (!m.c.length) {
    caja.appendChild(crear('p', 'mu', 'Aún no hay ninguna carga medida: vuelve después de recargar.'));
    return caja;
  }
  const ultima = m.c[m.c.length - 1],
    porVersion = {};
  m.c.forEach(c => (porVersion[c.v] = [...(porVersion[c.v] || []), c]));
  caja.append(
    crear('p', 'mu', 'La última (' + (ultima.cache ? 'desde el modo sin conexión' : 'desde la red') + '):'),
    filaLab('Mapa listo', segundos(ultima.mapa)),
    filaLab('Página leída (DOM)', segundos(ultima.dom)),
    filaLab('Todo cargado', segundos(ultima.todo)),
    ultima.lcp ? filaLab('Lo más grande pintado', segundos(ultima.lcp)) : '',
    crear('p', 'mu', 'Mapa listo, mediana por versión (y cuántas cargas):')
  );
  Object.entries(porVersion)
    .slice(-4)
    .forEach(([v, cargas]) =>
      caja.appendChild(
        filaLab(
          'Versión ' + v,
          segundos(mediana(cargas.map(c => c.mapa).filter(Boolean))) + ' · ' + cargas.length
        )
      )
    );
  return caja;
}

function apartadoPrimeras(m) {
  const caja = crear('section', 'lab-apartado', crear('h3', '', '👣 Lo primero de cada visita'));
  const visitas = m.s.filter(s => s.v == versionApp());
  caja.appendChild(
    crear(
      'p',
      'mu',
      'Cuánto se tarda, desde que se abre la app, en hacer cada cosa por primera vez (mediana de ' +
        visitas.length +
        (visitas.length == 1 ? ' visita' : ' visitas') +
        ' con esta versión):'
    )
  );
  ['zona', 'marca', 'hoy', 'buscar'].forEach(t => {
    const tiempos = visitas.map(s => s.t[t]).filter(x => x > 0);
    caja.appendChild(
      filaLab(NOMBRES_TAREAS[t], tiempos.length ? segundos(mediana(tiempos)) + ' · ' + tiempos.length : '—')
    );
  });
  return caja;
}

function apartadoUsos(m) {
  const caja = crear('section', 'lab-apartado', crear('h3', '', '📊 Lo que más se usa'));
  const usos = Object.entries(m.u)
    .filter(([t]) => NOMBRES_TAREAS[t])
    .sort((a, b) => b[1] - a[1]);
  if (!usos.length) caja.appendChild(crear('p', 'mu', 'Aún nada.'));
  usos.slice(0, 10).forEach(([t, n]) => caja.appendChild(filaLab(NOMBRES_TAREAS[t], String(n))));
  return caja;
}

function apartadoPruebas(m) {
  const caja = crear(
    'section',
    'lab-apartado',
    crear('h3', '', '🧪 Pruebas de tareas'),
    crear(
      'p',
      'mu',
      'Pide a alguien que haga una tarea sin ayuda y cronométrala: se apunta el tiempo y los toques. Repítela tras un cambio para ver si mejora.'
    )
  );
  PRUEBAS_TAREAS.forEach(([id, texto]) => {
    const hechas = m.p.filter(p => p.id == id && p.v == versionApp()),
      bien = hechas.filter(p => p.ok),
      empezar = crear('button', '', 'Empezar');
    empezar.onclick = () => empezarPrueba(id);
    caja.appendChild(
      crear(
        'div',
        'prueba-lab',
        crear(
          'span',
          'texto',
          crear('b', '', texto),
          crear(
            'small',
            '',
            hechas.length
              ? bien.length +
                  ' de ' +
                  hechas.length +
                  ' acabadas' +
                  (bien.length
                    ? ' · mediana ' +
                      segundos(mediana(bien.map(p => p.ms))) +
                      ' y ' +
                      Math.round(mediana(bien.map(p => p.toques))) +
                      ' toques'
                    : '')
              : 'Sin probar en esta versión'
          )
        ),
        empezar
      )
    );
  });
  return caja;
}

// Un resumen en texto, para copiarlo y compartirlo si se quiere (el panel no envía nada)
function resumenMedicion(m = leerMedicion()) {
  const ultima = m.c[m.c.length - 1];
  return [
    'Mapa charro ' + versionApp() + ' · laboratorio (' + fechaMedida() + ')',
    ultima
      ? 'Carga: mapa listo ' +
        segundos(ultima.mapa) +
        ', todo ' +
        segundos(ultima.todo) +
        (ultima.cache ? ' (sin conexión)' : '')
      : '',
    'Mediana mapa listo: ' +
      segundos(
        mediana(
          m.c
            .filter(c => c.v == versionApp())
            .map(c => c.mapa)
            .filter(Boolean)
        )
      ),
    ...PRUEBAS_TAREAS.map(([id, texto]) => {
      const bien = m.p.filter(p => p.id == id && p.v == versionApp() && p.ok);
      return bien.length
        ? texto + ': ' + segundos(mediana(bien.map(p => p.ms))) + ' (' + bien.length + ')'
        : '';
    }),
    // Lo primero de cada visita y lo que más se usa (tipos de tarea, nunca qué sitio)
    ...['zona', 'marca', 'hoy', 'buscar'].map(t => {
      const tiempos = m.s.filter(s => s.v == versionApp() && s.t[t] > 0).map(s => s.t[t]);
      return tiempos.length
        ? 'Primera vez, ' +
            NOMBRES_TAREAS[t] +
            ': ' +
            segundos(mediana(tiempos)) +
            ' (' +
            tiempos.length +
            ')'
        : '';
    }),
    'Usos: ' +
      Object.entries(m.u)
        .filter(([t]) => NOMBRES_TAREAS[t])
        .sort((a, b) => b[1] - a[1])
        .map(([t, n]) => NOMBRES_TAREAS[t] + ' ' + n)
        .join(', ')
  ]
    .filter(Boolean)
    .join('\n');
}

function abrirLaboratorio(volverA = document.activeElement) {
  const m = leerMedicion(),
    caja = crear(
      'div',
      'laboratorio',
      crear(
        'p',
        'hab',
        'Para saber si un cambio mejora de verdad. Se queda en este navegador: no se envía a ningún sitio ni guarda nada personal (ni qué sitios, ni dónde estás).'
      ),
      apartadoCargas(m),
      apartadoPrimeras(m),
      apartadoPruebas(m),
      apartadoUsos(m)
    );
  abrirVentana(
    'Laboratorio',
    caja,
    [
      // Para que nos llegue: solo si la persona lo envía desde su correo (CORREO_AVISOS, avisar.js)
      [
        'Enviárnoslo',
        () =>
          (location.href =
            'mailto:' +
            CORREO_AVISOS +
            '?subject=' +
            encodeURIComponent('Datos de uso del Mapa charro ' + versionApp()) +
            '&body=' +
            encodeURIComponent(resumenMedicion()))
      ],
      [
        'Copiar',
        () =>
          navigator.clipboard
            .writeText(resumenMedicion())
            .then(() => aviso('Resumen copiado', { tipo: 'exito', discreto: true }))
            .catch(() => aviso('No se ha podido copiar', { tipo: 'error' }))
      ],
      [
        'Borrar mediciones',
        () => {
          escribirLocal(CLAVE_MEDICION, null);
          visitaGuardada = false;
          abrirLaboratorio(volverA);
          aviso('Mediciones borradas', { tipo: 'info', discreto: true });
        }
      ]
    ],
    volverA
  );
}
