/**
 * Pruebas transversales de contenido fijo y atributos (tarea 12.5).
 *
 * Reúne aserciones de "contenido fijo" que cruzan varios componentes de
 * contenido, enfocadas en requisitos concretos sin duplicar las suites
 * dedicadas de cada componente (tareas 12.1–12.4):
 *
 *  - CentroRecursos: cada enlace renderizado abre en pestaña nueva
 *    (`target="_blank"`) y lleva `rel` que incluye "noopener" (R16.2).
 *  - MotorEvaluacion: al responder una pregunta aparece retroalimentación
 *    inmediata (correcta/incorrecta) con la explicación de la pregunta (R13.2).
 *  - CasosDiagnostico: se renderiza el texto de cada caso de diagnóstico de
 *    `CASOS_DIAGNOSTICO` (R19.1).
 *  - IdentificadoresIAPOL: se renderiza el nombre de cada identificador de
 *    `IDENTIFICADORES` (R18.1).
 */

import { render, screen, within, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import CentroRecursos from './recursos/CentroRecursos.jsx';
import MotorEvaluacion from './evaluacion/MotorEvaluacion.jsx';
import CasosDiagnostico from './iapol/CasosDiagnostico.jsx';
import IdentificadoresIAPOL from './iapol/IdentificadoresIAPOL.jsx';

import { enlaces } from '../data/recursos/enlaces.js';
import { CASOS_DIAGNOSTICO, IDENTIFICADORES } from '../data/sesiones/sesion3.js';

describe('Contenido fijo y atributos (transversal)', () => {
  describe('CentroRecursos · enlaces externos (R16.2)', () => {
    it('renderiza un enlace por recurso definido en los datos', () => {
      const { container } = render(<CentroRecursos />);
      const anclas = container.querySelectorAll('a.centro-recursos__enlace');
      expect(anclas.length).toBe(enlaces.length);
    });

    it('cada enlace abre en pestaña nueva y su rel incluye "noopener"', () => {
      const { container } = render(<CentroRecursos />);
      const anclas = container.querySelectorAll('a[href]');

      // Debe haber al menos un enlace (los recursos oficiales).
      expect(anclas.length).toBeGreaterThan(0);

      for (const ancla of anclas) {
        expect(ancla.getAttribute('target')).toBe('_blank');
        const rel = ancla.getAttribute('rel') ?? '';
        expect(rel).toContain('noopener');
      }
    });
  });

  describe('MotorEvaluacion · retroalimentación inmediata (R13.2)', () => {
    /**
     * Banco mínimo y determinista: una pregunta con la opción `a` correcta.
     * @type {object}
     */
    const PREGUNTA = {
      id: 'fijo-q1',
      area: 'flujo',
      enunciado: 'Pregunta de contenido fijo',
      opciones: [
        { id: 'a', texto: 'Opción correcta' },
        { id: 'b', texto: 'Opción incorrecta' },
      ],
      respuestaCorrecta: 'a',
      explicacion: 'Explicación de la pregunta de contenido fijo.',
    };

    /**
     * Selecciona una opción de la pregunta y envía el formulario.
     * @param {string} opcionId - Id de la opción a seleccionar.
     * @returns {void}
     */
    function responder(opcionId) {
      const radio = document.getElementById(
        `pregunta-${PREGUNTA.id}-opcion-${opcionId}`,
      );
      fireEvent.click(radio);
      const item = radio.closest('.motor-evaluacion__item');
      const boton = within(item).getByRole('button', {
        name: /enviar respuesta/i,
      });
      fireEvent.click(boton);
    }

    it('muestra feedback correcto con la explicación al acertar', () => {
      render(<MotorEvaluacion preguntas={[PREGUNTA]} />);
      responder('a');
      expect(screen.getByText(/respuesta correcta/i)).toBeTruthy();
      expect(screen.getByText(PREGUNTA.explicacion)).toBeTruthy();
    });

    it('muestra feedback incorrecto con la explicación al fallar', () => {
      render(<MotorEvaluacion preguntas={[PREGUNTA]} />);
      responder('b');
      expect(screen.getByText(/respuesta incorrecta/i)).toBeTruthy();
      expect(screen.getByText(PREGUNTA.explicacion)).toBeTruthy();
    });
  });

  describe('CasosDiagnostico · textos de los casos (R19.1)', () => {
    it('renderiza el texto de cada caso de CASOS_DIAGNOSTICO', () => {
      render(<CasosDiagnostico />);
      expect(CASOS_DIAGNOSTICO.length).toBe(5);
      for (const { caso } of CASOS_DIAGNOSTICO) {
        expect(screen.getByText(caso)).toBeTruthy();
      }
    });
  });

  describe('IdentificadoresIAPOL · nombres de identificadores (R18.1)', () => {
    it('renderiza el nombre de cada identificador de IDENTIFICADORES', () => {
      render(<IdentificadoresIAPOL />);
      // Incluye Dataset ID, Analysis ID, Dashboard ID, id_portal, id_quicksight.
      for (const { nombre } of IDENTIFICADORES) {
        expect(screen.getByText(nombre)).toBeTruthy();
      }
    });
  });
});
