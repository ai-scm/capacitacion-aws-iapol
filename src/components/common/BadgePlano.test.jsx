/**
 * Pruebas unitarias de las insignias de plano — R21.1, R21.4.
 *
 * Cubren: etiquetas visibles por plano, diferenciación visual (clase modificadora
 * distinta por plano), marcado accesible (role/aria-label), rechazo de planos
 * inválidos y el atajo BadgeSimulacion que fija "Simulación local".
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BadgePlano, {
  PLANOS,
  ETIQUETAS_PLANO,
  PLANOS_VALIDOS,
} from './BadgePlano.jsx';
import BadgeSimulacion from './BadgeSimulacion.jsx';

describe('BadgePlano', () => {
  it('renderiza la etiqueta "Amazon Quick real" para el plano quick-real', () => {
    render(<BadgePlano plano={PLANOS.QUICK_REAL} />);
    expect(screen.getByText('Amazon Quick real')).toBeTruthy();
  });

  it('renderiza la etiqueta "Simulación local" para el plano simulacion-local', () => {
    render(<BadgePlano plano={PLANOS.SIMULACION_LOCAL} />);
    expect(screen.getByText('Simulación local')).toBeTruthy();
  });

  it('renderiza la etiqueta "Proceso institucional IAPOL" para el plano iapol', () => {
    render(<BadgePlano plano={PLANOS.IAPOL} />);
    expect(screen.getByText('Proceso institucional IAPOL')).toBeTruthy();
  });

  it('aplica una clase modificadora distinta por cada plano (diferenciación visual)', () => {
    const clases = PLANOS_VALIDOS.map((plano) => {
      const { container } = render(<BadgePlano plano={plano} />);
      const el = container.querySelector('.badge-plano');
      expect(el).not.toBeNull();
      expect(el.classList.contains(`badge-plano--${plano}`)).toBe(true);
      return `badge-plano--${plano}`;
    });
    // Las tres clases modificadoras son únicas entre sí.
    expect(new Set(clases).size).toBe(3);
  });

  it('expone marcado accesible con role status y aria-label descriptivo', () => {
    render(<BadgePlano plano={PLANOS.SIMULACION_LOCAL} />);
    const el = screen.getByRole('status');
    expect(el.getAttribute('aria-label')).toContain('simulación local');
  });

  it('acepta clases adicionales mediante className sin perder las propias', () => {
    const { container } = render(
      <BadgePlano plano={PLANOS.IAPOL} className="extra" />,
    );
    const el = container.querySelector('.badge-plano');
    expect(el.classList.contains('badge-plano')).toBe(true);
    expect(el.classList.contains('badge-plano--iapol')).toBe(true);
    expect(el.classList.contains('extra')).toBe(true);
  });

  it('no renderiza nada ante un plano inválido o ausente', () => {
    const { container: c1 } = render(<BadgePlano plano="desconocido" />);
    expect(c1.querySelector('.badge-plano')).toBeNull();

    const { container: c2 } = render(<BadgePlano />);
    expect(c2.querySelector('.badge-plano')).toBeNull();
  });

  it('mantiene coherencia entre PLANOS, ETIQUETAS_PLANO y PLANOS_VALIDOS', () => {
    expect(PLANOS_VALIDOS).toEqual([
      'quick-real',
      'simulacion-local',
      'iapol',
    ]);
    for (const plano of PLANOS_VALIDOS) {
      expect(typeof ETIQUETAS_PLANO[plano]).toBe('string');
      expect(ETIQUETAS_PLANO[plano].length).toBeGreaterThan(0);
    }
  });
});

describe('BadgeSimulacion', () => {
  it('siempre renderiza la insignia de "Simulación local"', () => {
    const { container } = render(<BadgeSimulacion />);
    expect(screen.getByText('Simulación local')).toBeTruthy();
    const el = container.querySelector('.badge-plano');
    expect(el.classList.contains('badge-plano--simulacion-local')).toBe(true);
  });

  it('propaga className al BadgePlano subyacente', () => {
    const { container } = render(<BadgeSimulacion className="fija" />);
    const el = container.querySelector('.badge-plano');
    expect(el.classList.contains('fija')).toBe(true);
  });
});
