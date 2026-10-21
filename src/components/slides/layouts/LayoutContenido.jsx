/**
 * LayoutContenido — diapositiva de contenido general.
 *
 * Layout por defecto para diapositivas con título y bloques de contenido
 * (texto, listas, código, notas, imágenes). Es también el fallback para
 * cualquier `layout` no reconocido.
 *
 * Nunca renderiza `notasInstructor` (R5.8 / Property 5).
 *
 * @module components/slides/layouts/LayoutContenido
 */

import BloqueRenderer from './BloqueRenderer.jsx';
import './layouts.css';

/**
 * @param {object} props
 * @param {import('../../../data/sesiones/sesion1.js').Diapositiva} props.diapositiva
 * @returns {import('react').ReactElement}
 */
export default function LayoutContenido({ diapositiva }) {
  return (
    <section className="layout layout--contenido" aria-label={diapositiva.titulo}>
      <h2 className="layout__titulo">{diapositiva.titulo}</h2>
      <div className="layout__cuerpo">
        <BloqueRenderer contenido={diapositiva.contenido} />
      </div>
    </section>
  );
}
