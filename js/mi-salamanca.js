// «Mi Salamanca»: el panel de estadísticas personales (#mi-salamanca), con la capital y la provincia por
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
    colecciones = logros.filter(a => a.col);

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
      v: logros.filter(conseguido).length,
      total: logros.length,
      colecciones: { v: colecciones.filter(conseguido).length, total: colecciones.length },
      // Las colecciones a medias, las más cerca de completarse primero
      proximas: colecciones
        .filter(a => !conseguido(a) && a.c > 0)
        .sort((a, b) => b.c / b.m - a.c / a.m)
        .slice(0, 3)
    },
    historial: { conFecha, sinFecha }
  };
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

// --- Piezas del panel ---------------------------------------------------------------------------------
const porcentaje = (v, total) => (total ? Math.round((v / total) * 100) : 0);
const NOMBRES_MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const nombreMes = (clave, largo) => {
  const [a, m] = clave.split('-');
  return largo
    ? new Date(+a, +m - 1, 15).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    : NOMBRES_MES[+m - 1];
};

// Una tarjeta: cifra grande, «de N», qué es, barra con texto accesible y, si hay, un acceso al mapa
function tarjetaCifra({ v, total, que, detalle, accion, nuevos }) {
  const t = crear('div', 'ms-tarjeta');
  t.appendChild(
    crear(
      'p',
      'ms-cifra',
      crear('b', '', conMiles(v)),
      total != null ? crear('span', '', ' de ' + conMiles(total)) : ''
    )
  );
  t.appendChild(crear('p', 'ms-que', que));
  if (total) {
    const pct = porcentaje(v, total),
      barraPct = crear('div', 'ms-barra', crear('i'));
    barraPct.firstChild.style.width = pct + '%';
    barraPct.setAttribute('role', 'progressbar');
    barraPct.setAttribute('aria-valuemin', '0');
    barraPct.setAttribute('aria-valuemax', String(total));
    barraPct.setAttribute('aria-valuenow', String(v));
    barraPct.setAttribute('aria-valuetext', v + ' de ' + total + ' (' + pct + ' %)');
    barraPct.setAttribute('aria-label', que);
    t.append(barraPct, crear('small', 'ms-pct', pct + ' %'));
  }
  if (detalle) t.appendChild(crear('small', 'ms-detalle', detalle));
  if (nuevos) t.appendChild(crear('small', 'ms-nuevos', '+' + nuevos + ' en este periodo'));
  if (accion) {
    const b = crear('button', 'enlace ms-ir', accion[0]);
    b.onclick = accion[1];
    t.appendChild(b);
  }
  return t;
}

// Gráfico de barras por mes (solo si hay al menos dos meses con algo; si no, una frase)
function graficoMeses(meses, ambito) {
  const claves = Object.keys(meses),
    valor = m =>
      ambito == 'capital' ? m.capital : ambito == 'provincia' ? m.provincia : m.capital + m.provincia,
    conAlgo = claves.filter(k => valor(meses[k]) > 0);
  if (conAlgo.length < 2) {
    if (!conAlgo.length) return crear('p', 'mu', 'En este periodo no has marcado nada con fecha.');
    const k = conAlgo[0];
    return crear(
      'p',
      '',
      'En ' +
        nombreMes(k, true) +
        ' marcaste ' +
        valor(meses[k]) +
        ' ' +
        (valor(meses[k]) == 1 ? 'sitio' : 'sitios') +
        '.'
    );
  }
  const max = Math.max(...claves.map(k => valor(meses[k]))),
    ancho = 22,
    hueco = 8,
    alto = 90,
    sv = crearSvg('svg', {
      class: 'ms-grafico',
      viewBox: `0 0 ${claves.length * (ancho + hueco)} ${alto + 18}`,
      role: 'img'
    });
  claves.forEach((k, i) => {
    const x = i * (ancho + hueco),
      m = meses[k],
      partes =
        ambito == 'todo'
          ? [
              ['capital', m.capital],
              ['provincia', m.provincia]
            ]
          : [[ambito, m[ambito]]];
    let y = alto;
    partes.forEach(([lado, n]) => {
      if (!n) return;
      const h = Math.max(2, (n / max) * (alto - 14));
      y -= h;
      crearSvg('rect', { x, y, width: ancho, height: h, rx: 2, class: 'ms-' + lado }, sv);
    });
    if (valor(m)) {
      const t = crearSvg(
        'text',
        { x: x + ancho / 2, y: y - 3, 'text-anchor': 'middle', class: 'ms-num' },
        sv
      );
      t.textContent = valor(m);
    }
    const e = crearSvg(
      'text',
      { x: x + ancho / 2, y: alto + 13, 'text-anchor': 'middle', class: 'ms-mes' },
      sv
    );
    e.textContent = nombreMes(k);
  });
  // Para el lector de pantalla, lo mismo en palabras
  sv.setAttribute(
    'aria-label',
    'Sitios marcados por mes: ' + claves.map(k => nombreMes(k, true) + ', ' + valor(meses[k])).join('; ')
  );
  const mejor = conAlgo.reduce((a, b) => (valor(meses[b]) > valor(meses[a]) ? b : a));
  const caja = crear('div', 'ms-evolucion', sv);
  if (ambito == 'todo')
    caja.appendChild(
      crear(
        'p',
        'ms-leyenda',
        crear('span', 'ms-capital', ''),
        ' Capital ',
        crear('span', 'ms-provincia', ''),
        ' Provincia'
      )
    );
  caja.appendChild(
    crear('p', 'mu', 'Tu mes con más: ' + nombreMes(mejor, true) + ' (' + valor(meses[mejor]) + ').')
  );
  return caja;
}

// --- El panel -----------------------------------------------------------------------------------------
let ambitoEstadisticas = 'todo'; // 'todo' | 'capital' | 'provincia'
let periodoEstadisticas = 'todo';

function filaFiltros(nombre, opciones, actual, alElegir) {
  const fila = crear('div', 'fl');
  fila.setAttribute('role', 'group');
  fila.setAttribute('aria-label', nombre);
  opciones.forEach(([clave, texto]) => {
    const b = crear('button', '', texto);
    marcarInterruptor(b, clave == actual);
    b.onclick = () => {
      alElegir(clave);
      pintarEstadisticas(true);
      const otra = document.querySelector('#info [aria-label="' + nombre + '"] [aria-pressed="true"]');
      if (otra) otra.focus();
    };
    fila.appendChild(b);
  });
  return fila;
}

const verLogros = () => {
  cerrarFicha();
  $('#lgr').open = true;
  $('#lgr').scrollIntoView({ behavior: comoDesplazar(), block: 'start' });
};
const verProvinciaFiltrada = filtro => {
  cerrarFicha();
  filtroProvincia = filtro;
  cambiarPestana('prov');
  aplicarFiltroProvincia();
  $('#pv').scrollIntoView({ behavior: comoDesplazar(), block: 'start' });
};
const verRutas = filtro => {
  filtroRutas = filtro;
  abrirRutas();
};

function pintarEstadisticas(refrescar = false) {
  const datos = estadisticas(),
    { capital, provincia, logros, historial } = datos,
    hay = historial.conFecha.length > 0,
    nada =
      !capital.barrios.v &&
      !capital.quiero &&
      !capital.monumentos.v &&
      !provincia.municipios.v &&
      !provincia.quiero &&
      !provincia.pedanias.v &&
      !provincia.pedanias.w &&
      !capital.sitios.v &&
      !provincia.sitios.v &&
      !capital.rutas.v &&
      !provincia.rutas.v;
  if (!hay) periodoEstadisticas = 'todo'; // sin fechas no hay periodos que elegir
  const scroll = document.querySelector('#sh .sb').scrollTop,
    caja = fichaLimpia('Tus cifras, de la capital y de la provincia', 'Mi Salamanca'),
    desde = inicioPeriodo(periodoEstadisticas),
    desdeTexto = desde
      ? desde.getFullYear() + '-' + String(desde.getMonth() + 1).padStart(2, '0') + '-01'
      : '',
    nuevosEnPeriodo = lado => historial.conFecha.filter(v => v.lado == lado && v.fecha >= desdeTexto).length;

  if (nada) {
    const mapa = crear('button', 'boton-hoy', '🗺️ Ir al mapa'),
      hoy = crear('button', 'boton-hoy', '🌅 ¿Qué puedo descubrir hoy?');
    mapa.onclick = () => {
      cerrarFicha();
      document.querySelector('.mw').scrollIntoView({ behavior: comoDesplazar(), block: 'start' });
    };
    hoy.onclick = () => abrirHoy();
    caja.appendChild(
      crear(
        'div',
        'ms-vacio',
        crear('p', '', 'Aún no has marcado nada, así que todo está por descubrir.'),
        crear(
          'p',
          'mu',
          'Pulsa un barrio o un pueblo y marca «He estado»: aquí irán saliendo tus cifras, separadas entre la capital y la provincia.'
        ),
        crear('div', 'botones-aviso', mapa, hoy)
      )
    );
  } else
    caja.appendChild(
      crear('p', 'hab', 'Lo que llevas recorrido. Sin prisa: cada cifra lleva a su sitio del mapa.')
    );

  caja.appendChild(
    filaFiltros(
      'Mostrar',
      [
        ['todo', 'Todo'],
        ['capital', 'Capital'],
        ['provincia', 'Provincia']
      ],
      ambitoEstadisticas,
      v => (ambitoEstadisticas = v)
    )
  );
  if (hay)
    caja.appendChild(filaFiltros('Periodo', PERIODOS, periodoEstadisticas, v => (periodoEstadisticas = v)));
  const enPeriodo = lado => (desde ? nuevosEnPeriodo(lado) : 0);

  // Capital
  if (ambitoEstadisticas != 'provincia') {
    const faltaPoco = capital.grupos
      .filter(g => g.v && g.v < g.total && g.total - g.v <= 2)
      .map(
        g =>
          'te ' +
          (g.total - g.v == 1 ? 'falta 1 barrio' : 'faltan ' + (g.total - g.v) + ' barrios') +
          ' para completar ' +
          (g.g ? 'la ' : 'el ') +
          g.nombre.split(',')[0]
      )[0];
    caja.appendChild(
      crear(
        'section',
        'ms-apartado',
        crear('h3', '', '🏙️ Salamanca capital'),
        crear(
          'div',
          'ms-tarjetas',
          tarjetaCifra({
            v: capital.barrios.v,
            total: capital.barrios.total,
            que: 'Barrios pisados',
            detalle: 'Sin los pueblos de alrededor: van en la provincia.',
            nuevos: enPeriodo('capital'),
            accion: capital.barrios.v
              ? [
                  'Verlos en el mapa',
                  () => verEnMapaFiltrado(['v'], GRUPOS_BARRIOS, 'los barrios que has pisado')
                ]
              : null
          }),
          tarjetaCifra({
            v: capital.quiero,
            que: 'Barrios en «Quiero ir»',
            accion: capital.quiero
              ? [
                  'Verlos en el mapa',
                  () => verEnMapaFiltrado(['w'], GRUPOS_BARRIOS, 'los barrios que quieres pisar')
                ]
              : null
          }),
          tarjetaCifra({
            v: capital.monumentos.v,
            total: capital.monumentos.total,
            que: 'Monumentos visitados',
            accion: [
              'Ver la lista',
              () => {
                filtroMonumentos = capital.monumentos.v ? 'v' : 'n';
                abrirMonumentos();
              }
            ]
          }),
          tarjetaCifra({
            v: capital.sitios.v,
            total: capital.sitios.total,
            que: 'Otros sitios de las rutas a pie',
            detalle: 'Murales, bares y rincones (sin los monumentos).'
          }),
          tarjetaCifra({
            v: capital.rutas.v,
            total: capital.rutas.total,
            que: 'Rutas a pie hechas',
            detalle: capital.rutas.w ? capital.rutas.w + ' en «La quiero hacer»' : '',
            accion: ['Ver las rutas', () => verRutas('pie')]
          })
        ),
        crear(
          'div',
          'ms-grupos',
          ...capital.grupos.map(g => {
            const b = crear(
              'button',
              'ms-grupo',
              crear('span', '', g.nombre.split(',')[0]),
              crear('small', '', g.v + ' de ' + g.total),
              barra(g.v / g.total)
            );
            b.setAttribute(
              'aria-label',
              g.nombre + ': ' + g.v + ' de ' + g.total + ' barrios. Ver los que faltan en el mapa'
            );
            b.onclick = () =>
              verEnMapaFiltrado(
                ['w', 'n'],
                [g.g],
                'lo que te falta de ' + (g.g ? 'la ' : 'el ') + g.nombre.split(',')[0]
              );
            return b;
          })
        ),
        faltaPoco
          ? crear('p', 'ms-animo', '¡Ánimo! ' + faltaPoco[0].toUpperCase() + faltaPoco.slice(1) + '.')
          : ''
      )
    );
  }

  // Provincia
  if (ambitoEstadisticas != 'capital')
    caja.appendChild(
      crear(
        'section',
        'ms-apartado',
        crear('h3', '', '🌾 Provincia de Salamanca'),
        crear(
          'div',
          'ms-tarjetas',
          tarjetaCifra({
            v: provincia.municipios.v,
            total: provincia.municipios.total,
            que: 'Municipios pisados',
            detalle: 'Sin la capital; con los pueblos de alrededor.',
            nuevos: enPeriodo('provincia'),
            accion: provincia.municipios.v
              ? ['Verlos en la provincia', () => verProvinciaFiltrada('v')]
              : null
          }),
          tarjetaCifra({
            v: provincia.quiero,
            que: 'Municipios en «Quiero ir»',
            accion: provincia.quiero ? ['Verlos en la provincia', () => verProvinciaFiltrada('w')] : null
          }),
          tarjetaCifra({
            v: provincia.pedanias.v,
            total: provincia.pedanias.total,
            que: 'Pedanías pisadas',
            detalle: provincia.pedanias.w ? provincia.pedanias.w + ' en «Quiero ir»' : ''
          }),
          tarjetaCifra({
            v: provincia.comarcas.v,
            total: provincia.comarcas.total,
            que: 'Comarcas con algún pueblo pisado'
          }),
          tarjetaCifra({
            v: provincia.sitios.v,
            total: provincia.sitios.total,
            que: 'Sitios de las rutas en coche',
            detalle: 'Miradores, presas, bodegas y otras paradas.'
          }),
          tarjetaCifra({
            v: provincia.rutas.v,
            total: provincia.rutas.total,
            que: 'Rutas en coche hechas',
            detalle: provincia.rutas.w ? provincia.rutas.w + ' en «La quiero hacer»' : '',
            accion: ['Ver las rutas', () => verRutas('coche')]
          })
        ),
        provincia.comarcas.v && provincia.comarcas.v < provincia.comarcas.total
          ? crear(
              'p',
              'ms-animo',
              'Has pisado pueblos de ' +
                provincia.comarcas.v +
                (provincia.comarcas.v == 1 ? ' comarca' : ' comarcas') +
                '. Cada una tiene su logro cuando la completas.'
            )
          : ''
      )
    );

  // Evolución mensual (solo con fechas fiables)
  const sinFecha =
    ambitoEstadisticas == 'todo'
      ? historial.sinFecha.capital + historial.sinFecha.provincia
      : historial.sinFecha[ambitoEstadisticas];
  if (!nada) {
    const evolucion = crear(
      'section',
      'ms-apartado',
      crear('h3', '', '📅 Mes a mes'),
      crear(
        'p',
        'mu',
        'Sitios que marcaste como pisados o visitados cada mes: barrios, pueblos, pedanías, monumentos y paradas de ruta.'
      )
    );
    if (hay)
      evolucion.appendChild(
        graficoMeses(visitasPorMes(historial.conFecha, periodoEstadisticas), ambitoEstadisticas)
      );
    else evolucion.appendChild(crear('p', 'mu', 'Lo que marques desde ahora saldrá aquí, mes a mes.'));
    if (sinFecha)
      evolucion.appendChild(
        crear(
          'p',
          'mu',
          sinFecha +
            (sinFecha == 1 ? ' sitio marcado' : ' sitios marcados') +
            ' antes de que la app apuntara las fechas: cuentan en las cifras, pero no en ningún mes.'
        )
      );
    caja.appendChild(evolucion);
  }

  // Colecciones y logros
  const proximas = crear('div', 'ms-grupos');
  logros.proximas.forEach(a => {
    proximas.appendChild(
      crear(
        'div',
        'ms-grupo',
        crear('span', '', a.n),
        crear('small', '', a.c + ' de ' + a.m),
        barra(a.c / a.m)
      )
    );
  });
  caja.appendChild(
    crear(
      'section',
      'ms-apartado',
      crear('h3', '', '🏆 Colecciones y logros'),
      crear(
        'div',
        'ms-tarjetas',
        tarjetaCifra({
          v: logros.colecciones.v,
          total: logros.colecciones.total,
          que: 'Colecciones completas',
          detalle: 'Una parte de la ciudad, una época, una ruta, una comarca…'
        }),
        tarjetaCifra({
          v: logros.v,
          total: logros.total,
          que: 'Logros conseguidos',
          accion: ['Ver los logros', verLogros]
        })
      ),
      logros.proximas.length ? crear('p', 'mu', 'Las colecciones que tienes más cerca:') : '',
      proximas
    )
  );

  // La imagen para compartir
  const imagen = crear('button', 'boton-hoy', '📸 Crear mi imagen para compartir');
  imagen.onclick = () => abrirImagenMiSalamanca(imagen);
  caja.appendChild(imagen);

  $('#ap').textContent =
    'Todo se calcula ahora a partir de lo que has marcado (en este navegador y, si has entrado, en tu cuenta). Nadie más lo ve y no es una competición.';
  if (refrescar) {
    // Repintado (filtros, o cambios que llegan de la cuenta): sin mover el foco ni el desplazamiento
    $('#sh').classList.add('o');
    document.querySelector('#sh .sb').scrollTop = scroll;
    return;
  }
  mostrarFicha();
  enlaceFicha('mi-salamanca', 'Mi Salamanca');
}
const abrirEstadisticas = () => pintarEstadisticas();
// Si cambia el progreso con el panel abierto (p. ej. llega de la cuenta), se repinta (vistas.js: actualizar)
function refrescarEstadisticas() {
  if (nombreFicha == 'Mi Salamanca' && $('#sh').classList.contains('o')) pintarEstadisticas(true);
}

$('#foto').onclick = abrirEstadisticas;
