# Tema «Piedra de Villamayor»

La identidad de la app: piedra dorada de Villamayor, rojo de los vítores pintados en las fachadas y tinta parda de los papeles viejos. Todo vive en tokens al principio de `css/estilos.css`; las reglas no llevan colores, tamaños de letra ni `z-index` sueltos (`comprobar-datos` lo vigila).

## Paleta (claro → oscuro)

- **Vítor** `--vitor` `#a8221c` → `#c23d33`: color principal, marcas «He estado», botones principales. Para texto, `--vitor-texto` (`#a8221c` → `#ef7a6e`).
- **Oro** `--oro` `#7c5410` → `#e0b050`: «Quiero ir», detalles y trama; texto en `--oro-texto`.
- **Piedra** `--fondo` `#d8b97a` → `#1d1810` y `--fondo-mapa` `#bc9f6f` → `#211a10`.
- **Papel** `--tarjeta` `#f1e4bd` → `#2f2719` y `--arena` `#ecdcae` → `#6a5733` (datos y curiosidades dentro de las fichas).
- **Tinta** `--tinta` `#35240f` → `#ecdcae` (texto) y `--linea` `#6e4f22` → `#b8985a` (bordes).
- Mapa: `--zona-0` … `--zona-6` (rellenos de barrio), `--campo`, `--vecino`, `--rio`, `--parque`, `--calle`, `--ronda`, `--autovia`, `--nacional`, `--comarcal`, `--muralla` y los límites `--lim-fuerte|medio|suave`.
- Derivados: `--superficie-2`, `--superficie-elevada`, `--borde-suave`, `--texto-suave`, `--sombra-mapa`, `--sombra-tarjeta`, `--sombra-flotante`.
- Fijos en los dos temas: `--sobre-color` (blanco sobre color), `--exito*`, `--logro`, `--error-*`, `--tiempo-*`, `--actividad-1..3`, `--desap-viva`.

## Tipografía

- **Títulos**: Alfa Slab One (el `h1` va un poco torcido, como un vítor).
- **Texto**: Lora, de 400 a 700.
- Las dos se sirven desde `fuentes/` (OFL), sin Google Fonts.
- Escala `--letra-*`: mapa-mini 9, diminuta 10, mini 11, pequeña 12, nota 12,5, chica 13, detalle 13,5, media 14, cómoda 15, base 16, destacada 17, subtítulo 18, título-pequeño 20, título-medio 22, título 24 (px). Por encima de 24 solo hay titulares sueltos y van en px.

## Formas y capas

- Radios `--radio-*`: mini 4, pequeño 8, control 10, caja 12, tarjeta 14, panel 16, panel-grande 18, pastilla 99 (px); los círculos, `50%`.
- Capas `--capa-*` de abajo arriba: mapa-detalle 1, mapa-control 2, mapa-globo 4, mapa-capas 5, ficha 10, buscador 30, paseo 35, aviso 40, flotante 45, ventana 50.

## Modo oscuro

Un solo par de bloques: `@media(prefers-color-scheme:dark){:root:not([data-theme="light"]){…}}` y `:root[data-theme="dark"]{…}`, con el mismo contenido (el segundo es el del botón «Tema oscuro»). Un token nuevo que cambie con el tema va en `:root` y en los dos bloques; `comprobar-datos` falla si los dos no son iguales o si se usa un `var(--…)` que no existe.

## Para qué sirve y qué evitar

Sirve para todo lo de la app, incluidas las tarjetas para compartir. No metas temas genéricos, degradados morados, todo centrado ni Inter: el carácter está en la piedra, el vítor y los pictogramas propios.
