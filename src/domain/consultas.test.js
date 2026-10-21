import fc from 'fast-check';
import {
  resolverConsulta,
  MENSAJE_CONSULTA_NO_DISPONIBLE,
  MENSAJE_CONSULTA_INVALIDA,
} from './consultas.js';

// Pruebas de propiedad del motor de consultas demo del Laboratorio SQL.
// El runner usa globals:true (describe/it/expect disponibles sin importar).

describe('Motor de consultas demo (resolverConsulta)', () => {
  // Generador de una entrada de catálogo bien formada.
  const entradaArb = (id) =>
    fc.record({
      id: fc.constant(id),
      etiqueta: fc.string(),
      sql: fc.string(),
      resultado: fc.record({
        columnas: fc.array(fc.string(), { maxLength: 6 }),
        filas: fc.array(
          fc.array(fc.oneof(fc.string(), fc.integer()), { maxLength: 6 }),
          { maxLength: 8 },
        ),
      }),
    });

  // Generador de un catálogo con ids únicos y no vacíos (tras trim), y un id
  // objetivo que puede o no pertenecer al catálogo. Garantiza cubrir ambos
  // casos: id presente (seleccionado del catálogo) e id ausente.
  const catalogoConIdArb = fc
    .uniqueArray(
      fc
        .string({ minLength: 1, maxLength: 12 })
        .filter((s) => s.trim().length > 0),
      { minLength: 1, maxLength: 10, selector: (s) => s.trim() },
    )
    .chain((ids) =>
      fc.record({
        catalogo: fc.tuple(...ids.map((id) => entradaArb(id))),
        // El id objetivo: uno existente del catálogo, o uno arbitrario que
        // puede no existir, para cubrir ambas ramas de la totalidad.
        idObjetivo: fc.oneof(
          fc.constantFrom(...ids),
          fc.string({ minLength: 1, maxLength: 12 }).filter((s) => s.trim().length > 0),
        ),
      }),
    );

  // Feature: capacitacion-aws-iapol, Property 6
  //
  // Property 6: El motor de consultas es total respecto al catálogo.
  // Validates: Requirements 9.2, 9.4
  //
  // Para cualquier catálogo (ids únicos) y cualquier id, resolverConsulta
  // devuelve éxito con el resultado precalculado coincidente exactamente
  // cuando el id pertenece al catálogo, y fallo sin resultado en caso contrario.
  it('Property 6: es total respecto al catálogo (éxito si y solo si el id existe)', () => {
    fc.assert(
      fc.property(catalogoConIdArb, ({ catalogo, idObjetivo }) => {
        const resolucion = resolverConsulta(idObjetivo, catalogo);
        const coincidente = catalogo.find(
          (entrada) => entrada.id === idObjetivo.trim(),
        );

        if (coincidente !== undefined) {
          // Dentro del catálogo: éxito con el resultado precalculado exacto.
          expect(resolucion.ok).toBe(true);
          expect(resolucion.resultado).toEqual(coincidente.resultado);
          expect(resolucion.error).toBeUndefined();
        } else {
          // Fuera del catálogo: fallo sin resultado alguno.
          expect(resolucion.ok).toBe(false);
          expect(resolucion.resultado).toBeUndefined();
          expect(resolucion.error).toBe(MENSAJE_CONSULTA_NO_DISPONIBLE);
        }
      }),
      { numRuns: 200 },
    );
  });

  // Generador de entradas inválidas: null, undefined, cadena vacía o compuesta
  // únicamente por espacios en blanco (espacios, tabs, saltos de línea).
  const entradaInvalidaArb = fc.oneof(
    fc.constant(null),
    fc.constant(undefined),
    fc.constant(''),
    fc
      .array(fc.constantFrom(' ', '\t', '\n', '\r', '\f', '\v'), {
        minLength: 1,
        maxLength: 12,
      })
      .map((chars) => chars.join('')),
  );

  // Feature: capacitacion-aws-iapol, Property 7
  //
  // Property 7: La validación de la consulta rechaza entradas vacías.
  // Validates: Requirements 9.5
  //
  // Para cualquier entrada nula, vacía o compuesta solo por espacios en blanco,
  // resolverConsulta rechaza la ejecución (ok:false) y no produce resultados.
  it('Property 7: rechaza entradas vacías/nulas/solo-espacios sin producir resultados', () => {
    fc.assert(
      fc.property(
        entradaInvalidaArb,
        // El catálogo es irrelevante: la validación ocurre antes de resolver.
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1 }),
            etiqueta: fc.string(),
            sql: fc.string(),
            resultado: fc.record({
              columnas: fc.array(fc.string(), { maxLength: 4 }),
              filas: fc.array(fc.array(fc.string(), { maxLength: 4 }), {
                maxLength: 4,
              }),
            }),
          }),
          { maxLength: 6 },
        ),
        (entradaInvalida, catalogo) => {
          const resolucion = resolverConsulta(entradaInvalida, catalogo);
          expect(resolucion.ok).toBe(false);
          expect(resolucion.resultado).toBeUndefined();
          expect(resolucion.error).toBe(MENSAJE_CONSULTA_INVALIDA);
        },
      ),
      { numRuns: 200 },
    );
  });
});
