# Cuenta y costos de la práctica (AWS + Amazon Quick)

> **Para qué sirve este documento.** Informa **qué tipo de cuenta** se necesita
> para la capacitación y **cuánto cuesta** la práctica, con un rango **mínimo**
> y **máximo** esperado. Sirve para solicitar la cuenta y aprobar el presupuesto.
>
> **Validez de las cifras.** Precios de **referencia** a **octubre de 2026**,
> región de ejemplo **US East (N. Virginia) · us-east-1**. Los precios de AWS
> **cambian y varían por región**; confirma con la
> [Calculadora de precios de AWS](https://calculator.aws/) y las páginas
> oficiales antes de aprobar un presupuesto. Montos en **USD**, sin impuestos.

---

## 1. Qué cuenta se necesita

### 1.1 Cuenta de AWS (consola)
- **Una (1) cuenta de AWS** para el aula, con acceso a **S3, AWS Glue y Amazon
  Athena** en la región de trabajo.
- **Usuario(s) IAM**: por defecto **uno compartido** por el grupo (aislamiento
  por convención `pNN`). Si se requiere trazabilidad por persona, **un usuario
  IAM por asistente** (ver `docs/permisos-asistentes.md`).
- **No requiere servidores ni bases de datos aprovisionadas**: S3 es
  almacenamiento, Glue es catálogo y Athena es *serverless* (se paga por consulta).

### 1.2 Cuenta / suscripción de Amazon Quick
- **Suscripción de Amazon Quick (Enterprise)** en la misma cuenta/organización.
- **Rol de Autor** para quien construye y publica tableros (en el aula puede ser
  **un autor compartido**). Los consumidores finales solo necesitan **Lector**.
- **Capacidad SPICE**: viene **10 GB incluidos por cada Autor**; suele bastar
  para el aula si los datasets son pequeños.

### 1.3 IAPOL (portal institucional)
- El registro y la visibilidad del tablero en IAPOL **no generan costo de AWS**;
  se gestionan en el portal. Solo se necesita el **Dashboard ID** del tablero
  (campo `id_quicksight`).

---

## 2. Precios unitarios de referencia (oct 2026, us-east-1)

| Servicio | Concepto | Precio de referencia |
|---|---|---|
| **Amazon S3 Standard** | Almacenamiento | **$0.023 / GB-mes** |
| Amazon S3 | Solicitudes de escritura (PUT) | ~**$0.005 / 1.000** |
| Amazon S3 | Solicitudes de lectura (GET) | ~**$0.0004 / 1.000** |
| **Amazon Athena** | Datos escaneados por consulta | **$5.00 / TB** (mín. 10 MB/consulta) |
| Amazon Athena | DDL (CREATE/ALTER/DROP), gestión de particiones, consultas fallidas | **$0.00** |
| **AWS Glue** | Data Catalog (primeras ~1M objetos/solicitudes) | **gratis** |
| AWS Glue | Crawler (opcional) | ~**$0.44 / DPU-hora** (mín. ~10 min) |
| **Amazon Quick** | **Autor** | ~**$24 / mes** (o ~**$18/mes** con compromiso anual) |
| Amazon Quick | **Lector** | ~**$3 / mes** por usuario |
| Amazon Quick | SPICE incluido | **10 GB por Autor** |
| Amazon Quick | SPICE adicional | ~**$0.38 / GB-mes** |

> Fuentes: páginas oficiales de precios de Amazon Athena, Amazon S3 y Amazon
> Quick (consultadas en oct 2026). Contenido reformulado para cumplir las
> restricciones de licencia.

---

## 3. Supuestos de la práctica

- Hasta **10 asistentes**, cada uno con **su propio dataset**.
- Tamaño por dataset: **10 MB – 500 MB** recomendado; **~1 GB** máximo sugerido.
- Formato recomendado **Parquet** (menos datos escaneados en Athena).
- Las **sentencias DDL** (CREATE TABLE, MSCK/ALTER de particiones) **no se cobran**
  en Athena; solo se cobran las consultas `SELECT` por datos escaneados.
- **Amazon Quick** se factura por **mes** (no por día): aunque la práctica dure
  2 días, el Autor se cobra el mes en que esté activo.

---

## 4. Estimación de costo — escenario MÍNIMO

Datasets pequeños en Parquet, consultas acotadas con particiones, **1 autor
compartido** de Quick, SPICE dentro de lo incluido.

| Servicio | Cálculo | Costo |
|---|---|---|
| S3 almacenamiento | ~2 GB totales · $0.023/GB · fracción de mes | **< $0.10** |
| S3 solicitudes | subidas y lecturas de la práctica | **< $0.10** |
| Athena | DDL gratis + pocas consultas de MB (p. ej. 10 consultas × 50 MB ≈ 0.0005 TB × $5) | **< $0.10** |
| Glue | Data Catalog dentro del nivel gratis (+ 1 crawler opcional ≈ $0.07) | **$0.00 – $0.10** |
| Quick Autor | 1 autor · prorrateo del mes | **~$24/mes** (fijo) |
| **Total datos (S3+Athena+Glue)** | | **≈ $0.30 – $1.00** |

**Mínimo esperado:** **menos de ~$1 en servicios de datos** para los 2 días; el
único costo relevante es la **licencia de Autor de Quick (~$24/mes)**, que
además habilita los 10 GB de SPICE.

---

## 5. Estimación de costo — escenario MÁXIMO razonable

Cada asistente ~1 GB, muchas consultas **sin particionar** (escaneos grandes),
SPICE cerca del límite, **1 mes completo** de Quick Autor.

| Servicio | Cálculo | Costo |
|---|---|---|
| S3 almacenamiento | ~10 GB · $0.023/GB-mes | **~$0.25/mes** |
| S3 solicitudes | subidas/actualizaciones intensivas | **< $0.50** |
| Athena | escaneos amplios (p. ej. 200 consultas × 0.5 GB ≈ 0.1 TB × $5) | **~$0.50 – $2.00** |
| Glue | Data Catalog + varios crawlers | **< $1.00** |
| Quick Autor | 1 autor · mes completo | **~$24/mes** |
| Quick SPICE extra (si se excede) | p. ej. +10 GB · $0.38 | **~$3.80/mes** |
| **Total** | | **≈ $30 – $45/mes** |

**Máximo razonable:** **~$30–$45/mes**, **dominado por Quick (Autor + SPICE
extra)**. Los servicios de datos (S3 + Athena + Glue) **rara vez superan unos
pocos dólares** si se usa Parquet y particiones.

> **Fuera de rango (evitar):** escanear repetidamente tablas de varios GB **sin
> particionar** puede disparar Athena (cada TB escaneado = $5). El **límite de
> datos escaneados** por consulta en el workgroup es la red de seguridad.

---

## 6. Palancas para controlar el costo

- **Parquet + particiones** por fecha → Athena escanea (y cobra) menos.
- **Límite de datos escaneados por consulta** en cada workgroup `wg_pNN`.
- **Datasets pequeños** → caben en el SPICE incluido (10 GB por Autor).
- **Direct Query** en lugar de SPICE para datos grandes o muy cambiantes.
- **Dar de baja** autores de Quick y **borrar** datos/recursos del aula al cerrar
  la capacitación (S3 cobra por almacenamiento mientras exista).
- Revisar el **"Data scanned"** por consulta para educar en el costo real.

---

## 7. Resumen ejecutivo

- **Cuenta AWS:** 1 cuenta con S3 + Glue + Athena (serverless, sin servidores).
- **Quick:** suscripción Enterprise con **1 Autor** (compartido) y 10 GB SPICE
  incluidos.
- **Gasto mínimo:** **< $1** en datos para los 2 días + Autor de Quick (~$24/mes).
- **Gasto máximo razonable:** **~$30–$45/mes**, casi todo de Quick.
- **IAPOL:** sin costo de AWS; requiere el Dashboard ID.

> Todas las cifras son de **referencia (oct 2026, us-east-1)** y deben validarse
> con la Calculadora de precios de AWS y las páginas oficiales antes de aprobar
> el presupuesto.
