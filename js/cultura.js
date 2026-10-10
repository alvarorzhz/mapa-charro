// Cultura y tradiciones (datos en js/datos/cultura.js): la lista con búsqueda y filtros (#cultura), la ficha
// de cada elemento (#cultura/<id>) con su mapa de la provincia, y los enlaces desde el resto de la app:
// fichas de zona, pueblo y monumento, la selección y las comarcas de la pestaña Provincia, y el buscador.
// En los mapas solo se marcan términos municipales reales (nunca un punto inventado): si una tradición es de
// varios pueblos, se marcan todos; si es de una pedanía, el término al que pertenece.

const elementoCultura = id => CULTURA.find(c => c.id == id);
const categoriaCultura = clave => CATEGORIAS_CULTURA.find(c => c[0] == clave) || ['', clave, '🎭'];

// Municipios (objetos de PROVINCIA.m) de un elemento, con las pedanías que lo llevan a ellos
function lugaresCultura(c) {
  const lugares = new Map();
  (c.municipios || []).forEach(n => {
    const m = PROVINCIA.m.find(x => x.n == n);
    if (m) lugares.set(m, lugares.get(m) || []);
  });
  (c.pedanias || []).forEach(([n, p]) => {
    const m = PROVINCIA.m.find(x => x.n == n);
    if (m) lugares.set(m, [...(lugares.get(m) || []), p]);
  });
  return lugares; // Map(municipio -> [pedanías])
}
const culturaDeMunicipio = m => CULTURA.filter(c => lugaresCultura(c).has(m));
const culturaDeComarca = ci =>
  CULTURA.filter(
    c => (c.comarcas || []).includes(PROVINCIA.com[ci]) || [...lugaresCultura(c).keys()].some(m => m.c == ci)
  );
// En una zona del mapa: lo relacionado con ella, y si es un pueblo de alrededor, lo de su municipio
function culturaDeZona(z) {
  const municipio = PROVINCIA.m.find(m => m.z == z.id);
  return CULTURA.filter(
    c =>
      ((c.relacionados || {}).zonas || []).includes(z.id) || (municipio && lugaresCultura(c).has(municipio))
  );
}
const culturaDeMonumento = id => CULTURA.filter(c => ((c.relacionados || {}).monumentos || []).includes(id));
// ¿Es de la capital, de la provincia o de las dos?
const esDeCapital = c =>
  (c.municipios || []).includes('Salamanca') || !!((c.relacionados || {}).zonas || []).length;
const esDeProvincia = c =>
  (c.municipios || []).some(n => n != 'Salamanca') ||
  !!(c.pedanias || []).length ||
  !!(c.comarcas || []).length;

// --- En las fichas de zona, pueblo y monumento: «Cultura y tradiciones» con sus botones ---------------
function pintarCulturaEnFicha(lista) {
  const caja = $('#culf');
  caja.textContent = '';
  fichaConCultura = !!lista.length;
  if (!lista.length) return;
  caja.append('Cultura y tradiciones: ');
  lista.forEach(c => {
    const b = crear('button', '', categoriaCultura(c.cat)[2] + ' ' + c.n);
    b.onclick = () => abrirElementoCultura(c.id);
    caja.appendChild(b);
  });
}

// --- Mapa de la provincia con los términos marcados ----------------------------------------------------
function mapaCultura(c) {
  const lugares = lugaresCultura(c),
    linea = P =>
      'M' +
      P.map(q =>
        aLienzoProvincia(q)
          .map(v => v.toFixed(1))
          .join(' ')
      ).join('L'),
    puntos = PROVINCIA.co.flatMap(rs => rs.flatMap(r => decodificarLinde(r))).map(aLienzoProvincia),
    xs = puntos.map(p => p[0]),
    ys = puntos.map(p => p[1]),
    x0 = Math.min(...xs) - 2,
    y0 = Math.min(...ys) - 2,
    w = Math.max(...xs) - x0 + 2,
    h = Math.max(...ys) - y0 + 2,
    nombres = [...lugares.keys()].map(m => m.n);
  const sv = crearSvg('svg', {
    class: 'mapa-cultura',
    viewBox: [x0, y0, w, h].map(v => v.toFixed(1)).join(' '),
    role: 'img',
    'aria-label':
      'Mapa de la provincia con ' +
      (nombres.length == 1 ? 'el término de ' : 'los términos de ') +
      nombres.join(', ') +
      ((c.comarcas || []).length ? ' y la comarca ' + c.comarcas.join(', ') : '')
  });
  // Comarcas de fondo; las de la tradición, algo marcadas
  PROVINCIA.co.forEach((rs, ci) =>
    crearSvg(
      'path',
      {
        d: rs.map(decodificarLinde).map(linea).join('') + 'Z',
        class: 'cul-co' + ((c.comarcas || []).includes(PROVINCIA.com[ci]) ? ' sel' : ''),
        'vector-effect': 'non-scaling-stroke'
      },
      sv
    )
  );
  lugares.forEach((pedanias, m) => {
    const p = crearSvg(
      'path',
      {
        d: m.R.map(linea).join('') + 'Z',
        class: 'cul-m' + (pedanias.length && !(c.municipios || []).includes(m.n) ? ' ped' : ''),
        'vector-effect': 'non-scaling-stroke'
      },
      sv
    );
    crearSvg('title', {}, p).textContent = m.n + (pedanias.length ? ' (' + pedanias.join(', ') + ')' : '');
    p.onclick = () => irAMunicipio(m);
  });
  return sv;
}

// Ir a un municipio desde una ficha cultural: su ficha si la tiene; la capital, al mapa; si no, la provincia
function irAMunicipio(m) {
  if (PUEBLOS[m.n] && !m.cap) return abrirPueblo(m);
  if (m.z) return abrirFicha(m.z);
  cerrarFicha();
  if (m.cap) {
    if (pestana != 'map') cambiarPestana('map');
    document.querySelector('.mw').scrollIntoView({ behavior: comoDesplazar(), block: 'start' });
    return;
  }
  cambiarPestana('prov');
  seleccionarPueblo(m, true);
}
function irAComarca(nombre) {
  cerrarFicha();
  cambiarPestana('prov');
  const comarca = vistaProvincia.comarcas.find(c => c.nombre == nombre);
  if (!comarca) return;
  comarca.det.open = true;
  comarca.det.scrollIntoView({ behavior: comoDesplazar(), block: 'start' });
}

// --- Ficha de un elemento ---------------------------------------------------------------------------
const textoFechaRevision = f =>
  new Date(f + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

function abrirElementoCultura(id) {
  const c = elementoCultura(id);
  if (!c) return abrirCultura();
  activarRuta(false);
  const [, nombreCat, icono] = categoriaCultura(c.cat),
    caja = fichaLimpia(icono + ' ' + nombreCat, c.n);
  if (c.foto)
    pintarFotoDe([
      c.foto.src,
      c.foto.pie + '. Foto: ' + c.foto.autor + ' · ' + c.foto.licencia + ' · Wikimedia Commons'
    ]);

  const volver = crear('button', 'volver-hoy', '← Cultura y tradiciones');
  volver.onclick = () => abrirCultura();
  caja.appendChild(volver);
  caja.appendChild(crear('p', 'hab', c.resumen));
  if (c.cuando) caja.appendChild(crear('p', 'cul-cuando', crear('b', '', '📅 Cuándo: '), c.cuando));

  // Dónde: botones a cada municipio, pedanía y comarca, y el mapa con sus términos
  const lugares = lugaresCultura(c),
    donde = crear('div', 'nb cul-donde', '📍 Dónde: ');
  lugares.forEach((pedanias, m) => {
    if ((c.municipios || []).includes(m.n)) {
      const b = crear('button', '', m.cap ? 'Salamanca (capital)' : m.n);
      b.onclick = () => irAMunicipio(m);
      donde.appendChild(b);
    }
    pedanias.forEach(p => {
      const b = crear('button', '', p + ' (pedanía de ' + m.n + ')');
      b.onclick = () => irAMunicipio(m);
      donde.appendChild(b);
    });
  });
  (c.comarcas || []).forEach(n => {
    const b = crear('button', '', 'Comarca: ' + n);
    b.onclick = () => irAComarca(n);
    donde.appendChild(b);
  });
  // Con muchos municipios, la lista va plegada y el mapa delante
  if (lugares.size > 6) {
    donde.firstChild.remove();
    const plegada = crear(
      'details',
      'cul-muchos',
      crear('summary', '', '📍 Dónde: ' + lugares.size + ' municipios (ver la lista)'),
      donde
    );
    caja.append(mapaCultura(c), plegada);
  } else caja.append(donde, mapaCultura(c));
  if (lugares.size > 1)
    caja.appendChild(
      crear(
        'p',
        'mu cul-nota',
        'Se marcan los términos municipales enteros: no hay un único punto en el mapa.'
      )
    );

  // Los textos, cada uno con su tipo (documentado, tradición, divulgativo)
  const textos = crear('div', 'cul-textos');
  c.textos.forEach(([tipo, texto]) =>
    textos.appendChild(
      crear('p', 'cul-t ' + tipo, crear('span', 'cul-tipo', TIPOS_TEXTO_CULTURA[tipo]), texto)
    )
  );
  caja.appendChild(textos);

  // Relacionado: zonas, monumentos y otros elementos
  const rel = c.relacionados || {},
    relacion = crear('div', 'nb', 'Relacionado: ');
  (rel.zonas || []).forEach(id => {
    const b = crear('button', '', buscarZona(id).n);
    b.onclick = () => abrirFicha(id);
    relacion.appendChild(b);
  });
  (rel.monumentos || []).forEach(id => {
    const b = crear('button', 'conico', iconoMonumento(buscarMonumento(id).tipo, 18), buscarMonumento(id).n);
    b.onclick = () => abrirMonumento(id);
    relacion.appendChild(b);
  });
  (rel.cultura || []).forEach(id => {
    const o = elementoCultura(id),
      b = crear('button', '', categoriaCultura(o.cat)[2] + ' ' + o.n);
    b.onclick = () => abrirElementoCultura(id);
    relacion.appendChild(b);
  });
  if (relacion.children.length) caja.appendChild(relacion);

  // Fuentes, foto y fecha de revisión
  const ap = $('#ap');
  ap.textContent = 'Fuentes: ';
  c.fuentes.forEach(([medio, url], i) => {
    const a = crear('a', '', medio);
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    ap.append(i ? ', ' : '', a);
  });
  if (c.foto) {
    const a = crear('a', '', c.foto.autor + ', ' + c.foto.licencia);
    a.href = c.foto.url;
    a.target = '_blank';
    a.rel = 'noopener';
    ap.append('. Foto: ', a);
  }
  ap.append('. Revisado el ' + textoFechaRevision(c.revisado) + '.');
  mostrarFicha();
  enlaceFicha('cultura/' + c.id, c.n);
}

// --- La lista: búsqueda y filtros por categoría y territorio ------------------------------------------
let filtroCulturaCat = 'todas';
let filtroCulturaTerritorio = 'todo'; // 'todo' | 'capital' | 'provincia' | 'c<índice de comarca>'
let busquedaCultura = '';
const sinTildes = t => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

function cumpleFiltrosCultura(c) {
  if (filtroCulturaCat != 'todas' && c.cat != filtroCulturaCat) return false;
  const t = filtroCulturaTerritorio;
  if (t == 'capital' && !esDeCapital(c)) return false;
  if (t == 'provincia' && !esDeProvincia(c)) return false;
  if (t[0] == 'c' && t != 'capital' && !culturaDeComarca(+t.slice(1)).includes(c)) return false;
  if (busquedaCultura) {
    const texto = sinTildes(
      [
        c.n,
        c.resumen,
        c.cuando || '',
        ...(c.municipios || []),
        ...(c.pedanias || []).flat(),
        ...c.textos.map(x => x[1])
      ].join(' ')
    );
    if (
      !sinTildes(busquedaCultura)
        .split(/\s+/)
        .every(p => texto.includes(p))
    )
      return false;
  }
  return true;
}

function pintarListaCultura(caja) {
  caja.textContent = '';
  const visibles = CULTURA.filter(cumpleFiltrosCultura);
  if (!visibles.length) {
    caja.appendChild(crear('p', 'mu', 'Nada con esos filtros. Prueba con otra categoría u otro territorio.'));
    return;
  }
  CATEGORIAS_CULTURA.forEach(([clave, nombre, icono]) => {
    const deEsta = visibles.filter(c => c.cat == clave);
    if (!deEsta.length) return;
    caja.appendChild(crear('h3', '', icono + ' ' + nombre));
    const lista = crear('div', 'lista-explora');
    deEsta.forEach(c => {
      const lugares = [...lugaresCultura(c).keys()].map(m => (m.cap ? 'Salamanca' : m.n)),
        donde = lugares.length > 3 ? lugares.length + ' municipios' : lugares.join(', ');
      const b = crear(
        'button',
        'fila-explora',
        crear(
          'span',
          'texto',
          crear('b', '', c.n),
          crear('small', '', [donde, c.cuando ? c.cuando.split(/[;.]/)[0] : ''].filter(Boolean).join(' · '))
        )
      );
      b.onclick = () => abrirElementoCultura(c.id);
      lista.appendChild(b);
    });
    caja.appendChild(lista);
  });
  $('#culn').textContent = visibles.length == CULTURA.length ? '' : visibles.length + ' de ' + CULTURA.length;
}

function abrirCultura() {
  activarRuta(false);
  const caja = fichaLimpia(
    CULTURA.length + ' fiestas, tradiciones, sabores y personajes',
    'Cultura y tradiciones'
  );
  caja.appendChild(
    crear(
      'p',
      'hab',
      'De la capital y de la provincia, cada uno con su sitio en el mapa y sus fuentes. Distinguimos lo documentado de lo que cuenta la tradición.'
    )
  );
  // Búsqueda
  const buscar = crear('input');
  buscar.type = 'search';
  buscar.id = 'cq';
  buscar.placeholder = 'Buscar: hornazo, toros, agosto, Béjar…';
  buscar.setAttribute('aria-label', 'Buscar en cultura y tradiciones');
  buscar.value = busquedaCultura;
  caja.appendChild(buscar);
  // Categorías (solo las que tienen contenido)
  const cats = crear('div', 'fl');
  cats.setAttribute('role', 'group');
  cats.setAttribute('aria-label', 'Categoría');
  [['todas', 'Todas', ''], ...CATEGORIAS_CULTURA.filter(([k]) => CULTURA.some(c => c.cat == k))].forEach(
    ([clave, nombre, icono]) => {
      const b = crear('button', '', (icono ? icono + ' ' : '') + nombre);
      marcarInterruptor(b, clave == filtroCulturaCat);
      b.onclick = () => {
        filtroCulturaCat = clave;
        cats.querySelectorAll('button').forEach(x => marcarInterruptor(x, x == b));
        pintarListaCultura(lista);
      };
      cats.appendChild(b);
    }
  );
  caja.appendChild(cats);
  // Territorio: capital, provincia o una comarca
  const territorio = crear('select');
  territorio.id = 'cterr';
  territorio.setAttribute('aria-label', 'Territorio');
  [
    ['todo', 'Toda la provincia y la capital'],
    ['capital', 'Salamanca capital'],
    ['provincia', 'La provincia'],
    ...PROVINCIA.com
      .map((n, ci) => ['c' + ci, '· ' + n])
      .filter(([k]) => culturaDeComarca(+k.slice(1)).length)
  ].forEach(([v, t]) => {
    const o = crear('option', '', t);
    o.value = v;
    territorio.appendChild(o);
  });
  territorio.value = filtroCulturaTerritorio;
  territorio.onchange = () => {
    filtroCulturaTerritorio = territorio.value;
    pintarListaCultura(lista);
  };
  caja.appendChild(crear('label', 'cul-terr', 'Territorio ', territorio));
  const cuenta = crear('p', 'mu');
  cuenta.id = 'culn';
  cuenta.setAttribute('role', 'status');
  caja.appendChild(cuenta);
  const lista = crear('div', 'cul-lista');
  caja.appendChild(lista);
  buscar.addEventListener('input', () => {
    busquedaCultura = buscar.value.trim();
    pintarListaCultura(lista);
  });
  pintarListaCultura(lista);
  $('#ap').textContent =
    'Cada ficha lleva sus fuentes y la fecha de su última revisión. Solo hay categorías con contenido comprobado.';
  mostrarFicha();
  enlaceFicha('cultura', 'Cultura y tradiciones');
}

// --- En la pestaña Provincia: marcar en el mapa los pueblos con tradiciones ---------------------------
function marcarPueblosConCultura(si) {
  if (!vistaProvincia) return;
  vistaProvincia.caminos.forEach((p, m) => p.classList.toggle('cul', si && culturaDeMunicipio(m).length > 0));
}

$('#cult').onclick = abrirCultura;
