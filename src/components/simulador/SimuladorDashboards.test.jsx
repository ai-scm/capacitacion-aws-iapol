/**
 * Pruebas unitarias del simulador de gráficos y dashboards (SimuladorDashboards)
 * — R10.5, R12.3.
 *
 * Cubren:
 *  - R10.5: cuando el filtro de fecha no deja ningún registro (o se pasan
 *    registros vacíos) se muestra el estado vacío (role=status) en vez de una
 *    visualización sin datos.
 *  - R12.3: tras aplicar un filtro de fecha, el botón "Restablecer filtros"
 *    restaura el estado sin filtros (el Dataset_Ejemplo completo): el estado
 *    vacío desaparece, el botón vuelve a quedar deshabilitado y los campos de
 *    fecha quedan vacíos.
 *
 * Se mockea Recharts para que los gráficos no rendericen SVG real: las
 * aserciones son estables y no dependen de píxeles del gráfico.
 */

import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';
import { describe, it, expect, vi } from 'vitest';

// Mock de Recharts: contenedores renderizan a sus hijos; elementos de dibujo
// no producen SVG. Así la estructura (controles, estado vacío) es verificable.
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

import SimuladorDashboards from './SimuladorDashboards.jsx';

// Conjunto de registros de enero 2024 (mismo esquema que el Dataset_Ejemplo).
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

/** Devuelve el input de fecha "Desde". */
function inputDesde() {
  return document.querySelector('input[name="filtro-desde"]');
}

/** Devuelve el input de fecha "Hasta". */
function inputHasta() {
  return document.querySelector('input[name="filtro-hasta"]');
}

/** Devuelve el botón "Restablecer filtros". */
function botonReset() {
  return screen.getByRole('button', { name: /restablecer filtros/i });
}

/**
 * Devuelve el párrafo del estado vacío (R10.5) o null si no está presente.
 *
 * Se localiza por su clase para no confundirlo con otros `role="status"`
 * (p. ej. la insignia "Simulación local" de BadgeSimulacion).
 */
function mensajeVacio() {
  return document.querySelector('.simulador__vacio');
}

describe('SimuladorDashboards', () => {
  it('muestra el estado vacío cuando no hay registros (R10.5)', () => {
    render(<SimuladorDashboards registros={[]} />);

    const vacio = mensajeVacio();
    expect(vacio).not.toBeNull();
    // El estado vacío se anuncia como role=status (coherente con R10.5).
    expect(vacio.getAttribute('role')).toBe('status');
    expect(vacio.textContent).toMatch(/no deja ningún registro/i);
  });

  it('muestra el estado vacío cuando el filtro no deja registros (R10.5)', () => {
    render(<SimuladorDashboards registros={REGISTROS_PRUEBA} />);

    // Sin filtro no hay estado vacío (hay registros).
    expect(mensajeVacio()).toBeNull();

    // Aplicar un rango de fechas fuera del dataset de prueba (enero 2024).
    fireEvent.change(inputDesde(), { target: { value: '2020-01-01' } });
    fireEvent.change(inputHasta(), { target: { value: '2020-01-02' } });

    const vacio = mensajeVacio();
    expect(vacio).not.toBeNull();
    expect(vacio.getAttribute('role')).toBe('status');
    expect(vacio.textContent).toMatch(/no deja ningún registro/i);
  });

  it('restablece el filtro al estado sin filtros al pulsar el botón (R12.3)', () => {
    render(<SimuladorDashboards registros={REGISTROS_PRUEBA} />);

    // Sin filtros, el botón de reset está deshabilitado.
    expect(botonReset().disabled).toBe(true);

    // Aplicar un filtro de fecha que deja el conjunto vacío.
    fireEvent.change(inputDesde(), { target: { value: '2020-01-01' } });
    fireEvent.change(inputHasta(), { target: { value: '2020-01-02' } });

    // El filtro está activo: botón habilitado, inputs con valor y estado vacío.
    expect(botonReset().disabled).toBe(false);
    expect(inputDesde().value).toBe('2020-01-01');
    expect(inputHasta().value).toBe('2020-01-02');
    expect(mensajeVacio()).not.toBeNull();

    // Restablecer filtros: vuelve al Dataset_Ejemplo completo.
    fireEvent.click(botonReset());

    // El estado sin filtros: botón deshabilitado, inputs vacíos y sin estado vacío.
    expect(botonReset().disabled).toBe(true);
    expect(inputDesde().value).toBe('');
    expect(inputHasta().value).toBe('');
    expect(mensajeVacio()).toBeNull();
  });
});
