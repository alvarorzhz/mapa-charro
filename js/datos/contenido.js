// Contenido de las fichas: curiosidades, leyendas, fotos y dónde comer
// Todo el contenido lleva fuente verificable (ver «Sobre los datos» en index.html). Las claves son ids de zona.

// Curiosidades: { idZona: [párrafo, ...] }. Si una zona no tiene, la ficha muestra su frase corta.
const CURIOSIDADES = {
  centro: [
    'La Plaza Mayor es barroca, obra de los Churriguera: se levantó entre 1729 y 1756. No es un cuadrado perfecto, porque sus cuatro lados miden distinto.',
    'Cada 25 de julio se coloca en lo alto la Mariseca, un toro de lata que anuncia las corridas de las ferias.',
    'La Torre del Clavero, del siglo XV, mide unos 28 metros. El clavero era quien guardaba las llaves y los archivos de la Orden de Alcántara.'
  ],
  univ: [
    'La Universidad la fundó Alfonso IX de León en 1218. Su fachada esconde una rana sobre una calavera: dicen que da suerte a quien la encuentra.',
    'En la Catedral Nueva, durante la restauración de 1992, un cantero talló un astronauta en la Puerta de Ramos.',
    'Cada 31 de octubre el Mariquelo sube con su gaita a la torre de la Catedral para dar gracias porque el terremoto de Lisboa de 1755 no la derribó.',
    'La Casa de las Conchas lleva más de 300 conchas en su fachada, y sus sótanos sirvieron de cárcel para estudiantes castigados.'
  ],
  sanvicente: [
    'Es la cuna de la ciudad: en este cerro sobre el Tormes se asentaron los vetones, y su castro fue el que asedió Aníbal en el 220 antes de Cristo.',
    'Debe su nombre al antiguo convento benedictino de San Vicente. En la Guerra de la Independencia los franceses lo usaron de cuartel, quedó en ruinas y la zona pasó a llamarse Barrio de los Caídos.',
    'Aquí están el Colegio del Arzobispo Fonseca, del siglo XVI, y el Palacio de Congresos de 1992, levantado donde estuvo el antiguo «barrio chino». Junto a él hay una estatua del cantaor Rafael Farina, de Agustín Casillas.'
  ],
  sancti: [
    'Fue parroquia desde 1190 y convento desde 1268, fundado por Martín Alfonso, hijo de Alfonso IX, y su esposa María Méndez; los dos están enterrados dentro.',
    'Lo llevaban las comendadoras de la Orden de Santiago, que acogían a las mujeres de los caballeros salmantinos mientras ellos estaban en la guerra.',
    'Guarda el Cristo de los Milagros, del siglo XIV, y un artesonado mudéjar en el coro.'
  ],
  sanjuan: [
    'La iglesia de San Juan de Barbalos es de 1150 y la levantaron los caballeros de la Orden del Hospital de San Juan de Jerusalén. «Barbalos» era el pueblo donde la orden tenía sus tierras.',
    'Dentro está el Cristo de la Zarza, del siglo XII: una talla en nogal de unos dos metros.'
  ],
  tenerias: [
    'Su nombre viene de las tenerías, los talleres donde se curtían las pieles junto al río. Antes se le llamó barrio de Santiago.',
    'La iglesia de Santiago, junto al Puente Romano, la fundaron los mozárabes a mediados del siglo XII; era la puerta de entrada de los peregrinos de la Vía de la Plata.',
    'El 26 de enero de 1626 la riada de San Policarpo arrasó la ribera: murieron 142 personas, más de 1.500 viviendas sufrieron daños y se hundieron cuatro arcos del Puente Romano.'
  ],
  ursulas: [
    'Con el Convento de la Anunciación, las Úrsulas, fundado por el arzobispo Fonseca en 1512. Enfrente, en la calle Bordadores, está la Casa de las Muertes.'
  ],
  sancristobal: [
    'La iglesia de San Cristóbal es de 1128 y desde 1145 fue de la Orden de San Juan de Jerusalén. En 1919 se convirtió en colegio, cerró en 1960 y se restauró a partir de 1991.',
    'Bajo su ábside apareció una necrópolis con tumbas excavadas en la roca, y dentro se guarda el Cristo de los Carboneros, una talla románica.',
    'En el convento de Santa Clara, en febrero de 1973, unos obreros que arreglaban el tejado encontraron un artesonado mudéjar de los siglos XIV y XV, oculto unos 250 años sobre la bóveda barroca. Hoy se visita por pasarelas.'
  ],
  sanesteban: [
    'En 1527 encarcelaron aquí a Ignacio de Loyola, y Colón se alojó con los dominicos mientras buscaba apoyo para su viaje. La fachada del convento es plateresca.'
  ],
  labradores: [
    'Su nombre viene de las tierras de labranza que había aquí. Desde 1900 fue el primer ensanche de la ciudad; ya en 1858 un plano mostraba un camino llamado Ronda de Labradores.',
    'A la avenida de Portugal la llamaban el «Broadway charro» por sus cines, bares y salas de fiesta, y en carnaval llegaban a juntarse mil disfrazados entre la calle Valencia y la avenida.',
    'El Mercado de San Juan se proyectó en 1939, obra de Luis Gutiérrez Soto y Javier Barroso.'
  ],
  salesas: [
    'El nombre viene del monasterio de las Salesas, de la Orden de la Visitación, fundado en 1910; hoy es la parroquia de María Mediadora.',
    'Aquí estuvieron los cuarteles: el de Ingenieros General Arroquia, neoplateresco, de los años veinte, y el de Caballería Julián Sánchez «El Charro», en cuyo lugar está hoy El Corte Inglés.',
    'Los niños jugaban a indios y vaqueros en los solares y fábricas abandonadas que había hasta la plaza de Madrid.'
  ],
  garridosur: [
    'Nació con las «casas baratas» en hilera que promovieron Manuel Garrido, concejal, y Santiago Bermejo, confitero. En 1916 la prensa ya hablaba de la barriada de Garrido y Bermejo.',
    'La primera piedra de la iglesia de la Virgen de Fátima se puso en 1955 y se inauguró en 1960. En la esquina de Federico Anaya con María Auxiliadora estaba el cine Taramona.',
    // Fuente: https://salamancartvaldia.es/noticia/2023-12-10-garrido-y-bermejo-el-nacimiento-del-barrio-garrido-335932
    'Manuel Garrido, que da nombre al barrio, fue elegido concejal en 1917 por el mismo distrito que Miguel de Unamuno, y con más votos: 318 frente a 205.'
  ],
  garridonorte: [
    'Es el barrio con más vecinos de la capital: dicen que quien no gana Garrido no gana el Ayuntamiento.',
    'Nació a finales del siglo XIX, con la llegada del tren. El parque Garrido se inauguró el 7 de diciembre de 1974.',
    'El Multiusos Sánchez Paraíso se construyó para la Capitalidad Cultural Europea de 2002, y la mezquita de la plaza García Lorca ocupa la antigua tienda El Manolo.',
    // Fuente: https://www.elespanol.com/castilla-y-leon/region/salamanca/20211209/garrido-norte-crisol-razas-culturas-ciudad-salamanca/633437537_0.html
    'En la inauguración de la plaza de Barcelona, diseñada por Antonio Fernández Alba, el alcalde barcelonés Pasqual Maragall empezó su discurso con «¡Queridos ciudadanos de Málaga!».'
  ],
  estacion: [
    'Nació junto a la estación para las familias del ferrocarril. El tren llegó a Salamanca a finales del siglo XIX y con él creció todo Garrido.',
    // Fuente: https://www.salamancaenelayer.com/2012/09/la-estacion-de-ferrocarril.html
    'La línea de Medina del Campo a Salamanca se inauguró oficialmente el 9 de septiembre de 1877, con el rey Alfonso XII presente.',
    // Fuente: https://www.salamancaenelayer.com/2012/09/la-estacion-de-ferrocarril.html
    'La vieja estación se derribó en 1970 y la nueva se inauguró en 1973. En 2001 se levantó Vialia, que une estación y centro comercial.',
    // Fuente: https://www.lagacetadesalamanca.es/salamanca/asi-se-transformo-el-paseo-de-la-estacion-vida-e-industria-en-torno-al-tren-CH6382994
    'El paseo de la Estación se llamó también avenida de Canals y del General Mola. A su alrededor hubo fábricas de chocolate, galletas, hielo o gaseosa que repartían sus productos en tren.'
  ],
  chinchibarra: [
    'Su nombre, según los historiadores locales, podría venir del vasco. Creció alrededor del depósito de agua, inaugurado en 1945 el día de San Juan de Sahagún.',
    'Se proyectaron hasta doscientos bloques de viviendas, algunos de nueve plantas, pero apenas se levantó una decena de tres alturas.',
    'A finales de los setenta aquí se ponían las ferias, antes de mudarse a La Aldehuela. Hoy tiene el parque Würzburg, la biblioteca Torrente Ballester y el Conservatorio Superior de Música.'
  ],
  glorieta: [
    'La plaza de toros de La Glorieta la impulsaron los comerciantes a finales del siglo XIX, y a su lado estuvo, a comienzos del XX, el primer campo de fútbol de la ciudad.'
  ],
  alamedilla: [
    'Fue el primer parque moderno de Salamanca: el terreno se compró en 1879 y se inauguró en 1884.',
    'El nombre viene de los álamos negrillos que se plantaron en el paseo del Rollo a finales del siglo XVIII. Aún conserva un cedro del Líbano de más de 125 años.',
    'Tiene cinco esculturas de Agustín Casillas, de 1963, como el «Rapto de Europa», y un tren de hormigón de 1961 en la zona infantil.'
  ],
  santotomas: [
    'La iglesia de Santo Tomás Cantuariense la fundaron en 1175 dos hermanos ingleses, Ricardo y Randulfo. Fue la primera fuera de Inglaterra dedicada a Tomás Becket, canonizado muy poco antes.',
    'En la repoblación medieval esta parte de la ciudad se llenó de colonos portugueses.'
  ],
  delicias: [
    'Lo bautizaron los ferroviarios que vivían aquí, inspirados en el barrio madrileño de Las Delicias.',
    'El colegio de las Esclavas, de 1905, es de piedra de Villamayor. En 1983 su huerta se convirtió en el parque Picasso, de 8.000 metros cuadrados.',
    'El depósito de aguas de Campoamor, de 1914, se derribó en 2002; en su solar está hoy el Museo del Comercio.'
  ],
  sanisidro: [
    'Toma el nombre de su iglesia. Creció tras la Guerra Civil con casas bajas alrededor del antiguo hospicio de San Rafael, que hoy es una residencia de mayores.',
    'Sus vecinos trabajaban en el ferrocarril y en las fábricas del Alto del Rollo. El mercado de la plaza de Trujillo se convirtió a principios de este siglo en un centro cultural.',
    // Fuente: https://www.salamancaenelayer.com/2019/11/el-asilo-de-san-rafael.html
    'La residencia de San Rafael viene del asilo que fundó en 1874 el médico salmantino Rafael Pérez Piñuela; en 1908 se trasladó a una finca del paseo del Rollo, frente a las Esclavas.'
  ],
  prosperidad: [
    'Su nombre imita al de un ensanche madrileño y recuerda a quienes llegaban de los pueblos buscando prosperar. Esteban Corral, que hizo fortuna en Argentina, parceló los terrenos y bautizó calles como México, Perú o Argentina.',
    'Nació a principios del siglo XX en Cuatro Caminos, entre huertas que bajaban hasta el río. Sus vecinos trabajaban en la fábrica de fertilizantes Mirat, el ferrocarril, curtidurías e imprentas.',
    // Fuente: https://www.ub.edu/geocrit/sn/sn-146(139).htm
    'Entre 1919 y 1922 se levantaron, junto al Depósito de Aguas de 1917, casas de una planta para unos 250 vecinos: fue el germen del barrio.',
    // Fuente: https://www.elespanol.com/castilla-y-leon/region/20180311/prosperidad-camino-agua-progreso/291221741_0.html
    'La antigua prisión provincial se convirtió en el DA2, museo de arte contemporáneo, con la Capitalidad Cultural Europea de 2002.'
  ],
  rollo: [
    'Lo parceló el mismo contratista que después creó la Prosperidad, Esteban Corral y Castro.',
    'Aquí está el Museo del Comercio y la Industria, con la antigua marca de la fábrica Mirat en su fachada.'
  ],
  puenteladrillo: [
    'Su nombre viene del puente de ladrillo que cruza las vías del tren hacia Madrid. Hace casi 150 años lo levantaron familias de ferroviarios junto a los talleres de reparación.',
    'La iglesia de la Asunción la construyeron los vecinos sin licencia municipal. El alcantarillado y el agua corriente no llegaron hasta los años setenta, y el primer supermercado, en 1993.',
    // Fuente: https://www.lagacetadesalamanca.es/salamanca/el-barrio-salmantino-que-nacio-ligado-al-ferrocarril-HN7168449
    'El 18 de diciembre de 1936 diez aviones bombardearon la estación. Una bomba dirigida al puente no lo alcanzó, pero mató a tres vecinos de una casa junto a la vía.',
    // Fuente: https://www.lagacetadesalamanca.es/salamanca/el-barrio-salmantino-que-nacio-ligado-al-ferrocarril-HN7168449
    'Muchos vecinos se despertaban con «la burra», la bocina de vapor de los talleres de Renfe. El puente se hizo hacia 1889 con ladrillo de La Cerámica Salmantina.'
  ],
  carmelitas: [
    'La asociación de vecinos ZOES nació en 1977, con una cuota de 25 pesetas al mes, para pedir asfalto y agua potable.',
    'Desde 2013 su Galería Urbana llena el barrio de grafitis y murales de artistas de toda España.',
    'Tiene más de 400 comercios, entre ellos unas 35 peluquerías, y la calle Wences Moreno es la segunda más comercial de la ciudad.'
  ],
  sanbernardo: [
    'Los monjes bernardos llegaron en 1581; su convento lo destruyeron los franceses en la Guerra de la Independencia. El nombre oficial de barrio llegó en 1979.',
    'El primer bloque de viviendas, el grupo Mariano Rodríguez, es de los años cuarenta. En 1975 llegaron la estación de autobuses y el mercado.',
    'Desde los años ochenta sus zonas verdes funcionan como un museo de esculturas al aire libre.'
  ],
  hospitales: [
    'Aquí están el Hospital Clínico y el Campus Miguel de Unamuno, con las facultades de Derecho, Economía y Medicina.',
    // Fuente: https://es.wikipedia.org/wiki/Complejo_Hospitalario_de_Salamanca
    'El Hospital Clínico y el edificio Materno-Infantil los inauguraron en 1975 los entonces príncipes Juan Carlos y Sofía.',
    // Fuente: https://www.casareal.es/ES/Actividades/Paginas/actividades_actividades_detalle.aspx?data=15593
    'El rey Felipe VI inauguró el nuevo Hospital Universitario el 17 de enero de 2023. Tiene 863 camas y 25 quirófanos.',
    // Fuente: https://www.lagacetadesalamanca.es/salamanca/el-campus-unamuno-un-ejemplo-de-la-arquitectura-contemporanea-CG9899433
    'El primer edificio del Campus Unamuno fue la Facultad de Farmacia, inaugurada en 1980 y obra de los arquitectos Julio Cano Lasso e Ignacio Mendaro.'
  ],
  pizarrales: [
    'Nació a comienzos del siglo XX con casas de pizarra y sin permisos (la licencia oficial llegó en 1966). Los vecinos llevaron el agua hasta sus casas a pico y pala.',
    'En pocos años tuvo de todo: iglesia en 1916, sociedad de socorros mutuos en 1917, escuela en 1918 y depósito de agua en 1927. Bebían de fuentes como el caño Mamarón o la Cagalona.',
    'Tuvo el cine del señor Ulpiano y un teatro en el local de la señora Victorina.'
  ],
  blanco: [
    'Su nombre viene de sus primeras casas de una planta, blancas como la nieve.',
    'La calle Don Quijote es la de mayor pendiente de Salamanca. Los propios vecinos hicieron las tuberías del agua trabajando los fines de semana.',
    // Fuente: https://www.consejosocialbarriospbc.es/barrio-blanco/
    'En 1930 solo vivían aquí seis matrimonios con sus hijos, seguramente atraídos por la obra del cercano Cuartel de Ingenieros. Levantaron sus casas entre todos, en terrenos baldíos y llenos de cuestas.',
    // Fuente: https://www.consejosocialbarriospbc.es/barrio-blanco/
    'Por la Santa Misión de 1950 se predicó aquí bajo un techado de lonas, y en su recuerdo las calles se rebautizaron: La Misión, Nazaret, San Luis Gonzaga…',
    // Fuente: https://www.consejosocialbarriospbc.es/barrio-blanco/
    'En 1955, dirigidos por Saturnino Barrios y Antonio Berrocal, los vecinos llevaron con su trabajo el agua y el alcantarillado a casi cien casas. El resto del barrio esperó hasta 1958.',
    // Fuente: https://www.elespanol.com/castilla-y-leon/region/salamanca/20211112/barrio-blanco-pueblo-dentro-salamanca/626188394_0.html
    'La calle Regato del Anís recuerda un arroyo que hoy va bajo el asfalto. El nombre era irónico: olía fatal. Antes, el agua se compraba en el pozo de la «Señora Anita».',
    // Fuente: https://www.elespanol.com/castilla-y-leon/region/salamanca/20211112/barrio-blanco-pueblo-dentro-salamanca/626188394_0.html
    'Donde hoy pasa la avenida de Salamanca solo había un camino de tierra, y allí se montaban el circo y la feria. Los niños se dividían en dos bandos: «los de arriba» y «los de abajo».'
  ],
  capuchinos: [
    'Antes se llamaba La Charca-Capuchinos, por una pequeña poza que había aquí, entre los caminos de Toro y Zamora.',
    'Creció desde 1989 con el hipermercado Pryca, el actual Carrefour, y casi todas sus fachadas son de piedra de Villamayor.',
    // Fuente: https://www.lagacetadesalamanca.es/hemeroteca/capuchinos-tenia-calles-barro-carrefour-OTGS256484
    'El Pryca abrió el 26 de octubre de 1989 con más de 8.000 m² y 266 trabajadores. Su nombre juntaba las palabras «precio» y «calidad».',
    // Fuente: https://www.lagacetadesalamanca.es/hemeroteca/capuchinos-tenia-calles-barro-carrefour-OTGS256484
    'Antes de los bloques había casas bajas, calles de barro, la fuente del Cántaro y la vaquería Balta, adonde se iba a por leche. Las calles nuevas tomaron nombres de pueblos de Castilla y León.',
    // Fuente: https://www.diocesisdesalamanca.com/noticias/25-aniversario-de-la-parroquia-nuestra-senora-de-lourdes/
    'Su iglesia, en la calle Riaño, es la única de la diócesis dedicada a la Virgen de Lourdes. Es octogonal, y bajo su primera piedra, de 1997, se enterró una urna con monedas y los periódicos del día.',
    // Fuente: https://www.lagacetadesalamanca.es/hemeroteca/capuchinos-tenia-calles-barro-carrefour-OTGS256484
    'A principios de los noventa, sus fiestas, con cabezudos, charangas y orquestas, salían adelante con solo 75.000 pesetas.',
    // Fuente: https://www.elespanol.com/castilla-y-leon/region/salamanca/20211119/barrio-capuchinos-salamanca-piedra-dorada-expansion-urbana/627687731_0.html
    'Fue campo de juego de los niños de Blanco y Pizarrales, y hoy acoge el instituto García Bernalt, que se quedó pequeño en El Rollo.'
  ],
  platina: [
    // Fuente: https://www.lagacetadesalamanca.es/salamanca/el-agua-salmantina-filtrada-por-la-piedra-de-villamayor-que-fue-la-mejor-de-espana-KA2367378
    'Junto al cementerio brotaba el manantial de La Platina. Su agua se embotelló desde los años sesenta, ganó una medalla de oro en 1985 y en 1995 una revista la eligió la mejor de España.',
    // Fuente: https://www.lagacetadesalamanca.es/salamanca/el-manantial-de-la-platina-vuelve-a-brotar-YC2352155
    'La urbanización del barrio acabó con la embotelladora. En 2020 el agua volvió a brotar por las paredes del Instituto de Neurociencias.',
    // Fuente: https://www.agronewscastillayleon.com/el-salmantino-campus-de-la-platina-servira-de-apoyo-al-sector-agropecuario-de-castilla-y-leon
    'En 2018 el Ayuntamiento cedió aquí parcelas al CSIC y a la Universidad para un campus agroambiental, con el IRNASA y la Facultad de Ciencias Agrarias y Ambientales.'
  ],
  arrabal: [
    'Su iglesia vieja, de la Santísima Trinidad, es románica del siglo XII. Se dejó de usar en los años cincuenta y ha vuelto a abrirse al culto.',
    'El Puente Romano, que perdió varios arcos en la riada de 1626, se reparó en tiempos de Felipe IV. Junto a él está el verraco de piedra de los vetones.',
    'En la Edad Media aquí se guardaba el ganado de la ciudad y pasaban los peregrinos de la Vía de la Plata.'
  ],
  tejares: [
    'Fue un pueblo independiente hasta 1963. Aparece en un documento de Alfonso VII de 1148 y vivía de sus tejas, ladrillos y aguas medicinales.',
    'El palacio de verano de los marqueses de Castellanos, del siglo XVIII, es hoy un centro de educación vial.',
    'En la octava de Pentecostés se celebra la romería de la Virgen de la Salud, con alfarería, garrapiñadas y chanfaina.'
  ],
  alambres: [
    'Su nombre viene de las alambradas de los corrales de ganado que había junto al Teso de la Feria y el Cordel de Merinas.',
    'Por su calle principal pasaban vacas lecheras, y había quien venía desde la zona de la Catedral a por leche fresca. Los vecinos pagaron su capilla en los años sesenta.',
    // Fuente: https://www.lagacetadesalamanca.es/salamanca/gran-riada-chamberi-vecinos-atrincheran-horas-capilla-20240120202822-nt.html
    'En la tromba del Corpus de 1976 no murió nadie, pero en el barrio se ahogaron 40 corderos, 11 añojos, 200 gallinas y un cerdo.',
    // Fuente: https://www.lagacetadesalamanca.es/salamanca/gran-riada-chamberi-vecinos-atrincheran-horas-capilla-20240120202822-nt.html
    'En los años cuarenta, con permiso del Ayuntamiento de Tejares, aquí se vendían parcelas a 50 céntimos o una peseta el metro cuadrado, y cada familia se hacía su casa.',
    // Fuente: https://www.lagacetadesalamanca.es/salamanca/gran-riada-chamberi-vecinos-atrincheran-horas-capilla-20240120202822-nt.html
    'En los sesenta llegaron por fin tres caños públicos a la calle Mayor, y fueron los propios vecinos quienes cavaron cuatro metros para meter las tuberías.',
    // Fuente: https://www.lagacetadesalamanca.es/salamanca/mujer-puso-alambres-mapa-era-aurelia-lopez-20260817162643-nt.html
    'Una calle peatonal de 127 metros recuerda desde 2004 a Aurelia López, la vecina que presidió la asociación del barrio y consiguió el centro cívico en 1984.'
  ],
  zurguen: [
    'Debe su nombre al arroyo que lo cruza, cantado por poetas como Meléndez Valdés; el nombre podría venir del árabe. El barrio nació en 1997 con 120 viviendas protegidas.',
    'Cada 23 de junio celebra la única hoguera de San Juan que sobrevive en la capital.',
    'Por la orilla del arroyo pasan el Camino de Santiago de Fonseca y la Cañada Real.'
  ],
  vistahermosa: [
    'Hereda el nombre del pueblo de Vistahermosa, que pertenecía a Tejares y pasó a Salamanca en 1963. Está en el cerro de Buenaventura, con vistas a toda la ciudad.',
    'Empezó en los años cincuenta con tres calles: la carretera de Vistahermosa, San Cosme y San Damián. Ha recuperado sus fiestas de San Joaquín y Santa Ana.',
    // Fuente: https://noticiascyl.elespanol.com/t/1751829/vistahermosa-mirador-salamanca-barrio-dormitorio
    'En el cerro había una poza adonde las mujeres del antiguo pueblo iban a lavar la ropa.',
    // Fuente: https://noticiascyl.elespanol.com/t/1751829/vistahermosa-mirador-salamanca-barrio-dormitorio
    'El pueblo vivió años de esplendor gracias a la fábrica de un empresario catalán, con cine a diario, biblioteca y regalos de Reyes para los hijos de los obreros.',
    // Fuente: https://www.lagacetadesalamanca.es/salamanca/el-poblado-de-vistahermosa-una-decada-despues-de-su-desalojo-ED2140745
    'Al sur estaba el poblado de una granja, con iglesia, Correos y escuela. Sus últimas casas se derribaron el 28 de mayo de 2013; solo quedó en pie la iglesia.',
    // Fuente: https://www.lagacetadesalamanca.es/salamanca/gran-riada-chamberi-vecinos-atrincheran-horas-capilla-20240120202822-nt.html
    'La tormenta del Corpus de 1976 empezó con más fuerza aquí, y el agua bajó hasta Los Alambres convirtiendo su calle Mayor en un río.',
    // Fuente: https://www.elespanol.com/castilla-y-leon/region/salamanca/20250226/barrio-vistahermosa-salamanca-moderna-plaza-alegre-colorida-pedian-vecinos/927157515_0.html
    'Tras años de pedirla, en 2025 el Ayuntamiento proyectó la plaza que querían los vecinos: 7.500 m² en tres terrazas, con grada para 300 personas y circuito de pump track.'
  ],
  vega: [
    'Su nombre honra a la Virgen de la Vega, patrona de Salamanca. Se inauguró el 7 de mayo de 1954 con unas 650 viviendas sociales.',
    'Sus casas bajas y blancas tienen soportales y patios con jardines, en calles estrechas alrededor de la plaza de la iglesia.',
    // Fuente: https://www.lagacetadesalamanca.es/salamanca/la-historia-del-pueblo-blanco-de-664-casas-dentro-de-la-capital-salmantina-HK7419339
    'Franco entregó en persona las llaves a los primeros vecinos, y el obispo Barbado Viejo bendijo el barrio.',
    // Fuente: https://lacronicadesalamanca.com/327296-la-vega-el-jardin-de-salamanca/
    'El Colegio de Arquitectos de Salamanca hizo el proyecto gratis. Las obras empezaron en 1950.',
    // Fuente: https://lacronicadesalamanca.com/327296-la-vega-el-jardin-de-salamanca/
    'Los primeros vecinos eran inquilinos que pagaban cada mes una especie de hipoteca y no fueron dueños de sus casas hasta 1973. Quien se iba antes perdía lo pagado.',
    // Fuente: https://lacronicadesalamanca.com/327296-la-vega-el-jardin-de-salamanca/
    'En las fiestas de la patrona, del 2 al 9 de septiembre, los vecinos competían por el jardín más bonito a pie de calle.',
    // Fuente: https://lacronicadesalamanca.com/327296-la-vega-el-jardin-de-salamanca/
    'En los años sesenta, el único televisor del barrio estaba en el bar de Ezequiel, que se convirtió en el centro social.'
  ],
  sanjose: [
    'Surgió en los años setenta, como continuación de La Vega, para la gente que llegaba de los pueblos. Al principio no tenía consultorio, ni tiendas, ni colegios.',
    'El puente de Felipe VI, del año 2000, lo une con el paseo de Canalejas. En el campo Reina Sofía juega Unionistas de Salamanca.'
  ],
  villamayor: [
    'De sus canteras, documentadas desde el siglo XVI, salió la piedra dorada de las catedrales, la Casa de las Conchas y la Plaza Mayor.',
    'El 1 de agosto de 1774, «el Centellazo»: un rayo cayó en la torre de la iglesia y no hubo víctimas.',
    'En el teso de San Miguel hubo un castro prerromano. Hoy tiene unos 7.700 vecinos y desde 2017 incluye Mozodiel de Sanchiñigo.'
  ],
  santamarta: [
    'Su nombre une a su patrona, Santa Marta, y el río. La primera mención escrita que se conserva es de diciembre de 1201.',
    'En 1963 Salamanca intentó anexionarla, pero no se aprobó. Hoy, con unos 15.000 vecinos, es el municipio más poblado del alfoz.',
    'Celebra San Blas el 3 de febrero y Santa Marta el 29 de julio.'
  ],
  cabrerizos: [
    'En el siglo XIII se llamaba «Cabrarizos». En su término, en La Flecha, está el oratorio de Fray Luis de León.',
    'Entre 1996 y 2006 su población creció un 128,8 %: fue el primero del alfoz en apostar por los chalets.'
  ],
  carbajosa: [
    'Aparece en 1248 como «Carvayosa la Sagrada»: el nombre viene del carbajo, un tipo de roble. La fundó Alfonso IX a comienzos del siglo XIII.',
    'Tuvo su papel en la batalla de los Arapiles, el 22 de julio de 1812.',
    'Entre 2000 y 2011 su población creció un 271 %, y es uno de los municipios más jóvenes de la provincia. Su patrón es San Roque, el 16 de agosto.'
  ],
  villares: [
    'Su nombre recuerda a la reina Berenguela, esposa de Alfonso IX, que vivió aquí: se llamaba «Villar de la Reyna».',
    'La iglesia de San Silvestre se empezó en 1619 y tiene una cúpula elíptica. Las fiestas son el 31 de diciembre, por San Silvestre.',
    'El estadio Helmántico está en su término municipal.'
  ],
  aldeatejada: [
    'Aparece como «Aldea Teiada» en 1186. Del 10 al 13 de noviembre de 1543, Felipe II y María Manuela de Portugal se alojaron aquí antes de su boda en Salamanca.',
    'Por su término pasa la Cañada Real de la Vizana.'
  ],
  doninos: [
    'A comienzos del siglo XVII tenía menos de seis vecinos; en 1842, 140. Hoy supera los 2.200 (2.273 en el padrón de 2025).',
    'Tiene el museo del escultor Ángel Mateos, que trabajó con hormigón.'
  ],
  carrascal: [
    'Su término, de casi 77 km², es de los más grandes de la provincia, y la mayoría de sus vecinos vive en la urbanización Peñasolana, junto a Los Montalvos.',
    // Fuente: https://carrascaldebarregas.com/historia-del-municipio/
    'En 1162 se libró en el arroyo de la Valmuza una batalla entre los nobles del alfoz salmantino y el rey Fernando II. En junio de 1812 las tropas de Wellington hicieron retirarse aquí a los franceses.',
    // Fuente: https://es.wikipedia.org/wiki/Carrascal_de_Barregas
    'Su término está partido en cinco islas separadas por tierras de los municipios vecinos.',
    'En su término está el antiguo Sanatorio Antituberculoso de los Montalvos, impulsado por el doctor Filiberto Villalobos: primera piedra en 1935 y 13 años de obras. Se anunció como el mayor de España y hoy es el Hospital de los Montalvos.',
    // Fuente: https://salamancamedica.es/el-hospital-de-los-montalvos/
    'El sanatorio lo proyectó Rafael Bergamín, que se exilió en Venezuela tras la guerra. Lo terminó Genaro de No, y al final tuvo 601 camas.',
    // Fuente: https://www.lagacetadesalamanca.es/salamanca/el-gobierno-eliminara-los-carteles-en-la-n-620-que-anuncian-el-hospital-martinez-anido-CN8384127
    'Abrió en 1948 con el nombre del militar Martínez Anido. Se llama Los Montalvos desde 2001, aunque en 2021 dos señales de la N-620 aún conservaban el nombre antiguo.',
    // Fuente: https://carrascaldebarregas.com/historia-del-municipio/
    'El sanatorio tuvo cementerio propio: entre 1950 y 1985 se enterró allí a 1.071 personas. Su fachada luce la cruz de Lorena, símbolo de la lucha contra la tuberculosis.'
  ],
  pelabravo: [
    'Según la tradición lo fundó Pelay o Pelayo Bravo, por orden de los reyes de León.',
    'En Naharros del Río se conservan los restos del castillo de la Torre Mocha, de los siglos XII y XIII. La mayoría de sus vecinos vive en Nuevo Naharros.'
  ],
  castmoriscos: [
    'En el siglo XIII ya se llamaba «Castellanos de Morisco», porque lo repoblaron colonos de Castilla. Su iglesia de San Esteban es Bien de Interés Cultural desde 1999.',
    'En 1826 tenía unos 221 habitantes; hoy supera los 3.100.'
  ],
  castvilliquera: [
    'Lo repoblaron hacia el año 975 castellanos del ejército de Ramiro II. «Villiquera» podría venir del latín villicus, el administrador de una finca romana.',
    'A sus vecinos los llaman «cucos», por los dos cucos de su escudo.'
  ],
  fontana: [
    'Del monasterio de Santa María de la Vega, de hacia 1150 y después de los canónigos de San Agustín, quedan cinco arcos con 16 capiteles de escenas de caza, bailes y animales.',
    // Fuente: https://www.romanicodigital.com/actualidad/noticias/fachada-sala-capitular-santa-maria-vega-salamanca-valorizacion-y-difusion-una
    'Esos arcos son Bien de Interés Cultural desde 1931. Siempre se dijo que eran del claustro, pero hoy se cree que eran la entrada a la sala capitular.',
    // Fuente: https://es.wikipedia.org/wiki/Monasterio_de_Santa_Mar%C3%ADa_de_la_Vega_(Salamanca)
    'Sobre el solar del monasterio se levantó la Granja Escuela-Asilo de la Fundación Rodríguez Fabrés, obra modernista de Joaquín de Vargas, el arquitecto de la Casa Lis, que inauguró Alfonso XIII a finales de 1914.',
    // Fuente: https://es.wikipedia.org/wiki/Colegio_de_la_Pur%C3%ADsima_Concepci%C3%B3n_de_los_Ni%C3%B1os_Hu%C3%A9rfanos_(Salamanca)
    'El Edificio Solís, en el paseo de Canalejas, nació en 1542 como colegio de huérfanos del obispo Francisco de Solís. En el siglo XX fue manicomio, y desde 1971 es la Facultad de Educación.',
    // Fuente: https://es.wikipedia.org/wiki/Puente_Felipe_VI
    'El puente que cruza el Tormes desde aquí se hizo en el año 2000 como puente Príncipe de Asturias; hoy se llama Felipe VI y mide 182 metros.',
    // Fuente: https://www.guiaarqueologicaciudadespatrimonio.org/salamanca-itinerario-i
    'Junto a ese puente se conservan norias circulares de mampostería que regaban las huertas de la ribera.'
  ],
  teso: [
    'Aquí, junto al Puente Romano, se celebraba la feria de ganado de septiembre, que arranca el día de la Virgen de la Vega, el 8.',
    // Fuente: https://www.elespanol.com/castilla-y-leon/region/salamanca/20211126/arrabal-transcurre-historia-literaria-salamanca/629437869_0.html
    'El Parador de Turismo ocupa el antiguo espacio cercado del Teso, donde las reses esperaban a ser vendidas o sacrificadas.',
    // Fuente: https://www.lagacetadesalamanca.es/hemeroteca/teso-feria-AEGS184224
    'Enrique IV concedió a Salamanca la feria de septiembre en 1467; en junio se celebraba otra, la del Teso o de San Juan.'
  ],
  carmen: [
    'Nació para sacar de las chabolas a vecinos de Pizarrales: en 1948 el Ayuntamiento creó el Patronato Benéfico Nuestra Señora del Carmen y en 1950 entregó las primeras casas, unifamiliares, del arquitecto Fernando Población.',
    'Se hizo en tres fases, de 118, 230 y 222 viviendas. La segunda estuvo sin servicios mínimos hasta los años sesenta.',
    // Fuente: https://es.wikipedia.org/wiki/El_Carmen_(Salamanca)
    'Tiene dos mitades con nombre propio: el Carmen Blanco, de casas adosadas, y el Carmen Rojo, de bloques de ladrillo visto.',
    // Fuente: https://www.consejosocialbarriospbc.es/barrio-el-carmen/
    'Las 118 primeras casas las levantaron sus futuros vecinos con sus manos: ese trabajo contó como el 10 % del coste; el Ayuntamiento puso el 30 % y el Instituto Nacional de la Vivienda, el 60 %.',
    // Fuente: https://www.consejosocialbarriospbc.es/barrio-el-carmen/
    'En la segunda fase, la Obra Sindical del Hogar convirtió las 230 viviendas previstas en 452 «miniviviendas» de peores materiales.',
    // Fuente: https://www.consejosocialbarriospbc.es/barrio-el-carmen/
    'Como faltaban escuelas para tanto niño, el Movimiento Social Cristiano levantó dos detrás del Carmen Rojo.',
    // Fuente: https://es.wikipedia.org/wiki/El_Carmen_(Salamanca)
    'También son del Carmen los ocho «bloques de Nicar», entre la calle Linares y la avenida de Portugal.'
  ],
  chamberi: [
    'Nació a principios del siglo XX dentro del término de Tejares, con casas levantadas a mano en solares que vendía un hombre apodado «el zamorano». En 1969 ya dependía de Salamanca.',
    'El 27 de mayo de 1976 una tormenta convirtió la calle Mayor en un río. Meses después, unos 300 vecinos se encerraron 26 horas en su capilla para pedir soluciones.'
  ],
  buenosaires: [
    'Nació en 1983 en la periferia, entre la vía del tren, la autovía y el río.',
    // Fuente: http://habitat.aq.upm.es/evbpes/abpes_9.html
    'Se construyó para realojar a unas 350 familias humildes que vivían en casas deterioradas del casco antiguo, cuando se rehabilitó el centro histórico.',
    // Fuente: https://www.elespanol.com/castilla-y-leon/region/salamanca/20260520/asdecoba-herencia-aristocrata-obrero-pulmon-social-lucha-narcotrafico-salamanca/1003744247823_0.html
    'Aquí nació, con ASDECOBA, el catering Algo Nuevo, en un edificio que había sido picadero de heroína. Empezó con seis comidas al día y hoy prepara 1.200.',
    // Fuente: https://www.elespanol.com/castilla-y-leon/region/salamanca/20260520/asdecoba-herencia-aristocrata-obrero-pulmon-social-lucha-narcotrafico-salamanca/1003744247823_0.html
    'ASDECOBA empezó llamándose Asociación Cultural Buenos Aires, y juntó en un solo grupo a los vecinos, las familias del colegio, los mayores y los jóvenes.',
    // Fuente: https://www.elespanol.com/castilla-y-leon/region/salamanca/20201011/emiliano-tapia-proporciona-puestos-narcotrafico-buenos-aires/527447966_0.html
    'Su parroquia, de la Virgen de Nazaret, es también taller y albergue: en 2020 acogía a 36 personas.',
    // Fuente: https://es.wikipedia.org/wiki/Buenos_Aires_(Salamanca)
    'Ha perdido vecinos: tenía 1.326 en 2001 y 907 en 2014.'
  ],
  moriscos: [
    'Su nombre se debe a que lo poblaron moriscos; antes se decía «Morisco». En el siglo XIV formaba parte de la región de Villoria.',
    'En 1877 se inauguró su estación, en la línea de Salamanca a Medina del Campo.'
  ],
  tormes: [
    // Fuente: https://www.ub.edu/geocrit/sn/sn-146(139).htm
    'Nació como polígono de viviendas: el proyecto del Polígono de El Tormes es de 1959, y en 1965 se adjudicó allí el grupo de viviendas San Mateo.',
    // Fuente: https://www.salamanca24horas.com/local/salamanca-suma-nuevo-balcon-urbano-inauguracion-mirador-tormes
    'En la calle Diego Pisador se abrió en 2026 un mirador de la Ruta de los Miradores, con la vista de la ciudad que sale en muchas postales.',
    // Fuente: https://es.wikipedia.org/wiki/Diego_Pisador
    'Esa calle recuerda a Diego Pisador, vihuelista nacido en Salamanca hacia 1510 que publicó en 1552 un Libro de música de vihuela dedicado a Felipe II.'
  ],
  alcaldes: [
    // Fuente: https://avlosalcaldes.org/quienes-somos/
    'Es uno de los barrios más jóvenes de la ciudad: su asociación vecinal nació en julio de 2025 y celebró sus primeras fiestas del 2 al 5 de julio de 2026.',
    // Fuente: https://www.lagacetadesalamanca.es/salamanca/la-selva-del-parque-de-los-alcaldes-ED13015188
    'En 2008 el Ayuntamiento cedió al Ministerio de Cultura un solar de 6.000 m² del barrio para ampliar el Centro Documental de la Memoria Histórica.',
    // Fuente: https://www.lagacetadesalamanca.es/salamanca/barrio-alcaldes-busca-nuevos-residentes-20230717172626-nt.html
    'Algunas de sus calles llevan nombre de alcalde, como Alcalde Bravo García o Alcalde Málaga Guerrero.',
    // Fuente: https://www.lagacetadesalamanca.es/salamanca/el-centro-de-salamanca-se-vacia-y-crecen-los-barrios-del-oeste-JY8661193
    'Para el Ayuntamiento no es un barrio aparte: en sus estadísticas, sus promociones de viviendas cuentan dentro de Tejares.'
  ],
  vidal: [
    'Debe su nombre a los constructores, Balbino y Manuel, que levantaron sus primeras viviendas.',
    // Fuente: https://www.ub.edu/geocrit/sn/sn-146(139).htm
    'Fue un barrio de viviendas sociales proyectado en 1943 para 400 casas. La primera piedra se puso en junio de 1945 y en 1948 había 170 viviendas.',
    // Fuente: https://www.salamancaenelayer.com/2012/11/avenida-de-portugal.html
    'La avenida de Portugal ocupa el trazado de la antigua vía del tren a Portugal, desviada por Tejares en 1954. En 1967 el terraplén seguía en pie en la plaza del barrio Vidal.'
  ],
  ciudadjardin: [
    // Fuentes: https://www.salamancahoy.es/salamanca/ciudad/ciudad-jardin-barrio-lleva-anos-sonando-calles-20230501135134-nt.html y https://www.ub.edu/geocrit/sn/sn-146(139).htm
    'Se proyectó en los años cuarenta para familias obreras. En 1950 se preparaban 126 viviendas, y a principios de los cincuenta nació con nueve bloques; muchos pisos los ocuparon militares del cuartel de ingenieros.',
    // Fuente: https://salamancartvaldia.es/noticia/2025-01-27-ciudad-jardin-el-barrio-que-surgio-de-una-utopia-fotos-362169
    'Sus vecinos lo llaman el barrio «de las dos mentiras»: ni ciudad ni jardín.',
    // Fuente: https://www.salamancahoy.es/salamanca/ciudad/ciudad-jardin-barrio-lleva-anos-sonando-calles-20230501135134-nt.html
    'En 1973 una inmobiliaria madrileña compró el barrio por nueve millones de pesetas; en 1980 cada piso se vendía por un millón.'
  ],
  huertaotea: [
    // Fuente: https://www.elespanol.com/castilla-y-leon/region/20180701/huerta-otea-mirador-botanico-rio-tormes/319218877_0.html
    'El nombre viene de una antigua finca: la huerta desde la que se «oteaba» el casco histórico de Salamanca.',
    // Fuente: https://www.elespanol.com/castilla-y-leon/region/20180701/huerta-otea-mirador-botanico-rio-tormes/319218877_0.html
    'En 1942 la condesa propietaria vendió la finca a su rentero, Valentín Carrasco, que la convirtió en un referente de hortalizas tempranas con invernaderos.',
    // Fuente: https://salamancartvaldia.es/noticia/2023-02-02-huerta-otea-creemos-en-el-barrio-y-apostamos-fuerte-por-el-y-por-sus-habitantes-314741
    'Fue el barrio de Salamanca que más creció en una década: pasó de 2.025 empadronados en 2012 a 2.769 en 2022.',
    'Sus orillas del Tormes son de las que eligen los salmantinos para celebrar el Lunes de Aguas.'
  ],
  salasbajas: [
    // Fuente: https://www.salamancaenelayer.com/2020/04/riadas-inundaciones-del-tormes-y.html
    'En la riada de diciembre de 1909 las huertas del Arrabal, Salas Bajas, Mambrú y Sotomuñiz quedaron completamente anegadas.',
    // Fuente: https://www.lagacetadesalamanca.es/salamanca/ya-hay-fecha-aproximada-para-la-entrega-de-los-huertos-urbanos-de-salas-bajas-XI4497088
    'Junto a Salas Bajas hay un parque de 100.000 m² con unos 600 huertos urbanos ecológicos de 45 m², cercados con cantos rodados del río Yeltes.',
    // Fuente: https://deportes.usal.es/sefyd/instalaciones/complejo-deportivo-salas-bajas/
    'La Universidad de Salamanca tiene aquí su complejo deportivo, con pista de atletismo, campo de rugby, fútbol, tenis y pádel.'
  ],
  marin: [
    // Fuente: https://www.lagacetadesalamanca.es/salamanca/el-centro-de-salamanca-se-vacia-y-crecen-los-barrios-del-oeste-JY8661193
    'Para el Ayuntamiento no es un barrio aparte: en sus estadísticas, Marín I y II cuentan dentro de La Platina.',
    // Fuente: https://lacronicadesalamanca.com/234522-nuevo-proyecto-de-vivienda-protegida-en-el-marin-con-firma/
    'La promoción Jardines del Marín, de 96 viviendas protegidas, es del arquitecto Julio Touza, y su forma imita las curvas del Tormes.',
    // Fuente: https://www.lagacetadesalamanca.es/salamanca/el-centro-de-salamanca-se-vacia-y-crecen-los-barrios-del-oeste-JY8661193
    'Es de lo que más crece: su sector, con Huerta Otea, pasó de unos 1.900 vecinos en 2010 a más de 2.700, un 41 % más.',
    // Fuente: https://www.lagacetadesalamanca.es/salamanca/el-unico-barrio-de-salamanca-que-no-perdio-poblacion-en-2020-CX7132026
    'En 2020, el año de la pandemia, fue el único sector de Salamanca que no perdió habitantes: ganó cinco.',
    // Fuente: https://www.elespanol.com/castilla-y-leon/region/salamanca/20220317/salamanca-transforma-ribera-salas-bajas-marin-corredor/657934362_0.html
    'El proyecto de la ribera le reserva un circuito de running de 1,4 km y arboledas que tapen el ruido de la autovía A-62.'
  ],
  montalvos: [
    // Fuente: https://poligonoelmontalvo.com/quienes-somos/
    'El polígono lo promovió el Instituto Nacional de Urbanización y se urbanizó en dos fases, en 1961 y 1977. La primera licencia para una nave se pidió en 1966.',
    // Fuente: https://salamancartvaldia.es/noticia/2025-11-06-el-montalvo-i-compromiso-servicios-y-reivindicaciones-para-seguir-avanzando-378910
    'Pasa por ser el polígono más antiguo de la provincia, y lo gestionan a medias los ayuntamientos de Salamanca y Carbajosa de la Sagrada.',
    // Fuente: https://poligonoelmontalvo.com/quienes-somos/
    'Sus empresarios se organizaron pronto: su asociación se fundó el 27 de abril de 1972.',
    // Fuente: https://es.wikipedia.org/wiki/L%C3%ADnea_12_(Salamanca_de_Transportes)
    'La línea 12 del autobús urbano nació en 2003 entre Barrio Blanco y San José, y en 2006 se alargó hasta El Montalvo II.'
  ]
};
// Leyendas: { idZona: [párrafo, ...] }
const LEYENDAS = {
  centro: [
    // Fuentes: https://es.wikipedia.org/wiki/Torre_del_Clavero y https://www.terranostrum.es/turismo/torre-del-clavero-salamanca
    'Se cuenta que, para acabar con las luchas de los bandos, los Reyes Católicos mandaron desmochar las torres de los nobles. La del Clavero se libró; la de la Casa de las Conchas quedó mucho más baja.',
    'San Martín partió su capa para compartirla con un mendigo y esa noche soñó con Cristo vestido con esa mitad. La media capa se guardó como reliquia y de ella vendría la palabra «capilla». La escena está sobre la puerta del Obispo de la Plaza Mayor, junto a su iglesia del Corrillo.',
    'El milagro del Pozo Amarillo: en esta calle, san Juan de Sahagún salvó a un niño que se había caído a un pozo. Una lápida lo recuerda.',
    'Cuenta la tradición que en 1706, en la Guerra de Sucesión, los salmantinos se encomendaron a la Virgen de la Vega y rechazaron a las tropas portuguesas; como premio, Felipe V habría concedido a la ciudad su Plaza Mayor.'
  ],
  univ: [
    'La Casa de las Conchas: dicen que bajo una de sus conchas hay escondido un tesoro en monedas de oro.',
    'Calle Tentenecio: un toro bravo escapado iba a embestir a san Juan de Sahagún, patrón de la ciudad, que le dijo «Tente, necio» y el animal se amansó.',
    'El Huerto de Calixto y Melibea, junto a la Casa Lis, es el jardín donde la tradición sitúa los amores de «La Celestina».'
  ],
  sanvicente: [
    'Cuentan Plutarco y Polieno que, cuando Aníbal tomó Salmantica, dejó salir a sus habitantes sin armas. Las mujeres escondieron espadas bajo la ropa, los hombres plantaron cara y Aníbal, admirado, les devolvió la ciudad.'
  ],
  sanjuan: [
    'María la Brava: en el siglo XV la ciudad estaba partida en dos bandos. Cuando mataron a los dos hijos de María de Monroy, ella persiguió a los asesinos hasta Portugal y volvió con sus cabezas para dejarlas en la tumba de sus hijos. Su casa está en la plaza de los Bandos.',
    'La tradición dice que san Vicente Ferrer predicó en esta iglesia, desde un púlpito que ya no existe.',
    'Santa Teresa vivió entre 1570 y 1574 en la casa de la calle Condes de Crespo Rascón, mientras fundaba aquí su séptimo convento de carmelitas descalzas. La tradición la tiene por el lugar donde se inspiró el «Vivo sin vivir en mí».'
  ],
  tenerias: [
    'La Puerta de los Milagros: se creía que el agua de su arroyo curaba el mal de ojo, y que allí rondaba un fantasma.',
    'En la Peña Celestina estuvo el alcázar de la ciudad y, junto a él, el barrio judío medieval.'
  ],
  ursulas: [
    'La Casa de las Muertes: sus calaveras de la fachada y un crimen de cuatro personas en el siglo XIX le dieron nombre; la calle Bordadores llegó a llamarse «de las Muertes».',
    'Se dice que el conde de Monterrey mandó excavar un túnel bajo la plaza hasta el convento de las Agustinas para visitar en secreto a su hija, priora de clausura. Nunca se ha demostrado.'
  ],
  arrabal: [
    'El Lazarillo y el verraco: en el primer capítulo de la novela, el ciego manda al niño acercar la oreja al toro de piedra del Puente Romano y le golpea la cabeza contra él.',
    'La víspera de Pentecostés, la romería de la Virgen de la Encarnación sale de aquí; una semana después le toca a la Virgen de la Salud, en Tejares.'
  ],
  tejares: [
    'Lunes de Aguas: según la tradición, en Cuaresma las mujeres de la mancebía eran desterradas a Tejares; el lunes tras la Pascua los estudiantes cruzaban a recibirlas y merendaban hornazo. Así nació la fiesta.',
    'El Lazarillo dice que nació «dentro del río Tormes», en una aceña de Tejares donde trabajaba su padre.'
  ],
  sanesteban: [
    'La Cueva de Salamanca: en la cripta de la antigua iglesia de San Cebrián, el diablo enseñaba magia a grupos de siete alumnos durante siete años, y uno debía quedarse a su servicio. El marqués de Villena escapó, pero perdió su sombra.'
  ],
  fontana: [
    'Cuenta la leyenda que la talla de la Virgen de la Vega, patrona de Salamanca, llegó desde Constantinopla. Era la titular del monasterio de Santa María de la Vega, cuyas ruinas están en este barrio; hoy preside el altar mayor de la Catedral Vieja.'
  ]
};
// Fotos: { idZona: [ruta en img/, pie con autor y licencia] }. El texto hasta «. Foto» se usa como texto alternativo.
const FOTOS = {
  tejares: [
    'img/tejares.jpg',
    'Antigua estación de Tejares-Chamberí. Foto: Rodelar · CC BY-SA 4.0 · Wikimedia Commons'
  ],
  labradores: [
    'img/labradores.jpg',
    'Mercado de San Juan. Foto: Mentxuwiki · CC BY-SA 4.0 · Wikimedia Commons'
  ],
  chinchibarra: [
    'img/chinchibarra.jpg',
    'Parque Würzburg. Foto: Mentxuwiki · CC BY-SA 4.0 · Wikimedia Commons'
  ],
  moriscos: [
    'img/moriscos.jpg',
    'Iglesia de San Pedro Apóstol. Foto: Rodelar · CC BY-SA 4.0 · Wikimedia Commons'
  ],
  castmoriscos: [
    'img/castmoriscos.jpg',
    'Iglesia de San Esteban. Foto: Victor · CC BY-SA 4.0 · Wikimedia Commons'
  ],
  villamayor: [
    'img/villamayor.jpg',
    'Pórtico de la iglesia de San Miguel Arcángel. Foto: Malopez 21 · CC BY-SA 4.0 · Wikimedia Commons'
  ],
  cabrerizos: [
    'img/cabrerizos.jpg',
    'Iglesia de San Vicente Mártir. Foto: Rebe de Winter · CC BY-SA 4.0 · Wikimedia Commons'
  ],
  carbajosa: [
    'img/carbajosa.jpg',
    'Iglesia de Nuestra Señora de la Asunción. Foto: Malopez 21 · CC BY-SA 4.0 · Wikimedia Commons'
  ],
  villares: [
    'img/villares.jpg',
    'Iglesia de San Silvestre. Foto: Rodelar · CC BY-SA 4.0 · Wikimedia Commons'
  ],
  pelabravo: [
    'img/pelabravo.jpg',
    'Castillo de la Torre Mocha, en Naharros del Río. Foto: Ramajero · CC BY-SA 4.0 · Wikimedia Commons'
  ],
  aldeatejada: [
    'img/aldeatejada.jpg',
    'Iglesia de Santiago Apóstol. Foto: Malopez 21 · CC BY-SA 4.0 · Wikimedia Commons'
  ],
  castvilliquera: [
    'img/castvilliquera.jpg',
    'Iglesia de San Juan Bautista. Foto: José Antonio Gil Martínez · CC BY 2.0 · Wikimedia Commons'
  ],
  sanvicente: [
    'img/sanvicente.jpg',
    'Patio del Colegio del Arzobispo Fonseca. Foto: José Luis Filpo Cabana · CC BY 3.0 · Wikimedia Commons'
  ],
  santotomas: [
    'img/santotomas.jpg',
    'Ábsides de la iglesia de Santo Tomás Cantuariense. Foto: Zarateman · CC0 · Wikimedia Commons'
  ],
  alamedilla: [
    'img/alamedilla.jpg',
    'Parque de la Alamedilla. Foto: Björn Láczay · CC BY-SA 2.0 · Wikimedia Commons'
  ],
  rollo: ['img/rollo.jpg', 'Museo del Comercio y la Industria. Foto: Zarateman · CC0 · Wikimedia Commons'],
  tenerias: [
    'img/tenerias.jpg',
    'Iglesia de Santiago, junto al Puente Romano. Foto: Superchilum · CC BY-SA 3.0 es · Wikimedia Commons'
  ],
  doninos: [
    'img/doninos.jpg',
    'Iglesia de Santo Domingo de Guzmán. Foto: Malopez 21 · CC BY-SA 4.0 · Wikimedia Commons'
  ],
  sanbernardo: [
    'img/sanbernardo.jpg',
    'Arco del Campus Miguel de Unamuno. Foto: Ensalman · CC BY-SA 4.0 · Wikimedia Commons'
  ],
  centro: ['img/centro.jpg', 'Plaza Mayor. Foto: Anual · CC BY-SA 4.0 · Wikimedia Commons'],
  univ: ['img/univ.jpg', 'Fachada de las Escuelas Mayores. Foto: Zarateman · CC0 · Wikimedia Commons'],
  sanesteban: [
    'img/sanesteban.jpg',
    'Fachada del Convento de San Esteban. Foto: Zarateman · CC0 · Wikimedia Commons'
  ],
  arrabal: [
    'img/arrabal.jpg',
    'Puente Romano y catedral. Foto: Josep Maria Viñolas Esteva · CC BY 4.0 · Wikimedia Commons'
  ],
  ursulas: ['img/ursulas.jpg', 'Convento de las Úrsulas. Foto: Zarateman · CC0 · Wikimedia Commons'],
  sancristobal: [
    'img/sancristobal.jpg',
    'Iglesia de San Cristóbal. Foto: Zarateman · CC0 · Wikimedia Commons'
  ],
  sancti: [
    'img/sancti.jpg',
    'Iglesia de Sancti-Spíritus. Foto: Zarateman · dominio público · Wikimedia Commons'
  ],
  sanjuan: ['img/sanjuan.jpg', 'Iglesia de San Juan de Barbalos. Foto: Zarateman · CC0 · Wikimedia Commons'],
  glorieta: [
    'img/glorieta.jpg',
    'Plaza de toros de La Glorieta. Foto: Ytha67 · CC BY-SA 4.0 · Wikimedia Commons'
  ],
  estacion: [
    'img/estacion.jpg',
    'Fachada de la estación de tren (Vialia). Foto: Vivir el tren · CC BY 2.0 · Wikimedia Commons'
  ],
  carmelitas: [
    'img/carmelitas.jpg',
    'Murales de la Galería Urbana del Barrio del Oeste. Foto: MAngeluX · CC BY 2.0 · Wikimedia Commons'
  ],
  hospitales: [
    'img/hospitales.jpg',
    'Nuevo Hospital Universitario de Salamanca. Foto: FLAVIVSAETIVS · CC BY-SA 4.0 · Wikimedia Commons'
  ],
  platina: [
    'img/platina.jpg',
    'Instituto de Neurociencias de Castilla y León (INCYL). Foto: davidbenito · CC BY-SA 2.0 · Wikimedia Commons'
  ],
  salesas: [
    'img/salesas.jpg',
    'Parroquia de María Mediadora, en el paseo de Torres Villarroel. Foto: Zarateman · CC0 · Wikimedia Commons'
  ],
  prosperidad: [
    'img/prosperidad.jpg',
    'Parroquia del Milagro de San José. Foto: Zarateman · CC BY-SA 3.0 · Wikimedia Commons'
  ],
  delicias: [
    'img/delicias.jpg',
    'Iglesia de San Isidro de las Esclavas, en el paseo del Rollo. Foto: Zarateman · CC0 · Wikimedia Commons'
  ],
  carrascal: [
    'img/carrascal.jpg',
    'Iglesia de San Pedro Apóstol. Foto: Malopez 21 · CC BY-SA 4.0 · Wikimedia Commons'
  ],
  santamarta: [
    'img/santamarta.jpg',
    'Iglesia parroquial de Santa Marta de Tormes. Foto: FLAVIVSAETIVS · CC BY-SA 4.0 · Wikimedia Commons'
  ],
  montalvos: [
    'img/montalvos.jpg',
    'Carteles de salida de Salamanca y entrada a Carbajosa, entre las naves del polígono. Foto: Mentxuwiki · CC BY-SA 4.0 · Wikimedia Commons'
  ],
  carmen: [
    'img/carmen.jpg',
    'Busto de don Jesús García Rodríguez, párroco del barrio, puesto por suscripción popular en 2004. Foto: Mapper59 · CC BY-SA 4.0 · Wikimedia Commons'
  ],
  blanco: [
    'img/blanco.jpg',
    'Casas bajas en la calle San Pascasio, en 2015. Foto: r2hox · CC BY-SA 2.0 · Wikimedia Commons'
  ],
  alambres: [
    'img/alambres.jpg',
    'Mural del proyecto de arte urbano «Rutas centrífugas» en una casa del barrio, en 2015. Foto: r2hox · CC BY-SA 2.0 · Wikimedia Commons'
  ],
  vistahermosa: [
    'img/vistahermosa.jpg',
    'Aula al aire libre del arroyo del Zurguén, al pie del cerro. Foto: Mapper59 · CC BY-SA 4.0 · Wikimedia Commons'
  ],
  fontana: [
    'img/fontana.jpg',
    'Arcos del monasterio de Santa María de la Vega en 1891. Foto: J. Laurent · dominio público · Wikimedia Commons'
  ],
  garridosur: [
    'img/garridosur.jpg',
    'Mural de un ojo en la glorieta del Coronel Antonio Heredero Gil. Foto: Emilio J. Rodríguez Posada · CC BY-SA 4.0 · Wikimedia Commons'
  ],
  garridonorte: [
    'img/garridonorte.jpg',
    'Pabellón Multiusos Sánchez Paraíso. Foto: inventoprod · CC BY-SA 3.0 · Wikimedia Commons'
  ],
  ciudadjardin: [
    'img/ciudadjardin.jpg',
    'Facultad de Bellas Artes. Foto: Andrea Ferrero7 · CC BY-SA 4.0 · Wikimedia Commons'
  ],
  sanisidro: [
    'img/sanisidro.jpg',
    'Centro Municipal Integrado de la plaza de Trujillo. Foto: FLAVIVSAETIVS · CC BY-SA 4.0 · Wikimedia Commons'
  ],
  puenteladrillo: [
    'img/puenteladrillo.jpg',
    'Busto de Tomás Bretón. Foto: Mapper59 · CC BY-SA 4.0 · Wikimedia Commons'
  ],
  tormes: [
    'img/tormes.jpg',
    'Paseo a orillas del Tormes, frente a la catedral. Foto: Gabriel Fdez. · CC BY 2.0 · Wikimedia Commons'
  ],
  chamberi: [
    'img/chamberi.jpg',
    'Antiguo silo de cereales. Foto: Rodelar · CC BY-SA 4.0 · Wikimedia Commons'
  ],
  salasbajas: [
    'img/salasbajas.jpg',
    'Restos de una antigua noria junto al arroyo del Zurguén. Foto: FLAVIVSAETIVS · CC BY-SA 4.0 · Wikimedia Commons'
  ],
  zurguen: ['img/zurguen.jpg', 'Iglesia de la Sagrada Familia. Foto: roquic · CC BY 3.0 · Wikimedia Commons'],
  teso: [
    'img/teso.jpg',
    'Parador de Salamanca. Foto: Michael Stallbaum · dominio público · Wikimedia Commons'
  ],
  sanjose: [
    'img/sanjose.jpg',
    'Parque y campos de deporte junto a la Vía Helmántica. Foto: pictures Jettcom · CC BY 3.0 · Wikimedia Commons'
  ],
  pizarrales: [
    'img/pizarrales.jpg',
    'Monumento a San Marcelino Champagnat. Foto: Hovallef · CC BY-SA 4.0 · Wikimedia Commons'
  ]
};
// Dónde comer: { idZona: [{ n: nombre, t: tipo de cocina, a: dirección, p: descripción, s: fuente y fecha }] }
const DONDE_COMER = {
  univ: [
    {
      n: 'El Huerto de Doña Deseada',
      t: 'Cocina de autor',
      a: 'Calle Gibraltar 8-18 (Patio Chico)',
      p: 'Detrás de la Catedral, con ventanal al Patio Chico.',
      s: 'Guía Repsol 2026, recomendado'
    },
    {
      n: 'Corte y Cata',
      t: 'Restaurante',
      a: 'Calle Libreros 2',
      p: 'Frente a la fachada de la Universidad.',
      s: 'Guía Repsol 2026, recomendado'
    },
    {
      n: 'La Taberna de Libreros',
      t: 'Taberna',
      a: 'Calle Libreros 24',
      p: 'En la calle de la Universidad.',
      s: 'Guía Repsol 2026, recomendado'
    }
  ],
  centro: [
    {
      n: 'ConSentido',
      t: 'Restaurante',
      a: 'Plaza del Mercado 8-10',
      p: 'Con dos Soles, uno de los tres mejores de la ciudad para la guía.',
      s: 'Guía Repsol 2026 (2 Soles)'
    },
    {
      n: 'Bambú',
      t: 'Restaurante',
      a: 'Calle Prior',
      p: 'El único de la capital con Bib Gourmand en la Guía Michelin 2026, por su relación calidad-precio.',
      s: 'Guía Michelin 2026'
    },
    {
      n: 'Mesón Cervantes',
      t: 'Mesón',
      a: 'Plaza Mayor',
      p: 'Con vistas a la Plaza Mayor, reconocido como «casa de toda la vida».',
      s: 'Guía Repsol, Soletes con Solera 2024'
    },
    {
      n: 'Winelovers',
      t: 'Vinos y tapas',
      a: 'Calle Íscar Peyra 5',
      p: '4,7 en Tripadvisor con unas 600 opiniones, en pleno casco.',
      s: 'Tripadvisor, oct. 2026'
    }
  ],
  sanvicente: [
    {
      n: 'Víctor Gutiérrez',
      t: 'Alta cocina',
      a: 'Calle Empedrada, 4',
      p: 'Una estrella Michelin y dos Soles Repsol: uno de los mejores de la ciudad.',
      s: 'Guía Michelin 2026 (1 estrella) y Guía Repsol (2 Soles)'
    }
  ],
  ursulas: [
    {
      n: 'Pascua',
      t: 'Restaurante',
      a: 'Plaza de Monterrey 2 (hotel Eunice)',
      p: 'Un Sol Repsol desde la guía de 2026.',
      s: 'Guía Repsol 2026 (1 Sol)'
    }
  ],
  sancti: [
    {
      n: 'Vida y Comida',
      t: 'Restaurante',
      a: 'Plaza de Santa Eulalia 11',
      p: 'A un paso de la iglesia de Sancti-Spíritus.',
      s: 'Guía Repsol 2026, recomendado'
    },
    {
      // Calle Pozo Hilera, 8: está en Sancti-Spíritus, no en Garrido Norte (OpenStreetMap)
      n: 'Café Bar Japonés Aí',
      t: 'Bar',
      a: 'Calle Pozo Hilera, 8',
      p: 'Bar japonés con 7,5 sobre 10 en Gastroranking y unas 2.300 opiniones.',
      s: 'Gastroranking, oct. 2026'
    }
  ],
  sanesteban: [
    {
      n: 'En la Parra',
      t: 'Restaurante',
      a: 'Calle San Pablo 80',
      p: 'Con un Sol desde 2021, frente al convento de San Esteban.',
      s: 'Guía Repsol 2026 (1 Sol)'
    },
    {
      n: 'Vinodiario',
      t: 'Mediterránea',
      a: 'Plaza Basilios 1',
      p: '4,7 en Tripadvisor con unas 3.700 opiniones.',
      s: 'Tripadvisor, oct. 2026'
    },
    {
      n: 'Ment',
      t: 'Restaurante',
      a: 'Calle San Pablo 80-82',
      p: 'El restaurante del chef Óscar Calleja.',
      s: 'Guía Repsol 2026, recomendado'
    }
  ],
  salesas: [
    {
      n: 'Mesón Los Faroles',
      t: 'Bar de pinchos',
      a: 'Calle Van Dyck 26',
      p: 'En la calle de los pinchos, barato y con 4,3 en Tripadvisor (unas 470 opiniones).',
      s: 'Tripadvisor, oct. 2026'
    }
  ],
  garridosur: [
    {
      // Calle Ayala, 3: en Garrido Sur (OpenStreetMap); restaurante de un tenedor (Turismo de Castilla y León)
      n: 'Restaurante Orquídea',
      t: 'Restaurante',
      a: 'Calle Ayala, 3',
      p: '8,4 sobre 10 en Gastroranking con unas 2.100 opiniones de Google y Tripadvisor.',
      s: 'Gastroranking, oct. 2026'
    }
  ],
  garridonorte: [
    {
      // Avenida de los Cedros, 30: en Garrido Norte, no en Garrido Sur (OpenStreetMap, web del bar)
      n: 'Café Bar Leyma',
      t: 'Bar de barrio',
      a: 'Avenida de los Cedros, 30',
      p: 'Montaditos, tostas, hamburguesas y torreznos; 4,6 sobre 5 en Google con unas 1.150 opiniones.',
      s: 'web del bar y Gastroranking, oct. 2026'
    }
  ],
  estacion: [
    {
      n: 'Orquídea',
      t: 'Mediterránea y española',
      a: 'A unos 650 m de la estación de tren',
      p: '4,2 en Tripadvisor con unas 300 opiniones; es de los más cercanos a la estación.',
      s: 'Tripadvisor, oct. 2026'
    }
  ],
  tejares: [
    {
      n: 'Restaurante Cala Fornells',
      t: 'Mediterránea',
      a: 'A unos 300 m de la estación de Tejares-Chamberí',
      p: 'El mejor valorado de los que hay junto a la estación: 4,2 en Tripadvisor con unas 600 opiniones.',
      s: 'Tripadvisor, oct. 2026'
    }
  ],
  teso: [
    {
      n: 'Pucela',
      t: 'Cocina tradicional',
      a: 'Carretera de Béjar',
      p: 'Carnes, pescados y cochinillo, con vistas a la ciudad. Conviene reservar.',
      s: 'Guía Repsol 2026, recomendado'
    }
  ],
  santamarta: [
    {
      n: 'El Trashoguero',
      t: 'Cocina tradicional',
      a: 'Avenida de Madrid',
      p: 'Famoso por sus carnes y croquetas: 8,7 sobre 10 con unas 940 opiniones.',
      s: 'Gastroranking, oct. 2026'
    }
  ],
  villares: [
    {
      n: 'Asador Los Arcos',
      t: 'Asador',
      a: 'Ronda Marte 98, polígono Los Villares',
      p: '8,2 sobre 10 con unas 3.800 opiniones.',
      s: 'Gastroranking, oct. 2026'
    }
  ],
  cabrerizos: [
    {
      n: 'Izurpi',
      t: 'Cocina tradicional',
      a: 'Calle Constitución 17',
      p: 'Muy valorado por su menú degustación: 4,6 sobre 5 en Google con unas 890 opiniones.',
      s: 'Gastroranking, oct. 2026'
    }
  ],
  sancristobal: [
    {
      n: 'Sibuya Urban Sushi Bar',
      t: 'Japonesa',
      a: 'Gran Vía, 58',
      p: 'El mejor valorado de la zona en Gastroranking: 8,8 sobre 10 con unas 5.200 opiniones. Precio medio: 20 a 30 €.',
      s: 'Gastroranking, oct. 2026'
    },
    {
      n: 'El Alquimista',
      t: 'Restaurante',
      a: 'Plaza de San Cristóbal, 6',
      p: 'Otro de los mejor valorados de la zona en Gastroranking: 8,6 sobre 10 con unas 2.500 opiniones.',
      s: 'Gastroranking, oct. 2026'
    }
  ],
  montalvos: [
    {
      n: 'Arrocería Eider',
      t: 'Restaurante',
      a: 'Calle Laguna Negra, 84',
      p: 'El mejor valorado de la zona en Gastroranking: 8,6 sobre 10 con unas 1.200 opiniones.',
      s: 'Gastroranking, oct. 2026'
    }
  ],
  carmelitas: [
    {
      n: 'La Tertulia Venezolana',
      t: 'Bar de copas',
      a: 'Avenida de Portugal, 131',
      p: 'El mejor valorado de la zona en Gastroranking: 8,5 sobre 10 con unas 710 opiniones.',
      s: 'Gastroranking, oct. 2026'
    }
  ],
  blanco: [
    {
      n: 'Bar Hamburgo II',
      t: 'Bar',
      a: 'Calle Bachiller Sansón Carrasco, 12',
      p: 'El mejor valorado de la zona en Gastroranking: 8,5 sobre 10 con unas 300 opiniones.',
      s: 'Gastroranking, oct. 2026'
    }
  ],
  arrabal: [
    {
      n: 'Baobar SteakHouse',
      t: 'Asador',
      a: 'A unos 100 m del Puente Romano',
      p: 'El mejor valorado de la zona en Gastroranking: 8,5 sobre 10 con unas 980 opiniones.',
      s: 'Gastroranking, oct. 2026'
    }
  ],
  sanjose: [
    {
      n: 'Restaurante Guinaldo',
      t: 'Restaurante',
      a: 'Avenida Hilario Goyenechea, 17',
      p: 'El mejor valorado de la zona en Gastroranking: 8,5 sobre 10 con unas 1.800 opiniones.',
      s: 'Gastroranking, oct. 2026'
    }
  ],
  sanbernardo: [
    {
      n: 'La Tabernita',
      t: 'Bar',
      a: 'Calle Arapiles, 47',
      p: 'El mejor valorado de la zona en Gastroranking: 8,4 sobre 10 con unas 520 opiniones.',
      s: 'Gastroranking, oct. 2026'
    }
  ],
  labradores: [
    {
      n: 'Mey Wei Yuan',
      t: 'China',
      a: 'Calle Dimas Madariaga, 38',
      p: 'El mejor valorado de la zona en Gastroranking: 8,2 sobre 10 con unas 970 opiniones.',
      s: 'Gastroranking, oct. 2026'
    },
    {
      n: 'Angus Deli',
      t: 'Restaurante',
      a: 'Calle Río Tormes',
      p: 'Otro de los mejor valorados de la zona en Gastroranking: 8,3 sobre 10 con unas 440 opiniones.',
      s: 'Gastroranking, oct. 2026'
    }
  ],
  sanjuan: [
    {
      n: "Restaurante Veggie Sue's",
      t: 'Restaurante',
      a: 'Calle Condes de Crespo Rascón, 12',
      p: 'El mejor valorado de la zona en Gastroranking: 8,3 sobre 10 con unas 410 opiniones.',
      s: 'Gastroranking, oct. 2026'
    },
    {
      n: '269 Gastro Vegan',
      t: 'Restaurante',
      a: 'Calle Condes de Crespo Rascón, 11',
      p: 'Otro de los mejor valorados de la zona en Gastroranking: 8,1 sobre 10 con unas 1.400 opiniones. Precio medio: 30 a 45 €.',
      s: 'Gastroranking, oct. 2026'
    }
  ],
  tormes: [
    {
      n: 'Bar Torres II',
      t: 'Cafetería',
      a: 'Plaza Maestro Tárrega, 7',
      p: 'El mejor valorado de la zona en Gastroranking: 8,3 sobre 10 con unas 220 opiniones.',
      s: 'Gastroranking, oct. 2026'
    }
  ],
  vidal: [
    {
      n: 'Crepería Volare',
      t: 'Restaurante',
      a: 'Paseo Doctor Torres Villarroel 37',
      p: 'El mejor valorado de la zona en Gastroranking: 8,0 sobre 10 con unas 460 opiniones.',
      s: 'Gastroranking, oct. 2026'
    }
  ],
  rollo: [
    {
      n: 'OS-DA-MA',
      t: 'Restaurante',
      a: 'Calle Pintor González Ubierna, 1',
      p: 'El mejor valorado de la zona en Gastroranking: 7,9 sobre 10 con unas 160 opiniones.',
      s: 'Gastroranking, oct. 2026'
    }
  ],
  delicias: [
    {
      n: 'Café Bar Jintena’s',
      t: 'Bar',
      a: 'Calle Bolivia, 21',
      p: 'El mejor valorado de la zona en Gastroranking: 7,9 sobre 10 con unas 220 opiniones.',
      s: 'Gastroranking, oct. 2026'
    }
  ],
  prosperidad: [
    {
      // Calle Núñez de Zamora, 1: en Prosperidad (OpenStreetMap)
      n: 'Bar la Cantina',
      t: 'Bar de tapas',
      a: 'Calle Núñez de Zamora, 1',
      p: 'Tapas y pinchos con terraza: 4,3 sobre 5 en Google con unas 240 opiniones, según Gastroranking.',
      s: 'Gastroranking, oct. 2026'
    }
  ],
  fontana: [
    {
      n: 'Cafetería Con Pan y Vino',
      t: 'Bar',
      a: 'Calle Jardines, 12-22',
      p: 'El mejor valorado de la zona en Gastroranking: 7,8 sobre 10 con unas 200 opiniones.',
      s: 'Gastroranking, oct. 2026'
    }
  ],
  glorieta: [
    {
      n: 'Tristan',
      t: 'Restaurante',
      a: 'Avenida Agustinos Recoletos, 44',
      p: 'El mejor valorado de la zona en Gastroranking: 7,7 sobre 10 con unas 2.700 opiniones.',
      s: 'Gastroranking, oct. 2026'
    }
  ],
  pizarrales: [
    {
      n: 'La Plazzoletta de Merino',
      t: 'Restaurante',
      a: 'Calle Federico de Onís, 42',
      p: 'El mejor valorado de la zona en Gastroranking: 7,6 sobre 10 con unas 130 opiniones.',
      s: 'Gastroranking, oct. 2026'
    }
  ],
  chamberi: [
    {
      n: 'Restaurante El Caracol del Bierzo',
      t: 'Restaurante',
      a: 'Avenida de Lasalle, 91',
      p: 'El mejor valorado de la zona en Gastroranking: 7,4 sobre 10 con unas 1.900 opiniones.',
      s: 'Gastroranking, oct. 2026'
    }
  ],
  santotomas: [
    {
      n: 'Bar Le Cantine',
      t: 'Bar',
      a: 'Paseo de Canalejas, 103',
      p: 'El mejor valorado de la zona en Gastroranking: 7,4 sobre 10 con unas 73 opiniones.',
      s: 'Gastroranking, oct. 2026'
    }
  ],
  chinchibarra: [
    {
      n: 'Bar El Duende',
      t: 'Bar',
      a: 'Avenida de Federico Anaya, 49',
      p: 'El mejor valorado de la zona en Gastroranking: 7,4 sobre 10 con unas 320 opiniones.',
      s: 'Gastroranking, oct. 2026'
    }
  ],
  sanisidro: [
    {
      n: 'Bar San-mar',
      t: 'Bar de copas',
      a: 'Paseo del Rollo, 44',
      p: 'El mejor valorado de la zona en Gastroranking: 7,0 sobre 10 con unas 74 opiniones.',
      s: 'Gastroranking, oct. 2026'
    }
  ],
  villamayor: [
    {
      n: 'Bar La Fragua',
      t: 'Bar',
      a: 'Carretera SA-300, 25',
      p: 'El mejor valorado de la zona en Gastroranking: 7,8 sobre 10 con unas 220 opiniones.',
      s: 'Gastroranking, oct. 2026'
    }
  ],
  carbajosa: [
    {
      n: 'El Montalvo',
      t: 'Restaurante',
      a: 'Calle Newton, 36',
      p: 'El mejor valorado de la zona en Gastroranking: 8,1 sobre 10 con unas 990 opiniones.',
      s: 'Gastroranking, oct. 2026'
    }
  ],
  castmoriscos: [
    {
      n: 'Mesón Castellano',
      t: 'Restaurante',
      a: 'Carretera de Valladolid, 4-6',
      p: 'El mejor valorado de la zona en Gastroranking: 8,3 sobre 10 con unas 2.800 opiniones. Precio medio: 30 a 45 €.',
      s: 'Gastroranking, oct. 2026'
    }
  ],
  capuchinos: [
    {
      n: 'Mesón Borgoña',
      t: 'Mesón',
      a: 'Avenida de los Agustinos Recoletos, 99',
      p: 'Mesón de barrio con terraza: 6,7 sobre 10 en Gastroranking con unas 420 opiniones. Destacan sus pinchos, sobre todo el de tortilla, y los desayunos.',
      s: 'Gastroranking, oct. 2026'
    }
  ]
};
// Zonas colocadas con una coordenada exacta; el resto lleva el aviso «Posición aproximada»
const POSICION_EXACTA = new Set([
  'sanvicente',
  'tenerias',
  'santotomas',
  'labradores',
  'salesas',
  'garridosur',
  'garridonorte',
  'chinchibarra',
  'glorieta',
  'alamedilla',
  'fontana',
  'delicias',
  'sanisidro',
  'prosperidad',
  'rollo',
  'puenteladrillo',
  'carmelitas',
  'sanbernardo',
  'carmen',
  'vidal',
  'pizarrales',
  'blanco',
  'capuchinos',
  'platina',
  'arrabal',
  'tormes',
  'chamberi',
  'tejares',
  'buenosaires',
  'alambres',
  'zurguen',
  'vistahermosa',
  'vega',
  'teso',
  'sanjose',
  'marin',
  'alcaldes',
  'montalvos',
  'univ',
  'ursulas',
  'sanesteban',
  'estacion',
  'hospitales',
  'villamayor',
  'aldeatejada',
  'villares',
  'cabrerizos',
  'santamarta',
  'carbajosa',
  'doninos',
  'carrascal',
  'pelabravo',
  'moriscos',
  'castmoriscos',
  'castvilliquera',
  'centro',
  'sancti',
  'sanjuan',
  'sancristobal'
]);
