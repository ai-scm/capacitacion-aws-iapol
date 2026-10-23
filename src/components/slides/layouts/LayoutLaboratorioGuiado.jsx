/**
 * LayoutLaboratorioGuiado — diapositiva de laboratorio práctico "hazlo tú".
 *
 * Pensada para contenido técnico de nivel avanzado (paso a paso real con
 * capturas): presenta el título, una insignia de nivel (p. ej. 400) y, cuando
 * aplica, la insignia de plano, seguidos de los bloques de contenido —que
 * típicamente incluyen bloques `pasos`, `callout` y `captura`.
 *
 * Reutiliza la base común {@link LayoutEspecializado} y solo fija la variante
 * de estilo y un pie recordatorio de que los ejemplos deben ajustarse al
 * entorno real.
 *
 * @module components/slides/layouts/LayoutLaboratorioGuiado
 */

import LayoutEspecializado from './LayoutEspecializado.jsx';

/**
 * @param {object} props
 * @param {import('../../../data/sesiones/sesion1.js').Diapositiva} props.diapositiva
 * @returns {import('react').ReactElement}
 */
export default function LayoutLaboratorioGuiado({ diapositiva }) {
  return (
    <LayoutEspecializado
      diapositiva={diapositiva}
      variante="laboratorio-guiado"
      plano={diapositiva.plano}
      pie={
        diapositiva.pie ??
        'Laboratorio práctico. Ajuste nombres de cuenta, buckets, bases y permisos a su entorno real antes de ejecutar.'
      }
    />
  );
}
