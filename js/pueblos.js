// Fichas de pueblos de la provincia (datos en js/datos/pueblos.js). Enlace: #pueblo/<nombre>

let puebloAbierto = null; // municipio (de PROVINCIA.m) cuya ficha está abierta
const fichaPueblo = m => PUEBLOS[m.n];
const municipioPorNombre = n => PROVINCIA.m.find(m => m.n == n);

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
  pintarFoto(null);

  // Cabecera: habitantes y monumento o lugar principal
  const caja = $('#info');
  caja.textContent = '';
  caja.hidden = false;
  caja.appendChild(
    crear(
      'p',
      'hab',
      'Unos ' +
        f.hab +
        ' habitantes (INE)' +
        (m.P.length ? ' · ' + m.P.length + (m.P.length == 1 ? ' pedanía' : ' pedanías') : '')
    )
  );
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
  $('#he').hidden = false;
  pintarSitiosComer(
    f.comer,
    m.n + ' Salamanca',
    'Ningún sitio con buena nota y bastantes opiniones en Gastroranking.'
  );

  // Fuente
  const ap = $('#ap');
  ap.textContent = 'Fuente: ';
  f.fuente.forEach(([nombre, url], i) => {
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

// Botón «Ver ficha» en la barra del pueblo seleccionado de la pestaña Provincia
function botonFichaPueblo(m) {
  if (!fichaPueblo(m)) return null;
  const b = crear('button', 'verficha', 'Ver la ficha de ' + m.n);
  b.onclick = () => abrirPueblo(m);
  return b;
}
