// Puente entre los datos y el resto de la app. Los archivos de js/datos/ son módulos (export const …), pero
// la lógica de js/*.js sigue siendo scripts clásicos que los usan como globales: este módulo los importa y
// los deja en globalThis. Los scripts clásicos llevan defer en index.html, así que los que van detrás de
// este módulo se ejecutan después de él y en su orden. El ?v=N de cada import lo pone
// herramientas/version.js (no lo toques a mano).
import * as zonas from './datos/zonas.js?v=93312c76ad';
import * as monumentos from './datos/monumentos.js?v=685b27a0c9';
import * as rutasProvincia from './datos/rutas-provincia.js?v=35e5630e8b';
import * as tramosProvincia from './datos/tramos-provincia.js?v=6362361a74';
import * as rutas from './datos/rutas.js?v=809a14cd59';
import * as tramos from './datos/tramos.js?v=7743d34b2b';
import * as habitantes from './datos/habitantes.js?v=784dd5e707';
import * as pueblos from './datos/pueblos.js?v=89a2f7c8ac';
import * as cultura from './datos/cultura.js?v=d468671a05';
import * as detalles from './datos/detalles.js?v=2570fdde20';
import * as fachadas from './datos/fachadas.js?v=57a82798d6';
import * as orientacionFachadas from './datos/orientacion-fachadas.js?v=1924a819a6';
import * as desaparecida from './datos/desaparecida.js?v=70d1d65043';
import * as contenido from './datos/contenido.js?v=ac9ba94087';
import * as geometria from './datos/geometria.js?v=049169f6eb';
import * as alfoz from './datos/alfoz.js?v=e86a83f1e9';
import * as tiempo from './datos/tiempo.js?v=54f5f3632b';
import * as carreteras from './datos/carreteras.js?v=909cad59ab';
import * as parques from './datos/parques.js?v=e6e84b7308';
import * as carreterasProvincia from './datos/carreteras-provincia.js?v=887eb19856';
import * as provincia from './datos/provincia.js?v=92d7bcff39';
import * as datosFirebase from './datos/firebase.js?v=dace485241';
import * as palabras from './datos/palabras.js?v=507b85b1cf';

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
