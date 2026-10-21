// Salamanca desaparecida (js/desaparecida.js): conventos, colegios e iglesias de la capital que ya no existen.
// En «Salamanca en el tiempo» aparecen en la etapa en que se levantan y se quedan como fantasmas desde la etapa
// en que se pierden. { id (no cambiar: enlaces #desaparecida/id), n, tipo: pictograma (PICTOGRAMAS, monumentos.js),
//   la, lo: un punto de OpenStreetMap de lo que hay hoy en su sitio, aproximada: true si las fuentes solo dan la zona,
//   donde: dónde estaba y qué hay hoy, levantado y perdido: [texto, etapa de ETAPAS],
//   textos: [[tipo de TIPOS_TEXTO_CULTURA, texto]], fuentes: [[nombre, url]], revisado: 'AAAA-MM-DD' }
const FUENTE_GACETA_FANTASMA = [
  'La Gaceta de Salamanca: la Salamanca «fantasma» (2025)',
  'https://www.lagacetadesalamanca.es/salamanca/salamanca-fantasma-seduce-visitantes-lunes-ofrece-jornada-20250518191316-nt.html'
];
const FUENTE_GACETA_DESAPARECIDA = [
  'La Gaceta de Salamanca: la Salamanca desaparecida (2020)',
  'https://www.lagacetadesalamanca.es/salamanca/la-salamanca-desaparecida-vuelve-a-la-actualidad-NG4769816'
];
const FUENTE_GACETA_CIENCIAS = [
  'La Gaceta de Salamanca: la historia oculta en el entorno de la Facultad de Ciencias (2020)',
  'https://www.lagacetadesalamanca.es/salamanca/la-historia-de-salamanca-oculta-en-el-entorno-de-la-facultad-de-ciencias-KJ5830972'
];
const FUENTE_ASEDIO_FUERTES = [
  'Wikipedia: Siege of the Salamanca forts',
  'https://en.wikipedia.org/wiki/Siege_of_the_Salamanca_forts'
];
const FUENTE_TRIBUNA_SAN_AGUSTIN = [
  'Tribuna de Salamanca: así era San Agustín (2023)',
  'https://www.tribunasalamanca.com/noticias/319618/asi-era-san-agustin-el-gran-monasterio-perdido-de-salamanca'
];

const DESAPARECIDOS = [
  {
    id: 'san-vicente',
    n: 'Monasterio de San Vicente',
    tipo: 'iglesia',
    la: 40.961905,
    lo: -5.673225,
    donde: 'En lo alto del cerro de San Vicente. Sus restos forman parte del Museo del Cerro de San Vicente.',
    levantado: ['antes de 1143', 2],
    perdido: ['1812', 4],
    textos: [
      [
        'hecho',
        'Los monjes de Cluny eligieron este cerro, la cuna de la ciudad, para su priorato antes de 1143.'
      ],
      [
        'hecho',
        'Con la ocupación francesa se convirtió en el primer fuerte de la ciudad, y de sus piedras salieron otras fortificaciones.'
      ],
      [
        'hecho',
        'En junio de 1812 aguantó diez días el asedio del ejército de Wellington. Las balas al rojo le prendieron fuego una y otra vez al tejado y a la torre, hasta que la guarnición se rindió el 27 de junio. Después, los aliados arrasaron los tres fuertes.'
      ],
      [
        'hecho',
        'A primeros de julio estalló en el cerro la pólvora que habían dejado los franceses: murieron una veintena de vecinos y algunos soldados, y se vinieron abajo muchas construcciones de alrededor.'
      ],
      ['hecho', 'El museo del cerro enseña un suelo de mosaico del siglo XVI que es original del monasterio.']
    ],
    fuentes: [FUENTE_GACETA_FANTASMA, FUENTE_GACETA_DESAPARECIDA, FUENTE_ASEDIO_FUERTES],
    revisado: '2026-10-21'
  },
  {
    id: 'san-cayetano',
    n: 'Convento de San Cayetano',
    tipo: 'iglesia',
    la: 40.96137,
    lo: -5.672413,
    aproximada: true,
    donde:
      'Al otro lado del arroyo de los Milagros, en la actual vaguada de la Palma, junto al cerro de San Vicente. Las fuentes dan la zona, no el sitio exacto.',
    levantado: ['1702–1709', 3],
    perdido: ['1812', 4],
    textos: [
      [
        'hecho',
        'Se construyó entre 1702 y 1709, cerca del cerro de San Vicente, al otro lado del arroyo de los Milagros.'
      ],
      [
        'hecho',
        'Los franceses lo convirtieron en uno de sus tres fuertes y lo desmontaron en parte para tener vista despejada y sacar piedra.'
      ],
      [
        'hecho',
        'El 27 de junio de 1812 la artillería aliada abrió brecha en sus muros, y fue el primero en sacar la bandera blanca. Después lo arrasaron.'
      ]
    ],
    fuentes: [FUENTE_GACETA_FANTASMA, FUENTE_GACETA_DESAPARECIDA, FUENTE_ASEDIO_FUERTES],
    revisado: '2026-10-21'
  },
  {
    id: 'la-merced',
    n: 'Convento de la Merced Calzada',
    tipo: 'iglesia',
    la: 40.960337,
    lo: -5.66978,
    donde:
      'En la actual plaza de la Merced. Parte de la Facultad de Ciencias está construida sobre su solar.',
    levantado: ['1412', 3],
    perdido: ['1812', 4],
    textos: [
      ['hecho', 'Lo fundaron los mercedarios calzados en 1412.'],
      ['hecho', 'Tenía un claustro parecido al de las Dueñas, que derribaron los franceses.'],
      [
        'hecho',
        'Fue el tercero de los fuertes franceses que el ejército de Wellington sitió en junio de 1812.'
      ],
      ['hecho', 'En su solar hubo después un cuartel, y en parte de él se levantó la Facultad de Ciencias.']
    ],
    fuentes: [FUENTE_GACETA_FANTASMA, FUENTE_GACETA_CIENCIAS, FUENTE_ASEDIO_FUERTES],
    revisado: '2026-10-21'
  },
  {
    id: 'san-agustin',
    n: 'Convento de San Agustín',
    tipo: 'iglesia',
    la: 40.961702,
    lo: -5.670059,
    donde:
      'Junto al actual Botánico. Una parte se ve en el Parque Arqueológico del Botánico; el resto estaría bajo la calle Balmes.',
    levantado: ['1377', 3],
    perdido: ['guerra de la Independencia', 4],
    textos: [
      ['hecho', 'En 1377 se cedieron a los agustinos los terrenos para levantarlo.'],
      [
        'hecho',
        'Sobrevivió a dos incendios, en 1589 y en 1744, pero no a la guerra: los franceses lo volaron.'
      ],
      ['divulgativo', 'Se comparaba con San Esteban.'],
      [
        'hecho',
        'Lo que se ve hoy en el Parque Arqueológico del Botánico es, según Turismo de Salamanca, más o menos la cuarta parte de lo que fue.'
      ]
    ],
    fuentes: [FUENTE_TRIBUNA_SAN_AGUSTIN, FUENTE_GACETA_CIENCIAS, FUENTE_GACETA_FANTASMA],
    revisado: '2026-10-21'
  },
  {
    id: 'colegio-cuenca',
    n: 'Colegio Mayor de Cuenca',
    tipo: 'universidad',
    la: 40.961702,
    lo: -5.670059,
    donde: 'En el actual Botánico, donde sus restos se ven en el Parque Arqueológico.',
    levantado: ['siglo XVI', 3],
    perdido: ['guerra de la Independencia', 4],
    textos: [
      ['hecho', 'Era uno de los colegios mayores de la Universidad, levantado en el siglo XVI.'],
      [
        'divulgativo',
        'Por los grabados y documentos que se conservan, se cree que se parecía al Colegio Fonseca.'
      ],
      [
        'hecho',
        'Los franceses lo derribaron para fortificar la ciudad durante la guerra de la Independencia.'
      ],
      [
        'hecho',
        'Sus restos aparecieron en el Botánico al excavar para una nueva biblioteca universitaria. Hoy se visitan en el Parque Arqueológico.'
      ]
    ],
    fuentes: [FUENTE_TRIBUNA_SAN_AGUSTIN, FUENTE_GACETA_FANTASMA, FUENTE_GACETA_DESAPARECIDA],
    revisado: '2026-10-21'
  },
  {
    id: 'colegio-oviedo',
    n: 'Colegio Mayor de Oviedo',
    tipo: 'universidad',
    la: 40.961702,
    lo: -5.670059,
    aproximada: true,
    donde:
      'Junto a la parroquia de San Bartolomé y al Colegio de Cuenca, cerca del actual Botánico. Las fuentes dan la zona, no el sitio exacto.',
    levantado: ['principios del siglo XVI', 3],
    perdido: ['1812', 4],
    textos: [
      [
        'hecho',
        'Lo fundó a principios del siglo XVI Diego de Muros, obispo de Oviedo, donde había estado la casa del conde de Alba.'
      ],
      ['hecho', 'Los franceses volaron su torre y las casas de alrededor; su capilla se perdió en 1812.'],
      ['hecho', 'Como desapareció casi sin dejar restos, hoy cuesta saber cómo era.']
    ],
    fuentes: [
      FUENTE_GACETA_CIENCIAS,
      FUENTE_GACETA_DESAPARECIDA,
      [
        'Anuario del Departamento de Historia y Teoría del Arte (UAM)',
        'https://revistas-new.uam.es/anuario/article/download/2525/2673/4724'
      ]
    ],
    revisado: '2026-10-21'
  },
  {
    id: 'san-adrian',
    n: 'Iglesia de San Adrián',
    tipo: 'iglesia',
    la: 40.962431,
    lo: -5.663847,
    donde: 'En el centro de la actual plaza de Colón, rodeada de palacios.',
    levantado: ['ya existía en 1497', 3],
    perdido: ['1856', 4],
    textos: [
      [
        'hecho',
        'En 1497 el príncipe Juan mandó empedrar las calles de alrededor, y junto a ella se levantaron palacios como los de Orellana, Abrantes o Maldonado.'
      ],
      [
        'hecho',
        'A su lado estaba el Colegio viejo de Oviedo, fundado en 1386 y conocido como «Pan y Carbón».'
      ],
      [
        'hecho',
        'La guerra de la Independencia dejó la zona en ruinas: los restos del colegio de los Clérigos Menores se derribaron en 1839, y la iglesia, en 1856.'
      ],
      [
        'hecho',
        'La explanada que quedó se llamó plaza de Menores, del Carbón o de la Leña, por lo que allí se vendía. Los jardines se hicieron en 1892, con planos de Pedro Vidal.'
      ]
    ],
    fuentes: [
      [
        'Ayuntamiento de Salamanca: La plaza de Colón, un jardín con historia',
        'https://aytosalamanca.es/documents/d/guest/la-plaza-de-colon-un-jardin-con-historia'
      ],
      FUENTE_GACETA_FANTASMA
    ],
    revisado: '2026-10-21'
  },
  {
    id: 'san-francisco',
    n: 'Convento de San Francisco el Real',
    tipo: 'iglesia',
    la: 40.965335,
    lo: -5.668157,
    donde:
      'Junto al Campo de San Francisco. Sus restos están en el convento de los Capuchinos y bajo la capilla de la Venerable Orden Tercera.',
    levantado: ['1231', 3],
    perdido: ['guerra de la Independencia', 4],
    textos: [
      ['hecho', 'Lo fundaron en 1231 discípulos de san Francisco de Asís.'],
      ['hecho', 'Desapareció durante la guerra de la Independencia.'],
      [
        'hecho',
        'Dentro de los Capuchinos quedan restos de su capilla mayor y de su ábside sur, con ventanas ojivales, y la capilla de la Venerable Orden Tercera se levantó sobre otro de sus ábsides.'
      ]
    ],
    fuentes: [
      [
        'Turismo de Castilla y León: Convento de los Capuchinos',
        'https://www.turismocastillayleon.com/es/patrimonio-cultura/convento-capuchinos'
      ],
      FUENTE_GACETA_DESAPARECIDA
    ],
    revisado: '2026-10-21'
  }
];
