import fc from 'fast-check';
import { calcularDimensiones16x9, RELACION_16_9 } from './layout.js';

// Feature: capacitacion-aws-iapol, Property 2
//
// Property 2: El ajuste conserva la relación 16:9 y encaja dentro del contenedor.
// Validates: Requirements 2.1, 2.2, 2.3
//
// Para cualquier contenedor con ancho y alto positivos, calcularDimensiones16x9:
//   - conserva la relación de aspecto 16:9 (16/9 ≈ 1.778) con un error relativo
//     máximo del 1% (R2.1), y
//   - no excede ni el ancho ni el alto del contenedor en ningún eje, de forma
//     que la diapositiva encaja por completo (contain / letterbox / pillarbox)
//     sin desbordar (R2.2, R2.3).

describe('Property 2: layout 16:9 conserva relación y encaja en el contenedor', () => {
  // Generador de contenedores con dimensiones positivas realistas (1..10000 px).
  const contenedor = fc.record({
    anchoContenedor: fc.integer({ min: 1, max: 10_000 }),
    altoContenedor: fc.integer({ min: 1, max: 10_000 }),
  });

  it('mantiene la relación 16:9 dentro del 1% y no desborda el contenedor', () => {
    fc.assert(
      fc.property(contenedor, ({ anchoContenedor, altoContenedor }) => {
        const { ancho, alto } = calcularDimensiones16x9(
          anchoContenedor,
          altoContenedor,
        );

        // Ambas dimensiones deben ser positivas para un contenedor positivo.
        expect(ancho).toBeGreaterThan(0);
        expect(alto).toBeGreaterThan(0);

        // Relación de aspecto conservada dentro de una tolerancia del 1%.
        const relacion = ancho / alto;
        const errorRelativo = Math.abs(relacion - RELACION_16_9) / RELACION_16_9;
        expect(errorRelativo).toBeLessThanOrEqual(0.01);

        // La diapositiva encaja dentro del contenedor en ambos ejes.
        // Epsilon diminuto para absorber error de punto flotante.
        const epsilon = 1e-9;
        expect(ancho).toBeLessThanOrEqual(anchoContenedor + epsilon);
        expect(alto).toBeLessThanOrEqual(altoContenedor + epsilon);
      }),
      { numRuns: 200 },
    );
  });
});
