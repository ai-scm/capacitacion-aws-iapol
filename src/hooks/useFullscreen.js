/**
 * Hook de pantalla completa basado en la Fullscreen API del navegador.
 *
 * Expone el estado de pantalla completa y acciones para activarla, desactivarla
 * o alternarla sobre un elemento objetivo (por defecto, el elemento raíz del
 * documento). Maneja de forma segura los escenarios de fallo exigidos por el
 * diseño (R4):
 * - Si `requestFullscreen`/`exitFullscreen` no existen (API no soportada),
 *   las acciones son no-ops y `soportado` es `false`, sin lanzar errores.
 * - Si la promesa de la Fullscreen API se rechaza, se captura el rechazo para
 *   que la Plataforma permanezca en vista normal sin fallar.
 *
 * El estado se mantiene sincronizado escuchando el evento `fullscreenchange`,
 * de modo que salir mediante la tecla Escape del navegador también actualiza
 * `estaEnPantallaCompleta`. El acceso a `document`/`window` está guardado para
 * ser seguro en entornos SSR / jsdom sin DOM.
 *
 * Requisitos cubiertos: 4.1, 4.2 (la navegación por teclado se mantiene vía
 * `useNavegacionTeclado`), y manejo de no soporte / rechazo de promesa (R4).
 *
 * @param {{ current: Element | null }} [ref] - Ref opcional al elemento que
 *   debe ocupar la pantalla completa. Si se omite, se usa `document.documentElement`.
 * @returns {{
 *   estaEnPantallaCompleta: boolean,
 *   activar: () => void,
 *   desactivar: () => void,
 *   alternar: () => void,
 *   soportado: boolean,
 * }} API del hook.
 */
import { useCallback, useEffect, useState } from 'react';

/**
 * Indica si la Fullscreen API está soportada en el entorno actual.
 *
 * @returns {boolean} `true` si el documento expone `requestFullscreen`/`exitFullscreen`.
 */
function detectarSoporte() {
  if (typeof document === 'undefined') return false;
  const elemento = document.documentElement;
  return Boolean(
    elemento &&
      typeof elemento.requestFullscreen === 'function' &&
      typeof document.exitFullscreen === 'function',
  );
}

/**
 * Devuelve el elemento actualmente en pantalla completa, o `null`.
 *
 * @returns {Element | null}
 */
function obtenerElementoPantallaCompleta() {
  if (typeof document === 'undefined') return null;
  return document.fullscreenElement ?? null;
}

export function useFullscreen(ref) {
  const [soportado] = useState(detectarSoporte);
  const [estaEnPantallaCompleta, setEstaEnPantallaCompleta] = useState(
    () => obtenerElementoPantallaCompleta() !== null,
  );

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    const sincronizarEstado = () => {
      setEstaEnPantallaCompleta(obtenerElementoPantallaCompleta() !== null);
    };

    document.addEventListener('fullscreenchange', sincronizarEstado);
    return () => {
      document.removeEventListener('fullscreenchange', sincronizarEstado);
    };
  }, []);

  const activar = useCallback(() => {
    if (!soportado || typeof document === 'undefined') return;
    const elemento = ref?.current ?? document.documentElement;
    if (!elemento || typeof elemento.requestFullscreen !== 'function') return;
    // La Fullscreen API devuelve una promesa que puede rechazarse (p. ej. si
    // no hay activación del usuario). Capturamos el rechazo para no romper.
    Promise.resolve(elemento.requestFullscreen()).catch(() => {});
  }, [ref, soportado]);

  const desactivar = useCallback(() => {
    if (!soportado || typeof document === 'undefined') return;
    if (typeof document.exitFullscreen !== 'function') return;
    if (obtenerElementoPantallaCompleta() === null) return;
    Promise.resolve(document.exitFullscreen()).catch(() => {});
  }, [soportado]);

  const alternar = useCallback(() => {
    if (obtenerElementoPantallaCompleta() === null) {
      activar();
    } else {
      desactivar();
    }
  }, [activar, desactivar]);

  return { estaEnPantallaCompleta, activar, desactivar, alternar, soportado };
}

export default useFullscreen;
