/**
 * ModoPresentador — vista del presentador (R5.1, R5.2, R5.3, R5.7, R5.8).
 *
 * Vista privada del Instructor que, para la diapositiva actual, muestra:
 *  - las notas del Instructor (R5.1),
 *  - los objetivos de aprendizaje (R5.2),
 *  - el temporizador de sesión (R5.3–R5.6, delegado en {@link Temporizador}),
 *  - una vista previa de la siguiente diapositiva (R5.7, delegado en
 *    {@link VistaPreviaSiguiente}).
 *
 * Privacidad (R5.8 / Property 5): las notas del Instructor se renderizan
 * EXCLUSIVAMENTE en esta vista. La vista pública (`VistaDiapositivas`) nunca
 * incluye `notasInstructor` en su DOM; aquí es el único lugar donde aparecen.
 *
 * Ubicación de la vista — ventana secundaria con fallback a superposición:
 *  - Al activarse, se intenta abrir una VENTANA SECUNDARIA con `window.open`. Si
 *    el navegador la concede, la UI del presentador se "portaliza"
 *    (`createPortal`) al documento de esa ventana, replicando las hojas de
 *    estilo de la aplicación para conservar el tema. La ventana pública queda
 *    así libre para proyectar solo las diapositivas.
 *  - Si `window.open` no está disponible o el navegador BLOQUEA la ventana
 *    emergente (devuelve `null`), se recurre a una SUPERPOSICIÓN dividida dentro
 *    de la misma pestaña (un panel lateral sobre la vista actual). El fallback
 *    es siempre funcional: el Instructor nunca se queda sin su vista.
 *
 * El estado del Modo_Presentador y el temporizador viven en
 * `PresentadorContext`; la diapositiva actual y la sesión, en `AppContext`.
 * Este componente no gestiona la sincronización entre vistas (eso lo resuelve el
 * contexto vía BroadcastChannel/storage): solo decide DÓNDE pintar su UI.
 *
 * Requisitos cubiertos: 5.1, 5.2, 5.3, 5.7, 5.8.
 *
 * @module components/presentador/ModoPresentador
 */

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { useApp } from '../../context/AppContext.jsx';
import { usePresentador } from '../../context/PresentadorContext.jsx';
import Temporizador from './Temporizador.jsx';
import VistaPreviaSiguiente from './VistaPreviaSiguiente.jsx';
import './ModoPresentador.css';

/** Nombre de la ventana secundaria del presentador. */
const NOMBRE_VENTANA = 'presentador-capacitacion-aws-iapol';

/** Características de la ventana secundaria (tamaño cómodo para notas). */
const CARACTERISTICAS_VENTANA = 'width=960,height=720,menubar=no,toolbar=no,location=no';

/**
 * Copia las hojas de estilo del documento principal a la ventana secundaria.
 *
 * Replica los `<link rel="stylesheet">` y los `<style>` del documento de origen
 * en el documento destino para que la UI portalizada conserve el tema de la
 * aplicación. Es best-effort: cualquier fallo (p. ej. estilos de origen cruzado)
 * se ignora sin romper la apertura de la ventana.
 *
 * @param {Document} origen - Documento de la aplicación.
 * @param {Document} destino - Documento de la ventana secundaria.
 * @returns {void}
 */
function copiarEstilos(origen, destino) {
  try {
    const nodos = origen.querySelectorAll('link[rel="stylesheet"], style');
    nodos.forEach((nodo) => {
      destino.head.appendChild(nodo.cloneNode(true));
    });
  } catch {
    /* replicación de estilos best-effort */
  }
}

/**
 * Hook interno: gestiona la ventana secundaria del presentador.
 *
 * Mientras `activo` es verdadero, intenta abrir (una sola vez) una ventana
 * secundaria y preparar en ella un contenedor donde portalizar la UI. Devuelve
 * el nodo contenedor de la ventana (o `null` si no hay ventana disponible, lo
 * que activa el fallback de superposición). Al desactivarse o desmontarse,
 * cierra la ventana y limpia los recursos.
 *
 * @param {boolean} activo - Si el Modo_Presentador está activo.
 * @param {() => void} alCerrarVentana - Se invoca si el usuario cierra la
 *   ventana secundaria manualmente, para desactivar el modo.
 * @returns {HTMLElement | null} El contenedor de la ventana, o `null`.
 */
function useVentanaPresentador(activo, alCerrarVentana) {
  const [contenedor, setContenedor] = useState(/** @type {HTMLElement | null} */ (null));
  const ventanaRef = useRef(/** @type {Window | null} */ (null));
  const alCerrarRef = useRef(alCerrarVentana);

  // Mantiene la última referencia del callback sin re-ejecutar el efecto.
  useEffect(() => {
    alCerrarRef.current = alCerrarVentana;
  }, [alCerrarVentana]);

  useEffect(() => {
    if (!activo) {
      return undefined;
    }

    if (typeof window === 'undefined' || typeof window.open !== 'function') {
      // Entorno sin ventanas: fallback de superposición.
      return undefined;
    }

    let ventana = null;
    try {
      ventana = window.open('', NOMBRE_VENTANA, CARACTERISTICAS_VENTANA);
    } catch {
      ventana = null;
    }

    // Ventana bloqueada o no concedida: se usará el fallback de superposición.
    if (!ventana) {
      return undefined;
    }

    ventanaRef.current = ventana;

    try {
      const doc = ventana.document;
      doc.title = 'Modo presentador — Capacitación AWS/IAPOL';
      // Reinicia el cuerpo por si la ventana se reutiliza entre aperturas.
      doc.body.innerHTML = '';
      copiarEstilos(document, doc);

      const nodo = doc.createElement('div');
      nodo.className = 'modo-presentador-ventana';
      doc.body.appendChild(nodo);
      // Sincroniza un sistema externo (la ventana secundaria recién abierta) con
      // React para poder portalizar la UI a su documento. El nodo contenedor solo
      // existe tras abrir la ventana de forma imperativa, por lo que la
      // actualización de estado aquí es intencional y ocurre una única vez por
      // apertura (no genera renders en cascada).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setContenedor(nodo);
    } catch {
      // No se pudo preparar la ventana: cae al fallback de superposición.
      try {
        ventana.close();
      } catch {
        /* cierre best-effort */
      }
      ventanaRef.current = null;
      setContenedor(null);
      return undefined;
    }

    // Si el Instructor cierra la ventana manualmente, desactiva el modo.
    const vigilante = setInterval(() => {
      if (ventanaRef.current && ventanaRef.current.closed) {
        clearInterval(vigilante);
        ventanaRef.current = null;
        setContenedor(null);
        alCerrarRef.current?.();
      }
    }, 500);

    return () => {
      clearInterval(vigilante);
      setContenedor(null);
      const ref = ventanaRef.current;
      ventanaRef.current = null;
      if (ref && !ref.closed) {
        try {
          ref.close();
        } catch {
          /* cierre best-effort */
        }
      }
    };
  }, [activo]);

  return contenedor;
}

/**
 * Contenido de la vista del presentador (notas, objetivos, temporizador y
 * vista previa de la siguiente diapositiva).
 *
 * Es agnóstico del lugar donde se monta: lo usan tanto la ventana secundaria
 * (vía portal) como el fallback de superposición.
 *
 * @param {object} props
 * @param {() => void} props.onCerrar - Cierra el Modo_Presentador.
 * @returns {import('react').ReactElement}
 */
function ContenidoPresentador({ onCerrar }) {
  const { sesion, diapositivaActual, indiceDiapositiva, totalDiapositivas } = useApp();

  const titulo = diapositivaActual?.titulo ?? '';
  const objetivos = Array.isArray(diapositivaActual?.objetivos)
    ? diapositivaActual.objetivos
    : [];
  const notas =
    typeof diapositivaActual?.notasInstructor === 'string'
      ? diapositivaActual.notasInstructor
      : '';

  return (
    <div className="modo-presentador" aria-label="Modo presentador">
      <header className="modo-presentador__cabecera">
        <div className="modo-presentador__contexto">
          <span className="modo-presentador__sesion">{sesion?.titulo ?? 'Sesión'}</span>
          {totalDiapositivas > 0 ? (
            <span className="modo-presentador__posicion">
              {indiceDiapositiva + 1} de {totalDiapositivas}
            </span>
          ) : null}
        </div>
        <button
          type="button"
          className="modo-presentador__cerrar"
          onClick={onCerrar}
        >
          Cerrar modo presentador
        </button>
      </header>

      {!diapositivaActual ? (
        <p className="modo-presentador__vacio">
          No hay una diapositiva activa para presentar.
        </p>
      ) : (
        <div className="modo-presentador__cuerpo">
          <div className="modo-presentador__principal">
            <h2 className="modo-presentador__titulo">{titulo}</h2>

            <section
              className="modo-presentador__objetivos"
              aria-label="Objetivos de aprendizaje"
            >
              <h3 className="modo-presentador__subtitulo">Objetivos</h3>
              {objetivos.length > 0 ? (
                <ul className="modo-presentador__lista-objetivos">
                  {objetivos.map((objetivo, indice) => (
                    <li key={indice}>{objetivo}</li>
                  ))}
                </ul>
              ) : (
                <p className="modo-presentador__sin-datos">
                  Sin objetivos para esta diapositiva.
                </p>
              )}
            </section>

            <section
              className="modo-presentador__notas"
              aria-label="Notas del instructor"
            >
              <h3 className="modo-presentador__subtitulo">Notas del instructor</h3>
              {notas ? (
                <p className="modo-presentador__notas-texto">{notas}</p>
              ) : (
                <p className="modo-presentador__sin-datos">
                  Sin notas para esta diapositiva.
                </p>
              )}
            </section>
          </div>

          <aside className="modo-presentador__lateral">
            <Temporizador />
            <VistaPreviaSiguiente />
          </aside>
        </div>
      )}
    </div>
  );
}

/**
 * Modo presentador.
 *
 * Decide dónde pintar la UI del presentador (ventana secundaria vía portal o
 * superposición dividida de respaldo) y la renderiza solo cuando el modo está
 * activo. Fuera de ese estado no renderiza nada.
 *
 * @returns {import('react').ReactElement | null}
 */
export default function ModoPresentador() {
  const { presentadorActivo, cerrarPresentador } = usePresentador();
  const contenedorVentana = useVentanaPresentador(presentadorActivo, cerrarPresentador);

  if (!presentadorActivo) {
    return null;
  }

  const contenido = <ContenidoPresentador onCerrar={cerrarPresentador} />;

  // Camino preferente: ventana secundaria concedida → portal a su documento.
  if (contenedorVentana) {
    return createPortal(contenido, contenedorVentana);
  }

  // Fallback: superposición dividida dentro de la misma pestaña.
  return (
    <div className="modo-presentador-overlay" role="dialog" aria-modal="false" aria-label="Modo presentador">
      <div className="modo-presentador-overlay__panel">{contenido}</div>
    </div>
  );
}
