// Bienvenida: cuatro pantallitas que explican la app la primera vez que se abre (y con el botón «?»).
// Si se entra por un enlace a una ficha (#tejares…), no se muestra para no tapar lo que se quería ver;
// saldrá la próxima vez que se abra la app sin enlace. Que ya se ha visto se recuerda en este
// navegador (es una comodidad: si no se puede guardar, se vuelve a ver la próxima vez).

const CLAVE_BIENVENIDA = 'charro-bienvenida';
const PASOS_BIENVENIDA = [
  [
    '🗺️',
    '¡Bienvenido al Mapa charro!',
    'Un mapa de Salamanca para ir marcando los barrios y pueblos de alrededor que has pisado, y descubrir sus curiosidades, leyendas y dónde comer.'
  ],
  [
    '👆',
    'Pulsa una zona',
    'Se abre su ficha. Pulsa «He estado» o «Quiero ir» y se pinta en el mapa. Con dos dedos (o la rueda del ratón) acercas y alejas. La brújula marca dónde estás: tu ubicación no se guarda ni se envía.'
  ],
  [
    '🏛️',
    'Mucho por descubrir',
    'Con el botón de capas, junto al zoom, enciendes los monumentos y las carreteras y ves la leyenda. Debajo del mapa, una ruta a pie por el centro y «Salamanca en el tiempo». En «Provincia» están todos los pueblos y en «Lista», todas las zonas.'
  ],
  [
    '🎯',
    'Juega y comparte',
    'Haz el reto diario «¿Dónde está?», saca la imagen de «Mi Salamanca» para compartirla y ve sumando logros. ¡Y busca la rana!'
  ]
];

const bienvenidaVista = () => {
  try {
    return localStorage.getItem(CLAVE_BIENVENIDA) == '1';
  } catch (e) {
    return false;
  }
};
const marcarBienvenidaVista = () => {
  try {
    localStorage.setItem(CLAVE_BIENVENIDA, '1');
  } catch (e) {}
};

function mostrarBienvenida(paso = 0, volverA = document.activeElement) {
  marcarBienvenidaVista();
  const [icono, titulo, texto] = PASOS_BIENVENIDA[paso],
    ultimo = paso == PASOS_BIENVENIDA.length - 1,
    puntos = crear('div', 'puntos', ...PASOS_BIENVENIDA.map((_, i) => crear('i', i == paso ? 'on' : ''))),
    contenido = crear('div', 'bienvenida', crear('div', 'icono', icono), crear('p', '', texto), puntos);
  puntos.setAttribute('role', 'img');
  puntos.setAttribute('aria-label', 'Paso ' + (paso + 1) + ' de ' + PASOS_BIENVENIDA.length);
  const ir = n => () => mostrarBienvenida(n, volverA);
  abrirVentana(
    titulo,
    contenido,
    [
      paso ? ['Anterior', ir(paso - 1)] : ['Saltar', cerrarVentana],
      ultimo ? ['¡A pisar Salamanca!', cerrarVentana, 'on'] : ['Siguiente', ir(paso + 1), 'on']
    ],
    volverA
  );
  // El foco, en el botón principal (el de la derecha)
  const botones = document.querySelectorAll('.modal .botones button');
  botones[botones.length - 1].focus({ preventScroll: true });
}

// Al arrancar (inicio.js): solo la primera vez y sin enlace a una ficha
const tocaBienvenida = () => !bienvenidaVista() && !location.hash;

$('#ayuda').onclick = () => mostrarBienvenida(0, $('#ayuda'));
