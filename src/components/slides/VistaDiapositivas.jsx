/**
 * VistaDiapositivas (Sistema_Diapositivas) — R2, R6, R17.
 *
 * Vista pública que renderiza la diapositiva actual de la sesión activa dentro
 * de un contenedor con relación de aspecto fija 16:9, resuelve el sub-componente
 * de layout según el campo `layout` de la diapositiva, muestra el indicador
 * "actual de total" y aplica una transición animada (≤600 ms) entre
 * diapositivas respetando la preferencia de movimiento reducido.
 *
 * Dimensionado 16:9 (R2.1, R2.2, R2.3):
 *  - El "marco" (`.vista-diapositivas__marco`) ocupa todo el espacio disponible.
 *  - Un `ResizeObserver` sobre el marco mide su tamaño y
 *    `calcularDimensiones16x9` (lógica de dominio pura) obtiene el ancho/alto de
 *    la diapositiva que conserva 16:9 (tolerancia ≤1% de 1.778) y los desfases
 *    de centrado. Esos valores se aplican por estilo en línea, produciendo
 *    letterboxing/pillarboxing centrado sin recorte ni deformación.
 *  - El `ResizeObserver` se detecta por característica: en entornos sin esa API
 *    (p. ej. jsdom) la diapositiva recurre al dimensionado por CSS
 *    (`aspect-ratio: 16 / 9`) sin fallar.
 *
 * Indicador (R2.4): muestra `indiceDiapositiva + 1` de `totalDiapositivas`.
 *
 * Transición (R6.1, R6.2, R6.3): al cambiar de diapositiva se reinicia la
 * animación de entrada usando las clases `.transicion-diapositiva*` de
 * `base.css`; la duración se topa en `--duracion-transicion-max` (600 ms).
 * Cuando `useReducedMotion()` es `true`, la transición se desactiva.
 *
 * Privacidad (R5.8 / Property 5): esta vista NUNCA renderiza
 * `diapositiva.notasInstructor`; las notas del instructor son exclusivas del
 * Modo_Presentador.
 *
 * Requisitos cubiertos: 2.1, 2.2, 2.3, 2.4, 6.1, 6.2, 6.3.
 *
 * @module components/slides/VistaDiapositivas
 */

import {
  createElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { useApp } from '../../context/AppContext.jsx';
import useReducedMotion from '../../hooks/useReducedMotion.js';
import { calcularDimensiones16x9 } from '../../domain/layout.js';
import { resolverLayout } from './layouts/index.js';
import './VistaDiapositivas.css';

/**
 * Indica si `ResizeObserver` está disponible en el entorno actual.
 * Se usa para degradar con elegancia en jsdom/SSR (R2.2).
 *
 * @returns {boolean}
 */
function resizeObserverDisponible() {
  return typeof ResizeObserver === 'function';
}

/**
 * Hook interno: observa el tamaño del marco y devuelve las dimensiones 16:9 de
 * la diapositiva (ancho, alto y desfases de centrado).
 *
 * Si `ResizeObserver` no está disponible, devuelve `null` para que la vista
 * recurra al dimensionado por CSS (`aspect-ratio`).
 *
 * @param {import('react').RefObject<HTMLElement>} marcoRef - Ref al marco.
 * @returns {import('../../domain/layout.js').DimensionesDiapositiva | null}
 */
function useDimensiones16x9(marcoRef) {
  const [dimensiones, setDimensiones] = useState(null);

  useLayoutEffect(() => {
    const marco = marcoRef.current;
    if (!marco || !resizeObserverDisponible()) {
      // Sin ResizeObserver: la vista usa el fallback CSS (aspect-ratio).
      setDimensiones(null);
      return undefined;
    }

    const medir = () => {
      const { clientWidth, clientHeight } = marco;
      setDimensiones(calcularDimensiones16x9(clientWidth, clientHeight));
    };

    // Medición inicial síncrona para evitar un primer render sin tamaño.
    medir();

    const observador = new ResizeObserver(medir);
    observador.observe(marco);
    return () => observador.disconnect();
  }, [marcoRef]);

  return dimensiones;
}

/**
 * Hook interno: gestiona la clase de transición de entrada de la diapositiva.
 *
 * Al cambiar `clave` (el índice de diapositiva) la diapositiva arranca en
 * estado "entrando" y, en el siguiente frame, pasa a "activa", disparando la
 * transición CSS. El estado inicial de cada ciclo se deriva durante el render a
 * partir de la clave observada (patrón de "ajuste de estado al renderizar"),
 * evitando un `setState` síncrono dentro del efecto. Con movimiento reducido la
 * diapositiva está siempre "activa", de modo que no hay animación perceptible
 * (R6.2).
 *
 * @param {number} clave - Valor que, al cambiar, reinicia la transición.
 * @param {boolean} movimientoReducido - Si se debe desactivar la animación.
 * @returns {boolean} `true` cuando la diapositiva está en estado "activa".
 */
function useTransicionEntrada(clave, movimientoReducido) {
  const [activa, setActiva] = useState(true);
  const [claveAnterior, setClaveAnterior] = useState(clave);

  // Ajuste de estado durante el render (patrón idiomático de React con estado,
  // no con ref): al detectar una clave nueva la diapositiva vuelve a "entrando"
  // antes de pintar; con movimiento reducido permanece "activa".
  if (claveAnterior !== clave) {
    setClaveAnterior(clave);
    setActiva(movimientoReducido);
  }

  useEffect(() => {
    if (movimientoReducido || activa) {
      return undefined;
    }

    // Programa el paso a "activa" en el siguiente frame para disparar la
    // transición CSS desde el estado "entrando".
    const raf =
      typeof requestAnimationFrame === 'function'
        ? requestAnimationFrame
        : (cb) => setTimeout(cb, 0);
    const cancelar =
      typeof cancelAnimationFrame === 'function'
        ? cancelAnimationFrame
        : clearTimeout;

    const rafId = raf(() => setActiva(true));
    return () => cancelar(rafId);
  }, [activa, movimientoReducido]);

  return activa;
}

/**
 * Vista de diapositivas de la sesión activa.
 *
 * @returns {import('react').ReactElement}
 */
export default function VistaDiapositivas() {
  const { sesion, diapositivaActual, indiceDiapositiva, totalDiapositivas } =
    useApp();

  const marcoRef = useRef(null);
  const dimensiones = useDimensiones16x9(marcoRef);
  const movimientoReducido = useReducedMotion();
  const activa = useTransicionEntrada(indiceDiapositiva, movimientoReducido);

  // Sin sesión o sin diapositivas: estado vacío explícito (no es un error).
  if (!sesion || totalDiapositivas < 1 || !diapositivaActual) {
    return (
      <div className="vista-diapositivas vista-diapositivas--vacia">
        <p>No hay una sesión activa para mostrar diapositivas.</p>
      </div>
    );
  }

  const componenteLayout = resolverLayout(diapositivaActual.layout);

  // Estilo del recuadro de la diapositiva: si hay dimensiones calculadas por el
  // ResizeObserver, se fijan en px (centrado por el flex del marco); si no, se
  // recurre al dimensionado por CSS mediante la clase `--auto` (aspect-ratio).
  const estiloDiapositiva = dimensiones
    ? { width: `${dimensiones.ancho}px`, height: `${dimensiones.alto}px` }
    : undefined;

  const clasesDiapositiva = [
    'vista-diapositivas__diapositiva',
    dimensiones ? null : 'vista-diapositivas__diapositiva--auto',
    'transicion-diapositiva',
    activa
      ? 'transicion-diapositiva--activa'
      : 'transicion-diapositiva--entrando',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="vista-diapositivas">
      <div className="vista-diapositivas__marco" ref={marcoRef}>
        <article
          className={clasesDiapositiva}
          style={estiloDiapositiva}
          aria-roledescription="diapositiva"
          aria-label={`Diapositiva ${indiceDiapositiva + 1} de ${totalDiapositivas}: ${diapositivaActual.titulo}`}
        >
          {createElement(componenteLayout, { diapositiva: diapositivaActual })}
        </article>
      </div>

      <p className="vista-diapositivas__indicador" aria-live="polite">
        <span className="sr-only">Diapositiva </span>
        {indiceDiapositiva + 1} de {totalDiapositivas}
      </p>
    </div>
  );
}
