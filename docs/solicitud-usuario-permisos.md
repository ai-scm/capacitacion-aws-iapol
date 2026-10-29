# Solicitud de usuario y permisos para la capacitación (AWS + Amazon Quick)

> **Para qué sirve este documento.** Es el **mensaje listo para enviar** (correo
> o ticket) al administrador de la cuenta de AWS / Amazon Quick, pidiendo la
> creación y administración del **usuario de la capacitación** con los permisos
> necesarios sobre **S3, Athena, Glue y Quick**.
>
> **Punto clave.** Todavía **no se crea ningún recurso concreto** (buckets,
> bases de Glue, workgroups, datasets ni tableros): eso lo harán los asistentes
> **durante la práctica**. Por eso se piden **permisos amplios** sobre esos
> servicios —sin acotar aún a nombres/prefijos específicos—, para no bloquear la
> sesión. El endurecimiento por nombre/prefijo se hará después, si aplica (ver
> `docs/permisos-asistentes.md`).

---

## Mensaje para enviar

**Asunto:** Solicitud de usuario y permisos para la capacitación práctica de AWS (S3, Athena, Glue) y Amazon Quick

Hola [nombre del administrador]:

Para la capacitación práctica de AWS y Amazon Quick necesitamos que se **cree y
administre un usuario** con el que los asistentes harán los laboratorios. Durante
la práctica ellos mismos **crearán los recursos** (carpetas en S3, bases de datos
y tablas en Glue, workgroups y consultas en Athena, y datasets/análisis/tableros
en Quick), así que **todavía no hay nombres de recursos definidos**.

Por eso pedimos, por ahora, **permisos amplios sobre esos servicios** (no acotados
a recursos específicos), para que el usuario pueda **crear, subir, actualizar,
agregar, consultar y administrar** lo que la práctica requiera. Más adelante
podemos restringirlos por nombre/prefijo si la política de seguridad lo exige.

**1) Cuenta de AWS (consola) — usuario IAM**

- Un (1) usuario IAM para la capacitación (puede ser **compartido** por el grupo,
  o uno por asistente si se requiere trazabilidad individual).
- Acceso a la **consola** de AWS en la región de trabajo: **[región, p. ej. us-east-1]**.
- Permisos **amplios** sobre:
  - **Amazon S3**: crear/usar buckets y prefijos; subir, leer, actualizar y
    borrar objetos; listar.
  - **AWS Glue (Data Catalog)**: crear/editar bases de datos y tablas; gestionar
    particiones; (opcional) crear y ejecutar **crawlers** —esto último requiere
    un **rol IAM para el crawler** y permiso de `iam:PassRole` acotado a ese rol.
  - **Amazon Athena**: crear/usar **workgroups**, ejecutar **DDL** y consultas
    **SELECT**, y leer/escribir la **ubicación de resultados** en S3.

- Si prefieren partir de permisos administrados de AWS como base temporal,
  servirían (a validar con su política de seguridad):
  `AmazonS3FullAccess`, `AWSGlueConsoleFullAccess` y `AmazonAthenaFullAccess`.
  Si no permiten políticas *FullAccess*, adjuntamos una política de ejemplo con
  el detalle de acciones en `docs/permisos-asistentes.md` (sección 3).

**2) Amazon Quick**

- Suscripción de **Amazon Quick (Enterprise)** en la misma cuenta.
- El usuario debe tener rol de **Autor** (o Admin), para poder **crear datasets,
  construir análisis y publicar tableros**. Un rol de Lector **no** basta.
- Habilitar el acceso de Quick a los orígenes en **Manage Quick → Security &
  permissions**: **Athena**, **AWS Glue** y **Amazon S3** (tanto los datos como
  el prefijo de **resultados** de Athena).
- **SPICE**: con la capacidad **incluida por Autor (10 GB)** debería bastar para
  el aula; avisaremos si se necesita ampliar.

**3) Notas**

- **Aún no hay recursos creados**: buckets, bases, workgroups, datasets y tableros
  se crearán **en la práctica**. Por eso pedimos los permisos **abiertos** sobre
  los servicios indicados, no sobre nombres concretos.
- Costos estimados y tipo de cuenta: ver `docs/costos-y-cuenta.md` (resumen: el
  costo relevante es la licencia de **Autor de Quick (~$24/mes)**; S3+Athena+Glue
  suelen ser unos pocos dólares).
- Cuando terminemos, podemos **restringir o dar de baja** el usuario y los
  permisos.

¿Nos confirman la creación del usuario, la región y el acceso de Quick a los
orígenes? Quedamos atentos para coordinar.

Gracias,
[tu nombre] — [equipo / contacto]

---

## Checklist para el administrador

- [ ] Usuario IAM creado (compartido o por asistente) con acceso a consola.
- [ ] Región de trabajo definida: **[________]**.
- [ ] Permisos amplios de **S3**, **Glue** y **Athena** adjuntos al usuario.
- [ ] (Opcional) Rol IAM para **crawler** de Glue + `iam:PassRole` acotado.
- [ ] Suscripción de **Amazon Quick** activa; usuario con rol **Autor**.
- [ ] Quick con acceso a **Athena/Glue/S3** en *Security & permissions*.
- [ ] Confirmada capacidad **SPICE** suficiente (10 GB por Autor).

> Referencias internas: `docs/permisos-asistentes.md` (detalle de permisos y
> política IAM de ejemplo) y `docs/costos-y-cuenta.md` (cuenta y costos).
