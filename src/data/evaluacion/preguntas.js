/**
 * Banco de preguntas del Motor_Evaluacion.
 *
 * Contiene preguntas de opción múltiple distribuidas en las seis áreas de
 * contenido definidas por la rúbrica (`src/data/evaluacion/rubrica.js` y
 * `RUBRICA_POR_DEFECTO` de `src/domain/puntuacion.js`):
 *
 *   flujo       → flujo S3 → Athena → Quick
 *   sql         → interpretación de SQL
 *   tres_hojas  → creación de análisis de tres hojas
 *   filtros     → configuración de filtros y visualizaciones
 *   publicacion → publicación de dashboard en Amazon Quick
 *   iapol       → localización de identificadores e integración con IAPOL
 *
 * Cada pregunta sigue el modelo de datos del diseño:
 *
 *   Pregunta {
 *     id: string,
 *     area: 'flujo' | 'sql' | 'tres_hojas' | 'filtros' | 'publicacion' | 'iapol',
 *     enunciado: string,
 *     opciones: { id: string, texto: string }[],
 *     respuestaCorrecta: string,   // id de la opción correcta
 *     explicacion: string
 *   }
 *
 * El contenido es un recurso pedagógico basado en el caso práctico transversal
 * (NYC Yellow Taxi Trip Records de enero de 2024). Es material didáctico sujeto
 * a comprobación contra la documentación oficial antes de su uso en producción.
 *
 * Requisitos cubiertos: 13.1, 13.2.
 *
 * @typedef {Object} Opcion
 * @property {string} id - Identificador de la opción (único dentro de la pregunta).
 * @property {string} texto - Texto mostrado de la opción.
 *
 * @typedef {Object} Pregunta
 * @property {string} id - Identificador único de la pregunta.
 * @property {'flujo'|'sql'|'tres_hojas'|'filtros'|'publicacion'|'iapol'} area - Área de contenido.
 * @property {string} enunciado - Enunciado de la pregunta.
 * @property {Opcion[]} opciones - Opciones de respuesta.
 * @property {string} respuestaCorrecta - Id de la opción correcta.
 * @property {string} explicacion - Explicación mostrada como retroalimentación.
 */

/**
 * Banco de preguntas de evaluación.
 *
 * @type {Pregunta[]}
 */
export const PREGUNTAS = Object.freeze([
  // ──────────────────────────────────────────────────────────────────────
  // Área: flujo S3 → Athena → Quick
  // ──────────────────────────────────────────────────────────────────────
  {
    id: 'flujo-1',
    area: 'flujo',
    enunciado:
      '¿Cuál es el orden correcto del flujo de datos presentado en la capacitación?',
    opciones: [
      { id: 'a', texto: 'Amazon Quick → Amazon Athena → S3 → IAPOL' },
      { id: 'b', texto: 'S3 → AWS Glue Data Catalog / Amazon Athena → Amazon Quick → IAPOL' },
      { id: 'c', texto: 'IAPOL → S3 → Amazon Quick → Amazon Athena' },
      { id: 'd', texto: 'Amazon Athena → S3 → IAPOL → Amazon Quick' },
    ],
    respuestaCorrecta: 'b',
    explicacion:
      'Los datos se almacenan en S3, se describen en el Glue Data Catalog y se consultan con Athena; los resultados se analizan y publican en Amazon Quick, y finalmente se integran de forma conceptual en IAPOL.',
  },
  {
    id: 'flujo-2',
    area: 'flujo',
    enunciado:
      'En este flujo, ¿qué función cumple AWS Glue Data Catalog?',
    opciones: [
      { id: 'a', texto: 'Ejecuta las consultas SQL sobre los datos de S3' },
      { id: 'b', texto: 'Almacena físicamente los archivos de datos' },
      { id: 'c', texto: 'Registra y describe las tablas (metadatos) que Athena usa para consultar S3' },
      { id: 'd', texto: 'Publica los dashboards en IAPOL' },
    ],
    respuestaCorrecta: 'c',
    explicacion:
      'El Glue Data Catalog guarda los metadatos (esquema, tipos, ubicación) de las tablas. Athena usa esos metadatos para interpretar y consultar los datos que residen en S3.',
  },
  {
    id: 'flujo-3',
    area: 'flujo',
    enunciado:
      '¿Dónde residen físicamente los archivos del dataset NYC Yellow Taxi en esta arquitectura?',
    opciones: [
      { id: 'a', texto: 'En Amazon S3' },
      { id: 'b', texto: 'Dentro del Glue Data Catalog' },
      { id: 'c', texto: 'En la caché SPICE de Amazon Quick' },
      { id: 'd', texto: 'En la base de datos interna de IAPOL' },
    ],
    respuestaCorrecta: 'a',
    explicacion:
      'Los archivos de datos se almacenan en Amazon S3. Athena consulta esos objetos en S3 usando los metadatos del Glue Data Catalog, sin mover los datos a otro almacenamiento.',
  },

  // ──────────────────────────────────────────────────────────────────────
  // Área: interpretación de SQL
  // ──────────────────────────────────────────────────────────────────────
  {
    id: 'sql-1',
    area: 'sql',
    enunciado:
      '¿Qué devuelve la consulta "SELECT COUNT(*) FROM viajes WHERE payment_type = 1"?',
    opciones: [
      { id: 'a', texto: 'La suma del importe de todos los viajes' },
      { id: 'b', texto: 'El número de viajes cuyo método de pago es 1' },
      { id: 'c', texto: 'El listado completo de viajes pagados con tarjeta' },
      { id: 'd', texto: 'El promedio de pasajeros por viaje' },
    ],
    respuestaCorrecta: 'b',
    explicacion:
      'COUNT(*) cuenta filas y WHERE payment_type = 1 limita el conteo a los viajes con ese método de pago. El resultado es un único número: la cantidad de viajes que cumplen la condición.',
  },
  {
    id: 'sql-2',
    area: 'sql',
    enunciado:
      'En "SELECT payment_type, COUNT(*) FROM viajes GROUP BY payment_type", ¿qué produce la cláusula GROUP BY?',
    opciones: [
      { id: 'a', texto: 'Ordena los resultados por método de pago' },
      { id: 'b', texto: 'Filtra solo un método de pago' },
      { id: 'c', texto: 'Agrupa las filas por método de pago para calcular el conteo de cada grupo' },
      { id: 'd', texto: 'Une dos tablas por el campo payment_type' },
    ],
    respuestaCorrecta: 'c',
    explicacion:
      'GROUP BY agrupa las filas que comparten el mismo valor de payment_type; la función de agregación (COUNT) se calcula por cada grupo, devolviendo un conteo por método de pago.',
  },
  {
    id: 'sql-3',
    area: 'sql',
    enunciado:
      '¿Para qué sirve la cláusula ORDER BY total_amount DESC en una consulta?',
    opciones: [
      { id: 'a', texto: 'Filtra los viajes con importe mayor que cero' },
      { id: 'b', texto: 'Ordena el resultado por importe de mayor a menor' },
      { id: 'c', texto: 'Suma todos los importes' },
      { id: 'd', texto: 'Agrupa por importe' },
    ],
    respuestaCorrecta: 'b',
    explicacion:
      'ORDER BY ordena las filas del resultado según la columna indicada. DESC establece orden descendente, de mayor a menor importe.',
  },
  {
    id: 'sql-4',
    area: 'sql',
    enunciado:
      '¿En qué situación se necesita un JOIN en una consulta SQL?',
    opciones: [
      { id: 'a', texto: 'Cuando se quiere ordenar el resultado' },
      { id: 'b', texto: 'Cuando se necesita combinar filas de dos tablas relacionadas mediante una clave común' },
      { id: 'c', texto: 'Cuando se desea contar filas de una sola tabla' },
      { id: 'd', texto: 'Cuando se aplica un filtro de fecha' },
    ],
    respuestaCorrecta: 'b',
    explicacion:
      'Un JOIN combina columnas de dos (o más) tablas emparejando filas a través de una clave común (por ejemplo, un código de zona). Si toda la información está en una sola tabla, no se requiere JOIN.',
  },

  // ──────────────────────────────────────────────────────────────────────
  // Área: creación de análisis de tres hojas
  // ──────────────────────────────────────────────────────────────────────
  {
    id: 'tres_hojas-1',
    area: 'tres_hojas',
    enunciado:
      '¿Cuáles son las tres hojas de análisis definidas en la Plataforma?',
    opciones: [
      { id: 'a', texto: 'Inicio, Datos y Configuración' },
      { id: 'b', texto: 'Resumen ejecutivo, Análisis detallado y Tendencias' },
      { id: 'c', texto: 'KPIs, Filtros y Publicación' },
      { id: 'd', texto: 'S3, Athena y Quick' },
    ],
    respuestaCorrecta: 'b',
    explicacion:
      'El análisis se organiza en tres hojas: Resumen ejecutivo (visión general), Análisis detallado (datos granulares) y Tendencias (evolución temporal).',
  },
  {
    id: 'tres_hojas-2',
    area: 'tres_hojas',
    enunciado:
      'La hoja "Resumen ejecutivo" debe incluir, como mínimo:',
    opciones: [
      { id: 'a', texto: 'Una tabla con fecha, pasajeros e importe' },
      { id: 'b', texto: 'La distribución por hora de recogida' },
      { id: 'c', texto: 'Un KPI de total de viajes, un KPI de importe total y un gráfico de barras por método de pago' },
      { id: 'd', texto: 'Únicamente el filtro de fecha' },
    ],
    respuestaCorrecta: 'c',
    explicacion:
      'El Resumen ejecutivo ofrece la visión general mediante dos KPIs (total de viajes e importe total) y un gráfico de barras por método de pago.',
  },
  {
    id: 'tres_hojas-3',
    area: 'tres_hojas',
    enunciado:
      '¿Qué contenido corresponde a la hoja "Tendencias"?',
    opciones: [
      { id: 'a', texto: 'Una visualización de viajes por día y la distribución por hora de recogida' },
      { id: 'b', texto: 'Dos KPIs y un gráfico de barras por método de pago' },
      { id: 'c', texto: 'Una tabla detallada y la distancia media' },
      { id: 'd', texto: 'La lista de identificadores de IAPOL' },
    ],
    respuestaCorrecta: 'a',
    explicacion:
      'La hoja Tendencias se centra en la evolución temporal: muestra los viajes por día y la distribución por hora de recogida.',
  },
  {
    id: 'tres_hojas-4',
    area: 'tres_hojas',
    enunciado:
      'La hoja "Análisis detallado" incluye principalmente:',
    opciones: [
      { id: 'a', texto: 'Solo KPIs de valor único' },
      { id: 'b', texto: 'Una tabla con fecha, pasajeros e importe, y una medida de distancia media' },
      { id: 'c', texto: 'Un diagrama de la arquitectura AWS' },
      { id: 'd', texto: 'Enlaces a la documentación oficial' },
    ],
    respuestaCorrecta: 'b',
    explicacion:
      'El Análisis detallado presenta los datos a nivel granular con una tabla de fecha, pasajeros e importe, acompañada de una medida de distancia media.',
  },
  {
    id: 'tres_hojas-5',
    area: 'tres_hojas',
    enunciado:
      '¿Por qué conviene separar el análisis en tres hojas en lugar de una sola vista?',
    opciones: [
      { id: 'a', texto: 'Porque Amazon Quick solo permite una visualización por análisis' },
      { id: 'b', texto: 'Para organizar la información según su propósito y audiencia, de lo general a lo específico' },
      { id: 'c', texto: 'Porque cada hoja usa un dataset diferente obligatoriamente' },
      { id: 'd', texto: 'Para evitar aplicar filtros' },
    ],
    respuestaCorrecta: 'b',
    explicacion:
      'Separar en hojas ordena la narrativa del análisis: el Resumen ejecutivo da la visión general, el Análisis detallado profundiza en los datos y Tendencias muestra la evolución, adecuando cada vista a su propósito.',
  },

  // ──────────────────────────────────────────────────────────────────────
  // Área: configuración de filtros y visualizaciones
  // ──────────────────────────────────────────────────────────────────────
  {
    id: 'filtros-1',
    area: 'filtros',
    enunciado:
      'Al aplicar un filtro de fecha sobre el dataset, ¿qué ocurre con las visualizaciones?',
    opciones: [
      { id: 'a', texto: 'Se eliminan permanentemente del análisis' },
      { id: 'b', texto: 'Se recalculan y vuelven a renderizar según el rango de fechas seleccionado' },
      { id: 'c', texto: 'Permanecen sin cambios' },
      { id: 'd', texto: 'Se convierten automáticamente en KPIs' },
    ],
    respuestaCorrecta: 'b',
    explicacion:
      'Un filtro de fecha acota la población analizada; las visualizaciones afectadas se recalculan y se vuelven a renderizar para reflejar únicamente los registros dentro del rango.',
  },
  {
    id: 'filtros-2',
    area: 'filtros',
    enunciado:
      'Si un filtro aplicado no deja ningún registro en el dataset, la visualización debería:',
    opciones: [
      { id: 'a', texto: 'Mostrar un mensaje de estado vacío en lugar de un gráfico sin datos' },
      { id: 'b', texto: 'Mostrar los datos del período anterior' },
      { id: 'c', texto: 'Mostrar un error del sistema y detener la aplicación' },
      { id: 'd', texto: 'Ignorar el filtro y mostrar todos los datos' },
    ],
    respuestaCorrecta: 'a',
    explicacion:
      'Cuando el filtro no produce registros, la práctica correcta es mostrar un estado vacío claro, no un gráfico sin datos ni todos los datos ignorando el filtro.',
  },
  {
    id: 'filtros-3',
    area: 'filtros',
    enunciado:
      '¿Qué efecto tiene restablecer (reset) los filtros de un análisis?',
    opciones: [
      { id: 'a', texto: 'Elimina las visualizaciones del análisis' },
      { id: 'b', texto: 'Restaura las visualizaciones al estado sin filtros, mostrando el conjunto completo' },
      { id: 'c', texto: 'Aplica el último filtro usado' },
      { id: 'd', texto: 'Cambia el tipo de visualización a tabla' },
    ],
    respuestaCorrecta: 'b',
    explicacion:
      'Restablecer los filtros vuelve a mostrar la población completa del dataset; las visualizaciones regresan a su estado sin filtros aplicados.',
  },
  {
    id: 'filtros-4',
    area: 'filtros',
    enunciado:
      'Para construir una visualización de tipo KPI (valor único), lo habitual es seleccionar:',
    opciones: [
      { id: 'a', texto: 'Entre 10 y 20 campos a la vez' },
      { id: 'b', texto: 'Una medida agregada, como el total de viajes o el importe total' },
      { id: 'c', texto: 'Únicamente campos de texto libre' },
      { id: 'd', texto: 'La URL del dashboard' },
    ],
    respuestaCorrecta: 'b',
    explicacion:
      'Un KPI muestra un único valor agregado (por ejemplo, el total de viajes o el importe total), por lo que se construye a partir de una medida agregada del dataset.',
  },

  // ──────────────────────────────────────────────────────────────────────
  // Área: publicación de dashboard en Amazon Quick
  // ──────────────────────────────────────────────────────────────────────
  {
    id: 'publicacion-1',
    area: 'publicacion',
    enunciado:
      'En Amazon Quick, ¿cuál es la relación entre un análisis y un dashboard?',
    opciones: [
      { id: 'a', texto: 'Son exactamente lo mismo con distinto nombre' },
      { id: 'b', texto: 'El análisis es el espacio de edición; el dashboard es la vista publicada que se comparte para consumo' },
      { id: 'c', texto: 'El dashboard se edita y el análisis se publica' },
      { id: 'd', texto: 'El dashboard almacena los datos y el análisis los consulta' },
    ],
    respuestaCorrecta: 'b',
    explicacion:
      'El análisis es el entorno donde se construyen y editan las visualizaciones; al publicarlo se genera un dashboard, que es la versión de solo consumo que se comparte con la audiencia.',
  },
  {
    id: 'publicacion-2',
    area: 'publicacion',
    enunciado:
      'Si un usuario no puede ver un dashboard existente, una causa posible frecuente es:',
    opciones: [
      { id: 'a', texto: 'Que el dashboard no tiene ningún gráfico' },
      { id: 'b', texto: 'Que no se le han concedido permisos de acceso al dashboard' },
      { id: 'c', texto: 'Que el dataset tiene demasiadas filas' },
      { id: 'd', texto: 'Que el análisis usa SPICE en lugar de Direct Query' },
    ],
    respuestaCorrecta: 'b',
    explicacion:
      'Un dashboard publicado debe compartirse explícitamente con los usuarios o grupos. La falta de permisos de acceso es una causa habitual de que alguien no pueda verlo, y debe verificarse con evidencia del entorno.',
  },
  {
    id: 'publicacion-3',
    area: 'publicacion',
    enunciado:
      'Al publicar un dashboard para compartirlo, lo recomendable sobre los permisos es:',
    opciones: [
      { id: 'a', texto: 'Dejarlos por defecto, ya que todos los usuarios los heredan automáticamente' },
      { id: 'b', texto: 'Conceder acceso explícito solo a los usuarios o grupos que deben consumirlo' },
      { id: 'c', texto: 'Compartir la URL basta para habilitar el acceso a cualquiera' },
      { id: 'd', texto: 'Eliminar el análisis de origen para proteger el dashboard' },
    ],
    respuestaCorrecta: 'b',
    explicacion:
      'El acceso a un dashboard se gestiona concediendo permisos explícitos a los usuarios o grupos previstos. Compartir la URL por sí solo no otorga acceso si no existen los permisos correspondientes.',
  },

  // ──────────────────────────────────────────────────────────────────────
  // Área: localización de identificadores e integración con IAPOL
  // ──────────────────────────────────────────────────────────────────────
  {
    id: 'iapol-1',
    area: 'iapol',
    enunciado:
      '¿Qué identifica un "Dashboard ID" en Amazon Quick?',
    opciones: [
      { id: 'a', texto: 'El conjunto de datos (dataset) de origen' },
      { id: 'b', texto: 'El dashboard publicado concreto, distinto del Analysis ID y del Dataset ID' },
      { id: 'c', texto: 'Un campo propio de IAPOL' },
      { id: 'd', texto: 'La consulta SQL ejecutada en Athena' },
    ],
    respuestaCorrecta: 'b',
    explicacion:
      'El Dashboard ID identifica el dashboard publicado. Es distinto del Analysis ID (el análisis en edición) y del Dataset ID (el conjunto de datos de origen).',
  },
  {
    id: 'iapol-2',
    area: 'iapol',
    enunciado:
      'Respecto a los campos "id_portal" e "id_quicksight", ¿qué afirmación es correcta?',
    opciones: [
      { id: 'a', texto: 'Son identificadores estándar de Amazon Quick y no requieren verificación' },
      { id: 'b', texto: 'Son campos propios de IAPOL cuya función y correspondencia deben corroborarse con documentación interna' },
      { id: 'c', texto: 'Equivalen exactamente al Dataset ID y al Analysis ID' },
      { id: 'd', texto: 'Se generan automáticamente al ejecutar una consulta en Athena' },
    ],
    respuestaCorrecta: 'b',
    explicacion:
      'id_portal e id_quicksight son campos propios de IAPOL. Su función y correspondencia con los identificadores de Quick deben corroborarse contra la documentación interna, no asumirse.',
  },
  {
    id: 'iapol-3',
    area: 'iapol',
    enunciado:
      '¿Es suficiente copiar la URL de un dashboard de Amazon Quick (o su identificador) para que se visualice embebido en IAPOL?',
    opciones: [
      { id: 'a', texto: 'Sí, la URL habilita automáticamente la visualización en IAPOL' },
      { id: 'b', texto: 'No; copiar una URL o un identificador no habilita por sí solo la visualización embebida en IAPOL' },
      { id: 'c', texto: 'Sí, siempre que el dashboard use SPICE' },
      { id: 'd', texto: 'No, porque IAPOL no admite dashboards de Quick en ningún caso' },
    ],
    respuestaCorrecta: 'b',
    explicacion:
      'Copiar una URL de Amazon Quick o un identificador no habilita automáticamente la visualización embebida en IAPOL. La integración es un proceso institucional que requiere los pasos y permisos correspondientes, a verificar con documentación interna.',
  },
  {
    id: 'iapol-4',
    area: 'iapol',
    enunciado:
      'Si un dashboard no se ve en IAPOL a pesar de tener su identificador, el enfoque adecuado es:',
    opciones: [
      { id: 'a', texto: 'Concluir de inmediato que el identificador es incorrecto' },
      { id: 'b', texto: 'Considerar causas posibles (permisos, correspondencia de identificadores, pasos de integración) y verificar con evidencia del entorno' },
      { id: 'c', texto: 'Volver a copiar la URL hasta que funcione' },
      { id: 'd', texto: 'Eliminar el dashboard y crearlo de nuevo' },
    ],
    respuestaCorrecta: 'b',
    explicacion:
      'Los diagnósticos presentan causas posibles, no un veredicto definitivo sin evidencia. Ante un dashboard no visible en IAPOL se evalúan permisos, la correspondencia de identificadores (id_portal/id_quicksight) y los pasos de integración, verificando con el entorno.',
  },
]);

export default PREGUNTAS;
