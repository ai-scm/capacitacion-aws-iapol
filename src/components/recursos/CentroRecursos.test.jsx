/**
 * Pruebas unitarias del Centro de Recursos (CentroRecursos) — R16.
 *
 * Cubren:
 *  - Presencia de enlaces a NYC TLC, Amazon Athena y Amazon Quick (QuickSight)
 *    (R16.1).
 *  - Cada enlace abre en una pestaña nueva: `target="_blank"` y
 *    `rel="noopener noreferrer"` (R16.2).
 *  - Nota permanente de fuentes a verificar (R16.3).
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CentroRecursos from './CentroRecursos.jsx';
import { enlaces, notaFuentes } from '../../data/recursos/enlaces.js';

describe('CentroRecursos', () => {
  it('incluye enlaces a NYC TLC, Amazon Athena y Amazon Quick (R16.1)', () => {
    render(<CentroRecursos />);
    const textos = enlaces.map((e) => e.titulo.toLowerCase()).join(' | ');
    expect(textos).toMatch(/nyc tlc/);
    expect(textos).toMatch(/athena/);
    expect(textos).toMatch(/quick/);

    // Y se renderiza un enlace por cada recurso del catálogo.
    const links = screen.getAllByRole('link');
    expect(links.length).toBe(enlaces.length);
  });

  it('abre cada enlace en una pestaña nueva con rel seguro (R16.2)', () => {
    render(<CentroRecursos />);
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link.getAttribute('target')).toBe('_blank');
      const rel = link.getAttribute('rel') ?? '';
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');
      // El href apunta a una URL http(s) válida del catálogo.
      expect(link.getAttribute('href')).toMatch(/^https?:\/\//);
    }
  });

  it('apunta a las URLs oficiales definidas en el dominio de datos', () => {
    render(<CentroRecursos />);
    const links = screen.getAllByRole('link');
    const hrefs = links.map((l) => l.getAttribute('href'));
    for (const enlace of enlaces) {
      expect(hrefs).toContain(enlace.url);
    }
  });

  it('muestra la nota de fuentes a verificar (R16.3)', () => {
    render(<CentroRecursos />);
    expect(screen.getByText(notaFuentes)).toBeTruthy();
  });

  it('indica a tecnologías de asistencia que los enlaces abren una pestaña nueva', () => {
    render(<CentroRecursos />);
    const links = screen.getAllByRole('link');
    for (const link of links) {
      expect(link.textContent.toLowerCase()).toContain('pestaña nueva');
    }
  });
});
