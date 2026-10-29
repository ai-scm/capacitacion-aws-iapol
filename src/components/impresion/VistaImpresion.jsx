/**
 * VistaImpresion — exportación a PDF de las sesiones mediante impresión del
 * navegador.
 *
 * Renderiza, fuera del flujo visible de la aplicación, TODAS las diapositivas
 * de las sesiones solicitadas (A, B o ambas) una debajo de otra, cada una con
 * su layout real (reutilizando `resolverLayout`) y, a diferencia de la vista en
 * pantalla, con sus NOTAS DEL INSTRUCTOR incluidas. El objetivo es que el
 * usuario use "Imprimir → Guardar como PDF" del navegador para obtener el PDF
 * de la(s) sesión(es) con notas.
 *
 * Esta vista NO introduce dependencias nuevas: el PDF lo genera el propio
 * navegador. Los estilos de paginación (una diapositiva por página, ocultar la
 * UI normal al imprimir) viven en `VistaImpresion.css` dentro de un bloque
 * `@media print`.
 *
 * Importante sobre las notas del instructor: en la vista de diapositivas normal
 * las notas son privadas (nunca se renderizan). Aquí se incluyen de forma
 * deliberada porque el usuario pidió explícitamente exportar el PDF CON notas;
 * el bloque de notas se marca con la clase `vista-impresion__notas` y un
 * encabezado explícito para que quede claro que son material del instructor.
 *
 * @module components/impresion/VistaImpresion
 */

import { createElement } from 'react';

import { SESIONES } from '../../context/AppContext.jsx';
import { resolverLayout } from '../slides/layouts/index.js';
import './VistaImpresion.css';

/**
 * Mapa de alcances de exportación a la lista de números de sesión que incluyen.
 * @type {Readonly<Record<'A'|'B'|'ambas', ReadonlyArray<1|2>>>}
 */
export const ALCANCES_IMPRESION = Object.freeze({
  A: [1],
  B: [2],
  ambas: [1, 2],
});

/**
 * Bloque de notas del instructor de una diapositiva. Devuelve `null` cuando la
 * diapositiva no tiene notas.
 *
 * @param {{ notas?: string }} props
 * @returns {import('react').ReactElement | null}
 */
function NotasInstructor({ notas }) {
  if (typeof notas !== 'string' || notas.trim() === '') {
    return null;
  }
  return (
    <aside className="vista-impresion__notas" aria-label="Notas del instructor">
      <h3 className="vista-impresion__notas-titulo">Notas del instructor</h3>
      <p className="vista-impresion__notas-texto">{notas}</p>
    </aside>
  );
}

/**
 * Una página imprimible: la diapositiva renderizada con su layout real y, a
 * continuación, sus notas del instructor.
 *
 * @param {object} props
 * @param {object} props.diapositiva - Diapositiva de datos de la sesión.
 * @param {number} props.numero - Número (1-based) de la diapositiva en la sesión.
 * @param {number} props.total - Total de diapositivas de la sesión.
 * @param {string} props.tituloSesion - Título de la sesión a la que pertenece.
 * @returns {import('react').ReactElement}
 */
function PaginaImpresion({ diapositiva, numero, total, tituloSesion }) {
  const Layout = resolverLayout(diapositiva.layout);
  return (
    <article className="vista-impresion__pagina">
      <div className="vista-impresion__marca">
        <span className="vista-impresion__marca-sesion">{tituloSesion}</span>
        <span className="vista-impresion__marca-indice">
          {numero} / {total}
        </span>
      </div>
      <div className="vista-impresion__diapositiva">
        {createElement(Layout, { diapositiva })}
      </div>
      <NotasInstructor notas={diapositiva.notasInstructor} />
    </article>
  );
}

/**
 * Vista de impresión completa para un alcance dado.
 *
 * @param {object} props
 * @param {'A'|'B'|'ambas'} [props.alcance='ambas'] - Qué sesiones incluir.
 * @returns {import('react').ReactElement}
 */
export default function VistaImpresion({ alcance = 'ambas' }) {
  const sesiones = (ALCANCES_IMPRESION[alcance] ?? ALCANCES_IMPRESION.ambas)
    .map((n) => SESIONES[n])
    .filter(Boolean);

  return (
    <div className="vista-impresion" role="document">
      {sesiones.map((sesion) => {
        const diapositivas = Array.isArray(sesion.diapositivas)
          ? sesion.diapositivas
          : [];
        return (
          <section
            key={sesion.id ?? sesion.titulo}
            className="vista-impresion__sesion"
            aria-label={sesion.titulo}
          >
            {diapositivas.map((diapositiva, indice) => (
              <PaginaImpresion
                key={diapositiva.id ?? `${sesion.id}-${indice}`}
                diapositiva={diapositiva}
                numero={indice + 1}
                total={diapositivas.length}
                tituloSesion={sesion.titulo}
              />
            ))}
          </section>
        );
      })}
    </div>
  );
}
