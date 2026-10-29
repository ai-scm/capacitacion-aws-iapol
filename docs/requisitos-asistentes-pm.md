# Qué se requiere de los asistentes — resumen para PM

> Resumen ejecutivo de lo que cada asistente debe tener listo **antes** de la
> capacitación práctica de AWS (S3, Athena, Glue) y Amazon Quick. Pensado para
> coordinación/PM; el detalle técnico está en los documentos referenciados.

---

## 1. Un dataset propio para la práctica

Cada asistente trae **un dataset real de IAPOL** (ya no se usa un conjunto de
ejemplo). Es el insumo con el que harán todo el ejercicio: subirlo, consultarlo y
construir un tablero.

**Mínimo que debe tener el dataset (por tipo de columna):**

- Una columna de **fecha** (para tendencias y filtros de tiempo).
- Una columna **categórica** (para agrupar y hacer gráficos de barras).
- Una columna **numérica** (para los indicadores: total, promedio, conteo).

**Recomendado (mejora el resultado):** una columna de **hora/timestamp** y un
**identificador**.

**Opcional / nivel avanzado:** columnas de **latitud y longitud** si quieren
construir un **mapa**.

**Formato y tamaño:**

- Preferible **Parquet** (o CSV), codificación UTF-8, encabezados simples.
- **Básico:** 1 dataset de ~**50–100 MB** (suficiente para toda la práctica).
- **Intermedio:** 2–3 tablas relacionables por una clave común (para practicar
  cruces/JOIN).
- **Avanzado:** datasets más grandes o con mapa, cuidando el espacio compartido.

**Importante — datos sensibles:** no traer información personal o confidencial sin
autorización. Si el dataset es sensible, usar un subconjunto anonimizado o no
sensible.

> Detalle completo: `docs/dataset-asistentes.md`.

---

## 2. Accesos y permisos (los gestiona el administrador de la cuenta)

Para que el asistente pueda ejecutar la práctica, su usuario necesita:

- **Rol de Autor en Amazon Quick** (un rol de solo lector **no** sirve: no permite
  crear ni publicar tableros).
- **Permisos de trabajo sobre AWS**: Amazon S3, AWS Glue y Amazon Athena (subir
  datos, catalogar tablas y ejecutar consultas).
- **Conexión de Quick a los orígenes** (Athena, Glue y S3) habilitada por el
  administrador.

> Estos permisos **no los configura el asistente**: los provee el administrador de
> la cuenta antes de la sesión.
> Detalle y solicitud lista para enviar: `docs/permisos-asistentes.md` y
> `docs/solicitud-usuario-permisos.md`.

---

## 3. Costo relevante (para presupuesto)

- El costo fijo a considerar es la **licencia de Autor de Amazon Quick (~USD 24/mes)**.
- Los servicios de datos (S3 + Athena + Glue) suelen ser **unos pocos dólares**
  durante la práctica.

> Detalle y supuestos: `docs/costos-y-cuenta.md`.

---

## 4. Checklist rápido (por asistente)

- [ ] Dataset propio con **fecha + categórica + métrica numérica**.
- [ ] En **Parquet/CSV**, UTF-8, tamaño razonable (~50–100 MB en el caso básico).
- [ ] Diccionario de cualquier columna codificada (si aplica).
- [ ] Sin datos sensibles no autorizados.
- [ ] Usuario con **rol Autor en Quick** y permisos de **S3/Glue/Athena**.
- [ ] (Opcional) Lat/long si se quiere un mapa; tablas adicionales si se quiere JOIN.

---

## 5. Nota de alcance

La plataforma local de la capacitación es un **recurso pedagógico** (simulaciones
marcadas como tales): **no** ejecuta operaciones reales en AWS ni en IAPOL. El
trabajo con los datos reales ocurre en la cuenta de AWS y Amazon Quick de la
organización, con los permisos indicados.
