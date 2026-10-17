// «Mi Salamanca», los cálculos (las piezas del panel están en mi-salamanca-piezas.js y el panel en
// mi-salamanca.js): el panel de estadísticas personales (#mi-salamanca), con la capital y la provincia por
// separado. Todo se calcula al abrirlo a partir de `progreso` (la única fuente de verdad, la misma que se
// guarda en el navegador y se sincroniza con la cuenta): aquí no se guarda ninguna cifra.
//
// Qué cuenta en cada sitio (sin mezclar categorías ni denominadores):
//   Capital: barrios de la ciudad (zonas de los grupos 0-4; no los pueblos de alrededor ni «resto»),
//            monumentos, sitios propios de las rutas a pie (los monumentos de una ruta ya cuentan como
//            monumentos) y rutas a pie.
//   Provincia: municipios sin la capital (los pueblos de alrededor que salen en el mapa cuentan aquí, por
//            su zona), pedanías, comarcas con algún pueblo pisado, sitios propios de las rutas en coche y
//            rutas en coche.
// La evolución mensual sale del historial (j.hi), que tiene cada cosa una sola vez: lo que no tiene fecha
// (marcado antes de que la app apuntara fechas) se cuenta aparte y no se reparte por meses.

const GRUPOS_BARRIOS = [0, 1, 2, 3, 4]; // los grupos de zonas que son barrios de la ciudad
const esBarrio = z => z && GRUPOS_BARRIOS.includes(z.g);

// --- Cálculos -----------------------------------------------------------------------------------------
const sitiosPropios = rutas =>
  rutas.flatMap(r => r.paradas.filter(p => typeof p != 'string').map(p => r.id + ':' + p.id));
const contarVisitados = (claves, visitadas) => claves.filter(k => visitadas.has(k)).length;

// ¿De qué lado es una entrada del historial? 'capital', 'provincia' o null (no es una visita: rutas
// terminadas y logros van aparte)
function ladoDeHistorial(tipo, id) {
  if (tipo == 'z') {
    const z = buscarZona(id);
    return !z || z.id == 'resto' ? null : esBarrio(z) ? 'capital' : 'provincia';
  }
  if (tipo == 'p') return 'provincia';
  if (tipo == 'mo') return 'capital';
  if (tipo == 'de') return buscarDetalle(id) ? 'capital' : null; // todos están en monumentos de la ciudad
  if (tipo == 'ru') {
    const ruta = id.split(':')[0];
    return RUTAS.some(r => r.id == ruta)
      ? 'capital'
      : RUTAS_PROVINCIA.some(r => r.id == ruta)
        ? 'provincia'
        : null;
  }
  return null;
}

function estadisticas() {
  const z = progreso.z || {},
    j = progreso.j || {},
    estadoDe = m => (m.z ? z[m.z] : (progreso.p || {})[m.k]),
    barrios = zonas.filter(esBarrio),
    municipios = pueblos, // todos los de la provincia menos la capital
    visitadosMo = new Set((j.mo || []).filter(id => buscarMonumento(id))),
    paradasHechas = new Set(
      Object.entries(j.r || {}).flatMap(([ruta, ids]) =>
        (Array.isArray(ids) ? ids : []).map(id => ruta + ':' + id)
      )
    ),
    propiasPie = sitiosPropios(RUTAS),
    propiasCoche = sitiosPropios(RUTAS_PROVINCIA),
    municipiosV = municipios.filter(m => estadoDe(m) == 'v'),
    comarcas = new Set(municipiosV.map(m => m.c));

  // Historial: una entrada por cosa (por si acaso, sin repetir), solo las visitas
  const vistas = new Set(),
    conFecha = [],
    sinFecha = { capital: 0, provincia: 0 };
  (j.hi || []).forEach(([fecha, tipo, id]) => {
    const clave = tipo + '|' + id,
      lado = ladoDeHistorial(tipo, id);
    if (vistas.has(clave) || !lado) return;
    vistas.add(clave);
    if (/^\d{4}-\d\d-\d\d$/.test(fecha || '')) conFecha.push({ fecha, lado });
    else sinFecha[lado]++;
  });

  const logros = calcularLogros(),
    colecciones = logros.filter(a => a.col),
    // Logros con su fecha (el historial los apunta al conseguirlos), lo más reciente primero
    porId = new Map(logros.map(a => [a.id, a])),
    recientes = (j.hi || [])
      .filter(
        ([f, tipo, id]) => !TIPOS_DE_VISITA.includes(tipo) && porId.has(id) && conseguido(porId.get(id))
      )
      .map(([fecha, , id]) => ({
        fecha: /^\d{4}-\d\d-\d\d$/.test(fecha || '') ? fecha : '',
        logro: porId.get(id)
      }))
      .sort((a, b) => (b.fecha > a.fecha ? 1 : b.fecha < a.fecha ? -1 : 0));

  return {
    capital: {
      barrios: { v: barrios.filter(b => z[b.id] == 'v').length, total: barrios.length },
      quiero: barrios.filter(b => z[b.id] == 'w').length,
      grupos: GRUPOS_BARRIOS.map(g => {
        const del = barrios.filter(b => b.g == g);
        return { g, nombre: NOMBRES_GRUPOS[g], v: del.filter(b => z[b.id] == 'v').length, total: del.length };
      }),
      monumentos: { v: visitadosMo.size, total: MONUMENTOS.length },
      sitios: { v: contarVisitados(propiasPie, paradasHechas), total: propiasPie.length },
      rutas: {
        v: RUTAS.filter(r => (j.rs || {})[r.id] == 'v').length,
        w: RUTAS.filter(r => (j.rs || {})[r.id] == 'w').length,
        total: RUTAS.length
      }
    },
    provincia: {
      municipios: { v: municipiosV.length, total: municipios.length },
      quiero: municipios.filter(m => estadoDe(m) == 'w').length,
      pedanias: {
        v: pedanias.filter(p => (progreso.p || {})[p.k] == 'v').length,
        w: pedanias.filter(p => (progreso.p || {})[p.k] == 'w').length,
        total: pedanias.length
      },
      comarcas: { v: comarcas.size, total: PROVINCIA.com.length },
      sitios: { v: contarVisitados(propiasCoche, paradasHechas), total: propiasCoche.length },
      rutas: {
        v: RUTAS_PROVINCIA.filter(r => (j.rs || {})[r.id] == 'v').length,
        w: RUTAS_PROVINCIA.filter(r => (j.rs || {})[r.id] == 'w').length,
        total: RUTAS_PROVINCIA.length
      }
    },
    logros: {
      todos: logros,
      v: logros.filter(conseguido).length,
      total: logros.length,
      colecciones: { v: colecciones.filter(conseguido).length, total: colecciones.length },
      // Los próximos objetivos: los logros empezados, los más cerca de conseguirse primero
      proximas: logros
        .filter(a => !conseguido(a) && a.c > 0)
        .sort((a, b) => b.c / b.m - a.c / a.m || a.m - a.c - (b.m - b.c))
        .slice(0, 3),
      recientes: recientes.filter(r => r.fecha).slice(0, 3)
    },
    categorias: categoriasExploradas(estadoDe, visitadosMo),
    rutasHechas: todasLasRutas().filter(r => (j.rs || {})[r.id] == 'v'),
    rutasQuiero: todasLasRutas().filter(r => (j.rs || {})[r.id] == 'w'),
    historial: { conFecha, sinFecha }
  };
}

// Tipos de entrada del historial que son visitas o rutas (el resto son logros: perfil.js)
const TIPOS_DE_VISITA = ['z', 'p', 'mo', 'ru', 'rh', 'de'];

// Categorías para ver qué se ha explorado más y qué está sin empezar, cada una con su propio total:
// partes de la ciudad (barrios), comarcas (municipios sin la capital) y tipos de monumento.
function categoriasExploradas(estadoDe, visitadosMo) {
  const z = progreso.z || {},
    lista = [];
  GRUPOS_BARRIOS.forEach(g => {
    const del = zonas.filter(b => b.g == g),
      nombre = NOMBRES_GRUPOS[g].split(',')[0];
    lista.push({
      ambito: 'capital',
      tipo: 'barrios',
      nombre,
      v: del.filter(b => z[b.id] == 'v').length,
      total: del.length,
      ver: () => verEnMapaFiltrado(['w', 'n'], [g], 'lo que te falta de ' + (g ? 'la ' : 'el ') + nombre)
    });
  });
  CATEGORIAS_MONUMENTO.forEach(([clave, nombre]) => {
    const del = MONUMENTOS.filter(m => categoriaMonumento(m) == clave);
    lista.push({
      ambito: 'capital',
      tipo: 'monumentos',
      nombre: nombre + ' (monumentos)',
      v: del.filter(m => visitadosMo.has(m.id)).length,
      total: del.length,
      ver: () => {
        filtroMonumentos = 'all';
        abrirMonumentos();
      }
    });
  });
  PROVINCIA.com.forEach((nombre, c) => {
    const del = pueblos.filter(m => m.c == c);
    lista.push({
      ambito: 'provincia',
      tipo: 'municipios',
      nombre,
      v: del.filter(m => estadoDe(m) == 'v').length,
      total: del.length,
      ver: () => irAComarca(nombre)
    });
  });
  return lista.filter(x => x.total);
}

// Visitas por mes ('AAAA-MM' → { capital, provincia }) dentro de un periodo
const PERIODOS = [
  ['todo', 'Siempre'],
  ['12m', 'Últimos 12 meses'],
  ['año', 'Este año']
];
function inicioPeriodo(periodo, hoy = new Date()) {
  if (periodo == '12m') return new Date(hoy.getFullYear(), hoy.getMonth() - 11, 1);
  if (periodo == 'año') return new Date(hoy.getFullYear(), 0, 1);
  return null;
}
function visitasPorMes(conFecha, periodo, hoy = new Date()) {
  const desde = inicioPeriodo(periodo, hoy),
    claveMes = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'),
    meses = {};
  const dentro = conFecha.filter(v => !desde || v.fecha >= claveMes(desde) + '-01');
  // Del primer mes (el del periodo o el de la primera visita) al actual, también los meses sin nada
  const primero = desde || (dentro.length ? new Date(dentro.map(v => v.fecha).sort()[0] + 'T12:00:00') : hoy);
  for (let d = new Date(primero.getFullYear(), primero.getMonth(), 1); d <= hoy; d.setMonth(d.getMonth() + 1))
    meses[claveMes(d)] = { capital: 0, provincia: 0 };
  dentro.forEach(v => {
    const m = v.fecha.slice(0, 7);
    if (meses[m]) meses[m][v.lado]++;
  });
  return meses;
}
