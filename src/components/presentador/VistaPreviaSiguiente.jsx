/**
 * VistaPreviaSiguiente — vista previa de la siguiente diapositiva (R5.7).
 *
 * Mientras el Modo_Presentador está activo, muestra un adelanto de la próxima
 * diapositiva de la sesión para que el Instructor sepa qué viene a continuación.
 * El adelanto incluye el título de la siguiente diapositiva y, si están
 * disponibles, sus objetivos de aprendizaje. Si la diapositiva actual es la
 * última de la sesión, muestra un estado de "fin de sesión" en lugar de un
 * adelanto.
 *
 * Esta vista se nutre de `AppContext` (sesión activa e índice actual) y deriva
 * la siguiente diapositiva de `sesion.diapositivas[indiceDiapositiva + 1]`.
 *
 * Privacidad (R5.8 / Property 5): la vista previa NUNCA incluye
 * `notasInstructor`; las notas privadas solo se muestran en el panel principal
 * del Modo_Presentador y jamás en la vista pública.
 *
 * Requisitos cubiertos: 5.7.
 *
 * @module components/presentador/VistaPreviaSiguiente
 */

import { useApp } from '../../context/AppContext.jsx';
import './VistaPreviaSiguiente.css';

/**
 * Extrae un breve resumen textual de los primeros bloques de una diapositiva.
 *
 * Toma el primer bloque de tipo `texto` o `nota` como avance de contenido. Si no
 * hay un bloque textual, devuelve una cadena vacía. No renderiza código,
 * imágenes ni listas completas: la vista previa busca ser un adelanto ligero.
 *
 * @param {import('../../data/sesiones/sesion1.js').Diapositiva} diapositiva
 * @returns {string} Un texto breve de avance, o cadena vacía si no aplica.
 */
function resumenBreve(diapositiva) {
  const bloques = Array.isArray(diapositiva?.contenido) ? diapositiva.contenido : [];
  const bloqueTexto = bloques.find(
    (bloque) => bloque && (bloque.tipo === 'texto' || bloque.tipo === 'nota'),
  );
  return bloqueTexto && typeof bloqueTexto.texto === 'string' ? bloqueTexto.texto : '';
}

/**
 * Panel de vista previa de la siguiente diapositiva.
 *
 * @returns {import('react').ReactElement}
 */
export default function VistaPreviaSiguiente() {
  const { sesion, indiceDiapositiva, totalDiapositivas } = useApp();

  const diapositivas = Array.isArray(sesion?.diapositivas) ? sesion.diapositivas : [];
  const indiceSiguiente = indiceDiapositiva + 1;
  const esUltima = indiceSiguiente >= totalDiapositivas;
  const siguiente = esUltima ? null : diapositivas[indiceSiguiente] ?? null;

  // Estado de fin de sesión: no hay una diapositiva siguiente que previsualizar.
  if (esUltima || !siguiente) {
    return (
      <section className="vista-previa vista-previa--fin" aria-label="Vista previa de la siguiente diapositiva">
        <h3 className="vista-previa__encabezado">Siguiente</h3>
        <p className="vista-previa__fin-texto">Fin de la sesión</p>
        <p className="vista-previa__fin-detalle">
          Esta es la última diapositiva de la sesión.
        </p>
      </section>
    );
  }

  const objetivos = Array.isArray(siguiente.objetivos) ? siguiente.objetivos : [];
  const resumen = resumenBreve(siguiente);

  return (
    <section className="vista-previa" aria-label="Vista previa de la siguiente diapositiva">
      <h3 className="vista-previa__encabezado">
        Siguiente
        <span className="vista-previa__posicion">
          {' '}
          ({indiceSiguiente + 1} de {totalDiapositivas})
        </span>
      </h3>

      <p className="vista-previa__titulo">{siguiente.titulo}</p>

      {resumen ? <p className="vista-previa__resumen">{resumen}</p> : null}

      {objetivos.length > 0 ? (
        <ul className="vista-previa__objetivos">
          {objetivos.map((objetivo, indice) => (
            <li key={indice} className="vista-previa__objetivo">
              {objetivo}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
