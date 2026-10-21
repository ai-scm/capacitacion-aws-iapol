/**
 * DiagramaArquitectura — diagrama interactivo del flujo de datos AWS (R7, R21).
 *
 * Representa de forma interactiva el recorrido del dato a lo largo de la
 * arquitectura de la capacitación:
 *
 *   S3 → AWS Glue Data Catalog / Amazon Athena → Amazon Quick → IAPOL
 *
 * Cada componente del flujo se dibuja como un nodo seleccionable (un `<button>`
 * accesible) y las relaciones se trazan como conexiones SVG entre nodos. Al
 * seleccionar un nodo, un panel lateral muestra la descripción de su función
 * (R7.2). El componente mantiene el nodo seleccionado en estado de React.
 *
 * Textos fijos exigidos por los requisitos:
 *   - AWS Glue Data Catalog registra y describe tablas; Amazon Athena consulta
 *     datos en S3 usando esos metadatos (R7.3).
 *   - Los pasos de integración con IAPOL son explicativos y NO se ejecutan desde
 *     la Plataforma (R7.4).
 *
 * Para reforzar la diferenciación de planos (R21.4), el nodo IAPOL se etiqueta
 * con {@link BadgePlano} (plano "iapol") y, en el panel de descripción de
 * IAPOL, se muestra además {@link BadgeSimulacion} junto a la nota de que la
 * integración no se ejecuta.
 *
 * Accesibilidad: los nodos son botones enfocables por teclado (Enter/Espacio),
 * con `aria-pressed` reflejando la selección y `aria-controls` apuntando al
 * panel de descripción. El dibujo SVG de conexiones es decorativo
 * (`aria-hidden`), ya que el flujo también se describe textualmente.
 *
 * Seguridad: no se usa `dangerouslySetInnerHTML` ni `eval`; todo el contenido es
 * texto estático en español renderizado por React (R23.4).
 *
 * Requisitos cubiertos: 7.1 (nodos y conexiones del flujo), 7.2 (descripción al
 * seleccionar un nodo), 7.3 (texto Glue/Athena), 7.4 (integración IAPOL
 * explicativa, no ejecutada) y 21.4 (identificar el plano IAPOL/Simulación).
 *
 * @module components/diagrama/DiagramaArquitectura
 */

import { useId, useState } from 'react';
import BadgePlano, { PLANOS } from '../common/BadgePlano.jsx';
import BadgeSimulacion from '../common/BadgeSimulacion.jsx';
import { IconoServicioNodo } from '../common/IconosServicio.jsx';
import './DiagramaArquitectura.css';

/**
 * Identificadores estables de los nodos del diagrama.
 * @readonly
 * @enum {string}
 */
export const NODOS = Object.freeze({
  S3: 's3',
  GLUE: 'glue',
  ATHENA: 'athena',
  QUICK: 'quick',
  IAPOL: 'iapol',
});

/**
 * Definición de cada nodo del diagrama: etiqueta visible, subtítulo, posición en
 * la cuadrícula del SVG y descripción de su función (R7.2).
 *
 * Las posiciones (`cx`, `cy`) están en el sistema de coordenadas del `viewBox`
 * (0 0 960 320) y se usan tanto para situar los botones como para trazar las
 * conexiones SVG. El orden del arreglo define también el orden de tabulación.
 *
 * @readonly
 * @type {ReadonlyArray<{
 *   id: string,
 *   etiqueta: string,
 *   subtitulo: string,
 *   descripcion: string,
 *   cx: number,
 *   cy: number,
 *   plano?: string,
 * }>}
 */
export const DEFINICION_NODOS = Object.freeze([
  {
    id: NODOS.S3,
    etiqueta: 'Amazon S3',
    subtitulo: 'Almacenamiento de objetos',
    descripcion:
      'Amazon S3 almacena los archivos de datos de origen (por ejemplo, los ' +
      'NYC Yellow Taxi Trip Records en formato Parquet). Es el punto de ' +
      'partida del flujo: los datos residen aquí antes de ser catalogados y ' +
      'consultados.',
    cx: 110,
    cy: 160,
  },
  {
    id: NODOS.GLUE,
    etiqueta: 'AWS Glue Data Catalog',
    subtitulo: 'Catálogo de metadatos',
    descripcion:
      'AWS Glue Data Catalog registra y describe las tablas: guarda el esquema ' +
      '(nombres de columnas y tipos) y la ubicación de los datos en S3. No ' +
      'copia los datos, solo sus metadatos, para que Amazon Athena sepa cómo ' +
      'interpretarlos.',
    cx: 360,
    cy: 80,
  },
  {
    id: NODOS.ATHENA,
    etiqueta: 'Amazon Athena',
    subtitulo: 'Consultas SQL sobre S3',
    descripcion:
      'Amazon Athena consulta los datos directamente en S3 usando los ' +
      'metadatos del Glue Data Catalog. Ejecuta SQL estándar sin mover los ' +
      'datos; el resultado alimenta los análisis posteriores.',
    cx: 360,
    cy: 240,
  },
  {
    id: NODOS.QUICK,
    etiqueta: 'Amazon Quick',
    subtitulo: 'Análisis y dashboards',
    descripcion:
      'Amazon Quick toma los resultados de las consultas para construir ' +
      'datasets, análisis y dashboards (KPIs, gráficos y filtros). Es la capa ' +
      'de visualización y publicación de la información.',
    cx: 620,
    cy: 160,
  },
  {
    id: NODOS.IAPOL,
    etiqueta: 'IAPOL',
    subtitulo: 'Proceso institucional',
    plano: PLANOS.IAPOL,
    descripcion:
      'IAPOL es el proceso institucional donde se integra el dashboard ' +
      'publicado. Los pasos de integración son explicativos: se describen en ' +
      'la Plataforma, pero no se ejecutan desde ella ni modifican IAPOL.',
    cx: 850,
    cy: 160,
  },
]);

/**
 * Conexiones dirigidas del flujo (R7.1): de un nodo origen a un nodo destino.
 * Se usan para trazar las flechas SVG y para describir el flujo textualmente.
 *
 *   S3 → Glue, S3 → Athena, Glue → Athena, Athena → Quick, Quick → IAPOL
 *
 * @readonly
 * @type {ReadonlyArray<{ desde: string, hasta: string }>}
 */
export const CONEXIONES = Object.freeze([
  { desde: NODOS.S3, hasta: NODOS.GLUE },
  { desde: NODOS.S3, hasta: NODOS.ATHENA },
  { desde: NODOS.GLUE, hasta: NODOS.ATHENA },
  { desde: NODOS.ATHENA, hasta: NODOS.QUICK },
  { desde: NODOS.QUICK, hasta: NODOS.IAPOL },
]);

/** Dimensiones del cuadro de cada nodo dentro del SVG (coordenadas de viewBox). */
const NODO_ANCHO = 150;
const NODO_ALTO = 76;

/** Mapa id → definición de nodo, para búsquedas O(1). */
const NODO_POR_ID = Object.freeze(
  Object.fromEntries(DEFINICION_NODOS.map((n) => [n.id, n])),
);

/**
 * Calcula el punto donde el segmento desde el centro del nodo `nodo` hacia el
 * punto (hx, hy) corta el borde del rectángulo del nodo. Así las flechas salen
 * y entran por el borde de las cajas (no por el centro ni por una circunferencia
 * aproximada), evitando que las líneas se monten sobre los nodos.
 *
 * @param {{cx:number, cy:number}} nodo - Nodo de referencia.
 * @param {number} hx - X del punto objetivo (hacia dónde apunta la salida).
 * @param {number} hy - Y del punto objetivo.
 * @param {number} [pad=6] - Separación extra, en unidades de viewBox.
 * @returns {{x:number, y:number}} Punto sobre el borde del nodo.
 */
function puntoBorde(nodo, hx, hy, pad = 6) {
  const dx = hx - nodo.cx;
  const dy = hy - nodo.cy;
  if (dx === 0 && dy === 0) return { x: nodo.cx, y: nodo.cy };
  const hw = NODO_ANCHO / 2 + pad;
  const hh = NODO_ALTO / 2 + pad;
  // Escala para llegar justo al borde del rectángulo en el eje dominante.
  const escala = 1 / Math.max(Math.abs(dx) / hw, Math.abs(dy) / hh);
  return { x: nodo.cx + dx * escala, y: nodo.cy + dy * escala };
}

/**
 * Traza la conexión entre dos nodos como una curva suave de borde a borde.
 *
 * El punto de control se coloca en el punto medio pero desplazado en vertical
 * cuando los nodos están a distinta altura, de modo que las bifurcaciones
 * (S3→Glue y S3→Athena) se abran con una curva limpia y no en diagonal recta
 * por encima de las cajas.
 *
 * @param {{cx:number, cy:number}} a - Nodo origen.
 * @param {{cx:number, cy:number}} b - Nodo destino.
 * @returns {string} Atributo `d` de un `<path>` SVG.
 */
function trazarConexion(a, b) {
  const ini = puntoBorde(a, b.cx, b.cy);
  const fin = puntoBorde(b, a.cx, a.cy);
  const mx = (ini.x + fin.x) / 2;
  const my = (ini.y + fin.y) / 2;
  // Si hay desnivel vertical, curvamos hacia la horizontal del punto medio
  // (control en la X media, Y del origen) para un trazo tipo "codo suave".
  const hayDesnivel = Math.abs(a.cy - b.cy) > 8;
  const cxp = hayDesnivel ? mx : mx;
  const cyp = hayDesnivel ? ini.y + (fin.y - ini.y) * 0.15 : my;
  return `M ${ini.x} ${ini.y} Q ${cxp} ${cyp} ${fin.x} ${fin.y}`;
}

/**
 * Diagrama interactivo de arquitectura.
 *
 * @param {object} props
 * @param {string} [props.className] - Clases CSS adicionales opcionales.
 * @returns {import('react').ReactElement} El diagrama interactivo.
 */
export default function DiagramaArquitectura({ className = '' }) {
  // Nodo actualmente seleccionado (null = ninguno; se muestra ayuda inicial).
  const [seleccionado, setSeleccionado] = useState(null);
  // Id base único para enlazar botones y panel vía aria-controls (evita colisiones
  // si el diagrama se renderiza más de una vez en la misma página).
  const panelId = useId();

  const nodoSeleccionado =
    seleccionado !== null ? NODO_POR_ID[seleccionado] ?? null : null;

  const clases = ['diagrama-arquitectura', className].filter(Boolean).join(' ');

  return (
    <section className={clases} aria-label="Diagrama de arquitectura de datos">
      <h3 className="diagrama-arquitectura__titulo">
        Flujo del dato: S3 → Glue / Athena → Amazon Quick → IAPOL
      </h3>

      <div className="diagrama-arquitectura__cuerpo">
        <div className="diagrama-arquitectura__lienzo">
          {/* Conexiones SVG decorativas: el flujo también se describe en texto. */}
          <svg
            className="diagrama-arquitectura__conexiones"
            viewBox="0 0 960 320"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
            focusable="false"
          >
            <defs>
              <linearGradient
                id={`${panelId}-flujo`}
                x1="0"
                y1="0"
                x2="1"
                y2="0"
              >
                <stop offset="0%" className="diagrama-arquitectura__grad-ini" />
                <stop offset="100%" className="diagrama-arquitectura__grad-fin" />
              </linearGradient>
              <marker
                id={`${panelId}-flecha`}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="8"
                markerHeight="8"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" className="diagrama-arquitectura__flecha" />
              </marker>
            </defs>
            {CONEXIONES.map(({ desde, hasta }) => {
              const a = NODO_POR_ID[desde];
              const b = NODO_POR_ID[hasta];
              const d = trazarConexion(a, b);
              return (
                <path
                  key={`${desde}-${hasta}`}
                  className="diagrama-arquitectura__linea"
                  d={d}
                  stroke={`url(#${panelId}-flujo)`}
                  markerEnd={`url(#${panelId}-flecha)`}
                />
              );
            })}
          </svg>

          {/* Nodos interactivos: botones posicionados sobre el lienzo. */}
          <ul className="diagrama-arquitectura__nodos">
            {DEFINICION_NODOS.map((nodo) => {
              const activo = seleccionado === nodo.id;
              const estilo = {
                left: `${((nodo.cx - NODO_ANCHO / 2) / 960) * 100}%`,
                top: `${((nodo.cy - NODO_ALTO / 2) / 320) * 100}%`,
                width: `${(NODO_ANCHO / 960) * 100}%`,
                height: `${(NODO_ALTO / 320) * 100}%`,
              };
              return (
                <li
                  key={nodo.id}
                  className="diagrama-arquitectura__nodo-item"
                  style={estilo}
                >
                  <button
                    type="button"
                    className={`diagrama-arquitectura__nodo${
                      activo ? ' diagrama-arquitectura__nodo--activo' : ''
                    }${nodo.plano ? ` diagrama-arquitectura__nodo--${nodo.plano}` : ''}`}
                    aria-pressed={activo}
                    aria-controls={panelId}
                    onClick={() => setSeleccionado(nodo.id)}
                  >
                    <IconoServicioNodo
                      nodoId={nodo.id}
                      size={28}
                      className="diagrama-arquitectura__nodo-icono"
                    />
                    <span className="diagrama-arquitectura__nodo-etiqueta">
                      {nodo.etiqueta}
                    </span>
                    <span className="diagrama-arquitectura__nodo-subtitulo">
                      {nodo.subtitulo}
                    </span>
                    {nodo.plano && (
                      <BadgePlano
                        plano={nodo.plano}
                        className="diagrama-arquitectura__nodo-badge"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Panel de descripción del nodo seleccionado (R7.2). */}
        <aside
          id={panelId}
          className="diagrama-arquitectura__panel"
          aria-live="polite"
        >
          {nodoSeleccionado === null ? (
            <p className="diagrama-arquitectura__panel-ayuda">
              Selecciona un componente del diagrama para ver la descripción de su
              función dentro del flujo de datos.
            </p>
          ) : (
            <div className="diagrama-arquitectura__panel-contenido">
              <div className="diagrama-arquitectura__panel-cabecera">
                <IconoServicioNodo
                  nodoId={nodoSeleccionado.id}
                  size={30}
                  className="diagrama-arquitectura__panel-icono"
                />
                <h4 className="diagrama-arquitectura__panel-titulo">
                  {nodoSeleccionado.etiqueta}
                </h4>
                {nodoSeleccionado.id === NODOS.IAPOL && (
                  <BadgePlano plano={PLANOS.IAPOL} />
                )}
              </div>
              <p className="diagrama-arquitectura__panel-subtitulo">
                {nodoSeleccionado.subtitulo}
              </p>
              <p className="diagrama-arquitectura__panel-descripcion">
                {nodoSeleccionado.descripcion}
              </p>
              {nodoSeleccionado.id === NODOS.IAPOL && (
                <p className="diagrama-arquitectura__panel-nota">
                  <BadgeSimulacion className="diagrama-arquitectura__panel-nota-badge" />
                  Los pasos de integración con IAPOL son explicativos y no se
                  ejecutan desde la Plataforma.
                </p>
              )}
            </div>
          )}
        </aside>
      </div>

      {/* Textos fijos exigidos por R7.3 y R7.4, siempre visibles. */}
      <ul className="diagrama-arquitectura__notas">
        <li className="diagrama-arquitectura__nota">
          AWS Glue Data Catalog registra y describe las tablas, y Amazon Athena
          consulta datos en S3 utilizando esos metadatos.
        </li>
        <li className="diagrama-arquitectura__nota">
          Los pasos de integración con IAPOL son explicativos y no se ejecutan
          desde la Plataforma.
        </li>
      </ul>
    </section>
  );
}
