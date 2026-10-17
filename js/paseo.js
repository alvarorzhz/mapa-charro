// Primer paseo: tres pasos con lo de verdad (abrir un sitio, marcarlo y ver qué descubrir hoy), en una
// tarjetita que no tapa la app y que avanza sola al hacer cada cosa (apuntarTarea, medicion.js). Sale la
// primera vez que se abre la app sin enlace (inicio.js), se puede saltar y se retoma desde Ayuda.
// Dónde va se recuerda en este navegador (charro-paseo: { h: pasos hechos, e: 'activo' | 'saltado' |
// 'hecho' }); es una comodidad, no va en el progreso.

const CLAVE_PASEO = 'charro-paseo';
// La recomendación principal del primer paso: el Centro, con la Plaza Mayor
const ZONA_PASEO = 'centro';
const PASOS_PASEO = [
  {
    tareas: ['zona', 'monumento', 'pueblo'],
    titulo: 'Abre un sitio del mapa',
    texto: () => 'Pulsa un barrio en el mapa. Te proponemos el Centro: la Plaza Mayor y las Conchas.',
    boton: () => ['Abrir el Centro', () => abrirFicha(ZONA_PASEO)]
  },
  {
    tareas: ['marca'],
    titulo: 'Márcalo',
    // Con una ficha abierta que se puede marcar, se señalan sus botones; si no, se propone el Centro
    texto: () =>
      botonesDeMarcar().length
        ? 'Abajo en la ficha: «He estado» si ya lo pisaste o «Quiero ir» para apuntarlo. Se pinta en el mapa.'
        : 'Abre un sitio y pulsa «He estado» si ya lo pisaste o «Quiero ir» para apuntarlo.',
    boton: () => (botonesDeMarcar().length ? null : ['Abrir el Centro', () => abrirFicha(ZONA_PASEO)]),
    resaltar: () => botonesDeMarcar()
  },
  {
    tareas: ['hoy'],
    titulo: 'Descubre algo hoy',
    texto: () => 'Cada día te proponemos un sitio que aún no has pisado, y lo que tienes a medias.',
    boton: () => ['Ver qué descubrir hoy', () => abrirHoy()],
    resaltar: () => ($('#sh').classList.contains('o') ? [] : [$('#hy')])
  }
];
const botonesDeMarcar = () =>
  $('#sh').classList.contains('o') ? [...document.querySelectorAll('.bt button[data-s]:not([hidden])')] : [];

const leerPaseo = () => {
  const p = leerLocalJson(CLAVE_PASEO, {});
  return { h: Array.isArray(p.h) ? p.h : [], e: p.e || '' };
};
const guardarPaseo = p => escribirLocal(CLAVE_PASEO, JSON.stringify(p));
// El paso que toca: el primero sin hacer (se pueden hacer en otro orden)
const pasoDelPaseo = (p = leerPaseo()) => PASOS_PASEO.findIndex((_, i) => !p.h.includes(i));

function empezarPaseo() {
  guardarPaseo({ h: [], e: 'activo' });
  cerrarVentana();
  pintarPaseo();
}
function seguirPaseo() {
  const p = leerPaseo();
  guardarPaseo({ ...p, e: 'activo' });
  cerrarVentana();
  pintarPaseo();
}
function saltarPaseo() {
  const p = leerPaseo();
  guardarPaseo({ ...p, e: 'saltado' });
  apuntarTarea('paseo-saltado');
  pintarPaseo();
  aviso('Puedes retomar el primer paseo desde Ayuda (?), arriba a la derecha', {
    tipo: 'info',
    discreto: true
  });
}

// Lo llama apuntarTarea: si la tarea es la de algún paso, ese paso queda hecho
function avanzarPaseo(tarea) {
  const p = leerPaseo();
  if (p.e != 'activo') return;
  const i = PASOS_PASEO.findIndex((paso, k) => paso.tareas.includes(tarea) && !p.h.includes(k));
  if (i < 0) return pintarPaseo();
  p.h = [...p.h, i];
  if (pasoDelPaseo(p) < 0) p.e = 'hecho';
  guardarPaseo(p);
  pintarPaseo(p.e == 'hecho');
  if (p.e == 'hecho') apuntarTarea('paseo-hecho');
}

// La tarjeta: el paso que toca, con su botón, y las cosas de la app que hay que pulsar, señaladas
function pintarPaseo(recienAcabado = false) {
  document.querySelectorAll('.paseo-foco').forEach(e => e.classList.remove('paseo-foco'));
  const p = leerPaseo(),
    anterior = $('#paseo');
  if (anterior) anterior.remove();
  if (p.e != 'activo' && !recienAcabado) return;
  const cerrar = crear('button', 'cerrar', '×'),
    caja = crear('section', 'paseo');
  caja.id = 'paseo';
  caja.setAttribute('aria-label', 'Primer paseo');
  cerrar.setAttribute('aria-label', recienAcabado ? 'Cerrar' : 'Saltar el primer paseo');
  if (recienAcabado) {
    const vale = crear('button', 'on', 'Vale');
    vale.onclick = cerrar.onclick = () => caja.remove();
    caja.append(
      cerrar,
      crear('p', 'paso', '🎉 Primer paseo hecho'),
      crear(
        'p',
        '',
        'Ya sabes lo básico. Arriba ves lo que llevas y tus logros, y «¿Qué puedo descubrir hoy?» te propone algo nuevo cada día.'
      ),
      crear('div', 'botones', vale)
    );
    document.body.appendChild(caja);
    return;
  }
  const i = pasoDelPaseo(p),
    paso = PASOS_PASEO[i],
    boton = paso.boton(),
    saltar = crear('button', 'enlace', 'Saltar');
  cerrar.onclick = saltar.onclick = saltarPaseo;
  const puntos = crear(
    'span',
    'puntos',
    ...PASOS_PASEO.map((_, k) => crear('i', p.h.includes(k) ? 'on' : ''))
  );
  puntos.setAttribute('aria-hidden', 'true');
  const botones = crear('div', 'botones');
  if (boton) {
    const b = crear('button', 'on', boton[0]);
    b.onclick = boton[1];
    botones.appendChild(b);
  }
  botones.appendChild(saltar);
  caja.append(
    cerrar,
    crear(
      'p',
      'paso',
      puntos,
      (p.h.length ? '' : '¡Bienvenido! ') + 'Primer paseo · paso ' + (i + 1) + ' de ' + PASOS_PASEO.length
    ),
    crear('p', 'titulo', paso.titulo),
    crear('p', '', paso.texto()),
    botones
  );
  caja.setAttribute('role', 'status'); // el lector lo dice al cambiar de paso
  document.body.appendChild(caja);
  (paso.resaltar ? paso.resaltar() : []).forEach(e => e && e.classList.add('paseo-foco'));
}

// Al abrir y cerrar fichas cambia lo que hay que señalar (los botones de marcar, el de hoy)
new MutationObserver(() => {
  if (leerPaseo().e == 'activo') pintarPaseo();
}).observe($('#sh'), { attributes: true, attributeFilter: ['class'] });

// --- Ayuda: el primer paseo, cómo se usa (la bienvenida) y el laboratorio ---------------------------
function abrirAyuda(volverA = document.activeElement) {
  const p = leerPaseo(),
    i = pasoDelPaseo(p),
    textoPaseo =
      p.e == 'hecho' || i < 0
        ? 'Repetir el primer paseo'
        : p.h.length
          ? 'Seguir el primer paseo (paso ' + (i + 1) + ' de ' + PASOS_PASEO.length + ')'
          : 'Empezar el primer paseo',
    fila = (icono, titulo, detalle, alPulsar) => {
      const b = crear(
        'button',
        'fila-explora',
        crear('span', 'ico-det', icono),
        crear('span', 'texto', crear('b', '', titulo), crear('small', '', detalle))
      );
      b.onclick = alPulsar;
      return b;
    };
  abrirVentana(
    'Ayuda',
    crear(
      'div',
      'lista-explora ayuda-lista',
      fila('🚶', textoPaseo, 'Tres pasos haciendo las cosas de verdad', () =>
        p.e == 'hecho' || i < 0 || !p.h.length ? empezarPaseo() : seguirPaseo()
      ),
      fila('📖', 'Cómo se usa', 'Lo que hay en la app, en cuatro pantallas', () =>
        mostrarBienvenida(0, volverA)
      ),
      fila('🧪', 'Laboratorio', 'Tiempos de carga y pruebas de tareas, solo en este navegador', () =>
        abrirLaboratorio(volverA)
      )
    ),
    [['Cerrar', cerrarVentana]],
    volverA
  );
}

$('#ayuda').onclick = () => abrirAyuda($('#ayuda'));
if (leerPaseo().e == 'activo') pintarPaseo();
