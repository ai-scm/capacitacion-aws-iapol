// Feature: capacitacion-aws-iapol
//
// Términos del Glosario técnico (contenido estático, dominio de datos).
//
// Cada entrada tiene la forma { termino, definicion }. Esta forma coincide con
// lo que consume la búsqueda del Glosario (`src/domain/glosario.js`), que filtra
// por coincidencia de texto en `termino` o `definicion` (Property 13).
//
// Definiciones en español, pedagógicamente precisas. El contenido es local y no
// realiza conexiones a AWS ni a IAPOL.
//
// Requirements: 14.1

/**
 * @typedef {Object} TerminoGlosario
 * @property {string} termino - Nombre del término técnico.
 * @property {string} definicion - Definición del término en español.
 */

/**
 * Lista de términos del Glosario. Incluye obligatoriamente S3, Glue Data
 * Catalog, Athena, workgroup, Parquet, dataset, análisis, dashboard, SPICE,
 * Direct Query e IAPOL (R14.1), además de términos de apoyo relevantes.
 * @type {TerminoGlosario[]}
 */
export const terminos = [
  {
    termino: 'S3',
    definicion:
      'Amazon S3 (Simple Storage Service) es el servicio de almacenamiento de objetos de AWS. En este curso guarda los archivos del dataset de ejemplo (por ejemplo, en formato Parquet) que luego se consultan con Athena.',
  },
  {
    termino: 'Glue Data Catalog',
    definicion:
      'Catálogo de metadatos de AWS Glue. Registra las bases de datos, tablas, columnas y ubicaciones de los datos en S3, de modo que Athena sepa cómo interpretar los archivos al consultarlos con SQL.',
  },
  {
    termino: 'Athena',
    definicion:
      'Amazon Athena es un servicio de consultas SQL sin servidor que lee datos directamente desde S3 usando el esquema del Glue Data Catalog. Se paga por los datos escaneados en cada consulta y no requiere administrar infraestructura.',
  },
  {
    termino: 'workgroup',
    definicion:
      'Grupo de trabajo de Athena que aísla consultas, controla costos y define configuración común (como la ubicación de resultados en S3 y los límites de datos escaneados) para un conjunto de usuarios o cargas de trabajo.',
  },
  {
    termino: 'Parquet',
    definicion:
      'Formato de archivo columnar y comprimido, orientado a análisis. Al almacenar los datos por columnas, Athena escanea menos información y responde más rápido y a menor costo que con formatos de fila como CSV.',
  },
  {
    termino: 'dataset',
    definicion:
      'Conjunto de datos preparado para el análisis. En Amazon Quick, un dataset define las columnas, los tipos y las transformaciones sobre una fuente de datos, y alimenta los análisis y dashboards.',
  },
  {
    termino: 'análisis',
    definicion:
      'Espacio de trabajo en Amazon Quick donde se exploran los datos de un dataset y se construyen las visualizaciones. El análisis es el entorno de edición previo a publicar un dashboard.',
  },
  {
    termino: 'dashboard',
    definicion:
      'Vista publicada y compartible de un análisis en Amazon Quick. Presenta visualizaciones, KPIs y filtros a las personas destinatarias en modo de solo lectura e interacción controlada.',
  },
  {
    termino: 'SPICE',
    definicion:
      'Motor de cálculo en memoria de Amazon Quick (Super-fast, Parallel, In-memory Calculation Engine). Importa y almacena una copia de los datos del dataset para responder con rapidez, a costa de requerir actualizaciones periódicas.',
  },
  {
    termino: 'Direct Query',
    definicion:
      'Modo de consulta de Amazon Quick en el que cada visualización consulta la fuente de datos en tiempo real (por ejemplo, vía Athena) en lugar de usar los datos importados en SPICE. Refleja siempre el estado actual, pero depende de la latencia y el costo de la fuente.',
  },
  {
    termino: 'IAPOL',
    definicion:
      'Plataforma institucional de destino en este curso. La capacitación describe de forma conceptual la integración y publicación hacia IAPOL mediante Simulaciones locales; no ejecuta operaciones reales ni registra recursos en IAPOL.',
  },
  {
    termino: 'KPI',
    definicion:
      'Indicador clave de desempeño (Key Performance Indicator). Métrica resumida que se destaca en un dashboard para comunicar de un vistazo un valor relevante, como el total de viajes o el ingreso promedio.',
  },
  {
    termino: 'JOIN',
    definicion:
      'Operación de SQL que combina filas de dos o más tablas a partir de una condición de relación entre sus columnas. Permite, por ejemplo, enriquecer los viajes con descripciones de zonas.',
  },
  {
    termino: 'vista',
    definicion:
      'Consulta SQL guardada con un nombre que se comporta como una tabla virtual. En Athena, una vista encapsula lógica reutilizable sin duplicar los datos físicos almacenados en S3.',
  },
  {
    termino: 'fuente de datos',
    definicion:
      'Conexión configurada en Amazon Quick hacia el origen de los datos (por ejemplo, Athena sobre S3). Es el punto de partida desde el que se crean los datasets.',
  },
];

export default terminos;
