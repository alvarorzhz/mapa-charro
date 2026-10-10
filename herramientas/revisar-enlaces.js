// Revisión semanal (GitHub Actions, revision-semanal.yml): comprueba que los enlaces de las fuentes siguen
// vivos y avisa de los restaurantes cuya valoración tiene más de un año.
// Uso: node herramientas/revisar-enlaces.js [--max N]   (sale con error si hay enlaces rotos)
// Algunos medios bloquean a los robots (403, 429): esos se apuntan como «dudosos», no como rotos.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAIZ = path.join(__dirname, '..');
const DATOS = path.join(RAIZ, 'js/datos');
const AGENTE = 'mapa-charro (github.com/alvarorzhz/mapa-charro)';
const ESPERA = 20000;
const A_LA_VEZ = 6;
const max = process.argv.includes('--max') ? +process.argv[process.argv.indexOf('--max') + 1] : Infinity;

// --- Enlaces de todos los archivos de datos, también los de los comentarios // Fuente: ---------------
const enlaces = new Map(); // url -> [archivos]
for (const f of fs.readdirSync(DATOS)) {
  const texto = fs.readFileSync(path.join(DATOS, f), 'utf8');
  for (const [url] of texto.matchAll(/https?:\/\/[^\s'"`)<>\]]+/g)) {
    const limpia = url.replace(/[.,;]+$/, '');
    if (/gstatic|googleapis|firebaseapp/.test(limpia)) continue;
    enlaces.set(limpia, [...new Set([...(enlaces.get(limpia) || []), f])]);
  }
}

async function comprobar(url) {
  const control = new AbortController(),
    reloj = setTimeout(() => control.abort(), ESPERA);
  try {
    const r = await fetch(url, {
      redirect: 'follow',
      signal: control.signal,
      headers: { 'user-agent': AGENTE, accept: 'text/html,*/*' }
    });
    return r.status;
  } catch (e) {
    return e.name == 'AbortError' ? 'tiempo agotado' : 'sin respuesta';
  } finally {
    clearTimeout(reloj);
  }
}
const esRoto = estado => estado == 404 || estado == 410 || estado == 'sin respuesta';
const esDudoso = estado => !esRoto(estado) && !(estado >= 200 && estado < 400);

// --- Restaurantes con la valoración de hace más de un año («Gastroranking, oct. 2025») ---------------
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
function restaurantesViejos() {
  const codigo = fs.readFileSync(path.join(DATOS, 'contenido.js'), 'utf8') + ';({ DONDE_COMER })';
  const { DONDE_COMER } = vm.runInNewContext(codigo, {});
  const hoy = new Date(),
    viejos = [];
  for (const [zona, sitios] of Object.entries(DONDE_COMER))
    for (const s of sitios) {
      const m = (s.s || '').match(/\b(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)[a-z]*\.? (20\d\d)\b/i);
      const anio = m ? +m[2] : +((s.s || '').match(/\b(20\d\d)\b/) || [])[1];
      if (!anio) {
        viejos.push(`${zona}: ${s.n} (sin fecha en la fuente)`);
        continue;
      }
      const mes = m ? MESES.indexOf(m[1].toLowerCase().slice(0, 3)) : 0,
        meses = (hoy.getFullYear() - anio) * 12 + hoy.getMonth() - mes;
      if (meses > 12) viejos.push(`${zona}: ${s.n} (${s.s})`);
    }
  return viejos;
}

(async () => {
  const lista = [...enlaces.keys()].slice(0, max),
    resultados = [];
  let i = 0;
  await Promise.all(
    Array.from({ length: A_LA_VEZ }, async () => {
      while (i < lista.length) {
        const url = lista[i++];
        resultados.push({ url, estado: await comprobar(url), archivos: enlaces.get(url) });
      }
    })
  );
  const rotos = resultados.filter(r => esRoto(r.estado)),
    dudosos = resultados.filter(r => esDudoso(r.estado)),
    viejos = restaurantesViejos();

  const linea = r => `- ${r.estado} · ${r.url} (${r.archivos.join(', ')})`;
  const informe = [
    `## Revisión de enlaces y restaurantes`,
    `${resultados.length} enlaces revisados: ${rotos.length} rotos, ${dudosos.length} dudosos (el medio bloquea robots o falló un momento).`,
    rotos.length ? `\n### Rotos\n${rotos.map(linea).join('\n')}` : '',
    dudosos.length ? `\n### Dudosos (abrir a mano)\n${dudosos.map(linea).join('\n')}` : '',
    `\n### Restaurantes con la valoración de hace más de un año\n${viejos.length ? viejos.map(v => '- ' + v).join('\n') : 'Ninguno.'}`
  ]
    .filter(Boolean)
    .join('\n');
  console.log(informe);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, informe + '\n');
  process.exit(rotos.length ? 1 : 0);
})();
