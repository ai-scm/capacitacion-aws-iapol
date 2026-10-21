/**
 * Hook de detección de la preferencia de movimiento reducido.
 *
 * Devuelve `true` cuando el sistema operativo o el navegador indican la
 * preferencia `prefers-reduced-motion: reduce`, y se actualiza en vivo cuando
 * dicha preferencia cambia. Lo consume el Sistema_Diapositivas para reducir o
 * desactivar las animaciones de transición.
 *
 * Se implementa con `useSyncExternalStore`, el patrón idiomático de React para
 * suscribirse a una fuente externa (aquí, un `MediaQueryList`). Esto mantiene
 * el valor sincronizado sin renders en cascada y entrega un snapshot coherente
 * en el render inicial.
 *
 * El acceso a `window.matchMedia` está guardado para ser seguro en entornos
 * SSR / jsdom sin dicha API: en ese caso el hook devuelve `false` (sin
 * reducción de movimiento). También se contempla la API heredada
 * `addListener`/`removeListener` de `MediaQueryList`.
 *
 * Requisitos cubiertos: 6.2.
 *
 * @returns {boolean} `true` si se prefiere movimiento reducido; `false` en caso
 *   contrario o cuando `matchMedia` no está disponible.
 */
import { useSyncExternalStore } from 'react';

const CONSULTA = '(prefers-reduced-motion: reduce)';

/**
 * Indica si `window.matchMedia` está disponible en el entorno actual.
 *
 * @returns {boolean}
 */
function matchMediaDisponible() {
  return (
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
  );
}

/**
 * Suscribe un callback a los cambios de la preferencia de movimiento reducido.
 *
 * @param {() => void} onStoreChange - Callback a invocar cuando cambia la preferencia.
 * @returns {() => void} Función de limpieza que elimina la suscripción.
 */
function suscribir(onStoreChange) {
  if (!matchMediaDisponible()) return () => {};

  const mql = window.matchMedia(CONSULTA);

  if (typeof mql.addEventListener === 'function') {
    mql.addEventListener('change', onStoreChange);
    return () => mql.removeEventListener('change', onStoreChange);
  }

  // API heredada de MediaQueryList para navegadores antiguos.
  if (typeof mql.addListener === 'function') {
    mql.addListener(onStoreChange);
    return () => mql.removeListener(onStoreChange);
  }

  return () => {};
}

/**
 * Lee el valor actual de la preferencia (snapshot para el cliente).
 *
 * @returns {boolean}
 */
function obtenerSnapshot() {
  if (!matchMediaDisponible()) return false;
  return window.matchMedia(CONSULTA).matches;
}

/**
 * Snapshot para el servidor (SSR): sin reducción de movimiento.
 *
 * @returns {boolean}
 */
function obtenerSnapshotServidor() {
  return false;
}

export function useReducedMotion() {
  return useSyncExternalStore(
    suscribir,
    obtenerSnapshot,
    obtenerSnapshotServidor,
  );
}

export default useReducedMotion;
