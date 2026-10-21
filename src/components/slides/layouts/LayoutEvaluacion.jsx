/**
 * LayoutEvaluacion — diapositiva de evaluación (vista pública).
 *
 * Presenta el título y el contenido de la diapositiva de evaluación. El motor
 * interactivo `MotorEvaluacion` se cablea en la tarea 12.1; aquí la vista de
 * diapositivas solo presenta el contenido pedagógico de la diapositiva.
 *
 * @module components/slides/layouts/LayoutEvaluacion
 */

import LayoutEspecializado from './LayoutEspecializado.jsx';

/**
 * @param {object} props
 * @param {import('../../../data/sesiones/sesion1.js').Diapositiva} props.diapositiva
 * @returns {import('react').ReactElement}
 */
export default function LayoutEvaluacion({ diapositiva }) {
  return <LayoutEspecializado diapositiva={diapositiva} variante="evaluacion" />;
}
