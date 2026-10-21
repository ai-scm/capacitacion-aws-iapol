/**
 * LayoutEspecializado — base común de los layouts especializados.
 *
 * Las diapositivas con `layout` especializado (diagrama, sql, laboratorio,
 * simulador, identificadores, diagnostico, evaluacion) comparten una misma
 * estructura en la vista pública de diapositivas: una cabecera con el título y,
 * opcionalmente, una insignia de plano que sitúa el contenido (p. ej.
 * "Simulación local" para laboratorio/simulador), el cuerpo con los bloques de
 * contenido y una nota al pie contextual.
 *
 * Los componentes interactivos profundos (DiagramaArquitectura, LaboratorioSQL,
 * SimuladorDashboards, MotorEvaluacion, etc.) se cablean en sus propias tareas;
 * aquí la vista de diapositivas se limita a presentar el título y los bloques
 * de contenido de la diapositiva de forma sensata.
 *
 * Nunca renderiza `notasInstructor` (R5.8 / Property 5).
 *
 * @module components/slides/layouts/LayoutEspecializado
 */

import BloqueRenderer from './BloqueRenderer.jsx';
import BadgePlano from '../../common/BadgePlano.jsx';
import './layouts.css';

/**
 * @param {object} props
 * @param {import('../../../data/sesiones/sesion1.js').Diapositiva} props.diapositiva
 * @param {string} props.variante - Sufijo de clase del layout (p. ej. 'sql').
 * @param {('quick-real'|'simulacion-local'|'iapol')} [props.plano]
 *   Plano conceptual a señalar con una insignia en la cabecera.
 * @param {string} [props.pie] - Nota al pie contextual opcional.
 * @returns {import('react').ReactElement}
 */
export default function LayoutEspecializado({
  diapositiva,
  variante,
  plano,
  pie,
}) {
  return (
    <section
      className={`layout layout--${variante}`}
      aria-label={diapositiva.titulo}
    >
      <header className="layout__cabecera">
        <h2 className="layout__titulo">{diapositiva.titulo}</h2>
        {plano ? <BadgePlano plano={plano} /> : null}
      </header>
      <div className="layout__cuerpo">
        <BloqueRenderer contenido={diapositiva.contenido} />
      </div>
      {pie ? <p className="layout__pie">{pie}</p> : null}
    </section>
  );
}
