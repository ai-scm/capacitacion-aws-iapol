/**
 * Motor de puntuación (lógica pura).
 *
 * Calcula la puntuación total de la evaluación en una escala de 0 a 100 como la
 * suma de los puntos alcanzados en las seis áreas de contenido, cada una
 * ponderada según la rúbrica (flujo 15, sql 15, tres_hojas 25, filtros 15,
 * publicacion 15, iapol 15; suma = 100). Dentro de cada área la puntuación se
 * prorratea por la proporción de respuestas correctas. También evalúa si una
 * puntuación supera el umbral orientativo de aprobación.
 *
 * Requisitos cubiertos: 13.1, 13.4, 13.5, 13.6.
 * Property 11: La puntuación está en [0,100] y es la suma de las áreas.
 * Property 12: El umbral de aprobación es consistente con la puntuación.
 *
 * Forma de entrada (contrato con MotorEvaluacion, tarea 12.1):
 *
 *   respuestas: {
 *     flujo:       { correctas: number, total: number },
 *     sql:         { correctas: number, total: number },
 *     tres_hojas:  { correctas: number, total: number },
 *     filtros:     { correctas: number, total: number },
 *     publicacion: { correctas: number, total: number },
 *     iapol:       { correctas: number, total: number }
 *   }
 *
 *   Cada área reporta cuántas preguntas se respondieron correctamente
 *   (`correctas`) sobre cuántas preguntas tiene el área (`total`). Las áreas
 *   ausentes o con `total === 0` aportan 0 puntos (no hay preguntas que
 *   prorratear). `correctas` se acota a `[0, total]` para evitar que datos
 *   inconsistentes empujen el resultado fuera de `[0, 100]`.
 *
 *   rubrica: objeto que mapea cada área a sus puntos máximos. Por defecto se usa
 *   RUBRICA_POR_DEFECTO (15/15/25/15/15/15).
 */

/**
 * Rúbrica por defecto: puntos máximos por área de contenido (suma = 100).
 *
 * @type {{flujo: number, sql: number, tres_hojas: number, filtros: number, publicacion: number, iapol: number}}
 */
export const RUBRICA_POR_DEFECTO = Object.freeze({
  flujo: 15,
  sql: 15,
  tres_hojas: 25,
  filtros: 15,
  publicacion: 15,
  iapol: 15,
});

/**
 * Umbral orientativo de aprobación por defecto (sobre la escala 0–100).
 *
 * @type {number}
 */
export const UMBRAL_POR_DEFECTO = 80;

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
 * Calcula la puntuación de una única área prorrateando por aciertos.
 *
 * El resultado es `maximo * (correctas / total)`, acotando `correctas` a
 * `[0, total]`. Si el área no tiene preguntas (`total <= 0`) o no se proporcionó
 * su detalle, aporta 0 puntos.
 *
 * @param {{correctas?: number, total?: number} | undefined} detalle - Aciertos y total del área.
 * @param {number} maximo - Puntos máximos del área según la rúbrica.
 * @returns {number} Puntos obtenidos en el área, en `[0, maximo]`.
 */
function puntuacionArea(detalle, maximo) {
  if (!detalle) return 0;

  const total = Number(detalle.total) || 0;
  if (total <= 0) return 0;

  const correctas = clamp(Number(detalle.correctas) || 0, 0, total);
  return maximo * (correctas / total);
}

/**
 * Calcula la puntuación total de la evaluación en escala 0–100.
 *
 * Suma los puntos obtenidos en las seis áreas de contenido, prorrateando dentro
 * de cada área por la proporción de respuestas correctas sobre el total de
 * preguntas del área. El resultado se acota a `[0, 100]` por robustez frente a
 * entradas inconsistentes.
 *
 * @param {Record<string, {correctas?: number, total?: number}>} respuestas - Aciertos por área (ver encabezado del módulo).
 * @param {Record<string, number>} [rubrica=RUBRICA_POR_DEFECTO] - Puntos máximos por área.
 * @returns {number} La puntuación total en `[0, 100]`.
 */
export function calcularPuntuacion(respuestas, rubrica = RUBRICA_POR_DEFECTO) {
  const detalles = respuestas || {};

  const total = Object.keys(rubrica).reduce((acumulado, area) => {
    return acumulado + puntuacionArea(detalles[area], rubrica[area]);
  }, 0);

  return clamp(total, 0, 100);
}

/**
 * Indica si una puntuación supera (o iguala) el umbral orientativo de aprobación.
 *
 * @param {number} puntuacion - Puntuación en escala 0–100.
 * @param {number} [umbral=UMBRAL_POR_DEFECTO] - Umbral de aprobación (por defecto 80).
 * @returns {boolean} `true` si y solo si `puntuacion >= umbral`.
 */
export function superaUmbral(puntuacion, umbral = UMBRAL_POR_DEFECTO) {
  return puntuacion >= umbral;
}
