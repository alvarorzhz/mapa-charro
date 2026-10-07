# Mapa charro de Salamanca

App web para ir marcando los barrios de Salamanca, los pueblos del alfoz y toda la provincia: curiosidades, leyendas, dónde comer y botón «Estoy aquí».

Web: https://alvarorzhz.github.io/mapa-charro/

## Estructura

```
index.html            Solo la estructura de la página y la carga de scripts
css/estilos.css       Estilos (móvil primero; a partir de 900 px, diseño de dos columnas)
js/util.js            Utilidades: proyección, DOM, SVG, geometría
js/datos/             Solo datos, sin lógica
  zonas.js            Barrios y pueblos del mapa
  contenido.js        Curiosidades, leyendas, fotos y dónde comer
  geometria.js        Límites de barrios, ciudad, río y provincia
  carreteras.js       Carreteras, rondas y avenidas
  provincia.js        Municipios, comarcas y pedanías
js/estado.js          Progreso del usuario y su validación
js/guardado.js        Guardado en la cuenta (dentro de Claude) y copia local
js/mapa.js            Dibujo del mapa, zoom y arrastre
js/ficha.js           Ficha de zona y marcado
js/logros.js          Logros
js/vistas.js          Pestañas, lista, buscador, copia de seguridad, teclado
js/ubicacion.js       Botón Estoy aquí
js/provincia.js       Pestaña Provincia
js/inicio.js          Arranque
img/, icons/          Fotos e iconos
```

Los scripts son clásicos (no módulos) y comparten el ámbito global, así que **el orden de carga en `index.html` importa**: utilidades, datos, estado y después el resto. Al cambiar un archivo, sube el número `?v=` en `index.html` para que los navegadores no usen la versión vieja.

## Datos y licencias

Lindes, posiciones, carreteras y pedanías: © colaboradores de OpenStreetMap (ODbL), cruzados con el Nomenclátor del INE, Wikipedia y Wikidata. Comarcas tradicionales según Llorente Maldonado (1976). Fotos de Wikimedia Commons con su autor y licencia en cada ficha.
