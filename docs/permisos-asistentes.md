# Permisos necesarios para los asistentes (AWS Console + Amazon Quick)

> **Para qué sirve este documento.** Es la referencia de los permisos que debe
> tener cada asistente —en su cuenta de la **consola de AWS** y en **Amazon
> Quick**— para completar las dos sesiones prácticas: **subir, actualizar,
> agregar, consultar** datos y **construir/publicar** tableros.
>
> **Importante (honestidad técnica).** Las políticas de abajo son **ejemplos de
> referencia (nivel mínimo viable)**; los nombres de recurso (bucket, base,
> workgroup, región, cuenta) y las acciones exactas **deben validarse contra el
> entorno real** antes de aplicarlas. Ajústalas a la política de seguridad de la
> organización (principio de mínimo privilegio).

---

## 1. Modelo del aula (contexto)

- **Una sola cuenta AWS** y, por defecto, **un usuario IAM compartido** por el
  grupo (hasta ~10 asistentes). El aislamiento entre personas se logra por
  **convención de nombres con el prefijo `pNN`** (p01…p10), no por permisos
  separados.
- **Amazon Quick** con rol de **AUTOR** (no basta con lector). En el aula el
  autor puede ser compartido por el grupo.
- Recursos y convenciones que se usan en las sesiones:

| Recurso | Valor de ejemplo |
|---|---|
| Bucket de datos/resultados | `s3://capacitacion-iapol/` |
| Prefijo de datos (por persona) | `capacitacion-iapol/pNN/datos/` |
| Prefijo de resultados Athena (por persona) | `capacitacion-iapol/pNN/resultados/` |
| Base de datos en Glue (por persona) | `cap_pNN` |
| Workgroup de Athena (por persona) | `wg_pNN` |
| Región | la de trabajo del aula (p. ej. `us-east-1`) |

> **Advertencia de trazabilidad.** Con cuenta e IAM compartidos **no hay
> trazabilidad por persona** (CloudTrail no distingue quién hizo qué) y en Quick
> **todos ven/editan** los análisis de todos. Mitigación: respetar el prefijo
> `pNN` y nombrar datasets/análisis con el `pNN` (p. ej. `p03 - ventas`).
> Si la organización exige trazabilidad individual, usar **un usuario IAM por
> asistente** (ver §6).

---

## 2. Qué hace el asistente y qué permiso lo habilita

| Acción del asistente (sesión) | Servicio | Permisos clave |
|---|---|---|
| **Subir / actualizar / agregar** archivos de datos a su prefijo | Amazon S3 | `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`, `s3:ListBucket` |
| Crear su **base de datos** y **tablas** en el catálogo | AWS Glue | `glue:CreateDatabase`, `glue:CreateTable`, `glue:UpdateTable`, `glue:GetDatabase(s)`, `glue:GetTable(s)`, `glue:GetPartition(s)`, `glue:BatchCreatePartition` |
| **Crawler** que infiere el esquema | AWS Glue | `glue:CreateCrawler`, `glue:StartCrawler`, `glue:GetCrawler` + rol IAM del crawler con lectura de S3 |
| Crear/usar su **workgroup** y **consultar** (DDL + SELECT) | Amazon Athena | `athena:StartQueryExecution`, `athena:GetQueryExecution`, `athena:GetQueryResults`, `athena:StopQueryExecution`, `athena:CreateWorkGroup`, `athena:GetWorkGroup`, `athena:ListWorkGroups` |
| Escribir **resultados** de consulta en S3 | Amazon S3 | `s3:PutObject`, `s3:GetObject`, `s3:ListBucket` sobre el prefijo `resultados/` |
| Crear **dataset**, **análisis** y **publicar dashboard** | Amazon Quick | rol **Autor**; permisos de dataset/análisis/dashboard |
| **Registrar/visibilidad** del tablero en **IAPOL** | IAPOL (portal) | fuera de IAM/AWS: lo gestiona el administrador del portal |

---

## 3. AWS Console — Política IAM de ejemplo (mínimo viable)

Esta política concede lo necesario para **S3 + Glue + Athena** con aislamiento
por `pNN`. Reemplaza `REGION`, `ACCOUNT_ID` y, si quieres restringir por persona,
cambia `p*` por el `pNN` concreto (p. ej. `p03`).

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3ListarBucketDelAula",
      "Effect": "Allow",
      "Action": ["s3:ListBucket", "s3:GetBucketLocation"],
      "Resource": "arn:aws:s3:::capacitacion-iapol",
      "Condition": {
        "StringLike": {
          "s3:prefix": ["", "p*", "p*/*"]
        }
      }
    },
    {
      "Sid": "S3LeerEscribirEnPrefijosDelAula",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::capacitacion-iapol/p*/*"
    },
    {
      "Sid": "GlueCatalogoLecturaGeneral",
      "Effect": "Allow",
      "Action": [
        "glue:GetDatabase",
        "glue:GetDatabases",
        "glue:GetTable",
        "glue:GetTables",
        "glue:GetPartition",
        "glue:GetPartitions"
      ],
      "Resource": "*"
    },
    {
      "Sid": "GlueCrearYActualizarTablasYBases",
      "Effect": "Allow",
      "Action": [
        "glue:CreateDatabase",
        "glue:CreateTable",
        "glue:UpdateTable",
        "glue:DeleteTable",
        "glue:BatchCreatePartition",
        "glue:CreatePartition",
        "glue:BatchGetPartition"
      ],
      "Resource": [
        "arn:aws:glue:REGION:ACCOUNT_ID:catalog",
        "arn:aws:glue:REGION:ACCOUNT_ID:database/cap_p*",
        "arn:aws:glue:REGION:ACCOUNT_ID:table/cap_p*/*"
      ]
    },
    {
      "Sid": "AthenaConsultasYWorkgroup",
      "Effect": "Allow",
      "Action": [
        "athena:StartQueryExecution",
        "athena:StopQueryExecution",
        "athena:GetQueryExecution",
        "athena:GetQueryResults",
        "athena:GetQueryResultsStream",
        "athena:ListQueryExecutions",
        "athena:CreateWorkGroup",
        "athena:GetWorkGroup",
        "athena:ListWorkGroups",
        "athena:UpdateWorkGroup",
        "athena:GetDataCatalog",
        "athena:ListDataCatalogs"
      ],
      "Resource": "*"
    }
  ]
}
```

### Variante por persona (más estricta)

Para un usuario IAM por asistente, reemplaza en los `Sid` de S3/Glue los
comodines `p*` / `cap_p*` por el identificador concreto, por ejemplo:

- `arn:aws:s3:::capacitacion-iapol/p03/*`
- `arn:aws:glue:REGION:ACCOUNT_ID:database/cap_p03`
- `arn:aws:glue:REGION:ACCOUNT_ID:table/cap_p03/*`

### (Opcional) Permisos para Crawler de Glue

Si se usa el Crawler, añade a la política del **usuario**:

```json
{
  "Sid": "GlueCrawler",
  "Effect": "Allow",
  "Action": [
    "glue:CreateCrawler",
    "glue:StartCrawler",
    "glue:GetCrawler",
    "glue:GetCrawlers",
    "iam:PassRole"
  ],
  "Resource": "*"
}
```

Y crea un **rol IAM para el Crawler** cuya política de permisos permita
`s3:GetObject`/`s3:ListBucket` sobre `capacitacion-iapol/p*/datos/*` y las
acciones de Glue sobre `cap_p*`. El `iam:PassRole` debe acotarse al ARN de ese
rol. (Ejemplo; validar contra la política de la organización.)

---

## 4. Amazon Quick — Permisos y rol

En Quick los permisos tienen **dos planos**: el **rol** del usuario y los
**permisos del recurso** (dataset / análisis / dashboard).

1. **Rol: Autor (o Admin).** El asistente debe ser **Autor** para crear datasets,
   construir análisis y publicar dashboards. Un **Lector** solo visualiza: no
   puede crear ni publicar.

2. **Conexión a los orígenes.** Quick debe tener permiso para leer de **Athena**,
   **Glue** y **S3** (tanto el prefijo de datos como el de **resultados** de
   Athena). Esto se habilita en **Manage Quick → Security & permissions**,
   seleccionando el bucket `capacitacion-iapol` (datos y resultados). Sin este
   permiso, el dataset "no aparece" o la validación contra Athena falla — es el
   fallo nº 1 al crear el dataset.

3. **Acciones que realiza el asistente y permiso que las habilita:**

| Acción en Quick | Lo habilita |
|---|---|
| Crear **dataset** desde Athena (workgroup `wg_pNN`) | Rol Autor + permisos Quick→Athena/Glue/S3 |
| Elegir **SPICE** o **Direct Query** | Rol Autor (SPICE consume capacidad compartida) |
| Crear/editar **análisis** (KPIs, barras, líneas, tabla, filtros) | Rol Autor + permiso de propietario/colaborador sobre el análisis |
| **Publicar** el dashboard y obtener el **Dashboard ID** | Rol Autor |
| **Compartir** dashboard/dataset con usuarios o grupos | Ser propietario del recurso (un lector no puede compartir) |
| **Actualizar/refrescar** SPICE | Rol Autor + propiedad del dataset |

> **Nota de capacidad.** SPICE es compartido por el grupo: vigilar el consumo
> total. Para datasets grandes o que cambian seguido, preferir **Direct Query**.

> **Embedding.** Copiar la URL o el Dashboard ID **no** habilita por sí solo el
> embebido. El embedding requiere configuración adicional (dominios permitidos,
> políticas) **y** el registro institucional en IAPOL (§5).

---

## 5. IAPOL — Registro y visibilidad del tablero (no es IAM)

El registro del tablero en IAPOL **no se gobierna con permisos de AWS**; lo
realiza el **administrador del portal**. Lo que el asistente necesita:

- El **Dashboard ID** de su tablero de Quick (se registra en IAPOL bajo el campo
  **`id_quicksight`**).
- Que el administrador de IAPOL **registre el recurso**, asocie **módulo/
  submódulo** y configure la **visibilidad** por usuario/rol.
- Que el **embedding** esté habilitado del lado de Quick (dominios/políticas).

> Rutas, botones y nombres exactos de IAPOL **deben cotejarse con el portal
> vigente**; `id_portal` es interno de IAPOL y no debe confundirse con
> `id_quicksight`.

---

## 6. Checklist de aprovisionamiento (antes de la sesión)

**Cuenta AWS (consola)**
- [ ] Bucket `capacitacion-iapol` creado, con prefijos `pNN/datos/` y `pNN/resultados/`.
- [ ] Usuario(s) IAM con la política de §3 adjunta (compartido o uno por `pNN`).
- [ ] Región de trabajo confirmada y comunicada al grupo.
- [ ] (Opcional) Rol IAM del Crawler creado y `iam:PassRole` acotado.
- [ ] Límite de datos escaneados por consulta en los workgroups (control de costo).

**Amazon Quick**
- [ ] Cada asistente (o el autor compartido) tiene rol **Autor**.
- [ ] En **Security & permissions**, Quick tiene acceso a **Athena**, **Glue** y al bucket `capacitacion-iapol` (datos **y** resultados).
- [ ] Capacidad **SPICE** suficiente para el grupo.

**IAPOL**
- [ ] Contacto del administrador del portal identificado para el registro del `id_quicksight`.
- [ ] Confirmado que el **embedding** está habilitado para los dashboards del aula.

---

## 7. Diagnóstico rápido de permisos

| Síntoma | Causa probable (permisos) |
|---|---|
| Athena no ejecuta / "no result location" | Falta ubicación de resultados o `s3:PutObject` en `pNN/resultados/` |
| DDL falla "bucket does not exist" | LOCATION mal escrita o sin datos; no es permiso, es ruta |
| `SELECT` da 0 filas tras particionar | Falta registrar particiones (MSCK/ALTER), no permisos |
| En Quick el dataset "no aparece" | Falta permiso Quick→Athena/Glue/S3, o el usuario no es Autor |
| No se puede compartir/publicar en Quick | Rol Lector (no Autor) o no es propietario del recurso |
| No se ve embebido en IAPOL pese a tener el ID | Registro/visibilidad en IAPOL o embedding no habilitado (no es IAM de AWS) |

> Regla de soporte: confirma con **evidencia del entorno** (política efectiva,
> estado del recurso, configuración de Quick) antes de concluir. Si persiste,
> escala al instructor/administrador con el `pNN`, el servicio y el error exacto.

---

## 8. Gasto esperado (mínimo y máximo) — resumen

> Estimación de referencia para el aula (hasta ~10 asistentes), región de ejemplo
> **us-east-1**, precios de **octubre 2026**. El detalle y los supuestos están en
> **`docs/costos-y-cuenta.md`**.

| Escenario | Gasto esperado |
|---|---|
| **Mínimo** (datasets pequeños en Parquet, 1 autor compartido, SPICE incluido, práctica de 2 días) | **≈ USD 2–5** en servicios de datos (S3 + Athena + Glue), prorrateado por los días de uso. El autor de Quick es el costo fijo relevante. |
| **Máximo razonable** (cada quien ~1 GB, muchas consultas sin particionar, SPICE cerca del límite, 1 mes de Quick Autor) | **≈ USD 30–45/mes**, dominado por la licencia de **Autor de Quick (~$24/mes)**; los datos (S3+Athena) rara vez pasan de unos pocos dólares. |

**Palancas de ahorro:** usar **Parquet** y **particiones** (Athena escanea menos),
fijar **límite de datos escaneados** por consulta en el workgroup, mantener
datasets **pequeños** (SPICE incluido), y **dar de baja** autores/recursos al
terminar la capacitación.
