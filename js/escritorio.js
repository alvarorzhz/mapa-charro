// Comodidades de escritorio (con ratón):
// - Al pasar el ratón por una zona, un globo con su nombre y cómo está (pisada, quieres ir…; en
//   «Salamanca en el tiempo», si ya existía en esa etapa).
// - «/» lleva al buscador desde cualquier sitio.
// - Logros, abierto de entrada para aprovechar la columna derecha.
// En el móvil no hace nada de esto (no hay ratón ni sitio).

const conRaton = () => matchMedia('(hover:hover) and (pointer:fine)').matches;

const TEXTO_EPOCA = {
  ya: 'Ya existía',
  nueva: 'Nace en esta etapa',
  no: 'Aún no existía',
  nd: 'Sin fecha documentada'
};
const textoEstadoZona = z => {
  if (document.body.classList.contains('tiempo') && z.e.dataset.ep) return TEXTO_EPOCA[z.e.dataset.ep];
  const marca = progreso.z[z.id];
  return (
    (marca == 'v' ? '✓ Pisada' : marca == 'w' ? '☆ Quieres ir' : 'Sin pisar') + ' · ' + NOMBRES_GRUPOS[z.g]
  );
};

// --- Globo con el nombre de la zona -------------------------------------------------
const globo = crear('div', 'globo');
globo.hidden = true;
globo.setAttribute('aria-hidden', 'true'); // los lectores ya tienen el nombre en la propia zona
document.querySelector('.mw').appendChild(globo);

let zonaGlobo = null;
function moverGlobo(e) {
  const z = !e.buttons && conRaton() && zonaDeElemento.get(e.target);
  if (!z || (typeof juego != 'undefined' && juego.activo)) return ocultarGlobo();
  if (z != zonaGlobo) {
    zonaGlobo = z;
    globo.textContent = '';
    globo.append(crear('b', '', z.n), crear('small', '', textoEstadoZona(z)));
  }
  globo.hidden = false;
  // Junto al puntero, sin salirse del mapa
  const caja = document.querySelector('.mw').getBoundingClientRect(),
    x = e.clientX - caja.left,
    y = e.clientY - caja.top,
    ancho = globo.offsetWidth,
    alto = globo.offsetHeight;
  globo.style.left = (x + 16 + ancho > caja.width - 56 ? x - 12 - ancho : x + 16) + 'px';
  globo.style.top = Math.max(6, y - alto - 12) + 'px';
}
function ocultarGlobo() {
  globo.hidden = true;
  zonaGlobo = null;
}
$('#m').addEventListener('pointermove', moverGlobo);
$('#m').addEventListener('pointerleave', ocultarGlobo);
$('#m').addEventListener('pointerdown', ocultarGlobo);
$('#m').addEventListener('wheel', ocultarGlobo, { passive: true });

// --- «/» para buscar ------------------------------------------------------------------
addEventListener('keydown', e => {
  if (e.key != '/' || e.ctrlKey || e.metaKey || e.altKey) return;
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable) return;
  e.preventDefault();
  $('#q').focus();
  $('#q').select();
});

// --- Logros a la vista en escritorio ---------------------------------------------------
if (esEscritorio()) $('#lgr').open = true;
