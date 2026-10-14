// Detalles escondidos: figuras pequeñas que buscar en las fachadas de la capital (lista #detalles, ficha
// #detalle/<id>, lógica en js/detalles.js). Cada uno:
//   id          va en el progreso (j.de) y en el enlace: no cambiarlo
//   n, icono    nombre y emoji
//   monumento   id de MONUMENTOS donde está
//   pista       dónde mirar, sin decirlo todo
//   textos      [[tipo, texto]] con los tipos de TIPOS_TEXTO_CULTURA ('hecho' documentado o 'tradicion');
//               se leen al encontrarlo
//   foto        de Wikimedia Commons, 640×430, el premio al encontrarlo (opcional):
//               { src, pie, autor, licencia, url (página del archivo en Commons) }
//   fuentes     [[medio, url]]
//   revisado    fecha de la última revisión (AAAA-MM-DD)

const DETALLES = [
  {
    id: 'astronauta',
    n: 'El astronauta',
    icono: '🧑‍🚀',
    monumento: 'catedrales',
    pista:
      'En la Puerta de Ramos de la Catedral Nueva, la que mira al Palacio de Anaya. Busca en el lado izquierdo de la puerta, entre las hojas de piedra.',
    textos: [
      [
        'hecho',
        'Lo labró en 1992 el cantero Miguel Romero, al restaurar la Puerta de Ramos para la exposición Las Edades del Hombre de 1993.'
      ],
      [
        'hecho',
        'Sigue la tradición de añadir algo de su tiempo en cada restauración. En 2010 un acto vandálico le rompió el brazo derecho.'
      ]
    ],
    foto: {
      src: 'img/detalle-astronauta.jpg',
      pie: 'El astronauta de la Puerta de Ramos',
      autor: 'Ignasilm',
      licencia: 'CC BY-SA 3.0 ES',
      url: 'https://commons.wikimedia.org/wiki/File:Astronauta_en_la_Catedral_Nueva_de_Salamanca.jpg'
    },
    fuentes: [['Wikipedia', 'https://es.wikipedia.org/wiki/Catedral_Nueva_de_Salamanca']],
    revisado: '2026-10-14'
  },
  {
    id: 'dragon-helado',
    n: 'El dragón con helado',
    icono: '🍦',
    monumento: 'catedrales',
    pista:
      'En la misma Puerta de Ramos que el astronauta. Baja la vista desde él y busca a alguien muy contento.',
    textos: [
      [
        'hecho',
        'Es un dragón sonriente con un helado de tres bolas. Se talló en la misma restauración de 1992 que el astronauta.'
      ]
    ],
    foto: {
      src: 'img/detalle-dragon-helado.jpg',
      pie: 'El dragón con su helado de tres bolas',
      autor: 'Rastrojo (D•ES)',
      licencia: 'CC BY-SA 3.0 ES',
      url: 'https://commons.wikimedia.org/wiki/File:Drag%C3%B3n_con_helado_de_la_Puerta_de_Ramos_de_la_Catedral_Nueva_de_Salamanca.jpg'
    },
    fuentes: [['Wikipedia', 'https://es.wikipedia.org/wiki/Catedral_Nueva_de_Salamanca']],
    revisado: '2026-10-14'
  },
  {
    id: 'lince-toro',
    n: 'El lince y el toro',
    icono: '🐂',
    monumento: 'catedrales',
    pista: 'Puerta de Ramos otra vez: uno está justo debajo del astronauta y el otro, a su derecha.',
    textos: [
      [
        'hecho',
        'Son otros dos adornos de la restauración de la Puerta de Ramos. Debajo del toro está el dragón con el helado.'
      ]
    ],
    fuentes: [['Wikipedia', 'https://es.wikipedia.org/wiki/Catedral_Nueva_de_Salamanca']],
    revisado: '2026-10-14'
  },
  {
    id: 'agua-cielo-tierra',
    n: 'Agua, cielo y tierra',
    icono: '🦀',
    monumento: 'catedrales',
    pista: 'En la Puerta de Ramos, más a la derecha y ya junto a la puerta: busca tres animales seguidos.',
    textos: [
      [
        'hecho',
        'Son un cangrejo de río, una cigüeña y una liebre, y representan el agua, el cielo y la tierra de Salamanca.'
      ]
    ],
    fuentes: [['Wikipedia', 'https://es.wikipedia.org/wiki/Catedral_Nueva_de_Salamanca']],
    revisado: '2026-10-14'
  },
  {
    id: 'rana',
    n: 'La rana de la fachada',
    icono: '🐸',
    monumento: 'universidad',
    pista:
      'En la fachada de las Escuelas Mayores, en el Patio de Escuelas. Está sobre una calavera, perdida entre los adornos. Encontrarla sin ayuda tiene premio.',
    textos: [
      [
        'hecho',
        'En realidad es un sapo, aunque todo el mundo la llama rana. Encima de un cráneo, era un aviso a los estudiantes: representaba la lujuria, unida a la muerte.'
      ],
      ['tradicion', 'Según la tradición, quien la encuentra tendrá éxito en los estudios.']
    ],
    foto: {
      src: 'img/detalle-rana.jpg',
      pie: 'La rana, o el sapo, sobre la calavera',
      autor: 'Portster',
      licencia: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Rana_de_la_fachada_de_la_Universidad_de_Salamanca.jpg'
    },
    fuentes: [['Wikipedia', 'https://es.wikipedia.org/wiki/Fachada_de_la_Universidad_de_Salamanca']],
    revisado: '2026-10-14'
  },
  {
    id: 'reyes-griego',
    n: 'Los Reyes y la frase en griego',
    icono: '👑',
    monumento: 'universidad',
    pista:
      'En la parte baja de la fachada de las Escuelas Mayores, en el centro: dos reyes que sujetan un mismo cetro.',
    textos: [
      [
        'hecho',
        'Son Fernando e Isabel, los Reyes Católicos. Alrededor, un texto en griego dice «Los Reyes a la Universidad y la Universidad a los Reyes». Encima están el yugo y las flechas de sus emblemas.'
      ]
    ],
    fuentes: [['Wikipedia', 'https://es.wikipedia.org/wiki/Fachada_de_la_Universidad_de_Salamanca']],
    revisado: '2026-10-14'
  },
  {
    id: 'papa-catedra',
    n: 'El papa y sus seis oyentes',
    icono: '📜',
    monumento: 'universidad',
    pista:
      'Mira arriba del todo, en el centro de la fachada de las Escuelas Mayores: alguien da clase desde su cátedra.',
    textos: [
      [
        'hecho',
        'Es un papa que habla a seis hombres; quizá Benedicto XIII, el Papa Luna, o Martín V. Es la misma escena del escudo de la Universidad. A los lados están Hércules y Venus.'
      ]
    ],
    fuentes: [['Wikipedia', 'https://es.wikipedia.org/wiki/Fachada_de_la_Universidad_de_Salamanca']],
    revisado: '2026-10-14'
  },
  {
    id: 'calaveras',
    n: 'Las cuatro calaveras',
    icono: '💀',
    monumento: 'casa-muertes',
    pista: 'En la fachada de la Casa de las Muertes. Mira bien las dos ventanas de arriba.',
    textos: [
      [
        'hecho',
        'Son cuatro calaveras de piedra que parecen colgar de las jambas de las ventanas. Junto con el asesinato de cuatro vecinos a comienzos del siglo XIX, le dieron a la casa su nombre.'
      ]
    ],
    fuentes: [['Wikipedia', 'https://es.wikipedia.org/wiki/Casa_de_las_Muertes']],
    revisado: '2026-10-14'
  },
  {
    id: 'escudo-pimentel',
    n: 'El escudo de doña Juana',
    icono: '🐚',
    monumento: 'conchas',
    pista:
      'Entre las conchas de la Casa de las Conchas hay un escudo con conchas y barras. Busca debajo de las ventanas.',
    textos: [
      [
        'hecho',
        'Las barras y las conchas son el escudo de doña Juana, la mujer de Rodrigo Arias Maldonado; las conchas eran el símbolo de los Pimentel. Algunos autores creen que tantas conchas en la fachada son un homenaje a ella.'
      ],
      [
        'tradicion',
        'La leyenda dice que la familia escondió sus joyas bajo una de las conchas y que, para buscarlas, hay que dejar antes una fianza.'
      ]
    ],
    fuentes: [['Wikipedia', 'https://es.wikipedia.org/wiki/Casa_de_las_Conchas']],
    revisado: '2026-10-14'
  },
  {
    id: 'verraco',
    n: 'El verraco sin cabeza',
    icono: '🐗',
    monumento: 'puenteromano',
    pista: 'A la entrada del Puente Romano. Es de granito y le falta algo.',
    textos: [
      [
        'hecho',
        'Es una escultura vetona, de antes de los romanos, que perdió la cabeza. Está documentada junto al puente desde 1378 y sale en el escudo de la ciudad, junto al puente.'
      ]
    ],
    fuentes: [['Wikipedia', 'https://es.wikipedia.org/wiki/Puente_romano_de_Salamanca']],
    revisado: '2026-10-14'
  },
  {
    id: 'medallones',
    n: 'Unamuno, Cervantes y Colón',
    icono: '🖼️',
    monumento: 'plazamayor',
    pista:
      'Entre los arcos de la Plaza Mayor hay medallones con caras. Encuentra a estos tres; los reyes están en el lado este.',
    textos: [
      [
        'hecho',
        'Los 88 arcos de la plaza tienen medallones. Los del Pabellón Real, el lado este, son reyes de España; en los demás hay santos, sabios y descubridores, como Cristóbal Colón, Miguel de Cervantes y Miguel de Unamuno.'
      ]
    ],
    fuentes: [['Wikipedia', 'https://es.wikipedia.org/wiki/Plaza_Mayor_de_Salamanca']],
    revisado: '2026-10-14'
  }
];
