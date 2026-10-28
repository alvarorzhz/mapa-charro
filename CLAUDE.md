# Mapa charro — notas para Claude

PWA en JavaScript sin framework (scripts clásicos con `defer` y ámbito global compartido, en el orden de `index.html`; los datos son módulos que `js/datos-globales.js` deja en `globalThis`). Se publica igual en GitHub Pages y en un Artifact de Claude.

## Para gastar poco

- Lee solo lo que pide la tarea: busca con Grep el nombre de la función o del id y abre ese trozo (`offset`/`limit`), no el archivo entero ni carpetas enteras.
- No abras ni busques en los datos voluminosos salvo que la tarea sea justo de esos datos: `js/datos/alfoz.js`, `provincia.js`, `geometria.js`, `carreteras.js`, `carreteras-provincia.js`, `tramos.js`, `tramos-provincia.js`, `habitantes.js`, `parques.js` y `orientacion-fachadas.js`. Tienen líneas de decenas de KB (coordenadas). Si necesitas un dato suyo, sácalo con `node -e` (cargando el archivo y mirando solo esa clave). Los generados no se editan a mano: se regeneran con su script de `herramientas/`.
- El detalle de cada parte está en `docs/notas/`. Abre solo la nota del tema que tocas.

## Reglas siempre

- Idioma de la app y de los commits: español. Nombres en español y descriptivos; Prettier.
- No inventes datos: curiosidades, restaurantes, leyendas y cultura llevan fuente verificable.
- «Haz el commit» = publicarlo en la web: `npm run antes-del-commit` (si falla, no hay commit: encadena con `&&`), commit y push a la rama de trabajo, PR con squash a `main` titulado «2.x.y: …» y merge cuando GitHub Actions esté en verde. Cada cambio publicado sube la versión de `package.json` (al menos la tercera cifra) y lleva su entrada en `novedades.json` (`usuario` y `tecnico`, la más nueva primero). Detalle en `docs/notas/publicar.md`.
- No toques a mano `?v=N` de `index.html` y `js/datos-globales.js` ni la lista de `sw.js`: lo hace `node herramientas/version.js`.
- El código tiene que funcionar dentro de Claude (`window.claude.use(...)`) y en la web (null, todo en localStorage `charro2`).
- No cambies los campos del progreso (`z`, `p`, `gv`, `f`, `t`, `j`) ni los ids de zonas, logros, rutas o detalles: lo nuevo va dentro de `j`. Ver `docs/notas/guardado.md`.
- Nada de `innerHTML`, `eval` ni HTML como texto: se construye con `crear()` (util.js). Ver `docs/notas/seguridad.md`.
- Función nueva → su prueba en `herramientas/pruebas/<zona>.js`; tipo de dato nuevo → su comprobación en `herramientas/comprobar-datos.js`.
- `js/datos/*` solo declara constantes (`export const`; un archivo nuevo se importa en `js/datos-globales.js`); la lógica va en `js/*.js`. Usa los ayudantes de `util.js` (`crear`, `crearSvg`, `crearBotonesFiltro`, `activarGestos`).

## Dónde está cada cosa

Lógica en `js/`, datos en `js/datos/`, nota en `docs/notas/` entre paréntesis.

- **Arranque, novedades, fuentes**: `inicio.js`, `bienvenida.js`, `paseo.js` (interfaz)
- **Estado, guardado, cuentas**: `estado.js`, `guardado.js`, `cuenta.js`, `copia.js`; datos: `firebase.js` (guardado)
- **Mapa de la capital**: `mapa.js` → `mapa-fondo.js` → `mapa-vias.js` → `mapa-vista.js`, `mapa-real.js`, `mapa-teclado.js`; datos: `zonas.js`, `geometria.js`, `carreteras.js`, `alfoz.js`, `parques.js` (mapa)
- **Pestañas, lista, capas, filtros**: `vistas.js`, `escritorio.js`, `enlaces.js` (mapa)
- **Fichas de zona y relacionados**: `ficha.js`, `monumentos.js`; datos: `contenido.js`, `monumentos.js` (interfaz, contenido)
- **Provincia y pueblos**: `provincia.js`, `pueblos.js`, `ubicacion.js`; datos: `provincia.js`, `pueblos.js`, `habitantes.js`, `carreteras-provincia.js` (provincia)
- **Rutas**: `ruta.js`, `ruta-provincia.js`; datos: `rutas.js`, `tramos.js`, `rutas-provincia.js`, `tramos-provincia.js` (rutas)
- **Explora: monumentos, comer**: `explorar.js`, `buscador.js`; datos: `contenido.js`, `monumentos.js` (interfaz)
- **¿Qué puedo descubrir hoy?**: `hoy.js` (interfaz)
- **Cultura, agenda**: `cultura.js`, `agenda.js`; datos: `cultura.js` (contenido)
- **Salamanca en el tiempo, desaparecida**: `tiempo.js`, `desaparecida.js`; datos: `tiempo.js`, `desaparecida.js` (contenido)
- **Detalles escondidos, hora dorada**: `detalles.js`, `hora-dorada.js`; datos: `detalles.js`, `fachadas.js`, `orientacion-fachadas.js` (contenido)
- **Logros, Tu/Mi Salamanca, juego**: `logros.js`, `perfil.js`, `mi-salamanca-calculos.js` → `-piezas.js` → `mi-salamanca.js`, `imagen.js`, `juego.js` (logros-y-tu-salamanca)
- **Palabras, avisar, medición**: `palabras.js`, `avisar.js`, `medicion.js`; datos: `palabras.js` (interfaz)
- **Estilos y tema**: `css/estilos.css` (tema)
- **Pruebas**: `herramientas/pruebas.js` + `herramientas/pruebas/<zona>.js` (pruebas)
- **Comprobación y generadores**: `herramientas/comprobar-datos.js`, `herramientas/*.js` (publicar)

Notas en `docs/notas/`: `publicar`, `pruebas`, `guardado`, `mapa`, `provincia`, `rutas`, `contenido`, `interfaz`, `logros-y-tu-salamanca`, `seguridad`, `tema`. Si cambias cómo funciona algo, actualiza su nota (no este archivo, salvo que cambie el mapa o una regla de arriba).
