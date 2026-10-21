/**
 * Reducer puro del temporizador del Modo_Presentador.
 *
 * Modela el tiempo transcurrido de la sesión mediante un acumulador y una
 * marca de inicio, sin leer el reloj por su cuenta: el "ahora" (en
 * milisegundos) se pasa como dato en cada acción. Esto hace que el cálculo del
 * tiempo transcurrido sea determinista y verificable con property-based testing
 * usando deltas de tiempo arbitrarios no negativos. Los efectos de reloj
 * (`performance.now()`, el `tick` de la UI) viven en `PresentadorContext`.
 *
 * Modelo de estado `EstadoTemporizador`:
 *   {
 *     estado: 'detenido' | 'corriendo' | 'pausado',
 *     acumuladoMs: number,        // tiempo transcurrido ya consolidado (>= 0)
 *     inicioMs: number | null     // marca de inicio del intervalo en curso
 *   }
 *
 * - En 'corriendo', el tiempo transcurrido es `acumuladoMs + (now - inicioMs)`.
 * - En 'detenido'/'pausado', el tiempo transcurrido es `acumuladoMs` e `inicioMs`
 *   es `null` (no hay intervalo en curso).
 *
 * Acciones:
 *   - INICIAR   { now }  registra la marca de inicio del intervalo en curso.
 *   - PAUSAR    { now }  consolida el intervalo en curso en el acumulador y detiene.
 *   - REINICIAR {     }  restablece el acumulador a 0 y detiene.
 *
 * Todas las funciones son puras: no mutan sus argumentos ni mantienen estado.
 *
 * Requisitos cubiertos: 5.3, 5.4, 5.5, 5.6.
 * Property 4: el tiempo transcurrido es la suma de los intervalos en ejecución;
 *   pausar detiene el incremento y reiniciar lleva el tiempo transcurrido a cero.
 */

/**
 * Estados posibles del temporizador.
 *
 * @readonly
 * @enum {string}
 */
export const EstadoTemporizador = {
  DETENIDO: 'detenido',
  CORRIENDO: 'corriendo',
  PAUSADO: 'pausado',
};

/**
 * Tipos de acción admitidos por el reducer del temporizador.
 *
 * @readonly
 * @enum {string}
 */
export const AccionTemporizador = {
  INICIAR: 'INICIAR',
  PAUSAR: 'PAUSAR',
  REINICIAR: 'REINICIAR',
};

/**
 * Devuelve el estado inicial del temporizador (detenido, acumulador a cero).
 *
 * Se construye uno nuevo en cada llamada para evitar aliasing/mutación
 * accidental del estado compartido.
 *
 * @returns {{estado: string, acumuladoMs: number, inicioMs: number | null}}
 *   Un temporizador nuevo en estado 'detenido', con `acumuladoMs === 0` e
 *   `inicioMs === null`.
 */
export function estadoInicialTemporizador() {
  return {
    estado: EstadoTemporizador.DETENIDO,
    acumuladoMs: 0,
    inicioMs: null,
  };
}

/**
 * Normaliza una marca de tiempo "ahora" a un número finito no negativo.
 *
 * Protege el reducer de entradas no válidas (undefined, NaN, negativas) tratando
 * cualquier valor inválido como `0`, de modo que nunca se reste tiempo.
 *
 * @param {unknown} now - Marca de tiempo candidata, en milisegundos.
 * @returns {number} `now` si es un número finito `>= 0`; en otro caso `0`.
 */
function normalizarNow(now) {
  if (typeof now !== 'number' || !Number.isFinite(now) || now < 0) return 0;
  return now;
}

/**
 * Reducer puro del temporizador.
 *
 * Reglas:
 *   - INICIAR: solo tiene efecto si el temporizador no está ya 'corriendo';
 *     fija `inicioMs = now` y pasa a 'corriendo' conservando el acumulador.
 *   - PAUSAR: solo tiene efecto si está 'corriendo'; suma el intervalo en curso
 *     (`now - inicioMs`, acotado a `>= 0`) al acumulador, limpia `inicioMs` y
 *     pasa a 'pausado'. En cualquier otro estado es una operación nula.
 *   - REINICIAR: en cualquier estado, pone el acumulador a 0, limpia `inicioMs`
 *     y pasa a 'detenido'. Es idempotente.
 *
 * Ante una acción desconocida devuelve el estado sin cambios.
 *
 * @param {{estado: string, acumuladoMs: number, inicioMs: number | null}} estado
 *   Estado actual del temporizador.
 * @param {{type: string, now?: number}} accion - Acción a aplicar; `now` es el
 *   instante actual en milisegundos (dato de entrada, no leído del reloj).
 * @returns {{estado: string, acumuladoMs: number, inicioMs: number | null}}
 *   El nuevo estado del temporizador (objeto nuevo; no muta el argumento).
 */
export function reducerTemporizador(estado, accion) {
  switch (accion.type) {
    case AccionTemporizador.INICIAR: {
      if (estado.estado === EstadoTemporizador.CORRIENDO) return estado;
      return {
        estado: EstadoTemporizador.CORRIENDO,
        acumuladoMs: estado.acumuladoMs,
        inicioMs: normalizarNow(accion.now),
      };
    }

    case AccionTemporizador.PAUSAR: {
      if (estado.estado !== EstadoTemporizador.CORRIENDO) return estado;
      const now = normalizarNow(accion.now);
      const inicio = typeof estado.inicioMs === 'number' ? estado.inicioMs : now;
      const intervalo = Math.max(0, now - inicio);
      return {
        estado: EstadoTemporizador.PAUSADO,
        acumuladoMs: estado.acumuladoMs + intervalo,
        inicioMs: null,
      };
    }

    case AccionTemporizador.REINICIAR: {
      return estadoInicialTemporizador();
    }

    default:
      return estado;
  }
}

/**
 * Calcula el tiempo transcurrido del temporizador para un instante dado.
 *
 * - Si el temporizador está 'corriendo', es `acumuladoMs + (now - inicioMs)`,
 *   con el intervalo en curso acotado a `>= 0`.
 * - En 'detenido'/'pausado', es simplemente `acumuladoMs`.
 *
 * El resultado nunca es negativo.
 *
 * @param {{estado: string, acumuladoMs: number, inicioMs: number | null}} estado
 *   Estado del temporizador.
 * @param {number} now - Instante actual en milisegundos.
 * @returns {number} El tiempo transcurrido en milisegundos (`>= 0`).
 */
export function calcularTranscurridoMs(estado, now) {
  const base = Number.isFinite(estado.acumuladoMs) ? Math.max(0, estado.acumuladoMs) : 0;
  if (estado.estado !== EstadoTemporizador.CORRIENDO || typeof estado.inicioMs !== 'number') {
    return base;
  }
  const ahora = normalizarNow(now);
  const intervalo = Math.max(0, ahora - estado.inicioMs);
  return base + intervalo;
}

// Alias en inglés para facilitar la importación desde la prueba de propiedad.
export { reducerTemporizador as timerReducer, calcularTranscurridoMs as computeElapsedMs };
