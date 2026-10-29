# Correo — Requisitos para los asistentes (capacitación AWS + Amazon Quick + Analítica Geoespacial)

> Borrador listo para enviar por correo a los asistentes (o al PM para su reenvío).

---

**Para:** [asistentes / lista de la capacitación]
**CC:** [PM / coordinación]
**Asunto:** Qué debes preparar para la capacitación práctica (dataset y accesos)

Hola a todas y todos:

Para aprovechar al máximo la capacitación práctica de AWS (S3, Athena, Glue),
Amazon Quick y la Analítica Geoespacial, les pedimos tener listo lo siguiente
**antes** de la sesión.

## 1. Traer un dataset propio

Cada asistente debe traer **un dataset** con el que realizará los ejercicios. Como
mínimo, el dataset debe incluir:

- Una columna de **fecha** (para análisis de tendencias y filtros de tiempo).
- Una columna **categórica** (para agrupar y hacer gráficos de barras).
- Una columna **numérica** (para los indicadores: total, promedio, conteo).

De ser posible, que también tenga una columna de **hora/fecha-hora** y un
**identificador**.

**Si traen datos para la actividad de mapas (Analítica Geoespacial):** el dataset
debe incluir **latitud y longitud**, ya que cada registro necesita esas
coordenadas para ubicarse en el mapa.

## 2. Formatos admitidos (importante)

Los formatos dependen de la actividad:

- **Primera actividad (consulta de datos en Athena):** como mínimo **Parquet**
  (recomendado) o **CSV**; también se admite **JSON por líneas (JSONL)**.
  *Nota:* Excel (**XLSX**) no se puede consultar directamente en Athena; si solo
  tienen Excel, conviértanlo a **CSV o Parquet** antes de la sesión.

- **Segunda actividad (Analítica Geoespacial / mapas):** se admiten **JSON,
  GeoJSON, CSV y XLS**, y cada registro debe tener **latitud y longitud**.

Recomendaciones de tamaño: idealmente entre **10 MB y 500 MB** por persona
(preferible Parquet para la primera actividad). Si el dataset es muy grande o
cambia con frecuencia, coméntennoslo para orientarlos.

## 3. Datos sensibles

Por favor **no traigan información personal o confidencial sin autorización**. Si
su dataset es sensible, usen un **subconjunto anonimizado o no sensible** para la
práctica.

## 4. Si no tienen un dataset

No hay problema: **si llegan a la práctica sin un dataset, les compartiremos en el
momento los recursos necesarios** para realizar la actividad. Aun así, si pueden
traer datos propios, el ejercicio será más cercano a su trabajo real.

## 5. Accesos

Los permisos de las cuentas (rol de **Autor** en Amazon Quick y acceso a
S3/Glue/Athena) **los gestionamos nosotros** antes de la sesión; no requieren
configurarlos por su cuenta.

---

### Resumen rápido (checklist)

- [ ] Un dataset con **fecha + categoría + valor numérico**.
- [ ] Si harán **mapas**: el dataset incluye **latitud y longitud**.
- [ ] Formato correcto: **Parquet/CSV** (Athena) · **JSON/GeoJSON/CSV/XLS** (mapas).
- [ ] XLSX convertido a CSV/Parquet para la primera actividad.
- [ ] Sin datos sensibles no autorizados.
- [ ] ¿Sin dataset? Tranquilo: se entregan recursos en la práctica.

Cualquier duda sobre el formato o el contenido de su dataset, escríbannos antes de
la sesión y los apoyamos.

Saludos,
[tu nombre] — [equipo / contacto]
