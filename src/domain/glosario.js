/**
 * Búsqueda del glosario técnico (lógica pura).
 *
 * Filtra una lista de términos devolviendo únicamente las entradas cuyo término
 * o cuya definición contiene el texto buscado, sin distinguir mayúsculas y
 * minúsculas (R14.2). De este modo, toda entrada devuelta contiene la coincidencia
 * en su término o en su definición.
 *
 * Una búsqueda vacía o compuesta solo por espacios en blanco no filtra nada y
 * devuelve todas las entradas (comportamiento de "sin filtro"), pues la cadena
 * vacía está contenida en cualquier texto.
 *
 * Funciones puras, exportaciones ESM. Sin dependencias del DOM ni de AWS/IAPOL.
 *
 * Requirements: 14.2.
 * Property 13: La búsqueda del glosario solo devuelve coincidencias.
 */

/**
 * @typedef {Object} TerminoGlosario
 * @property {string} termino Nombre del término técnico.
 * @property {string} definicion Definición del término.
 */

/**
 * Normaliza un valor de texto a minúsculas para comparación insensible a
 * mayúsculas. Los valores no cadena se tratan como cadena vacía.
 *
 * @param {unknown} valor Valor a normalizar.
 * @returns {string} El texto en minúsculas, o cadena vacía si no es string.
 */
function normalizar(valor) {
  return typeof valor === 'string' ? valor.toLowerCase() : '';
}

/**
 * Indica si una entrada del glosario coincide con el texto buscado.
 *
 * La coincidencia es verdadera cuando el texto (ya normalizado a minúsculas)
 * aparece como subcadena del término o de la definición de la entrada.
 *
 * @param {TerminoGlosario} entrada Entrada del glosario a evaluar.
 * @param {string} textoNormalizado Texto de búsqueda ya en minúsculas.
 * @returns {boolean} `true` si el término o la definición contiene el texto.
 */
function coincide(entrada, textoNormalizado) {
  if (entrada == null) return false;

  const termino = normalizar(entrada.termino);
  const definicion = normalizar(entrada.definicion);

  return (
    termino.includes(textoNormalizado) ||
    definicion.includes(textoNormalizado)
  );
}

/**
 * Busca términos en el glosario que coincidan con el texto proporcionado.
 *
 * Devuelve solo las entradas cuyo término o definición contiene el texto
 * buscado, sin distinguir mayúsculas y minúsculas. Una búsqueda vacía o solo
 * con espacios devuelve todas las entradas (sin filtro). Preserva el orden
 * original de las entradas y no muta la lista recibida.
 *
 * @param {unknown} texto Texto de búsqueda.
 * @param {ReadonlyArray<TerminoGlosario>} [terminos] Lista de términos del glosario.
 * @returns {TerminoGlosario[]} Entradas coincidentes, en el orden original.
 */
export function buscarTerminos(texto, terminos) {
  const entradas = Array.isArray(terminos) ? terminos : [];
  const textoNormalizado = normalizar(texto).trim();

  // Búsqueda vacía/solo espacios: no se filtra, se devuelven todas las entradas.
  if (textoNormalizado.length === 0) {
    return entradas.filter((entrada) => entrada != null);
  }

  return entradas.filter((entrada) => coincide(entrada, textoNormalizado));
}
