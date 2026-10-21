/**
 * AppContext: router por estado + navegación de alto nivel de la Plataforma.
 *
 * Implementa el enrutado por estado descrito en el diseño (sin react-router):
 * el estado de navegación de alto nivel es `{ vistaActual, sesionActual,
 * indiceDiapositiva }` y se expone un conjunto cerrado de acciones
 * (`irASesion`, `irAVista`, `avanzar`, `retroceder`, `irADiapositiva`) además
 * del toggle del Modo_Pantalla_Completa.
 *
 * La lógica de límites de diapositiva se delega en el motor de navegación puro
 * (`src/domain/navegacion.js`), de modo que avanzar/retroceder nunca salen de
 * rango y se mueven a lo sumo una diapositiva (Property 1).
 *
 * El toggle de pantalla completa se implementa como un REDUCER PURO que
 * preserva `indiceDiapositiva` (Property 3): entrar y salir del modo pantalla
 * completa deja el índice de diapositiva sin cambios. La llamada real a la
 * Fullscreen API del navegador vive en `useFullscreen` (tarea 5.6); aquí solo
 * se mantiene el estado booleano `pantallaCompleta` de forma pura y testeable.
 *
 * Requisitos cubiertos: 1.3, 3.1, 3.2, 3.3, 3.4, 4.3.
 *
 * @module context/AppContext
 */

import { createContext, useContext, useMemo, useReducer } from 'react';

import { siguienteIndice, anteriorIndice } from '../domain/navegacion.js';
import sesion1 from '../data/sesiones/sesion1.js';
import sesion2 from '../data/sesiones/sesion2.js';
import sesion3 from '../data/sesiones/sesion3.js';
import sesion4 from '../data/sesiones/sesion4.js';

/**
 * Mapa de sesiones disponibles indexado por su número (1 | 2 | 3 | 4).
 * Cada entrada es un `Sesion` con `diapositivas[]` (ver data/sesiones/*).
 *
 * @type {Record<1|2|3|4, { id: number, titulo: string, diapositivas: unknown[] }>}
 */
export const SESIONES = {
  1: sesion1,
  2: sesion2,
  3: sesion3,
  4: sesion4,
};

/**
 * Conjunto cerrado de vistas de alto nivel (router por estado).
 * @type {ReadonlyArray<'home'|'slides'|'lab'|'simulador'|'evaluacion'|'glosario'|'recursos'>}
 */
export const VISTAS = [
  'home',
  'slides',
  'lab',
  'simulador',
  'evaluacion',
  'glosario',
  'recursos',
];

/**
 * Devuelve la cantidad total de diapositivas de una sesión dada.
 *
 * El total se deriva de los datos de la sesión (`SESIONES[n].diapositivas`).
 * Cuando no hay sesión activa (`sesionActual === null`) o la sesión no existe,
 * el total es 0.
 *
 * @param {1|2|3|4|null} sesionActual - Número de sesión activa o null.
 * @returns {number} Cantidad de diapositivas (>= 0).
 */
export function totalDiapositivasDe(sesionActual) {
  const sesion = sesionActual == null ? undefined : SESIONES[sesionActual];
  const diapositivas = sesion?.diapositivas;
  return Array.isArray(diapositivas) ? diapositivas.length : 0;
}

/**
 * Estado inicial del router por estado.
 *
 * @typedef {Object} EstadoApp
 * @property {'home'|'slides'|'lab'|'simulador'|'evaluacion'|'glosario'|'recursos'} vistaActual
 * @property {1|2|3|4|null} sesionActual
 * @property {number} indiceDiapositiva
 * @property {boolean} pantallaCompleta
 *
 * @type {EstadoApp}
 */
export const estadoInicial = {
  vistaActual: 'home',
  sesionActual: null,
  indiceDiapositiva: 0,
  pantallaCompleta: false,
};

/**
 * Reducer PURO del toggle de pantalla completa.
 *
 * Invierte el booleano `pantallaCompleta` conservando intacto el resto del
 * estado y, en particular, `indiceDiapositiva` (Property 3). Es una función
 * pura (no toca el DOM ni la Fullscreen API) para poder ejercitarla desde las
 * pruebas de propiedad de la tarea 5.2.
 *
 * @param {EstadoApp} estado - Estado actual.
 * @returns {EstadoApp} Nuevo estado con `pantallaCompleta` invertido y el
 *   mismo `indiceDiapositiva`, `vistaActual` y `sesionActual`.
 */
export function reducerPantallaCompleta(estado) {
  return {
    ...estado,
    pantallaCompleta: !estado.pantallaCompleta,
  };
}

/**
 * Toggle puro del modo pantalla completa a partir de un valor booleano.
 *
 * Variante de conveniencia para pruebas que solo necesitan razonar sobre el
 * flag sin construir un estado completo. No afecta ni depende de
 * `indiceDiapositiva`.
 *
 * @param {boolean} pantallaCompleta - Valor actual del flag.
 * @returns {boolean} El valor invertido.
 */
export function togglePantallaCompleta(pantallaCompleta) {
  return !pantallaCompleta;
}

/**
 * Reducer principal del router por estado.
 *
 * Acciones admitidas:
 *  - `irASesion`    { n }  → fija sesionActual=n, indiceDiapositiva=0, vista='slides'.
 *  - `irAVista`     { v }  → fija vistaActual=v (si es una vista válida).
 *  - `avanzar`             → siguienteIndice(indice, total) de la sesión activa.
 *  - `retroceder`          → anteriorIndice(indice, total) de la sesión activa.
 *  - `irADiapositiva` { i }→ fija el índice i acotado a [0, total-1].
 *  - `togglePantallaCompleta` → delega en reducerPantallaCompleta (preserva índice).
 *
 * @param {EstadoApp} estado - Estado actual.
 * @param {{ tipo: string, [k: string]: unknown }} accion - Acción a aplicar.
 * @returns {EstadoApp} Nuevo estado.
 */
export function reducerApp(estado, accion) {
  switch (accion.tipo) {
    case 'irASesion': {
      const n = accion.n;
      if (!(n in SESIONES)) {
        return estado;
      }
      return {
        ...estado,
        sesionActual: n,
        indiceDiapositiva: 0,
        vistaActual: 'slides',
      };
    }

    case 'irAVista': {
      if (!VISTAS.includes(accion.v)) {
        return estado;
      }
      return { ...estado, vistaActual: accion.v };
    }

    case 'avanzar': {
      const total = totalDiapositivasDe(estado.sesionActual);
      if (total < 1) {
        return estado;
      }
      return {
        ...estado,
        indiceDiapositiva: siguienteIndice(estado.indiceDiapositiva, total),
      };
    }

    case 'retroceder': {
      const total = totalDiapositivasDe(estado.sesionActual);
      if (total < 1) {
        return estado;
      }
      return {
        ...estado,
        indiceDiapositiva: anteriorIndice(estado.indiceDiapositiva, total),
      };
    }

    case 'irADiapositiva': {
      const total = totalDiapositivasDe(estado.sesionActual);
      if (total < 1) {
        return estado;
      }
      const i = Number.isFinite(accion.i) ? Math.trunc(accion.i) : 0;
      // Clamp a [0, total-1] reutilizando el criterio del motor de navegación.
      const indiceDiapositiva = i < 0 ? 0 : i > total - 1 ? total - 1 : i;
      return { ...estado, indiceDiapositiva };
    }

    case 'togglePantallaCompleta':
      return reducerPantallaCompleta(estado);

    default:
      return estado;
  }
}

/**
 * Contexto de la aplicación. El valor por defecto es `null` para forzar el uso
 * de `useApp()` dentro de un `AppProvider`.
 * @type {React.Context<null | AppContextValue>}
 */
export const AppContext = createContext(null);

/**
 * @typedef {Object} AppContextValue
 * @property {'home'|'slides'|'lab'|'simulador'|'evaluacion'|'glosario'|'recursos'} vistaActual
 * @property {1|2|3|4|null} sesionActual
 * @property {number} indiceDiapositiva
 * @property {boolean} pantallaCompleta
 * @property {object|null} sesion - La sesión activa (datos) o null.
 * @property {number} totalDiapositivas - Cantidad de diapositivas de la sesión activa.
 * @property {object|null} diapositivaActual - La diapositiva activa o null.
 * @property {(n: 1|2|3|4) => void} irASesion
 * @property {(v: string) => void} irAVista
 * @property {() => void} avanzar
 * @property {() => void} retroceder
 * @property {(i: number) => void} irADiapositiva
 * @property {() => void} alternarPantallaCompleta
 */

/**
 * Proveedor del AppContext. Monta el router por estado con `useReducer` y
 * expone estado derivado (sesión activa, total y diapositiva actual) junto con
 * las acciones de navegación.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export function AppProvider({ children }) {
  const [estado, dispatch] = useReducer(reducerApp, estadoInicial);

  const valor = useMemo(() => {
    const sesion =
      estado.sesionActual == null ? null : SESIONES[estado.sesionActual] ?? null;
    const totalDiapositivas = totalDiapositivasDe(estado.sesionActual);
    const diapositivaActual =
      sesion && Array.isArray(sesion.diapositivas)
        ? sesion.diapositivas[estado.indiceDiapositiva] ?? null
        : null;

    return {
      // Estado
      vistaActual: estado.vistaActual,
      sesionActual: estado.sesionActual,
      indiceDiapositiva: estado.indiceDiapositiva,
      pantallaCompleta: estado.pantallaCompleta,
      // Estado derivado de los datos de sesiones
      sesion,
      totalDiapositivas,
      diapositivaActual,
      // Acciones
      irASesion: (n) => dispatch({ tipo: 'irASesion', n }),
      irAVista: (v) => dispatch({ tipo: 'irAVista', v }),
      avanzar: () => dispatch({ tipo: 'avanzar' }),
      retroceder: () => dispatch({ tipo: 'retroceder' }),
      irADiapositiva: (i) => dispatch({ tipo: 'irADiapositiva', i }),
      alternarPantallaCompleta: () =>
        dispatch({ tipo: 'togglePantallaCompleta' }),
    };
  }, [estado]);

  return <AppContext.Provider value={valor}>{children}</AppContext.Provider>;
}

/**
 * Hook de acceso al AppContext. Lanza un error si se usa fuera de un
 * `AppProvider`, para fallar de forma temprana y explícita.
 *
 * @returns {AppContextValue}
 */
export function useApp() {
  const valor = useContext(AppContext);
  if (valor === null) {
    throw new Error('useApp debe usarse dentro de un <AppProvider>.');
  }
  return valor;
}
