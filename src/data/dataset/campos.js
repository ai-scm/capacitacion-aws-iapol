/**
 * Catálogo de campos del Dataset_Ejemplo (NYC Yellow Taxi, enero 2024).
 *
 * Describe cada columna del subconjunto SINTÉTICO/DERIVADO empaquetado en
 * `nyc_taxi_demo.json`, usado como datos públicos de ejemplo con fines
 * educativos. El explorador de columnas y las explicaciones de SQL consumen
 * estas descripciones.
 *
 * ADVERTENCIA PERMANENTE (R20.3, R20.4): este dataset son datos públicos de
 * ejemplo. Los nombres, tipos, nulos y valores codificados deben confirmarse
 * contra los archivos y el diccionario de datos oficiales de la NYC TLC antes
 * de un laboratorio real. Además, cualquier filtro aplicado modifica la
 * población analizada y no representa la totalidad del origen.
 *
 * Requisitos cubiertos: 20.1, 20.2, 20.3, 20.4.
 */

/**
 * Advertencia permanente que la UI debe mostrar junto al Dataset_Ejemplo y a
 * las métricas derivadas de filtros (R20.3, R20.4).
 *
 * @type {string}
 */
export const ADVERTENCIA_DATASET = Object.freeze(
  'Datos públicos de ejemplo (subconjunto sintético/derivado). Los nombres, ' +
    'tipos, nulos y valores codificados deben confirmarse contra los archivos ' +
    'y el diccionario de datos oficiales de la NYC TLC antes de un laboratorio ' +
    'real. Los filtros modifican la población analizada y no representan la ' +
    'totalidad del origen.',
);

/**
 * Leyenda de los valores codificados de `payment_type`.
 *
 * NOTA: la codificación debe corroborarse contra el diccionario oficial de la
 * NYC TLC; aquí se usa una codificación de ejemplo coherente con el dataset
 * sintético empaquetado.
 *
 * @type {ReadonlyArray<{ codigo: number, etiqueta: string }>}
 */
export const LEYENDA_PAYMENT_TYPE = Object.freeze([
  Object.freeze({ codigo: 1, etiqueta: 'Tarjeta de crédito' }),
  Object.freeze({ codigo: 2, etiqueta: 'Efectivo' }),
  Object.freeze({ codigo: 3, etiqueta: 'Sin cargo' }),
  Object.freeze({ codigo: 4, etiqueta: 'Disputa' }),
]);

/**
 * Descripción de cada campo del Dataset_Ejemplo (R20.2).
 *
 * Cada entrada incluye:
 *  - `nombre`: nombre de la columna tal como aparece en el dataset.
 *  - `tipo`: tipo de dato de ejemplo (a confirmar contra el esquema oficial).
 *  - `descripcion`: explicación didáctica del campo.
 *  - `codificacion` (opcional): leyenda de valores codificados.
 *
 * @type {ReadonlyArray<{
 *   nombre: string,
 *   tipo: string,
 *   descripcion: string,
 *   codificacion?: ReadonlyArray<{ codigo: number, etiqueta: string }>
 * }>}
 */
export const CAMPOS_DATASET = Object.freeze([
  Object.freeze({
    nombre: 'tpep_pickup_datetime',
    tipo: 'timestamp (ISO 8601)',
    descripcion:
      'Fecha y hora de inicio del viaje (recogida del pasajero). En el ' +
      'dataset de ejemplo se expresa como cadena ISO 8601 sin zona horaria.',
  }),
  Object.freeze({
    nombre: 'payment_type',
    tipo: 'number (codificado)',
    descripcion:
      'Tipo de pago del viaje, representado mediante un código numérico. ' +
      'Consultar la leyenda para el significado de cada código.',
    codificacion: LEYENDA_PAYMENT_TYPE,
  }),
  Object.freeze({
    nombre: 'passenger_count',
    tipo: 'number (entero)',
    descripcion:
      'Cantidad de pasajeros del viaje, informada por el taxímetro/conductor. ' +
      'En el dataset de ejemplo toma valores entre 1 y 6.',
  }),
  Object.freeze({
    nombre: 'trip_distance',
    tipo: 'number (millas)',
    descripcion:
      'Distancia recorrida en el viaje, expresada en millas según el ' +
      'taxímetro.',
  }),
  Object.freeze({
    nombre: 'total_amount',
    tipo: 'number (USD)',
    descripcion:
      'Importe total cobrado al pasajero en dólares, incluyendo tarifa, ' +
      'recargos, impuestos y propina (cuando aplica). No incluye peajes de ' +
      'efectivo en el modelo de ejemplo.',
  }),
]);

/**
 * Metadatos del Dataset_Ejemplo para encabezados y notas de la UI (R20.1).
 *
 * @type {Readonly<{
 *   titulo: string,
 *   periodo: string,
 *   fuenteConceptual: string,
 *   naturaleza: string
 * }>}
 */
export const META_DATASET = Object.freeze({
  titulo: 'NYC Yellow Taxi Trip Records (ejemplo)',
  periodo: 'Enero de 2024',
  fuenteConceptual: 'NYC Taxi & Limousine Commission (TLC) Trip Record Data',
  naturaleza: 'Datos públicos de ejemplo (subconjunto sintético/derivado)',
});

export default CAMPOS_DATASET;
