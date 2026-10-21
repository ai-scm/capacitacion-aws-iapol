import fc from 'fast-check';
import {
  CAMPOS_DATASET,
  MIN_CAMPOS,
  MAX_CAMPOS,
  validarSeleccionCampos,
  estadoInicialFiltros,
  resetFiltros,
} from './simulador.js';

// Feature: capacitacion-aws-iapol, Property 8
//
// Property 8: La selección de campos del simulador respeta el rango 1-3.
// Validates: Requirements 10.1
//
// Para cualquier selección de campos, el Simulador_Dashboards la acepta
// (ok:true) si y solo si contiene entre MIN_CAMPOS (1) y MAX_CAMPOS (3) campos
// válidos y DISTINTOS del Dataset_Ejemplo; en cualquier otro caso la rechaza
// (ok:false). Se exploran selecciones con subconjuntos válidos, campos
// desconocidos, duplicados, vacías y con más de 3 elementos.

describe('Property 8: selección de campos acotada a 1-3 campos válidos distintos', () => {
  // Campos desconocidos: cadenas que nunca pertenecen al dataset válido.
  const campoDesconocido = fc
    .string()
    .filter((s) => !CAMPOS_DATASET.includes(s));

  // Un campo cualquiera: válido (del dataset) o desconocido, para mezclar
  // ambos casos y ejercitar tanto aceptación como rechazo.
  const campoArbitrario = fc.oneof(
    fc.constantFrom(...CAMPOS_DATASET),
    campoDesconocido,
  );

  // Selección arbitraria de 0..6 campos: cubre vacío (0), rango válido (1..3),
  // exceso (4..6), posibles duplicados y campos desconocidos.
  const seleccionArbitraria = fc.array(campoArbitrario, {
    minLength: 0,
    maxLength: 6,
  });

  it('acepta la selección si y solo si son 1-3 campos válidos distintos', () => {
    const validos = new Set(CAMPOS_DATASET);

    fc.assert(
      fc.property(seleccionArbitraria, (campos) => {
        const unicos = new Set(campos);
        const esValida =
          campos.length >= MIN_CAMPOS &&
          campos.length <= MAX_CAMPOS &&
          unicos.size === campos.length &&
          campos.every((campo) => validos.has(campo));

        const resultado = validarSeleccionCampos(campos);

        // El veredicto coincide exactamente con la definición de validez.
        expect(resultado.ok).toBe(esValida);

        // Cuando se rechaza, siempre acompaña un motivo; cuando se acepta, no.
        if (esValida) {
          expect(resultado.error).toBeUndefined();
        } else {
          expect(typeof resultado.error).toBe('string');
        }
      }),
      { numRuns: 200 },
    );
  });
});

// Feature: capacitacion-aws-iapol, Property 10
//
// Property 10: El restablecimiento de filtros es idempotente y restaura el
//              conjunto completo.
// Validates: Requirements 12.3
//
// Para cualquier estado de filtros aplicados, restablecer los filtros produce
// el estado inicial "sin filtros" (que representa el Dataset_Ejemplo completo),
// y aplicar el restablecimiento dos veces produce el mismo resultado que
// aplicarlo una vez. Como resetFiltros() ignora el estado previo, se verifica
// que su salida es siempre igual al estado inicial y a una segunda aplicación.

describe('Property 10: el reset de filtros es idempotente y restaura el conjunto completo', () => {
  // Estado de filtros aplicados arbitrario: desde/hasta pueden ser null (sin
  // límite) o una fecha ISO cualquiera, simulando cualquier acotación previa.
  // Generamos la fecha ISO a partir de una marca de tiempo entera acotada en
  // lugar de fc.date(): así nunca se construye un Date inválido (cuyo
  // .toISOString() lanzaría RangeError durante la generación/shrinking de
  // fast-check). Cualquier fecha dentro de un rango amplio y realista basta
  // para la propiedad, que de hecho ignora el valor concreto.
  const MIN_MS = Date.UTC(1970, 0, 1);
  const MAX_MS = Date.UTC(2100, 11, 31, 23, 59, 59, 999);
  const fechaONulo = fc.option(
    fc
      .integer({ min: MIN_MS, max: MAX_MS })
      .map((ms) => new Date(ms).toISOString()),
    { nil: null },
  );
  const filtrosAplicados = fc.record({
    desde: fechaONulo,
    hasta: fechaONulo,
  });

  it('restaura siempre el estado inicial sin filtros y es idempotente', () => {
    const inicial = estadoInicialFiltros();

    fc.assert(
      fc.property(filtrosAplicados, () => {
        // Restablecer restaura el conjunto completo (estado inicial sin filtros).
        const unaVez = resetFiltros();
        expect(unaVez).toEqual(inicial);
        expect(unaVez).toEqual({ desde: null, hasta: null });

        // Idempotencia: aplicar el reset dos veces equivale a aplicarlo una vez.
        const dosVeces = resetFiltros();
        expect(dosVeces).toEqual(unaVez);
      }),
      { numRuns: 200 },
    );
  });
});
