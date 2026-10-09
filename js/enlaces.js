// Enlaces directos: cada ficha, pueblo y pestaña tiene su propia dirección
//   #tejares                  ficha de un barrio o pueblo del mapa (id de la zona)
//   #via/a-62                 ficha de una carretera o avenida
//   #tiempo  #tiempo/3        Salamanca en el tiempo: la primera etapa o una concreta (1 a 7)
//   #monumento/catedrales     mini infografía de un monumento
//   #rutas                    rutas a pie: la lista
//   #ruta  #ruta/3            ruta monumental: resumen y cada parada
//   #ruta-murales/3           las demás rutas (#ruta-<id>), igual
//   #pueblo/la-alberca        ficha de un pueblo de la provincia
//   #lista  #provincia        pestañas
//   #provincia/alba-de-tormes pueblo seleccionado en la pestaña Provincia
// Abrir una ficha añade una entrada al historial, así el botón «atrás» del móvil la cierra.

const WEB = 'https://alvarorzhz.github.io/mapa-charro/';
const TITULO = 'Mapa charro de Salamanca';
const HASH_PESTANA = { map: '', list: 'lista', prov: 'provincia' };
let aplicandoEnlace = false; // true mientras se aplica la dirección, para no reescribirla
let nombreFicha = '';

const hashActual = () => decodeURIComponent(location.hash.slice(1));
const esHashDeFicha = h =>
  h.startsWith('via/') ||
  h.startsWith('monumento/') ||
  /^rutas?($|\/|-)/.test(h) ||
  h == 'tiempo' ||
  h.startsWith('tiempo/') ||
  h.startsWith('pueblo/') ||
  todasLasZonas.some(z => z.id == h);

function hashDeVista() {
  if (pestana == 'prov' && puebloSeleccionado) return 'provincia/' + slug(puebloSeleccionado.n);
  return HASH_PESTANA[pestana] || '';
}

function escribirHash(h, nuevaEntrada) {
  if (aplicandoEnlace || h == hashActual()) return;
  const url = h ? '#' + h : location.pathname + location.search;
  try {
    if (nuevaEntrada) history.pushState({ charro: 1 }, '', url);
    else history.replaceState(history.state, '', url);
  } catch (e) {} // dentro de algunos visores el historial no se puede tocar
}

function ponerTitulo() {
  document.title = nombreFicha ? nombreFicha + ' · ' + TITULO : TITULO;
}

// Llamada al abrir una ficha (pick y pickRoad)
function enlaceFicha(h, nombre) {
  nombreFicha = nombre;
  ponerTitulo();
  escribirHash(h, !esHashDeFicha(hashActual()));
}

// Llamada al cambiar de pestaña o de pueblo seleccionado
function enlaceVista() {
  if ($('#sh').classList.contains('o')) return; // con una ficha abierta, manda la ficha
  escribirHash(hashDeVista(), false);
}

// Llamada al cerrar la ficha con la ×
function volverEnlace() {
  nombreFicha = '';
  ponerTitulo();
  if (history.state && history.state.charro && esHashDeFicha(hashActual())) history.back();
  else escribirHash(hashDeVista(), false);
}

// Lee la dirección y deja la app en ese estado (al cargar y con atrás/adelante)
function aplicarEnlace() {
  const [a, b] = hashActual().split('/');
  const fichaAbierta = $('#sh').classList.contains('o');
  aplicandoEnlace = true;
  try {
    if (a == 'pueblo' && b) {
      const m = PROVINCIA.m.find(m => slug(m.n) == b);
      if (m && PUEBLOS[m.n] && (puebloAbierto != m || !fichaAbierta)) abrirPueblo(m);
    } else if (a == 'rutas') {
      if (!fichaAbierta || rutaActiva) abrirRutas();
    } else if (a == 'ruta' || a.startsWith('ruta-')) {
      // Una ruta que no existe (enlace viejo o mal copiado) abre la lista de rutas
      const k = RUTAS.findIndex(r => hashRuta(r) == a),
        i = parseInt(b) - 1;
      if (k < 0) abrirRutas();
      else if (i >= 0 && i < RUTAS[k].paradas.length) {
        if (paradaActual != i || rutaElegida != k || !fichaAbierta) abrirParada(i, k);
      } else if (paradaActual >= 0 || rutaElegida != k || !fichaAbierta || !rutaActiva) abrirRuta(k);
    } else if (a == 'tiempo') {
      const n = parseInt(b),
        i = n >= 1 && n <= ETAPAS.length ? n - 1 : 0;
      if (etapaTiempo < 0 || !fichaAbierta) abrirTiempo(i);
      else if (etapaTiempo != i) pintarEtapa(i);
    } else if (a == 'monumento' && b) {
      if (buscarMonumento(b) && (monumentoAbierto != b || !fichaAbierta)) abrirMonumento(b);
    } else if (a == 'via' && b) {
      const t = Object.keys(INFO_VIAS).find(k => slug(k) == b);
      if (t) abrirFichaVia(t);
    } else if (a && todasLasZonas.some(z => z.id == a)) {
      if (zonaAbierta != a || !fichaAbierta) abrirFicha(a);
    } else {
      if (fichaAbierta) {
        cerrarFicha();
        nombreFicha = '';
      }
      const v = a == 'lista' ? 'list' : a == 'provincia' ? 'prov' : 'map';
      if (v != pestana) cambiarPestana(v);
      if (v == 'prov' && b) {
        const m = PROVINCIA.m.find(m => slug(m.n) == b);
        if (m && m != puebloSeleccionado) seleccionarPueblo(m, true);
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    aplicandoEnlace = false;
  }
  ponerTitulo();
}

addEventListener('popstate', aplicarEnlace);
addEventListener('hashchange', () => {
  if (!aplicandoEnlace) aplicarEnlace();
});

// Botón Compartir de la ficha: siempre comparte la dirección de la web pública. Una zona del mapa tiene
// su propia página (z/<id>.html, herramientas/tarjetas.js) para que al compartirla salga su tarjeta.
const urlParaCompartir = () => {
  const h = hashActual();
  return zonas.some(z => z.id == h) ? WEB + 'z/' + h + '.html' : WEB + location.hash;
};
async function compartir() {
  const url = urlParaCompartir();
  const datos = {
    title: document.title,
    text: nombreFicha ? nombreFicha + ', en el Mapa charro' : TITULO,
    url
  };
  try {
    if (navigator.share) {
      await navigator.share(datos);
      apuntarUso('cp'); // logro «Embajador»
      return;
    }
  } catch (e) {
    if (e && e.name == 'AbortError') return;
  }
  try {
    await navigator.clipboard.writeText(url);
    aviso('Enlace copiado', { tipo: 'exito' });
    apuntarUso('cp');
  } catch (e) {
    aviso(url);
  }
}
