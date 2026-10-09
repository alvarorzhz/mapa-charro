// Salamanca en el tiempo: etapas de la historia de la ciudad, época en que aparece cada zona
// y la cerca nueva (muralla medieval).
// - ETAPAS: [año, nombre, texto, hitos, fuentes [[nombre, url]]].
// - EPOCA_ZONA: { idZona: [etapa en que aparece, por qué, fuente] }, solo con un dato fechado y con fuente:
//   la de su ficha (sin tercer elemento) o la que se indica. Las zonas que no están aquí aún no tienen fecha documentada.
// - MURALLA: la cerca nueva sigue «más o menos» los paseos de San Vicente, Carmelitas, Mirat, Canalejas y
//   Rector Esperabé (Wikipedia), que se abrieron en su lugar tras autorizarse el derribo en 1868 (Turismo
//   de Salamanca). El anillo une los puntos de esos paseos (OpenStreetMap): es un trazado aproximado.
//   Puertas: [nombre, lat, lon, aproximada]. Van donde las fuentes las sitúan (la calle que lleva su
//   nombre o el edificio que tenían enfrente), llevadas al anillo; la del Río, en la cabeza del Puente
//   Romano. Faltan la segunda de Santo Tomás y la de San Juan del Alcázar, que no se han podido situar.
//   Fuentes de las puertas: Wikipedia (lista), Salamanca paso a paso y Salamanca en el ayer (blogs de
//   historia local), La Gaceta de Salamanca y Salamancahoy.
const FUENTE_TURISMO_MURALLAS = [
  'Turismo de Salamanca: Centro de Interpretación de las Murallas',
  'https://salamanca-turismo.gvam.es/en/see/monuments/centro-de-interpretacion-de-las-murallas-de-salamanca'
];
const FUENTE_WIKI_MURALLAS = [
  'Wikipedia: Murallas de Salamanca',
  'https://es.wikipedia.org/wiki/Murallas_de_Salamanca'
];
const FUENTE_WIKI_SALAMANCA = ['Wikipedia: Salamanca (historia)', 'https://es.wikipedia.org/wiki/Salamanca'];
const FUENTE_AYER = [
  'Salamanca en el ayer: las puertas',
  'https://www.salamancaenelayer.com/2012/11/paseo-de-las-carmelitas.html'
];
const FUENTE_PASO = [
  'Salamanca paso a paso: las puertas de la muralla',
  'http://salamancapasoapaso.blogspot.com/2013/01/la-muralla-iii-las-puertas.html'
];
const ETAPAS = [
  [
    'Siglo IV a. C.',
    'El castro vetón',
    'Los vetones levantan un poblado fortificado en lo alto de la ciudad: primero en el cerro de San Vicente y luego en el teso de las Catedrales. En el 220 a. C. lo asedia y conquista Aníbal.',
    [
      'Su muralla medía unos 1,6 km, cerraba unas 17 hectáreas y tenía entre 3,5 y 7 m de ancho.',
      'Se conserva un tramo de 32 m en el Centro de Interpretación de las Murallas, frente a la Cueva de Salamanca.',
      'En el teso de San Miguel, en Villamayor, hubo otro castro prerromano.'
    ],
    [FUENTE_TURISMO_MURALLAS, FUENTE_WIKI_SALAMANCA]
  ],
  [
    'Siglo I',
    'Salmantica romana',
    'La ciudad romana se concentra en el teso de las Catedrales. El Puente Romano, desde el siglo I, lleva la Vía de la Plata sobre el Tormes.',
    ['Del puente quedan 15 de sus 26 arcos de época romana.', 'La Vía de la Plata era su gran camino.'],
    [FUENTE_WIKI_SALAMANCA]
  ],
  [
    'Siglos X–XIII',
    'Repoblación y murallas',
    'En 1102 Raimundo de Borgoña llega con pobladores de muchos orígenes. A comienzos del siglo XII se levanta la cerca vieja y, desde 1147, la cerca nueva, que abraza los arrabales: más de 110 hectáreas y trece puertas.',
    [
      'La cerca vieja seguía casi el trazado de la muralla prerromana y cerraba unas 24 hectáreas.',
      'La cerca nueva la mandó levantar Alfonso VII y se terminó en el siglo XIII.',
      'Muchos pueblos de alrededor aparecen por escrito en estos siglos: Aldeatejada en 1186, Santa Marta en 1201, Carbajosa en 1248.'
    ],
    [FUENTE_WIKI_SALAMANCA, FUENTE_TURISMO_MURALLAS, FUENTE_WIKI_MURALLAS]
  ],
  [
    '1218–siglo XVIII',
    'Universidad y Siglo de Oro',
    'En 1218 Alfonso IX funda la Universidad y la ciudad se llena de colegios, conventos y palacios dentro de la muralla. En el XVIII se levanta la Plaza Mayor.',
    [
      'La riada de San Policarpo, en 1626, arrasó la ribera y hundió cuatro arcos del Puente Romano.',
      'La Plaza Mayor se construyó entre 1729 y 1756.'
    ],
    [FUENTE_WIKI_SALAMANCA]
  ],
  [
    '1812–1899',
    'Guerra, muralla abajo y tren',
    'Durante la ocupación francesa se destruye buena parte de la ciudad, hasta la batalla de los Arapiles (1812). En 1868 se autoriza el derribo de la muralla y en su lugar se abren paseos. En 1877 llega el tren y, junto a la estación, crecen los primeros barrios fuera del casco.',
    [
      'Los paseos de San Vicente, Carmelitas, Mirat y Canalejas ocupan el sitio de la muralla.',
      'Las puertas fueron cayendo antes: la de Zamora en 1855, la de San Juan del Alcázar en 1865 y la de San Bernardo en 1867.',
      'Hoy quedan tramos junto al río, como en el Huerto de Calixto y Melibea o la Casa Lis.'
    ],
    [FUENTE_WIKI_SALAMANCA, FUENTE_TURISMO_MURALLAS, FUENTE_WIKI_MURALLAS, FUENTE_AYER, FUENTE_PASO]
  ],
  [
    '1900–1962',
    'Ensanche y barrios obreros',
    'Labradores es el primer ensanche, desde 1900. Alrededor crecen barrios de casas levantadas por sus vecinos, como Pizarrales o Chamberí, y después los grupos de viviendas sociales, como El Carmen o La Vega.',
    [
      'El Carmen entregó sus primeras casas en 1950.',
      'La Vega se inauguró en 1954 con 650 viviendas sociales.'
    ],
    []
  ],
  [
    '1963–hoy',
    'La ciudad de hoy',
    'En 1963 Salamanca incorpora el municipio de Tejares. Siguen naciendo barrios en las afueras y, desde los noventa, crecen sobre todo los pueblos de alrededor.',
    [
      'Buenos Aires nace en 1983 y El Zurguén en 1997.',
      'Carbajosa pasó de unos 1.700 vecinos en el año 2000 a casi 7.800.'
    ],
    [FUENTE_WIKI_SALAMANCA]
  ]
];
const EPOCA_ZONA = {
  sanvicente: [0, 'Cuna de la ciudad: castro vetón en su cerro'],
  univ: [0, 'Teso de las Catedrales, donde estuvo el castro y después la ciudad romana'],
  villamayor: [0, 'Castro prerromano en el teso de San Miguel'],
  arrabal: [1, 'Al otro lado del Puente Romano, del siglo I'],
  centro: [2, 'Dentro de la cerca nueva (desde 1147)'],
  sancti: [2, 'Parroquia desde 1190, dentro de la cerca nueva'],
  sanjuan: [2, 'Iglesia de San Juan de Barbalos, de 1150'],
  tenerias: [2, 'Iglesia de Santiago, de mediados del siglo XII'],
  ursulas: [2, 'Dentro de la cerca nueva (desde 1147)'],
  sancristobal: [2, 'Iglesia de San Cristóbal, de 1128'],
  sanesteban: [2, 'Dentro de la cerca nueva (desde 1147)'],
  santotomas: [2, 'Iglesia de Santo Tomás Cantuariense, de 1175'],
  fontana: [2, 'Monasterio de Santa María de la Vega, de hacia 1150'],
  tejares: [2, 'Pueblo citado en un documento de 1148'],
  castvilliquera: [2, 'Repoblado hacia el año 975'],
  aldeatejada: [2, 'Aparece por escrito en 1186'],
  santamarta: [2, 'Primera mención escrita, de 1201'],
  carbajosa: [2, 'Aparece por escrito en 1248'],
  cabrerizos: [2, 'En el siglo XIII se llamaba «Cabrarizos»'],
  castmoriscos: [2, 'Ya citado en el siglo XIII'],
  pelabravo: [2, 'Castillo de la Torre Mocha, de los siglos XII y XIII'],
  moriscos: [3, 'Su origen se remonta al siglo XIV'],
  villares: [3, 'Iglesia de San Silvestre, empezada en 1619'],
  doninos: [3, 'A comienzos del siglo XVII tenía menos de seis vecinos'],
  garridonorte: [4, 'Nace a finales del XIX con la llegada del tren'],
  estacion: [4, 'Nace junto a la estación, a finales del XIX'],
  alamedilla: [4, 'Primer parque moderno, inaugurado en 1884'],
  glorieta: [4, 'Plaza de toros de La Glorieta, de 1893'],
  labradores: [5, 'Primer ensanche de la ciudad, desde 1900'],
  delicias: [5, 'Colegio de las Esclavas, de 1905'],
  salesas: [5, 'Monasterio de las Salesas, de 1910'],
  prosperidad: [5, 'Nace a principios del siglo XX'],
  pizarrales: [5, 'Nace a principios del siglo XX'],
  chamberi: [5, 'Nace a principios del siglo XX, en el término de Tejares'],
  sanbernardo: [5, 'Primer bloque de viviendas, de los años cuarenta'],
  chinchibarra: [5, 'Crece alrededor del depósito de agua de 1945'],
  carmen: [5, 'Primeras casas entregadas en 1950'],
  vega: [5, 'Inaugurado en 1954'],
  garridosur: [5, 'Iglesia de la Virgen de Fátima, empezada en 1955'],
  vistahermosa: [6, 'Pasa a Salamanca con Tejares en 1963'],
  buenosaires: [6, 'Nace en 1983'],
  zurguen: [6, 'Nace en 1997'],
  vidal: [
    5,
    'Grupos de viviendas municipales desde los años cuarenta',
    [
      'La Gaceta de Salamanca',
      'https://www.lagacetadesalamanca.es/salamanca/san-jose-san-bernardo-viaje-origenes-vivienda-20250605181332-nt.html'
    ]
  ],
  blanco: [
    5,
    'En 2021 se le daba casi un siglo de historia',
    [
      'El Español-NoticiasCYL',
      'https://elespanol.com/castilla-y-leon/region/salamanca/20211112/barrio-blanco-pueblo-dentro-salamanca/626188394_0.html'
    ]
  ],
  alambres: [
    5,
    'Casas de construcción propia en la posguerra',
    [
      'El Español-NoticiasCYL',
      'https://www.elespanol.com/castilla-y-leon/region/salamanca/20220117/alambres-corrales-ganado-suburbio-marginal-busca-identidad/641435993_0.html'
    ]
  ],
  sanisidro: [
    5,
    'Surge a mediados del siglo XX',
    [
      'El Español-NoticiasCYL',
      'https://elespanol.com/castilla-y-leon/region/salamanca/20220422/san-isidro-antiguo-hospicio-rafael-barrio-obrero/666433740_0.html'
    ]
  ],
  puenteladrillo: [
    4,
    'Primeras casas a finales del siglo XIX',
    [
      'La Gaceta de Salamanca',
      'https://www.lagacetadesalamanca.es/salamanca/barrio-salmantino-creado-ferroviarios-vecinos-cavaron-kilometro-20240224204430-nt.html'
    ]
  ],
  hospitales: [
    6,
    'Nace con el hospital Virgen de la Vega, de 1965',
    [
      'Sanidad de Castilla y León: reseña histórica',
      'https://www.saludcastillayleon.es/CASalamanca/es/resena-historica'
    ]
  ],
  sanjose: [
    6,
    'Surge en los años setenta',
    [
      'SALAMANCArtv AL DÍA',
      'https://salamancartvaldia.es/noticia/2025-01-09-san-jose-el-barrio-obrero-que-mantiene-su-esencia-fotos-361237'
    ]
  ],
  capuchinos: [
    6,
    'Se urbaniza a partir de los años noventa',
    [
      'El Español-NoticiasCYL',
      'https://www.elespanol.com/castilla-y-leon/region/salamanca/20211119/barrio-capuchinos-salamanca-piedra-dorada-expansion-urbana/627687731_0.html'
    ]
  ],
  ciudadjardin: [
    5,
    'Sus primeras viviendas son de finales de los años cuarenta',
    [
      'SALAMANCArtv AL DÍA',
      'https://salamancartvaldia.es/noticia/2025-01-27-ciudad-jardin-el-barrio-que-surgio-de-una-utopia-fotos-362169'
    ]
  ],
  huertaotea: [
    6,
    'Barrio residencial de principios del siglo XXI',
    [
      'El Español-NoticiasCYL',
      'https://www.elespanol.com/castilla-y-leon/region/20180701/huerta-otea-mirador-botanico-rio-tormes/319218877_0.html'
    ]
  ],
  carrascal: [
    2,
    'Repoblado por los reyes de León en la Edad Media',
    ['Wikipedia: Carrascal de Barregas', 'https://es.wikipedia.org/wiki/Carrascal_de_Barregas']
  ]
};
const MURALLA = {
  anillo: [
    [40.96185, -5.67505],
    [40.96261, -5.67438],
    [40.96379, -5.67314],
    [40.96495, -5.67241],
    [40.9658, -5.67119],
    [40.966, -5.67047],
    [40.9664, -5.66984],
    [40.96689, -5.66922],
    [40.96787, -5.66793],
    [40.96867, -5.66699],
    [40.96966, -5.66524],
    [40.96987, -5.66462],
    [40.97002, -5.66362],
    [40.96958, -5.66141],
    [40.96913, -5.66013],
    [40.96878, -5.65956],
    [40.96828, -5.65844],
    [40.96763, -5.65827],
    [40.96708, -5.65796],
    [40.96608, -5.65776],
    [40.96317, -5.65854],
    [40.95972, -5.65971],
    [40.95814, -5.66099],
    [40.95873, -5.66376],
    [40.95892, -5.66444],
    [40.95908, -5.665],
    [40.95921, -5.66692],
    [40.9595, -5.66768],
    [40.95932, -5.6684],
    [40.95936, -5.66954],
    [40.95974, -5.6717],
    [40.96, -5.67237],
    [40.96042, -5.67301]
  ],
  puertas: [
    ['Puerta de Zamora', 40.97002, -5.66362, 0],
    ['Puerta de Toro', 40.96878, -5.65956, 0],
    ['Puerta de San Pablo', 40.95892, -5.66444, 0],
    ['Puerta del Río', 40.95936, -5.66954, 0],
    ['Puerta de Villamayor', 40.96787, -5.66793, 0],
    ['Puerta de San Bernardo', 40.96638, -5.66988, 0],
    ['Puerta Falsa', 40.96573, -5.67129, 0],
    ['Puerta de San Vicente', 40.96374, -5.67319, 0],
    ['Puerta de Santo Tomás', 40.96004, -5.6596, 0],
    ['Puerta de Sancti-Spíritus', 40.96479, -5.65811, 1],
    ['Puerta Nueva', 40.9593, -5.66005, 1]
  ],
  levantada: 2, // etapa en que se levanta
  derribada: 4 // etapa en que se derriba
};
