/**
 * LayoutLaboratorio — diapositiva del Laboratorio SQL (vista pública).
 *
 * Presenta el título y el contenido de la diapositiva, marcados con la insignia
 * de "Simulación local" (R21.4): los resultados del laboratorio provienen de una
 * simulación local y no de una consulta real a Amazon Athena. El componente
 * interactivo `LaboratorioSQL` se cablea en la tarea 10.3.
 *
 * @module components/slides/layouts/LayoutLaboratorio
 */

import LayoutEspecializado from './LayoutEspecializado.jsx';
import { PLANOS } from '../../common/BadgePlano.jsx';

/**
 * @param {object} props
 * @param {import('../../../data/sesiones/sesion1.js').Diapositiva} props.diapositiva
 * @returns {import('react').ReactElement}
 */
export default function LayoutLaboratorio({ diapositiva }) {
  return (
    <LayoutEspecializado
      diapositiva={diapositiva}
      variante="laboratorio"
      plano={PLANOS.SIMULACION_LOCAL}
    />
  );
}
