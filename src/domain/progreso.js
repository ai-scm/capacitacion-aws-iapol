/**
 * Servicio de progreso (lógica pura): serialización, validación y reset.
 *
 * Define el formato persistible del avance del usuario y sus operaciones puras
 * de ida y vuelta con fallo seguro ante corrupción. No toca `localStorage`
 * directamente (eso lo hace `ProgresoContext`): aquí solo se transforma el
 * modelo a/desde texto y se valida su forma.
 *
 * Modelo `Progreso`:
 *   {
 *     version: 1,
 *     sesiones: {
 *       [sesionId]: { ultimaDiapositiva: number, completada: boolean }
 *     },
 *     evaluacion: { puntuacion: number | null }
 *   }
 *
 * Clave de almacenamiento (referencia, usada por ProgresoContext):
 * `capacitacion-aws-iapol:v1`.
 *
 * Todas las funciones son puras: no mutan sus argumentos ni mantienen estado.
 *
 * Requisitos cubiertos: 15.2, 15.3, 15.4.
 * Property 14: `deserializarProgreso(serializarProgreso(p))` recupera un progreso
 *   equivalente a `p` (round-trip).
 * Property 15: para cualquier cadena que no represente un progreso válido,
 *   `deserializarProgreso` devuelve fallo sin lanzar (fallo seguro).
 * Property 16: el restablecimiento produce el estado inicial y es idempotente.
 */

/**
 * Versión del formato de progreso soportada por este servicio.
 *
 * @type {number}
 */
export const VERSION_PROGRESO = 1;

/**
 * Devuelve el estado de avance inicial (progreso a cero).
 *
 * Se construye uno nuevo en cada llamada para evitar aliasing/mutación
 * accidental del estado compartido.
 *
 * @returns {{version: number, sesiones: Record<string, {ultimaDiapositiva: number, completada: boolean}>, evaluacion: {puntuacion: number | null}}}
 *   Un progreso nuevo con `version === 1`, sin sesiones y sin puntuación.
 */
export function estadoInicialProgreso() {
  return {
    version: VERSION_PROGRESO,
    sesiones: {},
    evaluacion: { puntuacion: null },
  };
}

/**
 * Indica si un valor es un objeto plano (no `null`, no arreglo).
 *
 * @param {unknown} valor - Valor a inspeccionar.
 * @returns {boolean} `true` si es un objeto no nulo y no un arreglo.
 */
function esObjetoPlano(valor) {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

/**
 * Valida la entrada de una sesión: `{ ultimaDiapositiva: number, completada: boolean }`.
 *
 * @param {unknown} entrada - Entrada candidata de una sesión.
 * @returns {boolean} `true` si la forma es válida.
 */
function esEntradaSesionValida(entrada) {
  if (!esObjetoPlano(entrada)) return false;
  return (
    typeof entrada.ultimaDiapositiva === 'number' &&
    Number.isFinite(entrada.ultimaDiapositiva) &&
    typeof entrada.completada === 'boolean'
  );
}

/**
 * Valida que un objeto cumpla el formato esperado del modelo `Progreso`.
 *
 * Reglas: `version === 1`; `sesiones` es un objeto cuyos valores son
 * `{ ultimaDiapositiva: number, completada: boolean }`; `evaluacion.puntuacion`
 * es `number` o `null`.
 *
 * @param {unknown} valor - Objeto candidato a progreso.
 * @returns {boolean} `true` si y solo si cumple el formato esperado.
 */
export function esProgresoValido(valor) {
  if (!esObjetoPlano(valor)) return false;

  if (valor.version !== VERSION_PROGRESO) return false;

  if (!esObjetoPlano(valor.sesiones)) return false;
  for (const entrada of Object.values(valor.sesiones)) {
    if (!esEntradaSesionValida(entrada)) return false;
  }

  if (!esObjetoPlano(valor.evaluacion)) return false;
  const { puntuacion } = valor.evaluacion;
  const puntuacionValida =
    puntuacion === null ||
    (typeof puntuacion === 'number' && Number.isFinite(puntuacion));
  if (!puntuacionValida) return false;

  return true;
}

/**
 * Serializa un progreso a su representación en texto (JSON).
 *
 * @param {object} progreso - Objeto de progreso a serializar.
 * @returns {string} La cadena JSON del progreso.
 */
export function serializarProgreso(progreso) {
  return JSON.stringify(progreso);
}

/**
 * Deserializa y valida un texto de progreso con fallo seguro ante corrupción.
 *
 * Nunca lanza: ante JSON malformado o una forma que no cumple el modelo
 * `Progreso`, devuelve `{ ok: false }`, lo que permite a la Plataforma
 * continuar con el estado de avance inicial (R15.4).
 *
 * @param {string} texto - Cadena a interpretar como progreso.
 * @returns {{ ok: true, progreso: object } | { ok: false }}
 *   `{ ok: true, progreso }` si el texto es un progreso válido; `{ ok: false }`
 *   en caso de corrupción o formato inválido.
 */
export function deserializarProgreso(texto) {
  if (typeof texto !== 'string') return { ok: false };

  let datos;
  try {
    datos = JSON.parse(texto);
  } catch {
    return { ok: false };
  }

  if (!esProgresoValido(datos)) return { ok: false };

  return { ok: true, progreso: datos };
}

/**
 * Restablece el progreso al estado de avance inicial.
 *
 * Es idempotente e ignora el argumento: para cualquier entrada (incluido un
 * progreso ya reiniciado) produce siempre el estado inicial, por lo que
 * reiniciar dos veces equivale a reiniciar una vez (Property 16).
 *
 * @param {object} [_progreso] - Progreso actual (ignorado; se acepta por ergonomía).
 * @returns {{version: number, sesiones: Record<string, {ultimaDiapositiva: number, completada: boolean}>, evaluacion: {puntuacion: number | null}}}
 *   El estado de avance inicial.
 */
// eslint-disable-next-line no-unused-vars
export function reiniciarProgreso(_progreso) {
  return estadoInicialProgreso();
}
