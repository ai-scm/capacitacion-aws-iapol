/**
 * Insignia de plano (BadgePlano) — R21.
 *
 * Componente reutilizable que etiqueta visualmente el "plano" conceptual al que
 * pertenece un contenido, diferenciando con estilos distintos los tres planos de
 * la Plataforma (R21.1):
 *
 *   - `quick-real`        → "Amazon Quick real"
 *   - `simulacion-local`  → "Simulación local"
 *   - `iapol`             → "Proceso institucional IAPOL"
 *
 * La diferenciación visual se logra mediante clases CSS (`badge-plano` +
 * `badge-plano--<plano>`); el tema completo con variables se define en la tarea
 * 13.1. El marcado es accesible: usa un `<span>` con `role="status"` y un
 * `aria-label` descriptivo que incluye el contexto de plano para lectores de
 * pantalla.
 *
 * Requisitos cubiertos: 21.1 (diferenciación visual de los tres planos).
 */

import './BadgePlano.css';

/**
 * Identificadores de los tres planos conceptuales.
 * @readonly
 * @enum {string}
 */
export const PLANOS = Object.freeze({
  QUICK_REAL: 'quick-real',
  SIMULACION_LOCAL: 'simulacion-local',
  IAPOL: 'iapol',
});

/**
 * Etiquetas textuales visibles de cada plano, indexadas por su identificador.
 * @readonly
 * @type {Readonly<Record<string, string>>}
 */
export const ETIQUETAS_PLANO = Object.freeze({
  [PLANOS.QUICK_REAL]: 'Amazon Quick real',
  [PLANOS.SIMULACION_LOCAL]: 'Simulación local',
  [PLANOS.IAPOL]: 'Proceso institucional IAPOL',
});

/**
 * Descripción accesible (contexto) de cada plano, usada para construir el
 * `aria-label` de forma que una persona usuaria de lector de pantalla entienda
 * el propósito de la insignia y no solo su etiqueta.
 * @readonly
 * @type {Readonly<Record<string, string>>}
 */
const DESCRIPCION_PLANO = Object.freeze({
  [PLANOS.QUICK_REAL]: 'Contenido que describe Amazon Quick real',
  [PLANOS.SIMULACION_LOCAL]:
    'Contenido de simulación local, no es una operación real',
  [PLANOS.IAPOL]: 'Contenido del proceso institucional IAPOL',
});

/**
 * Lista de valores de plano válidos, derivada de {@link PLANOS}.
 * @readonly
 * @type {ReadonlyArray<string>}
 */
export const PLANOS_VALIDOS = Object.freeze(Object.values(PLANOS));

/**
 * Insignia que identifica visualmente el plano de un contenido.
 *
 * @param {object} props
 * @param {('quick-real'|'simulacion-local'|'iapol')} props.plano - Plano a representar.
 * @param {string} [props.className] - Clases CSS adicionales opcionales.
 * @returns {import('react').ReactElement|null} La insignia, o `null` si el plano no es válido.
 */
export default function BadgePlano({ plano, className = '' }) {
  const etiqueta = ETIQUETAS_PLANO[plano];

  // Validación de entrada: ante un plano desconocido no se renderiza nada,
  // evitando mostrar una etiqueta vacía o engañosa (R23.5).
  if (!etiqueta) {
    return null;
  }

  const descripcion = DESCRIPCION_PLANO[plano] ?? etiqueta;
  const clases = ['badge-plano', `badge-plano--${plano}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={clases} role="status" aria-label={descripcion}>
      {etiqueta}
    </span>
  );
}
