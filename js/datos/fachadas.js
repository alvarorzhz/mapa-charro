// La hora dorada (js/hora-dorada.js): fachadas de piedra de Villamayor a las que les da el sol al amanecer o
// al atardecer. Hacia dónde mira cada una no se escribe a mano: lo calcula `node herramientas/fachadas.js` con
// la planta del edificio en OpenStreetMap y lo guarda en js/datos/orientacion-fachadas.js.
// { id (no cambiar), monumento: id de MONUMENTOS, n: nombre de la fachada, sitio: desde dónde se ve,
//   edificio: 'way/N' o 'relation/N' de OpenStreetMap con su planta,
//   delante: 'node/N' de OpenStreetMap delante de la fachada (en la plaza o la calle de enfrente, o una puerta de
//     la propia fachada): se toma el lado de la planta más cercano que lo tiene enfrente,
//   hacia: 'fuera' (fachada de un edificio) o 'dentro' (lado de una plaza cerrada, que mira a la plaza; entonces
//     «delante» es un punto de sus soportales),
//   fuente: [[nombre, url]] que dice cuál es la fachada }
const FACHADAS = [
  {
    id: 'pm-real',
    monumento: 'plazamayor',
    n: 'Pabellón Real',
    sitio: 'Plaza Mayor, lado este',
    edificio: 'way/78180390',
    delante: 'node/918329229',
    hacia: 'dentro',
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Plaza_Mayor_de_Salamanca']]
  },
  {
    id: 'pm-ayuntamiento',
    monumento: 'plazamayor',
    n: 'Pabellón Consistorial (Ayuntamiento)',
    sitio: 'Plaza Mayor, lado norte',
    edificio: 'way/78180390',
    delante: 'node/599059413',
    hacia: 'dentro',
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Plaza_Mayor_de_Salamanca']]
  },
  {
    id: 'pm-sanmartin',
    monumento: 'plazamayor',
    n: 'Pabellón de San Martín',
    sitio: 'Plaza Mayor, lado sur',
    edificio: 'way/78180390',
    delante: 'node/951495676',
    hacia: 'dentro',
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Plaza_Mayor_de_Salamanca']]
  },
  {
    id: 'pm-petrineros',
    monumento: 'plazamayor',
    n: 'Pabellón de Petrineros',
    sitio: 'Plaza Mayor, lado oeste',
    edificio: 'way/78180390',
    delante: 'node/938878051',
    hacia: 'dentro',
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Plaza_Mayor_de_Salamanca']]
  },
  {
    id: 'universidad',
    monumento: 'universidad',
    n: 'Fachada de la Universidad',
    sitio: 'Patio de Escuelas',
    edificio: 'relation/1229115',
    delante: 'node/954663116',
    hacia: 'fuera',
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Fachada_de_la_Universidad_de_Salamanca']]
  },
  {
    id: 'catedral-oeste',
    monumento: 'catedrales',
    n: 'Fachada principal de la Catedral Nueva',
    sitio: 'plaza de Juan XXIII',
    edificio: 'way/297723030',
    delante: 'node/1353683074',
    hacia: 'fuera',
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Catedral_Nueva_de_Salamanca']]
  },
  {
    id: 'catedral-norte',
    monumento: 'catedrales',
    n: 'Fachada norte de la Catedral Nueva',
    sitio: 'plaza de Anaya',
    edificio: 'way/297723030',
    delante: 'node/617854251',
    hacia: 'fuera',
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Catedral_Nueva_de_Salamanca']]
  },
  {
    id: 'anaya',
    monumento: 'palacio-anaya',
    n: 'Fachada del Palacio de Anaya',
    sitio: 'plaza de Anaya',
    edificio: 'relation/394492',
    delante: 'node/597707792',
    hacia: 'fuera',
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Palacio_de_Anaya']]
  },
  {
    id: 'clerecia',
    monumento: 'clerecia',
    n: 'Fachada de la Clerecía',
    sitio: 'calle Compañía, frente a la Casa de las Conchas',
    edificio: 'way/466919455',
    delante: 'node/527526299',
    hacia: 'fuera',
    fuente: [
      [
        'Turismo de Salamanca',
        'https://salamanca-turismo-prod.gvam.es/en/see/monuments/iglesia-de-la-clerecia-y-universidad-pontificia'
      ]
    ]
  },
  {
    id: 'sanesteban',
    monumento: 'sanesteban',
    n: 'Fachada de San Esteban',
    sitio: 'plaza del Concilio de Trento, junto a la estatua de Francisco de Vitoria',
    edificio: 'relation/1591543',
    delante: 'node/620094086',
    hacia: 'fuera',
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Convento_de_San_Esteban_(Salamanca)']]
  },
  {
    id: 'monterrey',
    monumento: 'monterrey',
    n: 'Fachada del Palacio de Monterrey',
    sitio: 'frente a la iglesia de la Purísima',
    edificio: 'way/59010532',
    delante: 'node/4344778991',
    hacia: 'fuera',
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Palacio_de_Monterrey']]
  }
];
