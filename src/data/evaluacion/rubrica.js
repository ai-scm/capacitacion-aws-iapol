/**
 * Rúbrica de evaluación: puntos máximos por área de contenido.
 *
 * Define la ponderación de las seis áreas de contenido del Motor_Evaluacion
 * sobre un total de 100 puntos, conforme al Requisito 13.1:
 *
 *   - flujo S3 → Athena → Quick ................... 15 puntos
 *   - interpretación de SQL ....................... 15 puntos
 *   - creación de análisis de tres hojas .......... 25 puntos
 *   - configuración de filtros y visualizaciones .. 15 puntos
 *   - publicación de dashboard en Quick ........... 15 puntos
 *   - localización de identificadores e IAPOL ..... 15 puntos
 *
 * La suma de las seis áreas es exactamente 100. Este objeto debe mantenerse
 * alineado con `RUBRICA_POR_DEFECTO` de `src/domain/puntuacion.js`, que consume
 * las mismas claves de área para prorratear la puntuación.
 *
 * Requisitos cubiertos: 13.1.
 *
 * @type {{flujo: number, sql: number, tres_hojas: number, filtros: number, publicacion: number, iapol: number}}
 */
export const RUBRICA = Object.freeze({
  flujo: 15,
  sql: 15,
  tres_hojas: 25,
  filtros: 15,
  publicacion: 15,
  iapol: 15,
});

export default RUBRICA;
