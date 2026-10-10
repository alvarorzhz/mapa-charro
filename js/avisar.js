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

// Enlace de la ventana. El de «mailto:» va sin «target»: abierto en otra pestaña, muchos navegadores (y el
// visor de Claude) no llegan a pasarlo al programa de correo. Por eso hay también Gmail y «Copiar el aviso».
function enlaceAviso(texto, href, otraPestana = true) {
  const a = crear('a', 'boton-enlace', texto);
  a.href = href;
  if (otraPestana) {
    a.target = '_blank';
    a.rel = 'noopener';
  }
  return a;
}

// Copia el aviso entero (para quien no tenga programa de correo configurado)
async function copiarAviso(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    aviso('Aviso copiado: pégalo en un correo a ' + CORREO_AVISOS, { tipo: 'exito' });
  } catch (e) {
    aviso('No se ha podido copiar. Escribe a ' + CORREO_AVISOS, { tipo: 'error' });
  }
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
    github = INCIDENCIAS + '?title=' + encodeURIComponent(asunto) + '&body=' + encodeURIComponent(cuerpo),
    gmail =
      'https://mail.google.com/mail/?view=cm&fs=1&to=' +
      CORREO_AVISOS +
      '&su=' +
      encodeURIComponent(asunto) +
      '&body=' +
      encodeURIComponent(cuerpo),
    copiar = crear('button', 'boton-enlace', '📋 Copiar el aviso'),
    enlaceGithub = enlaceAviso('O ábrelo en GitHub', github);
  enlaceGithub.className = '';
  copiar.onclick = () => copiarAviso('Para: ' + CORREO_AVISOS + '\nAsunto: ' + asunto + '\n\n' + cuerpo);
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
      enlaceAviso('✉️ Abrir mi correo', correo, false),
      enlaceAviso('Con Gmail', gmail),
      copiar
    ),
    crear('p', 'mu', 'Si no se abre tu correo, cópialo y mándalo a ' + CORREO_AVISOS + '. ', enlaceGithub)
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
