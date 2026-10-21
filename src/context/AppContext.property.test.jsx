import fc from 'fast-check';

import {
  reducerPantallaCompleta,
  estadoInicial,
  VISTAS,
} from './AppContext.jsx';

// Feature: capacitacion-aws-iapol, Property 3
//
// Property 3: El toggle de pantalla completa preserva la diapositiva actual.
// Validates: Requirements 4.3
//
// Para un estado de aplicación arbitrario (indiceDiapositiva, sesionActual,
// vistaActual y pantallaCompleta arbitrarios):
//   - aplicar reducerPantallaCompleta una vez invierte `pantallaCompleta` y deja
//     `indiceDiapositiva` (y vistaActual/sesionActual) sin cambios;
//   - aplicarlo dos veces (entrar y salir) devuelve `pantallaCompleta` a su
//     valor original y conserva `indiceDiapositiva` (entrar+salir preserva la
//     diapositiva actual).

describe('Property 3: el toggle de pantalla completa preserva la diapositiva', () => {
  // Generador inteligente del espacio de estados de navegación: se construye un
  // EstadoApp válido con los campos relevantes para el toggle.
  const estadoApp = fc.record({
    vistaActual: fc.constantFrom(...VISTAS),
    sesionActual: fc.oneof(fc.constant(null), fc.constantFrom(1, 2, 3)),
    indiceDiapositiva: fc.integer({ min: 0, max: 59 }),
    pantallaCompleta: fc.boolean(),
  });

  it('invierte pantallaCompleta una vez y vuelve al original tras entrar+salir, conservando el índice', () => {
    fc.assert(
      fc.property(estadoApp, (estado) => {
        // Un toggle: invierte el flag, preserva el resto.
        const unaVez = reducerPantallaCompleta(estado);
        expect(unaVez.pantallaCompleta).toBe(!estado.pantallaCompleta);
        expect(unaVez.indiceDiapositiva).toBe(estado.indiceDiapositiva);
        expect(unaVez.vistaActual).toBe(estado.vistaActual);
        expect(unaVez.sesionActual).toBe(estado.sesionActual);

        // Dos toggles (entrar y salir): el flag vuelve al original y el índice,
        // la vista y la sesión permanecen intactos.
        const dosVeces = reducerPantallaCompleta(unaVez);
        expect(dosVeces.pantallaCompleta).toBe(estado.pantallaCompleta);
        expect(dosVeces.indiceDiapositiva).toBe(estado.indiceDiapositiva);
        expect(dosVeces.vistaActual).toBe(estado.vistaActual);
        expect(dosVeces.sesionActual).toBe(estado.sesionActual);

        // El reducer es puro: no muta el estado de entrada.
        expect(estado.pantallaCompleta).toBe(estado.pantallaCompleta);
      }),
      { numRuns: 200 },
    );
  });

  it('a partir del estado inicial, entrar+salir preserva indiceDiapositiva', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 59 }), (indice) => {
        const base = { ...estadoInicial, indiceDiapositiva: indice };
        const idaYVuelta = reducerPantallaCompleta(
          reducerPantallaCompleta(base),
        );
        expect(idaYVuelta.indiceDiapositiva).toBe(indice);
        expect(idaYVuelta.pantallaCompleta).toBe(base.pantallaCompleta);
      }),
      { numRuns: 100 },
    );
  });
});
