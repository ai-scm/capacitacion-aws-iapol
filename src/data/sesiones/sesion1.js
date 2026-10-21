/**
 * Contenido de la Sesión 1: "Del dato abierto a Amazon Athena".
 *
 * Esta sesión de 120 minutos recorre el almacenamiento y la consulta de datos:
 * Amazon S3 → AWS Glue Data Catalog → Amazon Athena (incluyendo workgroups),
 * seguido de los fundamentos de SQL (SELECT, WHERE, COUNT, GROUP BY, ORDER BY),
 * JOIN, agregaciones y vistas. El caso práctico transversal es el análisis de
 * los NYC Yellow Taxi Trip Records de enero de 2024.
 *
 * El contenido es EXCLUSIVAMENTE pedagógico: no ejecuta operaciones reales en
 * AWS ni modifica IAPOL. Los ejemplos SQL son didácticos y están sujetos a
 * comprobación del esquema y tipos reales antes de usarse en producción.
 *
 * Requisitos cubiertos: 2.5 (15–60 diapositivas), 25.1 (conceptos de la
 * Sesión 1) y 25.4 (alineación con el cronograma de 120 min del plan). El
 * cronograma del plan se refleja en las notas de instructor de cada diapositiva
 * (bloques de 0–15, 15–30, 30–50, 50–75, 75–95, 95–110 y 110–120 minutos).
 *
 * @module data/sesiones/sesion1
 */

/**
 * Forma canónica de un bloque de contenido (`Bloque`).
 *
 * Esta forma es COMPARTIDA por las tres sesiones (sesion1/2/3). Las sesiones 2
 * y 3 deben reutilizar exactamente estos tipos y campos para que los
 * componentes de layout rendericen el contenido de forma uniforme.
 *
 * Tipos de bloque admitidos (campo discriminante `tipo`):
 *
 *  - `texto`:   { tipo: 'texto', texto: string }
 *               Párrafo de prosa.
 *
 *  - `lista`:   { tipo: 'lista', ordenada?: boolean, items: string[] }
 *               Lista de puntos. `ordenada` (por defecto false) indica si es
 *               numerada (ol) o con viñetas (ul).
 *
 *  - `codigo':  { tipo: 'codigo', lenguaje: string, codigo: string }
 *               Bloque de código/SQL mostrado de forma monoespaciada. El
 *               contenido es estático y controlado por el proyecto (no se
 *               interpreta ni ejecuta).
 *
 *  - `nota`:    { tipo: 'nota', variante: 'info'|'advertencia'|'simulacion'|'iapol', texto: string }
 *               Llamada destacada. `variante` determina el estilo/plano:
 *                 · 'info'       → aclaración o dato de apoyo.
 *                 · 'advertencia'→ precaución (p. ej. comprobar esquema/tipos).
 *                 · 'simulacion' → identifica contenido como Simulación local.
 *                 · 'iapol'      → proceso institucional IAPOL (explicativo).
 *
 *  - `imagen`:  { tipo: 'imagen', src: string, alt: string, leyenda?: string }
 *               Imagen empaquetada localmente (ruta relativa a assets locales,
 *               nunca una CDN en runtime).
 *
 * @typedef {(
 *   { tipo: 'texto', texto: string }
 *   | { tipo: 'lista', ordenada?: boolean, items: string[] }
 *   | { tipo: 'codigo', lenguaje: string, codigo: string }
 *   | { tipo: 'nota', variante: 'info'|'advertencia'|'simulacion'|'iapol', texto: string }
 *   | { tipo: 'imagen', src: string, alt: string, leyenda?: string }
 * )} Bloque
 */

/**
 * Diapositiva de una sesión.
 *
 * @typedef {Object} Diapositiva
 * @property {string} id           Identificador único dentro de la sesión.
 * @property {('titulo'|'contenido'|'diagrama'|'sql'|'laboratorio'|'simulador'|'identificadores'|'diagnostico'|'evaluacion')} layout
 *   Plantilla de presentación de la diapositiva.
 * @property {string} titulo       Título visible de la diapositiva.
 * @property {Bloque[]} contenido  Bloques estructurados de contenido.
 * @property {string[]} objetivos  Objetivos de aprendizaje (Modo_Presentador).
 * @property {string} notasInstructor  Notas privadas (solo Modo_Presentador).
 */

/**
 * Sesión de capacitación.
 *
 * @typedef {Object} Sesion
 * @property {1|2|3} id
 * @property {string} titulo
 * @property {120} duracionMin
 * @property {string[]} conceptos
 * @property {Diapositiva[]} diapositivas
 */

/** @type {Sesion} */
const sesion1 = {
  id: 1,
  titulo: 'Del dato abierto a Amazon Athena',
  duracionMin: 120,
  conceptos: [
    'Amazon S3 (buckets, objetos, prefijos y rutas)',
    'Formatos Parquet y CSV',
    'AWS Glue Data Catalog (bases de datos, tablas y metadatos)',
    'Amazon Athena (consulta SQL de datos en S3)',
    'Athena workgroups',
    'SQL: SELECT, WHERE, COUNT, GROUP BY, ORDER BY',
    'JOIN y agregaciones',
    'Vistas en Athena',
  ],
  diapositivas: [
    {
      id: 's1-d01-portada',
      layout: 'titulo',
      titulo: 'Sesión 1 · Del dato abierto a Amazon Athena',
      contenido: [
        {
          tipo: 'texto',
          texto:
            'Primera de tres sesiones de 120 minutos sobre Amazon Athena, ' +
            'Amazon Quick e IAPOL. Recorremos el ciclo del dato desde su ' +
            'almacenamiento hasta su consulta con SQL.',
        },
        {
          tipo: 'lista',
          items: [
            'Caso transversal: NYC Yellow Taxi Trip Records (enero 2024).',
            'Objetivo: preparar una fuente de datos consultable para Quick.',
            'Duración: 120 minutos.',
          ],
        },
        {
          tipo: 'nota',
          variante: 'simulacion',
          texto:
            'Esta plataforma es un recurso pedagógico ejecutado en localhost. ' +
            'No realiza operaciones reales en AWS ni modifica IAPOL.',
        },
      ],
      objetivos: [
        'Ubicar la Sesión 1 dentro del programa de seis horas.',
        'Reconocer el caso práctico transversal de taxis de Nueva York.',
      ],
      notasInstructor:
        '[0–15 min · Apertura] Presentarse y presentar la agenda de la ' +
        'sesión. Enfatizar que la plataforma es educativa y que ninguna acción ' +
        'ejecuta recursos reales. Preguntar por el nivel previo de SQL y AWS ' +
        'para calibrar el ritmo (audiencia mixta).',
    },
    {
      id: 's1-d02-agenda',
      layout: 'contenido',
      titulo: 'Agenda de la sesión (120 min)',
      contenido: [
        {
          tipo: 'lista',
          ordenada: true,
          items: [
            '0–15 min · Arquitectura AWS → Quick → IAPOL.',
            '15–30 min · Dataset, campos, formatos y calidad.',
            '30–50 min · S3, Glue Data Catalog, Athena y workgroup.',
            '50–75 min · SELECT, WHERE, COUNT, GROUP BY, ORDER BY.',
            '75–95 min · JOIN, agregaciones y consultas personalizadas.',
            '95–110 min · Crear una vista para el dashboard.',
            '110–120 min · Validación de registros y conexión con Quick.',
          ],
        },
      ],
      objetivos: [
        'Conocer la estructura temporal de la sesión.',
        'Anticipar los entregables: tabla/vista demostradas y SQL documentado.',
      ],
      notasInstructor:
        '[0–15 min] Repasar la agenda rápidamente. Aclarar que los tramos del ' +
        'instructor (30–50) son demostrativos y los de SQL (50–95) combinan ' +
        'demostración y ejercicios guiados.',
    },
    {
      id: 's1-d03-objetivos',
      layout: 'contenido',
      titulo: 'Objetivos de aprendizaje',
      contenido: [
        {
          tipo: 'texto',
          texto: 'Al terminar la sesión, cada participante podrá:',
        },
        {
          tipo: 'lista',
          items: [
            'Explicar el flujo S3 → Glue Data Catalog / Athena.',
            'Reconocer tablas, columnas, Parquet, workgroups y resultados.',
            'Interpretar SQL básico, agregaciones, JOIN y vistas.',
            'Distinguir un ejemplo didáctico de una consulta validada.',
          ],
        },
      ],
      objetivos: [
        'Fijar expectativas claras de la sesión.',
        'Vincular los objetivos con las evaluaciones posteriores.',
      ],
      notasInstructor:
        '[0–15 min] Conectar cada objetivo con una actividad concreta de la ' +
        'agenda. Mencionar que la evaluación final pondera el flujo (15 pts) y ' +
        'la interpretación de SQL (15 pts).',
    },
    {
      id: 's1-d04-arquitectura',
      layout: 'diagrama',
      titulo: 'Arquitectura del dato: S3 → Glue → Athena → Quick → IAPOL',
      contenido: [
        {
          tipo: 'texto',
          texto:
            'El dato recorre varias etapas desde su almacenamiento hasta su ' +
            'consumo analítico y su integración institucional.',
        },
        {
          tipo: 'codigo',
          lenguaje: 'text',
          codigo:
            'Datos abiertos (Parquet)\n' +
            '        ↓\n' +
            'Amazon S3            (almacenamiento)\n' +
            '        ↓\n' +
            'AWS Glue Data Catalog (metadatos de tablas)\n' +
            '        ↘\n' +
            '        Amazon Athena (consulta SQL de datos en S3)\n' +
            '                ↓\n' +
            '        Amazon Quick  (dataset compartido)\n' +
            '                ↓\n' +
            '        Dashboard publicado\n' +
            '                ↓\n' +
            '        [Explicación] Integración en IAPOL',
        },
        {
          tipo: 'imagen',
          src: '/img/comun/flujo-datos.svg',
          alt:
            'Flujo del dato de izquierda a derecha: Amazon S3 almacena, AWS ' +
            'Glue Data Catalog cataloga los metadatos, Amazon Athena consulta ' +
            'con SQL, Amazon Quick visualiza y, como paso institucional ' +
            'explicativo, IAPOL integra.',
        },
        {
          tipo: 'nota',
          variante: 'iapol',
          texto:
            'Los pasos de integración en IAPOL son explicativos: no se ' +
            'ejecutan desde esta plataforma.',
        },
      ],
      objetivos: [
        'Describir las etapas del flujo de datos de extremo a extremo.',
        'Situar Athena como motor de consulta sobre datos en S3.',
      ],
      notasInstructor:
        '[0–15 min · Arquitectura] Recorrer el diagrama de arriba abajo. ' +
        'Precisión clave: Glue Data Catalog registra y describe tablas; no es ' +
        'una etapa obligatoria de movimiento de archivos. Invitar a usar el ' +
        'diagrama interactivo para explorar cada nodo.',
    },
    {
      id: 's1-d05-glue-vs-athena',
      layout: 'diagrama',
      titulo: 'Glue Data Catalog y Athena: roles complementarios',
      contenido: [
        {
          tipo: 'lista',
          items: [
            'Glue Data Catalog: registra y DESCRIBE tablas (nombres de ' +
              'columnas, tipos, ubicación en S3). Es el "diccionario" de metadatos.',
            'Amazon Athena: CONSULTA los datos que viven en S3 usando esos ' +
              'metadatos, sin mover ni copiar los archivos.',
          ],
        },
        {
          tipo: 'imagen',
          src: '/img/sesion1/glue-vs-athena.svg',
          alt:
            'AWS Glue Data Catalog describe las tablas (esquema y ubicación en ' +
            'S3) y Amazon Athena consulta los datos en S3 usando esos ' +
            'metadatos, sin mover ni copiar los archivos.',
        },
        {
          tipo: 'nota',
          variante: 'info',
          texto:
            'Athena no almacena los datos: lee directamente los objetos de S3 ' +
            'descritos por el catálogo. Por eso el formato (Parquet) importa.',
        },
      ],
      objetivos: [
        'Diferenciar el rol de metadatos (Glue) del rol de consulta (Athena).',
        'Entender que Athena consulta datos en su ubicación original (S3).',
      ],
      notasInstructor:
        '[0–15 min] Corregir el error frecuente de pensar que Glue "carga" o ' +
        '"mueve" datos. Analogía: Glue es el índice/ficha de la biblioteca; ' +
        'Athena es quien lee el libro que sigue en su estante (S3).',
    },
    {
      id: 's1-d06-dataset-caso',
      layout: 'contenido',
      titulo: 'El caso práctico: NYC Yellow Taxi (enero 2024)',
      contenido: [
        {
          tipo: 'texto',
          texto:
            'Usamos los Yellow Taxi Trip Records publicados por la NYC Taxi & ' +
            'Limousine Commission (TLC) como datos públicos de ejemplo. ' +
            'Permiten analizar operaciones por fecha, hora, distancia, ' +
            'pasajeros, importe y tipo de pago.',
        },
        {
          tipo: 'imagen',
          src: '/img/sesion1/dataset-taxi.svg',
          alt:
            'Tabla de ejemplo del NYC Yellow Taxi con columnas de fecha de ' +
            'recogida, tipo de pago, pasajeros, distancia e importe, ' +
            'almacenada en formato Parquet en Amazon S3.',
        },
        {
          tipo: 'nota',
          variante: 'simulacion',
          texto:
            'En esta plataforma, el dataset es un subconjunto sintético/derivado ' +
            'empaquetado localmente, etiquetado como datos de ejemplo.',
        },
      ],
      objetivos: [
        'Reconocer el origen conceptual del dataset (NYC TLC).',
        'Asumir que el dataset local es un ejemplo representativo, no el origen real.',
      ],
      notasInstructor:
        '[15–30 min · Dataset] Mostrar la fuente oficial (TLC) en el Centro de ' +
        'Recursos. Insistir: no publicar como resultados reales las métricas de ' +
        'un subconjunto sintético.',
    },
    {
      id: 's1-d07-campos',
      layout: 'contenido',
      titulo: 'Campos del dataset y su significado',
      contenido: [
        {
          tipo: 'lista',
          items: [
            'tpep_pickup_datetime — fecha y hora de inicio del viaje.',
            'payment_type — tipo de pago codificado (1 tarjeta, 2 efectivo…).',
            'passenger_count — cantidad de pasajeros.',
            'trip_distance — distancia del viaje (millas).',
            'total_amount — importe total cobrado (USD).',
          ],
        },
        {
          tipo: 'nota',
          variante: 'advertencia',
          texto:
            'Confirmar nombres, tipos, nulos y valores codificados contra los ' +
            'archivos y el diccionario oficiales antes de un laboratorio real.',
        },
      ],
      objetivos: [
        'Identificar los cinco campos clave del caso práctico.',
        'Anticipar que la codificación de payment_type debe corroborarse.',
      ],
      notasInstructor:
        '[15–30 min] Abrir el explorador de columnas. Comentar que los valores ' +
        'codificados (payment_type) son una fuente típica de malinterpretación ' +
        'si no se consulta el diccionario.',
    },
    {
      id: 's1-d08-formatos',
      layout: 'contenido',
      titulo: 'Formatos: Parquet frente a CSV',
      contenido: [
        {
          tipo: 'lista',
          items: [
            'CSV: texto plano, fila a fila. Fácil de leer, pero pesado y lento ' +
              'de analizar a gran escala.',
            'Parquet: formato columnar y comprimido. Lee solo las columnas ' +
              'necesarias, reduce costo de escaneo en Athena y mejora el rendimiento.',
          ],
        },
        {
          tipo: 'nota',
          variante: 'info',
          texto:
            'Athena cobra por datos escaneados: Parquet, al ser columnar, suele ' +
            'escanear menos y resultar más económico que CSV para las mismas consultas.',
        },
      ],
      objetivos: [
        'Explicar por qué Parquet es preferible para análisis en Athena.',
        'Relacionar el formato columnar con el costo de escaneo.',
      ],
      notasInstructor:
        '[15–30 min] Mantenerlo conceptual para audiencia mixta. Idea central: ' +
        'formato columnar = leer menos = más rápido y barato en Athena.',
    },
    {
      id: 's1-d09-s3',
      layout: 'contenido',
      titulo: 'Amazon S3: buckets, objetos, prefijos y rutas',
      contenido: [
        {
          tipo: 'texto',
          texto:
            'S3 es el almacenamiento de objetos donde residen los archivos de ' +
            'datos. Un bucket contiene objetos organizados mediante prefijos ' +
            '(que funcionan como "carpetas" lógicas).',
        },
        {
          tipo: 'codigo',
          lenguaje: 'text',
          codigo:
            's3://<bucket-autorizado>/capacitacion-iapol/\n' +
            '  datos/yellow_taxi_2024/\n' +
            '  resultados-athena/\n' +
            '  archivos-auxiliares/',
        },
        {
          tipo: 'nota',
          variante: 'advertencia',
          texto:
            'Estructura ilustrativa. El bucket y las rutas reales dependen del ' +
            'entorno autorizado del instructor.',
        },
      ],
      objetivos: [
        'Describir la organización de datos en S3 (bucket/prefijo/objeto).',
        'Reconocer la separación entre datos de origen y resultados de Athena.',
      ],
      notasInstructor:
        '[30–50 min · Instructor] Explicar que Athena escribe los resultados de ' +
        'consulta en una ubicación S3 configurada en el workgroup (ver más ' +
        'adelante). Aclarar que los prefijos no son carpetas reales, sino parte ' +
        'del nombre del objeto.',
    },
    {
      id: 's1-d10-glue',
      layout: 'contenido',
      titulo: 'AWS Glue Data Catalog: bases de datos y tablas',
      contenido: [
        {
          tipo: 'texto',
          texto:
            'El catálogo organiza metadatos en bases de datos y tablas. Una ' +
            'tabla describe columnas, tipos y la ubicación de los datos en S3, ' +
            'sin contener los datos en sí.',
        },
        {
          tipo: 'lista',
          items: [
            'Base de datos: agrupación lógica de tablas (p. ej. capacitacion_iapol).',
            'Tabla: esquema + ubicación en S3 (p. ej. viajes_taxi).',
            'Metadatos: nombres de columnas, tipos, formato y particiones.',
          ],
        },
      ],
      objetivos: [
        'Explicar qué registra una tabla del catálogo.',
        'Entender que el catálogo apunta a datos en S3, no los duplica.',
      ],
      notasInstructor:
        '[30–50 min · Instructor] Nombre de ejemplo: capacitacion_iapol.' +
        'viajes_taxi (no es un recurso existente confirmado). Recordar que ' +
        'validar nombres y tipos reales es responsabilidad del instructor antes ' +
        'del laboratorio.',
    },
    {
      id: 's1-d11-athena',
      layout: 'contenido',
      titulo: 'Amazon Athena: SQL serverless sobre S3',
      contenido: [
        {
          tipo: 'texto',
          texto:
            'Athena ejecuta consultas SQL estándar sobre datos en S3 usando los ' +
            'metadatos del catálogo. Es serverless: no hay servidores que ' +
            'administrar y se paga por datos escaneados.',
        },
        {
          tipo: 'lista',
          items: [
            'Lee datos en su ubicación (S3) usando el esquema de Glue.',
            'Devuelve resultados y los guarda en la ubicación del workgroup.',
            'No requiere cargar ni mover los datos previamente.',
          ],
        },
      ],
      objetivos: [
        'Definir Athena como motor SQL serverless sobre S3.',
        'Relacionar consulta, catálogo y resultados.',
      ],
      notasInstructor:
        '[30–50 min · Instructor] Reforzar el modelo mental: "SQL sobre ' +
        'archivos que ya están en S3". Es la base para entender costo por ' +
        'escaneo y la importancia de Parquet y de filtrar bien.',
    },
    {
      id: 's1-d12-workgroups',
      layout: 'contenido',
      titulo: 'Athena workgroups: control y resultados',
      contenido: [
        {
          tipo: 'texto',
          texto:
            'Un workgroup agrupa configuración y controles para un conjunto de ' +
            'usuarios o cargas de trabajo.',
        },
        {
          tipo: 'lista',
          items: [
            'Define la ubicación S3 donde se guardan los resultados de consulta.',
            'Permite límites de datos escaneados y controles de costo.',
            'Separa entornos/equipos y centraliza ajustes de consulta.',
          ],
        },
        {
          tipo: 'nota',
          variante: 'info',
          texto:
            'Los límites de escaneo del workgroup ayudan a evitar consultas ' +
            'accidentalmente costosas.',
        },
      ],
      objetivos: [
        'Explicar la función de un workgroup de Athena.',
        'Relacionar el workgroup con el control de costos y resultados.',
      ],
      notasInstructor:
        '[30–50 min · Instructor] Mencionar que la ubicación de resultados del ' +
        'workgroup corresponde al prefijo resultados-athena/ mostrado en S3. ' +
        'Los límites de escaneo son una buena práctica para capacitaciones.',
    },
    {
      id: 's1-d13-permisos',
      layout: 'contenido',
      titulo: 'Permisos y acceso',
      contenido: [
        {
          tipo: 'lista',
          items: [
            'El acceso a S3, al catálogo y a Athena se controla con permisos.',
            'Solo el instructor crea y configura recursos en el entorno autorizado.',
            'Si los participantes no tienen permisos de consulta, se usan ' +
              'consultas preparadas y resultados exportados.',
          ],
        },
        {
          tipo: 'nota',
          variante: 'advertencia',
          texto:
            'No conceder acceso de creación de recursos a los participantes ' +
            'durante la capacitación.',
        },
      ],
      objetivos: [
        'Reconocer que el acceso a datos y consultas depende de permisos.',
        'Entender el reparto de responsabilidades instructor/participante.',
      ],
      notasInstructor:
        '[30–50 min · Instructor] Dejar claro el modelo de la capacitación: ' +
        'demostración del instructor + práctica con consultas predefinidas en ' +
        'el Laboratorio SQL local (simulación).',
    },
    {
      id: 's1-d14-sql-select',
      layout: 'sql',
      titulo: 'SQL: SELECT y WHERE',
      contenido: [
        {
          tipo: 'texto',
          texto:
            'SELECT elige las columnas a devolver; WHERE filtra las filas según ' +
            'una condición.',
        },
        {
          tipo: 'codigo',
          lenguaje: 'sql',
          codigo:
            'SELECT tpep_pickup_datetime, trip_distance, total_amount\n' +
            'FROM capacitacion_iapol.viajes_taxi\n' +
            'WHERE total_amount >= 0\n' +
            '  AND trip_distance > 0;',
        },
        {
          tipo: 'nota',
          variante: 'advertencia',
          texto:
            'Ejemplo didáctico sujeto a comprobación del esquema y tipos reales ' +
            'antes de su uso en producción.',
        },
      ],
      objetivos: [
        'Leer una consulta SELECT con filtro WHERE.',
        'Interpretar condiciones que delimitan la población analizada.',
      ],
      notasInstructor:
        '[50–75 min · Demostración + ejercicios] Empezar por lo más simple. ' +
        'Explicar que el WHERE del ejemplo descarta importes negativos y ' +
        'distancias no positivas, lo que modifica la población (limpieza).',
    },
    {
      id: 's1-d15-sql-count',
      layout: 'sql',
      titulo: 'SQL: COUNT y funciones de agregación',
      contenido: [
        {
          tipo: 'texto',
          texto:
            'COUNT cuenta filas; AVG, SUM, MIN y MAX resumen valores numéricos ' +
            'de una columna.',
        },
        {
          tipo: 'codigo',
          lenguaje: 'sql',
          codigo:
            'SELECT\n' +
            '    COUNT(*)                     AS total_viajes,\n' +
            '    ROUND(AVG(trip_distance), 2) AS distancia_promedio,\n' +
            '    ROUND(AVG(total_amount), 2)  AS importe_promedio\n' +
            'FROM capacitacion_iapol.viajes_taxi;',
        },
      ],
      objetivos: [
        'Usar COUNT(*) para medir el volumen de datos.',
        'Reconocer funciones de agregación sobre columnas numéricas.',
      ],
      notasInstructor:
        '[50–75 min] Relacionar COUNT(*) con el KPI "total de viajes" que se ' +
        'verá en la Sesión 2. ROUND es cosmético: aclarar que no cambia el dato ' +
        'subyacente.',
    },
    {
      id: 's1-d16-sql-groupby',
      layout: 'sql',
      titulo: 'SQL: GROUP BY y ORDER BY',
      contenido: [
        {
          tipo: 'texto',
          texto:
            'GROUP BY agrupa filas por una o más columnas para agregarlas; ' +
            'ORDER BY ordena el resultado.',
        },
        {
          tipo: 'codigo',
          lenguaje: 'sql',
          codigo:
            'SELECT payment_type,\n' +
            '       COUNT(*)                    AS viajes,\n' +
            '       ROUND(SUM(total_amount), 2) AS importe\n' +
            'FROM capacitacion_iapol.viajes_taxi\n' +
            'GROUP BY payment_type\n' +
            'ORDER BY viajes DESC;',
        },
        {
          tipo: 'imagen',
          src: '/img/sesion1/anatomia-sql.svg',
          alt:
            'Anatomía de una consulta SQL: SELECT elige columnas, FROM indica ' +
            'la tabla, WHERE filtra filas, GROUP BY agrupa y ORDER BY ordena el ' +
            'resultado.',
        },
        {
          tipo: 'nota',
          variante: 'info',
          texto:
            'Esta agregación por payment_type alimenta el gráfico de barras ' +
            '"viajes por método de pago" de la Sesión 2.',
        },
      ],
      objetivos: [
        'Interpretar una agregación agrupada por una columna categórica.',
        'Ordenar resultados de mayor a menor.',
      ],
      notasInstructor:
        '[50–75 min] Buen momento para un ejercicio guiado: pedir que anticipen ' +
        'qué método de pago tendrá más viajes y comprobarlo en el Laboratorio ' +
        'SQL (simulación).',
    },
    {
      id: 's1-d17-join',
      layout: 'sql',
      titulo: 'JOIN: combinar dos tablas',
      contenido: [
        {
          tipo: 'texto',
          texto:
            'Un JOIN combina filas de dos tablas relacionadas por una clave ' +
            'común. Se usa cuando la información necesaria está repartida en más ' +
            'de una tabla (p. ej. viajes y un catálogo de tipos de pago).',
        },
        {
          tipo: 'codigo',
          lenguaje: 'sql',
          codigo:
            'SELECT v.payment_type,\n' +
            '       p.descripcion AS metodo_pago,\n' +
            '       COUNT(*)      AS viajes\n' +
            'FROM capacitacion_iapol.viajes_taxi v\n' +
            'JOIN capacitacion_iapol.pagos p\n' +
            '  ON v.payment_type = p.codigo\n' +
            'GROUP BY v.payment_type, p.descripcion\n' +
            'ORDER BY viajes DESC;',
        },
        {
          tipo: 'nota',
          variante: 'advertencia',
          texto:
            'La clave de unión (aquí payment_type = codigo) debe existir y ser ' +
            'compatible en tipo en ambas tablas. Ejemplo didáctico.',
        },
      ],
      objetivos: [
        'Explicar cuándo se requiere una segunda tabla.',
        'Interpretar la clave de unión de un JOIN.',
      ],
      notasInstructor:
        '[75–95 min · Guiada] Insistir en la idea de clave común. La tabla ' +
        'pagos es un ejemplo para traducir el código numérico a una etiqueta ' +
        'legible. Proponer el "ejercicio de interpretación de un JOIN".',
    },
    {
      id: 's1-d18-agregaciones',
      layout: 'sql',
      titulo: 'Agregaciones y consultas personalizadas',
      contenido: [
        {
          tipo: 'texto',
          texto:
            'Combinando funciones, GROUP BY y expresiones de fecha podemos ' +
            'responder preguntas de negocio, como los viajes por día.',
        },
        {
          tipo: 'codigo',
          lenguaje: 'sql',
          codigo:
            'SELECT CAST(tpep_pickup_datetime AS DATE) AS fecha,\n' +
            '       COUNT(*)                           AS viajes,\n' +
            '       ROUND(AVG(trip_distance), 2)       AS distancia_media\n' +
            'FROM capacitacion_iapol.viajes_taxi\n' +
            'GROUP BY CAST(tpep_pickup_datetime AS DATE)\n' +
            'ORDER BY fecha;',
        },
      ],
      objetivos: [
        'Construir una agregación temporal (por fecha).',
        'Vincular la consulta con las visualizaciones de tendencias.',
      ],
      notasInstructor:
        '[75–95 min · Guiada] Mostrar cómo CAST a DATE agrupa por día. ' +
        'Conectar con "viajes por día" (Sesión 2, hoja Tendencias). Recordar ' +
        'que los tipos/fechas deben validarse contra el esquema real.',
    },
    {
      id: 's1-d19-vistas',
      layout: 'sql',
      titulo: 'Vistas: separar la lógica SQL del consumo analítico',
      contenido: [
        {
          tipo: 'texto',
          texto:
            'Una vista guarda una consulta con nombre. Quien la consume ve una ' +
            '"tabla" lógica, sin repetir el SQL ni los filtros de limpieza.',
        },
        {
          tipo: 'codigo',
          lenguaje: 'sql',
          codigo:
            'CREATE OR REPLACE VIEW capacitacion_iapol.vw_indicadores AS\n' +
            'SELECT CAST(tpep_pickup_datetime AS DATE) AS fecha,\n' +
            '       payment_type,\n' +
            '       passenger_count,\n' +
            '       trip_distance,\n' +
            '       total_amount\n' +
            'FROM capacitacion_iapol.viajes_taxi\n' +
            "WHERE tpep_pickup_datetime >= TIMESTAMP '2024-01-01 00:00:00'\n" +
            "  AND tpep_pickup_datetime <  TIMESTAMP '2024-02-01 00:00:00'\n" +
            '  AND trip_distance > 0\n' +
            '  AND total_amount >= 0;',
        },
        {
          tipo: 'nota',
          variante: 'advertencia',
          texto:
            'Los filtros de la vista descartan registros y no representan la ' +
            'totalidad del origen: explicar el impacto de la limpieza.',
        },
      ],
      objetivos: [
        'Definir qué es una vista y para qué sirve.',
        'Reconocer que la vista encapsula filtros de limpieza reutilizables.',
      ],
      notasInstructor:
        '[95–110 min · Instructor] Esta vista (vw_indicadores) es la fuente ' +
        'propuesta para el dataset de Quick en la Sesión 2. Subrayar que ' +
        'CREATE OR REPLACE VIEW es un ejemplo y no se ejecuta aquí.',
    },
    {
      id: 's1-d20-laboratorio',
      layout: 'laboratorio',
      titulo: 'Laboratorio SQL local (Simulación)',
      contenido: [
        {
          tipo: 'texto',
          texto:
            'El Laboratorio SQL permite seleccionar consultas predefinidas y ver ' +
            'resultados de demostración precalculados, sin conexión a AWS.',
        },
        {
          tipo: 'lista',
          items: [
            'Selecciona una consulta del conjunto predefinido.',
            'Observa columnas y filas del resultado de demostración.',
            'Compara consultas (p. ej. con y sin GROUP BY).',
          ],
        },
        {
          tipo: 'nota',
          variante: 'simulacion',
          texto:
            'Los resultados provienen de una Simulación local y no de una ' +
            'consulta real a Amazon Athena.',
        },
      ],
      objetivos: [
        'Practicar la interpretación de resultados SQL.',
        'Asociar cada consulta con su salida esperada.',
      ],
      notasInstructor:
        '[75–95 min] Usar el Laboratorio para comprobar en vivo las consultas ' +
        'de las diapositivas anteriores. Recordar que una consulta vacía o no ' +
        'soportada no devuelve resultados (mensaje de simulación).',
    },
    {
      id: 's1-d21-validacion',
      layout: 'contenido',
      titulo: 'Validación de registros y conexión con Quick',
      contenido: [
        {
          tipo: 'texto',
          texto:
            'Antes de pasar a Quick, el instructor valida que la tabla/vista ' +
            'devuelve datos coherentes y que Quick puede acceder a Athena.',
        },
        {
          tipo: 'lista',
          ordenada: true,
          items: [
            'Ejecutar consultas de comprobación (conteos y promedios).',
            'Revisar tipos, nulos y valores codificados.',
            'Confirmar acceso de Quick a Athena, catálogo, S3 y resultados.',
            'Compartir el dataset propuesto (ds_viajes_taxi_capacitacion).',
          ],
        },
        {
          tipo: 'nota',
          variante: 'iapol',
          texto:
            'La integración con IAPOL se aborda en la Sesión 3 y es explicativa: ' +
            'no se registra ni publica nada en el portal.',
        },
      ],
      objetivos: [
        'Enumerar los pasos de validación previos al análisis.',
        'Conectar la vista de Athena con el dataset compartido de Quick.',
      ],
      notasInstructor:
        '[110–120 min · Cierre] Resumir el recorrido S3 → Glue → Athena → vista. ' +
        'Anunciar que la Sesión 2 parte del dataset compartido en Quick. Dejar ' +
        'espacio para preguntas.',
    },
    {
      id: 's1-d22-cierre',
      layout: 'contenido',
      titulo: 'Cierre y puente a la Sesión 2',
      contenido: [
        {
          tipo: 'lista',
          items: [
            'S3 almacena; Glue describe; Athena consulta con SQL.',
            'SQL: SELECT/WHERE/COUNT/GROUP BY/ORDER BY, JOIN y vistas.',
            'La vista vw_indicadores será la base del análisis en Quick.',
          ],
        },
        {
          tipo: 'nota',
          variante: 'advertencia',
          texto:
            'Todo ejemplo SQL es didáctico: verificar esquema, tipos y permisos ' +
            'reales antes de cualquier ejecución en producción.',
        },
      ],
      objetivos: [
        'Sintetizar los conceptos clave de la sesión.',
        'Preparar el paso al análisis y los dashboards de la Sesión 2.',
      ],
      notasInstructor:
        '[110–120 min · Cierre] Repaso final de 1–2 minutos. Confirmar que los ' +
        'objetivos de aprendizaje quedaron cubiertos y resolver dudas antes de ' +
        'cerrar la sesión.',
    },
  ],
};

export default sesion1;
export { sesion1 };
