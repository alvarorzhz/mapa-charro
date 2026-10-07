// Utilidades comunes: proyección, textos, DOM, SVG, geometría y gestos

// --- Proyección y geometría -------------------------------------------------

// Pasa latitud/longitud a coordenadas del mapa de la ciudad (viewBox 0 0 400 480)
const proyectar = (la, lo) => [200 + (lo + 5.671) * 1850.2, 240 - (la - 40.985) * 2446.4];

// Lindes de la provincia: vienen como incrementos en milésimas de grado [dLat, dLon, dLat, dLon...]
const decodificarLinde = r => {
  const puntos = [];
  let la = 0,
    lo = 0;
  for (let i = 0; i < r.length; i += 2) {
    la += r[i];
    lo += r[i + 1];
    puntos.push([la / 1000, lo / 1000]);
  }
  return puntos;
};

const puntoTexto = q => q[0].toFixed(1) + ' ' + q[1].toFixed(1);
const puntoMedio = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

// Recorta el polígono P quedándose con la mitad más cercana a «a» que a «b» (para repartir zonas sin límite oficial)
function recortarSemiplano(P, a, b) {
  const mx = (a[0] + b[0]) / 2,
    my = (a[1] + b[1]) / 2,
    nx = b[0] - a[0],
    ny = b[1] - a[1],
    lado = p => (p[0] - mx) * nx + (p[1] - my) * ny,
    resultado = [];
  for (let i = 0; i < P.length; i++) {
    const p = P[i],
      q = P[(i + 1) % P.length],
      fp = lado(p),
      fq = lado(q);
    if (fp <= 0) resultado.push(p);
    if (fp * fq < 0) {
      const t = fp / (fp - fq);
      resultado.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]);
    }
  }
  return resultado;
}

// ¿Está el punto (la, lo) dentro del polígono P de [lat, lon]?
const dentroDePoligono = (P, la, lo) => {
  let dentro = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    const a = P[i],
      b = P[j];
    if (a[0] > la != b[0] > la && lo < ((b[1] - a[1]) * (la - a[0])) / (b[0] - a[0]) + a[1]) dentro = !dentro;
  }
  return dentro;
};

// Distancia aproximada en km entre dos puntos cercanos (válida a la latitud de Salamanca)
const distanciaKm = (la1, lo1, la2, lo2) => Math.hypot((la1 - la2) * 111.2, (lo1 - lo2) * 84.2);

// --- Textos -----------------------------------------------------------------

// Minúsculas y sin tildes, para buscar
const normalizar = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const slug = s =>
  normalizar(s)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// --- DOM y SVG --------------------------------------------------------------

const $ = s => document.querySelector(s);
const SVG_NS = 'http://www.w3.org/2000/svg';
const mapaSvg = $('#m');
const esEscritorio = () => matchMedia('(min-width:900px)').matches;

// Alto/ancho del mapa en pantalla
// Tamaño del mapa en pantalla, guardado para no forzar al navegador a medirlo en cada zoom
const tamMapa = { w: 0, h: 0 };
const medirMapa = () => {
  tamMapa.w = mapaSvg.clientWidth;
  tamMapa.h = mapaSvg.clientHeight;
};
const proporcionMapa = () => {
  if (!tamMapa.w) medirMapa();
  return tamMapa.w && tamMapa.h ? tamMapa.h / tamMapa.w : 1.2;
};

// Crea un elemento HTML: crear('p', 'mu', 'texto') o crear('div', 'er', hijo1, hijo2...)
function crear(etiqueta, clase, ...hijos) {
  const e = document.createElement(etiqueta);
  if (clase) e.className = clase;
  e.append(...hijos.filter(h => h != null && h !== ''));
  return e;
}

// Crea un elemento SVG con sus atributos y lo cuelga de «padre»
const crearSvg = (etiqueta, atributos, padre) => {
  const e = document.createElementNS(SVG_NS, etiqueta);
  for (const k in atributos) e.setAttribute(k, atributos[k]);
  if (padre) padre.appendChild(e);
  return e;
};

// Mensaje breve en la parte de abajo de la pantalla
let temporizadorAviso;
const aviso = texto => {
  const t = $('#ts');
  t.textContent = texto;
  t.className = 'on';
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => (t.className = ''), 1700);
};

// Fila de botones de filtro (Todos / He estado / Quiero ir / Sin pisar)
const FILTROS = [
  ['all', 'Todos'],
  ['v', 'He estado'],
  ['w', 'Quiero ir'],
  ['n', 'Sin pisar']
];
// ¿Una marca ('v', 'w' o nada) pasa el filtro?
const cumpleFiltro = (filtro, marca) => filtro == 'all' || (filtro == 'n' ? !marca : marca == filtro);
function crearBotonesFiltro(actual, alElegir) {
  const fila = crear('div', 'fl');
  FILTROS.forEach(([clave, texto]) => {
    const b = crear('button', clave == actual ? 'on' : '', texto);
    b.dataset.f = clave;
    b.onclick = () => alElegir(clave);
    fila.appendChild(b);
  });
  return fila;
}

// --- Gestos sobre un mapa SVG -----------------------------------------------
// Arrastrar con un dedo o el ratón, pellizcar con dos dedos y rueda del ratón.
//   aPunto(clientX, clientY) -> [x, y] en coordenadas del mapa
//   zoom(factor, x, y)       acerca (factor > 1) o aleja alrededor de (x, y)
//   mover(fx, fy)            desplaza el mapa una fracción fx/fy de su ancho/alto en pantalla
//   puedeMover()             false si el mapa no se puede arrastrar ahora
//   medir()                  rectángulo del mapa en pantalla (por defecto, el del elemento)
//   rueda(deltaPx, x, y)     opcional: qué hacer con la rueda (si no, zoom a saltos)
//   alTocar()                opcional: al apoyar un dedo (p. ej. para parar una animación)
//   alSoltar(vx, vy)         opcional: al levantar el último dedo, con la velocidad del arrastre en px/ms
// Devuelve { arrastre, dedos }: arrastre = píxeles movidos desde que se pulsó (para no tomar un
// arrastre por un toque, ver UMBRAL_TOQUE) y dedos = punteros apoyados ahora.
const UMBRAL_TOQUE = 6;
function activarGestos(
  el,
  {
    aPunto,
    zoom,
    mover,
    puedeMover = () => true,
    medir = () => el.getBoundingClientRect(),
    rueda,
    alTocar,
    alSoltar
  }
) {
  const punteros = new Map(),
    gestos = { arrastre: 0, dedos: 0 };
  let muestras = []; // últimos movimientos { t, dx, dy } para calcular la velocidad al soltar
  el.addEventListener(
    'wheel',
    e => {
      e.preventDefault();
      const [x, y] = aPunto(e.clientX, e.clientY),
        delta = e.deltaY * (e.deltaMode == 1 ? 16 : e.deltaMode == 2 ? 400 : 1);
      if (rueda) rueda(delta, x, y);
      else zoom(delta < 0 ? 1.25 : 1 / 1.25, x, y);
    },
    { passive: false }
  );
  el.addEventListener('pointerdown', e => {
    punteros.set(e.pointerId, [e.clientX, e.clientY]);
    gestos.dedos = punteros.size;
    gestos.arrastre = 0;
    muestras = [];
    if (alTocar) alTocar();
  });
  el.addEventListener('pointermove', e => {
    if (!punteros.has(e.pointerId)) return;
    const antes = punteros.get(e.pointerId),
      ahora = [e.clientX, e.clientY];
    if (punteros.size == 2) {
      // Pellizco: el punto del mapa que estaba entre los dedos sigue entre los dedos, acercándose
      // o alejándose según cambia su separación, y moviéndose con ellos
      const otro = [...punteros.entries()].find(a => a[0] != e.pointerId)[1],
        dAntes = Math.hypot(antes[0] - otro[0], antes[1] - otro[1]),
        dAhora = Math.hypot(ahora[0] - otro[0], ahora[1] - otro[1]),
        medioAntes = [(antes[0] + otro[0]) / 2, (antes[1] + otro[1]) / 2],
        medioAhora = [(ahora[0] + otro[0]) / 2, (ahora[1] + otro[1]) / 2];
      if (dAntes > 0 && dAhora > 0) {
        const [x, y] = aPunto(medioAntes[0], medioAntes[1]);
        zoom(dAhora / dAntes, x, y);
        const r = medir();
        mover((medioAhora[0] - medioAntes[0]) / r.width, (medioAhora[1] - medioAntes[1]) / r.height);
      }
      gestos.arrastre = UMBRAL_TOQUE + 3;
      muestras = [];
    } else if (punteros.size == 1) {
      const dx = ahora[0] - antes[0],
        dy = ahora[1] - antes[1];
      gestos.arrastre += Math.abs(dx) + Math.abs(dy);
      if (gestos.arrastre > UMBRAL_TOQUE && puedeMover()) {
        const r = medir();
        mover(dx / r.width, dy / r.height);
        const t = performance.now();
        muestras.push({ t, dx, dy });
        muestras = muestras.filter(m => t - m.t < 100);
      }
    }
    punteros.set(e.pointerId, ahora);
  });
  const soltar = e => {
    if (!punteros.has(e.pointerId)) return;
    punteros.delete(e.pointerId);
    gestos.dedos = punteros.size;
    if (punteros.size) return;
    // Velocidad media de los últimos 100 ms, si el dedo seguía moviéndose al soltar
    const t = performance.now();
    let vx = 0,
      vy = 0;
    if (muestras.length > 1 && t - muestras[muestras.length - 1].t < 50) {
      const dt = Math.max(16, t - muestras[0].t);
      vx = muestras.reduce((s, m) => s + m.dx, 0) / dt;
      vy = muestras.reduce((s, m) => s + m.dy, 0) / dt;
    }
    muestras = [];
    if (alSoltar) alSoltar(vx, vy);
  };
  el.addEventListener('pointerup', soltar);
  el.addEventListener('pointercancel', soltar);
  return gestos;
}
