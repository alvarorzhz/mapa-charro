# Mapa charro — notas para Claude

- Idioma de la app y de los commits: español.
- La app se publica en dos sitios con el MISMO código: GitHub Pages (rama `main`, raíz) y un Artifact de Claude (https://claude.ai/artifact/CD4ipLuLeSxu9ePXcX58ni) publicado con `index.html` + `files` (css, js, img, icons, manifest).
- Dentro de Claude, `window.claude.use('db'|'user')` da guardado en la cuenta; en la web devuelve null y todo queda en localStorage (`charro2`). El código debe funcionar en ambos casos.
- Scripts clásicos con ámbito global compartido: respeta el orden de `index.html`. `js/datos/*` solo declara constantes de datos; la lógica va en `js/*.js`.
- Al cambiar cualquier archivo (js, css, img, iconos), ejecuta `node herramientas/version.js` antes del commit: sube `?v=N` en `index.html` y actualiza la versión y la lista de archivos de `sw.js`. No los toques a mano.
- `sw.js` hace que la web funcione sin conexión (solo fuera de Claude). Si añades un archivo nuevo, enlázalo desde `index.html` o ponlo en `img/` o `icons/` para que el script lo incluya.
- La geolocalización no funciona dentro del visor de Claude (no hay permiso); sí en la web.
- No inventes datos: curiosidades, restaurantes y leyendas llevan fuente verificable.
