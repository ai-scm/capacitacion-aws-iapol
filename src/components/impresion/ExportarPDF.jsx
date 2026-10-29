/**
 * ExportarPDF — control de exportación a PDF de las sesiones.
 *
 * Ofrece un selector de alcance (Sesión A, Sesión B o ambas) y un botón que
 * dispara el diálogo de impresión del navegador (`window.print()`). La
 * previsualización vertical de las diapositivas con sus notas del instructor la
 * aporta {@link VistaImpresion}, que se renderiza debajo del control.
 *
 * El PDF se obtiene con "Imprimir → Guardar como PDF" del navegador, por lo que
 * no se añade ninguna dependencia ni se realiza conexión externa alguna: todo
 * ocurre en local, coherente con la postura del proyecto.
 *
 * @module components/impresion/ExportarPDF
 */

import { useState } from 'react';

import VistaImpresion, { ALCANCES_IMPRESION } from './VistaImpresion.jsx';
import './ExportarPDF.css';

/**
 * Etiquetas legibles de cada alcance de exportación.
 * @type {Readonly<Record<'A'|'B'|'ambas', string>>}
 */
const ETIQUETAS_ALCANCE = Object.freeze({
  A: 'Sesión A (AWS end-to-end)',
  B: 'Sesión B (Analítica Geoespacial)',
  ambas: 'Ambas sesiones (A y B)',
});

/**
 * Lanza el diálogo de impresión del navegador si está disponible.
 * Aislado en una función para poder degradar con elegancia en entornos sin
 * `window.print` (p. ej. jsdom en pruebas).
 */
function imprimir() {
  if (typeof window !== 'undefined' && typeof window.print === 'function') {
    window.print();
  }
}

/**
 * Control de exportación a PDF con previsualización.
 *
 * @returns {import('react').ReactElement}
 */
export default function ExportarPDF() {
  const [alcance, setAlcance] = useState('ambas');

  return (
    <div className="exportar-pdf">
      <div className="exportar-pdf__barra no-imprimir">
        <div className="exportar-pdf__campo">
          <label className="exportar-pdf__label" htmlFor="exportar-pdf-alcance">
            Qué exportar
          </label>
          <select
            id="exportar-pdf-alcance"
            className="exportar-pdf__select"
            value={alcance}
            onChange={(evento) => setAlcance(evento.target.value)}
          >
            {Object.keys(ALCANCES_IMPRESION).map((clave) => (
              <option key={clave} value={clave}>
                {ETIQUETAS_ALCANCE[clave] ?? clave}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="exportar-pdf__boton"
          onClick={imprimir}
        >
          Exportar a PDF
        </button>

        <p className="exportar-pdf__ayuda">
          Abre el diálogo de impresión del navegador y elige
          {' '}
          <strong>Guardar como PDF</strong>. Se incluyen las notas del
          instructor. Para mejor resultado, usa orientación horizontal y activa
          «Gráficos de fondo».
        </p>
      </div>

      <VistaImpresion alcance={alcance} />
    </div>
  );
}
