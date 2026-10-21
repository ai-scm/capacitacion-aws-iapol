import fc from 'fast-check';
import {
  EstadoTemporizador,
  AccionTemporizador,
  estadoInicialTemporizador,
  reducerTemporizador,
  calcularTranscurridoMs,
} from './temporizador.js';

/**
 * Prueba de propiedad del reducer puro del temporizador.
 *
 * Modela un reloj que nunca retrocede: se genera una secuencia de operaciones
 * (`iniciar`, `pausar`, `reiniciar`) con marcas de tiempo `now` no negativas y
 * monótonamente no decrecientes. La secuencia se aplica a través del reducer y,
 * en paralelo, se mantiene un acumulador de referencia INDEPENDIENTE que suma
 * únicamente los intervalos transcurridos MIENTRAS el temporizador está
 * corriendo. Al final se compara `calcularTranscurridoMs` contra esa referencia.
 *
 * Operaciones generadas:
 *   - iniciar(now): acción INICIAR con marca `now`.
 *   - pausar(now):  acción PAUSAR con marca `now`.
 *   - reiniciar():  acción REINICIAR (sin marca).
 */

// Una operación genera un delta de avance del reloj (>= 0) y un tipo de acción.
// El `now` absoluto se construye acumulando los deltas, garantizando una
// secuencia de marcas de tiempo monótonamente no decreciente.
const operacionArb = fc.record({
  delta: fc.integer({ min: 0, max: 100000 }),
  tipo: fc.constantFrom(
    AccionTemporizador.INICIAR,
    AccionTemporizador.PAUSAR,
    AccionTemporizador.REINICIAR,
  ),
});

const secuenciaArb = fc.array(operacionArb, { minLength: 0, maxLength: 60 });

// Feature: capacitacion-aws-iapol, Property 4
//
// Property 4: El tiempo transcurrido es la suma de los intervalos en ejecución;
// reiniciar lleva a cero.
// Validates: Requirements 5.3, 5.4, 5.5, 5.6
//
// Para cualquier secuencia de operaciones con un reloj monótono no decreciente:
//   (a) `calcularTranscurridoMs(estado, finalNow)` es igual a la suma de los
//       intervalos transcurridos mientras el temporizador estuvo corriendo;
//   (b) tras REINICIAR el tiempo transcurrido es 0;
//   (c) pausar/detener detiene el incremento: el tiempo transcurrido no crece
//       aunque `now` siga avanzando.
describe('Property 4: tiempo transcurrido como suma de intervalos en ejecución', () => {
  it('el transcurrido es la suma de intervalos en ejecución y reiniciar lleva a cero', () => {
    fc.assert(
      fc.property(secuenciaArb, (operaciones) => {
        let estado = estadoInicialTemporizador();

        // Referencia independiente del tiempo transcurrido consolidado.
        let referenciaAcumulada = 0;
        // Marca de inicio del intervalo en curso según el modelo de referencia.
        let inicioRef = null;
        // Reloj absoluto monótono no decreciente.
        let now = 0;

        for (const op of operaciones) {
          // Avanza el reloj de forma no negativa (nunca retrocede).
          now += op.delta;

          // Antes de aplicar la acción, el modelo de referencia debe cerrar el
          // intervalo en curso si el temporizador estaba corriendo, porque el
          // tiempo pasó MIENTRAS corría hasta este instante.
          if (op.tipo === AccionTemporizador.PAUSAR) {
            if (estado.estado === EstadoTemporizador.CORRIENDO && inicioRef !== null) {
              referenciaAcumulada += now - inicioRef;
              inicioRef = null;
            }
            estado = reducerTemporizador(estado, { type: op.tipo, now });
          } else if (op.tipo === AccionTemporizador.INICIAR) {
            // INICIAR solo tiene efecto si no estaba ya corriendo.
            if (estado.estado !== EstadoTemporizador.CORRIENDO) {
              inicioRef = now;
            }
            estado = reducerTemporizador(estado, { type: op.tipo, now });
          } else {
            // REINICIAR: el modelo de referencia se pone a cero y se detiene.
            referenciaAcumulada = 0;
            inicioRef = null;
            estado = reducerTemporizador(estado, { type: op.tipo });

            // (b) Justo tras reiniciar, el transcurrido es exactamente 0.
            expect(calcularTranscurridoMs(estado, now)).toBe(0);
          }
        }

        // (c) El reloj sigue avanzando después de la última operación.
        const finalNow = now + 50000;

        // El transcurrido de referencia a `finalNow`: la base consolidada más el
        // intervalo en curso si el temporizador quedó corriendo.
        let referenciaFinal = referenciaAcumulada;
        if (estado.estado === EstadoTemporizador.CORRIENDO && inicioRef !== null) {
          referenciaFinal += finalNow - inicioRef;
        }

        // (a) El reducer coincide con la referencia independiente.
        expect(calcularTranscurridoMs(estado, finalNow)).toBe(referenciaFinal);

        // (c) Si no está corriendo, avanzar el reloj no incrementa el transcurrido.
        if (estado.estado !== EstadoTemporizador.CORRIENDO) {
          const antes = calcularTranscurridoMs(estado, finalNow);
          const despues = calcularTranscurridoMs(estado, finalNow + 123456);
          expect(despues).toBe(antes);
        }
      }),
      { numRuns: 200 },
    );
  });
});
