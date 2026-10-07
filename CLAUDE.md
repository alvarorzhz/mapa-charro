# Mapa charro — notas para Claude

- Idioma de la app y de los commits: español.
- La app se publica en dos sitios con el MISMO código: GitHub Pages (rama `main`, raíz) y un Artifact de Claude (https://claude.ai/artifact/CD4ipLuLeSxu9ePXcX58ni) publicado con `index.html` + `files` (css, js, img, icons, manifest).
- Dentro de Claude, `window.claude.use('db'|'user')` da guardado en la cuenta; en la web devuelve null y todo queda en localStorage (`charro2`). El código debe funcionar en ambos casos.
- Scripts clásicos con ámbito global compartido: respeta el orden de `index.html`. `js/datos/*` solo declara constantes de datos; la lógica va en `js/*.js`.
- Al cambiar cualquier js/css, incrementa `?v=N` en todas las etiquetas de `index.html`.
- La geolocalización no funciona dentro del visor de Claude (no hay permiso); sí en la web.
- No inventes datos: curiosidades, restaurantes y leyendas llevan fuente verificable.
