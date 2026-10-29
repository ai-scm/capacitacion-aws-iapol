# Guía de despliegue en AWS Amplify

Plataforma de Capacitación — Amazon Athena, Amazon Quick e IAPOL

Esta guía describe, paso a paso, cómo desplegar la plataforma (SPA de React + Vite)
en **AWS Amplify Hosting** a partir del repositorio de GitHub, incluyendo la
configuración de compilación con **pnpm** y la solución a los problemas de build
más comunes.

---

## 1. Requisitos previos

- Una **cuenta de AWS** con acceso a la consola de AWS Amplify.
- El repositorio del proyecto en **GitHub** (rama `main`).
- Permisos para **conectar** la cuenta de AWS con GitHub (o un token de acceso).
- El proyecto usa **pnpm** como único gestor de paquetes (versión fijada en
  `package.json`: `pnpm@12.14.0`) y **Vite**, que genera la salida en `dist/`.

> La aplicación es 100% estática y funciona en el navegador. No requiere backend,
> variables de entorno ni conexiones a AWS/IAPOL en tiempo de ejecución.

---

## 2. Archivo de configuración de build (`amplify.yml`)

El repositorio incluye en su raíz el archivo **`amplify.yml`**, que le indica a
Amplify cómo instalar dependencias y compilar. Su contenido es:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install -g pnpm@12.14.0
        - pnpm --version
        - pnpm install --frozen-lockfile
    build:
      commands:
        - pnpm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .pnpm-store/**/*
```

Qué hace cada parte:

- **preBuild**: instala pnpm en la versión exacta del proyecto y luego instala las
  dependencias de forma reproducible a partir de `pnpm-lock.yaml`
  (`--frozen-lockfile`).
- **build**: compila la aplicación con Vite (`pnpm run build`).
- **artifacts.baseDirectory: dist**: indica que lo que se publica es la carpeta
  `dist/` generada por Vite.
- **cache**: acelera compilaciones posteriores reutilizando `node_modules` y la
  tienda de pnpm.

> Si este archivo existe en el repositorio, Amplify lo usa automáticamente y no es
> necesario editar la configuración de build en la consola.

---

## 3. Paso a paso en la consola de AWS Amplify

### Paso 1 — Abrir AWS Amplify

1. Inicia sesión en la **consola de AWS**.
2. Busca el servicio **AWS Amplify** y ábrelo.

### Paso 2 — Crear la aplicación

1. Elige **Crear nueva aplicación** (o **Host web app**).
2. Selecciona **GitHub** como proveedor del código fuente.
3. Autoriza a AWS Amplify a acceder a tu cuenta de GitHub si se solicita.

### Paso 3 — Seleccionar repositorio y rama

1. Selecciona el repositorio **capacitacion-aws-iapol**.
2. Selecciona la rama **main**.
3. Continúa al siguiente paso.

### Paso 4 — Configuración de build

1. Amplify detecta el archivo **`amplify.yml`** del repositorio y muestra la
   configuración de build.
2. Verifica que el directorio de salida sea **`dist`**.
3. No es necesario definir variables de entorno ni backend.

### Paso 5 — Revisar y desplegar

1. Revisa el resumen de la configuración.
2. Pulsa **Guardar y desplegar** (Save and deploy).
3. Amplify ejecutará las fases: **Provision → Build → Deploy → Verify**.

### Paso 6 — Verificar

1. Cuando el despliegue termine en verde, Amplify muestra la **URL pública** de la
   aplicación (por ejemplo `https://main.XXXXXX.amplifyapp.com`).
2. Abre la URL y comprueba que la plataforma carga: menú de navegación, sesiones,
   laboratorio y simulador.

---

## 4. Actualizaciones automáticas (CI/CD)

Una vez conectado el repositorio, **cada vez que se haga `git push` a la rama
`main`**, Amplify inicia automáticamente un nuevo despliegue con los últimos
cambios. No hay que repetir la configuración.

Flujo típico de actualización:

```bash
git add <archivos>
git commit -m "descripcion del cambio"
git push origin main
```

A continuación, Amplify detecta el push y reconstruye la aplicación.

---

## 5. Solución de problemas (lo que ya resolvimos)

### 5.1 `pnpm: command not found` (exit code 127)

**Causa:** la imagen de build de Amplify no trae pnpm preinstalado, y el proyecto
exige pnpm.

**Solución:** instalar pnpm en la fase `preBuild`. En este proyecto se hace con
`npm install -g pnpm@12.14.0` (ver `amplify.yml`).

### 5.2 `Cannot find module .../bin/pnpm.cjs` (MODULE_NOT_FOUND con Corepack)

**Causa:** al activar pnpm con **Corepack** (`corepack prepare pnpm@... --activate`),
el Corepack incluido en la imagen de Amplify busca el binario de pnpm en una ruta
antigua y fija (`bin/pnpm.cjs`) que las versiones nuevas de pnpm ya no utilizan,
por lo que falla.

**Solución:** no usar Corepack e instalar pnpm directamente con npm global
(`npm install -g pnpm@12.14.0`). Esto evita el problema de resolución de ruta.

> Nota: instalar pnpm con `npm install -g` **no** rompe la política de "solo pnpm"
> del proyecto. El script `preinstall` que rechaza npm/yarn solo se ejecuta al
> instalar las dependencias del proyecto, no al instalar pnpm como herramienta
> global del sistema.

### 5.3 Advertencias no bloqueantes

- `Unable to write cache: ... 404` en el primer despliegue: es normal, aún no
  existe caché previa que recuperar.
- `Failed to set up process.env.secrets`: no aplica; el proyecto no usa secretos.

---

## 6. Resumen rápido

| Punto | Valor |
|---|---|
| Proveedor de código | GitHub (rama `main`) |
| Gestor de paquetes | pnpm `12.14.0` (instalado con npm global en el build) |
| Comando de build | `pnpm run build` (Vite) |
| Carpeta publicada | `dist` |
| Backend | No requiere |
| Variables de entorno | No requiere |
| CI/CD | Automático en cada push a `main` |

---

*Documento de apoyo operativo. Las rutas y nombres exactos de la consola de AWS
Amplify pueden variar según la versión vigente de la interfaz.*
