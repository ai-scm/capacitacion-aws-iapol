/**
 * PantallaPrincipal (Home) — pantalla principal con las tres capacitaciones (R1).
 *
 * Es la vista de entrada de la Plataforma. Al cargarse (R1.1) presenta las tres
 * Sesiones disponibles y muestra el título global de la capacitación referido a
 * Amazon Athena, Amazon Quick e IAPOL (R1.4). Cada Sesión se renderiza como una
 * {@link TarjetaSesion} con su número, título y duración de 120 min (R1.2) y,
 * cuando el Sistema_Progreso contiene avance previo de esa Sesión, con su
 * estado de avance (R1.5). Al seleccionar una Sesión, el Sistema_Navegacion
 * abre la primera Diapositiva de esa Sesión (R1.3).
 *
 * Fuentes de datos:
 *  - Las Sesiones se leen de `SESIONES` expuesto por {@link useApp} (AppContext),
 *    que a su vez proviene de `src/data/sesiones/sesion1|2|3.js`. Así la lista de
 *    Sesiones es única y coherente con la navegación.
 *  - La navegación a la primera diapositiva se delega en `irASesion(n)` del
 *    AppContext, que fija `sesionActual = n`, `indiceDiapositiva = 0` y cambia a
 *    la vista `slides`.
 *  - El estado de avance por Sesión se lee de {@link useProgreso}
 *    (`progreso.sesiones[id]`), que puede no existir hasta que haya avance.
 *
 * Requisitos cubiertos: 1.1, 1.2, 1.3, 1.4, 1.5.
 *
 * @module components/home/PantallaPrincipal
 */

import { SESIONES, useApp } from '../../context/AppContext.jsx';
import { useProgreso } from '../../context/ProgresoContext.jsx';
import TarjetaSesion from './TarjetaSesion.jsx';
import './PantallaPrincipal.css';

/**
 * Título global de la capacitación (R1.4). Referencia los ejes del programa:
 * la analítica en AWS (Athena/Quick) y su implementación/geoanalítica en IAPOL.
 * @type {string}
 */
export const TITULO_GLOBAL =
  'Capacitación práctica: Amazon Athena, Amazon Quick e IAPOL (nivel 400)';

/**
 * Lista ordenada de las Sesiones disponibles, derivada de `SESIONES`.
 *
 * Se ordena por `id` ascendente para presentar las sesiones en orden (1, 2),
 * con independencia del orden de iteración de las claves del objeto.
 *
 * @returns {Array<{ id: number, titulo: string, duracionMin?: number, diapositivas?: unknown[] }>}
 *   Las Sesiones ordenadas por número.
 */
function sesionesOrdenadas() {
  return Object.values(SESIONES)
    .filter((s) => s && typeof s === 'object')
    .slice()
    .sort((a, b) => a.id - b.id);
}

/**
 * Pantalla principal con el título global y las tarjetas de las tres Sesiones.
 *
 * @returns {import('react').ReactElement} La pantalla principal.
 */
export default function PantallaPrincipal() {
  const { irASesion } = useApp();
  const { progreso } = useProgreso();

  const sesiones = sesionesOrdenadas();
  const avancePorSesion = progreso?.sesiones ?? {};

  return (
    <main className="pantalla-principal">
      <header className="pantalla-principal__cabecera">
        {/* Motivo gráfico de ondas Blend (decorativo). */}
        <span className="ondas-blend" aria-hidden="true" />
        <div className="pantalla-principal__cabecera-contenido">
          <p className="pantalla-principal__eyebrow">Capacitación · 3 sesiones · 120 min c/u</p>
          <h1 className="pantalla-principal__titulo">{TITULO_GLOBAL}</h1>
          <p className="pantalla-principal__subtitulo">
            Tres sesiones de 120 minutos que recorren el ciclo del dato: de
            Amazon S3 y Amazon Athena al análisis en Amazon Quick y su
            integración conceptual en IAPOL.
          </p>
        </div>
      </header>

      <section
        className="pantalla-principal__sesiones"
        aria-label="Sesiones de la capacitación"
      >
        {sesiones.map((sesion) => (
          <TarjetaSesion
            key={sesion.id}
            sesion={sesion}
            progresoSesion={avancePorSesion[sesion.id] ?? null}
            totalDiapositivas={
              Array.isArray(sesion.diapositivas) ? sesion.diapositivas.length : 0
            }
            onSeleccionar={irASesion}
          />
        ))}
      </section>
    </main>
  );
}
