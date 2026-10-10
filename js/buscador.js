// Buscador principal. Encuentra zonas, monumentos, pueblos (con ficha o no) y pedanías, restaurantes,
// carreteras y avenidas, la ruta a pie, las etapas de «Salamanca en el tiempo» y, si hace falta,
// palabras dentro de las curiosidades («rana» → Universidad).
// - Todas las palabras tienen que aparecer, en cualquier orden y sin importar tildes ni mayúsculas.
// - El nombre exacto, primero; después lo del mapa antes que el resto de la provincia, y dentro, lo que empieza
//   por lo buscado y lo que tiene una palabra que empieza así (ver «orden»); luego las curiosidades y al
//   final lo que solo lo lleva en medio de una palabra.
// - Con la caja vacía, las últimas búsquedas elegidas (en este navegador). Sin resultados, «¿Querías decir…?».
// - Flechas arriba y abajo para moverse por los resultados; Intro abre el primero.

const CLAVE_RECIENTES = 'charro-busquedas',
  MAX_RESULTADOS = 8,
  MAX_RECIENTES = 5;

// Cada candidato: { texto, sub, tipo, clave, peso, abrir }. tipo + clave sirven para volver a abrirlo desde «recientes».
let candidatosBusqueda = null;
function candidatos() {
  if (candidatosBusqueda) return candidatosBusqueda;
  const c = [],
    poner = (texto, sub, tipo, clave, peso, abrir, extra = '') =>
      c.push({ texto, sub, tipo, clave, peso, abrir, buscable: normalizar(texto + ' ' + extra) });
  todasLasZonas.forEach(z =>
    poner(
      z.n,
      NOMBRES_GRUPOS[z.g],
      'zona',
      z.id,
      0,
      () => abrirFicha(z.id),
      (z.l || '').replace('|', ' ') + ' ' + (z.otros || []).join(' ')
    )
  );
  MONUMENTOS.forEach(m =>
    poner(m.n, 'Monumento · ' + buscarZona(m.zona).n, 'monumento', m.id, 1, () => abrirMonumento(m.id))
  );
  poner(
    'Rutas',
    'Rutas · ' + (RUTAS.length + RUTAS_PROVINCIA.length) + ' rutas, a pie y por la provincia',
    'rutas',
    '',
    2,
    () => abrirRutas(),
    'paseo ruta'
  );
  RUTAS.forEach((r, k) => {
    poner(
      r.nombre,
      'Ruta a pie · ' + r.paradas.length + ' paradas',
      'ruta',
      r.id,
      2,
      () => abrirRuta(k),
      'ruta paseo'
    );
    // Los sitios propios de cada ruta (murales, bares…); los monumentos ya salen como monumentos
    r.paradas.forEach((p, i) => {
      if (typeof p == 'string') return;
      poner(
        p.n,
        r.nombre + ' · ' + p.dir,
        'parada',
        r.id + '|' + p.id,
        2,
        () => abrirParada(i, k),
        p.detalle || ''
      );
    });
  });
  // Rutas por la provincia y sus paradas
  RUTAS_PROVINCIA.forEach((r, k) => {
    poner(
      r.nombre,
      'Ruta en coche · ' + r.tema + ' · ' + r.paradas.length + ' paradas',
      'ruta',
      r.id,
      2,
      () => abrirRutaProvincia(k),
      'ruta coche provincia ' + r.tema
    );
    r.paradas.forEach((p, i) =>
      poner(
        p.n,
        r.nombre + ' · ' + p.municipio,
        'parada',
        r.id + '|' + p.id,
        2,
        () => abrirParadaProvincia(i, k),
        p.municipio
      )
    );
  });
  ETAPAS.forEach(([anio, nombre], i) =>
    poner(
      nombre,
      'Salamanca en el tiempo · ' + anio,
      'etapa',
      String(i),
      2,
      () => abrirTiempo(i),
      anio + ' historia'
    )
  );
  poner(
    'Salamanca en el tiempo',
    'Historia de la ciudad en siete etapas',
    'etapa',
    '0',
    2,
    () => abrirTiempo(0),
    'historia muralla'
  );
  Object.keys(PUEBLOS).forEach(n =>
    poner(n, 'Pueblo · ' + PROVINCIA.com[municipioPorNombre(n).c], 'pueblo', n, 3, () =>
      abrirPueblo(municipioPorNombre(n))
    )
  );
  // Los demás municipios y las pedanías, en la pestaña Provincia
  const enProvincia = m => () => {
    cambiarPestana('prov');
    seleccionarPueblo(m, true);
  };
  PROVINCIA.m
    .filter(m => !m.cap && !m.z && !PUEBLOS[m.n])
    .forEach(m => poner(m.n, 'Municipio · ' + PROVINCIA.com[m.c], 'municipio', m.n, 4, enProvincia(m)));
  pedanias.forEach(p => poner(p.n, 'Pedanía de ' + p.m.n, 'pedania', p.m.n + '|' + p.n, 5, enProvincia(p.m)));
  Object.entries(DONDE_COMER).forEach(([id, sitios]) =>
    sitios.forEach(s =>
      poner(s.n, 'Dónde comer · ' + buscarZona(id).n, 'comer', id + '|' + s.n, 5, () => abrirFicha(id))
    )
  );
  CULTURA.forEach(c =>
    poner(
      c.n,
      'Cultura · ' + categoriaCultura(c.cat)[1],
      'cultura',
      c.id,
      3,
      () => abrirElementoCultura(c.id),
      ['cultura tradicion', ...(c.municipios || []), ...(c.pedanias || []).map(x => x[1])].join(' ')
    )
  );
  Object.keys(INFO_VIAS).forEach(k =>
    poner(k, INFO_VIAS[k][0] + ' · ' + INFO_VIAS[k][1], 'via', k, 6, () => abrirFichaVia(k), INFO_VIAS[k][1])
  );
  return (candidatosBusqueda = c);
}

// Qué tal casa un candidato con las palabras buscadas: 0 empieza así, 1 una palabra empieza así, 2 está dentro; null, no casa
function encaje(cand, palabras, frase) {
  if (!palabras.every(p => cand.buscable.includes(p))) return null;
  if (cand.buscable.startsWith(frase)) return 0;
  return palabras.every(p => (' ' + cand.buscable).includes(' ' + p)) ? 1 : 2;
}

// Orden: el nombre exacto, primero; luego lo del mapa (zonas, monumentos, ruta, etapas, pueblos con
// ficha) antes que el resto de la provincia, restaurantes y vías; dentro de cada grupo, cómo encaja y el tipo
const orden = ([e, c], frase) =>
  (normalizar(c.texto) == frase ? -100 : 0) + (c.peso > 3 ? 10 : 0) + e * 3 + c.peso / 10;

// Palabras dentro de las curiosidades: [zona, fragmento]
function enCuriosidades(palabras) {
  const r = [];
  zonas.forEach(z =>
    [...z.cur, ...z.ly].forEach(t => {
      const n = normalizar(t);
      if (r.some(x => x[0] == z) || !palabras.every(p => n.includes(p))) return;
      const i = n.indexOf(palabras[0]),
        desde = Math.max(0, i - 30),
        hasta = Math.min(t.length, i + 60);
      r.push([z, (desde ? '…' : '') + t.slice(desde, hasta).trim() + (hasta < t.length ? '…' : '')]);
    })
  );
  return r;
}

// Distancia de edición (para «¿Querías decir…?»)
function distancia(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] == b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
function parecido(frase) {
  let mejor = null,
    dm = Infinity;
  candidatos()
    .filter(c => ['zona', 'monumento', 'pueblo', 'municipio', 'via'].includes(c.tipo))
    .forEach(c => {
      const n = normalizar(c.texto),
        d = Math.min(distancia(frase, n), distancia(frase, n.slice(0, frase.length)) + 1);
      if (d < dm) [mejor, dm] = [c, d];
    });
  return dm <= Math.max(2, Math.floor(frase.length / 4)) ? mejor : null;
}

// --- Búsquedas recientes (comodidad de este navegador) ---------------------------------
const leerRecientes = () => {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_RECIENTES)) || [];
  } catch (e) {
    return [];
  }
};
function recordarBusqueda(c) {
  const lista = [
    { tipo: c.tipo, clave: c.clave },
    ...leerRecientes().filter(r => r.tipo != c.tipo || r.clave != c.clave)
  ];
  try {
    localStorage.setItem(CLAVE_RECIENTES, JSON.stringify(lista.slice(0, MAX_RECIENTES)));
  } catch (e) {}
}
const candidatoGuardado = r => candidatos().find(c => c.tipo == r.tipo && c.clave == r.clave);

// --- Pintar los resultados -------------------------------------------------------------
// El texto con lo buscado resaltado
function resaltar(texto, palabras) {
  const n = normalizar(texto),
    trozos = [];
  let i = 0;
  while (i < texto.length) {
    const p = palabras.find(p => n.startsWith(p, i));
    if (p) {
      trozos.push(crear('mark', '', texto.slice(i, i + p.length)));
      i += p.length;
    } else {
      const sig = Math.min(...palabras.map(p => n.indexOf(p, i)).filter(x => x > i), texto.length);
      trozos.push(texto.slice(i, sig));
      i = sig;
    }
  }
  return trozos;
}

function botonResultado(c, palabras, sub = c.sub) {
  const b = crear(
    'button',
    'res',
    crear('span', '', ...resaltar(c.texto, palabras)),
    crear('small', '', sub)
  );
  b.onclick = () => {
    recordarBusqueda(c);
    c.abrir();
    $('#q').value = '';
    $('#sr').textContent = '';
    document.querySelector('.mw').scrollIntoView({ behavior: comoDesplazar(), block: 'start' });
  };
  return b;
}

// Lo que oye un lector de pantalla al escribir en el buscador (#srn, role=status)
const anunciarBusqueda = texto => ($('#srn').textContent = texto);
function buscar() {
  const frase = normalizar($('#q').value.trim()),
    caja = $('#sr');
  caja.textContent = '';
  if (!frase) {
    anunciarBusqueda('');
    return mostrarRecientes();
  }
  const palabras = frase.split(/\s+/).filter(Boolean),
    encontrados = candidatos()
      .map(c => [encaje(c, palabras, frase), c])
      .filter(([e]) => e !== null)
      .sort((a, b) => orden(a, frase) - orden(b, frase) || a[1].texto.localeCompare(b[1].texto, 'es')),
    // Primero lo que empieza por lo buscado o tiene una palabra que empieza así; luego las curiosidades
    // («rana» → Universidad); y al final lo que solo lo lleva dentro de una palabra (Fuente Serrana)
    buenos = encontrados.filter(([e]) => e < 2).map(([, c]) => c),
    dentro = encontrados.filter(([e]) => e == 2).map(([, c]) => c),
    mostrados = [];
  const poner = (c, sub) => {
    if (mostrados.length >= MAX_RESULTADOS || mostrados.includes(c)) return;
    mostrados.push(c);
    caja.appendChild(sub ? botonResultado(c, [], sub) : botonResultado(c, palabras));
  };
  buenos.forEach(c => poner(c));
  if (frase.length >= 3)
    enCuriosidades(palabras).forEach(([z, fragmento]) =>
      poner(
        candidatos().find(x => x.tipo == 'zona' && x.clave == z.id),
        'Curiosidad: ' + fragmento
      )
    );
  dentro.forEach(c => poner(c));
  if (caja.children.length)
    return anunciarBusqueda(
      mostrados.length + (mostrados.length == 1 ? ' resultado' : ' resultados') + '. Baja con las flechas.'
    );
  const sugerencia = parecido(frase);
  anunciarBusqueda(
    sugerencia ? 'Sin resultados. ¿Querías decir ' + sugerencia.texto + '?' : 'Sin resultados.'
  );
  if (!sugerencia) {
    caja.appendChild(
      crear('p', 'sinres', 'Sin resultados. Prueba con un barrio, un pueblo, un monumento o una calle.')
    );
    return;
  }
  caja.appendChild(crear('p', 'sinres', '¿Querías decir…?'));
  caja.appendChild(botonResultado(sugerencia, []));
}

function mostrarRecientes() {
  const caja = $('#sr'),
    recientes = leerRecientes().map(candidatoGuardado).filter(Boolean);
  caja.textContent = '';
  if (!recientes.length) return;
  caja.appendChild(crear('p', 'sinres', 'Búsquedas recientes'));
  recientes.forEach(c => caja.appendChild(botonResultado(c, [])));
}

$('#q').addEventListener('input', buscar);
// Al volver a la caja, los resultados de lo que haya escrito (o los recientes, si está vacía)
$('#q').addEventListener('focus', buscar);
// Al pulsar fuera del buscador, los resultados se recogen (lo escrito se queda)
document.addEventListener('pointerdown', e => {
  if (!e.target.closest('.qs')) $('#sr').textContent = '';
});
// Al salir del buscador (sin elegir nada), se recogen los recientes
$('#q').addEventListener('blur', () =>
  setTimeout(() => {
    if (!$('#q').value.trim() && !$('#sr').contains(document.activeElement)) $('#sr').textContent = '';
  }, 150)
);
// Teclado: Intro abre el primero; flechas para moverse entre la caja y los resultados
document.querySelector('.qs').addEventListener('keydown', e => {
  const botones = [...document.querySelectorAll('#sr button')],
    i = botones.indexOf(document.activeElement);
  if (e.key == 'Enter' && e.target == $('#q')) {
    if (botones[0]) botones[0].click();
  } else if (e.key == 'ArrowDown' && botones.length) {
    e.preventDefault();
    botones[Math.min(i + 1, botones.length - 1)].focus();
  } else if (e.key == 'ArrowUp' && botones.length) {
    e.preventDefault();
    (i <= 0 ? $('#q') : botones[i - 1]).focus();
  } else if (e.key == 'Escape' && (e.target == $('#q') || i >= 0)) {
    $('#sr').textContent = '';
    $('#q').focus();
  }
});
