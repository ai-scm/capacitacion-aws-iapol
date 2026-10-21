/**
 * IconosServicio — íconos SVG estilizados de los servicios del flujo.
 *
 * Son representaciones PROPIAS y estilizadas (no los logotipos oficiales de
 * AWS) de cada servicio, pensadas para ilustrar el flujo S3 → Glue / Athena →
 * Amazon Quick → IAPOL sin depender de recursos externos ni de CDN en runtime
 * (R23.3) y sin reproducir marcas registradas de terceros. Cada ícono usa el
 * color característico del servicio para facilitar su reconocimiento.
 *
 * Todos los íconos:
 *  - son SVG inline (sin red),
 *  - escalan con `width`/`height` (por defecto 1em),
 *  - son decorativos por defecto (`aria-hidden`), ya que el nombre del servicio
 *    siempre se muestra como texto junto al ícono.
 *
 * @module components/common/IconosServicio
 */

import { useState } from 'react';

/**
 * Props comunes de los íconos de servicio.
 * @param {object} props
 * @param {number|string} [props.size=24] - Tamaño (ancho y alto) del ícono.
 * @param {string} [props.className] - Clase CSS opcional.
 */

/** Amazon S3 — almacenamiento de objetos (verde). */
export function IconoS3({ size = 24, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M24 4 10 9v16c0 9 6.4 15.2 14 19 7.6-3.8 14-10 14-19V9L24 4Z"
        fill="#1b8f4d"
      />
      <path
        d="M24 4 10 9v16c0 9 6.4 15.2 14 19V4Z"
        fill="#2aa85c"
      />
      <ellipse cx="24" cy="16" rx="9" ry="3.2" fill="#fff" opacity="0.92" />
      <path
        d="M15 16v8c0 1.8 4 3.2 9 3.2s9-1.4 9-3.2v-8c0 1.8-4 3.2-9 3.2s-9-1.4-9-3.2Z"
        fill="#fff"
        opacity="0.75"
      />
    </svg>
  );
}

/** AWS Glue Data Catalog — catálogo de metadatos (morado). */
export function IconoGlue({ size = 24, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="6" y="6" width="36" height="36" rx="7" fill="#7b4fc0" />
      <path
        d="M24 13a6 6 0 0 0-6 6c0 2.3 1.3 4 3 5v4a3 3 0 0 0 6 0v-4c1.7-1 3-2.7 3-5a6 6 0 0 0-6-6Z"
        fill="#fff"
      />
      <circle cx="21.5" cy="19" r="1.4" fill="#7b4fc0" />
      <circle cx="26.5" cy="19" r="1.4" fill="#7b4fc0" />
    </svg>
  );
}

/** Amazon Athena — consultas SQL serverless (azul/morado). */
export function IconoAthena({ size = 24, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="6" y="6" width="36" height="36" rx="7" fill="#5c3aa8" />
      <circle cx="21" cy="21" r="8" fill="none" stroke="#fff" strokeWidth="3" />
      <line
        x1="27"
        y1="27"
        x2="35"
        y2="35"
        stroke="#fff"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path
        d="M17.5 21h2.3l1.5-3 1.8 6 1.5-3h2.4"
        fill="none"
        stroke="#9be0ff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Amazon Quick (QuickSight) — análisis y dashboards (naranja/ámbar). */
export function IconoQuick({ size = 24, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="6" y="6" width="36" height="36" rx="7" fill="#e8830c" />
      <rect x="13" y="24" width="5" height="11" rx="1.2" fill="#fff" />
      <rect x="21.5" y="18" width="5" height="17" rx="1.2" fill="#fff" />
      <rect x="30" y="21" width="5" height="14" rx="1.2" fill="#fff" />
      <path
        d="M13 20l7-5 6 3 9-7"
        fill="none"
        stroke="#fff5e6"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** IAPOL — proceso institucional (squid ink + acento turquesa de marca). */
export function IconoIapol({ size = 24, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="6" y="6" width="36" height="36" rx="7" fill="#002b49" />
      <path
        d="M24 11l11 4.5v6.5c0 7-4.7 11.6-11 13.5-6.3-1.9-11-6.5-11-13.5V15.5L24 11Z"
        fill="none"
        stroke="#00e0e0"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M19 23.5l3.5 3.5 7-7"
        fill="none"
        stroke="#00e0e0"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Mapa id de nodo → componente de ícono, para que el diagrama resuelva el
 * ícono a partir del identificador del nodo.
 * @type {Readonly<Record<string, (props: object) => import('react').ReactElement>>}
 */
export const ICONOS_POR_NODO = Object.freeze({
  s3: IconoS3,
  glue: IconoGlue,
  athena: IconoAthena,
  quick: IconoQuick,
  iapol: IconoIapol,
});

/**
 * Rutas de los íconos OFICIALES de AWS por nodo, servidos localmente desde
 * `public/img/aws/` (sin CDN en runtime, R23.3).
 *
 * Para usar los íconos reales de AWS Architecture Icons
 * (https://aws.amazon.com/architecture/icons/), descarga el toolkit oficial y
 * coloca el SVG de cada servicio en `public/img/aws/` con EXACTAMENTE estos
 * nombres de archivo. Mientras el archivo no exista, el componente
 * {@link IconoServicioNodo} muestra el ícono estilizado propio como reserva, de
 * modo que la interfaz nunca queda con una imagen rota.
 *
 * IAPOL no es un servicio de AWS, por lo que no tiene ícono oficial: siempre usa
 * el glifo propio de marca.
 *
 * @type {Readonly<Record<string, string>>}
 */
export const ICONOS_AWS_POR_NODO = Object.freeze({
  s3: '/img/aws/Arch_Amazon-Simple-Storage-Service_16.svg',
  glue: '/img/aws/Arch_AWS-Glue_64.svg',
  athena: '/img/aws/Arch_Amazon-Athena_64.svg',
  quick: '/img/aws/Arch_Amazon-QuickSight_64.svg',
});

/**
 * Ícono del nodo del diagrama: intenta usar el ícono OFICIAL de AWS servido
 * localmente y, si el archivo no existe (o falla la carga), cae al glifo
 * estilizado propio. Así, al soltar los SVG reales en `public/img/aws/` el
 * diagrama los adopta automáticamente, sin dejar imágenes rotas entretanto.
 *
 * @param {object} props
 * @param {string} props.nodoId - Identificador del nodo (s3, glue, athena, quick, iapol).
 * @param {number|string} [props.size=24] - Tamaño del ícono.
 * @param {string} [props.className] - Clase CSS opcional.
 * @returns {import('react').ReactElement|null}
 */
export function IconoServicioNodo({ nodoId, size = 24, className = '' }) {
  const Glifo = ICONOS_POR_NODO[nodoId] ?? null;
  const rutaAws = ICONOS_AWS_POR_NODO[nodoId];
  const [fallo, setFallo] = useState(false);

  // Sin ruta oficial (p. ej. IAPOL) o tras un error de carga: glifo propio.
  if (!rutaAws || fallo) {
    return Glifo ? <Glifo size={size} className={className} /> : null;
  }

  return (
    <img
      className={className}
      src={rutaAws}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      style={{ objectFit: 'contain' }}
      onError={() => setFallo(true)}
    />
  );
}
