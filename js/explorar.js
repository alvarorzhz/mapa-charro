// «Explora»: las listas de monumentos y de sitios para comer (las rutas y «Salamanca en el tiempo»
// tienen las suyas en ruta.js y tiempo.js). Se abren en la ficha, como las rutas.

// --- Monumentos -------------------------------------------------------------------------
const FILTROS_MONUMENTOS = [
  ['all', 'Todos'],
  ['v', 'Visitados'],
  ['n', 'Sin visitar']
];

function abrirMonumentos() {
  activarRuta(false);
  const visitados = monumentosVisitados(),
    caja = fichaLimpia(visitados.length + ' de ' + MONUMENTOS.length + ' visitados', 'Monumentos');
  caja.appendChild(
    crear('p', 'hab', 'Los imprescindibles de la capital. Pulsa uno para ver su ficha y su sitio en el mapa.')
  );
  // Los detalles escondidos están en las fachadas de los monumentos: se llega a ellos desde aquí
  const encontrados = detallesEncontrados().length,
    detalles = crear(
      'button',
      'fila-explora fila-destacada',
      crear('span', 'ico-det', '🔍'),
      crear(
        'span',
        'texto',
        crear('b', '', 'Detalles escondidos'),
        crear(
          'small',
          '',
          'Figuras de las fachadas para buscar con pista · ' +
            encontrados +
            ' de ' +
            DETALLES.length +
            ' encontrados'
        )
      )
    );
  detalles.id = 'irdet';
  detalles.onclick = abrirDetalles;
  // La hora dorada: a qué fachadas les da hoy el sol bajo (hora-dorada.js)
  const dorada = crear(
    'button',
    'fila-explora fila-destacada',
    crear('span', 'ico-det', '🌇'),
    crear(
      'span',
      'texto',
      crear('b', '', 'La hora dorada'),
      crear(
        'small',
        '',
        'A qué fachadas les da el sol bajo · hoy se pone a las ' + horaSalamanca(horaDorada().puesta)
      )
    )
  );
  dorada.id = 'irhd';
  dorada.onclick = () => abrirHoraDorada();
  // Salamanca desaparecida: lo que ya no está (desaparecida.js)
  const desaparecida = crear(
    'button',
    'fila-explora fila-destacada',
    crear('span', 'ico-det', '👻'),
    crear(
      'span',
      'texto',
      crear('b', '', 'Salamanca desaparecida'),
      crear('small', '', DESAPARECIDOS.length + ' conventos, colegios e iglesias que ya no existen')
    )
  );
  desaparecida.id = 'irdes';
  desaparecida.onclick = abrirSalamancaDesaparecida;
  caja.appendChild(crear('div', 'lista-explora', detalles, dorada, desaparecida));
  const filtros = crear('div', 'fl');
  filtros.setAttribute('role', 'group');
  filtros.setAttribute('aria-label', 'Mostrar');
  FILTROS_MONUMENTOS.forEach(([clave, texto]) => {
    const b = crear('button', '', texto);
    marcarInterruptor(b, clave == estadoApp.filtroMonumentos);
    b.onclick = () => {
      estadoApp.filtroMonumentos = clave;
      abrirMonumentos();
      $('#info .fl [aria-pressed="true"]').focus();
    };
    filtros.appendChild(b);
  });
  caja.appendChild(filtros);
  let alguno = false;
  CATEGORIAS_MONUMENTO.forEach(([clave, nombre]) => {
    const deEsta = MONUMENTOS.filter(
      m =>
        categoriaMonumento(m) == clave &&
        cumpleFiltro(estadoApp.filtroMonumentos, visitados.includes(m.id) ? 'v' : '')
    ).sort((a, b) => a.n.localeCompare(b.n, 'es'));
    if (!deEsta.length) return;
    alguno = true;
    caja.appendChild(crear('h3', '', nombre));
    const lista = crear('div', 'lista-explora');
    deEsta.forEach(m => {
      const b = crear(
        'button',
        'fila-explora',
        iconoMonumento(m.tipo, 30),
        crear(
          'span',
          'texto',
          crear('b', '', m.n),
          crear('small', '', [buscarZona(m.zona).n, m.epoca].filter(Boolean).join(' · '))
        ),
        visitados.includes(m.id) ? crear('span', 'hecho', '✓ Visitado') : ''
      );
      b.onclick = () => abrirMonumento(m.id);
      lista.appendChild(b);
    });
    caja.appendChild(lista);
  });
  if (!alguno)
    caja.appendChild(
      crear(
        'p',
        'mu',
        estadoApp.filtroMonumentos == 'v'
          ? 'Aún no has visitado ninguno: en su ficha está «He estado aquí».'
          : '¡Los has visitado todos!'
      )
    );
  $('#ap').textContent = 'Fuentes: las de la ficha de cada monumento.';
  mostrarFicha();
  enlaceFicha('monumentos', 'Monumentos');
}

// --- Dónde comer ------------------------------------------------------------------------
const FILTROS_COMER = [
  ['all', 'Todos'],
  ['capital', 'En la capital'],
  ['pueblos', 'En los pueblos']
];
let filtroComer = 'all';

// Todos los sitios: los de las zonas del mapa (barrios y pueblos de alrededor) y los de las fichas de pueblo
function sitiosParaComer() {
  const sitios = [];
  Object.entries(DONDE_COMER).forEach(([id, lista]) => {
    const z = buscarZona(id);
    lista.forEach(s =>
      sitios.push({ s, donde: z.n, grupo: z.g, capital: z.g < 5, abrir: () => abrirFicha(id) })
    );
  });
  PROVINCIA.m.forEach(m => {
    const f = PUEBLOS[m.n];
    if (!f || !f.comer) return;
    f.comer.forEach(s =>
      sitios.push({ s, donde: m.n, grupo: 99, capital: false, abrir: () => abrirPueblo(m) })
    );
  });
  return sitios;
}

function abrirDondeComer() {
  activarRuta(false);
  const todos = sitiosParaComer(),
    caja = fichaLimpia(todos.length + ' sitios con fuente', 'Dónde comer');
  caja.appendChild(
    crear(
      'p',
      'hab',
      'Para cuando preguntes «¿qué hay de comer?» y no quieras oír «canguingos y patas de peces». Pulsa uno para ver su zona.'
    )
  );
  const filtros = crear('div', 'fl');
  filtros.setAttribute('role', 'group');
  filtros.setAttribute('aria-label', 'Mostrar');
  FILTROS_COMER.forEach(([clave, texto]) => {
    const b = crear('button', '', texto);
    marcarInterruptor(b, clave == filtroComer);
    b.onclick = () => {
      filtroComer = clave;
      abrirDondeComer();
      $('#info .fl [aria-pressed="true"]').focus();
    };
    filtros.appendChild(b);
  });
  caja.appendChild(filtros);
  const visibles = todos.filter(x => filtroComer == 'all' || (filtroComer == 'capital') == x.capital);
  // Agrupados como en la lista de zonas, y los pueblos de la provincia al final
  const grupos = [...NOMBRES_GRUPOS.map((n, g) => [g, n]), [99, 'Pueblos de la provincia']];
  grupos.forEach(([g, nombre]) => {
    const deEste = visibles
      .filter(x => x.grupo == g)
      .sort((a, b) => a.donde.localeCompare(b.donde, 'es') || a.s.n.localeCompare(b.s.n, 'es'));
    if (!deEste.length) return;
    caja.appendChild(crear('h3', '', nombre));
    const lista = crear('div', 'lista-explora');
    deEste.forEach(x => {
      const b = crear(
        'button',
        'fila-explora',
        crear(
          'span',
          'texto',
          crear('b', '', x.s.n),
          crear('small', '', [x.s.t, x.donde].filter(Boolean).join(' · '))
        )
      );
      b.onclick = () => {
        // La ficha del sitio, a su altura de siempre para que se vea su zona en el mapa
        x.abrir();
        irADondeComer(); // ficha.js
        apuntarTarea('comer-sitio');
      };
      lista.appendChild(b);
    });
    caja.appendChild(lista);
  });
  $('#ap').textContent =
    'Cada sitio lleva su fuente y su fecha en la ficha de su zona: Guía Repsol, Guía Michelin, Tripadvisor o Gastroranking.';
  estadoApp.fichaAlta = true;
  mostrarFicha();
  enlaceFicha('comer', 'Dónde comer');
}

$('#mns').onclick = abrirMonumentos;
$('#dc').onclick = abrirDondeComer;
