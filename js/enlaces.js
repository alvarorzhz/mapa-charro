// Enlaces directos: cada ficha, pueblo y pestaña tiene su propia dirección
//   #tejares                  ficha de un barrio o pueblo del mapa (id de la zona)
//   #via/a-62                 ficha de una carretera o avenida
//   #lista  #provincia        pestañas
//   #provincia/alba-de-tormes pueblo seleccionado en la pestaña Provincia
// Abrir una ficha añade una entrada al historial, así el botón «atrás» del móvil la cierra.

const WEB = 'https://alvarorzhz.github.io/mapa-charro/';
const TITULO = 'Mapa charro de Salamanca';
const HASH_PESTANA = { map: '', list: 'lista', prov: 'provincia' };
let aplicandoEnlace = false; // true mientras se aplica la dirección, para no reescribirla
let nombreFicha = '';

const hashActual = () => decodeURIComponent(location.hash.slice(1));
const esHashDeFicha = h => h.startsWith('via/') || ALL.some(z => z.id == h);

function hashDeVista() {
  if (vw == 'prov' && psel) return 'provincia/' + slug(psel.n);
  return HASH_PESTANA[vw] || '';
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
    if (a == 'via' && b) {
      const t = Object.keys(RI).find(k => slug(k) == b);
      if (t) pickRoad(t);
    } else if (a && ALL.some(z => z.id == a)) {
      if (cur != a || !fichaAbierta) pick(a);
    } else {
      if (fichaAbierta) { cerrarFicha(); nombreFicha = ''; }
      const v = a == 'lista' ? 'list' : a == 'provincia' ? 'prov' : 'map';
      if (v != vw) setView(v);
      if (v == 'prov' && b) {
        const m = PRV.m.find(m => slug(m.n) == b);
        if (m && m != psel) selP(m, true);
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
addEventListener('hashchange', () => { if (!aplicandoEnlace) aplicarEnlace() });

// Botón Compartir de la ficha: siempre comparte la dirección de la web pública
async function compartir() {
  const url = WEB + location.hash;
  const datos = { title: document.title, text: nombreFicha ? nombreFicha + ', en el Mapa charro' : TITULO, url };
  try {
    if (navigator.share) { await navigator.share(datos); return; }
  } catch (e) {
    if (e && e.name == 'AbortError') return;
  }
  try { await navigator.clipboard.writeText(url); toast('Enlace copiado'); }
  catch (e) { toast(url); }
}
