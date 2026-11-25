// Vuelos preparados del mapa en 3D (js/mapa-3d.js): adónde va la cámara (la, lo), con qué zoom, cuánto se
// inclina (pitch, grados desde la vertical) y hacia dónde mira (rumbo, grados desde el norte). Los puntos
// están comprobados con el relieve (relieve/): la cumbre y el fondo del cañón son el punto más alto y el
// más bajo de alrededor.
export const VUELOS_3D = [
  {
    id: 'pena-francia',
    n: '⛰ Peña de Francia',
    texto: 'La cumbre de la Sierra de Francia, con el santuario arriba (1.723 m)',
    la: 40.5125,
    lo: -6.169,
    zoom: 12.6,
    pitch: 68,
    rumbo: 200,
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Pe%C3%B1a_de_Francia']]
  },
  {
    id: 'arribes',
    n: '🏞 Cañón de las Arribes',
    texto: 'El Duero encajado entre España y Portugal, junto a Aldeadávila',
    la: 41.2,
    lo: -6.69,
    zoom: 12.4,
    pitch: 72,
    rumbo: 25,
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Arribes_del_Duero']]
  },
  {
    id: 'catedrales',
    n: '⛪ Teso de las catedrales',
    texto: 'La capital sobre su teso, con el Tormes a los pies',
    la: 40.9606,
    lo: -5.66636,
    zoom: 15.8,
    pitch: 68,
    rumbo: 345,
    fuente: [['Wikipedia', 'https://es.wikipedia.org/wiki/Catedral_Nueva_de_Salamanca']]
  }
];
