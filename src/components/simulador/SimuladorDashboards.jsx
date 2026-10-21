/**
 * Simulador educativo de gráficos y dashboards (SimuladorDashboards) — R10, R12.
 *
 * Caparazón del Simulador_Dashboards: permite construir una visualización
 * didáctica sobre el Dataset_Ejemplo (NYC Yellow Taxi, enero 2024) sin ejecutar
 * ninguna operación real contra Amazon Quick ni AWS. Reúne los controles
 * interactivos transversales a las tres hojas de análisis (tarea 11.2):
 *
 *  - Selección de 1 a 3 campos del Dataset_Ejemplo (R10.1), validada con
 *    `validarSeleccionCampos` del dominio.
 *  - Elección del tipo de visualización: KPI, barras, líneas o tabla (R10.2),
 *    renderizada con el Dataset_Ejemplo (R10.3). Barras y líneas usan Recharts.
 *  - Filtro de fecha (desde/hasta) que recalcula y vuelve a renderizar las
 *    visualizaciones al cambiar (R10.4, R12.1, R12.2), mediante `filtrarPorFecha`.
 *  - Estado vacío: cuando el filtro no deja ningún registro, se muestra un
 *    mensaje claro en lugar de una visualización sin datos (R10.5).
 *  - Restablecimiento de filtros que restaura el estado sin filtros, es decir,
 *    el Dataset_Ejemplo completo (R12.3), mediante `resetFiltros`.
 *  - Indicación permanente de Simulación local, aclarando que no reproduce la
 *    interfaz oficial de Amazon Quick ni configura datasets reales (R10.6, R21.4).
 *
 * El recálculo ocurre de forma síncrona en memoria sobre 320 registros, muy por
 * debajo del presupuesto de 1 segundo (R10.3). Se usa `useMemo` para no repetir
 * el filtrado/agregado en cada render.
 *
 * Seguridad (R23.4): todo el contenido es texto plano controlado por el
 * proyecto; NO se usa `dangerouslySetInnerHTML`. No realiza conexiones de red.
 *
 * Requisitos cubiertos: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 12.1, 12.2, 12.3, 21.4.
 */

import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import './SimuladorDashboards.css';
import BadgeSimulacion from '../common/BadgeSimulacion.jsx';
import { META_DATASET, ADVERTENCIA_DATASET } from '../../data/dataset/campos.js';
import { REGISTROS } from '../../data/dataset/registros.js';
import {
  CAMPOS_DATASET,
  MIN_CAMPOS,
  MAX_CAMPOS,
  validarSeleccionCampos,
  estadoInicialFiltros,
  resetFiltros,
} from '../../domain/simulador.js';
import {
  filtrarPorFecha,
  calcularKPIs,
  agruparPor,
} from '../../domain/agregaciones.js';

/**
 * Tipos de visualización disponibles en el simulador (R10.2).
 * @readonly
 * @enum {string}
 */
export const TIPOS_VISUALIZACION = Object.freeze({
  KPI: 'kpi',
  BARRAS: 'barras',
  LINEAS: 'lineas',
  TABLA: 'tabla',
});

/**
 * Etiquetas visibles de cada tipo de visualización.
 * @type {Readonly<Record<string, string>>}
 */
export const ETIQUETAS_VISUALIZACION = Object.freeze({
  [TIPOS_VISUALIZACION.KPI]: 'KPI',
  [TIPOS_VISUALIZACION.BARRAS]: 'Barras',
  [TIPOS_VISUALIZACION.LINEAS]: 'Líneas',
  [TIPOS_VISUALIZACION.TABLA]: 'Tabla',
});

/**
 * Guía didáctica de cada tipo de visualización (R10.2): para qué sirve, cuándo
 * conviene usarla y un ejemplo aplicado al Dataset_Ejemplo. Se muestra junto al
 * selector de tipo para que las personas participantes entiendan la diferencia
 * entre los gráficos y qué pregunta responde cada uno.
 *
 * @type {Readonly<Record<string, {
 *   icono: string,
 *   resumen: string,
 *   cuando: string,
 *   ejemplo: string,
 * }>>}
 */
export const GUIA_VISUALIZACION = Object.freeze({
  [TIPOS_VISUALIZACION.KPI]: Object.freeze({
    icono: '▣',
    resumen:
      'Resume el conjunto en una sola cifra por indicador (total de viajes, ' +
      'importe total y distancia media).',
    cuando:
      'Úsalo para responder "¿cuánto en total?" de un vistazo, sin detalle por ' +
      'categoría ni evolución en el tiempo.',
    ejemplo:
      'Ejemplo: ver el importe total y la distancia media de todos los viajes ' +
      'del rango de fechas elegido.',
  }),
  [TIPOS_VISUALIZACION.BARRAS]: Object.freeze({
    icono: '▊',
    resumen:
      'Compara cantidades entre categorías: una barra por cada valor del ' +
      'primer campo seleccionado.',
    cuando:
      'Úsalo para comparar grupos (categorías) entre sí, por ejemplo cuál ' +
      'aparece más y cuál menos.',
    ejemplo:
      'Ejemplo: con el campo payment_type, comparar cuántos viajes se pagan ' +
      'con cada medio de pago.',
  }),
  [TIPOS_VISUALIZACION.LINEAS]: Object.freeze({
    icono: '╱',
    resumen:
      'Muestra la evolución de un valor a lo largo de una secuencia (tendencia).',
    cuando:
      'Úsalo cuando el primer campo tiene un orden natural (fechas, horas, ' +
      'número de pasajeros) y quieres ver subidas y bajadas.',
    ejemplo:
      'Ejemplo: con un campo temporal, observar cómo cambia la cantidad de ' +
      'viajes día a día.',
  }),
  [TIPOS_VISUALIZACION.TABLA]: Object.freeze({
    icono: '▤',
    resumen:
      'Lista los registros con los campos seleccionados como columnas, sin ' +
      'agregarlos.',
    cuando:
      'Úsala para inspeccionar los datos fila por fila o verificar valores ' +
      'concretos antes de graficarlos.',
    ejemplo:
      'Ejemplo: revisar las primeras filas con payment_type y total_amount ' +
      'para confirmar que los datos tienen sentido.',
  }),
});

/**
 * Formatea un número para mostrarlo con separadores locales y hasta 2 decimales.
 *
 * @param {number} valor - Valor numérico a formatear.
 * @returns {string} Representación legible del número.
 */
function formatearNumero(valor) {
  const n = Number(valor);
  if (!Number.isFinite(n)) return '0';
  return n.toLocaleString('es-ES', { maximumFractionDigits: 2 });
}

/**
 * Convierte la clave de un grupo a una etiqueta de eje/celda en texto.
 *
 * @param {unknown} clave - Clave del grupo (valor del campo agrupado).
 * @returns {string} Etiqueta en texto plano.
 */
function etiquetaClave(clave) {
  if (clave === null || clave === undefined || clave === '') {
    return '(sin valor)';
  }
  return String(clave);
}

/**
 * Tarjeta de KPI con un título y un valor agregado (R10.2: tipo KPI).
 *
 * @param {object} props
 * @param {string} props.titulo - Nombre del indicador.
 * @param {string} props.valor - Valor ya formateado del indicador.
 * @returns {import('react').ReactElement}
 */
function TarjetaKPI({ titulo, valor }) {
  return (
    <div className="simulador__kpi" role="group" aria-label={titulo}>
      <span className="simulador__kpi-valor">{valor}</span>
      <span className="simulador__kpi-titulo">{titulo}</span>
    </div>
  );
}

/**
 * Visualización KPI: muestra los indicadores agregados del conjunto filtrado.
 *
 * @param {object} props
 * @param {Array<object>} props.filas - Registros filtrados a resumir.
 * @returns {import('react').ReactElement}
 */
function VizKPI({ filas }) {
  const { totalViajes, importeTotal, distanciaMedia } = calcularKPIs(filas);
  return (
    <div className="simulador__kpis">
      <TarjetaKPI titulo="Total de viajes" valor={formatearNumero(totalViajes)} />
      <TarjetaKPI
        titulo="Importe total (USD)"
        valor={formatearNumero(importeTotal)}
      />
      <TarjetaKPI
        titulo="Distancia media (millas)"
        valor={formatearNumero(distanciaMedia)}
      />
    </div>
  );
}

/**
 * Visualización de barras con Recharts, agrupando por el primer campo elegido.
 *
 * @param {object} props
 * @param {Array<{ clave: string, valor: number }>} props.datos - Datos agregados.
 * @param {string} props.campo - Nombre del campo representado.
 * @returns {import('react').ReactElement}
 */
function VizBarras({ datos, campo }) {
  return (
    <div className="simulador__grafico" data-testid="viz-barras">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={datos}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="clave" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="valor" name={campo} fill="#0b4a8a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Visualización de líneas con Recharts, agrupando por el primer campo elegido.
 *
 * @param {object} props
 * @param {Array<{ clave: string, valor: number }>} props.datos - Datos agregados.
 * @param {string} props.campo - Nombre del campo representado.
 * @returns {import('react').ReactElement}
 */
function VizLineas({ datos, campo }) {
  return (
    <div className="simulador__grafico" data-testid="viz-lineas">
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={datos}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="clave" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="valor"
            name={campo}
            stroke="#0b4a8a"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Visualización de tabla: muestra los campos seleccionados fila por fila.
 *
 * @param {object} props
 * @param {Array<object>} props.filas - Registros filtrados a listar.
 * @param {string[]} props.campos - Campos seleccionados (columnas).
 * @returns {import('react').ReactElement}
 */
function VizTabla({ filas, campos }) {
  // Se limita la cantidad de filas mostradas para mantener la tabla legible;
  // los KPIs siguen reflejando el conjunto completo filtrado.
  const MAX_FILAS = 50;
  const visibles = filas.slice(0, MAX_FILAS);

  return (
    <div className="simulador__tabla-contenedor" data-testid="viz-tabla">
      <table className="simulador__tabla">
        <thead>
          <tr>
            {campos.map((campo) => (
              <th key={campo} scope="col">
                {campo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibles.map((fila, i) => (
            <tr key={i}>
              {campos.map((campo) => (
                <td key={campo}>{etiquetaClave(fila?.[campo])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {filas.length > MAX_FILAS ? (
        <p className="simulador__tabla-nota">
          Mostrando {MAX_FILAS} de {formatearNumero(filas.length)} registros
          filtrados.
        </p>
      ) : null}
    </div>
  );
}

/**
 * Caparazón del Simulador_Dashboards.
 *
 * @param {object} [props]
 * @param {Array<object>} [props.registros=REGISTROS] - Conjunto base de registros
 *        (inyectable para pruebas). Por defecto, el Dataset_Ejemplo completo.
 * @param {string} [props.className] - Clases CSS adicionales opcionales.
 * @returns {import('react').ReactElement}
 */
export default function SimuladorDashboards({
  registros = REGISTROS,
  className = '',
}) {
  // Campos seleccionados para la visualización (1–3). Inicia con un campo útil.
  const [campos, setCampos] = useState(['payment_type']);
  // Tipo de visualización actual (R10.2).
  const [tipo, setTipo] = useState(TIPOS_VISUALIZACION.KPI);
  // Estado de filtros de fecha (R12.1): { desde, hasta }. "Sin filtros" = nulls.
  const [filtros, setFiltros] = useState(estadoInicialFiltros());

  // Validación de la selección de campos (R10.1).
  const validacion = useMemo(() => validarSeleccionCampos(campos), [campos]);

  // Conjunto filtrado por fecha; se recalcula al cambiar registros o filtros
  // (R10.4, R12.2). Operación síncrona y barata (≤1 s, R10.3).
  const filas = useMemo(
    () => filtrarPorFecha(registros, filtros.desde, filtros.hasta),
    [registros, filtros.desde, filtros.hasta],
  );

  // El campo "primario" define el eje/agrupación de barras y líneas.
  const campoPrimario = campos[0];

  // Datos agregados para barras/líneas: conteo de registros por valor del campo
  // primario. Se recalcula con el conjunto filtrado.
  const datosAgrupados = useMemo(
    () => agruparPor(filas, campoPrimario, 'count'),
    [filas, campoPrimario],
  );

  const hayRegistros = filas.length > 0;
  const tieneFiltro = filtros.desde !== null || filtros.hasta !== null;

  // Descripción legible del rango de fechas aplicado, para el resumen didáctico.
  const descripcionFiltro = tieneFiltro
    ? `del ${filtros.desde ?? 'inicio'} al ${filtros.hasta ?? 'final'}`
    : 'sin filtro de fecha (dataset completo)';

  /**
   * Alterna la pertenencia de un campo a la selección, respetando el máximo de
   * {@link MAX_CAMPOS} y el mínimo de {@link MIN_CAMPOS} campos (R10.1).
   *
   * @param {string} campo - Campo a agregar o quitar.
   */
  function alternarCampo(campo) {
    setCampos((actuales) => {
      if (actuales.includes(campo)) {
        // No permitir quedar por debajo del mínimo.
        if (actuales.length <= MIN_CAMPOS) return actuales;
        return actuales.filter((c) => c !== campo);
      }
      // No permitir superar el máximo.
      if (actuales.length >= MAX_CAMPOS) return actuales;
      return [...actuales, campo];
    });
  }

  /**
   * Actualiza un extremo del filtro de fecha (R12.1/R12.2). Un valor vacío se
   * normaliza a `null` (sin límite en ese extremo).
   *
   * @param {'desde' | 'hasta'} extremo - Extremo del rango a modificar.
   * @param {string} valor - Valor del control de fecha.
   */
  function cambiarFiltro(extremo, valor) {
    setFiltros((actuales) => ({
      ...actuales,
      [extremo]: valor ? valor : null,
    }));
  }

  /**
   * Restablece los filtros al estado sin filtros (R12.3), restaurando la vista
   * al Dataset_Ejemplo completo.
   */
  function restablecer() {
    setFiltros(resetFiltros());
  }

  const clases = ['simulador', className].filter(Boolean).join(' ');

  return (
    <section className={clases} aria-label="Simulador de gráficos y dashboards">
      <header className="simulador__encabezado">
        <div className="simulador__encabezado-fila">
          <h2 className="simulador__titulo">
            Simulador de gráficos y dashboards
          </h2>
          <BadgeSimulacion />
        </div>
        <p className="simulador__subtitulo">
          Construya una visualización didáctica sobre el {META_DATASET.titulo}{' '}
          ({META_DATASET.periodo}).
        </p>
        {/* Indicación permanente de Simulación local (R10.6, R21.4). */}
        <p className="simulador__aviso-simulacion" role="note">
          Simulación local: esta vista es una recreación educativa y no
          reproduce la interfaz oficial de Amazon Quick ni configura datasets
          reales. No ejecuta operaciones en AWS.
        </p>
      </header>

      <div className="simulador__controles">
        {/* Selección de 1–3 campos (R10.1). */}
        <fieldset className="simulador__grupo">
          <legend className="simulador__grupo-titulo">
            Campos del dataset (entre {MIN_CAMPOS} y {MAX_CAMPOS})
          </legend>
          <div className="simulador__campos">
            {CAMPOS_DATASET.map((campo) => {
              const marcado = campos.includes(campo);
              const deshabilitado =
                (!marcado && campos.length >= MAX_CAMPOS) ||
                (marcado && campos.length <= MIN_CAMPOS);
              return (
                <label key={campo} className="simulador__campo">
                  <input
                    type="checkbox"
                    name="campo-dataset"
                    value={campo}
                    checked={marcado}
                    disabled={deshabilitado}
                    onChange={() => alternarCampo(campo)}
                  />
                  <span>{campo}</span>
                </label>
              );
            })}
          </div>
          {!validacion.ok ? (
            <p className="simulador__error" role="alert">
              {validacion.error}
            </p>
          ) : null}
        </fieldset>

        {/* Tipo de visualización (R10.2). */}
        <fieldset className="simulador__grupo">
          <legend className="simulador__grupo-titulo">
            Tipo de visualización
          </legend>
          <div className="simulador__tipos">
            {Object.values(TIPOS_VISUALIZACION).map((valor) => (
              <label key={valor} className="simulador__tipo">
                <input
                  type="radio"
                  name="tipo-visualizacion"
                  value={valor}
                  checked={tipo === valor}
                  onChange={() => setTipo(valor)}
                />
                <span aria-hidden="true" className="simulador__tipo-icono">
                  {GUIA_VISUALIZACION[valor].icono}
                </span>
                <span>{ETIQUETAS_VISUALIZACION[valor]}</span>
              </label>
            ))}
          </div>
          {/* Explicación didáctica del tipo seleccionado (R10.2). */}
          <div className="simulador__guia" aria-live="polite">
            <p className="simulador__guia-titulo">
              {ETIQUETAS_VISUALIZACION[tipo]}: {GUIA_VISUALIZACION[tipo].resumen}
            </p>
            <p className="simulador__guia-cuando">
              <strong>Cuándo usarlo:</strong> {GUIA_VISUALIZACION[tipo].cuando}
            </p>
            <p className="simulador__guia-ejemplo">
              {GUIA_VISUALIZACION[tipo].ejemplo}
            </p>
          </div>
        </fieldset>

        {/* Filtro de fecha y restablecimiento (R12.1, R12.3). */}
        <fieldset className="simulador__grupo">
          <legend className="simulador__grupo-titulo">Filtro de fecha</legend>
          <div className="simulador__fechas">
            <label className="simulador__fecha">
              <span>Desde</span>
              <input
                type="date"
                name="filtro-desde"
                value={filtros.desde ?? ''}
                onChange={(e) => cambiarFiltro('desde', e.target.value)}
              />
            </label>
            <label className="simulador__fecha">
              <span>Hasta</span>
              <input
                type="date"
                name="filtro-hasta"
                value={filtros.hasta ?? ''}
                onChange={(e) => cambiarFiltro('hasta', e.target.value)}
              />
            </label>
            <button
              type="button"
              className="simulador__reset"
              onClick={restablecer}
              disabled={!tieneFiltro}
            >
              Restablecer filtros
            </button>
          </div>
        </fieldset>
      </div>

      <div className="simulador__resultado">
        {!hayRegistros ? (
          // Estado vacío cuando el filtro no produce registros (R10.5): se
          // muestra un mensaje claro en lugar de una visualización sin datos.
          <p className="simulador__vacio" role="status">
            El filtro aplicado no deja ningún registro del Dataset_Ejemplo.
            Ajuste el rango de fechas o restablezca los filtros para volver al
            conjunto completo.
          </p>
        ) : !validacion.ok ? (
          // Sin una selección de campos válida no se puede construir la viz.
          <p className="simulador__vacio" role="status">
            Seleccione entre {MIN_CAMPOS} y {MAX_CAMPOS} campos para construir la
            visualización.
          </p>
        ) : (
          <>
            {/* Resumen didáctico: hace explícito qué se está mostrando y cómo
                cambia al tocar campos, tipo o filtro (R12.1, R12.2). */}
            <p className="simulador__resumen" aria-live="polite">
              Mostrando <strong>{ETIQUETAS_VISUALIZACION[tipo]}</strong> sobre{' '}
              <strong>{formatearNumero(filas.length)}</strong> registros (
              {descripcionFiltro}). Campos: <strong>{campos.join(', ')}</strong>.
              {tipo === TIPOS_VISUALIZACION.BARRAS ||
              tipo === TIPOS_VISUALIZACION.LINEAS
                ? ` Se agrupa por "${campoPrimario}" (el primer campo).`
                : ''}
            </p>
            {tipo === TIPOS_VISUALIZACION.KPI ? (
              <VizKPI filas={filas} />
            ) : null}
            {tipo === TIPOS_VISUALIZACION.BARRAS ? (
              <VizBarras datos={datosAgrupados} campo={campoPrimario} />
            ) : null}
            {tipo === TIPOS_VISUALIZACION.LINEAS ? (
              <VizLineas datos={datosAgrupados} campo={campoPrimario} />
            ) : null}
            {tipo === TIPOS_VISUALIZACION.TABLA ? (
              <VizTabla filas={filas} campos={campos} />
            ) : null}
          </>
        )}
      </div>

      {/* Advertencia permanente sobre el dataset de ejemplo y los filtros
          (R20.4): la población analizada cambia con el filtro. */}
      <p className="simulador__advertencia" role="note">
        {ADVERTENCIA_DATASET}
      </p>
    </section>
  );
}
