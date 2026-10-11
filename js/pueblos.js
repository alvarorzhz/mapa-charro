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
