// «Mi Salamanca»: las piezas del panel (tarjetas, gráfico, resúmenes y cada apartado). Usan los cálculos de
// mi-salamanca-calculos.js; el panel que las junta está en mi-salamanca.js.

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

// Una línea con los porcentajes principales, cada uno con su total dicho (sin mezclar capital y provincia)
function resumenPorcentajes(capital, provincia, ambito) {
  const linea = (que, v, total, nombre) =>
    crear(
      'li',
      '',
      crear('b', '', porcentaje(v, total) + ' %'),
      ' ' + que + ' (' + v + ' de ' + total + ' ' + nombre + ')'
    );
  const lista = crear('ul', 'ms-resumen');
  if (ambito != 'provincia')
    lista.appendChild(
      linea('de los barrios de la capital', capital.barrios.v, capital.barrios.total, 'barrios')
    );
  if (ambito != 'capital') {
    lista.appendChild(
      linea(
        'de los municipios de la provincia',
        provincia.municipios.v,
        provincia.municipios.total,
        'municipios, sin la capital'
      )
    );
    lista.appendChild(linea('de las pedanías', provincia.pedanias.v, provincia.pedanias.total, 'pedanías'));
  }
  return lista;
}

// Lo más explorado (en proporción, cada categoría con su total) y lo que está sin empezar
function apartadoCategorias(categorias, ambito) {
  const delAmbito = categorias.filter(c => ambito == 'todo' || c.ambito == ambito),
    empezadas = delAmbito
      .filter(c => c.v > 0)
      .sort((a, b) => b.v / b.total - a.v / a.total || b.v - a.v)
      .slice(0, 4),
    sinEmpezar = delAmbito.filter(c => c.v == 0),
    fila = c => {
      const b = crear(
        'button',
        'ms-grupo',
        crear('span', '', c.nombre),
        crear('small', '', c.v + ' de ' + c.total + ' ' + c.tipo),
        barra(c.v / c.total)
      );
      b.setAttribute('aria-label', c.nombre + ': ' + c.v + ' de ' + c.total + ' ' + c.tipo + '. Verlo');
      b.onclick = c.ver;
      return b;
    };
  const caja = crear('section', 'ms-apartado', crear('h3', '', '🧭 Lo más y lo menos explorado'));
  if (!empezadas.length) {
    caja.appendChild(crear('p', 'mu', 'Cuando pises algo, aquí verás qué parte llevas mejor.'));
    return caja;
  }
  caja.append(
    crear('p', 'mu', 'Partes de la ciudad, tipos de monumento y comarcas, cada una con su propio total:'),
    crear('div', 'ms-grupos', ...empezadas.map(fila))
  );
  if (sinEmpezar.length) {
    const nb = crear('div', 'nb', 'Sin empezar: ');
    sinEmpezar.forEach(c => {
      const b = crear('button', '', c.nombre);
      b.setAttribute('aria-label', c.nombre + ': sin empezar, 0 de ' + c.total + ' ' + c.tipo + '. Verlo');
      b.onclick = c.ver;
      nb.appendChild(b);
    });
    caja.appendChild(nb);
  }
  return caja;
}

// Sin nada marcado: por dónde empezar
function avisoSinNada() {
  const mapa = crear('button', 'boton-hoy', '🗺️ Ir al mapa'),
    hoy = crear('button', 'boton-hoy', '🌅 ¿Qué puedo descubrir hoy?');
  mapa.onclick = () => {
    cerrarFicha();
    document.querySelector('.mw').scrollIntoView({ behavior: comoDesplazar(), block: 'start' });
  };
  hoy.onclick = () => abrirHoy();
  return crear(
    'div',
    'ms-vacio',
    crear('p', '', 'Aún no has marcado nada, así que todo está por descubrir.'),
    crear(
      'p',
      'mu',
      'Pulsa un barrio o un pueblo y marca «He estado»: aquí irán saliendo tus cifras, separadas entre la capital y la provincia.'
    ),
    crear('div', 'botones-aviso', mapa, hoy)
  );
}

// Barrios, monumentos, sitios y rutas de la capital, y sus partes de la ciudad. nuevos: pisados en el periodo
function apartadoCapital(capital, nuevos) {
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
  return crear(
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
        nuevos,
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
        que: 'Monumentos y sitios visitados',
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
  );
}

// Municipios, pedanías, comarcas, sitios y rutas de la provincia. nuevos: pisados en el periodo
function apartadoProvincia(provincia, nuevos) {
  return crear(
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
        nuevos,
        accion: provincia.municipios.v ? ['Verlos en la provincia', () => verProvinciaFiltrada('v')] : null
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
  );
}

// Evolución mensual (solo con fechas fiables)
function apartadoMeses(historial, ambito, periodo) {
  const hay = historial.conFecha.length > 0;
  const sinFecha =
    ambito == 'todo' ? historial.sinFecha.capital + historial.sinFecha.provincia : historial.sinFecha[ambito];
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
  if (hay) evolucion.appendChild(graficoMeses(visitasPorMes(historial.conFecha, periodo), ambito));
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
  return evolucion;
}

// Colecciones completas, logros, próximos objetivos y lo último conseguido
function apartadoColecciones(logros) {
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
  return crear(
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
        que: 'Logros conseguidos'
      })
    ),
    logros.proximas.length ? crear('p', 'mu', 'Tus próximos objetivos, los que tienes más cerca:') : '',
    proximas,
    logros.recientes.length
      ? crear(
          'div',
          'ms-recientes',
          crear('p', 'mu', 'Lo último que has conseguido:'),
          ...logros.recientes.map(r =>
            crear('p', 'ms-reciente', '🏆 ' + r.logro.n, crear('small', '', ' · ' + fechaLarga(r.fecha)))
          )
        )
      : ''
  );
}
