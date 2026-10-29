// Fichas de pueblos de la provincia: { 'Nombre del municipio' (igual que en PROVINCIA): {
//   cur: [curiosidades], mon: monumento o lugar principal { n, tipo (pictograma), epoca, estilo, datos },
//   foto (opcional): [ruta, pie con «Foto: autor · licencia»] de Wikimedia Commons,
//   comer: [{ n, a, p, s }], fuente: [[nombre, url]] } }. Todo con fuente verificable.
// Los habitantes salen de habitantes.js (INE), para todos los municipios.
export const PUEBLOS = {
  'Ciudad Rodrigo': {
    cur: [
      'Su Carnaval del Toro tiene documentos desde 1417: ya entonces se corrían toros.',
      'Las murallas, empezadas por Fernando II de León en el siglo XII, miden más de dos kilómetros y conservan seis puertas.',
      'Wellington la tomó a los franceses la noche del 19 de enero de 1812, y por ello recibió el título de duque de Ciudad Rodrigo.',
      'En 1475 los Reyes Católicos le concedieron un mercado franco cada semana, para compensar los continuos asedios de la frontera. Desde 1990 lo recuerda el Martes Mayor.',
      'En 1810 aguantó veinticuatro días el sitio de los franceses, y con ello retrasó un mes la invasión de Portugal que dirigía Masséna.'
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
      'El día después del 15 de agosto se representa La Loa, una comedia popular que mezcla lo religioso y lo profano.',
      'Cuenta la tradición que en el siglo XV las mujeres del pueblo derrotaron a las tropas portuguesas del prior de Crato y les quitaron el pendón, que todavía se guarda en el pueblo.',
      'En 1520, según las crónicas, los vecinos fundieron anillos y joyas de plata para acabar una campana a la que le faltaba metal para las asas.'
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
      'La Puerta de la Traición, en su muralla medieval, está ligada a esa leyenda.',
      'Su plaza de toros de El Castañar, de 1711, se tiene por la más antigua de España de las que se conservan.',
      'Cervantes dedicó la primera parte del Quijote al duque de Béjar, y Góngora dedicó a la misma casa sus Soledades.'
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
      'Su embutido se hizo famoso desde que lo probó Carlos IV tras una cacería. El conjunto histórico es Bien de Interés Cultural desde 1975.',
      'En el traje típico, el serenero de la mujer es de paño verde si está casada y amarillo si es soltera.',
      'Ha sido plató muchas veces: en 1956 Joselito rodó aquí «El pequeño ruiseñor», y es la Calenda de la serie «Luna, el misterio de Calenda».'
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
      'La fortaleza se empezó a levantar a finales del siglo XII por orden de Fernando II de León.',
      'Hacia 1840, en un arrebato liberal, el ayuntamiento tiró al río cuatro verracos de piedra. El que se ve hoy apareció en 1957, al hacer las Escuelas.',
      'Su mercado del Jueves de la Ascensión llegó a ser el mayor comercio de bueyes de España.'
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
      'Su pieza de alfarería más propia es el botijo de filigrana.',
      'El 5 de febrero, por Santa Águeda, las mujeres casadas, «las Águedas», toman la calle en una fiesta que simboliza su rebeldía frente al poder de los hombres.',
      'Según la tradición, las almendras garrapiñadas de Alba las empezaron a hacer las monjas del convento de la Anunciación.'
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
      'La calle Derecha es la espina dorsal del pueblo.',
      'La víspera de las fiestas, el 7 de septiembre, la procesión de los candiles recorre el pueblo detrás del tamborilero, el «bobo de la danza» y la «mocina del ramo». Es Fiesta de Interés Turístico Regional desde 2017.',
      'En 1954 la duquesa de Alba, Cayetana Fitz-James Stuart, donó el castillo a la villa.'
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
      'Está entre los Pueblos Más Bonitos de España desde 2014.',
      'El arabista Miguel Asín Palacios relacionó su nombre con una palabra árabe que viene a significar «plantío». Su escudo, de 1994, lleva un cerezo arrancado.'
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
      'En el castillo está el museo de la reserva de la biosfera, sobre la flora y la fauna de la sierra.',
      'En 1225 Alfonso IX de León lo dio como señorío al obispo de Salamanca.',
      'Una bodega del siglo XVI se ha recuperado como museo del vino. Las fiestas del Socorro son el 20 de noviembre.'
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
      'Calle de Sequeros. Foto: Luis Rogelio HM · CC BY-SA 2.0 · Wikimedia Commons',
      'Desde 1213 fue del alfoz de Miranda del Castañar, que creó Alfonso IX de León.',
      'El camino del Asentadero y el Bosque de los Espejos, de unos 9 km, lo une con San Martín del Castañar y Las Casas del Conde, con obras de arte por el camino.'
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
    foto: [
      'img/pueblo-guijuelo.jpg',
      'El Torreón, ábside de una antigua iglesia gótica. Foto: Estevoaei · CC BY-SA 4.0 · Wikimedia Commons'
    ],
    cur: [
      'El jamón y los embutidos dan trabajo a unas 2.500 personas en 173 empresas: el 65 % de la población activa.',
      'El tren llegó en 1896 y pasó por el pueblo hasta mediados de los ochenta.',
      'En 1920 fue el primer pueblo de la provincia con alcantarillado.',
      'En 1909 estrenó a la vez el edificio del Reloj, sede del ayuntamiento, y la plaza de toros, y ese mismo año Alfonso XIII le dio el título de villa.',
      'Su escudo, de 1958, lleva tres abejas de oro, cuatro ramos de encina y una iglesia arruinada.'
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
      'Sus tres plazas porticadas son conjunto histórico-artístico desde 1973.',
      'Según una leyenda, Santa Teresa pidió agua en la villa y se la negaron; sacudió su alpargata y anunció que la iglesia de San Miguel sería destruida tres veces.',
      'El mercadillo de los jueves viene de 1375, cuando Juan I le concedió mercado semanal. Hasta el siglo XV se llamaba Peñaranda de Cantaracillo.'
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
      'Torre de la iglesia de San Nicolás de Bari. Foto: Rastrojo · CC BY-SA 4.0 · Wikimedia Commons',
      'Su nombre vendría de Alvito Godino, un hombre de la corte de Ramiro II de León en el siglo X.',
      'Aquí nació Nicolás de Ribera «el Mozo», tesorero de Pizarro en la conquista del Perú. Por la Virgen del Socorro, el 15 de agosto, hay feria, y el 16 mercado de ganado.'
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
      'En la presa se rodó Doctor Zhivago (1965), y en las galerías de la central, La cabina (1972).',
      'Desde las visitas de Unamuno, entre 1894 y 1902, se la conoce como «el corazón de Las Arribes».',
      'En 1590, por decreto de Felipe II, se asentaron aquí 23 familias moriscas.',
      'La Bufa de San Antón es la única mascarada de invierno que queda en la provincia.',
      'El convento de La Verde se fundó en 1270. En él se lee: «Entre la vida y la muerte no hay espacio ninguno».',
      'Cuenta la tradición que Santa Marina, perseguida por los musulmanes, pidió a una peña que se abriera para esconderse; allí se levantó después un altar.',
      'Del Picón de Felipe se cuentan dos historias: que un vecino se arrojó desde él por amor a una novia portuguesa, o que quería derribar la roca para cruzar el Duero a Portugal.'
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
      'Es conjunto histórico desde 1982.',
      'Sus banasteros hacían cestos con tiras de castaño: la madera se calentaba en un horno casi siempre bajo tierra y, aún caliente, se hendía en tiras finas, las «verganchas». Madoz cuenta en 1848 que los vendían en Candelario.',
      'El 1 de noviembre es el día de los calbotes, una merienda con castañas asadas; el 17 de enero, San Antón, el del chorizo.'
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
      'Linares de Riofrío. Foto: Mikelzubi · CC BY-SA 3.0 · Wikimedia Commons',
      'Su «cal morena» se usó en la argamasa de la Plaza Mayor de Salamanca.',
      'Cultiva fresas y a principios de junio celebra su fiesta de la fresa.',
      'En tiempos de Madoz tenía cinco molinos harineros. A sus vecinos se les llama linarejos.',
      'Madoz contaba en 1847 casi mil vecinos, cinco molinos de harina y mercado los sábados.',
      'Su Fiesta de la Fresa es normalmente el primer fin de semana de junio.'
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
      'El 27 de diciembre es el Día de los Quintos.',
      'Según la leyenda, los musulmanes mutilaron a la Virgen de la Encina y ella se apareció en una encina; por eso la imagen de hoy es solo un armazón con cabeza y manos.',
      'A su artesonado mudéjar lo llaman «el cielo de Macotera». Bajo las casas hay bodegas excavadas en la arenisca, con un hueco a la calle, la bisnera, para meter la uva.'
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
      'Antes se escribía El Cavaco, que se relaciona con «sitio donde se ha cavado».',
      'Fue de Miranda del Castañar desde 1215 hasta 1811, cuando se abolieron los señoríos.',
      'Su fiesta mayor es el 25 de agosto, por la Degollación de San Juan Bautista; la adelantan desde el 29 para que vaya más gente. Los mozos tienen su fiesta el 26 de diciembre.'
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
      'Sus fiestas, con toros, son por San Juan, el 24 de junio.',
      'Su nombre viene de «Finoiosa», el lugar de los hinojos.',
      'El baile de la bandera recuerda cómo el pueblo se libró de su señorío en el siglo XV; a principios de agosto se celebra la fiesta de El Feudal.',
      'A principios de mayo tiene feria del queso, y el 24 de diciembre los quintos encienden una hoguera.'
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
      'Con el Tratado de Alcañices (1297) pasó a Portugal, y en 1326 volvió a León.',
      'El «noveno» era el impuesto de los duques de Alba: la novena parte de la cosecha. Tras un pleito de 1837 a 1852 los pueblos se lo quitaron, y desde 1864 lo celebran con la fiesta del Noveno, en mayo.',
      'El 15 de marzo de 1809 lo tomaron los franceses y fue su cuartel general en la zona durante unos tres años.'
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
      'Un documento de 1289 muestra a judíos de Miranda prestando dinero a vecinos del pueblo.',
      'Con 508 metros, es el pueblo más bajo de la provincia, y en sus huertas se dan naranjos y cerezos.',
      'En 1927 un incendio quemó todo el archivo del ayuntamiento. El Sábado Santo se cuelga en la plaza el Judas, un muñeco de paja que se quema el Lunes de Pascua.'
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
      'Desde 2017 tiene la ruta de las Lavanderas, que acaba en el antiguo lavadero, hoy jardín botánico.',
      'A finales del siglo XII Alfonso IX la entregó a la Orden de Santiago, y perteneció al obispado de León de Santiago hasta 1873.',
      'En el censo de 1842 aparece como «Sahucelle».',
      'Su iglesia parroquial guarda una Inmaculada de Pedro de Mena.',
      'Por San Lorenzo, su patrón, el 10 de agosto, se baila el paleo.'
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
      'Entre 2000 y 2018 perdió 146 vecinos, el 42 %.',
      'Desde el mirador de la Code se ve el cañón del Duero frente a Portugal. Sus vecinos al otro lado de la raya son Fornos y Mazouco.',
      'Tuvo castillo, como Vilvestre, Barruecopardo y Aldeadávila, para defender la frontera de León frente a Portugal.'
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
      'Estación de Fuentes de Oñoro. Foto: Antero Pires · CC BY-SA 2.0 · Wikimedia Commons',
      'Su escudo, de 1955, lleva una cruz de Santa Bárbara, un león, un castillo por la victoria sobre Napoleón y tres árboles donde, según se cuenta, fusilaron a enemigos.',
      'Es el principal paso fronterizo entre España y Portugal y tuvo una aduana importante.'
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
    foto: [
      'img/pueblo-fuentesanesteban.jpg',
      'Estación de La Fuente de San Esteban-Boadilla. Foto: Rodelar · CC BY-SA 4.0 · Wikimedia Commons'
    ],
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
    foto: [
      'img/pueblo-arapiles.jpg',
      'Monumento a la batalla de los Arapiles. Foto: Mapper59 · CC BY-SA 4.0 · Wikimedia Commons'
    ],
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
    foto: [
      'img/pueblo-tamames.jpg',
      'Iglesia de la Asunción y ayuntamiento. Foto: Coxuxo · CC BY-SA 4.0 · Wikimedia Commons'
    ],
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
      'Ayuntamiento de Villoria. Foto: Villavillavilla123456 · CC BY-SA 4.0 · Wikimedia Commons',
      'Su nombre podría venir del latín «Villa Aurea», villa de oro, o de una propietaria llamada Oria.',
      'En junio de 1812 los franceses le prendieron fuego, según recoge Madoz.',
      'Su iglesia de San Pedro, de los siglos XIII al XV, conserva el ábside románico y es Bien de Interés Cultural desde 1993.'
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
      'Plaza Mayor, ayuntamiento e iglesia. Foto: Malopez 21 · CC BY-SA 4.0 · Wikimedia Commons',
      'En 1523 Carlos V vendió la villa a Alonso de Acevedo y Zúñiga.',
      'Desde 2006 tiene una planta de bioetanol. Celebra San Blas el 3 de febrero, los quintos el 1 de mayo y San Roque el 16 de agosto.'
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
      'Ayuntamiento de Cantalapiedra. Foto: Cruccone · CC BY 3.0 · Wikimedia Commons',
      'Madoz contaba en 1846 ocho fábricas de tinajas.',
      'El monasterio del Sagrado Corazón lo fundó en 1920 la madre Amparo, que había nacido en la villa.'
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
      'En el centro del pueblo se conserva una fragua de piedra y vigas de madera de más de doscientos años.',
      'A la entrada desde Vitigudino tiene un parque de construcciones populares de 10 000 m².',
      'Desde 2015 los vecinos hacen teatro con su propio grupo, TRA-CA.'
    ],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Trabanca']]
  },
  Vilvestre: {
    cur: [
      'En 1192 Alfonso IX de León donó Vilvestre y su término al arzobispado de Santiago.',
      'Se fortificó entre la segunda mitad del siglo XII y comienzos del XIII para defender la frontera con Portugal. Su castillo quedó en ruinas en la guerra de Restauración portuguesa (1640–1668).',
      'Celebra a la Virgen del Castillo el 17 de mayo y sus fiestas de toros el penúltimo fin de semana de agosto.',
      'En 1481 Isabel la Católica mandó ejecutar a Pedro de Miranda, señal de que aquí vivía una comunidad judía importante.',
      'Su escudo lleva un olivo por sus olivares, bandas azules por el Duero y la cruz de Santiago por su pasado compostelano.',
      'En el censo de 1940 aparece como «Silvestre». En 1850 tenía 1.272 habitantes; en 2025, 374.'
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
      'El tren de La Fuente de San Esteban a Barca de Alba abrió en 1887 y cerró en 1985. Para cruzar los arribes del Águeda hicieron falta 20 túneles y 12 puentes; desde 2019 se puede recorrer a pie: es el Camino de Hierro.',
      'En los documentos antiguos aparece como «La Frexeneda», que viene de «La Fresneda», bosque de fresnos.',
      'El muelle de Vega Terrón, a 133 metros, es el punto más bajo de Castilla y León.',
      'En el arroyo de las Almas, junto a la unión del Águeda y el Duero, hay al menos 600 grabados rupestres, algunos del Paleolítico Superior.',
      'Fernando II de León la cedió en el siglo XII a la Orden del Temple. Las tropas portuguesas la saquearon en 1664 y 1707.'
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
      'Estuvo ligada a los Stúñiga, duques de Béjar, hasta 1833, cuando pasó a la provincia de Salamanca.',
      'En 1470 aparece escrito «El Hedrada».',
      'Vive sobre todo de la chacina, y algunos de sus jamones llevan la denominación de Guijuelo. El primer domingo de octubre celebra la boda de la Virgen.',
      'Aquí nació el médico y botánico Vicente Cervantes (1755–1829).'
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
      'Castillo de Monleón. Foto: Hovallef · CC BY-SA 4.0 · Wikimedia Commons',
      'El alcalde Rodrigo Maldonado fue apresado por Fernando el Católico por acuñar moneda sin permiso; su mujer resistió en el castillo hasta rendirse, y se les perdonó la vida.',
      'El romance «Los mozos de Monleón», recogido por Dámaso Ledesma en 1907, lo arregló García Lorca para canto y piano y lo grabó con La Argentinita.',
      'Por San Blas, el 3 de febrero, se bendicen las gargantillas, y por San Jorge, el 23 de abril, el santo sube a las eras a bendecir los campos.'
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
      'Castillo y puente viejo de Puente del Congosto. Foto: David Perez · CC BY 3.0 · Wikimedia Commons',
      'En 1539 Carlos V dio la villa al duque de Alba para ayudar a pagar sus campañas contra los otomanos.',
      'Pedro de la Gasca, que pacificó el Perú para Carlos V, se crio en su castillo; lo recuerda una placa en la muralla.',
      'Su verraco vetón está en la plaza de los Dados, frente al Ayuntamiento. A sus vecinos se les llama chapuceros.'
    ],
    cur: [
      'Enrique III lo donó a Gil González Dávila el 2 de noviembre de 1393.',
      'Según la tradición, Isabel la Católica estaba en su castillo en 1497 cuando supo de la muerte de su hijo; el historiador Carlos Sánchez cree que quienes se alojaron fueron Margarita de Austria y la infanta Isabel.',
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
  },
  Fuenteguinaldo: {
    cur: [
      'Entre noviembre de 1807 y mayo de 1813, en plena Guerra de la Independencia, por sus calles no dejaron de pasar tropas francesas, españolas, portuguesas y británicas.',
      'Wellington tuvo aquí su cuartel general en tres ocasiones. Una placa de bronce de Ricardo Flecha recuerda sus estancias, y un portal señala la casa donde vivió.',
      'En su término está el castro de Irueña, de origen celta y luego romanizado. En las fiestas de agosto se mantiene la vieja costumbre de los toros a caballo, que atrae a jinetes también de Portugal.'
    ],
    mon: {
      n: 'Iglesia parroquial',
      tipo: 'iglesia',
      epoca: 'Siglo XVI',
      datos: [['Retablo', 'de Lucas Mitata, manierismo romanista salmantino']]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Fuenteguinaldo']]
  },
  'Yecla de Yeltes': {
    cur: [
      'A un kilómetro del pueblo está el castro vetón de Yecla la Vieja, que conserva entera su muralla, tres puertas y un campo de piedras hincadas para frenar a los atacantes.',
      'Su escudo, aprobado en 2006, lleva una escena de caza grabada en uno de los sillares del castro.',
      'En el siglo XII se llamaba «Ecla» y a finales del XIII «Ecra»; el nombre de Yecla de Yeltes es oficial desde el 2 de julio de 1916.'
    ],
    mon: {
      n: 'Castro de Yecla la Vieja',
      tipo: 'roca',
      epoca: 'Edad del Hierro, con huellas romanas y visigodas',
      datos: [
        ['Pueblo', 'vetones'],
        ['Dentro', 'la ermita de Nuestra Señora del Castillo']
      ]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Yecla_de_Yeltes']]
  },
  'Villavieja de Yeltes': {
    cur: [
      'El 8 de septiembre de 1650, durante la fiesta de la Virgen de la Peña de Francia, la atacaron tropas portuguesas. Los vecinos que se quedaron resistieron en la iglesia y les causaron más de cien muertos y heridos.',
      'Fue un pueblo de curtidores y zapateros: hacia 1909 había unos 50 talleres de calzado y 18 tenerías.',
      'Se llama a sí misma «Capital de la Charrería». El 27 de agosto, en las fiestas de Nuestra Señora de los Caballeros, se baila el Cordón en la Plaza Mayor.'
    ],
    mon: {
      n: 'Puente de Hierro',
      tipo: 'puente',
      epoca: 'Finales del siglo XIX',
      estilo: 'Viaducto metálico de tipo Eiffel',
      datos: [
        ['Cruza', 'el valle del Yeltes'],
        ['Era de', 'la línea de La Fuente de San Esteban a Pocinho (Portugal)']
      ]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Villavieja_de_Yeltes']]
  },
  Cepeda: {
    cur: [
      'A mediados del siglo XVII se hizo villa independiente pagando 3.500 ducados.',
      'Ya aparece en el «Repertorio de todos los caminos de España» de Juan de Villuga, de 1546.',
      'En San Marcos, el 25 de abril, se recitan «Las Relaciones»: peticiones y agradecimientos en verso. El Sábado Santo los mozos cortan ramas para El Ramo, y cada especie tiene su significado.'
    ],
    mon: {
      n: 'Iglesia parroquial',
      tipo: 'iglesia',
      epoca: 'Siglos XVI–XVIII',
      estilo: 'Sobre todo barroco',
      datos: [['Retablo', 'siglo XVII, de Ambrosio de Villalobos']]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Cepeda_(Salamanca)']]
  },
  Valero: {
    cur: [
      'El 19 de septiembre de 1636 Felipe IV creó el marquesado de Valero para el duque de Béjar, con Valero, El Endrinal, San Miguel, Los Santos, Frades y Tornadizo.',
      'Su piscina natural en el río Quilamas, de 1985, aprovecha la presa de una central eléctrica de 1920 que daba luz también a Frades de la Sierra. Antes se llamaba «Charco el Pozo».',
      'La batalla de Segoyuela, entre don Rodrigo y los musulmanes, está en el origen de la leyenda de la reina Quilama, que da nombre a esta sierra.',
      'Su nombre podría venir de Valerio, dueño de una villa romana. Su patrón es San Valerio, el 29 de enero, y el 2 de febrero celebra las Candelas.'
    ],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Valero_(Salamanca)']]
  },
  'San Esteban de la Sierra': {
    cur: [
      'Los documentos más antiguos, del siglo XV, hablan de una comunidad judía con su propio barrio; entonces el pueblo se llamaba Santisteban.',
      'Su vino, que lleva el nombre de la sierra del Tiriñuelo, ganó la Espiga de Plata en 1997. Los dulces del pueblo son las perronillas y los sacatrapos.',
      'Las fiestas del Cristo, desde el 14 de septiembre, cierran la cosecha y la vendimia. Empiezan con la Quema del Castillo: un mozo trepa por un tronco engrasado hasta el premio, desde hace décadas un jamón.'
    ],
    mon: {
      n: 'Puente sobre el Alagón',
      tipo: 'puente',
      epoca: 'Época románica',
      datos: [
        ['Ojos', '4 (Madoz, 1847)'],
        ['Se le llama', '«puente romano», aunque no lo es']
      ]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/San_Esteban_de_la_Sierra']]
  },
  'Fuenterroble de Salvatierra': {
    cur: [
      'Por el pueblo pasa la Vía de la Plata, que conserva aquí su firme romano en buen estado; a las afueras quedan dos miliarios.',
      'Antes que de peregrinos fue camino de arrieros. Su albergue, junto a la iglesia y llevado por el párroco don Blas Rodríguez, lo ha hecho uno de los grandes sitios del Camino de Santiago del sur, con un museo dedicado a la Vía.',
      'Las casas tradicionales están hechas con pizarra.'
    ],
    mon: {
      n: 'Iglesia de Santa María la Blanca',
      tipo: 'iglesia',
      epoca: 'Siglo XV',
      estilo: 'Gótico',
      datos: [['Retablo', 'atribuido a Churriguera']]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Fuenterroble_de_Salvatierra']]
  },
  'Villanueva del Conde': {
    cur: [
      'Primero se llamó Aldea el Conde; lo de «Villanueva» llegó al hacerse villa, y «del Conde» recuerda a los condes de Miranda.',
      'Sus casas forman un núcleo cerrado, como una muralla, terminado en el siglo XVIII. Dentro quedan las «huertitas», a las que se entra por tres pasadizos bajo las casas y por «callejinas» entre muros de piedra de un metro.',
      'Cada familia tiene su mote: «Lobos», «Quitapenas», «Dientes», «Canala» o «Puñalines». Por el pueblo pasa el Camino de los Prodigios, de unos 11 km con obras de arte, que sale de Miranda del Castañar.'
    ],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Villanueva_del_Conde']]
  },
  'Herguijuela de la Sierra': {
    cur: [
      'Su nombre viene del latín «ecclesiola», iglesita: en 1188 aparece como «Ecclesiola», y nada tiene que ver con Guijuelo.',
      'Ese mismo año de 1188 Alfonso IX de León lo donó al arzobispado de Santiago de Compostela.',
      'Unamuno lo nombra en un poema de su «Cancionero» fechado el 28 de junio de 1928.'
    ],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Herguijuela_de_la_Sierra']]
  },
  Alaraz: {
    cur: [
      'El primer documento que lo nombra es de 1224, cuando se llamaba Santa María del Campo. Su nombre se relaciona con el árabe y querría decir «campo de cultivo».',
      'Carlos V pasó por aquí camino de su retiro de Yuste: lo dice un documento del 8 de noviembre de 1556.',
      'Cerca de la ermita del Cristo aparecieron pizarras visigodas con inscripciones en latín, hoy en el Museo de Salamanca. Es el pueblo del pintor Lorenzo Albarrán (1874–1938), que restauró obras del Palacio Real.'
    ],
    mon: {
      n: 'Iglesia de Nuestra Señora del Castillo',
      tipo: 'iglesia',
      epoca: 'Siglo XVI',
      datos: [
        ['Planta', 'de cruz latina, una nave'],
        ['Crucero', 'terminado en 1555 por Juan Sánchez del Castillo'],
        ['Retablo', 'barroco, dorado en 1704']
      ]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Alaraz']]
  },
  Barruecopardo: {
    cur: [
      'Su nombre junta «barrueco», una roca suelta, con el color pardo del lugar.',
      'En 1157 Fernando II de León creó el señorío de Barruecopardo para Armengol VII, conde de Urgel, según se cuenta como regalo de boda. Desde 1195 fue de la Orden de Santiago.',
      'Las tropas portuguesas lo saquearon en 1644 y lo quemaron en 1653 y 1654. Su mina de wolframio dio mineral en las dos guerras mundiales.'
    ],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Barruecopardo']]
  },
  Monsagro: {
    cur: [
      'En las fachadas de algunas casas se ven fósiles marinos de más de 400 millones de años, del Ordovícico: rastros de trilobites (cruzianas) y galerías de gusanos.',
      'El Museo de los Mares Antiguos enseña fósiles de distintas épocas.',
      'Su escudo lleva dos truchas bajo un sombrero de obispo, porque fue de la jurisdicción y el obispado de Ciudad Rodrigo.'
    ],
    mon: {
      n: 'Museo de los Mares Antiguos',
      tipo: 'museo',
      datos: [['Fósiles', 'de más de 400 millones de años']]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Monsagro']]
  },
  'Calzada de Valdunciel': {
    cur: [
      'Su nombre, «Calçada», viene de la Vía de la Plata, que pasa por el pueblo: junto al arroyo Valdunciel, a unos 14 km de Salamanca, queda un miliario partido.',
      'El pilón de la Fuente Buena, de origen romano, aprovecha una estela de granito de época imperial con una mujer recostada que sostiene un vaso.',
      'Los «pontones» que servían para cruzar el arroyo de la Vega serían, según algunos autores, trozos de miliarios romanos sin inscripción.'
    ],
    mon: {
      n: 'Iglesia de Santa Elena',
      tipo: 'iglesia',
      epoca: 'Sobre todo del siglo XVI',
      datos: [
        ['Retablo', 'siglo XVIII, churrigueresco'],
        ['Antes', 'restos de una iglesia románica del XII']
      ]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Calzada_de_Valdunciel']]
  },
  'Salvatierra de Tormes': {
    cur: [
      'Alfonso IX de León le dio concejo y título de villa en 1203: estaba junto al Tormes, en la raya con Ávila, y se le levantó una fortaleza para defenderla.',
      'Se quedó casi vacía en los años cincuenta y sesenta con el embalse de Santa Teresa, que iba a inundarla; al final el agua no llegó a anegar el pueblo.',
      'Aquí nació en 1879 el médico Filiberto Villalobos, que fue ministro de Instrucción Pública en la Segunda República. Quedan trozos de su muralla medieval y restos de una sinagoga.'
    ],
    mon: {
      n: 'Castillo de la Mora Encantada',
      tipo: 'torre',
      datos: [['Defendía', 'la villa desde el fuero de 1203']]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Salvatierra_de_Tormes']]
  },
  Navasfrías: {
    cur: [
      'Se nombra por primera vez en 1219, en una donación de Alfonso IX de León; en 1226 el rey lo dio a la Orden de Alcántara.',
      'En los ríos Águeda, Roladrón y Rubiós se pueden encontrar pepitas de oro con la batea, y siempre han sido ricos en truchas.',
      'Junto a la ermita del Cristo de la Misericordia, pequeña y gótica, hay un tilo milenario. Por San Juan, el 24 de junio, hay encierros y desencierros a caballo.'
    ],
    mon: {
      n: 'Iglesia de San Juan Evangelista',
      tipo: 'iglesia',
      estilo: 'Románico hispano-portugués',
      datos: [['Visitada', 'en 1499 por frey Nicolás de Ovando']]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Navasfr%C3%ADas']]
  },
  'Aldea del Obispo': {
    cur: [
      'Debe su apellido a Fernando II de León, que en el siglo XII se la dio como señorío al obispo de Ciudad Rodrigo; así siguió hasta el siglo XIX.',
      'Con el Tratado de Alcañices, en 1297, León perdió el Riba-Coa y el pueblo quedó en plena frontera con Portugal.',
      'El Real Fuerte de la Concepción se empezó el 8 de diciembre de 1663, día de la Inmaculada, y de ahí su nombre. El 20 de julio de 1810, ante la invasión de Masséna, los ingleses de Wellington lo volaron. En 2012 se restauró como hotel.'
    ],
    mon: {
      n: 'Real Fuerte de la Concepción',
      tipo: 'torre',
      epoca: '1663; rehecho entre 1736 y 1758',
      estilo: 'Fortaleza abaluartada',
      datos: [
        ['Murallas', 'de más de 51 m de largo y 9,5 m de alto'],
        ['Patio', 'de 50 m de lado']
      ]
    },
    fuente: [
      ['Wikipedia', 'https://es.wikipedia.org/wiki/Aldea_del_Obispo'],
      ['Wikipedia', 'https://es.wikipedia.org/wiki/Real_Fuerte_de_la_Concepción']
    ]
  },
  'Castillejo de Martín Viejo': {
    cur: [
      'Comparte con Villar de la Yegua y Villar de Argañán los grabados de Siega Verde, hechos entre el 20.000 y el 11.000 antes de Cristo.',
      'Fue anejo de la parroquia de Villar del Rey hasta 1718, cuando la Guerra de Sucesión dejó aquel pueblo arrasado y el cura se mudó a Castillejo. Villar del Rey quedó deshabitado del todo el 25 de abril de 1810.',
      'Sus fiestas son San Juan ante Portam Latinam, el 6 de mayo, y la Asunción, el 15 de agosto.'
    ],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Castillejo_de_Martín_Viejo']]
  },
  Cerralbo: {
    cur: [
      'En el siglo XII Fernando II de León lo puso en manos de la Orden del Temple, que lo tuvo hasta que el papa disolvió la orden en 1311.',
      'El señorío de los Pacheco, de 1372, se convirtió en marquesado en 1533 por orden de Carlos I.',
      'En 1920 los vecinos compraron todo el término municipal por 1.250.000 pesetas: hasta entonces las tierras eran de los marqueses de Cerralbo, a los que pagaban renta.'
    ],
    mon: {
      n: 'Castillo',
      tipo: 'torre',
      epoca: 'Siglos XIV–XV',
      datos: [['Lo levantaron', 'los Pacheco, señores y luego marqueses de Cerralbo']]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Cerralbo']]
  },
  Sobradillo: {
    cur: [
      'Su escudo, de 1965, lleva la cruz potenzada negra de los Templarios.',
      'Hacia la Inmaculada, en diciembre, se celebra la capachera: se mueven en círculo capachos ardiendo que iluminan la plaza. Se recuperó en 2019, después de 65 años sin celebrarse.',
      'A mediados del siglo XIX, según Madoz, tenía 200 casas y 1.104 habitantes.'
    ],
    mon: {
      n: 'Torre del Homenaje',
      tipo: 'torre',
      epoca: 'Castillo del siglo XII; la torre se rehízo en el XV',
      datos: [['Escudos', 'de los Rodríguez de Ledesma']]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Sobradillo_(Salamanca)']]
  },
  'El Bodón': {
    cur: [
      'El 25 de septiembre de 1811, en la Guerra de la Independencia, se libró aquí el combate de El Bodón entre los franceses y los aliados de Wellington.',
      'En la lucha, la caballería francesa tomó dos cañones portugueses y el 5.º regimiento de infantería inglés los recuperó cargando contra ella. Al día siguiente Wellington no quiso pelear en Fuenteguinaldo y se retiró a Portugal.',
      'Un monolito recuerda los 200 años del combate. En la repoblación leonesa se llamaba simplemente Bodón y dependía de Ciudad Rodrigo.'
    ],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/El_Bodón']]
  },
  'Puerto de Béjar': {
    cur: [
      'En 1812 los franceses quemaron el pueblo y se llevaron la lámpara de la iglesia porque no les pagaron 14.000 reales.',
      'Para compensarlo, los vecinos entregaron a la Iglesia un castañar de 44 castaños valorado en 6.000 reales, y desde entonces aquel paraje se llama La Lámpara.',
      'Por su término pasa la calzada romana de la Vía de la Plata: en 2001 se excavó su pavimento original, y aún se conserva el miliario CXXXIII.'
    ],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Puerto_de_Béjar']]
  },
  'Cespedosa de Tormes': {
    cur: [
      'La repobló hacia el año 1100 Raimundo de Borgoña, yerno de Alfonso VI. En 1393 Enrique III dio su señorío a Gil González Dávila.',
      'Fue de la provincia de Ávila hasta 1833, y en lo eclesiástico siguió dependiendo de Ávila hasta 1959.',
      'En las fiestas de la Virgen del Carrascal, el 8 de septiembre, se baila la danza de palos.'
    ],
    mon: {
      n: 'Iglesia de la Exaltación de la Santa Cruz',
      tipo: 'iglesia',
      epoca: 'Siglo XV',
      datos: [
        ['Construida', 'en mampostería y granito'],
        ['Torre', 'cuatro campanas, una unida al reloj']
      ]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Cespedosa_de_Tormes']]
  },
  'Santiago de la Puebla': {
    cur: [
      'En su término han aparecido hachas y puntas de flecha de piedra pulimentada que podrían ser de hacia el 3000 antes de Cristo.',
      'En 1279 Alfonso X lo donó a su hija Beatriz, y en 1282 el infante Sancho lo vendió al concejo de Alba de Tormes. En 1304 los de Alba lo saquearon.',
      'Según la leyenda, su patrón, Santiago, había luchado en varias batallas contra los moros. Su fiesta es el 25 de julio, y la de San Jorge, el 23 de abril.'
    ],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Santiago_de_la_Puebla']]
  },
  Galisancho: {
    cur: [
      'Su primera fecha documentada es el 9 de junio de 1220, cuando aparece como «Galinsancho» en un intercambio de bienes entre el obispo de Salamanca y el cabildo de la catedral.',
      'Lo fundaron los repobladores leoneses con el nombre de «Galind Sancholo», en el cuarto de Cantalberque, tierra de Alba de Tormes.',
      'Sus pueblos de colonización, Santa Teresa y Santa Inés, duplicaron la población: en los años noventa llegó a 785 vecinos. Su patrón es San Fernando, el 30 de mayo.'
    ],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Galisancho']]
  },
  Robleda: {
    cur: [
      'Es el único pueblo de la provincia con los nombres de las calles en dos lenguas: leonés y castellano.',
      'Cuando Fernando II de León creó la diócesis de Ciudad Rodrigo, en el siglo XII, se llamaba «Robreda».',
      'A mediados del siglo XIX, según Madoz, tenía 1.388 habitantes. Su escudo lleva cinco piñas verdes y cinco bellotas de oro.'
    ],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Robleda_(Salamanca)']]
  },
  Martiago: {
    cur: [
      'Según el filólogo Antonio Llorente Maldonado, es el único nombre de lugar de la provincia que lleva con seguridad el sufijo celtorromano «-ago».',
      'En 1950, en unas obras de la iglesia, apareció una piedra votiva romana.',
      'En 1848, según Madoz, tenía 180 casas, 793 habitantes y tres molinos harineros.'
    ],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Martiago']]
  },
  Garcibuey: {
    cur: [
      'Cuenta la leyenda que en las Peñas las Palomas hay escondidas dos palomas de oro del tesoro de Muza y Don Rodrigo, y que la Cueva la Mora comunica con el castillo de las Quilamas.',
      'En los años cuarenta los vecinos levantaron con su trabajo el estanque de la Palla, un depósito de riego de 3.000 m³. En los sesenta crearon la cooperativa San Andrés, que hizo y vendió vino durante 25 años.',
      'El 5 de febrero celebra las Águedas, y el 25 de abril va en romería por San Marcos a Cepeda.'
    ],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Garcibuey']]
  },
  'Cereceda de la Sierra': {
    cur: [
      'A sus vecinos los llaman «gatos»: puede venir del dicho «arreguñan las bardas» o de la Peña del Gato, junto a la entrada norte del pueblo.',
      'Su puente Cantería, de piedra y con dos pequeños ojos, puede ser romano o medieval.',
      'Tiene dos patrones, San Pablo, el 15 de enero, y San Marcos, el 25 de abril. En 1847 tenía 58 casas y 210 habitantes.'
    ],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Cereceda_de_la_Sierra']]
  },
  Juzbado: {
    cur: [
      'Un verraco vetón hallado en su término muestra que estaba habitado al menos desde el siglo V antes de Cristo.',
      'Lo fundó Ramiro II de León en el siglo X con el nombre de Iusvado, y en 1173 Fernando II se lo dio al obispo de Salamanca como señorío.',
      'Desde 1985 funciona aquí la fábrica de combustible nuclear de Enusa, que abastece centrales de España y de otros países.'
    ],
    mon: {
      n: 'Museo de la Falla',
      tipo: 'museo',
      epoca: '2013',
      datos: [
        ['Explica', 'una falla de más de 160 km entre España y Portugal'],
        ['Está en', 'una antigua casa tradicional']
      ]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Juzbado']]
  },
  'Almenara de Tormes': {
    cur: [
      'En la cueva de La Mora han aparecido piedras talladas de hace unos 300.000 años.',
      'En 1167 Fernando II se lo dio al obispo de Salamanca. El 26 de agosto de 1315 Alfonso XI mandó derribar su castillo por los males que causaba a la comarca.',
      'Se llama «de Tormes» desde un real decreto del 2 de julio de 1916. En una pared de la iglesia hay agujeros que parecen de bala, de cuando la saquearon los franceses.'
    ],
    mon: {
      n: 'Iglesia de Nuestra Señora de la Asunción',
      tipo: 'iglesia',
      epoca: 'Siglo XII',
      estilo: 'Románico',
      datos: [
        ['Bien de Interés Cultural', '1993'],
        ['Lleva piedras', 'de la desaparecida iglesia de San Salvador']
      ]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Almenara_de_Tormes']]
  },
  'Palencia de Negrilla': {
    cur: [
      'Sus repobladores llegaron de la ciudad de Palencia. El apellido viene de los negrillos, los olmos, que casi desaparecieron con la enfermedad de los años setenta y ochenta.',
      'Según la leyenda, en una peste de la Edad Media los sanos se fueron a Palencia de Negrilla y los enfermos se quedaron en cuarentena en Negrilla de Palencia.',
      'Fue señorío de la catedral, dependiente del obispo de Salamanca.'
    ],
    mon: {
      n: 'Iglesia de la Exaltación de la Santa Cruz',
      tipo: 'iglesia',
      datos: [
        ['Bien de Interés Cultural', 'desde 1969'],
        ['La llaman', 'una de las tres «catedrales» de La Armuña']
      ]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Palencia_de_Negrilla']]
  },
  'Villaverde de Guareña': {
    cur: [
      'En 1480 los Reyes Católicos libraron a sus vecinos de dar soldados y alojar tropas. El privilegio se firmó en Córdoba el 31 de julio de 1482 y se renovaba en cada reinado.',
      'Según la tradición, en el siglo XVI un campesino halló un Cristo enterrado en la alquería de Sordos: los bueyes de Gomecello no lo pudieron mover, pero las vacas flacas de Villaverde sí.',
      'Se llama «de Guareña» desde el 2 de julio de 1916, por un arroyo que va a dar al río Guareña.'
    ],
    mon: {
      n: 'Iglesia de San Cornelio y San Cipriano',
      tipo: 'iglesia',
      epoca: 'Siglo XVI',
      estilo: 'Gótico y renacentista',
      datos: [
        ['Bien de Interés Cultural', '1993'],
        ['Tribuna', 'de 1601']
      ]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Villaverde_de_Guareña']]
  },
  'Ahigal de los Aceiteros': {
    cur: [
      'Su nombre vendría de «la Figal», la higuera: a finales del siglo XV todavía se llamaba Figal.',
      'Según contaban sus vecinos a Madoz, el primero que se asentó aquí fue un colmenero con su familia.',
      'El 5 de julio de 1851 el Tribunal Supremo lo libró, con otros pueblos vecinos, de pagar el noveno a los duques de Alba. Lo celebra el 11 de mayo con la fiesta de El Noveno.'
    ],
    mon: {
      n: 'Iglesia de Santa María Magdalena',
      tipo: 'iglesia',
      epoca: 'Siglo XVII',
      datos: [
        ['Retablo', 'barroco, de principios del XVIII'],
        ['Lo hizo', 'Felipe Cervera, alumno de Churriguera']
      ]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Ahigal_de_los_Aceiteros']]
  },
  'Gallegos de Argañán': {
    cur: [
      'Su nombre viene de la repoblación de Fernando II de León hacia 1157, con gentes traídas de Galicia.',
      'En un contrafuerte de la iglesia, a unos 2,5 metros de altura, hay una piedra romana con un voto a Júpiter: «Vitulo, hijo de Arreino, cumplió de buen grado el voto».',
      'El 5 de febrero, por las Águedas, es el día de las mujeres: las mayordomas del año anterior «echan» a las dos nuevas.'
    ],
    mon: {
      n: 'Iglesia de Santiago Apóstol',
      tipo: 'iglesia',
      epoca: 'Hacia 1540',
      estilo: 'Gótico final y renacentista',
      datos: [['Aspecto', 'austero y fuerte, casi defensivo']]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Gallegos_de_Argañán']]
  },
  'Colmenar de Montemayor': {
    cur: [
      'Nació hacia 1227, cuando Alfonso IX creó el concejo de Montemayor del Río, del que le viene el apellido.',
      'Una placa de 2012 recuerda al maestro Melquiades Rodríguez Tocino, secuestrado y fusilado el 8 de agosto de 1936.',
      'El 14 de septiembre sacan en romería al Cristo de la Salud por las calles.'
    ],
    mon: {
      n: 'Iglesia de Nuestra Señora de la Asunción',
      tipo: 'iglesia',
      epoca: 'Siglos XIII–XIV, reformada después',
      datos: [
        ['Alrededor', '«El Portal», cerrado por un muro de cantería'],
        ['Retablo', 'cubierto en origen de pan de oro']
      ]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Colmenar_de_Montemayor']]
  },
  Golpejas: {
    cur: [
      'Aparece en el fuero de Ledesma de 1161 como «Golpeyas de la Torre».',
      'Desde los años sesenta tuvo una mina de estaño de 80 hectáreas. Cerró en 1988 y dejó un lago de unas tres hectáreas en el que no viven peces ni insectos.',
      'Cuenta la leyenda que en la Peña de la Mora una bella mora bajaba cada mañana a peinarse al arroyo que pasa junto a una cueva. Su patrón es San Bartolomé, el 24 de agosto.'
    ],
    mon: {
      n: 'Iglesia de San Nicolás de Bari',
      tipo: 'iglesia',
      epoca: 'Siglo XVIII',
      datos: [
        ['Conserva', 'dos columnas y una portada románicas'],
        ['Retablo', 'barroco']
      ]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Golpejas']]
  },
  'Saelices el Chico': {
    cur: [
      'Bajo restos medievales apareció una villa romana del siglo IV, con un pasillo de suelo de mosaico.',
      'En 1169 Fernando II de León dio la aldea de «Sancti Felicis» a los monjes benedictinos de Santa Águeda, en Ciudad Rodrigo.',
      'Enusa sacó uranio de su mina desde 1974 hasta 2001.',
      'Se cuenta que la Peña de la Vieja, una piedra del arroyo, la tiró al agua una anciana y creció hasta dejarla cruzar.'
    ],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Saelices_el_Chico']]
  },
  'Nava de Francia': {
    cur: [
      'Guarda un documento firmado por el rey en Ciudad Rodrigo el 19 de noviembre de 1213, escrito en bajo latín vulgar.',
      'El 13 de octubre de 1296, en Tordesillas, el monasterio que era su dueño renunció al lugar a cambio de 200 maravedíes que pagó Miranda.',
      'Cerca está el dolmen de La Morisca, con un túmulo circular de diez metros de diámetro. Sus fiestas son el 18 de agosto.'
    ],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Nava_de_Francia']]
  },
  Villasbuenas: {
    cur: [
      'En el siglo XIII se llamaba Villabonos, y así aparece en un documento de la catedral de Salamanca de 1265.',
      'Se conserva una estela romana dedicada a Ciliborcae, una diosa prerromana de las fuentes cuyo nombre podría significar «portadora de salud».',
      'En 1788 se descubrieron en su término cuarzos citrinos de calidad de gema. En 1806 la marquesa de Zayas regaló a la reina María Luisa dos peinetas hechas con ellos.',
      'La mina de citrinos se explotó hasta 1907 y volvió a abrirse en 1940 con el nombre de Margarita, hasta los años sesenta.'
    ],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Villasbuenas']]
  },
  Sorihuela: {
    cur: [
      'Su nombre podría significar «Soria pequeña», por los repobladores que llegaron en la segunda mitad del siglo XII.',
      'Sus hombres lucharon en las Navas de Tolosa, en las mesnadas del obispo de Plasencia junto a Alfonso VIII.',
      'Fue castellana, de la Tierra de Béjar, hasta que en 1425 perdió el voto en Cortes y pasó al Reino de León.',
      'Su fiesta mayor es el Cristo de Valvanera, el 14 de septiembre. El pico de los Concejiles, en su término, llega a 1358 metros.'
    ],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Sorihuela']]
  },
  Agallas: {
    cur: [
      'El Ídolo de Agallas, de la Edad del Bronce, es una figura humana tallada en pizarra de más de un metro de alto.',
      'En 1985 apareció un ara romana del siglo I con una dedicatoria en latín.',
      'Una piedra del pueblo lleva tallada la fecha de 1612 y una cruz que parece de la Orden de Santiago, aunque Agallas nunca fue de esa orden.',
      'En mayo de 2010 el pleno del ayuntamiento pidió pasar a Extremadura y dejar Castilla y León.'
    ],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Agallas']]
  },
  Bermellar: {
    cur: [
      'Sobre el río Huebra está el castro de Saldañuela, una fortaleza de la Edad del Hierro.',
      'En el siglo XII Fernando II de León lo puso en manos de la Orden del Temple. Cuando el papa disolvió la orden, en 1311, pasó al obispo de Ciudad Rodrigo.',
      'Su término está dentro del parque natural de Arribes del Duero, con cigüeña negra, alimoche y águila perdicera.'
    ],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Bermellar']]
  },
  'Cerezal de Peñahorcada': {
    cur: [
      'Su apellido viene de dos peñascos casi inaccesibles que forman una «horcada». El teso de Peñahorcada mide 836 metros.',
      'Fue de la Orden de Santiago desde el siglo XII hasta 1873, cuando pasó a la diócesis de Ciudad Rodrigo.',
      'Madoz contaba en 1847 un pueblo partido en dos barrios por un arroyo que se cruzaba por cinco puentecillos de piedra.',
      'Su fiesta es San Marcos, el 25 de abril.'
    ],
    mon: {
      n: 'Iglesia de San Marcos',
      tipo: 'iglesia',
      epoca: 'Origen gótico',
      estilo: 'De influencia neoclásica',
      datos: [
        ['Conserva', 'el arco gótico de la portada'],
        ['Retablo', 'siglo XVIII'],
        ['Cruz repujada', 'siglo XVI']
      ]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Cerezal_de_Pe%C3%B1ahorcada']]
  },
  Gajates: {
    cur: [
      'Se fundó con la repoblación de Ramiro II de León, en el siglo X. En el XIII se escribía «Gayates».',
      'En 1196 su pedanía, Galleguillos, entonces «Galegos de Alfaraz», fue saqueada por tropas castellanas: la frontera estaba muy cerca.',
      'Quedan restos de El Palacio, un palacio fortaleza del siglo XII.'
    ],
    mon: {
      n: 'Iglesia del Salvador',
      tipo: 'iglesia',
      epoca: 'Siglo XIII',
      estilo: 'Románico-mudéjar',
      datos: [
        ['Ábside', 'siete paños entre ocho bandas'],
        ['Dentro', 'la tumba renacentista de Pedro Aponte (siglo XVI)']
      ]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Gajates']]
  },
  Rágama: {
    cur: [
      'Fue de la Comunidad de Villa y Tierra de Arévalo desde la repoblación de los siglos XI y XII hasta 1833, cuando pasó a Salamanca.',
      'Aquí nació en 1464 Francisco de Carvajal, conquistador en México y Perú al que llamaron «el demonio de los Andes». Murió ejecutado en 1548.',
      'A la salida hacia Peñaranda está El Humilladero: una cruz de granito con el Cristo delante y la Virgen detrás, bajo un pórtico de cuatro pilares.'
    ],
    mon: {
      n: 'Iglesia del Salvador',
      tipo: 'iglesia',
      estilo: 'Románico-mudéjar',
      datos: [['Dentro', 'un artesonado policromado']]
    },
    fuente: [
      ['Wikipedia', 'https://es.wikipedia.org/wiki/R%C3%A1gama'],
      ['Wikipedia: Francisco de Carvajal', 'https://es.wikipedia.org/wiki/Francisco_de_Carvajal']
    ]
  },
  Retortillo: {
    cur: [
      'Su balneario aprovecha un manantial que brota en el mismo lecho del río Yeltes a 48,5 °C, con unos 212 litros por minuto. Sus aguas se declararon de utilidad pública el 14 de julio de 1905.',
      'Los romanos ya lo usaban: se halló un ara dedicada a las aguas del Yeltes, «Aquis Eletesibus».',
      'En 1561 Felipe II dejó a Juan Solís levantar una casa fuerte. En 1840 se usaron sus piedras para el frontón y la torre del reloj.',
      'La honda de su escudo recuerda a los guerrilleros de don Julián Sánchez, «el Charro», en la guerra de la Independencia.'
    ],
    mon: {
      n: 'Puente sobre el Yeltes',
      tipo: 'puente',
      epoca: 'Considerado romano',
      datos: [['Un solo arco', 'apoyado en dos rocas del cauce']]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Retortillo_(Salamanca)']]
  },
  'Sancti-Spíritus': {
    cur: [
      'Con 141,90 km² es el tercer municipio más grande de la provincia.',
      'El abrigo de Camaces, un asentamiento neolítico, es bien de interés cultural desde 1983.',
      'Al retirarse en la guerra de la Independencia, los franceses quemaron el pueblo, con la iglesia y el ayuntamiento y sus archivos.',
      'Su escudo es una paloma de plata en vuelo sobre azul. La fiesta mayor es la infraoctava del Corpus.'
    ],
    mon: {
      n: 'Iglesia Vieja',
      tipo: 'iglesia',
      epoca: 'Hacia 1475',
      datos: [
        ['Planta', 'de salón'],
        ['Hallazgo', 'un arco de herradura, al restaurarla en los años 2000']
      ]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Sancti-Sp%C3%ADritus_(Salamanca)']]
  },
  'Martín de Yeltes': {
    cur: [
      'Se llamó Martín del Río hasta 1910, cuando tomó el nombre del río Yeltes. Un real decreto de 1916 lo confirmó.',
      'En el siglo XIX era lugar de paso de pastores, carruajes y caballerías que subían de Extremadura a León, con posadas y ventorros.',
      'En 1902 absorbió el término de Campocerrado, que en 1900 tenía 162 vecinos, tras un desahucio que hizo la Guardia Civil.',
      'Sus fiestas son San Antonio, el 13 de junio, y San Martín, el 11 de noviembre.'
    ],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Mart%C3%ADn_de_Yeltes']]
  },
  Villasrubias: {
    cur: [
      'En 1191 Alfonso IX de León lo donó a la Orden de Santiago.',
      'Su torre de las campanas era en 1700 una torre de defensa que también servía de horca. Los arcos se le añadieron hacia 1945.',
      'En la dehesa de Jaque hay una piedra con doce eslabones de cadena grabados: de ahí la leyenda del «tesoro de Jaque».',
      'La víspera de San Ceferino, su patrón, el 26 de agosto, se planta en la plaza el mejor pino del pinar. En Carnaval los quintos matan el gallo.'
    ],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Villasrubias']]
  },
  'Frades de la Sierra': {
    cur: [
      'Aquí nació en 1870 el poeta José María Gabriel y Galán. Su casa natal se puede visitar.',
      'Alfonso X le dio franquicias y título de lealtad porque sus hijos le ayudaron a conquistar el reino de Murcia.',
      'Hasta el 2 de julio de 1916 se llamaba solo Frades.',
      'Madoz contaba en 1847 lobos abundantes en la sierra y telares que tejían sayal, una tela basta.'
    ],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Frades_de_la_Sierra']]
  },
  'Santibáñez de la Sierra': {
    cur: [
      'Una inscripción de la antigua ermita de San Juan recuerda su fundación en el año 583.',
      'Por aquí pasaba una calzada romana que se partía en dos: hacia Coria y hacia las minas de oro de Las Cavenes, en El Cabaco.',
      'Las fiestas de San Agustín van del 26 al 29 de agosto, y el 29 es el Día del Toro. El 1 de noviembre se hace la Calbochada, con castañas asadas.'
    ],
    mon: {
      n: 'Puente romano de Puentes de Alagón',
      tipo: 'puente',
      epoca: 'Siglo I a. C.',
      datos: [
        ['Sobre', 'el río Alagón'],
        ['Es', 'uno de los más antiguos de la Península']
      ]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Santib%C3%A1%C3%B1ez_de_la_Sierra']]
  },
  Topas: {
    cur: [
      'El 12 de abril de 1136 Alfonso VII donó «Thopas» al obispado de Salamanca.',
      'Felipe II la vendió en 1583 a Nicolás de Grimaldo, y el 8 de noviembre de 1586 el concejo compró su propia villa por 3000 ducados.',
      'En el castillo se alojó Fernando el Católico en 1475, camino de la batalla de Toro. Se llama «del Buen Amor» por el obispo Alonso de Fonseca y su amante, Teresa de las Cuevas, que vivían juntos en él.',
      'Su fiesta es San Antonio de Padua, el 13 de junio.'
    ],
    mon: {
      n: 'Castillo del Buen Amor',
      tipo: 'torre',
      epoca: 'Siglo XV',
      estilo: 'Castillo reformado como palacio renacentista',
      datos: [
        ['Monumento', 'desde 1931'],
        ['Hoy', 'hotel, desde 2003']
      ]
    },
    fuente: [
      ['Wikipedia', 'https://es.wikipedia.org/wiki/Topas'],
      ['Wikipedia: Castillo del Buen Amor', 'https://es.wikipedia.org/wiki/Castillo_del_Buen_Amor']
    ]
  },
  'La Zarza de Pumareda': {
    cur: [
      'Antes se llamaba «Sarça de Conosapo». El «Pumareda» podría venir de un reparto de tierras del siglo XV con un licenciado de ese apellido.',
      'Entre los siglos XVI y XVIII fue anejo de Aldeadávila, y hasta el XIX dependió del conde de Ledesma.',
      'Su torreón del reloj es de 1921.'
    ],
    mon: {
      n: 'Puente de Santo Domingo',
      tipo: 'puente',
      epoca: 'Siglos XVII–XVIII',
      datos: [['También', 'puente Robledo o puente Grande']]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/La_Zarza_de_Pumareda']]
  },
  'Encinasola de los Comendadores': {
    cur: [
      'En su pedanía de Picones está el castro del Picón de la Mora, de la Segunda Edad del Hierro.',
      'En el siglo XIII se escribía «Erzinasola». En 1185 se cerró el pleito con Zamora y pasó para siempre a la diócesis de Salamanca.',
      'En 1901, 104 vecinos compraron todo el término a los señores de Guadramiro por 475 000 pesetas.'
    ],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Encinasola_de_los_Comendadores']]
  },
  'Zorita de la Frontera': {
    cur: [
      'Su apellido viene de los siglos XII y XIII, cuando estaba en la frontera entre León y Castilla. «Zorita» podría venir del árabe y significar «paloma azul».',
      'En la Edad Media se escribía «Çurita», y en un mapa de 1700 aparece como «Corita».',
      'Su escudo, aprobado en 2008, lleva un león rojo y un pino de oro arrancado.'
    ],
    mon: {
      n: 'Iglesia de San Miguel Arcángel',
      tipo: 'iglesia',
      epoca: 'Siglos XV–XVI',
      datos: [
        ['Nave central', 'artesonado mudéjar del siglo XV'],
        ['A los pies', 'tribuna plateresca de madera'],
        ['Retablo mayor', 'churrigueresco']
      ]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Zorita_de_la_Frontera']]
  },
  Montejo: {
    cur: [
      'Lo atraviesa el embalse de Santa Teresa, que recoge las aguas del Tormes.',
      'Aquí nacieron los hermanos Rodríguez Laso: Simón fue rector del Colegio de España en Bolonia desde 1788 hasta su muerte en 1821.',
      'La fuente de los hermanos Rodríguez Laso, «el caño», es de 1799.',
      'Celebra San Blas el 3 de febrero y San Antonio el 13 de junio.'
    ],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Montejo_(Salamanca)']]
  },
  Gomecello: {
    cur: [
      'Su nombre viene de Gómez Tello, a quien los reyes de León encargaron repoblar la zona. En el siglo XIII se escribía «Gomeçello».',
      'Su estación de tren abrió en 1877 con la línea de Salamanca a Medina del Campo.',
      'Desde 2007 trata aquí los residuos de toda la provincia. Sus dos silos de cereal se ven a muchos kilómetros.',
      'Sus fiestas son el penúltimo fin de semana de agosto, por la Virgen de la Esperanza.'
    ],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Gomecello']]
  },
  Espeja: {
    cur: [
      'Aparece por primera vez en 1376, en un documento del archivo de Ciudad Rodrigo.',
      'En 1626 se vendió como villa de señorío, y en 1685 el hijo del comprador fue nombrado marqués de Espeja.',
      'En 1812 murió aquí luchando contra los franceses el general británico Henry Mackinnon, y lo enterraron con honores en la plaza de la iglesia.',
      'Su patrón es San Lino, el 23 de septiembre. El escudo lleva tres columnas de oro, la del medio caída.'
    ],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Espeja']]
  },
  'Paradinas de San Juan': {
    cur: [
      'Se documenta en 1113, cuando la reina Urraca la donó a la Orden de San Juan, de la que toma el apellido.',
      'En 1183 se trataron aquí las paces entre Fernando II de León y Alfonso VIII de Castilla. En 1197 los castellanos tomaron la villa y su castillo.',
      'Aquí nació en 1395 Alonso de Paradinas, obispo de Ciudad Rodrigo y copista del Libro de buen amor: su copia está en la Universidad de Salamanca.',
      'Su romería del Hinojal es el último fin de semana de agosto; el pozo del agua milagrosa de la ermita se tenía por bueno contra las viruelas.'
    ],
    mon: {
      n: 'Iglesia de San Pedro Apóstol',
      tipo: 'iglesia',
      estilo: 'Románico-mudéjar',
      datos: [
        ['Naves', 'tres'],
        ['Portada', 'de piedra, con dos arquivoltas']
      ]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Paradinas_de_San_Juan']]
  },
  Puertas: {
    cur: [
      'En 1265 se llamaba Sancta María de Cabeça de Porcas.',
      'El 13 de mayo de 1597 se juzgó a su cura, Gonzalo Pérez, por decir misa demasiado temprano y jugar a la pelota en las calles. Lo amonestaron y pagó las costas.',
      'Vive de las vacas moruchas y charolesas, y en 2025 tenía 66 vecinos.'
    ],
    mon: {
      n: 'Iglesia de Santa Marina',
      tipo: 'iglesia',
      epoca: 'Siglos XVI–XVII',
      datos: [
        ['Hecha', 'quizá con sillares de un templo románico'],
        ['Espadaña', 'maciza, de dos vanos']
      ]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Puertas_(Salamanca)']]
  },
  'Guijo de Ávila': {
    cur: [
      'Su apellido viene de Ávila: tras la repoblación del siglo XII quedó ligado a esa tierra.',
      'En el siglo XV, cuando la Tierra de Béjar pasó a León, quedó como el pedazo de Castilla más al oeste, rodeado de tierras leonesas por tres de sus cuatro lados.',
      'Tiene un aula de energías renovables con su propia estación meteorológica.'
    ],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Guijo_de_%C3%81vila']]
  },
  'Valverde de Valdelacasa': {
    cur: [
      'Fue pueblo de frontera: el límite entre León y Castilla iba por la Vía de la Plata.',
      'En 1209 entró en la Comunidad de Villa y Tierra de Béjar, y en 1396 pasó con ella a los Zúñiga.',
      'Tiene un monumento al peregrino, por el Camino de Santiago de la Vía de la Plata.'
    ],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Valverde_de_Valdelacasa']]
  },
  'Mancera de Abajo': {
    cur: [
      'Fue villa del señorío del marqués de Malpica y la cabeza de las siete villas que lo formaban.',
      'Madoz contaba en 1848 un palacio del marqués ya inhabitable y las ruinas de un convento de los Mínimos.',
      'Hasta el siglo XV fue de la Tierra de Ávila; después pasó a la jurisdicción de Salamanca.'
    ],
    mon: {
      n: 'Palacio de los Marqueses de Mancera',
      tipo: 'palacio',
      datos: [['Señorío', 'del marqués de Malpica']]
    },
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Mancera_de_Abajo']]
  },
  'Villar de Ciervo': {
    cur: [
      'Su nombre podría venir de los muchos ciervos que había cuando se fundó, entre los siglos XII y XIII.',
      'A mediados del siglo XIX tenía 957 vecinos y 240 casas, según Madoz.',
      'Su patrón es San Agustín, con fiesta el 28 de agosto.'
    ],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Villar_de_Ciervo']]
  },
  Larrodrigo: {
    cur: [
      'En el siglo XIII se llamaba Pela Rodrigo, en el XV Felarrodrigo y en el censo de 1842 La Rodrigo.',
      'Por él pasaba la calzada de Alba de Tormes a Valladolid.',
      'Su escudo junta un verraco, una encina y una cruz de la Orden de San Juan.'
    ],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Larrodrigo']]
  },
  'Tarazona de Guareña': {
    cur: [
      'En el siglo XIII se escribía «Taraçona»: quizá la poblaron gentes de Tarazona, en Aragón.',
      'Tomó el apellido del río Guareña el 2 de julio de 1916.',
      'Por San Miguel, el 29 de septiembre, hay encierros por el campo, con jinetes que llevan los toros hasta la plaza, y peñas que invitan a los forasteros.'
    ],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Tarazona_de_Guare%C3%B1a']]
  },
  Huerta: {
    cur: [
      'Su nombre aparece hacia 1163, en el testamento de don Vela, canónigo de la catedral de Salamanca.',
      'Pedro Maldonado Pimentel, nieto del dueño de la heredad de Huerta, fue ejecutado en 1522 por luchar con los comuneros.',
      'En el siglo XVI vivió de sus aceñas, molinos de harina del Tormes; la Aceña de Huerta sigue en pie. La riada de San Policarpo, en 1626, la destruyó casi por completo.',
      'Su calle de los Mesones recuerda las posadas del camino de Salamanca a Madrid. Su patrón es San Bartolomé, el 24 de agosto.'
    ],
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Huerta_(Salamanca)']]
  }
};
