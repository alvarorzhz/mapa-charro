// Detalles escondidos (datos en js/datos/detalles.js): la lista (#detalles) y la ficha de cada uno
// (#detalle/<id>) con su pista. Al pulsar «¡Lo he encontrado!» se guarda en progreso.j.de y se ven la foto
// y la explicación; «Enséñamelo» las enseña sin contarlo. También salen en la ficha de su monumento.

const buscarDetalle = id => DETALLES.find(d => d.id == id);
const detallesEncontrados = () => datoJ('de', []);
const detalleEncontrado = d => detallesEncontrados().includes(d.id);
const detallesDeMonumento = id => DETALLES.filter(d => d.monumento == id);
let detalleRevelado = null; // id del que se ha pedido ver sin encontrarlo (solo mientras está abierto)

function marcarDetalle(d, encontrado) {
  const j = (progreso.j = progreso.j || {}),
    antes = detallesEncontrados();
  j.de = encontrado ? [...new Set([...antes, d.id])] : antes.filter(id => id != d.id);
  guardar();
  actualizar();
}

// Fila «En este monumento» para «Para seguir explorando» (relacionadosDeMonumento, monumentos.js)
const filaDetallesDeMonumento = m => [
  'Detalles escondidos',
  detallesDeMonumento(m.id).map(d => ({
    texto: d.icono + ' ' + d.n,
    hecho: detalleEncontrado(d),
    abrir: () => abrirDetalle(d.id)
  }))
];

// repintar: la misma ficha otra vez tras marcarlo o enseñarlo, sin cambiar su tamaño
function abrirDetalle(id, repintar = false) {
  const grande = repintar && $('#sh').classList.contains('grande');
  const d = buscarDetalle(id);
  if (!d) return abrirDetalles();
  activarRuta(false);
  const m = buscarMonumento(d.monumento),
    encontrado = detalleEncontrado(d),
    visto = encontrado || detalleRevelado == d.id,
    caja = fichaLimpia('🔍 Detalle escondido · ' + m.n, d.icono + ' ' + d.n);
  pintarFotoDe(
    visto && d.foto
      ? [
          d.foto.src,
          d.foto.pie + '. Foto: ' + d.foto.autor + ' · ' + d.foto.licencia + ' · Wikimedia Commons'
        ]
      : null
  );
  const volver = crear('button', 'volver-hoy', '← Detalles escondidos');
  volver.onclick = () => abrirDetalles();
  caja.appendChild(volver);
  caja.appendChild(crear('p', 'det-pista', crear('b', '', '🔍 Pista: '), d.pista));
  const ir = crear('button', 'conico', iconoMonumento(m.tipo, 18), 'Dónde está: ' + m.n);
  ir.onclick = () => abrirMonumento(m.id);
  caja.appendChild(crear('div', 'nb', ir));

  if (visto) {
    const textos = crear('div', 'cul-textos');
    d.textos.forEach(([tipo, texto]) =>
      textos.appendChild(
        crear('p', 'cul-t ' + tipo, crear('span', 'cul-tipo', TIPOS_TEXTO_CULTURA[tipo]), texto)
      )
    );
    caja.appendChild(textos);
  }
  const botones = crear('div', 'det-botones');
  if (encontrado) {
    botones.appendChild(crear('p', 'det-hecho', '✓ ¡Lo has encontrado!'));
    const quitar = crear('button', '', 'Quitar la marca');
    quitar.onclick = () => {
      marcarDetalle(d, false);
      abrirDetalle(d.id, true);
      aviso('Marca quitada: ' + d.n, {
        accion: [
          'Deshacer',
          () => {
            marcarDetalle(d, true);
            abrirDetalle(d.id, true);
          }
        ]
      });
    };
    botones.appendChild(quitar);
  } else {
    const si = crear('button', 'boton-hoy', '¡Lo he encontrado!');
    si.onclick = () =>
      conAvisoDeLogros(() => {
        marcarDetalle(d, true);
        abrirDetalle(d.id, true);
        aviso('🔍 ¡Bien visto! ' + detallesEncontrados().length + ' de ' + DETALLES.length + ' detalles', {
          tipo: 'exito'
        });
      });
    botones.appendChild(si);
    if (!visto) {
      const ver = crear('button', '', 'Me rindo: enséñamelo');
      ver.onclick = () => {
        detalleRevelado = d.id;
        abrirDetalle(d.id, true);
      };
      botones.appendChild(ver);
    }
  }
  caja.appendChild(botones);

  const ap = $('#ap');
  ap.textContent = 'Fuentes: ';
  d.fuentes.forEach((f, i) => ap.append(i ? ', ' : '', enlaceFuente(f)));
  if (d.foto) {
    const a = crear('a', '', d.foto.autor + ', ' + d.foto.licencia);
    a.href = d.foto.url;
    a.target = '_blank';
    a.rel = 'noopener';
    ap.append('. Foto: ', a);
  }
  ap.append('. Revisado el ' + textoFechaRevision(d.revisado) + '.');
  mostrarFicha();
  if (grande) $('#sh').classList.add('grande');
  enlaceFicha('detalle/' + d.id, d.n);
}

function abrirDetalles() {
  activarRuta(false);
  detalleRevelado = null;
  const n = detallesEncontrados().length,
    caja = fichaLimpia(n + ' de ' + DETALLES.length + ' encontrados', 'Detalles escondidos');
  caja.appendChild(
    crear(
      'p',
      'hab',
      'Figuras pequeñas que se esconden en las fachadas. Cada una tiene su pista: ve a buscarla y, cuando la veas, márcala. La foto es el premio.'
    )
  );
  caja.appendChild(barra(n / DETALLES.length));
  const porMonumento = new Map();
  DETALLES.forEach(d => porMonumento.set(d.monumento, [...(porMonumento.get(d.monumento) || []), d]));
  porMonumento.forEach((lista, idm) => {
    caja.appendChild(crear('h3', '', buscarMonumento(idm).n));
    const filas = crear('div', 'lista-explora');
    lista.forEach(d => {
      const b = crear(
        'button',
        'fila-explora',
        crear('span', 'ico-det', d.icono),
        crear('span', 'texto', crear('b', '', d.n), crear('small', '', d.pista)),
        detalleEncontrado(d) ? crear('span', 'hecho', '✓ Encontrado') : ''
      );
      b.onclick = () => abrirDetalle(d.id);
      filas.appendChild(b);
    });
    caja.appendChild(filas);
  });
  $('#ap').textContent = 'Fuentes: las de la ficha de cada detalle.';
  mostrarFicha();
  enlaceFicha('detalles', 'Detalles escondidos');
}

$('#det').onclick = abrirDetalles;
