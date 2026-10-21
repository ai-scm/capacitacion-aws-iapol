/**
 * Centro de Recursos (CentroRecursos) — R16.
 *
 * Lista los enlaces a documentación oficial definidos en el dominio de datos
 * (`src/data/recursos/enlaces.js`). Incluye obligatoriamente NYC TLC Trip
 * Record Data, Amazon Athena y Amazon Quick (QuickSight) (R16.1).
 *
 * Cada recurso se presenta como un enlace `<a>` con `target="_blank"` y
 * `rel="noopener noreferrer"`, de modo que al seleccionarlo se abre en una
 * pestaña del navegador distinta de la Plataforma (R16.2). El atributo
 * `rel="noopener noreferrer"` evita que la pestaña destino acceda a
 * `window.opener` y reduce la filtración del referer (buena práctica de
 * seguridad, R23).
 *
 * Se muestra, de forma permanente, una nota que indica que los enlaces son
 * fuentes de consulta que deben revisarse para confirmar funciones, permisos y
 * pasos exactos (R16.3).
 *
 * Seguridad (R23.4): todo el contenido es estático y controlado por el
 * proyecto; NO se usa `dangerouslySetInnerHTML`. No hay conexiones en tiempo de
 * ejecución: los enlaces solo se abren cuando el usuario lo solicita
 * explícitamente.
 *
 * Requisitos cubiertos: 16.1, 16.2, 16.3.
 */

import './CentroRecursos.css';
import { enlaces, notaFuentes } from '../../data/recursos/enlaces.js';

/**
 * Tarjeta individual de un recurso externo.
 *
 * El enlace abre el recurso en una pestaña nueva (`target="_blank"`) con
 * `rel="noopener noreferrer"` (R16.2). El texto accesible del enlace indica que
 * se abre en una pestaña nueva para que las tecnologías de asistencia lo
 * anuncien correctamente.
 *
 * @param {object} props
 * @param {{ titulo: string, url: string, descripcion?: string }} props.enlace
 * @param {string} props.descripcionId - Id del elemento de descripción para `aria-describedby`.
 * @returns {import('react').ReactElement}
 */
function TarjetaRecurso({ enlace, descripcionId }) {
  const { titulo, url, descripcion } = enlace;

  return (
    <li className="centro-recursos__item">
      <article className="centro-recursos__tarjeta">
        <h3 className="centro-recursos__titulo">
          <a
            className="centro-recursos__enlace"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-describedby={descripcion ? descripcionId : undefined}
          >
            {titulo}
            <span className="centro-recursos__nueva-pestana" aria-hidden="true">
              {' \u2197'}
            </span>
            <span className="centro-recursos__sr-only">
              {' '}
              (se abre en una pestaña nueva)
            </span>
          </a>
        </h3>

        {descripcion ? (
          <p className="centro-recursos__descripcion" id={descripcionId}>
            {descripcion}
          </p>
        ) : null}

        <p className="centro-recursos__url" aria-hidden="true">
          {url}
        </p>
      </article>
    </li>
  );
}

/**
 * Sección del Centro de Recursos con enlaces a documentación oficial.
 *
 * @param {object} [props]
 * @param {string} [props.className] - Clases CSS adicionales opcionales.
 * @returns {import('react').ReactElement}
 */
export default function CentroRecursos({ className = '' }) {
  const clases = ['centro-recursos', className].filter(Boolean).join(' ');

  return (
    <section className={clases} aria-label="Centro de recursos">
      <header className="centro-recursos__encabezado">
        <h2 className="centro-recursos__encabezado-titulo">
          Centro de recursos
        </h2>
        <p className="centro-recursos__encabezado-subtitulo">
          Enlaces a la documentación oficial para ampliar y verificar la
          información presentada. Se abren en una pestaña nueva del navegador.
        </p>
      </header>

      <p className="centro-recursos__nota-fuentes" role="note">
        {notaFuentes}
      </p>

      <ul className="centro-recursos__lista">
        {enlaces.map((enlace, indice) => (
          <TarjetaRecurso
            key={enlace.url}
            enlace={enlace}
            descripcionId={`centro-recursos-desc-${indice}`}
          />
        ))}
      </ul>
    </section>
  );
}
