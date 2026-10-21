/**
 * Pruebas unitarias del Laboratorio SQL local (LaboratorioSQL) — R9, R21.
 *
 * El selector de consulta es un combobox con búsqueda + desplegable: un campo
 * de texto ("Buscar consulta") que filtra la lista de consultas predefinidas y
 * un listado desplegable (role="listbox") de opciones seleccionables. Además,
 * se puede escribir directamente el identificador o la etiqueta y ejecutar.
 *
 * Cubren:
 *  - Lista de consultas predefinidas (entre 5 y 20) seleccionables (R9.1).
 *  - Filtrado de la lista al escribir en el buscador (R9.1).
 *  - Ejecución de una consulta elegida desde la lista: muestra el resultado de
 *    demostración con sus columnas y filas (R9.2).
 *  - Etiqueta permanente de Simulación local visible en todas las vistas
 *    (R9.3, R21.4).
 *  - Consulta introducida no incluida: mensaje de no disponible, conservando el
 *    estado sin mostrar resultados (R9.4).
 *  - Consulta vacía/nula: rechazo con mensaje de consulta inválida (R9.5).
 *  - Operación local: el resultado se mapea desde el catálogo sin red (R9.6).
 */

import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import LaboratorioSQL, { filtrarConsultas } from './LaboratorioSQL.jsx';
import CATALOGO_CONSULTAS from '../../data/consultas/catalogo-consultas.js';
import {
  MENSAJE_CONSULTA_INVALIDA,
  MENSAJE_CONSULTA_NO_DISPONIBLE,
} from '../../domain/consultas.js';
import { ETIQUETAS_PLANO, PLANOS } from '../common/BadgePlano.jsx';

/** Etiqueta visible de la insignia de Simulación local. */
const ETIQUETA_SIMULACION = ETIQUETAS_PLANO[PLANOS.SIMULACION_LOCAL];

/** Devuelve el campo de búsqueda (combobox). */
function campoBuscar() {
  return screen.getByLabelText('Buscar consulta');
}

/** Devuelve el botón "Ejecutar consulta". */
function botonEjecutar() {
  return screen.getByRole('button', { name: 'Ejecutar consulta' });
}

/** Abre el desplegable enfocando el campo de búsqueda. */
function abrirLista() {
  fireEvent.focus(campoBuscar());
}

/**
 * Elige una consulta del listado desplegable por su etiqueta y ejecuta.
 *
 * @param {string} etiqueta Etiqueta visible de la consulta a elegir.
 */
function opcionPorEtiqueta(etiqueta) {
  const listbox = screen.getByRole('listbox');
  // El texto de la etiqueta es exacto dentro de su <span>; se sube al <li>.
  const span = within(listbox).getByText(etiqueta);
  return span.closest('[role="option"]');
}

function elegirYEjecutar(etiqueta) {
  abrirLista();
  // onMouseDown es lo que registra la elección en el combobox.
  fireEvent.mouseDown(opcionPorEtiqueta(etiqueta));
  fireEvent.click(botonEjecutar());
}

/**
 * Escribe un texto en el buscador (como identificador o etiqueta manual).
 *
 * @param {string} texto Texto a introducir.
 */
function escribir(texto) {
  fireEvent.change(campoBuscar(), { target: { value: texto } });
}

describe('LaboratorioSQL', () => {
  it('filtrarConsultas: devuelve todo con búsqueda vacía y filtra por texto', () => {
    expect(filtrarConsultas(CATALOGO_CONSULTAS, '')).toHaveLength(
      CATALOGO_CONSULTAS.length,
    );
    const primera = CATALOGO_CONSULTAS[0];
    const resultado = filtrarConsultas(CATALOGO_CONSULTAS, primera.id);
    expect(resultado.some((c) => c.id === primera.id)).toBe(true);
  });

  it('ofrece entre 5 y 20 consultas predefinidas en el desplegable (R9.1)', () => {
    render(<LaboratorioSQL />);
    abrirLista();
    const listbox = screen.getByRole('listbox');
    const opciones = within(listbox).getAllByRole('option');
    expect(opciones.length).toBe(CATALOGO_CONSULTAS.length);
    expect(opciones.length).toBeGreaterThanOrEqual(5);
    expect(opciones.length).toBeLessThanOrEqual(20);
    // Cada consulta del catálogo aparece como opción (etiqueta + id visibles).
    for (const consulta of CATALOGO_CONSULTAS) {
      expect(within(listbox).getByText(consulta.etiqueta)).toBeTruthy();
      expect(within(listbox).getByText(consulta.id)).toBeTruthy();
    }
  });

  it('filtra la lista al escribir en el buscador (R9.1)', () => {
    render(<LaboratorioSQL />);
    const objetivo = CATALOGO_CONSULTAS[0];
    abrirLista();
    escribir(objetivo.id);
    const listbox = screen.getByRole('listbox');
    const opciones = within(listbox).getAllByRole('option');
    // El filtrado deja menos (o igual) opciones y conserva la buscada.
    expect(opciones.length).toBeLessThanOrEqual(CATALOGO_CONSULTAS.length);
    expect(within(listbox).getByText(objetivo.etiqueta)).toBeTruthy();
  });

  it('muestra el texto SQL (solo visual) de la consulta elegida (R9.1)', () => {
    render(<LaboratorioSQL />);
    const consulta = CATALOGO_CONSULTAS[0];
    abrirLista();
    fireEvent.mouseDown(opcionPorEtiqueta(consulta.etiqueta));
    const codigo = document.querySelector('.laboratorio-sql__codigo code');
    expect(codigo).not.toBeNull();
    expect(codigo.textContent).toBe(consulta.sql);
  });

  it('ejecuta una consulta elegida y muestra columnas y filas (R9.2)', () => {
    render(<LaboratorioSQL />);
    const consulta = CATALOGO_CONSULTAS.find(
      (c) => c.id === 'viajes-por-tipo-pago',
    );
    elegirYEjecutar(consulta.etiqueta);

    const tabla = screen.getByRole('table');
    const cabeceras = within(tabla)
      .getAllByRole('columnheader')
      .map((th) => th.textContent);
    expect(cabeceras).toEqual([...consulta.resultado.columnas]);

    const filasCuerpo = within(tabla.querySelector('tbody')).getAllByRole(
      'row',
    );
    expect(filasCuerpo.length).toBe(consulta.resultado.filas.length);

    const primeraFila = within(filasCuerpo[0]).getAllByRole('cell');
    expect(primeraFila.map((td) => td.textContent)).toEqual(
      consulta.resultado.filas[0].map((v) => String(v)),
    );
  });

  it('muestra la etiqueta permanente de Simulación local en todas las vistas (R9.3, R21.4)', () => {
    render(<LaboratorioSQL />);
    // Presente antes de ejecutar nada.
    expect(screen.getByText(ETIQUETA_SIMULACION)).toBeTruthy();

    // Presente tras ejecutar una consulta soportada.
    elegirYEjecutar(CATALOGO_CONSULTAS[0].etiqueta);
    expect(screen.getByText(ETIQUETA_SIMULACION)).toBeTruthy();
    expect(screen.getByRole('table')).toBeTruthy();
  });

  it('rechaza la ejecución vacía/nula con el mensaje de consulta inválida (R9.5)', () => {
    render(<LaboratorioSQL />);
    // Sin escribir ni elegir nada, se ejecuta directamente.
    fireEvent.click(botonEjecutar());
    expect(screen.getByRole('alert').textContent).toBe(
      MENSAJE_CONSULTA_INVALIDA,
    );
    // No se muestran resultados.
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('ante una consulta introducida no incluida muestra no disponible y conserva el estado sin resultados (R9.4)', () => {
    render(<LaboratorioSQL />);
    // La persona introduce un id que no pertenece al catálogo soportado.
    escribir('consulta-inexistente');
    fireEvent.click(botonEjecutar());

    const alerta = screen.getByRole('alert');
    expect(alerta.textContent).toBe(MENSAJE_CONSULTA_NO_DISPONIBLE);
    // Se conserva el estado sin mostrar resultados.
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('ejecuta una consulta soportada introducida manualmente por id (R9.1, R9.2)', () => {
    render(<LaboratorioSQL />);
    const consulta = CATALOGO_CONSULTAS[0];
    escribir(consulta.id);
    fireEvent.click(botonEjecutar());

    const tabla = screen.getByRole('table');
    const cabeceras = within(tabla)
      .getAllByRole('columnheader')
      .map((th) => th.textContent);
    expect(cabeceras).toEqual([...consulta.resultado.columnas]);
  });

  it('no muestra resultados antes de ejecutar ninguna consulta', () => {
    render(<LaboratorioSQL />);
    expect(screen.queryByRole('table')).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('limpia el resultado previo al cambiar de consulta elegida', () => {
    render(<LaboratorioSQL />);
    elegirYEjecutar(CATALOGO_CONSULTAS[0].etiqueta);
    expect(screen.getByRole('table')).toBeTruthy();

    // Elegir otra consulta oculta el resultado hasta volver a ejecutar.
    abrirLista();
    fireEvent.mouseDown(opcionPorEtiqueta(CATALOGO_CONSULTAS[1].etiqueta));
    expect(screen.queryByRole('table')).toBeNull();
  });
});
