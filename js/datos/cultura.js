// Cultura y tradiciones salmantinas: fiestas, tradiciones, gastronomía, artesanía, folklore y personajes.
// Solo hay categorías con contenido real y comprobado (no hay «patrimonio inmaterial»: ninguna de estas
// tradiciones tiene, que hayamos podido comprobar, esa declaración oficial).
//
// Cada elemento:
//   id          para el enlace #cultura/<id> (no cambiarlo)
//   n, cat      nombre y categoría (CATEGORIAS_CULTURA)
//   resumen     una frase que lo describe
//   municipios  nombres de PROVINCIA.m relacionados (en el mapa se marcan sus términos, sin puntos inventados)
//   pedanias    [[municipio, pedanía]] cuando el sitio es una pedanía
//   comarcas    nombres de PROVINCIA.com, si la relación es con toda la comarca
//   cuando      época del año, solo si está documentada (si no, se omite)
//   textos      [[tipo, texto]]: 'hecho' (documentado, con fuente), 'tradicion' (lo que cuenta la tradición
//               o una interpretación, que no está probado) o 'divulgativo' (descripción general)
//   relacionados { zonas, monumentos, cultura } (ids de la app)
//   foto        { src, pie, autor, licencia, url (página del archivo en Wikimedia Commons) }
//   fuentes     [[medio, url]]
//   revisado    fecha de la última revisión del contenido (AAAA-MM-DD)

const CATEGORIAS_CULTURA = [
  ['fiesta', 'Fiestas populares', '🎉'],
  ['tradicion', 'Tradiciones locales', '🔔'],
  ['gastronomia', 'Gastronomía tradicional', '🥖'],
  ['artesania', 'Artesanía y oficios', '💍'],
  ['folklore', 'Música y folklore', '🪘'],
  ['personaje', 'Personajes históricos', '🎖️']
];

const TIPOS_TEXTO_CULTURA = {
  hecho: 'Documentado',
  tradicion: 'Según la tradición',
  divulgativo: 'En pocas palabras'
};

const CULTURA = [
  {
    id: 'lunes-de-aguas',
    n: 'Lunes de Aguas',
    cat: 'fiesta',
    resumen: 'La merienda de primavera de los salmantinos, en el campo o a orillas del Tormes, con hornazo.',
    municipios: ['Salamanca', 'Alaraz'],
    cuando:
      'En Salamanca, el lunes siguiente al Lunes de Pascua; en otros pueblos de la provincia, el mismo Lunes de Pascua.',
    textos: [
      [
        'hecho',
        'Es una fiesta popular de Salamanca y de otros pueblos de la provincia. Hoy se celebra en familia o con amigos, con una merienda en el campo en la que no falta el hornazo.'
      ],
      ['hecho', 'En diciembre de 2020 se reconoció como Fiesta de Interés Turístico de Castilla y León.'],
      [
        'hecho',
        'En Alaraz es el día de la fiesta grande, con rituales propios: la búsqueda del Santo Cristo del Monte y el baño de los quintos en el río Gamo.'
      ],
      [
        'tradicion',
        'Según la tradición, recuerda la orden de Felipe II de sacar de la ciudad a las mujeres de la mancebía durante la Cuaresma y la Semana Santa: al acabar, volvían por el Tormes y los estudiantes las recibían con comida y bebida. Es una explicación muy repetida, pero sin documentos que la prueben.'
      ]
    ],
    relacionados: { cultura: ['hornazo'] },
    fuentes: [
      [
        'Turismo de Castilla y León',
        'https://www.turismocastillayleon.com/es/patrimonio-cultura/lunes-aguas'
      ],
      ['Wikipedia', 'https://es.wikipedia.org/wiki/Lunes_de_Aguas']
    ],
    revisado: '2026-10-10'
  },
  {
    id: 'carnaval-del-toro',
    n: 'Carnaval del Toro',
    cat: 'fiesta',
    resumen: 'Ciudad Rodrigo junta en su carnaval los encierros y las capeas con los disfraces.',
    municipios: ['Ciudad Rodrigo'],
    cuando:
      'En Carnaval. El encierro a caballo es el Domingo de Carnaval y el Toro del Aguardiente, el Martes de Carnaval a primera hora.',
    textos: [
      [
        'hecho',
        'Encierros por la mañana hasta la plaza de toros que se levanta en la Plaza Mayor, capeas y novilladas, con las peñas animando con sus bandas y sus trajes.'
      ],
      [
        'hecho',
        'En el archivo municipal hay un documento de 1418 sobre las talanqueras para correr toros, y otro de 1493, de tiempos de los Reyes Católicos, que critica lo mucho que se gastaba en las fiestas.'
      ],
      [
        'hecho',
        'Fue declarada Fiesta de Interés Turístico en 1965 y de Interés Turístico Nacional en 1980. En 2011 la Junta la declaró espectáculo taurino tradicional.'
      ],
      ['tradicion', 'Por esos documentos se suele decir que es el carnaval más antiguo de España.']
    ],
    foto: {
      src: 'img/cultura-carnaval-del-toro.jpg',
      pie: 'Capea en la Plaza Mayor de Ciudad Rodrigo, Carnaval del Toro de 2014',
      autor: 'rober____ (Flickr)',
      licencia: 'CC BY 2.0',
      url: 'https://commons.wikimedia.org/wiki/File:Carnaval_del_Toro_2014_-_Ciudad_Rodrigo_(12961535113)_(2).jpg'
    },
    fuentes: [
      [
        'Turismo de Castilla y León',
        'https://www.turismocastillayleon.com/es/patrimonio-cultura/fiestas-tradicionales-carnaval-toro'
      ],
      ['Wikipedia', 'https://es.wikipedia.org/wiki/Carnaval_del_Toro']
    ],
    revisado: '2026-10-10'
  },
  {
    id: 'semana-santa-salamanca',
    n: 'Semana Santa de Salamanca',
    cat: 'fiesta',
    resumen: 'Las procesiones de dieciocho cofradías, congregaciones y hermandades.',
    municipios: ['Salamanca'],
    cuando: 'En Semana Santa.',
    textos: [
      [
        'hecho',
        'Es Fiesta de Interés Turístico Internacional desde 2003 (Nacional desde 1998 y Regional desde 1995).'
      ],
      [
        'hecho',
        'La cofradía más antigua es la de la Vera Cruz, fundada en 1506. El Descendimiento y la procesión del Santo Entierro se hacen desde 1615.'
      ],
      [
        'tradicion',
        'Los orígenes de la Vera Cruz se suelen situar hacia 1240, antes de su fundación documentada.'
      ]
    ],
    foto: {
      src: 'img/cultura-semana-santa.jpg',
      pie: 'Cofrades en una procesión de Semana Santa en Salamanca',
      autor: 'لا روسا',
      licencia: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Procesiones_de_Semana_Santa,_Salamanca02.jpg'
    },
    fuentes: [
      ['Wikipedia', 'https://es.wikipedia.org/wiki/Semana_Santa_en_Salamanca'],
      [
        'Turismo de Castilla y León (Interés Turístico Internacional)',
        'https://www.turismocastillayleon.com/es/semanasanta/interes-turistico-internacional'
      ]
    ],
    revisado: '2026-10-10'
  },
  {
    id: 'hombres-de-musgo',
    n: 'Corpus Christi y hombres de musgo',
    cat: 'fiesta',
    resumen: 'En Béjar, unos hombres vestidos de musgo de pies a cabeza abren la procesión del Corpus.',
    municipios: ['Béjar'],
    cuando: 'El domingo siguiente al Corpus Christi.',
    textos: [
      [
        'hecho',
        'Los hombres de musgo llevan trajes hechos de musgo que llegan a pesar unos 12 kilos y acompañan a la procesión, que pasa sobre alfombras de flores.'
      ],
      ['hecho', 'Está clasificada como Fiesta de Interés Turístico Internacional.'],
      [
        'tradicion',
        'Según la leyenda, en el siglo XII los bejaranos cristianos se cubrieron de musgo para acercarse sin ser vistos a la fortaleza y reconquistar la villa. El origen real de la fiesta es incierto.'
      ]
    ],
    foto: {
      src: 'img/cultura-corpus-bejar.jpg',
      pie: 'Hombres de musgo en la procesión del Corpus Christi de Béjar',
      autor: 'Ytha67',
      licencia: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Hombres_de_musgo_Corpus_Christi_de_B%C3%A9jar.jpg'
    },
    fuentes: [
      [
        'Turismo de Castilla y León',
        'https://www.turismocastillayleon.com/es/patrimonio-cultura/corpus-christi-hombres-musgo-bejar'
      ]
    ],
    revisado: '2026-10-10'
  },
  {
    id: 'diagosto-y-la-loa',
    n: 'Diagosto y La Loa',
    cat: 'fiesta',
    resumen:
      'Las fiestas de agosto de La Alberca: la ofrenda a la Virgen con los trajes tradicionales y un auto sacramental hecho por los vecinos.',
    municipios: ['La Alberca'],
    cuando: '15 y 16 de agosto.',
    textos: [
      [
        'hecho',
        'El 15 de agosto (el Diagosto) se celebra el Ofertorio en honor de la Virgen de la Asunción, con el pueblo vestido con sus trajes tradicionales.'
      ],
      [
        'hecho',
        'El 16 los propios albercanos representan La Loa, un auto sacramental en el que el demonio, montado en un dragón, acaba vencido por el arcángel san Miguel.'
      ],
      ['hecho', 'Es Fiesta de Interés Turístico Nacional.'],
      [
        'divulgativo',
        'La Alberca fue el primer pueblo de España declarado Conjunto Histórico-Artístico, en 1940.'
      ]
    ],
    fuentes: [
      [
        'Turismo de Castilla y León',
        'https://www.turismocastillayleon.com/es/patrimonio-cultura/senora-asuncion-loa'
      ],
      ['Wikipedia', 'https://es.wikipedia.org/wiki/La_Alberca_(Salamanca)']
    ],
    revisado: '2026-10-10'
  },
  {
    id: 'santa-teresa-alba',
    n: 'Fiestas de Santa Teresa',
    cat: 'fiesta',
    resumen:
      'Alba de Tormes celebra a su patrona, Santa Teresa de Jesús, que está enterrada en el convento que ella fundó.',
    municipios: ['Alba de Tormes'],
    cuando: 'Del 15 al 22 de octubre.',
    textos: [
      [
        'hecho',
        'Santa Teresa murió en 1582 y está enterrada en el convento de clausura de Alba de Tormes, que ella fundó y que guarda reliquias suyas.'
      ],
      [
        'hecho',
        'El acto principal es la procesión de Santa Teresa, en la que se sacan algunas de sus reliquias. En 1801 el pueblo hizo voto de tenerla por patrona y celebrar su fiesta.'
      ],
      ['hecho', 'Es Fiesta de Interés Turístico de Castilla y León.']
    ],
    fuentes: [
      [
        'Turismo de Castilla y León',
        'https://www.turismocastillayleon.com/en/heritage-culture/local-festivity-santa-teresa'
      ]
    ],
    revisado: '2026-10-10'
  },
  {
    id: 'mariquelo',
    n: 'El Mariquelo',
    cat: 'tradicion',
    resumen: 'Cada 31 de octubre alguien sube a lo alto de la torre de la Catedral para dar gracias.',
    municipios: ['Salamanca'],
    cuando: '31 de octubre, víspera de Todos los Santos.',
    textos: [
      [
        'hecho',
        'Se hace desde 1755, en agradecimiento porque el terremoto de Lisboa de ese año apenas dañó la Catedral y no causó muertes, y para pedir que no se repita.'
      ],
      [
        'hecho',
        'Al principio subía un miembro de la familia de los Mariquelos. La costumbre se interrumpió entre 1977 y 1984; hoy la mantiene un nuevo Mariquelo.'
      ]
    ],
    relacionados: { zonas: ['univ'], monumentos: ['catedrales'] },
    fuentes: [['Wikipedia', 'https://es.wikipedia.org/wiki/Mariquelo']],
    revisado: '2026-10-10'
  },
  {
    id: 'marrano-de-san-anton',
    n: 'El marrano de San Antón',
    cat: 'tradicion',
    resumen: 'En La Alberca un cerdo bendecido vive suelto por las calles medio año y luego se rifa.',
    municipios: ['La Alberca'],
    cuando: 'Se suelta el 13 de junio (San Antonio de Padua) y se rifa el 17 de enero (San Antón).',
    textos: [
      [
        'hecho',
        'El cerdo se bendice el 13 de junio, se le pone una campanilla y anda suelto por el pueblo. El 17 de enero se rifa ante las puertas de la iglesia.'
      ],
      [
        'tradicion',
        'Se cuenta que antes los vecinos lo cebaban para darlo a la familia más pobre, y que la costumbre viene de principios del siglo XVI.'
      ]
    ],
    fuentes: [
      ['Wikipedia', 'https://es.wikipedia.org/wiki/La_Alberca_(Salamanca)'],
      [
        'Terra Nostrum',
        'https://www.terranostrum.es/calendario-castilla-y-leon/detalle/calendario-salamanca/el-marrano-de-san-anton'
      ]
    ],
    revisado: '2026-10-10'
  },
  {
    id: 'hornazo',
    n: 'Hornazo',
    cat: 'gastronomia',
    resumen: 'Empanada de masa de pan rellena de lomo, chorizo y jamón: la comida del Lunes de Aguas.',
    municipios: ['Salamanca'],
    cuando: 'Sobre todo en el Lunes de Aguas, aunque se come todo el año.',
    textos: [
      [
        'hecho',
        'Se rellena de lomo de cerdo adobado, chorizo y jamón o paleta, y a veces lleva huevo duro. Se come en toda la provincia.'
      ],
      ['hecho', 'Desde 2004 existe la Marca de Garantía Hornazo de Salamanca.'],
      [
        'tradicion',
        'El huevo duro se explica porque en Cuaresma no se comían huevos: se guardaban cocidos y se tomaban después de Pascua.'
      ]
    ],
    relacionados: { cultura: ['lunes-de-aguas'] },
    foto: {
      src: 'img/cultura-hornazo.jpg',
      pie: 'Raciones de hornazo de Salamanca',
      autor: 'Zarateman',
      licencia: 'CC0',
      url: 'https://commons.wikimedia.org/wiki/File:Hornazo_de_Salamanca.jpg'
    },
    fuentes: [
      ['Wikipedia', 'https://es.wikipedia.org/wiki/Hornazo'],
      [
        'Directo al Paladar, abr. 2022',
        'https://www.directoalpaladar.com/viajes/donde-comprar-mejores-hornazos-salamanca-empanada-embutido-que-reune-mejor-cerdo-mordisco'
      ]
    ],
    revisado: '2026-10-10'
  },
  {
    id: 'farinato',
    n: 'Farinato',
    cat: 'gastronomia',
    resumen: 'Embutido de miga de pan y manteca de cerdo, emblema de Ciudad Rodrigo.',
    municipios: ['Ciudad Rodrigo'],
    textos: [
      [
        'hecho',
        'Se hace con miga de pan, manteca de cerdo y especias como el pimentón, el ajo y el anís, y a menudo un poco de aguardiente. Se come frito, muchas veces con huevos.'
      ],
      ['hecho', 'Desde 2007 tiene la Marca de Garantía «Farinato de Ciudad Rodrigo».'],
      [
        'divulgativo',
        'A los de Ciudad Rodrigo (mirobrigenses) se les llama también, de forma coloquial, «farinatos».'
      ],
      ['tradicion', 'Antes se le llamaba «el chorizo de los pobres»; hoy está en la cocina de autor.']
    ],
    foto: {
      src: 'img/cultura-farinato.jpg',
      pie: 'Farinato a la venta en Ciudad Rodrigo',
      autor: 'Saraesteban9251',
      licencia: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Farinato_Ib%C3%A9rico_a_la_venta_en_Ciudad_Rodrigo.jpg'
    },
    fuentes: [
      ['Wikipedia', 'https://es.wikipedia.org/wiki/Farinato'],
      [
        'Directo al Paladar, mar. 2022',
        'https://www.directoalpaladar.com/cultura-gastronomica/resurgir-farinato-chorizo-pobres-a-bandera-gastronomica-ciudad-rodrigo-campo-charro'
      ]
    ],
    revisado: '2026-10-10'
  },
  {
    id: 'jamon-de-guijuelo',
    n: 'Jamón de Guijuelo',
    cat: 'gastronomia',
    resumen:
      'Jamón y paleta de cerdo ibérico curados en la sierra del sureste de la provincia, con Denominación de Origen Protegida.',
    municipios: ['Guijuelo'],
    comarcas: ['Comarca de Guijuelo'],
    textos: [
      [
        'hecho',
        'La DOP Guijuelo ampara jamones y paletas de cerdo ibérico o cruzado con duroc, con al menos un 75 % de raza ibérica.'
      ],
      [
        'hecho',
        'Se elaboran en 78 términos municipales del sureste de la provincia, a una altitud media de unos 1.000 metros. En el mapa se marca Guijuelo y su comarca tradicional, que no coincide del todo con esa zona.'
      ],
      ['hecho', 'En Guijuelo el sacrificio industrial de cerdos empezó en 1880.']
    ],
    foto: {
      src: 'img/cultura-jamon-guijuelo.jpg',
      pie: 'Jamón de Guijuelo',
      autor: 'Valdavia',
      licencia: 'CC BY-SA 3.0',
      url: 'https://commons.wikimedia.org/wiki/File:Jam%C3%B3n_de_Guijuelo_001.JPG'
    },
    fuentes: [
      [
        'Ministerio de Agricultura (pliego de condiciones de la DOP)',
        'https://www.mapa.gob.es/es/alimentacion/temas/calidad-diferenciada/pliego2017-02-13_tcm30-78960.pdf'
      ],
      ['Wikipedia', 'https://es.wikipedia.org/wiki/Jam%C3%B3n_de_Guijuelo']
    ],
    revisado: '2026-10-10'
  },
  {
    id: 'lenteja-de-la-armuna',
    n: 'Lenteja de La Armuña',
    cat: 'gastronomia',
    resumen:
      'Lenteja rubia de los campos de La Armuña, al norte de la capital, con Indicación Geográfica Protegida.',
    municipios: [
      'Aldealengua',
      'Aldeanueva de Figueroa',
      'Aldearrubia',
      'Almenara de Tormes',
      'Arcediano',
      'Cabezabellosa de la Calzada',
      'Cabrerizos',
      'Calzada de Valdunciel',
      'Castellanos de Moriscos',
      'Castellanos de Villiquera',
      'Espino de la Orbada',
      'Forfoleda',
      'Gomecello',
      'Monterrubio de Armuña',
      'Moriscos',
      'Negrilla de Palencia',
      'La Orbada',
      'Pajares de la Laguna',
      'Palencia de Negrilla',
      'Parada de Rubiales',
      'Pedrosillo el Ralo',
      'El Pedroso de la Armuña',
      'Pitiegua',
      'Salamanca',
      'San Cristóbal de la Cuesta',
      'Tardáguila',
      'Topas',
      'Torresmenudas',
      'Valdunciel',
      'Valverdón',
      'La Vellés',
      'Villamayor',
      'Villares de la Reina',
      'Villaverde de Guareña'
    ],
    textos: [
      [
        'hecho',
        'Es Indicación Geográfica Protegida desde 1996. La variedad es la Rubia de La Armuña, verde clara y a veces jaspeada.'
      ],
      [
        'hecho',
        'La zona de producción ocupa 756 km² en 34 municipios de La Armuña; de Salamanca solo cuenta la parte del término al norte del Tormes.'
      ]
    ],
    foto: {
      src: 'img/cultura-lenteja-armuna.jpg',
      pie: 'Saco de lentejas de La Armuña',
      autor: 'Valdavia',
      licencia: 'CC BY-SA 3.0',
      url: 'https://commons.wikimedia.org/wiki/File:Lenteja_de_La_Armu%C3%B1a_001_Provincia_de_Salamanca.JPG'
    },
    fuentes: [
      [
        'Ministerio de Agricultura (documento de la IGP)',
        'https://www.mapa.gob.es/es/alimentacion/temas/calidad-diferenciada/lenteja_de_la_armuna_2023_07_31_tcm30-210950.pdf'
      ],
      ['Wikipedia', 'https://es.wikipedia.org/wiki/Lenteja_de_La_Armu%C3%B1a']
    ],
    revisado: '2026-10-10'
  },
  {
    id: 'filigrana-charra',
    n: 'Filigrana charra y botón charro',
    cat: 'artesania',
    resumen: 'Joyería de hilos de plata entrelazados a mano; su pieza más conocida es el botón charro.',
    municipios: ['Salamanca', 'Tamames', 'Ciudad Rodrigo'],
    textos: [
      [
        'hecho',
        'El metal se funde, se estira en hilos finos que se entrelazan a mano y se aplanan, y las piezas se sueldan al fuego. El botón charro se construye pétalo a pétalo.'
      ],
      [
        'hecho',
        'Adorna el traje charro (pecheras, mangas, cinturones) de mujeres y hombres. En 2023 casi el único artesano que la seguía trabajando era Luis Méndez, de Tamames; talleres de Ciudad Rodrigo y Salamanca habían cerrado.'
      ],
      [
        'tradicion',
        'Su origen es incierto: hay quien lo ve como heredero de una fíbula romana y quien le busca raíces celtas o mudéjares. También se le ha tenido por amuleto.'
      ]
    ],
    fuentes: [
      [
        'La Gaceta de Salamanca, feb. 2023',
        'https://www.lagacetadesalamanca.es/salamanca/la-filigrana-charra-se-queda-sin-artistas-ED13327751'
      ],
      [
        'Monte de Piedad (CaixaBank), jun. 2026',
        'https://www.montedepiedad.caixabank.es/es/blog/p/la-joyeria-charra-de-salamanca--historia-simbolos-y-tradicion-viva.html'
      ]
    ],
    revisado: '2026-10-10'
  },
  {
    id: 'la-charrada',
    n: 'La Charrada',
    cat: 'folklore',
    resumen: 'Ciudad Rodrigo llena su Plaza Mayor de grupos de baile y música tradicional.',
    municipios: ['Ciudad Rodrigo'],
    cuando: 'Sábado Santo.',
    textos: [
      [
        'hecho',
        'Grupos folclóricos de la comarca, de otras partes de España y de Portugal bailan con sus trajes al son de la dulzaina por toda la ciudad, con la Plaza Mayor como escenario.'
      ],
      ['hecho', 'Es Fiesta de Interés Turístico de Castilla y León.']
    ],
    foto: {
      src: 'img/cultura-charrada.jpg',
      pie: 'Aldeano charro de los caseríos de Salamanca, grabado del siglo XVIII',
      autor: 'Juan de la Cruz Cano y Olmedilla',
      licencia: 'Dominio público',
      url: 'https://commons.wikimedia.org/wiki/File:Aldeano_charro_de_los_caser%C3%ADos_de_Salamanca,_Juan_de_la_Cruz.jpg'
    },
    relacionados: { cultura: ['filigrana-charra'] },
    fuentes: [
      ['Turismo de Castilla y León', 'https://www.turismocastillayleon.com/es/patrimonio-cultura/charrada']
    ],
    revisado: '2026-10-10'
  },
  {
    id: 'julian-sanchez-el-charro',
    n: 'Julián Sánchez «El Charro»',
    cat: 'personaje',
    resumen: 'Guerrillero y jefe de lanceros en la Guerra de la Independencia, nacido en el campo charro.',
    municipios: ['Ciudad Rodrigo', 'Arapiles', 'Tamames'],
    pedanias: [['La Fuente de San Esteban', 'Muñoz']],
    textos: [
      [
        'hecho',
        'Nació en Muñoz el 3 de junio de 1774 y murió en Etreros (Segovia) el 19 de octubre de 1832.'
      ],
      [
        'hecho',
        'En 1809 formó un escuadrón de lanceros que luego fueron los regimientos de Lanceros de Castilla. Durante el sitio de Ciudad Rodrigo salía a caballo contra los franceses, y en octubre de 1810 capturó al gobernador francés Renaud.'
      ],
      [
        'hecho',
        'Su brigada combatió con Wellington en los días antes de la batalla de Salamanca (los Arapiles, 1812) y después persiguió a los franceses hacia Burgos.'
      ],
      ['hecho', 'En 1811 sus lanceros asaltaron un convoy francés en el término de Tamames.']
    ],
    foto: {
      src: 'img/cultura-julian-sanchez.jpg',
      pie: 'Monumento a Julián Sánchez «El Charro» en Ciudad Rodrigo',
      autor: 'Alta Falisa',
      licencia: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Ciudad_Rodrigo,_Juli%C3%A1n_S%C3%A1nchez_%22El_Charro%22.jpg'
    },
    fuentes: [
      ['Wikipedia (en inglés)', 'https://en.wikipedia.org/wiki/Juli%C3%A1n_S%C3%A1nchez_Garc%C3%ADa'],
      ['Real Academia de la Historia (DB~e)', 'https://dbe.rah.es/biografias/6265/julian-sanchez-garcia'],
      ['Wikipedia (Tamames)', 'https://es.wikipedia.org/wiki/Tamames']
    ],
    revisado: '2026-10-10'
  }
];
