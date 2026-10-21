# Plataforma de Capacitación — Amazon Athena, Amazon Quick e IAPOL

Plataforma web educativa interactiva (SPA React + Vite) que se ejecuta en `localhost`
sobre Ubuntu. Guía un recorrido pedagógico del dato desde su almacenamiento y consulta
(S3 → AWS Glue Data Catalog / Amazon Athena) hasta su análisis y publicación en
Amazon Quick, y finaliza con la explicación conceptual de la integración en IAPOL.

El contenido se organiza en tres sesiones de 120 minutos (6 horas en total) y usa como
caso práctico transversal los *NYC Yellow Taxi Trip Records* de enero de 2024, tratados
como datos públicos de ejemplo.

> **Importante:** la Plataforma es un recurso pedagógico. **No ejecuta operaciones reales
> en AWS, no realiza consultas a Amazon Athena, no configura datasets reales en
> Amazon Quick y no modifica IAPOL.** Todas las funciones que imitan ese comportamiento
> (Laboratorio SQL, Simulador de dashboards, flujo de integración IAPOL) están etiquetadas
> de forma permanente como simulaciones locales.

## Requisitos previos

- **Sistema operativo:** Ubuntu (probado en entornos Ubuntu/Linux de escritorio).
- **Node.js:** versión 24.x (compatible con el rango declarado en `engines`:
  `^20.19.0 || >=22.12.0`). Verificado con Node v24.21.0.
- **pnpm:** `12.14.0` como único gestor de paquetes autorizado. La forma recomendada de
  obtener la versión exacta es mediante Corepack, que acompaña a Node:

  ```bash
  corepack enable
  corepack prepare pnpm@12.14.0 --activate
  pnpm --version   # debe imprimir 12.14.0
  ```

El proyecto fija `packageManager: "pnpm@12.14.0"` y `.npmrc` con `engine-strict=true`,
por lo que una instalación con npm o yarn será rechazada por el script `preinstall`.

## Instrucciones de ejecución en Ubuntu

Desde la raíz del proyecto:

```bash
# 1. Instalar dependencias de forma reproducible a partir de pnpm-lock.yaml
pnpm install --frozen-lockfile

# 2. Ejecutar el servidor de desarrollo (sirve la Plataforma en localhost)
pnpm run dev
#    Vite imprimirá la URL local (por defecto http://localhost:5173)

# 3. Generar la compilación de producción (salida en dist/)
pnpm run build

# 4. Ejecutar la batería de pruebas
pnpm run test

# 5. Ejecutar el linting
pnpm run lint
```

La Plataforma funciona completamente sin conexión a APIs de AWS ni a IAPOL.

## Estructura del proyecto

```
capacitacion-aws-iapol/
├─ index.html                 # Punto de montaje; carga src/main.jsx (sin CDN en runtime)
├─ package.json               # Scripts, dependencias exactas y packageManager pnpm
├─ pnpm-lock.yaml             # Lockfile reproducible (único lockfile permitido)
├─ .npmrc                     # save-exact=true, engine-strict=true
├─ vite.config.js             # Configuración de Vite + Vitest (entorno jsdom)
├─ eslint.config.js           # Reglas ESLint para React 19 y JS moderno
├─ scripts/
│  └─ solo-pnpm.js            # preinstall: rechaza npm/yarn
└─ src/
   ├─ main.jsx                # Arranque de React
   ├─ App.jsx                 # Monta providers y enruta la vista activa
   ├─ context/                # Estado global por React Context
   │  ├─ AppContext.jsx          # Router por estado + navegación de diapositivas
   │  ├─ ProgresoContext.jsx     # Progreso con localStorage y fallback en memoria
   │  └─ PresentadorContext.jsx  # Modo presentador y temporizador
   ├─ hooks/                  # Hooks de navegación por teclado, fullscreen y movimiento reducido
   ├─ domain/                 # Capa de dominio pura (sin UI) + pruebas de propiedad
   │  ├─ navegacion.js  consultas.js  agregaciones.js  simulador.js
   │  ├─ puntuacion.js  progreso.js   layout.js        glosario.js
   │  └─ temporizador.js
   ├─ components/             # Componentes de UI agrupados por área
   │  ├─ common/     # Insignias de plano (Quick real / Simulación / proceso IAPOL)
   │  ├─ home/       # Pantalla principal y tarjetas de sesión
   │  ├─ slides/     # Vista de diapositivas 16:9, layouts y controles de navegación
   │  ├─ presentador/# Modo presentador: notas, objetivos, temporizador, vista previa
   │  ├─ diagrama/   # Diagrama interactivo S3 → Glue/Athena → Quick → IAPOL
   │  ├─ sql/        # Explicaciones SQL y Laboratorio SQL (simulación local)
   │  ├─ simulador/  # Simulador de dashboards y las tres hojas de análisis
   │  ├─ evaluacion/ # Motor de evaluación con retroalimentación y puntuación
   │  ├─ glosario/   # Glosario con buscador
   │  ├─ recursos/   # Centro de recursos (enlaces a documentación oficial)
   │  └─ iapol/      # Identificadores IAPOL y casos de diagnóstico
   ├─ data/                   # Contenido y datos locales empaquetados
   │  ├─ dataset/   # NYC Yellow Taxi de ejemplo (JSON) y descripción de campos
   │  ├─ consultas/ # Catálogo de consultas demo del Laboratorio SQL
   │  ├─ evaluacion/# Banco de preguntas y rúbrica (ponderación 15/15/25/15/15/15)
   │  ├─ glosario/  # Términos técnicos
   │  ├─ recursos/  # Enlaces a documentación oficial
   │  └─ sesiones/  # Contenido de las sesiones 1, 2 y 3
   ├─ styles/                 # Tema AWS-like y estilos responsive (CSS plano + variables)
   │  ├─ base.css  theme.css  index.css
   └─ test/
      └─ setup.js             # Setup de Testing Library para Vitest
```

## Versiones

Todas las dependencias se declaran con versiones **exactas** (formato `MAJOR.MINOR.PATCH`,
sin prefijos `^`, `~` o `*` ni etiquetas `latest`/`next`/`beta`).

| Herramienta / dependencia | Versión |
|---|---|
| Node.js | 24.x (rango `^20.19.0 \|\| >=22.12.0`; verificado en v24.21.0) |
| pnpm | 12.14.0 (`packageManager`) |
| react | 19.3.1 |
| react-dom | 19.3.1 |
| recharts | 3.10.1 |
| vite | 8.3.4 |
| @vitejs/plugin-react | 6.1.2 |
| vitest | 5.0.5 |
| @testing-library/react | 16.3.3 |
| @testing-library/dom | 10.4.2 |
| jsdom | 30.1.3 |
| fast-check | 4.10.2 |
| eslint | 9.39.5 |
| @eslint/js | 9.39.5 |
| eslint-plugin-react | 7.37.5 |
| eslint-plugin-react-hooks | 7.1.1 |
| eslint-plugin-react-refresh | 0.5.7 |
| globals | 17.13.0 |

## Procedimiento de pruebas

Las pruebas se ejecutan con **Vitest** sobre el entorno `jsdom` configurado en
`vite.config.js`:

```bash
pnpm run test   # equivale a: vitest run
```

La batería combina tres tipos de pruebas:

- **Pruebas unitarias:** verifican ejemplos concretos y casos límite de componentes de UI,
  contenido fijo e invariantes de datos (p. ej. 15–60 diapositivas por sesión, 5–20 consultas,
  rúbrica que suma 100, términos del glosario y campos del dataset).
- **Pruebas basadas en propiedades (property-based):** con **fast-check** validan las
  propiedades universales de corrección (navegación con clamp, relación 16:9, temporizador,
  notas privadas del presentador, totalidad del motor de consultas, filtros de fecha,
  selección de campos del simulador, puntuación en `[0,100]`, umbral, búsqueda del glosario y
  viaje de ida y vuelta del progreso por localStorage), con un mínimo de 100 iteraciones cada una.
- **Pruebas de integración y smoke de configuración:** verifican el flujo de render entre las
  tres sesiones y aserciones de seguridad/configuración sobre los archivos del proyecto
  (`packageManager` fijado, `.npmrc` con `save-exact=true`, ausencia de `package-lock.json`
  y `yarn.lock`, dependencias sin prefijos de rango, ausencia de `eval`, secretos y CDN de JS
  en runtime).

**Resultado de la última ejecución:** `Test Files 29 passed (29)` · `Tests 191 passed (191)`.
Build de producción (`pnpm run build`) y linting (`pnpm run lint`) finalizan sin errores
(el lint reporta únicamente advertencias no bloqueantes de `react-refresh`).

## Resultados de la auditoría de seguridad

La auditoría se ejecuta con el comando de pnpm **sin la opción `--force`**:

```bash
pnpm audit
```

**Resultado:** `No known vulnerabilities found`.

Desglose por severidad (sobre 406 dependencias totales analizadas):

| Severidad | Vulnerabilidades |
|---|---|
| critical | 0 |
| high | 0 |
| moderate | 0 |
| low | 0 |
| info | 0 |

No fue necesario modificar versiones de dependencias para resolver vulnerabilidades, por lo
que no se utilizó `--force` ni se introdujeron cambios incompatibles. Las versiones se
mantienen fijadas de forma exacta.

### Postura de seguridad del proyecto

- **Gestor de paquetes único (pnpm):** `packageManager` fija `pnpm@12.14.0`; el script
  `preinstall` rechaza instalaciones con npm o yarn, y `.gitignore` excluye
  `package-lock.json` y `yarn.lock`. El único lockfile es `pnpm-lock.yaml`.
- **Versiones exactas:** todas las dependencias directas de producción y desarrollo se
  declaran con versiones exactas; `.npmrc` establece `save-exact=true`.
- **Sin secretos en el frontend:** no se incluyen credenciales, tokens ni secretos en el
  código, la configuración ni los recursos.
- **JavaScript local, sin CDN en runtime:** la Plataforma carga su código desde recursos
  locales empaquetados por Vite; no depende de CDNs en tiempo de ejecución.
- **Sin `eval` ni `dangerouslySetInnerHTML`:** no se inyecta HTML sin saneamiento a partir de
  entradas del usuario; las entradas se validan antes de procesarse.
- **Sin conexiones a AWS ni a IAPOL:** la Plataforma funciona completamente en local; las
  simulaciones están identificadas como tales y no ejecutan operaciones reales.
