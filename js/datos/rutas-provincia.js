// Rutas por la provincia, en coche, saliendo de la capital y volviendo a ella.
// Cada ruta: id (va en los enlaces: #ruta-<id>; distinto de los de RUTAS), nombre, icono, tema,
//   duracion ('medio' | 'dia'), resumen, epoca (mejor época, opcional), fuente [medio, url] y paradas.
// Cada parada: id, n (nombre), municipio, la, lo (donde se deja el coche), ver (qué ver), min (minutos de
//   visita), consejo (opcional), fuente [medio, url], masFuentes (opcional: [[medio, url], ...], para datos
//   que salen de otras páginas) y foto [ruta en img/, pie con autor y licencia].
// El camino por carretera, los km y los tiempos están en tramos-provincia.js, que genera
//   node herramientas/rutas-provincia.js <id>   (hay que volver a generarlo si cambian las paradas).
const SALIDA_PROVINCIA = { n: 'Salamanca', la: 40.965, lo: -5.6639 };

const RUTAS_PROVINCIA = [
  {
    id: 'arribes-norte',
    nombre: 'Arribes del norte: la Cabeza de Framontanos, la Ramajería y el vino',
    icono: '🌄',
    tema: 'Pueblos y miradores',
    duracion: 'dia',
    resumen:
      'Un día por la Ramajería y la Ribera: la presa de Almendra, la más alta de España; el mercadillo portugués de Trabanca, los miradores de Villarino sobre el Duero, la Cabeza de Framontanos, la cascada del Pozo de los Humos, el vino de la DO Arribes en Corporario y los balcones sobre la presa de Aldeadávila.',
    epoca:
      'Mejor un primer domingo de mes (día del mercadillo de Trabanca) entre diciembre y mayo, cuando el Pozo de los Humos y la Olla de los Chorros llevan agua.',
    fuente: [
      'Turismo de Castilla y León',
      'https://www.turismocastillayleon.com/es/patrimonio-cultura/ruta-duero/villarino-aires'
    ],
    paradas: [
      {
        id: 'presa-almendra',
        n: 'Presa de Almendra',
        municipio: 'Almendra',
        la: 41.27127,
        lo: -6.32017,
        ver: 'Con 202 metros de altura, la presa de Almendra es la más alta de España: una bóveda de doble curvatura que cierra el cañón del Tormes, construida entre 1964 y 1970, con 567 metros de coronación y, contando los diques laterales, un muro de más de 3 km. Su embalse guarda 2.648 hm³ y la carretera SA-315/ZA-315 pasa por encima, justo en la raya entre Salamanca y Zamora. El agua no se aprovecha aquí: baja por un túnel de 15 km hasta la central de Villarino, en el Duero, con un salto de 410 metros.',
        min: 15,
        consejo:
          'Desde noviembre de 2024 está prohibido parar y aparcar en la coronación: Iberdrola valló los dos antiguos miradores y puso bolardos. Se puede cruzar en coche por la carretera, sin pararse, o a pie por la acera; el aparcamiento más cercano queda a unos 2 km. La Junta e Iberdrola anunciaron en 2025 un mirador nuevo con aparcamiento; en junio de 2026 los pueblos seguían pidiendo miradores, así que mira antes si ya está abierto.',
        fuente: ['Wikipedia', 'https://es.wikipedia.org/wiki/Presa_de_Almendra'],
        foto: [
          'img/ruta-presa-almendra.jpg',
          'Presa de Almendra. Foto: Hovallef · CC BY-SA 4.0 · Wikimedia Commons'
        ],
        masFuentes: [
          ['iagua (ficha de la presa)', 'https://www.iagua.es/data/infraestructuras/presas/almendra'],
          [
            'Escapada Rural (obras de 1964 a 1970)',
            'https://www.escapadarural.com/blog/amendra-la-presa-mas-impactante-que-hemos-visto-nunca/'
          ],
          [
            'Etheria Magazine (muro de 3.036 m)',
            'https://etheriamagazine.com/articulos/que-ver-ruta-vino-arribes/'
          ],
          [
            'Tribuna de Salamanca (23/2/2025)',
            'https://www.tribunasalamanca.com/noticias/395025/el-embalse-de-almendra-la-presa-mas-alta-de-espana-cerrada-al-turismo-55-anos-despues-de-su-construccion'
          ],
          [
            'Enfoque Diario de Zamora (27/11/2024)',
            'https://enfoquezamora.com/2024/11/27/parar-con-el-coche-en-la-presa-de-almendra-prohibido-tras-la-instalacion-de-unos-bolardos/'
          ],
          [
            'elDiario.es (11/4/2025)',
            'https://www.eldiario.es/castilla-y-leon/sociedad/protesta-miradores-presa-almendra-evidencian-abandono-rural-no-pide-caridad-exige-respeto_1_12205533.html'
          ],
          [
            'Iberdrola España (7/4/2025, mirador nuevo)',
            'https://www.iberdrolaespana.com/sala-comunicacion/noticias/consejeria-medio-ambiente-nuevo-mirador-presa-almendra'
          ],
          [
            'Enfoque Diario de Zamora (15/6/2026)',
            'https://enfoquezamora.com/2026/06/15/la-asociacion-vive-zamora-propone-dos-miradores-a-almendra-que-sustituyan-al-existente-en-la-coronacion-de-la-presa/'
          ]
        ]
      },
      {
        id: 'trabanca',
        n: 'Trabanca y su mercadillo portugués',
        municipio: 'Trabanca',
        la: 41.23231,
        lo: -6.38324,
        ver: 'El primer domingo de cada mes, de 11 a 15 h, Trabanca celebra el Mercadillo Portugués «La Cuenta», con más de un centenar de puestos venidos de España y Portugal y una media de 1.500 visitantes. Hay bacalao salado, queso y presunto portugués, embutidos, fruta, plantas, ropa, calzado, herramientas y bisutería. Lleva casi veinte años celebrándose y se mantiene también fuera del verano.',
        min: 60,
        consejo:
          'Solo hay mercadillo el primer domingo de mes; el resto de días la parada es el pueblo. Llega pronto: a mediodía se llena de coches y de gente.',
        fuente: [
          'TerraDuero (AECT Duero-Douro)',
          'https://terraduero.info/detalle.php?alias=Mercadillo-portugu%C3%A9s'
        ],
        foto: [
          'img/ruta-trabanca.jpg',
          'Mercadillo portugués de Trabanca. Foto: CGRM · CC BY-SA 3.0 · Wikimedia Commons'
        ],
        masFuentes: [
          [
            'SALAMANCArtv AL DÍA (1/9/2024)',
            'https://salamancartvaldia.es/noticia/2024-09-01-el-mercadillo-de-trabanca-dice-adios-al-verano-con-una-buena-afluencia-de-publico-y-puestos-353661'
          ],
          [
            'Espacio Fronteira (24/7/2023)',
            'https://www.espaciofronteira.eu/el-verano-activa-los-mercadillos-transfronterizos/'
          ],
          [
            'La Gaceta de Salamanca (6/3/2015)',
            'https://www.lagacetadesalamanca.es/hemeroteca/mercadillo-trabanca-regalo-vista-BWGS138944'
          ],
          [
            'Ruteando Rutas (consejo de llegar antes de las 12)',
            'https://ruteandorutas.com/que-ver-en-trabanca/'
          ],
          [
            'Mercadillos.org (ubicación: Ronda del Mercado)',
            'https://mercadillos.org/es/trabanca/mercadillo-trabanca'
          ]
        ]
      },
      {
        id: 'teso-san-cristobal',
        n: 'Teso de San Cristóbal (Balcón de Pilatos)',
        municipio: 'Villarino de los Aires',
        la: 41.27805,
        lo: -6.43903,
        ver: 'A 4 km del pueblo, el mirador del Balcón de Pilatos se asoma desde una falla de 300 metros. En el teso pudo haber un castro prerromano de la II Edad del Hierro, y junto a la ermita de San Cristóbal hay dos sepulturas medievales excavadas en el granito. Cerca está la Peña del Pendón, una roca tan bien apoyada que una sola persona puede balancearla.',
        min: 45,
        consejo: 'Es el merendero de Villarino: aquí se sube a comer el hornazo el lunes de Pascua.',
        fuente: [
          'Ayuntamiento de Villarino de los Aires',
          'https://www.villarinodelosaires.es/Galerias-F1.php?d=turismo/lugares-y-visitas/teso~san~cristobal/&o=AZ'
        ],
        masFuentes: [['Wikipedia', 'https://es.wikipedia.org/wiki/Villarino_de_los_Aires']]
      },
      {
        id: 'mirador-faya',
        n: 'Mirador de la Faya',
        municipio: 'Villarino de los Aires',
        la: 41.27193,
        lo: -6.47019,
        ver: 'Villarino es el primer pueblo salmantino que baña el Duero, y desde este balcón, en el mismo casco urbano, se ve el río, buena parte del Parque Natural y una gran extensión de Portugal. En Villarino funciona desde 1970 una de las mayores centrales hidroeléctricas de España, que recibe por un conducto subterráneo el agua del embalse de Almendra, a unos 15 km.',
        min: 20,
        consejo:
          'Muy cerca está el Mirador de la Rachita, en la zona periurbana, con una vista algo más cercana al Duero. En el pueblo, la iglesia parroquial de Santa María.',
        fuente: [
          'Ayuntamiento de Villarino de los Aires',
          'https://www.villarinodelosaires.es/Galerias-F1.php?d=turismo/lugares-y-visitas/mirador~de~la~faya/&o=AZ'
        ],
        masFuentes: [
          [
            'Turismo de Castilla y León',
            'https://www.turismocastillayleon.com/es/patrimonio-cultura/ruta-duero/villarino-aires'
          ],
          ['Wikipedia', 'https://es.wikipedia.org/wiki/Villarino_de_los_Aires'],
          [
            'Ayuntamiento de Villarino (Mirador de la Rachita)',
            'https://www.villarinodelosaires.es/Galerias-F1.php?d=turismo/lugares-y-visitas/mirador~de~la~rachita/&o=AZ'
          ]
        ]
      },
      {
        id: 'cabeza-framontanos',
        n: 'Cabeza de Framontanos',
        municipio: 'Villarino de los Aires',
        la: 41.21504,
        lo: -6.43774,
        ver: 'La Cabeza nació con las repoblaciones medievales del rey Fernando II de León: en el siglo XIII ya aparece como «Cabeça de Foramentano», de «foramontano», y fue municipio propio hasta que en 1975 se unió a Villarino de los Aires. Su iglesia de San Juan Bautista es el centro de las fiestas del patrón, el 24 de junio, con hoguera la víspera, misa y procesión por las calles. Desde la plaza sale un camino de unos 5 km hasta la Olla de los Chorros, la cascada del arroyo de la Cabeza de Iruelos en la raya con Pereña. Es un pueblo pequeño, de 62 vecinos en 2019, donde todavía se hace la matanza casera en invierno.',
        min: 60,
        consejo:
          'La ruta a la Olla de los Chorros (unos 5,5 km por sentido, 1 h 30 min de ida, 130 m de desnivel, dificultad media) merece la pena en invierno y primavera; en verano y a principios de otoño el arroyo suele ir seco. Si la haces, cuenta con unas 3 horas más.',
        fuente: ['Wikipedia', 'https://es.wikipedia.org/wiki/Cabeza_de_Framontanos'],
        foto: [
          'img/ruta-cabeza-framontanos.jpg',
          'Cabeza de Framontanos. Foto: CGRM · CC BY-SA 3.0 · Wikimedia Commons'
        ],
        masFuentes: [
          [
            'SALAMANCArtv AL DÍA (fiestas de San Juan, 21/6/2026)',
            'https://salamancartvaldia.es/noticia/2026-06-21-cabeza-de-framontanos-celebra-sus-torneos-de-padel-y-frontenis-con-35-grados-de-temperatura-392876'
          ],
          [
            'SALAMANCArtv AL DÍA (matanza, 2/1/2023)',
            'https://salamancartvaldia.es/noticia/2023-01-02-la-matanza-rito-de-sangre-y-fuego-en-cabeza-de-framontanos-312517'
          ],
          [
            'Web vecinal de Cabeza de Framontanos (ruta a la Olla de los Chorros)',
            'https://k-pam66.wixsite.com/cabezadeframontanos/oeste-salmantino'
          ],
          ['Wikipedia (Villarino de los Aires)', 'https://es.wikipedia.org/wiki/Villarino_de_los_Aires']
        ]
      },
      {
        id: 'pozo-humos',
        n: 'Pozo de los Humos',
        municipio: 'Masueco',
        la: 41.21704,
        lo: -6.57542,
        ver: 'El río de las Uces se despeña unos 50 metros en caída libre antes de juntarse con el Duero, justo en la raya entre Masueco y Pereña de la Ribera. Por el lado de Masueco una senda corta lleva a una pasarela sobre la misma coronación de la cascada, asomada al vacío; desde Pereña otra senda baja hasta el pozo que se forma abajo.',
        min: 60,
        consejo:
          'Va con agua de diciembre a mayo; en verano puede bajar casi seca. Calzado de monte y agua, y consulta en la Casa del Parque si hay restricciones de paso, que cambian a lo largo del año.',
        fuente: ['Wikipedia', 'https://es.wikipedia.org/wiki/Pozo_de_los_Humos'],
        foto: [
          'img/ruta-pozo-humos.jpg',
          'Pozo de los Humos. Foto: Tanja Freibott · CC BY-SA 4.0 · Wikimedia Commons'
        ],
        masFuentes: [['Senditur', 'https://www.senditur.com/es/ruta/pozo-de-los-humos/']]
      },
      {
        id: 'bodega-corporario',
        n: 'La Ribera y su vino: Bodega Arribes del Duero',
        municipio: 'Aldeadávila de la Ribera (Corporario)',
        la: 41.21501,
        lo: -6.60704,
        ver: 'La Ramajería es la penillanura que se cruza desde Trabanca hasta la Cabeza de Framontanos, y su nombre viene del ganado «ramajero», que comía el ramón de los rebollos; el vino está más abajo, en La Ribera, donde las viñas se agarran a bancales en las laderas del Duero, entre 5 y 10 °C más templadas que la meseta. Es la DO Arribes, reconocida en 2007 y con sede en Pereña, con uvas de la tierra como la juan garcía, la rufete o la bruñal, y malvasía en los blancos. Antes casi cada casa tenía su bodega subterránea donde se hacía el vino; en Corporario, la cooperativa Bodegas Arribes del Duero, que empujó a crear la denominación, reúne unos 130 socios de Corporario, Aldeadávila, Masueco, Pereña y Villarino y unas 103 hectáreas de viña.',
        min: 60,
        consejo:
          'Ofrece visita guiada, cata y venta, pero la ficha oficial no da horario: llama antes para concertarla (923 169 195 o 620 884 671).',
        fuente: [
          'Turismo de Castilla y León',
          'https://www.turismocastillayleon.com/es/enoturismo-gastronomia/bodegas-visitables/bodega-arribes-duero'
        ],
        foto: [
          'img/ruta-bodega-corporario.jpg',
          'Viñedos en las Arribes del Duero. Foto: Miguel Angel Ortiz Pérez · CC BY-SA 4.0 · Wikimedia Commons'
        ],
        masFuentes: [
          [
            'Bodegas Arribes del Duero (historia y bodegas subterráneas)',
            'https://bodegasarribesdelduero.com/entorno.html'
          ],
          [
            'Bodegas Arribes del Duero (viñedos y variedades)',
            'https://bodegasarribesdelduero.com/vinedos.html'
          ],
          [
            'SALAMANCArtv AL DÍA (13/11/2024)',
            'https://salamancartvaldia.es/noticia/2024-11-13-soc-coop-arribes-del-duero-y-bodegas-vina-romana-referentes-salmantinas-en-la-d-o-arribes-357945'
          ],
          ['Wikipedia (Arribes, vino)', 'https://es.wikipedia.org/wiki/Arribes_(vino)'],
          ['Wikipedia (La Ramajería)', 'https://es.wikipedia.org/wiki/La_Ramajer%C3%ADa']
        ]
      },
      {
        id: 'picon-felipe',
        n: 'Mirador del Picón de Felipe',
        municipio: 'Aldeadávila de la Ribera',
        la: 41.21065,
        lo: -6.6766,
        ver: 'Desde el aparcamiento sale un sendero de unos 2 km ida y vuelta (unos 40 minutos y 100 m de desnivel) que termina en una roca volada sobre el cañón, con la presa de Aldeadávila al fondo. La presa, de 139,5 m de altura, se levantó entre 1956 y 1963 y es una de las más altas de España.',
        min: 60,
        consejo:
          'El último tramo es escarpado y con escalones de piedra: no apto con vértigo ni con el suelo mojado. Sigue las marcas blancas y verdes y lleva agua, que no hay fuentes.',
        fuente: [
          'Senditur',
          'https://www.senditur.com/es/ruta/mirador-del-picon-de-felipe-y-mirador-del-fraile/'
        ],
        foto: [
          'img/ruta-picon-felipe.jpg',
          'Mirador del Picón de Felipe. Foto: Antonio Esteban · CC BY-SA 4.0 · Wikimedia Commons'
        ],
        masFuentes: [['Wikipedia', 'https://es.wikipedia.org/wiki/Presa_de_Aldeadávila']]
      },
      {
        id: 'mirador-fraile',
        n: 'Mirador del Fraile',
        municipio: 'Aldeadávila de la Ribera',
        la: 41.21226,
        lo: -6.67987,
        ver: 'Se llega en coche y se asoma casi encima de la presa de Aldeadávila, la gran obra de los saltos del Duero, inaugurada oficialmente en 1964. Entre sus dos centrales suman casi 1.139 MW, y su cañón salió en las escenas de Doctor Zhivago (1965).',
        min: 20,
        consejo:
          'Deja el coche en el ensanche de la curva de la carretera a la presa; el mirador está un poco más abajo, al llegar a la barrera que corta el paso.',
        fuente: [
          'Senditur',
          'https://www.senditur.com/es/ruta/mirador-del-picon-de-felipe-y-mirador-del-fraile/'
        ],
        foto: [
          'img/ruta-mirador-fraile.jpg',
          'Mirador del Fraile. Foto: AnaisGoepner · CC BY-SA 4.0 · Wikimedia Commons'
        ],
        masFuentes: [['Wikipedia', 'https://es.wikipedia.org/wiki/Presa_de_Aldeadávila']]
      }
    ]
  },
  {
    id: 'arribes-sur',
    nombre: 'Arribes del sur: de la Code al muelle de Vega Terrón',
    icono: '⛴️',
    tema: 'Miradores y pueblos de la raya',
    duracion: 'dia',
    resumen:
      'Bajando por la raya con Portugal: el Balcón de la Code en Mieza, el castillo de Vilvestre, el Picón del Moro sobre el Salto de Saucelle, la ermita románica de Hinojosa y el único muelle fluvial de Castilla y León, donde el Águeda entrega sus aguas al Duero.',
    fuente: [
      'Turismo de Castilla y León',
      'https://www.turismocastillayleon.com/es/patrimonio-cultura/ruta-duero/fregeneda'
    ],
    paradas: [
      {
        id: 'mirador-code',
        n: 'Mirador de la Code',
        municipio: 'Mieza',
        la: 41.17254,
        lo: -6.69792,
        ver: 'El Balcón de la Code se asoma desde un farallón de granito cortado a pico sobre el cañón del Duero, con Portugal enfrente. Es uno de los cinco miradores de Mieza (con Peña del Agua, Peña de la Salve, el Colagón del Tío Paco y el del Cura).',
        min: 30,
        fuente: [
          'Turismo de Castilla y León',
          'https://www.turismocastillayleon.com/es/patrimonio-cultura/ruta-duero/mieza'
        ],
        foto: [
          'img/ruta-mirador-code.jpg',
          'Mirador de la Code. Foto: Luistxo · CC BY-SA 2.0 · Wikimedia Commons'
        ],
        masFuentes: [['Wikipedia', 'https://es.wikipedia.org/wiki/Mieza_(Salamanca)']]
      },
      {
        id: 'vilvestre-castillo',
        n: 'Miradores del Castillo',
        municipio: 'Vilvestre',
        la: 41.10324,
        lo: -6.73006,
        ver: 'En lo alto del cerro, junto a la ermita de Nuestra Señora del Castillo, quedan restos del castillo que se fortificó entre finales del siglo XII y principios del XIII y que un ataque portugués arruinó en el XVII. Hay dos miradores con barandilla y panel informativo que dominan el pueblo y el Duero, con Portugal en la otra orilla.',
        min: 30,
        consejo:
          'Si quieres otro mirador sin subir andando, el del Reventón de La Barca está en el km 1,5 de la carretera VLV-424 y es accesible en coche y en silla de ruedas.',
        fuente: ['Wikipedia', 'https://es.wikipedia.org/wiki/Vilvestre'],
        foto: [
          'img/ruta-vilvestre-castillo.jpg',
          'Miradores del Castillo. Foto: usuario de Flickr 63684091@N00 · CC BY-SA 2.0 · Wikimedia Commons'
        ],
        masFuentes: [
          [
            'Turismo de Castilla y León',
            'https://www.turismocastillayleon.com/es/patrimonio-cultura/ruta-duero/vilvestre'
          ]
        ]
      },
      {
        id: 'picon-moro',
        n: 'Mirador del Picón del Moro',
        municipio: 'Saucelle',
        la: 41.04419,
        lo: -6.79391,
        ver: 'Un mirador metálico volado sobre una roca en el valle del Duero, con el río y la orilla portuguesa a los pies. Se baja por la carretera del puerto hacia el Salto de Saucelle, cuya presa se construyó entre 1950 y 1956.',
        min: 40,
        consejo:
          'Bajando de Saucelle hacia el Salto, gira a la derecha en el camino vallado con paso canadiense, aparca junto al merendero de La Dehesa y sigue un corto paseo a pie hasta el cerro.',
        fuente: ['Wikipedia', 'https://es.wikipedia.org/wiki/Saucelle'],
        foto: [
          'img/ruta-picon-moro.jpg',
          'Mirador del Picón del Moro. Foto: Xemenendura · CC BY-SA 4.0 · Wikimedia Commons'
        ]
      },
      {
        id: 'hinojosa-cristo',
        n: 'Ermita del Cristo y Sagrado Corazón',
        municipio: 'Hinojosa de Duero',
        la: 40.98539,
        lo: -6.80021,
        ver: 'Al llegar, el Sagrado Corazón en lo alto del cerro de San Pedro, erigido en tiempos de la II República, anuncia Hinojosa. A su lado, la ermita del Santísimo Cristo de la Misericordia, del siglo XIII, es testigo de la repoblación leonesa y tiene su propio mirador. El pueblo conserva calles estrechas y empedradas y casonas blasonadas, como la Casa de la Ciriaca.',
        min: 45,
        consejo:
          'La fiesta del Cristo de la Misericordia es el último domingo de abril, y la Feria Internacional del Queso, el primer fin de semana de mayo.',
        fuente: ['Wikipedia', 'https://es.wikipedia.org/wiki/Hinojosa_de_Duero'],
        foto: [
          'img/ruta-hinojosa-cristo.jpg',
          'Ermita del Cristo y Sagrado Corazón. Foto: Pablohn6 · CC0 · Wikimedia Commons'
        ],
        masFuentes: [
          [
            'Turismo de Castilla y León',
            'https://www.turismocastillayleon.com/es/patrimonio-cultura/ruta-duero/hinojosa-duero'
          ]
        ]
      },
      {
        id: 'vega-terron',
        n: 'Muelle de Vega Terrón',
        municipio: 'La Fregeneda',
        la: 41.02883,
        lo: -6.92921,
        ver: 'El único muelle fluvial de Castilla y León está en el Águeda, junto a su desembocadura en el Duero: los dos ríos hacen aquí de frontera, con Barca d’Alva en la orilla portuguesa. Hasta él llegan los cruceros que remontan el Duero desde Oporto. El primer muelle se construyó hacia 1860 y el actual sustituyó al antiguo a finales de los años 80.',
        min: 45,
        consejo:
          'Aquí termina el Camino de Hierro (17 km de túneles y puentes desde la estación de La Fregeneda), que requiere reserva previa. De vuelta por la CL-517 queda el mirador accesible de Mafeito.',
        fuente: ['Wikipedia', 'https://es.wikipedia.org/wiki/Muelle_de_Vega_Terr%C3%B3n'],
        foto: [
          'img/ruta-vega-terron.jpg',
          'Muelle de Vega Terrón. Foto: Helmut Seger · CC BY-SA 4.0 · Wikimedia Commons'
        ],
        masFuentes: [
          [
            'Turismo de Castilla y León (La Fregeneda)',
            'https://www.turismocastillayleon.com/es/patrimonio-cultura/ruta-duero/fregeneda'
          ],
          [
            'Turismo de Castilla y León (Camino de Hierro)',
            'https://www.turismocastillayleon.com/es/naturaleza/sa2-camino-hierro'
          ]
        ]
      }
    ]
  },
  {
    id: 'sierra-francia',
    nombre: 'Sierra de Francia: piedra, madera y retratos',
    icono: '🏘️',
    tema: 'Pueblos con encanto',
    duracion: 'dia',
    resumen:
      'Un día de coche por la Sierra de Francia: subida al santuario de la Peña de Francia y paseo por cuatro pueblos declarados conjunto histórico: La Alberca, Mogarraz, San Martín del Castañar y Miranda del Castañar.',
    epoca:
      'De primavera a otoño: la cumbre de la Peña de Francia es prácticamente inaccesible en invierno por la nieve.',
    fuente: [
      'Turismo de Castilla y León',
      'https://www.turismocastillayleon.com/es/patrimonio-cultura/miranda-castanar'
    ],
    paradas: [
      {
        id: 'pena-francia',
        n: 'Santuario de la Peña de Francia',
        municipio: 'El Cabaco',
        la: 40.51348,
        lo: -6.16965,
        ver: 'Es la cima de la sierra, a 1.727 metros, y desde arriba se ven el Campo Charro al norte, la sierra de Tamames al este y el embalse de Gabriel y Galán al sur. En lo alto está el santuario de Nuestra Señora de la Peña de Francia, monasterio de principios del siglo XV hoy a cargo de los dominicos, que guarda la imagen que, según la leyenda, encontró Simón Vela en una gruta cercana en 1434.',
        min: 60,
        consejo: 'Mejor fuera del invierno: con nieve, la cumbre es prácticamente inaccesible.',
        fuente: [
          'Turismo de Castilla y León',
          'https://www.turismocastillayleon.com/es/patrimonio-cultura/santuarios/santuario-pena-francia'
        ],
        foto: [
          'img/ruta-pena-francia.jpg',
          'Santuario de la Peña de Francia. Foto: Rodelar · CC BY-SA 4.0 · Wikimedia Commons'
        ],
        masFuentes: [['Wikipedia', 'https://es.wikipedia.org/wiki/Pe%C3%B1a_de_Francia']]
      },
      {
        id: 'la-alberca',
        n: 'La Alberca',
        municipio: 'La Alberca',
        la: 40.49089,
        lo: -6.11229,
        ver: 'En 1940 fue el primer pueblo de España declarado Conjunto Histórico-Artístico. Su Plaza Mayor, con soportales de madera y un crucero de granito, es el centro de un caserío de calles estrechas y empedradas de trazado medieval. La iglesia, terminada en 1733, guarda un púlpito de granito policromado del siglo XVI; y cada 13 de junio se suelta por las calles el marrano de San Antón, que los vecinos alimentan hasta rifarlo el 17 de enero.',
        min: 90,
        fuente: ['Wikipedia', 'https://es.wikipedia.org/wiki/La_Alberca_(Salamanca)'],
        foto: [
          'img/ruta-la-alberca.jpg',
          'La Alberca. Foto: Luis Daniel Carbia Cabeza · CC BY 2.0 · Wikimedia Commons'
        ],
        masFuentes: [
          [
            'elDiario.es',
            'https://www.eldiario.es/viajes/pueblo-primer-conjunto-historico-artistico-espana-mantiene-vivas-tradiciones-centenarias_1_12586343.html'
          ]
        ]
      },
      {
        id: 'mogarraz',
        n: 'Mogarraz',
        municipio: 'Mogarraz',
        la: 40.49345,
        lo: -6.05204,
        ver: 'Conjunto histórico desde 1998, sus fachadas de entramado lucen cientos de retratos de vecinos pintados por Florencio Maíllo, artista nacido en el pueblo, entre 2008 y 2011 a partir de las fotos de carné que Alejandro Martín Criado les hizo en 1967. El proyecto, Retrata2-388, empezó con 388 caras, las de quienes se quedaron cuando tantos emigraron en los años sesenta. Completan el paseo la Plaza Mayor ovalada y la iglesia de Nuestra Señora de las Nieves.',
        min: 60,
        fuente: [
          'Guía Repsol',
          'https://www.guiarepsol.com/content/repsol-guia/es/home/viajar/vamos-de-excursion/ruta-por-el-pueblo-de-mogarraz-sierra-de-francia-salamanca.html'
        ],
        foto: ['img/ruta-mogarraz.jpg', 'Mogarraz. Foto: JnCrlsMG · CC BY-SA 4.0 · Wikimedia Commons'],
        masFuentes: [['Wikipedia', 'https://es.wikipedia.org/wiki/Mogarraz']]
      },
      {
        id: 'san-martin-castanar',
        n: 'San Martín del Castañar',
        municipio: 'San Martín del Castañar',
        la: 40.52297,
        lo: -6.0626,
        ver: 'Conjunto histórico-artístico desde 1982 (Real Decreto 3233/1982). Del castillo del siglo XV quedan la torre del homenaje, con mirador y un centro de interpretación de la biosfera, y las murallas, que encierran desde 1834 el cementerio; el antiguo patio de armas es hoy una curiosa plaza de toros que se usa en el festejo del 11 de agosto. La iglesia de San Martín de Tours, levantada entre los siglos XIII y XVIII, es Bien de Interés Cultural desde 1981.',
        min: 60,
        fuente: ['Wikipedia', 'https://es.wikipedia.org/wiki/San_Mart%C3%ADn_del_Casta%C3%B1ar'],
        foto: [
          'img/ruta-san-martin-castanar.jpg',
          'San Martín del Castañar. Foto: Sotos · CC BY-SA 4.0 · Wikimedia Commons'
        ],
        masFuentes: [['BOE', 'https://www.boe.es/boe/dias/1982/11/29/pdfs/A32808-32808.pdf']]
      },
      {
        id: 'miranda-castanar',
        n: 'Miranda del Castañar',
        municipio: 'Miranda del Castañar',
        la: 40.48424,
        lo: -5.9963,
        ver: 'Villa amurallada desde principios del siglo XIII y conjunto histórico-artístico desde 1973, conserva una muralla de más de 600 metros con cuatro puertas (de la Villa, de San Ginés, del Postigo y de Nuestra Señora de la Cuesta). El castillo de los Zúñiga, condes de Miranda, es uno de los mejor conservados de la provincia, y su antiguo patio de armas hace de plaza de toros. Del 7 al 10 de septiembre honra a la Virgen de la Cuesta con la procesión de los candiles, de Interés Turístico Regional.',
        min: 75,
        fuente: ['Wikipedia', 'https://es.wikipedia.org/wiki/Miranda_del_Casta%C3%B1ar'],
        foto: [
          'img/ruta-miranda-castanar.jpg',
          'Miranda del Castañar. Foto: Luis Rogelio HM · CC BY-SA 2.0 · Wikimedia Commons'
        ],
        masFuentes: [
          [
            'Turismo de Castilla y León',
            'https://www.turismocastillayleon.com/es/patrimonio-cultura/miranda-castanar'
          ]
        ]
      }
    ]
  },
  {
    id: 'patrimonio',
    nombre: 'Piedras de la Raya: Ciudad Rodrigo y San Felices',
    icono: '🏰',
    tema: 'Patrimonio histórico y religioso',
    duracion: 'dia',
    resumen:
      'Un día hacia la frontera con Portugal: la catedral, la Plaza Mayor, la muralla y el castillo de Ciudad Rodrigo, conjunto histórico-artístico desde 1944, y por la tarde la villa amurallada de San Felices de los Gallegos.',
    fuente: ['Wikipedia', 'https://es.wikipedia.org/wiki/Ciudad_Rodrigo'],
    paradas: [
      {
        id: 'crcatedral',
        n: 'Catedral de Santa María',
        municipio: 'Ciudad Rodrigo',
        la: 40.59936,
        lo: -6.53536,
        ver: 'Se empezó en el siglo XII y las obras duraron hasta el XIV, así que mezcla románico y gótico; donde mejor se ve es en el claustro. El Pórtico del Perdón reúne casi 400 esculturas. En la Guerra de la Independencia las tropas napoleónicas usaron el pórtico como polvorín y la fachada aún conserva impactos de cañón.',
        min: 75,
        consejo:
          'Entrada general 8 € con audioguía; de lunes a jueves, de 11:00 a 11:30, gratis sin audioguía (salvo festivos y vísperas). El acceso cierra 30 minutos antes y los sábados el horario puede cambiar por bodas o cultos.',
        fuente: [
          'Turismo de Castilla y León',
          'https://www.turismocastillayleon.com/es/patrimonio-cultura/catedral-ciudad-rodrigo'
        ],
        foto: [
          'img/ruta-crcatedral.jpg',
          'Catedral de Santa María. Foto: Mr. Tickle · CC BY-SA 3.0 · Wikimedia Commons'
        ]
      },
      {
        id: 'crplaza',
        n: 'Plaza Mayor y Ayuntamiento',
        municipio: 'Ciudad Rodrigo',
        la: 40.59724,
        lo: -6.53328,
        ver: 'El centro de la vida de la ciudad y antiguo lugar de mercado. La casa consistorial es renacentista, del siglo XVI: dos galerías de tres arcos carpaneles con medallones y, en la torrecilla derecha, los escudos de Carlos V, de la ciudad y del corregidor. Joaquín de Vargas la restauró en 1904 y le quitó el tercer piso y la espadaña barroca.',
        min: 30,
        fuente: [
          'Los Pueblos más Bonitos de España',
          'https://lospueblosmasbonitosdeespana.org/pueblos/ciudad-rodrigo/pois/1689'
        ],
        foto: [
          'img/ruta-crplaza.jpg',
          'Plaza Mayor y Ayuntamiento. Foto: Alonso de Mendoza · CC BY-SA 4.0 · Wikimedia Commons'
        ]
      },
      {
        id: 'crmuralla',
        n: 'Muralla y Puerta del Conde',
        municipio: 'Ciudad Rodrigo',
        la: 40.59907,
        lo: -6.53245,
        ver: 'Fernando II de León empezó a levantarla en el siglo XII, al repoblar la ciudad, y tiene más de dos kilómetros de perímetro; en el siglo XVIII se le añadieron baluartes exteriores en dientes de sierra. Aguantó dos asedios en la Guerra de la Independencia: los franceses de Ney la tomaron en julio de 1810 tras 24 días de sitio y Wellington la recuperó en enero de 1812.',
        min: 60,
        consejo:
          'En los antiguos cuerpos de guardia de las puertas del Conde y de San Pelayo está el Centro de Interpretación de las Fortificaciones de Frontera (entrada general 5 €; horario por temporadas, con cierre a finales de septiembre).',
        fuente: ['Wikipedia', 'https://es.wikipedia.org/wiki/Ciudad_Rodrigo'],
        foto: [
          'img/ruta-crmuralla.jpg',
          'Muralla y Puerta del Conde. Foto: GFreihalter · CC BY-SA 3.0 · Wikimedia Commons'
        ],
        masFuentes: [
          [
            'Turismo de Castilla y León',
            'https://www.turismocastillayleon.com/es/arte-cultura-patrimonio/espacios-culturales/centro-interpretacion-fortificaciones-frontera'
          ]
        ]
      },
      {
        id: 'crcastillo',
        n: 'Castillo de Enrique II',
        municipio: 'Ciudad Rodrigo',
        la: 40.59632,
        lo: -6.53627,
        ver: 'Se alzó en el siglo XIV, en tiempos de Enrique II de Trastámara, en la parte más alta y escarpada de la ciudad para defender el lado del río. Su torre del homenaje tiene dos cuerpos cúbicos, el de arriba más pequeño y moderno. Desde 1931 es Parador Nacional, uno de los más antiguos de España.',
        min: 20,
        fuente: [
          'Los Pueblos más Bonitos de España',
          'https://lospueblosmasbonitosdeespana.org/pueblos/ciudad-rodrigo/pois/castillo-de-enrique-ii-de-trastamara?lang=en'
        ],
        foto: [
          'img/ruta-crcastillo.jpg',
          'Castillo de Enrique II. Foto: Mr. Tickle · CC BY-SA 3.0 · Wikimedia Commons'
        ]
      },
      {
        id: 'sanfelices',
        n: 'Castillo de San Felices de los Gallegos',
        municipio: 'San Felices de los Gallegos',
        la: 40.85048,
        lo: -6.71152,
        ver: 'Según las crónicas lo levantó en el siglo XIII don Dinis, rey de Portugal, que también amuralló la villa; tomó su forma definitiva en el siglo XV y la torre del homenaje es fruto de la reforma de 1476. Hoy la torre alberga un centro de interpretación sobre su historia y construcción. Todo el pueblo, castillo incluido, es Conjunto Histórico Artístico desde 1965.',
        min: 75,
        consejo: 'Cerrado martes y miércoles; entrada general 3 €. El horario cambia según la temporada.',
        fuente: ['Wikipedia', 'https://es.wikipedia.org/wiki/Castillo_de_San_Felices_de_los_Gallegos'],
        foto: [
          'img/ruta-sanfelices.jpg',
          'Castillo de San Felices de los Gallegos. Foto: Hovallef · CC BY-SA 4.0 · Wikimedia Commons'
        ],
        masFuentes: [
          [
            'Turismo de Castilla y León',
            'https://www.turismocastillayleon.com/es/patrimonio-cultura/castillo-murallas-san-felices-gallegos'
          ]
        ]
      }
    ]
  },
  {
    id: 'gastronomia',
    nombre: 'La ruta del ibérico: de Guijuelo a la sierra de Béjar',
    icono: '🍖',
    tema: 'Gastronomía y productos de la tierra',
    duracion: 'dia',
    resumen:
      'Hacia el sur, por la tierra del Jamón de Guijuelo: su denominación de origen abarca 78 municipios y exige 730 días de elaboración a los jamones. Museos de la chacina, el calderillo de Béjar y la matanza de Candelario.',
    fuente: ['Wikipedia', 'https://es.wikipedia.org/wiki/Jam%C3%B3n_de_Guijuelo'],
    paradas: [
      {
        id: 'mercadocentral',
        n: 'Mercado Central',
        municipio: 'Salamanca',
        la: 40.96463,
        lo: -5.6631,
        ver: 'Antes de salir, el mercado de pilares y vigas metálicas que proyectó Joaquín de Vargas junto a la Plaza Mayor, inaugurado el 15 de abril de 1909. Dentro se venden los productos típicos de la gastronomía de la provincia.',
        min: 30,
        fuente: ['Wikipedia', 'https://es.wikipedia.org/wiki/Mercado_Central_de_Salamanca'],
        foto: [
          'img/ruta-mercadocentral.jpg',
          'Mercado Central. Foto: Xemenendura · CC BY-SA 4.0 · Wikimedia Commons'
        ]
      },
      {
        id: 'guijuelo',
        n: 'Museo de la Industria Chacinera',
        municipio: 'Guijuelo',
        la: 40.55943,
        lo: -5.67067,
        ver: 'En el mismo edificio que la oficina de turismo, cuenta la industria chacinera, la dehesa y la vida tradicional con catorce proyecciones de vídeo entre máquinas antiguas, herramientas y troncos de encina. Tiene juegos interactivos y muestras de producto para tocar y oler.',
        min: 60,
        consejo:
          'De lunes a sábado, de 10:00 a 14:00; por la tarde, domingos y festivos, con cita previa (923 591 901). Entrada general 2 €.',
        fuente: [
          'Turismo de Castilla y León',
          'https://www.turismocastillayleon.com/es/patrimonio-cultura/museo-industria-chacinera'
        ]
      },
      {
        id: 'ledrada',
        n: 'Ledrada',
        municipio: 'Ledrada',
        la: 40.46944,
        lo: -5.72271,
        ver: 'Su principal actividad es la industria chacinera: es conocido por sus chorizos y jamones, algunos con la Denominación de Origen Guijuelo. La iglesia parroquial de San Miguel es románica. El pueblo perteneció a los Stúñiga, señores y después duques de Béjar, hasta 1833.',
        min: 30,
        fuente: ['Wikipedia', 'https://es.wikipedia.org/wiki/Ledrada'],
        foto: ['img/ruta-ledrada.jpg', 'Ledrada. Foto: Hovallef · CC BY-SA 4.0 · Wikimedia Commons']
      },
      {
        id: 'bejar',
        n: 'Béjar y su calderillo',
        municipio: 'Béjar',
        la: 40.38829,
        lo: -5.77319,
        ver: 'Buen sitio para comer: el calderillo bejarano encabeza sus platos típicos, junto con las patatas revueltas, el zorongollo y los limones; de postre, huesillos o perrunillas. Para bajar la comida, la villa tiene murallas, las iglesias de Santiago, Santa María la Mayor y El Salvador y el Palacio Ducal.',
        min: 120,
        fuente: [
          'Turismo de Castilla y León',
          'https://www.turismocastillayleon.com/es/conjuntoshistoricos/bejar'
        ],
        foto: [
          'img/ruta-bejar.jpg',
          'Béjar y su calderillo. Foto: Jl FilpoC · CC BY-SA 4.0 · Wikimedia Commons'
        ]
      },
      {
        id: 'candelario',
        n: 'Candelario y la Casa Chacinera',
        municipio: 'Candelario',
        la: 40.36743,
        lo: -5.74233,
        ver: 'Aquí la matanza marcaba la vida del pueblo: por las calles bajan las regaderas, canalillos de agua de la sierra pensados para limpiarlas después, y las batipuertas de las casas hacían de burladero. El Museo de la Casa Chacinera, etnográfico, abrió en 2008. Candelario es conjunto histórico desde 1975.',
        min: 75,
        consejo:
          'El museo abre jueves y viernes y, los fines de semana, con visitas guiadas (sábados a las 11:30, 13:00 y 17:30; domingos a las 11:30 y 13:00). Fuera del verano cierra de lunes a miércoles. Entrada general 4,5 €.',
        fuente: ['Wikipedia', 'https://es.wikipedia.org/wiki/Candelario'],
        foto: [
          'img/ruta-candelario.jpg',
          'Candelario y la Casa Chacinera. Foto: Basotxerri · CC BY-SA 4.0 · Wikimedia Commons'
        ],
        masFuentes: [
          [
            'Turismo de Castilla y León',
            'https://www.turismocastillayleon.com/es/patrimonio-cultura/museo-casa-chacinera'
          ]
        ]
      }
    ]
  },
  {
    id: 'alba-tormes',
    nombre: 'Alba de Tormes: Santa Teresa y los duques',
    icono: '🏰',
    tema: 'Escapada de medio día',
    duracion: 'medio',
    resumen:
      'El convento donde murió y está enterrada Santa Teresa, la torre que queda del castillo de los duques de Alba, una iglesia románico-mudéjar con museo de alfarería y el gran puente medieval sobre el Tormes.',
    epoca:
      'Todo el año; del 15 al 22 de octubre son las fiestas patronales de Santa Teresa, de Interés Turístico de Castilla y León.',
    fuente: [
      'Turismo de Castilla y León',
      'https://www.turismocastillayleon.com/es/patrimonio-cultura/alba-tormes'
    ],
    paradas: [
      {
        id: 'convento-carmelitas',
        n: 'Convento de las Carmelitas y Basílica Teresiana',
        municipio: 'Alba de Tormes',
        la: 40.82645,
        lo: -5.51589,
        ver: 'Santa Teresa fundó aquí el convento de la Anunciación en 1571 y en él murió en 1582. En su iglesia está el sepulcro de la santa, donde se veneran sus reliquias mayores: el corazón y el brazo izquierdo. Al lado se alza la Basílica Teresiana, neogótica, de tres naves y planta de cruz latina, empezada en 1898 y todavía inacabada. El Museo Teresiano enseña el claustro y el refectorio del convento y una maqueta de cómo sería la basílica terminada.',
        min: 60,
        consejo:
          'Museo Teresiano (Plaza de Santa Teresa, 4): de junio a octubre, todos los días de 10:00 a 14:00 y de 16:00 a 19:30; entrada general 5 €. Cierra el 25 de diciembre y el 1 y 6 de enero, y las tardes del 24 y 31 de diciembre.',
        fuente: [
          'Turismo de Castilla y León',
          'https://www.turismocastillayleon.com/es/patrimonio-cultura/huellas-teresa/alba-tormes'
        ],
        foto: [
          'img/ruta-convento-carmelitas.jpg',
          'Convento de las Carmelitas y Basílica Teresiana. Foto: Jl FilpoC · CC BY-SA 4.0 · Wikimedia Commons'
        ],
        masFuentes: [
          [
            'Turismo de Castilla y León',
            'https://www.turismocastillayleon.com/es/patrimonio-cultura/museo-teresiano-alba-tormes'
          ]
        ]
      },
      {
        id: 'torre-armeria',
        n: 'Torre de la Armería (castillo de los duques de Alba)',
        municipio: 'Alba de Tormes',
        la: 40.82423,
        lo: -5.51389,
        ver: 'La villa estaba fortificada al menos desde el siglo XII, y a finales del XV los duques de Alba, título que García Álvarez de Toledo obtuvo en 1472, convirtieron el castillo en castillo-palacio. De él solo queda en pie la Torre de la Armería, que en la Guerra de la Independencia fue cuartel general de las tropas francesas. Dentro guarda los frescos de la batalla de Mühlberg, restaurados junto con la torre; desde arriba se ve el puente sobre el Tormes.',
        min: 40,
        consejo:
          'En octubre abre todos los días de 10:00 a 14:00 y de 16:00 a 19:00 (en verano, hasta las 19:30 o 20:00). Entrada 3 € o 4 € la conjunta con el Museo de Alfarería; gratis los martes de 12:00 a 14:00. Cierra el 24, 25 y 31 de diciembre y el 1, 5 y 6 de enero.',
        fuente: [
          'Turismo de Castilla y León',
          'https://www.turismocastillayleon.com/es/patrimonio-cultura/castillo-duques-alba'
        ],
        foto: [
          'img/ruta-torre-armeria.jpg',
          'Torre de la Armería (castillo de los duques de Alba). Foto: Jl FilpoC · CC BY-SA 4.0 · Wikimedia Commons'
        ]
      },
      {
        id: 'santiago-alfareria',
        n: 'Iglesia de Santiago y Museo de Alfarería',
        municipio: 'Alba de Tormes',
        la: 40.82696,
        lo: -5.51179,
        ver: 'Es un templo pequeño, de una sola nave, del segundo tercio del siglo XII y de origen románico-mudéjar; de entonces conserva la cabecera, decorada con tres series de arquerías ciegas, y una portada románica. Dentro hay dos sepulcros góticos, un retablo barroco y la lápida de Gutierre Álvarez de Toledo, primer señor de Alba de Tormes. Hoy acoge el Museo de Alfarería.',
        min: 30,
        consejo:
          'De octubre a abril, todos los días de 12:00 a 14:00 y de 16:00 a 18:00; entrada 1,5 € (4 € conjunta con el castillo), gratis los martes de 12:00 a 14:00. Cierra el 24, 25 y 31 de diciembre y el 1 y 6 de enero.',
        fuente: [
          'Turismo de Castilla y León',
          'https://www.turismocastillayleon.com/es/patrimonio-cultura/iglesias-ermitas/iglesia-santiago-alba-tormes'
        ],
        foto: [
          'img/ruta-santiago-alfareria.jpg',
          'Iglesia de Santiago y Museo de Alfarería. Foto: Malopez 21 · CC BY-SA 4.0 · Wikimedia Commons'
        ]
      },
      {
        id: 'puente-alba',
        n: 'Puente sobre el Tormes',
        municipio: 'Alba de Tormes',
        la: 40.82566,
        lo: -5.51776,
        ver: 'Es el gran puente medieval de Alba, levantado sobre un puente de origen romano, y hoy sigue siendo la entrada a la villa por la carretera de Salamanca. Su larga hilera de arcos se ve entera desde lo alto de la Torre de la Armería.',
        min: 15,
        fuente: ['Wikipedia', 'https://es.wikipedia.org/wiki/Alba_de_Tormes'],
        foto: [
          'img/ruta-puente-alba.jpg',
          'Puente sobre el Tormes. Foto: Cassandra Gómez Sánchez · CC BY-SA 4.0 · Wikimedia Commons'
        ]
      }
    ]
  },
  {
    id: 'ledesma',
    nombre: 'Ledesma: villa amurallada sobre el Tormes',
    icono: '🌉',
    tema: 'Escapada de medio día',
    duracion: 'medio',
    resumen:
      'A 35 km de Salamanca, Ledesma es conjunto histórico-artístico desde 1975: su puente viejo sobre el Tormes, la Plaza Mayor con Santa María la Mayor y la fortaleza en una esquina de más de 3 km de muralla.',
    fuente: ['Wikipedia', 'https://es.wikipedia.org/wiki/Ledesma_(Salamanca)'],
    paradas: [
      {
        id: 'puente-ledesma',
        n: 'Puente Viejo',
        municipio: 'Ledesma',
        la: 41.09201,
        lo: -5.99651,
        ver: 'Sus restos más antiguos a la vista son de base románica de finales del siglo XII, pero lo que se ve hoy es sobre todo de finales del siglo XV. Hasta el siglo XIX fue el puente más alto sobre el Tormes. Lo volaron en 1812 y el segundo arco desde la villa se rehízo en 1816.',
        min: 20,
        fuente: ['Wikipedia', 'https://es.wikipedia.org/wiki/Ledesma_(Salamanca)'],
        foto: [
          'img/ruta-puente-ledesma.jpg',
          'Puente Viejo. Foto: Lancastermerrin88 · CC BY-SA 4.0 · Wikimedia Commons'
        ]
      },
      {
        id: 'santa-maria-ledesma',
        n: 'Plaza Mayor e iglesia de Santa María la Mayor',
        municipio: 'Ledesma',
        la: 41.09048,
        lo: -5.99839,
        ver: 'La iglesia se empezó en el último tercio del siglo XII en románico final y se amplió entre 1492 y 1500 en gótico hispano-flamenco, con bóvedas de crucería en «espina de pez». Guarda sepulcros de nobles, como el del infante don Sancho, nieto de Alfonso X. Es Bien de Interés Cultural desde 2002. La Plaza Mayor, escenario de corridas y fiestas, se comunica con la Alhóndiga por el Arco de los Roderos.',
        min: 40,
        fuente: ['Wikipedia', 'https://es.wikipedia.org/wiki/Ledesma_(Salamanca)'],
        foto: [
          'img/ruta-santa-maria-ledesma.jpg',
          'Plaza Mayor e iglesia de Santa María la Mayor. Foto: Lancastermerrin88 · CC BY-SA 4.0 · Wikimedia Commons'
        ]
      },
      {
        id: 'fortaleza-ledesma',
        n: 'Fortaleza y paseo de la muralla',
        municipio: 'Ledesma',
        la: 41.08818,
        lo: -6.00046,
        ver: 'La fortaleza aprovecha una esquina del recinto amurallado, que quizá corresponda a las fortificaciones de Fernando II de León. En 1331 Alfonso XI entregó el señorío de Ledesma a su hijo don Sancho, y en 1476 los Reyes Católicos confirmaron la villa a Beltrán de la Cueva. De la fortaleza se conserva la puerta de arco apuntado, y desde ella se puede seguir el paseo junto a la muralla, sobre el río.',
        min: 40,
        consejo:
          'Turismo de Castilla y León la da como «cerrada temporalmente»: se ve por fuera. La Oficina de Turismo de Ledesma es gratuita.',
        fuente: [
          'Turismo de Castilla y León',
          'https://www.turismocastillayleon.com/es/patrimonio-cultura/castillo-ledesma'
        ],
        foto: [
          'img/ruta-fortaleza-ledesma.jpg',
          'Fortaleza y paseo de la muralla. Foto: Lancastermerrin88 · CC BY-SA 4.0 · Wikimedia Commons'
        ]
      }
    ]
  }
];
