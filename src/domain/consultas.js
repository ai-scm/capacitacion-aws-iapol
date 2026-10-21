// Feature: capacitacion-aws-iapol
//
// Motor de consultas demo del Laboratorio SQL (dominio puro).
//
// El motor NO interpreta SQL: mapea un identificador de consulta (`id`) al
// resultado precalculado presente en el catálogo. Devuelve éxito exactamente
// cuando el `id` pertenece al catálogo (Property 6) y fallo cuando no existe.
// Además valida la entrada: identificadores vacíos/nulos/solo espacios se
// rechazan antes de resolver (Property 7), sin producir resultados demo.
//
// Funciones puras, exportaciones ESM. Sin conexiones a AWS/IAPOL.
//
// Requirements: 9.2, 9.4, 9.5

/**
 * Mensaje mostrado cuando la consulta no está presente en el catálogo (R9.4).
 * @type {string}
 */
export const MENSAJE_CONSULTA_NO_DISPONIBLE =
  'La consulta no está disponible en la Simulación.';

/**
 * Mensaje mostrado cuando la entrada es vacía/nula/solo espacios (R9.5).
 * @type {string}
 */
export const MENSAJE_CONSULTA_INVALIDA =
  'Se requiere seleccionar o introducir una consulta válida.';

/**
 * @typedef {Object} ResultadoDemo
 * @property {string[]} columnas Nombres de columnas del resultado precalculado.
 * @property {Array<Array<string | number>>} filas Filas del resultado precalculado.
 */

/**
 * @typedef {Object} ConsultaDemo
 * @property {string} id Identificador único de la consulta en el catálogo.
 * @property {string} etiqueta Nombre legible de la consulta.
 * @property {string} sql Texto SQL mostrado (solo visual, no se ejecuta).
 * @property {ResultadoDemo} resultado Resultado precalculado asociado.
 */

/**
 * @typedef {Object} ResolucionConsulta
 * @property {boolean} ok `true` si la consulta se resolvió con éxito.
 * @property {ResultadoDemo} [resultado] Resultado precalculado cuando `ok` es `true`.
 * @property {string} [error] Mensaje de error cuando `ok` es `false`.
 */

/**
 * Indica si la entrada es un identificador de consulta válido: una cadena no
 * vacía que contenga al menos un carácter distinto de espacio en blanco.
 *
 * @param {unknown} idConsulta Entrada a validar.
 * @returns {boolean} `true` si la entrada es un identificador no vacío.
 */
function esEntradaValida(idConsulta) {
  return typeof idConsulta === 'string' && idConsulta.trim().length > 0;
}

/**
 * Resuelve un identificador de consulta contra un catálogo de consultas demo.
 *
 * El motor no interpreta SQL: busca el `id` en el catálogo y devuelve su
 * resultado precalculado. Primero valida la entrada (R9.5); si es vacía/nula
 * o solo espacios, rechaza sin resolver. Si es válida, devuelve éxito cuando
 * el `id` pertenece al catálogo y fallo en caso contrario (R9.4/R9.2).
 *
 * @param {unknown} idConsulta Identificador de la consulta a resolver.
 * @param {ReadonlyArray<ConsultaDemo>} [catalogo] Catálogo de consultas demo.
 * @returns {ResolucionConsulta} Resultado de la resolución.
 */
export function resolverConsulta(idConsulta, catalogo) {
  // Validación de entrada (R9.5): rechazar vacío/nulo/solo espacios antes de
  // intentar resolver, sin producir resultados demo.
  if (!esEntradaValida(idConsulta)) {
    return { ok: false, error: MENSAJE_CONSULTA_INVALIDA };
  }

  const entradas = Array.isArray(catalogo) ? catalogo : [];
  const idBuscado = idConsulta.trim();
  const consulta = entradas.find(
    (entrada) => entrada != null && entrada.id === idBuscado,
  );

  // Totalidad respecto al catálogo (R9.2/R9.4): éxito solo si el id existe.
  if (consulta === undefined) {
    return { ok: false, error: MENSAJE_CONSULTA_NO_DISPONIBLE };
  }

  return { ok: true, resultado: consulta.resultado };
}
