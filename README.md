# Mapa charro de Salamanca

App web para ir marcando los barrios de Salamanca y los pueblos de su provincia: curiosidades, leyendas, monumentos, rutas a pie y en coche, dónde comer, palabras charras y un juego para adivinar zonas. Es un proyecto personal y sin ánimo de lucro.

- Web: https://alvarorzhz.github.io/mapa-charro/
- También funciona dentro de Claude, como artefacto, con el mismo código.
- Privacidad: [privacidad.html](privacidad.html)

## Qué tiene

- **Capital:** 50 barrios y 12 pueblos de alrededor con su ficha (curiosidades, leyendas, fotos, dónde comer), monumentos, parques, carreteras y «Salamanca en el tiempo».
- **Provincia:** los 361 municipios con sus pedanías y sus habitantes (INE), fichas de pueblo, autovías y nacionales.
- **Rutas:** a pie por la ciudad y en coche por la provincia, con su mapa, sus tiempos y el seguimiento «La he hecho» / «La quiero hacer».
- **Para cada persona:** progreso guardado en el navegador o en la cuenta (Google en la web, Claude dentro de Claude), perfil con nivel, historial y logros.
- **Funciona sin conexión** en la web (service worker) y se puede instalar en el móvil.

## Cómo está hecha

HTML, CSS y JavaScript sin frameworks ni compilación: scripts clásicos que comparten el ámbito global, así que **el orden de carga en `index.html` importa** (utilidades, datos, estado y después el resto).

```
index.html             Estructura de la página y carga de scripts
css/estilos.css        Estilos (móvil primero; a partir de 900 px, dos columnas)
js/util.js             Proyección, geometría, textos, DOM/SVG, filtros, avisos y gestos
js/datos/              Solo datos, sin lógica (cada archivo explica su formato al principio)
  zonas.js             Barrios y pueblos del mapa
  contenido.js         Curiosidades, leyendas, fotos y dónde comer
  monumentos.js        Monumentos y sitios del mapa
  rutas.js, tramos.js  Rutas a pie y su camino por calles reales (generado)
  rutas-provincia.js   Rutas en coche; tramos-provincia.js, su camino por carretera (generado)
  pueblos.js           Fichas de pueblos de la provincia
  habitantes.js        Habitantes por municipio, del INE (generado)
  provincia.js         Municipios, comarcas y pedanías
  geometria.js, alfoz.js, carreteras.js, carreteras-provincia.js, parques.js   Lindes y trazados
  tiempo.js            Etapas de «Salamanca en el tiempo»
  palabras.js          Palabras charras
  firebase.js          Configuración pública de Firebase (ver «Seguridad»)
js/*.js                La lógica: mapa, fichas, provincia, rutas, logros, perfil, juego, buscador, cuenta…
img/, icons/           Fotos e iconos (icons/icono.svg es el original del icono)
sw.js                  Service worker: la web sin conexión
herramientas/          Generadores de datos, comprobaciones y pruebas
```

`CLAUDE.md` tiene las normas del proyecto con más detalle (formato del progreso, versiones, cómo se generan los datos).

## Trabajar en ella

```
npm ci                       # dependencias (Playwright va fijado a la 1.56.0)
npm run antes-del-commit     # versión de archivos + comprobar datos + ESLint + pruebas en el navegador
npx prettier --check "js/**/*.js" sw.js "herramientas/*.js"
```

- `node herramientas/version.js` sube el `?v=N` de los archivos en `index.html` y la lista de `sw.js`: hay que ejecutarlo al cambiar cualquier archivo (lo hace `antes-del-commit`).
- `herramientas/comprobar-datos.js` revisa ids, fuentes, fotos, coordenadas, rutas y que todo esté enlazado.
- `herramientas/pruebas.js` abre la app en Chromium, en móvil y en escritorio, y prueba casi todo, incluido el contraste (axe) y el modo sin conexión. `PRUEBAS_TAMANO=movil` o `escritorio` pasa solo uno.
- Datos generados: `rutas.js`, `rutas-provincia.js`, `habitantes.js`, `carreteras-provincia.js`, `parques.js`, `tarjetas.js` (imágenes para compartir) e `iconos.js`. Cada uno explica al principio cómo se usa.

## Publicación

GitHub Actions (`.github/workflows/pruebas.yml`) repite en cada push la comprobación de datos, el formato, ESLint y las pruebas. En `main`, si todo pasa, publica la web en GitHub Pages. Cada lunes, `revision-semanal.yml` revisa los enlaces de las fuentes, los restaurantes con datos de más de un año y Lighthouse. Dependabot propone las actualizaciones de las dependencias.

Cada versión (`package.json`, visible al pie de la app) lleva su entrada en `novedades.json`, que se ve al pulsar el número de versión.

## Seguridad

- **La clave de Firebase (`js/datos/firebase.js`) es pública a propósito.** En las apps web de Firebase esa clave solo identifica el proyecto y viaja a todos los navegadores; no da acceso a los datos. Lo que los protege es:
  - las **reglas de Firestore**, que solo dejan a cada persona leer y escribir su propio documento `progreso/<uid>`;
  - los **dominios autorizados** de Firebase Auth (la web y `localhost`);
  - la **restricción de la clave** por sitio web en Google Cloud.
- La app crea todo el contenido como texto (nada de `innerHTML` con datos de fuera) y limpia el progreso guardado al leerlo.
- Si encuentras un fallo de seguridad, escribe a la dirección de [privacidad.html](privacidad.html) en vez de abrir una incidencia pública.

## Datos, fuentes y licencias

Ningún dato está inventado: cada curiosidad, leyenda, restaurante y cifra lleva su fuente.

- **Mapas:** lindes, calles, carreteras, parques y pedanías © colaboradores de [OpenStreetMap](https://www.openstreetmap.org/copyright) (ODbL), cruzados con el Nomenclátor del INE, Wikipedia y Wikidata. Comarcas tradicionales según Llorente Maldonado (1976).
- **Rutas:** caminos calculados con OSRM sobre OpenStreetMap.
- **Habitantes:** INE, Padrón municipal (cifras oficiales).
- **Fotos:** Wikimedia Commons, con su autor y licencia en cada ficha.
- **Textos:** resúmenes propios a partir de Wikipedia, Turismo de Castilla y León, el Ayuntamiento, la prensa local y guías como Repsol, Michelin y Gastroranking; cada ficha enlaza las suyas.
- **Tipografías:** Alfa Slab One y Lora (SIL Open Font License).

El código no tiene todavía una licencia de código abierto: se puede leer y aprender de él, pero para reutilizarlo hay que pedir permiso.
