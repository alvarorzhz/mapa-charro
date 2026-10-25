// Los archivos de js/datos/ son módulos (export const …). Las herramientas los leen con vm como un script
// normal, quitando el «export» de delante: así se pueden juntar varios en un mismo contexto.
const sinExport = codigo => codigo.replace(/^export const /gm, 'const ');

module.exports = { sinExport };
