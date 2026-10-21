/**
 * LayoutSQL — diapositiva de explicaciones SQL (vista pública).
 *
 * Presenta el título y los bloques de contenido (habitualmente bloques de
 * código SQL y notas de "ejemplo didáctico sujeto a comprobación de esquema").
 * El componente `ExplicacionesSQL` se cablea en la tarea 10.2.
 *
 * @module components/slides/layouts/LayoutSQL
 */

import LayoutEspecializado from './LayoutEspecializado.jsx';

/**
 * @param {object} props
 * @param {import('../../../data/sesiones/sesion1.js').Diapositiva} props.diapositiva
 * @returns {import('react').ReactElement}
 */
export default function LayoutSQL({ diapositiva }) {
  return (
    <LayoutEspecializado
      diapositiva={diapositiva}
      variante="sql"
      pie="Ejemplo didáctico sujeto a comprobación del esquema y tipos reales antes de su uso en producción."
    />
  );
}
