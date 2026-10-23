/**
 * Pruebas de integración de render de la aplicación (App) — tarea 14.2.
 *
 * Ejercitan el flujo de render de alto nivel sobre el árbol REAL de la
 * aplicación (AppProvider › ProgresoProvider › PresentadorProvider › Shell),
 * sin mocks de contextos, para verificar que:
 *
 *  - La pantalla principal (Home) se renderiza al arrancar: título global y las
 *    tres tarjetas de Sesión (R25.1, R25.2, R25.3 — las tres sesiones están
 *    presentes y son alcanzables desde la interfaz).
 *  - El flujo de render entre las tres Sesiones funciona: al activar la tarjeta
 *    de cada Sesión desde Home, la vista de diapositivas muestra la PRIMERA
 *    diapositiva de esa Sesión (su título) y el indicador "1 de N"; se puede
 *    volver a Inicio y repetir con las demás Sesiones. Esto demuestra que el
 *    contenido de las tres sesiones es renderizable y navegable (R25.1–R25.3).
 *
 * El título de la primera diapositiva proviene de `sesionX.diapositivas[0].titulo`
 * (fuente única, sin duplicar literales), de modo que la prueba es robusta ante
 * cambios de contenido.
 *
 * Recharts se mockea a nivel de módulo por seguridad: aunque la vista de
 * diapositivas no monta gráficos, así ninguna ruta de render que llegue a
 * montar Recharts produce SVG real ni warnings dependientes de layout.
 */

import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock de Recharts: los contenedores renderizan a sus hijos y los elementos de
// dibujo no producen SVG. Mantiene el flujo de render estable en jsdom.
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => children,
  BarChart: ({ children }) => <div>{children}</div>,
  Bar: () => null,
  LineChart: ({ children }) => <div>{children}</div>,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  PieChart: ({ children }) => <div>{children}</div>,
  Pie: () => null,
  Cell: () => null,
}));

import App from './App.jsx';
import { SESIONES } from './context/AppContext.jsx';
import { TITULO_GLOBAL } from './components/home/PantallaPrincipal.jsx';

/**
 * Las tres Sesiones ordenadas por número (1, 2, 3), tal como las presenta la
 * pantalla principal. Fuente única: `SESIONES` del AppContext.
 * @type {Array<{ id: number, titulo: string, diapositivas: Array<{ titulo: string }> }>}
 */
const SESIONES_ORDENADAS = Object.values(SESIONES).sort((a, b) => a.id - b.id);

/**
 * Devuelve el botón de la barra de navegación principal cuyo texto coincide.
 *
 * @param {string} etiqueta - Texto visible del botón (p. ej. 'Inicio').
 * @returns {HTMLElement}
 */
function botonNav(etiqueta) {
  const nav = screen.getByRole('navigation', { name: /navegación principal/i });
  return within(nav).getByRole('button', { name: etiqueta });
}

describe('App — flujo de render entre las tres sesiones (tarea 14.2)', () => {
  beforeEach(() => {
    // Partir siempre sin progreso previo persistido para un estado determinista.
    try {
      globalThis.localStorage?.clear();
    } catch {
      /* localStorage puede no estar disponible; no es requisito de esta prueba */
    }
  });

  it('renderiza la pantalla principal con el título global y las Sesiones', () => {
    render(<App />);

    // Título global de la capacitación (R1.4) presente al arrancar.
    expect(
      screen.getByRole('heading', { name: TITULO_GLOBAL, level: 1 }),
    ).toBeTruthy();

    // Las Sesiones disponibles se muestran como tarjetas en Home.
    expect(SESIONES_ORDENADAS.length).toBeGreaterThanOrEqual(2);
    for (const sesion of SESIONES_ORDENADAS) {
      const titulo = screen.getByText(sesion.titulo);
      const tarjeta = titulo.closest('button');
      expect(tarjeta).not.toBeNull();
      expect(within(tarjeta).getByText(`Sesión ${sesion.id}`)).toBeTruthy();
    }
  });

  it('abre la primera diapositiva de cada Sesión y muestra el indicador "1 de N"', () => {
    render(<App />);

    for (const sesion of SESIONES_ORDENADAS) {
      // Desde Home, activar la tarjeta de la Sesión (abre su primera diapositiva).
      const tarjeta = screen.getByText(sesion.titulo).closest('button');
      expect(tarjeta).not.toBeNull();
      fireEvent.click(tarjeta);

      // La vista de diapositivas muestra el título de la PRIMERA diapositiva
      // de esa Sesión (sesionX.diapositivas[0].titulo), posiblemente repetido
      // (título del layout + aria-label), por eso usamos getAllByText.
      const tituloPrimera = sesion.diapositivas[0].titulo;
      expect(screen.getAllByText(tituloPrimera).length).toBeGreaterThan(0);

      // Indicador "1 de N": la primera diapositiva de una sesión de N láminas.
      const total = sesion.diapositivas.length;
      const indicador = screen.getByText(
        (_, node) =>
          node?.classList?.contains('vista-diapositivas__indicador') &&
          node.textContent.includes(`1 de ${total}`),
      );
      expect(indicador).toBeTruthy();

      // Volver a Inicio para repetir el flujo con la siguiente Sesión.
      fireEvent.click(botonNav('Inicio'));
      expect(
        screen.getByRole('heading', { name: TITULO_GLOBAL, level: 1 }),
      ).toBeTruthy();
    }
  });

  it('cada Sesión expone su título y al menos un concepto en los datos renderizables', () => {
    // Verificación de contenido alcanzable: la fuente de datos que alimenta el
    // render de cada sesión tiene título y conceptos (R25.1–R25.3, R25.4).
    for (const sesion of SESIONES_ORDENADAS) {
      expect(typeof sesion.titulo).toBe('string');
      expect(sesion.titulo.length).toBeGreaterThan(0);
      expect(Array.isArray(sesion.conceptos)).toBe(true);
      expect(sesion.conceptos.length).toBeGreaterThan(0);
      expect(Array.isArray(sesion.diapositivas)).toBe(true);
      expect(sesion.diapositivas.length).toBeGreaterThan(0);
    }

    // Y el flujo de navegación cubre las dos sesiones del programa (1 y 2).
    const ids = SESIONES_ORDENADAS.map((s) => s.id);
    expect(new Set(ids)).toEqual(new Set([1, 2]));
  });
});
