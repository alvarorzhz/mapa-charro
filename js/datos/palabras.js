// Palabras charras: vocabulario y expresiones de Salamanca, cada una con su fuente.
// FUENTES_PALABRAS[clave] = [nombre que se muestra, enlace]
// PALABRAS_CHARRAS: { id (no cambiar: va en el progreso), p (palabra), s (significado), e (ejemplo),
//   f (clave de la fuente), z (opcional: zonas del mapa en cuya ficha sale) }
// Las zonas sin palabra propia muestran una de la lista (palabras.js).
const FUENTES_PALABRAS = {
  elespanol: [
    'El Español (2024)',
    'https://www.elespanol.com/castilla-y-leon/region/salamanca/20231030/curiosas-expresiones-usan-salamanca-solo-entiendenlossalmantinos/804669777_0.html'
  ],
  rtv2023: [
    'SALAMANCArtv AL DÍA (2023)',
    'https://salamancartvaldia.es/noticia/2023-04-14-las-expresiones-tipicas-que-solo-puedes-conocer-si-eres-de-salamanca-319988'
  ],
  rtv2022: [
    'SALAMANCArtv AL DÍA (2022)',
    'https://salamancartvaldia.es/noticia/2022-08-15-conoces-estos-dichos-y-refranes-salmantinos-302452'
  ],
  salamancahoy: [
    'Salamancahoy (2022)',
    'https://www.salamancahoy.es/salamanca/provincia/singular-vocabulario-salmantino-20221120092841-nt.html'
  ],
  gaceta: [
    'La Gaceta de Salamanca (2016)',
    'https://www.lagacetadesalamanca.es/hemeroteca/recopilatorio-terminos-comunes-usados-salmantinos-GDGS191070'
  ],
  tiatula2023: ['Tía Tula (2023)', 'https://blog.tiatula.com/2023/02/expresiones-de-salamanca.html'],
  tiatula2022: [
    'Tía Tula (2022)',
    'https://blog.tiatula.com/2022/08/conoces-el-vocabulario-de-salamanca.html'
  ],
  patrimonio: [
    'Patrimonio Activo (2024)',
    'https://www.patrimonioactivocyl.es/descubre/sabias-que/9-expresiones-palabras-salmantinas/'
  ]
};

const PALABRAS_CHARRAS = [
  // --- Casa y día a día ---
  {
    id: 'candar',
    p: 'Candar',
    s: 'Cerrar la puerta (o el coche), aunque sea sin llave.',
    e: '¿Has candado?',
    f: 'tiatula2023'
  },
  { id: 'cochera', p: 'Cochera', s: 'Garaje.', e: 'Voy a candar la cochera.', f: 'patrimonio' },
  {
    id: 'caer',
    p: 'Caer',
    s: 'Tirar algo, hacer que se caiga.',
    e: 'Ten cuidado, que caes la botella.',
    f: 'tiatula2023'
  },
  {
    id: 'paqui',
    p: 'Paquí, pahí, pallí',
    s: 'Aquí, ahí, allí: para indicar dónde o a qué distancia.',
    e: '¿La biblioteca? Pahí pa Garrido.',
    f: 'patrimonio'
  },
  {
    id: 'atrochar',
    p: 'Atrochar',
    s: 'Tomar un atajo, un camino más corto.',
    e: '¿Atrochamos por la calle Zamora para llegar antes?',
    f: 'tiatula2022'
  },
  {
    id: 'armando',
    p: 'Armando',
    s: 'Entretenerse haciendo cualquier cosa.',
    e: '—¿Qué haces? —Nada, aquí, armando.',
    f: 'salamancahoy'
  },
  {
    id: 'loque',
    p: '¿Lo qué?',
    s: '«¿El qué?», para pedir que te repitan algo.',
    e: '¿Lo qué? No te he oído.',
    f: 'patrimonio'
  },
  {
    id: 'mehesonado',
    p: 'Me he soñado',
    s: '«He soñado», para empezar a contar un sueño.',
    e: 'Ayer me soñé que…',
    f: 'tiatula2023'
  },
  {
    id: 'descambiar',
    p: 'Descambiar',
    s: 'Devolver una compra para que te la cambien.',
    e: 'Esta camisa la voy a descambiar.',
    f: 'tiatula2023'
  },
  {
    id: 'lamediodia',
    p: 'La mediodía',
    s: 'La hora de comer, sea a las dos o a las tres.',
    e: 'Nos vemos a la mediodía.',
    f: 'tiatula2023'
  },
  {
    id: 'trapa',
    p: 'La trapa',
    s: 'La persiana metálica de un local.',
    e: 'Ya han bajado la trapa.',
    f: 'tiatula2023'
  },
  { id: 'aviate', p: 'Avíate', s: 'Date prisa.', e: '¡Avíate, que no llegamos!', f: 'gaceta' },
  {
    id: 'estasaviao',
    p: 'Estás aviao',
    s: 'Aviso de que te van a pillar en una trastada.',
    e: 'Como se entere tu madre, estás aviao.',
    f: 'gaceta'
  },
  {
    id: 'lacapi',
    p: 'La capi',
    s: 'Salamanca capital, dicho desde los pueblos.',
    e: 'Mañana bajo a la capi.',
    f: 'gaceta'
  },
  { id: 'ca', p: 'Ca’', s: 'Casa de alguien.', e: 'Estamos en ca’ mi abuela.', f: 'gaceta' },
  {
    id: 'minino',
    p: 'Mi niño, mi niña',
    s: 'Cómo se dirige el tendero a quien atiende (y al revés).',
    e: '¿Qué te pongo, mi niña?',
    f: 'tiatula2023'
  },
  {
    id: 'acorropetar',
    p: 'Acorropetar',
    s: 'Llenar un recipiente hasta el borde.',
    e: 'No acorropetes el vaso, que se sale.',
    f: 'patrimonio'
  },
  {
    id: 'cachiperres',
    p: 'Cachiperres',
    s: 'Trastos viejos.',
    e: 'La cochera está llena de cachiperres.',
    f: 'gaceta'
  },
  {
    id: 'achiperre',
    p: 'Achiperre',
    s: 'Herramienta para arreglar una avería.',
    e: 'Pásame el achiperre.',
    f: 'salamancahoy'
  },
  // --- Comida ---
  { id: 'pesca', p: 'Pesca', s: 'Pescado.', e: 'Hoy de comer, pesca.', f: 'gaceta' },
  {
    id: 'chochos',
    p: 'Chochos',
    s: 'Altramuces. En las fiestas de los pueblos, también las peladillas.',
    e: 'Los chochos están salados.',
    f: 'tiatula2023'
  },
  {
    id: 'galguerias',
    p: 'Galguerías',
    s: 'Golosinas, chucherías.',
    e: 'No comas galguerías antes de comer.',
    f: 'tiatula2023'
  },
  { id: 'chicheres', p: 'Chícheres', s: 'Judías pintas.', e: 'Hoy hay chícheres.', f: 'gaceta' },
  {
    id: 'chucho',
    p: 'Chucho',
    s: 'Hueso de la fruta.',
    e: 'No te tragues el chucho de la ciruela.',
    f: 'gaceta'
  },
  {
    id: 'carozo',
    p: 'Carozo',
    s: 'Hueso de la aceituna.',
    e: 'Deja los carozos en el platillo.',
    f: 'elespanol'
  },
  { id: 'pocha', p: 'Pocha', s: 'Fruta pasada.', e: 'Esa pera está pocha.', f: 'gaceta' },
  { id: 'anusgarse', p: 'Añusgarse', s: 'Atragantarse.', e: 'Come despacio, que te añusgas.', f: 'rtv2023' },
  {
    id: 'berretes',
    p: 'Berretes',
    s: 'Manchas alrededor de la boca después de comer o beber.',
    e: 'Tengo berretes del chocolate con churros.',
    f: 'elespanol'
  },
  {
    id: 'canguingos',
    p: 'Canguingos y patas de peces',
    s: 'Lo que contestaba tu madre a «¿qué hay de comer?».',
    e: '—¿Qué hay de comer? —Canguingos y patas de peces.',
    f: 'gaceta'
  },
  {
    id: 'perronillas',
    p: 'Perronillas',
    s: 'Así se llama en la calle a las perrunillas, el dulce típico.',
    e: 'Unas perronillas con el café.',
    f: 'tiatula2023'
  },
  // --- El frío ---
  {
    id: 'cencellada',
    p: 'Cencellada',
    s: 'Hielo o escarcha de las mañanas de invierno, tras una noche bajo cero.',
    e: 'En enero hay unas cencelladas espectaculares a orillas del Tormes.',
    f: 'tiatula2023',
    z: ['tormes', 'arrabal']
  },
  {
    id: 'engaranado',
    p: 'Engarañado',
    s: 'Entumecido, tiritando de frío.',
    e: 'Vengo engarañado del paseo.',
    f: 'gaceta'
  },
  // --- Golpes y pupas ---
  {
    id: 'pitera',
    p: 'Pitera',
    s: 'Herida o brecha en la cabeza.',
    e: 'Me caí de la bici y me hice una pitera.',
    f: 'tiatula2022'
  },
  {
    id: 'cachapa',
    p: 'Cachapa',
    s: 'La postilla que queda en la herida días después.',
    e: 'No te quites la cachapa.',
    f: 'salamancahoy'
  },
  {
    id: 'esperniquebrao',
    p: 'Esperniquebrao',
    s: 'Que se ha dado una buena caída.',
    e: 'Bajó la cuesta corriendo y acabó esperniquebrao.',
    f: 'gaceta'
  },
  {
    id: 'panadera',
    p: 'Panadera',
    s: 'Paliza: algo más que cuatro tortazos.',
    e: 'Como te pille, te da una panadera.',
    f: 'gaceta'
  },
  // --- Cómo es la gente ---
  { id: 'jijas', p: 'Jijas', s: 'Persona muy delgada.', e: 'Estás hecho un jijas.', f: 'salamancahoy' },
  {
    id: 'pejilguero',
    p: 'Pejilguero',
    s: 'Persona quisquillosa, tiquismiquis.',
    e: 'No seas pejilguero, que está bien así.',
    f: 'salamancahoy'
  },
  {
    id: 'ligrimo',
    p: 'Lígrimo',
    s: 'Puro, sin mezcla.',
    e: 'Hay que ser un charro lígrimo para conocer estas palabras.',
    f: 'tiatula2022'
  },
  {
    id: 'chiquinino',
    p: 'Chiquinino',
    s: 'Pequeñito; se dice de un roto o un descosido.',
    e: 'Tienes un descosido chiquinino.',
    f: 'patrimonio'
  },
  // --- Fiesta, ropa y desastres ---
  {
    id: 'chocones',
    p: 'Coches chocones',
    s: 'Los coches de choque de las ferias.',
    e: '¿Vamos a los chocones?',
    f: 'rtv2023'
  },
  {
    id: 'pingo',
    p: 'Ir de pingo',
    s: 'Ir de fiesta.',
    e: 'Este fin de semana nos vamos de pingo.',
    f: 'gaceta'
  },
  { id: 'chambergo', p: 'Chambergo', s: 'Abrigo.', e: 'Ponte el chambergo, que hace frío.', f: 'elespanol' },
  {
    id: 'chaperon',
    p: 'Chaperón',
    s: 'Chapuza, algo mal hecho.',
    e: '¡Vaya chaperón me prepararon los pintores en la cocina!',
    f: 'tiatula2022'
  },
  {
    id: 'guindasbrevas',
    p: 'De guindas a brevas',
    s: 'Muy de vez en cuando.',
    e: 'Nos vemos de guindas a brevas.',
    f: 'tiatula2023'
  },
  {
    id: 'toscano',
    p: 'En el Toscano o debajo del reloj',
    s: 'Los sitios de quedar de toda la vida en el centro.',
    e: 'Quedamos a las doce debajo del reloj.',
    f: 'rtv2022',
    z: ['centro']
  }
];
