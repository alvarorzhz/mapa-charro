// Logros. Cada logro es { id, n (nombre), d (descripción), c (llevas), m (meta), cat (categoría, para su
// medalla) }; está conseguido si c >= m. Los ids se usan para saber cuáles son nuevos: no cambiarlos.
// Además de los fijos, logrosGenerados() crea uno por cada época, ruta y comarca a partir de los datos:
// al añadir una ruta o una época, su logro aparece solo.
function calcularLogros() {
  return [...logrosFijos(), ...logrosGenerados()];
}
function logrosFijos() {
  const pisada = id => progreso.z[id] == 'v',
    vis = todasLasZonas.filter(z => pisada(z.id)).length,
    N = todasLasZonas.length,
    delGrupo = g => {
      const a = todasLasZonas.filter(z => z.g == g);
      return [a.filter(z => pisada(z.id)).length, a.length];
    },
    g = (id, n, d, grupo) => ({ id, n, d, cat: 'grupo', c: delGrupo(grupo)[0], m: delGrupo(grupo)[1] });
  const big = todasLasZonas.filter(z => z.t && z.g < 5),
    leg = todasLasZonas.filter(z => z.ly && z.ly.length),
    wish = todasLasZonas.filter(z => progreso.z[z.id] == 'w').length,
    sur = delGrupo(4)[0],
    nor = todasLasZonas.filter(z => z.g < 4 && pisada(z.id)).length;
  return [
    { id: 'p', cat: 'zonas', n: 'Primer vítor', d: 'Marca tu primer sitio como «He estado»', c: vis, m: 1 },
    { id: 'e', cat: 'zonas', n: 'Explorador', d: 'Pisa 10 zonas', c: vis, m: 10 },
    { id: 'h', cat: 'zonas', n: 'Medio mapa', d: 'Pisa la mitad de las zonas', c: vis, m: Math.ceil(N / 2) },
    { id: 't', cat: 'zonas', n: 'Charro de pura cepa', d: 'Pisa todas las zonas', c: vis, m: N },
    g('k0', 'Casco completo', 'Pisa todo el casco histórico', 0),
    g('k1', 'Norte completo', 'Pisa toda la zona norte', 1),
    g('k2', 'Este completo', 'Pisa toda la zona este', 2),
    g('k3', 'Oeste completo', 'Pisa toda la zona oeste', 3),
    g('k4', 'Sur completo', 'Pisa todo el sur, al otro lado del río', 4),
    g('k5', 'Vuelta al alfoz', 'Pisa los pueblos de alrededor', 5),
    {
      id: 'gr',
      cat: 'zonas',
      n: 'Los grandes',
      d: 'Pisa los grandes barrios (Garrido, Pizarrales, Prosperidad…)',
      c: big.filter(z => pisada(z.id)).length,
      m: big.length
    },
    {
      id: 'ly',
      cat: 'leyendas',
      n: 'Cazador de leyendas',
      d: 'Pisa todas las zonas que tienen leyenda',
      c: leg.filter(z => pisada(z.id)).length,
      m: leg.length
    },
    {
      id: 'rv',
      cat: 'rio',
      n: 'Cruzar el Tormes',
      d: 'Pisa 3 barrios del sur y 3 del norte',
      c: Math.min(sur, 3) + Math.min(nor, 3),
      m: 6
    },
    { id: 'wi', cat: 'deseo', n: 'Soñador', d: 'Apunta 5 sitios como «Quiero ir»', c: wish, m: 5 },
    {
      id: 'fr',
      cat: 'rana',
      n: 'Rana a la vista',
      d: 'Encuentra la rana escondida en el mapa',
      c: progreso.f ? 1 : 0,
      m: 1
    },
    {
      id: 'g1',
      cat: 'gps',
      n: 'Aquí mismo',
      d: 'Marca un sitio estando en él, con el botón Estoy aquí',
      c: (progreso.gv || []).length,
      m: 1
    },
    {
      id: 'g5',
      cat: 'gps',
      n: 'Con las botas puestas',
      d: 'Marca 5 sitios estando en ellos',
      c: (progreso.gv || []).length,
      m: 5
    },
    {
      id: 'p1',
      cat: 'provincia',
      n: 'Saliendo del alfoz',
      d: 'Pisa tu primer pueblo de la provincia (pestaña Provincia)',
      c: pueblos.filter(m => !m.z && estadoMunicipio(m) == 'v').length,
      m: 1
    },
    {
      id: 'p25',
      cat: 'provincia',
      n: 'Trotapueblos',
      d: 'Pisa 25 pueblos de la provincia',
      c: pueblos.filter(m => estadoMunicipio(m) == 'v').length,
      m: 25
    },
    {
      id: 'p100',
      cat: 'provincia',
      n: 'Charro de mapa entero',
      d: 'Pisa 100 pueblos de la provincia',
      c: pueblos.filter(m => estadoMunicipio(m) == 'v').length,
      m: 100
    },
    {
      id: 'pc',
      cat: 'comarca',
      n: 'Comarca completa',
      d: 'Pisa todos los pueblos de una comarca',
      c: Math.max(
        ...PROVINCIA.com.map((_, ci) => {
          const a = pueblos.filter(m => m.c == ci);
          return a.filter(m => estadoMunicipio(m) == 'v').length / a.length;
        })
      ),
      m: 1
    }
  ];
}
// --- Logros que salen de los datos -----------------------------------------------------
// Visitas: monumentos (por su id) y paradas propias de las rutas (por ruta), en progreso.j
const monumentosVisitados = () => (progreso.j && progreso.j.mo) || [];
const paradasVisitadas = idRuta => ((progreso.j && progreso.j.r) || {})[idRuta] || [];
const paradaVisitada = (ruta, p) =>
  typeof p == 'string' ? monumentosVisitados().includes(p) : paradasVisitadas(ruta.id).includes(p.id);

// Días seguidos con el reto del día hecho, hasta hoy (o hasta ayer, si hoy aún no se ha jugado)
function rachaReto() {
  const dias = new Set((progreso.j && progreso.j.h) || []),
    d = new Date();
  const texto = f =>
    f.getFullYear() +
    '-' +
    String(f.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(f.getDate()).padStart(2, '0');
  if (!dias.has(texto(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (dias.has(texto(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

function logrosGenerados() {
  const pisada = id => progreso.z[id] == 'v',
    lista = [];
  // Una por época de «Salamanca en el tiempo»: pisar las zonas que nacen en ella
  ETAPAS.forEach(([anio, nombre], i) => {
    const nacen = zonas.filter(z => EPOCA_ZONA[z.id] && EPOCA_ZONA[z.id][0] == i);
    if (nacen.length >= 2)
      lista.push({
        id: 'ep' + i,
        cat: 'epoca',
        n: nombre,
        d: 'Pisa las zonas que nacen en ' + anio,
        c: nacen.filter(z => pisada(z.id)).length,
        m: nacen.length
      });
  });
  // Una por ruta a pie: pasar por todas sus paradas
  RUTAS.forEach(r =>
    lista.push({
      id: 'ru-' + r.id,
      cat: 'ruta',
      n: r.nombre,
      d: 'Pasa por todas sus paradas (pulsa «He estado aquí» en cada una)',
      c: r.paradas.filter(p => paradaVisitada(r, p)).length,
      m: r.paradas.length
    })
  );
  // Monumentos
  lista.push(
    {
      id: 'mo5',
      cat: 'monumento',
      n: 'Turista de primera',
      d: 'Visita 5 monumentos',
      c: monumentosVisitados().length,
      m: 5
    },
    {
      id: 'mot',
      cat: 'monumento',
      n: 'Guía de la ciudad',
      d: 'Visita todos los monumentos del mapa',
      c: monumentosVisitados().length,
      m: MONUMENTOS.length
    }
  );
  // Reto del día
  const j = progreso.j || {};
  lista.push(
    {
      id: 'jr3',
      cat: 'reto',
      n: 'Tres en raya',
      d: 'Haz el reto del día 3 días seguidos',
      c: rachaReto(),
      m: 3
    },
    {
      id: 'jr7',
      cat: 'reto',
      n: 'Semana charra',
      d: 'Haz el reto del día 7 días seguidos',
      c: rachaReto(),
      m: 7
    },
    {
      id: 'j8',
      cat: 'reto',
      n: 'Buen ojo',
      d: 'Saca 800 puntos o más en una partida',
      c: j.m >= 800 ? 1 : 0,
      m: 1
    },
    { id: 'j10', cat: 'reto', n: 'Pleno', d: 'Acierta las 10 pistas de una partida', c: j.pf ? 1 : 0, m: 1 }
  );
  // Una por comarca de la provincia: pisar todos sus pueblos
  PROVINCIA.com.forEach((nombre, ci) => {
    const a = pueblos.filter(m => m.c == ci);
    if (a.length)
      lista.push({
        id: 'co' + ci,
        cat: 'comarca',
        n: nombre,
        d: 'Pisa sus ' + a.length + ' pueblos',
        c: a.filter(m => estadoMunicipio(m) == 'v').length,
        m: a.length
      });
  });
  return lista;
}

// --- Visitar un monumento o una parada propia de una ruta ---------------------------------
// visitaAbierta: lo que muestra la ficha ahora, si se puede marcar como visitado
//   { tipo: 'mo', id, n } o { tipo: 'ru', ruta, id, n }
let visitaAbierta = null;
const estaVisitada = v =>
  v.tipo == 'mo' ? monumentosVisitados().includes(v.id) : paradasVisitadas(v.ruta).includes(v.id);
function ponerVisita(v, si) {
  const j = (progreso.j = progreso.j || {});
  if (v.tipo == 'mo') {
    const mo = new Set(j.mo || []);
    si ? mo.add(v.id) : mo.delete(v.id);
    j.mo = [...mo];
  } else {
    j.r = j.r || {};
    const r = new Set(j.r[v.ruta] || []);
    si ? r.add(v.id) : r.delete(v.id);
    j.r[v.ruta] = [...r];
  }
  guardar();
  actualizar();
  pintarBotonesFicha();
}
function marcarVisita(v = visitaAbierta) {
  if (!v) return;
  conAvisoDeLogros(() => {
    if (estaVisitada(v)) {
      ponerVisita(v, false);
      aviso(v.n + ': quitado de «He estado aquí»', {
        accion: [
          'Deshacer',
          () => {
            ponerVisita(v, true);
            aviso('Recuperado: ' + v.n, { tipo: 'exito' });
          }
        ]
      });
    } else {
      ponerVisita(v, true);
      aviso('¡Vítor! ' + v.n + (progresoDeLogro(v) ? ' · ' + progresoDeLogro(v) : ''), { tipo: 'exito' });
    }
  });
}
// «3 de 9 en Ruta monumental»: cómo va el logro al que suma una visita
function progresoDeLogro(v) {
  const id = v.tipo == 'ru' ? 'ru-' + v.ruta : rutaActiva ? 'ru-' + rutaActual().id : 'mot',
    a = calcularLogros().find(x => x.id == id);
  return a && a.c < a.m ? a.c + ' de ' + a.m + ' en «' + a.n + '»' : '';
}

// --- Pintar: el siguiente logro, a la vista, y la lista con medallas -----------------------
const MEDALLAS = {
  zonas: '📍',
  grupo: '🧭',
  leyendas: '📜',
  rio: '🌉',
  deseo: '⭐',
  rana: '🐸',
  gps: '🥾',
  provincia: '🗺️',
  comarca: '🌾',
  epoca: '🏰',
  ruta: '🚶',
  monumento: '🏛️',
  reto: '🎯'
};
const conseguido = a => a.c >= a.m;
// El siguiente: el empezado al que menos le falta (en proporción); si no hay, el primero sin empezar
function siguienteLogro(logros) {
  const pendientes = logros.filter(a => !conseguido(a));
  return (
    pendientes.filter(a => a.c > 0).sort((a, b) => b.c / b.m - a.c / a.m || a.m - a.c - (b.m - b.c))[0] ||
    pendientes[0]
  );
}
const barra = fraccion => {
  const i = crear('i');
  i.style.width = Math.round(Math.min(1, fraccion) * 100) + '%';
  return crear('span', 'pb', i);
};

// Logro al que suma una zona al marcarla («5 de 7 en Norte completo»): el de su grupo
function progresoDeZona(z) {
  const a = calcularLogros().find(x => x.id == 'k' + z.g);
  return a && a.c < a.m ? a.c + ' de ' + a.m + ' en «' + a.n + '»' : '';
}

function pintarLogros() {
  const logros = calcularLogros(),
    caja = $('#lga'),
    hechos = logros.filter(conseguido).length;
  // Resumen plegado: cuántos, con su barra
  const resumen = $('#lgs');
  resumen.textContent = '';
  resumen.append('Logros (' + hechos + '/' + logros.length + ')', barra(hechos / logros.length));
  // El siguiente, siempre a la vista bajo el marcador; al pulsarlo se abre la lista
  const sig = siguienteLogro(logros),
    linea = $('#sig');
  linea.textContent = '';
  linea.hidden = !sig;
  if (sig) {
    linea.append(
      crear('span', 'medalla', MEDALLAS[sig.cat] || '🏆'),
      crear(
        'span',
        'texto',
        crear('b', '', 'Siguiente logro: ' + sig.n),
        crear('small', '', sig.d + ' · ' + Math.min(sig.c, sig.m) + ' de ' + sig.m)
      ),
      barra(sig.c / sig.m)
    );
    linea.onclick = () => {
      $('#lgr').open = true;
      $('#lgr').scrollIntoView({ behavior: comoDesplazar(), block: 'start' });
    };
  }
  // Lista: primero los empezados (los más cerca, arriba), luego los que faltan y al final los conseguidos
  const orden = a => (conseguido(a) ? 2 : a.c > 0 ? 0 : 1);
  caja.textContent = '';
  [...logros]
    .sort((a, b) => orden(a) - orden(b) || b.c / b.m - a.c / a.m)
    .forEach(a => {
      const hecho = conseguido(a),
        cuenta = Math.min(a.c, a.m);
      caja.appendChild(
        crear(
          'div',
          'ac' + (hecho ? ' ok' : ''),
          crear('span', 'medalla', MEDALLAS[a.cat] || '🏆'),
          crear(
            'div',
            'texto',
            crear('b', '', a.n),
            crear('small', '', a.d + ' · ' + (hecho ? 'conseguido' : cuenta + ' de ' + a.m))
          ),
          barra(cuenta / a.m)
        )
      );
    });
}

// Ejecuta «cambio» y, si con él se consigue algún logro nuevo, lo anuncia después del aviso del cambio
function conAvisoDeLogros(cambio) {
  const antes = new Set(
    calcularLogros()
      .filter(a => a.c >= a.m)
      .map(a => a.id)
  );
  cambio();
  const nuevos = calcularLogros().filter(a => a.c >= a.m && !antes.has(a.id));
  if (nuevos.length) setTimeout(() => aviso('🏆 Logro: ' + nuevos[0].n, { tipo: 'logro' }), 1900);
}

// La rana escondida en una esquina del mapa
$('#fr').onclick = () => {
  const primeraVez = !progreso.f;
  progreso.f = 1;
  guardar();
  actualizar();
  aviso('¡Has encontrado la rana!', { tipo: 'logro' });
  if (primeraVez) setTimeout(() => aviso('🏆 Logro: Rana a la vista', { tipo: 'logro' }), 1900);
};
