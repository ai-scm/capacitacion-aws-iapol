/**
 * Pruebas unitarias de las tres hojas de análisis (HojaAnalisis) — R10.5, R11.1.
 *
 * Cubren:
 *  - R11.1: los nombres exactos de las tres Hoja_Analisis aparecen como
 *    pestañas (role=tab) y al cambiar de hoja se muestra la hoja activa.
 *  - R10.5: con un filtro que no deja registros (o registros vacíos) se muestra
 *    el estado vacío (role=status) en lugar de visualizaciones sin datos.
 *
 * Se mockea Recharts para que los gráficos no rendericen SVG real: así las
 * aserciones son estables y no dependen de píxeles del gráfico.
 */

import { render, screen, within } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';
import { describe, it, expect, vi } from 'vitest';

// Mock de Recharts: los contenedores renderizan a sus hijos y los elementos de
// dibujo no producen SVG, manteniendo la estructura verificable sin píxeles.
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
}));

import HojaAnalisis, { NOMBRES_HOJA, HOJAS } from './HojaAnalisis.jsx';

// Pequeño conjunto de registros de enero 2024 (mismo esquema que el dataset).
const REGISTROS_PRUEBA = [
  {
    tpep_pickup_datetime: '2024-01-05T08:30:00',
    payment_type: 1,
    passenger_count: 1,
    trip_distance: 2.5,
    total_amount: 14.3,
  },
  {
    tpep_pickup_datetime: '2024-01-06T18:15:00',
    payment_type: 2,
    passenger_count: 2,
    trip_distance: 4.1,
    total_amount: 22.8,
  },
];

describe('HojaAnalisis', () => {
  it('presenta las tres hojas con sus nombres exactos como pestañas (R11.1)', () => {
    render(<HojaAnalisis registros={REGISTROS_PRUEBA} />);

    const pestanas = screen.getAllByRole('tab');
    expect(pestanas).toHaveLength(3);

    const nombres = pestanas.map((p) => p.textContent);
    expect(nombres).toEqual([
      NOMBRES_HOJA[HOJAS.RESUMEN],
      NOMBRES_HOJA[HOJAS.DETALLE],
      NOMBRES_HOJA[HOJAS.TENDENCIAS],
    ]);

    // Cada nombre visible existe como pestaña seleccionable.
    for (const nombre of Object.values(NOMBRES_HOJA)) {
      expect(screen.getByRole('tab', { name: nombre })).toBeTruthy();
    }
  });

  it('al cambiar de hoja muestra la hoja seleccionada (R11.1, R11.2)', () => {
    render(<HojaAnalisis registros={REGISTROS_PRUEBA} />);

    // Inicialmente "Resumen ejecutivo" está activa.
    const tabResumen = screen.getByRole('tab', {
      name: NOMBRES_HOJA[HOJAS.RESUMEN],
    });
    expect(tabResumen.getAttribute('aria-selected')).toBe('true');

    // El panel activo muestra el encabezado de la hoja de resumen.
    const panel = screen.getByRole('tabpanel');
    expect(
      within(panel).getByRole('heading', { name: NOMBRES_HOJA[HOJAS.RESUMEN] }),
    ).toBeTruthy();

    // Cambiar a "Tendencias".
    const tabTendencias = screen.getByRole('tab', {
      name: NOMBRES_HOJA[HOJAS.TENDENCIAS],
    });
    fireEvent.click(tabTendencias);

    expect(tabTendencias.getAttribute('aria-selected')).toBe('true');
    expect(tabResumen.getAttribute('aria-selected')).toBe('false');
    expect(
      within(screen.getByRole('tabpanel')).getByRole('heading', {
        name: NOMBRES_HOJA[HOJAS.TENDENCIAS],
      }),
    ).toBeTruthy();
  });

  it('muestra el estado vacío cuando no hay registros (R10.5)', () => {
    render(<HojaAnalisis registros={[]} />);

    const vacio = screen.getByRole('status');
    expect(vacio.textContent).toMatch(/no deja ningún registro/i);
  });

  it('muestra el estado vacío cuando el filtro no intersecta registros (R10.5)', () => {
    // Rango de fechas totalmente fuera del dataset de prueba (enero 2024).
    render(
      <HojaAnalisis
        registros={REGISTROS_PRUEBA}
        filtros={{ desde: '2020-01-01', hasta: '2020-01-02' }}
      />,
    );

    const vacio = screen.getByRole('status');
    expect(vacio.textContent).toMatch(/no deja ningún registro/i);
  });
});
