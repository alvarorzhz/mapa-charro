// Agenda de fiestas y tradiciones (#agenda): las próximas fechas de lo que en CULTURA lleva «fechas»
// (datos/cultura.js), calculadas para este año o el que viene. Las que cambian cada año van contadas desde
// el Domingo de Resurrección. Sale también en la ficha de cada elemento, en «¿Qué puedo descubrir hoy?» y
// desde el botón «Agenda» de «Explora».

// Domingo de Resurrección (cómputo gregoriano, algoritmo de Meeus/Jones/Butcher)
function domingoDeResurreccion(anio) {
  const a = anio % 19,
    b = Math.floor(anio / 100),
    c = anio % 100,
    d = Math.floor(b / 4),
    e = b % 4,
    f = Math.floor((b + 8) / 25),
    g = Math.floor((b - f + 1) / 3),
    h = (19 * a + b - d - g + 15) % 30,
    i = Math.floor(c / 4),
    k = c % 4,
    l = (32 + 2 * e + 2 * i - h - k) % 7,
    m = Math.floor((a + 11 * h + 22 * l) / 451),
    mes = Math.floor((h + l - 7 * m + 114) / 31),
    dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(anio, mes - 1, dia);
}

// Una fecha de los datos ('MM-DD' o 'P+N'/'P-N') en un año concreto
function fechaDeAgenda(texto, anio) {
  const p = /^P([+-]\d+)$/.exec(texto);
  if (p) {
    const d = domingoDeResurreccion(anio);
    d.setDate(d.getDate() + +p[1]);
    return d;
  }
  const [mes, dia] = texto.split('-').map(Number);
  return new Date(anio, mes - 1, dia);
}

const inicioDelDia = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const DIA_MS = 864e5;
const diasEntre = (a, b) => Math.round((inicioDelDia(b) - inicioDelDia(a)) / DIA_MS);

// Todas las próximas citas a partir de hoy (incluidas las que están pasando): [{ c, desde, hasta, nota,
// dentro (días hasta que empieza; 0 si ya ha empezado) }], ordenadas por fecha
function proximasCitas(hoy = new Date()) {
  const dia = inicioDelDia(hoy),
    citas = [];
  CULTURA.forEach(c =>
    (c.fechas || []).forEach(([de, a, nota]) => {
      for (const anio of [dia.getFullYear() - 1, dia.getFullYear(), dia.getFullYear() + 1]) {
        const desde = fechaDeAgenda(de, anio);
        let hasta = a ? fechaDeAgenda(a, anio) : desde;
        if (hasta < desde) hasta = fechaDeAgenda(a, anio + 1); // del 30 de diciembre al 2 de enero
        if (hasta >= dia) {
          citas.push({ c, desde, hasta, nota: nota || '', dentro: Math.max(0, diasEntre(dia, desde)) });
          break;
        }
      }
    })
  );
  return citas.sort((x, y) => x.desde - y.desde || x.c.n.localeCompare(y.c.n, 'es'));
}
const proximaCitaDe = (c, hoy) => proximasCitas(hoy).find(x => x.c == c);

// «15 y 16 de agosto», «del 15 al 22 de octubre», «del 28 de febrero al 2 de marzo»
const mesDeCita = d => d.toLocaleDateString('es-ES', { month: 'long' });
function textoFechasCita({ desde, hasta }) {
  const dias = diasEntre(desde, hasta);
  if (!dias) return desde.getDate() + ' de ' + mesDeCita(desde);
  const mismoMes = desde.getMonth() == hasta.getMonth();
  if (dias == 1)
    return mismoMes
      ? desde.getDate() + ' y ' + hasta.getDate() + ' de ' + mesDeCita(hasta)
      : desde.getDate() + ' de ' + mesDeCita(desde) + ' y ' + hasta.getDate() + ' de ' + mesDeCita(hasta);
  return (
    'del ' +
    desde.getDate() +
    (mismoMes ? '' : ' de ' + mesDeCita(desde)) +
    ' al ' +
    hasta.getDate() +
    ' de ' +
    mesDeCita(hasta)
  );
}
const textoDentro = x =>
  x.dentro == 0 && x.desde < inicioDelDia(new Date())
    ? 'ya ha empezado'
    : x.dentro == 0
      ? 'hoy'
      : x.dentro == 1
        ? 'mañana'
        : 'dentro de ' + x.dentro + ' días';
const conMayuscula = t => t.charAt(0).toUpperCase() + t.slice(1);

// Una fila de la agenda: fecha, nombre, nota y lugar; abre la ficha del elemento
function filaCita(x, abrir) {
  const lugares = [...lugaresCultura(x.c).keys()].map(m => (m.cap ? 'Salamanca' : m.n)),
    donde = lugares.length > 3 ? lugares.length + ' municipios' : lugares.join(', ');
  const b = crear(
    'button',
    'fila-explora fila-cita',
    crear(
      'span',
      'cita-dia',
      crear('b', '', String(x.desde.getDate())),
      crear('small', '', x.desde.toLocaleDateString('es-ES', { month: 'short' }).replace('.', ''))
    ),
    crear(
      'span',
      'texto',
      crear('b', '', categoriaCultura(x.c.cat)[2] + ' ' + x.c.n),
      crear(
        'small',
        '',
        [conMayuscula(textoFechasCita(x)), textoDentro(x), x.nota, donde].filter(Boolean).join(' · ')
      )
    )
  );
  b.onclick = abrir || (() => abrirElementoCultura(x.c.id));
  return b;
}

// Grupos de la agenda: lo de esta semana, lo de los próximos 30 días y el resto del año
const GRUPOS_AGENDA = [
  ['Ahora y esta semana', x => x.dentro <= 7],
  ['Este mes', x => x.dentro > 7 && x.dentro <= 31],
  ['Más adelante', x => x.dentro > 31]
];

function abrirAgenda() {
  activarRuta(false);
  const citas = proximasCitas(),
    caja = fichaLimpia('Fiestas y tradiciones con fecha', 'Agenda');
  caja.appendChild(
    crear(
      'p',
      'hab',
      'Lo próximo de «Cultura y tradiciones», de la capital y de la provincia. Las fiestas que cambian cada año (Carnaval, Semana Santa, Lunes de Aguas…) se calculan desde la Pascua.'
    )
  );
  GRUPOS_AGENDA.forEach(([titulo, entra]) => {
    const deEste = citas.filter(entra);
    if (!deEste.length) return;
    caja.appendChild(crear('h3', '', titulo));
    const lista = crear('div', 'lista-explora');
    deEste.forEach(x => lista.appendChild(filaCita(x)));
    caja.appendChild(lista);
  });
  const sinFecha = CULTURA.filter(c => c.cuando && !c.fechas);
  if (sinFecha.length) {
    caja.appendChild(crear('h3', '', 'Sin día fijo'));
    const lista = crear('div', 'nb');
    sinFecha.forEach(c => {
      const b = crear('button', '', categoriaCultura(c.cat)[2] + ' ' + c.n);
      b.title = c.cuando;
      b.onclick = () => abrirElementoCultura(c.id);
      lista.appendChild(b);
    });
    caja.appendChild(lista);
  }
  $('#ap').textContent =
    'Fechas sacadas de «Cuándo» de cada ficha, que lleva sus fuentes. Confirma el programa de cada año antes de ir.';
  mostrarFicha();
  enlaceFicha('agenda', 'Agenda');
}

$('#agn').onclick = abrirAgenda;
