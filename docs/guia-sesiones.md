# Guía del instructor — Capacitación Amazon Athena, Amazon Quick e IAPOL

> **Para qué sirve este documento.** Es el guion de cada sesión: qué se habla, en
> qué orden, cuánto dura cada bloque y **cómo decirlo** (mensajes clave y frases
> de apoyo). Está pensado para que puedas prepararte y conducir cada sesión sin
> improvisar, aunque la audiencia tenga nivel mixto de SQL y AWS.
>
> El contenido vive en la plataforma (`src/data/sesiones/sesion1|2|3.js`); aquí
> se resume el recorrido y se añade el "cómo contarlo".

## Reglas de oro (válidas para las tres sesiones)

1. **La plataforma es pedagógica.** No ejecuta nada real en AWS ni en IAPOL.
   Siempre que uses el Laboratorio SQL o el Simulador, nómbralo como
   **"Simulación local"** (la insignia turquesa lo marca en pantalla).
2. **Honestidad técnica.** Todo ejemplo de SQL o de nombres de recursos es
   didáctico y **debe comprobarse contra el esquema/diccionario reales** antes
   de un laboratorio en vivo. Dilo abiertamente; genera confianza.
3. **Tres planos, tres colores.** Diferencia siempre:
   - *Amazon Quick real* (lo hace el participante en su cuenta),
   - *Simulación local* (ensayo dentro de la plataforma),
   - *Proceso institucional IAPOL* (solo se explica, no se ejecuta).
4. **Ritmo.** Cada sesión dura **120 minutos**. Usa el temporizador del Modo
   Presentador y respeta los bloques. Si un bloque se alarga, recorta de la
   teoría, nunca de la práctica individual.
5. **Caso transversal.** Todo gira en torno al dataset de ejemplo **NYC Yellow
   Taxi (enero 2024)**: fecha de recogida, tipo de pago, pasajeros, distancia e
   importe.

---

# Sesión 1 — "Del dato abierto a Amazon Athena"

**Duración:** 120 min · **Objetivo global:** que cada participante entienda el
flujo S3 → Glue → Athena y sepa **interpretar** SQL (incluyendo JOIN y vistas)
sobre el caso de los taxis de NYC.

**Conceptos que se tratan:** Amazon S3 (buckets, objetos, prefijos) · Parquet vs
CSV · AWS Glue Data Catalog · Amazon Athena · workgroups · SQL (SELECT, WHERE,
COUNT, GROUP BY, ORDER BY) · JOIN y agregaciones · vistas.

### Cronograma y guion

| Tramo | Bloque | Qué decir / cómo contarlo |
|---|---|---|
| **0–15 min** · Apertura y arquitectura | Portada, agenda, objetivos y el diagrama S3 → Glue/Athena → Quick → IAPOL | Preséntate y toma el pulso: *"¿quién ha escrito SQL antes? ¿quién ha tocado AWS?"*. Recorre el **diagrama interactivo** de arriba abajo. **Mensaje clave:** "Glue **describe** las tablas; Athena **consulta** los datos que siguen en S3 — no se mueven". Aclara que la integración IAPOL que aparece al final es **explicación, no ejecución**. |
| **15–30 min** · Dataset, campos y formatos | El caso NYC Taxi, los 5 campos y Parquet vs CSV | Abre el explorador de columnas. **Idea central de formatos:** "Parquet es columnar → Athena escanea menos → más rápido y más barato que CSV". **Advertencia a decir en voz alta:** los valores codificados (p. ej. `payment_type`) se malinterpretan si no se consulta el diccionario oficial. |
| **30–50 min** · S3, Glue, Athena, workgroup (demostración del instructor) | Almacenamiento, catálogo de metadatos, SQL serverless y control de costos | Esta parte la **demuestras tú**; los participantes observan. Modelo mental a repetir: *"SQL sobre archivos que ya están en S3"*. Explica el workgroup como el lugar donde se guardan los resultados y se limita el escaneo (control de costo). Recuerda: en la capacitación **solo el instructor** crea recursos. |
| **50–75 min** · SQL base (demostración + ejercicio guiado) | SELECT/WHERE, COUNT y agregaciones, GROUP BY/ORDER BY | Empieza por lo más simple y sube. Conecta cada pieza con un KPI de la Sesión 2 (COUNT(*) → "total de viajes"; GROUP BY payment_type → gráfico de barras). **Ejercicio guiado:** pide que anticipen qué método de pago tendrá más viajes y compruébenlo en el **Laboratorio SQL (Simulación local)**. |
| **75–95 min** · JOIN y agregaciones avanzadas (guiada) | JOIN para traducir códigos, agregación temporal por día | Insiste en la **clave común**: "lee el `ON` como *qué columna de una tabla corresponde a qué columna de la otra*". Muestra el `CAST(... AS DATE)` para agrupar por día y enlázalo con la hoja "Tendencias" de la Sesión 2. |
| **95–110 min** · Vistas | `CREATE VIEW` que encapsula filtros de limpieza | **Mensaje clave:** "una vista guarda la lógica SQL para reutilizarla sin repetir filtros". Di claramente que `CREATE OR REPLACE VIEW` es un ejemplo y **no se ejecuta aquí**. Esta vista (`vw_indicadores`) es la fuente propuesta para el dataset de Quick en la Sesión 2. |
| **110–120 min** · Validación y cierre | Laboratorio SQL + conexión con Quick | Usa el Laboratorio para comprobar en vivo las consultas vistas. Recuerda que una **consulta vacía o no soportada no devuelve resultados** (mensaje de simulación). Cierra anticipando la Sesión 2: "ya tenemos una fuente consultable lista para analizar en Quick". |

### Qué debe llevarse el participante
- Explica el flujo S3 → Glue / Athena con tus palabras.
- Lee e interpreta SELECT, WHERE, COUNT, GROUP BY, ORDER BY, un JOIN y una vista.
- Distingue un ejemplo didáctico de una consulta validada.

---

# Sesión 2 — "Análisis y dashboards en Amazon Quick"

**Duración:** 120 min · **Objetivo global:** que cada participante **construya**
un análisis propio de tres hojas (Resumen ejecutivo, Análisis detallado,
Tendencias) sobre el dataset compartido.

**Conceptos que se tratan:** fuente de datos vs dataset · análisis vs dashboard ·
SPICE vs Direct Query · SQL personalizado · campos/dimensiones/métricas/campos
calculados · KPIs · visualizaciones (KPI, barras, líneas, tabla) · filtros y
controles · las tres hojas de análisis.

### Cronograma y guion

| Tramo | Bloque | Qué decir / cómo contarlo |
|---|---|---|
| **0–15 min** · Conceptos base | Fuente de datos vs dataset; análisis vs dashboard; dónde encaja Quick | Enlaza con el cierre de la Sesión 1: "ya existe una vista/consulta lista en Athena". **Analogías útiles:** la *fuente de datos* es la tubería hacia el origen; el *dataset* es el agua ya filtrada y lista para servir. El *análisis* es el documento en edición; el *dashboard* (Sesión 3) es la versión publicada. **Deja claro:** hoy NO publicamos ni tocamos IAPOL; hoy construimos el análisis. |
| **15–30 min** · Conexión Athena–Quick (demostración) | Fuente de datos configurada y dataset compartido | Lo muestras tú. Enumera los permisos implicados (Quick → Athena → Glue → S3 → ubicación de resultados). **Riesgo operativo nº 1 a mencionar:** si el participante no es *autor* habilitado, el dataset "no aparece" — es un caso de diagnóstico de la Sesión 3. |
| **30–45 min** · SPICE, Direct Query y SQL personalizado (demostración) | Modos de acceso a datos y preparación con SQL | **Regla práctica a decir:** "SPICE para dashboards interactivos y estables; Direct Query cuando la frescura casi en tiempo real es prioritaria". Muestra el SQL personalizado como *preparación del dataset* y recuerda que los filtros de limpieza (distancia > 0, importe ≥ 0) **cambian la población analizada**. |
| **45–65 min** · KPIs y barras (práctica individual) | KPI = métrica + agregación; barras por método de pago | Aquí arranca el núcleo práctico. Cada participante crea los **dos KPIs** (total de viajes, importe total) y el **gráfico de barras** por `payment_type`. Si no tienen acceso de autor real, usan el **Simulador (Simulación local)**. Recuerda: los números cambian con los filtros. |
| **65–85 min** · Filtros, controles y campos calculados (individual) | Filtro de fecha, estado vacío, reset, campo calculado | Muestra en el simulador un rango de fechas que deje **cero registros** para evidenciar el **estado vacío** (no un gráfico sin datos). El **reset de filtros es idempotente**: vuelve siempre al conjunto completo. Aprovecha el campo calculado "importe por pasajero" para hablar de división por cero / calidad de datos. |
| **85–105 min** · Las tres hojas (individual) | Resumen ejecutivo · Análisis detallado · Tendencias | Guía el armado de cada hoja: **Resumen** (2 KPIs + barras por método de pago), **Detalle** (tabla fecha/pasajeros/importe + distancia media), **Tendencias** (viajes por día + distribución por hora de recogida). Explica *por qué* separar en hojas: de lo general a lo específico, según audiencia. |
| **105–120 min** · Verificación y cierre | Lista de verificación del análisis | Revisión cruzada: que un participante revise el análisis de otro. Comprueba que los filtros recalculan, que las agregaciones cuadran con las columnas y que `payment_type` está bien interpretado. Cierra como puente a la Sesión 3 (publicación e IAPOL). |

### Qué debe llevarse el participante
- Un análisis propio de tres hojas con KPIs, gráficos y un filtro de fecha.
- Saber elegir entre SPICE y Direct Query según frescura/rendimiento/costo.
- Entender que cada filtro cambia la población y no representa el total del origen.

---

# Sesión 3 — "Publicación e integración con IAPOL"

**Duración:** 120 min · **Objetivo global:** que cada participante **publique** su
dashboard en Amazon Quick, sepa localizar los identificadores y entienda el
**flujo conceptual** de integración con IAPOL y los problemas frecuentes.

**Conceptos que se tratan:** análisis vs dashboard publicado · publicación en
Quick · Dataset ID / Analysis ID / Dashboard ID · identificadores propios de
IAPOL (`id_portal`, `id_quicksight`) · compartir y validar permisos · flujo
conceptual de integración · visualización embebida · casos de diagnóstico.

### Cronograma y guion

| Tramo | Bloque | Qué decir / cómo contarlo |
|---|---|---|
| **0–20 min** · Análisis vs dashboard publicado | Diferencia y entregable de la sesión | **Analogía:** el análisis es el "documento en edición"; el dashboard es la "versión publicada" que otros consumen. Fija el alcance: los participantes publican **solo en Amazon Quick**; IAPOL se explica. Confirma antes de empezar que cada asistente es **autor habilitado** (si no, usarás demostración). |
| **20–40 min** · Publicación del dashboard (individual) | Publicar en Quick y localizar el Dashboard ID | Revisar las 3 hojas y filtros → publicar con nombre claro → confirmar que aparece en el listado → abrirlo y validar interacción. **Advertencia honesta:** las rutas/botones exactos de la interfaz deben cotejarse con la versión vigente de Quick. Quien no tenga permisos de autor usa la **Simulación local**. |
| **40–55 min** · Identificadores (guiada) | Dataset ID, Analysis ID, Dashboard ID; `id_portal`, `id_quicksight` | **Error común a prevenir:** usar el *Analysis ID* creyendo que es el del dashboard — el embebido suele referenciar el **Dashboard ID**. Sobre `id_portal`/`id_quicksight`: son campos **propios de IAPOL**; su función y correspondencia **deben corroborarse con documentación interna**, no asumirse. |
| **55–75 min** · Compartir y permisos (individual) | Compartir el dashboard y validar acceso | Pide que compartan con un compañero y verifiquen el acceso en vivo (dentro de sus permisos). **Mensaje clave:** el acceso al dashboard depende también del acceso al **dataset** de origen; y **ser lector no habilita publicar ni compartir**. |
| **75–95 min** · Flujo e integración IAPOL (demostración conceptual) | Recorrido publicar → registrar → visibilidad → embebido | Marca con claridad qué es **ejecución** (publicar/compartir en Quick, lo hace el participante) y qué es **explicación** (registro, visibilidad y embebido en IAPOL). **Punto de seguridad conceptual:** copiar una URL o un identificador **NO** habilita por sí solo el embebido en IAPOL. |
| **95–110 min** · Diagnóstico (casos prácticos) | Los 5 casos frecuentes | Recorre los casos: (1) el dataset no aparece para un autor, (2) una visualización no refleja el filtro, (3) sin permisos para compartir/publicar, (4) un dashboard existente que no se ve, (5) no se ve en IAPOL pese a tener el ID. **Cómo decirlo:** presenta **causas posibles**, no un veredicto; cierra siempre con *"confirmar con evidencia del entorno"*. |
| **110–120 min** · Evaluación y cierre | Evaluación final y verificación manual | La evaluación cubre las **seis áreas** (flujo, SQL, tres hojas, filtros, publicación, IAPOL) con umbral orientativo **80/100**. Recuerda que las acciones realizadas **fuera** de la plataforma requieren **verificación manual del instructor**. |

### Qué debe llevarse el participante
- Un dashboard publicado en Quick y su Dashboard ID localizado.
- Distinguir los tres IDs de Quick de los campos propios de IAPOL.
- Saber diagnosticar los 5 problemas frecuentes con causas posibles, sin concluir sin evidencia.

---

## Apoyos dentro de la plataforma (qué herramienta usar en cada momento)

| Herramienta (vista) | Úsala para… | Sesión |
|---|---|---|
| **Diapositivas** + **Modo presentador** | Conducir la teoría con notas privadas, objetivos y temporizador | 1, 2, 3 |
| **Diagrama de arquitectura** (en Laboratorio SQL) | Explicar S3 → Glue/Athena → Quick → IAPOL de forma interactiva | 1 |
| **Explicaciones de SQL** + **Laboratorio SQL** | Interpretar consultas y ver resultados demo | 1 |
| **Simulador** + **Hojas de análisis** | Ensayar KPIs, barras, filtros, estado vacío y las 3 hojas | 2 |
| **Identificadores IAPOL** + **Casos de diagnóstico** (en Recursos) | Explicar IDs y resolver problemas frecuentes | 3 |
| **Evaluación** | Cerrar cada bloque / la capacitación con retroalimentación | 1, 2, 3 |
| **Glosario** y **Centro de recursos** | Consultas rápidas de términos y enlaces oficiales | Transversal |

## Checklist de preparación (antes de cada sesión)
- [ ] Confirmar permisos de los participantes (autor vs lector) en Quick.
- [ ] Tener a mano el diccionario de datos oficial de NYC TLC.
- [ ] Verificar rutas/botones actuales de la consola si vas a mostrar Quick real.
- [ ] Abrir el Modo presentador y probar el temporizador.
- [ ] Recordar en voz alta, al abrir cada Simulación, que es **local y no real**.
