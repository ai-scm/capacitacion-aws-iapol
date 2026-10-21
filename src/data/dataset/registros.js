/**
 * Accesor del Dataset_Ejemplo (NYC Yellow Taxi, enero 2024).
 *
 * Expone el arreglo de registros empaquetado en `nyc_taxi_demo.json` como
 * fuente única de verdad para el Simulador_Dashboards y las hojas de análisis.
 * El JSON tiene la forma `{ _meta, registros: [...] }`; aquí se extrae y se
 * congela el arreglo `registros` para que los consumidores no puedan mutar el
 * dataset compartido.
 *
 * Cada registro (`RegistroViaje`) tiene la forma:
 *   {
 *     tpep_pickup_datetime: string (ISO 8601),
 *     payment_type: number (codificado),
 *     passenger_count: number,
 *     trip_distance: number,
 *     total_amount: number
 *   }
 *
 * ADVERTENCIA (R20.3/R20.4): son datos públicos de ejemplo
 * (subconjunto sintético/derivado); no son los registros oficiales de la NYC
 * TLC. Los filtros modifican la población analizada.
 */

import datasetJson from './nyc_taxi_demo.json';

/**
 * Metadatos del dataset tal como vienen en el archivo empaquetado.
 * @type {Readonly<object>}
 */
export const META_REGISTROS = Object.freeze({ ...datasetJson._meta });

/**
 * Registros del Dataset_Ejemplo (arreglo congelado, inmutable).
 * @type {ReadonlyArray<{
 *   tpep_pickup_datetime: string,
 *   payment_type: number,
 *   passenger_count: number,
 *   trip_distance: number,
 *   total_amount: number
 * }>}
 */
export const REGISTROS = Object.freeze(
  Array.isArray(datasetJson.registros) ? [...datasetJson.registros] : [],
);

export default REGISTROS;
