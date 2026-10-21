import { createElement } from 'react';
import { render } from '@testing-library/react';
import fc from 'fast-check';

import { resolverLayout } from './layouts/index.js';

// Feature: capacitacion-aws-iapol, Property 5
//
// Property 5: Las notas del instructor nunca aparecen en la vista pública.
// Validates: Requirements 5.8
//
// Las notas del instructor (`diapositiva.notasInstructor`) son privadas del
// Modo_Presentador y NUNCA deben aparecer en la vista pública de diapositivas.
//
// La vista pública (VistaDiapositivas) presenta la diapositiva actual delegando
// en el sub-componente de layout resuelto por `resolverLayout(diapositiva.layout)`.
// Dado que VistaDiapositivas lee la diapositiva actual desde AppContext (cuyas
// sesiones son datos fijos empaquetados), el enfoque más robusto y directo es
// renderizar el componente de layout resuelto con una diapositiva arbitraria y
// comprobar que el texto del DOM renderizado NO contiene las notas del instructor.
//
// Para evitar falsos positivos por coincidencia accidental con el título o los
// bloques de contenido, las notas se prefijan con un centinela único
// ('NOTA_PRIVADA_') que no se genera en ningún otro campo de la diapositiva.

/** Valores válidos del campo `layout` de una diapositiva. */
const LAYOUTS_DISPONIBLES = [
  'titulo',
  'contenido',
  'sql',
  'diagrama',
  'laboratorio',
  'simulador',
  'identificadores',
  'diagnostico',
  'evaluacion',
];

/** Centinela que marca el texto como "nota privada" del instructor. */
const CENTINELA_NOTA = 'NOTA_PRIVADA_';

/**
 * Generador de un bloque de contenido arbitrario (una de las formas admitidas
 * por BloqueRenderer: texto, lista, codigo, nota, imagen). Los textos evitan el
 * centinela para que cualquier aparición del mismo en el DOM solo pueda provenir
 * de `notasInstructor`.
 */
const arbBloque = fc.oneof(
  fc.record({
    tipo: fc.constant('texto'),
    texto: fc.string(),
  }),
  fc.record({
    tipo: fc.constant('lista'),
    ordenada: fc.boolean(),
    items: fc.array(fc.string(), { maxLength: 5 }),
  }),
  fc.record({
    tipo: fc.constant('codigo'),
    lenguaje: fc.constantFrom('sql', 'js', 'bash'),
    codigo: fc.string(),
  }),
  fc.record({
    tipo: fc.constant('nota'),
    variante: fc.constantFrom('info', 'advertencia', 'simulacion', 'iapol'),
    texto: fc.string(),
  }),
  fc.record({
    tipo: fc.constant('imagen'),
    src: fc.webUrl(),
    alt: fc.string(),
    leyenda: fc.string(),
  }),
);

/**
 * Generador de una diapositiva arbitraria con `notasInstructor` NO vacías y
 * prefijadas con el centinela único.
 */
const arbDiapositiva = fc.record({
  id: fc.string({ minLength: 1 }),
  layout: fc.constantFrom(...LAYOUTS_DISPONIBLES),
  titulo: fc.string(),
  contenido: fc.array(arbBloque, { maxLength: 6 }),
  objetivos: fc.array(fc.string(), { maxLength: 5 }),
  // Nota privada no vacía: centinela + sufijo arbitrario.
  notasInstructor: fc
    .string({ minLength: 1 })
    .map((sufijo) => `${CENTINELA_NOTA}${sufijo}`),
});

describe('Property 5: las notas del instructor nunca aparecen en la vista pública', () => {
  it('el DOM renderizado por el layout público no contiene notasInstructor', () => {
    fc.assert(
      fc.property(arbDiapositiva, (diapositiva) => {
        const Layout = resolverLayout(diapositiva.layout);
        const { container, unmount } = render(
          createElement(Layout, { diapositiva }),
        );

        try {
          const textoDom = container.textContent ?? '';
          // El centinela de la nota privada NUNCA debe aparecer en la vista pública.
          expect(textoDom.includes(CENTINELA_NOTA)).toBe(false);
          // Y, por tanto, tampoco la nota completa del instructor.
          expect(textoDom.includes(diapositiva.notasInstructor)).toBe(false);
        } finally {
          unmount();
        }
      }),
      { numRuns: 100 },
    );
  });
});
