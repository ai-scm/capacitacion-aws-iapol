/**
 * Registro de layouts de diapositiva.
 *
 * Mapea cada valor del campo `layout` de una diapositiva (ver el JSDoc de
 * `src/data/sesiones/sesion1.js`) a su sub-componente de presentación. La vista
 * de diapositivas (`VistaDiapositivas`) selecciona el componente adecuado a
 * partir de este mapa; para cualquier `layout` no reconocido se usa el layout
 * de contenido genérico como fallback seguro.
 *
 * @module components/slides/layouts
 */

import LayoutTitulo from './LayoutTitulo.jsx';
import LayoutContenido from './LayoutContenido.jsx';
import LayoutDiagrama from './LayoutDiagrama.jsx';
import LayoutSQL from './LayoutSQL.jsx';
import LayoutLaboratorio from './LayoutLaboratorio.jsx';
import LayoutSimulador from './LayoutSimulador.jsx';
import LayoutIdentificadores from './LayoutIdentificadores.jsx';
import LayoutDiagnostico from './LayoutDiagnostico.jsx';
import LayoutEvaluacion from './LayoutEvaluacion.jsx';

export {
  LayoutTitulo,
  LayoutContenido,
  LayoutDiagrama,
  LayoutSQL,
  LayoutLaboratorio,
  LayoutSimulador,
  LayoutIdentificadores,
  LayoutDiagnostico,
  LayoutEvaluacion,
};

/**
 * Mapa `layout` → componente de presentación.
 *
 * @type {Readonly<Record<string, import('react').ComponentType<{ diapositiva: object }>>>}
 */
export const LAYOUTS = Object.freeze({
  titulo: LayoutTitulo,
  contenido: LayoutContenido,
  diagrama: LayoutDiagrama,
  sql: LayoutSQL,
  laboratorio: LayoutLaboratorio,
  simulador: LayoutSimulador,
  identificadores: LayoutIdentificadores,
  diagnostico: LayoutDiagnostico,
  evaluacion: LayoutEvaluacion,
});

/**
 * Componente de fallback para un `layout` no reconocido.
 * @type {import('react').ComponentType<{ diapositiva: object }>}
 */
export const LAYOUT_FALLBACK = LayoutContenido;

/**
 * Resuelve el componente de layout para un valor de `layout` dado.
 *
 * @param {string} layout - Valor del campo `layout` de la diapositiva.
 * @returns {import('react').ComponentType<{ diapositiva: object }>}
 *   El componente de layout correspondiente, o el fallback de contenido.
 */
export function resolverLayout(layout) {
  return LAYOUTS[layout] ?? LAYOUT_FALLBACK;
}
