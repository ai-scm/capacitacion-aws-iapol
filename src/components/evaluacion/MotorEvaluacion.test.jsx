/**
 * Pruebas unitarias del Motor de evaluación (MotorEvaluacion) — R13.
 *
 * Cubren:
 *  - Presentación de las seis áreas con su ponderación 15/15/25/15/15/15 (R13.1).
 *  - Retroalimentación inmediata con explicación al enviar (R13.2).
 *  - Rechazo del envío vacío con mensaje, conservando la pregunta (R13.3).
 *  - Puntuación total 0–100 vía calcularPuntuacion (R13.1, R13.4).
 *  - Evaluación del umbral 80: aprobado / no aprobado (R13.5, R13.6).
 *  - Nota permanente de verificación manual del instructor (R13.7).
 */

import { render, screen, within, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import MotorEvaluacion, {
  ETIQUETAS_AREA,
  ORDEN_AREAS,
  NOTA_VERIFICACION_INSTRUCTOR,
  MENSAJE_RESPUESTA_VACIA,
  construirRecuentoPorArea,
} from './MotorEvaluacion.jsx';
import { RUBRICA } from '../../data/evaluacion/rubrica.js';

/**
 * Banco de preguntas de prueba pequeño y determinista: una pregunta por área,
 * con la opción `a` siempre correcta. Permite controlar con precisión la
 * puntuación esperada.
 *
 * @type {Array<object>}
 */
const PREGUNTAS_PRUEBA = ORDEN_AREAS.map((area) => ({
  id: `${area}-q`,
  area,
  enunciado: `Pregunta de prueba del área ${area}`,
  opciones: [
    { id: 'a', texto: 'Opción correcta' },
    { id: 'b', texto: 'Opción incorrecta' },
  ],
  respuestaCorrecta: 'a',
  explicacion: `Explicación del área ${area}`,
}));

/**
 * Responde una pregunta por su id: selecciona la opción indicada y envía.
 *
 * @param {string} preguntaId - Id de la pregunta.
 * @param {string} opcionId - Id de la opción a seleccionar ('a' correcta).
 * @returns {void}
 */
function responder(preguntaId, opcionId) {
  const radio = document.getElementById(
    `pregunta-${preguntaId}-opcion-${opcionId}`,
  );
  fireEvent.click(radio);
  const fieldset = radio.closest('.motor-evaluacion__item');
  const boton = within(fieldset).getByRole('button', {
    name: /enviar respuesta/i,
  });
  fireEvent.click(boton);
}

describe('MotorEvaluacion (UI)', () => {
  it('presenta las seis áreas con su ponderación 15/15/25/15/15/15 (R13.1)', () => {
    render(<MotorEvaluacion preguntas={PREGUNTAS_PRUEBA} />);
    for (const area of ORDEN_AREAS) {
      const titulo = screen.getByRole('heading', {
        name: ETIQUETAS_AREA[area],
        level: 3,
      });
      const encabezado = titulo.closest('.motor-evaluacion__area-encabezado');
      expect(
        within(encabezado).getByText(`${RUBRICA[area]} puntos`),
      ).toBeTruthy();
    }
    // La suma de la rúbrica es 100 (15+15+25+15+15+15).
    const suma = ORDEN_AREAS.reduce((acc, a) => acc + RUBRICA[a], 0);
    expect(suma).toBe(100);
  });

  it('muestra la nota permanente de verificación manual del instructor (R13.7)', () => {
    render(<MotorEvaluacion preguntas={PREGUNTAS_PRUEBA} />);
    expect(screen.getByText(NOTA_VERIFICACION_INSTRUCTOR)).toBeTruthy();
  });

  it('da retroalimentación inmediata correcta con explicación (R13.2)', () => {
    render(<MotorEvaluacion preguntas={[PREGUNTAS_PRUEBA[0]]} />);
    responder(PREGUNTAS_PRUEBA[0].id, 'a');
    expect(screen.getByText(/respuesta correcta/i)).toBeTruthy();
    expect(
      screen.getByText(PREGUNTAS_PRUEBA[0].explicacion),
    ).toBeTruthy();
  });

  it('da retroalimentación inmediata incorrecta con explicación (R13.2)', () => {
    render(<MotorEvaluacion preguntas={[PREGUNTAS_PRUEBA[0]]} />);
    responder(PREGUNTAS_PRUEBA[0].id, 'b');
    expect(screen.getByText(/respuesta incorrecta/i)).toBeTruthy();
    expect(
      screen.getByText(PREGUNTAS_PRUEBA[0].explicacion),
    ).toBeTruthy();
  });

  it('rechaza el envío vacío con mensaje y conserva la pregunta (R13.3)', () => {
    render(<MotorEvaluacion preguntas={[PREGUNTAS_PRUEBA[0]]} />);
    const boton = screen.getByRole('button', { name: /enviar respuesta/i });
    fireEvent.click(boton);

    // Mensaje de respuesta vacía.
    expect(screen.getByText(MENSAJE_RESPUESTA_VACIA)).toBeTruthy();
    // La pregunta sigue disponible: el botón de enviar persiste y no hay feedback.
    expect(screen.getByRole('button', { name: /enviar respuesta/i })).toBeTruthy();
    expect(screen.queryByText(/respuesta (correcta|incorrecta)/i)).toBeNull();

    // Reintento válido: ahora sí califica.
    responder(PREGUNTAS_PRUEBA[0].id, 'a');
    expect(screen.getByText(/respuesta correcta/i)).toBeTruthy();
  });

  it('indica que se superó el umbral orientativo de 80 al acertar todo (R13.4, R13.5)', () => {
    render(<MotorEvaluacion preguntas={PREGUNTAS_PRUEBA} />);
    for (const pregunta of PREGUNTAS_PRUEBA) {
      responder(pregunta.id, 'a');
    }
    expect(screen.getByText(/100 \/ 100/)).toBeTruthy();
    expect(screen.getByText(/se superó el umbral/i)).toBeTruthy();
  });

  it('indica que no se alcanzó el umbral al fallar todo (R13.4, R13.6)', () => {
    render(<MotorEvaluacion preguntas={PREGUNTAS_PRUEBA} />);
    for (const pregunta of PREGUNTAS_PRUEBA) {
      responder(pregunta.id, 'b');
    }
    expect(screen.getByText(/0 \/ 100/)).toBeTruthy();
    expect(screen.getByText(/no se alcanzó el umbral/i)).toBeTruthy();
  });
});

describe('construirRecuentoPorArea', () => {
  it('cuenta correctas y total por área según las respuestas', () => {
    const respuestas = {};
    for (const p of PREGUNTAS_PRUEBA) respuestas[p.id] = 'a';
    const recuento = construirRecuentoPorArea(PREGUNTAS_PRUEBA, respuestas);
    for (const area of ORDEN_AREAS) {
      expect(recuento[area]).toEqual({ correctas: 1, total: 1 });
    }
  });

  it('no suma aciertos para respuestas incorrectas o ausentes', () => {
    const recuento = construirRecuentoPorArea(PREGUNTAS_PRUEBA, {});
    for (const area of ORDEN_AREAS) {
      expect(recuento[area]).toEqual({ correctas: 0, total: 1 });
    }
  });
});
