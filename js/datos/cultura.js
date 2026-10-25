// Cultura y tradiciones salmantinas: fiestas, tradiciones, gastronomía, artesanía, folklore, personajes y literatura.
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
//   fechas      para la agenda, solo si «cuando» da días concretos: [[desde, hasta, nota]], con 'MM-DD' o
//               'P+N' / 'P-N' (días desde el Domingo de Resurrección, para las fiestas que cambian cada año);
//               hasta y nota son opcionales
//   textos      [[tipo, texto]]: 'hecho' (documentado, con fuente), 'tradicion' (lo que cuenta la tradición
//               o una interpretación, que no está probado) o 'divulgativo' (descripción general)
//   relacionados { zonas, monumentos, cultura } (ids de la app)
//   foto        { src, pie, autor, licencia, url (página del archivo en Wikimedia Commons) }
//   audio       grabación para escuchar en la ficha (opcional): { src (en audio/), titulo, detalle (dónde,
//               cuándo y quién), autor (archivo o intérpretes), licencia, url (página en Wikimedia Commons) }
//   fuentes     [[medio, url]]
//   revisado    fecha de la última revisión del contenido (AAAA-MM-DD)

export const CATEGORIAS_CULTURA = [
  ['fiesta', 'Fiestas populares', '🎉'],
  ['tradicion', 'Tradiciones locales', '🔔'],
  ['gastronomia', 'Gastronomía tradicional', '🥖'],
  ['artesania', 'Artesanía y oficios', '💍'],
  ['folklore', 'Música y folklore', '🪘'],
  ['personaje', 'Personajes históricos', '🎖️'],
  ['literatura', 'Literatura', '📖']
];

export const TIPOS_TEXTO_CULTURA = {
  hecho: 'Documentado',
  tradicion: 'Según la tradición',
  divulgativo: 'En pocas palabras'
};

export const CULTURA = [
  {
    id: 'lunes-de-aguas',
    n: 'Lunes de Aguas',
    cat: 'fiesta',
    resumen: 'La merienda de primavera de los salmantinos, en el campo o a orillas del Tormes, con hornazo.',
    municipios: ['Salamanca', 'Alaraz'],
    cuando:
      'En Salamanca, el lunes siguiente al Lunes de Pascua; en otros pueblos de la provincia, el mismo Lunes de Pascua.',
    fechas: [
      ['P+8', '', 'En Salamanca'],
      ['P+1', '', 'En Alaraz y otros pueblos']
    ],
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
    foto: {
      src: 'img/cultura-lunes-de-aguas.jpg',
      pie: 'A orillas del Tormes, con las Catedrales al fondo',
      autor: 'Pedro Soler Bueno',
      licencia: 'CC BY 3.0',
      url: 'https://commons.wikimedia.org/wiki/File:Ma%C3%B1ana_Oto%C3%B1al_A_Orillas_Del_Tormes_(86781393).jpeg'
    },
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
    fechas: [['P-49', 'P-47', 'Del encierro a caballo al Toro del Aguardiente']],
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
    fechas: [['P-7', 'P+0']],
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
    fechas: [['P+63']],
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
    fechas: [['08-15', '08-16']],
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
    audio: {
      src: 'audio/cultura-diagosto-y-la-loa.mp3',
      titulo: 'Recitados de la Loa de la Asunción',
      detalle: 'Un vecino mayor de La Alberca recita versos de La Loa; grabado en el pueblo en 1984',
      autor: 'Fundación Joaquín Díaz',
      licencia: 'CC BY-SA 3.0',
      url: 'https://commons.wikimedia.org/wiki/File:Fundaci%C3%B3n_Joaqu%C3%ADn_D%C3%ADaz_-_ATO_00434_12_-_Recitados_de_la_Loa_de_la_Asunci%C3%B3n.ogg'
    },
    foto: {
      src: 'img/cultura-la-alberca.jpg',
      pie: 'Plaza Mayor de La Alberca',
      autor: 'Luis Daniel Carbia Cabeza',
      licencia: 'CC BY 2.0',
      url: 'https://commons.wikimedia.org/wiki/File:La_Alberca_-_Plaza_Mayor.jpg'
    },
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
    fechas: [['10-15', '10-22']],
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
    foto: {
      src: 'img/cultura-santa-teresa.jpg',
      pie: 'Portada del convento de la Anunciación, en Alba de Tormes',
      autor: 'José Luis Filpo Cabana',
      licencia: 'CC BY 3.0',
      url: 'https://commons.wikimedia.org/wiki/File:Convento_de_la_Anunciaci%C3%B3n,_Alba_de_Tormes._Portada.jpg'
    },
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
    fechas: [['10-31']],
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
    foto: {
      src: 'img/mon-catedrales.jpg',
      pie: 'La Catedral Nueva, a cuya torre sube el Mariquelo',
      autor: 'Zarateman',
      licencia: 'CC0',
      url: 'https://commons.wikimedia.org/wiki/File:Salamanca_-_Catedral_Nueva,_exterior_01.jpg'
    },
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
    fechas: [
      ['06-13', '', 'Se suelta el marrano'],
      ['01-17', '', 'Se rifa']
    ],
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
    foto: {
      src: 'img/cultura-la-alberca.jpg',
      pie: 'Plaza Mayor de La Alberca, por cuyas calles anda suelto el marrano',
      autor: 'Luis Daniel Carbia Cabeza',
      licencia: 'CC BY 2.0',
      url: 'https://commons.wikimedia.org/wiki/File:La_Alberca_-_Plaza_Mayor.jpg'
    },
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
    foto: {
      src: 'img/cultura-filigrana.jpg',
      pie: 'Botón charro de plata',
      autor: 'Hari Seldon',
      licencia: 'Dominio público',
      url: 'https://commons.wikimedia.org/wiki/File:Boton_charro_de_plata.jpg'
    },
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
    fechas: [['P-1']],
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
    audio: {
      src: 'audio/cultura-la-charrada.mp3',
      titulo: 'Charrada «Vengo de moler, morena»',
      detalle:
        'La toca el folclorista mirobrigense José Ramón Cid; grabada en un certamen de instrumentos en Valladolid en 1984',
      autor: 'Fundación Joaquín Díaz',
      licencia: 'CC BY-SA 3.0',
      url: 'https://commons.wikimedia.org/wiki/File:Fundaci%C3%B3n_Joaqu%C3%ADn_D%C3%ADaz_-_ATO_00141_23_-_Charrada_%22vengo_de_moler,_morena%22.ogg'
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
  },
  // --- Música ---------------------------------------------------------------------------------------
  {
    id: 'gaita-y-tamboril',
    n: 'La gaita y el tamboril',
    cat: 'folklore',
    resumen:
      'La pareja de instrumentos del tamborilero charro: una flauta de tres agujeros en una mano y el tamboril en la otra.',
    municipios: ['Salamanca', 'Ciudad Rodrigo', 'La Alberca'],
    cuando: 'El Día del Tamborilero, dentro de las Ferias de septiembre de Salamanca.',
    textos: [
      [
        'hecho',
        'El mismo músico toca a la vez la flauta charra, de tres agujeros y con una sola mano, y el tamboril, que percute con la otra.'
      ],
      [
        'hecho',
        'El Día del Tamborilero es un pasacalles de folclore charro de las Ferias y Fiestas de Salamanca: sale de la Puerta de Zamora y acaba en la Plaza Mayor. Lo organizan la Peña Folklórica El Tamboril y el Ayuntamiento, y en 2026 fue su 37.ª edición.'
      ],
      [
        'hecho',
        'Ciudad Rodrigo tiene desde la Semana Santa de 2024 un Museo del Tamborilero, en el antiguo Seminario de San Cayetano, con los fondos del folclorista mirobrigense José Ramón Cid.'
      ],
      [
        'divulgativo',
        'El tamborilero ha sido la música de las fiestas, los bailes, las bodas y las procesiones de los pueblos de la provincia.'
      ]
    ],
    foto: {
      src: 'img/cultura-gaita-y-tamboril.jpg',
      pie: 'Un tamborilero en Salamanca',
      autor: 'Pedro Soler Bueno',
      licencia: 'CC BY 3.0',
      url: 'https://commons.wikimedia.org/wiki/File:El_Tamborilero_(89780703).jpeg'
    },
    audio: {
      src: 'audio/cultura-gaita-y-tamboril.mp3',
      titulo: 'Picao serrano de gaita y tamboril «Ay mujer, mujer» (La borracha)',
      detalle: 'Grabado en La Alberca en 1984; el tamborilero puede ser «El Guinda», de La Alberca',
      autor: 'Fundación Joaquín Díaz',
      licencia: 'CC BY-SA 3.0',
      url: 'https://commons.wikimedia.org/wiki/File:Fundaci%C3%B3n_Joaqu%C3%ADn_D%C3%ADaz_-_ATO_00434_19_-_Picao_serrano_de_gaita_y_tamboril_%22Ay_mujer_mujer%22_(La_borracha).ogg'
    },
    relacionados: {
      monumentos: ['plazamayor'],
      cultura: ['mariquelo', 'la-charrada', 'pandero-cuadrado-penaparda']
    },
    fuentes: [
      [
        'Festivales de España (Día del Tamborilero)',
        'https://www.festivalesdeespana.com/festival/dia-del-tamborilero-pasacalles-de-folclore-charro-salamanca'
      ],
      [
        'Los Pueblos Más Bonitos de España (Museo del Tamborilero)',
        'https://lospueblosmasbonitosdeespana.org/en/recursos/museo-del-tamborilero-ciudad-rodrigo'
      ]
    ],
    revisado: '2026-10-10'
  },
  {
    id: 'pandero-cuadrado-penaparda',
    n: 'El pandero cuadrado de Peñaparda',
    cat: 'folklore',
    resumen:
      'Un pandero de dos parches, cuadrado, que en Peñaparda tocaban las mujeres para cantar y bailar.',
    municipios: ['Peñaparda'],
    textos: [
      [
        'hecho',
        'Es un bastidor de madera, el «aru», con dos parches de cuero, uno a cada lado. Por dentro lleva unas cuerdas cruzadas que hacen de bordón, de las que cuelgan cascabeles. En Peñaparda tiene además el «rabeu», para meter el pulgar.'
      ],
      [
        'hecho',
        'Se toca apoyado en la rodilla izquierda, en posición de rombo, con una porra. Era un instrumento solo de mujeres, que lo juntaban con la gaita y el tamboril de los hombres en los seranos, las reuniones de la noche.'
      ],
      [
        'hecho',
        'El folclorista Manuel García Matos grabó en Peñaparda en 1955 los cantos de baile de las vecinas: el ajechao, el sorteado, el corrido y el brincao.'
      ],
      [
        'divulgativo',
        'Músicos como Eliseo Parra y la familia Mayalde aprendieron de las últimas mujeres que lo tocaban, como la tía Máxima o la tía Eugenia.'
      ]
    ],
    audio: {
      src: 'audio/cultura-pandero-cuadrado-penaparda.mp3',
      titulo: 'Ajechao y sorteado',
      detalle: 'Canta una vecina de Peñaparda; grabado allí por Manuel García Matos en 1955',
      autor: 'Fundación Joaquín Díaz',
      licencia: 'CC BY-SA 3.0',
      url: 'https://commons.wikimedia.org/wiki/File:Fundaci%C3%B3n_Joaqu%C3%ADn_D%C3%ADaz_-_ATO_00417_15_-_Ajechao_y_sorteado.ogg'
    },
    relacionados: { cultura: ['gaita-y-tamboril', 'mayalde'] },
    foto: {
      src: 'img/cultura-penaparda.jpg',
      pie: 'Calle del Rollo, en Peñaparda',
      autor: 'Rodelar',
      licencia: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Pe%C3%B1aparda,_calle_Rollo.jpg'
    },
    fuentes: [
      [
        'Universidad Autónoma de Madrid, pieza del mes (marzo de 2024)',
        'https://www.uam.es/uam/media/doc/1606952397244/pieza-del-mes.-marzo2024.pdf'
      ],
      [
        'El Salto, jun. 2025',
        'https://www.elsaltodiario.com/patrimonio-cultural/sonia-luchena-mujeres-penaparda-supieron-tejer-redes-apoyo-mutuo-condiciones-muy-duras'
      ],
      [
        'Fundación Joaquín Díaz en Wikimedia Commons (la grabación de 1955)',
        'https://commons.wikimedia.org/wiki/File:Fundaci%C3%B3n_Joaqu%C3%ADn_D%C3%ADaz_-_ATO_00417_15_-_Ajechao_y_sorteado.ogg'
      ]
    ],
    revisado: '2026-10-10'
  },
  {
    id: 'cancioneros-salmantinos',
    n: 'Los cancioneros salmantinos',
    cat: 'folklore',
    resumen:
      'Dos organistas de la Catedral recorrieron la provincia para apuntar sus canciones antes de que se perdieran.',
    municipios: ['Ciudad Rodrigo', 'Robliza de Cojos', 'Salamanca'],
    textos: [
      [
        'hecho',
        'Dámaso Ledesma, nacido en Ciudad Rodrigo en 1866 y organista de la Catedral de Salamanca desde 1896, recogió en cuatro meses más de 900 canciones de la provincia. Su Cancionero salmantino, premiado en 1905 por la Real Academia de San Fernando, lo publicó la Diputación en 1907 con 404 documentos.'
      ],
      [
        'hecho',
        'Aníbal Sánchez Fraile, nacido en Robliza de Cojos en 1903, le sucedió como organista de la Catedral en 1928 y publicó en 1943 el Nuevo cancionero salmantino.'
      ],
      [
        'divulgativo',
        'Gracias a ellos se conservan, con letra y música, charradas, canciones de ronda, de boda o de trabajo que hoy siguen tocando los grupos de folclore.'
      ]
    ],
    relacionados: { monumentos: ['catedrales'], cultura: ['gaita-y-tamboril', 'la-charrada'] },
    foto: {
      src: 'img/cultura-cancioneros-salmantinos.jpg',
      pie: 'Dámaso Ledesma, en El Adelanto del 14 de junio de 1928',
      autor: 'Anónimo',
      licencia: 'Dominio público',
      url: 'https://commons.wikimedia.org/wiki/File:1928-06-14,_El_Adelanto,_D%C3%A1maso_Ledesma_(cropped).jpg'
    },
    audio: {
      src: 'audio/cultura-cancioneros-salmantinos.mp3',
      titulo: 'Charrada de gaita y tamboril',
      detalle:
        'Del repertorio de cantos y bailes de boda de Salamanca; la toca el Centro de Cultura Tradicional de Salamanca en Peñaranda de Bracamonte, en 1984',
      autor: 'Fundación Joaquín Díaz',
      licencia: 'CC BY-SA 3.0',
      url: 'https://commons.wikimedia.org/wiki/File:Fundaci%C3%B3n_Joaqu%C3%ADn_D%C3%ADaz_-_ATO_00413_23_-_Charrada_de_gaita_y_tamboril.ogg'
    },
    fuentes: [
      ['Wikipedia (Dámaso Ledesma)', 'https://es.wikipedia.org/wiki/D%C3%A1maso_Ledesma'],
      ['Wikipedia (Aníbal Sánchez Fraile)', 'https://es.wikipedia.org/wiki/An%C3%ADbal_S%C3%A1nchez_Fraile']
    ],
    revisado: '2026-10-10'
  },
  {
    id: 'mayalde',
    n: 'Mayalde',
    cat: 'folklore',
    resumen:
      'Una familia salmantina que hace música tradicional con cucharas, sartenes, escobas y almireces.',
    municipios: ['Salamanca'],
    textos: [
      [
        'hecho',
        'Es un grupo familiar de Salamanca: Eusebio Martín Cifuentes, Pilar Pérez y sus hijos Arturo y Laura Martín. Llevan casi cuarenta años recuperando canciones y ritmos tradicionales castellanos.'
      ],
      [
        'hecho',
        'Convierten objetos de la casa en instrumentos: cucharas, cazuelas, escobas o almireces. Su primer disco, La herencia, es de 1986.'
      ]
    ],
    relacionados: { cultura: ['pandero-cuadrado-penaparda', 'cancioneros-salmantinos'] },
    foto: {
      src: 'img/cultura-mayalde.jpg',
      pie: 'Mayalde en concierto, en Husillos (Palencia), en 2025',
      autor: 'Montgomery',
      licencia: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Mayalde_01.jpg'
    },
    fuentes: [['World Music Central', 'https://worldmusiccentral.org/?p=108018']],
    revisado: '2026-10-10'
  },
  {
    id: 'juan-del-encina',
    n: 'Juan del Encina',
    cat: 'folklore',
    resumen:
      'Músico, poeta y autor de églogas del Renacimiento, formado en la Catedral y la Universidad de Salamanca.',
    municipios: ['Salamanca'],
    textos: [
      [
        'hecho',
        'Nació en 1468, no se sabe dónde: se ha propuesto Fermoselle, la ciudad de Salamanca y algún pueblo con «encina» en el nombre, como Encina de San Silvestre o La Encina.'
      ],
      [
        'hecho',
        'Entró de mozo de coro en la Catedral de Salamanca en 1484 y estudió Leyes en la Universidad, donde tuvo de maestro a Nebrija. Su Cancionero se imprimió en Salamanca en 1496, con ocho églogas para representar.'
      ],
      [
        'hecho',
        'Sirvió al duque de Alba desde 1492, cantó en la capilla del papa León X en Roma y acabó de prior de la Catedral de León, donde murió en 1529. En 1534 sus restos se trasladaron a la Catedral de Salamanca.'
      ]
    ],
    foto: {
      src: 'img/cultura-juan-del-encina.jpg',
      pie: 'Portada del Cancionero de todas las obras de Juan del Encina, edición de 1516',
      autor: 'Biblioteca Nacional de España',
      licencia: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Cancionero_de_todas_las_obras_de_Juan_del_Enzina_1516.jpg'
    },
    audio: {
      src: 'audio/cultura-juan-del-encina.mp3',
      titulo: 'Fata la parte',
      detalle: 'Canción de Juan del Encina, interpretada por el Collegium Vocale',
      autor: 'Collegium Vocale',
      licencia: 'CC BY 3.0',
      url: 'https://commons.wikimedia.org/wiki/File:Juan_del_Encina_--_Fata_la_parte.ogg'
    },
    relacionados: { monumentos: ['catedrales', 'universidad'], cultura: ['nebrija', 'francisco-salinas'] },
    fuentes: [['Wikipedia', 'https://es.wikipedia.org/wiki/Juan_del_Encina']],
    revisado: '2026-10-10'
  },
  {
    id: 'francisco-salinas',
    n: 'Francisco Salinas',
    cat: 'folklore',
    resumen:
      'El organista ciego que enseñó música en la Universidad y al que Fray Luis de León dedicó una oda.',
    municipios: ['Salamanca'],
    textos: [
      ['hecho', 'Nació en Burgos en 1513 y perdió la vista a los 11 años.'],
      [
        'hecho',
        'Ganó una cátedra en la Universidad de Salamanca y publicó aquí, en 1577, su tratado De musica libri septem. Ese mismo año Fray Luis de León le escribió la Oda a Salinas.'
      ],
      ['hecho', 'Murió en Salamanca el 13 de enero de 1590.']
    ],
    relacionados: { monumentos: ['universidad'], cultura: ['fray-luis-de-leon', 'juan-del-encina'] },
    foto: {
      src: 'img/cultura-francisco-salinas.jpg',
      pie: 'Monumento a Francisco Salinas, de Hipólito Pérez Calvo, en Salamanca',
      autor: 'Fonsicas',
      licencia: 'CC BY-SA 1.0',
      url: 'https://commons.wikimedia.org/wiki/File:Francisco_Salinas.jpg'
    },
    fuentes: [['Wikipedia', 'https://es.wikipedia.org/wiki/Francisco_de_Salinas']],
    revisado: '2026-10-10'
  },
  {
    id: 'tomas-breton',
    n: 'Tomás Bretón',
    cat: 'folklore',
    resumen: 'El salmantino que compuso La verbena de la Paloma.',
    municipios: ['Salamanca'],
    textos: [
      [
        'hecho',
        'Nació en Salamanca el 29 de diciembre de 1850 y empezó a estudiar música en la Escuela de Nobles y Bellas Artes de San Eloy, en su ciudad.'
      ],
      [
        'hecho',
        'Su obra más popular es el sainete lírico La verbena de la Paloma, estrenado el 17 de febrero de 1894. Compuso también óperas como Los amantes de Teruel (1889) y La Dolores (1895), y en 1914 un poema sinfónico titulado Salamanca.'
      ],
      [
        'hecho',
        'Dirigió el Conservatorio de Madrid de 1901 a 1921 y murió en Madrid el 2 de diciembre de 1923.'
      ],
      ['hecho', 'La pieza más famosa de La Dolores es la gran jota del final del primer acto.']
    ],
    foto: {
      src: 'img/cultura-tomas-breton.jpg',
      pie: 'Monumento a Tomás Bretón en Salamanca',
      autor: 'Javiermes',
      licencia: 'CC BY-SA 3.0',
      url: 'https://commons.wikimedia.org/wiki/File:Monumento_a_Tom%C3%A1s_Bret%C3%B3n_en_Salamanca.JPG'
    },
    audio: {
      src: 'audio/cultura-tomas-breton.mp3',
      titulo: 'Jota de La Dolores',
      detalle:
        'Cilindro de cera de hacia 1910 cantado por el barítono Emilio Cabello, restaurado por el Museo de Historia de la Telecomunicación de Valencia',
      autor: 'Barítono Cabello',
      licencia: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:2._Jota_de_la_Dolores_-_Restaurado.wav'
    },
    fuentes: [
      ['Wikipedia', 'https://es.wikipedia.org/wiki/Tom%C3%A1s_Bret%C3%B3n'],
      ['Wikipedia (La Dolores, en inglés)', 'https://en.wikipedia.org/wiki/La_Dolores']
    ],
    revisado: '2026-10-10'
  },
  {
    id: 'rafael-farina',
    n: 'Rafael Farina',
    cat: 'folklore',
    resumen: 'El cantaor nacido en Martinamor que empezó de niño en los bares del barrio chino de Salamanca.',
    municipios: ['Martinamor', 'Salamanca'],
    textos: [
      [
        'hecho',
        'Rafael Antonio Salazar Motos nació en Martinamor el 2 de junio de 1923. Con seis años ya cantaba en los bares del barrio chino de Salamanca; su hermano mayor, también cantaor, era Calderas de Salamanca.'
      ],
      [
        'hecho',
        'Entre sus canciones están Mi Salamanca y Vino amargo. Hizo cine, desde Café cantante (1951) hasta Canciones de nuestra vida (1975).'
      ],
      ['hecho', 'Murió en Madrid el 21 de noviembre de 1995.']
    ],
    foto: {
      src: 'img/cultura-rafael-farina.jpg',
      pie: 'Estatua de Rafael Farina en Salamanca',
      autor: 'Emilio J. Rodríguez Posada',
      licencia: 'CC BY-SA 2.0',
      url: 'https://commons.wikimedia.org/wiki/File:Rafael_Farina_(31746238602).jpg'
    },
    relacionados: { zonas: ['sanvicente'] },
    fuentes: [['Wikipedia', 'https://es.wikipedia.org/wiki/Rafael_Farina']],
    revisado: '2026-10-10'
  },
  // --- Personajes -----------------------------------------------------------------------------------
  {
    id: 'fray-luis-de-leon',
    n: 'Fray Luis de León',
    cat: 'personaje',
    resumen:
      'Poeta y catedrático de la Universidad, preso cinco años por la Inquisición; su estatua preside el Patio de Escuelas.',
    municipios: ['Salamanca'],
    textos: [
      [
        'hecho',
        'Nació en Belmonte (Cuenca) en 1527 o 1528. La Inquisición lo tuvo preso en Valladolid del 27 de marzo de 1572 al 7 de diciembre de 1576, y salió absuelto.'
      ],
      [
        'hecho',
        'En 1579 ganó la cátedra de Biblia de la Universidad de Salamanca, que tuvo hasta su muerte, en Madrigal de las Altas Torres, en agosto de 1591.'
      ],
      [
        'tradicion',
        'Se cuenta que al volver a clase tras la cárcel empezó con un «Decíamos ayer…». Es probablemente una invención posterior.'
      ],
      [
        'hecho',
        'Su estatua del Patio de Escuelas, de Nicasio Sevilla, se inauguró el 25 de abril de 1869. Sus restos están desde 1858 en la capilla de San Jerónimo de la Universidad.'
      ]
    ],
    foto: {
      src: 'img/cultura-fray-luis-de-leon.jpg',
      pie: 'Estatua de Fray Luis de León en el Patio de Escuelas',
      autor: 'Payanes8',
      licencia: 'CC BY-SA 3.0',
      url: 'https://commons.wikimedia.org/wiki/File:Estatua_de_Fray_Luis_de_Le%C3%B3n,_Universidad_de_Salamanca.jpg'
    },
    relacionados: { zonas: ['univ'], monumentos: ['universidad'], cultura: ['francisco-salinas'] },
    fuentes: [['Wikipedia', 'https://es.wikipedia.org/wiki/Luis_de_Le%C3%B3n']],
    revisado: '2026-10-10'
  },
  {
    id: 'nebrija',
    n: 'Antonio de Nebrija',
    cat: 'personaje',
    resumen: 'El humanista que enseñó en Salamanca y escribió la primera gramática del castellano.',
    municipios: ['Salamanca'],
    textos: [
      [
        'hecho',
        'Nació en Lebrija (Sevilla) en 1444. Pasó veintitrés años en Salamanca: cinco de estudiante y dieciocho de profesor, desde que en 1473 obtuvo la enseñanza de Gramática y Retórica.'
      ],
      [
        'hecho',
        'Su primer libro impreso, las Introductiones latinae, salió en Salamanca en 1481. Su Gramática castellana se publicó el 18 de agosto de 1492.'
      ],
      ['hecho', 'Murió en Alcalá de Henares el 2 de julio de 1522.']
    ],
    foto: {
      src: 'img/cultura-nebrija.jpg',
      pie: 'Monumento a Nebrija de Pablo Serrano (1981), en Salamanca',
      autor: 'Sanjo',
      licencia: 'CC BY-SA 3.0',
      url: 'https://commons.wikimedia.org/wiki/File:Salamanca._Monumento_a_Nebrija._Pablo_Serrano.JPG'
    },
    relacionados: { monumentos: ['universidad'], cultura: ['juan-del-encina'] },
    fuentes: [['Wikipedia', 'https://es.wikipedia.org/wiki/Antonio_de_Nebrija']],
    revisado: '2026-10-10'
  },
  {
    id: 'beatriz-galindo',
    n: 'Beatriz Galindo «La Latina»',
    cat: 'personaje',
    resumen:
      'Salmantina de la corte de Isabel la Católica, famosa por su latín, que dio nombre al barrio madrileño de La Latina.',
    municipios: ['Salamanca'],
    textos: [
      [
        'hecho',
        'Nació en Salamanca hacia 1465. El cronista Lucio Marineo Sículo escribió que la llamaban La Latina por lo bien que hablaba latín.'
      ],
      [
        'hecho',
        'Cumpliendo la voluntad de su marido fundó en Madrid un hospital, el de la Latina, que dio nombre al barrio. Murió en él el 23 de noviembre de 1535.'
      ],
      [
        'tradicion',
        'Se dice que enseñó latín a la reina y a sus hijas, y que estudió o enseñó en la Universidad de Salamanca; ninguna de las dos cosas tiene apoyo en documentos de la época.'
      ]
    ],
    foto: {
      src: 'img/cultura-beatriz-galindo.jpg',
      pie: 'Retrato de Beatriz Galindo',
      autor: 'Anónimo',
      licencia: 'Dominio público',
      url: 'https://commons.wikimedia.org/wiki/File:Beatriz_Galindo.jpg'
    },
    fuentes: [['Wikipedia', 'https://es.wikipedia.org/wiki/Beatriz_Galindo']],
    revisado: '2026-10-10'
  },
  {
    id: 'francisco-maldonado',
    n: 'Francisco Maldonado',
    cat: 'personaje',
    resumen: 'El capitán de los comuneros de Salamanca, decapitado en Villalar con Padilla y Bravo.',
    municipios: ['Salamanca'],
    textos: [
      [
        'hecho',
        'Nació en Salamanca hacia 1480 y fue uno de los cabecillas de la rebelión de las Comunidades de Castilla contra Carlos I, al frente de los comuneros salmantinos.'
      ],
      [
        'hecho',
        'Tras la derrota de Villalar, el 23 de abril de 1521, fue decapitado a la mañana siguiente en la plaza del pueblo, junto a Juan de Padilla y Juan Bravo.'
      ]
    ],
    foto: {
      src: 'img/cultura-francisco-maldonado.jpg',
      pie: 'Monumento al comunero Francisco Maldonado',
      autor: 'Mentxuwiki',
      licencia: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Monumento_al_Comunero_Francisco_Maldonado.jpg'
    },
    fuentes: [
      ['Biografías y Vidas', 'https://www.biografiasyvidas.com/biografia/m/maldonado.htm'],
      ['Wikipedia (batalla de Villalar, en inglés)', 'https://en.wikipedia.org/wiki/Battle_of_Villalar']
    ],
    revisado: '2026-10-10'
  },
  {
    id: 'torres-villarroel',
    n: 'Diego de Torres Villarroel',
    cat: 'personaje',
    resumen: 'Catedrático de Matemáticas, escritor de almanaques y «Gran Piscator de Salamanca».',
    municipios: ['Salamanca'],
    textos: [
      [
        'hecho',
        'Nació en Salamanca en 1694 y fue catedrático de prima de Matemáticas de la Universidad durante veinticuatro años, hasta que pidió la jubilación en 1750.'
      ],
      [
        'hecho',
        'De 1718 a 1766 publicó almanaques y pronósticos firmados como «el Gran Piscator de Salamanca». Contó su propia vida por entregas entre 1743 y 1751.'
      ],
      [
        'tradicion',
        'Su almanaque de 1724 anunciaba una muerte para «el rigor del verano», y se leyó como la del rey Luis I, que murió el 31 de agosto. La fama de adivino se la dieron después.'
      ],
      ['hecho', 'Murió el 19 de junio de 1770 en el Palacio de Monterrey.']
    ],
    foto: {
      src: 'img/cultura-torres-villarroel.jpg',
      pie: 'Retrato de Diego de Torres Villarroel, grabado',
      autor: 'Biblioteca Nacional de España',
      licencia: 'Dominio público',
      url: 'https://commons.wikimedia.org/wiki/File:Diego_de_Torres_Villarroel.jpg'
    },
    relacionados: { monumentos: ['monterrey', 'universidad'] },
    fuentes: [['Wikipedia', 'https://es.wikipedia.org/wiki/Diego_de_Torres_Villarroel']],
    revisado: '2026-10-10'
  },
  {
    id: 'gabriel-y-galan',
    n: 'José María Gabriel y Galán',
    cat: 'personaje',
    resumen: 'El poeta del campo charro, nacido en Frades de la Sierra.',
    municipios: ['Frades de la Sierra', 'Salamanca'],
    textos: [
      [
        'hecho',
        'Nació en Frades de la Sierra el 28 de junio de 1870 y con unos quince años se fue a Salamanca a estudiar Magisterio en la Escuela Normal.'
      ],
      [
        'hecho',
        'En 1901 su poema El ama, escrito tras la muerte de su madre, ganó la flor natural de los Juegos Florales del Teatro Bretón de Salamanca, con Unamuno de presidente del jurado.'
      ],
      [
        'hecho',
        'Publicó Castellanas y Extremeñas (1902) y Campesinas (1904). Murió en Guijo de Granadilla (Cáceres) el 6 de enero de 1905. Salamanca le dedica una plaza con su monumento y una biblioteca.'
      ]
    ],
    foto: {
      src: 'img/cultura-gabriel-y-galan.jpg',
      pie: 'Retrato de José María Gabriel y Galán, anterior a 1905',
      autor: 'Anónimo',
      licencia: 'Dominio público',
      url: 'https://commons.wikimedia.org/wiki/File:Jos%C3%A9-Mar%C3%ADa-Gabriel-y-Gal%C3%A1n.jpg'
    },
    relacionados: { cultura: ['unamuno', 'tomas-breton'] },
    fuentes: [['Wikipedia', 'https://es.wikipedia.org/wiki/Jos%C3%A9_Mar%C3%ADa_Gabriel_y_Gal%C3%A1n']],
    revisado: '2026-10-10'
  },
  {
    id: 'unamuno',
    n: 'Miguel de Unamuno',
    cat: 'personaje',
    resumen:
      'El escritor bilbaíno que fue catedrático y rector de la Universidad de Salamanca, donde vivió y murió.',
    municipios: ['Salamanca'],
    textos: [
      [
        'hecho',
        'Nació en Bilbao el 29 de septiembre de 1864. En 1891 ganó la cátedra de Griego de Salamanca y se instaló en la ciudad.'
      ],
      [
        'hecho',
        'Fue rector desde 1900; lo destituyeron en 1914 y volvió al cargo con la República en 1931. En 1924 Primo de Rivera lo desterró a Fuerteventura.'
      ],
      [
        'hecho',
        'El 12 de octubre de 1936, en el Paraninfo de la Universidad, se enfrentó en público al general Millán-Astray.'
      ],
      [
        'tradicion',
        'La frase «Venceréis, pero no convenceréis» se le atribuyó después; no está claro que la dijera así ese día. En una carta de diciembre de 1936 escribió «Vencerán, pero no convencerán».'
      ],
      [
        'hecho',
        'Murió en su casa de la calle Bordadores el 31 de diciembre de 1936. Su estatua, de 1968, está en esa calle, frente al convento de Santa Úrsula.'
      ]
    ],
    foto: {
      src: 'img/cultura-unamuno.jpg',
      pie: 'Estatua de Miguel de Unamuno en la calle Bordadores',
      autor: 'Pravdaverita',
      licencia: 'CC BY 3.0',
      url: 'https://commons.wikimedia.org/wiki/File:Estatua_Miguel_de_Unamuno_Salamanca.JPG'
    },
    relacionados: { monumentos: ['universidad'], cultura: ['gabriel-y-galan'] },
    fuentes: [
      ['Wikipedia', 'https://es.wikipedia.org/wiki/Miguel_de_Unamuno'],
      [
        'Wikimedia Commons (la estatua)',
        'https://commons.wikimedia.org/wiki/File:Estatua_Miguel_de_Unamuno_Salamanca.JPG'
      ]
    ],
    revisado: '2026-10-10'
  },
  {
    id: 'martin-gaite',
    n: 'Carmen Martín Gaite',
    cat: 'personaje',
    resumen:
      'La escritora nacida en la plaza de los Bandos que llevó la Salamanca de posguerra a Entre visillos.',
    municipios: ['Salamanca'],
    textos: [
      [
        'hecho',
        'Nació el 8 de diciembre de 1925 en el número 3 de la plaza de los Bandos y empezó Filosofía y Letras en la Universidad de Salamanca en 1943.'
      ],
      [
        'hecho',
        'Ganó el Premio Nadal en 1957 con Entre visillos, que refleja el ambiente del instituto de chicas de su ciudad. Fue la primera mujer con el Premio Nacional de Narrativa (1978, por El cuarto de atrás) y en 1988 recibió el Príncipe de Asturias de las Letras.'
      ],
      [
        'hecho',
        'Murió en Madrid el 23 de julio de 2000. Ese 8 de diciembre se inauguró su estatua en la plaza de los Bandos, obra de Narcisa Vicente.'
      ]
    ],
    foto: {
      src: 'img/cultura-martin-gaite.jpg',
      pie: 'Monumento a Carmen Martín Gaite en la plaza de los Bandos',
      autor: 'Zarateman',
      licencia: 'CC0',
      url: 'https://commons.wikimedia.org/wiki/File:Salamanca_-_Monumento_a_Carmen_Martin_Gaite_(plaza_de_los_Bandos).jpg'
    },
    fuentes: [
      ['Wikipedia', 'https://es.wikipedia.org/wiki/Carmen_Mart%C3%ADn_Gaite'],
      [
        'Wikimedia Commons (el monumento)',
        'https://commons.wikimedia.org/wiki/File:Salamanca_-_Monumento_a_Carmen_Martin_Gaite_(plaza_de_los_Bandos).jpg'
      ]
    ],
    revisado: '2026-10-10'
  },
  // --- Literatura -----------------------------------------------------------------------------------
  {
    id: 'la-celestina',
    n: 'La Celestina',
    cat: 'literatura',
    resumen:
      'La tragicomedia de Calisto y Melibea, de hacia 1500, firmada por un bachiller que estudió en Salamanca.',
    municipios: ['Salamanca'],
    textos: [
      [
        'hecho',
        'Se atribuye a Fernando de Rojas, que estudió en la Universidad de Salamanca. Los versos acrósticos del principio lo presentan como bachiller nacido en La Puebla de Montalbán, aunque hay dudas sobre si la escribió o solo la preparó para imprenta.'
      ],
      [
        'hecho',
        'Su edición más antigua conocida, la de Burgos, lleva la fecha de 1499, aunque se imprimió entre 1500 y 1502. Hacia 1502 se amplió a la Tragicomedia, en 21 actos.'
      ],
      [
        'tradicion',
        'Se ha propuesto que pasa en Salamanca, como también en Toledo o en Sevilla, pero la obra no lo aclara: se cree que imagina una ciudad tipo. En Salamanca, el Huerto de Calixto y Melibea recuerda el huerto donde se encuentran los amantes.'
      ]
    ],
    foto: {
      src: 'img/cultura-celestina.jpg',
      pie: 'Busto de la Celestina, de Agustín Casillas, en el Huerto de Calixto y Melibea',
      autor: 'Iniziar',
      licencia: 'CC BY-SA 3.0',
      url: 'https://commons.wikimedia.org/wiki/File:Salamanca_-_Busto_de_la_Celestina.JPG'
    },
    relacionados: { monumentos: ['huerto'], cultura: ['lazarillo-de-tormes'] },
    fuentes: [['Wikipedia', 'https://es.wikipedia.org/wiki/La_Celestina']],
    revisado: '2026-10-10'
  },
  {
    id: 'lazarillo-de-tormes',
    n: 'El Lazarillo de Tormes',
    cat: 'literatura',
    resumen: 'La novela anónima de 1554 cuyo protagonista «nació en un río de Salamanca, el Tormes».',
    municipios: ['Salamanca'],
    textos: [
      [
        'hecho',
        'Sus ediciones más antiguas conocidas son de 1554 y se imprimieron en Burgos, Amberes, Alcalá de Henares y Medina del Campo. Es anónima: se ha atribuido, entre otros, a los hermanos Valdés, sin que nada lo confirme.'
      ],
      ['hecho', 'Lázaro cuenta que, aunque sin honra, «nació en un río de Salamanca, el Tormes».'],
      [
        'tradicion',
        'Al comienzo, el ciego le hace darse un golpe contra un toro de piedra; el episodio se relaciona con el verraco de piedra que hay junto al Puente Romano.'
      ],
      ['hecho', 'La Inquisición la incluyó en su Índice de libros prohibidos.']
    ],
    foto: {
      src: 'img/cultura-lazarillo.jpg',
      pie: 'Monumento al Lazarillo, de Agustín Casillas, en Salamanca',
      autor: 'Iniziar',
      licencia: 'CC BY-SA 3.0',
      url: 'https://commons.wikimedia.org/wiki/File:Salamanca._Monumento_al_Lazarillo._Agust%C3%ADn_Casillas_01.JPG'
    },
    relacionados: { monumentos: ['puenteromano'], cultura: ['la-celestina'] },
    fuentes: [['Wikipedia', 'https://es.wikipedia.org/wiki/Lazarillo_de_Tormes']],
    revisado: '2026-10-10'
  }
];
