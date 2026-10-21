/**
 * Temporizador del Modo_Presentador — R5.3, R5.4, R5.5, R5.6.
 *
 * Muestra el tiempo transcurrido de la sesión (formateado como mm:ss o, cuando
 * supera la hora, hh:mm:ss) y ofrece controles accesibles para Iniciar/Reanudar,
 * Pausar y Reiniciar. Toda la lógica de conteo vive en el reducer puro
 * (`src/domain/temporizador.js`) expuesto a través de `PresentadorContext`; este
 * componente es una vista delgada que solo lee `temporizador.transcurridoMs` y
 * `temporizador.estado` y cablea los botones a `iniciar/pausar/reiniciar`.
 *
 * Reglas de la UI (coherentes con el reducer):
 *  - 'detenido'  → botón primario "Iniciar"; "Reiniciar" deshabilitado (ya en 0).
 *  - 'corriendo' → botón primario "Pausar".
 *  - 'pausado'   → botón primario "Reanudar"; "Reiniciar" disponible.
 *
 * El valor del tiempo se expone con `aria-live="polite"` para que las ayudas
 * técnicas anuncien el avance sin interrumpir, y `role="timer"` para describir
 * su naturaleza.
 *
 * Requisitos cubiertos: 5.3, 5.4, 5.5, 5.6.
 *
 * @module components/presentador/Temporizador
 */

import { usePresentador } from '../../context/PresentadorContext.jsx';
import { EstadoTemporizador } from '../../domain/temporizador.js';
import { formatearTiempo } from './tiempo.js';
import './Temporizador.css';

/**
 * Panel del temporizador de sesión del Modo_Presentador.
 *
 * @returns {import('react').ReactElement}
 */
export default function Temporizador() {
  const { temporizador } = usePresentador();
  const { transcurridoMs, estado, iniciar, pausar, reiniciar } = temporizador;

  const corriendo = estado === EstadoTemporizador.CORRIENDO;
  const detenido = estado === EstadoTemporizador.DETENIDO;

  const textoTiempo = formatearTiempo(transcurridoMs);
  // Etiqueta del botón primario según el estado actual del temporizador.
  const etiquetaPrimario = corriendo
    ? 'Pausar'
    : detenido
      ? 'Iniciar'
      : 'Reanudar';

  return (
    <section className="temporizador" aria-label="Temporizador de sesión">
      <output
        className="temporizador__pantalla"
        role="timer"
        aria-live="polite"
        aria-label={`Tiempo transcurrido: ${textoTiempo}`}
      >
        {textoTiempo}
      </output>

      <div className="temporizador__controles">
        <button
          type="button"
          className="temporizador__boton temporizador__boton--primario"
          onClick={corriendo ? pausar : iniciar}
          aria-pressed={corriendo}
        >
          {etiquetaPrimario}
        </button>

        <button
          type="button"
          className="temporizador__boton"
          onClick={reiniciar}
          disabled={detenido && transcurridoMs === 0}
        >
          Reiniciar
        </button>
      </div>
    </section>
  );
}
