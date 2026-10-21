/**
 * Formateo de tiempo para el Modo_Presentador.
 *
 * Función pura, sin dependencias de React, para mostrar el tiempo transcurrido
 * del temporizador como texto de reloj. Se extrae a su propio módulo para que el
 * componente `Temporizador` solo exporte el componente (compatibilidad con
 * React Fast Refresh) y para poder probar el formateo de forma aislada.
 *
 * Requisitos cubiertos: 5.3.
 *
 * @module components/presentador/tiempo
 */

/**
 * Formatea una cantidad de milisegundos como texto de reloj.
 *
 * Usa `mm:ss` cuando el tiempo es inferior a una hora y `hh:mm:ss` a partir de
 * una hora. Los minutos y segundos se rellenan a dos dígitos; las horas se
 * muestran sin relleno. Valores no finitos o negativos se tratan como cero, de
 * modo que la función siempre devuelve una cadena válida.
 *
 * @param {number} ms - Tiempo transcurrido en milisegundos.
 * @returns {string} El tiempo formateado (`mm:ss` o `hh:mm:ss`).
 */
export function formatearTiempo(ms) {
  const totalMs = Number.isFinite(ms) && ms > 0 ? ms : 0;
  const totalSegundos = Math.floor(totalMs / 1000);
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;

  const mm = String(minutos).padStart(2, '0');
  const ss = String(segundos).padStart(2, '0');

  if (horas > 0) {
    return `${horas}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}
