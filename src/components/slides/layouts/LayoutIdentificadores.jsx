/**
 * LayoutIdentificadores — diapositiva de identificadores IAPOL (vista pública).
 *
 * Presenta el título y el contenido de la diapositiva (Dataset ID, Analysis ID,
 * Dashboard ID, id_portal, id_quicksight y sus advertencias de corroboración),
 * marcado con la insignia del proceso institucional IAPOL (R21.1). El componente
 * `IdentificadoresIAPOL` se cablea en la tarea 12.4.
 *
 * @module components/slides/layouts/LayoutIdentificadores
 */

import LayoutEspecializado from './LayoutEspecializado.jsx';
import { PLANOS } from '../../common/BadgePlano.jsx';

/**
 * @param {object} props
 * @param {import('../../../data/sesiones/sesion1.js').Diapositiva} props.diapositiva
 * @returns {import('react').ReactElement}
 */
export default function LayoutIdentificadores({ diapositiva }) {
  return (
    <LayoutEspecializado
      diapositiva={diapositiva}
      variante="identificadores"
      plano={PLANOS.IAPOL}
    />
  );
}
