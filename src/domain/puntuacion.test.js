import fc from 'fast-check';
import {
  calcularPuntuacion,
  superaUmbral,
  RUBRICA_POR_DEFECTO,
} from './puntuacion.js';

// Feature: capacitacion-aws-iapol, Property 11
//
// Property 11: La puntuación está en [0,100] y es la suma de las áreas.
// Validates: Requirements 13.1, 13.4
//
// Para cualquier conjunto de respuestas (cada área con total >= 0 y
// 0 <= correctas <= total), calcularPuntuacion devuelve un valor en [0, 100]
// que coincide (salvo error de punto flotante) con la suma independiente de los
// puntos prorrateados por área: rubrica[area] * (correctas / total), aportando
// 0 cuando total === 0.

describe('Property 11: la puntuación está en [0,100] y es la suma de las áreas', () => {
  const EPSILON = 1e-9;

  // Generador por área: primero un total >= 0 y luego un número de correctas
  // acotado inteligentemente a [0, total], de modo que solo se exploren
  // entradas válidas (nunca más correctas que preguntas).
  const areaArb = fc
    .integer({ min: 0, max: 500 })
    .chain((total) =>
      fc.record({
        total: fc.constant(total),
        correctas: fc.integer({ min: 0, max: total }),
      }),
    );

  const respuestasArb = fc.record({
    flujo: areaArb,
    sql: areaArb,
    tres_hojas: areaArb,
    filtros: areaArb,
    publicacion: areaArb,
    iapol: areaArb,
  });

  it('está en [0,100] y equivale a la suma prorrateada por área', () => {
    fc.assert(
      fc.property(respuestasArb, (respuestas) => {
        const puntuacion = calcularPuntuacion(respuestas);

        // Siempre dentro de la escala 0–100.
        expect(puntuacion).toBeGreaterThanOrEqual(0);
        expect(puntuacion).toBeLessThanOrEqual(100);

        // Recomputar de forma independiente la suma de las áreas.
        const esperado = Object.keys(RUBRICA_POR_DEFECTO).reduce((acc, area) => {
          const { correctas, total } = respuestas[area];
          const puntosArea = total === 0 ? 0 : RUBRICA_POR_DEFECTO[area] * (correctas / total);
          return acc + puntosArea;
        }, 0);

        // La suma esperada nunca excede 100 (los máximos suman 100 y cada área
        // aporta como mucho su máximo), por lo que el clamp no altera el valor.
        expect(Math.abs(puntuacion - esperado)).toBeLessThanOrEqual(EPSILON);
      }),
      { numRuns: 200 },
    );
  });
});

// Feature: capacitacion-aws-iapol, Property 12
//
// Property 12: El umbral de aprobación es consistente con la puntuación.
// Validates: Requirements 13.5, 13.6
//
// Para cualquier puntuación p en [0,100], superaUmbral(p, 80) es verdadero si y
// solo si p >= 80. Se cubre explícitamente el límite exacto (p === 80).

describe('Property 12: el umbral de aprobación es consistente con la puntuación', () => {
  it('superaUmbral(p,80) === (p >= 80) para cualquier p en [0,100]', () => {
    fc.assert(
      fc.property(fc.double({ min: 0, max: 100, noNaN: true }), (p) => {
        expect(superaUmbral(p, 80)).toBe(p >= 80);
      }),
      { numRuns: 200 },
    );
  });

  it('es verdadero en el límite exacto del umbral (p === 80)', () => {
    expect(superaUmbral(80, 80)).toBe(true);
    expect(superaUmbral(79.999999, 80)).toBe(false);
    expect(superaUmbral(80.000001, 80)).toBe(true);
  });
});
