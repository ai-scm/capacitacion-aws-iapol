/**
 * ProgresoContext: persistencia del avance del usuario en `localStorage`.
 *
 * Expone el estado de avance y las operaciones para guardarlo, recuperarlo y
 * restablecerlo, delegando la forma y la (de)serialización del modelo en el
 * servicio puro `src/domain/progreso.js`. Este contexto es la única capa que
 * toca `localStorage`: envuelve todos los accesos en `try/catch` y, si el
 * almacenamiento no está disponible o una escritura falla, continúa en memoria
 * sin interrumpir la Plataforma (R15.5).
 *
 * Interfaz (según design.md):
 *   { progreso, guardarAvance(parcial), reiniciarProgreso(), disponibleLocalStorage }
 *
 * Modelo `Progreso` (ver dominio):
 *   {
 *     version: 1,
 *     sesiones: { [sesionId]: { ultimaDiapositiva: number, completada: boolean } },
 *     evaluacion: { puntuacion: number | null }
 *   }
 *
 * Requisitos cubiertos:
 * - R15.1: al avanzar o completar una actividad, se guarda el avance en
 *   `localStorage` en ≤ 1 s (la escritura es síncrona en `guardarAvance`).
 * - R15.2: al cargar/recargar, se recupera y restaura el avance guardado.
 * - R15.3: al restablecer, se elimina la clave y se vuelve al estado inicial.
 * - R15.4: ante avance corrupto o con formato inválido, se descarta y se parte
 *   del estado de avance inicial.
 * - R15.5: si `localStorage` no está disponible o el guardado falla, la
 *   Plataforma sigue funcionando sin persistir (en memoria).
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import {
  estadoInicialProgreso,
  serializarProgreso,
  deserializarProgreso,
  reiniciarProgreso as reiniciarProgresoDominio,
} from '../domain/progreso.js';

/**
 * Clave de almacenamiento del progreso en `localStorage`.
 *
 * @type {string}
 */
export const CLAVE_PROGRESO = 'capacitacion-aws-iapol:v1';

const ProgresoContext = createContext(null);

/**
 * Obtiene de forma segura el objeto `localStorage` del navegador.
 *
 * Nunca lanza: algunos entornos exponen la propiedad pero lanzan al accederla
 * (p. ej. cookies/almacenamiento bloqueados, modo privado restringido). Ante
 * cualquier fallo devuelve `null`.
 *
 * @returns {Storage | null} El `localStorage` si es accesible; `null` en caso contrario.
 */
function obtenerAlmacenamiento() {
  try {
    if (typeof globalThis === 'undefined') return null;
    const almacenamiento = globalThis.localStorage;
    return almacenamiento ?? null;
  } catch {
    return null;
  }
}

/**
 * Detecta si `localStorage` está realmente disponible para leer y escribir.
 *
 * Realiza una escritura y borrado de prueba dentro de `try/catch` para cubrir
 * los casos en que la API existe pero falla en tiempo de ejecución (cuota,
 * permisos). No deja residuos si la prueba tiene éxito.
 *
 * @returns {boolean} `true` si se puede leer y escribir; `false` en caso contrario.
 */
function detectarLocalStorage() {
  const almacenamiento = obtenerAlmacenamiento();
  if (almacenamiento === null) return false;
  try {
    const sonda = '__capacitacion_probe__';
    almacenamiento.setItem(sonda, '1');
    almacenamiento.removeItem(sonda);
    return true;
  } catch {
    return false;
  }
}

/**
 * Lee y valida el progreso persistido con fallo seguro.
 *
 * Ante `localStorage` no disponible, clave ausente, JSON malformado o formato
 * inválido, devuelve el estado de avance inicial (R15.2, R15.4). Nunca lanza.
 *
 * @returns {{version: number, sesiones: object, evaluacion: {puntuacion: number | null}}}
 *   El progreso recuperado si es válido; el estado inicial en caso contrario.
 */
function cargarProgresoInicial() {
  const almacenamiento = obtenerAlmacenamiento();
  if (almacenamiento === null) return estadoInicialProgreso();

  let texto;
  try {
    texto = almacenamiento.getItem(CLAVE_PROGRESO);
  } catch {
    return estadoInicialProgreso();
  }

  if (texto === null || texto === undefined) return estadoInicialProgreso();

  const resultado = deserializarProgreso(texto);
  return resultado.ok ? resultado.progreso : estadoInicialProgreso();
}

/**
 * Combina una actualización parcial sobre un progreso base sin mutar el original.
 *
 * Acepta parches a nivel de sesiones (se fusionan por `sesionId`, conservando
 * campos no provistos de cada sesión) y a `evaluacion` (fusión superficial de
 * `puntuacion`). Cualquier otra clave de nivel superior del parche se ignora
 * para preservar la forma del modelo `Progreso`.
 *
 * @param {object} base - Progreso actual.
 * @param {object} [parcial] - Actualización parcial a aplicar.
 * @returns {object} Un nuevo progreso con el parche aplicado.
 */
function fusionarProgreso(base, parcial) {
  if (parcial === null || typeof parcial !== 'object') return base;

  const siguiente = {
    version: base.version,
    sesiones: { ...base.sesiones },
    evaluacion: { ...base.evaluacion },
  };

  if (parcial.sesiones && typeof parcial.sesiones === 'object') {
    for (const [idSesion, entrada] of Object.entries(parcial.sesiones)) {
      if (entrada === null || typeof entrada !== 'object') continue;
      siguiente.sesiones[idSesion] = {
        ...(siguiente.sesiones[idSesion] ?? {}),
        ...entrada,
      };
    }
  }

  if (parcial.evaluacion && typeof parcial.evaluacion === 'object') {
    siguiente.evaluacion = {
      ...siguiente.evaluacion,
      ...parcial.evaluacion,
    };
  }

  return siguiente;
}

/**
 * Proveedor del contexto de progreso.
 *
 * Inicializa el estado leyendo `localStorage` una sola vez (restauración al
 * cargar) y detecta la disponibilidad del almacenamiento. Mantiene una
 * referencia al valor vigente del progreso para que `guardarAvance` persista
 * de forma consistente aun cuando se encadenen varias actualizaciones.
 *
 * @param {{ children: React.ReactNode }} props - Hijos envueltos por el proveedor.
 * @returns {JSX.Element} El árbol proveído con el valor del contexto.
 */
export function ProgresoProvider({ children }) {
  const [disponibleLocalStorage, setDisponibleLocalStorage] = useState(
    detectarLocalStorage,
  );
  const [progreso, setProgreso] = useState(cargarProgresoInicial);

  /**
   * Persiste el progreso dado en `localStorage` con fallo seguro.
   *
   * Si el almacenamiento no está disponible o la escritura lanza, marca
   * `disponibleLocalStorage = false` y no interrumpe el flujo (R15.5).
   *
   * @param {object} valor - Progreso a persistir.
   * @returns {void}
   */
  const persistir = useCallback((valor) => {
    const almacenamiento = obtenerAlmacenamiento();
    if (almacenamiento === null) {
      setDisponibleLocalStorage(false);
      return;
    }
    try {
      almacenamiento.setItem(CLAVE_PROGRESO, serializarProgreso(valor));
    } catch {
      setDisponibleLocalStorage(false);
    }
  }, []);

  /**
   * Aplica una actualización parcial al progreso y la persiste (≤ 1 s).
   *
   * Usa la forma funcional de `setProgreso` para fusionar siempre sobre el
   * valor vigente (evitando estados obsoletos al encadenar actualizaciones) y
   * persiste el resultado dentro del propio actualizador. La fusión preserva la
   * forma del modelo y no muta el estado anterior; la escritura en
   * `localStorage` es síncrona, por lo que el avance queda persistido de
   * inmediato tras avanzar o completar una actividad (R15.1).
   *
   * @param {object} parcial - Actualización parcial (sesiones y/o evaluación).
   * @returns {void}
   */
  const guardarAvance = useCallback(
    (parcial) => {
      setProgreso((actual) => {
        const siguiente = fusionarProgreso(actual, parcial);
        persistir(siguiente);
        return siguiente;
      });
    },
    [persistir],
  );

  /**
   * Restablece el progreso: elimina la clave de `localStorage` y vuelve al
   * estado de avance inicial (R15.3).
   *
   * El borrado se envuelve en `try/catch`; un fallo al eliminar no impide
   * restablecer el estado en memoria.
   *
   * @returns {void}
   */
  const reiniciarProgreso = useCallback(() => {
    setProgreso((actual) => reiniciarProgresoDominio(actual));

    const almacenamiento = obtenerAlmacenamiento();
    if (almacenamiento === null) {
      setDisponibleLocalStorage(false);
      return;
    }
    try {
      almacenamiento.removeItem(CLAVE_PROGRESO);
    } catch {
      setDisponibleLocalStorage(false);
    }
  }, []);

  const valor = useMemo(
    () => ({
      progreso,
      guardarAvance,
      reiniciarProgreso,
      disponibleLocalStorage,
    }),
    [progreso, guardarAvance, reiniciarProgreso, disponibleLocalStorage],
  );

  return (
    <ProgresoContext.Provider value={valor}>
      {children}
    </ProgresoContext.Provider>
  );
}

/**
 * Hook de acceso al contexto de progreso.
 *
 * @returns {{ progreso: object, guardarAvance: (parcial: object) => void, reiniciarProgreso: () => void, disponibleLocalStorage: boolean }}
 *   El valor del contexto de progreso.
 * @throws {Error} Si se usa fuera de un `ProgresoProvider`.
 */
export function useProgreso() {
  const contexto = useContext(ProgresoContext);
  if (contexto === null) {
    throw new Error('useProgreso debe usarse dentro de un ProgresoProvider.');
  }
  return contexto;
}

export default ProgresoContext;
