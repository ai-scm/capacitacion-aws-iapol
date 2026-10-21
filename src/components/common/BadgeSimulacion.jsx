/**
 * Insignia de Simulación local (BadgeSimulacion) — R21.4.
 *
 * Componente de conveniencia que renderiza siempre la insignia del plano
 * "Simulación local". Se usa para identificar de forma permanente las vistas y
 * componentes que imitan a Amazon Athena, Amazon Quick o IAPOL sin ejecutar
 * operaciones reales, de modo que no se confundan con operaciones reales (R21.4).
 *
 * Envuelve {@link BadgePlano} con `plano="simulacion-local"` para reutilizar sus
 * estilos y marcado accesible.
 *
 * Requisitos cubiertos: 21.4 (identificar cada Simulación como tal).
 */

import BadgePlano, { PLANOS } from './BadgePlano.jsx';

/**
 * Insignia permanente de "Simulación local".
 *
 * @param {object} props
 * @param {string} [props.className] - Clases CSS adicionales opcionales.
 * @returns {import('react').ReactElement} La insignia de Simulación local.
 */
export default function BadgeSimulacion({ className = '' }) {
  return <BadgePlano plano={PLANOS.SIMULACION_LOCAL} className={className} />;
}
