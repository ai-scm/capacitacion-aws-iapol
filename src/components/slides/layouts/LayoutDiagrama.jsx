/**
 * LayoutDiagrama — diapositiva del diagrama de arquitectura (vista pública).
 *
 * Presenta el título y los bloques de contenido de la diapositiva de diagrama.
 * El componente interactivo `DiagramaArquitectura` se cablea en la tarea 10.1;
 * aquí solo se renderiza el contenido pedagógico de la diapositiva.
 *
 * @module components/slides/layouts/LayoutDiagrama
 */

import LayoutEspecializado from './LayoutEspecializado.jsx';

/**
 * @param {object} props
 * @param {import('../../../data/sesiones/sesion1.js').Diapositiva} props.diapositiva
 * @returns {import('react').ReactElement}
 */
export default function LayoutDiagrama({ diapositiva }) {
  return <LayoutEspecializado diapositiva={diapositiva} variante="diagrama" />;
}
