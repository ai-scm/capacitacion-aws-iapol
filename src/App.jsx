/**
 * App — cableado raíz de la Plataforma (tarea 14.1).
 *
 * Monta los tres proveedores de estado en el orden descrito en el diseño
 * (router por estado + persistencia de progreso + Modo_Presentador) y, dentro
 * de ellos, renderiza una barra de navegación de alto nivel y la vista activa
 * según `vistaActual` del {@link useApp AppContext}:
 *
 *   home       → PantallaPrincipal
 *   slides     → VistaDiapositivas + ControlesNavegacion (+ Modo_Presentador)
 *   lab        → LaboratorioSQL + ExplicacionesSQL (+ Diagrama_Arquitectura)
 *   simulador  → SimuladorDashboards + HojaAnalisis
 *   evaluacion → MotorEvaluacion
 *   glosario   → Glosario
 *   recursos   → CentroRecursos (+ Identificadores_IAPOL + Casos_Diagnostico)
 *
 * Honestidad técnica y seguridad (R20, R21, R23):
 *  - No se realiza ninguna operación ni conexión a AWS/IAPOL: toda la lógica es
 *    local y los datos provienen del Dataset_Ejemplo (NYC Yellow Taxi, R20.1) y
 *    de catálogos estáticos empaquetados. La Plataforma no induce a publicar ni
 *    registrar recursos en IAPOL (R21.2) ni ejecuta operaciones reales (R21.3).
 *  - Cada Simulacion que imita a Amazon Athena, Amazon Quick o IAPOL ya se marca
 *    con la insignia permanente de "Simulación local" (BadgeSimulacion) en sus
 *    propios componentes, de modo que no se confunda con una operación real
 *    (R21.4).
 *  - El código JavaScript se carga desde el bundle local de Vite, sin CDN en
 *    tiempo de ejecución (R23.3). No se usa `eval` ni inyección de HTML sin
 *    saneamiento (R23.4).
 *
 * El enrutado es por estado (sin react-router): la navegación entre vistas se
 * resuelve con `irAVista(vista)` del AppContext.
 *
 * Requisitos cubiertos: 20.1, 21.2, 21.3, 21.4, 23.3.
 *
 * @module App
 */

import { useRef } from 'react';

import { AppProvider, useApp, VISTAS } from './context/AppContext.jsx';
import { ProgresoProvider } from './context/ProgresoContext.jsx';
import { PresentadorProvider, usePresentador } from './context/PresentadorContext.jsx';
import { EVALUACION_VISIBLE } from './config/caracteristicas.js';

import PantallaPrincipal from './components/home/PantallaPrincipal.jsx';
import VistaDiapositivas from './components/slides/VistaDiapositivas.jsx';
import ControlesNavegacion from './components/slides/ControlesNavegacion.jsx';
import LaboratorioSQL from './components/sql/LaboratorioSQL.jsx';
import ExplicacionesSQL from './components/sql/ExplicacionesSQL.jsx';
import SimuladorDashboards from './components/simulador/SimuladorDashboards.jsx';
import HojaAnalisis from './components/simulador/HojaAnalisis.jsx';
import MotorEvaluacion from './components/evaluacion/MotorEvaluacion.jsx';
import Glosario from './components/glosario/Glosario.jsx';
import CentroRecursos from './components/recursos/CentroRecursos.jsx';
import DiagramaArquitectura from './components/diagrama/DiagramaArquitectura.jsx';
import IdentificadoresIAPOL from './components/iapol/IdentificadoresIAPOL.jsx';
import CasosDiagnostico from './components/iapol/CasosDiagnostico.jsx';
import ModoPresentador from './components/presentador/ModoPresentador.jsx';

/**
 * Etiquetas legibles para la barra de navegación de alto nivel. Las claves son
 * las vistas del conjunto cerrado `VISTAS` del AppContext.
 *
 * @type {Record<'home'|'slides'|'lab'|'simulador'|'evaluacion'|'glosario'|'recursos', string>}
 */
const ETIQUETAS_VISTA = {
  home: 'Inicio',
  slides: 'Diapositivas',
  lab: 'Laboratorio SQL',
  simulador: 'Simulador',
  evaluacion: 'Evaluación',
  glosario: 'Glosario',
  recursos: 'Recursos',
};

/**
 * Indica si una vista está habilitada según las banderas de características.
 *
 * Actualmente solo la vista "evaluacion" es conmutable por código
 * ({@link EVALUACION_VISIBLE}); el resto está siempre habilitado.
 *
 * @param {string} vista - Identificador de la vista.
 * @returns {boolean} `true` si la vista debe mostrarse/renderizarse.
 */
function vistaHabilitada(vista) {
  if (vista === 'evaluacion') {
    return EVALUACION_VISIBLE;
  }
  return true;
}

/**
 * Vistas de alto nivel visibles en la navegación, tras aplicar las banderas de
 * características (p. ej. ocultar "evaluacion" cuando está deshabilitada).
 *
 * @type {ReadonlyArray<string>}
 */
const VISTAS_VISIBLES = VISTAS.filter(vistaHabilitada);

/**
 * Barra de navegación principal entre las vistas de alto nivel.
 *
 * Renderiza un botón por cada vista del conjunto `VISTAS` y delega el cambio en
 * `irAVista`. El botón de la vista activa se marca con `aria-current` para
 * accesibilidad.
 *
 * @returns {import('react').ReactElement}
 */
function NavegacionPrincipal() {
  const { vistaActual, irAVista } = useApp();

  return (
    <nav className="app__nav" aria-label="Navegación principal">
      <ul className="app__nav-lista">
        {VISTAS_VISIBLES.map((vista) => (
          <li key={vista} className="app__nav-item">
            <button
              type="button"
              className="app__nav-boton"
              aria-current={vista === vistaActual ? 'page' : undefined}
              onClick={() => irAVista(vista)}
            >
              {ETIQUETAS_VISTA[vista] ?? vista}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * Botón para abrir/cerrar el Modo_Presentador. Relevante en la vista de
 * diapositivas; su ventana/overlay real la gestiona {@link ModoPresentador}.
 *
 * @returns {import('react').ReactElement}
 */
function BotonPresentador() {
  const { presentadorActivo, abrirPresentador, cerrarPresentador } = usePresentador();

  return (
    <button
      type="button"
      className="app__boton-presentador"
      aria-pressed={presentadorActivo}
      onClick={presentadorActivo ? cerrarPresentador : abrirPresentador}
    >
      {presentadorActivo ? 'Cerrar modo presentador' : 'Abrir modo presentador'}
    </button>
  );
}

/**
 * Vista de diapositivas con sus controles de navegación y el Modo_Presentador.
 *
 * El contenedor de la diapositiva se referencia con `contenedorRef` y se pasa a
 * {@link ControlesNavegacion} como objetivo del Modo_Pantalla_Completa, de modo
 * que la pantalla completa cubra la diapositiva y no todo el documento.
 *
 * @returns {import('react').ReactElement}
 */
function VistaSlides() {
  const contenedorRef = useRef(null);

  return (
    <div className="app__vista app__vista--slides">
      <div className="app__slides-barra">
        <BotonPresentador />
      </div>
      <div className="app__slides-contenedor" ref={contenedorRef}>
        <VistaDiapositivas />
      </div>
      <ControlesNavegacion refPantallaCompleta={contenedorRef} activo />
      {/* Devuelve null salvo que el Modo_Presentador esté activo. */}
      <ModoPresentador />
    </div>
  );
}

/**
 * Vista del Laboratorio SQL: el laboratorio de consultas demo junto con sus
 * explicaciones y el diagrama de arquitectura conceptual del caso práctico.
 *
 * @returns {import('react').ReactElement}
 */
function VistaLaboratorio() {
  return (
    <div className="app__vista app__vista--lab">
      <DiagramaArquitectura />
      <LaboratorioSQL />
      <ExplicacionesSQL />
    </div>
  );
}

/**
 * Vista del Simulador: dashboards (visualizaciones) y hojas de análisis sobre
 * el Dataset_Ejemplo.
 *
 * @returns {import('react').ReactElement}
 */
function VistaSimulador() {
  return (
    <div className="app__vista app__vista--simulador">
      <SimuladorDashboards />
      <HojaAnalisis />
    </div>
  );
}

/**
 * Vista de Recursos: centro de enlaces de referencia junto con los
 * identificadores y casos de diagnóstico del ámbito IAPOL.
 *
 * @returns {import('react').ReactElement}
 */
function VistaRecursos() {
  return (
    <div className="app__vista app__vista--recursos">
      <CentroRecursos />
      <IdentificadoresIAPOL />
      <CasosDiagnostico />
    </div>
  );
}

/**
 * Resuelve y renderiza la vista activa según `vistaActual` del AppContext.
 *
 * @returns {import('react').ReactElement}
 */
function VistaActiva() {
  const { vistaActual } = useApp();

  switch (vistaActual) {
    case 'slides':
      return <VistaSlides />;
    case 'lab':
      return <VistaLaboratorio />;
    case 'simulador':
      return <VistaSimulador />;
    case 'evaluacion':
      // La vista Evaluación es conmutable por código y está oculta por
      // defecto; si está deshabilitada, se cae al caso por defecto (Inicio).
      if (vistaHabilitada('evaluacion')) {
        return (
          <div className="app__vista app__vista--evaluacion">
            <MotorEvaluacion />
          </div>
        );
      }
      return (
        <div className="app__vista app__vista--home">
          <PantallaPrincipal />
        </div>
      );
    case 'glosario':
      return (
        <div className="app__vista app__vista--glosario">
          <Glosario />
        </div>
      );
    case 'recursos':
      return <VistaRecursos />;
    case 'home':
    default:
      return (
        <div className="app__vista app__vista--home">
          <PantallaPrincipal />
        </div>
      );
  }
}

/**
 * Cascarón de la aplicación: barra de navegación + vista activa. Debe montarse
 * dentro de los proveedores de estado (se consume `useApp` en los hijos).
 *
 * @returns {import('react').ReactElement}
 */
function Shell() {
  return (
    <div className="app">
      <header className="app__cabecera">
        <NavegacionPrincipal />
      </header>
      <main className="app__contenido">
        <VistaActiva />
      </main>
    </div>
  );
}

/**
 * Componente raíz de la Plataforma. Compone los proveedores de estado en el
 * orden del diseño y monta el cascarón de la interfaz.
 *
 * @returns {import('react').ReactElement}
 */
export default function App() {
  return (
    <AppProvider>
      <ProgresoProvider>
        <PresentadorProvider>
          <Shell />
        </PresentadorProvider>
      </ProgresoProvider>
    </AppProvider>
  );
}
