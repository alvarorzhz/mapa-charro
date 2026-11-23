// Salamanca de noche (#noche y #noche/<id>): leyendas de miedo, muerte y diablo (datos/noche.js) que solo se
// leen enteras de noche, de la puesta de sol al amanecer (estadoNoche, hora-dorada.js). De día la lista dice a
// qué hora se abre y cada ficha deja echar un vistazo: solo el principio. En el mapa, con la lista o una ficha
// abiertas, la ciudad se oscurece y sale una vela en el sitio de cada leyenda. Las leídas de noche se guardan en
// progreso.j.ln (ids) y dan los logros de «De noche» (logros.js).

let leyendaNocheAbierta = null; // id con su ficha abierta
let listaNocheAbierta = false;
const buscarLeyendaNoche = id => LEYENDAS_NOCHE.find(l => l.id == id);
const leyendasNocheLeidas = () => datoJ('ln', []);
const leyendaNocheLeida = l => leyendasNocheLeidas().includes(l.id);

// El principio del primer texto, cortado por una palabra: lo que se ve de día
const LETRAS_VISTAZO = 70;
function vistazoLeyenda(l) {
  const t = l.textos[0][1];
  if (t.length <= LETRAS_VISTAZO) return t;
  return t.slice(0, t.lastIndexOf(' ', LETRAS_VISTAZO)).replace(/[,;:.]$/, '') + '…';
}

// --- Capa del mapa ----------------------------------------------------------
const capaNoche = crearSvg('g', { id: 'velas', style: 'display:none' });
mapaSvg.insertBefore(capaNoche, $('#me'));
// Un velo oscuro sobre todo el mapa, debajo de las velas
crearSvg('rect', { class: 'velo-noche', x: -2000, y: -2000, width: 6000, height: 6000 }, capaNoche);
LEYENDAS_NOCHE.forEach(l => {
  const m = l.monumento && buscarMonumento(l.monumento);
  [l.x, l.y] = proyectar(m ? m.la : l.la, m ? m.lo : l.lo);
  l.g = crearSvg('g', { class: 'vela', role: 'button', 'aria-label': l.n }, capaNoche);
  crearSvg('title', {}, l.g).textContent = l.n + (l.aproximada ? ' (sitio aproximado)' : '');
  crearSvg('circle', { class: 'halo', r: 12 }, l.g);
  crearSvg('rect', { class: 'cirio', x: -3, y: -2, width: 6, height: 9, rx: 1.2 }, l.g);
  crearSvg('path', { class: 'llama', d: 'M0 -11 C3 -7 3 -4 0 -3 C-3 -4 -3 -7 0 -11 Z' }, l.g);
  l.g.onclick = () => {
    if (gestosMapa.arrastre <= UMBRAL_TOQUE) abrirLeyendaNoche(l.id);
  };
});

// Llamada al abrir o cerrar su lista o una ficha
function pintarVelas() {
  const ver = !!leyendaNocheAbierta || listaNocheAbierta;
  capaNoche.style.display = ver ? '' : 'none';
  if (!ver) return;
  capaNoche.classList.toggle('de-dia', !estadoNoche().noche);
  LEYENDAS_NOCHE.forEach(l => {
    l.g.classList.toggle('sel', l.id == leyendaNocheAbierta);
    l.g.classList.toggle('leida', leyendaNocheLeida(l));
  });
  colocarVelas(ultimaEscala || vistaMapa.w / (tamMapa.w || 380));
}

// Llamada desde recolocarSegunZoom
function colocarVelas(u) {
  if (capaNoche.style.display == 'none') return;
  LEYENDAS_NOCHE.forEach(l => l.g.setAttribute('transform', escalaFija(l.x, l.y, u)));
}

// Al abrir otra ficha o cerrar (olvidarMonumento lo llama)
function olvidarNoche() {
  if (!leyendaNocheAbierta && !listaNocheAbierta) return;
  leyendaNocheAbierta = null;
  listaNocheAbierta = false;
  pintarVelas();
}

// Para Explora y «¿Qué puedo descubrir hoy?»
function resumenNoche(ahora = new Date()) {
  const e = estadoNoche(ahora);
  return e.noche
    ? 'Abiertas hasta que amanezca, a las ' + horaSalamanca(e.hasta)
    : 'Se abren hoy a las ' + horaSalamanca(e.abre) + ', con la puesta de sol';
}

function marcarLeyendaNocheLeida(l) {
  if (leyendaNocheLeida(l)) return;
  conAvisoDeLogros(() => {
    const j = (estadoApp.progreso.j = estadoApp.progreso.j || {});
    j.ln = [...leyendasNocheLeidas(), l.id];
    guardar();
    actualizar();
  });
}

// --- La lista ---------------------------------------------------------------
function abrirSalamancaDeNoche() {
  activarRuta(false);
  const e = estadoNoche(),
    caja = fichaLimpia('Cuando se pone el sol', 'Salamanca de noche'),
    volver = crear('button', 'volver-hoy', '← Monumentos');
  listaNocheAbierta = true;
  volver.onclick = () => abrirMonumentos();
  caja.append(
    volver,
    crear(
      'p',
      'hab',
      'Crímenes, diablos y venganzas: las leyendas más oscuras de la ciudad, cada una con su fuente. Solo se leen enteras de noche, de la puesta de sol al amanecer. En el mapa, una vela marca dónde pasó cada una.'
    ),
    crear('p', 'noche-estado' + (e.noche ? ' abierta' : ''), (e.noche ? '🕯️ ' : '🔒 ') + resumenNoche())
  );
  const leidas = LEYENDAS_NOCHE.filter(leyendaNocheLeida).length;
  if (leidas)
    caja.appendChild(crear('p', 'mu', 'Has leído ' + leidas + ' de ' + LEYENDAS_NOCHE.length + ' de noche.'));
  const lista = crear('div', 'lista-explora');
  LEYENDAS_NOCHE.forEach(l => {
    const b = crear(
      'button',
      'fila-explora' + (leyendaNocheLeida(l) ? ' hecha' : ''),
      crear('span', 'ico-det', e.noche ? l.icono : '🔒'),
      crear('span', 'texto', crear('b', '', l.n), crear('small', '', e.noche ? l.donde : vistazoLeyenda(l)))
    );
    b.onclick = () => abrirLeyendaNoche(l.id);
    lista.appendChild(b);
  });
  caja.appendChild(lista);
  $('#ap').textContent =
    'Cada ficha lleva sus fuentes. Las horas de la puesta de sol y del amanecer se calculan para Salamanca.';
  centrarMapaEn(209, 292, Math.min(vistaMapa.w, 90));
  estadoApp.fichaAlta = true;
  mostrarFicha();
  pintarVelas();
  enlaceFicha('noche', 'Salamanca de noche');
}

// --- La ficha ---------------------------------------------------------------
function abrirLeyendaNoche(id) {
  const l = buscarLeyendaNoche(id);
  if (!l) return abrirSalamancaDeNoche();
  activarRuta(false);
  const e = estadoNoche(),
    caja = fichaLimpia('🕯️ Salamanca de noche', l.n),
    volver = crear('button', 'volver-hoy', '← Salamanca de noche');
  leyendaNocheAbierta = l.id;
  volver.onclick = () => abrirSalamancaDeNoche();
  caja.append(volver, crear('p', 'hab', crear('b', '', l.aproximada ? 'Dónde (≈): ' : 'Dónde: '), l.donde));
  const textos = crear('div', 'cul-textos');
  if (e.noche)
    l.textos.forEach(([tipo, texto]) =>
      textos.appendChild(
        crear('p', 'cul-t ' + tipo, crear('span', 'cul-tipo', TIPOS_TEXTO_CULTURA[tipo]), texto)
      )
    );
  else
    textos.append(
      crear('p', 'cul-t vistazo', vistazoLeyenda(l)),
      crear('p', 'noche-estado', '🔒 El resto se lee de noche. ' + resumenNoche() + '.')
    );
  caja.appendChild(textos);
  const m = l.monumento && buscarMonumento(l.monumento);
  if (m) {
    const b = crear('button', 'conico', iconoMonumento(m.tipo, 18), m.n);
    b.onclick = () => abrirMonumento(m.id);
    caja.appendChild(crear('div', 'nb', b));
  }
  const ap = $('#ap');
  ap.textContent = 'Fuentes: ';
  l.fuentes.forEach((f, i) => ap.append(i ? ', ' : '', enlaceFuente(f)));
  ap.append('. Revisado el ' + textoFecha(l.revisado) + '.');
  centrarMapaEn(l.x, l.y, Math.min(vistaMapa.w, 70));
  mostrarFicha();
  pintarVelas();
  enlaceFicha('noche/' + l.id, l.n);
  if (e.noche) marcarLeyendaNocheLeida(l);
}
