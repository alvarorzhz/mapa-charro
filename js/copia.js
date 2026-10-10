// Copia de seguridad del progreso: se descarga en un archivo y se puede cargar en otro navegador.
// Cargar una copia la junta con lo que ya hay (juntarProgresos): no se pierde nada de ninguno de los dos.

const APP_COPIA = 'mapa-charro';
const nombreCopia = () => 'mapa-charro-copia-' + new Date().toISOString().slice(0, 10) + '.json';

function textoCopia() {
  return JSON.stringify(
    {
      app: APP_COPIA,
      version: (document.querySelector('meta[name="version"]') || {}).content || '',
      fecha: new Date().toISOString(),
      progreso
    },
    null,
    1
  );
}

// Lee el texto de un archivo de copia y devuelve el progreso limpio, o null si no es una copia válida
function leerCopia(texto) {
  try {
    const datos = JSON.parse(texto);
    if (!datos || datos.app != APP_COPIA || !datos.progreso || typeof datos.progreso != 'object') return null;
    return limpiarProgreso(datos.progreso);
  } catch (e) {
    return null;
  }
}

function cargarCopia(texto) {
  const copia = leerCopia(texto);
  if (!copia) {
    aviso('Ese archivo no es una copia del Mapa charro', { tipo: 'error' });
    return false;
  }
  const antes = Object.values(progreso.z).filter(m => m == 'v').length;
  aplicarDesdeNube(juntarProgresos(progreso, copia));
  guardar(); // y a la cuenta, si la hay
  const ahora = Object.values(progreso.z).filter(m => m == 'v').length;
  aviso(
    'Copia cargada: ' +
      ahora +
      ' zonas pisadas' +
      (ahora > antes ? ' (' + (ahora - antes) + ' nuevas)' : '') +
      '. No se ha perdido nada de lo que ya tenías.',
    { tipo: 'exito' }
  );
  return true;
}

function abrirCopia() {
  const conCuenta = !!nube.ref; // guardado.js: hay cuenta (Google o Claude) conectada
  const caja = crear(
    'div',
    'copia',
    crear(
      'p',
      '',
      conCuenta
        ? 'Tu progreso ya se guarda en tu cuenta y se sincroniza solo. Con una copia lo tienes además en un archivo, por si acaso.'
        : 'Tu progreso se guarda en este navegador. Descarga una copia para no perderlo si borras los datos, o para pasarlo a otro móvil u ordenador.'
    ),
    crear(
      'p',
      'mu',
      'Al cargar una copia se junta con lo que ya tienes aquí: lo pisado en cualquiera de los dos queda pisado.'
    )
  );
  const archivo = crear('input');
  archivo.type = 'file';
  archivo.accept = '.json,application/json';
  archivo.hidden = true;
  archivo.onchange = async () => {
    const f = archivo.files && archivo.files[0];
    if (!f) return;
    if (cargarCopia(await f.text())) cerrarVentana();
  };
  caja.appendChild(archivo);
  abrirVentana(
    'Copia de seguridad',
    caja,
    [
      [
        'Descargar copia',
        () => guardarArchivo(new Blob([textoCopia()], { type: 'application/json' }), nombreCopia()),
        'on'
      ],
      ['Cargar una copia', () => archivo.click()]
    ],
    $('#copia')
  );
}

$('#copia').onclick = abrirCopia;
