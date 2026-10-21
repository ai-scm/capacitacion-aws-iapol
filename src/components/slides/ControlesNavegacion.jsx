/**
 * ControlesNavegacion (Sistema_Navegacion) — R3, R4, R17.3.
 *
 * Barra de controles de la vista de diapositivas. Ofrece:
 *  - Botones accesibles por toque para retroceder/avanzar entre diapositivas
 *    (R3.1, R3.2, R17.3), delegando en `retroceder()`/`avanzar()` del AppContext
 *    (la lógica de límites vive en el motor de navegación puro, por lo que los
 *    botones solo se deshabilitan como refuerzo visual en los extremos).
 *  - Un botón para activar/desactivar el Modo_Pantalla_Completa (R4.1, R4.3)
 *    mediante `useFullscreen`. El objetivo de la pantalla completa es el
 *    elemento referenciado por `refPantallaCompleta` (típicamente el contenedor
 *    de la diapositiva); si no se provee, `useFullscreen` recurre al elemento
 *    raíz del documento. El botón se oculta cuando la API no está soportada.
 *
 * Navegación por teclado (R3.5, R4.2): se integra `useNavegacionTeclado`, que
 * escucha en `window`, de modo que las flechas/espacio siguen avanzando y
 * retrocediendo también durante la pantalla completa (R4.2) y Escape cierra el
 * Modo_Pantalla_Completa (R3.5). El hook se activa solo cuando los controles
 * están montados en la vista de diapositivas (`activo`).
 *
 * Sincronización del flag `pantallaCompleta` (R4.3): el toggle puro del
 * AppContext (`alternarPantallaCompleta`) mantiene un booleano que preserva el
 * índice de diapositiva; aquí lo mantenemos alineado con el estado real del
 * navegador (`estaEnPantallaCompleta` de `useFullscreen`), de forma que salir
 * con Escape del navegador también deje el flag de la Plataforma coherente.
 *
 * Requisitos cubiertos: 3.1, 3.2, 3.5, 4.1, 4.2, 4.3, 17.3.
 *
 * @module components/slides/ControlesNavegacion
 */

import { useEffect } from 'react';

import { useApp } from '../../context/AppContext.jsx';
import useNavegacionTeclado from '../../hooks/useNavegacionTeclado.js';
import useFullscreen from '../../hooks/useFullscreen.js';
import './ControlesNavegacion.css';

/**
 * Controles de navegación y pantalla completa de la vista de diapositivas.
 *
 * @param {Object} props
 * @param {{ current: Element | null }} [props.refPantallaCompleta] - Ref al
 *   elemento que debe ocupar la pantalla completa (p. ej. el contenedor de la
 *   diapositiva). Si se omite, se usa el elemento raíz del documento.
 * @param {boolean} [props.activo=true] - Si es `false`, desactiva la navegación
 *   por teclado (útil cuando la vista de diapositivas no está visible).
 * @returns {import('react').ReactElement}
 */
export default function ControlesNavegacion({
  refPantallaCompleta,
  activo = true,
} = {}) {
  const {
    avanzar,
    retroceder,
    indiceDiapositiva,
    totalDiapositivas,
    pantallaCompleta,
    alternarPantallaCompleta,
  } = useApp();

  const { estaEnPantallaCompleta, alternar, desactivar, soportado } =
    useFullscreen(refPantallaCompleta);

  // Navegación por teclado: escucha en window, por lo que permanece disponible
  // durante el Modo_Pantalla_Completa (R4.2). Escape cierra la pantalla
  // completa del navegador (R3.5 / R4) usando la acción del hook.
  useNavegacionTeclado({
    onAvanzar: avanzar,
    onRetroceder: retroceder,
    onEscape: desactivar,
    activo,
  });

  // Mantiene el flag puro `pantallaCompleta` del AppContext (R4.3) alineado con
  // el estado real del navegador. Esto cubre tanto el toggle por botón como la
  // salida mediante Escape del navegador (que dispara `fullscreenchange`).
  useEffect(() => {
    if (estaEnPantallaCompleta !== pantallaCompleta) {
      alternarPantallaCompleta();
    }
  }, [estaEnPantallaCompleta, pantallaCompleta, alternarPantallaCompleta]);

  const enPrimera = totalDiapositivas < 1 || indiceDiapositiva <= 0;
  const enUltima =
    totalDiapositivas < 1 || indiceDiapositiva >= totalDiapositivas - 1;

  return (
    <nav className="controles-navegacion" aria-label="Controles de navegación de diapositivas">
      <button
        type="button"
        className="controles-navegacion__boton"
        onClick={retroceder}
        disabled={enPrimera}
        aria-label="Diapositiva anterior"
      >
        <span aria-hidden="true">←</span> Anterior
      </button>

      {soportado && (
        <button
          type="button"
          className="controles-navegacion__boton controles-navegacion__boton--pantalla-completa"
          onClick={alternar}
          aria-pressed={estaEnPantallaCompleta}
          aria-label={
            estaEnPantallaCompleta
              ? 'Salir de pantalla completa'
              : 'Entrar en pantalla completa'
          }
        >
          <span aria-hidden="true">{estaEnPantallaCompleta ? '🡼' : '⛶'}</span>{' '}
          {estaEnPantallaCompleta ? 'Salir' : 'Pantalla completa'}
        </button>
      )}

      <button
        type="button"
        className="controles-navegacion__boton controles-navegacion__boton--siguiente"
        onClick={avanzar}
        disabled={enUltima}
        aria-label="Diapositiva siguiente"
      >
        Siguiente <span aria-hidden="true">→</span>
      </button>
    </nav>
  );
}
