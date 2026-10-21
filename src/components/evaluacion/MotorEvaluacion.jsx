/**
 * Motor de evaluación (MotorEvaluacion) — R13.
 *
 * Presenta las preguntas de evaluación distribuidas en las seis áreas de
 * contenido con la ponderación definida por la rúbrica (15/15/25/15/15/15,
 * total 100). Por cada pregunta ofrece opciones de respuesta como botones de
 * radio dentro de un `fieldset`/`legend` accesible y, al enviar:
 *
 *   - Rechaza el envío vacío (ninguna opción seleccionada), mostrando un mensaje
 *     de "respuesta vacía" y conservando la pregunta disponible para un nuevo
 *     intento (R13.3). La validación ocurre ANTES de calificar.
 *   - Muestra retroalimentación inmediata indicando si la respuesta es correcta
 *     o incorrecta e incluye la explicación de la pregunta (R13.2).
 *
 * Tras responder, calcula la puntuación total en escala 0–100 agregando los
 * aciertos por área en la forma `{ area: { correctas, total } }` y delegando el
 * cálculo ponderado en `calcularPuntuacion` del dominio (R13.1, R13.4). Evalúa
 * el umbral orientativo de 80 con `superaUmbral` e indica si se superó o no
 * (R13.5, R13.6). Incluye además una nota permanente de que las acciones
 * realizadas fuera de la Plataforma requieren verificación manual del instructor
 * (R13.7).
 *
 * Persistencia (opcional, R15.1): si hay un `ProgresoProvider` en el árbol, la
 * puntuación total se guarda en `evaluacion.puntuacion` vía `guardarAvance`.
 * El acceso al contexto es tolerante a su ausencia para permitir montar el
 * componente de forma aislada en pruebas.
 *
 * Seguridad (R23.4): todo el contenido se renderiza como texto plano; NO se usa
 * `dangerouslySetInnerHTML`. Las entradas del usuario se limitan a la selección
 * de una opción predefinida (radio), validada antes de procesarse (R23.5).
 *
 * Requisitos cubiertos: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7.
 */

import { useContext, useMemo, useState } from 'react';

import './MotorEvaluacion.css';
import { PREGUNTAS } from '../../data/evaluacion/preguntas.js';
import { RUBRICA } from '../../data/evaluacion/rubrica.js';
import {
  calcularPuntuacion,
  superaUmbral,
  UMBRAL_POR_DEFECTO,
} from '../../domain/puntuacion.js';
import ProgresoContext from '../../context/ProgresoContext.jsx';

/**
 * Etiquetas legibles de cada área de contenido, en el orden de la rúbrica.
 *
 * Las claves coinciden con el campo `area` de las preguntas y con las claves de
 * la rúbrica (`src/data/evaluacion/rubrica.js`).
 *
 * @type {Readonly<Record<string, string>>}
 */
export const ETIQUETAS_AREA = Object.freeze({
  flujo: 'Flujo S3 → Athena → Quick',
  sql: 'Interpretación de SQL',
  tres_hojas: 'Creación de análisis de tres hojas',
  filtros: 'Configuración de filtros y visualizaciones',
  publicacion: 'Publicación de dashboard en Amazon Quick',
  iapol: 'Localización de identificadores e integración con IAPOL',
});

/**
 * Orden canónico de las áreas (el de la rúbrica), usado para agrupar preguntas.
 *
 * @type {ReadonlyArray<string>}
 */
export const ORDEN_AREAS = Object.freeze(Object.keys(RUBRICA));

/**
 * Nota permanente de verificación manual del instructor (R13.7).
 *
 * @type {string}
 */
export const NOTA_VERIFICACION_INSTRUCTOR = Object.freeze(
  'Esta evaluación comprueba la comprensión conceptual dentro de la ' +
    'Plataforma. Las acciones realizadas fuera de la Plataforma (consultas ' +
    'reales en Amazon Athena, análisis y dashboards en Amazon Quick, o la ' +
    'integración en IAPOL) requieren verificación manual del instructor.',
);

/**
 * Mensaje mostrado cuando se intenta enviar una pregunta sin seleccionar opción
 * (R13.3).
 *
 * @type {string}
 */
export const MENSAJE_RESPUESTA_VACIA =
  'La respuesta está vacía: seleccione una opción antes de enviar.';

/**
 * Agrupa las preguntas por área, conservando el orden canónico de la rúbrica.
 *
 * @param {ReadonlyArray<object>} preguntas - Banco de preguntas.
 * @returns {Array<{ area: string, etiqueta: string, maximo: number, preguntas: object[] }>}
 *   Áreas con sus preguntas (solo las áreas que tienen al menos una pregunta).
 */
function agruparPorArea(preguntas) {
  return ORDEN_AREAS.map((area) => ({
    area,
    etiqueta: ETIQUETAS_AREA[area] ?? area,
    maximo: RUBRICA[area] ?? 0,
    preguntas: preguntas.filter((pregunta) => pregunta.area === area),
  })).filter((grupo) => grupo.preguntas.length > 0);
}

/**
 * Construye el recuento de aciertos por área a partir de las respuestas dadas.
 *
 * Produce la forma `{ area: { correctas, total } }` que consume
 * `calcularPuntuacion`. `total` es el número de preguntas del área y `correctas`
 * cuántas de las respondidas coinciden con `respuestaCorrecta`.
 *
 * @param {ReadonlyArray<object>} preguntas - Banco de preguntas.
 * @param {Record<string, string>} respuestas - Mapa idPregunta → idOpción elegida.
 * @returns {Record<string, { correctas: number, total: number }>} Recuento por área.
 */
export function construirRecuentoPorArea(preguntas, respuestas) {
  const recuento = {};
  for (const pregunta of preguntas) {
    const entrada = recuento[pregunta.area] ?? { correctas: 0, total: 0 };
    entrada.total += 1;
    if (respuestas[pregunta.id] === pregunta.respuestaCorrecta) {
      entrada.correctas += 1;
    }
    recuento[pregunta.area] = entrada;
  }
  return recuento;
}

/**
 * Tarjeta de una pregunta individual con sus opciones y retroalimentación.
 *
 * Controla su propia selección provisional (antes de enviar) y comunica al
 * padre la opción enviada mediante `onEnviar`. Si se envía sin selección,
 * muestra el mensaje de respuesta vacía y no envía (R13.3).
 *
 * @param {object} props
 * @param {object} props.pregunta - La pregunta a renderizar.
 * @param {number} props.numero - Número de la pregunta dentro del área (1-based).
 * @param {string | undefined} props.respuesta - Id de la opción ya enviada (si la hay).
 * @param {(idPregunta: string, idOpcion: string) => void} props.onEnviar - Callback de envío válido.
 * @returns {import('react').ReactElement}
 */
function TarjetaPregunta({ pregunta, numero, respuesta, onEnviar }) {
  const [seleccion, setSeleccion] = useState('');
  const [vacia, setVacia] = useState(false);

  const enviada = respuesta !== undefined;
  const esCorrecta = enviada && respuesta === pregunta.respuestaCorrecta;

  const grupoId = `pregunta-${pregunta.id}`;
  const leyendaId = `${grupoId}-leyenda`;
  const feedbackId = `${grupoId}-feedback`;

  /**
   * Gestiona el envío de la pregunta validando antes de calificar (R13.3).
   *
   * @param {import('react').FormEvent} evento
   * @returns {void}
   */
  function manejarEnvio(evento) {
    evento.preventDefault();
    if (seleccion === '') {
      setVacia(true);
      return;
    }
    setVacia(false);
    onEnviar(pregunta.id, seleccion);
  }

  return (
    <li className="motor-evaluacion__item">
      <form className="motor-evaluacion__form" onSubmit={manejarEnvio} noValidate>
        <fieldset className="motor-evaluacion__fieldset">
          <legend className="motor-evaluacion__enunciado" id={leyendaId}>
            <span className="motor-evaluacion__numero">{numero}.</span>{' '}
            {pregunta.enunciado}
          </legend>

          <div className="motor-evaluacion__opciones" role="radiogroup" aria-labelledby={leyendaId}>
            {pregunta.opciones.map((opcion) => {
              const opcionId = `${grupoId}-opcion-${opcion.id}`;
              return (
                <label
                  key={opcion.id}
                  className="motor-evaluacion__opcion"
                  htmlFor={opcionId}
                >
                  <input
                    type="radio"
                    id={opcionId}
                    name={grupoId}
                    value={opcion.id}
                    checked={
                      enviada ? respuesta === opcion.id : seleccion === opcion.id
                    }
                    disabled={enviada}
                    onChange={(evento) => {
                      setSeleccion(evento.target.value);
                      setVacia(false);
                    }}
                  />
                  <span>{opcion.texto}</span>
                </label>
              );
            })}
          </div>

          {!enviada ? (
            <div className="motor-evaluacion__acciones">
              <button type="submit" className="motor-evaluacion__enviar">
                Enviar respuesta
              </button>
            </div>
          ) : null}
        </fieldset>

        {vacia ? (
          <p
            className="motor-evaluacion__mensaje-vacio"
            role="alert"
            id={feedbackId}
          >
            {MENSAJE_RESPUESTA_VACIA}
          </p>
        ) : null}

        {enviada ? (
          <div
            className={
              'motor-evaluacion__feedback ' +
              (esCorrecta
                ? 'motor-evaluacion__feedback--correcto'
                : 'motor-evaluacion__feedback--incorrecto')
            }
            role="status"
            id={feedbackId}
          >
            <p className="motor-evaluacion__veredicto">
              {esCorrecta ? '✓ Respuesta correcta' : '✗ Respuesta incorrecta'}
            </p>
            <p className="motor-evaluacion__explicacion">{pregunta.explicacion}</p>
          </div>
        ) : null}
      </form>
    </li>
  );
}

/**
 * Componente del Motor de evaluación.
 *
 * @param {object} [props]
 * @param {ReadonlyArray<object>} [props.preguntas=PREGUNTAS] - Banco de preguntas a usar.
 * @param {Record<string, number>} [props.rubrica=RUBRICA] - Puntos máximos por área.
 * @param {number} [props.umbral=UMBRAL_POR_DEFECTO] - Umbral orientativo de aprobación.
 * @param {string} [props.className] - Clases CSS adicionales opcionales.
 * @returns {import('react').ReactElement}
 */
export default function MotorEvaluacion({
  preguntas = PREGUNTAS,
  rubrica = RUBRICA,
  umbral = UMBRAL_POR_DEFECTO,
  className = '',
}) {
  // Mapa idPregunta → idOpción enviada. Solo se añaden preguntas ya respondidas.
  const [respuestas, setRespuestas] = useState({});

  // Acceso tolerante al contexto de progreso: puede no existir (p. ej. en
  // pruebas que montan el componente de forma aislada).
  const progresoCtx = useContext(ProgresoContext);

  const grupos = useMemo(() => agruparPorArea(preguntas), [preguntas]);

  const totalPreguntas = preguntas.length;
  const respondidas = Object.keys(respuestas).length;
  const todasRespondidas = totalPreguntas > 0 && respondidas === totalPreguntas;

  const recuento = useMemo(
    () => construirRecuentoPorArea(preguntas, respuestas),
    [preguntas, respuestas],
  );

  const puntuacion = useMemo(
    () => calcularPuntuacion(recuento, rubrica),
    [recuento, rubrica],
  );

  const aprobado = superaUmbral(puntuacion, umbral);

  /**
   * Registra la respuesta enviada de una pregunta y, si se completan todas,
   * persiste la puntuación total en el progreso (si el contexto existe).
   *
   * @param {string} idPregunta - Id de la pregunta respondida.
   * @param {string} idOpcion - Id de la opción elegida.
   * @returns {void}
   */
  function registrarRespuesta(idPregunta, idOpcion) {
    setRespuestas((actual) => {
      if (actual[idPregunta] !== undefined) return actual;
      const siguiente = { ...actual, [idPregunta]: idOpcion };

      const completo = Object.keys(siguiente).length === totalPreguntas;
      if (completo && progresoCtx && typeof progresoCtx.guardarAvance === 'function') {
        const puntuacionFinal = calcularPuntuacion(
          construirRecuentoPorArea(preguntas, siguiente),
          rubrica,
        );
        progresoCtx.guardarAvance({
          evaluacion: { puntuacion: puntuacionFinal },
        });
      }

      return siguiente;
    });
  }

  const clases = ['motor-evaluacion', className].filter(Boolean).join(' ');
  const puntuacionMostrada = Math.round(puntuacion);

  return (
    <section className={clases} aria-label="Evaluación con retroalimentación">
      <header className="motor-evaluacion__encabezado">
        <h2 className="motor-evaluacion__titulo">Evaluación de la capacitación</h2>
        <p className="motor-evaluacion__intro">
          Responda las preguntas de las seis áreas de contenido. Recibirá
          retroalimentación inmediata tras enviar cada respuesta. La puntuación
          total se calcula sobre 100 puntos según la ponderación de cada área.
        </p>
        <p className="motor-evaluacion__nota-instructor" role="note">
          {NOTA_VERIFICACION_INSTRUCTOR}
        </p>
      </header>

      <ol className="motor-evaluacion__areas">
        {grupos.map((grupo) => (
          <li className="motor-evaluacion__area" key={grupo.area}>
            <div className="motor-evaluacion__area-encabezado">
              <h3 className="motor-evaluacion__area-titulo">{grupo.etiqueta}</h3>
              <span className="motor-evaluacion__area-ponderacion">
                {grupo.maximo} puntos
              </span>
            </div>
            <ol className="motor-evaluacion__preguntas">
              {grupo.preguntas.map((pregunta, indice) => (
                <TarjetaPregunta
                  key={pregunta.id}
                  pregunta={pregunta}
                  numero={indice + 1}
                  respuesta={respuestas[pregunta.id]}
                  onEnviar={registrarRespuesta}
                />
              ))}
            </ol>
          </li>
        ))}
      </ol>

      <footer className="motor-evaluacion__resultado" aria-live="polite">
        <p className="motor-evaluacion__progreso">
          Preguntas respondidas: {respondidas} de {totalPreguntas}
        </p>
        <p className="motor-evaluacion__puntuacion">
          Puntuación total:{' '}
          <strong>{puntuacionMostrada} / 100</strong>
        </p>
        {todasRespondidas ? (
          <p
            className={
              'motor-evaluacion__umbral ' +
              (aprobado
                ? 'motor-evaluacion__umbral--aprobado'
                : 'motor-evaluacion__umbral--no-aprobado')
            }
            role="status"
          >
            {aprobado
              ? `Se superó el umbral orientativo de aprobación (${umbral} puntos).`
              : `No se alcanzó el umbral orientativo de aprobación (${umbral} puntos).`}
          </p>
        ) : (
          <p className="motor-evaluacion__umbral motor-evaluacion__umbral--pendiente">
            Responda todas las preguntas para evaluar el umbral orientativo de
            aprobación ({umbral} puntos).
          </p>
        )}
      </footer>
    </section>
  );
}
