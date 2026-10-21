/**
 * LayoutTitulo — diapositiva de portada / separador.
 *
 * Presenta un título prominente sobre fondo de marca y, debajo, los bloques de
 * contenido de la diapositiva (habitualmente un texto introductorio y una nota
 * de contexto). Se usa para las portadas de sesión y las diapositivas de
 * transición entre bloques temáticos.
 *
 * Nunca renderiza `notasInstructor`: esas notas son privadas del
 * Modo_Presentador (R5.8 / Property 5) y no deben aparecer en la vista pública.
 *
 * @module components/slides/layouts/LayoutTitulo
 */

import BloqueRenderer from './BloqueRenderer.jsx';
import './layouts.css';

/**
 * @param {object} props
 * @param {import('../../../data/sesiones/sesion1.js').Diapositiva} props.diapositiva
 * @returns {import('react').ReactElement}
 */
export default function LayoutTitulo({ diapositiva }) {
  return (
    <section className="layout layout--titulo" aria-label={diapositiva.titulo}>
      <h1 className="layout__titulo">{diapositiva.titulo}</h1>
      <div className="layout__cuerpo">
        <BloqueRenderer contenido={diapositiva.contenido} />
      </div>
    </section>
  );
}
