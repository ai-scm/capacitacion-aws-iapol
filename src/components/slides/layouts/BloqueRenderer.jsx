/**
 * BloqueRenderer — renderizador compartido de bloques de contenido.
 *
 * Convierte los bloques estructurados de una diapositiva (`Bloque[]`, ver el
 * JSDoc de `src/data/sesiones/sesion1.js`) en marcado React. Es la pieza común
 * reutilizada por todos los sub-componentes de layout, de modo que el contenido
 * (`texto`, `lista`, `codigo`, `nota`, `imagen`) se presente de forma uniforme
 * independientemente del `layout` de la diapositiva.
 *
 * Seguridad (R23.4): el contenido es estático y controlado por el proyecto. No
 * se usa `dangerouslySetInnerHTML`; todo el texto se inserta como nodos de texto
 * de React (escapado automático). Las imágenes referencian rutas locales
 * empaquetadas, nunca una CDN en runtime (R23.3).
 *
 * @module components/slides/layouts/BloqueRenderer
 */

import './BloqueRenderer.css';

/**
 * Renderiza un único bloque de contenido según su `tipo`.
 *
 * @param {object} props
 * @param {import('../../../data/sesiones/sesion1.js').Bloque} props.bloque
 * @returns {import('react').ReactElement|null}
 */
function Bloque({ bloque }) {
  if (!bloque || typeof bloque !== 'object') {
    return null;
  }

  switch (bloque.tipo) {
    case 'texto':
      return <p className="bloque bloque-texto">{bloque.texto}</p>;

    case 'lista': {
      const items = Array.isArray(bloque.items) ? bloque.items : [];
      if (bloque.ordenada) {
        return (
          <ol className="bloque bloque-lista bloque-lista--ordenada">
            {items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ol>
        );
      }
      return (
        <ul className="bloque bloque-lista">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    }

    case 'codigo':
      return (
        <pre
          className="bloque bloque-codigo"
          data-lenguaje={bloque.lenguaje || undefined}
        >
          <code>{bloque.codigo}</code>
        </pre>
      );

    case 'nota': {
      const variante = bloque.variante || 'info';
      return (
        <aside
          className={`bloque bloque-nota bloque-nota--${variante}`}
          role="note"
        >
          {bloque.texto}
        </aside>
      );
    }

    case 'imagen':
      return (
        <figure className="bloque bloque-imagen">
          <img src={bloque.src} alt={bloque.alt || ''} />
          {bloque.leyenda ? (
            <figcaption>{bloque.leyenda}</figcaption>
          ) : null}
        </figure>
      );

    default:
      // Tipo de bloque desconocido: no se renderiza nada (fallo seguro).
      return null;
  }
}

/**
 * Renderiza una secuencia de bloques de contenido.
 *
 * @param {object} props
 * @param {import('../../../data/sesiones/sesion1.js').Bloque[]} [props.contenido]
 *   Lista de bloques a renderizar.
 * @param {string} [props.className] - Clases adicionales del contenedor.
 * @returns {import('react').ReactElement|null}
 */
export default function BloqueRenderer({ contenido, className = '' }) {
  if (!Array.isArray(contenido) || contenido.length === 0) {
    return null;
  }

  const clases = ['bloques', className].filter(Boolean).join(' ');

  return (
    <div className={clases}>
      {contenido.map((bloque, i) => (
        <Bloque key={bloque?.id ?? i} bloque={bloque} />
      ))}
    </div>
  );
}
