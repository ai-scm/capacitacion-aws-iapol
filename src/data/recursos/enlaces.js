// Feature: capacitacion-aws-iapol
//
// Enlaces del Centro de Recursos (contenido estático, dominio de datos).
//
// Cada entrada tiene la forma { titulo, url, descripcion? } y apunta a
// documentación oficial. Los enlaces se abren en una pestaña distinta a la
// Plataforma (el componente CentroRecursos usa target="_blank" y
// rel="noopener noreferrer", R16.2). No hay conexiones en tiempo de ejecución:
// solo se abren cuando el usuario lo solicita explícitamente.
//
// Requirements: 16.1, 16.3

/**
 * @typedef {Object} EnlaceRecurso
 * @property {string} titulo - Título visible del recurso.
 * @property {string} url - URL oficial del recurso.
 * @property {string} [descripcion] - Descripción breve del recurso.
 */

/**
 * Nota que indica que los enlaces son fuentes de consulta que deben revisarse
 * para confirmar funciones, permisos y pasos exactos (R16.3).
 * @type {string}
 */
export const notaFuentes =
  'Estos enlaces son fuentes de consulta oficiales que deben revisarse para confirmar funciones, permisos y pasos exactos, ya que los servicios y sus interfaces pueden cambiar con el tiempo.';

/**
 * Enlaces a documentación oficial. Incluye obligatoriamente NYC TLC Trip Record
 * Data, Amazon Athena y Amazon Quick (QuickSight) (R16.1).
 * @type {EnlaceRecurso[]}
 */
export const enlaces = [
  {
    titulo: 'NYC TLC Trip Record Data',
    url: 'https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page',
    descripcion:
      'Página oficial de la Comisión de Taxis y Limusinas de Nueva York (NYC TLC) con los registros de viajes, origen del dataset de ejemplo usado en el curso.',
  },
  {
    titulo: 'Documentación de Amazon Athena',
    url: 'https://docs.aws.amazon.com/athena/latest/ug/what-is.html',
    descripcion:
      'Guía del usuario oficial de Amazon Athena: consultas SQL sin servidor sobre datos en Amazon S3, workgroups e integración con el Glue Data Catalog.',
  },
  {
    titulo: 'Documentación de Amazon QuickSight (Amazon Quick)',
    url: 'https://docs.aws.amazon.com/quicksight/latest/user/welcome.html',
    descripcion:
      'Guía del usuario oficial de Amazon QuickSight: fuentes de datos, datasets, análisis, dashboards, SPICE y Direct Query.',
  },
];

export default enlaces;
