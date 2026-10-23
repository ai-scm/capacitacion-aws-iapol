// Sesión 1: "AWS end-to-end: de S3 a tableros en Amazon Quick"
//
// Capacitación práctica de 180 minutos (3 horas). Recorre casi todo el flujo
// técnico de AWS: datos en S3 → catálogo en AWS Glue → consultas en Amazon
// Athena (workgroup, DDL, particiones, vista para BI) → dataset, análisis de
// tres hojas y controles en Amazon Quick. La publicación del tablero, los
// permisos y su implementación/registro en IAPOL se completan en la Sesión 2.
//
// Práctica "hazlo tú": cada laboratorio incluye pasos accionables,
// comandos/DDL de ejemplo (ajustables a la cuenta) y CAPTURAS. Las capturas se
// referencian como rutas en public/img/sesionA/; mientras no existan, la UI
// muestra un marcador con la descripción y la ruta destino.
//
// Honestidad: la plataforma NO ejecuta operaciones reales en AWS ni modifica
// IAPOL. Los comandos son ejemplos; nombres de cuenta, bucket, base, workgroup
// y permisos deben ajustarse al entorno real antes de ejecutarse.
//
// @module data/sesiones/sesionA

const texto = (t) => ({ tipo: 'texto', texto: t });
const lista = (items, ordenada = false) => ({ tipo: 'lista', items, ordenada });
const nota = (variante, t) => ({ tipo: 'nota', variante, texto: t });
const callout = (codigo, extra = {}) => ({ tipo: 'callout', codigo, ...extra });
const pasos = (listaPasos) => ({ tipo: 'pasos', pasos: listaPasos });
const imagen = (src, alt) => ({ tipo: 'imagen', src, alt });

/** Prefijo de rutas de captura de esta sesión. */
const IMG = '/img/sesionA';

/**
 * Conceptos mínimos de la Sesión 1.
 * @type {string[]}
 */
const conceptos = [
  'Organización de datos en Amazon S3 (prefijos y particiones)',
  'Catálogo de AWS Glue y tablas externas',
  'Amazon Athena: workgroup y ubicación de resultados',
  'DDL en Athena: CREATE EXTERNAL TABLE y particiones (MSCK / ALTER)',
  'Formato Parquet y costo por datos escaneados',
  'Vistas y CTAS para preparar datos de BI',
  'Amazon Quick: dataset desde Athena, SPICE vs Direct Query',
  'Campos calculados y preparación del dataset',
  'Tipos de visual en Quick: KPI, barras, líneas y tabla',
  'Controles de filtro y su alcance',
];

/**
 * Diapositivas de la Sesión 1 (180 min). Cronograma orientativo:
 *   0–10    Presentación, objetivos y prerrequisitos
 *   10–35   S3 + Glue (organización y catálogo)  [LAB 1]
 *   35–80   Athena: workgroup, DDL, particiones, vista  [LAB 2]
 *   80–160  Quick: dataset, campos calculados y exploración de visuales  [LAB 3]
 *   160–180 Repaso y transición a la Sesión 2
 * @type {import('./tipos.js').Diapositiva[]}
 */
const diapositivas = [
  // ─────────────────────────── 0–10 · Presentación
  {
    id: 'sa-d01',
    layout: 'titulo',
    titulo: 'Sesión 1 · AWS end-to-end: de S3 a tableros en Amazon Quick',
    contenido: [
      texto(
        'Laboratorio práctico de 3 horas. Construimos el flujo técnico de AWS: ' +
          'datos en S3, catálogo en Glue, consultas en Athena y la exploración ' +
          'de un análisis en Amazon Quick.',
      ),
      lista([
        'Duración: 180 minutos (práctica guiada "hazlo tú").',
        'Cada participante trae y usa su propio dataset.',
        'En Quick: explora KPIs, gráficas y filtros con tus columnas.',
        'La publicación y el registro en IAPOL se hacen en la Sesión 2.',
      ]),
      nota(
        'simulacion',
        'La plataforma no ejecuta nada en AWS ni en IAPOL. Los comandos y ' +
          'capturas son material de apoyo: ejecútalos en tu cuenta real ' +
          'ajustando nombres y permisos.',
      ),
    ],
    objetivos: [
      'Entender el recorrido técnico de AWS de punta a punta.',
      'Explorar en Quick cómo se construyen KPIs, gráficas y filtros.',
    ],
    notasInstructor:
      '[0–10 min] Confirmar prerrequisitos (acceso a la cuenta AWS y rol de ' +
      'autor en Quick). La publicación e IAPOL quedan para la Sesión 2.',
  },
  {
    id: 'sa-d02',
    layout: 'contenido',
    titulo: 'Prerrequisitos del laboratorio',
    contenido: [
      texto(
        'Cada participante trae y trabaja SU PROPIO dataset. El NYC Taxi es ' +
          'solo el ejemplo de referencia; los pasos aplican a cualquier ' +
          'conjunto de datos.',
      ),
      lista([
        'Cuenta AWS con acceso a S3, Glue y Athena en la región de trabajo.',
        'Un bucket de datos y un prefijo (o bucket) para resultados de Athena.',
        'Amazon Quick con rol de AUTOR (no basta con lector); autor compartido por el grupo.',
        'Tu dataset listo (archivo + diccionario de columnas y tipos).',
        'Acceso a IAPOL (se usará en la Sesión 2).',
      ]),
      nota(
        'advertencia',
        'Usa recursos de prueba y datos que puedas tratar en la capacitación. ' +
          'No subas datos sensibles reales.',
      ),
    ],
    objetivos: [
      'Verificar accesos y recursos antes del laboratorio.',
      'Tener el dataset propio con su diccionario de columnas y tipos.',
    ],
    notasInstructor:
      '[0–10 min] Repartir a cada quien su identificador pNN (p01…p10) y una ' +
      'hoja con los nombres de su entorno (prefijo S3, base de Glue, ' +
      'workgroup). Recordar que el dataset es propio de cada participante.',
  },
  {
    id: 'sa-d02-arq',
    layout: 'contenido',
    titulo: 'Arquitectura del flujo',
    contenido: [
      imagen(
        '/img/comun/flujo-datos.svg',
        'Arquitectura del flujo: S3 → Glue → Athena → Amazon Quick → IAPOL.',
      ),
      nota(
        'info',
        'Modelo del aula: una sola cuenta AWS y un usuario IAM compartido por ' +
          'los 10. El aislamiento se logra por convención de nombres (prefijo ' +
          'pNN): cada quien usa su propio prefijo en S3 y su propia base de ' +
          'Glue. El detalle está en la diapositiva de acceso y tamaños.',
      ),
    ],
    objetivos: [
      'Ubicar cada servicio en la arquitectura de punta a punta.',
    ],
    notasInstructor:
      '[0–10 min] Recorrer el diagrama de izquierda a derecha; IAPOL se trabaja ' +
      'en la Sesión 2.',
  },
  {
    id: 'sa-d02b',
    layout: 'contenido',
    titulo: 'Tu dataset: ficha mínima antes de empezar',
    contenido: [
      texto(
        'Para que el flujo funcione con cualquier dataset, completa esta ficha ' +
          'mínima de tu conjunto de datos antes de subirlo a S3.',
      ),
      lista([
        'Nombre lógico del conjunto (p. ej. ventas, incidentes, llamadas).',
        'Formato del archivo: Parquet, CSV o JSON por líneas (JSONL).',
        'Columnas con su tipo: texto, entero, decimal, fecha/hora, booleano.',
        'Al menos 1 columna de fecha/hora (para tendencias y línea de tiempo).',
        'Al menos 1 métrica numérica (para KPIs, sumas y promedios).',
        'Idealmente 1 columna categórica (para agrupar: tipo, estado, zona).',
      ]),
      nota(
        'advertencia',
        'Excel (XLSX) no lo lee Athena directamente: conviértelo a CSV o ' +
          'Parquet antes de subirlo. Si no tienes fecha o métrica numérica, ' +
          'algunas gráficas no podrán construirse.',
      ),
      nota(
        'iapol',
        'Si tu dataset tiene latitud y longitud, podrás reutilizarlo en la ' +
          'Sesión 2 para el módulo geoespacial (IAMAPS).',
      ),
    ],
    objetivos: [
      'Describir el dataset propio con una ficha mínima reutilizable.',
      'Detectar a tiempo datos que faltan (fecha, métrica, categoría).',
    ],
    notasInstructor:
      '[0–10 min] Pedir que llenen la ficha en voz alta en parejas; detectar ' +
      'quién trae XLSX (convertir) y quién no tiene columna de fecha.',
  },
  {
    id: 'sa-d02c',
    layout: 'contenido',
    titulo: 'Acceso a la cuenta y estructura del bucket',
    contenido: [
      texto(
        'Los 10 participantes comparten UNA cuenta AWS y UN usuario IAM. El ' +
          'aislamiento se logra por convención de nombres (pNN): cada quien ' +
          'trabaja en SU carpeta de S3 y su propia base de Glue.',
      ),
      callout(
        's3://capacitacion-iapol/\n' +
          '  p01/\n' +
          '    datos/\n' +
          '    resultados/\n' +
          '  p02/\n' +
          '    datos/\n' +
          '    resultados/\n' +
          '  ...',
        {
          variante: 'ruta',
          etiqueta: 'Estructura del bucket (una carpeta por persona)',
          nota: 'Tu carpeta es pNN (p01…p10). Sube tus archivos a pNN/datos/.',
        },
      ),
      lista(
        [
          'S3 datos: s3://capacitacion-iapol/pNN/datos/',
          'S3 resultados Athena: s3://capacitacion-iapol/pNN/resultados/',
          'Base de Glue: cap_pNN. Workgroup de Athena: wg_pNN.',
          'Amazon Quick: cuenta y usuario AUTOR compartidos por el grupo.',
        ],
        true,
      ),
    ],
    objetivos: [
      'Entender el modelo de acceso compartido y el aislamiento por pNN.',
    ],
    notasInstructor:
      '[0–10 min] Dejar escrito en el tablero el pNN de cada quien.',
  },
  {
    id: 'sa-d02d',
    layout: 'contenido',
    titulo: 'Tamaños recomendados y trazabilidad',
    contenido: [
      nota(
        'advertencia',
        'Cuenta, IAM y autor de Quick son compartidos: NO hay trazabilidad por ' +
          'persona (CloudTrail no distingue quién hizo qué) y en Quick TODOS ven ' +
          'y pueden editar los análisis de todos. Mitigación: respeta tu carpeta ' +
          'pNN y nombra tus datasets/análisis con tu pNN (p. ej. "p03 - ventas").',
      ),
      texto('Tamaños recomendados del dataset propio (para no tener problemas):'),
      lista([
        'Recomendado: 10 MB – 500 MB por persona, idealmente en Parquet.',
        'Máximo sugerido: ~1 GB (por encima, SPICE y refrescos tardan).',
        'Filas: de decenas de miles hasta ~1–2 millones.',
        'SPICE: la capacidad incluida se comparte; vigila el consumo total.',
        'CSV pesado: conviértelo a Parquet para reducir tamaño y costo de escaneo.',
      ]),
      nota(
        'iapol',
        'Si un dataset es grande o cambia seguido, usa Direct Query en Quick ' +
          'en lugar de SPICE para ese caso concreto.',
      ),
    ],
    objetivos: [
      'Dimensionar el dataset propio para evitar problemas de costo/rendimiento.',
    ],
    notasInstructor:
      '[0–10 min] El límite real lo pone SPICE compartido y el presupuesto de ' +
      'Athena; ante dudas de tamaño, que escalen al instructor antes de subir.',
  },

  // ─────────────────────────── 10–35 · LAB 1: S3 + Glue
  {
    id: 'sa-d03',
    layout: 'laboratorio-guiado',
    titulo: 'LAB 1 · Organizar los datos en Amazon S3',
    contenido: [
      texto(
        'Cada participante usa SU propia carpeta (pNN) dentro del bucket ' +
          'compartido del aula, para no pisarse con los demás.',
      ),
      pasos([
        {
          instruccion: 'Ubica tu carpeta de datos dentro del bucket del aula.',
          detalle:
            'Usa el patrón capacitacion-iapol/pNN/datos/ y capacitacion-iapol/pNN/resultados/. ',
          captura: `${IMG}/s3-bucket-prefijos.png`,
          capturaDescripcion:
            'Consola de S3 con la carpeta de datos del participante (pNN/datos/).',
          verificacion: 'Ves tu carpeta pNN y, si aplica, la estructura year=/month=.',
        },
      ]),
    ],
    objetivos: [
      'Ubicar tu carpeta de datos (pNN) en S3.',
    ],
    notasInstructor:
      '[10–35 min · LAB 1] Enfatizar el aislamiento por pNN (todos comparten ' +
      'cuenta e IAM).',
  },
  {
    id: 'sa-d03b',
    layout: 'laboratorio-guiado',
    titulo: 'LAB 1 · Subir los datos al prefijo',
    contenido: [
      pasos([
        {
          instruccion: 'Sube tus archivos de datos al prefijo.',
          detalle:
            'Admitidos por Athena: Parquet (recomendado), CSV o JSON por ' +
            'líneas. Si tienes XLSX, conviértelo antes a CSV o Parquet.',
          captura: `${IMG}/s3-objetos-parquet.png`,
          capturaDescripcion:
            'Listado de objetos de datos (parquet/csv/json) dentro del prefijo, con tamaño > 0.',
          verificacion: 'Los objetos aparecen con tamaño > 0 en tu prefijo.',
        },
      ]),
    ],
    objetivos: [
      'Subir los datos de tu dataset al prefijo pNN/datos/.',
    ],
    notasInstructor:
      '[10–35 min · LAB 1] Resaltar Parquet y particiones como palanca de ' +
      'costo, pero aclarar que son opcionales para datasets pequeños.',
  },
  {
    id: 'sa-d03c',
    layout: 'laboratorio-guiado',
    titulo: 'LAB 1 · Separar el prefijo de resultados',
    contenido: [
      pasos([
        {
          instruccion: 'Usa un prefijo separado para los resultados de Athena.',
          detalle:
            'No mezcles datos con resultados: el prefijo de resultados es ' +
            'donde Athena escribe la salida de cada consulta.',
          verificacion: 'Tienes dos rutas: datos y resultados, ambas bajo tu pNN.',
        },
      ]),
      callout(
        's3://capacitacion-iapol/pNN/datos/year=2024/month=01/\n' +
          's3://capacitacion-iapol/pNN/resultados/',
        {
          variante: 'ruta',
          etiqueta: 'Rutas de ejemplo (reemplaza pNN)',
          nota: 'Las particiones (year=/month=) son opcionales: solo si tu dataset tiene fecha.',
        },
      ),
    ],
    objetivos: [
      'Separar datos de resultados de Athena.',
    ],
    notasInstructor:
      '[10–35 min · LAB 1] Dos rutas distintas: datos y resultados, ambas bajo ' +
      'el pNN del participante.',
  },
  {
    id: 'sa-d04',
    layout: 'laboratorio-guiado',
    titulo: 'LAB 1 · Catalogar la tabla en AWS Glue',
    contenido: [
      texto(
        'Una base de datos en Glue es una agrupación lógica de tablas: no ' +
          'guarda datos, solo metadatos. Cada participante crea SU propia base ' +
          'con su prefijo pNN para no pisar las de los demás.',
      ),
      pasos([
        {
          instruccion: 'Crea tu base de datos en Glue (p. ej. "cap_pNN").',
          detalle:
            'Glue → Data Catalog → Databases → Add database. Usa solo ' +
            'minúsculas, números y guión bajo; evita mayúsculas, espacios y ' +
            'guiones medios. Confirma primero la región correcta.',
          captura: `${IMG}/glue-crear-base.png`,
          capturaDescripcion:
            'AWS Glue → Databases → Add database, con el nombre de la base (cap_pNN).',
          verificacion: 'La base cap_pNN aparece en Databases de Glue.',
        },
      ]),
      nota(
        'info',
        'Glue no mueve ni copia los datos: solo guarda los metadatos para que ' +
          'Athena sepa cómo leer los archivos en S3.',
      ),
    ],
    objetivos: [
      'Crear tu base de datos en Glue (cap_pNN).',
    ],
    notasInstructor:
      '[10–35 min · LAB 1] Recordar el aislamiento por cap_pNN (todos comparten ' +
      'cuenta e IAM).',
  },
  {
    id: 'sa-d04b',
    layout: 'laboratorio-guiado',
    titulo: 'LAB 1 · (Opcional) Catalogar con un Crawler',
    contenido: [
      pasos([
        {
          instruccion: '(Opcional) Ejecuta un Crawler apuntando a tu prefijo de datos.',
          detalle:
            'Glue → Crawlers → Create crawler. Data source = S3 apuntando a tu ' +
            'prefijo de DATOS (no al de resultados). Asigna un rol IAM con ' +
            'lectura del bucket y Target database = cap_pNN. Déjalo On demand y ' +
            'pulsa Run. El Crawler infiere el esquema y crea la tabla.',
          captura: `${IMG}/glue-crawler.png`,
          capturaDescripcion:
            'Configuración del Crawler apuntando al prefijo de datos del participante.',
          verificacion: 'La tabla aparece en la base cap_pNN con sus columnas (y particiones si las hay).',
        },
      ]),
      nota(
        'advertencia',
        'El Crawler ADIVINA los tipos a partir de una muestra; a veces se ' +
          'equivoca (p. ej. pone texto donde esperabas fecha). Si eso pasa, ' +
          'edita la tabla o créala por DDL en el LAB 2 con los tipos correctos.',
      ),
    ],
    objetivos: [
      'Entender Crawler (automático) vs. DDL manual (control del esquema).',
    ],
    notasInstructor:
      '[10–35 min · LAB 1] El Crawler infiere el esquema y crea/actualiza la ' +
      'tabla; si el tiempo apremia, sáltalo y crea la tabla por DDL en el ' +
      'LAB 2 (más control del esquema).',
  },

  // ─────────────────────────── 35–80 · LAB 2: Athena
  {
    id: 'sa-d05',
    layout: 'laboratorio-guiado',
    titulo: 'LAB 2 · Configurar el workgroup de Athena',
    contenido: [
      texto(
        'El workgroup aísla consultas, controla la ubicación de resultados y ' +
          'permite fijar límites de datos escaneados (control de costo).',
      ),
      pasos([
        {
          instruccion: 'Crea un workgroup y fija la ubicación de resultados en S3.',
          detalle:
            'Apunta la "Query result location" al prefijo de resultados del ' +
            'LAB 1. Activa el cifrado si tu política lo exige.',
          captura: `${IMG}/athena-workgroup.png`,
          capturaDescripcion:
            'Athena → Workgroups → Create, con Query result location = s3://mi-bucket-athena/resultados/.',
          verificacion: 'El workgroup queda creado y seleccionado en el editor de Athena.',
        },
      ]),
      nota(
        'advertencia',
        'Sin ubicación de resultados válida, Athena no ejecuta consultas. Es ' +
          'el error de configuración más común al empezar.',
      ),
    ],
    objetivos: [
      'Crear el workgroup y su ubicación de resultados.',
    ],
    notasInstructor:
      '[35–80 min · LAB 2] Mostrar dónde se ve el "Data scanned" por consulta ' +
      'para conectar con el costo.',
  },
  {
    id: 'sa-d05b',
    layout: 'laboratorio-guiado',
    titulo: 'LAB 2 · Límite de datos escaneados (control de costo)',
    contenido: [
      pasos([
        {
          instruccion: '(Recomendado) Fija un límite de datos escaneados por consulta.',
          detalle:
            'Un "per-query data usage control" evita escaneos accidentales ' +
            'costosos en tablas grandes.',
          verificacion: 'El workgroup muestra el límite configurado.',
        },
      ]),
      nota(
        'info',
        'El costo de Athena depende de los datos escaneados: este límite es una ' +
          'red de seguridad para no gastar de más por una consulta accidental.',
      ),
    ],
    objetivos: [
      'Aplicar un límite de datos escaneados por consulta.',
    ],
    notasInstructor:
      '[35–80 min · LAB 2] Conectar el límite con el presupuesto compartido del ' +
      'aula.',
  },
  {
    id: 'sa-d06',
    layout: 'laboratorio-guiado',
    titulo: 'LAB 2 · Declarar la tabla externa (DDL)',
    contenido: [
      texto(
        'El DDL se escribe en el editor de Athena (Query editor), no en Glue. ' +
          'La tabla es "externa" porque los datos viven en S3; Athena solo ' +
          'guarda el esquema. El tipo de cada columna debe calzar con tu ' +
          'dataset. Elige la plantilla según tu formato.',
      ),
      callout(
        'CREATE EXTERNAL TABLE IF NOT EXISTS cap_pNN.mi_tabla (\n' +
          '  fecha      timestamp,\n' +
          '  categoria  string,\n' +
          '  cantidad   int,\n' +
          '  monto      double\n' +
          ')\n' +
          'PARTITIONED BY (year int, month int)\n' +
          'STORED AS PARQUET\n' +
          "LOCATION 's3://capacitacion-iapol/pNN/datos/';",
        {
          variante: 'ddl',
          lenguaje: 'sql',
          etiqueta: 'DDL · Parquet (recomendado)',
          nota: 'Reemplaza cap_pNN, las columnas/tipos y pNN en la LOCATION. Quita PARTITIONED BY si no hay fecha.',
        },
      ),
      texto(
        'Si tu dataset no es Parquet, usa la plantilla de tu formato. En CSV ' +
          'todo entra como texto y se castea luego en la vista.',
      ),
      callout(
        'CREATE EXTERNAL TABLE IF NOT EXISTS cap_pNN.mi_tabla (\n' +
          '  fecha      string,\n' +
          '  categoria  string,\n' +
          '  cantidad   int,\n' +
          '  monto      double\n' +
          ')\n' +
          'ROW FORMAT SERDE\n' +
          "  'org.apache.hadoop.hive.serde2.OpenCSVSerde'\n" +
          'STORED AS TEXTFILE\n' +
          "LOCATION 's3://capacitacion-iapol/pNN/datos/'\n" +
          "TBLPROPERTIES ('skip.header.line.count'='1');",
        {
          variante: 'ddl',
          lenguaje: 'sql',
          etiqueta: 'DDL · CSV',
          nota: 'OpenCSVSerde lee todo como texto: convierte luego con CAST. skip.header.line.count salta la fila de títulos.',
        },
      ),
      callout(
        'CREATE EXTERNAL TABLE IF NOT EXISTS cap_pNN.mi_tabla (\n' +
          '  fecha      string,\n' +
          '  categoria  string,\n' +
          '  cantidad   int,\n' +
          '  monto      double\n' +
          ')\n' +
          'ROW FORMAT SERDE\n' +
          "  'org.openx.data.jsonserde.JsonSerDe'\n" +
          'STORED AS TEXTFILE\n' +
          "LOCATION 's3://capacitacion-iapol/pNN/datos/';",
        {
          variante: 'ddl',
          lenguaje: 'sql',
          etiqueta: 'DDL · JSON por líneas (JSONL)',
          nota: 'Un objeto JSON por línea. Los nombres de columna deben coincidir con las claves del JSON.',
        },
      ),
    ],
    objetivos: [
      'Entender qué es una tabla externa y las plantillas DDL (Parquet, CSV y JSON).',
    ],
    notasInstructor:
      '[35–80 min · LAB 2] Recalcar que el tipo de cada columna debe calzar ' +
      'con el archivo; un desajuste produce NULLs o errores. En CSV con ' +
      'OpenCSVSerde todo entra como texto y se castea en la vista.',
  },
  {
    id: 'sa-d06c',
    layout: 'laboratorio-guiado',
    titulo: 'LAB 2 · Ejecutar el DDL',
    contenido: [
      texto(
        'Elige la plantilla de tu formato, pégala en el editor de Athena y ' +
          'ejecútala (Run).',
      ),
      lista([
        'Confirma el workgroup del LAB 2 y la región (arriba a la derecha).',
        'Ajusta base (cap_pNN), columnas y tipos, y la LOCATION real.',
        'Si tu dataset no tiene fecha, elimina la línea PARTITIONED BY.',
        'Verifica que no queden nombres de ejemplo (cap_pNN, pNN) sin reemplazar.',
        'Tras Run, la tabla aparece bajo tu base cap_pNN en el panel izquierdo.',
      ]),
      nota(
        'advertencia',
        'Error típico "bucket does not exist": la LOCATION apunta a un ' +
          'bucket/prefijo inexistente. El DDL no crea el bucket; apunta a datos ' +
          'ya subidos en el LAB 1.',
      ),
    ],
    objetivos: [
      'Ejecutar el CREATE EXTERNAL TABLE y ver la tabla en el catálogo.',
    ],
    notasInstructor:
      '[35–80 min · LAB 2] Si alguien no reemplazó pNN, el DDL falla por bucket ' +
      'inexistente.',
  },
  {
    id: 'sa-d07',
    layout: 'laboratorio-guiado',
    titulo: 'LAB 2 · Registrar particiones',
    contenido: [
      texto(
        'Solo aplica si tu dataset está particionado por carpetas ' +
          '(year=/month=). Athena necesita conocer las particiones para podar ' +
          'y escanear menos datos; si no tienes particiones, salta este paso.',
      ),
      callout('MSCK REPAIR TABLE cap_pNN.mi_tabla;', {
        variante: 'ddl',
        lenguaje: 'sql',
        etiqueta: 'DDL · Particiones',
        nota: "Alternativa explícita: ALTER TABLE cap_pNN.mi_tabla ADD PARTITION (year=2024, month=1) LOCATION 's3://.../year=2024/month=01/';",
      }),
      lista([
        'MSCK REPAIR TABLE descubre todas las particiones del prefijo.',
        'ALTER TABLE ADD PARTITION agrega una concreta (mejor en tablas grandes).',
        'Lístalas con SHOW PARTITIONS cap_pNN.mi_tabla;.',
      ]),
    ],
    objetivos: [
      'Registrar particiones con MSCK/ALTER.',
    ],
    notasInstructor:
      '[35–80 min · LAB 2] MSCK descubre todas las particiones del prefijo.',
  },
  {
    id: 'sa-d07b',
    layout: 'laboratorio-guiado',
    titulo: 'LAB 2 · Comprobar la poda de particiones',
    contenido: [
      texto(
        'Se puede validar la poda ejecutando una consulta que filtre por ' +
          'partición y comparando el "Data scanned" (en la pestaña Query ' +
          'stats) con y sin el filtro: al filtrar por partición debe escanear ' +
          'menos datos.',
      ),
      callout(
        'SELECT count(*) AS filas\n' +
          'FROM cap_pNN.mi_tabla\n' +
          'WHERE year = 2024 AND month = 1;',
        {
          variante: 'comando',
          lenguaje: 'sql',
          etiqueta: 'Consulta de ejemplo (filtro por partición)',
          nota: 'Compara el "Data scanned" con y sin el WHERE de partición.',
        },
      ),
    ],
    objetivos: [
      'Comprobar la poda de particiones por el dato escaneado.',
    ],
    notasInstructor:
      '[35–80 min · LAB 2] Comparar "Data scanned" con y sin filtro de ' +
      'partición para evidenciar el ahorro.',
  },
  {
    id: 'sa-d08',
    layout: 'laboratorio-guiado',
    titulo: 'LAB 2 · Vista para BI (consumo analítico)',
    contenido: [
      texto(
        'La vista deja los datos listos para Quick (limpieza y columnas ' +
          'derivadas). Adapta el SELECT a TU dataset; en CSV conviertes con CAST.',
      ),
      callout(
        'CREATE OR REPLACE VIEW cap_pNN.vw_indicadores AS\n' +
          'SELECT\n' +
          '  CAST(fecha AS date)   AS fecha,\n' +
          '  hour(CAST(fecha AS timestamp)) AS hora,\n' +
          '  categoria,\n' +
          '  cantidad,\n' +
          '  monto\n' +
          'FROM cap_pNN.mi_tabla\n' +
          'WHERE monto >= 0;',
        {
          variante: 'ddl',
          lenguaje: 'sql',
          etiqueta: 'DDL · Vista para Quick',
          nota: 'Ajusta columnas y filtros a tu dataset. Quita hour()/hora si no tienes fecha con hora.',
        },
      ),
    ],
    objetivos: [
      'Entender la vista de consumo para BI adaptada a tu dataset.',
    ],
    notasInstructor:
      '[35–80 min · LAB 2] La vista encapsula la lógica SQL (no copia datos) y ' +
      'será el origen del dataset en Quick (LAB 3).',
  },
  {
    id: 'sa-d08c',
    layout: 'laboratorio-guiado',
    titulo: 'LAB 2 · Previsualizar la vista',
    contenido: [
      texto(
        'Se puede consultar la vista para comprobar que las columnas derivadas ' +
          'salen correctas y sin valores inválidos, por ejemplo previsualizando ' +
          'las primeras filas.',
      ),
      callout('SELECT * FROM cap_pNN.vw_indicadores LIMIT 10;', {
        variante: 'comando',
        lenguaje: 'sql',
        etiqueta: 'Consulta de ejemplo (previsualizar la vista)',
      }),
      nota(
        'info',
        'Deja la vista verificada antes de avanzar: será el origen del dataset ' +
          'en Quick.',
      ),
    ],
    objetivos: [
      'Verificar la vista antes de usarla en Quick.',
    ],
    notasInstructor:
      '[35–80 min · LAB 2] Déjala verificada antes de avanzar al LAB 3.',
  },

  // ─────────────────────────── 80–160 · LAB 3: Quick
  {
    id: 'sa-d09b',
    layout: 'laboratorio-guiado',
    titulo: 'LAB 3 · Elegir la vista y el modo (SPICE/Direct Query)',
    contenido: [
      pasos([
        {
          instruccion: 'Elige tu vista (vw_indicadores) o tu tabla como fuente.',
          captura: `${IMG}/quick-elegir-vista.png`,
          verificacion: 'Se abre la vista previa con las columnas de tu dataset.',
        },
        {
          instruccion: 'Elige el modo: SPICE (rápido/estable) o Direct Query (en vivo).',
          verificacion: 'El dataset queda creado con el modo elegido.',
        },
      ]),
      nota(
        'info',
        'SPICE: copia en memoria (requiere refresco programado). Direct Query: ' +
          'consulta Athena en vivo (datos frescos, costo por consulta). Para el ' +
          'aula, SPICE.',
      ),
    ],
    objetivos: [
      'Elegir SPICE o Direct Query con criterio.',
    ],
    notasInstructor:
      '[80–160 min · LAB 3] Mostrar dónde se programa el refresco de SPICE.',
  },
  {
    id: 'sa-d10',
    layout: 'laboratorio-guiado',
    titulo: 'LAB 3 · Anatomía de un análisis en Quick',
    contenido: [
      texto(
        'No hay hojas ni gráficas obligatorias: cada quien construye lo que su ' +
          'dataset permita. Primero, ubica las tres piezas de Quick.',
      ),
      lista([
        'Hojas: pestañas del análisis; organiza tus visuales como quieras.',
        'Campos: Quick separa dimensiones (texto/fecha, para agrupar) de medidas (números, para sumar/promediar).',
        'Visuales: el panel de tipos (KPI, barras, líneas, tabla, circular, etc.).',
      ]),
      imagen(
        `${IMG}/quick-anatomia.png`,
        'Interfaz de análisis en Quick: lista de campos (dimensiones y medidas), panel de tipos de visual y la hoja.',
      ),
    ],
    objetivos: [
      'Reconocer hojas, campos (dimensión vs medida) y tipos de visual en Quick.',
    ],
    notasInstructor:
      '[80–160 min · LAB 3] Dejar claro que el resto del LAB es exploración ' +
      'libre: se explica CÓMO funciona cada visual y cada quien prueba con sus ' +
      'columnas. No hay entregable de visuales fijos.',
  },
  {
    id: 'sa-d10b',
    layout: 'laboratorio-guiado',
    titulo: 'LAB 3 · Campos calculados (opcional)',
    contenido: [
      texto(
        'Un campo calculado crea una columna nueva a partir de una fórmula, ' +
          'sin tocar los datos de origen. Útil para etiquetas legibles o ' +
          'métricas derivadas. Ejemplo genérico: convertir un código en texto.',
      ),
      callout(
        'ifelse(\n' +
          "  {codigo} = 1, 'Opción A',\n" +
          "  {codigo} = 2, 'Opción B',\n" +
          "  'Otro'\n" +
          ')',
        {
          variante: 'comando',
          etiqueta: 'Campo calculado · ejemplo ifelse',
          nota: 'Reemplaza {codigo} por un campo de tu dataset. La sintaxis puede variar según la versión de Quick.',
        },
      ),
      nota(
        'info',
        'Cómo crearlo: en el editor del dataset o del análisis, usa "Add ' +
          'calculated field", nómbralo y pega la fórmula. Es opcional: si tu ' +
          'dataset ya está listo, puedes saltarlo.',
      ),
    ],
    objetivos: [
      'Saber qué es un campo calculado y cómo crearlo en Quick.',
    ],
    notasInstructor:
      '[80–160 min · LAB 3] Mostrarlo una vez; invitar a quien quiera a crear ' +
      'uno con una columna propia.',
  },
  {
    id: 'sa-d11',
    layout: 'laboratorio-guiado',
    titulo: 'LAB 3 · Cómo crear un KPI',
    contenido: [
      texto(
        'Un KPI muestra una sola cifra (un indicador). Sirve para ver un total ' +
          'de un vistazo con la agregación que elijas.',
      ),
      pasos([
        {
          instruccion: 'Añade un visual tipo KPI y arrastra una medida numérica.',
          detalle:
            'Elige la agregación: COUNT (cuántos), SUM (total), AVG (promedio). ' +
            'Usa cualquier columna numérica de tu dataset.',
          captura: `${IMG}/quick-kpi.png`,
          capturaDescripcion:
            'Visual KPI en Quick mostrando una cifra única con su agregación.',
          verificacion: 'El KPI muestra un número coherente con tu dataset.',
        },
      ]),
    ],
    objetivos: [
      'Crear un KPI y elegir la agregación (COUNT/SUM/AVG).',
    ],
    notasInstructor:
      '[80–160 min · LAB 3] Explicar la diferencia entre COUNT, SUM y AVG con ' +
      'una columna del dataset de alguien.',
  },
  {
    id: 'sa-d11b',
    layout: 'laboratorio-guiado',
    titulo: 'LAB 3 · Cómo crear un gráfico de barras',
    contenido: [
      texto(
        'Las barras comparan categorías. Necesitan una dimensión (eje) y una ' +
          'medida (valor).',
      ),
      pasos([
        {
          instruccion: 'Añade un visual de barras: una dimensión al eje y una medida al valor.',
          detalle:
            'La dimensión es una columna de texto (categoría); la medida es un ' +
            'número con su agregación. Prueba distintas combinaciones.',
          captura: `${IMG}/quick-barras.png`,
          capturaDescripcion:
            'Gráfico de barras en Quick con una dimensión en el eje y una medida en el valor.',
          verificacion: 'Las barras comparan tus categorías por la medida elegida.',
        },
      ]),
    ],
    objetivos: [
      'Crear un gráfico de barras (dimensión + medida).',
    ],
    notasInstructor:
      '[80–160 min · LAB 3] Que cada quien elija la categoría más informativa ' +
      'de su dataset.',
  },
  {
    id: 'sa-d12',
    layout: 'laboratorio-guiado',
    titulo: 'LAB 3 · Cómo crear una gráfica de líneas (tiempo)',
    contenido: [
      texto(
        'Las líneas muestran la evolución en el tiempo. Necesitan una columna ' +
          'de fecha en el eje y una medida como valor.',
      ),
      pasos([
        {
          instruccion: 'Añade un visual de líneas: la fecha al eje y una medida al valor.',
          detalle:
            'Si no tienes columna de fecha, este visual no aplica a tu dataset ' +
            '(usa barras o KPI).',
          captura: `${IMG}/quick-lineas.png`,
          capturaDescripcion:
            'Gráfico de líneas en Quick con una fecha en el eje temporal y una medida en el valor.',
          verificacion: 'La línea muestra la evolución en el tiempo.',
        },
      ]),
    ],
    objetivos: [
      'Crear una gráfica de líneas usando una columna de fecha.',
    ],
    notasInstructor:
      '[80–160 min · LAB 3] Aclarar que depende de tener fecha; conectar con el ' +
      'catálogo de gráficas.',
  },
  {
    id: 'sa-d12b',
    layout: 'laboratorio-guiado',
    titulo: 'LAB 3 · Cómo crear una tabla',
    contenido: [
      texto(
        'La tabla muestra el detalle fila a fila. Admite varias dimensiones y ' +
          'medidas a la vez; útil para verificar valores exactos.',
      ),
      pasos([
        {
          instruccion: 'Añade un visual de tabla y arrastra las columnas que quieras ver.',
          detalle:
            'Combina dimensiones (texto/fecha) y medidas (números). Puedes ' +
            'ordenar por cualquier columna.',
          captura: `${IMG}/quick-tabla.png`,
          capturaDescripcion:
            'Visual de tabla en Quick con varias columnas del dataset.',
          verificacion: 'La tabla lista filas con las columnas elegidas.',
        },
      ]),
    ],
    objetivos: [
      'Crear una tabla con varias dimensiones y medidas.',
    ],
    notasInstructor:
      '[80–160 min · LAB 3] Mostrar cómo ordenar la tabla por una columna.',
  },
  {
    id: 'sa-d13',
    layout: 'laboratorio-guiado',
    titulo: 'LAB 3 · Filtros y controles',
    contenido: [
      texto(
        'Un filtro limita los datos que muestran los visuales. Un control lo ' +
          'convierte en un selector interactivo sobre la hoja.',
      ),
      pasos([
        {
          instruccion: 'Agrega un filtro sobre un campo y conviértelo en control.',
          detalle:
            'Puedes filtrar por una categoría, un rango numérico o una fecha. ' +
            'Define el alcance: solo esta hoja o todo el análisis.',
          captura: `${IMG}/quick-filtro.png`,
          capturaDescripcion:
            'Panel de filtros y un control sobre la hoja en Quick.',
          verificacion: 'Al mover el control, los visuales se actualizan.',
        },
      ]),
      nota(
        'info',
        'Si un filtro "no afecta" a un visual de otra hoja, revisa el alcance ' +
          'del filtro (hoja vs. análisis).',
      ),
    ],
    objetivos: [
      'Crear un filtro y un control, y entender su alcance.',
    ],
    notasInstructor:
      '[80–160 min · LAB 3] Conéctalo con el caso de diagnóstico "el filtro no ' +
      'refleja cambios".',
  },
  {
    id: 'sa-d13-expl',
    layout: 'laboratorio-guiado',
    titulo: 'LAB 3 · Explora libremente y guarda',
    contenido: [
      texto(
        'Ahora que conoces KPI, barras, líneas, tabla y filtros, arma el ' +
          'análisis que tu dataset pida. Prueba también otros visuales.',
      ),
      lista([
        'Circular (pie/dona): proporción del total, con pocas categorías.',
        'Mapa de calor / barras apiladas: concentraciones y composición.',
        'Dispersión: relación entre dos columnas numéricas.',
        'Crea varias hojas si quieres separar temas.',
      ]),
      pasos([
        {
          instruccion: 'Guarda el análisis con un nombre claro (incluye tu pNN).',
          captura: `${IMG}/quick-guardar.png`,
          capturaDescripcion:
            'Diálogo de guardado del análisis en Quick con un nombre que incluye el pNN.',
          verificacion: 'El análisis queda guardado y accesible para la Sesión 2.',
        },
      ]),
      nota(
        'info',
        'Publicar NO se hace aquí: el análisis es el documento de trabajo; el ' +
          'dashboard publicado se genera en la Sesión 2.',
      ),
    ],
    objetivos: [
      'Explorar otros visuales y guardar el análisis propio.',
    ],
    notasInstructor:
      '[80–160 min · LAB 3] Fomentar la exploración; no exigir visuales ' +
      'concretos. Confirmar que el nombre incluye el pNN (autor compartido).',
  },
  {
    id: 'sa-d13b',
    layout: 'contenido',
    titulo: 'Catálogo de gráficas: qué necesita cada una y qué leer',
    contenido: [
      texto(
        'Regla base para cualquier dataset: columna categórica → eje o color; ' +
          'columna numérica → valor o medida; columna de fecha → eje temporal. ' +
          'Si una gráfica "no sale", casi siempre falta la columna del tipo ' +
          'correcto.',
      ),
      lista([
        'KPI (indicador): 1 medida + agregación (SUM/COUNT/AVG). Lees una cifra total de un vistazo.',
        'Barras: 1 categórica (eje) + 1 medida (valor). Lees qué categoría domina (comparación).',
        'Líneas: 1 fecha (eje X) + 1 medida (valor). Lees la tendencia y la estacionalidad en el tiempo.',
        'Tabla: varias dimensiones + medidas. Lees el detalle fila a fila y verificas valores exactos.',
        'Barras por hora/día: 1 dimensión temporal discreta + conteo. Lees picos y valles por franja.',
        'Circular (pie/dona): 1 categórica con POCAS categorías + 1 medida. Lees proporción del total (usar con moderación).',
        'Dispersión (scatter): 2 medidas numéricas. Lees correlación entre dos variables.',
      ]),
      nota(
        'info',
        'Mapea cada gráfica a las columnas de TU dataset: elige la categórica ' +
          'más informativa, tu métrica principal y, si tienes fecha, úsala para ' +
          'las tendencias.',
      ),
      nota(
        'advertencia',
        'Sin columna de fecha no hay líneas ni tendencias; sin métrica numérica ' +
          'no hay KPIs ni sumas. Revísalo contra tu ficha de dataset.',
      ),
    ],
    objetivos: [
      'Elegir la gráfica correcta según los tipos de columna disponibles.',
      'Anticipar qué se espera leer del análisis de cada visual.',
    ],
    notasInstructor:
      '[80–160 min · LAB 3] Pedir que cada quien nombre, para su dataset, qué ' +
      'columna va de categórica, cuál de métrica y si tiene fecha. Conectar ' +
      'con la ficha de la diapositiva inicial.',
  },
  {
    id: 'sa-d13c',
    layout: 'diagnostico',
    titulo: 'Diagnóstico y soporte · cuándo escalar al instructor',
    contenido: [
      texto(
        'Fallos frecuentes del flujo generalizado y su causa probable ' +
          '(confirma con evidencia antes de concluir):',
      ),
      lista([
        'DDL falla "bucket does not exist": la LOCATION apunta a pNN sin reemplazar o sin datos subidos.',
        'Columnas en NULL: el tipo declarado no calza con el archivo (frecuente en CSV; castea en la vista).',
        'SELECT devuelve 0 filas: faltó registrar particiones (MSCK/ALTER) o el filtro no coincide.',
        'Quick no valida Athena: faltan permisos de Quick a S3 (datos y resultados) y a Athena.',
        'SPICE lleno o lento: dataset grande; reduce columnas, usa Parquet o pasa a Direct Query.',
        'XLSX no se cataloga: Athena no lee Excel; conviértelo antes a CSV o Parquet.',
      ]),
      nota(
        'advertencia',
        'Regla de soporte: aplica el checklist de arriba; si tras eso el ' +
          'problema persiste, escálalo al instructor con evidencia (captura del ' +
          'error, tu pNN, el formato y la ruta). No sigas probando a ciegas.',
      ),
    ],
    objetivos: [
      'Reconocer los fallos típicos del flujo con dataset propio.',
      'Saber cuándo y cómo escalar al instructor para resolver mejor.',
    ],
    notasInstructor:
      '[80–160 min · LAB 3] Dejar claro el canal de escalamiento y qué ' +
      'evidencia pedir. La mayoría de casos son permisos de Quick o LOCATION ' +
      'mal puesta.',
  },

  // ─────────────────────────── 160–180 · Repaso y transición
  {
    id: 'sa-d15',
    layout: 'contenido',
    titulo: 'Checklist de la Sesión 1',
    contenido: [
      lista(
        [
          'Datos propios en S3 bajo tu carpeta pNN (y en Parquet si aplica).',
          'Tabla catalogada en Glue (y particiones registradas si hay fecha).',
          'Workgroup con ubicación de resultados y límite de datos escaneados.',
          'Vista vw_indicadores creada y verificada.',
          'Dataset en Quick (SPICE/Direct Query) desde la vista.',
          'Probaste KPI, barras, líneas, tabla y filtros en Quick.',
          'Análisis propio guardado (con tu pNN), listo para la Sesión 2.',
        ],
        true,
      ),
    ],
    objetivos: [
      'Confirmar que el entregable de la Sesión 1 está completo.',
      'Detectar pasos pendientes antes de cerrar.',
    ],
    notasInstructor:
      '[160–180 min] Pedir que marquen el checklist y resolver dudas.',
  },
  {
    id: 'sa-d16',
    layout: 'contenido',
    titulo: 'Buenas prácticas y costo en AWS',
    contenido: [
      lista([
        'Particiona por fecha y usa Parquet para reducir datos escaneados.',
        'Fija límites de datos escaneados en el workgroup (control de costo).',
        'Usa vistas/CTAS para no repetir lógica pesada en cada visual.',
        'Prefiere SPICE para dashboards estables; refresca con programación.',
      ]),
      nota(
        'info',
        'El costo de Athena depende de los datos escaneados: particionar y ' +
          'usar Parquet es la palanca principal de ahorro.',
      ),
    ],
    objetivos: [
      'Aplicar buenas prácticas de rendimiento y costo.',
      'Interiorizar las palancas de ahorro en Athena.',
    ],
    notasInstructor:
      '[160–180 min] Cerrar con las tres palancas: Parquet, particiones y ' +
      'límites del workgroup.',
  },
  {
    id: 'sa-d17',
    layout: 'contenido',
    titulo: 'Cierre de la Sesión 1 y qué sigue',
    contenido: [
      texto('Hoy construimos el flujo de AWS hasta el análisis en Quick:'),
      lista([
        'S3 + Glue: datos organizados y catalogados.',
        'Athena: workgroup, DDL, particiones y vista de BI.',
        'Quick: dataset y exploración de KPIs, gráficas y filtros.',
      ]),
      nota(
        'iapol',
        'En la Sesión 2: publicar el dashboard, permisos y embedding, y la ' +
          'implementación/registro del tablero en IAPOL; luego, Analítica ' +
          'Geoespacial (IAMAPS).',
      ),
    ],
    objetivos: [
      'Repasar el recorrido de AWS hasta el análisis.',
      'Anticipar la Sesión 2 (publicación, IAPOL e IAMAPS).',
    ],
    notasInstructor:
      '[160–180 min] Enlazar explícitamente con la Sesión 2.',
  },
];

/**
 * Sesión 1 completa.
 * @type {import('./tipos.js').Sesion}
 */
export const sesionA = {
  id: 1,
  titulo: 'AWS end-to-end: de S3 a tableros en Amazon Quick',
  duracionMin: 180,
  conceptos,
  diapositivas,
};

export default sesionA;
