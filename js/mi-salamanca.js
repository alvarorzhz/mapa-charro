// «Tu Salamanca» (#tu-salamanca, botón «Tu Salamanca» de «Lo tuyo»): el perfil y las cifras en una ficha con
// tres pestañas (Resumen, Actividad y Logros) y sus filtros. Los cálculos están en mi-salamanca-calculos.js,
// las piezas de cada apartado en mi-salamanca-piezas.js y las del perfil (cabecera, actividad, historial y
// juego) en perfil.js.

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

// Las pestañas de la ficha y su enlace (#tu-salamanca, #tu-salamanca/actividad, #tu-salamanca/logros)
const PESTANAS_TU_SALAMANCA = [
  ['resumen', 'Resumen'],
  ['actividad', 'Actividad'],
  ['logros', 'Logros']
];
let pestanaTuSalamanca = 'resumen';
const hashTuSalamanca = () =>
  'tu-salamanca' + (pestanaTuSalamanca == 'resumen' ? '' : '/' + pestanaTuSalamanca);

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
  const nombre = nombreUsuario(),
    scroll = document.querySelector('#sh .sb').scrollTop,
    caja = fichaLimpia('Tu Salamanca', nombre ? 'Hola, ' + nombre : 'Lo que llevas'),
    desde = inicioPeriodo(periodoEstadisticas),
    desdeTexto = desde
      ? desde.getFullYear() + '-' + String(desde.getMonth() + 1).padStart(2, '0') + '-01'
      : '',
    nuevosEnPeriodo = lado => historial.conFecha.filter(v => v.lado == lado && v.fecha >= desdeTexto).length,
    enPeriodo = lado => (desde ? nuevosEnPeriodo(lado) : 0),
    filtros = () => {
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
        caja.appendChild(
          filaFiltros('Periodo', PERIODOS, periodoEstadisticas, v => (periodoEstadisticas = v))
        );
    };

  caja.appendChild(cabeceraPerfil());
  const pestanas = filaFiltros('Apartado', PESTANAS_TU_SALAMANCA, pestanaTuSalamanca, v => {
    pestanaTuSalamanca = v;
    document.querySelector('#sh .sb').scrollTop = 0;
  });
  pestanas.classList.add('pestanas-ts');
  caja.appendChild(pestanas);

  if (pestanaTuSalamanca == 'resumen') {
    if (nada) caja.appendChild(avisoSinNada());
    else {
      caja.appendChild(
        crear('p', 'hab', 'Lo que llevas recorrido. Sin prisa: cada cifra lleva a su sitio del mapa.')
      );
      caja.appendChild(resumenPorcentajes(capital, provincia, ambitoEstadisticas));
    }
    filtros();
    if (ambitoEstadisticas != 'provincia') caja.appendChild(apartadoCapital(capital, enPeriodo('capital')));
    if (ambitoEstadisticas != 'capital')
      caja.appendChild(apartadoProvincia(provincia, enPeriodo('provincia')));
    // Qué se ha explorado más y qué está sin empezar
    if (!nada) caja.appendChild(apartadoCategorias(datos.categorias, ambitoEstadisticas));
    // Por dónde seguir: en «¿Qué puedo descubrir hoy?», que lo tiene todo (no se repite aquí)
    const hoy = crear('button', 'boton-hoy', '🌅 Por dónde seguir: ¿Qué puedo descubrir hoy?');
    hoy.onclick = () => abrirHoy();
    // La imagen para compartir
    const imagen = crear('button', 'boton-hoy', '📸 Crear mi imagen para compartir');
    imagen.onclick = () => abrirImagenMiSalamanca(imagen);
    caja.appendChild(crear('div', 'botones-aviso', hoy, imagen));
  } else if (pestanaTuSalamanca == 'actividad') {
    if (!nada) {
      filtros();
      caja.appendChild(apartadoMeses(historial, ambitoEstadisticas, periodoEstadisticas));
    }
    caja.append(...apartadosActividad());
  } else {
    caja.appendChild(apartadoColecciones(logros));
    caja.appendChild(
      crear('section', 'ms-apartado', crear('h3', '', '📋 Todos los logros'), listaDeLogros())
    );
    caja.appendChild(apartadoJuego());
  }

  $('#ap').textContent =
    textoCuentaPerfil() +
    ' Todo se calcula ahora a partir de lo que has marcado. Nadie más lo ve y no es una competición.';
  if (refrescar) {
    // Repintado (filtros, pestañas o cambios que llegan de la cuenta): sin mover el foco ni el desplazamiento
    $('#sh').classList.add('o');
    document.querySelector('#sh .sb').scrollTop = scroll;
    escribirHash(hashTuSalamanca(), false);
    return;
  }
  mostrarFicha();
  enlaceFicha(hashTuSalamanca(), 'Tu Salamanca');
}
// Abre «Tu Salamanca» en una pestaña; con «categoria», abre y enseña esa categoría de logros
function abrirTuSalamanca(pestana = 'resumen', categoria) {
  pestanaTuSalamanca = PESTANAS_TU_SALAMANCA.some(p => p[0] == pestana) ? pestana : 'resumen';
  pintarEstadisticas();
  const cat = categoria && document.querySelector('#info .cat-logros[data-cat="' + categoria + '"]');
  if (cat) cat.scrollIntoView({ behavior: comoDesplazar(), block: 'start' });
}
const abrirEstadisticas = () => abrirTuSalamanca();
// Si cambia el progreso con el panel abierto (p. ej. llega de la cuenta), se repinta (vistas.js: actualizar)
function refrescarEstadisticas() {
  if (nombreFicha == 'Tu Salamanca' && $('#sh').classList.contains('o')) pintarEstadisticas(true);
}

$('#perfil').onclick = () => abrirTuSalamanca();
