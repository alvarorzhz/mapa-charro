// Mapa de la ciudad: el fondo (término de Salamanca y municipios vecinos), los tonos alternos de las
// zonas, su orden para los lectores de pantalla, los límites, los parques y el río. Va después de mapa.js.

// --- Fondo: término de Salamanca y municipios vecinos ----------------------
// Entre los barrios y los pueblos del mapa queda el resto del término de Salamanca (campo) y, más allá,
// otros municipios. Se pintan debajo de las zonas, sin poder tocarlos, con su nombre en pequeño.
const etiquetasFondo = [], // { t, x, y, lejos } nombres a tamaño fijo; lejos: solo con el mapa alejado
  municipiosFondo = []; // { e, n, sub } para decir su nombre al pasar el ratón o pulsar (el término, primero)
{
  const fondo = $('#fondo'),
    anillo = R => 'M' + R.map(q => puntoTexto(proyectar(q[0], q[1]))).join('L') + 'Z',
    rotulo = (texto, x, y, clase, lejos) => {
      const t = crearSvg('text', { class: clase, 'text-anchor': 'middle' }, $('#lgf'));
      t.textContent = texto;
      etiquetasFondo.push({ t, x, y, lejos });
    };
  // Municipios de la provincia que no están en el mapa: su término de OpenStreetMap (LIMITES_VECINOS) y,
  // si no lo tiene, las lindes de la pestaña Provincia, más bastas
  PROVINCIA.m
    .filter(m => !m.z && !m.cap)
    .forEach(m => {
      const R = LIMITES_VECINOS[m.n] || m.R,
        P = R.flat().map(q => proyectar(q[0], q[1])),
        xs = P.map(q => q[0]),
        ys = P.map(q => q[1]);
      if (
        Math.max(...xs) < 0 ||
        Math.min(...xs) > ANCHO_MAPA ||
        Math.max(...ys) < 0 ||
        Math.min(...ys) > ALTO_MAPA
      )
        return;
      const e = crearSvg(
        'path',
        { d: R.map(anillo).join(''), class: 'vecino', 'vector-effect': 'non-scaling-stroke' },
        fondo
      );
      municipiosFondo.push({ e, n: m.n, sub: 'Municipio vecino · ' + PROVINCIA.com[m.c] });
      const cx = xs.reduce((a, b) => a + b) / xs.length,
        cy = ys.reduce((a, b) => a + b) / ys.length;
      if (cx > 10 && cx < ANCHO_MAPA - 10 && cy > 10 && cy < ALTO_MAPA - 10) rotulo(m.n, cx, cy, 'lbf', true);
    });
  // El término de Salamanca (OpenStreetMap), encima de los vecinos
  municipiosFondo.unshift({
    e: crearSvg(
      'path',
      { d: anillo(TERMINO_SALAMANCA), class: 'termino', 'vector-effect': 'non-scaling-stroke' },
      fondo
    ),
    n: 'Término de Salamanca',
    sub: 'Municipio de Salamanca, fuera de los barrios'
  });
  rotulo('Término de Salamanca', 114, 330, 'lbf lbt', false); // el punto más alejado de la ciudad y los pueblos
}

// El término o municipio vecino que hay en un punto de la pantalla (no se pueden tocar: se busca a mano)
function municipioFondoEn(x, y) {
  return municipiosFondo.find(m =>
    m.e.isPointInFill(new DOMPoint(x, y).matrixTransform(m.e.getScreenCTM().inverse()))
  );
}
// Al pulsar en el fondo (no en una zona, un monumento ni una carretera), un aviso con su nombre
$('#m').addEventListener('click', e => {
  if (e.target != $('#m') || gestosMapa.arrastre > UMBRAL_TOQUE) return;
  if (typeof juego != 'undefined' && juego.activo) return;
  const m = municipioFondoEn(e.clientX, e.clientY);
  if (m) aviso(m.n + ' · ' + m.sub.replace('Municipio vecino · ', ''));
});

// u = unidades del mapa por píxel de pantalla. Los nombres de los vecinos, solo con el mapa alejado.
function colocarEtiquetasFondo(u) {
  etiquetasFondo.forEach(e => {
    e.t.style.display = e.lejos ? (vistaMapa.w > 170 ? '' : 'none') : vistaMapa.w > 90 ? '' : 'none';
    e.t.setAttribute('transform', escalaFija(e.x, e.y, u));
  });
}

// Tonos alternos: dos zonas vecinas nunca llevan el mismo tono (coloreado voraz con 4 tonos)
{
  // Son vecinas si al menos dos vértices de una caen sobre el borde de la otra (los términos municipales
  // vienen simplificados por separado, así que sus vértices no coinciden: se mide hasta los lados)
  const caja = P => {
      const xs = P.map(q => q[0]),
        ys = P.map(q => q[1]);
      return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
    },
    distanciaALado = (p, a, b) => {
      const dx = b[0] - a[0],
        dy = b[1] - a[1],
        t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1)));
      return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
    },
    TOLERANCIA = 0.8;
  zonas.forEach(z => (z.caja = caja(z.P)));
  const cerca = (a, b) => {
    const [ax0, ay0, ax1, ay1] = a.caja,
      [bx0, by0, bx1, by1] = b.caja;
    if (ax0 > bx1 + TOLERANCIA || bx0 > ax1 + TOLERANCIA || ay0 > by1 + TOLERANCIA || by0 > ay1 + TOLERANCIA)
      return false;
    // Un vértice o un lado más lejos que TOLERANCIA en x o en y no puede estar a menos de TOLERANCIA:
    // se descartan sin calcular la distancia (al abrir la página es lo que más tardaba del mapa)
    let comunes = 0;
    for (const p of a.P) {
      const [x, y] = p;
      if (x < bx0 - TOLERANCIA || x > bx1 + TOLERANCIA || y < by0 - TOLERANCIA || y > by1 + TOLERANCIA)
        continue;
      for (let i = 0; i < b.P.length; i++) {
        const q = b.P[i],
          r = b.P[(i + 1) % b.P.length];
        if (
          (x < q[0] - TOLERANCIA && x < r[0] - TOLERANCIA) ||
          (x > q[0] + TOLERANCIA && x > r[0] + TOLERANCIA) ||
          (y < q[1] - TOLERANCIA && y < r[1] - TOLERANCIA) ||
          (y > q[1] + TOLERANCIA && y > r[1] + TOLERANCIA)
        )
          continue;
        if (distanciaALado(p, q, r) < TOLERANCIA) {
          if (++comunes >= 2) return true;
          break;
        }
      }
    }
    return false;
  };
  const vecinos = new Map(zonas.map(z => [z, zonas.filter(o => o != z && cerca(z, o))]));
  [...zonas]
    .sort((a, b) => vecinos.get(b).length - vecinos.get(a).length)
    .forEach(z => {
      const usados = new Set(vecinos.get(z).map(o => o.tono));
      z.tono = [0, 1, 2, 3].find(t => !usados.has(t)) ?? 0;
      z.e.classList.add('t' + z.tono);
    });
  zonas.forEach(z => (z.vecinos = vecinos.get(z))); // para moverse con las flechas
}

// Orden de las zonas en la página, que es el orden en que las recorre un lector de pantalla: por partes
// de la ciudad y por nombre. Los pueblos de alrededor van primero porque su dibujo se extiende por
// debajo de la ciudad (los barrios se pintan encima).
const ordenGrupo = g => (g == 5 ? -1 : g);
[...zonas]
  .sort((a, b) => ordenGrupo(a.g) - ordenGrupo(b.g) || a.n.localeCompare(b.n, 'es'))
  .forEach(z => $('#zg').appendChild(z.e));

// --- Límites y río ----------------------------------------------------------
// Los límites se dibujan encima de las carreteras (capa #lim), con un halo claro para que se lean
// sobre cualquier cosa: es lo más importante del mapa.
const trazoAnillo = P => 'M' + P.map(puntoTexto).join('L') + 'Z';
{
  const capa = $('#lim'),
    barrios = zonas.filter(z => z.g < 5),
    oficiales = barrios.filter(z => !ZONAS_NO_OFICIALES.has(z.id)),
    repartos = barrios.filter(z => ZONAS_NO_OFICIALES.has(z.id)),
    alrededores = zonas.filter(z => z.g == 5),
    lindes = LINDES_OFICIALES.map(P => trazoAnillo(P.map(q => proyectar(q[0], q[1])))).join(''),
    ciudad = trazoAnillo(LIMITE_CIUDAD.map(q => proyectar(q[0], q[1]))),
    trazo = (d, clase) =>
      crearSvg('path', { d, class: 'lim ' + clase, 'vector-effect': 'non-scaling-stroke' }, capa);
  trazo(alrededores.map(z => trazoAnillo(z.P)).join(''), 'alfoz');
  trazo(oficiales.map(z => trazoAnillo(z.P)).join('') + lindes + ciudad, 'halo');
  trazo(repartos.map(z => trazoAnillo(z.P)).join(''), 'reparto');
  trazo(oficiales.map(z => trazoAnillo(z.P)).join('') + lindes, 'linde');
  trazo(ciudad, 'ciudad');
  // Contorno de la zona seleccionada, encima de todo, y el de la zona con el foco del teclado
  var limiteSeleccion = trazo('', 'sel'),
    limiteFoco = trazo('', 'foco');
}

// --- Parques: manchas verdes encima de las zonas (datos/parques.js). Sin interruptor: con las calles
// reales se esconden (estilos.css), porque ese fondo ya pinta los parques ----------------------------
PARQUES.forEach(parque => {
  const d = parque.R.map(r => {
    const puntos = [];
    for (let i = 0; i < r.length; i += 2) puntos.push(puntoTexto(proyectar(r[i], r[i + 1])));
    return 'M' + puntos.join('L') + 'Z';
  }).join('');
  crearSvg('title', {}, crearSvg('path', { d, class: 'pk' }, $('#pk'))).textContent = parque.n;
});

// --- Río ----------------------------------------------------------------------

{
  // El río, suavizado con curvas que pasan por el punto medio de cada tramo
  const rp = RIO_TORMES.map(q => proyectar(q[0], q[1]));
  let d = 'M' + puntoTexto(rp[0]) + 'L' + puntoTexto(puntoMedio(rp[0], rp[1]));
  for (let i = 1; i < rp.length - 1; i++)
    d += 'Q' + puntoTexto(rp[i]) + ' ' + puntoTexto(puntoMedio(rp[i], rp[i + 1]));
  $('#rv').setAttribute('d', d + 'L' + puntoTexto(rp[rp.length - 1]));
  const [x, y] = proyectar(40.9615, -5.6175);
  $('#rl').setAttribute('x', x);
  $('#rl').setAttribute('y', y);
}
