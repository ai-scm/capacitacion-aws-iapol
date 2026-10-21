/**
 * Banderas de características (feature flags) controlables desde el código.
 *
 * Centraliza interruptores de visibilidad que el equipo puede alternar sin
 * tocar la lógica de las vistas. Son constantes en tiempo de compilación: para
 * cambiar su valor se edita este archivo y se reconstruye el bundle (no hay
 * configuración en tiempo de ejecución ni variables de entorno expuestas).
 *
 * @module config/caracteristicas
 */

/**
 * Controla si la vista/menú "Evaluación" está visible en la Plataforma.
 *
 * Por defecto es `false` (oculta): ni aparece en la navegación principal ni es
 * accesible como vista. Para habilitarla, cambiar este valor a `true` y volver
 * a construir la aplicación.
 *
 * @type {boolean}
 */
export const EVALUACION_VISIBLE = false;
