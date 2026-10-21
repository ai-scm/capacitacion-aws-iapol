import fc from 'fast-check';
import { buscarTerminos } from './glosario.js';

// Feature: capacitacion-aws-iapol, Property 13
//
// Property 13: La búsqueda del glosario solo devuelve coincidencias.
// Validates: Requirements 14.2
//
// Para cualquier lista de términos { termino, definicion } y cualquier texto de
// búsqueda no vacío, buscarTerminos devuelve únicamente entradas cuyo término o
// cuya definición contiene el texto buscado, sin distinguir mayúsculas de
// minúsculas.

describe('Property 13: la búsqueda del glosario solo devuelve coincidencias', () => {
  // Entrada arbitraria del glosario.
  const entrada = fc.record({
    termino: fc.string(),
    definicion: fc.string(),
  });

  // Lista arbitraria de entradas del glosario.
  const terminos = fc.array(entrada, { maxLength: 30 });

  it('toda entrada devuelta contiene el texto buscado (texto arbitrario)', () => {
    fc.assert(
      fc.property(
        terminos,
        // Texto de búsqueda no vacío y sin espacios al borde para evitar el
        // caso "sin filtro" (que devolvería todas las entradas).
        fc.string({ minLength: 1 }).filter((t) => t.trim().length > 0),
        (lista, texto) => {
          const resultado = buscarTerminos(texto, lista);
          const textoNormalizado = texto.toLowerCase().trim();

          for (const item of resultado) {
            const termino = (item.termino ?? '').toLowerCase();
            const definicion = (item.definicion ?? '').toLowerCase();
            const coincide =
              termino.includes(textoNormalizado) ||
              definicion.includes(textoNormalizado);
            expect(coincide).toBe(true);
          }
        },
      ),
      { numRuns: 200 },
    );
  });

  it('encuentra coincidencias derivadas de subcadenas reales de las entradas', () => {
    // Genera una lista no vacía y deriva el texto de búsqueda de una subcadena
    // de una de sus entradas, garantizando que existan coincidencias reales.
    const generador = fc
      .array(entrada, { minLength: 1, maxLength: 30 })
      .chain((lista) =>
        fc.record({
          lista: fc.constant(lista),
          indice: fc.integer({ min: 0, max: lista.length - 1 }),
          campo: fc.constantFrom('termino', 'definicion'),
        }),
      )
      .chain(({ lista, indice, campo }) => {
        const fuente = lista[indice][campo];
        // Si el campo está vacío, recurrimos a "a" (texto que puede o no
        // coincidir); la invariante sigue siendo "solo devuelve coincidencias".
        const maxFin = Math.max(1, fuente.length);
        return fc.record({
          lista: fc.constant(lista),
          texto:
            fuente.length === 0
              ? fc.constant('a')
              : fc
                  .tuple(
                    fc.integer({ min: 0, max: fuente.length - 1 }),
                    fc.integer({ min: 1, max: maxFin }),
                  )
                  .map(([inicio, largo]) =>
                    fuente.substring(inicio, inicio + largo),
                  ),
        });
      })
      .filter(({ texto }) => texto.trim().length > 0);

    fc.assert(
      fc.property(generador, ({ lista, texto }) => {
        const resultado = buscarTerminos(texto, lista);
        const textoNormalizado = texto.toLowerCase().trim();

        // Invariante: toda entrada devuelta contiene el texto buscado.
        for (const item of resultado) {
          const termino = (item.termino ?? '').toLowerCase();
          const definicion = (item.definicion ?? '').toLowerCase();
          const coincide =
            termino.includes(textoNormalizado) ||
            definicion.includes(textoNormalizado);
          expect(coincide).toBe(true);
        }
      }),
      { numRuns: 200 },
    );
  });
});
