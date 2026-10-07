// Logros. Cada logro es { id, n (nombre), d (descripción), c (llevas), m (meta) }; está conseguido si c >= m.
// Los ids se usan para saber cuáles son nuevos: no cambiarlos.
function calcularLogros() {
  const pisada = id => progreso.z[id] == 'v',
    vis = todasLasZonas.filter(z => pisada(z.id)).length,
    N = todasLasZonas.length,
    delGrupo = g => {
      const a = todasLasZonas.filter(z => z.g == g);
      return [a.filter(z => pisada(z.id)).length, a.length];
    },
    g = (id, n, d, grupo) => ({ id, n, d, c: delGrupo(grupo)[0], m: delGrupo(grupo)[1] });
  const big = todasLasZonas.filter(z => z.t && z.g < 5),
    leg = todasLasZonas.filter(z => z.ly && z.ly.length),
    wish = todasLasZonas.filter(z => progreso.z[z.id] == 'w').length,
    sur = delGrupo(4)[0],
    nor = todasLasZonas.filter(z => z.g < 4 && pisada(z.id)).length;
  return [
    { id: 'p', n: 'Primer vítor', d: 'Marca tu primer sitio como «He estado»', c: vis, m: 1 },
    { id: 'e', n: 'Explorador', d: 'Pisa 10 zonas', c: vis, m: 10 },
    { id: 'h', n: 'Medio mapa', d: 'Pisa la mitad de las zonas', c: vis, m: Math.ceil(N / 2) },
    { id: 't', n: 'Charro de pura cepa', d: 'Pisa todas las zonas', c: vis, m: N },
    g('k0', 'Casco completo', 'Pisa todo el casco histórico', 0),
    g('k1', 'Norte completo', 'Pisa toda la zona norte', 1),
    g('k2', 'Este completo', 'Pisa toda la zona este', 2),
    g('k3', 'Oeste completo', 'Pisa toda la zona oeste', 3),
    g('k4', 'Sur completo', 'Pisa todo el sur, al otro lado del río', 4),
    g('k5', 'Vuelta al alfoz', 'Pisa los pueblos de alrededor', 5),
    {
      id: 'gr',
      n: 'Los grandes',
      d: 'Pisa los grandes barrios (Garrido, Pizarrales, Prosperidad…)',
      c: big.filter(z => pisada(z.id)).length,
      m: big.length
    },
    {
      id: 'ly',
      n: 'Cazador de leyendas',
      d: 'Pisa todas las zonas que tienen leyenda',
      c: leg.filter(z => pisada(z.id)).length,
      m: leg.length
    },
    {
      id: 'rv',
      n: 'Cruzar el Tormes',
      d: 'Pisa 3 barrios del sur y 3 del norte',
      c: Math.min(sur, 3) + Math.min(nor, 3),
      m: 6
    },
    { id: 'wi', n: 'Soñador', d: 'Apunta 5 sitios como «Quiero ir»', c: wish, m: 5 },
    {
      id: 'fr',
      n: 'Rana a la vista',
      d: 'Encuentra la rana escondida en el mapa',
      c: progreso.f ? 1 : 0,
      m: 1
    },
    {
      id: 'g1',
      n: 'Aquí mismo',
      d: 'Marca un sitio estando en él, con el botón Estoy aquí',
      c: (progreso.gv || []).length,
      m: 1
    },
    {
      id: 'g5',
      n: 'Con las botas puestas',
      d: 'Marca 5 sitios estando en ellos',
      c: (progreso.gv || []).length,
      m: 5
    },
    {
      id: 'p1',
      n: 'Saliendo del alfoz',
      d: 'Pisa tu primer pueblo de la provincia (pestaña Provincia)',
      c: pueblos.filter(m => !m.z && estadoMunicipio(m) == 'v').length,
      m: 1
    },
    {
      id: 'p25',
      n: 'Trotapueblos',
      d: 'Pisa 25 pueblos de la provincia',
      c: pueblos.filter(m => estadoMunicipio(m) == 'v').length,
      m: 25
    },
    {
      id: 'p100',
      n: 'Charro de mapa entero',
      d: 'Pisa 100 pueblos de la provincia',
      c: pueblos.filter(m => estadoMunicipio(m) == 'v').length,
      m: 100
    },
    {
      id: 'pc',
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
function pintarLogros() {
  const logros = calcularLogros(),
    caja = $('#lga'),
    conseguidos = logros.filter(a => a.c >= a.m).length;
  caja.textContent = '';
  $('#lgs').textContent = 'Logros (' + conseguidos + '/' + logros.length + ')';
  logros.forEach(a => {
    const hecho = a.c >= a.m,
      cuenta = Math.min(a.c, a.m),
      texto = crear('div', '', crear('b', '', a.n), crear('small', '', a.d + ' · ' + cuenta + '/' + a.m)),
      relleno = crear('i');
    texto.style.flex = '1';
    relleno.style.width = (cuenta / a.m) * 100 + '%';
    caja.appendChild(
      crear(
        'div',
        'ac' + (hecho ? ' ok' : ''),
        crear('span', 'st', hecho ? '★' : '☆'),
        texto,
        crear('div', 'pb', relleno)
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
  if (nuevos.length) setTimeout(() => aviso('Logro: ' + nuevos[0].n), 1900);
}

// La rana escondida en una esquina del mapa
$('#fr').onclick = () => {
  const primeraVez = !progreso.f;
  progreso.f = 1;
  guardar();
  actualizar();
  aviso('¡Has encontrado la rana!');
  if (primeraVez) setTimeout(() => aviso('Logro: Rana a la vista'), 1900);
};
