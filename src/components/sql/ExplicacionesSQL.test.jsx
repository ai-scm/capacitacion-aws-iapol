/**
 * Pruebas unitarias de las explicaciones de SQL (ExplicacionesSQL) — R8.
 *
 * Cubren:
 *  - Presencia de tarjetas para SELECT, WHERE, COUNT, GROUP BY y ORDER BY (R8.1).
 *  - Explicación de JOIN con nota sobre la segunda tabla y la lectura de claves
 *    (R8.2).
 *  - Explicación de agregaciones aplicadas al dataset (R8.3).
 *  - Explicación de vistas que distingue la lógica SQL del consumo analítico
 *    (R8.4).
 *  - Nota permanente de ejemplo didáctico junto a CADA ejemplo SQL (R8.5).
 *  - Cada ejemplo se muestra en un bloque <pre><code> (sin HTML inyectado).
 */

import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ExplicacionesSQL, {
  TARJETAS_SQL,
  NOTA_EJEMPLO_DIDACTICO,
} from './ExplicacionesSQL.jsx';

describe('ExplicacionesSQL', () => {
  it('presenta tarjetas para SELECT, WHERE, COUNT, GROUP BY y ORDER BY (R8.1)', () => {
    render(<ExplicacionesSQL />);
    for (const titulo of ['SELECT', 'WHERE', 'COUNT', 'GROUP BY', 'ORDER BY']) {
      expect(
        screen.getByRole('heading', { name: titulo, level: 3 }),
      ).toBeTruthy();
    }
  });

  it('explica JOIN indicando la segunda tabla y cómo leer las claves (R8.2)', () => {
    render(<ExplicacionesSQL />);
    const heading = screen.getByRole('heading', { name: 'JOIN', level: 3 });
    const tarjeta = heading.closest('article');
    expect(tarjeta).not.toBeNull();
    const texto = tarjeta.textContent.toLowerCase();
    expect(texto).toContain('segunda tabla');
    expect(texto).toContain('clave');
    // El ejemplo contiene una condición ON que empareja las claves.
    expect(tarjeta.textContent).toContain('ON t.payment_type = p.payment_type');
  });

  it('presenta una explicación de agregaciones sobre el dataset (R8.3)', () => {
    render(<ExplicacionesSQL />);
    const heading = screen.getByRole('heading', {
      name: 'Agregaciones',
      level: 3,
    });
    const tarjeta = heading.closest('article');
    const sql = tarjeta.querySelector('code').textContent;
    expect(sql).toContain('SUM(total_amount)');
    expect(sql).toContain('AVG(trip_distance)');
    expect(sql).toContain('FROM yellow_taxi');
  });

  it('explica vistas distinguiendo la lógica SQL del consumo analítico (R8.4)', () => {
    render(<ExplicacionesSQL />);
    const heading = screen.getByRole('heading', {
      name: 'Vistas (VIEW)',
      level: 3,
    });
    const tarjeta = heading.closest('article');
    const sql = tarjeta.querySelector('code').textContent;
    expect(sql).toContain('CREATE VIEW');
    const texto = tarjeta.textContent.toLowerCase();
    expect(texto).toContain('lógica sql');
    expect(texto).toContain('consumo analítico');
  });

  it('muestra la nota permanente de ejemplo didáctico junto a cada ejemplo SQL (R8.5)', () => {
    render(<ExplicacionesSQL />);
    // Una nota por cada tarjeta/ejemplo.
    const notas = screen.getAllByText(NOTA_EJEMPLO_DIDACTICO);
    expect(notas.length).toBe(TARJETAS_SQL.length);
    // Y cada tarjeta tiene su propio bloque de código con la nota al lado.
    const articulos = document.querySelectorAll('.explicaciones-sql__tarjeta');
    expect(articulos.length).toBe(TARJETAS_SQL.length);
    for (const art of articulos) {
      expect(art.querySelector('pre code')).not.toBeNull();
      const nota = within(art).getByText(NOTA_EJEMPLO_DIDACTICO);
      expect(nota).toBeTruthy();
    }
  });

  it('renderiza cada ejemplo SQL en un bloque <pre><code>', () => {
    render(<ExplicacionesSQL />);
    const bloques = document.querySelectorAll(
      '.explicaciones-sql__codigo code',
    );
    expect(bloques.length).toBe(TARJETAS_SQL.length);
  });

  it('expone identificadores y texto SQL coherentes en el modelo de datos', () => {
    const ids = TARJETAS_SQL.map((t) => t.id);
    // Todos los conceptos requeridos están presentes.
    for (const id of [
      'select',
      'where',
      'count',
      'group-by',
      'order-by',
      'join',
      'agregaciones',
      'vistas',
    ]) {
      expect(ids).toContain(id);
    }
    // Ids únicos y SQL no vacío por tarjeta.
    expect(new Set(ids).size).toBe(ids.length);
    for (const t of TARJETAS_SQL) {
      expect(typeof t.sql).toBe('string');
      expect(t.sql.trim().length).toBeGreaterThan(0);
    }
  });
});
