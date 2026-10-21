/**
 * Lógica del simulador de dashboards (funciones puras).
 *
 * Reúne dos piezas de dominio del Simulador_Dashboards:
 *
 *  1. Validación de la selección de campos: una selección es aceptable si y
 *     solo si contiene entre 1 y 3 campos válidos (distintos) del
 *     Dataset_Ejemplo. Se rechazan selecciones vacías, con más de 3 campos,
 *     con campos duplicados o con campos desconocidos.
 *  2. Restablecimiento de filtros: `resetFiltros()` devuelve el estado inicial
 *     "sin filtros" que representa el Dataset_Ejemplo completo. La operación es
 *     idempotente: aplicarla dos veces produce el mismo resultado que aplicarla
 *     una vez.
 *
 * Requisitos cubiertos: 10.1, 12.3.
 * Property 8: La selección de campos del simulador respeta el rango 1-3.
 * Property 10: El restablecimiento de filtros es idempotente y restaura el
 *              conjunto completo.
 */

/**
 * Campos válidos del Dataset_Ejemplo (NYC Yellow Taxi, enero 2024).
 *
 * Son las columnas que el Simulador_Dashboards ofrece para construir una
 * visualización (R20.2). Se exporta congelado para evitar mutaciones y para
 * que la UI pueda consumirlo como fuente única de verdad.
 *
 * @type {readonly string[]}
 */
export const CAMPOS_DATASET = Object.freeze([
  'tpep_pickup_datetime',
  'payment_type',
  'passenger_count',
  'trip_distance',
  'total_amount',
]);

/** Cantidad mínima de campos que admite una visualización. */
export const MIN_CAMPOS = 1;

/** Cantidad máxima de campos que admite una visualización. */
export const MAX_CAMPOS = 3;

/**
 * Valida una selección de campos del simulador.
 *
 * Acepta la selección si y solo si:
 *  - es un arreglo,
 *  - contiene entre {@link MIN_CAMPOS} y {@link MAX_CAMPOS} elementos,
 *  - no tiene campos duplicados,
 *  - todos sus campos pertenecen a los campos válidos del dataset.
 *
 * En cualquier otro caso la rechaza, indicando el motivo en `error`.
 *
 * @param {string[]} campos - Campos seleccionados por el participante.
 * @param {readonly string[]} [camposValidos=CAMPOS_DATASET] - Campos admitidos
 *        del Dataset_Ejemplo contra los que se valida la selección.
 * @returns {{ ok: boolean, error?: string }} Resultado de la validación.
 */
export function validarSeleccionCampos(campos, camposValidos = CAMPOS_DATASET) {
  if (!Array.isArray(campos)) {
    return { ok: false, error: 'La selección de campos debe ser una lista.' };
  }

  if (campos.length < MIN_CAMPOS) {
    return {
      ok: false,
      error: `Seleccione al menos ${MIN_CAMPOS} campo del Dataset_Ejemplo.`,
    };
  }

  if (campos.length > MAX_CAMPOS) {
    return {
      ok: false,
      error: `Seleccione como máximo ${MAX_CAMPOS} campos del Dataset_Ejemplo.`,
    };
  }

  const unicos = new Set(campos);
  if (unicos.size !== campos.length) {
    return { ok: false, error: 'La selección no debe contener campos duplicados.' };
  }

  const validos = new Set(camposValidos);
  const desconocido = campos.find((campo) => !validos.has(campo));
  if (desconocido !== undefined) {
    return {
      ok: false,
      error: `El campo "${desconocido}" no pertenece al Dataset_Ejemplo.`,
    };
  }

  return { ok: true };
}

/**
 * Crea el estado inicial de filtros "sin filtros".
 *
 * Representa el Dataset_Ejemplo completo: sin acotación de fechas. Se devuelve
 * un objeto nuevo en cada llamada para preservar la pureza (ningún consumidor
 * puede mutar un estado compartido).
 *
 * Forma del estado de filtros: `{ desde: null, hasta: null }`.
 *  - `desde`: límite inferior del rango de fechas (null = sin límite).
 *  - `hasta`: límite superior del rango de fechas (null = sin límite).
 *
 * @returns {{ desde: null, hasta: null }} Estado inicial de filtros.
 */
export function estadoInicialFiltros() {
  return { desde: null, hasta: null };
}

/**
 * Restablece los filtros al estado inicial "sin filtros".
 *
 * El restablecimiento no depende del estado de filtros previo: siempre produce
 * el mismo estado inicial. Esto hace la operación idempotente —el resultado de
 * `resetFiltros(resetFiltros())` es equivalente al de `resetFiltros()`— y
 * garantiza que la vista vuelva al conjunto completo del Dataset_Ejemplo
 * (R12.3). Por eso no recibe el estado actual como parámetro.
 *
 * @returns {{ desde: null, hasta: null }} Estado inicial de filtros.
 */
export function resetFiltros() {
  return estadoInicialFiltros();
}
