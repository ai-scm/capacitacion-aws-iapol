/**
 * Pruebas unitarias de los casos de diagnóstico (CasosDiagnostico) — R19.
 *
 * Cubren:
 *  - Presencia de los cinco casos de diagnóstico (R19.1).
 *  - Cada caso lista sus causas posibles (R19.1, R19.2).
 *  - Cada caso muestra la nota de diagnóstico no definitivo (R19.3).
 *  - Ausencia de HTML inyectado (texto plano).
 */

import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CasosDiagnostico from './CasosDiagnostico.jsx';
import { CASOS_DIAGNOSTICO } from '../../data/sesiones/sesion3.js';

describe('CasosDiagnostico', () => {
  it('renderiza los cinco casos de diagnóstico (R19.1)', () => {
    render(<CasosDiagnostico />);
    expect(CASOS_DIAGNOSTICO.length).toBe(5);
    const articulos = document.querySelectorAll('.casos-diagnostico__tarjeta');
    expect(articulos.length).toBe(CASOS_DIAGNOSTICO.length);
    for (const { caso } of CASOS_DIAGNOSTICO) {
      expect(screen.getByRole('heading', { name: caso, level: 3 })).toBeTruthy();
    }
  });

  it('lista las causas posibles de cada caso (R19.1, R19.2)', () => {
    render(<CasosDiagnostico />);
    for (const { caso, causasPosibles } of CASOS_DIAGNOSTICO) {
      const heading = screen.getByRole('heading', { name: caso, level: 3 });
      const tarjeta = heading.closest('article');
      expect(tarjeta).not.toBeNull();
      for (const causa of causasPosibles) {
        expect(within(tarjeta).getByText(causa)).toBeTruthy();
      }
    }
  });

  it('muestra la nota de diagnóstico no definitivo en cada caso (R19.3)', () => {
    render(<CasosDiagnostico />);
    for (const { caso, nota } of CASOS_DIAGNOSTICO) {
      const heading = screen.getByRole('heading', { name: caso, level: 3 });
      const tarjeta = heading.closest('article');
      expect(within(tarjeta).getByText(nota)).toBeTruthy();
    }
  });

  it('renderiza las causas en listas (sin HTML inyectado)', () => {
    render(<CasosDiagnostico />);
    const listas = document.querySelectorAll(
      '.casos-diagnostico__causas-lista',
    );
    expect(listas.length).toBe(CASOS_DIAGNOSTICO.length);
  });
});
