/**
 * Pruebas de smoke de configuración y seguridad del proyecto — tarea 14.2.
 *
 * Estas pruebas NO montan componentes: leen ficheros del repositorio con `fs`
 * y aseveran invariantes de configuración y de higiene de seguridad acordados
 * en el diseño. Vitest se ejecuta desde la raíz del proyecto, por lo que
 * `process.cwd()` apunta al workspace.
 *
 * Cobertura de requisitos:
 *  - R22.4: `package.json` fija `packageManager` a una versión exacta de pnpm
 *    (formato MAJOR.MINOR.PATCH).
 *  - R22.5: `.npmrc` contiene `save-exact=true`.
 *  - (Diseño/R22) No existen lockfiles de npm/yarn; sí existe `pnpm-lock.yaml`.
 *  - R22.6: todas las dependencias y devDependencies usan versiones exactas
 *    (sin `^`, `~`, `*` ni etiquetas `latest`/`next`/`beta`).
 *  - R23.2: no hay secretos evidentes comprometidos en `src/`.
 *  - R23.3: no se carga JavaScript desde una CDN en runtime (el script de
 *    `index.html` es local y no hay inyección de `<script src="https://…">`).
 *  - R23.4: no se usa `eval(` / `new Function(` ni `dangerouslySetInnerHTML`
 *    en el código fuente de `src/`.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

import { describe, it, expect } from 'vitest';

/**
 * Elimina comentarios de línea (`//…`) y de bloque (`/*…*\/`) de un fuente JS/JSX
 * para que los escaneos de seguridad examinen CÓDIGO y no documentación. La
 * mención de `eval` o `dangerouslySetInnerHTML` dentro de un comentario JSDoc
 * (p. ej. "no se usa dangerouslySetInnerHTML") no debe considerarse un uso real.
 *
 * Es una limpieza pragmática (no un parser completo): basta para distinguir una
 * llamada/atributo real de una mención en prosa en este repositorio.
 *
 * @param {string} fuente - Contenido original del fichero.
 * @returns {string} Fuente sin comentarios.
 */
function sinComentarios(fuente) {
  return fuente
    .replace(/\/\*[\s\S]*?\*\//g, ' ') // comentarios de bloque
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1'); // comentarios de línea (sin romper URLs http://)
}

/**
 * Raíz del workspace. Vitest corre desde la raíz del proyecto.
 * @type {string}
 */
const RAIZ = process.cwd();

/**
 * Lee un fichero de texto relativo a la raíz del proyecto.
 *
 * @param {string} rel - Ruta relativa (p. ej. 'package.json').
 * @returns {string} Contenido UTF-8.
 */
function leer(rel) {
  return readFileSync(join(RAIZ, rel), 'utf8');
}

/**
 * Recolecta de forma recursiva los ficheros de `src/` con las extensiones
 * dadas, ignorando directorios de dependencias/artefactos.
 *
 * @param {string} dir - Directorio base (absoluto).
 * @param {ReadonlyArray<string>} extensiones - Extensiones admitidas (con punto).
 * @returns {string[]} Rutas absolutas de ficheros coincidentes.
 */
function ficheros(dir, extensiones) {
  const IGNORAR = new Set(['node_modules', 'dist', '.git']);
  /** @type {string[]} */
  const salida = [];

  for (const entrada of readdirSync(dir)) {
    if (IGNORAR.has(entrada)) {
      continue;
    }
    const ruta = join(dir, entrada);
    const info = statSync(ruta);
    if (info.isDirectory()) {
      salida.push(...ficheros(ruta, extensiones));
    } else if (extensiones.includes(extname(ruta)) && !/\.(test|spec)\.jsx?$/.test(entrada)) {
      // Se escanea el código de aplicación en runtime, no los ficheros de prueba
      // (que legítimamente contienen patrones como literales para aseverarlos).
      salida.push(ruta);
    }
  }

  return salida;
}

/**
 * `package.json` parseado una sola vez para las aserciones de versiones.
 * @type {{ packageManager?: string, dependencies?: Record<string,string>, devDependencies?: Record<string,string> }}
 */
const PKG = JSON.parse(leer('package.json'));

describe('Gestión de paquetes y versiones (R22)', () => {
  it('fija packageManager a una versión exacta de pnpm (MAJOR.MINOR.PATCH) (R22.4)', () => {
    expect(typeof PKG.packageManager).toBe('string');
    // pnpm@X.Y.Z con los tres segmentos numéricos (versión fijada, sin rangos).
    expect(PKG.packageManager).toMatch(/^pnpm@\d+\.\d+\.\d+$/);
  });

  it('.npmrc contiene save-exact=true (R22.5)', () => {
    const npmrc = leer('.npmrc');
    // Línea save-exact=true (tolerante a espacios alrededor del '=').
    expect(npmrc).toMatch(/^\s*save-exact\s*=\s*true\s*$/m);
  });

  it('no existen package-lock.json ni yarn.lock; sí pnpm-lock.yaml', () => {
    expect(existsSync(join(RAIZ, 'package-lock.json'))).toBe(false);
    expect(existsSync(join(RAIZ, 'yarn.lock'))).toBe(false);
    expect(existsSync(join(RAIZ, 'pnpm-lock.yaml'))).toBe(true);
  });

  it('todas las dependencias usan versiones exactas, sin prefijos de rango ni etiquetas (R22.6)', () => {
    const deps = { ...(PKG.dependencies ?? {}), ...(PKG.devDependencies ?? {}) };
    const nombres = Object.keys(deps);
    expect(nombres.length).toBeGreaterThan(0);

    // Versión exacta: X.Y.Z (admite prerelease/build con sufijo tras guion/más),
    // pero NO prefijos de rango (^ ~ >= <= > < =) ni comodines (* x) ni etiquetas.
    const VERSION_EXACTA = /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/;
    const ETIQUETAS = new Set(['latest', 'next', 'beta', 'alpha', 'canary', 'rc']);

    /** @type {Array<[string, string]>} */
    const invalidas = [];
    for (const [nombre, version] of Object.entries(deps)) {
      const v = String(version).trim();
      const esRango = /[\^~*xX]|>=|<=|[<>]|\s-\s|\|\||\s/.test(v);
      const esEtiqueta = ETIQUETAS.has(v.toLowerCase());
      if (!VERSION_EXACTA.test(v) || esRango || esEtiqueta) {
        invalidas.push([nombre, v]);
      }
    }

    expect(invalidas).toEqual([]);
  });
});

describe('Higiene de seguridad del código fuente (R23)', () => {
  /**
   * Ficheros de código de `src/` relevantes para los escaneos de seguridad.
   * @type {string[]}
   */
  const FUENTES = ficheros(join(RAIZ, 'src'), ['.js', '.jsx']);

  it('hay ficheros de fuente para escanear', () => {
    expect(FUENTES.length).toBeGreaterThan(0);
  });

  it('no contiene secretos evidentes comprometidos en src/ (R23.2)', () => {
    // Patrones conservadores de secretos reales (evitando falsos positivos con
    // la palabra "secret" en prosa/documentación o nombres de API inocuos).
    const PATRONES = [
      { nombre: 'AWS Access Key ID', re: /\bAKIA[0-9A-Z]{16}\b/ },
      { nombre: 'AWS Secret Access Key asignada', re: /aws_secret_access_key\s*[:=]\s*['"][^'"]+['"]/i },
      { nombre: 'Encabezado de clave privada PEM', re: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/ },
      { nombre: 'Token de GitHub', re: /\bghp_[0-9A-Za-z]{36}\b/ },
    ];

    /** @type {string[]} */
    const hallazgos = [];
    for (const ruta of FUENTES) {
      const contenido = readFileSync(ruta, 'utf8');
      for (const { nombre, re } of PATRONES) {
        if (re.test(contenido)) {
          hallazgos.push(`${nombre} en ${ruta.replace(RAIZ, '.')}`);
        }
      }
    }

    expect(hallazgos).toEqual([]);
  });

  it('no carga JavaScript desde una CDN en runtime (R23.3)', () => {
    const html = leer('index.html');

    // El/los <script src="…"> de index.html deben ser locales (no http/https).
    const scripts = [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi)].map(
      (m) => m[1],
    );
    // Debe existir al menos la entrada local al bundle de la SPA.
    expect(scripts.length).toBeGreaterThan(0);
    for (const src of scripts) {
      expect(src).not.toMatch(/^https?:\/\//i);
    }
    // En particular, la entrada principal es el módulo local de la SPA.
    expect(scripts.some((src) => /\/src\/main\.jsx$/.test(src) || /\.js$/.test(src))).toBe(
      true,
    );

    // El código de src/ no inyecta <script> remotos ni crea elementos script
    // apuntando a una CDN http(s). Se escanea el código sin comentarios.
    for (const ruta of FUENTES) {
      const codigo = sinComentarios(readFileSync(ruta, 'utf8'));
      expect(codigo).not.toMatch(/<script\b[^>]*src=["']https?:\/\//i);
      expect(codigo).not.toMatch(
        /createElement\(\s*['"]script['"]\s*\)[\s\S]{0,200}?\bsrc\s*=\s*['"]https?:\/\//i,
      );
    }
  });

  it('no usa eval, new Function ni dangerouslySetInnerHTML en src/ (R23.4)', () => {
    /** @type {string[]} */
    const hallazgos = [];
    for (const ruta of FUENTES) {
      // Se escanea el CÓDIGO (sin comentarios) para no confundir un uso real con
      // una mención en documentación (p. ej. "no se usa dangerouslySetInnerHTML").
      const codigo = sinComentarios(readFileSync(ruta, 'utf8'));
      // `eval(` como llamada (no como subcadena de otra palabra, p. ej. "evaluar").
      if (/(?<![A-Za-z0-9_$.])eval\s*\(/.test(codigo)) {
        hallazgos.push(`eval( en ${ruta.replace(RAIZ, '.')}`);
      }
      if (/\bnew\s+Function\s*\(/.test(codigo)) {
        hallazgos.push(`new Function( en ${ruta.replace(RAIZ, '.')}`);
      }
      // Uso real del atributo JSX (asignación `dangerouslySetInnerHTML={…}` o
      // propiedad `dangerouslySetInnerHTML:`), no la simple mención del nombre.
      if (/dangerouslySetInnerHTML\s*[:=]/.test(codigo)) {
        hallazgos.push(`dangerouslySetInnerHTML en ${ruta.replace(RAIZ, '.')}`);
      }
    }

    expect(hallazgos).toEqual([]);
  });
});
