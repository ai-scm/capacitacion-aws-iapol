import fc from 'fast-check';
import { filtrarPorFecha, calcularKPIs } from './agregaciones.js';

// Feature: capacitacion-aws-iapol, Property 9
//
// Property 9: El filtro de fecha acota los datos al rango.
// Validates: Requirements 10.4, 10.5, 12.2
//
// Para cualquier conjunto de filas con `tpep_pickup_datetime` en enero de 2024 y
// cualquier rango [desde, hasta]:
//   - toda fila devuelta tiene su fecha dentro del rango cerrado [desde, hasta]
//     (acotamiento correcto, Req 10.4);
//   - ninguna fila dentro del rango se descarta: el resultado es EXACTAMENTE el
//     subconjunto de filas dentro del rango (Req 12.2);
//   - cuando el rango no intersecta ningún registro, el resultado es vacío
//     (estado vacío, Req 10.5), y en ese caso los KPIs se calculan sobre el
//     subconjunto vacío (totalViajes = 0).
//
// Mínimo 100 iteraciones.

// Límites del dominio temporal usado para generar fechas: enero de 2024.
const INICIO_ENERO_2024 = Date.UTC(2024, 0, 1, 0, 0, 0); // 2024-01-01T00:00:00Z
const FIN_ENERO_2024 = Date.UTC(2024, 0, 31, 23, 59, 59); // 2024-01-31T23:59:59Z

// Generador de timestamps (ms) dentro de enero de 2024.
const timestampEnero = fc.integer({ min: INICIO_ENERO_2024, max: FIN_ENERO_2024 });

// Generador de un RegistroViaje con fecha aleatoria de enero 2024 y el resto de
// campos acotados a valores razonables del Dataset_Ejemplo (NYC Yellow Taxi).
const registroViaje = fc.record({
  tpep_pickup_datetime: timestampEnero.map((ms) => new Date(ms).toISOString()),
  payment_type: fc.integer({ min: 1, max: 6 }),
  passenger_count: fc.integer({ min: 0, max: 6 }),
  trip_distance: fc.double({ min: 0, max: 100, noNaN: true }),
  total_amount: fc.double({ min: 0, max: 500, noNaN: true }),
});

// Conjunto de filas (puede ser vacío).
const filasArb = fc.array(registroViaje, { maxLength: 60 });

// Rango [desde, hasta] como dos timestamps ordenados. Se amplía el rango un poco
// más allá de enero 2024 para que algunos casos cubran todo el conjunto y otros
// lo acoten parcialmente o lo dejen vacío.
const MARGEN = 10 * 24 * 60 * 60 * 1000; // 10 días
const rangoArb = fc
  .tuple(
    fc.integer({ min: INICIO_ENERO_2024 - MARGEN, max: FIN_ENERO_2024 + MARGEN }),
    fc.integer({ min: INICIO_ENERO_2024 - MARGEN, max: FIN_ENERO_2024 + MARGEN }),
  )
  .map(([a, b]) => (a <= b ? [a, b] : [b, a]));

describe('Property 9: el filtro de fecha acota los datos al rango', () => {
  it('devuelve exactamente las filas dentro de [desde, hasta] y nada fuera', () => {
    fc.assert(
      fc.property(filasArb, rangoArb, (filas, [desdeMs, hastaMs]) => {
        const desde = new Date(desdeMs).toISOString();
        const hasta = new Date(hastaMs).toISOString();

        const resultado = filtrarPorFecha(filas, desde, hasta);

        // 1) Toda fila devuelta cae dentro del rango cerrado [desde, hasta].
        for (const fila of resultado) {
          const t = Date.parse(fila.tpep_pickup_datetime);
          expect(t).toBeGreaterThanOrEqual(desdeMs);
          expect(t).toBeLessThanOrEqual(hastaMs);
        }

        // 2) Ninguna fila dentro del rango se descarta: el resultado es
        //    exactamente el subconjunto esperado (mismas filas, mismo orden).
        const esperadas = filas.filter((fila) => {
          const t = Date.parse(fila.tpep_pickup_datetime);
          return t >= desdeMs && t <= hastaMs;
        });
        expect(resultado).toEqual(esperadas);

        // 3) Los KPIs se calculan sobre el subconjunto filtrado.
        const kpis = calcularKPIs(resultado);
        expect(kpis.totalViajes).toBe(esperadas.length);
      }),
      { numRuns: 200 },
    );
  });

  it('devuelve cero filas cuando el rango no intersecta ningún registro', () => {
    fc.assert(
      fc.property(filasArb, (filas) => {
        // Rango completamente anterior a enero 2024: no intersecta ningún
        // registro generado (todos son de enero 2024).
        const desde = new Date(INICIO_ENERO_2024 - 2 * MARGEN).toISOString();
        const hasta = new Date(INICIO_ENERO_2024 - MARGEN).toISOString();

        const resultado = filtrarPorFecha(filas, desde, hasta);

        expect(resultado).toHaveLength(0);
        // Estado vacío: los KPIs sobre el subconjunto vacío son cero.
        expect(calcularKPIs(resultado).totalViajes).toBe(0);
      }),
      { numRuns: 100 },
    );
  });
});
