// «Mi Salamanca»: el panel (#mi-salamanca), con sus filtros. Los cálculos están en mi-salamanca-calculos.js y
// las piezas de cada apartado en mi-salamanca-piezas.js.

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

  if (nada) caja.appendChild(avisoSinNada());
  else {
    caja.appendChild(
      crear('p', 'hab', 'Lo que llevas recorrido. Sin prisa: cada cifra lleva a su sitio del mapa.')
    );
    caja.appendChild(resumenPorcentajes(capital, provincia, ambitoEstadisticas));
  }

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

  if (ambitoEstadisticas != 'provincia') caja.appendChild(apartadoCapital(capital, enPeriodo('capital')));
  if (ambitoEstadisticas != 'capital') caja.appendChild(apartadoProvincia(provincia, enPeriodo('provincia')));

  // Qué se ha explorado más y qué está sin empezar; y por dónde seguir
  if (!nada) caja.appendChild(apartadoCategorias(datos.categorias, ambitoEstadisticas));
  caja.appendChild(apartadoSeguir(datos));

  if (!nada) caja.appendChild(apartadoMeses(historial, ambitoEstadisticas, periodoEstadisticas));
  caja.appendChild(apartadoColecciones(logros));

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
