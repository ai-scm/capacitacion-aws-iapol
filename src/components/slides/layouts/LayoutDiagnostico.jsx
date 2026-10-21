/**
 * LayoutDiagnostico — diapositiva de casos de diagnóstico (vista pública).
 *
 * Presenta el título y el contenido de la diapositiva (casos de diagnóstico y
 * sus causas posibles), marcado con la insignia del proceso institucional IAPOL
 * (R21.1) y una nota al pie que recuerda que son causas posibles y no un
 * diagnóstico definitivo (R19.3). El componente `CasosDiagnostico` se cablea en
 * la tarea 12.4.
 *
 * @module components/slides/layouts/LayoutDiagnostico
 */

import LayoutEspecializado from './LayoutEspecializado.jsx';
import { PLANOS } from '../../common/BadgePlano.jsx';

/**
 * @param {object} props
 * @param {import('../../../data/sesiones/sesion1.js').Diapositiva} props.diapositiva
 * @returns {import('react').ReactElement}
 */
export default function LayoutDiagnostico({ diapositiva }) {
  return (
    <LayoutEspecializado
      diapositiva={diapositiva}
      variante="diagnostico"
      plano={PLANOS.IAPOL}
      pie="Los diagnósticos presentan causas posibles y no un diagnóstico definitivo sin evidencia del entorno."
    />
  );
}
