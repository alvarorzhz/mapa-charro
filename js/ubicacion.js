// Botón «Estoy aquí» (geolocalización). La ubicación solo se usa en el dispositivo: no se guarda ni se envía.

// Última ubicación: { id (zona del mapa, 'resto' o null), t (cuándo), acc (precisión en m), pid (clave del pueblo) }
let ubicacion = null;
let marcaPosicion = null; // { m (grupo SVG), x, y } del punto azul en el mapa
const VIGENCIA_UBICACION = 30 * 60 * 1000; // durante 30 min, lo que marques cuenta como «pisado con GPS»
const ubicacionReciente = () => !!ubicacion && Date.now() - ubicacion.t < VIGENCIA_UBICACION;

// ¿En qué zona del mapa está el punto? Primero por límites oficiales y, si no, por cercanía.
function zonaEnCoordenadas(la, lo) {
  for (const id in LIMITES_BARRIOS) if (dentroDePoligono(LIMITES_BARRIOS[id], la, lo)) return id;
  const masCercana = filtro =>
    zonas
      .filter(z => filtro(z.g))
      .map(z => [distanciaKm(la, lo, z.la, z.lo), z.id])
      .sort((a, b) => a[0] - b[0])[0];
  const barrio = masCercana(g => g < 5);
  if (barrio && barrio[0] < 0.4) return barrio[1];
  const pueblo = masCercana(g => g == 5);
  if (pueblo && pueblo[0] < 3.5) return pueblo[1];
  return dentroDePoligono(LIMITE_PROVINCIA, la, lo) ? 'resto' : null;
}

// Aviso en la ficha: «Estás aquí ahora mismo» o «Pisado estando allí, con GPS»
function mostrarAvisoAqui(id) {
  const h = $('#here'),
    ahora = ubicacionReciente() && ubicacion.id == id,
    conGps = (progreso.gv || []).includes(id);
  h.hidden = !(ahora || conGps);
  if (ahora) {
    h.className = 'here';
    h.textContent =
      (progreso.z[id] == 'v'
        ? 'Estás aquí ahora mismo.'
        : 'Estás aquí ahora mismo: márcalo con «He estado» y quedará pisado con GPS.') +
      (ubicacion.acc > 1500
        ? ' Ojo: la ubicación es poco precisa (±' + Math.round(ubicacion.acc / 100) / 10 + ' km).'
        : '');
  } else if (conGps) {
    h.className = 'here ok';
    h.textContent = '✓ Pisado estando allí, con GPS';
  }
}

// Punto azul con su círculo de precisión
function dibujarPosicion(la, lo, precision) {
  const g = $('#me');
  g.textContent = '';
  const [x, y] = proyectar(la, lo);
  if (x < 0 || x > ANCHO_MAPA || y < 0 || y > ALTO_MAPA) return;
  crearSvg(
    'circle',
    {
      cx: x,
      cy: y,
      r: Math.max(0.5, (precision / 1000) * 22),
      fill: 'var(--auv)',
      'fill-opacity': 0.12,
      stroke: 'var(--auv)',
      'stroke-opacity': 0.5,
      'stroke-width': '1px',
      'vector-effect': 'non-scaling-stroke'
    },
    g
  );
  const m = crearSvg('g', { transform: 'translate(' + x + ' ' + y + ')' }, g);
  marcaPosicion = { m, x, y };
  crearSvg('circle', { r: 7, fill: 'var(--auv)', class: 'mepulse' }, m);
  crearSvg('circle', { r: 5, fill: 'var(--auv)', stroke: '#fff', 'stroke-width': 2 }, m);
  ajustarVista();
}

// Mensaje bajo el mapa; con conPestana añade un botón para abrir la app fuera de Claude
function mensajeUbicacion(texto, conPestana) {
  const e = $('#gm');
  e.hidden = !texto;
  e.textContent = texto || '';
  if (texto && conPestana && /^https?:/.test(location.protocol)) {
    const a = crear('a', 'gbtn', 'Abrir en una pestaña aparte');
    a.href = location.href;
    a.target = '_blank';
    a.rel = 'noopener';
    e.append(crear('br'), a);
  }
  if (texto) e.scrollIntoView({ behavior: comoDesplazar(), block: 'nearest' });
}

// ¿La app va dentro de un marco (el visor de Claude)?
const EN_MARCO = (() => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
})();
const ubicacionBloqueada = () => {
  try {
    return !!(
      document.featurePolicy &&
      document.featurePolicy.allowsFeature &&
      !document.featurePolicy.allowsFeature('geolocation')
    );
  } catch (e) {
    return false;
  }
};
const MENSAJE_EN_MARCO =
  'Dentro de Claude esta app todavía no puede usar tu ubicación: Claude aún no le da ese permiso. Ábrela en una pestaña aparte y la brújula funcionará. Lo que marques allí se guardará en ese navegador.';

function alLocalizar(pos) {
  const la = pos.coords.latitude,
    lo = pos.coords.longitude,
    precision = pos.coords.accuracy || 0;
  let id = zonaEnCoordenadas(la, lo),
    municipio = null;
  if (id == 'resto') {
    municipio = PROVINCIA.m.find(m => m.R.some(r => dentroDePoligono(r, la, lo))) || null;
    if (municipio && municipio.z) id = municipio.z; // pueblo del alfoz que está en el mapa
  }
  ubicacion = {
    id,
    t: Date.now(),
    acc: precision,
    pid: municipio && !municipio.z && !municipio.cap ? municipio.k : null
  };
  dibujarPosicion(la, lo, precision);
  if (ubicacion.pid) {
    aviso('Estás en ' + municipio.n);
    cambiarPestana('prov');
    seleccionarPueblo(municipio, true);
    return;
  }
  if (!id) {
    mensajeUbicacion('Estás fuera de la provincia de Salamanca. ¡Aquí te esperamos!');
    return;
  }
  const z = buscarZona(id);
  aviso(id == 'resto' ? 'Estás en la provincia, fuera del mapa' : 'Estás en ' + z.n);
  abrirFicha(id);
  // Fuera de la ciudad, encuadra el punto azul en lugar del centro de la zona
  if ((id == 'resto' || z.g == 5) && marcaPosicion) {
    centrarMapaEn(marcaPosicion.x, marcaPosicion.y, Math.min(vistaMapa.w, id == 'resto' ? 400 : 120));
    ajustarVista();
  }
}

function alFallarUbicacion(e) {
  ubicacion = null;
  aviso('No te he podido localizar');
  if (e.code == 1 && EN_MARCO) {
    mensajeUbicacion(MENSAJE_EN_MARCO, true);
    return;
  }
  mensajeUbicacion(
    e.code == 1
      ? 'No hay permiso para usar tu ubicación. Actívalo en los ajustes de ubicación del navegador y vuelve a pulsar la brújula.'
      : e.code == 3
        ? 'Ha tardado demasiado en encontrarte. Prueba otra vez, mejor al aire libre.'
        : 'No se ha podido calcular tu posición. Prueba otra vez en un momento.'
  );
}

$('#zl').onclick = () => {
  const boton = $('#zl');
  mensajeUbicacion('');
  if (ubicacionBloqueada()) {
    aviso('Aquí no puedo usar tu ubicación');
    mensajeUbicacion(MENSAJE_EN_MARCO, true);
    return;
  }
  if (!navigator.geolocation || !window.isSecureContext) {
    mensajeUbicacion('Este navegador no permite saber dónde estás.');
    return;
  }
  const ocupado = si => {
    boton.classList.toggle('busy', si);
    boton.disabled = si;
  };
  ocupado(true);
  navigator.geolocation.getCurrentPosition(
    pos => {
      ocupado(false);
      alLocalizar(pos);
    },
    e => {
      ocupado(false);
      alFallarUbicacion(e);
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
  );
};
