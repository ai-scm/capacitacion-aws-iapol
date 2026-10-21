/**
 * Pruebas unitarias de ControlesNavegacion (Sistema_Navegacion) — R3, R4.
 *
 * Cubren los criterios de aceptación verificables a nivel de interacción del
 * componente, usando los contextos y hooks REALES (sin mockear AppContext ni
 * los hooks de navegación/pantalla completa), y mockeando únicamente la
 * Fullscreen API del navegador (que jsdom no implementa):
 *
 *  - R3.1: avanzar a la siguiente Diapositiva (toque "Siguiente" y tecla
 *    ArrowRight / Espacio).
 *  - R3.2: retroceder a la Diapositiva anterior (toque "Anterior" y tecla
 *    ArrowLeft).
 *  - R3.3: en la última Diapositiva, avanzar mantiene la posición (permanece
 *    en el límite superior; el botón "Siguiente" se deshabilita).
 *  - R3.4: en la primera Diapositiva, retroceder mantiene la posición
 *    (permanece en el límite inferior; el botón "Anterior" se deshabilita).
 *  - R3.5: Escape cierra el Modo_Pantalla_Completa (vía la Fullscreen API).
 *  - R4.3: entrar/salir del Modo_Pantalla_Completa preserva el índice de
 *    Diapositiva.
 *
 * Para disponer de una Sesión activa con Diapositivas se monta un pequeño
 * ayudante que invoca `irASesion(1)` al montarse, junto a una sonda que expone
 * `indiceDiapositiva`, `totalDiapositivas` y `pantallaCompleta` del AppContext.
 */

import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useEffect, useRef } from 'react';

import ControlesNavegacion from './ControlesNavegacion.jsx';
import { AppProvider, useApp, SESIONES } from '../../context/AppContext.jsx';

/** Total de diapositivas de la Sesión 1 (fuente única de datos). */
const TOTAL_SESION_1 = SESIONES[1].diapositivas.length;

/**
 * Activa la Sesión `n` al montarse, de modo que el AppContext tenga una Sesión
 * con Diapositivas y un índice inicial 0 (primera diapositiva).
 *
 * @param {{ n?: 1|2|3 }} props
 * @returns {null}
 */
function ActivarSesion({ n = 1 }) {
  const { irASesion } = useApp();
  // Guardamos la ejecución con un ref para invocar `irASesion` UNA sola vez al
  // montar. La identidad de `irASesion` cambia en cada render del AppProvider
  // (se recrea dentro de `useMemo`), por lo que incluirla en las dependencias
  // dispararía un bucle de renderizado infinito.
  const yaActivado = useRef(false);
  useEffect(() => {
    if (yaActivado.current) return;
    yaActivado.current = true;
    irASesion(n);
  }, [irASesion, n]);
  return null;
}

/**
 * Sonda que expone el estado de navegación relevante del AppContext como
 * atributos de datos, para afirmar los efectos reales de las acciones.
 *
 * @returns {import('react').ReactElement}
 */
function Sonda() {
  const { indiceDiapositiva, totalDiapositivas, pantallaCompleta } = useApp();
  return (
    <div
      data-testid="sonda"
      data-indice={String(indiceDiapositiva)}
      data-total={String(totalDiapositivas)}
      data-pantalla-completa={String(pantallaCompleta)}
    />
  );
}

/**
 * Renderiza los controles con una Sesión activa y la sonda de estado.
 *
 * @returns {ReturnType<typeof render>}
 */
function renderizarConSesion() {
  return render(
    <AppProvider>
      <ActivarSesion n={1} />
      <ControlesNavegacion />
      <Sonda />
    </AppProvider>,
  );
}

/** @returns {number} El índice de diapositiva actual según la sonda. */
function indiceActual() {
  return Number(screen.getByTestId('sonda').getAttribute('data-indice'));
}

/** @returns {boolean} El flag `pantallaCompleta` del AppContext según la sonda. */
function pantallaCompletaActual() {
  return screen.getByTestId('sonda').getAttribute('data-pantalla-completa') === 'true';
}

describe('ControlesNavegacion — navegación por toque (R3)', () => {
  it('monta con la primera Diapositiva activa de la Sesión (índice 0)', () => {
    renderizarConSesion();
    expect(indiceActual()).toBe(0);
    expect(Number(screen.getByTestId('sonda').getAttribute('data-total'))).toBe(
      TOTAL_SESION_1,
    );
  });

  it('avanza una Diapositiva al pulsar "Siguiente" (R3.1)', () => {
    renderizarConSesion();
    expect(indiceActual()).toBe(0);

    fireEvent.click(screen.getByRole('button', { name: 'Diapositiva siguiente' }));
    expect(indiceActual()).toBe(1);

    fireEvent.click(screen.getByRole('button', { name: 'Diapositiva siguiente' }));
    expect(indiceActual()).toBe(2);
  });

  it('retrocede una Diapositiva al pulsar "Anterior" (R3.2)', () => {
    renderizarConSesion();

    // Avanzar primero para no estar en el límite inferior.
    fireEvent.click(screen.getByRole('button', { name: 'Diapositiva siguiente' }));
    fireEvent.click(screen.getByRole('button', { name: 'Diapositiva siguiente' }));
    expect(indiceActual()).toBe(2);

    fireEvent.click(screen.getByRole('button', { name: 'Diapositiva anterior' }));
    expect(indiceActual()).toBe(1);
  });

  it('en la primera Diapositiva "Anterior" está deshabilitado y no retrocede (R3.4)', () => {
    renderizarConSesion();
    expect(indiceActual()).toBe(0);

    const anterior = screen.getByRole('button', { name: 'Diapositiva anterior' });
    expect(anterior.disabled).toBe(true);

    // Aun forzando el click, permanece en el límite inferior.
    fireEvent.click(anterior);
    expect(indiceActual()).toBe(0);
  });

  it('en la última Diapositiva "Siguiente" está deshabilitado y no avanza (R3.3)', () => {
    renderizarConSesion();

    const siguiente = screen.getByRole('button', { name: 'Diapositiva siguiente' });
    // Avanzar hasta el final.
    for (let i = 0; i < TOTAL_SESION_1 + 2; i += 1) {
      fireEvent.click(siguiente);
    }
    expect(indiceActual()).toBe(TOTAL_SESION_1 - 1);

    const siguienteFinal = screen.getByRole('button', {
      name: 'Diapositiva siguiente',
    });
    expect(siguienteFinal.disabled).toBe(true);

    fireEvent.click(siguienteFinal);
    expect(indiceActual()).toBe(TOTAL_SESION_1 - 1);
  });
});

describe('ControlesNavegacion — navegación por teclado (R3.1, R3.2)', () => {
  it('ArrowRight avanza a la siguiente Diapositiva (R3.1)', () => {
    renderizarConSesion();
    expect(indiceActual()).toBe(0);

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(indiceActual()).toBe(1);
  });

  it('la tecla Espacio avanza a la siguiente Diapositiva (R3.1)', () => {
    renderizarConSesion();
    expect(indiceActual()).toBe(0);

    fireEvent.keyDown(window, { key: ' ' });
    expect(indiceActual()).toBe(1);
  });

  it('ArrowLeft retrocede a la Diapositiva anterior (R3.2)', () => {
    renderizarConSesion();

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(indiceActual()).toBe(2);

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(indiceActual()).toBe(1);
  });

  it('ArrowLeft en la primera Diapositiva mantiene el límite inferior (R3.4)', () => {
    renderizarConSesion();
    expect(indiceActual()).toBe(0);

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(indiceActual()).toBe(0);
  });

  it('ArrowRight en la última Diapositiva mantiene el límite superior (R3.3)', () => {
    renderizarConSesion();

    for (let i = 0; i < TOTAL_SESION_1 + 2; i += 1) {
      fireEvent.keyDown(window, { key: 'ArrowRight' });
    }
    expect(indiceActual()).toBe(TOTAL_SESION_1 - 1);

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(indiceActual()).toBe(TOTAL_SESION_1 - 1);
  });
});

describe('ControlesNavegacion — pantalla completa (R3.5, R4.3)', () => {
  /**
   * Estado mutable del elemento en pantalla completa, controlado por los mocks
   * de la Fullscreen API. jsdom no implementa esta API, por lo que la
   * instalamos manualmente sobre `document`/`document.documentElement`.
   * @type {Element | null}
   */
  let elementoPantallaCompleta = null;

  beforeEach(() => {
    elementoPantallaCompleta = null;

    // `fullscreenElement` es leído por el hook para derivar el estado real.
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get: () => elementoPantallaCompleta,
    });

    // requestFullscreen "entra" en pantalla completa: fija el elemento objetivo
    // y notifica el cambio mediante `fullscreenchange` (como el navegador).
    document.documentElement.requestFullscreen = vi.fn(function requestFullscreen() {
      elementoPantallaCompleta = this;
      document.dispatchEvent(new Event('fullscreenchange'));
      return Promise.resolve();
    });

    // exitFullscreen "sale" de pantalla completa.
    document.exitFullscreen = vi.fn(() => {
      elementoPantallaCompleta = null;
      document.dispatchEvent(new Event('fullscreenchange'));
      return Promise.resolve();
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete document.documentElement.requestFullscreen;
    delete document.exitFullscreen;
    delete document.fullscreenElement;
    elementoPantallaCompleta = null;
  });

  it('muestra el botón de pantalla completa cuando la API está soportada', () => {
    renderizarConSesion();
    expect(
      screen.getByRole('button', { name: 'Entrar en pantalla completa' }),
    ).toBeTruthy();
  });

  it('al pulsar el botón llama a requestFullscreen y activa el modo (R4)', () => {
    renderizarConSesion();

    const boton = screen.getByRole('button', { name: 'Entrar en pantalla completa' });
    act(() => {
      fireEvent.click(boton);
    });

    expect(document.documentElement.requestFullscreen).toHaveBeenCalledTimes(1);
    // El estado real y el flag del AppContext quedan sincronizados (R4.3).
    expect(pantallaCompletaActual()).toBe(true);
    // El botón refleja el nuevo estado (aria-pressed y etiqueta de salida).
    const botonSalir = screen.getByRole('button', {
      name: 'Salir de pantalla completa',
    });
    expect(botonSalir.getAttribute('aria-pressed')).toBe('true');
  });

  it('Escape cierra el Modo_Pantalla_Completa llamando a exitFullscreen (R3.5)', () => {
    renderizarConSesion();

    // Entrar en pantalla completa.
    act(() => {
      fireEvent.click(
        screen.getByRole('button', { name: 'Entrar en pantalla completa' }),
      );
    });
    expect(pantallaCompletaActual()).toBe(true);

    // Escape debe pedir salir de pantalla completa (R3.5).
    act(() => {
      fireEvent.keyDown(window, { key: 'Escape' });
    });
    expect(document.exitFullscreen).toHaveBeenCalledTimes(1);
    expect(pantallaCompletaActual()).toBe(false);
  });

  it('entrar y salir de pantalla completa preserva el índice de Diapositiva (R4.3)', () => {
    renderizarConSesion();

    // Avanzar a una diapositiva intermedia.
    fireEvent.click(screen.getByRole('button', { name: 'Diapositiva siguiente' }));
    fireEvent.click(screen.getByRole('button', { name: 'Diapositiva siguiente' }));
    fireEvent.click(screen.getByRole('button', { name: 'Diapositiva siguiente' }));
    const indiceAntes = indiceActual();
    expect(indiceAntes).toBe(3);

    // Entrar en pantalla completa: el índice no cambia.
    act(() => {
      fireEvent.click(
        screen.getByRole('button', { name: 'Entrar en pantalla completa' }),
      );
    });
    expect(pantallaCompletaActual()).toBe(true);
    expect(indiceActual()).toBe(indiceAntes);

    // Salir de pantalla completa (toggle del botón): el índice se mantiene.
    act(() => {
      fireEvent.click(
        screen.getByRole('button', { name: 'Salir de pantalla completa' }),
      );
    });
    expect(document.exitFullscreen).toHaveBeenCalled();
    expect(pantallaCompletaActual()).toBe(false);
    expect(indiceActual()).toBe(indiceAntes);
  });

  it('salir con Escape del navegador también preserva el índice (R4.3)', () => {
    renderizarConSesion();

    fireEvent.click(screen.getByRole('button', { name: 'Diapositiva siguiente' }));
    fireEvent.click(screen.getByRole('button', { name: 'Diapositiva siguiente' }));
    const indiceAntes = indiceActual();
    expect(indiceAntes).toBe(2);

    act(() => {
      fireEvent.click(
        screen.getByRole('button', { name: 'Entrar en pantalla completa' }),
      );
    });
    expect(indiceActual()).toBe(indiceAntes);

    // Simular la salida del navegador por Escape: cambia fullscreenElement y
    // dispara fullscreenchange, sin pasar por el botón.
    act(() => {
      elementoPantallaCompleta = null;
      document.dispatchEvent(new Event('fullscreenchange'));
    });
    expect(pantallaCompletaActual()).toBe(false);
    expect(indiceActual()).toBe(indiceAntes);
  });
});
