# Orden de carga y dependencias entre scripts

<!-- Generado por herramientas/dependencias.js: no lo edites a mano. -->

La lógica son scripts clásicos que comparten el ámbito global y se ejecutan en el orden de `index.html`. Hay dos tipos de dependencia:

- **Al cargarse**: código suelto arriba del todo (o funciones que se llaman ahí mismo, aunque sean de otro archivo). Lo que use tiene que venir de un script **anterior**; si no, la app se rompe al abrirla con «X is not defined». `node herramientas/dependencias.js` lo comprueba y falla si no se cumple (va en `antes-del-commit` y en GitHub Actions).
- **Después**: lo que se usa dentro de funciones que se llaman más tarde (un clic, el arranque de `inicio.js`, que va casi al final y pone todo en marcha cuando ya está cargado). Eso puede estar en cualquier archivo, también en uno de detrás.

Reglas para ampliar la app:

- Un archivo nuevo va en `index.html` detrás de todo lo que use al cargarse y delante de quien lo use al cargarse; si solo tiene funciones, delante de `inicio.js` basta.
- No pongas código suelto que llame a funciones de otros archivos: mételo en una función y llámala desde el arranque (`inicio.js`).
- Los datos (`js/datos/`) llegan con `datos-globales.js`: `util.js` y `medicion.js` van antes y no pueden usarlos al cargarse.
- Lo que varios archivos cambian va en `estadoApp` (`estado.js`), no en un `let` suelto.
- Si mueves un script de sitio, ejecuta `node herramientas/dependencias.js`: dice qué se rompe y rehace esta tabla.

| # | Script | Necesita ya cargados (al cargarse) | Usa después (en funciones) | Lo usan |
| - | ------ | ---------------------------------- | -------------------------- | ------- |
| 1 | `util.js` | — | — | 43 |
| 2 | `medicion.js` | — | `util.js`, `datos-globales.js`, `estado.js`, `ficha.js`, `imagen.js`, `paseo.js`, `cuenta.js`, `avisar.js` | 10 |
| 3 | `datos-globales.js` | — | — | 34 |
| 4 | `estado.js` | `util.js`, `datos-globales.js` | `guardado.js` | 38 |
| 5 | `guardado.js` | — | `util.js`, `datos-globales.js`, `estado.js`, `mapa.js`, `vistas.js`, `perfil.js`, `mi-salamanca.js`, `cuenta.js` | 11 |
| 6 | `mapa.js` | `util.js`, `datos-globales.js`, `estado.js` | `mapa-fondo.js`, `mapa-vista.js`, `ficha.js`, `juego.js` | 9 |
| 7 | `mapa-fondo.js` | `util.js`, `datos-globales.js`, `estado.js`, `mapa.js` | `mapa-vista.js`, `juego.js` | 7 |
| 8 | `mapa-vias.js` | `util.js`, `datos-globales.js` | `estado.js`, `mapa-vista.js`, `ficha.js` | 7 |
| 9 | `mapa-vista.js` | `util.js` | `estado.js`, `mapa.js`, `mapa-fondo.js`, `mapa-vias.js`, `monumentos.js`, `ubicacion.js`, `mapa-real.js`, `tiempo.js`, `desaparecida.js` | 13 |
| 10 | `ficha.js` | `util.js` | `medicion.js`, `datos-globales.js`, `estado.js`, `guardado.js`, `mapa.js`, `mapa-vias.js`, `mapa-vista.js`, `monumentos.js`, `ruta.js`, `logros.js`, `palabras.js`, `vistas.js`, `ubicacion.js`, `provincia.js`, `pueblos.js`, `cultura.js`, `juego.js`, `tiempo.js`, `desaparecida.js`, `enlaces.js` | 27 |
| 11 | `monumentos.js` | `util.js`, `datos-globales.js` | `estado.js`, `mapa-vias.js`, `mapa-vista.js`, `ficha.js`, `ruta-contexto.js`, `ruta.js`, `logros.js`, `cultura.js`, `detalles.js`, `hora-dorada.js`, `tiempo.js`, `desaparecida.js`, `enlaces.js` | 17 |
| 12 | `ruta-contexto.js` | — | `datos-globales.js` | 5 |
| 13 | `ruta.js` | `util.js`, `datos-globales.js`, `monumentos.js` | `medicion.js`, `estado.js`, `guardado.js`, `mapa.js`, `mapa-vias.js`, `mapa-vista.js`, `ficha.js`, `ruta-contexto.js`, `ruta-provincia.js`, `logros.js`, `vistas.js`, `ubicacion.js`, `cultura.js`, `enlaces.js` | 18 |
| 14 | `ruta-provincia.js` | — | `util.js`, `datos-globales.js`, `estado.js`, `ficha.js`, `ruta-contexto.js`, `ruta.js`, `provincia.js`, `pueblos.js`, `enlaces.js` | 7 |
| 15 | `logros.js` | `util.js` | `medicion.js`, `datos-globales.js`, `estado.js`, `guardado.js`, `ficha.js`, `monumentos.js`, `ruta.js`, `vistas.js`, `provincia.js`, `detalles.js`, `mi-salamanca.js` | 19 |
| 16 | `palabras.js` | — | `util.js`, `datos-globales.js`, `estado.js`, `logros.js`, `juego.js` | 2 |
| 17 | `vistas.js` | `util.js`, `estado.js` | `datos-globales.js`, `mapa.js`, `mapa-vista.js`, `ficha.js`, `logros.js`, `provincia.js`, `mi-salamanca.js`, `juego.js`, `enlaces.js`, `cuenta.js` | 18 |
| 18 | `ubicacion.js` | `util.js` | `datos-globales.js`, `estado.js`, `mapa.js`, `mapa-vista.js`, `ficha.js`, `vistas.js`, `provincia.js` | 9 |
| 19 | `mapa-real.js` | `util.js`, `estado.js`, `ubicacion.js` | — | 2 |
| 20 | `provincia.js` | — | `util.js`, `medicion.js`, `datos-globales.js`, `estado.js`, `guardado.js`, `mapa.js`, `ficha.js`, `logros.js`, `vistas.js`, `ubicacion.js`, `pueblos.js`, `cultura.js`, `enlaces.js` | 12 |
| 21 | `pueblos.js` | — | `util.js`, `datos-globales.js`, `estado.js`, `mapa-vias.js`, `ficha.js`, `monumentos.js`, `ruta.js`, `ruta-provincia.js`, `logros.js`, `vistas.js`, `ubicacion.js`, `provincia.js`, `cultura.js`, `tiempo.js`, `enlaces.js` | 10 |
| 22 | `perfil.js` | — | `util.js`, `datos-globales.js`, `estado.js`, `guardado.js`, `monumentos.js`, `ruta.js`, `logros.js`, `detalles.js`, `cuenta.js` | 5 |
| 23 | `imagen.js` | — | `util.js`, `estado.js`, `logros.js`, `enlaces.js` | 10 |
| 24 | `explorar.js` | `util.js` | `medicion.js`, `datos-globales.js`, `estado.js`, `ficha.js`, `monumentos.js`, `ruta.js`, `logros.js`, `pueblos.js`, `detalles.js`, `hora-dorada.js`, `desaparecida.js`, `enlaces.js` | 7 |
| 25 | `cultura.js` | `util.js` | `datos-globales.js`, `estado.js`, `ficha.js`, `monumentos.js`, `ruta.js`, `ruta-provincia.js`, `vistas.js`, `provincia.js`, `pueblos.js`, `agenda.js`, `tiempo.js`, `enlaces.js` | 13 |
| 26 | `agenda.js` | — | `util.js`, `datos-globales.js`, `ficha.js`, `ruta.js`, `imagen.js`, `cultura.js`, `enlaces.js` | 7 |
| 27 | `detalles.js` | — | `util.js`, `datos-globales.js`, `estado.js`, `guardado.js`, `ficha.js`, `monumentos.js`, `ruta.js`, `logros.js`, `vistas.js`, `explorar.js`, `enlaces.js` | 7 |
| 28 | `hora-dorada.js` | — | `util.js`, `datos-globales.js`, `estado.js`, `ficha.js`, `monumentos.js`, `ruta.js`, `explorar.js`, `agenda.js`, `enlaces.js` | 5 |
| 29 | `copia.js` | `util.js` | `estado.js`, `guardado.js`, `imagen.js` | 0 |
| 30 | `hoy.js` | `util.js` | `datos-globales.js`, `estado.js`, `ficha.js`, `monumentos.js`, `ruta.js`, `ruta-provincia.js`, `logros.js`, `vistas.js`, `ubicacion.js`, `provincia.js`, `pueblos.js`, `perfil.js`, `cultura.js`, `agenda.js`, `hora-dorada.js`, `tiempo.js`, `enlaces.js` | 5 |
| 31 | `mi-salamanca-calculos.js` | — | `util.js`, `datos-globales.js`, `estado.js`, `monumentos.js`, `ruta.js`, `logros.js`, `vistas.js`, `explorar.js`, `cultura.js`, `detalles.js` | 3 |
| 32 | `mi-salamanca-piezas.js` | — | `util.js`, `estado.js`, `ficha.js`, `logros.js`, `vistas.js`, `perfil.js`, `explorar.js`, `hoy.js`, `mi-salamanca-calculos.js`, `mi-salamanca.js` | 2 |
| 33 | `mi-salamanca.js` | `util.js` | `medicion.js`, `estado.js`, `ficha.js`, `ruta.js`, `logros.js`, `vistas.js`, `provincia.js`, `perfil.js`, `imagen.js`, `hoy.js`, `mi-salamanca-calculos.js`, `mi-salamanca-piezas.js`, `enlaces.js` | 6 |
| 34 | `juego.js` | `util.js` | `datos-globales.js`, `estado.js`, `guardado.js`, `mapa-fondo.js`, `mapa-vista.js`, `ficha.js`, `logros.js`, `vistas.js`, `imagen.js`, `mapa-teclado.js`, `enlaces.js` | 8 |
| 35 | `mapa-teclado.js` | `util.js`, `estado.js` | `mapa-fondo.js`, `mapa-vista.js`, `ficha.js`, `juego.js` | 2 |
| 36 | `escritorio.js` | `util.js` | `datos-globales.js`, `estado.js`, `mapa-fondo.js`, `juego.js`, `mapa-teclado.js` | 0 |
| 37 | `bienvenida.js` | — | `util.js`, `imagen.js` | 2 |
| 38 | `paseo.js` | `util.js` | `medicion.js`, `ficha.js`, `imagen.js`, `hoy.js`, `bienvenida.js` | 2 |
| 39 | `tiempo.js` | `util.js`, `datos-globales.js` | `estado.js`, `mapa-fondo.js`, `mapa-vias.js`, `mapa-vista.js`, `ficha.js`, `monumentos.js`, `logros.js`, `vistas.js`, `pueblos.js`, `cultura.js`, `desaparecida.js`, `enlaces.js` | 10 |
| 40 | `desaparecida.js` | `util.js`, `datos-globales.js`, `monumentos.js` | `estado.js`, `mapa-vista.js`, `ficha.js`, `ruta-contexto.js`, `ruta.js`, `explorar.js`, `agenda.js`, `tiempo.js`, `enlaces.js` | 7 |
| 41 | `buscador.js` | `util.js` | `medicion.js`, `datos-globales.js`, `estado.js`, `ficha.js`, `monumentos.js`, `ruta.js`, `ruta-provincia.js`, `vistas.js`, `provincia.js`, `pueblos.js`, `cultura.js`, `tiempo.js` | 0 |
| 42 | `enlaces.js` | — | `util.js`, `medicion.js`, `datos-globales.js`, `estado.js`, `ficha.js`, `monumentos.js`, `ruta.js`, `ruta-provincia.js`, `logros.js`, `vistas.js`, `provincia.js`, `pueblos.js`, `explorar.js`, `cultura.js`, `agenda.js`, `detalles.js`, `hora-dorada.js`, `hoy.js`, `mi-salamanca.js`, `tiempo.js`, `desaparecida.js` | 20 |
| 43 | `cuenta.js` | `util.js` | `datos-globales.js`, `estado.js`, `guardado.js`, `ubicacion.js`, `imagen.js` | 5 |
| 44 | `fiestas.js` | — | `util.js`, `datos-globales.js`, `cultura.js`, `agenda.js` | 1 |
| 45 | `inicio.js` | `util.js`, `medicion.js`, `datos-globales.js`, `estado.js`, `guardado.js`, `mapa.js`, `mapa-fondo.js`, `mapa-vias.js`, `mapa-vista.js`, `ficha.js`, `monumentos.js`, `ruta-contexto.js`, `ruta.js`, `ruta-provincia.js`, `logros.js`, `palabras.js`, `vistas.js`, `ubicacion.js`, `provincia.js`, `pueblos.js`, `perfil.js`, `explorar.js`, `cultura.js`, `agenda.js`, `detalles.js`, `hora-dorada.js`, `hoy.js`, `mi-salamanca-calculos.js`, `mi-salamanca-piezas.js`, `mi-salamanca.js`, `juego.js`, `bienvenida.js`, `tiempo.js`, `desaparecida.js`, `enlaces.js`, `cuenta.js`, `fiestas.js` | `mapa-real.js`, `imagen.js`, `paseo.js` | 0 |
| 46 | `avisar.js` | `util.js` | `estado.js`, `imagen.js`, `enlaces.js` | 1 |

«Lo usan» es cuántos scripts usan algo suyo (al cargarse o después): cuanto más alto, más cuidado al cambiarle nombres. El análisis es solo leyendo el código: una función guardada para luego (un `addEventListener`, un `setTimeout`) cuenta como «después», y las que van a `forEach`, `map`, `filter`… o se llaman ahí mismo cuentan como «al cargarse».
