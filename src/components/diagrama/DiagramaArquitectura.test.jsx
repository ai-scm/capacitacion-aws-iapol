/**
 * Pruebas unitarias del diagrama interactivo de arquitectura — R7, R21.4.
 *
 * Cubren:
 *  - R7.1: se representan los cinco nodos (S3, Glue Data Catalog, Athena, Quick,
 *    IAPOL) y las conexiones del flujo definido.
 *  - R7.2: al seleccionar un nodo, el panel muestra la descripción de su función.
 *  - R7.3: texto fijo sobre que Glue registra/describe tablas y Athena consulta
 *    S3 con esos metadatos.
 *  - R7.4: texto fijo sobre que la integración con IAPOL es explicativa y no se
 *    ejecuta desde la Plataforma.
 *  - R21.4: el nodo/panel IAPOL se identifica con las insignias de plano.
 */

import { render, screen, within } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';
import { describe, it, expect } from 'vitest';
import DiagramaArquitectura, {
  DEFINICION_NODOS,
  CONEXIONES,
  NODOS,
} from './DiagramaArquitectura.jsx';

/** Obtiene el botón de un nodo por su etiqueta visible exacta. */
function botonNodo(etiqueta) {
  return screen.getByRole('button', { name: new RegExp(etiqueta, 'i') });
}

describe('DiagramaArquitectura', () => {
  it('representa los cinco nodos del flujo como botones (R7.1)', () => {
    render(<DiagramaArquitectura />);
    const etiquetas = [
      'Amazon S3',
      'AWS Glue Data Catalog',
      'Amazon Athena',
      'Amazon Quick',
      'IAPOL',
    ];
    for (const etiqueta of etiquetas) {
      expect(botonNodo(etiqueta)).toBeTruthy();
    }
    // Hay exactamente un botón por cada nodo definido.
    expect(screen.getAllByRole('button')).toHaveLength(DEFINICION_NODOS.length);
  });

  it('dibuja una línea SVG por cada conexión del flujo (R7.1)', () => {
    const { container } = render(<DiagramaArquitectura />);
    const lineas = container.querySelectorAll('.diagrama-arquitectura__linea');
    expect(lineas.length).toBe(CONEXIONES.length);
    // El flujo esperado incluye S3→Glue, S3→Athena, Glue→Athena, Athena→Quick,
    // Quick→IAPOL.
    expect(CONEXIONES).toContainEqual({ desde: NODOS.ATHENA, hasta: NODOS.QUICK });
    expect(CONEXIONES).toContainEqual({ desde: NODOS.QUICK, hasta: NODOS.IAPOL });
  });

  it('muestra una ayuda inicial cuando no hay nodo seleccionado', () => {
    render(<DiagramaArquitectura />);
    expect(
      screen.getByText(/selecciona un componente del diagrama/i),
    ).toBeTruthy();
  });

  it('al seleccionar un nodo muestra la descripción de su función (R7.2)', () => {
    render(<DiagramaArquitectura />);
    const boton = botonNodo('Amazon Athena');
    expect(boton.getAttribute('aria-pressed')).toBe('false');

    fireEvent.click(boton);

    expect(boton.getAttribute('aria-pressed')).toBe('true');
    const athena = DEFINICION_NODOS.find((n) => n.id === NODOS.ATHENA);
    expect(screen.getByText(athena.descripcion)).toBeTruthy();
  });

  it('cambia la descripción al seleccionar otro nodo (R7.2)', () => {
    render(<DiagramaArquitectura />);
    const s3 = DEFINICION_NODOS.find((n) => n.id === NODOS.S3);
    const quick = DEFINICION_NODOS.find((n) => n.id === NODOS.QUICK);

    fireEvent.click(botonNodo('Amazon S3'));
    expect(screen.getByText(s3.descripcion)).toBeTruthy();

    fireEvent.click(botonNodo('Amazon Quick'));
    expect(screen.getByText(quick.descripcion)).toBeTruthy();
    expect(screen.queryByText(s3.descripcion)).toBeNull();
  });

  it('expone el texto fijo de Glue registra/describe y Athena consulta S3 (R7.3)', () => {
    render(<DiagramaArquitectura />);
    expect(
      screen.getByText(
        /AWS Glue Data Catalog registra y describe las tablas, y Amazon Athena consulta datos en S3 utilizando esos metadatos\./i,
      ),
    ).toBeTruthy();
  });

  it('expone el texto fijo de que la integración IAPOL es explicativa y no se ejecuta (R7.4)', () => {
    render(<DiagramaArquitectura />);
    const notas = screen.getAllByText(
      /pasos de integración con IAPOL son explicativos y no se ejecutan desde la Plataforma/i,
    );
    // Aparece al menos en la nota fija permanente.
    expect(notas.length).toBeGreaterThanOrEqual(1);
  });

  it('identifica el plano IAPOL con la insignia institucional en el nodo (R21.4)', () => {
    render(<DiagramaArquitectura />);
    const boton = botonNodo('IAPOL');
    expect(
      within(boton).getByText('Proceso institucional IAPOL'),
    ).toBeTruthy();
  });

  it('al seleccionar IAPOL muestra la insignia de Simulación local y la nota de no ejecución (R21.4, R7.4)', () => {
    render(<DiagramaArquitectura />);
    fireEvent.click(botonNodo('IAPOL'));
    // La insignia de simulación aparece en el panel de IAPOL.
    expect(screen.getByText('Simulación local')).toBeTruthy();
    // Y la nota de no ejecución aparece (ahora en nota fija + panel): >= 2.
    const notas = screen.getAllByText(
      /no se ejecutan desde la Plataforma/i,
    );
    expect(notas.length).toBeGreaterThanOrEqual(2);
  });

  it('enlaza los botones con el panel mediante aria-controls', () => {
    render(<DiagramaArquitectura />);
    const boton = botonNodo('Amazon S3');
    const panelId = boton.getAttribute('aria-controls');
    expect(panelId).toBeTruthy();
    const panel = document.getElementById(panelId);
    expect(panel).not.toBeNull();
  });
});
