// La hora dorada (#hora-dorada): la piedra de Villamayor se vuelve de oro con el sol bajo. Para cada día se
// calcula la posición del sol en Salamanca minuto a minuto y, con hacia dónde mira cada fachada de FACHADAS
// (datos/fachadas.js, orientación sacada de OpenStreetMap), a cuáles les da al salir y al ponerse. Sale en su
// ficha (desde Monumentos), en «¿Qué puedo descubrir hoy?» y en la ficha de cada monumento con fachada.
// No tiene en cuenta los edificios de enfrente ni las nubes: la ficha lo dice.

const SALAMANCA = [40.965, -5.664];
const ZONA_HORARIA = 'Europe/Madrid'; // las horas, siempre las de Salamanca, aunque el móvil esté en otra
const ALTURA_DORADA = 6; // grados: por debajo, la luz es dorada (hasta que se pone)
const ALTURA_PUESTA = -0.833; // grados: el borde de arriba del sol toca el horizonte (con la refracción)
const SOL_DE_FRENTE = 35, // grados entre el sol y la perpendicular de la fachada
  SOL_DE_LADO = 70;

// --- Posición del sol (fórmulas de la NOAA/SunCalc, con un error de pocos minutos de arco) -------------
const RAD = Math.PI / 180;
function posicionSol(fecha, [la, lo] = SALAMANCA) {
  const d = fecha.getTime() / 864e5 - 10957.5, // días desde el 1 de enero de 2000 a mediodía
    M = RAD * (357.5291 + 0.98560028 * d),
    L =
      M +
      RAD * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M)) +
      RAD * 102.9372 +
      Math.PI,
    e = RAD * 23.4397,
    dec = Math.asin(Math.sin(e) * Math.sin(L)),
    ra = Math.atan2(Math.sin(L) * Math.cos(e), Math.cos(L)),
    H = RAD * (280.16 + 360.9856235 * d) + RAD * lo - ra,
    phi = RAD * la,
    altura = Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H)),
    acimut = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(phi) - Math.tan(dec) * Math.cos(phi));
  return { altura: altura / RAD, acimut: (acimut / RAD + 180 + 360) % 360 }; // acimut desde el norte
}

// --- Días y horas de Salamanca ----------------------------------------------------------------------
const partesEnSalamanca = (fecha, opciones) =>
  Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', { timeZone: ZONA_HORARIA, hourCycle: 'h23', ...opciones })
      .formatToParts(fecha)
      .map(p => [p.type, p.value])
  );
// El día de Salamanca de un momento, como 'AAAA-MM-DD'
function diaEnSalamanca(fecha = new Date()) {
  const p = partesEnSalamanca(fecha, { year: 'numeric', month: '2-digit', day: '2-digit' });
  return p.year + '-' + p.month + '-' + p.day;
}
const sumarDias = (dia, n) => new Date(Date.parse(dia + 'T12:00:00Z') + n * 864e5).toISOString().slice(0, 10);
// Minutos que Salamanca va por delante de UTC ese día (60 en invierno, 120 en verano), mirado a mediodía
function adelantoSalamanca(dia) {
  const mediodia = new Date(dia + 'T12:00:00Z'),
    p = partesEnSalamanca(mediodia, { hour: 'numeric', minute: 'numeric' });
  return +p.hour * 60 + +p.minute - 12 * 60;
}
const horaSalamanca = fecha =>
  fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: ZONA_HORARIA });
const textoTramo = (desde, hasta) => 'de ' + horaSalamanca(desde) + ' a ' + horaSalamanca(hasta);
// «hoy», «mañana», «ayer» o «el jueves 23 de octubre»
function nombreDelDia(dia) {
  const hoy = diaEnSalamanca(),
    cerca = { [hoy]: 'hoy', [sumarDias(hoy, 1)]: 'mañana', [sumarDias(hoy, -1)]: 'ayer' };
  return (
    cerca[dia] ||
    'el ' +
      new Date(dia + 'T12:00:00Z').toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        timeZone: 'UTC'
      })
  );
}

// Diferencia entre dos rumbos, de 0 a 180 grados
const entreRumbos = (a, b) => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

// --- Lo que pasa un día ------------------------------------------------------------------------------
// { dia, salida, finManana, inicioTarde, puesta (Date), manana, tarde: [{ f, mira, desde, hasta, frente }] }
// «manana» y «tarde», las fachadas a las que les da el sol en cada rato dorado, de la más de frente a la menos
const cacheHoraDorada = {};
function horaDorada(dia = diaEnSalamanca()) {
  if (cacheHoraDorada[dia]) return cacheHoraDorada[dia];
  const inicio = Date.parse(dia + 'T00:00:00Z') - adelantoSalamanca(dia) * 6e4,
    minutos = [];
  for (let i = 0; i <= 24 * 60; i++) {
    const t = new Date(inicio + i * 6e4);
    minutos.push({ t, ...posicionSol(t) });
  }
  // Los dos ratos dorados: del amanecer a ALTURA_DORADA y de ALTURA_DORADA a la puesta
  const dorados = minutos.filter(m => m.altura > ALTURA_PUESTA && m.altura <= ALTURA_DORADA),
    mediodia = minutos.reduce((a, b) => (b.altura > a.altura ? b : a)).t,
    manana = dorados.filter(m => m.t < mediodia),
    tarde = dorados.filter(m => m.t > mediodia);
  const iluminadas = rato =>
    FACHADAS.map(f => {
      const mira = ORIENTACION_FACHADAS[f.id][0],
        con = rato.filter(m => entreRumbos(m.acimut, mira) < SOL_DE_LADO);
      if (!con.length) return null;
      return {
        f,
        mira,
        desde: con[0].t,
        hasta: con[con.length - 1].t,
        frente: Math.round(Math.min(...con.map(m => entreRumbos(m.acimut, mira))))
      };
    })
      .filter(Boolean)
      .sort((a, b) => a.frente - b.frente);
  const r = {
    dia,
    salida: manana.length ? manana[0].t : null,
    finManana: manana.length ? manana[manana.length - 1].t : null,
    inicioTarde: tarde.length ? tarde[0].t : null,
    puesta: tarde.length ? tarde[tarde.length - 1].t : null,
    manana: iluminadas(manana),
    tarde: iluminadas(tarde)
  };
  return (cacheHoraDorada[dia] = r);
}
const comoLeDa = x => (x.frente < SOL_DE_FRENTE ? 'de frente' : 'de lado');
// Para una frase: «el Pabellón Real de la Plaza Mayor», «la fachada de San Esteban»
const nombreFachada = f =>
  f.n.startsWith('Pabellón')
    ? 'el ' + f.n + ' de la Plaza Mayor'
    : 'la ' + f.n.charAt(0).toLowerCase() + f.n.slice(1);

// Lo próximo que viene: el rato de la tarde de hoy si aún no ha pasado; si no, el de mañana por la mañana
function proximoRatoDorado(ahora = new Date()) {
  const hoy = horaDorada(diaEnSalamanca(ahora));
  if (hoy.puesta && ahora < hoy.puesta) return { dia: hoy.dia, cuando: 'tarde', h: hoy };
  const manana = horaDorada(sumarDias(hoy.dia, 1));
  return { dia: manana.dia, cuando: 'manana', h: manana };
}

// --- La ficha ---------------------------------------------------------------------------------------
let diaHoraDorada = null; // el día que enseña la ficha ('AAAA-MM-DD'); null, hoy

function filaFachada(x) {
  const m = buscarMonumento(x.f.monumento),
    b = crear(
      'button',
      'fila-explora',
      crear('span', 'icono-hoy', iconoMonumento(m.tipo, 26)),
      crear(
        'span',
        'texto',
        crear('b', '', x.f.n),
        crear('small', '', [x.f.sitio, 'le da ' + comoLeDa(x), textoTramo(x.desde, x.hasta)].join(' · '))
      )
    );
  b.onclick = () => abrirMonumento(m.id);
  return b;
}

function apartadoRato(titulo, desde, hasta, lista) {
  const caja = crear('div', 'hd-rato');
  caja.appendChild(crear('h3', '', titulo + (desde ? ' · luz dorada ' + textoTramo(desde, hasta) : '')));
  if (lista.length) {
    const filas = crear('div', 'lista-explora');
    lista.forEach(x => filas.appendChild(filaFachada(x)));
    caja.appendChild(filas);
  } else caja.appendChild(crear('p', 'mu', 'Ese rato el sol no da en ninguna de estas fachadas.'));
  return caja;
}

function abrirHoraDorada(dia) {
  activarRuta(false);
  diaHoraDorada = dia || null;
  const d = diaHoraDorada || diaEnSalamanca(),
    h = horaDorada(d),
    caja = fichaLimpia('Piedra de Villamayor con el sol bajo', 'La hora dorada'),
    volver = crear('button', 'volver-hoy', '← Monumentos');
  volver.onclick = () => abrirMonumentos();
  caja.append(
    volver,
    crear(
      'p',
      'hab',
      'La piedra de Salamanca se vuelve dorada cuando el sol está bajo, al salir y al ponerse. Aquí tienes a qué fachadas les da y a qué hora.'
    )
  );

  // Cambiar de día
  const anterior = crear('button', 'hd-dia-b', '‹'),
    siguiente = crear('button', 'hd-dia-b', '›'),
    nombre = nombreDelDia(d);
  anterior.setAttribute('aria-label', 'Día anterior');
  siguiente.setAttribute('aria-label', 'Día siguiente');
  anterior.onclick = () => abrirHoraDorada(sumarDias(d, -1));
  siguiente.onclick = () => abrirHoraDorada(sumarDias(d, 1));
  const cambiarDia = crear('div', 'hd-dia', anterior, crear('b', '', conMayuscula(nombre)), siguiente);
  if (diaHoraDorada && diaHoraDorada != diaEnSalamanca()) {
    const hoy = crear('button', 'hd-hoy', 'Hoy');
    hoy.onclick = () => abrirHoraDorada();
    cambiarDia.appendChild(hoy);
  }
  caja.appendChild(cambiarDia);
  caja.appendChild(
    cajaDatos([
      ['Sale el sol', h.salida ? horaSalamanca(h.salida) : '—'],
      ['Se pone', h.puesta ? horaSalamanca(h.puesta) : '—']
    ])
  );
  caja.appendChild(apartadoRato('🌅 Al amanecer', h.salida, h.finManana, h.manana));
  caja.appendChild(apartadoRato('🌇 Al atardecer', h.inicioTarde, h.puesta, h.tarde));
  caja.appendChild(
    crear(
      'p',
      'mu hd-nota',
      'El sol bajo da de lleno si no lo tapan los edificios de enfrente: en las calles estrechas solo llega a lo alto de la fachada. Y si está nublado, otro día será.'
    )
  );
  // Fuentes de qué fachada es cada una: una por monumento
  const fuentes = crear('p', 'mu hd-nota', 'Qué fachada es cada una: '),
    porMonumento = new Map(FACHADAS.map(f => [f.monumento, f.fuente[0][1]]));
  [...porMonumento].forEach(([id, url], i) => {
    if (i) fuentes.append(', ');
    fuentes.appendChild(enlaceFuente([buscarMonumento(id).n, url]));
  });
  caja.appendChild(fuentes);
  $('#ap').textContent =
    'Cálculo propio: la posición del sol en Salamanca minuto a minuto y hacia dónde mira cada fachada según su planta en OpenStreetMap (© colaboradores de OpenStreetMap). No tiene en cuenta los edificios de alrededor ni el tiempo que haga.';
  estadoApp.fichaAlta = true;
  mostrarFicha();
  enlaceFicha('hora-dorada', 'La hora dorada');
}

// --- En otras fichas ---------------------------------------------------------------------------------
// Frase corta para «¿Qué puedo descubrir hoy?»: lo próximo que viene y dónde
function resumenHoraDorada(ahora = new Date()) {
  const { dia, cuando, h } = proximoRatoDorado(ahora),
    lista = cuando == 'tarde' ? h.tarde : h.manana,
    nombres = lista.slice(0, 3).map(x => nombreFachada(x.f)),
    enumerar = n => (n.length > 1 ? n.slice(0, -1).join(', ') + ' y ' + n[n.length - 1] : n[0]),
    momento =
      cuando == 'tarde'
        ? conMayuscula(nombreDelDia(dia)) + ' el sol se pone a las ' + horaSalamanca(h.puesta) + '. '
        : conMayuscula(nombreDelDia(dia)) + ' el sol sale a las ' + horaSalamanca(h.salida) + '. ',
    rato = cuando == 'tarde' ? textoTramo(h.inicioTarde, h.puesta) : textoTramo(h.salida, h.finManana);
  return (
    momento +
    (nombres.length
      ? conMayuscula(rato) + ', la luz dorada da en ' + enumerar(nombres) + '.'
      : 'Ese rato el sol no da en ninguna de nuestras fachadas.')
  );
}

// Fila de «Para seguir explorando» en la ficha de un monumento: sus fachadas con sol bajo hoy
function filaHoraDoradaDeMonumento(m) {
  const h = horaDorada();
  return [
    'Hoy, con el sol bajo',
    [...h.manana.map(x => [x, 'al amanecer']), ...h.tarde.map(x => [x, 'al atardecer'])]
      .filter(([x]) => x.f.monumento == m.id)
      .map(([x, rato]) => ({
        texto: (rato == 'al amanecer' ? '🌅 ' : '🌇 ') + x.f.n,
        detalle: rato + ', ' + textoTramo(x.desde, x.hasta),
        abrir: () => abrirHoraDorada()
      }))
  ];
}
