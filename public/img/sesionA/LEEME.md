# Capturas de la Sesión A (AWS end-to-end + IAPOL)

Coloca aquí los PNG del paso a paso. Mientras no existan, la plataforma muestra
un marcador con la descripción y la ruta destino (no se rompe el render).

Anonimiza las capturas: tapa número de cuenta, ARNs, correos y nombres propios.

## Archivos esperados (nombre exacto → qué debe mostrar)

> Nota: el laboratorio es GENERAL. Un solo bucket con una carpeta por
> participante: `s3://capacitacion-iapol/pNN/datos/` y `.../pNN/resultados/`
> (p01…p10), con base de Glue `cap_pNN`. Cuenta AWS, IAM y autor de Quick son
> compartidos por el grupo. El NYC Taxi es solo el ejemplo de referencia.

| Archivo | Qué capturar |
|---|---|
| `s3-bucket-prefijos.png` | Consola de S3: carpeta de datos del participante (`pNN/datos/`). |
| `s3-objetos-parquet.png` | Listado de objetos de datos (`.parquet`/`.csv`/`.json`) dentro del prefijo. |
| `glue-crear-base.png` | AWS Glue → Databases → Add database (base `cap_pNN`). |
| `glue-crawler.png` | Configuración del Crawler apuntando al prefijo de datos. |
| `athena-workgroup.png` | Athena → Workgroups → Create, con la Query result location. |
| `athena-create-table.png` | Editor de Athena con el `CREATE EXTERNAL TABLE` ejecutado. |
| `athena-MSCK.png` | `MSCK REPAIR TABLE` ejecutado y `SHOW PARTITIONS` listando particiones. |
| `athena-scanned.png` | Pestaña Query stats con el "Data scanned" menor al filtrar por partición. |
| `athena-vista.png` | Editor de Athena con el `CREATE OR REPLACE VIEW` ejecutado. |
| `athena-vista-preview.png` | `SELECT` sobre `vw_indicadores` mostrando filas. |
| `quick-dataset-athena.png` | Quick → New dataset → Athena (elegir workgroup). |
| `quick-elegir-vista.png` | Selección de la vista/tabla propia como fuente. |
| `quick-anatomia.png` | Interfaz del análisis: campos (dimensiones/medidas), tipos de visual y la hoja. |
| `quick-campo-calculado.png` | Editor de campo calculado (ejemplo genérico con ifelse). |
| `quick-kpi.png` | Visual KPI mostrando una cifra única con su agregación. |
| `quick-barras.png` | Gráfico de barras: una dimensión en el eje y una medida en el valor. |
| `quick-lineas.png` | Gráfico de líneas: una fecha en el eje temporal y una medida. |
| `quick-tabla.png` | Visual de tabla con varias columnas del dataset. |
| `quick-filtro.png` | Panel de filtros y un control sobre la hoja. |
| `quick-guardar.png` | Diálogo de guardado del análisis (nombre con el pNN). |
| `quick-publicar.png` | Diálogo de publicación del dashboard. |
| `quick-dashboard-id.png` | Dashboard publicado con el Dashboard ID visible (anonimizado). |
| `quick-compartir.png` | Panel de compartir (usuarios/grupos + nivel). |
| `iapol-admin-registro.png` | Interfaz administrativa de IAPOL para registrar el recurso. |
| `iapol-id-quicksight.png` | Formulario con el Dashboard ID pegado en `id_quicksight`. |
| `iapol-visibilidad.png` | Configuración de módulo/submódulo y visibilidad. |
| `iapol-embebido-ok.png` | Tablero visualizándose embebido dentro de IAPOL. |

Formato recomendado: PNG, ancho ~1200–1600 px, relación apaisada.
