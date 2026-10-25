// Monumentos con mini infografía en el mapa.
// { id (no cambiar: se usa en los enlaces #monumento/id), n: nombre, tipo: pictograma (ver PICTOGRAMAS en js/monumentos.js),
//   la, lo: coordenadas (OpenStreetMap), zona: id de la zona del mapa, top: 1 si es imprescindible (se ve con el mapa de la ciudad),
//   epoca, estilo, datos: [[etiqueta, valor]], curiosidades: [texto], foto: clave de FOTOS o [ruta, pie con autor y
//   licencia] de Wikimedia Commons (opcional), fuente: [[nombre, url]] }
// El orden importa: si dos pictogramas se tapan, se dibuja el que va antes.
export const MONUMENTOS = [
  {
    id: 'plazamayor',
    n: 'Plaza Mayor',
    tipo: 'plaza',
    la: 40.96503,
    lo: -5.66406,
    zona: 'centro',
    top: 1,
    epoca: '1729–1756',
    estilo: 'Barroco',
    datos: [
      ['Arcos', '88'],
      ['Superficie', 'unos 6.400 m²'],
      ['Arquitectos', 'Alberto Churriguera y Andrés García de Quiñones']
    ],
    curiosidades: [
      'Los medallones de sus arcos retratan a reyes de España en el ala este, y a santos, sabios y descubridores en las demás.',
      'Las dos torres previstas sobre el Ayuntamiento nunca se hicieron; se conserva la maqueta de 1745.'
    ],
    foto: 'centro',
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Plaza_Mayor_de_Salamanca']]
  },
  {
    id: 'catedrales',
    n: 'Catedrales Nueva y Vieja',
    tipo: 'catedral',
    la: 40.9606,
    lo: -5.66636,
    zona: 'univ',
    top: 1,
    epoca: 'Vieja: desde el siglo XII · Nueva: 1513–1733',
    estilo: 'Románico y gótico (Vieja); gótico tardío, renacentista y barroco (Nueva)',
    datos: [
      ['Torre', '92 m'],
      ['Retablo de la Vieja', '53 tablas'],
      ['Torre del Gallo', 'hacia 1150']
    ],
    curiosidades: [
      'En la Puerta de Ramos hay un astronauta: lo labró el cantero Miguel Romero en la restauración de 1992.',
      'Están pegadas: el muro sur de la Nueva se apoya en el norte de la Vieja.',
      'Quien aspiraba a un grado pasaba la noche en la capilla de Santa Bárbara, en la Vieja; si suspendía, salía por la «puerta de los carros».'
    ],
    foto: ['img/mon-catedrales.jpg', 'Catedral Nueva. Foto: Zarateman · CC0 · Wikimedia Commons'],
    fuente: [
      ['Wikipedia: Catedral Nueva', 'https://es.wikipedia.org/wiki/Catedral_Nueva_de_Salamanca'],
      ['Wikipedia: Catedral Vieja', 'https://es.wikipedia.org/wiki/Catedral_Vieja_de_Salamanca']
    ]
  },
  {
    id: 'universidad',
    n: 'Universidad (Escuelas Mayores)',
    tipo: 'universidad',
    la: 40.96133,
    lo: -5.6672,
    zona: 'univ',
    top: 1,
    epoca: 'Fundada en 1218 · fachada de 1512–1533',
    estilo: 'Plateresco',
    datos: [
      ['Fundador', 'Alfonso IX de León'],
      ['Título de universidad', '1252, Alfonso X'],
      ['Es la más antigua', 'en funcionamiento de España']
    ],
    curiosidades: [
      'Busca la rana sobre una calavera de la fachada: la tradición dice que quien la encuentra sin ayuda tendrá suerte en los exámenes.',
      'Sus estatutos de 1254 crearon el cargo de bibliotecario: fue la primera universidad de Europa con biblioteca pública.'
    ],
    foto: 'univ',
    fuente: [
      ['Wikipedia', 'https://es.wikipedia.org/wiki/Universidad_de_Salamanca'],
      ['La Maleta Inquieta', 'https://lamaletainquieta.com/leyendas-salamanca/']
    ]
  },
  {
    id: 'clerecia',
    n: 'La Clerecía',
    tipo: 'iglesia',
    la: 40.96277,
    lo: -5.66627,
    zona: 'univ',
    top: 1,
    epoca: '1617–1779',
    estilo: 'Barroco',
    datos: [
      ['Planos', 'Juan Gómez de Mora'],
      ['Cúpula', 'más de 50 m'],
      ['Hoy', 'Universidad Pontificia (desde 1940)']
    ],
    curiosidades: [
      'Se puede subir a sus torres por la Scala Coeli y ver toda la ciudad desde arriba.',
      'Fue colegio de los jesuitas; tras su expulsión, en 1767, el claustro de los estudiantes irlandeses pasó a llamarse «La Irlanda».'
    ],
    foto: [
      'img/mon-clerecia.jpg',
      'Fachada de La Clerecía. Foto: PMRMaeyaert · CC BY-SA 3.0 · Wikimedia Commons'
    ],
    fuente: [
      [
        'Turismo de Salamanca',
        'https://salamanca-turismo-prod.gvam.es/en/see/monuments/iglesia-de-la-clerecia-y-universidad-pontificia'
      ]
    ]
  },
  {
    id: 'conchas',
    n: 'Casa de las Conchas',
    tipo: 'concha',
    la: 40.96296,
    lo: -5.66576,
    zona: 'univ',
    top: 1,
    epoca: '1493–1517',
    estilo: 'Gótico tardío y plateresco',
    datos: [
      ['Conchas', 'más de 300'],
      ['Promotor', 'Rodrigo Maldonado de Talavera'],
      ['Hoy', 'biblioteca pública (desde 1993)']
    ],
    curiosidades: [
      'Conserva una de sus dos torres, rebajada: según Wikipedia, por orden de Carlos I para castigar a los Maldonado, comuneros; según Terra Nostrum, en 1772, por sus grietas.'
    ],
    foto: [
      'img/mon-conchas.jpg',
      'Casa de las Conchas. Foto: Benjamín Núñez González · CC BY-SA 4.0 · Wikimedia Commons'
    ],
    fuente: [
      ['Wikipedia', 'https://es.wikipedia.org/wiki/Casa_de_las_Conchas'],
      ['Terra Nostrum', 'https://www.terranostrum.es/turismo/casa-de-las-conchas-salamanca']
    ]
  },
  {
    id: 'puenteromano',
    n: 'Puente Romano',
    tipo: 'puente',
    la: 40.95719,
    lo: -5.6706,
    zona: 'arrabal',
    top: 1,
    epoca: 'Siglo I',
    estilo: 'Romano',
    datos: [
      ['Arcos', '26 (15 romanos)'],
      ['Tramo romano', '201 m'],
      ['Calzada', 'Vía de la Plata']
    ],
    curiosidades: [
      'A su entrada está el verraco vetón, que sale en el escudo de la ciudad y en el Lazarillo de Tormes.',
      'La riada de San Policarpo, en 1626, derribó varios arcos. Soportó tráfico pesado hasta 1973.'
    ],
    foto: 'arrabal',
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Puente_romano_de_Salamanca']]
  },
  {
    id: 'glorieta',
    n: 'Plaza de toros La Glorieta',
    tipo: 'toros',
    la: 40.9773,
    lo: -5.66125,
    zona: 'glorieta',
    top: 1,
    epoca: '1892–1893',
    datos: [
      ['Inauguración', '11 de septiembre de 1893'],
      ['Aforo', '11.800'],
      ['La pagaron', '213 familias']
    ],
    curiosidades: [
      'Nació en las tertulias del Café Suizo y la financiaron 213 familias salmantinas: por eso la llamaron «la plaza de las 200 familias».',
      'Su feria principal es en septiembre, con la Virgen de la Vega y San Mateo.'
    ],
    foto: 'glorieta',
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Plaza_de_toros_de_La_Glorieta']]
  },
  {
    id: 'helmantico',
    n: 'Estadio Helmántico',
    tipo: 'estadio',
    la: 40.99591,
    lo: -5.66693,
    zona: 'villares',
    top: 1,
    epoca: '1970',
    datos: [
      ['Inauguración', '8 de abril de 1970'],
      ['Aforo', '17.341'],
      ['Selección española', '4 partidos']
    ],
    curiosidades: [
      'En las pistas de al lado, Javier Sotomayor batió en 1993 el récord mundial de salto de altura: 2,45 m.',
      'Está en Villares de la Reina, a unos 3 km de Salamanca. Lo construyó la UD Salamanca.'
    ],
    foto: ['img/mon-helmantico.jpg', 'Estadio Helmántico. Foto: Charro · CC BY-SA 4.0 · Wikimedia Commons'],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Estadio_Helmántico']]
  },
  {
    id: 'aldehuela',
    n: 'Parque y Ciudad Deportiva de La Aldehuela',
    tipo: 'estadio',
    la: 40.9594,
    lo: -5.6368,
    zona: 'prosperidad',
    top: 1,
    epoca: 'Inaugurado en 1988',
    datos: [
      ['Superficie', 'unas 40 hectáreas'],
      ['Proyecto', 'equipo de Alejandro de la Sota (concurso de 1985)'],
      ['Domingos', 'el Rastro, en su recinto ferial']
    ],
    curiosidades: [
      'Toma el nombre de una aldea junto al Tormes que fue feudo de Diego de Guzmán, procurador de Salamanca en la Santa Junta de Ávila durante la guerra de las Comunidades. A mediados del siglo XIX tenía cuatro habitantes.',
      'La finca Aldehuela de los Guzmanes era de Cabrerizos: un decreto de la Junta de 2001 la separó de ese municipio y la sumó al término de Salamanca.',
      'Es el mayor complejo deportivo de la ciudad: velódromo, pista cubierta de atletismo, campos de fútbol y de rugby, rocódromo y piscina.'
    ],
    fuente: [
      ['Ayuntamiento de Salamanca', 'https://www.salamanca.es/que-ver/naturaleza/parque-de-la-aldehuela'],
      ['BOE (29/11/2002)', 'https://www.boe.es/boe/dias/2002/11/29/pdfs/A41978-41978.pdf']
    ]
  },
  {
    id: 'sanesteban',
    n: 'Convento de San Esteban',
    tipo: 'iglesia',
    la: 40.96011,
    lo: -5.66259,
    zona: 'sanesteban',
    epoca: '1524–1610',
    estilo: 'Plateresco',
    datos: [
      ['Orden', 'Dominicos'],
      ['Fachada', 'Rodrigo Gil de Hontañón'],
      ['Retablo', 'José Benito de Churriguera, unos 16 × 24 m']
    ],
    curiosidades: [
      'Según la tradición, Colón expuso su proyecto a los frailes en el llamado claustro de Colón.',
      'Dorar el retablo costó más que hacerlo.'
    ],
    foto: 'sanesteban',
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Convento_de_San_Esteban_(Salamanca)']]
  },
  {
    id: 'duenas',
    n: 'Convento de las Dueñas',
    tipo: 'iglesia',
    la: 40.96112,
    lo: -5.66328,
    zona: 'sanesteban',
    epoca: 'Fundado en 1419 · claustro de 1533',
    estilo: 'Renacentista',
    datos: [
      ['Orden', 'Dominicas'],
      ['Fundadora', 'Juana Rodríguez de Monroy'],
      ['Claustro', 'pentagonal irregular']
    ],
    curiosidades: [
      'Los capiteles del claustro están llenos de monstruos y grutescos, de un escultor desconocido.',
      'Se llama «de las Dueñas» porque se pensó como beaterio para señoras nobles.'
    ],
    foto: ['img/mon-duenas.jpg', 'Convento de las Dueñas. Foto: Tamorlan · CC BY 3.0 · Wikimedia Commons'],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Convento_de_las_Dueñas_(Salamanca)']]
  },
  {
    id: 'casalis',
    n: 'Casa Lis',
    tipo: 'museo',
    la: 40.95951,
    lo: -5.66686,
    zona: 'univ',
    epoca: 'Terminada en 1905',
    estilo: 'Modernista',
    datos: [
      ['Arquitecto', 'Joaquín de Vargas'],
      ['Promotor', 'Miguel de Lis'],
      ['Hoy', 'Museo de Art Nouveau y Art Déco']
    ],
    curiosidades: [
      'Está levantada sobre la antigua muralla, y su fachada norte es la única muestra de modernismo de la ciudad.',
      'La flor de lis del patio homenajea al apellido de su dueño.'
    ],
    foto: [
      'img/mon-casalis.jpg',
      'Fachada de la Casa Lis. Foto: Jl FilpoC · CC BY-SA 4.0 · Wikimedia Commons'
    ],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Casa_Lis']]
  },
  {
    id: 'huerto',
    n: 'Huerto de Calixto y Melibea',
    tipo: 'jardin',
    la: 40.95948,
    lo: -5.66565,
    zona: 'univ',
    epoca: 'Abierto en 1981',
    datos: [
      ['Inauguración', '12 de junio de 1981'],
      ['Inspiración', 'La Celestina (1499)']
    ],
    curiosidades: ['Al inaugurarlo, Salamanca se hermanó con Coímbra, según recuerda una placa del jardín.'],
    foto: [
      'img/mon-huerto.jpg',
      'Huerto de Calixto y Melibea, con la Catedral al fondo. Foto: Ensalman · CC BY-SA 4.0 · Wikimedia Commons'
    ],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Huerto_de_Calixto_y_Melibea']]
  },
  {
    id: 'clavero',
    n: 'Torre del Clavero',
    tipo: 'torre',
    la: 40.96278,
    lo: -5.66329,
    zona: 'centro',
    epoca: 'Siglo XV',
    datos: [
      ['Altura', 'unos 28 m'],
      ['Planta', 'cuadrada abajo, octogonal arriba'],
      ['Garitas', '8']
    ],
    curiosidades: [
      'Su nombre vendría del clavero de la Orden de Alcántara, el que guardaba las llaves y los archivos.',
      'En septiembre de 1885 se hundió su piso alto, pero la torre aguantó.'
    ],
    foto: [
      'img/mon-clavero.jpg',
      'Torre del Clavero. Foto: Raúl Hernández González · CC BY 2.0 · Wikimedia Commons'
    ],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Torre_del_Clavero']]
  },
  {
    id: 'monterrey',
    n: 'Palacio de Monterrey',
    tipo: 'palacio',
    la: 40.96517,
    lo: -5.66684,
    zona: 'ursulas',
    epoca: 'Desde 1539',
    estilo: 'Plateresco',
    datos: [
      ['Promotor', 'III conde de Monterrey'],
      ['Se construyó', 'solo el ala sur del proyecto'],
      ['Visitas', 'desde 2018']
    ],
    curiosidades: [
      'Inspiró el estilo neoplateresco o «estilo Monterrey», copiado en edificios de Palencia, Sevilla y Valladolid.'
    ],
    foto: ['img/mon-monterrey.jpg', 'Palacio de Monterrey. Foto: Zarateman · CC0 · Wikimedia Commons'],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Palacio_de_Monterrey']]
  },
  {
    id: 'cueva',
    n: 'Cueva de Salamanca',
    tipo: 'cueva',
    la: 40.96006,
    lo: -5.66466,
    zona: 'sanesteban',
    epoca: 'Iglesia derribada a finales del siglo XVI',
    datos: [
      ['Qué es', 'la cripta de la iglesia de San Cebrián'],
      ['Visitable', 'desde 1993']
    ],
    curiosidades: [
      'Cervantes se burló de la leyenda del diablo maestro en su entremés «La cueva de Salamanca» (1615).',
      'Tras derribarse la iglesia fue trastero, panadería y carbonería.'
    ],
    foto: ['img/mon-cueva.jpg', 'Cueva de Salamanca. Foto: Superchilum · CC BY-SA 4.0 · Wikimedia Commons'],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Cueva_de_Salamanca']]
  },
  {
    id: 'fonseca',
    n: 'Colegio del Arzobispo Fonseca',
    tipo: 'universidad',
    la: 40.96526,
    lo: -5.67015,
    zona: 'sanvicente',
    epoca: 'Desde 1521',
    estilo: 'Plateresco',
    datos: [
      ['Fundador', 'Alonso de Fonseca III'],
      ['Claustro', 'unos 40 m por lado, 128 medallones'],
      ['Retablo', 'Alonso de Berruguete']
    ],
    curiosidades: [
      'Lo llaman Colegio de los Irlandeses porque acogió a clérigos irlandeses desde el siglo XIX hasta 1936.',
      'Durante la Guerra Civil fue la embajada de Alemania.'
    ],
    foto: 'sanvicente',
    fuente: [
      [
        'Turismo de Salamanca',
        'https://salamanca-turismo-prod.gvam.es/en/see/monuments/colegio-mayor-fonseca'
      ]
    ]
  },
  {
    id: 'sanmarcos',
    n: 'Iglesia de San Marcos',
    tipo: 'redonda',
    la: 40.96965,
    lo: -5.66384,
    zona: 'sanjuan',
    epoca: '1178',
    estilo: 'Románico',
    datos: [
      ['Planta', 'circular, de traza defensiva'],
      ['Pinturas', 'siglo XIV']
    ],
    curiosidades: ['Sus pinturas murales, con san Cristóbal y la Anunciación, no aparecieron hasta 1967.'],
    foto: [
      'img/mon-sanmarcos.jpg',
      'Iglesia de San Marcos. Foto: Zarateman · CC BY-SA 4.0 · Wikimedia Commons'
    ],
    fuente: [
      [
        'Turismo de Castilla y León',
        'https://www.turismocastillayleon.com/es/patrimonio-cultura/iglesias-ermitas/iglesia-san-marcos'
      ]
    ]
  },
  {
    id: 'mercado',
    n: 'Mercado Central',
    tipo: 'mercado',
    la: 40.96465,
    lo: -5.66307,
    zona: 'centro',
    epoca: '1899–1909',
    estilo: 'Arquitectura del hierro',
    datos: [
      ['Arquitecto', 'Joaquín de Vargas'],
      ['Planta', '40 × 44 m'],
      ['Inauguración', '15 de abril de 1909']
    ],
    curiosidades: [
      'Se tardó casi diez años en terminar: las fechas grabadas en columnas y puerta, 1905 y 1907, delatan los retrasos.'
    ],
    foto: ['img/mon-mercado.jpg', 'Mercado Central. Foto: Xemenendura · CC BY-SA 4.0 · Wikimedia Commons'],
    fuente: [['Urbipedia', 'https://www.urbipedia.org/hoja/Mercado_Central_de_Salamanca']]
  },
  {
    id: 'palacio-anaya',
    n: 'Palacio de Anaya',
    tipo: 'palacio',
    la: 40.96167,
    lo: -5.66515,
    zona: 'univ',
    epoca: 'Desde 1760',
    estilo: 'Neoclásico',
    datos: [
      ['Arquitectos', 'José de Hermosilla y Juan de Sagarvinaga'],
      ['Hoy', 'Facultad de Filología']
    ],
    curiosidades: [
      'Sustituyó al Colegio Mayor de San Bartolomé, que fundó Diego de Anaya en 1401 y que dañó el terremoto de Lisboa de 1755. Por eso lo llaman palacio, aunque fue un colegio.',
      'Es uno de los pocos edificios neoclásicos de Salamanca. Dentro guarda un busto de Unamuno de Victorio Macho, de 1930.'
    ],
    foto: ['img/mon-anaya.jpg', 'Palacio de Anaya. Foto: Zarateman · CC0 · Wikimedia Commons'],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Palacio_de_Anaya']]
  },
  {
    id: 'casa-muertes',
    n: 'Casa de las Muertes',
    tipo: 'palacio',
    la: 40.96574,
    lo: -5.66644,
    zona: 'ursulas',
    epoca: 'Hacia 1500',
    estilo: 'Plateresco',
    datos: [
      ['Encargo', 'Alonso de Fonseca'],
      ['Arquitecto', 'Juan de Álava'],
      ['Calle', 'Bordadores']
    ],
    curiosidades: [
      'Su nombre mezcla historia y leyenda: viene de las cuatro calaveras de piedra que sostienen las ventanas de arriba y de los crímenes que se contaron de ella en el siglo XIX.',
      'En el medallón del centro se lee «Severísimo Fonseca Patriarcha Alexandrino». Al lado está la casa en la que vivió Unamuno.'
    ],
    foto: ['img/mon-muertes.jpg', 'Casa de las Muertes. Foto: Zarateman · CC0 · Wikimedia Commons'],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Casa_de_las_Muertes']]
  },
  {
    id: 'palacio-salina',
    n: 'Palacio de la Salina',
    tipo: 'palacio',
    la: 40.96307,
    lo: -5.6643,
    zona: 'centro',
    epoca: '1538',
    estilo: 'Plateresco con elementos italianos',
    datos: [
      ['Encargo', 'Rodrigo de Messía'],
      ['Arquitecto', 'Rodrigo Gil de Hontañón'],
      ['Hoy', 'Diputación de Salamanca']
    ],
    curiosidades: [
      'Debe su nombre a que fue sede del estanco de la sal hasta 1870.',
      'La Diputación lo compró en 1881 y tiene aquí su sede desde 1884. Su patio, con arcos y ménsulas, es de lo mejor del edificio.'
    ],
    foto: ['img/mon-salina.jpg', 'Palacio de la Salina. Foto: Zarateman · CC0 · Wikimedia Commons'],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Palacio_de_la_Salina']]
  },
  {
    id: 'calatrava',
    n: 'Colegio de Calatrava',
    tipo: 'palacio',
    la: 40.95979,
    lo: -5.66094,
    zona: 'sanesteban',
    epoca: '1717',
    estilo: 'Barroco',
    datos: [
      ['Arquitecto', 'Joaquín Churriguera'],
      ['Reforma', 'Jovellanos, 1790']
    ],
    curiosidades: [
      'Perteneció a las órdenes militares. A finales del siglo XVIII le quitaron casi todo el adorno barroco de la fachada para ajustarla al gusto neoclásico.',
      'Su escalera principal se atribuye a Jerónimo García de Quiñones.'
    ],
    foto: ['img/mon-calatrava.jpg', 'Colegio de Calatrava. Foto: Zarateman · CC0 · Wikimedia Commons'],
    fuente: [
      [
        'Turismo de Castilla y León',
        'https://www.turismocastillayleon.com/es/patrimonio-cultura/edificios/colegio-calatrava-salamanca'
      ]
    ]
  },
  {
    id: 'puente-estevan',
    n: 'Puente de Enrique Estevan',
    tipo: 'puente',
    la: 40.95583,
    lo: -5.6663,
    zona: 'tenerias',
    epoca: 'Inaugurado en 1913',
    datos: [
      ['Arcos', '6, de unos 43 m'],
      ['Proyecto', 'Saturnino Zufiarre'],
      ['Constructora', 'Duro Felguera']
    ],
    curiosidades: [
      'Lleva el nombre de Enrique Estevan, el concejal que pidió un puente nuevo para no tener que tocar el Puente Romano.',
      'Bajo su primera piedra, puesta en 1902, se guardó un ejemplar de El Adelanto de ese día. Es Bien de Interés Cultural desde 2016.'
    ],
    foto: [
      'img/mon-estevan.jpg',
      'Puente de Enrique Estevan sobre el Tormes. Foto: Hovallef · CC BY-SA 4.0 · Wikimedia Commons'
    ],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Puente_de_Enrique_Estevan']]
  },
  {
    id: 'estacion-tren',
    n: 'Estación de tren',
    tipo: 'estacion',
    la: 40.97138,
    lo: -5.64863,
    zona: 'estacion',
    epoca: 'El tren llegó en 1877 · edificio de 2002',
    datos: [
      ['Arquitectos', 'Antonio Fernández Alba y Óscar Palazón'],
      ['Andenes', '3, con 5 vías para viajeros'],
      ['Dentro', 'el centro comercial Vialia']
    ],
    curiosidades: [
      'El tren llegó a Salamanca el 26 de agosto de 1877; Alfonso XII lo inauguró el 1 de septiembre. En 1886 se abrió la segunda línea, hacia Portugal por Fuentes de Oñoro.',
      'La estación de hoy, de 2002, sustituyó a otra de cristal inaugurada en 1973 y derribada en 1999.'
    ],
    foto: [
      'img/mon-estaciontren.jpg',
      'Estación de tren de Salamanca. Foto: Mentxuwiki · CC BY-SA 4.0 · Wikimedia Commons'
    ],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Estaci%C3%B3n_de_Salamanca']]
  },
  {
    id: 'estacion-autobuses',
    n: 'Estación de autobuses',
    tipo: 'autobus',
    la: 40.97,
    lo: -5.67555,
    zona: 'sanbernardo',
    epoca: 'Desde 1975',
    datos: [
      ['Dirección', 'Avenida de Filiberto Villalobos, 71'],
      ['Paraje', 'El Calvario']
    ],
    curiosidades: [
      'En diciembre de 1975 el Ministerio de Obras Públicas dio su explotación por 75 años al Sindicato Provincial de Transportes de Salamanca, en el paraje de El Calvario.',
      'Se construyó sobre el antiguo estadio de La Unión.'
    ],
    foto: [
      'img/mon-estacionbus.jpg',
      'Estación de autobuses, en San Bernardo. Foto: Hovallef · CC BY-SA 4.0 · Wikimedia Commons'
    ],
    fuente: [
      ['BOE, 15 de diciembre de 1975', 'https://boe.es/boe/dias/1975/12/15/pdfs/A26028-26030.pdf'],
      [
        'Universidad de Salamanca (INICO): cincuenta años de la estación',
        'https://sid-inico.usal.es/noticias/de-construirse-sobre-el-estadio-de-la-union-a-ser-objeto-de-una-importante-reforma-cincuenta-anos-de-la-estacion-de-autobuses-de-salamanca/'
      ]
    ]
  },
  {
    id: 'cines-van-dyck',
    n: 'Cines Van Dyck',
    tipo: 'cine',
    la: 40.97312,
    lo: -5.66263,
    zona: 'salesas',
    epoca: 'Desde comienzos de los años ochenta',
    datos: [
      ['Dirección', 'Paseo de Torres Villarroel, 40 y 45'],
      ['Programación', 'también en versión original']
    ],
    curiosidades: [
      'Nacieron a comienzos de los ochenta, cuando iban cerrando los grandes cines del centro: el España hacia 1985 y el Gran Vía entre 1986 y 1988.',
      'El más grande de aquellos, el Coliseum, abrió en 1933 con 1.500 butacas.'
    ],
    fuente: [
      [
        'Tribuna de Salamanca, 30/9/2026',
        'https://www.tribunasalamanca.com/noticias/460676/de-los-grandes-cines-del-centro-a-los-multicines-medio-siglo-de-peliculas-en-salamanca'
      ]
    ]
  },
  {
    id: 'el-tormes',
    n: 'Centro Comercial El Tormes',
    tipo: 'comercial',
    la: 40.95029,
    lo: -5.64934,
    zona: 'santamarta',
    epoca: 'Inaugurado en 2000',
    datos: [
      ['Superficie', 'unos 60.000 m²'],
      ['Tiendas', 'unas 70'],
      ['Municipio', 'Santa Marta de Tormes']
    ],
    curiosidades: [
      'Sus cines abrieron también en 2000. Los gestionó Van Dyck durante 26 años y, desde el 1 de octubre de 2026, Ocine; siguen abiertos.',
      'En 2019 lo compró el fondo estadounidense LaSalle por unos 65 millones de euros.'
    ],
    foto: [
      'img/mon-eltormes.jpg',
      'Centro Comercial El Tormes. Foto: Centro Comercial El Tormes · CC BY-SA 4.0 · Wikimedia Commons'
    ],
    fuente: [
      [
        'Brainsre.news, 24/6/2026',
        'https://brainsre.news/fondo-santander-adquisicion-centro-comercial-tormes/'
      ],
      [
        'Tribuna de Salamanca, 30/9/2026',
        'https://www.tribunasalamanca.com/noticias/460676/de-los-grandes-cines-del-centro-a-los-multicines-medio-siglo-de-peliculas-en-salamanca'
      ]
    ]
  },
  {
    id: 'cementerio',
    n: 'Cementerio de San Carlos Borromeo',
    tipo: 'cementerio',
    la: 40.97322,
    lo: -5.68498,
    zona: 'pizarrales',
    epoca: 'Desde 1832',
    datos: [
      ['Trazado', 'Tomás Francisco Cafranga'],
      ['Ampliaciones', 'José Secall (desde 1867) y José Yarnoz (años veinte)']
    ],
    curiosidades: [
      'Se abrió en 1832 en la antigua huerta de Villasandín; los primeros entierros fueron en mayo.',
      'Aquí están enterrados Miguel de Unamuno y Rafael Farina, entre otros salmantinos.',
      'Uno de sus panteones es el de Teresa de Zúñiga, «la Corneja», famosa por su pleito con el Ayuntamiento por la casa que le derribaron para abrir la Rúa Mayor.'
    ],
    foto: [
      'img/mon-cementerio.jpg',
      'Cementerio de San Carlos Borromeo. Foto: Daniel Di Palma · CC BY-SA 4.0 · Wikimedia Commons'
    ],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Cementerio_de_San_Carlos_Borromeo_(Salamanca)']]
  }
];
