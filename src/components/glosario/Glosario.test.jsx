/**
 * Pruebas unitarias del Glosario con buscador (Glosario) — R14.
 *
 * Cubren:
 *  - Presenta los términos requeridos con sus definiciones (R14.1).
 *  - El buscador filtra las entradas por coincidencia de texto, sin distinguir
 *    mayúsculas, en el término o en la definición (R14.2).
 *  - El campo de búsqueda está etiquetado y hay un resumen de coincidencias y un
 *    estado vacío cuando no hay resultados (accesibilidad).
 *  - La entrada se recorta (trim) antes de filtrar (R23.5).
 */

import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';
import { describe, it, expect } from 'vitest';

import Glosario from './Glosario.jsx';
import { terminos } from '../../data/glosario/terminos.js';

/**
 * Términos requeridos explícitamente por R14.1.
 * @type {string[]}
 */
const TERMINOS_REQUERIDOS = [
  'S3',
  'Glue Data Catalog',
  'Athena',
  'workgroup',
  'Parquet',
  'dataset',
  'análisis',
  'dashboard',
  'SPICE',
  'Direct Query',
  'IAPOL',
];

/** Escribe un texto en el campo de búsqueda del glosario. */
function escribirBusqueda(valor) {
  const input = screen.getByLabelText('Buscar término');
  fireEvent.change(input, { target: { value: valor } });
  return input;
}

/**
 * Busca un `<dt>` de término por su texto exacto. El rol "term" no deriva su
 * nombre accesible del contenido, por eso se consulta por texto.
 *
 * @param {ParentNode} [contenedor] Ámbito de búsqueda (por defecto, el body).
 * @returns {(texto: string) => HTMLElement | null}
 */
function buscarTerminoPorTexto(contenedor = document) {
  return (texto) =>
    Array.from(contenedor.querySelectorAll('.glosario__termino')).find(
      (dt) => dt.textContent === texto,
    ) ?? null;
}

describe('Glosario', () => {
  it('presenta los términos requeridos con sus definiciones (R14.1)', () => {
    render(<Glosario />);
    const encontrar = buscarTerminoPorTexto();
    for (const termino of TERMINOS_REQUERIDOS) {
      const dt = encontrar(termino);
      expect(dt).not.toBeNull();
      // Cada término va seguido de su definición (<dd> no vacío).
      const definicion = dt.nextElementSibling;
      expect(definicion).not.toBeNull();
      expect(definicion.tagName).toBe('DD');
      expect(definicion.textContent.trim().length).toBeGreaterThan(0);
    }
  });

  it('expone un campo de búsqueda etiquetado (accesibilidad)', () => {
    render(<Glosario />);
    const input = screen.getByLabelText('Buscar término');
    expect(input).toBeTruthy();
    expect(input.tagName).toBe('INPUT');
  });

  it('filtra las entradas por coincidencia de texto (R14.2)', () => {
    render(<Glosario />);
    escribirBusqueda('Athena');

    const lista = document.querySelector('.glosario__lista');
    expect(lista).not.toBeNull();
    const dts = Array.from(lista.querySelectorAll('.glosario__termino'));
    const terminosVisibles = dts.map((dt) => dt.textContent);

    // Solo deben aparecer entradas que contengan "athena" (en término o
    // definición), sin distinguir mayúsculas.
    for (const dt of dts) {
      const entrada = dt.textContent + ' ' + dt.nextElementSibling.textContent;
      expect(entrada.toLowerCase()).toContain('athena');
    }
    // El propio término "Athena" está entre los resultados.
    expect(terminosVisibles).toContain('Athena');
  });

  it('la búsqueda no distingue mayúsculas y minúsculas (R14.2)', () => {
    render(<Glosario />);
    escribirBusqueda('spice');
    expect(buscarTerminoPorTexto()('SPICE')).not.toBeNull();
  });

  it('coincide también en la definición, no solo en el término (R14.2)', () => {
    render(<Glosario />);
    // "columnar" aparece en la definición de Parquet, no en ningún término.
    escribirBusqueda('columnar');
    expect(buscarTerminoPorTexto()('Parquet')).not.toBeNull();
  });

  it('recorta la entrada antes de filtrar (R23.5)', () => {
    render(<Glosario />);
    escribirBusqueda('   Athena   ');
    expect(buscarTerminoPorTexto()('Athena')).not.toBeNull();
  });

  it('muestra un estado vacío cuando no hay coincidencias', () => {
    render(<Glosario />);
    escribirBusqueda('xyz-no-existe');
    expect(document.querySelector('.glosario__lista')).toBeNull();
    const vacio = screen.getByText(/No se encontraron términos/i);
    expect(vacio).toBeTruthy();
  });

  it('anuncia el número de coincidencias en una región aria-live', () => {
    render(<Glosario />);
    const resumen = screen.getByRole('status');
    expect(resumen.textContent).toContain(String(terminos.length));

    escribirBusqueda('Athena');
    expect(screen.getByRole('status').textContent.toLowerCase()).toContain(
      'coincidencia',
    );
  });

  it('sin búsqueda, muestra todas las entradas', () => {
    render(<Glosario />);
    const lista = document.querySelector('.glosario__lista');
    expect(lista.querySelectorAll('.glosario__termino').length).toBe(
      terminos.length,
    );
  });
});
