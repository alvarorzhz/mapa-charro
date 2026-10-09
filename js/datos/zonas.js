// Zonas del mapa de la capital y su alfoz

// Grupos: el número de grupo de cada zona es su posición en esta lista
const NOMBRES_GRUPOS = [
  'Centro histórico',
  'Zona norte',
  'Zona este',
  'Zona oeste',
  'Zona sur, al otro lado del Tormes',
  'Alrededores',
  'Provincia'
];

// Barrios y pueblos grandes: su nombre se ve antes al alejar el mapa; los de la ciudad cuentan para el logro «Los grandes»
// prettier-ignore
const ZONAS_GRANDES = new Set([
  'centro', 'garridonorte', 'garridosur', 'pizarrales', 'prosperidad', 'tejares', 'vidal', 'capuchinos', 'carmelitas', 'sanjose', 'chamberi', 'villamayor', 'santamarta', 'carbajosa', 'cabrerizos', 'villares'
]);

// Otros nombres de una zona o de partes de ella: salen en su ficha y el buscador los encuentra
const OTROS_NOMBRES = {
  carmelitas: ['Carmelitas-Oeste (nombre oficial)', 'Eras de Carmelitas'],
  sancristobal: ['Las Claras'],
  ursulas: ['San Marcos'],
  rollo: ['Alto del Rollo', 'Las Pajas'],
  tejares: ['Lasalle', 'Tejares antiguo', 'La Fuente'],
  prosperidad: ['La Prospe'],
  marin: ['Marín I y II']
};

// Puntos de más para repartir el límite aproximado de una zona (herramientas/repartos.js): así un
// edificio conocido cae en su zona. [lat, lon]. La app no los usa: usa los límites ya calculados.
const SEMILLAS_REPARTO = {
  garridonorte: [[40.97375, -5.65006]] // plaza de Barcelona
};

// [id, nombre, etiqueta en el mapa (| = salto de línea), grupo, latitud, longitud, frase corta]
// El id se usa en el progreso guardado y en los enlaces (#id): no cambiarlo.
// prettier-ignore
const ZONAS = [
  ['centro', 'Centro', 'Centro', 0, 40.9652, -5.6645, 'Plaza Mayor barroca, catedrales y Clerecía: el corazón monumental de la ciudad.'],
  ['univ', 'Universidad', 'Universidad', 0, 40.96132, -5.66692, 'Aquí están la Universidad, con su rana, la Casa de las Conchas y la Cueva de Salamanca.'],
  ['sanvicente', 'San Vicente', 'San|Vicente', 0, 40.9631, -5.67168, 'Cuna de la ciudad: la aldea original nació en este cerro sobre el Tormes.'],
  ['sancti', 'Sancti-Spíritus', 'Sancti-Spíritus', 0, 40.96539, -5.65922, 'Toma el nombre de la iglesia de Sancti-Spíritus, en el lado este del casco histórico.'],
  ['sanjuan', 'San Juan', 'San|Juan', 0, 40.96783, -5.66614, 'Su nombre viene de la iglesia de San Juan de Barbalos, en el norte del casco.'],
  ['tenerias', 'Tenerías', 'Tenerías', 0, 40.95824, -5.66812, 'Creció al sur de las murallas, junto al Tormes; el nombre recuerda a las antiguas curtidurías.'],
  ['ursulas', 'Úrsulas-San Marcos', 'Úrsulas', 0, 40.96631, -5.6671, 'Con el Convento de la Anunciación, las Úrsulas, fundado por el arzobispo Fonseca en 1512.'],
  ['sancristobal', 'San Cristóbal', 'San|Cristóbal', 0, 40.96394, -5.65903, 'Barrio del este del casco, con la iglesia de San Cristóbal y su torre románica.'],
  ['sanesteban', 'San Esteban', 'San|Esteban', 0, 40.96014, -5.66252, 'Aquí está el Convento de San Esteban, dominico, con su fachada plateresca del siglo XVI.'],
  ['labradores', 'Labradores', 'Labradores', 1, 40.97039, -5.6594, 'Uno de los primeros ensanches del casco histórico; hoy, zona de bares y restaurantes.'],
  ['salesas', 'Salesas', 'Salesas', 1, 40.97381, -5.65991, 'Zona de ocio: cines, El Corte Inglés y la mayor calle de pinchos, Van Dyck.'],
  ['garridosur', 'Garrido Sur', 'Garrido|Sur', 1, 40.97191, -5.65397, 'Barrio obrero de ferroviarios, hoy un oasis residencial cerca del centro.'],
  ['estacion', 'Estación', 'Estación', 1, 40.97138, -5.64863, 'Nació para los trabajadores del ferrocarril, junto a la estación de tren.'],
  ['garridonorte', 'Garrido Norte', 'Garrido|Norte', 1, 40.97606, -5.64827, 'El barrio con más gente de la capital, con aire de pueblo dentro de la ciudad.'],
  ['chinchibarra', 'Chinchibarra', 'Chinchibarra', 1, 40.98001, -5.65426, 'Nació en torno a los depósitos de agua y tiene el parque Würzburg.'],
  ['glorieta', 'Glorieta', 'Glorieta', 1, 40.97727, -5.66125, 'Barrio de la plaza de toros de La Glorieta, entre la avenida de San Agustín y la carretera de Zamora.'],
  ['ciudadjardin', 'Ciudad Jardín', 'Ciudad|Jardín', 1, 40.9819, -5.6592, 'Pequeño barrio obrero de los años cincuenta entre las avenidas de San Agustín y de la Merced.'],
  ['alamedilla', 'Alamedilla', 'Alamedilla', 2, 40.96785, -5.65625, 'Crece alrededor del parque que le da nombre.'],
  ['santotomas', 'Santo Tomás', 'Santo|Tomás', 2, 40.96168, -5.65816, 'Se extiende desde la Alamedilla casi hasta el río.'],
  ['fontana', 'Fontana', 'Fontana', 2, 40.95637, -5.66122, 'Une el centro con el río hacia el este.'],
  ['delicias', 'Delicias', 'Delicias', 2, 40.96654, -5.65401, 'Barrio hermano de San Isidro, crecido junto a las fábricas.'],
  ['sanisidro', 'San Isidro', 'San|Isidro', 2, 40.96515, -5.65088, 'Barrio hermano de Delicias, de origen obrero.'],
  ['prosperidad', 'Prosperidad', 'Prosperidad', 2, 40.96019, -5.65213, 'Nació con la llegada de gente de los pueblos a las fábricas junto al Tormes.'],
  ['rollo', 'Rollo-Las Pajas', 'Rollo', 2, 40.96838, -5.64741, 'Barrio tradicional y tranquilo, con esencia de pueblo.'],
  ['puenteladrillo', 'Puente Ladrillo', 'Puente|Ladrillo', 2, 40.97199, -5.6384, 'Empezó como colonia de ferroviarios, casi un pueblo aparte.'],
  ['carmelitas', 'Barrio del Oeste', 'Barrio del|Oeste', 3, 40.97106, -5.6672, 'Entre la avenida de Villamayor y el paseo de las Carmelitas: ocio y arte urbano.'],
  ['sanbernardo', 'San Bernardo', 'San|Bernardo', 3, 40.9674, -5.67603, 'Barrio universitario, junto al Campus Unamuno y la estación de autobuses.'],
  ['hospitales', 'Hospital', 'Hospital', 3, 40.96292, -5.67543, 'Aquí están el Campus Unamuno y los hospitales públicos, junto al río.'],
  ['carmen', 'El Carmen', 'Carmen', 3, 40.97434, -5.67485, 'Hermano pequeño de Pizarrales, entre la zona universitaria y la trabajadora.'],
  ['vidal', 'Vidal', 'Vidal', 3, 40.97525, -5.66614, 'Limita con Carmelitas-Oeste por la avenida de Portugal, cerca de la plaza de toros.'],
  ['pizarrales', 'Pizarrales', 'Pizarrales', 3, 40.97632, -5.67964, 'Nació a principios del siglo XX con casas levantadas en el camino a Villamayor.'],
  ['blanco', 'Blanco', 'Blanco', 3, 40.97783, -5.67084, 'Barriada en cuesta que levantaron sus propios vecinos sobre terrenos baldíos.'],
  ['capuchinos', 'Capuchinos', 'Capuchinos', 3, 40.98138, -5.66631, 'El «Barrio Dorado»: casi todo en piedra de Villamayor, y con el mayor Carrefour de la ciudad.'],
  ['platina', 'La Platina', 'Platina', 3, 40.9678, -5.68742, 'Barrio nuevo, todavía en desarrollo, junto a Huerta Otea.'],
  ['huertaotea', 'Huerta Otea', 'Huerta|Otea', 3, 40.9642, -5.6867, 'Barrio joven junto al Tormes, entre La Platina y El Marín, sobre una antigua finca de huertas.'],
  ['arrabal', 'Arrabal', 'Arrabal', 4, 40.9562, -5.67172, 'Al otro lado del Puente Romano, con el verraco y la escultura del Lazarillo.'],
  ['tormes', 'Tormes', 'Tormes', 4, 40.95312, -5.66554, 'Barrio ribereño, hermano del Arrabal y de Chamberí.'],
  ['chamberi', 'Chamberí', 'Chamberí', 4, 40.95569, -5.68316, 'Casi todo lo levantaron sus propios vecinos; vida muy de pueblo.'],
  ['salasbajas', 'Salas Bajas', 'Salas|Bajas', 4, 40.9574, -5.682, 'Antiguas huertas de la orilla sur del Tormes: huertos urbanos, deporte universitario y casas junto al río.'],
  ['tejares', 'Tejares', 'Tejares', 4, 40.95512, -5.69879, 'Fue pueblo hasta 1963; la tradición sitúa aquí el nacimiento del Lazarillo, en la pesquera.'],
  ['buenosaires', 'Buenos Aires', 'Buenos|Aires', 4, 40.95415, -5.70532, 'Barrio en el límite oeste de la ciudad, vecino de Tejares.'],
  ['alambres', 'Alambres-San Buenaventura', 'Alambres', 4, 40.95139, -5.68466, 'Pasó de corrales de ganado a barrio que busca su identidad; muy ligado a Chamberí.'],
  ['zurguen', 'El Zurguén', 'Zurguén', 4, 40.94467, -5.67306, 'Nació en 1997 con vivienda protegida, en la salida sur, junto a la antigua N-630.'],
  ['vistahermosa', 'Vistahermosa', 'Vistahermosa', 4, 40.94856, -5.6789, 'Fue mirador de la ciudad y hoy es barrio dormitorio de población joven.'],
  ['vega', 'La Vega', 'Vega', 4, 40.95089, -5.66761, 'Se inauguró en 1954 como un pueblo de casas blancas al otro lado del Tormes.'],
  ['teso', 'Teso de la Feria', 'Teso', 4, 40.95191, -5.67252, 'Aquí se celebraban la mayor parte de las ferias de ganado.'],
  ['sanjose', 'San José', 'San José', 4, 40.94926, -5.66156, 'Barrio obrero y muy reivindicativo, con muchas instalaciones deportivas.'],
  ['marin', 'Marín', 'Marín', 3, 40.96171, -5.69547, 'Barrio pequeño del oeste, a orillas del Tormes y frente a Tejares.'],
  ['alcaldes', 'Los Alcaldes', 'Los|Alcaldes', 4, 40.95188, -5.69065, 'Barrio al otro lado del río, entre Los Alambres y Tejares.'],
  ['montalvos', 'El Montalvo', 'El Montalvo', 4, 40.94121, -5.66518, 'El barrio más al sur de la capital, junto al polígono de El Montalvo y la salida hacia Béjar.'],
  ['villamayor', 'Villamayor', 'Villamayor', 5, 40.99839, -5.69584, 'Sus canteras dieron la piedra dorada de la Salamanca monumental.'],
  ['aldeatejada', 'Aldeatejada', 'Aldeatejada', 5, 40.92497, -5.69108, 'Unos 2.700 vecinos al sur de la capital; su vecino más cercano es Vistahermosa.'],
  ['villares', 'Villares de la Reina', 'Villares|de la Reina', 5, 41.00916, -5.64896, 'Unos 6.800 vecinos y un gran polígono industrial.'],
  ['cabrerizos', 'Cabrerizos', 'Cabrerizos', 5, 40.97866, -5.609, 'Unos 4.200 vecinos; fue el primero del alfoz en explotar el boom de los chalets.'],
  ['santamarta', 'Santa Marta de Tormes', 'Santa Marta', 5, 40.94921, -5.63062, 'Segundo municipio de la provincia, con unos 15.000 vecinos, pegado a la capital.'],
  ['carbajosa', 'Carbajosa de la Sagrada', 'Carbajosa', 5, 40.93293, -5.65083, 'Pasó de unos 1.700 vecinos en el año 2000 a casi 7.800: el que más ha crecido.'],
  ['doninos', 'Doñinos de Salamanca', 'Doñinos', 5, 40.95923, -5.74614, 'Unos 1.900 vecinos, a unos 7 km de la capital, hacia el oeste.'],
  ['carrascal', 'Carrascal de Barregas', 'Carrascal|de Barregas', 5, 40.97855, -5.76156, 'Unos 1.100 vecinos y un término de 77 km², al oeste de la capital.'],
  ['pelabravo', 'Pelabravo', 'Pelabravo', 5, 40.93668, -5.5791, 'Pueblo al sureste de la capital, con unos 1.400 vecinos.'],
  ['moriscos', 'Moriscos', 'Moriscos', 5, 41.0081, -5.5831, 'Pueblo de La Armuña a unos 9 km de la capital; su origen se remonta al siglo XIV.'],
  ['castmoriscos', 'Castellanos de Moriscos', 'Castellanos|de Moriscos', 5, 41.0185, -5.5902, 'En La Armuña, a unos 8 km de la capital y con unos 3.100 vecinos.'],
  ['castvilliquera', 'Castellanos de Villiquera', 'Castellanos|de Villiquera', 5, 41.05221, -5.69486, 'Pueblo al norte, a unos 11 km de la capital, con unos 700 vecinos.']
];
