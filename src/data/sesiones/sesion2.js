// Sesión 2: "Análisis y dashboards en Amazon Quick"
//
// Contenido pedagógico de la segunda capacitación (120 minutos), alineado con el
// cronograma del plan (plan-capacitacion.md §6) y los requisitos R2.5, R25.2 y R25.4.
//
// Caso práctico transversal: NYC Yellow Taxi Trip Records (enero de 2024).
//
// Honestidad conceptual: el contenido diferencia tres planos — Amazon Quick REAL,
// SIMULACIÓN LOCAL (el simulador de la plataforma) y el PROCESO INSTITUCIONAL IAPOL.
// La plataforma no ejecuta operaciones reales en AWS ni modifica IAPOL.
//
// Modelo de datos (compartido con sesion1.js y sesion3.js):
//
//   Sesion {
//     id, titulo, duracionMin, conceptos: string[], diapositivas: Diapositiva[]
//   }
//
//   Diapositiva {
//     id, layout, titulo, contenido: Bloque[], objetivos: string[], notasInstructor
//   }
//
//   Bloque (unión discriminada por `tipo`):
//     { tipo: 'texto',  texto: string }
//     { tipo: 'lista',  items: string[] }
//     { tipo: 'codigo', lenguaje?: string, codigo: string }
//     { tipo: 'imagen', src: string, alt: string }

/** @typedef {{tipo:'texto', texto:string}} BloqueTexto */
/** @typedef {{tipo:'lista', items:string[]}} BloqueLista */
/** @typedef {{tipo:'codigo', lenguaje?:string, codigo:string}} BloqueCodigo */
/** @typedef {{tipo:'imagen', src:string, alt:string}} BloqueImagen */
/** @typedef {BloqueTexto|BloqueLista|BloqueCodigo|BloqueImagen} Bloque */

// Helpers de construcción de bloques (mantienen la forma consistente).
const texto = (t) => ({ tipo: 'texto', texto: t });
const lista = (items) => ({ tipo: 'lista', items });
const codigo = (codigo, lenguaje = 'sql') => ({ tipo: 'codigo', lenguaje, codigo });
// const imagen = (src, alt) => ({ tipo: 'imagen', src, alt }); // disponible si se añaden assets

/** @type {import('../../domain/tipos.js').Sesion | any} */
const sesion2 = {
  id: 2,
  titulo: 'Análisis y dashboards en Amazon Quick',
  duracionMin: 120,
  conceptos: [
    'Fuente de datos',
    'Dataset',
    'Análisis',
    'Dashboard',
    'SPICE',
    'Direct Query',
    'SQL personalizado',
    'Campos, dimensiones y métricas',
    'KPIs',
    'Visualizaciones (KPI, barras, líneas, tabla)',
    'Filtros y controles',
    'Campos calculados',
    'Hoja de análisis: Resumen ejecutivo',
    'Hoja de análisis: Análisis detallado',
    'Hoja de análisis: Tendencias',
  ],
  diapositivas: [
    // ───────────────────────────────────────────────────────────────────────
    // Bloque 0–15 min · Fuente de datos, dataset, análisis y dashboard
    // ───────────────────────────────────────────────────────────────────────
    {
      id: 's2-d01',
      layout: 'titulo',
      titulo: 'Sesión 2 · Análisis y dashboards en Amazon Quick',
      contenido: [
        texto(
          'Segunda capacitación de la serie. Partimos de una fuente de datos ya ' +
            'preparada en la Sesión 1 (Athena sobre S3) y aprendemos a construir un ' +
            'análisis propio de tres hojas en Amazon Quick.',
        ),
        texto(
          'Caso práctico transversal: NYC Yellow Taxi Trip Records, enero de 2024 ' +
            '(datos públicos de ejemplo de la NYC TLC).',
        ),
        lista([
          'Duración: 120 minutos.',
          'Objetivo: crear un análisis personal a partir de un dataset compartido.',
          'Entregable: análisis individual con tres hojas, KPIs, filtros y controles.',
        ]),
      ],
      objetivos: [
        'Situar la Sesión 2 dentro del recorrido del dato S3 → Athena → Quick → IAPOL.',
        'Reconocer el entregable de la sesión: un análisis de tres hojas en Quick.',
      ],
      notasInstructor:
        'Enlaza con el cierre de la Sesión 1: ya existe una vista/consulta validada en ' +
        'Athena lista para consumirse desde Quick. Recuerda la regla esencial: esta ' +
        'plataforma es pedagógica y no ejecuta operaciones reales. Presenta la agenda de ' +
        '120 min antes de avanzar.',
    },
    {
      id: 's2-d02',
      layout: 'contenido',
      titulo: 'Agenda de la sesión (120 minutos)',
      contenido: [
        texto('El cronograma sigue el plan de capacitación (§6):'),
        lista([
          '0–15 min · Fuente de datos, dataset, análisis y dashboard (explicación).',
          '15–30 min · Conexión Athena–Quick y dataset compartido (instructor).',
          '30–45 min · SPICE, Direct Query y SQL personalizado (demostración).',
          '45–65 min · KPIs y gráficos de barras (práctica individual).',
          '65–85 min · Filtros, controles y campos calculados (práctica individual).',
          '85–105 min · Diseño de tres hojas y gráficos temporales (práctica individual).',
          '105–120 min · Verificación del diseño y las interacciones (validación).',
        ]),
      ],
      objetivos: [
        'Conocer la distribución del tiempo y las modalidades (explicación, instructor, individual, validación).',
      ],
      notasInstructor:
        'Usa el temporizador del Modo Presentador para respetar los bloques. Las prácticas ' +
        'individuales (45–105) son el núcleo: reserva tiempo suficiente y no te extiendas en ' +
        'la teoría inicial.',
    },
    {
      id: 's2-d03',
      layout: 'contenido',
      titulo: 'Fuente de datos vs. dataset',
      contenido: [
        texto(
          'Son conceptos distintos que conviene no confundir desde el inicio:',
        ),
        lista([
          'Fuente de datos (data source): la conexión a un origen, por ejemplo Amazon ' +
            'Athena. Define cómo Quick llega a los datos (motor, workgroup, permisos).',
          'Dataset: la preparación de datos sobre esa fuente — tabla o vista ' +
            'seleccionada, campos, tipos, filtros de preparación y, opcionalmente, SQL ' +
            'personalizado. Es lo que consumen los análisis.',
        ]),
        texto(
          'En nuestro caso: la fuente de datos apunta a Athena; el dataset ' +
            'ds_viajes_taxi_capacitacion (nombre propuesto) se basa en la vista ' +
            'vw_indicadores preparada en la Sesión 1.',
        ),
      ],
      objetivos: [
        'Diferenciar una fuente de datos (conexión) de un dataset (preparación de datos).',
        'Identificar la fuente y el dataset del caso NYC Taxi.',
      ],
      notasInstructor:
        'Analogía útil: la fuente de datos es "la tubería" hacia el origen; el dataset es ' +
        '"el agua ya filtrada y lista para servir". Los nombres de recursos son de ejemplo y ' +
        'deben confirmarse contra el entorno real.',
    },
    {
      id: 's2-d04',
      layout: 'contenido',
      titulo: 'Análisis vs. dashboard publicado',
      contenido: [
        texto('La otra pareja de conceptos clave de la sesión:'),
        lista([
          'Análisis (analysis): el espacio editable donde el autor construye hojas, ' +
            'visualizaciones, filtros y cálculos. Es un documento de trabajo.',
          'Dashboard: la versión publicada y de solo lectura del análisis, pensada para ' +
            'compartir y consumir. Se trabaja en la Sesión 3.',
        ]),
        texto(
          'En la Sesión 2 trabajamos el análisis (ANALISIS_TAXI_NOMBRE). La publicación ' +
            'del dashboard (DASHBOARD_TAXI_NOMBRE) y su integración con IAPOL se abordan en ' +
            'la Sesión 3.',
        ),
      ],
      objetivos: [
        'Distinguir el análisis editable del dashboard publicado.',
        'Ubicar qué parte del ciclo se cubre en esta sesión.',
      ],
      notasInstructor:
        'Deja claro que hoy NO publicamos ni registramos nada en IAPOL. Hoy construimos el ' +
        'análisis. Esta frontera evita confusiones con el proceso institucional.',
    },
    {
      id: 's2-d05',
      layout: 'diagrama',
      titulo: 'Ubicación de Quick en el flujo del dato',
      contenido: [
        texto(
          'Quick se sitúa después de Athena en el recorrido del dato. Consume un dataset ' +
            'preparado y permite el análisis visual.',
        ),
        codigo(
          [
            'S3 (Parquet)',
            '   ↓',
            'AWS Glue Data Catalog (metadatos de tablas)',
            '   ↓',
            'Amazon Athena (consulta SQL sobre S3)',
            '   ↓   ← fuente de datos en Quick',
            'Dataset compartido en Amazon Quick',
            '   ↓',
            'Análisis con tres hojas (KPIs, gráficos, filtros)',
            '   ↓',
            'Dashboard publicado en Quick  → [Sesión 3]  → Integración IAPOL',
          ].join('\n'),
          'text',
        ),
        texto(
          'Precisión: Glue registra y describe tablas; Athena consulta S3 usando esos ' +
            'metadatos. Los pasos de integración en IAPOL son explicativos y no se ejecutan ' +
            'desde la plataforma.',
        ),
      ],
      objetivos: [
        'Explicar dónde encaja Amazon Quick en la arquitectura S3 → Athena → Quick → IAPOL.',
      ],
      notasInstructor:
        'Este diagrama refuerza la continuidad con la Sesión 1. Señala el punto "fuente de ' +
        'datos en Quick": es donde conectamos Athena. El Diagrama_Arquitectura interactivo ' +
        'de la plataforma amplía cada nodo.',
    },

    // ───────────────────────────────────────────────────────────────────────
    // Bloque 15–30 min · Conexión Athena–Quick y dataset compartido
    // ───────────────────────────────────────────────────────────────────────
    {
      id: 's2-d06',
      layout: 'contenido',
      titulo: 'Conexión Athena–Quick (demostración del instructor)',
      contenido: [
        texto(
          'La conexión de Quick a Athena y la creación del dataset compartido son tareas ' +
            'de autor/administrador que realiza el instructor en el entorno real. Se ' +
            'muestran como demostración.',
        ),
        lista([
          'Quick accede a Athena mediante una fuente de datos configurada por el instructor.',
          'El acceso requiere permisos de Quick sobre Athena, el catálogo (Glue), S3 y la ' +
            'ubicación de resultados.',
          'A partir de la fuente se crea el dataset y se comparte con los autores ' +
            'participantes.',
        ]),
        texto(
          'Advertencia: rótulos, botones y rutas exactas deben cotejarse con la versión ' +
            'vigente de la consola antes de afirmar pasos concretos.',
        ),
      ],
      objetivos: [
        'Comprender que la conexión y el dataset los prepara el instructor.',
        'Reconocer los permisos implicados en el acceso de Quick a Athena.',
      ],
      notasInstructor:
        'Condición acordada: solo el instructor crea y configura recursos AWS. Si los ' +
        'participantes no tienen permisos de autor reales, muéstralo como demostración y usa ' +
        'el simulador local para la parte individual. No compartas credenciales.',
    },
    {
      id: 's2-d07',
      layout: 'contenido',
      titulo: 'Dataset compartido y permisos de autor',
      contenido: [
        texto(
          'Para crear un análisis, cada participante necesita acceso al dataset compartido ' +
            'y permisos de autor en Quick. Ser solo lector no es suficiente.',
        ),
        lista([
          'Dataset de partida: ds_viajes_taxi_capacitacion (nombre propuesto, de ejemplo).',
          'Permiso necesario: rol de autor que permita crear análisis y usar el dataset.',
          'Si falta el permiso, el dataset puede no aparecer para el participante — caso de ' +
            'diagnóstico que se trata en la Sesión 3.',
        ]),
      ],
      objetivos: [
        'Identificar los permisos mínimos para crear un análisis sobre un dataset compartido.',
      ],
      notasInstructor:
        'Verifica antes de la sesión que las cuentas de los participantes son autores ' +
        'habilitados. Es el riesgo operativo nº 1 del plan (§11). Anticipa el caso "el ' +
        'dataset no aparece para un autor".',
    },

    // ───────────────────────────────────────────────────────────────────────
    // Bloque 30–45 min · SPICE, Direct Query y SQL personalizado
    // ───────────────────────────────────────────────────────────────────────
    {
      id: 's2-d08',
      layout: 'contenido',
      titulo: 'SPICE vs. Direct Query',
      contenido: [
        texto(
          'Quick ofrece dos modos de acceso a los datos del dataset. La elección afecta al ' +
            'rendimiento, la frescura de los datos y el coste.',
        ),
        lista([
          'SPICE: motor en memoria de Quick. Los datos se importan a un almacén propio. ' +
            'Ventaja: consultas muy rápidas y menor carga sobre Athena. Limitación: los ' +
            'datos se refrescan por programación o manualmente (no son en vivo) y consumen ' +
            'capacidad SPICE.',
          'Direct Query: cada visualización consulta Athena en el momento. Ventaja: datos ' +
            'siempre actuales. Limitación: depende de la latencia y el coste de Athena en ' +
            'cada consulta.',
        ]),
        texto(
          'Regla práctica: SPICE para dashboards interactivos y estables; Direct Query ' +
            'cuando la frescura en tiempo casi real es prioritaria.',
        ),
        {
          tipo: 'imagen',
          src: '/img/sesion2/spice-vs-directquery.svg',
          alt:
            'SPICE guarda una copia en memoria para dashboards rápidos y ' +
            'estables; Direct Query consulta la fuente en vivo para datos más ' +
            'frescos.',
        },
      ],
      objetivos: [
        'Explicar qué es SPICE y en qué se diferencia de Direct Query.',
        'Elegir el modo adecuado según frescura, rendimiento y coste.',
      ],
      notasInstructor:
        'Para la capacitación, SPICE suele dar mejor experiencia en el aula (rápido y sin ' +
        'coste por consulta repetida). Menciona que cambiar de modo puede requerir recrear o ' +
        'reconfigurar el dataset. Confirma capacidades/costes SPICE del entorno.',
    },
    {
      id: 's2-d09',
      layout: 'contenido',
      titulo: 'SQL personalizado como preparación de datos',
      contenido: [
        texto(
          'El dataset puede definirse con SQL personalizado: una consulta que prepara los ' +
            'datos antes de analizarlos. Es una modalidad de demostración del instructor.',
        ),
        texto(
          'Ejemplo didáctico de SQL personalizado para el dataset (sujeto a comprobación de ' +
            'esquema y tipos reales antes de usarlo en producción):',
        ),
        codigo(
          [
            'SELECT',
            '    CAST(tpep_pickup_datetime AS DATE) AS fecha,',
            '    HOUR(tpep_pickup_datetime)        AS hora_recogida,',
            '    payment_type,',
            '    passenger_count,',
            '    trip_distance,',
            '    total_amount',
            'FROM capacitacion_iapol.vw_indicadores',
            'WHERE trip_distance > 0',
            '  AND total_amount >= 0;',
          ].join('\n'),
        ),
        texto(
          'Los filtros (distancia > 0, importe ≥ 0) modifican la población analizada y no ' +
            'representan la totalidad del origen; explícalo al interpretar métricas.',
        ),
      ],
      objetivos: [
        'Entender el SQL personalizado como preparación de datos del dataset.',
        'Reconocer el impacto de los filtros de limpieza sobre la población analizada.',
      ],
      notasInstructor:
        'Recalca la nota de "ejemplo didáctico": nombres y tipos deben validarse contra el ' +
        'Parquet real. El Laboratorio SQL de la plataforma permite ver resultados demo de ' +
        'consultas como esta, siempre etiquetados como Simulación local.',
    },
    {
      id: 's2-d10',
      layout: 'contenido',
      titulo: 'Campos, dimensiones, métricas y campos calculados',
      contenido: [
        texto(
          'Dentro del análisis, los campos del dataset se usan de dos formas según su ' +
            'papel en una visualización:',
        ),
        lista([
          'Dimensiones: campos para agrupar o categorizar (p. ej. payment_type, fecha, ' +
            'hora de recogida).',
          'Métricas: campos numéricos que se agregan (p. ej. total_amount, trip_distance, ' +
            'conteo de registros).',
          'Agregaciones habituales: conteo, suma, promedio, mínimo y máximo.',
          'Campo calculado: un campo nuevo derivado de otros mediante una expresión (p. ej. ' +
            'importe por pasajero = total_amount / passenger_count).',
        ]),
      ],
      objetivos: [
        'Clasificar los campos del dataset en dimensiones y métricas.',
        'Reconocer el propósito de un campo calculado.',
      ],
      notasInstructor:
        'Usa los campos del caso NYC Taxi para ejemplificar. Advierte sobre divisiones por ' +
        'cero o nulos en campos calculados (passenger_count podría ser 0 o nulo). Este es el ' +
        'puente hacia la práctica individual de las siguientes diapositivas.',
    },

    // ───────────────────────────────────────────────────────────────────────
    // Bloque 45–65 min · KPIs y gráficos de barras (individual)
    // ───────────────────────────────────────────────────────────────────────
    {
      id: 's2-d11',
      layout: 'contenido',
      titulo: 'KPIs: indicadores de valor único',
      contenido: [
        texto(
          'Un KPI (indicador clave de desempeño) muestra un único valor agregado, ideal ' +
            'para la lectura rápida de una hoja de resumen.',
        ),
        lista([
          'KPI total de viajes: conteo de registros del dataset.',
          'KPI de importe total: suma de total_amount.',
          'KPI de distancia media: promedio de trip_distance.',
        ]),
        texto(
          'Cada KPI responde la combinación de una métrica y una agregación. Los valores ' +
            'dependen de los filtros activos.',
        ),
      ],
      objetivos: [
        'Definir qué es un KPI y cuándo usarlo.',
        'Construir los KPIs de total de viajes e importe total del caso NYC Taxi.',
      ],
      notasInstructor:
        'Guía la práctica individual: cada participante crea los dos KPIs de la hoja Resumen ' +
        'ejecutivo. Si no tienen acceso de autor real, usan el simulador local. Recuerda que ' +
        'los números cambian con los filtros aplicados.',
    },
    {
      id: 's2-d12',
      layout: 'simulador',
      titulo: 'Práctica guiada: KPIs en el simulador local',
      contenido: [
        texto(
          'SIMULACIÓN LOCAL. El Simulador_Dashboards de esta plataforma reproduce los ' +
            'conceptos de Quick sobre el dataset de ejemplo; NO es la interfaz oficial de ' +
            'Amazon Quick ni configura datasets reales.',
        ),
        lista([
          'Selecciona una métrica (p. ej. total_amount) y una agregación (suma) para formar ' +
            'un KPI.',
          'Observa cómo el KPI recalcula su valor al cambiar la agregación.',
          'Añade un segundo KPI con el conteo de registros (total de viajes).',
        ]),
        texto(
          'En el entorno real de Quick, el equivalente se crea arrastrando campos al tipo de ' +
            'visualización KPI; aquí practicamos el concepto sin tocar AWS.',
        ),
      ],
      objetivos: [
        'Operar el simulador local para crear KPIs sobre el dataset de ejemplo.',
        'Interpretar un KPI como métrica + agregación.',
      ],
      notasInstructor:
        'Usa esta diapositiva como transición a la herramienta Simulador de la plataforma. ' +
        'Insiste en la etiqueta permanente de Simulación local para no confundirla con Quick ' +
        'real. Deja ~5 min de práctica.',
    },
    {
      id: 's2-d13',
      layout: 'contenido',
      titulo: 'Gráfico de barras: ventas por categoría',
      contenido: [
        texto(
          'El gráfico de barras compara una métrica entre categorías de una dimensión. Es ' +
            'la visualización central de la hoja Resumen ejecutivo.',
        ),
        lista([
          'Dimensión (eje): payment_type (método de pago).',
          'Métrica (altura): conteo de viajes o suma de total_amount.',
          'Lectura: qué método de pago concentra más viajes o importe.',
        ]),
        texto(
          'Nota de datos: payment_type es un valor codificado; su significado debe ' +
            'confirmarse contra el diccionario oficial de la NYC TLC antes de etiquetar las ' +
            'barras.',
        ),
      ],
      objetivos: [
        'Construir un gráfico de barras por método de pago.',
        'Elegir correctamente dimensión y métrica para un gráfico de barras.',
      ],
      notasInstructor:
        'La práctica individual añade este gráfico a la hoja Resumen ejecutivo. Si el tiempo ' +
        'aprieta, haz el gráfico en el simulador y deja la variante de importe como ejercicio.',
    },
    {
      id: 's2-d14',
      layout: 'simulador',
      titulo: 'Práctica guiada: barras por método de pago',
      contenido: [
        texto('SIMULACIÓN LOCAL — no reproduce la interfaz oficial de Amazon Quick.'),
        lista([
          'Elige el tipo de visualización "barras".',
          'Asigna payment_type como dimensión y el conteo de viajes como métrica.',
          'Compara con la variante que usa la suma de total_amount como métrica.',
          'Observa que seleccionar entre 1 y 3 campos basta para esta visualización.',
        ]),
      ],
      objetivos: [
        'Usar el simulador para producir un gráfico de barras por método de pago.',
      ],
      notasInstructor:
        'El simulador acepta de 1 a 3 campos por visualización (R10.1). Muestra qué ocurre al ' +
        'cambiar la métrica sin cambiar la dimensión.',
    },

    // ───────────────────────────────────────────────────────────────────────
    // Bloque 65–85 min · Filtros, controles y campos calculados (individual)
    // ───────────────────────────────────────────────────────────────────────
    {
      id: 's2-d15',
      layout: 'contenido',
      titulo: 'Filtros y controles interactivos',
      contenido: [
        texto(
          'Los filtros acotan los datos que alimentan las visualizaciones. Los controles ' +
            'permiten al usuario cambiar esos filtros de forma interactiva.',
        ),
        lista([
          'Filtro de fecha: limita el análisis a un rango (p. ej. una semana de enero 2024).',
          'Al aplicar un filtro, todas las visualizaciones afectadas se recalculan y ' +
            'vuelven a renderizar.',
          'Restablecer los filtros devuelve las visualizaciones al conjunto completo.',
          'Si un filtro no deja ningún registro, debe mostrarse un estado vacío en lugar de ' +
            'una visualización sin datos.',
        ]),
        texto(
          'Cada filtro cambia la población analizada: las métricas resultantes no ' +
            'representan la totalidad del origen.',
        ),
      ],
      objetivos: [
        'Aplicar un filtro de fecha y observar el recálculo de las visualizaciones.',
        'Entender el estado vacío y el restablecimiento de filtros.',
      ],
      notasInstructor:
        'Conecta con R12 y R10.4/R10.5. En el simulador, muestra un rango que deje cero ' +
        'registros para evidenciar el estado vacío. Repite la advertencia de población ' +
        'analizada (R20.4).',
    },
    {
      id: 's2-d16',
      layout: 'simulador',
      titulo: 'Práctica guiada: filtro de fecha y campo calculado',
      contenido: [
        texto('SIMULACIÓN LOCAL — los datos son un subconjunto de ejemplo, no Quick real.'),
        lista([
          'Aplica un filtro de fecha sobre enero de 2024 y observa cómo cambian los KPIs.',
          'Prueba un rango sin registros y confirma el mensaje de estado vacío.',
          'Restablece los filtros y verifica que vuelve el conjunto completo.',
          'Define un campo calculado "importe por pasajero" = total_amount / passenger_count ' +
            'y comenta el caso passenger_count = 0.',
        ]),
      ],
      objetivos: [
        'Operar filtros de fecha, estado vacío y restablecimiento en el simulador.',
        'Crear un campo calculado y razonar sus casos límite.',
      ],
      notasInstructor:
        'El restablecimiento es idempotente (R12.3). Aprovecha el caso de división por cero ' +
        'para hablar de calidad de datos: en el real conviene filtrar passenger_count > 0.',
    },

    // ───────────────────────────────────────────────────────────────────────
    // Bloque 85–105 min · Tres hojas y gráficos temporales (individual)
    // ───────────────────────────────────────────────────────────────────────
    {
      id: 's2-d17',
      layout: 'contenido',
      titulo: 'Las tres hojas de análisis',
      contenido: [
        texto(
          'El análisis se organiza en tres hojas, cada una con un propósito y un público de ' +
            'lectura distinto. Cambiar de hoja muestra las visualizaciones de esa hoja.',
        ),
        lista([
          'Resumen ejecutivo: visión rápida con KPIs y un gráfico de barras.',
          'Análisis detallado: lectura fina con una tabla y una medida de distancia media.',
          'Tendencias: evolución temporal — viajes por día y distribución por hora.',
        ]),
        {
          tipo: 'imagen',
          src: '/img/sesion2/tres-hojas.svg',
          alt:
            'Las tres hojas del análisis: Hoja 1 Resumen ejecutivo con KPIs y ' +
            'un gráfico de barras; Hoja 2 Análisis detallado con una tabla; ' +
            'Hoja 3 Tendencias con un gráfico de líneas en el tiempo.',
        },
      ],
      objetivos: [
        'Enumerar las tres hojas de análisis y su propósito.',
        'Planificar qué visualización corresponde a cada hoja.',
      ],
      notasInstructor:
        'Esta es la estructura exacta del ejercicio individual del plan (§6.2) y del ' +
        'Simulador_Dashboards (R11). Las tres siguientes diapositivas detallan cada hoja.',
    },
    {
      id: 's2-d18',
      layout: 'simulador',
      titulo: 'Hoja 1 · Resumen ejecutivo',
      contenido: [
        texto('SIMULACIÓN LOCAL del diseño de la hoja Resumen ejecutivo.'),
        lista([
          'KPI total de viajes: conteo de registros.',
          'KPI de importe total: suma de total_amount.',
          'Gráfico de barras por método de pago: payment_type.',
        ]),
        texto(
          'Objetivo de la hoja: que un lector no técnico entienda el volumen y el reparto ' +
            'por método de pago en segundos.',
        ),
      ],
      objetivos: [
        'Montar la hoja Resumen ejecutivo con dos KPIs y un gráfico de barras.',
      ],
      notasInstructor:
        'Corresponde a R11.3. Verifica que los participantes reutilizan los KPIs y el gráfico ' +
        'ya practicados. En Quick real, cada elemento se añade al lienzo de la hoja.',
    },
    {
      id: 's2-d19',
      layout: 'simulador',
      titulo: 'Hoja 2 · Análisis detallado',
      contenido: [
        texto('SIMULACIÓN LOCAL del diseño de la hoja Análisis detallado.'),
        lista([
          'Tabla con columnas: fecha, pasajeros e importe.',
          'Medida de distancia media: promedio de trip_distance.',
        ]),
        texto(
          'Objetivo de la hoja: permitir una lectura fila a fila y una métrica de contexto ' +
            '(distancia media) para el análisis más fino.',
        ),
      ],
      objetivos: [
        'Montar la hoja Análisis detallado con una tabla y la distancia media.',
      ],
      notasInstructor:
        'Corresponde a R11.4. La tabla usa fecha (derivada de tpep_pickup_datetime), ' +
        'passenger_count y total_amount. Menciona que las tablas grandes conviene filtrarlas.',
    },
    {
      id: 's2-d20',
      layout: 'simulador',
      titulo: 'Hoja 3 · Tendencias (gráficos temporales)',
      contenido: [
        texto('SIMULACIÓN LOCAL del diseño de la hoja Tendencias.'),
        lista([
          'Viajes por día: dimensión fecha, métrica conteo (gráfico de líneas o barras).',
          'Distribución por hora de recogida: hora extraída de tpep_pickup_datetime.',
        ]),
        texto(
          'Objetivo de la hoja: revelar patrones temporales — qué días y qué horas ' +
            'concentran la actividad.',
        ),
      ],
      objetivos: [
        'Montar la hoja Tendencias con viajes por día y distribución por hora.',
        'Usar campos temporales derivados para análisis de evolución.',
      ],
      notasInstructor:
        'Corresponde a R11.5. La hora se obtiene con una función sobre la fecha/hora de ' +
        'recogida (ver SQL personalizado, d09). El gráfico de líneas es natural para la ' +
        'evolución por día.',
    },

    // ───────────────────────────────────────────────────────────────────────
    // Bloque 105–120 min · Verificación y cierre
    // ───────────────────────────────────────────────────────────────────────
    {
      id: 's2-d21',
      layout: 'contenido',
      titulo: 'Verificación del diseño y las interacciones',
      contenido: [
        texto(
          'Antes de cerrar, cada participante revisa que su análisis es coherente y que las ' +
            'interacciones funcionan como se espera.',
        ),
        lista([
          'Las tres hojas existen y tienen los elementos previstos.',
          'Los filtros recalculan las visualizaciones y el restablecimiento funciona.',
          'Las agregaciones son coherentes con las columnas y el modelo de datos.',
          'Los campos codificados (p. ej. payment_type) están correctamente interpretados.',
          'Las métricas filtradas se comunican como población analizada, no como total.',
        ]),
        texto(
          'El instructor valida que gráficos y agregaciones coinciden con las columnas, los ' +
            'filtros y el modelo de datos reales.',
        ),
      ],
      objetivos: [
        'Aplicar una lista de verificación al análisis de tres hojas.',
        'Confirmar la coherencia de agregaciones, filtros y campos codificados.',
      ],
      notasInstructor:
        'Momento de revisión cruzada: que un participante revise el análisis de otro con la ' +
        'lista. Recoge dudas para enlazar con la Sesión 3 (publicación e IAPOL).',
    },
    {
      id: 's2-d22',
      layout: 'contenido',
      titulo: 'Cierre y puente hacia la Sesión 3',
      contenido: [
        texto('Resultado esperado de la sesión:'),
        lista([
          'Cada participante autorizado dispone de un análisis propio con tres hojas, KPIs, ' +
            'filtros y controles funcionales en Quick.',
          'Comprensión de fuente de datos, dataset, análisis, dashboard, SPICE, Direct Query, ' +
            'KPIs y filtros.',
        ]),
        texto(
          'En la Sesión 3 publicaremos el análisis como dashboard, localizaremos sus ' +
            'identificadores (Dashboard ID, Analysis ID, Dataset ID) y explicaremos la ' +
            'integración conceptual con IAPOL, sin ejecutar cambios en el portal.',
        ),
        texto(
          'Recordatorio: durante la capacitación no se publican ni registran dashboards de ' +
            'prueba en IAPOL.',
        ),
      ],
      objetivos: [
        'Resumir los logros de la sesión.',
        'Anticipar el contenido de la Sesión 3 (publicación e integración IAPOL).',
      ],
      notasInstructor:
        'Cierra reforzando la frontera: hoy construimos el análisis; la publicación y la ' +
        'integración son la Sesión 3. Invita a guardar/nombrar correctamente el análisis ' +
        '(ANALISIS_TAXI_NOMBRE) para continuar.',
    },
  ],
};

export default sesion2;
export { sesion2 };
