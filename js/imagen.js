// «Mi Salamanca»: imagen para compartir con el mapa coloreado según el progreso y los números.
// Se dibuja en un canvas (1080×1350, el formato vertical de Instagram) con los colores del tema claro,
// sea cual sea el tema de la pantalla, para que la imagen salga siempre igual.

const COLORES_IMAGEN = {
  fondo: '#d8b97a',
  mapa: '#c9a762',
  tinta: '#35240f',
  rojo: '#a8221c',
  oro: '#7c5410',
  linea: '#6e4f22',
  rio: '#7ea2ad',
  tarjeta: '#f1e4bd',
  claro: '#ecdcae',
  grupos: ['#e8cf8c', '#ecdcae', '#e2cfa0', '#efe0b8', '#dcc795', '#b9bb7c', '#c4a15a']
};
const OPACIDAD_TONO = [1, 0.82, 0.91, 0.73]; // como .z.t0 … .z.t3 en estilos.css

// Rectángulo con esquinas redondeadas (ctx.roundRect no está en todos los navegadores)
function rectanguloRedondeado(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Los números que salen en la imagen
function resumenProgreso() {
  const marcas = Object.values(progreso.z),
    logros = calcularLogros();
  return {
    pisadas: marcas.filter(x => x == 'v').length,
    porVisitar: marcas.filter(x => x == 'w').length,
    total: todasLasZonas.length,
    logros: logros.filter(a => a.c >= a.m).length,
    totalLogros: logros.length,
    pueblos: Object.keys(progreso.p || {}).filter(k => k[0] == 'm' && progreso.p[k] == 'v').length,
    rana: !!progreso.f
  };
}

// Dibuja el mapa de zonas en el rectángulo (x, y, w, h), encuadrando los barrios de la ciudad
function dibujarMapaImagen(ctx, x, y, w, h) {
  const C = COLORES_IMAGEN,
    ciudad = zonas.filter(z => z.g < 5).flatMap(z => z.P),
    xs = ciudad.map(q => q[0]),
    ys = ciudad.map(q => q[1]),
    margen = 0.06;
  let [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const anchoCiudad = (x1 - x0) * (1 + 2 * margen),
    altoCiudad = (y1 - y0) * (1 + 2 * margen),
    escala = Math.min(w / anchoCiudad, h / altoCiudad),
    cx = (x0 + x1) / 2,
    cy = (y0 + y1) / 2;
  // Del mapa (unidades del viewBox) a la imagen
  const aImagen = (px, py) => [x + w / 2 + (px - cx) * escala, y + h / 2 + (py - cy) * escala];

  ctx.save();
  rectanguloRedondeado(ctx, x, y, w, h, 28);
  ctx.fillStyle = C.mapa;
  ctx.fill();
  ctx.clip();

  // Trama de «Quiero ir»: rayas doradas como el patrón #h del mapa
  const trama = document.createElement('canvas');
  trama.width = trama.height = 18;
  const t = trama.getContext('2d');
  t.fillStyle = C.claro;
  t.fillRect(0, 0, 18, 18);
  t.strokeStyle = C.oro;
  t.globalAlpha = 0.6;
  t.lineWidth = 6;
  for (let k = -18; k <= 36; k += 18) {
    t.beginPath();
    t.moveTo(k, 18);
    t.lineTo(k + 18, 0);
    t.stroke();
  }
  const rayado = ctx.createPattern(trama, 'repeat');

  // Zonas: primero los pueblos de alrededor y luego los barrios, para que los bordes queden encima
  [...zonas]
    .sort((a, b) => (b.g == 5) - (a.g == 5))
    .forEach(z => {
      const marca = progreso.z[z.id];
      ctx.beginPath();
      z.P.forEach((q, i) => ctx[i ? 'lineTo' : 'moveTo'](...aImagen(q[0], q[1])));
      ctx.closePath();
      ctx.globalAlpha = marca ? 1 : OPACIDAD_TONO[z.tono || 0];
      ctx.fillStyle = marca == 'v' ? C.rojo : marca == 'w' ? rayado : C.grupos[z.g];
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.lineJoin = 'round';
      ctx.lineWidth = marca == 'w' ? 3 : 1.6;
      ctx.strokeStyle = marca == 'w' ? C.oro : C.linea;
      ctx.setLineDash(marca == 'w' ? [10, 6] : []);
      ctx.globalAlpha = marca == 'w' ? 1 : 0.55;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.setLineDash([]);
    });

  // Río Tormes, con el mismo trazado que el mapa
  const rio = $('#rv').getAttribute('d');
  if (rio) {
    ctx.save();
    ctx.translate(x + w / 2 - cx * escala, y + h / 2 - cy * escala);
    ctx.scale(escala, escala);
    ctx.strokeStyle = C.rio;
    ctx.lineWidth = 6 / escala;
    ctx.lineCap = ctx.lineJoin = 'round';
    ctx.stroke(new Path2D(rio));
    ctx.restore();
  }

  // Sello «V» en cada zona pisada
  zonas
    .filter(z => progreso.z[z.id] == 'v')
    .forEach(z => {
      const [px, py] = aImagen(z.x, z.y);
      if (px < x || px > x + w || py < y || py > y + h) return;
      ctx.beginPath();
      ctx.arc(px, py, 13, 0, Math.PI * 2);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = '700 16px Lora, Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('V', px, py + 1);
    });
  ctx.restore();

  // Marco
  rectanguloRedondeado(ctx, x, y, w, h, 28);
  ctx.strokeStyle = C.linea;
  ctx.lineWidth = 5;
  ctx.stroke();
}

// Crea la imagen y devuelve un Blob PNG
async function crearImagenMiSalamanca() {
  try {
    await Promise.all([
      document.fonts.load('80px "Alfa Slab One"'),
      document.fonts.load('600 40px Lora'),
      document.fonts.load('400 40px Lora')
    ]);
  } catch (e) {} // sin las tipografías se usan las de respaldo
  const W = 1080,
    H = 1350,
    C = COLORES_IMAGEN,
    r = resumenProgreso(),
    lienzo = document.createElement('canvas');
  lienzo.width = W;
  lienzo.height = H;
  const ctx = lienzo.getContext('2d');
  ctx.fillStyle = C.fondo;
  ctx.fillRect(0, 0, W, H);

  // Título, un poco torcido como el de la app
  ctx.save();
  ctx.translate(70, 128);
  ctx.rotate((-1.5 * Math.PI) / 180);
  ctx.fillStyle = C.rojo;
  ctx.font = '86px "Alfa Slab One", Georgia, serif';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('Mi Salamanca', 0, 0);
  ctx.restore();
  ctx.fillStyle = C.tinta;
  ctx.font = '400 34px Lora, Georgia, serif';
  ctx.fillText('Mapa charro · lo que he pisado de la ciudad', 72, 186);

  dibujarMapaImagen(ctx, 60, 222, 960, 770);

  // Números: tres tarjetas
  const tarjetas = [
      [r.pisadas + '/' + r.total, 'zonas pisadas'],
      [String(r.porVisitar), 'por visitar'],
      [r.logros + '/' + r.totalLogros, 'logros']
    ],
    anchoTarjeta = (960 - 2 * 24) / 3;
  tarjetas.forEach(([numero, texto], i) => {
    const tx = 60 + i * (anchoTarjeta + 24),
      ty = 1018;
    rectanguloRedondeado(ctx, tx, ty, anchoTarjeta, 150, 22);
    ctx.fillStyle = C.tarjeta;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = i ? C.linea : C.rojo;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = i ? C.tinta : C.rojo;
    ctx.font = '62px "Alfa Slab One", Georgia, serif';
    ctx.fillText(numero, tx + anchoTarjeta / 2, ty + 80);
    ctx.fillStyle = C.tinta;
    ctx.font = '600 28px Lora, Georgia, serif';
    ctx.fillText(texto, tx + anchoTarjeta / 2, ty + 124);
  });

  // Barra de progreso
  const barra = [60, 1196, 960, 22];
  rectanguloRedondeado(ctx, ...barra, 11);
  ctx.fillStyle = C.tarjeta;
  ctx.fill();
  if (r.pisadas) {
    rectanguloRedondeado(ctx, 60, 1196, Math.max(22, (960 * r.pisadas) / r.total), 22, 11);
    ctx.fillStyle = C.rojo;
    ctx.fill();
  }
  rectanguloRedondeado(ctx, ...barra, 11);
  ctx.strokeStyle = C.linea;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Extras y pie
  const extras = [
    r.pueblos ? r.pueblos + (r.pueblos == 1 ? ' pueblo' : ' pueblos') + ' de la provincia' : '',
    r.rana ? 'rana encontrada 🐸' : ''
  ].filter(Boolean);
  ctx.textAlign = 'left';
  ctx.fillStyle = C.tinta;
  ctx.font = '600 30px Lora, Georgia, serif';
  ctx.fillText(
    (extras.length ? 'Y además: ' + extras.join(' · ') + '. ' : '') + '¿Y tú, cuánto has pisado?',
    62,
    1268
  );
  ctx.font = '400 26px Lora, Georgia, serif';
  ctx.globalAlpha = 0.8;
  ctx.fillText(WEB.replace('https://', ''), 62, 1312);
  ctx.globalAlpha = 1;

  return new Promise((ok, mal) =>
    lienzo.toBlob(b => (b ? ok(b) : mal(new Error('No se pudo crear la imagen'))), 'image/png')
  );
}

// --- Ventana con la vista previa y los botones -----------------------------

const NOMBRE_IMAGEN = 'mi-salamanca.png';
// Dentro de Claude, las descargas pasan por la capacidad «downloads» (en la web no existe)
const descargasClaude =
  window.claude && window.claude.use
    ? window.claude.use('downloads').catch(() => null)
    : Promise.resolve(null);

async function guardarImagen(blob) {
  const descargas = await descargasClaude;
  if (descargas) {
    try {
      await descargas.save({ filename: NOMBRE_IMAGEN, data: blob });
    } catch (e) {
      if (e && e.code != 'declined') aviso('No se pudo guardar la imagen');
    }
    return;
  }
  const a = crear('a');
  a.href = URL.createObjectURL(blob);
  a.download = NOMBRE_IMAGEN;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

async function compartirImagen(blob) {
  const archivo = new File([blob], NOMBRE_IMAGEN, { type: 'image/png' });
  try {
    if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
      await navigator.share({
        files: [archivo],
        title: 'Mi Salamanca',
        text: 'Lo que he pisado de Salamanca en el Mapa charro. ¿Y tú? ' + WEB
      });
      return;
    }
  } catch (e) {
    if (e && e.name == 'AbortError') return;
  }
  // Sin compartir archivos (escritorio, o dentro de Claude): se guarda
  guardarImagen(blob);
}

function cerrarVentana() {
  const v = $('.modal');
  if (v) {
    if (v._url) URL.revokeObjectURL(v._url);
    v.remove();
    // El foco vuelve al botón que la abrió
    if (v._volverA && v._volverA.isConnected) v._volverA.focus({ preventScroll: true });
  }
}

// Ventana sencilla encima de todo: título, contenido y botones [[texto, al pulsar, clase]].
// Es un diálogo: el foco entra en él, no sale con Tab mientras está abierto y vuelve a «volverA» al cerrar.
function abrirVentana(titulo, contenido, botones, volverA = document.activeElement) {
  cerrarVentana();
  const cerrar = crear('button', 'cerrar', '×');
  cerrar.setAttribute('aria-label', 'Cerrar');
  cerrar.onclick = cerrarVentana;
  const fila = crear(
    'div',
    'botones',
    ...botones.map(([texto, alPulsar, clase]) => {
      const b = crear('button', clase || '', texto);
      b.onclick = alPulsar;
      return b;
    })
  );
  const h = crear('h3', '', titulo),
    caja = crear('div', 'caja', cerrar, h, contenido, fila),
    v = crear('div', 'modal', caja);
  h.id = 'tv';
  caja.setAttribute('role', 'dialog');
  caja.setAttribute('aria-modal', 'true');
  caja.setAttribute('aria-labelledby', 'tv');
  v._volverA = volverA;
  v.onclick = e => e.target == v && cerrarVentana();
  // Tab y Mayús+Tab dan la vuelta dentro de la ventana
  caja.addEventListener('keydown', e => {
    if (e.key != 'Tab') return;
    const enfocables = [...caja.querySelectorAll('button')],
      primero = enfocables[0],
      ultimo = enfocables[enfocables.length - 1];
    if (e.shiftKey && document.activeElement == primero) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement == ultimo) {
      e.preventDefault();
      primero.focus();
    }
  });
  document.body.appendChild(v);
  (fila.querySelector('button') || cerrar).focus({ preventScroll: true });
  return v;
}

async function abrirMiSalamanca() {
  const boton = $('#foto');
  boton.disabled = true;
  try {
    const blob = await crearImagenMiSalamanca(),
      url = URL.createObjectURL(blob),
      img = crear('img');
    img.src = url;
    img.alt = 'Tu mapa de Salamanca con las zonas que has pisado';
    const v = abrirVentana(
      'Tu Salamanca',
      img,
      [
        ['Compartir', () => compartirImagen(blob), 'on'],
        ['Guardar imagen', () => guardarImagen(blob)]
      ],
      boton
    );
    v._url = url;
  } catch (e) {
    console.error(e);
    aviso('No se pudo crear la imagen');
  } finally {
    boton.disabled = false;
  }
}

$('#foto').onclick = abrirMiSalamanca;
addEventListener('keydown', e => e.key == 'Escape' && cerrarVentana());
