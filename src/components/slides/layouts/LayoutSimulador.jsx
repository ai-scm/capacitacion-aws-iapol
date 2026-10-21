/**
 * LayoutSimulador — diapositiva del Simulador de dashboards (vista pública).
 *
 * Presenta el título y el contenido de la diapositiva, marcados con la insignia
 * de "Simulación local" (R21.4): el simulador no reproduce la interfaz oficial
 * de Amazon Quick ni configura datasets reales. El componente interactivo
 * `SimuladorDashboards` se cablea en la tarea 11.1.
 *
 * @module components/slides/layouts/LayoutSimulador
 */

import LayoutEspecializado from './LayoutEspecializado.jsx';
import { PLANOS } from '../../common/BadgePlano.jsx';

/**
 * @param {object} props
 * @param {import('../../../data/sesiones/sesion1.js').Diapositiva} props.diapositiva
 * @returns {import('react').ReactElement}
 */
export default function LayoutSimulador({ diapositiva }) {
  return (
    <LayoutEspecializado
      diapositiva={diapositiva}
      variante="simulador"
      plano={PLANOS.SIMULACION_LOCAL}
    />
  );
}
