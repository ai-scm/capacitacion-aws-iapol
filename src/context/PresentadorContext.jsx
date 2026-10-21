/**
 * PresentadorContext: estado del Modo_Presentador.
 *
 * Expone la interfaz de diseño:
 *   {
 *     presentadorActivo,
 *     abrirPresentador(),
 *     cerrarPresentador(),
 *     temporizador: { transcurridoMs, iniciar(), pausar(), reiniciar(), estado }
 *   }
 *
 * Responsabilidades y separación de capas:
 *   - La lógica del temporizador es un reducer puro (`src/domain/temporizador.js`).
 *     Este contexto solo aporta los efectos de reloj: pasa `performance.now()`
 *     como dato a las acciones y hace "tick" con un intervalo para refrescar el
 *     tiempo transcurrido en pantalla mientras corre.
 *   - La vista pública de diapositivas y la vista del presentador pueden vivir en
 *     ventanas/pestañas distintas; su estado se sincroniza vía `BroadcastChannel`
 *     con fallback a eventos `storage` de `localStorage` cuando `BroadcastChannel`
 *     no está disponible.
 *
 * La apertura efectiva de la ventana secundaria (`window.open`) y su fallback a
 * vista dividida superpuesta se implementan en el componente del Modo_Presentador
 * (tarea 8.1). Aquí se gestiona el estado `presentadorActivo` y se intenta abrir
 * una ventana secundaria de forma best-effort.
 *
 * Requisitos cubiertos: 5.3, 5.4, 5.5, 5.6.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import {
  AccionTemporizador,
  EstadoTemporizador,
  calcularTranscurridoMs,
  estadoInicialTemporizador,
  reducerTemporizador,
} from '../domain/temporizador.js';

/** Nombre del canal de sincronización entre vistas. */
const NOMBRE_CANAL = 'capacitacion-aws-iapol:presentador';

/** Clave usada para el fallback de sincronización vía eventos `storage`. */
const CLAVE_SYNC = 'capacitacion-aws-iapol:presentador-sync';

/** Periodo del tick de refresco del temporizador en pantalla (ms). */
const PERIODO_TICK_MS = 250;

/**
 * @typedef {object} ApiTemporizador
 * @property {number} transcurridoMs - Tiempo transcurrido actual en ms (`>= 0`).
 * @property {string} estado - Estado del temporizador ('detenido' | 'corriendo' | 'pausado').
 * @property {() => void} iniciar - Inicia o reanuda el conteo.
 * @property {() => void} pausar - Detiene el incremento conservando lo transcurrido.
 * @property {() => void} reiniciar - Restablece el tiempo transcurrido a cero.
 */

/**
 * @typedef {object} ValorPresentador
 * @property {boolean} presentadorActivo - Si el Modo_Presentador está activo.
 * @property {() => void} abrirPresentador - Activa el Modo_Presentador.
 * @property {() => void} cerrarPresentador - Desactiva el Modo_Presentador.
 * @property {ApiTemporizador} temporizador - API del temporizador de sesión.
 */

/** @type {import('react').Context<ValorPresentador | null>} */
const PresentadorContext = createContext(null);

/**
 * Lee el instante actual de alta resolución en milisegundos.
 *
 * Usa `performance.now()` cuando está disponible (monótono, inmune a ajustes de
 * reloj del sistema) y cae a `Date.now()` como respaldo.
 *
 * @returns {number} El instante actual en milisegundos.
 */
function ahoraMs() {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
}

/**
 * Crea el canal de difusión entre vistas si el navegador lo soporta.
 *
 * @returns {BroadcastChannel | null} El canal, o `null` si no hay soporte.
 */
function crearCanal() {
  if (typeof BroadcastChannel === 'undefined') return null;
  try {
    return new BroadcastChannel(NOMBRE_CANAL);
  } catch {
    return null;
  }
}

/**
 * Proveedor del Modo_Presentador.
 *
 * Monta el estado `presentadorActivo`, el temporizador (reducer puro + tick de
 * reloj) y la sincronización entre vistas.
 *
 * @param {{ children: import('react').ReactNode }} props - Hijos a envolver.
 * @returns {import('react').JSX.Element} El proveedor de contexto.
 */
export function PresentadorProvider({ children }) {
  const [presentadorActivo, setPresentadorActivo] = useState(false);
  const [estadoTemporizador, dispatch] = useReducer(
    reducerTemporizador,
    undefined,
    estadoInicialTemporizador,
  );

  // Contador de "tick": solo se usa para forzar un re-render periódico mientras
  // el temporizador corre, de modo que el tiempo mostrado avance en pantalla.
  // El valor transcurrido se deriva (no se guarda en estado) para evitar
  // setState sincrónico dentro de un efecto.
  const [tick, setTick] = useState(0);

  // Referencia a la ventana secundaria del presentador (si se abre con window.open).
  const ventanaRef = useRef(/** @type {Window | null} */ (null));
  // Evita reemitir por el canal un cambio que provino del propio canal.
  const ignorarSyncRef = useRef(false);

  // Mientras el temporizador corre, programa un tick periódico que fuerza el
  // recálculo del tiempo transcurrido derivado. Al pausar/detener no hay tick.
  useEffect(() => {
    if (estadoTemporizador.estado !== EstadoTemporizador.CORRIENDO) {
      return undefined;
    }

    const intervalo = setInterval(() => {
      setTick((valor) => valor + 1);
    }, PERIODO_TICK_MS);

    return () => clearInterval(intervalo);
  }, [estadoTemporizador.estado]);

  // Tiempo transcurrido "en vivo": se recalcula a partir del estado puro del
  // reducer y del reloj. Depende de `tick` para refrescarse mientras corre y de
  // `estadoTemporizador` para reflejar iniciar/pausar/reiniciar al instante.
  const transcurridoMs = useMemo(
    () => calcularTranscurridoMs(estadoTemporizador, ahoraMs()),
    // `tick` participa como disparador de recálculo aunque no se use su valor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [estadoTemporizador, tick],
  );

  // Sincronización entre vistas: BroadcastChannel con fallback a 'storage'.
  useEffect(() => {
    const canal = crearCanal();

    /**
     * Aplica un mensaje de sincronización recibido de otra vista.
     *
     * @param {unknown} datos - Carga del mensaje.
     */
    const aplicarMensaje = (datos) => {
      if (!datos || typeof datos !== 'object') return;
      const mensaje = /** @type {{ tipo?: string, presentadorActivo?: boolean }} */ (datos);
      if (mensaje.tipo !== 'presentador' || typeof mensaje.presentadorActivo !== 'boolean') {
        return;
      }
      ignorarSyncRef.current = true;
      setPresentadorActivo(mensaje.presentadorActivo);
    };

    /** @param {MessageEvent} evento */
    const onCanal = (evento) => aplicarMensaje(evento.data);

    /** @param {StorageEvent} evento */
    const onStorage = (evento) => {
      if (evento.key !== CLAVE_SYNC || evento.newValue == null) return;
      try {
        aplicarMensaje(JSON.parse(evento.newValue));
      } catch {
        /* mensaje corrupto: se ignora sin romper la sincronización */
      }
    };

    if (canal) {
      canal.addEventListener('message', onCanal);
    } else if (typeof window !== 'undefined') {
      window.addEventListener('storage', onStorage);
    }

    return () => {
      if (canal) {
        canal.removeEventListener('message', onCanal);
        canal.close();
      } else if (typeof window !== 'undefined') {
        window.removeEventListener('storage', onStorage);
      }
    };
  }, []);

  // Difunde el estado de `presentadorActivo` a las demás vistas.
  useEffect(() => {
    // No reemitir si el cambio vino de un mensaje recibido.
    if (ignorarSyncRef.current) {
      ignorarSyncRef.current = false;
      return;
    }

    const mensaje = { tipo: 'presentador', presentadorActivo };
    const canal = crearCanal();
    if (canal) {
      try {
        canal.postMessage(mensaje);
      } catch {
        /* difusión best-effort */
      }
      canal.close();
      return;
    }

    // Fallback: escribir en localStorage dispara 'storage' en otras pestañas.
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(CLAVE_SYNC, JSON.stringify({ ...mensaje, t: Date.now() }));
      } catch {
        /* localStorage no disponible: la Plataforma sigue funcionando */
      }
    }
  }, [presentadorActivo]);

  const abrirPresentador = useCallback(() => {
    setPresentadorActivo(true);
    // Intento best-effort de abrir ventana secundaria; el fallback a vista
    // dividida superpuesta lo resuelve el componente del Modo_Presentador (8.1).
    if (typeof window !== 'undefined' && typeof window.open === 'function') {
      try {
        const ventana = window.open('', 'presentador-capacitacion-aws-iapol');
        ventanaRef.current = ventana ?? null;
      } catch {
        ventanaRef.current = null;
      }
    }
  }, []);

  const cerrarPresentador = useCallback(() => {
    setPresentadorActivo(false);
    if (ventanaRef.current && !ventanaRef.current.closed) {
      try {
        ventanaRef.current.close();
      } catch {
        /* cierre best-effort */
      }
    }
    ventanaRef.current = null;
  }, []);

  const iniciar = useCallback(() => {
    dispatch({ type: AccionTemporizador.INICIAR, now: ahoraMs() });
  }, []);

  const pausar = useCallback(() => {
    dispatch({ type: AccionTemporizador.PAUSAR, now: ahoraMs() });
  }, []);

  const reiniciar = useCallback(() => {
    dispatch({ type: AccionTemporizador.REINICIAR });
  }, []);

  const temporizador = useMemo(
    () => ({
      transcurridoMs,
      estado: estadoTemporizador.estado,
      iniciar,
      pausar,
      reiniciar,
    }),
    [transcurridoMs, estadoTemporizador.estado, iniciar, pausar, reiniciar],
  );

  const valor = useMemo(
    () => ({
      presentadorActivo,
      abrirPresentador,
      cerrarPresentador,
      temporizador,
    }),
    [presentadorActivo, abrirPresentador, cerrarPresentador, temporizador],
  );

  return <PresentadorContext.Provider value={valor}>{children}</PresentadorContext.Provider>;
}

/**
 * Hook de acceso al Modo_Presentador.
 *
 * @returns {ValorPresentador} El valor del contexto del presentador.
 * @throws {Error} Si se usa fuera de un `PresentadorProvider`.
 */
export function usePresentador() {
  const contexto = useContext(PresentadorContext);
  if (contexto === null) {
    throw new Error('usePresentador debe usarse dentro de un PresentadorProvider');
  }
  return contexto;
}

export { PresentadorContext };
