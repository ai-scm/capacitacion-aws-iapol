/**
 * Casos de diagnóstico de problemas frecuentes (CasosDiagnostico) — R19.
 *
 * Renderiza los cinco casos de diagnóstico del módulo de datos de la Sesión 3,
 * consumiendo la lista exportada `CASOS_DIAGNOSTICO` (sin duplicar el contenido
 * en la UI). Cada caso presenta:
 *
 *   - El síntoma observado (`caso`) (R19.1).
 *   - Una lista de causas posibles (`causasPosibles`) (R19.1, R19.2).
 *   - La nota permanente de que son causas posibles, no un diagnóstico
 *     definitivo sin evidencia del entorno (`nota`) (R19.3).
 *
 * Seguridad (R23.4): todo el contenido es estático y se renderiza como texto
 * plano; NO se usa `dangerouslySetInnerHTML`. La diferenciación de estilos se
 * logra mediante clases CSS con variables de tema (fallbacks incluidos).
 *
 * Requisitos cubiertos: 19.1, 19.2, 19.3.
 */

import './CasosDiagnostico.css';
import { CASOS_DIAGNOSTICO } from '../../data/sesiones/sesion3.js';

/**
 * Tarjeta individual de un caso de diagnóstico.
 *
 * @param {object} props
 * @param {{ caso: string, causasPosibles: string[], nota: string }} props.casoDiagnostico
 * @param {number} props.numero - Número de orden del caso (1-indexado).
 * @returns {import('react').ReactElement}
 */
function TarjetaCaso({ casoDiagnostico, numero }) {
  const { caso, causasPosibles, nota } = casoDiagnostico;
  const tituloId = `caso-diagnostico-${numero}-titulo`;

  return (
    <article className="casos-diagnostico__tarjeta" aria-labelledby={tituloId}>
      <header className="casos-diagnostico__tarjeta-encabezado">
        <span className="casos-diagnostico__numero" aria-hidden="true">
          Caso {numero}
        </span>
        <h3 className="casos-diagnostico__caso" id={tituloId}>
          {caso}
        </h3>
      </header>

      <div className="casos-diagnostico__causas">
        <p className="casos-diagnostico__causas-titulo">Causas posibles</p>
        <ul className="casos-diagnostico__causas-lista">
          {causasPosibles.map((causa, indice) => (
            <li
              key={`caso-${numero}-causa-${indice}`}
              className="casos-diagnostico__causa"
            >
              {causa}
            </li>
          ))}
        </ul>
      </div>

      <p className="casos-diagnostico__nota" role="note">
        {nota}
      </p>
    </article>
  );
}

/**
 * Sección de casos de diagnóstico de problemas frecuentes.
 *
 * @param {object} [props]
 * @param {string} [props.className] - Clases CSS adicionales opcionales.
 * @returns {import('react').ReactElement}
 */
export default function CasosDiagnostico({ className = '' }) {
  const clases = ['casos-diagnostico', className].filter(Boolean).join(' ');

  return (
    <section className={clases} aria-label="Casos de diagnóstico">
      <header className="casos-diagnostico__encabezado">
        <h2 className="casos-diagnostico__encabezado-titulo">
          Casos de diagnóstico de problemas frecuentes
        </h2>
        <p className="casos-diagnostico__encabezado-subtitulo">
          Síntomas habituales al publicar, compartir e integrar dashboards, con
          sus causas posibles.
        </p>
      </header>

      <div className="casos-diagnostico__tarjetas">
        {CASOS_DIAGNOSTICO.map((casoDiagnostico, indice) => (
          <TarjetaCaso
            key={`caso-${indice}`}
            casoDiagnostico={casoDiagnostico}
            numero={indice + 1}
          />
        ))}
      </div>
    </section>
  );
}
