// Fichas de pueblos de la provincia (datos en js/datos/pueblos.js). Enlace: #pueblo/<nombre>

let puebloAbierto = null; // municipio (de PROVINCIA.m) cuya ficha está abierta
const fichaPueblo = m => PUEBLOS[m.n];
const municipioPorNombre = n => PROVINCIA.m.find(m => m.n == n);

// «1.045 habitantes (INE, 2025)»: los del municipio, con todas sus pedanías (datos/habitantes.js)
const habitantesDe = m => HABITANTES.m[m.ine];
const textoHabitantes = m => {
  const n = habitantesDe(m);
  return conMiles(n) + (n == 1 ? ' habitante' : ' habitantes') + ' (INE, ' + HABITANTES.fecha.slice(-4) + ')';
};

function abrirPueblo(m) {
  const f = fichaPueblo(m);
  zonaAbierta = null;
  olvidarMonumento();
  puebloAbierto = m;
  resaltarVia(null);
  $('#here').hidden = !(ubicacionReciente() && ubicacion.pid == m.k);
  $('#here').className = 'here';
  $('#here').textContent = 'Estás en el término de ' + m.n + '.';
  $('#k').textContent = 'Pueblo · ' + PROVINCIA.com[m.c];
  $('#nm').textContent = m.n;
  $('#mz').hidden = true;
  const paradas = paradasDeMunicipio(m),
    cultura = culturaDeMunicipio(m);
  pintarFotoDe(f.foto || fotoDePueblo(paradas, cultura));
  pintarCulturaEnFicha(cultura);
  pintarRelacionados(relacionadosDePueblo(m, paradas));
  pintarDemografia(m);

  // Cabecera: habitantes y monumento o lugar principal
  const caja = $('#info');
  caja.textContent = '';
  caja.hidden = false;
  caja.appendChild(
    crear(
      'p',
      'hab',
      textoHabitantes(m) +
        (m.P.length ? ' · ' + m.P.length + (m.P.length == 1 ? ' pedanía' : ' pedanías') : '')
    )
  );
  // Los nombres de las pedanías (con muchas, plegados)
  if (m.P.length) {
    const nombres = m.P.map(p => p.n).join(', ');
    caja.appendChild(
      m.P.length > 8
        ? crear('details', 'peds', crear('summary', '', 'Sus pedanías'), crear('p', '', nombres))
        : crear('p', 'peds', (m.P.length == 1 ? 'Pedanía: ' : 'Pedanías: ') + nombres + '.')
    );
  }
  if (f.mon) {
    const mon = f.mon,
      linea = [mon.epoca, mon.estilo].filter(Boolean).join(' · ');
    caja.appendChild(
      crear(
        'div',
        'cab',
        iconoMonumento(mon.tipo, 46),
        crear('div', 'epo', crear('b', '', mon.n), linea ? crear('span', '', linea) : null)
      )
    );
    caja.appendChild(
      crear(
        'div',
        'datos',
        ...mon.datos.map(([e, v]) => crear('div', 'dato', crear('small', '', e), crear('b', '', v)))
      )
    );
  }
  $('#hc').hidden = false;
  pintarParrafos($('#cu'), f.cur);
  $('#hl').hidden = true;
  $('#ri').textContent = '';
  pintarSitiosComer(f.comer, m.n + ' Salamanca');

  // Fuente
  const ap = $('#ap');
  ap.textContent = 'Fuente: ';
  [...f.fuente, HABITANTES.fuente].forEach(([nombre, url], i) => {
    const a = crear('a', '', nombre);
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    ap.append(i ? ' · ' : '', a);
  });

  // Botones: ver en el mapa de la provincia y cómo llegar
  const nb = $('#nb');
  nb.textContent = '';
  const ver = crear('button', '', 'Ver en el mapa de la provincia');
  ver.onclick = () => {
    $('#x').click();
    cambiarPestana('prov');
    seleccionarPueblo(m, true);
  };
  const llegar = crear('a', 'llegar', 'Cómo llegar');
  llegar.href =
    'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(m.n + ', Salamanca');
  llegar.target = '_blank';
  llegar.rel = 'noopener';
  nb.append(ver, llegar);

  modoBotonesFicha('zona');
  pintarBotonesFicha();
  mostrarFicha();
  enlaceFicha('pueblo/' + slug(m.n), m.n);
}

// Paradas de las rutas por la provincia que están en el municipio. En los datos, «municipio» puede llevar
// la pedanía entre paréntesis: «Aldeadávila de la Ribera (Corporario)».
const municipioDeParada = p => p.municipio.replace(/ \(.*\)$/, '');
const pedaniaDeParada = p => (p.municipio.match(/ \((.*)\)$/) || [])[1] || '';
function paradasDeMunicipio(m) {
  const lista = [];
  RUTAS_PROVINCIA.forEach((r, k) =>
    r.paradas.forEach((p, i) => {
      if (municipioDeParada(p) == m.n) lista.push({ r, k, p, i });
    })
  );
  return lista;
}

// Foto de la ficha: la de una parada de ruta del pueblo o, si no hay, la de una de sus tradiciones (cultura.js)
function fotoDePueblo(paradas, cultura) {
  const conFoto = paradas.find(x => x.p.foto);
  if (conFoto) return conFoto.p.foto;
  const c = cultura.find(c => c.foto);
  return c
    ? [c.foto.src, c.foto.pie + '. Foto: ' + c.foto.autor + ' · ' + c.foto.licencia + ' · Wikimedia Commons']
    : null;
}

// Centro aproximado del término municipal (media de los puntos de su linde más larga)
const centroDeMunicipio = m => centroDe(m.R.slice().sort((a, b) => b.length - a.length)[0]);
const DISTANCIA_CERCA_PUEBLO = 30; // km en línea recta

function relacionadosDePueblo(m, paradas) {
  // Una parada que sale en varias rutas, una vez
  const vistas = new Set(),
    unicas = paradas.filter(x => !vistas.has(x.p.id) && vistas.add(x.p.id)),
    rutas = [...new Set(paradas.map(x => x.k))],
    [la, lo] = centroDeMunicipio(m),
    cerca = pueblos
      .filter(o => o != m && PUEBLOS[o.n] && !o.z)
      .map(o => [distanciaKm(la, lo, ...centroDeMunicipio(o)), o])
      .filter(([d]) => d <= DISTANCIA_CERCA_PUEBLO)
      .sort((a, b) => a[0] - b[0])
      .slice(0, 3);
  return [
    [
      'Qué ver',
      unicas.map(({ r, k, p, i }) => ({
        texto: '📍 ' + p.n,
        detalle: [pedaniaDeParada(p) && 'en ' + pedaniaDeParada(p), 'unos ' + p.min + ' min']
          .filter(Boolean)
          .join(', '),
        hecho: estaVisitada({ tipo: 'ru', ruta: r.id, id: p.id }),
        abrir: () => abrirParadaProvincia(i, k)
      }))
    ],
    [
      'Rutas en coche que pasan por aquí',
      rutas.map(k => {
        const r = RUTAS_PROVINCIA[k];
        return {
          icono: r.icono + ' ',
          texto: r.nombre.split(':')[0],
          detalle: DURACIONES[r.duracion].toLowerCase(),
          hecho: estadoRuta(r.id) == 'v',
          abrir: () => abrirRutaProvincia(k)
        };
      })
    ],
    [
      'En «Salamanca en el tiempo»',
      etapasDePueblo(m).map(i => ({
        texto: '📜 ' + ETAPAS[i][0] + ' · ' + ETAPAS[i][1],
        abrir: () => abrirTiempo(i)
      }))
    ],
    [
      'Otros pueblos cerca, en línea recta',
      cerca.map(([d, o]) => ({
        texto: o.n,
        detalle: 'a ' + Math.max(1, Math.round(d)) + ' km',
        hecho: estadoMunicipio(o) == 'v',
        abrir: () => abrirPueblo(o)
      }))
    ]
  ];
}

// Botón «Ver ficha» en la barra del pueblo seleccionado de la pestaña Provincia
function botonFichaPueblo(m) {
  if (!fichaPueblo(m)) return null;
  const b = crear('button', 'verficha', 'Ver la ficha de ' + m.n);
  b.onclick = () => abrirPueblo(m);
  return b;
}

// --- Evolución de la población (datos/habitantes.js: serie anual del Padrón, INE) -------------------
// En la ficha de cada municipio: gráfico de líneas de su serie, variaciones entre años comparables
// (mismo municipio, misma fuente y ambas cifras definitivas), máximo de la serie, tabla con todas las
// cifras y la fuente. Lo que el INE no da como definitivo se dibuja aparte (hueco y con trazo discontinuo).
const formatoPct = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
const conSigno = (n, texto) => (n > 0 ? '+' : n < 0 ? '−' : '') + texto;

// Puntos de la serie de un municipio: [{ anio, n, oficial, tipo }], sin los años sin cifra
function serieHabitantes(m) {
  const serie = (HABITANTES.serie || {})[m.ine],
    tipos = (HABITANTES.tipos || {})[m.ine] || {};
  if (!serie) return [];
  return HABITANTES.anios
    .map((anio, i) => ({ anio, n: serie[i], tipo: tipos[i] || 'Definitivo', oficial: !tipos[i] }))
    .filter(p => p.n != null);
}

// Variación entre dos años de la serie, solo si los dos existen y son cifras definitivas
function variacionHabitantes(puntos, desde, hasta) {
  const a = puntos.find(p => p.anio == desde),
    b = puntos.find(p => p.anio == hasta);
  if (!a || !b || !a.oficial || !b.oficial || a.anio >= b.anio) return null;
  const dif = b.n - a.n;
  return { a, b, dif, pct: a.n ? (dif / a.n) * 100 : null };
}
const textoVariacion = v =>
  conSigno(v.dif, conMiles(Math.abs(v.dif))) +
  (v.pct == null ? '' : ' (' + conSigno(v.dif, formatoPct.format(Math.abs(v.pct))) + ' %)');

function pintarDemografia(m) {
  const caja = $('#demo'),
    puntos = serieHabitantes(m);
  caja.textContent = '';
  fichaConDemografia = !!puntos.length;
  if (!fichaConDemografia) return;
  caja.appendChild(crear('h3', '', 'Evolución de la población')).id = 'hd';
  const primero = puntos[0],
    ultimo = puntos[puntos.length - 1];
  caja.appendChild(
    crear(
      'p',
      'demo-sub',
      'Habitantes a 1 de enero de cada año, de ' +
        primero.anio +
        ' a ' +
        ultimo.anio +
        '. Es el municipio entero' +
        (m.P.length ? ', con sus pedanías' : '') +
        '.'
    )
  );
  if (puntos.length >= 2) caja.appendChild(graficoHabitantes(m, puntos));

  // Variaciones: desde el primer año y en los últimos diez, si se pueden comparar; y el máximo
  const datos = [],
    total = variacionHabitantes(puntos, primero.anio, ultimo.anio),
    diez = variacionHabitantes(puntos, ultimo.anio - 10, ultimo.anio),
    oficiales = puntos.filter(p => p.oficial),
    maximo = oficiales.reduce((a, p) => (p.n > a.n ? p : a), oficiales[0]);
  if (total) datos.push(['Desde ' + total.a.anio, textoVariacion(total)]);
  if (diez) datos.push([diez.a.anio + '–' + diez.b.anio, textoVariacion(diez)]);
  if (maximo && puntos.length >= 2)
    datos.push(['Máximo de la serie', conMiles(maximo.n) + ' (' + maximo.anio + ')']);
  if (datos.length)
    caja.appendChild(
      crear(
        'div',
        'datos demo-datos',
        ...datos.map(([e, v]) => crear('div', 'dato', crear('small', '', e), crear('b', '', v)))
      )
    );

  // Qué es oficial y qué no
  const noOficiales = puntos.filter(p => !p.oficial);
  caja.appendChild(
    crear(
      'p',
      'demo-leyenda',
      crear('span', 'demo-of', 'Cifra oficial definitiva'),
      noOficiales.length
        ? crear('span', 'demo-est', 'Cifra no definitiva (' + noOficiales[0].tipo.toLowerCase() + ')')
        : null,
      noOficiales.length
        ? null
        : crear('small', '', 'Todas las cifras son oficiales y definitivas: no hay estimaciones.')
    )
  );

  // Todas las cifras, en una tabla plegada
  const tabla = crear('table', 'demo-tabla');
  tabla.appendChild(
    crear(
      'thead',
      '',
      crear('tr', '', crear('th', '', 'Año'), crear('th', '', 'Habitantes'), crear('th', '', 'Dato'))
    )
  );
  const cuerpo = crear('tbody');
  [...puntos]
    .reverse()
    .forEach(p =>
      cuerpo.appendChild(
        crear(
          'tr',
          p.oficial ? '' : 'no-oficial',
          crear('td', '', String(p.anio)),
          crear('td', '', conMiles(p.n)),
          crear('td', '', p.oficial ? 'Oficial' : p.tipo)
        )
      )
    );
  tabla.appendChild(cuerpo);
  caja.appendChild(
    crear('details', 'demo-cifras', crear('summary', '', 'Todas las cifras, año a año'), tabla)
  );

  // Fuente y comparabilidad
  const fuente = crear('p', 'fte demo-fte', 'Fuente: ');
  const a = crear('a', '', 'INE, Padrón municipal, cifras oficiales de población (tabla 2891)');
  a.href = HABITANTES.fuente[1];
  a.target = '_blank';
  a.rel = 'noopener';
  fuente.append(
    a,
    '. Cada cifra es la de su año, a 1 de enero. Las variaciones solo comparan cifras definitivas del mismo municipio. ' +
      (HABITANTES.anios.includes(1997) ? '' : 'El INE no publicó cifras a 1 de enero de 1997.')
  );
  caja.appendChild(fuente);
}

// Gráfico de líneas de la serie: años en proporción (el hueco de 1997 se ve), eje desde 0, el valor
// del primer y el último año escritos, y al pasar o tocar, el año y la cifra
function graficoHabitantes(m, puntos) {
  const W = 320,
    H = 150,
    izq = 40,
    der = 12,
    arr = 16,
    aba = 22,
    a0 = puntos[0].anio,
    a1 = puntos[puntos.length - 1].anio,
    max = Math.max(...puntos.map(p => p.n)),
    paso = escalonEje(max),
    tope = Math.ceil(max / paso) * paso || 1,
    x = anio => izq + ((anio - a0) / (a1 - a0 || 1)) * (W - izq - der),
    y = n => arr + (1 - n / tope) * (H - arr - aba),
    primero = puntos[0],
    ultimo = puntos[puntos.length - 1];
  const sv = crearSvg('svg', {
    viewBox: `0 0 ${W} ${H}`,
    class: 'demo-graf',
    role: 'img',
    'aria-label':
      'Evolución de la población de ' +
      m.n +
      ': ' +
      conMiles(primero.n) +
      ' habitantes en ' +
      primero.anio +
      ' y ' +
      conMiles(ultimo.n) +
      ' en ' +
      ultimo.anio +
      '. Todas las cifras, en la tabla de debajo.'
  });
  // Rejilla y eje: tres o cuatro líneas suaves con su cifra
  for (let v = 0; v <= tope; v += paso) {
    crearSvg('line', { x1: izq, x2: W - der, y1: y(v), y2: y(v), class: v ? 'demo-rej' : 'demo-base' }, sv);
    crearSvg('text', { x: izq - 6, y: y(v) + 3.5, class: 'demo-eje', 'text-anchor': 'end' }, sv).textContent =
      conMiles(v);
  }
  // Años del eje: el primero, el último y las décadas en medio
  const anios = [a0, ...[2000, 2010, 2020].filter(a => a - a0 > 3 && a1 - a > 3), a1];
  anios.forEach(a => {
    crearSvg('text', { x: x(a), y: H - 6, class: 'demo-eje', 'text-anchor': 'middle' }, sv).textContent = a;
  });
  // Área y línea: las cifras definitivas con trazo continuo; las que no lo son, discontinuo
  const linea = lista => 'M' + lista.map(p => x(p.anio).toFixed(1) + ' ' + y(p.n).toFixed(1)).join('L');
  crearSvg(
    'path',
    {
      d: linea(puntos) + `L${x(a1).toFixed(1)} ${y(0)}L${x(a0).toFixed(1)} ${y(0)}Z`,
      class: 'demo-area'
    },
    sv
  );
  const tramos = [];
  for (let i = 1; i < puntos.length; i++)
    tramos.push({
      d: linea([puntos[i - 1], puntos[i]]),
      oficial: puntos[i - 1].oficial && puntos[i].oficial
    });
  [true, false].forEach(oficial => {
    const d = tramos
      .filter(t => t.oficial == oficial)
      .map(t => t.d)
      .join('');
    if (d) crearSvg('path', { d, class: 'demo-linea' + (oficial ? '' : ' est') }, sv);
  });
  puntos
    .filter(p => !p.oficial)
    .forEach(p => crearSvg('circle', { cx: x(p.anio), cy: y(p.n), r: 3, class: 'demo-punto est' }, sv));
  // Primer y último año, con su cifra
  [primero, ultimo].forEach((p, i) => {
    crearSvg(
      'circle',
      { cx: x(p.anio), cy: y(p.n), r: 4, class: 'demo-punto' + (p.oficial ? '' : ' est') },
      sv
    );
    crearSvg(
      'text',
      {
        x: x(p.anio) + (i ? -2 : 2),
        y: y(p.n) - 8,
        class: 'demo-valor',
        'text-anchor': i ? 'end' : 'start'
      },
      sv
    ).textContent = conMiles(p.n);
  });
  // Al pasar el ratón o tocar: guía vertical, punto y etiqueta del año más cercano
  const guia = crearSvg('g', { class: 'demo-guia', 'aria-hidden': 'true' }, sv);
  guia.style.display = 'none';
  const vertical = crearSvg('line', { y1: arr - 4, y2: y(0) }, guia),
    punto = crearSvg('circle', { r: 4.5 }, guia),
    fondo = crearSvg('rect', { height: 30, rx: 6 }, guia),
    rotulo = crearSvg('text', { 'text-anchor': 'middle' }, guia),
    lineaAnio = crearSvg('tspan', { class: 'demo-guia-anio' }, rotulo),
    lineaCifra = crearSvg('tspan', { dy: 12 }, rotulo);
  const mostrar = e => {
    const r = sv.getBoundingClientRect(),
      ax = ((e.clientX - r.left) / r.width) * W,
      p = puntos.reduce((a, q) => (Math.abs(x(q.anio) - ax) < Math.abs(x(a.anio) - ax) ? q : a), puntos[0]),
      px = x(p.anio),
      py = y(p.n),
      texto = conMiles(p.n) + ' hab.' + (p.oficial ? '' : ' · ' + p.tipo.toLowerCase()),
      ancho = Math.max(54, texto.length * 5.6 + 14),
      cx = Math.min(W - der - ancho / 2, Math.max(izq + ancho / 2, px)),
      cy = py - 40 < 0 ? py + 10 : py - 40;
    guia.style.display = '';
    vertical.setAttribute('x1', px);
    vertical.setAttribute('x2', px);
    punto.setAttribute('cx', px);
    punto.setAttribute('cy', py);
    fondo.setAttribute('x', cx - ancho / 2);
    fondo.setAttribute('y', cy);
    fondo.setAttribute('width', ancho);
    lineaAnio.setAttribute('x', cx);
    lineaAnio.setAttribute('y', cy + 12);
    lineaAnio.textContent = p.anio;
    lineaCifra.setAttribute('x', cx);
    lineaCifra.textContent = texto;
  };
  sv.addEventListener('pointermove', mostrar);
  sv.addEventListener('pointerdown', mostrar);
  sv.addEventListener('pointerleave', () => (guia.style.display = 'none'));
  return sv;
}

// Separación de las líneas de la rejilla: 1, 2 o 5 por potencia de 10, para 2–4 líneas
function escalonEje(max) {
  const bruto = max / 3,
    p = Math.pow(10, Math.floor(Math.log10(bruto || 1))),
    f = bruto / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p;
}
