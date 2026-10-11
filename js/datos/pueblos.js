// Fichas de pueblos de la provincia: { 'Nombre del municipio' (igual que en PROVINCIA): {
//   cur: [curiosidades], mon: monumento o lugar principal { n, tipo (pictograma), epoca, estilo, datos },
//   foto (opcional): [ruta, pie con «Foto: autor · licencia»] de Wikimedia Commons,
//   comer: [{ n, a, p, s }], fuente: [[nombre, url]] } }. Todo con fuente verificable.
// Los habitantes salen de habitantes.js (INE), para todos los municipios.
const PUEBLOS = {
  'Ciudad Rodrigo': {
    cur: [
      'Su Carnaval del Toro tiene documentos desde 1417: ya entonces se corrían toros.',
      'Las murallas, empezadas por Fernando II de León en el siglo XII, miden más de dos kilómetros y conservan seis puertas.',
      'Wellington la tomó a los franceses la noche del 19 de enero de 1812, y por ello recibió el título de duque de Ciudad Rodrigo.'
    ],
    mon: {
      n: 'Catedral de Santa María',
      tipo: 'catedral',
      epoca: 'Siglos XII–XIV',
      estilo: 'Románico en transición al gótico',
      datos: [
        ['Iniciada', 'con Fernando II de León'],
        ['Torre', '1764–1770']
      ]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Ciudad_Rodrigo']],
    comer: [
      {
        n: 'Parador de Ciudad Rodrigo (restaurante Río Águeda)',
        a: 'Plaza del Castillo, s/n',
        p: 'El mejor valorado del pueblo en Gastroranking: 8,4 sobre 10 con unas 3.800 opiniones.',
        s: 'Gastroranking, oct. 2026'
      },
      {
        n: 'Cafetería-Restaurante La Rúa',
        a: 'Avenida de España, 35',
        p: 'Otro de los mejor valorados del pueblo en Gastroranking: 8,5 sobre 10 con unas 860 opiniones.',
        s: 'Gastroranking, oct. 2026'
      }
    ]
  },
  'La Alberca': {
    cur: [
      'En 1940 fue el primer pueblo de España declarado Conjunto Histórico-Artístico.',
      'Cada 13 de junio se bendice el marrano de San Antón, un cerdo que andará suelto por las calles y que alimentan los vecinos hasta que se rifa el 17 de enero.',
      'El día después del 15 de agosto se representa La Loa, una comedia popular que mezcla lo religioso y lo profano.'
    ],
    mon: {
      n: 'Iglesia parroquial',
      tipo: 'iglesia',
      epoca: 'Terminada en 1733',
      datos: [['Púlpito', 'de granito policromado, siglo XVI']]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/La_Alberca_(Salamanca)']],
    comer: [
      {
        n: 'Doña Consuelo',
        a: 'Plaza Mayor',
        p: 'El mejor valorado del pueblo en Gastroranking: 8,6 sobre 10 con unas 1.200 opiniones.',
        s: 'Gastroranking, oct. 2026'
      },
      {
        n: 'Restaurante El Encuentro',
        a: 'Calle Tablado 8',
        p: 'Otro de los mejor valorados del pueblo en Gastroranking: 8,5 sobre 10 con unas 3.600 opiniones.',
        s: 'Gastroranking, oct. 2026'
      }
    ]
  },
  Béjar: {
    cur: [
      'En 1691 los duques trajeron pañeros flamencos; la industria textil vivió su mejor momento en los años sesenta.',
      'En el Corpus salen los Hombres de Musgo, vecinos cubiertos de musgo que recrean la leyenda de la conquista de la villa.',
      'La Puerta de la Traición, en su muralla medieval, está ligada a esa leyenda.'
    ],
    mon: {
      n: 'El Bosque',
      tipo: 'jardin',
      epoca: 'Siglo XVI',
      estilo: 'Jardín renacentista italiano',
      datos: [
        ['Lo hicieron', 'los duques de Béjar'],
        ['Jardín artístico', 'desde 1946']
      ]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Béjar']],
    comer: [
      {
        n: 'Casa Pavón',
        a: 'Plaza Mayor',
        p: 'El mejor valorado del pueblo en Gastroranking: 8,8 sobre 10 con unas 1.800 opiniones.',
        s: 'Gastroranking, oct. 2026'
      },
      {
        n: 'La Alegría del Castañar (Casa Senén)',
        a: 'Paraje del Castañar de Bejar',
        p: 'Otro de los mejor valorados del pueblo en Gastroranking: 8,3 sobre 10 con unas 2.200 opiniones.',
        s: 'Gastroranking, oct. 2026'
      }
    ]
  },
  Candelario: {
    cur: [
      'Sus batipuertas permiten cerrar la casa aunque el portón esté abierto, y servían de burladero al matar las reses.',
      'Por las regaderas, canalillos en las calles, baja el agua de los neveros de la sierra; se usaban para limpiar tras la matanza.',
      'Su embutido se hizo famoso desde que lo probó Carlos IV tras una cacería. El conjunto histórico es Bien de Interés Cultural desde 1975.'
    ],
    mon: {
      n: 'Iglesia de Nuestra Señora de la Asunción',
      tipo: 'iglesia',
      estilo: 'Mudéjar, gótico y barroco',
      datos: [
        ['Artesonado', 'mudéjar'],
        ['Rosetón', 'gótico']
      ]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Candelario']],
    comer: [
      {
        n: 'El Portón de Candelario',
        a: 'Calle Pedro Muñoz Rico, 58',
        p: 'El mejor valorado del pueblo en Gastroranking: 8,8 sobre 10 con unas 1.400 opiniones.',
        s: 'Gastroranking, oct. 2026'
      },
      {
        n: 'Mesón La Candela',
        a: 'Calle Núñez Losada, 19',
        p: 'Otro de los mejor valorados del pueblo en Gastroranking: 8,2 sobre 10 con unas 750 opiniones.',
        s: 'Gastroranking, oct. 2026'
      }
    ]
  },
  Ledesma: {
    cur: [
      'Su nombre viene del romano Bletisa; Plutarco ya menciona a sus habitantes, los bletonenses.',
      'Su puente viejo, de base románica del siglo XII, fue hasta el XIX el más alto sobre el Tormes. En 1812 las tropas de Napoleón volaron uno de sus arcos.',
      'La fortaleza se empezó a levantar a finales del siglo XII por orden de Fernando II de León.'
    ],
    mon: {
      n: 'Iglesia de Santa María la Mayor',
      tipo: 'iglesia',
      epoca: 'Desde finales del siglo XII; ampliada en 1492–1500',
      estilo: 'Románico final y gótico hispano-flamenco',
      datos: [
        ['Ampliación', 'Juan Gil de Hontañón el Viejo'],
        ['Bien de Interés Cultural', '2002']
      ]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Ledesma_(Salamanca)']],
    comer: [
      {
        n: 'La Fernandica',
        a: 'Calle Cerezo 2',
        p: 'El mejor valorado del pueblo en Gastroranking: 7,8 sobre 10 con unas 1.100 opiniones.',
        s: 'Gastroranking, oct. 2026'
      },
      {
        n: 'Las Cadenas',
        a: 'Plaza del Mercado 14',
        p: 'Otro de los mejor valorados del pueblo en Gastroranking: 7,1 sobre 10 con unas 820 opiniones.',
        s: 'Gastroranking, oct. 2026'
      }
    ]
  },
  'Alba de Tormes': {
    cur: [
      'Santa Teresa murió aquí el 4 de octubre de 1582, en el convento de la Anunciación, donde se conserva su cuerpo.',
      'El castillo de los duques de Alba se empezó hacia 1430 y fue destruido en la Guerra de la Independencia.',
      'Su pieza de alfarería más propia es el botijo de filigrana.'
    ],
    mon: {
      n: 'Iglesia de San Juan',
      tipo: 'iglesia',
      epoca: 'Finales del siglo XII y principios del XIII',
      estilo: 'Románico-mudéjar',
      datos: [
        ['Destaca', 'la mejor muestra románico-mudéjar de la provincia'],
        ['Es', 'Monumento Nacional']
      ]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Alba_de_Tormes']],
    comer: [
      {
        n: 'Bar Miratormes',
        a: 'Calle Puerta del Río, s/n',
        p: 'El mejor valorado del pueblo en Gastroranking: 8,9 sobre 10 con unas 1.000 opiniones.',
        s: 'Gastroranking, oct. 2026'
      },
      {
        n: 'Mar.Lo',
        a: 'Carretera de Peñaranda, 57',
        p: 'Otro de los mejor valorados del pueblo en Gastroranking: 8,1 sobre 10 con unas 700 opiniones.',
        s: 'Gastroranking, oct. 2026'
      }
    ]
  },
  'Miranda del Castañar': {
    cur: [
      'Su casco antiguo es conjunto histórico-artístico desde el 8 de marzo de 1973.',
      'La muralla se empezó a principios del siglo XIII y conserva sus cuatro puertas.',
      'La calle Derecha es la espina dorsal del pueblo.'
    ],
    mon: {
      n: 'Castillo de los Zúñiga',
      tipo: 'torre',
      epoca: 'Siglo XIV, sobre otro del XII',
      datos: [
        ['Planta', 'trapecio irregular con cubos'],
        ['Recinto', 'en parte de 1451']
      ]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Miranda_del_Castañar']],
    comer: [
      {
        n: 'Posada Miranda',
        a: 'Calle Arrabal, 11',
        p: 'El mejor valorado del pueblo en Gastroranking: 8,2 sobre 10 con unas 480 opiniones. Precio medio: menos de 20  €.',
        s: 'Gastroranking, oct. 2026'
      },
      {
        n: 'San Benito',
        a: 'Plaza de la Constitución, 1',
        p: 'Otro de los mejor valorados del pueblo en Gastroranking: 8,2 sobre 10 con unas 440 opiniones.',
        s: 'Gastroranking, oct. 2026'
      }
    ]
  },
  Mogarraz: {
    cur: [
      'Una exposición en las fachadas ha «resucitado» los rostros de 388 vecinos que no emigraron en los años sesenta.',
      'Su conjunto histórico es Bien de Interés Cultural desde 1998.',
      'Está entre los Pueblos Más Bonitos de España desde 2014.'
    ],
    mon: {
      n: 'Iglesia de Nuestra Señora de las Nieves',
      tipo: 'iglesia',
      datos: [
        ['Planta', 'de cruz latina'],
        ['Altar', 'barroco']
      ]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Mogarraz']],
    comer: [
      {
        n: 'Restaurante Mirasierra',
        a: 'Calle Miguel Ángel Maíllo, 58',
        p: 'El mejor valorado del pueblo en Gastroranking: 8,5 sobre 10 con unas 3.500 opiniones.',
        s: 'Gastroranking, oct. 2026'
      }
    ]
  },
  'San Martín del Castañar': {
    cur: [
      'Desde 1834 el cementerio está dentro de las murallas del castillo.',
      'El patio de armas, que se usaba para el ganado, acabó siendo una plaza de toros.',
      'En el castillo está el museo de la reserva de la biosfera, sobre la flora y la fauna de la sierra.'
    ],
    mon: {
      n: 'Iglesia de San Martín de Tours',
      tipo: 'iglesia',
      epoca: 'Siglos XIII–XVIII',
      datos: [
        ['Naves', 'tres'],
        ['Artesonado', 'mudéjar'],
        ['Bien de Interés Cultural', '1981']
      ]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/San_Martín_del_Castañar']],
    comer: [
      {
        n: 'El Mesón de San Martín',
        a: 'Plaza Mayor',
        p: 'El mejor valorado del pueblo en Gastroranking: 8,6 sobre 10 con unas 1.500 opiniones.',
        s: 'Gastroranking, oct. 2026'
      }
    ]
  },
  Sequeros: {
    foto: [
      'img/pueblo-sequeros.jpg',
      'Calle de Sequeros. Foto: Luis Rogelio HM · CC BY-SA 2.0 · Wikimedia Commons'
    ],
    cur: [
      'Fue cabeza de partido judicial hasta 1968.',
      'Fernando VI le concedió el título de villa en 1756.',
      'En la iglesia de Santa María del Robledo reposan los restos de Juana Hernández, la «moza santa».'
    ],
    mon: {
      n: 'Santa María del Robledo',
      tipo: 'iglesia',
      datos: [['Camarín', 'de la Virgen, en la planta alta']]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Sequeros']]
  },
  Guijuelo: {
    cur: [
      'El jamón y los embutidos dan trabajo a unas 2.500 personas en 173 empresas: el 65 % de la población activa.',
      'El tren llegó en 1896 y pasó por el pueblo hasta mediados de los ochenta.',
      'En 1920 fue el primer pueblo de la provincia con alcantarillado.'
    ],
    mon: {
      n: 'El Torreón',
      tipo: 'torre',
      epoca: 'Siglo XV',
      estilo: 'Gótico',
      datos: [['Qué es', 'el ábside de una antigua iglesia']]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Guijuelo']],
    comer: [
      {
        n: 'Viró Gastrobar',
        a: 'Calle Gabriel y Galán',
        p: 'El mejor valorado del pueblo en Gastroranking: 8,7 sobre 10 con unas 2.100 opiniones.',
        s: 'Gastroranking, oct. 2026'
      },
      {
        n: 'Café Bar El Rincón de Curro',
        a: 'Calle Reina Sofía, 17',
        p: 'Otro de los mejor valorados del pueblo en Gastroranking: 8,6 sobre 10 con unas 800 opiniones.',
        s: 'Gastroranking, oct. 2026'
      }
    ]
  },
  'Peñaranda de Bracamonte': {
    foto: ['img/pueblo-penaranda.jpg', 'Plaza Nueva de Peñaranda. Foto: Zarateman · CC0 · Wikimedia Commons'],
    cur: [
      'El 9 de julio de 1939 estalló en la estación un tren con explosivos, «el Polvorín»: destruyó unos mil edificios y dejó más de cien muertos.',
      'Aquí nació la Fundación Germán Sánchez Ruipérez, que abrió en 1989 su Centro de Desarrollo Sociocultural.',
      'Sus tres plazas porticadas son conjunto histórico-artístico desde 1973.'
    ],
    mon: {
      n: 'Iglesia de San Miguel Arcángel',
      tipo: 'iglesia',
      epoca: 'Desde el siglo XV',
      estilo: 'Clasicista',
      datos: [
        ['Incendio', '1971'],
        ['Reabrió', '1981']
      ]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Peñaranda_de_Bracamonte']],
    comer: [
      {
        n: 'Las Cabañas',
        a: 'Calle Carmen 14',
        p: 'El mejor valorado del pueblo en Gastroranking: 8,8 sobre 10 con unas 2.500 opiniones. Precio medio: 30 a 45 €.',
        s: 'Gastroranking, oct. 2026'
      }
    ]
  },
  Vitigudino: {
    foto: [
      'img/pueblo-vitigudino.jpg',
      'Torre de la iglesia de San Nicolás de Bari. Foto: Rastrojo · CC BY-SA 4.0 · Wikimedia Commons'
    ],
    cur: [
      'Hacia 1752, según el Catastro de Ensenada, tenía 180 vecinos y 181 casas.',
      'En 1844 consiguió ayuntamiento propio como cabeza de partido judicial.',
      'La cruz de su escudo, de 1870, recuerda una batalla del 17 de enero de 1477.'
    ],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Vitigudino']],
    comer: [
      {
        n: 'Bar Restaurante Asador Tino',
        a: 'Calle Trinquete 8',
        p: 'El mejor valorado del pueblo en Gastroranking: 7,8 sobre 10 con unas 480 opiniones.',
        s: 'Gastroranking, oct. 2026'
      },
      {
        n: 'Café Casino',
        a: 'Calle Santa Ana, 1',
        p: 'Otro de los mejor valorados del pueblo en Gastroranking: 7,7 sobre 10 con unas 380 opiniones.',
        s: 'Gastroranking, oct. 2026'
      }
    ]
  },
  'Aldeadávila de la Ribera': {
    cur: [
      'Su presa, con unos 2.400 GWh al año, es la de mayor producción eléctrica de España.',
      'El cañón del Duero en los Arribes supera los 100 km: uno de los mayores de la península.',
      'En la presa se rodó Doctor Zhivago (1965), y en las galerías de la central, La cabina (1972).'
    ],
    mon: {
      n: 'Presa de Aldeadávila',
      tipo: 'presa',
      datos: [
        ['Producción', 'unos 2.400 GWh al año'],
        ['Cine', 'Doctor Zhivago (1965)']
      ]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Aldeadávila_de_la_Ribera']],
    comer: [
      {
        n: 'Corazón de Las Arribes',
        a: 'Carretera de Aldeadávila 39',
        p: 'El mejor valorado del pueblo en Gastroranking: 7,8 sobre 10 con unas 650 opiniones.',
        s: 'Gastroranking, oct. 2026'
      },
      {
        n: 'Rinconada de las Arribes',
        a: 'Calle Joaquín González, 6',
        p: 'Otro de los mejor valorados del pueblo en Gastroranking: 7,7 sobre 10 con unas 220 opiniones.',
        s: 'Gastroranking, oct. 2026'
      }
    ]
  },
  'Montemayor del Río': {
    foto: [
      'img/pueblo-montemayor.jpg',
      'Calle de Montemayor del Río. Foto: Jesusccastillo · CC BY-SA 4.0 · Wikimedia Commons'
    ],
    cur: [
      'Su puente de piedra, de un solo ojo, se hizo hacia 1700 sobre el río Cuerpo de Hombre; era del marqués y se pagaba portazgo.',
      'Es conjunto histórico desde 1982.'
    ],
    mon: {
      n: 'Castillo de San Vicente',
      tipo: 'torre',
      datos: [
        ['Torres', '6 (4 cuadradas y 2 semicirculares)'],
        ['Dónde', 'en lo alto de la colina']
      ]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Montemayor_del_Río']]
  },
  'Linares de Riofrío': {
    foto: [
      'img/pueblo-linares.jpg',
      'Linares de Riofrío. Foto: Mikelzubi · CC BY-SA 3.0 · Wikimedia Commons'
    ],
    cur: [
      'En 1959 todavía funcionaban 15 hornos de cal.',
      'En 1248 desapareció el concejo de Monleón y Linares pasó al de Salamanca.',
      'En su término se han encontrado seis lagares excavados en la roca.'
    ],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Linares_de_Riofrío']],
    comer: [
      {
        n: 'Restaurante España',
        a: 'Calle de Juan Carlos I',
        p: 'El mejor valorado del pueblo en Gastroranking: 8,2 sobre 10 con unas 540 opiniones.',
        s: 'Gastroranking, oct. 2026'
      }
    ]
  },
  Macotera: {
    foto: [
      'img/pueblo-macotera.jpg',
      'Ayuntamiento y museo de las llanuras y campiñas. Foto: Macotera Nieto · CC BY-SA 4.0 · Wikimedia Commons'
    ],
    cur: [
      'Isabel II le dio el título de villa el 10 de agosto de 1861.',
      'En 2001 recuperó el encierro a caballo, que no se celebraba desde 1951.',
      'El 27 de diciembre es el Día de los Quintos.'
    ],
    mon: {
      n: 'Iglesia de Nuestra Señora del Castillo',
      tipo: 'iglesia',
      epoca: '1475–1508',
      estilo: 'Hispano-flamenco',
      datos: [['Planta', 'de salón, con tres naves']]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Macotera']]
  },
  'El Cabaco': {
    cur: [
      'En su término está la Peña de Francia, a 1.727 m.',
      'Las Cavenes son grandes zanjas de minas romanas a cielo abierto, zona arqueológica protegida desde 2006.',
      'Antes se escribía El Cavaco, que se relaciona con «sitio donde se ha cavado».'
    ],
    mon: {
      n: 'Santuario de la Peña de Francia',
      tipo: 'iglesia',
      datos: [
        ['Altitud', '1.727 m'],
        ['Bien de Interés Cultural', '1956']
      ]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/El_Cabaco']],
    comer: [
      {
        n: 'Restaurante El Final',
        a: 'Carretera Peña de Francia',
        p: 'El mejor valorado del pueblo en Gastroranking: 8,1 sobre 10 con unas 570 opiniones. Precio medio: 20 a 30 €.',
        s: 'Gastroranking, oct. 2026'
      },
      {
        n: 'Mesón Río Almar',
        a: 'Carretera Tamames 6',
        p: 'Otro de los mejor valorados del pueblo en Gastroranking: 7,5 sobre 10 con unas 830 opiniones. Precio medio: 20 a 30 €.',
        s: 'Gastroranking, oct. 2026'
      }
    ]
  },
  'Villar de la Yegua': {
    foto: [
      'img/pueblo-villaryegua.jpg',
      'Grabados de Siega Verde. Foto: Vanbasten 23 · CC0 · Wikimedia Commons'
    ],
    cur: [
      'En su término está Siega Verde: más de 500 grabados del Paleolítico en 96 paneles a lo largo de un kilómetro del río Águeda. Los descubrió Manuel Santonja el 17 de octubre de 1988.',
      'En 1640, en la guerra con Portugal, se libró aquí la batalla de Villar de la Yegua.',
      'Su nombre aparece escrito por primera vez en 1376.'
    ],
    mon: {
      n: 'Siega Verde',
      tipo: 'roca',
      epoca: 'Paleolítico superior (hace 20.000–9.000 años)',
      datos: [
        ['Grabados', 'más de 500'],
        ['Paneles', '96'],
        ['Patrimonio de la Humanidad', 'con el valle del Côa']
      ]
    },
    fuente: [
      ['Wikipedia', 'https://es.wikipedia.org/wiki/Villar_de_la_Yegua'],
      ['Wikipedia', 'https://es.wikipedia.org/wiki/Siega_Verde']
    ]
  },
  'Hinojosa de Duero': {
    cur: [
      'Forma parte del Parque Natural de Arribes del Duero, declarado en 2002.',
      'Hay restos vetones en los castros de Moncalvo y de la Escala.',
      'Sus fiestas, con toros, son por San Juan, el 24 de junio.'
    ],
    mon: {
      n: 'Ermita del Santísimo Cristo de la Misericordia',
      tipo: 'iglesia',
      epoca: 'Siglo XIII',
      datos: [
        ['Romería', 'último domingo de abril'],
        ['Es también', 'un mirador']
      ]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Hinojosa_de_Duero']]
  },
  'San Felices de los Gallegos': {
    cur: [
      'Su castillo lo mandó levantar en 1296 el rey Dionisio I de Portugal.',
      'Con el Tratado de Alcañices (1297) pasó a Portugal, y en 1326 volvió a León.'
    ],
    mon: {
      n: 'Castillo',
      tipo: 'torre',
      epoca: 'Finales del siglo XIII y principios del XIV',
      datos: [['Torre del homenaje', 'hoy centro de interpretación']]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/San_Felices_de_los_Gallegos']],
    comer: [
      {
        n: 'Mesa Del Conde',
        a: 'Calle Lavaderos, 18',
        p: 'El mejor valorado del pueblo en Gastroranking: 7,5 sobre 10 con unas 460 opiniones.',
        s: 'Gastroranking, oct. 2026'
      }
    ]
  },
  Sotoserrano: {
    foto: [
      'img/pueblo-sotoserrano.jpg',
      'Sotoserrano entre sus huertas. Foto: Sotos · CC BY-SA 3.0 · Wikimedia Commons'
    ],
    cur: [
      'El río Alagón forma aquí el meandro del Melero, entre Salamanca y Cáceres.',
      'Un documento de 1289 muestra a judíos de Miranda prestando dinero a vecinos del pueblo.'
    ],
    mon: {
      n: 'Iglesia de Nuestra Señora de la Asunción',
      tipo: 'iglesia',
      estilo: 'Románico',
      datos: [['Junto a', 'la plaza del Castillo y su torre del reloj']]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Sotoserrano']]
  },
  Saucelle: {
    cur: [
      'Su presa sobre el Duero se hizo entre 1950 y 1956.',
      'El poblado que se levantó para los trabajadores quedó abandonado y hoy es un complejo turístico.',
      'Desde 2017 tiene la ruta de las Lavanderas, que acaba en el antiguo lavadero, hoy jardín botánico.'
    ],
    mon: {
      n: 'Presa de Saucelle',
      tipo: 'presa',
      epoca: '1950–1956',
      datos: [['Inauguración', '29 de septiembre de 1956']]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Saucelle']]
  },
  Mieza: {
    cur: [
      'En las Cortes de Burgos de 1315 aparece como aldea del concejo de Ledesma.',
      'Entre 2000 y 2018 perdió 146 vecinos, el 42 %.'
    ],
    mon: {
      n: 'Iglesia de San Sebastián',
      tipo: 'iglesia',
      datos: [
        ['Dónde', 'en la plaza mayor'],
        ['Fiesta', '20 de enero']
      ]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Mieza_(Salamanca)']]
  },
  'Villarino de los Aires': {
    cur: [
      'La filoxera arrasó sus viñas hacia 1890 y muchos vecinos emigraron a Cuba; en 1919 fundaron en La Habana el Club Villarino, que todavía existe.',
      'La canción del «burro de Villarino» (para ellos, el burro del tío Silguero) se compuso en habla riberana; el burro tiene una escultura de granito frente a las escuelas.',
      'Cuentan que, contra una plaga de pulgones, metieron 60 nombres de santos en un sombrero y salió tres veces San Juan de Sahagún. Su hoguera se enciende el 11 de junio.'
    ],
    mon: {
      n: 'Iglesia de Santa María la Mayor',
      tipo: 'iglesia',
      datos: [
        ['Dentro', 'un corazón de 2 m cubierto de armas'],
        ['Las armas', 'las entregaron los mozos hacia 1896']
      ]
    },
    fuente: [
      ['Wikipedia', 'https://es.wikipedia.org/wiki/Villarino_de_los_Aires'],
      [
        'Turismo de Castilla y León',
        'https://www.turismocastillayleon.com/es/patrimonio-cultura/ruta-duero/villarino-aires'
      ]
    ]
  },
  Lumbrales: {
    foto: [
      'img/pueblo-lumbrales.jpg',
      'Plaza de Lumbrales. Foto: Emilio del Prado · CC BY 2.0 · Wikimedia Commons'
    ],
    cur: [
      'Aparece por primera vez en 1175, como Santa María de Liminares, en el documento con el que Fernando II de León restauró la diócesis de Ciudad Rodrigo.',
      'En 1647, durante la guerra de independencia de Portugal, lo incendió el gobernador portugués de la Beira.',
      'El tren llegó el 25 de julio de 1887 con la línea de La Fuente de San Esteban a Barca de Alba, cerrada en 1985 y Bien de Interés Cultural desde 2000.'
    ],
    mon: {
      n: 'Castro de Las Merchanas',
      tipo: 'roca',
      epoca: 'Siglo II a. C. – siglo V',
      estilo: 'Castro vetón',
      datos: [
        ['Extensión', '8,5 hectáreas, en un meandro del Camaces'],
        ['Monumento', 'desde el 3 de junio de 1931'],
        ['Acceso', 'al aire libre, en una finca particular']
      ]
    },
    fuente: [
      ['Wikipedia', 'https://es.wikipedia.org/wiki/Lumbrales'],
      ['Wikipedia (Castro de Las Merchanas)', 'https://es.wikipedia.org/wiki/Castro_de_Las_Merchanas'],
      [
        'Wikipedia (línea La Fuente de San Esteban-Barca de Alba)',
        'https://es.wikipedia.org/wiki/L%C3%ADnea_La_Fuente_de_San_Esteban-Barca_de_Alba'
      ],
      [
        'Turismo de Castilla y León (Las Merchanas)',
        'https://www.turismocastillayleon.com/es/patrimonio-cultura/despoblado-castro-merchanas'
      ]
    ],
    comer: [
      {
        n: 'Restaurante El Rincón Charro',
        a: 'Plaza San Sebastián, 6',
        p: 'El mejor valorado del pueblo en Gastroranking: 7,9 sobre 10 con unas 1.000 opiniones.',
        s: 'Gastroranking, oct. 2026'
      }
    ]
  },
  'Pereña de la Ribera': {
    foto: [
      'img/pueblo-perena.jpg',
      'El Duero desde Pereña de la Ribera. Foto: MaGrc · CC BY-SA 4.0 · Wikimedia Commons'
    ],
    cur: [
      'El 14 de mayo de 1721 se rompió una piedra hallada junto a la Virgen del Castillo, usada a veces de peana, y apareció una tablilla con su figura: la Virgen Chica.',
      'En el Pozo Airón, en el arroyo de los Cuernos, una cueva deja pasar por detrás de la cascada. El camino sale del arco de la plaza.',
      'La fábrica de quesos se trasladó a Vitigudino, pero el queso sigue llevando el nombre de Pereña.'
    ],
    mon: {
      n: 'Iglesia de Santa María',
      tipo: 'iglesia',
      epoca: 'Siglo XVI',
      datos: [
        ['Obra central', 'Pedro de Lanestosa «el Viejo»'],
        ['Torre', 'un castillo medieval reaprovechado'],
        ['Rayo', '24 de mayo de 2009']
      ]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Pere%C3%B1a_de_la_Ribera']]
  },
  Masueco: {
    cur: [
      'Unamuno escribió en 1898 sobre el negrillo (un olmo) que crecía junto a la iglesia, «el primero de España» en corpulencia según el tío Mateo de su relato.',
      'Su seminario, fundado en 1692 por Martín Cubilano, catedrático de Humanidades en Salamanca, fue el centro de estudios más importante de la comarca. Queda la fachada.',
      'La grieta entre la torre y la nave de la iglesia se achacó durante años al terremoto de Lisboa de 1755, pero su origen es incierto.'
    ],
    mon: {
      n: 'Iglesia de San Nicolás de Bari',
      tipo: 'iglesia',
      estilo: 'Gótico isabelino',
      datos: [
        ['Obra de', 'la familia de canteros Lanestosa'],
        ['Torre', 'quizá de un antiguo castillo']
      ]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Masueco']]
  },
  'Fuentes de Oñoro': {
    foto: [
      'img/pueblo-fuentes.jpg',
      'Estación de Fuentes de Oñoro. Foto: Antero Pires · CC BY-SA 2.0 · Wikimedia Commons'
    ],
    cur: [
      'Del 3 al 5 de mayo de 1811, Wellington frenó aquí al mariscal Masséna, que intentaba socorrer a la guarnición francesa cercada en Almeida.',
      'El 3 de mayo de 1811, con la iglesia en llamas, el párroco Luis Silva cruzó entre los disparos para salvar el copón; lo recuerda el escudo del pueblo.',
      'La estación abrió el 25 de mayo de 1886 y a su lado nació la Colonia de la Estación. En 2018 el pueblo viejo tenía 215 vecinos; la Colonia, 385, y Nuevo Poblado, 588.'
    ],
    fuente: [
      ['Wikipedia', 'https://es.wikipedia.org/wiki/Fuentes_de_O%C3%B1oro'],
      ['Wikipedia (batalla)', 'https://es.wikipedia.org/wiki/Batalla_de_Fuentes_de_O%C3%B1oro'],
      ['Wikipedia (estación)', 'https://es.wikipedia.org/wiki/Estaci%C3%B3n_de_Fuentes_de_O%C3%B1oro'],
      ['Ayuntamiento de Fuentes de Oñoro', 'https://fuentesdeonoro.es/batalla-de-fuentes-de-onoro/']
    ],
    comer: [
      {
        n: 'Cafetería Javi Grupo Gildo',
        a: 'Avenida Europa, 49',
        p: 'El mejor valorado del pueblo en Gastroranking: 8,3 sobre 10 con unas 760 opiniones.',
        s: 'Gastroranking, oct. 2026'
      },
      {
        n: 'La Pedresina',
        a: 'Carretera N-620',
        p: 'Área de servicio junto a la frontera: 7,7 sobre 10 en Gastroranking con unas 5.500 opiniones.',
        s: 'Gastroranking, oct. 2026'
      }
    ]
  },
  'La Fuente de San Esteban': {
    cur: [
      'Su estación abrió en 1886 y desde 1887 fue nudo ferroviario: de aquí salía la línea a Barca de Alba, camino de Oporto, cerrada en 1985.',
      'El Surexpreso, el tren París–Lisboa, paraba aquí: hacía el viaje por Salamanca, sin pasar por Madrid.',
      'El actor Santiago Ramos, Goya al mejor actor por Como un relámpago (1996), nació en 1949 en Boadilla, una de sus pedanías.'
    ],
    mon: {
      n: 'Iglesia parroquial de San Esteban',
      tipo: 'iglesia',
      datos: [
        ['Dentro', 'un Cristo del siglo XVIII'],
        ['Febrero de 2026', 'las lluvias hundieron una bóveda lateral']
      ]
    },
    fuente: [
      ['Wikipedia', 'https://es.wikipedia.org/wiki/La_Fuente_de_San_Esteban'],
      [
        'Wikipedia (estación)',
        'https://es.wikipedia.org/wiki/Estaci%C3%B3n_de_La_Fuente_de_San_Esteban-Boadilla'
      ],
      ['Wikipedia (Santiago Ramos)', 'https://es.wikipedia.org/wiki/Santiago_Ramos'],
      [
        'SALAMANCArtv AL DÍA (4/2/2026)',
        'https://salamancartvaldia.es/noticia/2026-02-04-las-intensas-lluvias-provocan-el-derrumbe-de-una-boveda-en-la-iglesia-de-la-fuente-de-san-esteban-385037'
      ],
      [
        'La Gaceta de Salamanca (4/2/2026)',
        'https://www.lagacetadesalamanca.es/provincia/derrumbe-iglesia-fuente-san-esteban-causa-lluvias-20260204140522-nt.html'
      ]
    ],
    comer: [
      {
        n: 'Vegallana',
        a: 'Carretera N-620, km 289',
        p: 'El mejor valorado del pueblo en Gastroranking: 7,0 sobre 10 con unas 720 opiniones.',
        s: 'Gastroranking, oct. 2026'
      }
    ]
  },
  Arapiles: {
    cur: [
      'El 22 de julio de 1812, en sus cerros, Wellington venció a Marmont: unas 12.500 bajas francesas, prisioneros incluidos, frente a 5.220 aliadas.',
      'Los británicos y portugueses la llaman batalla de Salamanca. Tras ella Wellington entró en Madrid el 12 de agosto de 1812.',
      'Galdós cerró con «La batalla de los Arapiles» (1875) la primera serie de los Episodios Nacionales.'
    ],
    mon: {
      n: 'Aula de Interpretación de la Batalla de Arapiles',
      tipo: 'museo',
      datos: [
        ['Maqueta', 'más de 5 m, con 5.200 figuras'],
        ['Dirección', 'calle Salas Pombo, 20']
      ]
    },
    fuente: [
      ['Wikipedia', 'https://es.wikipedia.org/wiki/Arapiles'],
      ['Wikipedia (batalla)', 'https://es.wikipedia.org/wiki/Batalla_de_los_Arapiles'],
      ['Wikipedia (novela)', 'https://es.wikipedia.org/wiki/La_batalla_de_los_Arapiles'],
      [
        'Turismo de Castilla y León',
        'https://www.turismocastillayleon.com/es/patrimonio-cultura/aula-interpretacion-batalla-arapiles'
      ]
    ]
  },
  Tamames: {
    cur: [
      'En octubre de 1809 el duque del Parque derrotó aquí al general francés Marchand: unas 1.500 bajas francesas frente a 700 españolas, y les tomaron un águila.',
      'En 1811 los lanceros de Julián Sánchez «El Charro» asaltaron un convoy francés en el término; en represalia, los franceses saquearon e incendiaron el pueblo.',
      'En la fiesta de los cencerros, a finales de enero, los niños recorren el pueblo de madrugada tocando cencerros para despertar a los vecinos.'
    ],
    mon: {
      n: 'Iglesia de Nuestra Señora de la Asunción',
      tipo: 'iglesia',
      epoca: 'Siglos XV–XVI',
      datos: [
        ['Capilla mayor', 'Gil de Hontañón'],
        ['Torre', 'siglo XV, lo más antiguo'],
        ['1710', 'destruida en buena parte en la Guerra de Sucesión']
      ]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Tamames']],
    comer: [
      {
        n: 'Bar Restaurante El Casino',
        a: 'Plaza de la Iglesia, 7',
        p: 'El mejor valorado del pueblo en Gastroranking: 8,4 sobre 10 con unas 400 opiniones.',
        s: 'Gastroranking, oct. 2026'
      },
      {
        n: 'Restaurante la Bombilla',
        a: 'Avenida Abusejo, 7',
        p: 'El segundo del pueblo en Gastroranking: 7,1 sobre 10 con unas 575 opiniones.',
        s: 'Gastroranking, oct. 2026'
      }
    ]
  },
  Villoria: {
    foto: [
      'img/pueblo-villoria.jpg',
      'Ayuntamiento de Villoria. Foto: Villavillavilla123456 · CC BY-SA 4.0 · Wikimedia Commons'
    ],
    cur: [
      'Fue cabeza del cuarto de Villoria, una de las divisiones de la tierra de Salamanca en el Reino de León.',
      'Al oeste del pueblo hay una villa romana, Bien de Interés Cultural desde el 23 de diciembre de 1992.',
      'El Club de Pelota Las Villas nació en 1993 junto con el Centro de Tecnificación de pelota de Castilla y León.'
    ],
    mon: {
      n: 'Iglesia de San Pedro',
      tipo: 'iglesia',
      epoca: 'Primera mitad del siglo XIII; naves laterales del XVI',
      estilo: 'Románico-mudéjar',
      datos: [
        ['Ábside', 'semicircular, con ocho arcos ciegos'],
        ['Cristo', 'del siglo XIV']
      ]
    },
    fuente: [
      ['Wikipedia', 'https://es.wikipedia.org/wiki/Villoria_(Salamanca)'],
      [
        'Turismo de Castilla y León',
        'https://www.turismocastillayleon.com/es/patrimonio-cultura/iglesias-ermitas/iglesia-parroquial-san-pedro-villoria'
      ]
    ]
  },
  Babilafuente: {
    foto: [
      'img/pueblo-babilafuente.jpg',
      'Plaza Mayor, ayuntamiento e iglesia. Foto: Malopez 21 · CC BY-SA 4.0 · Wikimedia Commons'
    ],
    cur: [
      'Aparece por primera vez el 3 de mayo de 1215, cuando Sancha Gómez vendió la heredad de «Vaguilafointe» al deán de Salamanca.',
      'En 1752 Torres Villarroel escribió sobre las virtudes del agua de su fuente, rica en litina; en 1955 se declaró de utilidad pública.',
      'El 21 de junio de 1812, en la retirada de Marmont, los franceses incendiaron el pueblo y dañaron la iglesia.'
    ],
    fuente: [
      ['Wikipedia', 'https://es.wikipedia.org/wiki/Babilafuente'],
      ['Flags of the World', 'https://crwflags.com/FOTW/flags/es-sa-bb.html']
    ]
  },
  Cantalapiedra: {
    foto: [
      'img/pueblo-cantalapiedra.jpg',
      'Ayuntamiento de Cantalapiedra. Foto: Cruccone · CC BY 3.0 · Wikimedia Commons'
    ],
    cur: [
      'En 1136 el rey la donó al obispo de Salamanca. Los documentos la llaman Campum de Petra (1136) y Candelapiedra (1251) antes de Cantalapiedra (1265).',
      'De su muralla, levantada en la frontera entre León y Castilla, solo queda el Torreón del Deán, que debe el nombre a los deanes de la catedral de Salamanca.',
      'En 1877 abrió su estación, en la línea de tren de Salamanca a Medina del Campo.'
    ],
    mon: {
      n: 'Iglesia de Santa María del Castillo',
      tipo: 'iglesia',
      epoca: 'Finales del siglo XIV o principios del XV, sobre una románica',
      estilo: 'Gótico y mudéjar',
      datos: [
        ['Naves', 'tres, con arcos apuntados de ladrillo'],
        ['Espadaña', 'siglo XVIII'],
        ['Monumento nacional', '1931']
      ]
    },
    fuente: [
      ['Wikipedia', 'https://es.wikipedia.org/wiki/Cantalapiedra'],
      [
        'Turismo de Castilla y León',
        'https://www.turismocastillayleon.com/es/patrimonio-cultura/iglesias-ermitas/iglesia-santa-maria-castillo-cantalapiedra'
      ]
    ]
  },
  Terradillos: {
    foto: [
      'img/pueblo-terradillos.jpg',
      'Vista de Terradillos. Foto: Malopez 21 · CC BY-SA 4.0 · Wikimedia Commons'
    ],
    cur: [
      'En la urbanización El Encinar vive cerca del 85 % del municipio: pasó de unos 750 habitantes en 1986 a unos 3.500 en 2006.',
      'En los años noventa llamaban a El Encinar «la cuna de Salamanca» por los muchos niños que nacían allí.',
      'En la batalla de los Arapiles hubo tropas francesas en lo que hoy es El Encinar y Los Cisnes; cerca queda un paraje llamado «Cementerio de los franceses».'
    ],
    mon: {
      n: 'Dolmen de Piedras Hitas',
      tipo: 'roca',
      datos: [
        ['Dónde', 'a unos 900 m al suroeste del pueblo'],
        ['Paraje', 'La Torrecilla']
      ]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Terradillos']]
  },
  Almendra: {
    cur: [
      'En 1462 la Villa y Tierra de Ledesma, a la que pertenecía, se dio como condado a Beltrán de la Cueva y dejó de ser realengo.',
      'Su iglesia de San Miguel Arcángel se levantó entre finales del siglo XVII y comienzos del XVIII.',
      'Según la tradición, un terrateniente repartió su hacienda entre dos hijos; por eso el pueblo tiene dos pendones, que se guardan en la iglesia.'
    ],
    mon: {
      n: 'Iglesia de San Miguel Arcángel',
      tipo: 'iglesia',
      epoca: 'Finales del siglo XVII – comienzos del XVIII',
      datos: [['Guarda', 'los dos pendones del pueblo']]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Almendra_(Salamanca)']]
  },
  Trabanca: {
    cur: [
      'En 1941 los vecinos compraron las tierras del marqués del Castelar.',
      'Es la sede de la Agrupación Europea de Cooperación Territorial Duero-Douro, que une a pueblos de los dos lados de la raya.',
      'En el centro del pueblo se conserva una fragua de piedra y vigas de madera de más de doscientos años.'
    ],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Trabanca']]
  },
  Vilvestre: {
    cur: [
      'En 1192 Alfonso IX de León donó Vilvestre y su término al arzobispado de Santiago.',
      'Se fortificó entre la segunda mitad del siglo XII y comienzos del XIII para defender la frontera con Portugal. Su castillo quedó en ruinas en la guerra de Restauración portuguesa (1640–1668).',
      'Celebra a la Virgen del Castillo el 17 de mayo y sus fiestas de toros el penúltimo fin de semana de agosto.'
    ],
    mon: {
      n: 'Iglesia de Nuestra Señora de la Asunción',
      tipo: 'iglesia',
      epoca: 'Empezada en el siglo XVI',
      estilo: 'Gótico y renacentista',
      datos: [['Destaca', 'su retablo']]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Vilvestre']]
  },
  'La Fregeneda': {
    cur: [
      'El Tratado de Alcañices, de 1297, llevó la raya al Águeda y convirtió en frontera el paso entre La Fregeneda y Barca de Alba.',
      'En 1811, en la Guerra de la Independencia, Wellington puso aquí su cuartel.',
      'El tren de La Fuente de San Esteban a Barca de Alba abrió en 1887 y cerró en 1985. Para cruzar los arribes del Águeda hicieron falta 20 túneles y 12 puentes; desde 2019 se puede recorrer a pie: es el Camino de Hierro.'
    ],
    mon: {
      n: 'Iglesia parroquial',
      tipo: 'iglesia',
      epoca: 'Siglos XVI–XVIII',
      estilo: 'Gótico y barroco',
      datos: [['Retablo mayor', 'del siglo XVII, dedicado a san Marcos']]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/La_Fregeneda']]
  },
  Ledrada: {
    cur: [
      'Desde 1209 forma parte de la Comunidad de Villa y Tierra de Béjar.',
      'En 1234 su beneficiado fue uno de los fundadores del «Cabildo de Clérigos del quarto de arriba de la tierra de Bexar».',
      'Estuvo ligada a los Stúñiga, duques de Béjar, hasta 1833, cuando pasó a la provincia de Salamanca.'
    ],
    mon: {
      n: 'Iglesia de San Miguel Arcángel',
      tipo: 'iglesia',
      estilo: 'Románico',
      datos: []
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Ledrada']]
  },
  Monleón: {
    foto: [
      'img/pueblo-monleon.jpg',
      'Castillo de Monleón. Foto: Hovallef · CC BY-SA 4.0 · Wikimedia Commons'
    ],
    cur: [
      'En 1199 Alfonso IX lo hizo villa con concejo propio; en 1248 Fernando III se lo quitó y lo sumó al de Salamanca.',
      'Estuvo amurallado desde su repoblación, a finales del siglo XII, y aún quedan restos de la muralla.',
      'En 1330 sus vecinos se quejaron a Alfonso XI de que Salamanca no respetaba el fuero que les habían dado al repoblarlo.'
    ],
    mon: {
      n: 'Castillo de Monleón',
      tipo: 'torre',
      epoca: 'Siglo XV, sobre una fortaleza del XII',
      datos: [
        ['Torre', '37 m, cinco plantas'],
        ['Hoy', 'privado y restaurado']
      ]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Monle%C3%B3n']]
  },
  'Puente del Congosto': {
    foto: [
      'img/pueblo-congosto.jpg',
      'Castillo y puente viejo de Puente del Congosto. Foto: David Perez · CC BY 3.0 · Wikimedia Commons'
    ],
    cur: [
      'Enrique III lo donó a Gil González Dávila el 2 de noviembre de 1393.',
      'Isabel la Católica estaba en su castillo en 1497 cuando le llegó la noticia de la muerte de su hijo.',
      'Su puente sobre el Tormes es probablemente de los siglos XII o XIII y guardaba el camino de Ávila a Ciudad Rodrigo. En 1809 las tropas francesas ocuparon el castillo durante dos años.'
    ],
    mon: {
      n: 'Iglesia de Nuestra Señora de la Asunción',
      tipo: 'iglesia',
      epoca: 'Siglo XVI',
      estilo: 'Gótico',
      datos: [['Naves', 'tres']]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Puente_del_Congosto']]
  }
};
