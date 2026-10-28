// Pruebas rápidas de la lógica que solo calcula (fechas, rachas, agenda, sol, sw.js), sin navegador: tardan menos de
// un segundo y van antes de las del navegador (herramientas/pruebas.js), que tardan minutos.
// Uso, desde la raíz del repositorio:  node herramientas/pruebas-logica.js
// Carga con vm los datos y los scripts de LOGICA en un mismo contexto, como hace el navegador con index.html,
// con un document y un window de mentira que aceptan cualquier cosa: aquí no se pinta nada.
const vm = require('vm');
const fs = require('fs');
const path = require('path');
const { sinExport } = require('./datos');
const { igual, cierto } = require('./pruebas/comun');

const RAIZ = path.join(__dirname, '..');
// En el orden de index.html; solo los que hacen falta para las pruebas de abajo
const LOGICA = [
  'js/util.js',
  'js/estado.js',
  'js/logros.js',
  'js/agenda.js',
  'js/hora-dorada.js',
  'js/mi-salamanca-calculos.js'
];

// Un objeto que se deja leer, llamar y construir sin fallar (para el DOM que tocan los scripts al cargar)
const cualquiera = () =>
  new Proxy(function () {}, {
    get: (_, k) => (k == Symbol.toPrimitive ? () => '' : k == 'then' ? undefined : cualquiera()),
    apply: () => cualquiera(),
    construct: () => cualquiera()
  });

function cargarApp() {
  const ctx = vm.createContext({
    console,
    document: cualquiera(),
    window: cualquiera(),
    navigator: cualquiera(),
    location: cualquiera(),
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    addEventListener() {},
    setTimeout,
    clearTimeout
  });
  for (const f of fs.readdirSync(path.join(RAIZ, 'js/datos')).sort())
    vm.runInContext(sinExport(fs.readFileSync(path.join(RAIZ, 'js/datos', f), 'utf8')), ctx, { filename: f });
  for (const f of LOGICA) vm.runInContext(fs.readFileSync(path.join(RAIZ, f), 'utf8'), ctx, { filename: f });
  // Las declaraciones de arriba (const, function) se leen evaluando su nombre en el contexto
  return nombre => vm.runInContext(nombre, ctx);
}

const pruebas = [];
const prueba = (nombre, fn) => pruebas.push({ nombre, fn });
const dia = d =>
  d.getFullYear() +
  '-' +
  String(d.getMonth() + 1).padStart(2, '0') +
  '-' +
  String(d.getDate()).padStart(2, '0');

// --- Fechas (util.js) ---------------------------------------------------------
prueba('Fechas: el día es el de Salamanca aunque en UTC aún sea el anterior', app => {
  const diaEnSalamanca = app('diaEnSalamanca');
  igual(diaEnSalamanca(new Date('2026-10-27T23:30:00Z')), '2026-10-28', 'invierno (UTC+1)');
  igual(diaEnSalamanca(new Date('2026-07-01T22:30:00Z')), '2026-07-02', 'verano (UTC+2)');
  igual(diaEnSalamanca(new Date('2026-07-01T21:30:00Z')), '2026-07-01', 'verano, antes de medianoche');
  igual(app('fechaHoy')(), diaEnSalamanca(), 'fechaHoy es el día de Salamanca');
  igual(dia(app('hoyEnSalamanca')()), diaEnSalamanca(), 'hoyEnSalamanca, ese mismo día');
});

prueba('Fechas: sumar días cruza meses, años y cambios de hora', app => {
  const sumarDias = app('sumarDias');
  igual(sumarDias('2026-12-31', 1), '2027-01-01', 'fin de año');
  igual(sumarDias('2026-03-01', -1), '2026-02-28', 'febrero');
  igual(sumarDias('2026-03-28', 2), '2026-03-30', 'cambio de hora de marzo');
  igual(sumarDias('2026-10-24', 2), '2026-10-26', 'cambio de hora de octubre');
});

prueba('Fechas: texto en español', app => {
  const textoFecha = app('textoFecha');
  igual(textoFecha('2026-10-28'), '28 de octubre de 2026', 'por defecto');
  igual(
    textoFecha('2026-10-28', { weekday: 'long', day: 'numeric', month: 'long' }),
    'miércoles, 28 de octubre',
    'con el día'
  );
});

// --- Textos (util.js, logros.js) ----------------------------------------------
prueba('Textos: sin tildes y en minúsculas, y slugs', app => {
  igual(app('normalizar')('Ávila, PEÑARANDA y Güeña'), 'avila, penaranda y guena', 'normalizar');
  igual(app('slug')('  ¡La Plaza Mayor! '), 'la-plaza-mayor', 'slug quita los guiones de los extremos');
  igual(app('slugLogro')('Plaza Mayor!'), 'plaza-mayor-', 'slugLogro los deja (ids ya guardados)');
});

// --- Rachas del reto del día (logros.js) ----------------------------------------
prueba('Rachas: días seguidos hasta hoy, o hasta ayer si hoy aún no se ha jugado', app => {
  const sumarDias = app('sumarDias'),
    hoy = app('fechaHoy')(),
    progreso = app('estadoApp').progreso,
    racha = h => ((progreso.j = { h }), app('rachaReto')());
  igual(racha([hoy, sumarDias(hoy, -1), sumarDias(hoy, -2)]), 3, 'tres días hasta hoy');
  igual(racha([sumarDias(hoy, -1), sumarDias(hoy, -2)]), 2, 'hasta ayer');
  igual(racha([sumarDias(hoy, -2)]), 0, 'se cortó anteayer');
  igual(racha([]), 0, 'sin jugar');
  progreso.j = { h: ['2026-02-27', '2026-02-28', '2026-03-01', '2026-03-03'] };
  igual(app('mejorRacha')(), 3, 'la mejor racha cruza el fin de febrero');
  progreso.j = { h: ['2026-01-01'], rm: 9 };
  igual(app('mejorRacha')(), 9, 'o la apuntada, si es mayor');
  delete progreso.j;
});

// --- Agenda (agenda.js) ---------------------------------------------------------
prueba('Agenda: Pascua y fiestas que dependen de ella', app => {
  const pascua = app('domingoDeResurreccion');
  igual(dia(pascua(2025)), '2025-04-20', '2025');
  igual(dia(pascua(2026)), '2026-04-05', '2026');
  igual(dia(pascua(2027)), '2027-03-28', '2027');
  igual(dia(app('fechaDeAgenda')('P-46', 2026)), '2026-02-18', 'Miércoles de Ceniza');
  igual(dia(app('fechaDeAgenda')('P+8', 2026)), '2026-04-13', 'Lunes de Aguas');
});

prueba('Agenda: próximas citas ordenadas y sin ninguna ya pasada', app => {
  const hoy = new Date(2026, 9, 18),
    citas = app('proximasCitas')(hoy);
  cierto(citas.length > 0, 'hay citas');
  cierto(
    citas.every((x, i) => x.hasta >= hoy && x.dentro >= 0 && (!i || citas[i - 1].desde <= x.desde)),
    'ordenadas por fecha y sin pasadas'
  );
  cierto(
    citas.every(x => x.dentro == Math.max(0, app('diasEntre')(hoy, x.desde))),
    'los días que faltan cuadran con la fecha'
  );
});

// --- Sol (hora-dorada.js) -------------------------------------------------------
prueba('Sol: altura a mediodía en Salamanca en los solsticios', app => {
  const sol = app('posicionSol'),
    verano = sol(new Date('2026-06-21T12:24:00Z')),
    invierno = sol(new Date('2026-12-21T12:20:00Z'));
  cierto(Math.abs(verano.altura - 72.5) < 0.5, 'en verano, unos 72,5° (es ' + verano.altura.toFixed(2) + ')');
  cierto(
    Math.abs(invierno.altura - 25.6) < 0.5,
    'en invierno, unos 25,6° (es ' + invierno.altura.toFixed(2) + ')'
  );
  cierto(Math.abs(verano.acimut - 180) < 3, 'mirando al sur');
});

// --- Tu Salamanca (mi-salamanca-calculos.js) --------------------------------------
prueba('Tu Salamanca: inicio de cada periodo', app => {
  const inicio = app('inicioPeriodo'),
    hoy = new Date(2026, 9, 28);
  igual(dia(inicio('12m', hoy)), '2025-11-01', 'últimos 12 meses');
  igual(dia(inicio('año', hoy)), '2026-01-01', 'este año');
  igual(inicio('todo', hoy), null, 'siempre');
});

// --- Modo sin conexión (sw.js) --------------------------------------------------
// El service worker, con unas cachés y una red de mentira que apuntan lo que se pide
function cargarSw(codigo, almacen, pedidos) {
  const escuchas = {};
  // Como la Cache API: las direcciones, completas (relativas a la web) y de un Request, su url
  const clave = u => new URL(u.url || String(u), 'http://web/').href,
    sinBusqueda = u => clave(u).split('?')[0];
  const abrir = async k => {
    if (!almacen.has(k)) almacen.set(k, new Map());
    const m = almacen.get(k);
    return {
      put: async (u, r) => m.set(clave(u), r),
      match: async (u, o) =>
        m.get(clave(u)) ||
        (o && o.ignoreSearch ? [...m].find(([k]) => sinBusqueda(k) == sinBusqueda(u))?.[1] : undefined)
    };
  };
  const caches = {
    keys: async () => [...almacen.keys()],
    open: abrir,
    delete: async k => almacen.delete(k),
    match: async (u, o) => {
      for (const k of almacen.keys()) {
        const r = await (await abrir(k)).match(u, o);
        if (r) return r;
      }
    }
  };
  const ctx = vm.createContext({
    self: {
      addEventListener: (t, f) => (escuchas[t] = f),
      skipWaiting: async () => {},
      clients: { claim: async () => {} },
      registration: { scope: 'http://web/' }
    },
    location: { origin: 'http://web' },
    caches,
    fetch: async u => (
      pedidos.push(String(u)),
      {
        ok: true,
        type: 'basic',
        clone() {
          return this;
        }
      }
    ),
    URL,
    Request: class {
      constructor(u) {
        this.url = u;
      }
    },
    setTimeout,
    clearTimeout
  });
  vm.runInContext(codigo, ctx, { filename: 'sw.js' });
  const esperar = async tipo => {
    let espera;
    escuchas[tipo]({ waitUntil: p => (espera = p) });
    await espera;
  };
  return {
    instalar: async () => (await esperar('install'), await esperar('activate')),
    pedir: async url => {
      let respuesta;
      escuchas.fetch({ request: { method: 'GET', url, mode: 'no-cors' }, respondWith: r => (respuesta = r) });
      return respuesta;
    }
  };
}

prueba('Sin conexión: una versión nueva solo baja lo que ha cambiado', async () => {
  const sw = fs.readFileSync(path.join(RAIZ, 'sw.js'), 'utf8'),
    archivos = [...sw.match(/const ARCHIVOS = \[([\s\S]*?)\];/)[1].matchAll(/'([^']+)'/g)].map(m => m[1]),
    almacen = new Map(),
    pedidos = [];
  await cargarSw(sw, almacen, pedidos).instalar();
  igual(pedidos.length, archivos.length, 'la primera vez lo baja todo');
  // Versión siguiente en la que solo ha cambiado util.js
  const nueva = sw
    .replace(/const VERSION = (\d+);/, (_, n) => 'const VERSION = ' + (+n + 1) + ';')
    .replace(/'js\/util\.js\?v=[0-9a-f]+'/, "'js/util.js?v=otra'");
  pedidos.length = 0;
  const otra = cargarSw(nueva, almacen, pedidos);
  await otra.instalar();
  igual(almacen.size, 1, 'la copia vieja se borra');
  igual(
    pedidos.filter(u => u.includes('?v=')),
    ['js/util.js?v=otra'],
    'de lo que lleva huella, solo baja lo que ha cambiado'
  );
  cierto(
    pedidos.every(u => u.includes('?v=') || !/^(js|css|img)\//.test(u)),
    'y sin huella, solo la página, el manifest y los iconos (' + pedidos.join(', ') + ')'
  );
  pedidos.length = 0;
  cierto(await otra.pedir('http://web/img/tejares.jpg'), 'las fotos se piden sin ?v= y salen de la copia');
  igual(pedidos, [], 'sin ir a la red');
});

// --- Ejecución ----------------------------------------------------------------
const app = cargarApp();
let fallos = 0;
(async () => {
  for (const { nombre, fn } of pruebas)
    try {
      await fn(app);
      console.log('✓ ' + nombre);
    } catch (e) {
      fallos++;
      console.log('✗ ' + nombre + '\n    ' + e.message);
    }
  console.log(
    fallos ? `\n${fallos} prueba(s) fallida(s)` : `\nTodas las pruebas de lógica pasan (${pruebas.length}).`
  );
  process.exit(fallos ? 1 : 0);
})();
