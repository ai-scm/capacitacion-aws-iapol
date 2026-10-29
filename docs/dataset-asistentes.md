# Dataset que debe traer cada asistente (requisitos para la práctica)

> **Para qué sirve este documento.** Define **qué datos debe llevar cada
> asistente** para los laboratorios de las Sesiones 1 y 2. En esta capacitación
> el caso práctico se trabaja sobre un **dataset real de IAPOL que cada
> participante aporta**, no sobre un conjunto de ejemplo genérico. El objetivo es
> que el dataset permita ejecutar el flujo completo: **subir a S3 → catalogar en
> Glue → consultar en Athena → analizar y publicar en Amazon Quick**.
>
> **Honestidad técnica.** Los nombres de columnas, tipos y valores codificados de
> tu dataset **deben confirmarse contra su diccionario/origen real** antes del
> laboratorio. Cualquier filtro que apliques (p. ej. descartar montos negativos)
> **cambia la población analizada** y no representa la totalidad del origen.

---

## 1. Idea en una frase

Trae **al menos un dataset** que combine **fechas/horas**, **al menos una
categoría** para agrupar y **al menos una métrica numérica** para sumar o
promediar. Con eso podrás construir las **tres hojas** del análisis (Resumen
ejecutivo, Análisis detallado y Tendencias) que se piden en la Sesión 2.

---

## 2. Columnas por tipo (lo que el dataset debe permitir)

No importan los nombres exactos (cada dominio es distinto): importa que existan
columnas de estos **tipos**, porque cada una habilita una parte concreta de la
práctica.

### 2.1 Obligatorias (mínimo viable)

| Tipo de columna | Para qué se usa en la práctica | Ejemplos de nombre |
|---|---|---|
| **Fecha** | Agrupar por día, filtro de fecha, hoja *Tendencias* | `fecha`, `fecha_registro`, `fecha_evento` |
| **Categórica (dimensión)** | `GROUP BY`, gráfico de **barras**, segmentación | `tipo`, `estado`, `categoria`, `dependencia` |
| **Numérica (métrica)** | KPIs: `SUM`, `AVG`, `COUNT` | `monto`, `cantidad`, `duracion`, `valor` |

Con estas tres ya se puede armar el análisis completo:

- **KPI** = una métrica + una agregación (p. ej. `SUM(monto)` → "importe total").
- **Barras** = una categórica contra una métrica (p. ej. `estado` vs conteo).
- **Tendencia** = la fecha agrupada por día contra una métrica.

### 2.2 Recomendadas (enriquecen el análisis)

| Tipo de columna | Para qué suma | Ejemplos |
|---|---|---|
| **Hora / timestamp** | Distribución por hora (extraer la hora de un timestamp) | `fecha_hora`, `timestamp_evento` |
| **Identificador** | Conteos distintos (`COUNT(DISTINCT ...)`) y clave para **JOIN** | `id`, `id_registro`, `id_caso` |
| **Segunda categórica** | Cruces y filtros combinados | `municipio`, `canal`, `prioridad` |

### 2.3 Opcionales — nivel avanzado

| Tipo de columna | Para qué suma | Nota |
|---|---|---|
| **Latitud / longitud** | **Mapas** en Quick (visualización geoespacial) | Solo si tu dataset tiene coordenadas; en Quick el campo debe quedar tipado como **geoespacial** (lat/long). No es obligatorio. |
| **Columnas adicionales** (texto, booleanos, montos secundarios) | Campos calculados, filtros extra | Útiles para practicar *campos calculados* y limpieza de datos. |

> **Sobre lat/long.** Son excelentes para "subir de nivel" con un mapa, pero se
> marcan como **opcionales**: no todos los datasets institucionales tienen
> geolocalización, y el mapa requiere que el campo esté correctamente tipado.

---

## 3. Niveles de preparación (elige según tu objetivo)

### Nivel básico — recomendado para todos
- **1 dataset** con las columnas obligatorias de §2.1.
- Formato **Parquet** de preferencia (Athena escanea menos → más rápido y barato).
  CSV también funciona para empezar.
- Tamaño: **~50–100 MB** es más que suficiente para toda la práctica.

### Nivel intermedio — practicar JOIN
- **2 o 3 datasets relacionables por una clave común** (un `id` compartido o un
  código que una tabla "traduce"). Esto habilita el ejercicio de **JOIN** de la
  Sesión 1 (p. ej. una tabla de hechos + una tabla de catálogo que explica los
  códigos).
- Cada archivo **< 250 MB**.

### Nivel avanzado — mapas y/o volumen
- Dataset con **lat/long** para construir un **mapa** en Quick, **o** varios
  datasets de mayor tamaño.
- **Cuidado con el espacio compartido:** en el aula SPICE es **compartido** (10 GB
  incluidos por Autor, repartidos entre los asistentes). Vigila que la **suma** de
  todos los datasets cargados en SPICE no agote la capacidad. Para datos grandes o
  que cambian seguido, usa **Direct Query** en lugar de SPICE.

> **Regla práctica de tamaño.** Si dudas, trae menos datos y mejor estructurados:
> para aprender el flujo no necesitas millones de filas. Un subconjunto
> representativo (decenas de miles de filas) basta y mantiene costos y tiempos bajos.

---

## 4. Formato y calidad (antes de subir a S3)

- **Formato:** Parquet (ideal) o CSV con encabezados claros. Evita Excel (`.xlsx`)
  directo; expórtalo a CSV/Parquet.
- **Codificación de texto:** UTF-8, para no romper acentos y ñ.
- **Encabezados:** nombres de columna sin espacios ni caracteres raros (usa
  `snake_case`: `fecha_registro`, no `Fecha Registro`).
- **Tipos consistentes:** una columna numérica no debe mezclar texto; una fecha
  debe tener un formato uniforme (preferible ISO `AAAA-MM-DD` o
  `AAAA-MM-DD HH:MM:SS`).
- **Valores codificados:** si usas códigos (p. ej. `estado = 1,2,3`), trae su
  **diccionario** para interpretarlos y, si quieres, una **segunda tabla** de
  catálogo para el JOIN.
- **Nulos:** identifica columnas con muchos vacíos; se mencionarán al validar tipos.

---

## 5. Datos sensibles (importante)

- **No traigas datos personales ni confidenciales reales** si no están
  autorizados para la capacitación. Si tu dataset de IAPOL contiene información
  sensible, **anonimiza o usa un subconjunto no sensible** para la práctica.
- No coloques claves, tokens ni credenciales dentro de los archivos de datos.
- Respeta la política de datos de IAPOL sobre qué puede salir a un entorno de
  capacitación.

> Referencia: ver también las consideraciones de seguridad y costos en
> `docs/costos-y-cuenta.md` y `docs/permisos-asistentes.md`.

---

## 6. Checklist del asistente (antes de la sesión)

- [ ] Tengo **al menos 1 dataset** con: una columna de **fecha**, una
      **categórica** y una **métrica numérica** (§2.1).
- [ ] (Recomendado) Tiene **hora/timestamp** y un **identificador**.
- [ ] Está en **Parquet o CSV**, UTF-8, con encabezados en `snake_case`.
- [ ] Tipos **consistentes** (números, fechas y texto bien separados).
- [ ] Tengo el **diccionario** de cualquier columna codificada.
- [ ] Tamaño razonable (**básico:** ~50–100 MB).
- [ ] (Intermedio) Llevo **2–3 tablas relacionables** por una clave para el **JOIN**.
- [ ] (Avanzado) Si quiero **mapa**, mi dataset tiene **lat/long**; vigilo el
      **espacio SPICE compartido**.
- [ ] Mis datos **no** incluyen información sensible sin autorización.

---

## 7. Cómo se conecta con las sesiones

| Lo que trae el asistente | Dónde se usa |
|---|---|
| Fecha + métrica | KPIs y hoja *Tendencias* (Sesión 2) · `GROUP BY`/`ORDER BY` (Sesión 1) |
| Categórica | Gráfico de **barras** y filtros (Sesión 2) · `GROUP BY` (Sesión 1) |
| Timestamp | Distribución **por hora** (Sesión 2) · `CAST(... AS DATE)` (Sesión 1) |
| Identificador / 2ª tabla | Ejercicio de **JOIN** (Sesión 1) |
| Lat/long (opcional) | **Mapa** avanzado en Quick (Sesión 2, nivel avanzado) |
| Dataset publicado | **Dashboard** y Dashboard ID (Sesión 3) |

> **Recordatorio.** La plataforma local (Laboratorio SQL y Simulador) es un
> recurso **pedagógico** marcado como *Simulación local*: no sube ni consulta tu
> dataset real. El trabajo con tus datos reales ocurre en **tu cuenta de AWS y
> Amazon Quick**, con los permisos descritos en `docs/permisos-asistentes.md`.
