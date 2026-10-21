/**
 * Glosario técnico con buscador (Glosario) — R14.
 *
 * Presenta la lista de términos técnicos del curso (S3, Glue Data Catalog,
 * Athena, workgroup, Parquet, dataset, análisis, dashboard, SPICE, Direct Query,
 * IAPOL, etc.) con sus definiciones (R14.1) y ofrece un buscador que filtra las
 * entradas por coincidencia de texto, sin distinguir mayúsculas y minúsculas,
 * en el término o en la definición (R14.2).
 *
 * El filtrado delega en la lógica pura `buscarTerminos(texto, terminos)` del
 * dominio (`src/domain/glosario.js`), que ya implementa la coincidencia
 * insensible a mayúsculas sobre `termino`/`definicion` (Property 13). El
 * componente se limita a gestionar el estado del campo de búsqueda y a
 * presentar los resultados.
 *
 * Entrada del usuario (R23.5): el campo de búsqueda es un input controlado por
 * estado de React; el valor se recorta (trim) antes de usarse para filtrar, de
 * modo que los espacios iniciales/finales no afecten a la coincidencia. No se
 * usa `dangerouslySetInnerHTML`; todo el contenido se renderiza como texto.
 *
 * Accesibilidad: el campo de búsqueda tiene una etiqueta asociada (`<label>`),
 * se anuncia el número de coincidencias mediante una región aria-live, y se
 * muestra un estado vacío explícito cuando no hay resultados.
 *
 * Requisitos cubiertos: 14.1, 14.2.
 */

import { useId, useMemo, useState } from 'react';

import './Glosario.css';
import { terminos as TERMINOS } from '../../data/glosario/terminos.js';
import { buscarTerminos } from '../../domain/glosario.js';

/**
 * Entrada individual del glosario (término + definición).
 *
 * @param {object} props
 * @param {{ termino: string, definicion: string }} props.entrada
 * @returns {import('react').ReactElement}
 */
function EntradaGlosario({ entrada }) {
  const { termino, definicion } = entrada;

  return (
    <div className="glosario__entrada">
      <dt className="glosario__termino">{termino}</dt>
      <dd className="glosario__definicion">{definicion}</dd>
    </div>
  );
}

/**
 * Componente de glosario técnico con buscador.
 *
 * @param {object} [props]
 * @param {ReadonlyArray<{ termino: string, definicion: string }>} [props.terminos]
 *   Lista de términos a presentar. Por defecto, los términos empaquetados del
 *   curso. Inyectable para pruebas.
 * @param {string} [props.className] - Clases CSS adicionales opcionales.
 * @returns {import('react').ReactElement}
 */
export default function Glosario({ terminos = TERMINOS, className = '' }) {
  const [busqueda, setBusqueda] = useState('');
  const campoId = useId();

  // Se valida/recorta la entrada antes de filtrar (R23.5): los espacios
  // iniciales y finales no deben alterar la coincidencia.
  const textoFiltro = busqueda.trim();

  const resultados = useMemo(() => {
    const lista = Array.isArray(terminos) ? terminos : [];
    return buscarTerminos(textoFiltro, lista);
  }, [textoFiltro, terminos]);

  const total = resultados.length;
  const hayBusqueda = textoFiltro.length > 0;
  const clases = ['glosario', className].filter(Boolean).join(' ');

  const resumen = hayBusqueda
    ? `${total} ${total === 1 ? 'coincidencia' : 'coincidencias'} para "${textoFiltro}"`
    : `${total} ${total === 1 ? 'término' : 'términos'}`;

  return (
    <section className={clases} aria-label="Glosario técnico">
      <header className="glosario__encabezado">
        <h2 className="glosario__encabezado-titulo">Glosario técnico</h2>
        <p className="glosario__encabezado-subtitulo">
          Definiciones de los términos utilizados en el curso. Escriba en el
          buscador para filtrar por término o definición.
        </p>
      </header>

      <div className="glosario__buscador">
        <label className="glosario__buscador-label" htmlFor={campoId}>
          Buscar término
        </label>
        <input
          id={campoId}
          className="glosario__buscador-input"
          type="search"
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
          placeholder="Por ejemplo: Athena, SPICE, dashboard…"
          autoComplete="off"
          spellCheck="false"
        />
      </div>

      <p className="glosario__resumen" role="status" aria-live="polite">
        {resumen}
      </p>

      {total > 0 ? (
        <dl className="glosario__lista">
          {resultados.map((entrada) => (
            <EntradaGlosario key={entrada.termino} entrada={entrada} />
          ))}
        </dl>
      ) : (
        <p className="glosario__vacio" role="note">
          No se encontraron términos que coincidan con «{textoFiltro}». Pruebe
          con otra palabra o revise la ortografía.
        </p>
      )}
    </section>
  );
}
