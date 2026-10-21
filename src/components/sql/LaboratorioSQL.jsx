/**
 * Laboratorio SQL local con resultados de demostración (LaboratorioSQL) — R9, R21.
 *
 * Laboratorio que permite al Participante practicar la interpretación de
 * consultas SQL sin acceso a AWS. No interpreta SQL arbitrario: ofrece un
 * conjunto cerrado de consultas predefinidas (`CATALOGO_CONSULTAS`) y, al
 * ejecutar una, delega en `resolverConsulta` del dominio, que mapea el
 * identificador al resultado precalculado. Esto elimina la superficie de
 * inyección y garantiza resultados deterministas e instantáneos.
 *
 * Comportamiento:
 *  - Lista entre 5 y 20 consultas predefinidas seleccionables y muestra el
 *    texto SQL (solo visual) de la consulta elegida (R9.1).
 *  - Al ejecutar una consulta soportada, renderiza el resultado de demostración
 *    asociado (columnas como cabeceras, filas como datos). Los resultados están
 *    precalculados, por lo que el renderizado es instantáneo (≤2 s) (R9.2).
 *  - Muestra de forma permanente, en todas las vistas, la insignia de
 *    "Simulación local" (`BadgeSimulacion`) para indicar que los resultados no
 *    provienen de una consulta real a Amazon Athena (R9.3, R21.4).
 *  - Si la consulta no está soportada, muestra el mensaje de no disponible y
 *    conserva el estado sin mostrar resultados (R9.4).
 *  - Si se intenta ejecutar con contenido vacío/nulo, rechaza con el mensaje de
 *    consulta inválida (R9.5). La entrada se valida antes de procesarla.
 *  - No realiza conexiones a APIs de AWS ni a IAPOL: todo es local (R9.6).
 *
 * Seguridad (R23.4): el SQL y los resultados se muestran como texto plano en
 * `<pre>`/`<code>` y tablas; NO se usa `dangerouslySetInnerHTML` ni `eval`.
 *
 * Requisitos cubiertos: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 21.4.
 */

import { useId, useMemo, useRef, useState } from 'react';

import './LaboratorioSQL.css';
import BadgeSimulacion from '../common/BadgeSimulacion.jsx';
import CATALOGO_CONSULTAS from '../../data/consultas/catalogo-consultas.js';
import {
  resolverConsulta,
  MENSAJE_CONSULTA_INVALIDA,
} from '../../domain/consultas.js';

/**
 * Normaliza texto para búsqueda tolerante: minúsculas y sin acentos, de modo
 * que "líneas" coincida con "lineas" y la búsqueda no distinga mayúsculas.
 *
 * @param {string} texto - Texto a normalizar.
 * @returns {string} Texto en minúsculas y sin diacríticos.
 */
function normalizar(texto) {
  return String(texto)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Filtra el catálogo por una consulta de búsqueda, comparando contra la
 * etiqueta y el identificador de cada consulta. Con búsqueda vacía devuelve el
 * catálogo completo.
 *
 * @param {ReadonlyArray<import('../../domain/consultas.js').ConsultaDemo>} catalogo
 * @param {string} busqueda - Texto introducido por la persona usuaria.
 * @returns {ReadonlyArray<import('../../domain/consultas.js').ConsultaDemo>}
 */
export function filtrarConsultas(catalogo, busqueda) {
  const q = normalizar(busqueda).trim();
  if (q.length === 0) return catalogo;
  return catalogo.filter(
    (c) =>
      normalizar(c.etiqueta).includes(q) || normalizar(c.id).includes(q),
  );
}

/**
 * Renderiza la tabla de resultado de demostración de una consulta resuelta.
 *
 * @param {object} props
 * @param {{ columnas: ReadonlyArray<string>, filas: ReadonlyArray<ReadonlyArray<string | number>> }} props.resultado
 * @param {string} props.etiqueta - Etiqueta legible de la consulta ejecutada.
 * @returns {import('react').ReactElement}
 */
function TablaResultado({ resultado, etiqueta }) {
  const { columnas, filas } = resultado;

  return (
    <figure className="laboratorio-sql__resultado">
      <figcaption className="laboratorio-sql__resultado-titulo">
        Resultado de demostración: {etiqueta}
      </figcaption>
      <div className="laboratorio-sql__tabla-scroll" role="region" tabIndex={0}>
        <table className="laboratorio-sql__tabla">
          <thead>
            <tr>
              {columnas.map((columna) => (
                <th key={columna} scope="col">
                  {columna}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((fila, indiceFila) => (
              // Las filas provienen de datos precalculados estáticos; su orden
              // es estable, por lo que el índice es una clave válida aquí.
              <tr key={indiceFila}>
                {fila.map((celda, indiceCelda) => (
                  <td key={columnas[indiceCelda] ?? indiceCelda}>{celda}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

/**
 * Laboratorio SQL local con resultados de demostración.
 *
 * @param {object} [props]
 * @param {ReadonlyArray<import('../../domain/consultas.js').ConsultaDemo>} [props.catalogo]
 *   Catálogo de consultas demo; por defecto `CATALOGO_CONSULTAS`.
 * @param {string} [props.className] - Clases CSS adicionales opcionales.
 * @returns {import('react').ReactElement}
 */
export default function LaboratorioSQL({
  catalogo = CATALOGO_CONSULTAS,
  className = '',
}) {
  // Texto del buscador del combobox: lo que la persona ha escrito. Puede ser
  // la etiqueta elegida al seleccionar una opción, o un identificador escrito
  // a mano. Es la única fuente de la consulta a ejecutar (R9.1/R9.4/R9.5).
  const [busqueda, setBusqueda] = useState('');
  // Id de la consulta elegida desde la lista (si la hay). Permite mostrar el
  // SQL y ejecutar por id aunque el texto visible sea la etiqueta.
  const [idElegido, setIdElegido] = useState('');
  // Si el desplegable de opciones está abierto.
  const [abierto, setAbierto] = useState(false);
  // Índice de la opción resaltada por teclado (-1 = ninguna).
  const [indiceActivo, setIndiceActivo] = useState(-1);
  // Resultado de la última ejecución: null mientras no se ejecute nada, o el
  // objeto { ok, resultado?, error?, etiqueta? } de la ejecución.
  const [ejecucion, setEjecucion] = useState(null);

  const inputRef = useRef(null);
  const listaId = useId();
  const opcionIdBase = useId();

  // Opciones visibles según el texto escrito (R9.1). Si hay una consulta
  // elegida y el texto coincide con su etiqueta, se muestran todas (para poder
  // cambiar de opción) en lugar de filtrar a una sola.
  const consultaElegida = catalogo.find((c) => c.id === idElegido);
  const textoEsEtiquetaElegida =
    consultaElegida && consultaElegida.etiqueta === busqueda;
  const opciones = useMemo(
    () =>
      textoEsEtiquetaElegida ? catalogo : filtrarConsultas(catalogo, busqueda),
    [catalogo, busqueda, textoEsEtiquetaElegida],
  );

  // El SQL se muestra para la consulta elegida desde la lista, o para una cuya
  // etiqueta/id coincida exactamente con lo escrito.
  const consultaSeleccionada =
    consultaElegida ??
    catalogo.find(
      (c) => c.etiqueta === busqueda.trim() || c.id === busqueda.trim(),
    );

  /**
   * Actualiza el texto del buscador. Al escribir se descarta la elección
   * previa, se abre el desplegable y se limpia el resultado anterior.
   *
   * @param {import('react').ChangeEvent<HTMLInputElement>} evento
   */
  function alEscribir(evento) {
    setBusqueda(evento.target.value);
    setIdElegido('');
    setAbierto(true);
    setIndiceActivo(-1);
    setEjecucion(null);
  }

  /**
   * Elige una consulta de la lista: fija su etiqueta como texto visible y su id
   * como consulta activa, cierra el desplegable y limpia el resultado previo.
   *
   * @param {import('../../domain/consultas.js').ConsultaDemo} consulta
   */
  function elegirConsulta(consulta) {
    setBusqueda(consulta.etiqueta);
    setIdElegido(consulta.id);
    setAbierto(false);
    setIndiceActivo(-1);
    setEjecucion(null);
    inputRef.current?.focus();
  }

  /**
   * Maneja el teclado del combobox: flechas para navegar, Enter para elegir la
   * opción resaltada, Escape para cerrar.
   *
   * @param {import('react').KeyboardEvent<HTMLInputElement>} evento
   */
  function alTeclado(evento) {
    if (evento.key === 'ArrowDown') {
      evento.preventDefault();
      if (!abierto) {
        setAbierto(true);
        return;
      }
      setIndiceActivo((i) => (opciones.length === 0 ? -1 : (i + 1) % opciones.length));
    } else if (evento.key === 'ArrowUp') {
      evento.preventDefault();
      if (!abierto) {
        setAbierto(true);
        return;
      }
      setIndiceActivo((i) =>
        opciones.length === 0 ? -1 : (i - 1 + opciones.length) % opciones.length,
      );
    } else if (evento.key === 'Enter') {
      if (abierto && indiceActivo >= 0 && opciones[indiceActivo]) {
        evento.preventDefault();
        elegirConsulta(opciones[indiceActivo]);
      }
    } else if (evento.key === 'Escape') {
      setAbierto(false);
      setIndiceActivo(-1);
    }
  }

  /**
   * Ejecuta la consulta activa. La consulta activa es la elegida desde la lista
   * (por id) si la hay; en otro caso, el texto escrito, interpretado como id o
   * como etiqueta de una consulta del catálogo. Valida la entrada antes de
   * resolver (R9.5) y delega en el dominio puro `resolverConsulta`
   * (R9.2/R9.4/R9.6).
   */
  function alEjecutar() {
    setAbierto(false);
    // Resolver el id activo: elección explícita > coincidencia exacta de
    // etiqueta/id con el texto escrito > el propio texto (para poder fallar con
    // "no disponible" ante un id inexistente).
    const texto = busqueda.trim();
    const porTexto = catalogo.find(
      (c) => c.etiqueta === texto || c.id === texto,
    );
    const idActivo = idElegido || porTexto?.id || texto;

    // Validación de entrada (R9.5): rechazar ejecución vacía/nula sin resolver.
    if (!idActivo || idActivo.trim().length === 0) {
      setEjecucion({ ok: false, error: MENSAJE_CONSULTA_INVALIDA });
      return;
    }

    const resolucion = resolverConsulta(idActivo, catalogo);
    // La etiqueta legible solo se conoce para consultas del catálogo.
    const consultaResuelta = catalogo.find(
      (consulta) => consulta.id === idActivo.trim(),
    );
    const etiqueta = consultaResuelta ? consultaResuelta.etiqueta : undefined;

    setEjecucion({ ...resolucion, etiqueta });
  }

  const clases = ['laboratorio-sql', className].filter(Boolean).join(' ');
  const mostrarResultado = ejecucion?.ok === true && ejecucion.resultado;
  const mostrarError = ejecucion?.ok === false && ejecucion.error;

  return (
    <section className={clases} aria-label="Laboratorio SQL local">
      <header className="laboratorio-sql__encabezado">
        <div className="laboratorio-sql__titulo-fila">
          <h2 className="laboratorio-sql__titulo">Laboratorio SQL</h2>
          {/* Etiqueta permanente de Simulación local (R9.3, R21.4). */}
          <BadgeSimulacion className="laboratorio-sql__badge" />
        </div>
        <p className="laboratorio-sql__subtitulo">
          Practique la interpretación de consultas con un conjunto cerrado de
          consultas predefinidas. Los resultados son de demostración local y no
          provienen de una consulta real a Amazon Athena.
        </p>
      </header>

      <div className="laboratorio-sql__controles">
        <div className="laboratorio-sql__campo laboratorio-sql__combobox">
          <label
            className="laboratorio-sql__label"
            htmlFor="laboratorio-sql-buscar"
          >
            Buscar consulta
          </label>
          <div className="laboratorio-sql__campo-input">
            <input
              id="laboratorio-sql-buscar"
              ref={inputRef}
              className="laboratorio-sql__input"
              type="text"
              role="combobox"
              autoComplete="off"
              placeholder="Escriba para buscar o despliegue la lista…"
              aria-expanded={abierto}
              aria-controls={listaId}
              aria-autocomplete="list"
              aria-activedescendant={
                abierto && indiceActivo >= 0
                  ? `${opcionIdBase}-${indiceActivo}`
                  : undefined
              }
              value={busqueda}
              onChange={alEscribir}
              onKeyDown={alTeclado}
              onFocus={() => setAbierto(true)}
              onBlur={() => {
                // Cierra tras permitir que el click en una opción se procese.
                window.setTimeout(() => setAbierto(false), 120);
              }}
            />
            <button
              type="button"
              className="laboratorio-sql__toggle"
              aria-label={abierto ? 'Ocultar la lista' : 'Mostrar la lista'}
              tabIndex={-1}
              onClick={() => {
                setAbierto((v) => !v);
                inputRef.current?.focus();
              }}
            >
              <span aria-hidden="true">▾</span>
            </button>
          </div>
          {abierto ? (
            <ul className="laboratorio-sql__opciones" id={listaId} role="listbox">
              {opciones.length === 0 ? (
                <li className="laboratorio-sql__opcion-vacia" role="presentation">
                  Sin coincidencias
                </li>
              ) : (
                opciones.map((consulta, i) => (
                  <li
                    key={consulta.id}
                    id={`${opcionIdBase}-${i}`}
                    role="option"
                    aria-selected={consulta.id === idElegido}
                    className={`laboratorio-sql__opcion${
                      i === indiceActivo
                        ? ' laboratorio-sql__opcion--activa'
                        : ''
                    }`}
                    // onMouseDown en vez de onClick para que no se dispare el
                    // blur del input antes de registrar la elección.
                    onMouseDown={(e) => {
                      e.preventDefault();
                      elegirConsulta(consulta);
                    }}
                    onMouseEnter={() => setIndiceActivo(i)}
                  >
                    <span className="laboratorio-sql__opcion-etiqueta">
                      {consulta.etiqueta}
                    </span>
                    <span className="laboratorio-sql__opcion-id">
                      {consulta.id}
                    </span>
                  </li>
                ))
              )}
            </ul>
          ) : null}
        </div>
        <button
          type="button"
          className="laboratorio-sql__ejecutar"
          onClick={alEjecutar}
        >
          Ejecutar consulta
        </button>
      </div>

      {consultaSeleccionada ? (
        <figure className="laboratorio-sql__sql">
          <figcaption className="laboratorio-sql__sql-titulo">
            SQL de la consulta (solo visual)
          </figcaption>
          <pre className="laboratorio-sql__codigo">
            <code>{consultaSeleccionada.sql}</code>
          </pre>
        </figure>
      ) : null}

      <div className="laboratorio-sql__salida" aria-live="polite">
        {mostrarError ? (
          <p className="laboratorio-sql__mensaje" role="alert">
            {ejecucion.error}
          </p>
        ) : null}

        {mostrarResultado ? (
          <TablaResultado
            resultado={ejecucion.resultado}
            etiqueta={ejecucion.etiqueta}
          />
        ) : null}
      </div>
    </section>
  );
}
