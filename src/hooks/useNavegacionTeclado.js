/**
 * Hook de navegación por teclado del Sistema_Navegacion.
 *
 * Registra un listener de `keydown` que mapea las teclas de presentación:
 * - Flecha derecha o Espacio => avanzar a la siguiente diapositiva.
 * - Flecha izquierda => retroceder a la diapositiva anterior.
 * - Escape => cerrar el Modo_Pantalla_Completa.
 *
 * Se aplica `preventDefault` sobre la tecla Espacio para evitar el scroll de
 * página por defecto. El listener se limpia al desmontar y se puede desactivar
 * mediante la opción `activo`. El acceso a `window` está guardado para ser
 * seguro en entornos SSR / jsdom sin DOM.
 *
 * Requisitos cubiertos: 3.1, 3.2, 3.5 (y 4.2, al mantener la navegación por
 * teclado disponible durante la pantalla completa).
 *
 * @param {Object} opciones - Opciones del hook.
 * @param {() => void} [opciones.onAvanzar] - Callback para avanzar.
 * @param {() => void} [opciones.onRetroceder] - Callback para retroceder.
 * @param {() => void} [opciones.onEscape] - Callback para Escape (cerrar pantalla completa).
 * @param {boolean} [opciones.activo=true] - Si es `false`, no se registra el listener.
 * @returns {void}
 */
import { useEffect, useRef } from 'react';

export function useNavegacionTeclado({
  onAvanzar,
  onRetroceder,
  onEscape,
  activo = true,
} = {}) {
  // Guardamos los callbacks en refs para que el efecto no se vuelva a
  // registrar cada vez que cambian las funciones (identidad inestable),
  // manteniendo siempre la última versión disponible dentro del listener.
  const onAvanzarRef = useRef(onAvanzar);
  const onRetrocederRef = useRef(onRetroceder);
  const onEscapeRef = useRef(onEscape);

  useEffect(() => {
    onAvanzarRef.current = onAvanzar;
    onRetrocederRef.current = onRetroceder;
    onEscapeRef.current = onEscape;
  }, [onAvanzar, onRetroceder, onEscape]);

  useEffect(() => {
    if (!activo) return undefined;
    if (typeof window === 'undefined') return undefined;

    /**
     * @param {KeyboardEvent} evento
     */
    const manejarKeyDown = (evento) => {
      switch (evento.key) {
        case 'ArrowRight':
        case ' ':
        case 'Spacebar': // alias heredado de navegadores antiguos
          // Evita el desplazamiento de página por defecto de la barra espaciadora.
          evento.preventDefault();
          onAvanzarRef.current?.();
          break;
        case 'ArrowLeft':
          onRetrocederRef.current?.();
          break;
        case 'Escape':
          onEscapeRef.current?.();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', manejarKeyDown);
    return () => {
      window.removeEventListener('keydown', manejarKeyDown);
    };
  }, [activo]);
}

export default useNavegacionTeclado;
