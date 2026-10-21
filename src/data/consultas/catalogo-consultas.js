// Feature: capacitacion-aws-iapol
//
// Catálogo de consultas demo del Laboratorio SQL (R9.1).
//
// Define entre 5 y 20 (aquí 10) consultas SQL predefinidas sobre el
// Dataset_Ejemplo (NYC Yellow Taxi, enero 2024, subconjunto sintético). Cada
// entrada es una `ConsultaDemo` con:
//  - `id`: identificador único estable usado por `resolverConsulta`.
//  - `etiqueta`: nombre legible en español para el selector de consultas.
//  - `sql`: texto SQL SOLO VISUAL. El motor NO ejecuta ni interpreta este SQL;
//    el Laboratorio mapea el `id` al `resultado` precalculado (R9.2, R9.6).
//  - `resultado`: columnas y filas precalculadas que se muestran al ejecutar.
//
// Los resultados precalculados se derivaron del subconjunto empaquetado en
// `nyc_taxi_demo.json` (320 registros) para que sean coherentes con el dataset;
// no obstante, son datos de ejemplo/Simulación local y no provienen de Athena.
//
// Campos del dataset: tpep_pickup_datetime, payment_type, passenger_count,
// trip_distance, total_amount.
//
// Exportaciones ESM. Consumible por `resolverConsulta(id, catalogo)` en
// `src/domain/consultas.js`.
//
// Requirements: 9.1

/**
 * @typedef {import('../../domain/consultas.js').ConsultaDemo} ConsultaDemo
 */

/**
 * Catálogo de consultas demo del Laboratorio SQL.
 *
 * @type {ReadonlyArray<ConsultaDemo>}
 */
export const CATALOGO_CONSULTAS = Object.freeze([
  Object.freeze({
    id: 'total-viajes',
    etiqueta: 'Total de viajes del dataset',
    sql: 'SELECT COUNT(*) AS total_viajes\nFROM yellow_taxi;',
    resultado: Object.freeze({
      columnas: Object.freeze(['total_viajes']),
      filas: Object.freeze([Object.freeze([320])]),
    }),
  }),
  Object.freeze({
    id: 'viajes-por-tipo-pago',
    etiqueta: 'Cantidad de viajes por tipo de pago',
    sql:
      'SELECT payment_type, COUNT(*) AS viajes\n' +
      'FROM yellow_taxi\n' +
      'GROUP BY payment_type\n' +
      'ORDER BY viajes DESC;',
    resultado: Object.freeze({
      columnas: Object.freeze(['payment_type', 'viajes']),
      filas: Object.freeze([
        Object.freeze([1, 189]),
        Object.freeze([2, 90]),
        Object.freeze([3, 24]),
        Object.freeze([4, 17]),
      ]),
    }),
  }),
  Object.freeze({
    id: 'distancia-promedio',
    etiqueta: 'Distancia promedio de viaje (millas)',
    sql:
      'SELECT ROUND(AVG(trip_distance), 2) AS distancia_promedio_millas\n' +
      'FROM yellow_taxi;',
    resultado: Object.freeze({
      columnas: Object.freeze(['distancia_promedio_millas']),
      filas: Object.freeze([Object.freeze([4.29])]),
    }),
  }),
  Object.freeze({
    id: 'importe-total-recaudado',
    etiqueta: 'Importe total recaudado (USD)',
    sql:
      'SELECT ROUND(SUM(total_amount), 2) AS importe_total_usd\n' +
      'FROM yellow_taxi;',
    resultado: Object.freeze({
      columnas: Object.freeze(['importe_total_usd']),
      filas: Object.freeze([Object.freeze([5282.61])]),
    }),
  }),
  Object.freeze({
    id: 'metricas-por-tipo-pago',
    etiqueta: 'Distancia e importe promedio por tipo de pago',
    sql:
      'SELECT payment_type,\n' +
      '       COUNT(*) AS viajes,\n' +
      '       ROUND(AVG(trip_distance), 2) AS distancia_promedio,\n' +
      '       ROUND(AVG(total_amount), 2) AS importe_promedio\n' +
      'FROM yellow_taxi\n' +
      'GROUP BY payment_type\n' +
      'ORDER BY payment_type;',
    resultado: Object.freeze({
      columnas: Object.freeze([
        'payment_type',
        'viajes',
        'distancia_promedio',
        'importe_promedio',
      ]),
      filas: Object.freeze([
        Object.freeze([1, 189, 3.91, 18.49]),
        Object.freeze([2, 90, 5.33, 19.38]),
        Object.freeze([3, 24, 4.34, 0]),
        Object.freeze([4, 17, 2.91, 2.64]),
      ]),
    }),
  }),
  Object.freeze({
    id: 'top-10-viajes-importe',
    etiqueta: 'Top 10 viajes por importe total (ORDER BY)',
    sql:
      'SELECT tpep_pickup_datetime, trip_distance, total_amount\n' +
      'FROM yellow_taxi\n' +
      'ORDER BY total_amount DESC\n' +
      'LIMIT 10;',
    resultado: Object.freeze({
      columnas: Object.freeze([
        'tpep_pickup_datetime',
        'trip_distance',
        'total_amount',
      ]),
      filas: Object.freeze([
        Object.freeze(['2024-01-07T04:23:31', 21.4, 75.74]),
        Object.freeze(['2024-01-19T11:27:34', 21.94, 75.68]),
        Object.freeze(['2024-01-28T09:39:11', 21.74, 74.28]),
        Object.freeze(['2024-01-31T04:08:59', 19.99, 69.37]),
        Object.freeze(['2024-01-31T10:05:59', 19.75, 68.16]),
        Object.freeze(['2024-01-16T09:30:48', 18.4, 64.9]),
        Object.freeze(['2024-01-23T09:21:14', 21.89, 62.03]),
        Object.freeze(['2024-01-18T01:12:25', 21.99, 60.77]),
        Object.freeze(['2024-01-10T09:00:00', 17.53, 60.81]),
        Object.freeze(['2024-01-17T20:01:31', 21.68, 60]),
      ]),
    }),
  }),
  Object.freeze({
    id: 'viajes-largos',
    etiqueta: 'Viajes largos: más de 10 millas (WHERE)',
    sql:
      'SELECT COUNT(*) AS viajes_largos,\n' +
      '       ROUND(AVG(total_amount), 2) AS importe_promedio\n' +
      'FROM yellow_taxi\n' +
      'WHERE trip_distance > 10;',
    resultado: Object.freeze({
      columnas: Object.freeze(['viajes_largos', 'importe_promedio']),
      filas: Object.freeze([Object.freeze([32, 46.99])]),
    }),
  }),
  Object.freeze({
    id: 'viajes-en-efectivo',
    etiqueta: 'Viajes pagados en efectivo (WHERE payment_type = 2)',
    sql:
      'SELECT COUNT(*) AS viajes_efectivo\n' +
      'FROM yellow_taxi\n' +
      'WHERE payment_type = 2;',
    resultado: Object.freeze({
      columnas: Object.freeze(['viajes_efectivo']),
      filas: Object.freeze([Object.freeze([90])]),
    }),
  }),
  Object.freeze({
    id: 'viajes-por-dia-primera-semana',
    etiqueta: 'Viajes por día (primera semana de enero)',
    sql:
      "SELECT CAST(tpep_pickup_datetime AS DATE) AS dia,\n" +
      '       COUNT(*) AS viajes\n' +
      'FROM yellow_taxi\n' +
      "WHERE tpep_pickup_datetime >= TIMESTAMP '2024-01-01 00:00:00'\n" +
      "  AND tpep_pickup_datetime <  TIMESTAMP '2024-01-08 00:00:00'\n" +
      'GROUP BY CAST(tpep_pickup_datetime AS DATE)\n' +
      'ORDER BY dia;',
    resultado: Object.freeze({
      columnas: Object.freeze(['dia', 'viajes']),
      filas: Object.freeze([
        Object.freeze(['2024-01-01', 9]),
        Object.freeze(['2024-01-02', 11]),
        Object.freeze(['2024-01-03', 5]),
        Object.freeze(['2024-01-04', 5]),
        Object.freeze(['2024-01-05', 11]),
        Object.freeze(['2024-01-06', 16]),
        Object.freeze(['2024-01-07', 12]),
      ]),
    }),
  }),
  Object.freeze({
    id: 'distribucion-por-hora',
    etiqueta: 'Distribución de viajes por hora de recogida',
    sql:
      'SELECT HOUR(tpep_pickup_datetime) AS hora,\n' +
      '       COUNT(*) AS viajes\n' +
      'FROM yellow_taxi\n' +
      'GROUP BY HOUR(tpep_pickup_datetime)\n' +
      'ORDER BY hora;',
    resultado: Object.freeze({
      columnas: Object.freeze(['hora', 'viajes']),
      filas: Object.freeze([
        Object.freeze([0, 16]),
        Object.freeze([1, 11]),
        Object.freeze([2, 6]),
        Object.freeze([3, 12]),
        Object.freeze([4, 13]),
        Object.freeze([5, 10]),
        Object.freeze([6, 12]),
        Object.freeze([7, 9]),
        Object.freeze([8, 22]),
        Object.freeze([9, 27]),
        Object.freeze([10, 12]),
        Object.freeze([11, 9]),
        Object.freeze([12, 11]),
        Object.freeze([13, 12]),
        Object.freeze([14, 9]),
        Object.freeze([15, 9]),
        Object.freeze([16, 9]),
        Object.freeze([17, 24]),
        Object.freeze([18, 29]),
        Object.freeze([19, 16]),
        Object.freeze([20, 17]),
        Object.freeze([21, 4]),
        Object.freeze([22, 11]),
        Object.freeze([23, 10]),
      ]),
    }),
  }),
]);

export default CATALOGO_CONSULTAS;
