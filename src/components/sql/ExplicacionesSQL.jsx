/**
 * Explicaciones de SQL con ejemplos (ExplicacionesSQL) — R8.
 *
 * Renderiza un conjunto de tarjetas de explicación de las operaciones SQL más
 * relevantes para interpretar consultas en Amazon Athena, cada una aplicada al
 * Dataset_Ejemplo (NYC Yellow Taxi, enero 2024). Las tarjetas cubren:
 *
 *   - SELECT, WHERE, COUNT, GROUP BY y ORDER BY, con ejemplos sobre el dataset
 *     (R8.1).
 *   - JOIN, indicando cuándo se requiere una segunda tabla y cómo interpretar
 *     las claves (R8.2).
 *   - Agregaciones aplicadas al dataset (R8.3).
 *   - Vistas, distinguiendo la lógica SQL del consumo analítico (R8.4).
 *
 * Cada ejemplo SQL lleva, de forma permanente, una nota que indica que se trata
 * de un ejemplo didáctico sujeto a comprobación del esquema y de los tipos
 * reales antes de su uso en producción (R8.5).
 *
 * Seguridad (R23.4): el SQL se muestra con elementos `<pre>`/`<code>` y texto
 * plano; NO se usa `dangerouslySetInnerHTML`. Todo el contenido es estático y
 * controlado por el proyecto. La diferenciación de estilos se logra mediante
 * clases CSS (tema completo en la tarea 13.1).
 *
 * Requisitos cubiertos: 8.1, 8.2, 8.3, 8.4, 8.5.
 */

import './ExplicacionesSQL.css';
import { META_DATASET } from '../../data/dataset/campos.js';

/**
 * Nota permanente que acompaña a cada ejemplo SQL (R8.5).
 *
 * @type {string}
 */
export const NOTA_EJEMPLO_DIDACTICO = Object.freeze(
  'Ejemplo didáctico. Antes de usarlo en un entorno de producción, compruebe ' +
    'el esquema y los tipos reales de la tabla (nombres de columnas, tipos de ' +
    'datos, nulos y valores codificados) contra el diccionario de datos ' +
    'oficial.',
);

/**
 * Contenido de las tarjetas de explicación de SQL.
 *
 * Cada entrada describe una operación o concepto SQL con:
 *  - `id`: identificador estable para la clave de React y anclas.
 *  - `titulo`: nombre visible de la operación/concepto.
 *  - `explicacion`: explicación didáctica breve.
 *  - `sql`: ejemplo SQL en texto plano sobre el Dataset_Ejemplo.
 *  - `nota` (opcional): nota adicional específica del concepto (p. ej. JOIN,
 *    vistas), además de la nota permanente de ejemplo didáctico.
 *
 * @type {ReadonlyArray<{
 *   id: string,
 *   titulo: string,
 *   explicacion: string,
 *   sql: string,
 *   nota?: string
 * }>}
 */
export const TARJETAS_SQL = Object.freeze([
  Object.freeze({
    id: 'select',
    titulo: 'SELECT',
    explicacion:
      'SELECT indica qué columnas (o expresiones) se quieren obtener de una ' +
      'tabla. FROM nombra la tabla de origen. Es la base de toda consulta de ' +
      'lectura.',
    sql: [
      'SELECT tpep_pickup_datetime,',
      '       passenger_count,',
      '       total_amount',
      'FROM yellow_taxi;',
    ].join('\n'),
  }),
  Object.freeze({
    id: 'where',
    titulo: 'WHERE',
    explicacion:
      'WHERE filtra las filas según una condición: solo pasan las que la ' +
      'cumplen. Reduce la población analizada antes de agrupar o agregar.',
    sql: [
      'SELECT tpep_pickup_datetime,',
      '       trip_distance,',
      '       total_amount',
      'FROM yellow_taxi',
      'WHERE trip_distance > 5',
      '  AND payment_type = 1;',
    ].join('\n'),
  }),
  Object.freeze({
    id: 'count',
    titulo: 'COUNT',
    explicacion:
      'COUNT cuenta filas. COUNT(*) cuenta todas las filas que llegan a la ' +
      'agregación; COUNT(columna) cuenta solo las que tienen valor no nulo en ' +
      'esa columna.',
    sql: [
      'SELECT COUNT(*) AS total_viajes',
      'FROM yellow_taxi',
      "WHERE tpep_pickup_datetime >= TIMESTAMP '2024-01-01 00:00:00'",
      "  AND tpep_pickup_datetime <  TIMESTAMP '2024-02-01 00:00:00';",
    ].join('\n'),
  }),
  Object.freeze({
    id: 'group-by',
    titulo: 'GROUP BY',
    explicacion:
      'GROUP BY agrupa las filas por los valores de una o más columnas y ' +
      'permite calcular una agregación por cada grupo (por ejemplo, un total ' +
      'por método de pago).',
    sql: [
      'SELECT payment_type,',
      '       COUNT(*) AS viajes,',
      '       SUM(total_amount) AS importe_total',
      'FROM yellow_taxi',
      'GROUP BY payment_type;',
    ].join('\n'),
  }),
  Object.freeze({
    id: 'order-by',
    titulo: 'ORDER BY',
    explicacion:
      'ORDER BY ordena el resultado por una o más columnas, de forma ' +
      'ascendente (ASC, por defecto) o descendente (DESC). No cambia los datos, ' +
      'solo su presentación.',
    sql: [
      'SELECT payment_type,',
      '       SUM(total_amount) AS importe_total',
      'FROM yellow_taxi',
      'GROUP BY payment_type',
      'ORDER BY importe_total DESC;',
    ].join('\n'),
  }),
  Object.freeze({
    id: 'join',
    titulo: 'JOIN',
    explicacion:
      'JOIN combina filas de dos tablas relacionadas. Se necesita una segunda ' +
      'tabla cuando el dato que busca no está en la tabla principal: por ' +
      'ejemplo, para traducir el código de payment_type a su descripción desde ' +
      'una tabla de referencia. La condición ON empareja las claves: la clave ' +
      'de la tabla de hechos (yellow_taxi.payment_type) con la clave de la ' +
      'tabla de referencia (payment_lookup.payment_type).',
    sql: [
      'SELECT t.tpep_pickup_datetime,',
      '       t.total_amount,',
      '       p.descripcion AS metodo_pago',
      'FROM yellow_taxi AS t',
      'JOIN payment_lookup AS p',
      '  ON t.payment_type = p.payment_type;',
    ].join('\n'),
    nota:
      'Una segunda tabla es necesaria cuando el dato buscado no vive en la ' +
      'tabla principal. Lea la condición ON como "qué columna de una tabla se ' +
      'corresponde con qué columna de la otra": esas columnas son las claves ' +
      'que relacionan ambas tablas.',
  }),
  Object.freeze({
    id: 'agregaciones',
    titulo: 'Agregaciones',
    explicacion:
      'Las funciones de agregación resumen muchas filas en un único valor: ' +
      'SUM (suma), AVG (promedio), MIN y MAX (extremos) y COUNT (conteo). ' +
      'Combinadas con GROUP BY producen un resumen por grupo; sin GROUP BY ' +
      'resumen toda la población filtrada.',
    sql: [
      'SELECT COUNT(*)            AS total_viajes,',
      '       SUM(total_amount)   AS importe_total,',
      '       AVG(trip_distance)  AS distancia_media,',
      '       MAX(total_amount)   AS importe_maximo',
      'FROM yellow_taxi;',
    ].join('\n'),
  }),
  Object.freeze({
    id: 'vistas',
    titulo: 'Vistas (VIEW)',
    explicacion:
      'Una vista es una consulta guardada con un nombre: encapsula la lógica ' +
      'SQL (joins, filtros, agregaciones) para reutilizarla. No almacena datos ' +
      'propios; se recalcula al consultarla.',
    sql: [
      'CREATE VIEW resumen_pagos AS',
      'SELECT payment_type,',
      '       COUNT(*) AS viajes,',
      '       SUM(total_amount) AS importe_total',
      'FROM yellow_taxi',
      'GROUP BY payment_type;',
      '',
      '-- Consumo analítico posterior:',
      'SELECT * FROM resumen_pagos ORDER BY importe_total DESC;',
    ].join('\n'),
    nota:
      'Distinga dos planos: la lógica SQL (cómo se definen las ' +
      'transformaciones dentro de la vista) y el consumo analítico (cómo una ' +
      'herramienta como Amazon Quick lee la vista como si fuera una tabla para ' +
      'construir KPIs, gráficos y filtros). La vista centraliza la lógica; el ' +
      'consumo se concentra en el análisis.',
  }),
]);

/**
 * Tarjeta individual de explicación de una operación SQL.
 *
 * @param {object} props
 * @param {{ id: string, titulo: string, explicacion: string, sql: string, nota?: string }} props.tarjeta
 * @returns {import('react').ReactElement}
 */
function TarjetaSQL({ tarjeta }) {
  const { id, titulo, explicacion, sql, nota } = tarjeta;
  const tituloId = `sql-tarjeta-${id}-titulo`;

  return (
    <article
      className="explicaciones-sql__tarjeta"
      aria-labelledby={tituloId}
    >
      <h3 className="explicaciones-sql__titulo" id={tituloId}>
        {titulo}
      </h3>
      <p className="explicaciones-sql__explicacion">{explicacion}</p>

      <figure className="explicaciones-sql__ejemplo">
        <figcaption className="explicaciones-sql__ejemplo-titulo">
          Ejemplo sobre el {META_DATASET.titulo}
        </figcaption>
        <pre className="explicaciones-sql__codigo">
          <code>{sql}</code>
        </pre>
      </figure>

      {nota ? <p className="explicaciones-sql__nota-concepto">{nota}</p> : null}

      <p className="explicaciones-sql__nota-didactica" role="note">
        {NOTA_EJEMPLO_DIDACTICO}
      </p>
    </article>
  );
}

/**
 * Sección de explicaciones de SQL con ejemplos aplicados al Dataset_Ejemplo.
 *
 * @param {object} [props]
 * @param {string} [props.className] - Clases CSS adicionales opcionales.
 * @returns {import('react').ReactElement}
 */
export default function ExplicacionesSQL({ className = '' }) {
  const clases = ['explicaciones-sql', className].filter(Boolean).join(' ');

  return (
    <section className={clases} aria-label="Explicaciones de SQL con ejemplos">
      <header className="explicaciones-sql__encabezado">
        <h2 className="explicaciones-sql__encabezado-titulo">
          Explicaciones de SQL con ejemplos
        </h2>
        <p className="explicaciones-sql__encabezado-subtitulo">
          Operaciones básicas para interpretar consultas en Amazon Athena,
          aplicadas al {META_DATASET.titulo} ({META_DATASET.periodo}).
        </p>
      </header>

      <div className="explicaciones-sql__tarjetas">
        {TARJETAS_SQL.map((tarjeta) => (
          <TarjetaSQL key={tarjeta.id} tarjeta={tarjeta} />
        ))}
      </div>
    </section>
  );
}
