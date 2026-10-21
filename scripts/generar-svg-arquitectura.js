// Genera los SVG de arquitectura (flujo-datos.svg y glue-vs-athena.svg)
// incrustando los íconos OFICIALES de AWS (public/img/aws/*.svg) como <image>
// con data URI base64, para que se rendericen aunque el SVG se cargue vía <img>.
//
// Uso: node scripts/generar-svg-arquitectura.js
//
// Los íconos de AWS son marcas de Amazon Web Services; se usan para representar
// servicios de AWS en diagramas de arquitectura, sin modificarlos.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const dirAws = join(raiz, 'public', 'img', 'aws');

/** Archivos oficiales de AWS por servicio (deben existir en public/img/aws/). */
const ARCHIVOS = {
  s3: 'Arch_Amazon-Simple-Storage-Service_16.svg',
  glue: 'Arch_AWS-Glue_64.svg',
  athena: 'Arch_Amazon-Athena_64.svg',
  quick: 'Arch_Amazon-QuickSight_64.svg',
};

/** Lee un ícono oficial y lo devuelve como data URI base64. */
function dataUri(clave) {
  const svg = readFileSync(join(dirAws, ARCHIVOS[clave]));
  return `data:image/svg+xml;base64,${svg.toString('base64')}`;
}

const ICO = Object.fromEntries(
  Object.keys(ARCHIVOS).map((k) => [k, dataUri(k)]),
);

/**
 * Devuelve un <image> que coloca un ícono oficial cuadrado en (x,y) con el
 * lado indicado.
 */
function img(clave, x, y, lado) {
  return `<image href="${ICO[clave]}" x="${x}" y="${y}" width="${lado}" height="${lado}" preserveAspectRatio="xMidYMid meet"/>`;
}

// ───────────────────────────────────────────────────────────────────────────
// flujo-datos.svg — diagrama de arquitectura de extremo a extremo.
// ───────────────────────────────────────────────────────────────────────────
const flujo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 280" role="img"
     aria-label="Diagrama de arquitectura del flujo del dato: Amazon S3 almacena los datos, AWS Glue Data Catalog cataloga los metadatos, Amazon Athena consulta con SQL, Amazon Quick construye datasets, análisis y dashboards y, como paso institucional explicativo, IAPOL (rombo) integra el dashboard publicado">
  <defs>
    <linearGradient id="fd-arr" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#002b49"/>
      <stop offset="100%" stop-color="#0a7b86"/>
    </linearGradient>
    <marker id="fd-tip" viewBox="0 0 10 10" refX="7.5" refY="5"
            markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill="#0a7b86"/>
    </marker>
    <style>
      .fd-name  { font: 700 12px Montserrat, system-ui, sans-serif; fill: #16212e; }
      .fd-role  { font: 400 10px Montserrat, system-ui, sans-serif; fill: #44546a; }
      .fd-group { font: 700 9px Montserrat, system-ui, sans-serif; fill: #44546a; letter-spacing: .4px; }
    </style>
  </defs>

  <rect x="0" y="0" width="860" height="280" rx="16" fill="#f2f0eb"/>

  <rect x="14" y="40" width="632" height="176" rx="14" fill="#ffffff" stroke="#d9e0e8"/>
  <text x="30" y="60" class="fd-role" font-weight="700" fill="#002b49">Analítica en AWS</text>

  <!-- Amazon S3 -->
  <g transform="translate(30,74)">
    <text x="0" y="0" class="fd-group">ALMACENAMIENTO</text>
    <rect y="8" width="108" height="112" rx="12" fill="#ffffff" stroke="#1b8f4d" stroke-width="2"/>
    ${img('s3', 32, 18, 44)}
    <text x="14" y="82" class="fd-name">Amazon S3</text>
    <text x="14" y="99" class="fd-role">Almacena los datos</text>
    <text x="14" y="112" class="fd-role">(Parquet en S3)</text>
  </g>
  <line x1="146" y1="140" x2="176" y2="140" stroke="url(#fd-arr)" stroke-width="3.5" marker-end="url(#fd-tip)"/>

  <!-- AWS Glue -->
  <g transform="translate(180,74)">
    <text x="0" y="0" class="fd-group">CATÁLOGO</text>
    <rect y="8" width="108" height="112" rx="12" fill="#ffffff" stroke="#7b4fc0" stroke-width="2"/>
    ${img('glue', 32, 18, 44)}
    <text x="14" y="82" class="fd-name">AWS Glue</text>
    <text x="14" y="98" class="fd-role">Data Catalog</text>
    <text x="14" y="112" class="fd-role">Metadatos de tablas</text>
  </g>
  <line x1="296" y1="140" x2="326" y2="140" stroke="url(#fd-arr)" stroke-width="3.5" marker-end="url(#fd-tip)"/>

  <!-- Amazon Athena -->
  <g transform="translate(330,74)">
    <text x="0" y="0" class="fd-group">CONSULTA</text>
    <rect y="8" width="108" height="112" rx="12" fill="#ffffff" stroke="#1b63b0" stroke-width="2"/>
    ${img('athena', 32, 18, 44)}
    <text x="14" y="82" class="fd-name">Amazon Athena</text>
    <text x="14" y="99" class="fd-role">Consulta con SQL</text>
    <text x="14" y="112" class="fd-role">sobre S3</text>
  </g>
  <line x1="446" y1="140" x2="476" y2="140" stroke="url(#fd-arr)" stroke-width="3.5" marker-end="url(#fd-tip)"/>

  <!-- Amazon Quick -->
  <g transform="translate(480,74)">
    <text x="0" y="0" class="fd-group">ANÁLISIS Y DASHBOARDS</text>
    <rect y="8" width="150" height="112" rx="12" fill="#ffffff" stroke="#e8830c" stroke-width="2"/>
    ${img('quick', 32, 18, 44)}
    <text x="14" y="82" class="fd-name">Amazon Quick</text>
    <text x="14" y="99" class="fd-role">Dataset → análisis →</text>
    <text x="14" y="112" class="fd-role">dashboard publicado</text>
  </g>

  <line x1="648" y1="140" x2="684" y2="140" stroke="url(#fd-arr)" stroke-width="3.5" marker-end="url(#fd-tip)"/>

  <!-- IAPOL: rombo gris -->
  <g transform="translate(766,140)">
    <polygon points="0,-66 78,0 0,66 -78,0" fill="#e3e6ea" stroke="#9aa3ad" stroke-width="2"/>
    <text x="0" y="-8" text-anchor="middle" class="fd-name">IAPOL</text>
    <text x="0" y="9" text-anchor="middle" class="fd-role">Integra</text>
    <text x="0" y="23" text-anchor="middle" class="fd-role">(explicativo)</text>
  </g>
  <text x="766" y="236" text-anchor="middle" class="fd-role" fill="#6b4bb0" font-weight="600">no se ejecuta desde la plataforma</text>
</svg>
`;

// ───────────────────────────────────────────────────────────────────────────
// glue-vs-athena.svg — roles complementarios de Glue y Athena sobre S3.
// ───────────────────────────────────────────────────────────────────────────
const glueAthena = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 240" role="img"
     aria-label="AWS Glue Data Catalog describe las tablas (esquema y ubicación en S3) y Amazon Athena consulta los datos en S3 usando esos metadatos, sin mover los archivos">
  <defs>
    <marker id="ga-tip" viewBox="0 0 10 10" refX="7.5" refY="5"
            markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill="#0a7b86"/>
    </marker>
    <style>
      .ga-name { font: 700 12px Montserrat, system-ui, sans-serif; fill: #16212e; }
      .ga-role { font: 400 10px Montserrat, system-ui, sans-serif; fill: #44546a; }
      .ga-lbl  { font: 600 10px Montserrat, system-ui, sans-serif; fill: #0a7b86; }
    </style>
  </defs>
  <rect x="0" y="0" width="640" height="240" rx="14" fill="#f2f0eb"/>

  <!-- S3 -->
  <g transform="translate(40,88)">
    <rect width="128" height="78" rx="12" fill="#ffffff" stroke="#1b8f4d" stroke-width="2"/>
    ${img('s3', 12, 20, 40)}
    <text x="60" y="36" class="ga-name">Amazon S3</text>
    <text x="60" y="52" class="ga-role">Archivos (Parquet)</text>
  </g>

  <!-- Glue (arriba) -->
  <g transform="translate(256,26)">
    <rect width="168" height="78" rx="12" fill="#ffffff" stroke="#7b4fc0" stroke-width="2"/>
    ${img('glue', 12, 19, 40)}
    <text x="60" y="32" class="ga-name">AWS Glue</text>
    <text x="60" y="48" class="ga-role">DESCRIBE las tablas:</text>
    <text x="60" y="62" class="ga-role">esquema + ubicación</text>
  </g>

  <!-- Athena (abajo) -->
  <g transform="translate(256,136)">
    <rect width="168" height="78" rx="12" fill="#ffffff" stroke="#1b63b0" stroke-width="2"/>
    ${img('athena', 12, 20, 40)}
    <text x="60" y="36" class="ga-name">Amazon Athena</text>
    <text x="60" y="52" class="ga-role">CONSULTA con SQL</text>
  </g>

  <!-- Flechas -->
  <path d="M168 114 Q 220 65 256 65" fill="none" stroke="#7b4fc0" stroke-width="2.5" stroke-dasharray="5 4" marker-end="url(#ga-tip)"/>
  <text x="182" y="80" class="ga-lbl">cataloga</text>
  <path d="M168 140 Q 220 175 256 175" fill="none" stroke="#1b63b0" stroke-width="2.5" marker-end="url(#ga-tip)"/>
  <text x="178" y="166" class="ga-lbl">lee datos</text>
  <path d="M340 104 L 340 136" fill="none" stroke="#0a7b86" stroke-width="2.5" stroke-dasharray="5 4" marker-end="url(#ga-tip)"/>
  <text x="348" y="124" class="ga-lbl">usa metadatos</text>

  <text x="446" y="118" class="ga-role">Athena no mueve ni</text>
  <text x="446" y="134" class="ga-role">copia los archivos:</text>
  <text x="446" y="150" class="ga-role">los lee en su sitio.</text>
</svg>
`;

writeFileSync(join(raiz, 'public', 'img', 'comun', 'flujo-datos.svg'), flujo);
writeFileSync(
  join(raiz, 'public', 'img', 'sesion1', 'glue-vs-athena.svg'),
  glueAthena,
);

console.log('SVG de arquitectura regenerados con íconos oficiales de AWS.');
