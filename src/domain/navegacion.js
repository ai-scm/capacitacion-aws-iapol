/**
 * Motor de navegación (lógica pura).
 *
 * Calcula el índice de la diapositiva siguiente/anterior aplicando clamp al
 * rango válido `[0, total-1]`, de modo que la navegación nunca salga de rango
 * y se mueva a lo sumo una diapositiva por operación.
 *
 * Requisitos cubiertos: 3.1, 3.2, 3.3, 3.4.
 * Property 1: La navegación nunca sale de rango y se mueve a lo sumo una diapositiva.
 */

/**
 * Restringe un valor al rango cerrado `[min, max]`.
 *
 * @param {number} valor - Valor a acotar.
 * @param {number} min - Límite inferior inclusivo.
 * @param {number} max - Límite superior inclusivo.
 * @returns {number} El valor acotado a `[min, max]`.
 */
function clamp(valor, min, max) {
  if (valor < min) return min;
  if (valor > max) return max;
  return valor;
}

/**
 * Devuelve el índice de la diapositiva siguiente.
 *
 * Avanza una posición (indice + 1) salvo cuando ya se está en la última
 * diapositiva, en cuyo caso permanece en la última. El resultado siempre
 * está dentro de `[0, total-1]` para `total >= 1`.
 *
 * @param {number} indice - Índice actual (se asume dentro de `[0, total-1]`).
 * @param {number} total - Cantidad total de diapositivas (>= 1).
 * @returns {number} El índice siguiente acotado a `[0, total-1]`.
 */
export function siguienteIndice(indice, total) {
  return clamp(indice + 1, 0, total - 1);
}

/**
 * Devuelve el índice de la diapositiva anterior.
 *
 * Retrocede una posición (indice - 1) salvo cuando ya se está en la primera
 * diapositiva, en cuyo caso permanece en la primera. El resultado siempre
 * está dentro de `[0, total-1]` para `total >= 1`.
 *
 * @param {number} indice - Índice actual (se asume dentro de `[0, total-1]`).
 * @param {number} total - Cantidad total de diapositivas (>= 1).
 * @returns {number} El índice anterior acotado a `[0, total-1]`.
 */
export function anteriorIndice(indice, total) {
  return clamp(indice - 1, 0, total - 1);
}
