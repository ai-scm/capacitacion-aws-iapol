// Feature: capacitacion-aws-iapol
//
// Contenido de la Sesión 3: "Publicación e integración con IAPOL".
//
// Módulo de datos local (contenido pedagógico separado del comportamiento).
// No realiza ninguna conexión ni operación real contra AWS, Amazon Quick o
// IAPOL: todo el contenido es explicativo/simulado y así está rotulado.
//
// Modelos de datos (coherentes con sesion1.js y sesion2.js, ver design.md):
//
//   Sesion {
//     id, titulo, duracionMin, conceptos: string[], diapositivas: Diapositiva[]
//   }
//   Diapositiva {
//     id, layout: 'titulo'|'contenido'|'diagrama'|'sql'|'laboratorio'
//               |'simulador'|'identificadores'|'diagnostico'|'evaluacion',
//     titulo, contenido: Bloque[], objetivos: string[], notasInstructor: string
//   }
//   Bloque { tipo: 'texto'|'lista'|'codigo'|'imagen', ... }
//     texto  => { tipo:'texto', texto }
//     lista  => { tipo:'lista', items: string[] }
//     codigo => { tipo:'codigo', lenguaje?, codigo }
//     imagen => { tipo:'imagen', src, alt }
//
// Requirements cubiertos: 2.5, 18.1, 18.2, 18.3, 19.1, 19.2, 19.3, 25.3, 25.4.

/**
 * Advertencia transversal sobre los identificadores propios de IAPOL (R18.2).
 * `id_portal` e `id_quicksight` son campos del inventario institucional cuya
 * función y correspondencia deben corroborarse con la documentación interna.
 * @type {string}
 */
const ADVERTENCIA_IAPOL_INTERNA =
  'Campo propio de IAPOL. Su función exacta y su correspondencia con los ' +
  'identificadores de Amazon Quick deben corroborarse con la documentación ' +
  'interna autorizada antes de darlas por ciertas.';

/**
 * Nota específica para `id_quicksight`: en el entorno de IAPOL este campo
 * contiene el mismo valor que el Dashboard ID de Amazon Quick (solo cambia el
 * nombre con que lo llama cada sistema). Aun así, tener el identificador no
 * habilita por sí solo el embebido (ver {@link ADVERTENCIA_EMBEBIDO}).
 * @type {string}
 */
const ADVERTENCIA_ID_QUICKSIGHT =
  'Es el nombre con que IAPOL guarda el Dashboard ID del dashboard publicado ' +
  'en Amazon Quick: su valor coincide con el Dashboard ID. Tener este ' +
  'identificador no basta para que el dashboard se visualice embebido.';

/**
 * Advertencia transversal sobre la visualización embebida (R18.3). Copiar una
 * URL de Amazon Quick o un identificador NO habilita automáticamente el
 * embebido en IAPOL.
 * @type {string}
 */
const ADVERTENCIA_EMBEBIDO =
  'Copiar una URL de Amazon Quick o un identificador no habilita ' +
  'automáticamente la visualización embebida en IAPOL. Pueden intervenir ' +
  'autenticación, autorización, configuración de embedding, registro ' +
  'institucional y permisos por usuario o rol.';

/**
 * Nota transversal de los casos de diagnóstico (R19.3): las causas listadas
 * son posibles, no un diagnóstico definitivo sin evidencia del entorno.
 * @type {string}
 */
const NOTA_DIAGNOSTICO =
  'Estas son causas posibles, no un diagnóstico definitivo. Confirmar con ' +
  'evidencia del entorno (permisos efectivos, estado del dataset, logs y ' +
  'configuración) antes de concluir.';

/**
 * @typedef {Object} Identificador
 * @property {string} nombre - Nombre del identificador.
 * @property {string} ambito - Dónde vive el identificador (Amazon Quick o IAPOL).
 * @property {string} descripcion - Descripción didáctica del identificador.
 * @property {string} [advertencia] - Advertencia de corroboración (campos IAPOL).
 */

/**
 * Datos estructurados de los identificadores (R18.1, R18.2). Se exportan para
 * que el componente `IdentificadoresIAPOL` (tarea 12.4) los consuma sin
 * duplicar el contenido en la UI.
 * @type {ReadonlyArray<Identificador>}
 */
export const IDENTIFICADORES = Object.freeze([
  Object.freeze({
    nombre: 'Dataset ID',
    ambito: 'Amazon Quick',
    descripcion:
      'Identificador del conjunto de datos (dataset) en Amazon Quick. ' +
      'Referencia la definición de columnas, tipos y origen que alimenta ' +
      'los análisis.',
  }),
  Object.freeze({
    nombre: 'Analysis ID',
    ambito: 'Amazon Quick',
    descripcion:
      'Identificador del análisis editable en Amazon Quick. Corresponde al ' +
      'espacio de trabajo donde se construyen hojas y visualizaciones antes ' +
      'de publicar.',
  }),
  Object.freeze({
    nombre: 'Dashboard ID',
    ambito: 'Amazon Quick',
    descripcion:
      'Identificador del dashboard publicado en Amazon Quick. Es el recurso ' +
      'de solo lectura que se comparte con las personas destinatarias y el ' +
      'que suele referenciarse para el embebido.',
  }),
  Object.freeze({
    nombre: 'id_portal',
    ambito: 'IAPOL',
    descripcion:
      'Identificador propio del portal IAPOL. Según el plan, su función ' +
      'exacta está pendiente de corroborar; se describe aquí de forma ' +
      'conceptual sin asumir su mecánica.',
    advertencia: ADVERTENCIA_IAPOL_INTERNA,
  }),
  Object.freeze({
    nombre: 'id_quicksight',
    ambito: 'IAPOL',
    descripcion:
      'Es el mismo identificador que el Dashboard ID de Amazon Quick: el ' +
      'inventario de IAPOL guarda el ID del dashboard publicado bajo el ' +
      'nombre de campo "id_quicksight". Es decir, id_quicksight = Dashboard ' +
      'ID; solo cambia cómo lo llama cada sistema.',
    advertencia: ADVERTENCIA_ID_QUICKSIGHT,
  }),
]);

/**
 * @typedef {Object} CasoDiagnostico
 * @property {string} caso - Descripción del síntoma observado.
 * @property {string[]} causasPosibles - Causas posibles del problema.
 * @property {string} nota - Nota de que no es un diagnóstico definitivo.
 */

/**
 * Datos estructurados de los cinco casos de diagnóstico (R19.1, R19.2, R19.3).
 * Se exportan para que el componente `CasosDiagnostico` (tarea 12.4) los
 * consuma. Los cinco casos cubiertos son los exigidos por R19.1:
 *  1) dataset que no aparece para un autor,
 *  2) visualización que no refleja cambios del filtro,
 *  3) falta de permisos para compartir o publicar,
 *  4) dashboard existente que un usuario no puede ver,
 *  5) dashboard no visible en IAPOL pese a tener su identificador.
 * @type {ReadonlyArray<CasoDiagnostico>}
 */
export const CASOS_DIAGNOSTICO = Object.freeze([
  Object.freeze({
    caso: 'El dataset no aparece para un autor en Amazon Quick.',
    causasPosibles: Object.freeze([
      'El dataset no fue compartido con ese autor (o se compartió con otro ' +
        'usuario, grupo o rol).',
      'El autor no tiene el nivel de permiso necesario sobre el dataset ' +
        '(por ejemplo, solo lectura cuando se requiere permiso de autor).',
      'El dataset está en otra cuenta, región o espacio distinto al que el ' +
        'autor está consultando.',
      'La fuente de datos subyacente (por ejemplo, Athena) perdió acceso y el ' +
        'dataset quedó oculto o en error.',
    ]),
    nota: NOTA_DIAGNOSTICO,
  }),
  Object.freeze({
    caso: 'Una visualización no refleja los cambios del filtro.',
    causasPosibles: Object.freeze([
      'El filtro está acotado a una sola hoja o a visualizaciones concretas y ' +
        'no al elemento observado.',
      'El dataset usa SPICE y no se ha actualizado, por lo que muestra una ' +
        'copia previa de los datos.',
      'El campo del filtro no coincide con el campo usado por la ' +
        'visualización (tipo, nombre o cálculo distinto).',
      'Un filtro adicional o un control cruzado está anulando o restringiendo ' +
        'el efecto esperado.',
    ]),
    nota: NOTA_DIAGNOSTICO,
  }),
  Object.freeze({
    caso: 'El usuario no tiene permisos para compartir o publicar.',
    causasPosibles: Object.freeze([
      'El usuario tiene rol de lector o permisos insuficientes para publicar ' +
        'o compartir recursos.',
      'La política o el rol de la cuenta restringe la publicación y la ' +
        'compartición a determinados perfiles.',
      'La licencia o el tipo de usuario en Amazon Quick no incluye las ' +
        'capacidades de autor requeridas.',
      'Existe una restricción administrativa o de gobernanza que bloquea la ' +
        'acción para ese usuario.',
    ]),
    nota: NOTA_DIAGNOSTICO,
  }),
  Object.freeze({
    caso:
      'El dashboard existe en Amazon Quick, pero un usuario no puede verlo.',
    causasPosibles: Object.freeze([
      'El dashboard no fue compartido con ese usuario, grupo o rol.',
      'El usuario carece de permiso de lectura sobre el dashboard o sobre el ' +
        'dataset del que depende.',
      'El dashboard está en otra región, cuenta o espacio distinto al que el ' +
        'usuario accede.',
      'El enlace utilizado apunta al análisis (editable) y no al dashboard ' +
        'publicado, o a una versión no publicada.',
    ]),
    nota: NOTA_DIAGNOSTICO,
  }),
  Object.freeze({
    caso:
      'El dashboard no se visualiza en IAPOL pese a tener su identificador.',
    causasPosibles: Object.freeze([
      'El recurso no fue registrado correctamente en la interfaz ' +
        'administrativa de IAPOL (registro institucional pendiente).',
      'El embebido requiere configuración adicional (autenticación, ' +
        'autorización y ajustes de embedding) que no está completa.',
      'El valor registrado en id_quicksight no coincide con el Dashboard ID ' +
        'vigente (por ejemplo, quedó un ID antiguo), o el campo id_portal no ' +
        'apunta al módulo correcto.',
      'La visibilidad por módulo/submódulo, usuario o rol en IAPOL no habilita ' +
        'el dashboard para quien lo consulta.',
      'Copiar el identificador o la URL no basta: no habilita por sí solo la ' +
        'visualización embebida.',
    ]),
    nota: NOTA_DIAGNOSTICO,
  }),
]);

/**
 * Conceptos mínimos de la Sesión 3 (plan §7.x; R25.3).
 * @type {string[]}
 */
const conceptos = [
  'Diferencia entre análisis y dashboard publicado',
  'Publicación de un dashboard en Amazon Quick',
  'Dataset ID, Analysis ID y Dashboard ID',
  'Identificadores propios de IAPOL: id_portal e id_quicksight',
  'Compartir dashboards y validar permisos y acceso',
  'Flujo conceptual de integración hacia IAPOL (sin ejecución)',
  'Visualización embebida y sus prerrequisitos',
  'Casos de diagnóstico de problemas frecuentes',
  'Diferenciación entre Amazon Quick real, simulación local y proceso IAPOL',
];

/**
 * Diapositivas de la Sesión 3. Entre 15 y 60 (R2.5); aquí 22, alineadas con el
 * cronograma de 120 min del plan (R25.3, R25.4):
 *   0–20   Diferencia análisis vs. dashboard publicado (Explicación)
 *   20–40  Publicación individual de dashboard en Quick (Individual)
 *   40–55  Dashboard ID, Analysis ID y Dataset ID (Guiada)
 *   55–75  Compartir y validar permisos (Individual)
 *   75–95  Flujo administrativo y embedding en IAPOL (Demostración conceptual)
 *   95–110 Diagnóstico de problemas frecuentes (Casos prácticos)
 *   110–120 Evaluación y cierre (Individual)
 * @type {import('./tipos.js').Diapositiva[]}
 */
const diapositivas = [
  // ─────────────────────────────────────── 0–20: Análisis vs. dashboard
  {
    id: 's3-d01',
    layout: 'titulo',
    titulo: 'Sesión 3 · Publicación e integración con IAPOL',
    contenido: [
      {
        tipo: 'texto',
        texto:
          'Del análisis al dashboard publicado: cómo se publica en Amazon ' +
          'Quick, qué identificadores existen y cómo se integra ' +
          'conceptualmente en IAPOL, sin intervenir el portal institucional.',
      },
      {
        tipo: 'lista',
        items: [
          'Duración: 120 minutos.',
          'Caso transversal: viajes de taxis de NYC (enero 2024).',
          'Toda publicación hacia IAPOL es explicación, no ejecución.',
        ],
      },
    ],
    objetivos: [
      'Situar la sesión dentro del recorrido dato → dashboard → IAPOL.',
      'Fijar el alcance: publicar solo en Amazon Quick, nunca en IAPOL.',
    ],
    notasInstructor:
      'Recordar que los participantes publican únicamente en Amazon Quick. ' +
      'IAPOL se explica de forma conceptual. Confirmar que cada asistente es ' +
      'autor habilitado antes de la parte individual.',
  },
  {
    id: 's3-d02',
    layout: 'contenido',
    titulo: 'Agenda y cronograma (120 min)',
    contenido: [
      {
        tipo: 'lista',
        items: [
          '0–20 min · Diferencia entre análisis y dashboard publicado (explicación).',
          '20–40 min · Publicación individual del dashboard en Quick (individual).',
          '40–55 min · Identificar Dashboard ID, Analysis ID y Dataset ID (guiada).',
          '55–75 min · Compartir y validar permisos (individual).',
          '75–95 min · Flujo administrativo y embedding en IAPOL (demostración conceptual).',
          '95–110 min · Diagnóstico de problemas frecuentes (casos prácticos).',
          '110–120 min · Evaluación y cierre (individual).',
        ],
      },
    ],
    objetivos: [
      'Conocer el recorrido de 120 minutos de la sesión.',
      'Anticipar los momentos individuales y los explicativos.',
    ],
    notasInstructor:
      'Vigilar el tiempo: la publicación y el diagnóstico tienden a ' +
      'extenderse. Dejar 10 min firmes para evaluación y cierre.',
  },
  {
    id: 's3-d03',
    layout: 'contenido',
    titulo: 'Análisis vs. dashboard publicado',
    contenido: [
      {
        tipo: 'texto',
        texto:
          'El análisis es el entorno editable donde se construyen hojas y ' +
          'visualizaciones. El dashboard es la vista publicada, de solo ' +
          'lectura e interacción controlada, que se comparte con las ' +
          'personas destinatarias.',
      },
      {
        tipo: 'lista',
        items: [
          'Análisis: edición, campos calculados, pruebas de visualizaciones.',
          'Dashboard: publicación, versión estable y compartición.',
          'Publicar no modifica el análisis: genera/actualiza el dashboard.',
          'Cada uno tiene su propio identificador (Analysis ID / Dashboard ID).',
        ],
      },
    ],
    objetivos: [
      'Distinguir el rol del análisis y el del dashboard.',
      'Entender que publicar produce un recurso compartible aparte.',
    ],
    notasInstructor:
      'Analogía útil: el análisis es el "documento en edición"; el dashboard ' +
      'es la "versión publicada" que otros consumen. Enlaza con Sesión 2.',
  },
  {
    id: 's3-d04',
    layout: 'contenido',
    titulo: 'Qué entregará cada participante',
    contenido: [
      {
        tipo: 'texto',
        texto:
          'Nombre sugerido del dashboard: DASHBOARD_TAXI_NOMBRE. Cada ' +
          'participante trabaja dentro de sus permisos de autor en Amazon ' +
          'Quick.',
      },
      {
        tipo: 'lista',
        items: [
          'Que el dashboard aparece en la sección de dashboards.',
          'Que puede abrirlo y sus hojas y filtros son utilizables.',
          'Que obtiene su Dashboard ID.',
          'Que las autorizaciones de acceso y compartición funcionan.',
        ],
      },
    ],
    objetivos: [
      'Conocer el entregable individual de la sesión.',
      'Fijar los criterios de verificación en Amazon Quick.',
    ],
    notasInstructor:
      'Si algún asistente es solo lector, usar demostración del instructor en ' +
      'lugar de bloquear la actividad. Ser lector no basta para publicar.',
  },

  // ─────────────────────────────────────── 20–40: Publicación en Quick
  {
    id: 's3-d05',
    layout: 'contenido',
    titulo: 'Publicar un dashboard en Amazon Quick',
    contenido: [
      {
        tipo: 'texto',
        texto:
          'La publicación toma el análisis actual y crea (o actualiza) un ' +
          'dashboard. A partir de ahí se comparte y se localiza su ' +
          'identificador.',
      },
      {
        tipo: 'lista',
        items: [
          'Revisar que las tres hojas y los filtros estén completos.',
          'Publicar con un nombre claro y versionable.',
          'Confirmar que el dashboard aparece en el listado.',
          'Abrirlo y validar la interacción de filtros y controles.',
        ],
      },
      {
        tipo: 'imagen',
        src: '/img/sesion3/publicar-dashboard.svg',
        alt:
          'Diagrama ilustrativo del paso de análisis editable a dashboard ' +
          'publicado en Amazon Quick.',
      },
    ],
    objetivos: [
      'Describir el acto de publicar en Amazon Quick.',
      'Verificar el dashboard recién publicado.',
    ],
    notasInstructor:
      'Las rutas y botones exactos de la interfaz deben cotejarse con la ' +
      'versión vigente de Amazon Quick antes de capturas finales (plan §11).',
  },
  {
    id: 's3-d06',
    layout: 'simulador',
    titulo: 'Simulación local · Publicar y localizar el ID',
    contenido: [
      {
        tipo: 'texto',
        texto:
          'Simulación local (no es Amazon Quick real). Reproduce de forma ' +
          'didáctica el paso de publicar y localizar el Dashboard ID, sin ' +
          'ninguna conexión a AWS ni a IAPOL.',
      },
      {
        tipo: 'lista',
        items: [
          'Partir del análisis de tres hojas de la Sesión 2.',
          'Simular la publicación y obtener un Dashboard ID de ejemplo.',
          'Observar que el Analysis ID no cambia al publicar.',
        ],
      },
    ],
    objetivos: [
      'Ensayar el flujo de publicación en un entorno seguro.',
      'Asociar la publicación con la aparición del Dashboard ID.',
    ],
    notasInstructor:
      'Insistir en la etiqueta "Simulación local": ningún recurso real se ' +
      'crea. Útil para quienes aún no tienen permisos de autor.',
  },

  // ─────────────────────────────────────── 40–55: Identificadores
  {
    id: 's3-d07',
    layout: 'contenido',
    titulo: 'Tres identificadores que no hay que confundir',
    contenido: [
      {
        tipo: 'texto',
        texto:
          'En Amazon Quick coexisten tres identificadores del recorrido. Cada ' +
          'uno referencia un recurso distinto del flujo dato → análisis → ' +
          'dashboard.',
      },
      {
        tipo: 'lista',
        items: [
          'Dataset ID → el conjunto de datos.',
          'Analysis ID → el análisis editable.',
          'Dashboard ID → el dashboard publicado.',
        ],
      },
    ],
    objetivos: [
      'Diferenciar Dataset ID, Analysis ID y Dashboard ID.',
      'Relacionar cada ID con su recurso en el flujo.',
    ],
    notasInstructor:
      'Error común: usar el Analysis ID creyendo que es el del dashboard. El ' +
      'embebido suele referenciar el Dashboard ID publicado.',
  },
  {
    id: 's3-d08',
    layout: 'identificadores',
    titulo: 'Identificadores de Amazon Quick',
    contenido: [
      {
        tipo: 'lista',
        items: [
          'Dataset ID — identificador del conjunto de datos en Amazon Quick.',
          'Analysis ID — identificador del análisis editable.',
          'Dashboard ID — identificador del dashboard publicado y compartible.',
        ],
      },
      {
        tipo: 'texto',
        texto:
          'Estos tres identificadores viven en Amazon Quick y describen ' +
          'recursos reales del producto.',
      },
    ],
    objetivos: [
      'Leer y ubicar los identificadores propios de Amazon Quick.',
      'Asociar cada identificador con su descripción.',
    ],
    notasInstructor:
      'Esta diapositiva usa el layout "identificadores"; el componente ' +
      'IdentificadoresIAPOL consume la lista exportada IDENTIFICADORES.',
  },
  {
    id: 's3-d09',
    layout: 'identificadores',
    titulo: 'Identificadores propios de IAPOL',
    contenido: [
      {
        tipo: 'lista',
        items: [
          'id_portal — identificador propio del portal IAPOL; función exacta por corroborar.',
          'id_quicksight — es el Dashboard ID de Amazon Quick guardado en el inventario de IAPOL (mismo valor, distinto nombre).',
        ],
      },
      { tipo: 'texto', texto: ADVERTENCIA_ID_QUICKSIGHT },
      {
        tipo: 'imagen',
        src: '/img/sesion3/identificadores.svg',
        alt:
          'Esquema de los identificadores: Dataset ID, Analysis ID y Dashboard ' +
          'ID en Amazon Quick; en IAPOL, id_portal (por corroborar) e ' +
          'id_quicksight, que guarda el mismo valor que el Dashboard ID.',
      },
    ],
    objetivos: [
      'Reconocer que id_portal e id_quicksight son campos de IAPOL.',
      'Entender que id_quicksight equivale al Dashboard ID de Amazon Quick.',
    ],
    notasInstructor:
      'Dejar claro que id_quicksight guarda el mismo valor que el Dashboard ' +
      'ID (solo cambia el nombre del campo). id_portal, en cambio, sigue ' +
      'pendiente de corroborar contra el inventario y el manual (plan §11).',
  },
  {
    id: 's3-d10',
    layout: 'identificadores',
    titulo: 'Copiar un ID o una URL no habilita el embebido',
    contenido: [
      { tipo: 'texto', texto: ADVERTENCIA_EMBEBIDO },
      {
        tipo: 'lista',
        items: [
          'Autenticación y autorización del usuario que visualiza.',
          'Configuración de embedding habilitada para el dashboard.',
          'Registro institucional del recurso en IAPOL.',
          'Permisos por usuario o rol dentro del portal.',
        ],
      },
    ],
    objetivos: [
      'Entender que un identificador o una URL no basta para embeber.',
      'Enumerar los prerrequisitos del embebido.',
    ],
    notasInstructor:
      'Punto clave de seguridad conceptual: evitar que alguien crea que pegar ' +
      'una URL de Quick "activa" el dashboard dentro de IAPOL.',
  },

  // ─────────────────────────────────────── 55–75: Compartir y permisos
  {
    id: 's3-d11',
    layout: 'contenido',
    titulo: 'Compartir el dashboard y validar permisos',
    contenido: [
      {
        tipo: 'texto',
        texto:
          'Compartir un dashboard concede acceso a usuarios, grupos o roles. ' +
          'El acceso al dashboard depende también del acceso al dataset del ' +
          'que proviene.',
      },
      {
        tipo: 'lista',
        items: [
          'Compartir con el usuario/grupo correcto y el nivel adecuado.',
          'Verificar que el destinatario puede abrir el dashboard.',
          'Recordar la dependencia del dataset subyacente.',
          'Ser lector no habilita publicar ni compartir.',
        ],
      },
    ],
    objetivos: [
      'Describir cómo se comparte y se valida el acceso.',
      'Relacionar el acceso al dashboard con el acceso al dataset.',
    ],
    notasInstructor:
      'Pedir a los participantes que compartan con un compañero y verifiquen ' +
      'el acceso en vivo (dentro de sus permisos). Anotar casos límite.',
  },
  {
    id: 's3-d12',
    layout: 'contenido',
    titulo: 'Niveles de acceso y licencias (conceptual)',
    contenido: [
      {
        tipo: 'texto',
        texto:
          'Los permisos y el tipo de usuario determinan qué puede hacer cada ' +
          'persona. Autor y lector no son equivalentes.',
      },
      {
        tipo: 'lista',
        items: [
          'Lector: consume dashboards compartidos; no publica ni comparte.',
          'Autor: crea análisis, publica dashboards y comparte recursos.',
          'La licencia/tipo de usuario puede limitar estas capacidades.',
          'Políticas y roles de la cuenta pueden restringir acciones.',
        ],
      },
    ],
    objetivos: [
      'Distinguir capacidades de lector y autor.',
      'Reconocer el efecto de licencias, roles y políticas.',
    ],
    notasInstructor:
      'Los nombres exactos de roles y licencias dependen de la cuenta; ' +
      'presentarlo de forma conceptual y verificar antes de afirmar detalles.',
  },

  // ─────────────────────────────────── 75–95: Flujo e integración IAPOL
  {
    id: 's3-d13',
    layout: 'diagrama',
    titulo: 'Flujo conceptual de integración con IAPOL',
    contenido: [
      {
        tipo: 'texto',
        texto:
          'Proceso institucional IAPOL (explicación, no ejecución). Los pasos ' +
          'administrativos se describen; no se realizan durante la ' +
          'capacitación.',
      },
      {
        tipo: 'codigo',
        lenguaje: 'text',
        codigo:
          'Análisis creado en Amazon Quick\n' +
          '    ↓\n' +
          'Publicar dashboard en Amazon Quick\n' +
          '    ↓\n' +
          'Localizar Dashboard ID y verificar recursos asociados\n' +
          '    ↓\n' +
          'Comprobar accesos y permisos\n' +
          '    ↓\n' +
          '[Proceso institucional] Registrar recurso en interfaz administrativa IAPOL\n' +
          '    ↓\n' +
          '[Proceso institucional] Asociar módulo/submódulo y visibilidad\n' +
          '    ↓\n' +
          '[Proceso institucional] Verificar que el dashboard se visualiza embebido',
      },
      {
        tipo: 'imagen',
        src: '/img/sesion3/flujo-integracion-iapol.svg',
        alt:
          'Flujo conceptual: en Amazon Quick se publica el dashboard y se ' +
          'localiza el Dashboard ID; luego, como proceso institucional ' +
          'explicativo (no ejecutado), se registra el recurso, se define la ' +
          'visibilidad y se verifica el embebido en IAPOL.',
      },
    ],
    objetivos: [
      'Describir el recorrido completo de publicación a embebido.',
      'Identificar qué pasos son de Amazon Quick y cuáles institucionales.',
    ],
    notasInstructor:
      'Marcar con claridad que los tres últimos pasos ([Proceso ' +
      'institucional]) son explicación. Rótulos, rutas y campos exactos ' +
      'están pendientes de validación interna (plan §7.3, §11).',
  },
  {
    id: 's3-d14',
    layout: 'contenido',
    titulo: 'Qué es explicación y qué es ejecución',
    contenido: [
      {
        tipo: 'lista',
        items: [
          'Amazon Quick real: publicar y compartir el dashboard (lo hace el participante).',
          'Simulación local: ensayo del flujo en esta plataforma, sin servicios externos.',
          'Proceso institucional IAPOL: registro, visibilidad y embebido (solo se explican).',
        ],
      },
      {
        tipo: 'texto',
        texto:
          'Durante la capacitación no se registran ni publican dashboards de ' +
          'prueba en IAPOL. El portal no se modifica.',
      },
    ],
    objetivos: [
      'Diferenciar Amazon Quick real, simulación local y proceso IAPOL.',
      'Interiorizar la prohibición de operar sobre IAPOL en prácticas.',
    ],
    notasInstructor:
      'Regla esencial del plan: ninguna simulación debe confundirse con una ' +
      'operación real. Reforzar la diferenciación de los tres planos.',
  },
  {
    id: 's3-d15',
    layout: 'contenido',
    titulo: 'Materiales internos pendientes de corroborar',
    contenido: [
      {
        tipo: 'texto',
        texto:
          'El contenido no documentado internamente no se representa como ' +
          'proceso validado. Antes de afirmar la mecánica de IAPOL, se ' +
          'requiere evidencia interna.',
      },
      {
        tipo: 'lista',
        items: [
          'Inventario de dashboards, análisis y datasets de IAPOL.',
          'Manual o evidencia del registro administrativo de dashboards.',
          'Correspondencia de id_portal e id_quicksight.',
          'Procedimiento institucional de visibilidad y permisos.',
          'Capturas auténticas del entorno autorizado.',
        ],
      },
    ],
    objetivos: [
      'Reconocer qué evidencia interna falta por incorporar.',
      'Evitar presentar supuestos como procesos validados.',
    ],
    notasInstructor:
      'Usar esta diapositiva para gestionar expectativas: hay piezas del ' +
      'flujo IAPOL que se documentarán después, con autorización.',
  },

  // ─────────────────────────────────── 95–110: Diagnóstico
  {
    id: 's3-d16',
    layout: 'diagnostico',
    titulo: 'Caso 1 · El dataset no aparece para un autor',
    contenido: [
      {
        tipo: 'texto',
        texto: CASOS_DIAGNOSTICO[0].caso,
      },
      {
        tipo: 'lista',
        items: [...CASOS_DIAGNOSTICO[0].causasPosibles],
      },
      { tipo: 'texto', texto: CASOS_DIAGNOSTICO[0].nota },
    ],
    objetivos: [
      'Enumerar causas posibles de un dataset que no aparece.',
      'Pensar en compartición, permisos, ubicación y fuente.',
    ],
    notasInstructor:
      'Primero preguntar: ¿se compartió el dataset con ese autor y con qué ' +
      'permiso? Son las causas más frecuentes. No concluir sin evidencia.',
  },
  {
    id: 's3-d17',
    layout: 'diagnostico',
    titulo: 'Caso 2 · La visualización no refleja el filtro',
    contenido: [
      { tipo: 'texto', texto: CASOS_DIAGNOSTICO[1].caso },
      { tipo: 'lista', items: [...CASOS_DIAGNOSTICO[1].causasPosibles] },
      { tipo: 'texto', texto: CASOS_DIAGNOSTICO[1].nota },
    ],
    objetivos: [
      'Relacionar el síntoma con alcance del filtro y SPICE.',
      'Revisar coincidencia de campos entre filtro y visual.',
    ],
    notasInstructor:
      'Enlazar con Sesión 2 (SPICE vs. Direct Query y alcance de filtros). ' +
      'Un filtro por hoja no afecta a otras hojas.',
  },
  {
    id: 's3-d18',
    layout: 'diagnostico',
    titulo: 'Caso 3 · Sin permisos para compartir o publicar',
    contenido: [
      { tipo: 'texto', texto: CASOS_DIAGNOSTICO[2].caso },
      { tipo: 'lista', items: [...CASOS_DIAGNOSTICO[2].causasPosibles] },
      { tipo: 'texto', texto: CASOS_DIAGNOSTICO[2].nota },
    ],
    objetivos: [
      'Identificar causas de permiso, política, licencia y gobernanza.',
      'Confirmar que ser lector no habilita publicar o compartir.',
    ],
    notasInstructor:
      'Verificar el rol y la licencia del usuario antes de asumir un fallo ' +
      'técnico. A menudo es un tema de permisos, no de la herramienta.',
  },
  {
    id: 's3-d19',
    layout: 'diagnostico',
    titulo: 'Caso 4 · Dashboard existente que no se ve',
    contenido: [
      { tipo: 'texto', texto: CASOS_DIAGNOSTICO[3].caso },
      { tipo: 'lista', items: [...CASOS_DIAGNOSTICO[3].causasPosibles] },
      { tipo: 'texto', texto: CASOS_DIAGNOSTICO[3].nota },
    ],
    objetivos: [
      'Distinguir compartición, permisos, ubicación y tipo de enlace.',
      'Detectar enlaces al análisis en lugar del dashboard publicado.',
    ],
    notasInstructor:
      'Comprobar que el enlace apunta al dashboard publicado y no al análisis ' +
      'editable o a una versión sin publicar.',
  },
  {
    id: 's3-d20',
    layout: 'diagnostico',
    titulo: 'Caso 5 · No se ve en IAPOL pese a tener el ID',
    contenido: [
      { tipo: 'texto', texto: CASOS_DIAGNOSTICO[4].caso },
      { tipo: 'lista', items: [...CASOS_DIAGNOSTICO[4].causasPosibles] },
      { tipo: 'texto', texto: CASOS_DIAGNOSTICO[4].nota },
    ],
    objetivos: [
      'Relacionar el síntoma con registro, embedding y visibilidad en IAPOL.',
      'Reafirmar que el identificador por sí solo no habilita el embebido.',
    ],
    notasInstructor:
      'Conecta con la advertencia de identificadores: tener el ID no basta. ' +
      'Confirmar registro institucional, embedding y visibilidad por rol.',
  },

  // ─────────────────────────────────── 110–120: Evaluación y cierre
  {
    id: 's3-d21',
    layout: 'evaluacion',
    titulo: 'Evaluación final y verificación manual',
    contenido: [
      {
        tipo: 'texto',
        texto:
          'La evaluación cubre las seis áreas (flujo, SQL, tres hojas, ' +
          'filtros, publicación e IAPOL), con umbral orientativo de 80/100.',
      },
      {
        tipo: 'lista',
        items: [
          'Explicar el flujo S3 → Athena → Quick → IAPOL.',
          'Interpretar SQL y resultados.',
          'Crear un análisis de tres hojas.',
          'Configurar filtros y visualizaciones.',
          'Publicar el dashboard en Amazon Quick y localizar su ID.',
          'Explicar la integración con IAPOL y sus identificadores.',
        ],
      },
      {
        tipo: 'texto',
        texto:
          'Las acciones fuera de la plataforma local requieren verificación ' +
          'manual del instructor: un cuestionario no prueba por sí solo que ' +
          'se crearon o publicaron recursos.',
      },
    ],
    objetivos: [
      'Conocer las áreas evaluadas y el umbral de aprobación.',
      'Entender el papel de la verificación manual del instructor.',
    ],
    notasInstructor:
      'La publicación real en Quick se valida observando al participante o ' +
      'su dashboard, no solo con el cuestionario.',
  },
  {
    id: 's3-d22',
    layout: 'contenido',
    titulo: 'Cierre de la Sesión 3',
    contenido: [
      {
        tipo: 'texto',
        texto:
          'Resultado esperado: dashboard publicado y verificable en Amazon ' +
          'Quick, identificadores comprendidos e integración con IAPOL ' +
          'explicada sin cambios al portal.',
      },
      {
        tipo: 'lista',
        items: [
          'Dashboard publicado en Amazon Quick (dentro de permisos).',
          'Dataset ID, Analysis ID y Dashboard ID diferenciados.',
          'Flujo conceptual hacia IAPOL comprendido, no ejecutado.',
          'Casos de diagnóstico reconocidos como causas posibles.',
        ],
      },
    ],
    objetivos: [
      'Sintetizar los logros de la sesión.',
      'Reafirmar que IAPOL no se interviene durante la capacitación.',
    ],
    notasInstructor:
      'Cerrar recordando los materiales internos pendientes y la prohibición ' +
      'de publicar pruebas en IAPOL. Agradecer y abrir preguntas finales.',
  },
];

/**
 * Sesión 3 completa: "Publicación e integración con IAPOL" (R25.3, R25.4).
 * @type {import('./tipos.js').Sesion}
 */
export const sesion3 = {
  id: 3,
  titulo: 'Publicación e integración con IAPOL',
  duracionMin: 120,
  conceptos,
  diapositivas,
};

export default sesion3;
