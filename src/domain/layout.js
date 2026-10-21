/**
 * Cálculo de layout 16:9 (lógica pura).
 *
 * Dado un contenedor con ancho y alto positivos, calcula las dimensiones de la
 * diapositiva de modo que:
 *   - conserve la relación de aspecto 16:9 (nominal 1.778) con una tolerancia
 *     máxima del 1% (R2.1), y
 *   - no exceda ni el ancho ni el alto del contenedor en ningún eje, de forma
 *     que la diapositiva encaje por completo generando letterboxing (bordes
 *     arriba/abajo) o pillarboxing (bordes a los lados) sin recortar ni
 *     deformar el contenido (R2.2, R2.3).
 *
 * El ajuste es el estándar "contain": se compara la relación del contenedor con
 * 16/9 y se restringe por el eje limitante. Además se devuelven los desfases
 * (offsets) para centrar la diapositiva dentro del contenedor.
 *
 * Funciones puras, exportaciones ESM. Sin dependencias del DOM ni de AWS/IAPOL.
 *
 * Requirements: 2.1, 2.2, 2.3.
 * Property 2: El ajuste conserva la relación 16:9 y encaja dentro del contenedor.
 */

/**
 * Relación de aspecto objetivo 16:9.
 *
 * @type {number}
 */
export const RELACION_16_9 = 16 / 9;

/**
 * @typedef {Object} DimensionesDiapositiva
 * @property {number} ancho Ancho calculado de la diapositiva (≤ ancho del contenedor).
 * @property {number} alto Alto calculado de la diapositiva (≤ alto del contenedor).
 * @property {number} desfaseX Desfase horizontal para centrar (pillarboxing).
 * @property {number} desfaseY Desfase vertical para centrar (letterboxing).
 */

/**
 * Calcula las dimensiones 16:9 de una diapositiva que encajan dentro de un
 * contenedor, conservando la relación de aspecto y centrando el resultado.
 *
 * Si el contenedor es más ancho que 16:9, el alto es el eje limitante
 * (pillarboxing: bordes laterales). Si es más alto, el ancho es el eje
 * limitante (letterboxing: bordes arriba/abajo). Para entradas no positivas o
 * no numéricas se devuelven dimensiones nulas (sin diapositiva que ajustar).
 *
 * @param {number} anchoContenedor Ancho disponible del contenedor (> 0).
 * @param {number} altoContenedor Alto disponible del contenedor (> 0).
 * @returns {DimensionesDiapositiva} Dimensiones y desfases de centrado.
 */
export function calcularDimensiones16x9(anchoContenedor, altoContenedor) {
  const ancho = Number(anchoContenedor);
  const alto = Number(altoContenedor);

  // Entrada inválida: sin espacio positivo no hay diapositiva que ajustar.
  if (!(ancho > 0) || !(alto > 0)) {
    return { ancho: 0, alto: 0, desfaseX: 0, desfaseY: 0 };
  }

  const relacionContenedor = ancho / alto;

  let anchoDiapositiva;
  let altoDiapositiva;

  if (relacionContenedor > RELACION_16_9) {
    // Contenedor más ancho que 16:9: el alto limita; aparecen bordes laterales.
    altoDiapositiva = alto;
    anchoDiapositiva = alto * RELACION_16_9;
  } else {
    // Contenedor igual o más alto que 16:9: el ancho limita; bordes arriba/abajo.
    anchoDiapositiva = ancho;
    altoDiapositiva = ancho / RELACION_16_9;
  }

  // Centrado: espacio sobrante repartido a ambos lados del eje no limitante.
  const desfaseX = (ancho - anchoDiapositiva) / 2;
  const desfaseY = (alto - altoDiapositiva) / 2;

  return {
    ancho: anchoDiapositiva,
    alto: altoDiapositiva,
    desfaseX,
    desfaseY,
  };
}
