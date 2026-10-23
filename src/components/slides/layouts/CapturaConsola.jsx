/**
 * CapturaConsola — marco tipo "captura de consola" con reserva (placeholder).
 *
 * Presenta una captura de pantalla (p. ej. de la consola de AWS o del portal
 * IAPOL) dentro de un marco con barra superior, numeración opcional de la
 * secuencia y leyenda. Si la imagen aún no existe o falla su carga, muestra un
 * marcador de posición que indica QUÉ captura se espera y la RUTA exacta donde
 * debe colocarse el archivo (en `public/img/...`). Así el paso a paso queda
 * completo y la persona que imparte solo tiene que soltar el PNG.
 *
 * Seguridad: no usa `dangerouslySetInnerHTML`; todo es texto controlado por el
 * proyecto. La imagen referencia rutas locales empaquetadas (sin CDN).
 *
 * @module components/slides/layouts/CapturaConsola
 */

import { useState } from 'react';

/**
 * @param {object} props
 * @param {string} [props.src] - Ruta local de la captura (en `public/img/...`).
 * @param {string} props.descripcion - Qué muestra (obligatorio; sirve de alt y
 *   de texto del placeholder).
 * @param {number} [props.numero] - Número de paso/secuencia a mostrar en la barra.
 * @param {string} [props.leyenda] - Pie de la captura.
 * @returns {import('react').ReactElement}
 */
export default function CapturaConsola({ src, descripcion, numero, leyenda }) {
  const [fallo, setFallo] = useState(false);
  const faltante = !src || fallo;

  return (
    <figure className="captura">
      <div className="captura__marco">
        <div className="captura__barra" aria-hidden="true">
          <span className="captura__semaforo captura__semaforo--r" />
          <span className="captura__semaforo captura__semaforo--a" />
          <span className="captura__semaforo captura__semaforo--v" />
          {typeof numero === 'number' ? (
            <span className="captura__paso">Paso {numero}</span>
          ) : null}
        </div>

        {faltante ? (
          <div className="captura__placeholder" role="img" aria-label={descripcion}>
            <span className="captura__placeholder-icono" aria-hidden="true">
              📷
            </span>
            <p className="captura__placeholder-titulo">Captura pendiente</p>
            <p className="captura__placeholder-desc">{descripcion}</p>
            {src ? (
              <code className="captura__placeholder-ruta">{src}</code>
            ) : null}
          </div>
        ) : (
          <img
            className="captura__img"
            src={src}
            alt={descripcion}
            onError={() => setFallo(true)}
          />
        )}
      </div>
      {leyenda ? (
        <figcaption className="captura__leyenda">
          {typeof numero === 'number' ? `${numero}. ` : ''}
          {leyenda}
        </figcaption>
      ) : null}
    </figure>
  );
}
