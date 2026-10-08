# Mapa charro — notas para Claude

- Idioma de la app y de los commits: español.
- La app se publica en dos sitios con el MISMO código: GitHub Pages (rama `main`, raíz) y un Artifact de Claude (https://claude.ai/artifact/CD4ipLuLeSxu9ePXcX58ni) publicado con `index.html` + `files` (css, js, img, icons, manifest, novedades.json).
- Dentro de Claude, `window.claude.use('db'|'user')` da guardado en la cuenta; en la web devuelve null y todo queda en localStorage (`charro2`). El código debe funcionar en ambos casos.
- Scripts clásicos con ámbito global compartido: respeta el orden de `index.html`. `js/datos/*` solo declara constantes de datos; la lógica va en `js/*.js`.
- Antes de cada commit: `npm run antes-del-commit` (sube la versión, comprueba los datos y pasa las pruebas en el navegador). Si falla algo, no hagas commit.
- GitHub Actions (`.github/workflows/pruebas.yml`) repite en cada push los datos, el formato (Prettier) y las pruebas, contraste incluido (axe). Dependencias con `npm ci`; Playwright va fijado a la versión de los navegadores del entorno (1.56.0): no lo subas sin comprobar que hay navegador para esa versión.
- Versión visible (al pie de la app): la de `package.json`, tipo 1.4.0 (primera cifra: cambios grandes; segunda: funciones nuevas; tercera: arreglos). Súbela solo cuando el usuario lo diga; `version.js` la copia a `index.html`. Cada versión lleva su entrada en `novedades.json` (la más nueva primero): `usuario` (lista de puntos cortos para la gente, uno por cambio; se ve al pulsar la versión en la app) y `tecnico` (para nosotros).
- Al cambiar cualquier archivo (js, css, img, iconos), ejecuta `node herramientas/version.js` antes del commit: sube `?v=N` en `index.html` y actualiza la versión y la lista de archivos de `sw.js`. No los toques a mano.
- `sw.js` hace que la web funcione sin conexión (solo fuera de Claude). Si añades un archivo nuevo, enlázalo desde `index.html` o ponlo en `img/` o `icons/` para que el script lo incluya.
- La geolocalización no funciona dentro del visor de Claude (no hay permiso); sí en la web.
- Tarjetas para compartir: `node herramientas/tarjetas.js` genera la general (`og.png`) y una por zona (`z/<id>.html` + `z/<id>.jpg`); con `general` o `zonas`, solo esa parte. Regenéralas si cambia el nombre, la frase o el dibujo de una zona (`comprobar-datos` lo detecta). No van en el Artifact ni en el modo sin conexión.
- No inventes datos: curiosidades, restaurantes y leyendas llevan fuente verificable.
- Estilo: nombres en español y descriptivos; formatea con Prettier (`.prettierrc.json`, sin tocar los datos de `.prettierignore`). Usa los ayudantes de `util.js` (`crear`, `crearSvg`, `crearBotonesFiltro`, `activarGestos`) en vez de repetir código.
- Si añades una función nueva a la app, añade su prueba en `herramientas/pruebas.js`; si añades un tipo de dato, su comprobación en `herramientas/comprobar-datos.js`.
- Rutas a pie: paradas en `js/datos/rutas.js` (monumentos o sitios propios con fuente) y caminos en `js/datos/tramos.js`, generado sobre las calles de OpenStreetMap con `node herramientas/rutas.js <id>`: si cambian las paradas hay que recalcular los tramos (`comprobar-datos` lo detecta).
- No cambies los nombres de los campos del progreso (`z`, `p`, `gv`, `f`, `t`) ni los ids de zonas y logros: están en el progreso guardado de la gente y en los enlaces.
- Cuenta con Google en la web (`js/cuenta.js`, configuración en `js/datos/firebase.js`): Firebase Auth + Firestore (`progreso/<uid>`, reglas en la consola de Firebase del proyecto `mapa-charro`). Firebase se carga de gstatic solo al entrar o si ya se entró (`charro-cuenta`). Dentro de Claude no se usa. La sincronización es la de `guardado.js` (`conectarNube`), común a las dos cuentas. Página de privacidad: `privacidad.html`.
