import fc from 'fast-check';
import { siguienteIndice, anteriorIndice } from './navegacion.js';

// Feature: capacitacion-aws-iapol, Property 1
//
// Property 1: La navegación nunca sale de rango y se mueve a lo sumo una diapositiva.
// Validates: Requirements 3.1, 3.2, 3.3, 3.4
//
// Para cualquier total >= 1 y cualquier índice i válido en [0, total-1]:
//   - siguienteIndice(i, total) y anteriorIndice(i, total) devuelven un valor en [0, total-1];
//   - avanzar incrementa en 1 salvo en la última diapositiva (donde permanece en total-1);
//   - retroceder decrementa en 1 salvo en la primera (donde permanece en 0).

describe('Property 1: navegación acotada y de un paso', () => {
  // Generador inteligente: primero un total >= 1, luego un índice válido
  // restringido a [0, total-1], de modo que solo se exploran entradas válidas.
  const indiceEnRango = fc
    .integer({ min: 1, max: 100_000 })
    .chain((total) =>
      fc.record({
        total: fc.constant(total),
        indice: fc.integer({ min: 0, max: total - 1 }),
      }),
    );

  it('mantiene siguiente/anterior en [0, total-1] y mueve a lo sumo una diapositiva', () => {
    fc.assert(
      fc.property(indiceEnRango, ({ indice, total }) => {
        const siguiente = siguienteIndice(indice, total);
        const anterior = anteriorIndice(indice, total);

        // Nunca sale de rango.
        expect(siguiente).toBeGreaterThanOrEqual(0);
        expect(siguiente).toBeLessThanOrEqual(total - 1);
        expect(anterior).toBeGreaterThanOrEqual(0);
        expect(anterior).toBeLessThanOrEqual(total - 1);

        // Avanzar: +1 salvo en la última diapositiva, donde permanece.
        if (indice === total - 1) {
          expect(siguiente).toBe(total - 1);
        } else {
          expect(siguiente).toBe(indice + 1);
        }

        // Retroceder: -1 salvo en la primera diapositiva, donde permanece.
        if (indice === 0) {
          expect(anterior).toBe(0);
        } else {
          expect(anterior).toBe(indice - 1);
        }
      }),
      { numRuns: 200 },
    );
  });
});
