import fc from 'fast-check';
import {
  serializarProgreso,
  deserializarProgreso,
  estadoInicialProgreso,
  reiniciarProgreso,
  esProgresoValido,
  VERSION_PROGRESO,
} from './progreso.js';

/**
 * Generador de un objeto `Progreso` VÁLIDO arbitrario.
 *
 * Construye la forma exacta del modelo: `version === 1`, un mapa de sesiones
 * con entradas `{ ultimaDiapositiva: number finito, completada: boolean }` y
 * `evaluacion.puntuacion` como `number` finito o `null`. Se usan enteros/floats
 * finitos para evitar que `JSON.stringify` convierta `NaN`/`Infinity` en `null`
 * y rompa el round-trip de forma espuria.
 */
const progresoValidoArb = fc.record({
  version: fc.constant(VERSION_PROGRESO),
  sesiones: fc.dictionary(
    fc.string(),
    fc.record({
      ultimaDiapositiva: fc.integer({ min: 0, max: 1000 }),
      completada: fc.boolean(),
    }),
  ),
  evaluacion: fc.record({
    puntuacion: fc.oneof(
      fc.constant(null),
      fc.integer({ min: 0, max: 100 }),
      fc.double({ min: 0, max: 100, noNaN: true, noDefaultInfinity: true }),
    ),
  }),
});

// Feature: capacitacion-aws-iapol, Property 14
//
// Property 14: El progreso sobrevive a un viaje de ida y vuelta por localStorage.
// Validates: Requirements 15.2
//
// Para cualquier progreso válido `p`, deserializar lo que se serializó devuelve
// `{ ok: true }` con un progreso profundamente igual a `p` (round-trip exacto).
describe('Property 14: round-trip de serialización de progreso', () => {
  it('recupera un progreso igual tras serializar y deserializar', () => {
    fc.assert(
      fc.property(progresoValidoArb, (p) => {
        const resultado = deserializarProgreso(serializarProgreso(p));
        expect(resultado.ok).toBe(true);
        expect(resultado.progreso).toEqual(p);
      }),
      { numRuns: 200 },
    );
  });
});

// Feature: capacitacion-aws-iapol, Property 15
//
// Property 15: La deserialización de progreso corrupto es segura.
// Validates: Requirements 15.4
//
// Para cualquier cadena que NO represente un progreso válido (texto arbitrario
// o JSON estructurado pero con versión/forma incorrecta), `deserializarProgreso`
// devuelve `{ ok: false }` sin lanzar nunca.
describe('Property 15: deserialización segura ante corrupción', () => {
  // Generadores de JSON estructurado pero inválido: versión incorrecta, forma
  // incorrecta de sesiones o de evaluación. Se serializan a texto como entrada.
  const jsonEstructuradoInvalido = fc
    .oneof(
      // Versión incorrecta.
      fc.record({
        version: fc.integer().filter((v) => v !== VERSION_PROGRESO),
        sesiones: fc.constant({}),
        evaluacion: fc.record({ puntuacion: fc.constant(null) }),
      }),
      // Sesiones con forma inválida.
      fc.record({
        version: fc.constant(VERSION_PROGRESO),
        sesiones: fc.oneof(
          fc.constant([]),
          fc.constant(null),
          fc.constant('no-objeto'),
          fc.dictionary(fc.string(), fc.constant({ ultimaDiapositiva: 'x' })),
        ),
        evaluacion: fc.record({ puntuacion: fc.constant(null) }),
      }),
      // Evaluación con forma inválida.
      fc.record({
        version: fc.constant(VERSION_PROGRESO),
        sesiones: fc.constant({}),
        evaluacion: fc.oneof(
          fc.constant(null),
          fc.constant('x'),
          fc.record({ puntuacion: fc.constant('alto') }),
        ),
      }),
      // Valores primitivos serializados (números, strings, booleanos, null).
      fc.anything(),
    )
    .map((valor) => JSON.stringify(valor));

  // Entradas de texto arbitrario (incluye JSON malformado) y JSON estructurado
  // inválido. Se descartan los pocos casos que resulten ser un progreso válido
  // para centrar la propiedad en entradas inválidas.
  const textoInvalido = fc
    .oneof(fc.string(), jsonEstructuradoInvalido)
    .filter((texto) => {
      let datos;
      try {
        datos = JSON.parse(texto);
      } catch {
        return true; // JSON malformado: entrada inválida válida para la prueba.
      }
      return !esProgresoValido(datos);
    });

  it('devuelve ok:false sin lanzar ante cualquier texto corrupto o inválido', () => {
    fc.assert(
      fc.property(textoInvalido, (texto) => {
        let resultado;
        expect(() => {
          resultado = deserializarProgreso(texto);
        }).not.toThrow();
        expect(resultado).toEqual({ ok: false });
      }),
      { numRuns: 200 },
    );
  });
});

// Feature: capacitacion-aws-iapol, Property 16
//
// Property 16: El restablecimiento del progreso es idempotente.
// Validates: Requirements 15.3
//
// Para cualquier progreso arbitrario `p`: `reiniciarProgreso(p)` es igual al
// estado inicial, y reiniciar dos veces equivale a reiniciar una vez.
describe('Property 16: restablecimiento idempotente de progreso', () => {
  it('reinicia al estado inicial y es idempotente', () => {
    fc.assert(
      fc.property(fc.anything(), (p) => {
        const inicial = estadoInicialProgreso();
        const unaVez = reiniciarProgreso(p);
        const dosVeces = reiniciarProgreso(reiniciarProgreso(p));

        expect(unaVez).toEqual(inicial);
        expect(dosVeces).toEqual(unaVez);
      }),
      { numRuns: 200 },
    );
  });
});
