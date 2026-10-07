// Mapa con teclado y lector de pantalla.
// El mapa es una sola parada de Tab (la zona con el foco); dentro:
//   flechas         a la zona vecina en esa dirección (o, si no hay, a la más cercana en esa dirección)
//   Intro / espacio abre la ficha de la zona (en el juego «¿Dónde está?», responde)
//   Inicio          vuelve al Centro
//   una letra       a la siguiente zona que empieza por esa letra
// Cada zona es un botón con su nombre, su parte de la ciudad y su estado (etiquetaAccesible, mapa.js).

const zonaDeElemento = new Map(zonas.map(z => [z.e, z]));
let zonaConFoco = zonas.find(z => z.id == 'centro') || zonas[0];
zonaConFoco.e.setAttribute('tabindex', '0');

// La zona que recibe el Tab pasa a ser «z» (y, si mover, se le da el foco)
function enfocarZona(z, mover = true) {
  if (z != zonaConFoco) {
    zonaConFoco.e.setAttribute('tabindex', '-1');
    zonaConFoco = z;
    z.e.setAttribute('tabindex', '0');
  }
  if (mover) z.e.focus({ preventScroll: true });
}

// Si la zona queda fuera de lo que se ve del mapa, se mueve el mapa hasta ella (sin cambiar el zoom)
function llevarZonaALaVista(z) {
  const v = vistaMapa,
    panelAbierto = $('#sh').classList.contains('o') || panelJuego.classList.contains('o'),
    altoVisible = panelAbierto ? (mapaVisiblePx() / (tamMapa.h || 400)) * v.h : v.h,
    margen = v.w * 0.06;
  if (
    z.x > v.x + margen &&
    z.x < v.x + v.w - margen &&
    z.y > v.y + margen &&
    z.y < v.y + altoVisible - margen
  )
    return;
  animarVista({ x: z.x - v.w / 2, y: z.y - altoVisible / 2, w: v.w }, 260);
}

// La zona más a mano en la dirección (dx, dy): primero entre las vecinas, y si no hay, entre todas.
// Vale una zona que esté dentro de un cono de ±60° alrededor de la dirección; gana la más cercana,
// penalizando las que se desvían.
function zonaEnDireccion(z, dx, dy) {
  const puntuar = c => {
      const vx = c.x - z.x,
        vy = c.y - z.y,
        avance = vx * dx + vy * dy,
        desvio = Math.abs(vx * dy - vy * dx);
      if (avance <= 0 || desvio > avance * 1.75) return Infinity;
      return Math.hypot(vx, vy) * (1 + desvio / avance);
    },
    mejor = lista => {
      let m = null,
        p = Infinity;
      lista.forEach(c => {
        const s = puntuar(c);
        if (s < p) [m, p] = [c, s];
      });
      return m;
    };
  return mejor(z.vecinos || []) || mejor(zonas);
}

// Siguiente zona (en orden alfabético, después de la actual) que empieza por la letra
function zonaPorLetra(z, letra) {
  const orden = [...zonas].sort((a, b) => a.n.localeCompare(b.n, 'es')),
    i = orden.indexOf(z);
  for (let k = 1; k <= orden.length; k++) {
    const c = orden[(i + k) % orden.length];
    if (normalizar(c.n).startsWith(letra)) return c;
  }
  return null;
}

// Intro sobre una zona: lo mismo que tocarla
function activarZona(z) {
  if (typeof juego != 'undefined' && juego.activo) {
    if (juego.respondida) return;
    juego.porTeclado = true;
    responderJuego(z);
    // El foco pasa al botón «Siguiente» (el resultado lo anuncia el panel)
    const seguir = panelJuego.querySelector('.botones button');
    if (seguir) seguir.focus({ preventScroll: true });
  } else abrirFicha(z.id);
}

const DIRECCIONES = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
$('#zg').addEventListener('keydown', e => {
  const z = zonaDeElemento.get(e.target);
  if (!z || e.ctrlKey || e.metaKey || e.altKey) return;
  let destino = null;
  if (DIRECCIONES[e.key]) destino = zonaEnDireccion(z, ...DIRECCIONES[e.key]);
  else if (e.key == 'Home') destino = zonas.find(q => q.id == 'centro');
  else if (e.key == 'Enter' || e.key == ' ') {
    e.preventDefault();
    activarZona(z);
    return;
  } else if (e.key.length == 1 && /\p{L}/u.test(e.key)) destino = zonaPorLetra(z, normalizar(e.key));
  else return;
  e.preventDefault();
  if (destino) enfocarZona(destino);
});

// Contorno de la zona con el foco, solo cuando se llega con el teclado (con el ratón ya se ve lo tocado)
// (en document y no en el SVG: Chrome hace enfocable un elemento SVG con escuchas de foco)
document.addEventListener('focusin', e => {
  const z = zonaDeElemento.get(e.target);
  if (!z) return;
  enfocarZona(z, false);
  if (e.target.matches(':focus-visible')) {
    limiteFoco.setAttribute('d', trazoAnillo(z.P));
    llevarZonaALaVista(z);
  }
});
document.addEventListener('focusout', e => zonaDeElemento.has(e.target) && limiteFoco.setAttribute('d', ''));
