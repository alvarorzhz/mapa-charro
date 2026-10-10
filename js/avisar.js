// «Avisar de un error»: arriba del todo, al pie y en cada ficha. Abre el correo (o GitHub) con lo que
// se está viendo ya apuntado, para que solo haya que contar qué está mal.

const CORREO_AVISOS = 'alvarorzhz@gmail.com'; // el de contacto de privacidad.html
const INCIDENCIAS = 'https://github.com/alvarorzhz/mapa-charro/issues/new';

// Qué se está viendo: la ficha abierta (si la hay) y su enlace
function contextoAviso() {
  const h = hashActual(),
    version = (document.querySelector('meta[name="version"]') || {}).content || '';
  return {
    que: nombreFicha || 'la app en general',
    enlace: WEB + (h ? '#' + h : ''),
    version
  };
}

function enlaceAviso(texto, href) {
  const a = crear('a', 'boton-enlace', texto);
  a.href = href;
  a.target = '_blank';
  a.rel = 'noopener';
  a.onclick = () => setTimeout(cerrarVentana, 300);
  return a;
}

function abrirAvisoError(volverA = document.activeElement) {
  const c = contextoAviso(),
    asunto = 'Error en el Mapa charro: ' + c.que,
    cuerpo =
      'Qué está mal o qué falta (y, si puedes, dónde lo has visto bien):\n\n\n' +
      '---\nSitio: ' +
      c.que +
      '\nEnlace: ' +
      c.enlace +
      '\nVersión: ' +
      c.version +
      '\nNavegador: ' +
      navigator.userAgent,
    correo =
      'mailto:' +
      CORREO_AVISOS +
      '?subject=' +
      encodeURIComponent(asunto) +
      '&body=' +
      encodeURIComponent(cuerpo),
    github = INCIDENCIAS + '?title=' + encodeURIComponent(asunto) + '&body=' + encodeURIComponent(cuerpo);
  const caja = crear(
    'div',
    'aviso-error',
    crear(
      'p',
      '',
      '¿Un dato que no cuadra, un sitio cerrado, una foto que no es o algo que no funciona? Cuéntanoslo y lo arreglamos.'
    ),
    crear('p', 'mu', 'Va ya apuntado lo que estás viendo: ', crear('b', '', c.que), '.'),
    crear(
      'div',
      'botones-aviso',
      enlaceAviso('✉️ Por correo', correo),
      enlaceAviso('En GitHub (si tienes cuenta)', github)
    ),
    crear('p', 'mu', 'También puedes escribir a ' + CORREO_AVISOS + '.')
  );
  abrirVentana('Avisar de un error', caja, [['Cerrar', cerrarVentana]], volverA);
}

$('#error').onclick = () => abrirAvisoError($('#error'));
$('#errf').onclick = () => abrirAvisoError($('#errf'));
{
  const pie = crear('button', 'enlace', 'Avisar de un error');
  pie.onclick = () => abrirAvisoError(pie);
  $('#ver').append(' · ', pie);
}
