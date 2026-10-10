// Fichas de pueblos de la provincia: { 'Nombre del municipio' (igual que en PROVINCIA): {
//   cur: [curiosidades], mon: monumento o lugar principal { n, tipo (pictograma), epoca, estilo, datos },
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
  }
};
