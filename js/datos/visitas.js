// Cómo visitar cada monumento: horario y precio (bloque «Visitar» de su ficha, js/monumentos.js).
// Todo sale del folleto oficial de Turismo de Salamanca de la temporada (FUENTE_VISITAS). Los horarios cambian
// en primavera y en otoño: al poner los del folleto nuevo, cambia también `vigente` y `revisado`.
// VISITAS[id de MONUMENTOS] = {
//   libre: true si es un espacio abierto (plaza, puente): siempre abierto y gratis, sin más datos;
//   cerrado: texto si ahora no se puede visitar;
//   horario: [[días, horas]], precio: [[quién, cuánto]] (sin precio: el folleto no lo da),
//   gratis: texto (entrada gratuita, o cuándo lo es), nota: texto (lo demás que dice el folleto),
//   web: https del monumento (la que da el folleto) }
export const FUENTE_VISITAS = {
  nombre: 'Turismo de Salamanca: horarios de monumentos y museos',
  url: 'https://www.salamanca.es/prepara-tu-viaje/horarios-de-monumentos',
  pdf: 'https://salamanca.es/uploads/documentosdescargables/26/HORARIOS_A_PARTIR_9_NOV-1.pdf',
  vigente: 'desde el 9 de noviembre de 2026',
  revisado: '2026-11-15'
};

export const VISITAS = {
  plazamayor: { libre: true },
  puenteromano: { libre: true },
  'puente-estevan': { libre: true },
  catedrales: {
    horario: [['Todos los días', '10:00–18:00 (última entrada 17:15)']],
    precio: [
      ['General, con audioguía', '10 €'],
      ['Estudiantes de 17 a 30 años, mayores de 65 y peregrinos', '9 €'],
      ['Niños de 7 a 16 años y grupos con guía', '7 €'],
      ['Desempleados', '6 €']
    ],
    gratis: 'Martes de 16:00 a 18:00 (último acceso 17:00), niños hasta 6 años y residentes de la diócesis',
    nota: 'Las torres (Ieronimus) se suben aparte, por la puerta de la torre en la plaza de Juan XXIII: todos los días de 10:00 a 20:00 (última entrada 19:00), 6 €; gratis los domingos y para niños hasta 10 años. Los viernes y sábados hay visitas nocturnas guiadas (12 €).',
    web: 'https://www.catedralsalamanca.org'
  },
  universidad: {
    horario: [
      ['Lunes a sábado', '9:30–19:00 (última entrada 18:15)'],
      ['Domingos y festivos', '10:00–14:00 (última entrada 13:15)']
    ],
    precio: [
      ['General', '10 €'],
      ['Jubilados, familia numerosa, estudiantes y grupos', '5 €']
    ],
    gratis: 'Lunes de 15:00 a 19:00, menores de 12 años y estudiantes de la Universidad de Salamanca',
    nota: 'Con la misma entrada se ve el Cielo de Salamanca, en el Patio de Escuelas: lunes a sábado de 10:00 a 19:00 y domingos de 10:00 a 14:00.',
    web: 'https://museo.usal.es'
  },
  clerecia: {
    horario: [
      ['Torres (Scala Coeli), todos los días', '10:00–20:00 (última entrada 19:15)'],
      [
        'Iglesia y Universidad Pontificia',
        'visita guiada de martes a domingo, por la mañana y por la tarde (domingos, solo por la mañana)'
      ]
    ],
    precio: [
      ['Torres', '3,75 €'],
      ['Iglesia y Universidad Pontificia', '4 €'],
      ['Las dos visitas', '6 €']
    ],
    gratis: 'Torres: martes no festivos de 10:00 a 12:00, con reserva previa. Menores de 12 años',
    web: 'https://www.torresdelaclerecia.com'
  },
  conchas: {
    horario: [
      ['Lunes a viernes', '9:00–21:00'],
      ['Sábados', '9:00–14:00 y 16:00–19:00'],
      ['Domingos y festivos', '10:00–14:00 y 16:00–19:00']
    ],
    gratis: 'Entrada gratuita'
  },
  sanesteban: {
    horario: [['Todos los días', '10:00–14:00 y 16:00–18:00 (últimas entradas 13:15 y 17:15)']],
    precio: [
      ['General', '4,75 €'],
      ['Estudiantes menores de 25, mayores de 65 y grupos', '3,75 €']
    ],
    gratis: 'Niños hasta 10 años',
    nota: 'La visita a la terraza se consulta en la taquilla.',
    web: 'https://www.conventosanesteban.es'
  },
  duenas: {
    horario: [
      ['Lunes a sábado', '10:30–12:45 y 16:30–17:30'],
      ['Domingos y festivos religiosos', 'cerrado']
    ],
    precio: [
      ['General', '3 €'],
      ['Grupos', '2 €']
    ]
  },
  casalis: {
    horario: [
      ['Lunes a viernes', '11:00–17:00'],
      ['Sábados', '11:00–20:00'],
      ['Domingos', '11:00–15:00']
    ],
    precio: [
      ['General', '7 €'],
      ['Jubilados, estudiantes y grupos', '3 €'],
      ['Desempleados', '1 €']
    ],
    gratis: 'Jueves de 11:00 a 14:00 y niños hasta 14 años',
    nota: 'Entrada conjunta con el Palacio de Monterrey: 8 € (6 € estudiantes y jubilados). Con el Museo de la Automoción: 7 €, solo en la Oficina de Turismo de la Plaza Mayor.',
    web: 'https://www.museocasalis.org'
  },
  huerto: {
    horario: [['Todos los días', 'de 10:00 a la puesta de sol']],
    gratis: 'Entrada libre, respetando el aforo'
  },
  monterrey: {
    horario: [['Martes a domingo', '10:30–14:30 y 16:00–18:00 (últimas entradas 13:30 y 17:00)']],
    precio: [
      ['General', '7 €'],
      [
        'Niños de 6 a 12, residentes en Salamanca, jubilados, desempleados, familia numerosa y estudiantes menores de 25',
        '5 €'
      ]
    ],
    gratis: 'Menores de 6 años, y martes de 10:30 a 11:00 con reserva en la web una semana antes',
    nota: 'La cocina y las celdas, 2,50 € más. Visitas nocturnas y guiadas: 15 €.',
    web: 'https://www.palaciodemonterrey.com'
  },
  cueva: {
    horario: [['Todos los días', '8:30–21:30']],
    gratis: 'Entrada gratuita',
    nota: 'Al lado, en la cuesta de Carvajal, el centro de interpretación de la muralla «Salmantica Sedes Antiqva Castrorvm» (gratis): viernes de 17:00 a 20:00; sábados, domingos y festivos de 10:00 a 14:00 y de 17:00 a 20:00.'
  },
  fonseca: {
    nota: 'El folleto de Turismo no da su horario: pregúntalo en el colegio (923 29 45 70).',
    web: 'https://colegiofonseca.usal.es'
  },
  'palacio-salina': {
    horario: [['Todos los días (el patio)', '10:00–21:00']],
    gratis: 'Entrada gratuita'
  },
  sanmartin: {
    horario: [
      ['Martes, jueves y viernes', '17:00–20:00'],
      ['Miércoles', '16:30–19:30'],
      ['Sábados', '11:00–14:00 y 17:00–20:00']
    ],
    precio: [['General', '3 €']]
  },
  'casa-unamuno': {
    horario: [['Lunes a sábado (no festivos)', '10:00–14:00, visitas a las horas en punto']],
    precio: [
      ['General', '4 €'],
      ['Grupos, estudiantes, familia numerosa y jubilados', '2 €']
    ],
    gratis: 'Lunes, estudiantes de la Universidad de Salamanca y menores de 12 años',
    nota: 'Las entradas se compran en el edificio histórico de la Universidad.',
    web: 'https://unamuno.usal.es'
  },
  'museo-salamanca': {
    cerrado: 'Cerrado temporalmente.',
    web: 'https://museoscastillayleon.jcyl.es/museodesalamanca'
  },
  'santa-clara': {
    horario: [
      ['Martes a sábado', '10:00–13:30 y 16:00–18:00 (últimas entradas 13:00 y 17:30)'],
      ['Domingos y festivos', '10:00–14:00 (última entrada 13:30)']
    ],
    precio: [
      ['General, con audioguía', '8 €'],
      ['Con la entrada de la Catedral, mayores de 65, de 13 a 17 años y en la web', '5 €']
    ],
    gratis: 'Niños hasta 12 años',
    nota: 'Visita guiada los viernes a las 18:00 (10 €).',
    web: 'https://www.museolasclaras.es'
  },
  purisima: {
    horario: [
      ['Lunes a viernes', '17:30–19:00 y 19:30–20:00'],
      ['Sábados', '11:30–13:00 y 17:30–19:00']
    ],
    web: 'https://www.lapurisimasalamanca.es'
  },
  veracruz: {
    horario: [
      ['Viernes', '17:00–20:00'],
      ['Sábados', '11:00–14:00 y 17:00–20:00'],
      ['Domingos', '11:00–14:00']
    ],
    gratis: 'Entrada gratuita',
    nota: 'El primer domingo de cada mes, el acceso se limita durante el culto (12:30–13:15).',
    web: 'https://www.veracruzsalamanca.es'
  },
  automocion: {
    horario: [['Martes a domingo', '10:00–14:00 y 17:00–20:00']],
    precio: [
      ['General', '7 €'],
      ['Familias numerosas, niños mayores de 5 años, estudiantes, jubilados y grupos', '4 €'],
      ['Desempleados', '1 €']
    ],
    gratis: 'Niños hasta 4 años y el primer martes de cada mes de 17:00 a 20:00',
    nota: 'Entrada conjunta con la Casa Lis: 7 €, solo en la Oficina de Turismo de la Plaza Mayor.',
    web: 'https://www.museoautomocion.com'
  },
  'museo-taurino': {
    horario: [
      ['Martes a sábado', '10:30–13:30 y 17:30–20:00'],
      ['Domingos y festivos', '10:30–13:30']
    ],
    precio: [
      ['General', '3 €'],
      ['Pensionistas y estudiantes menores de 25', '2 €'],
      ['Grupos de más de 20', '1,50 €']
    ],
    web: 'https://www.museotaurinosalamanca.es'
  },
  da2: {
    horario: [
      ['Martes a viernes', '12:00–14:00 y 17:00–20:00'],
      ['Sábados, domingos y festivos', '11:00–15:00 y 17:00–21:00']
    ],
    gratis: 'Entrada gratuita',
    nota: 'Visitas guiadas: sábados a las 18:00 y 19:00; domingos y festivos a las 13:00, 18:00 y 19:00.',
    web: 'https://www.domusartium2002.com'
  },
  'museo-comercio': {
    horario: [
      ['Martes a sábado', '10:00–14:00 y 17:00–20:00'],
      ['Lunes y domingos', '10:00–14:00']
    ],
    gratis: 'Entrada gratuita',
    web: 'https://www.museodelcomercio.es'
  },
  logia: {
    horario: [
      ['Martes a viernes', '11:00–18:00'],
      ['Sábados', '11:00–19:00'],
      ['Domingos y festivos', '11:00–14:00']
    ],
    gratis: 'Entrada gratuita',
    nota: 'Hay un audiovisual cada 15 minutos.'
  },
  filmoteca: {
    horario: [
      ['Martes a viernes', '10:00–14:00 y 17:00–19:30'],
      ['Sábados, domingos y festivos', '10:00–14:00']
    ],
    gratis: 'Entrada gratuita',
    nota: 'Se visita la colección permanente «Artilugios para fascinar».',
    web: 'https://www.filmotecadecastillayleon.es'
  },
  monumenta: {
    horario: [
      ['Martes a sábado', '10:00–14:00 y 16:30–18:00'],
      ['Domingos y festivos', '10:00–14:00']
    ],
    gratis: 'Entrada gratuita'
  },
  'santa-maria-vega': {
    horario: [['Los cuatro primeros miércoles de cada mes', '18:00–19:00']]
  },
  botanico: {
    horario: [
      ['Martes a sábado', '10:00–19:30'],
      ['Domingos y festivos', '10:00–14:00']
    ],
    gratis: 'Entrada libre'
  },
  'cerro-sanvicente': {
    horario: [
      ['Viernes', '17:30–20:30'],
      ['Sábados', '11:30–14:00 y 17:30–20:30'],
      ['Domingos', '11:30–14:00']
    ],
    gratis: 'Entrada libre hasta completar el aforo',
    nota: 'Visitas guiadas: viernes a las 18:00, sábados a las 12:00 y 18:00 y domingos a las 12:00.'
  }
};
