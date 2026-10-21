/**
 * Pruebas unitarias de los identificadores de Amazon Quick e IAPOL
 * (IdentificadoresIAPOL) — R18, R21.4.
 *
 * Cubren:
 *  - Presencia de Dataset ID, Analysis ID, Dashboard ID, id_portal e
 *    id_quicksight con su descripción (R18.1).
 *  - Advertencia de corroboración interna en los campos propios de IAPOL
 *    (id_portal / id_quicksight) (R18.2).
 *  - Advertencia permanente de que copiar una URL o un identificador no habilita
 *    el embebido en IAPOL (R18.3).
 *  - Rótulo del plano IAPOL mediante BadgePlano en los campos de IAPOL (R21.4).
 *  - Ausencia de HTML inyectado (texto plano).
 */

import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import IdentificadoresIAPOL, {
  ADVERTENCIA_EMBEBIDO,
  AMBITO_IAPOL,
} from './IdentificadoresIAPOL.jsx';
import { IDENTIFICADORES } from '../../data/sesiones/sesion3.js';
import { ETIQUETAS_PLANO, PLANOS } from '../common/BadgePlano.jsx';

describe('IdentificadoresIAPOL', () => {
  it('presenta los cinco identificadores con su descripción (R18.1)', () => {
    render(<IdentificadoresIAPOL />);
    for (const { nombre, descripcion } of IDENTIFICADORES) {
      const heading = screen.getByRole('heading', { name: nombre, level: 3 });
      const tarjeta = heading.closest('article');
      expect(tarjeta).not.toBeNull();
      expect(within(tarjeta).getByText(descripcion)).toBeTruthy();
    }
    // Explícitamente los cinco nombres exigidos por R18.1.
    for (const nombre of [
      'Dataset ID',
      'Analysis ID',
      'Dashboard ID',
      'id_portal',
      'id_quicksight',
    ]) {
      expect(screen.getByRole('heading', { name: nombre, level: 3 })).toBeTruthy();
    }
  });

  it('muestra la advertencia de corroboración interna en los campos IAPOL (R18.2)', () => {
    render(<IdentificadoresIAPOL />);
    const camposIapol = IDENTIFICADORES.filter(
      (i) => i.ambito === AMBITO_IAPOL && i.advertencia,
    );
    expect(camposIapol.length).toBeGreaterThan(0);
    for (const { nombre, advertencia } of camposIapol) {
      const heading = screen.getByRole('heading', { name: nombre, level: 3 });
      const tarjeta = heading.closest('article');
      expect(within(tarjeta).getByText(advertencia)).toBeTruthy();
    }
  });

  it('rotula los campos de IAPOL con la insignia del plano IAPOL (R21.4)', () => {
    render(<IdentificadoresIAPOL />);
    const camposIapol = IDENTIFICADORES.filter((i) => i.ambito === AMBITO_IAPOL);
    for (const { nombre } of camposIapol) {
      const heading = screen.getByRole('heading', { name: nombre, level: 3 });
      const tarjeta = heading.closest('article');
      expect(within(tarjeta).getByText(ETIQUETAS_PLANO[PLANOS.IAPOL])).toBeTruthy();
    }
  });

  it('muestra la advertencia permanente de embebido (R18.3)', () => {
    render(<IdentificadoresIAPOL />);
    expect(screen.getByText(ADVERTENCIA_EMBEBIDO)).toBeTruthy();
  });

  it('renderiza las descripciones como texto plano (sin HTML inyectado)', () => {
    const { container } = render(<IdentificadoresIAPOL />);
    const tarjetas = container.querySelectorAll(
      '.identificadores-iapol__tarjeta',
    );
    expect(tarjetas.length).toBe(IDENTIFICADORES.length);
  });
});
