// Rutas a pie. Cada una: id (va en los enlaces: #ruta es la monumental, #ruta-<id> las demás), nombre,
// icono, resumen, fuente [medio, url] del resumen y paradas en orden.
// Paradas: el id de un monumento (MONUMENTOS) o un sitio propio:
//   { id, n (nombre), la, lo, dir (dirección), detalle (autor, tapa…), texto, fuente: [medio, url] }
// El camino entre paradas está en js/datos/tramos.js: si cambian las paradas, node herramientas/rutas.js <id>.
const RUTAS = [
  {
    id: 'monumental',
    nombre: 'Ruta monumental',
    icono: '🏛️',
    resumen: 'Las joyas del casco histórico, de la Plaza Mayor al Puente Romano.',
    paradas: [
      'plazamayor',
      'conchas',
      'clerecia',
      'universidad',
      'catedrales',
      'cueva',
      'huerto',
      'casalis',
      'puenteromano'
    ]
  },
  {
    id: 'murales',
    nombre: 'Murales del Barrio del Oeste',
    icono: '🎨',
    resumen:
      'La Galería Urbana del Barrio del Oeste: más de cien obras en medianeras, puertas de garaje y persianas, abierta las 24 horas y ampliada cada primavera desde 2013.',
    fuente: ['Galería Urbana de Salamanca (ZOES)', 'https://galeriaurbanasalamanca.es/GaleriaUrbana.pdf'],
    paradas: [
      {
        id: 'diaspora',
        n: 'Diáspora',
        la: 40.97044,
        lo: -5.66826,
        dir: 'Calle Granero 1-3',
        detalle: 'David de la Mano · 2014',
        texto:
          'Una de las primeras medianeras de la galería. El artista salmantino la resolvió solo en blanco y negro, fiel a su estilo de siluetas humanas.',
        fuente: ['Galería Urbana de Salamanca (ZOES)', 'https://galeriaurbanasalamanca.es/GaleriaUrbana.pdf']
      },
      {
        id: 'musa',
        n: 'La Musa del Oeste',
        la: 40.97061,
        lo: -5.66753,
        dir: 'Plaza del Oeste',
        detalle: 'Sfhir · 2025',
        texto:
          'Ocupa más de 100 m², repartidos entre dos medianeras y el patio que queda entre ellas: una de las musas de inspiración musical de su autor.',
        fuente: [
          'Tribuna Salamanca',
          'https://www.tribunasalamanca.com/noticias/402668/el-impresionante-mural-de-la-musa-del-artista-urbano-sfhir-en-la-plaza-del-oeste'
        ]
      },
      {
        id: 'geppetto',
        n: 'Geppetto',
        la: 40.96978,
        lo: -5.66763,
        dir: 'Calle Asturias 5, esquina con Juan de Juni',
        detalle: 'Milu Correch · 2014',
        texto:
          'Unos 500 m² de medianera con el carpintero que talló a Pinocho. Es probablemente el mural más famoso del barrio, y está iluminado para verlo también de noche.',
        fuente: [
          'La Gaceta de Salamanca',
          'https://www.lagacetadesalamanca.es/salamanca/barrio-oeste-suma-mural-prestigio-internacional-20240415194952-nt.html'
        ]
      },
      {
        id: 'nido',
        n: 'Nido',
        la: 40.97012,
        lo: -5.66631,
        dir: 'Calle Wences Moreno 13',
        detalle: 'Pablo S. Herrero · 2014',
        texto:
          'Las ramas pintadas trepan por la fachada hasta convertir el bloque en un árbol; en el barrio lo llaman el «Edificio Nido».',
        fuente: [
          'Rutas por España',
          'https://www.rutasporespana.es/blog/rutas-de-arte-urbano-el-barrio-del-oeste-de-salamanca/'
        ]
      },
      {
        id: 'paraiso',
        n: 'Paraíso',
        la: 40.97192,
        lo: -5.66681,
        dir: 'Avenida de Italia 46, esquina con Islas Canarias',
        detalle: 'Murfin · 2026',
        texto:
          'La obra más reciente de la ruta, de la XVI edición de la galería (abril de 2026): un gran sol para iluminar una esquina de edificios grises.',
        fuente: [
          'Galería Urbana de Salamanca (ZOES)',
          'https://galeriaurbanasalamanca.es/portfolio_item/paraiso/'
        ]
      },
      {
        id: '37007',
        n: '37007',
        la: 40.97204,
        lo: -5.66806,
        dir: 'Calle Ledesma 8',
        detalle: 'Gennaro Ciccimarra · 2017',
        texto:
          'Su título es el código postal del barrio. Lo pintó el italiano Ciccimarra en la VI edición de la Galería Urbana, con espray y esmaltes.',
        fuente: [
          'Galería Urbana de Salamanca (ZOES)',
          'https://galeriaurbanasalamanca.es/portfolio_item/37007/'
        ]
      },
      {
        id: 'nino',
        n: 'El niño de las pinturas',
        la: 40.972,
        lo: -5.66919,
        dir: 'Calle Gutenberg 16',
        detalle: 'Raúl Ruiz · 2021',
        texto: 'Pintado como obra de artista invitado en la X edición de la Galería Urbana, en 2021.',
        fuente: [
          'Galería Urbana de Salamanca (ZOES)',
          'https://galeriaurbanasalamanca.es/portfolio_item/el-nino-de-la-pinturas/'
        ]
      },
      {
        id: 'fuente',
        n: 'La Fuente Animada',
        la: 40.9723,
        lo: -5.6697,
        dir: 'Calle Valle-Inclán 18, esquina con Vitigudino',
        detalle: 'Yoseba MP · 2019',
        texto:
          'Unos cien metros de medianera junto a la fuente de la plaza, con dos vecinos reales del barrio como protagonistas.',
        fuente: [
          'ZOES',
          'https://zoes.es/2019/06/12/yoseba-mp-y-la-ultima-obra-de-arte-urbano-en-el-barrio-historias-del-oeste-de-radio-oeste/'
        ]
      }
    ]
  },
  {
    id: 'vandyck',
    nombre: 'De tapas por Van Dyck',
    icono: '🍢',
    resumen:
      'Van Dyck, el corazón del tapeo salmantino: más de treinta bares a un cuarto de hora del centro, con terrazas, ambiente y precios asequibles.',
    fuente: [
      'SALAMANCArtv AL DÍA, julio de 2025',
      'https://salamancartvaldia.es/noticia/2025-07-06-van-dyck-el-corazon-del-tapeo-salmantino-que-late-con-historia-y-sabor-372079'
    ],
    paradas: [
      {
        id: 'fresa',
        n: 'La Fresa Vinos y Tapas',
        la: 40.97265,
        lo: -5.65843,
        dir: 'Calle Van Dyck 8',
        detalle: 'Para pedir: carrillera con cebolla caramelizada y morcilla picante',
        texto:
          'Clásico de la calle con casi cuarenta años y aire taurino: guisos de siempre, casquería y buena selección de vinos para empezar la ruta.',
        fuente: ['Mira Espanha, 2026', 'https://miraespanha.com/en/where-to-eat-in-salamanca/']
      },
      {
        id: 'chinitas',
        n: 'Café de Chinitas',
        la: 40.97291,
        lo: -5.65906,
        dir: 'Calle Van Dyck 18',
        detalle: 'Para pedir: farinato y morcilla a la plancha',
        texto:
          'Negocio familiar con más de medio siglo y cocina salmantina tradicional; buena barra para probar el farinato.',
        fuente: ['La Maleta Inquieta, 2026', 'https://lamaletainquieta.com/tapas-salamanca/']
      },
      {
        id: 'ermitano',
        n: 'La Posada del Ermitaño',
        la: 40.97298,
        lo: -5.65926,
        dir: 'Calle Van Dyck 24',
        detalle: 'Para pedir: tostas y callos',
        texto:
          'Vinoteca de tapas generosas y precios contenidos; sus tostas y unos callos de toda la vida justifican la parada.',
        fuente: ['Wanderlog, 2026', 'https://wanderlog.com/place/details/3082018']
      },
      {
        id: 'faroles',
        n: 'Mesón Los Faroles',
        la: 40.97304,
        lo: -5.65947,
        dir: 'Calle Van Dyck 26',
        detalle: 'Para compartir: la parrillada',
        texto:
          'Mesón de cocina casera y tradicional, con algún plato más elaborado; si vais en grupo, la parrillada es para compartir.',
        fuente: ['Gastroranking, 2026', 'https://gastroranking.es/r/meson-los-faroles_12948/']
      },
      {
        id: 'navilla',
        n: 'Mesón La Navilla',
        la: 40.97359,
        lo: -5.66008,
        dir: 'Calle Pizarro 42',
        detalle: 'Para pedir: sus tostas',
        texto:
          'A una manzana de Van Dyck, con buenas tostas y buenos vinos. Su «Ayuso al mar verde» fue la mejor tapa del I Concurso de Tapas Van Dyck y Alrededores, en 2021.',
        fuente: ['Guía Repsol', 'https://www.guiarepsol.com/es/fichas/restaurante/meson-la-navilla-325699/']
      },
      {
        id: 'vandyck50',
        n: 'Bar de Tapas Van Dyck 50',
        la: 40.97329,
        lo: -5.66143,
        dir: 'Calle Van Dyck 50',
        detalle: 'Para pedir: brochetas de pollo o de langostinos',
        texto:
          'Bar de tapas clásicas donde mandan las brochetas; también montaditos y tostas, con el queso de cabra como especialidad.',
        fuente: ['Mira Espanha, 2026', 'https://miraespanha.com/en/where-to-eat-in-salamanca/']
      },
      {
        id: 'cochinillo',
        n: 'Don Cochinillo',
        la: 40.97327,
        lo: -5.66209,
        dir: 'Calle Van Dyck 55-57',
        detalle: 'Para pedir: cochinillo asado o champiñones rellenos',
        texto:
          'Para cerrar la ruta, la casa del cochinillo asado; si queréis algo más ligero, pedid en la barra sus champiñones rellenos.',
        fuente: [
          'Turismo de Castilla y León',
          'https://www.turismocastillayleon.com/es/servicios/comer/restaurantes/don-cochinillo'
        ]
      }
    ]
  }
];
