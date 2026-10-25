// Puente entre los datos y el resto de la app. Los archivos de js/datos/ son módulos (export const …), pero
// la lógica de js/*.js sigue siendo scripts clásicos que los usan como globales: este módulo los importa y
// los deja en globalThis. Los scripts clásicos llevan defer en index.html, así que los que van detrás de
// este módulo se ejecutan después de él y en su orden. El ?v=N de cada import lo pone
// herramientas/version.js (no lo toques a mano).
import * as zonas from './datos/zonas.js?v=227';
import * as monumentos from './datos/monumentos.js?v=227';
import * as rutasProvincia from './datos/rutas-provincia.js?v=227';
import * as tramosProvincia from './datos/tramos-provincia.js?v=227';
import * as rutas from './datos/rutas.js?v=227';
import * as tramos from './datos/tramos.js?v=227';
import * as habitantes from './datos/habitantes.js?v=227';
import * as pueblos from './datos/pueblos.js?v=227';
import * as cultura from './datos/cultura.js?v=227';
import * as detalles from './datos/detalles.js?v=227';
import * as fachadas from './datos/fachadas.js?v=227';
import * as orientacionFachadas from './datos/orientacion-fachadas.js?v=227';
import * as desaparecida from './datos/desaparecida.js?v=227';
import * as contenido from './datos/contenido.js?v=227';
import * as geometria from './datos/geometria.js?v=227';
import * as alfoz from './datos/alfoz.js?v=227';
import * as tiempo from './datos/tiempo.js?v=227';
import * as carreteras from './datos/carreteras.js?v=227';
import * as parques from './datos/parques.js?v=227';
import * as carreterasProvincia from './datos/carreteras-provincia.js?v=227';
import * as provincia from './datos/provincia.js?v=227';
import * as datosFirebase from './datos/firebase.js?v=227';
import * as palabras from './datos/palabras.js?v=227';

Object.assign(
  globalThis,
  zonas,
  monumentos,
  rutasProvincia,
  tramosProvincia,
  rutas,
  tramos,
  habitantes,
  pueblos,
  cultura,
  detalles,
  fachadas,
  orientacionFachadas,
  desaparecida,
  contenido,
  geometria,
  alfoz,
  tiempo,
  carreteras,
  parques,
  carreterasProvincia,
  provincia,
  datosFirebase,
  palabras
);
