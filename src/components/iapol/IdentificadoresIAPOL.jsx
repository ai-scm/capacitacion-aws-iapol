/**
 * Identificadores de Amazon Quick e IAPOL (IdentificadoresIAPOL) — R18.
 *
 * Presenta, en tarjetas, los identificadores del recorrido dato → análisis →
 * dashboard → IAPOL, consumiendo la lista exportada `IDENTIFICADORES` del módulo
 * de datos de la Sesión 3 (sin duplicar el contenido en la UI):
 *
 *   - Dataset ID, Analysis ID y Dashboard ID (ámbito Amazon Quick) con su
 *     descripción (R18.1).
 *   - id_portal e id_quicksight (campos propios de IAPOL) con su descripción y
 *     la advertencia de que su función y correspondencia deben corroborarse con
 *     la documentación interna autorizada (R18.2). Estos se rotulan con la
 *     insignia del plano IAPOL mediante `BadgePlano` (R21.4).
 *
 * Además incluye, de forma clara y permanente, la advertencia de que copiar una
 * URL de Amazon Quick o un identificador NO habilita automáticamente la
 * visualización embebida en IAPOL (R18.3).
 *
 * Seguridad (R23.4): todo el contenido es estático y se renderiza como texto
 * plano; NO se usa `dangerouslySetInnerHTML`. La diferenciación de estilos se
 * logra mediante clases CSS con variables de tema (fallbacks incluidos).
 *
 * Requisitos cubiertos: 18.1, 18.2, 18.3, 21.4.
 */

import './IdentificadoresIAPOL.css';
import { IDENTIFICADORES } from '../../data/sesiones/sesion3.js';
import BadgePlano, { PLANOS } from '../common/BadgePlano.jsx';

/**
 * Ámbito textual que identifica los campos propios de IAPOL dentro de la lista
 * de identificadores. Las entradas con este ámbito se rotulan con la insignia
 * del plano IAPOL (R21.4) y suelen incluir la advertencia de corroboración
 * interna (R18.2).
 *
 * @type {string}
 */
export const AMBITO_IAPOL = 'IAPOL';

/**
 * Advertencia permanente sobre la visualización embebida (R18.3).
 *
 * El módulo de datos de la Sesión 3 la usa en una diapositiva pero no la
 * exporta; se declara aquí para poder mostrarla de forma destacada en el
 * componente. Copiar una URL de Amazon Quick o un identificador no habilita por
 * sí solo el embebido en IAPOL.
 *
 * @type {string}
 */
export const ADVERTENCIA_EMBEBIDO =
  'Copiar una URL de Amazon Quick o un identificador no habilita ' +
  'automáticamente la visualización embebida en IAPOL. Pueden intervenir ' +
  'autenticación, autorización, configuración de embedding, registro ' +
  'institucional y permisos por usuario o rol.';

/**
 * Genera un identificador estable (apto para claves de React y atributos `id`)
 * a partir del nombre de un identificador.
 *
 * @param {string} nombre - Nombre del identificador (p. ej. "Dataset ID").
 * @returns {string} Slug en minúsculas con guiones.
 */
function slug(nombre) {
  return nombre
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Tarjeta individual de un identificador.
 *
 * @param {object} props
 * @param {{ nombre: string, ambito: string, descripcion: string, advertencia?: string }} props.identificador
 * @returns {import('react').ReactElement}
 */
function TarjetaIdentificador({ identificador }) {
  const { nombre, ambito, descripcion, advertencia } = identificador;
  const esIapol = ambito === AMBITO_IAPOL;
  const tituloId = `identificador-${slug(nombre)}-titulo`;

  return (
    <article
      className={`identificadores-iapol__tarjeta${
        esIapol ? ' identificadores-iapol__tarjeta--iapol' : ''
      }`}
      aria-labelledby={tituloId}
    >
      <header className="identificadores-iapol__tarjeta-encabezado">
        <h3 className="identificadores-iapol__tarjeta-titulo" id={tituloId}>
          <code className="identificadores-iapol__nombre">{nombre}</code>
        </h3>
        {esIapol ? (
          <BadgePlano plano={PLANOS.IAPOL} />
        ) : (
          <span className="identificadores-iapol__ambito">{ambito}</span>
        )}
      </header>

      <p className="identificadores-iapol__descripcion">{descripcion}</p>

      {advertencia ? (
        <p className="identificadores-iapol__advertencia" role="note">
          {advertencia}
        </p>
      ) : null}
    </article>
  );
}

/**
 * Sección de identificadores de Amazon Quick e IAPOL.
 *
 * @param {object} [props]
 * @param {string} [props.className] - Clases CSS adicionales opcionales.
 * @returns {import('react').ReactElement}
 */
export default function IdentificadoresIAPOL({ className = '' }) {
  const clases = ['identificadores-iapol', className]
    .filter(Boolean)
    .join(' ');

  return (
    <section
      className={clases}
      aria-label="Identificadores de Amazon Quick e IAPOL"
    >
      <header className="identificadores-iapol__encabezado">
        <h2 className="identificadores-iapol__encabezado-titulo">
          Identificadores de Amazon Quick e IAPOL
        </h2>
        <p className="identificadores-iapol__encabezado-subtitulo">
          Cada identificador referencia un recurso distinto del recorrido
          dato → análisis → dashboard → IAPOL.
        </p>
      </header>

      <div className="identificadores-iapol__tarjetas">
        {IDENTIFICADORES.map((identificador) => (
          <TarjetaIdentificador
            key={slug(identificador.nombre)}
            identificador={identificador}
          />
        ))}
      </div>

      <p
        className="identificadores-iapol__advertencia-embebido"
        role="note"
      >
        <strong className="identificadores-iapol__advertencia-titulo">
          Importante:
        </strong>{' '}
        {ADVERTENCIA_EMBEBIDO}
      </p>
    </section>
  );
}
