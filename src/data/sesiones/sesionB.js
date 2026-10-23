// Sesión 2: "Publicación en IAPOL y Analítica Geoespacial (IAMAPS)"
//
// Capacitación práctica de 180 minutos (3 horas). Continúa la Sesión 1:
//   1) Finalizar lo práctico de Amazon Quick: publicar el análisis como
//      dashboard, obtener el Dashboard ID, compartir/permisos y prerrequisitos
//      de embedding.
//   2) Implementar/registrar el tablero en IAPOL (id_quicksight = Dashboard ID),
//      visibilidad y verificación del embebido, con diagnóstico.
//   3) Módulo IAMAPS / Analítica Geoespacial: catálogo, mapas históricos, crear
//      mapas con datos propios (lat/lon), capas, estilización, filtros y línea
//      de tiempo, tooltips, exportar/guardar y el mapa "Anticipación a
//      Fenómenos de Seguridad" con búsqueda por unidad.
//
// Práctica "hazlo tú" con pasos accionables, verificaciones y CAPTURAS
// (placeholders en public/img/sesionB/ hasta que se suban los PNG; la parte de
// Quick/IAPOL reutiliza rutas de public/img/sesionA/).
//
// Honestidad: la plataforma NO se conecta a AWS ni a IAPOL. Rutas, botones y
// nombres exactos deben cotejarse con el entorno vigente.
//
// @module data/sesiones/sesionB

const texto = (t) => ({ tipo: 'texto', texto: t });
const lista = (items, ordenada = false) => ({ tipo: 'lista', items, ordenada });
const nota = (variante, t) => ({ tipo: 'nota', variante, texto: t });
const pasos = (listaPasos) => ({ tipo: 'pasos', pasos: listaPasos });
const imagen = (src, alt) => ({ tipo: 'imagen', src, alt });

/** Prefijos de rutas de captura. */
const IMG = '/img/sesionB';
const IMG_A = '/img/sesionA';

/**
 * Conceptos mínimos de la Sesión 2.
 * @type {string[]}
 */
const conceptos = [
  'Publicación del análisis como dashboard en Amazon Quick',
  'Dashboard ID vs. Analysis ID',
  'Compartir: usuario, grupo o rol',
  'Prerrequisitos del embedding',
  'Registro del tablero en IAPOL (id_quicksight = Dashboard ID)',
  'Visibilidad por módulo/usuario/rol y verificación del embebido',
  'Módulo IAMAPS / Analítica Geoespacial de IAPOL',
  'Catálogo de mapas y mapas históricos (SIEDCO, RNMC, SECAD)',
  'Crear mapa con datos propios (lat/lon): JSON, GeoJSON, CSV, XLS',
  'Datasets, capas, tipos de capa y estilización',
  'Filtros dinámicos y línea de tiempo (campo time)',
  'Exportar/guardar y Anticipación a Fenómenos de Seguridad',
];

/**
 * Diapositivas de la Sesión 2 (180 min). Cronograma orientativo:
 *   0–10    Repaso y objetivos de la sesión
 *   10–45   Finalizar Quick: publicar, Dashboard ID, permisos, embedding  [LAB 4]
 *   45–80   Implementar el tablero en IAPOL  [LAB 5]
 *   80–100  IAMAPS: acceso, catálogo y mapas históricos  [LAB 6]
 *   100–140 Crear mapa propio: datos, capas, tipos y estilización  [LAB 7]
 *   140–165 Filtros, línea de tiempo, tooltips, exportar y guardar  [LAB 8]
 *   165–180 Anticipación a Fenómenos, búsqueda por unidad y cierre  [LAB 9]
 * @type {import('./tipos.js').Diapositiva[]}
 */
const diapositivas = [
  // ─────────────────────────── 0–10 · Repaso
  {
    id: 'sb-d01',
    layout: 'titulo',
    titulo: 'Sesión 2 · Publicación en IAPOL y Analítica Geoespacial (IAMAPS)',
    contenido: [
      texto(
        'Continuamos el laboratorio: cerramos lo práctico de Amazon Quick ' +
          '(publicar el tablero y permisos), lo implementamos en IAPOL y luego ' +
          'dominamos el módulo de Analítica Geoespacial (IAMAPS).',
      ),
      lista([
        'Duración: 180 minutos (práctica guiada "hazlo tú").',
        'Parte 1: finalizar Quick + registrar el tablero en IAPOL.',
        'Parte 2: IAMAPS (mapas, capas, filtros, línea de tiempo).',
      ]),
      nota(
        'simulacion',
        'Material de apoyo: ejecuta en tu cuenta/portal reales y reemplaza las ' +
          'capturas por las de tu entorno.',
      ),
    ],
    objetivos: [
      'Retomar el análisis de tres hojas de la Sesión 1.',
      'Fijar los dos grandes bloques de hoy: Quick+IAPOL e IAMAPS.',
    ],
    notasInstructor:
      '[0–10 min] Confirmar que cada quien tiene su análisis de la Sesión 1 ' +
      'guardado y accesible.',
  },
  {
    id: 'sb-d02',
    layout: 'contenido',
    titulo: 'Punto de partida: el análisis de la Sesión 1',
    contenido: [
      texto(
        'Partimos del análisis creado en la Sesión 1 ' ,
      ),
      imagen(
        '/img/sesion2/tres-hojas.svg',
        'Las tres hojas del análisis: resumen con KPIs y barras, detallado con ' +
          'tabla, y tendencias con líneas.',
      ),
      nota(
        'info',
        'Si alguien no terminó la Sesión 1, puede seguir la demostración del ' +
          'instructor o usar el simulador local de la plataforma.',
      ),
    ],
    objetivos: [
      'Ubicar el punto de partida de la sesión.',
      'Confirmar el análisis que se publicará.',
    ],
    notasInstructor:
      '[0–10 min] Abrir el análisis guardado para que todos partan del mismo ' +
      'punto.',
  },

  // ─────────────────────────── 10–45 · LAB 4: finalizar Quick
  {
    id: 'sb-d03',
    layout: 'laboratorio-guiado',
    titulo: 'LAB 4 · Publicar el dashboard',
    contenido: [
      pasos([
        {
          instruccion: 'Publica el análisis como dashboard con un nombre claro y versionable.',
          captura: `${IMG_A}/quick-publicar.png`,
          capturaDescripcion:
            'Diálogo de publicación de dashboard en Quick con el nombre del tablero.',
          verificacion: 'El dashboard aparece en la sección de dashboards.',
        },
      ]),
    ],
    objetivos: [
      'Publicar el dashboard.',
    ],
    notasInstructor:
      '[10–45 min · LAB 4] Insistir en no confundir Analysis ID con ' +
      'Dashboard ID.',
  },
  {
    id: 'sb-d03b',
    layout: 'laboratorio-guiado',
    titulo: 'LAB 4 · Obtener el Dashboard ID',
    contenido: [
      pasos([
        {
          instruccion: 'Abre el dashboard publicado y localiza su Dashboard ID.',
          captura: `${IMG_A}/quick-dashboard-id.png`,
          capturaDescripcion:
            'Dashboard publicado con el Dashboard ID visible (en la URL o en detalles), anonimizado.',
          verificacion: 'Tienes el Dashboard ID copiado.',
        },
      ]),
      nota(
        'info',
        'El Analysis ID (editable) y el Dashboard ID (publicado) son distintos. ' +
          'El embebido referencia el Dashboard ID.',
      ),
    ],
    objetivos: [
      'Localizar y guardar el Dashboard ID.',
    ],
    notasInstructor:
      '[10–45 min · LAB 4] El Dashboard ID es el que se registra en IAPOL.',
  },
  {
    id: 'sb-d05',
    layout: 'laboratorio-guiado',
    titulo: 'LAB 4 · Prerrequisitos del embebido',
    contenido: [
      texto(
        'Copiar una URL o un identificador NO habilita por sí solo el embebido ' +
          'en otro portal. Hay prerrequisitos técnicos que deben cumplirse.',
      ),
      lista([
        'Autenticación y autorización del usuario que visualiza.',
        'Configuración de embedding habilitada para el dashboard.',
        'Dominios permitidos / políticas de embedding configuradas.',
        'Registro institucional del recurso (en IAPOL, en el LAB 5).',
      ]),
      nota(
        'iapol',
        'La habilitación técnica del embebido y el registro en IAPOL son pasos ' +
          'distintos; ambos deben completarse para ver el tablero embebido.',
      ),
    ],
    objetivos: [
      'Enumerar los prerrequisitos del embebido.',
      'Separar "tener el ID" de "poder embeber".',
    ],
    notasInstructor:
      '[10–45 min · LAB 4] Puente hacia el LAB 5: el registro en IAPOL.',
  },

  // ─────────────────────────── 45–80 · LAB 5: IAPOL
  {
    id: 'sb-d06',
    layout: 'laboratorio-guiado',
    plano: 'iapol',
    titulo: 'LAB 5 · Entrar al registro de IAPOL',
    contenido: [
      texto(
        'En IAPOL, el tablero publicado en Quick se registra para poder ' +
          'visualizarlo embebido. El inventario de IAPOL guarda el Dashboard ID ' +
          'bajo el campo id_quicksight.',
      ),
      pasos([
        {
          instruccion: 'Ingresa a la interfaz administrativa de IAPOL donde se registran los recursos.',
          captura: `${IMG_A}/iapol-admin-registro.png`,
          capturaDescripcion:
            'Pantalla administrativa de IAPOL para registrar un recurso/tablero (anonimizada).',
          verificacion: 'Ves el formulario de registro del recurso.',
        },
      ]),
    ],
    objetivos: [
      'Ubicar la interfaz de registro de recursos en IAPOL.',
    ],
    notasInstructor:
      '[45–80 min · LAB 5] Dejar claro id_quicksight = Dashboard ID y que ' +
      'id_portal es interno de IAPOL.',
  },
  {
    id: 'sb-d06b',
    layout: 'laboratorio-guiado',
    plano: 'iapol',
    titulo: 'LAB 5 · Registrar el Dashboard ID (id_quicksight)',
    contenido: [
      pasos([
        {
          instruccion: 'Registra el tablero pegando el Dashboard ID en el campo id_quicksight.',
          captura: `${IMG_A}/iapol-id-quicksight.png`,
          capturaDescripcion:
            'Formulario de IAPOL con el Dashboard ID pegado en el campo id_quicksight.',
          verificacion: 'El recurso queda registrado con su id_quicksight.',
        },
      ]),
      nota(
        'simulacion',
        'Rutas, botones y nombres exactos de IAPOL deben cotejarse con el ' +
          'portal vigente. Reemplaza estas capturas por las de tu entorno.',
      ),
    ],
    objetivos: [
      'Registrar el tablero en IAPOL con id_quicksight.',
    ],
    notasInstructor:
      '[45–80 min · LAB 5] id_quicksight = Dashboard ID.',
  },
  {
    id: 'sb-d06c',
    layout: 'laboratorio-guiado',
    plano: 'iapol',
    titulo: 'LAB 5 · Asociar módulo y visibilidad',
    contenido: [
      pasos([
        {
          instruccion: 'Asocia el módulo/submódulo y la visibilidad por usuario o rol.',
          captura: `${IMG_A}/iapol-visibilidad.png`,
          capturaDescripcion:
            'Configuración de módulo/submódulo y visibilidad del tablero en IAPOL.',
          verificacion: 'La visibilidad queda definida para los perfiles previstos.',
        },
      ]),
    ],
    objetivos: [
      'Configurar módulo y visibilidad.',
    ],
    notasInstructor:
      '[45–80 min · LAB 5] La visibilidad determina quién ve el tablero.',
  },
  {
    id: 'sb-d06d',
    layout: 'laboratorio-guiado',
    plano: 'iapol',
    titulo: 'LAB 5 · Identificadores: Quick e IAPOL',
    contenido: [
      imagen(
        '/img/sesion3/identificadores.svg',
        'Dataset/Analysis/Dashboard ID en Amazon Quick; en IAPOL, id_quicksight ' +
          'guarda el mismo valor que el Dashboard ID.',
      ),
    ],
    objetivos: [
      'Relacionar el Dashboard ID de Quick con el id_quicksight de IAPOL.',
    ],
    notasInstructor:
      '[45–80 min · LAB 5] id_portal es interno de IAPOL; no confundir con ' +
      'id_quicksight.',
  },
  {
    id: 'sb-d07',
    layout: 'laboratorio-guiado',
    plano: 'iapol',
    titulo: 'LAB 5 · Verificar el tablero embebido',
    contenido: [
      pasos([
        {
          instruccion: 'Abre el módulo de IAPOL donde quedó asociado el tablero.',
          captura: `${IMG_A}/iapol-embebido-ok.png`,
          capturaDescripcion:
            'Tablero de Quick visualizándose embebido dentro de IAPOL (anonimizado).',
          verificacion: 'El dashboard se ve embebido y responde a la interacción.',
        },
        {
          instruccion: 'Si no se ve, aplica la lista de diagnóstico.',
          verificacion: 'Identificas la causa y la corriges.',
        },
      ]),
    ],
    objetivos: [
      'Verificar el embebido en IAPOL.',
      'Aplicar diagnóstico si no se visualiza.',
    ],
    notasInstructor:
      '[45–80 min · LAB 5] Conectar con los casos de diagnóstico clásicos ' +
      '(ID correcto pero no se ve).',
  },
  {
    id: 'sb-d07b',
    layout: 'laboratorio-guiado',
    plano: 'iapol',
    titulo: 'LAB 5 · Flujo de integración con IAPOL',
    contenido: [
      imagen(
        '/img/sesion3/flujo-integracion-iapol.svg',
        'Flujo conceptual: publicar en Quick, localizar el Dashboard ID y, como ' +
          'proceso institucional, registrar y verificar el embebido en IAPOL.',
      ),
    ],
    objetivos: [
      'Ver el flujo completo de integración Quick → IAPOL.',
    ],
    notasInstructor:
      '[45–80 min · LAB 5] Recorrer el diagrama de izquierda a derecha.',
  },
  {
    id: 'sb-d08',
    layout: 'diagnostico',
    plano: 'iapol',
    titulo: 'Diagnóstico · El tablero no se ve en IAPOL pese a tener el ID',
    contenido: [
      texto('Causas posibles (no un diagnóstico definitivo sin evidencia):'),
      lista([
        'El recurso no quedó registrado correctamente en la interfaz de IAPOL.',
        'El embedding no está habilitado o faltan dominios/políticas.',
        'El id_quicksight no coincide con el Dashboard ID vigente (quedó uno antiguo).',
        'La visibilidad por módulo/usuario/rol no habilita al que consulta.',
        'Permisos del dataset/dashboard insuficientes para el usuario final.',
      ]),
      nota(
        'advertencia',
        'Confirma con evidencia del entorno (registro, permisos, estado del ' +
          'dataset y configuración) antes de concluir.',
      ),
    ],
    objetivos: [
      'Enumerar causas posibles del fallo de visualización.',
      'Actuar con evidencia, no por suposición.',
    ],
    notasInstructor:
      '[45–80 min · LAB 5] Repasar el checklist en voz alta con el grupo.',
  },

  // ─────────────────────────── 80–100 · LAB 6: IAMAPS acceso y catálogo
  {
    id: 'sb-d09',
    layout: 'titulo',
    plano: 'iapol',
    titulo: 'Parte 2 · Analítica Geoespacial (IAMAPS)',
    contenido: [
      texto(
        'Segunda mitad de la sesión: el módulo de Analítica Geoespacial de ' +
          'IAPOL. Ubicaremos fuentes de información sobre el mapa del país y ' +
          'construiremos visualizaciones por capas.',
      ),
      imagen(
        '/img/sesion4/flujo-geoespacial.svg',
        'Flujo del módulo: cargar datos con lat/lon, configurar capas, aplicar ' +
          'filtros y guardar o exportar el mapa.',
      ),
    ],
    objetivos: [
      'Abrir la segunda mitad práctica: IAMAPS.',
      'Ver el flujo de trabajo geoespacial.',
    ],
    notasInstructor:
      '[80 min] Breve pausa cognitiva: cambiamos de AWS/Quick a IAMAPS.',
  },
  {
    id: 'sb-d10',
    layout: 'laboratorio-guiado',
    plano: 'iapol',
    titulo: 'LAB 6 · Acceder al módulo',
    contenido: [
      texto('Cada mapa del catálogo se etiqueta con la SIGLA de su unidad.'),
      pasos([
        {
          instruccion: 'En la barra de menú derecha, selecciona "Analítica Geoespacial".',
          captura: `${IMG}/acceso-menu.png`,
          capturaDescripcion:
            'Barra de menú izquierda de IAPOL con el módulo "Analítica Geoespacial" resaltado.',
          verificacion: 'Se abre el catálogo de mapas del módulo.',
        },
      ]),
    ],
    objetivos: [
      'Entrar al módulo de Analítica Geoespacial.',
    ],
    notasInstructor:
      '[80–100 min · LAB 6] Mostrar la ubicación exacta del menú en el portal.',
  },
  {
    id: 'sb-d10b',
    layout: 'laboratorio-guiado',
    plano: 'iapol',
    titulo: 'LAB 6 · Navegar el catálogo',
    contenido: [
      pasos([
        {
          instruccion: 'Busca un mapa por palabra clave y filtra por unidad.',
          captura: `${IMG}/catalogo-buscar.png`,
          capturaDescripcion:
            'Catálogo de mapas con el buscador y el filtro por unidad en uso.',
          verificacion: 'El listado se reduce a los mapas que coinciden.',
        },
      ]),
    ],
    objetivos: [
      'Buscar y filtrar mapas en el catálogo.',
    ],
    notasInstructor:
      '[80–100 min · LAB 6] El catálogo etiqueta cada mapa por su sigla.',
  },
  {
    id: 'sb-d11',
    layout: 'laboratorio-guiado',
    plano: 'iapol',
    titulo: 'LAB 6 · Abrir un mapa histórico (SIEDCO/RNMC/SECAD)',
    contenido: [
      texto('Los mapas históricos están en el grupo "Análisis de seguridad".'),
      pasos([
        {
          instruccion: 'Abre un mapa del grupo "Análisis de seguridad".',
          captura: `${IMG}/historico-carga.png`,
          capturaDescripcion: 'Ventana de carga al abrir un mapa histórico.',
          verificacion: 'Tras la carga, se ven los datos sobre el mapa.',
        },
      ]),
    ],
    objetivos: [
      'Abrir y leer un mapa histórico.',
      'Filtrar por tipo de delito base.',
    ],
    notasInstructor:
      '[80–100 min · LAB 6] Aclarar que el contenido depende del entorno real.',
  },

  // ─────────────────────────── 100–140 · LAB 7: crear mapa propio
  {
    id: 'sb-d12',
    layout: 'laboratorio-guiado',
    plano: 'iapol',
    titulo: 'LAB 7 · Crear un mapa con datos nuevos',
    contenido: [
      pasos([
        {
          instruccion: 'Haz clic en el botón "Nuevo mapa".',
          captura: `${IMG}/nuevo-mapa-boton.png`,
          capturaDescripcion: 'Botón "Nuevo mapa" en el apartado derecho del catálogo.',
          verificacion: 'Se abre la pantalla de cargue de datos.',
        },
      ]),
      nota(
        'advertencia',
        'Los datos deben contar con latitud y longitud para poder ubicarlos en ' +
          'el mapa.',
      ),
    ],
    objetivos: [
      'Iniciar la creación de un mapa propio.',
      'Recordar el requisito de coordenadas.',
    ],
    notasInstructor:
      '[100–140 min · LAB 7] Verificar que el archivo de práctica tenga lat/lon.',
  },
  {
    id: 'sb-d12b',
    layout: 'laboratorio-guiado',
    plano: 'iapol',
    titulo: 'LAB 7 · Formatos de datos admitidos',
    contenido: [
      imagen(
        '/img/sesion4/formatos-datos.svg',
        'Formatos admitidos JSON, GeoJSON, CSV y XLS; cada registro necesita lat/lon.',
      ),
    ],
    objetivos: [
      'Conocer los formatos admitidos y el requisito de lat/lon.',
    ],
    notasInstructor:
      '[100–140 min · LAB 7] Cada registro necesita latitud y longitud.',
  },
  {
    id: 'sb-d13',
    layout: 'laboratorio-guiado',
    plano: 'iapol',
    titulo: 'LAB 7 · Cargar fuentes de datos',
    contenido: [
      pasos([
        {
          instruccion: 'Arrastra el archivo o usa "Browse your files". Suma fuentes con "Add Data".',
          captura: `${IMG}/cargar-datos.png`,
          capturaDescripcion:
            'Pantalla de cargue de datos con "Browse your files" y zona de arrastre.',
          verificacion: 'La fuente aparece abajo con su nombre y cantidad de filas.',
        },
      ]),
    ],
    objetivos: [
      'Cargar fuentes de datos y confirmar filas.',
    ],
    notasInstructor:
      '[100–140 min · LAB 7] El reporte de filas ayuda a validar que el ' +
      'archivo entró completo.',
  },
  {
    id: 'sb-d13b',
    layout: 'laboratorio-guiado',
    plano: 'iapol',
    titulo: 'LAB 7 · Crear una capa',
    contenido: [
      pasos([
        {
          instruccion: 'En el panel de capas, haz clic en "Add Layer" y elige el dataset.',
          captura: `${IMG}/add-layer.png`,
          capturaDescripcion: 'Panel de capas con el botón "Add Layer".',
          verificacion: 'Se crea una capa asociada al dataset elegido.',
        },
        {
          instruccion: 'Cambia el nombre de la capa para reconocerla fácilmente.',
          verificacion: 'La capa muestra el nombre que le asignaste.',
        },
      ]),
      nota(
        'info',
        'Un dataset puede alimentar varias capas; cada capa se configura por ' +
          'separado y conviven en el mismo mapa.',
      ),
    ],
    objetivos: [
      'Crear y nombrar una capa desde un dataset.',
    ],
    notasInstructor:
      '[100–140 min · LAB 7] Un dataset puede alimentar varias capas.',
  },
  {
    id: 'sb-d14',
    layout: 'laboratorio-guiado',
    plano: 'iapol',
    titulo: 'LAB 7 · Elegir el tipo de capa',
    contenido: [
      pasos([
        {
          instruccion: 'Abre la configuración de la capa (flecha del borde derecho).',
          captura: `${IMG}/capa-config.png`,
          capturaDescripcion:
            'Configuración de la capa abierta mostrando el selector de tipo "Basic".',
          verificacion: 'Ves el tipo actual de la capa (p. ej. Point).',
        },
        {
          instruccion: 'Selecciona el tipo adecuado según lo que quieras comunicar.',
          verificacion: 'El mapa cambia al nuevo tipo de representación.',
        },
      ]),
    ],
    objetivos: [
      'Abrir la configuración de la capa.',
      'Elegir el tipo de capa correcto.',
    ],
    notasInstructor:
      '[100–140 min · LAB 7] Mostrar el cambio en vivo entre Point y mapa de ' +
      'calor para el mismo dataset.',
  },
  {
    id: 'sb-d14b',
    layout: 'laboratorio-guiado',
    plano: 'iapol',
    titulo: 'LAB 7 · Tipos de capa disponibles',
    contenido: [
      imagen(
        '/img/sesion4/tipos-capas.svg',
        'Tipos de capa: puntos, líneas, arcos, hexágonos, polígonos, calor y columnas.',
      ),
    ],
    objetivos: [
      'Conocer los tipos de capa y cuándo usarlos.',
    ],
    notasInstructor:
      '[100–140 min · LAB 7] Relacionar cada tipo de capa con lo que comunica.',
  },
  {
    id: 'sb-d15',
    layout: 'laboratorio-guiado',
    plano: 'iapol',
    titulo: 'LAB 7 · Estilizar y agrupar',
    contenido: [
      texto(
        'En una capa de puntos se pueden ajustar atributos visuales (Fill ' +
          'Color, Outline, Radius y Label) y, para ver concentraciones, ' +
          'cambiar a hexágonos o mapa de calor.',
      ),
      nota(
        'info',
        'Varias capas pueden combinarse en el mismo mapa; configura cada una ' +
          'por separado.',
      ),
    ],
    objetivos: [
      'Personalizar color, borde, tamaño y etiqueta.',
      'Usar agrupación para detectar patrones.',
    ],
    notasInstructor:
      '[100–140 min · LAB 7] Pedir que estilicen dos capas y las muestren ' +
      'juntas.',
  },

  // ─────────────────────────── 140–165 · LAB 8: filtros, tiempo, exportar
  {
    id: 'sb-d16',
    layout: 'laboratorio-guiado',
    plano: 'iapol',
    titulo: 'LAB 8 · Filtros dinámicos y línea de tiempo',
    contenido: [
      texto('Un campo de fecha activa la línea de tiempo (se marca como "time").'),
      pasos([
        {
          instruccion: 'Agrega un filtro por un campo (p. ej. "delito") y elige un valor.',
          captura: `${IMG}/filtro-delito.png`,
          capturaDescripcion:
            'Filtro por el campo "delito" con un valor seleccionado.',
          verificacion: 'El mapa muestra solo lo filtrado.',
        },
      ]),
      nota('info', 'También puedes filtrar por base (p. ej. mostrar solo SIEDCO y RNMC).'),
    ],
    objetivos: [
      'Crear filtros por campo y por fecha.',
      'Usar la línea de tiempo (reproducir y seleccionar rango).',
    ],
    notasInstructor:
      '[140–165 min · LAB 8] Mostrar la diferencia entre reproducir y ' +
      'seleccionar un rango fijo.',
  },
  {
    id: 'sb-d16b',
    layout: 'laboratorio-guiado',
    plano: 'iapol',
    titulo: 'LAB 8 · Filtros y línea de tiempo (vista general)',
    contenido: [
      imagen(
        '/img/sesion4/filtros-tiempo.svg',
        'Panel de filtros, mapa filtrado, línea de tiempo y tooltip.',
      ),
    ],
    objetivos: [
      'Ubicar el panel de filtros, la línea de tiempo y el tooltip en la interfaz.',
    ],
    notasInstructor:
      '[140–165 min · LAB 8] Señalar dónde aparece la línea de tiempo cuando ' +
      'hay un campo "time".',
  },
  {
    id: 'sb-d17',
    layout: 'laboratorio-guiado',
    plano: 'iapol',
    titulo: 'LAB 8 · Tooltips, exportar y guardar',
    contenido: [
      pasos([
        {
          instruccion: 'Haz clic sobre un dato de la capa para ver su tooltip.',
          captura: `${IMG}/tooltip.png`,
          capturaDescripcion:
            'Tooltip mostrando los campos del dato seleccionado sobre el mapa.',
          verificacion: 'Ves los campos del registro (delito, fecha, base, etc.).',
        },
      ]),
      texto(
        'Además, se puede exportar el mapa como imagen y como configuración ' +
          '(compartible/reproducible), y guardarlo en el catálogo con nombre, ' +
          'descripción y grupo.',
      ),
    ],
    objetivos: [
      'Leer el detalle con tooltips.',
      'Exportar y guardar el mapa en el catálogo.',
    ],
    notasInstructor:
      '[140–165 min · LAB 8] Resaltar el valor de exportar la configuración ' +
      'para reproducir mapas.',
  },

  // ─────────────────────────── 165–180 · LAB 9: Anticipación y cierre
  {
    id: 'sb-d18',
    layout: 'laboratorio-guiado',
    plano: 'iapol',
    titulo: 'LAB 9 · Anticipación a Fenómenos de Seguridad',
    contenido: [
      texto(
        'Mapa multicapa para predecir y gestionar fenómenos de seguridad. Se ' +
          'puede abrir el mapa "Anticipación a Fenómenos de Seguridad" y ' +
          'gestionar sus capas, y usar "Buscar unidad" para localizar una ' +
          'estación, CAI o metropolitana.',
      ),
      imagen(
        '/img/sesion4/anticipacion-seguridad.svg',
        'Mapa de Anticipación con cuadrantes, patrullas, predicciones, hechos ' +
          'reales y leyenda.',
      ),
    ],
    objetivos: [
      'Explorar el mapa de anticipación y sus capas.',
      'Usar la búsqueda por unidades.',
    ],
    notasInstructor:
      '[165–180 min · LAB 9] Caso avanzado multicapa; no entrar al detalle ' +
      'operativo del dato.',
  },
  {
    id: 'sb-d19',
    layout: 'diagnostico',
    plano: 'iapol',
    titulo: 'Diagnóstico · Problemas frecuentes en el mapa',
    contenido: [
      texto('Causas posibles (confirmar con evidencia del entorno):'),
      lista([
        'Los datos no se ubican: faltan latitud/longitud o están en otra columna.',
        'El filtro no cambia el mapa: el campo no coincide o no hay valores.',
        'La línea de tiempo no aparece: el campo no se reconoció como "time".',
        'El mapa guardado no se ve: grupo/visibilidad no habilita al usuario.',
        'Rendimiento lento: demasiados puntos; usa hexágonos o mapa de calor.',
      ]),
      nota(
        'advertencia',
        'No concluyas sin revisar los campos del dataset, el tipo de capa y la ' +
          'configuración del filtro.',
      ),
    ],
    objetivos: [
      'Reconocer fallos frecuentes del módulo.',
      'Actuar con evidencia.',
    ],
    notasInstructor:
      '[165–180 min] Repasar el checklist con el grupo.',
  },
  {
    id: 'sb-d20',
    layout: 'contenido',
    plano: 'iapol',
    titulo: 'Checklist y cierre de la Sesión 2',
    contenido: [
      lista(
        [
          'Dashboard publicado y Dashboard ID anotado.',
          'Dashboard compartido y acceso verificado.',
          'Tablero registrado en IAPOL (id_quicksight) y visibilidad definida.',
          'Embebido verificado en IAPOL.',
          'IAMAPS: mapa propio con datos lat/lon, capas y estilización.',
          'Filtros, línea de tiempo y tooltips usados.',
          'Mapa exportado y guardado en el catálogo.',
          'Mapa de Anticipación explorado y búsqueda por unidad usada.',
        ],
        true,
      ),
      nota(
        'simulacion',
        'Recuerda: la plataforma es de apoyo. Ejecuta en tu cuenta/portal ' +
          'reales y reemplaza las capturas por las de tu entorno.',
      ),
    ],
    objetivos: [
      'Confirmar que el entregable completo está listo.',
      'Cerrar el programa de dos sesiones.',
    ],
    notasInstructor:
      '[175–180 min · Cierre] Marcar el checklist y abrir espacio para ' +
      'preguntas finales.',
  },
];

/**
 * Sesión 2 completa.
 * @type {import('./tipos.js').Sesion}
 */
export const sesionB = {
  id: 2,
  titulo: 'Publicación en IAPOL y Analítica Geoespacial (IAMAPS)',
  duracionMin: 180,
  conceptos,
  diapositivas,
};

export default sesionB;
