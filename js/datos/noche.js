// Salamanca de noche (js/noche.js): las leyendas de miedo, muerte y diablo de la capital. Se leen enteras solo
// de noche, de la puesta de sol al amanecer (estadoNoche, hora-dorada.js); de día se ve solo el principio.
// { id (no cambiar: enlaces #noche/id y progreso.j.ln), n, icono: un emoji, monumento: id de MONUMENTOS si la leyenda
//   es de un monumento (su punto es el del monumento), la, lo: el punto, de OpenStreetMap, si no lo es,
//   aproximada: true si las fuentes solo dan la zona, donde: dónde pasa,
//   textos: [[tipo de TIPOS_TEXTO_CULTURA, texto]], fuentes: [[nombre, url]], revisado: 'AAAA-MM-DD' }
export const FUENTE_LEYENDAS_ESPANOL = [
  'El Español: las leyendas que hechizan la ciudad de Salamanca (2021)',
  'https://www.elespanol.com/castilla-y-leon/region/salamanca/20211023/leyendas-hechizan-ciudad-salamanca/620717931_3.amp.html'
];
export const FUENTE_LEYENDAS_MALETA = [
  'La maleta inquieta: leyendas de Salamanca',
  'https://lamaletainquieta.com/leyendas-salamanca/'
];
export const FUENTE_CURIOSIDADES_ESDIARIO = [
  'ESdiario: Salamanca como nunca te la contaron (2025)',
  'https://www.esdiario.com/castilla-y-leon/251219/124078/salamanca-curiosidades-historicas.html'
];

export const LEYENDAS_NOCHE = [
  {
    id: 'cueva',
    n: 'La Cueva de Salamanca',
    icono: '😈',
    monumento: 'cueva',
    donde: 'En la Cuesta de Carvajal, a la espalda de las catedrales, junto a la torre de Villena.',
    textos: [
      [
        'tradicion',
        'Cuenta la tradición que en la cripta de la iglesia de San Cebrián el diablo daba clases de nigromancia a grupos de siete estudiantes durante siete años. Al terminar, uno de ellos, elegido a suertes, se quedaba a su servicio.'
      ],
      [
        'tradicion',
        'Al marqués de Villena le tocó quedarse, pero escapó dejándole al diablo su propia sombra, y desde entonces anduvo sin ella. La torre que hay junto a la cueva lleva su nombre.'
      ],
      [
        'hecho',
        'La cueva es la cripta de la sacristía de San Cebrián, una iglesia que ya no existe. Cervantes se burló de la leyenda en su entremés «La cueva de Salamanca».'
      ]
    ],
    fuentes: [
      ['Wikipedia: Cueva de Salamanca', 'https://es.wikipedia.org/wiki/Cueva_de_Salamanca'],
      FUENTE_LEYENDAS_ESPANOL,
      [
        'Matador Network: lugares de Salamanca citados en la literatura (2014)',
        'https://matadornetwork.com/es/6-lugares-de-salamanca-citados-en-la-literatura/'
      ]
    ],
    revisado: '2026-11-23'
  },
  {
    id: 'casa-muertes',
    n: 'La Casa de las Muertes',
    icono: '💀',
    monumento: 'casa-muertes',
    donde: 'En la calle Bordadores, frente a las Úrsulas y pegada a la casa de Unamuno.',
    textos: [
      [
        'hecho',
        'Su nombre mezcla historia y leyenda: a comienzos del siglo XIX mataron a las cuatro personas que vivían en la casa, y en su fachada hay cuatro calaveras.'
      ],
      [
        'tradicion',
        'La leyenda tiene otra versión: en mayo de 1835 apareció asesinada una señorita que acababa de despedir a sus criados, y sus restos estaban en el pozo del patio. Se sospechó de la criada despedida, y la casa se quedó vacía un tiempo.'
      ],
      [
        'hecho',
        'Las calaveras no son tan antiguas como parecen: las que se ven hoy salieron de la restauración que hizo José Varela en 1962.'
      ]
    ],
    fuentes: [
      ['Wikipedia: Casa de las Muertes', 'https://es.wikipedia.org/wiki/Casa_de_las_Muertes'],
      FUENTE_LEYENDAS_ESPANOL,
      [
        'Terranostrum: Casa de las Muertes',
        'https://www.terranostrum.es/turismo/salamanca/casa-de-las-muertes-salamanca'
      ]
    ],
    revisado: '2026-11-23'
  },
  {
    id: 'maria-la-brava',
    n: 'Las cabezas de María la Brava',
    icono: '🗡️',
    la: 40.96682,
    lo: -5.66501,
    donde: 'En su casa de la plaza de los Bandos, levantada hacia 1485.',
    textos: [
      [
        'tradicion',
        'En el siglo XV la ciudad estaba partida en dos bandos que tenían aterrados a los vecinos. Dicen que en la plaza del Corrillo crecía la hierba de lo poco que se pisaba, por miedo a las peleas, y por eso la llamaban «de la Yerba».'
      ],
      [
        'tradicion',
        'Los hermanos Manzano mataron a los dos hijos de doña María de Monroy. Dicen que ella los persiguió hasta Viseu, en Portugal, les cortó la cabeza y volvió con ellas para dejarlas en la tumba de sus hijos, en la iglesia de Santo Tomé. Otra versión cuenta que las clavó en la fachada de su casa.'
      ]
    ],
    fuentes: [FUENTE_LEYENDAS_ESPANOL],
    revisado: '2026-11-23'
  },
  {
    id: 'muger-1838',
    n: '«Aquí se mató una muger»',
    icono: '🩸',
    la: 40.96505,
    lo: -5.6635,
    aproximada: true,
    donde: 'Bajo el arco principal del Pabellón Real, el lado este de la Plaza Mayor.',
    textos: [
      [
        'hecho',
        'Bajo el arco principal del Pabellón Real hay una inscripción que dice: «Aquí se mató una muger, rueguen a Dios por ella. Año de 1838». Qué pasó sigue siendo un misterio.'
      ],
      [
        'tradicion',
        'La tradición dice que las vetas rojizas de la columna que hay debajo son las manchas de su sangre.'
      ]
    ],
    fuentes: [FUENTE_CURIOSIDADES_ESDIARIO],
    revisado: '2026-11-23'
  },
  {
    id: 'calisto',
    n: 'La caída de Calisto',
    icono: '🪜',
    monumento: 'huerto',
    donde: 'En el Huerto de Calixto y Melibea, junto a la muralla y a los pies de la Catedral.',
    textos: [
      [
        'hecho',
        'En «La Celestina» (1499), Calisto muere al caer de la escala con la que saltaba de noche el muro del huerto de Melibea. Ella, desesperada, se tira desde una torre.'
      ],
      [
        'tradicion',
        'La tradición pone aquel huerto aquí. El jardín de hoy se abrió en 1981 y se llama así por la obra.'
      ]
    ],
    fuentes: [
      FUENTE_LEYENDAS_MALETA,
      ['Wikipedia: Huerto de Calixto y Melibea', 'https://es.wikipedia.org/wiki/Huerto_de_Calixto_y_Melibea']
    ],
    revisado: '2026-11-23'
  },
  {
    id: 'salina',
    n: 'Los monstruos de la Salina',
    icono: '👹',
    monumento: 'palacio-salina',
    donde: 'En el Palacio de la Salina, en la calle Felipe Espino, hoy sede de la Diputación.',
    textos: [
      [
        'tradicion',
        'Cuenta una leyenda que el arzobispo Alonso de Fonseca, despechado porque los nobles de Salamanca no aceptaban a su amante Juana Pimentel, «la Salina», mandó retratarlos como monstruos en este palacio.'
      ],
      [
        'hecho',
        'No pudo ser: Fonseca murió en 1534 y el palacio se hizo en 1538 para Rodrigo de Messía Carrillo. La leyenda viene, seguramente, del parecido de los nombres.'
      ]
    ],
    fuentes: [['Wikipedia: Palacio de la Salina', 'https://es.wikipedia.org/wiki/Palacio_de_la_Salina']],
    revisado: '2026-11-23'
  },
  {
    id: 'sahagun',
    n: 'El veneno de san Juan de Sahagún',
    icono: '☠️',
    monumento: 'catedrales',
    donde: 'Sus restos están en la Catedral Nueva.',
    textos: [
      [
        'tradicion',
        'Se dice que la amante de un comendador, despechada, quiso matar a san Juan de Sahagún, el patrón de la ciudad. Unos cuentan que le envenenaron la comida; otros, que le clavaron un estilete envenenado.'
      ],
      ['hecho', 'Murió en Salamanca en 1479 y está enterrado en la Catedral Nueva.']
    ],
    fuentes: [
      FUENTE_LEYENDAS_ESPANOL,
      ['Wikipedia: Juan de Sahagún', 'https://es.wikipedia.org/wiki/Juan_de_Sahag%C3%BAn']
    ],
    revisado: '2026-11-23'
  },
  {
    id: 'calavera',
    n: 'La calavera de la rana',
    icono: '🐸',
    monumento: 'universidad',
    donde: 'En la fachada de las Escuelas Mayores de la Universidad.',
    textos: [
      [
        'hecho',
        'La rana de la fachada está sentada sobre una calavera. Se lee como un «memento mori», un recordatorio de que la vida se acaba; hay quien la ve como símbolo de la muerte, la lujuria o la Inquisición.'
      ],
      ['tradicion', 'Los estudiantes dicen que quien la encuentra sin ayuda aprobará.']
    ],
    fuentes: [FUENTE_LEYENDAS_MALETA, FUENTE_CURIOSIDADES_ESDIARIO],
    revisado: '2026-11-23'
  }
];
