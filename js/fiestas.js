// Días especiales (datos/fiestas.js): Navidad, Reyes, Semana Santa, Lunes de Aguas, San Juan de Sahagún,
// los cambios de estación… Ese día, la primera vez que se abre la app, caen unas piezas por encima de todo
// (sin tapar nada: no reciben toques) durante unos segundos, y arriba sale un aviso que se cierra con ×.
// Con «menos movimiento» en el sistema solo sale el aviso, que se va solo a los 15 s si no se toca. Lo visto se
// apunta en este navegador (charro-fiesta: día e id), así que no se repite ese día; con el botón del pie se
// apagan del todo (charro-fiestas = '0'). Para verlo otro día: ?fiesta=<id> en la dirección.

const CLAVE_FIESTA = 'charro-fiesta',
  CLAVE_FIESTAS_APAGADAS = 'charro-fiestas';
const DURACION_FIESTA = 9000, // ms hasta que se quitan las piezas
  DURACION_AVISO_FIESTA = 15000; // y el aviso, si no se ha tocado
const fiestasApagadas = () => leerLocal(CLAVE_FIESTAS_APAGADAS) == '0';

// --- Cambios de estación ------------------------------------------------------
// Momento del equinoccio o solsticio (Meeus, «Astronomical Algorithms», cap. 27: valor medio para 2000-3000
// y corrección periódica; error de alrededor de un minuto). cual: 0 marzo, 1 junio, 2 septiembre, 3 diciembre
const MEDIAS_ESTACION = [
  [2451623.80984, 365242.37404, 0.05169, -0.00411, -0.00057],
  [2451716.56767, 365241.62603, 0.00325, 0.00888, -0.0003],
  [2451810.21715, 365242.01767, -0.11575, 0.00337, 0.00078],
  [2451900.05952, 365242.74049, -0.06223, -0.00823, 0.00032]
];
const TERMINOS_ESTACION = [
  [485, 324.96, 1934.136],
  [203, 337.23, 32964.467],
  [199, 342.08, 20.186],
  [182, 27.85, 445267.112],
  [156, 73.14, 45036.886],
  [136, 171.52, 22518.443],
  [77, 222.54, 65928.934],
  [74, 296.72, 3034.906],
  [70, 243.58, 9037.513],
  [58, 119.81, 33718.147],
  [52, 297.17, 150.678],
  [50, 21.02, 2281.226],
  [45, 247.54, 29929.562],
  [44, 325.15, 31555.956],
  [29, 60.93, 4443.417],
  [18, 155.12, 67555.328],
  [17, 288.79, 4562.452],
  [16, 198.04, 62894.029],
  [14, 199.76, 31436.921],
  [12, 95.39, 14577.848],
  [12, 287.11, 31931.756],
  [12, 320.81, 34777.259],
  [9, 227.73, 1222.114],
  [8, 15.45, 16859.074]
];
function momentoEstacion(anio, cual) {
  const y = (anio - 2000) / 1000,
    jde0 = MEDIAS_ESTACION[cual].reduce((suma, c, i) => suma + c * y ** i, 0),
    t = (jde0 - 2451545) / 36525,
    rad = g => (g * Math.PI) / 180,
    w = rad(35999.373 * t - 2.47),
    dl = 1 + 0.0334 * Math.cos(w) + 0.0007 * Math.cos(2 * w),
    s = TERMINOS_ESTACION.reduce((suma, [a, b, c]) => suma + a * Math.cos(rad(b + c * t)), 0),
    jde = jde0 + (0.00001 * s) / dl;
  // De tiempo terrestre a UTC: ΔT, poco más de un minuto en estos años
  return new Date((jde - 2440587.5) * 864e5 - 69e3);
}

// --- ¿Qué día especial es? ------------------------------------------------------
// El de un día 'AAAA-MM-DD' (por defecto, hoy en Salamanca), o null. Devuelve lo de DIAS_ESPECIALES con
// icono y texto; los cambios de estación llevan además la hora en Salamanca.
function diaEspecial(dia = fechaHoy()) {
  const anio = +dia.slice(0, 4),
    enDia = t => {
      const d = fechaDeAgenda(t, anio);
      return (
        anio + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
      );
    };
  const fiesta = DIAS_ESPECIALES.find(f => {
    const desde = enDia(f.desde),
      hasta = f.hasta ? enDia(f.hasta) : desde;
    return dia >= desde && dia <= hasta;
  });
  if (fiesta) return fiesta;
  for (let i = 0; i < 4; i++) {
    const momento = momentoEstacion(anio, i);
    if (diaEnSalamanca(momento) == dia) return fiestaDeEstacion(i, momento);
  }
  return null;
}
function fiestaDeEstacion(i, momento) {
  const [id, nombre, anim, icono] = ESTACIONES[i],
    p = partesEnSalamanca(momento, { hour: '2-digit', minute: '2-digit' });
  return {
    id,
    n: nombre.replace(/^la |^el /, ''),
    anim,
    icono,
    hora: p.hour + ':' + p.minute,
    texto:
      'Hoy empieza ' +
      nombre +
      ': el ' +
      (i % 2 ? 'solsticio' : 'equinoccio') +
      ' es hacia las ' +
      p.hour +
      ':' +
      p.minute +
      ', hora de Salamanca.'
  };
}
// Para verlo cualquier día: ?fiesta=<id> (de DIAS_ESPECIALES o de ESTACIONES)
function fiestaDePrueba(id) {
  const fiesta = DIAS_ESPECIALES.find(f => f.id == id);
  if (fiesta) return fiesta;
  const i = ESTACIONES.findIndex(e => e[0] == id);
  return i < 0 ? null : fiestaDeEstacion(i, momentoEstacion(+fechaHoy().slice(0, 4), i));
}

// --- Animaciones ----------------------------------------------------------------
// tipo: caer (de arriba abajo, meciéndose), subir (de abajo arriba) o estallar (fuegos artificiales).
// piezas: emojis; sin piezas, papelitos o chispas de los colores dados.
const ANIMACIONES_FIESTA = {
  nieve: { tipo: 'caer', piezas: ['❄', '❅', '❆', '•'], cantidad: 40, claro: true },
  fuegos: { tipo: 'estallar', colores: ['#e8b54a', '#d9534f', '#5bc0de', '#9b7fd1', '#7ccf6b'], cantidad: 6 },
  confeti: { tipo: 'caer', colores: ['#b5302a', '#e8b54a', '#2f6db5', '#3c9a5f', '#d06fa8'], cantidad: 50 },
  estrellas: { tipo: 'caer', piezas: ['⭐', '✨', '🌟'], cantidad: 24 },
  luces: { tipo: 'subir', colores: ['#f2c46d', '#e8a33c', '#fbe3a6'], cantidad: 30 },
  agua: { tipo: 'caer', piezas: ['💧', '💧', '🌼'], cantidad: 28 },
  toros: { tipo: 'caer', piezas: ['🐂'], cantidad: 14 },
  flores: { tipo: 'caer', piezas: ['🌸', '🌼', '🌷', '🌸'], cantidad: 30 },
  sol: { tipo: 'subir', piezas: ['☀️', '✨', '🌻'], cantidad: 22 },
  hojas: { tipo: 'caer', piezas: ['🍂', '🍁', '🍃', '🍂'], cantidad: 30 }
};
// Un número al azar entre a y b, para que cada pieza vaya a su aire
const alAzar = (a, b) => a + Math.random() * (b - a);
function piezaFiesta(anim, i) {
  const pieza = crear('span', 'pieza');
  if (anim.piezas) pieza.textContent = anim.piezas[i % anim.piezas.length];
  else pieza.style.background = anim.colores[i % anim.colores.length];
  pieza.style.setProperty('--x', alAzar(0, 100).toFixed(1) + 'vw');
  pieza.style.setProperty('--deriva', alAzar(-12, 12).toFixed(1) + 'vw');
  pieza.style.setProperty('--retraso', alAzar(0, 3.5).toFixed(2) + 's');
  pieza.style.setProperty('--duracion', alAzar(4, 6.5).toFixed(2) + 's');
  pieza.style.setProperty('--giro', Math.round(alAzar(-360, 360)) + 'deg');
  pieza.style.setProperty('--tam', alAzar(0.7, 1.3).toFixed(2));
  return pieza;
}
// Un fuego artificial: chispas que salen en círculo desde un punto
function estallido(anim, i) {
  const fuego = crear('span', 'fuego'),
    color = anim.colores[i % anim.colores.length],
    chispas = 14;
  fuego.style.setProperty('--x', alAzar(12, 88).toFixed(1) + 'vw');
  fuego.style.setProperty('--y', alAzar(12, 50).toFixed(1) + 'vh');
  fuego.style.setProperty('--retraso', (i * 0.7 + alAzar(0, 0.4)).toFixed(2) + 's');
  for (let k = 0; k < chispas; k++) {
    const chispa = crear('span', 'chispa');
    chispa.style.background = color;
    chispa.style.setProperty('--angulo', Math.round((360 / chispas) * k) + 'deg');
    chispa.style.setProperty('--lejos', Math.round(alAzar(70, 110)) + 'px');
    fuego.append(chispa);
  }
  return fuego;
}
let finFiesta = null;
function lanzarAnimacionFiesta(nombre) {
  const anim = ANIMACIONES_FIESTA[nombre];
  if (!anim || movimientoReducido()) return;
  quitarAnimacionFiesta();
  const capa = crear('div', 'fiesta-capa ' + anim.tipo + (anim.claro ? ' claro' : ''));
  capa.id = 'fiesta-capa';
  capa.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < anim.cantidad; i++)
    capa.append(anim.tipo == 'estallar' ? estallido(anim, i) : piezaFiesta(anim, i));
  document.body.append(capa);
  finFiesta = setTimeout(quitarAnimacionFiesta, DURACION_FIESTA);
}
function quitarAnimacionFiesta() {
  clearTimeout(finFiesta);
  const capa = $('#fiesta-capa');
  if (capa) capa.remove();
}

// --- Aviso -----------------------------------------------------------------------
function mostrarFiesta(fiesta) {
  if ($('#fiesta')) $('#fiesta').remove();
  const repetir = crear('button', 'icono', fiesta.icono),
    cerrar = crear('button', 'cerrar', '×'),
    caja = crear('div', '', repetir, crear('span', 'texto', fiesta.texto));
  caja.id = 'fiesta';
  caja.setAttribute('role', 'status');
  repetir.setAttribute('aria-label', 'Ver otra vez la animación de ' + fiesta.n);
  repetir.onclick = () => lanzarAnimacionFiesta(fiesta.anim);
  if (movimientoReducido()) repetir.disabled = true;
  if (fiesta.cultura && elementoCultura(fiesta.cultura)) {
    const mas = crear('button', 'mas', 'Saber más');
    mas.onclick = () => {
      caja.remove();
      quitarAnimacionFiesta();
      abrirElementoCultura(fiesta.cultura);
    };
    caja.append(mas);
  }
  cerrar.setAttribute('aria-label', 'Cerrar el aviso de ' + fiesta.n);
  cerrar.onclick = () => {
    caja.remove();
    quitarAnimacionFiesta();
  };
  caja.append(cerrar);
  document.body.append(caja);
  lanzarAnimacionFiesta(fiesta.anim);
  // Se va sola si no se toca (no tapa el buscador todo el día); con el foco o el ratón dentro, se queda
  const quitarSola = setTimeout(() => {
    if (!caja.matches(':hover, :focus-within')) caja.remove();
  }, DURACION_AVISO_FIESTA);
  caja.addEventListener('pointerdown', () => clearTimeout(quitarSola), { once: true });
}

// Al abrir la app: el de hoy, si no se ha visto ya hoy (o el de ?fiesta=, siempre)
function iniciarFiestas() {
  const prueba = new URLSearchParams(location.search).get('fiesta');
  if (prueba) {
    const fiesta = fiestaDePrueba(prueba);
    if (fiesta) mostrarFiesta(fiesta);
    return;
  }
  if (fiestasApagadas()) return;
  const fiesta = diaEspecial(),
    marca = fechaHoy() + ' ' + (fiesta || {}).id;
  if (!fiesta || leerLocal(CLAVE_FIESTA) == marca) return;
  escribirLocal(CLAVE_FIESTA, marca);
  mostrarFiesta(fiesta);
}

// Botón del pie para apagar o volver a encender las animaciones de los días especiales (como el del tema, dice
// lo que hace al pulsarlo)
function botonFiestas() {
  const boton = crear('button', 'enlace');
  const pintar = () => {
    const apagadas = fiestasApagadas();
    boton.textContent = apagadas ? '🎉 Poner animaciones de fiesta' : '🎉 Quitar animaciones de fiesta';
    boton.setAttribute(
      'aria-label',
      apagadas
        ? 'Ver las animaciones de los días especiales'
        : 'No ver las animaciones de los días especiales'
    );
  };
  boton.onclick = () => {
    if (fiestasApagadas()) escribirLocal(CLAVE_FIESTAS_APAGADAS, '1');
    else {
      escribirLocal(CLAVE_FIESTAS_APAGADAS, '0');
      quitarAnimacionFiesta();
      if ($('#fiesta')) $('#fiesta').remove();
    }
    pintar();
  };
  pintar();
  return boton;
}
