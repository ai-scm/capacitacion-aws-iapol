/**
 * Pruebas unitarias de la pantalla principal (PantallaPrincipal) — R1.
 *
 * Cubren los criterios de aceptación del Requisito 1 verificables a nivel de
 * render e interacción del componente:
 *  - R1.1: al cargarse, la pantalla principal muestra las Sesiones
 *    disponibles (títulos de sesion1/2/3/4).
 *  - R1.2: cada Sesión muestra su número, su título y su duración en minutos
 *    (120 las sesiones 1–3; 60 la sesión 4 de Analítica Geoespacial).
 *  - R1.3: al seleccionar una Sesión, el Sistema_Navegacion abre su primera
 *    Diapositiva (vista 'slides', sesión seleccionada e índice 0).
 *  - R1.4: la pantalla principal muestra el título global de la capacitación
 *    (referido a Amazon Athena, Amazon Quick e IAPOL).
 *
 * También se ejercita directamente el helper puro `textoAvance()` que deriva el
 * indicador de avance mostrado en cada tarjeta (apoya R1.5).
 *
 * El componente consume dos contextos reales (sin mocks): `AppContext`
 * (`SESIONES` + `irASesion`) y `ProgresoContext`. Para R1.3 se monta, junto a
 * la pantalla, un pequeño consumidor de `useApp()` que expone el estado de
 * navegación vigente, de modo que la aserción observe el efecto real de la
 * acción `irASesion` sobre el router por estado.
 */

import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';

import PantallaPrincipal, { TITULO_GLOBAL } from './PantallaPrincipal.jsx';
import { textoAvance } from './TarjetaSesion.jsx';
import { AppProvider, SESIONES, useApp } from '../../context/AppContext.jsx';
import { ProgresoProvider } from '../../context/ProgresoContext.jsx';

/**
 * Lista de las Sesiones ordenadas por número (1, 2, 3), tal como las presenta
 * la pantalla principal. Se deriva de la fuente única `SESIONES`.
 * @type {Array<{ id: number, titulo: string, duracionMin?: number }>}
 */
const SESIONES_ORDENADAS = Object.values(SESIONES).sort((a, b) => a.id - b.id);

/**
 * Sonda de estado de navegación: expone `vistaActual`, `sesionActual` e
 * `indiceDiapositiva` del AppContext como texto, para poder afirmar el efecto
 * real de seleccionar una Sesión (R1.3) sin espías.
 *
 * @returns {import('react').ReactElement}
 */
function SondaNavegacion() {
  const { vistaActual, sesionActual, indiceDiapositiva } = useApp();
  return (
    <div
      data-testid="sonda-navegacion"
      data-vista={vistaActual}
      data-sesion={String(sesionActual)}
      data-indice={String(indiceDiapositiva)}
    />
  );
}

/**
 * Renderiza la pantalla principal envuelta en los proveedores reales de la
 * aplicación, junto a la sonda de navegación.
 *
 * @returns {ReturnType<typeof render>}
 */
function renderizarPantalla() {
  return render(
    <AppProvider>
      <ProgresoProvider>
        <PantallaPrincipal />
        <SondaNavegacion />
      </ProgresoProvider>
    </AppProvider>,
  );
}

describe('PantallaPrincipal (R1)', () => {
  beforeEach(() => {
    // Partir siempre de un estado sin avance previo persistido.
    try {
      globalThis.localStorage?.clear();
    } catch {
      /* localStorage puede no estar disponible; las pruebas no lo requieren */
    }
  });

  it('muestra todas las Sesiones disponibles al cargarse (R1.1)', () => {
    renderizarPantalla();

    // Se muestran todas las sesiones registradas (al menos las tres básicas).
    expect(SESIONES_ORDENADAS.length).toBeGreaterThanOrEqual(3);
    for (const sesion of SESIONES_ORDENADAS) {
      expect(screen.getByText(sesion.titulo)).toBeTruthy();
    }
  });

  it('muestra para cada Sesión su número, título y duración en minutos (R1.2)', () => {
    renderizarPantalla();

    for (const sesion of SESIONES_ORDENADAS) {
      // El título localiza la tarjeta (botón) de la Sesión.
      const titulo = screen.getByText(sesion.titulo);
      const tarjeta = titulo.closest('button');
      expect(tarjeta).not.toBeNull();

      // Número de la Sesión visible dentro de la tarjeta.
      expect(within(tarjeta).getByText(`Sesión ${sesion.id}`)).toBeTruthy();
      // La duración mostrada corresponde al dato `duracionMin` de la sesión.
      expect(typeof sesion.duracionMin).toBe('number');
      expect(
        within(tarjeta).getByText(`${sesion.duracionMin} min`),
      ).toBeTruthy();
    }
  });

  it('muestra el título global de la capacitación (R1.4)', () => {
    renderizarPantalla();

    const encabezado = screen.getByRole('heading', { name: TITULO_GLOBAL, level: 1 });
    expect(encabezado).toBeTruthy();
    // El título referencia los tres ejes temáticos del programa.
    expect(TITULO_GLOBAL).toMatch(/Athena/);
    expect(TITULO_GLOBAL).toMatch(/Quick/);
    expect(TITULO_GLOBAL).toMatch(/IAPOL/);
  });

  it('abre la primera Diapositiva de la Sesión seleccionada (R1.3)', () => {
    renderizarPantalla();

    // Estado inicial: vista 'home', sin sesión activa.
    const sondaInicial = screen.getByTestId('sonda-navegacion');
    expect(sondaInicial.getAttribute('data-vista')).toBe('home');
    expect(sondaInicial.getAttribute('data-sesion')).toBe('null');

    // Seleccionar la segunda Sesión (id 2) activando su tarjeta.
    const sesionObjetivo = SESIONES_ORDENADAS[1];
    const tarjeta = screen.getByText(sesionObjetivo.titulo).closest('button');
    fireEvent.click(tarjeta);

    // El Sistema_Navegacion abre la primera diapositiva de esa Sesión:
    // vista 'slides', sesión = id seleccionado, índice 0.
    const sonda = screen.getByTestId('sonda-navegacion');
    expect(sonda.getAttribute('data-vista')).toBe('slides');
    expect(sonda.getAttribute('data-sesion')).toBe(String(sesionObjetivo.id));
    expect(sonda.getAttribute('data-indice')).toBe('0');
  });

  it('abre la primera Diapositiva de cualquier Sesión seleccionada (R1.3)', () => {
    for (const sesion of SESIONES_ORDENADAS) {
      const { unmount } = renderizarPantalla();

      const tarjeta = screen.getByText(sesion.titulo).closest('button');
      fireEvent.click(tarjeta);

      const sonda = screen.getByTestId('sonda-navegacion');
      expect(sonda.getAttribute('data-vista')).toBe('slides');
      expect(sonda.getAttribute('data-sesion')).toBe(String(sesion.id));
      expect(sonda.getAttribute('data-indice')).toBe('0');

      unmount();
    }
  });
});

describe('textoAvance (indicador de avance de la tarjeta)', () => {
  it('devuelve null cuando no hay progreso previo de la Sesión', () => {
    expect(textoAvance(null, 10)).toBeNull();
    expect(textoAvance(undefined, 10)).toBeNull();
  });

  it('devuelve "Completada" cuando la Sesión está completada', () => {
    expect(textoAvance({ completada: true }, 20)).toBe('Completada');
    // "completada" tiene prioridad sobre la última diapositiva.
    expect(textoAvance({ completada: true, ultimaDiapositiva: 3 }, 20)).toBe(
      'Completada',
    );
  });

  it('devuelve "Diapositiva N de TOTAL" (1-indexado) con avance parcial', () => {
    expect(textoAvance({ ultimaDiapositiva: 0 }, 10)).toBe('Diapositiva 1 de 10');
    expect(textoAvance({ ultimaDiapositiva: 4 }, 10)).toBe('Diapositiva 5 de 10');
  });

  it('acota el índice mostrado al total de diapositivas', () => {
    expect(textoAvance({ ultimaDiapositiva: 99 }, 10)).toBe(
      'Diapositiva 10 de 10',
    );
  });

  it('devuelve "En curso" cuando no se conoce el total', () => {
    expect(textoAvance({ ultimaDiapositiva: 2 }, 0)).toBe('En curso');
  });

  it('devuelve null ante una última diapositiva inválida', () => {
    expect(textoAvance({ ultimaDiapositiva: -1 }, 10)).toBeNull();
    expect(textoAvance({ ultimaDiapositiva: Number.NaN }, 10)).toBeNull();
    expect(textoAvance({}, 10)).toBeNull();
  });
});
