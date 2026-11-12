// Días especiales: ese día, al abrir la app, cae una animación ligera y sale arriba un aviso que se puede cerrar
// (lógica en js/fiestas.js). Si dos coinciden, gana el que va antes en la lista.
//   id        no cambiarlo (se apunta el último visto en este navegador)
//   n         nombre
//   desde     'MM-DD' o 'P+N'/'P-N' (días desde el Domingo de Resurrección, como en CULTURA)
//   hasta     último día (opcional; si no, solo «desde»)
//   anim      nieve, fuegos, confeti, estrellas, luces, agua, toros, flores, sol u hojas (ANIMACIONES_FIESTA)
//   icono     emoji del aviso
//   texto     lo que dice el aviso; los datos, como en el resto de la app, con fuente: o ya están en la app
//             (cultura, curiosidades) o van en «fuentes»
//   cultura   id de CULTURA para el botón «Saber más» (opcional)
//   fuentes   [[medio, url]] (opcional)
export const DIAS_ESPECIALES = [
  {
    id: 'ano-nuevo',
    n: 'Año Nuevo',
    desde: '01-01',
    anim: 'fuegos',
    icono: '🎆',
    texto: '¡Feliz año nuevo! Que este año te deje muchos sitios nuevos que marcar en el mapa.'
  },
  {
    id: 'reyes',
    n: 'Reyes',
    desde: '01-05',
    hasta: '01-06',
    anim: 'estrellas',
    icono: '👑',
    texto: '¡Llegan los Reyes Magos! Que os traigan muchos regalos (y poco carbón).'
  },
  {
    id: 'carnaval',
    n: 'Carnaval',
    desde: 'P-49',
    hasta: 'P-47',
    anim: 'confeti',
    icono: '🎭',
    texto: 'Es Carnaval: en Ciudad Rodrigo, días de Carnaval del Toro.',
    cultura: 'carnaval-del-toro'
  },
  {
    id: 'semana-santa',
    n: 'Semana Santa',
    desde: 'P-7',
    hasta: 'P+0',
    anim: 'luces',
    icono: '🕯️',
    texto: 'Semana Santa en Salamanca, Fiesta de Interés Turístico Internacional desde 2003.',
    cultura: 'semana-santa-salamanca'
  },
  {
    id: 'lunes-de-aguas',
    n: 'Lunes de Aguas',
    desde: 'P+8',
    anim: 'agua',
    icono: '🧺',
    texto: 'Hoy es Lunes de Aguas: merienda en el campo o a orillas del Tormes, con hornazo.',
    cultura: 'lunes-de-aguas'
  },
  {
    id: 'san-juan-de-sahagun',
    n: 'San Juan de Sahagún',
    desde: '06-12',
    anim: 'confeti',
    icono: '🐂',
    texto:
      'Hoy es San Juan de Sahagún, patrón de Salamanca: el que, según la tradición, paró a un toro bravo en la calle Tentenecio con un «¡Tente, necio!».',
    fuentes: [['Wikipedia', 'https://es.wikipedia.org/wiki/Juan_de_Sahag%C3%BAn']]
  },
  {
    id: 'mariseca',
    n: 'La Mariseca',
    desde: '07-25',
    anim: 'toros',
    icono: '🐂',
    texto:
      'Cada 25 de julio se coloca en lo alto de la Plaza Mayor la Mariseca, un toro de lata que anuncia las corridas de las ferias.'
  },
  {
    id: 'virgen-de-la-vega',
    n: 'Virgen de la Vega',
    desde: '09-08',
    anim: 'fuegos',
    icono: '🎡',
    texto: 'Hoy es la Virgen de la Vega, patrona de Salamanca, en plenas Ferias y Fiestas de septiembre.',
    fuentes: [['Wikipedia', 'https://es.wikipedia.org/wiki/Virgen_de_la_Vega_(Salamanca)']]
  },
  {
    id: 'navidad',
    n: 'Navidad',
    desde: '12-24',
    hasta: '12-25',
    anim: 'nieve',
    icono: '🎄',
    texto: '¡Feliz Navidad desde el mapa charro!'
  },
  {
    id: 'nochevieja',
    n: 'Nochevieja',
    desde: '12-31',
    anim: 'fuegos',
    icono: '🥂',
    texto: '¡Feliz salida de año! Doce uvas y a por el siguiente.'
  }
];

// Cambios de estación: el día lo calcula fiestas.js (equinoccios y solsticios, hora de Salamanca).
// [id, estación, animación, icono]; van por orden: marzo, junio, septiembre y diciembre
export const ESTACIONES = [
  ['primavera', 'la primavera', 'flores', '🌸'],
  ['verano', 'el verano', 'sol', '☀️'],
  ['otono', 'el otoño', 'hojas', '🍂'],
  ['invierno', 'el invierno', 'nieve', '❄️']
];
