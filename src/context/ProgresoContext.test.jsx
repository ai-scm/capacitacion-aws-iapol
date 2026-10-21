/**
 * Pruebas de `ProgresoContext`: persistencia del avance en `localStorage` con
 * fallo seguro y continuación en memoria.
 *
 * Cubren R15.1 (guardado ≤ 1 s / síncrono), R15.2 (recuperación y restauración
 * al cargar), R15.3 (restablecimiento), R15.4 (descarte de corrupción) y R15.5
 * (continuar sin persistir si `localStorage` no está disponible o falla).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, renderHook } from '@testing-library/react';

import {
  ProgresoProvider,
  useProgreso,
  CLAVE_PROGRESO,
} from './ProgresoContext.jsx';
import {
  estadoInicialProgreso,
  serializarProgreso,
} from '../domain/progreso.js';

/** Wrapper que envuelve el hook bajo prueba en el proveedor. */
function wrapper({ children }) {
  return <ProgresoProvider>{children}</ProgresoProvider>;
}

/** Renderiza `useProgreso` dentro del proveedor y devuelve el resultado. */
function montarProgreso() {
  return renderHook(() => useProgreso(), { wrapper });
}

describe('ProgresoContext', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.localStorage.clear();
  });

  it('parte del estado inicial cuando no hay avance guardado (R15.2)', () => {
    const { result } = montarProgreso();

    expect(result.current.progreso).toEqual(estadoInicialProgreso());
    expect(result.current.disponibleLocalStorage).toBe(true);
  });

  it('recupera y restaura el avance válido guardado al cargar (R15.2)', () => {
    const guardado = {
      version: 1,
      sesiones: { 1: { ultimaDiapositiva: 4, completada: false } },
      evaluacion: { puntuacion: 85 },
    };
    globalThis.localStorage.setItem(
      CLAVE_PROGRESO,
      serializarProgreso(guardado),
    );

    const { result } = montarProgreso();

    expect(result.current.progreso).toEqual(guardado);
  });

  it('descarta avance corrupto y usa el estado inicial (R15.4)', () => {
    globalThis.localStorage.setItem(CLAVE_PROGRESO, '{ esto no es json valido');

    const { result } = montarProgreso();

    expect(result.current.progreso).toEqual(estadoInicialProgreso());
  });

  it('descarta avance con formato inválido y usa el estado inicial (R15.4)', () => {
    globalThis.localStorage.setItem(
      CLAVE_PROGRESO,
      JSON.stringify({ version: 99, sesiones: {}, evaluacion: {} }),
    );

    const { result } = montarProgreso();

    expect(result.current.progreso).toEqual(estadoInicialProgreso());
  });

  it('guarda el avance parcial de una sesión y lo persiste de inmediato (R15.1)', () => {
    const { result } = montarProgreso();

    act(() => {
      result.current.guardarAvance({
        sesiones: { 2: { ultimaDiapositiva: 7, completada: false } },
      });
    });

    expect(result.current.progreso.sesiones[2]).toEqual({
      ultimaDiapositiva: 7,
      completada: false,
    });

    const persistido = JSON.parse(
      globalThis.localStorage.getItem(CLAVE_PROGRESO),
    );
    expect(persistido.sesiones[2]).toEqual({
      ultimaDiapositiva: 7,
      completada: false,
    });
  });

  it('fusiona actualizaciones parciales conservando datos previos de la sesión', () => {
    const { result } = montarProgreso();

    act(() => {
      result.current.guardarAvance({
        sesiones: { 1: { ultimaDiapositiva: 3, completada: false } },
      });
    });
    act(() => {
      result.current.guardarAvance({ sesiones: { 1: { completada: true } } });
    });

    expect(result.current.progreso.sesiones[1]).toEqual({
      ultimaDiapositiva: 3,
      completada: true,
    });
  });

  it('acepta actualizaciones parciales de la evaluación', () => {
    const { result } = montarProgreso();

    act(() => {
      result.current.guardarAvance({ evaluacion: { puntuacion: 92 } });
    });

    expect(result.current.progreso.evaluacion.puntuacion).toBe(92);
    const persistido = JSON.parse(
      globalThis.localStorage.getItem(CLAVE_PROGRESO),
    );
    expect(persistido.evaluacion.puntuacion).toBe(92);
  });

  it('restablece el progreso: borra la clave y vuelve al estado inicial (R15.3)', () => {
    const { result } = montarProgreso();

    act(() => {
      result.current.guardarAvance({
        sesiones: { 1: { ultimaDiapositiva: 10, completada: true } },
      });
    });
    expect(globalThis.localStorage.getItem(CLAVE_PROGRESO)).not.toBeNull();

    act(() => {
      result.current.reiniciarProgreso();
    });

    expect(result.current.progreso).toEqual(estadoInicialProgreso());
    expect(globalThis.localStorage.getItem(CLAVE_PROGRESO)).toBeNull();
  });

  it('continúa en memoria y marca indisponible si el guardado falla (R15.5)', () => {
    const { result } = montarProgreso();

    const fallo = vi
      .spyOn(globalThis.Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('cuota excedida');
      });

    act(() => {
      result.current.guardarAvance({
        sesiones: { 1: { ultimaDiapositiva: 2, completada: false } },
      });
    });

    // El estado en memoria sí refleja el avance, pese al fallo de persistencia.
    expect(result.current.progreso.sesiones[1]).toEqual({
      ultimaDiapositiva: 2,
      completada: false,
    });
    expect(result.current.disponibleLocalStorage).toBe(false);

    fallo.mockRestore();
  });

  it('no lanza al renderizar si localStorage no está disponible (R15.5)', () => {
    const descriptorOriginal = Object.getOwnPropertyDescriptor(
      globalThis,
      'localStorage',
    );
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('localStorage bloqueado');
      },
    });

    try {
      const { result } = montarProgreso();
      expect(result.current.progreso).toEqual(estadoInicialProgreso());
      expect(result.current.disponibleLocalStorage).toBe(false);

      // Guardar en memoria no debe lanzar aunque no haya almacenamiento.
      expect(() => {
        act(() => {
          result.current.guardarAvance({
            sesiones: { 1: { ultimaDiapositiva: 1, completada: false } },
          });
        });
      }).not.toThrow();
      expect(result.current.progreso.sesiones[1]).toEqual({
        ultimaDiapositiva: 1,
        completada: false,
      });
    } finally {
      if (descriptorOriginal) {
        Object.defineProperty(globalThis, 'localStorage', descriptorOriginal);
      }
    }
  });

  it('lanza si useProgreso se usa fuera del proveedor', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useProgreso())).toThrow(
      /ProgresoProvider/,
    );
    errorSpy.mockRestore();
  });

  it('provee el contexto a los componentes hijos', () => {
    function Hijo() {
      const { disponibleLocalStorage } = useProgreso();
      return <span>{String(disponibleLocalStorage)}</span>;
    }
    const { container } = render(
      <ProgresoProvider>
        <Hijo />
      </ProgresoProvider>,
    );
    expect(container.textContent).toBe('true');
  });
});
