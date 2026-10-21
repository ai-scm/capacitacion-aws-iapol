/**
 * TarjetaSesion — tarjeta de una Sesión en la pantalla principal (R1).
 *
 * Representa una de las tres capacitaciones en la pantalla principal (Home).
 * Muestra el número de la Sesión, su título y la duración fija de 120 min
 * (R1.2), un indicador opcional del estado de avance cuando el Sistema_Progreso
 * contiene avance previo de la Sesión (R1.5), y una acción accesible que, al
 * activarse, abre la primera Diapositiva de esa Sesión (R1.3).
 *
 * La tarjeta es controlada por el contenedor {@link PantallaPrincipal}: recibe
 * los datos de la Sesión, el estado de avance ya resuelto y una función
 * `onSeleccionar` a la que delega la navegación. Mantener la navegación fuera de
 * este componente lo hace fácilmente testeable y reutilizable.
 *
 * Accesibilidad: toda la tarjeta es un único `<button>`; esto garantiza foco por
 * teclado, activación con Enter/Espacio y una sola región interactiva por
 * Sesión. El `aria-label` resume número, título, duración y avance para lectores
 * de pantalla.
 *
 * Requisitos cubiertos: 1.2 (número, título y duración 120 min), 1.3
 * (navegación a la primera diapositiva al seleccionar) y 1.5 (indicador de
 * avance cuando existe progreso previo).
 *
 * @module components/home/TarjetaSesion
 */

import './TarjetaSesion.css';

/**
 * Duración fija de cada Sesión, en minutos (R1.2).
 * @type {number}
 */
const DURACION_MIN = 120;

/**
 * Deriva el texto del indicador de avance a partir del estado de progreso de la
 * Sesión y su total de diapositivas.
 *
 * Reglas:
 *  - Sin progreso previo (`progresoSesion` ausente) → `null` (no se muestra
 *    indicador alguno, conforme a R1.5 que solo exige indicarlo cuando existe
 *    avance).
 *  - Sesión marcada como completada → "Completada".
 *  - Avance parcial → "Diapositiva N de TOTAL" (1-indexado para lectura humana),
 *    o "En curso" si no se conoce el total.
 *
 * @param {{ ultimaDiapositiva?: number, completada?: boolean } | null | undefined} progresoSesion
 *   Entrada de progreso de la Sesión (`progreso.sesiones[id]`) o ausente.
 * @param {number} totalDiapositivas - Cantidad de diapositivas de la Sesión.
 * @returns {string | null} Texto del indicador de avance, o `null` si no aplica.
 */
export function textoAvance(progresoSesion, totalDiapositivas) {
  if (progresoSesion === null || typeof progresoSesion !== 'object') {
    return null;
  }

  if (progresoSesion.completada === true) {
    return 'Completada';
  }

  const ultima = progresoSesion.ultimaDiapositiva;
  if (typeof ultima !== 'number' || !Number.isFinite(ultima) || ultima < 0) {
    return null;
  }

  if (typeof totalDiapositivas === 'number' && totalDiapositivas > 0) {
    const actual = Math.min(ultima + 1, totalDiapositivas);
    return `Diapositiva ${actual} de ${totalDiapositivas}`;
  }

  return 'En curso';
}

/**
 * Tarjeta seleccionable de una Sesión.
 *
 * @param {object} props
 * @param {{ id: number, titulo: string, duracionMin?: number }} props.sesion
 *   Datos de la Sesión a representar.
 * @param {{ ultimaDiapositiva?: number, completada?: boolean } | null} [props.progresoSesion]
 *   Estado de avance de la Sesión (`progreso.sesiones[id]`) si existe.
 * @param {number} [props.totalDiapositivas=0] - Total de diapositivas de la Sesión.
 * @param {(id: number) => void} props.onSeleccionar - Se invoca con el id de la
 *   Sesión cuando el usuario activa la tarjeta (abre la primera diapositiva).
 * @returns {import('react').ReactElement} La tarjeta de la Sesión.
 */
export default function TarjetaSesion({
  sesion,
  progresoSesion = null,
  totalDiapositivas = 0,
  onSeleccionar,
}) {
  const duracion = sesion.duracionMin ?? DURACION_MIN;
  const avance = textoAvance(progresoSesion, totalDiapositivas);

  const etiquetaAccesible = [
    `Sesión ${sesion.id}: ${sesion.titulo}.`,
    `Duración ${duracion} minutos.`,
    avance ? `Avance: ${avance}.` : 'Sin avance registrado.',
    'Abrir la primera diapositiva.',
  ].join(' ');

  return (
    <button
      type="button"
      className="tarjeta-sesion"
      onClick={() => onSeleccionar(sesion.id)}
      aria-label={etiquetaAccesible}
    >
      <span className="tarjeta-sesion__numero" aria-hidden="true">
        {sesion.id}
      </span>

      <span className="tarjeta-sesion__cuerpo">
        <span className="tarjeta-sesion__eyebrow">Sesión {sesion.id}</span>
        <span className="tarjeta-sesion__titulo">{sesion.titulo}</span>

        <span className="tarjeta-sesion__meta">
          <span className="tarjeta-sesion__duracion">{duracion} min</span>
          {avance !== null && (
            <span
              className={`tarjeta-sesion__avance${
                avance === 'Completada'
                  ? ' tarjeta-sesion__avance--completada'
                  : ''
              }`}
            >
              {avance}
            </span>
          )}
        </span>
      </span>

      <span className="tarjeta-sesion__accion" aria-hidden="true">
        Comenzar →
      </span>
    </button>
  );
}
