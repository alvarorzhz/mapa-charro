# Mapa charro de Salamanca

App web para ir marcando los barrios de Salamanca, los pueblos del alfoz y toda la provincia: curiosidades, leyendas, dónde comer y botón «Estoy aquí».

Web: https://alvarorzhz.github.io/mapa-charro/

## Estructura

```
index.html            Solo la estructura de la página y la carga de scripts
css/estilos.css       Estilos (móvil primero; a partir de 900 px, diseño de dos columnas)
js/util.js            Utilidades: proyección, geometría, textos, DOM/SVG, filtros y gestos (arrastre, pinza, rueda)
js/datos/             Solo datos, sin lógica (cada archivo explica su formato al principio)
  zonas.js            Barrios y pueblos del mapa, uno por línea
  contenido.js        Curiosidades, leyendas, fotos y dónde comer
  monumentos.js       Monumentos: datos clave, curiosidades y fuente de cada uno
  ruta.js             Ruta monumental: paradas y camino por calles reales
  pueblos.js          24 pueblos de la provincia: curiosidades, monumento y dónde comer
  geometria.js        Límites de barrios, ciudad, río y provincia
  carreteras.js       Carreteras, rondas y avenidas
  provincia.js        Municipios, comarcas y pedanías
js/estado.js          Zonas, municipios, progreso del usuario (y su formato) y vista actual
js/guardado.js        Guardado en la cuenta (dentro de Claude) y copia local
js/mapa.js            Dibujo del mapa, encuadre, zoom y arrastre
js/ficha.js           Ficha de zona y de carretera, y marcado
js/logros.js          Logros
js/vistas.js          Marcador, pestañas, lista, buscador, copia de seguridad, teclado
js/ubicacion.js       Botón Estoy aquí
js/provincia.js       Pestaña Provincia
js/monumentos.js      Pictogramas de monumentos en el mapa y su mini infografía
js/ruta.js            Ruta monumental a pie: camino, paradas y navegación
js/pueblos.js         Fichas de pueblos de la provincia
js/enlaces.js         Enlaces directos (#tejares, #via/a-62, #provincia/ledesma) y botón Compartir
js/inicio.js          Arranque y registro del modo sin conexión
img/, icons/          Fotos e iconos
sw.js                 Service worker: la web funciona sin conexión
herramientas/         version.js, comprobar-datos.js y pruebas.js (ver «Pruebas»)
```

Los scripts son clásicos (no módulos) y comparten el ámbito global, así que **el orden de carga en `index.html` importa**: utilidades, datos, estado y después el resto. Al cambiar cualquier archivo, ejecuta `node herramientas/version.js`: sube el número `?v=` en `index.html` y actualiza `sw.js` para que los navegadores (y la copia sin conexión) no usen la versión vieja.

## Pruebas

```
npm install                      # una vez: Playwright y Prettier
npx playwright install chromium  # una vez: el navegador de las pruebas
npm run antes-del-commit         # versión nueva + comprobar datos + pruebas
```

`comprobar-datos.js` revisa ids, fuentes, fotos, monumentos, ruta, pueblos y que `index.html` y `sw.js` estén al día. `pruebas.js` abre la app en Chromium, en móvil y escritorio, y prueba búsqueda, marcado, enlaces y botón atrás, lista y provincia, fichas de pueblos, monumentos, ruta a pie, GPS, guardado en la cuenta (simulado), copia de seguridad y modo sin conexión.

## Estilo del código

Nombres en español y descriptivos. El código se formatea con Prettier (`.prettierrc.json`); los datos grandes de `geometria.js`, `carreteras.js` y `provincia.js` se dejan compactos (`.prettierignore`). Para crear elementos usa `crear()` (HTML) y `crearSvg()` (SVG) de `util.js`.

## Sin conexión

En la web, la primera visita guarda la app completa (unos 1,3 MB con las fotos) y a partir de ahí funciona sin cobertura. La página se pide primero a la red para ver siempre la última versión; si no hay red en 4 segundos, se usa la copia guardada. Dentro de Claude no se activa.

## Enlaces directos

Cada ficha tiene su dirección: `#<id de zona>` (p. ej. `#tenerias`), `#via/<carretera>` (`#via/a-62`), `#monumento/<id>` (`#monumento/catedrales`), `#ruta` y `#ruta/<parada>`, `#pueblo/<nombre>` (`#pueblo/la-alberca`), las pestañas `#lista` y `#provincia`, y un pueblo de la provincia `#provincia/<nombre>` (`#provincia/alba-de-tormes`). Abrir una ficha añade una entrada al historial, así que el botón «atrás» la cierra. El botón Compartir usa siempre la dirección de la web pública.

## Datos y licencias

Lindes, posiciones, carreteras y pedanías: © colaboradores de OpenStreetMap (ODbL), cruzados con el Nomenclátor del INE, Wikipedia y Wikidata. Comarcas tradicionales según Llorente Maldonado (1976). Fotos de Wikimedia Commons con su autor y licencia en cada ficha.
