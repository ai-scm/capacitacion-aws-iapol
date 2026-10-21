// Sesión 4: "Analítica Geoespacial en IAPOL"
//
// Contenido pedagógico de una sesión adicional de 60 minutos sobre el módulo de
// Analítica Geoespacial de IAPOL (mapas, capas, filtros y el mapa de
// Anticipación a Fenómenos de Seguridad). Mantiene la MISMA estructura de datos
// que sesion1/2/3 (Sesion → Diapositiva → Bloque) para que los componentes de
// layout la rendericen de forma uniforme.
//
// Honestidad conceptual: el contenido describe el FUNCIONAMIENTO del módulo de
// IAPOL según la guía de usuario institucional. La Plataforma de capacitación NO
// se conecta a IAPOL ni ejecuta operaciones reales: las pantallas se ilustran
// con diagramas propios y los pasos son explicativos. Rutas, botones y rótulos
// exactos deben cotejarse con la versión vigente del portal.
//
// Modelo de datos (compartido con sesion1.js, sesion2.js y sesion3.js):
//
//   Sesion {
//     id, titulo, duracionMin, conceptos: string[], diapositivas: Diapositiva[]
//   }
//   Diapositiva {
//     id, layout: 'titulo'|'contenido'|'diagrama', titulo,
//     contenido: Bloque[], objetivos: string[], notasInstructor: string
//   }
//   Bloque { tipo: 'texto'|'lista'|'codigo'|'imagen'|'nota', ... }
//
// @module data/sesiones/sesion4

// Helpers de construcción de bloques (misma forma que las otras sesiones).
const texto = (t) => ({ tipo: 'texto', texto: t });
const lista = (items, ordenada = false) => ({ tipo: 'lista', items, ordenada });
const imagen = (src, alt) => ({ tipo: 'imagen', src, alt });
const nota = (variante, t) => ({ tipo: 'nota', variante, texto: t });

/**
 * Conceptos mínimos de la Sesión 4 (basados en la guía de usuario de IAPOL).
 * @type {string[]}
 */
const conceptos = [
  'Módulo de Analítica Geoespacial de IAPOL',
  'Catálogo de mapas y etiquetado por SIGLA de la unidad',
  'Mapas históricos (SIEDCO, RNMC, SECAD)',
  'Creación de mapas con datos propios (lat/lon)',
  'Formatos admitidos: JSON, GeoJSON, CSV y XLS',
  'Datasets y capas de visualización',
  'Tipos de capa: puntos, líneas, arcos, hexágonos, polígonos y mapas de calor',
  'Estilización: color, tamaño, borde y etiqueta',
  'Filtros dinámicos y línea de tiempo',
  'Tooltips y exploración interactiva',
  'Exportar y guardar mapas en el catálogo',
  'Mapa Anticipación a Fenómenos de Seguridad',
];

/**
 * Diapositivas de la Sesión 4. Entre 15 y 60 (R2.5); aquí 18, alineadas con un
 * cronograma de 60 minutos:
 *   0–8    Presentación y ubicación del módulo
 *   8–20   Catálogo de mapas y mapas históricos
 *   20–35  Crear un mapa con datos propios (datos → capas)
 *   35–48  Tipos de capa, estilización y filtros/línea de tiempo
 *   48–55  Tooltips, exportar y guardar en el catálogo
 *   55–60  Anticipación a Fenómenos de Seguridad y cierre
 * @type {import('./tipos.js').Diapositiva[]}
 */
const diapositivas = [
  // ─────────────────────────────────────── 0–8: Presentación
  {
    id: 's4-d01',
    layout: 'titulo',
    titulo: 'Sesión 4 · Analítica Geoespacial en IAPOL',
    contenido: [
      texto(
        'Sesión complementaria de 60 minutos sobre el módulo de Analítica ' +
          'Geoespacial de IAPOL: cómo ubicar fuentes de información en el mapa ' +
          'del país y construir visualizaciones por capas, totalmente ' +
          'personalizables.',
      ),
      lista([
        'Duración: 60 minutos.',
        'Alcance: funcionamiento del módulo según la guía de usuario.',
        'Formatos de datos: JSON, GeoJSON, CSV y XLS.',
      ]),
      nota(
        'simulacion',
        'Esta capacitación describe el módulo de IAPOL de forma explicativa. ' +
          'La plataforma no se conecta al portal ni modifica sus datos; las ' +
          'pantallas se ilustran con diagramas propios.',
      ),
    ],
    objetivos: [
      'Ubicar el módulo de Analítica Geoespacial dentro de IAPOL.',
      'Anticipar el recorrido: catálogo, mapas, capas, filtros y guardado.',
    ],
    notasInstructor:
      '[0–8 min · Apertura] Explicar que la Analítica Geoespacial permite ' +
      'ubicar datos sobre el mapa del país. Aclarar que esta sesión es ' +
      'explicativa; las rutas exactas deben verse en el portal real.',
  },
  {
    id: 's4-d02',
    layout: 'contenido',
    titulo: '¿Qué es la Analítica Geoespacial?',
    contenido: [
      texto(
        'Es el menú de IAPOL donde se encuentra la información referente a los ' +
          'mapas geoespaciales. Permite ubicar diferentes fuentes de ' +
          'información sobre el mapa del país con una herramienta de ' +
          'visualización personalizable por capas.',
      ),
      lista([
        'Se ingresa desde la barra de menú izquierda: módulo "Analítica Geoespacial".',
        'La visualización es completamente personalizable por capas.',
        'Admite datos en formato JSON, GeoJSON, CSV y XLS.',
      ]),
    ],
    objetivos: [
      'Definir el propósito del módulo de Analítica Geoespacial.',
      'Reconocer que la visualización se organiza por capas.',
    ],
    notasInstructor:
      '[0–8 min] Señalar la ubicación del menú en la barra izquierda. Enlazar ' +
      'con el resto de IAPOL (IAM, menús) ya visto en la guía de usuario.',
  },
  {
    id: 's4-d03',
    layout: 'diagrama',
    titulo: 'El flujo de trabajo de principio a fin',
    contenido: [
      texto(
        'El trabajo en el módulo sigue cuatro momentos: cargar datos con ' +
          'coordenadas, configurar capas de visualización, aplicar filtros y, ' +
          'por último, guardar o exportar el mapa.',
      ),
      imagen(
        '/img/sesion4/flujo-geoespacial.svg',
        'Flujo de la Analítica Geoespacial: cargar datos con latitud y ' +
          'longitud (JSON, GeoJSON, CSV o XLS), configurar capas, aplicar ' +
          'filtros y guardar o exportar el mapa en el catálogo.',
      ),
    ],
    objetivos: [
      'Describir las cuatro etapas del trabajo con mapas.',
      'Situar dónde encaja cada funcionalidad del módulo.',
    ],
    notasInstructor:
      '[0–8 min] Usar el diagrama como mapa mental de la sesión: cada etapa se ' +
      'detalla en las diapositivas siguientes.',
  },

  // ─────────────────────────────────────── 8–20: Catálogo e históricos
  {
    id: 's4-d04',
    layout: 'diagrama',
    titulo: 'Catálogo de Analítica Geoespacial',
    contenido: [
      texto(
        'El catálogo lista los mapas configurados con la información de las ' +
          'distintas bases de datos de la Policía Nacional. Cada mapa está ' +
          'etiquetado con la SIGLA de la unidad a la que pertenece la ' +
          'información.',
      ),
      imagen(
        '/img/sesion4/catalogo-mapas.svg',
        'Catálogo de mapas con tarjetas etiquetadas por sigla de unidad, un ' +
          'buscador por palabra clave y un filtro por unidad.',
      ),
      lista([
        'Buscar mapas por palabra clave en el buscador.',
        'Filtrar los mapas según la unidad.',
        'Cada tarjeta indica la SIGLA del origen de la información.',
      ]),
    ],
    objetivos: [
      'Navegar el catálogo de mapas.',
      'Localizar un mapa por búsqueda o por unidad.',
    ],
    notasInstructor:
      '[8–20 min · Catálogo] Mostrar la búsqueda y el filtro por unidad. ' +
      'Explicar el etiquetado por SIGLA como pista del origen del dato.',
  },
  {
    id: 's4-d05',
    layout: 'contenido',
    titulo: 'Mapas históricos (SIEDCO, RNMC, SECAD)',
    contenido: [
      texto(
        'Una funcionalidad clave es crear mapas con la información histórica de ' +
          'cada base de datos relacionada. Los mapas históricos se encuentran ' +
          'en el grupo que contiene "Análisis de seguridad".',
      ),
      lista([
        'Bases relacionadas: SIEDCO, RNMC y SECAD.',
        'Se puede filtrar por tipo de delito base.',
        'Se muestran en columnas la cantidad de pedidos, delitos y llamadas.',
        'Al abrir un mapa aparece una ventana de carga antes de visualizarlo.',
      ]),
      nota(
        'info',
        'Al terminar la carga se visualizan los mapas configurados con la ' +
          'actividad delictiva proveniente de las bases (por ejemplo, SECAD y ' +
          'SIEDCO).',
      ),
    ],
    objetivos: [
      'Reconocer las bases que alimentan los mapas históricos.',
      'Saber dónde se ubican y cómo se abren los mapas históricos.',
    ],
    notasInstructor:
      '[8–20 min] Aclarar que el contenido exacto depende del entorno. ' +
      'Mencionar la ventana de carga para fijar expectativas de tiempo.',
  },

  // ─────────────────────────────────────── 20–35: Crear mapa con datos
  {
    id: 's4-d06',
    layout: 'contenido',
    titulo: 'Crear un mapa con datos nuevos',
    contenido: [
      texto(
        'En el apartado derecho del catálogo está la opción "Nuevo mapa", que ' +
          'permite cargar distintos formatos de archivo para graficar la ' +
          'información sobre el mapa geoespacial.',
      ),
      lista(
        [
          'Hacer clic en el botón "Nuevo mapa" (apartado derecho del catálogo).',
          'Cargar los datos que se usarán para graficar.',
          'Configurar las capas de visualización.',
        ],
        true,
      ),
      nota(
        'advertencia',
        'Es necesario que los datos cuenten con latitud y longitud para poder ' +
          'ubicarlos en el mapa.',
      ),
    ],
    objetivos: [
      'Iniciar la creación de un mapa con datos propios.',
      'Recordar el requisito de coordenadas (lat/lon).',
    ],
    notasInstructor:
      '[20–35 min · Datos] Enfatizar el requisito de latitud y longitud: sin ' +
      'coordenadas, los registros no pueden ubicarse en el mapa.',
  },
  {
    id: 's4-d07',
    layout: 'diagrama',
    titulo: 'Formatos admitidos y carga de datos',
    contenido: [
      texto(
        'La herramienta soporta formato JSON, GeoJSON, CSV y XLS. Los datos se ' +
          'pueden arrastrar desde un explorador de archivos o buscarlos con el ' +
          'botón "Browse your files".',
      ),
      imagen(
        '/img/sesion4/formatos-datos.svg',
        'Formatos admitidos JSON, GeoJSON, CSV y XLS; cada registro debe tener ' +
          'latitud y longitud para ubicarse en el mapa.',
      ),
      lista([
        'Arrastrar archivos o usar "Browse your files" para cargarlos.',
        'Con "Add Data" se agregan más fuentes de datos.',
        'Cada fuente aparece abajo con su nombre y su cantidad de filas.',
      ]),
    ],
    objetivos: [
      'Enumerar los formatos admitidos.',
      'Describir cómo se cargan y se suman fuentes de datos.',
    ],
    notasInstructor:
      '[20–35 min] Mostrar que cada archivo cargado reporta nombre y número ' +
      'de filas, lo que ayuda a verificar que el dato entró bien.',
  },
  {
    id: 's4-d08',
    layout: 'contenido',
    titulo: 'De dataset a capa',
    contenido: [
      texto(
        'Bajo el dataset está la opción de capas, donde se agregan los ' +
          'conjuntos de datos para configurar cómo se visualizan en el mapa.',
      ),
      lista(
        [
          'Hacer clic en "Add Layer".',
          'Seleccionar el dataset que se quiere mostrar.',
          'Cambiar el nombre de la capa para reconocerla fácilmente.',
        ],
        true,
      ),
      nota(
        'info',
        'Al agregar nuevos datasets se pueden crear nuevas capas y ' +
          'configurarlas de forma diferente para verlas en conjunto sobre el ' +
          'mismo mapa.',
      ),
    ],
    objetivos: [
      'Diferenciar un dataset de una capa.',
      'Crear y nombrar una capa a partir de un dataset.',
    ],
    notasInstructor:
      '[20–35 min] Dejar clara la relación: un dataset puede alimentar una o ' +
      'varias capas, y cada capa se configura por separado.',
  },

  // ─────────────────────────────────────── 35–48: Capas, estilo, filtros
  {
    id: 's4-d09',
    layout: 'diagrama',
    titulo: 'Tipos de capa para representar los datos',
    contenido: [
      texto(
        'La herramienta permite elegir entre varios tipos de capa para ' +
          'representar los datos según lo que se quiera comunicar.',
      ),
      imagen(
        '/img/sesion4/tipos-capas.svg',
        'Tipos de capa: puntos, líneas, arcos, hexágonos, polígonos, mapas de ' +
          'calor y columnas sobre el mapa.',
      ),
      lista([
        'Puntos, líneas, arcos, hexágonos, polígonos y mapas de calor, entre otros.',
        'El tipo de capa se cambia en su configuración (donde dice "Basic").',
        'La capa de puntos requiere latitud y longitud para mostrarse.',
      ]),
    ],
    objetivos: [
      'Enumerar los tipos de capa disponibles.',
      'Relacionar el tipo de capa con la pregunta que responde.',
    ],
    notasInstructor:
      '[35–48 min · Capas] Mostrar cómo se abre la configuración de la capa ' +
      '(flecha del borde derecho) y dónde se elige el tipo.',
  },
  {
    id: 's4-d10',
    layout: 'contenido',
    titulo: 'Estilización de una capa',
    contenido: [
      texto(
        'Cada capa se personaliza para mejorar la interpretación de los datos. ' +
          'En una capa de puntos, por ejemplo, se ajustan varios atributos ' +
          'visuales.',
      ),
      lista([
        'Fill Color: color del punto.',
        'Outline: color de la línea que marca el borde del punto.',
        'Radius: tamaño del punto en píxeles.',
        'Label: campo del dataset que se muestra como etiqueta.',
      ]),
      nota(
        'info',
        'Hay muchas formas de mostrar los datos (columnas, mapas de calor, ' +
          'iconos, entre otros) y se pueden combinar varias capas sobre el ' +
          'mismo mapa.',
      ),
    ],
    objetivos: [
      'Identificar los atributos de estilo de una capa de puntos.',
      'Entender que varios datasets/capas conviven en un mapa.',
    ],
    notasInstructor:
      '[35–48 min] Hacer un ejemplo cambiando color y radio para evidenciar ' +
      'el efecto inmediato sobre el mapa.',
  },
  {
    id: 's4-d11',
    layout: 'contenido',
    titulo: 'Agrupación de datos',
    contenido: [
      texto(
        'La herramienta permite agrupar datos geoespaciales por ' +
          'características comunes, lo que facilita ver concentraciones o ' +
          'patrones sobre el mapa.',
      ),
      lista([
        'Agrupar por características comunes del dataset.',
        'Visualizar concentraciones (por ejemplo, con hexágonos o mapas de calor).',
        'Combinar varios conjuntos de datos en un mismo mapa.',
      ]),
    ],
    objetivos: [
      'Explicar para qué sirve agrupar datos geoespaciales.',
      'Asociar la agrupación con la detección de patrones.',
    ],
    notasInstructor:
      '[35–48 min] Conectar agrupación con tipos de capa como hexágonos o ' +
      'mapa de calor, que resumen densidad.',
  },
  {
    id: 's4-d12',
    layout: 'diagrama',
    titulo: 'Filtros dinámicos y línea de tiempo',
    contenido: [
      texto(
        'Los filtros permiten manipular las visualizaciones en tiempo real ' +
          'según parámetros como tiempo, valores de datos y más. Se crean en la ' +
          'pestaña de filtros, junto al botón de capas.',
      ),
      imagen(
        '/img/sesion4/filtros-tiempo.svg',
        'Panel de filtros sobre el mapa: al elegir un campo se filtra en ' +
          'tiempo real; si el campo es de fecha aparece una línea de tiempo con ' +
          'controles de reproducción y selección de rango.',
      ),
      lista([
        'Los filtros dependen de los campos presentes en los datasets cargados.',
        'Al filtrar un valor (p. ej. un delito), el mapa muestra solo eso.',
        'Un campo de fecha se marca como "time" y habilita una línea de tiempo.',
        'La línea de tiempo tiene play, velocidad, reinicio y ocultar controles.',
      ]),
    ],
    objetivos: [
      'Crear un filtro y observar su efecto inmediato en el mapa.',
      'Reconocer cuándo aparece la línea de tiempo y cómo se usa.',
    ],
    notasInstructor:
      '[35–48 min · Filtros] Mostrar un filtro por campo de delito y otro por ' +
      'fecha_hora para evidenciar la línea de tiempo. Se pueden filtrar bases ' +
      '(p. ej. SIEDCO y RNMC).',
  },

  // ─────────────────────────────────────── 48–55: Tooltips, exportar
  {
    id: 's4-d13',
    layout: 'contenido',
    titulo: 'Exploración interactiva y tooltips',
    contenido: [
      texto(
        'Las personas usuarias pueden interactuar con la visualización, ' +
          'explorar diferentes áreas del mapa y obtener detalles de puntos ' +
          'específicos mediante tooltips.',
      ),
      lista([
        'Al seleccionar un dato de la capa se muestra su información del dataset.',
        'Permite inspeccionar registros concretos sin salir del mapa.',
      ]),
    ],
    objetivos: [
      'Usar tooltips para leer el detalle de un punto.',
      'Explorar el mapa de forma interactiva.',
    ],
    notasInstructor:
      '[48–55 min] Hacer clic en un punto para mostrar el tooltip y leer los ' +
      'campos del dataset asociados.',
  },
  {
    id: 's4-d14',
    layout: 'contenido',
    titulo: 'Exportar y guardar el mapa',
    contenido: [
      texto(
        'Los mapas se pueden exportar y también guardar dentro del catálogo ' +
          'para reutilizarlos y compartirlos.',
      ),
      lista([
        'Exportar como imagen de la visualización.',
        'Exportar como configuración completa, compartible y reproducible.',
        'Guardar en el catálogo: nombre, descripción y grupo, y luego enviar.',
      ]),
      nota(
        'info',
        'Al guardar con nombre, descripción y grupo, el mapa queda disponible ' +
          'en el catálogo de mapas.',
      ),
    ],
    objetivos: [
      'Distinguir exportar como imagen de exportar la configuración.',
      'Guardar un mapa en el catálogo con sus metadatos.',
    ],
    notasInstructor:
      '[48–55 min] Resaltar que exportar la configuración permite reproducir ' +
      'el mapa en otra instancia, no solo una imagen estática.',
  },

  // ─────────────────────────────────────── 55–60: Anticipación y cierre
  {
    id: 's4-d15',
    layout: 'diagrama',
    titulo: 'Anticipación a Fenómenos de Seguridad',
    contenido: [
      texto(
        'Es un mapa desarrollado para predecir y gestionar fenómenos de ' +
          'seguridad. Incluye varias capas que se pueden visualizar en ' +
          'conjunto sobre el territorio.',
      ),
      imagen(
        '/img/sesion4/anticipacion-seguridad.svg',
        'Mapa Anticipación a Fenómenos de Seguridad con capas de cuadrantes, ' +
          'patrullas, predicciones, hechos reales, microterritorios y puntos ' +
          'de apoyo, y un buscador por unidad.',
      ),
      lista([
        'Capas: cuadrantes, instituciones, patrullas, microterritorios.',
        'Capas: predicciones, cuadrantes virtuales, hechos reales y puntos de apoyo.',
      ]),
    ],
    objetivos: [
      'Describir el propósito del mapa de anticipación.',
      'Enumerar sus capas principales.',
    ],
    notasInstructor:
      '[55–60 min · Anticipación] Presentar el mapa como caso avanzado que ' +
      'combina muchas capas. No entrar en el detalle operativo del dato.',
  },
  {
    id: 's4-d16',
    layout: 'contenido',
    titulo: 'Interfaz y búsqueda por unidades',
    contenido: [
      texto(
        'La plataforma cuenta con una interfaz gráfica intuitiva que permite ' +
          'navegar e interactuar directamente con los datos visualizados.',
      ),
      lista(
        [
          'Oprimir el botón verde "Buscar unidad".',
          'Se despliega la jerarquía de unidades.',
          'Escribir el nombre de la unidad y oprimir enter.',
          'Desplazar el scroll hasta encontrar la unidad seleccionada.',
        ],
        true,
      ),
      nota(
        'info',
        'La búsqueda por unidades (estaciones, CAI y metropolitanas) ayuda a ' +
          'localizar rápidamente la infraestructura de seguridad relevante en ' +
          'una región.',
      ),
    ],
    objetivos: [
      'Usar la búsqueda por unidades operativas.',
      'Reconocer los tipos de unidad disponibles.',
    ],
    notasInstructor:
      '[55–60 min] Mostrar el flujo de "Buscar unidad" paso a paso. Los ' +
      'nombres exactos de unidades dependen del entorno.',
  },
  {
    id: 's4-d17',
    layout: 'contenido',
    titulo: 'Buenas prácticas y advertencias',
    contenido: [
      lista([
        'Verificar que los datos tengan latitud y longitud antes de cargarlos.',
        'Nombrar capas y mapas de forma clara para encontrarlos en el catálogo.',
        'Confirmar el origen (SIGLA/base) antes de interpretar un mapa.',
        'Recordar que un filtro cambia la población mostrada, no los datos de origen.',
      ]),
      nota(
        'simulacion',
        'Esta sesión es explicativa. Rutas, botones y rótulos exactos deben ' +
          'cotejarse con la versión vigente de IAPOL antes de darlos por ' +
          'definitivos.',
      ),
    ],
    objetivos: [
      'Adoptar buenas prácticas al crear y leer mapas.',
      'Evitar conclusiones apresuradas sobre un mapa filtrado.',
    ],
    notasInstructor:
      '[55–60 min] Reforzar la honestidad del dato: lo que se ve depende de ' +
      'las capas y filtros activos y del origen de la información.',
  },
  {
    id: 's4-d18',
    layout: 'contenido',
    titulo: 'Cierre y repaso',
    contenido: [
      texto('En 60 minutos recorrimos el módulo de Analítica Geoespacial:'),
      lista([
        'Catálogo de mapas y mapas históricos (SIEDCO, RNMC, SECAD).',
        'Crear mapas con datos propios (lat/lon) en JSON, GeoJSON, CSV o XLS.',
        'Datasets, capas, tipos de capa y estilización.',
        'Filtros dinámicos, línea de tiempo, tooltips, exportar y guardar.',
        'Mapa Anticipación a Fenómenos de Seguridad y búsqueda por unidad.',
      ]),
    ],
    objetivos: [
      'Repasar las funcionalidades clave del módulo.',
      'Cerrar con una visión integral del flujo geoespacial.',
    ],
    notasInstructor:
      '[55–60 min · Cierre] Recapitular el flujo (datos → capas → filtros → ' +
      'guardar) y abrir espacio para preguntas.',
  },
];

/**
 * Sesión 4 completa.
 * @type {import('./tipos.js').Sesion}
 */
export const sesion4 = {
  id: 4,
  titulo: 'Analítica Geoespacial en IAPOL',
  duracionMin: 60,
  conceptos,
  diapositivas,
};

export default sesion4;
