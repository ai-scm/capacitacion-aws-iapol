/**
 * Las tres hojas de análisis del Simulador_Dashboards (HojaAnalisis) — R11.
 *
 * Presenta las tres Hoja_Analisis del caso práctico NYC Yellow Taxi sobre el
 * Dataset_Ejemplo, seleccionables mediante un control segmentado (pestañas):
 *
 *  - "Resumen ejecutivo" (R11.3): KPI de total de viajes, KPI de importe total
 *    y un gráfico de barras por método de pago (`payment_type`).
 *  - "Análisis detallado" (R11.4): una tabla con fecha, pasajeros e importe y
 *    una medida de distancia media.
 *  - "Tendencias" (R11.5): una visualización de viajes por día (agrupando por
 *    fecha) y una distribución por hora de recogida (agrupando por la hora de
 *    `tpep_pickup_datetime`).
 *
 * El componente acepta `registros` como prop (por defecto el Dataset_Ejemplo
 * completo) y un filtro de fecha opcional (`filtros = { desde, hasta }`), de
 * modo que compone con el Simulador_Dashboards. El contenido de cada hoja se
 * deriva SIEMPRE de los datos (no hay texto fijo que sustituya a la
 * visualización): al cambiar de hoja (R11.2) se recalculan y muestran las
 * visualizaciones de esa hoja. Si el conjunto filtrado queda vacío se muestra
 * un estado vacío en lugar de visualizaciones sin datos (coherente con R10.5).
 *
 * Todas las agregaciones usan la capa de dominio pura (`calcularKPIs`,
 * `agruparPor`, `filtrarPorFecha`), por lo que la estructura (KPIs, tabla,
 * nombres de hoja, estado vacío) es verificable sin depender de píxeles de los
 * gráficos: en las pruebas se pueden mockear `BarChart`/`LineChart` de Recharts.
 *
 * Seguridad (R23.4): todo el contenido es texto plano controlado por el
 * proyecto; NO se usa `dangerouslySetInnerHTML` ni se realizan conexiones.
 *
 * Requisitos cubiertos: 11.1, 11.2, 11.3, 11.4, 11.5.
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

import './HojaAnalisis.css';
import { LEYENDA_PAYMENT_TYPE } from '../../data/dataset/campos.js';
import { REGISTROS } from '../../data/dataset/registros.js';
import {
  filtrarPorFecha,
  calcularKPIs,
  agruparPor,
} from '../../domain/agregaciones.js';

/**
 * Identificadores internos de cada hoja de análisis.
 * @readonly
 * @enum {string}
 */
export const HOJAS = Object.freeze({
  RESUMEN: 'resumen',
  DETALLE: 'detalle',
  TENDENCIAS: 'tendencias',
});

/**
 * Nombres visibles EXACTOS de las tres Hoja_Analisis (R11.1).
 *
 * Se usan tanto en el control de selección como en el encabezado de cada hoja,
 * y son el texto accesible que las pruebas pueden afirmar.
 *
 * @type {Readonly<Record<string, string>>}
 */
export const NOMBRES_HOJA = Object.freeze({
  [HOJAS.RESUMEN]: 'Resumen ejecutivo',
  [HOJAS.DETALLE]: 'Análisis detallado',
  [HOJAS.TENDENCIAS]: 'Tendencias',
});

/** Orden de presentación de las hojas en el control segmentado. */
const ORDEN_HOJAS = Object.freeze([
  HOJAS.RESUMEN,
  HOJAS.DETALLE,
  HOJAS.TENDENCIAS,
]);

/** Cantidad máxima de filas mostradas en la tabla de análisis detallado. */
const MAX_FILAS_TABLA = 50;

/**
 * Formatea un número con separadores locales y hasta 2 decimales.
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
 * Etiqueta legible de un `payment_type` según la leyenda del Dataset_Ejemplo.
 *
 * Si el código no está en la leyenda, se muestra "Código N" para no ocultar
 * datos inesperados.
 *
 * @param {unknown} codigo - Código de método de pago.
 * @returns {string} Etiqueta del método de pago.
 */
function etiquetaMetodoPago(codigo) {
  const entrada = LEYENDA_PAYMENT_TYPE.find((e) => e.codigo === Number(codigo));
  if (entrada) return entrada.etiqueta;
  if (codigo === null || codigo === undefined || codigo === '') {
    return '(sin valor)';
  }
  return `Código ${String(codigo)}`;
}

/**
 * Extrae la fecha (YYYY-MM-DD) de un `tpep_pickup_datetime` ISO 8601.
 *
 * @param {unknown} valor - Fecha/hora de recogida.
 * @returns {string} La parte de fecha, o cadena vacía si no es válida.
 */
function soloFecha(valor) {
  if (typeof valor !== 'string' || valor.length < 10) return '';
  return valor.slice(0, 10);
}

/**
 * Extrae la hora de recogida (0–23) de un `tpep_pickup_datetime` ISO 8601.
 *
 * @param {unknown} valor - Fecha/hora de recogida.
 * @returns {number | null} La hora entera [0,23], o `null` si no es válida.
 */
function soloHora(valor) {
  if (typeof valor !== 'string') return null;
  const match = /T(\d{2}):/.exec(valor);
  if (!match) return null;
  const hora = Number(match[1]);
  return Number.isInteger(hora) && hora >= 0 && hora <= 23 ? hora : null;
}

/**
 * Tarjeta de KPI con título y valor agregado (R11.3).
 *
 * @param {object} props
 * @param {string} props.titulo - Nombre del indicador.
 * @param {string} props.valor - Valor ya formateado del indicador.
 * @returns {import('react').ReactElement}
 */
function TarjetaKPI({ titulo, valor }) {
  return (
    <div className="hoja__kpi" role="group" aria-label={titulo}>
      <span className="hoja__kpi-valor">{valor}</span>
      <span className="hoja__kpi-titulo">{titulo}</span>
    </div>
  );
}

/**
 * Gráfico de barras genérico (Recharts) sobre datos ya agregados.
 *
 * @param {object} props
 * @param {Array<{ clave: string, valor: number }>} props.datos - Datos agregados.
 * @param {string} props.nombre - Nombre de la serie (leyenda/tooltip).
 * @param {string} props.testid - `data-testid` para pruebas.
 * @returns {import('react').ReactElement}
 */
function GraficoBarras({ datos, nombre, testid }) {
  return (
    <div className="hoja__grafico" data-testid={testid}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={datos}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="clave" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="valor" name={nombre} fill="#0b4a8a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Gráfico de líneas genérico (Recharts) sobre datos ya agregados.
 *
 * @param {object} props
 * @param {Array<{ clave: string, valor: number }>} props.datos - Datos agregados.
 * @param {string} props.nombre - Nombre de la serie (leyenda/tooltip).
 * @param {string} props.testid - `data-testid` para pruebas.
 * @returns {import('react').ReactElement}
 */
function GraficoLineas({ datos, nombre, testid }) {
  return (
    <div className="hoja__grafico" data-testid={testid}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={datos}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="clave" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="valor"
            name={nombre}
            stroke="#0b4a8a"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Hoja "Resumen ejecutivo" (R11.3): KPIs de total de viajes e importe total y
 * un gráfico de barras por método de pago.
 *
 * @param {object} props
 * @param {Array<object>} props.filas - Registros filtrados.
 * @returns {import('react').ReactElement}
 */
function HojaResumen({ filas }) {
  const { totalViajes, importeTotal } = useMemo(
    () => calcularKPIs(filas),
    [filas],
  );

  // Barras por método de pago: conteo de viajes por cada código de payment_type,
  // con etiqueta legible de la leyenda del dataset.
  const datosPago = useMemo(() => {
    const grupos = agruparPor(filas, 'payment_type', 'count');
    return grupos.map((g) => ({
      clave: etiquetaMetodoPago(g.clave),
      valor: g.valor,
    }));
  }, [filas]);

  return (
    <div className="hoja__contenido">
      <div className="hoja__kpis">
        <TarjetaKPI
          titulo="Total de viajes"
          valor={formatearNumero(totalViajes)}
        />
        <TarjetaKPI
          titulo="Importe total (USD)"
          valor={formatearNumero(importeTotal)}
        />
      </div>
      <section className="hoja__bloque" aria-label="Viajes por método de pago">
        <h4 className="hoja__bloque-titulo">Viajes por método de pago</h4>
        <GraficoBarras
          datos={datosPago}
          nombre="Viajes"
          testid="hoja-barras-metodo-pago"
        />
      </section>
    </div>
  );
}

/**
 * Hoja "Análisis detallado" (R11.4): tabla con fecha, pasajeros e importe, más
 * una medida de distancia media.
 *
 * @param {object} props
 * @param {Array<object>} props.filas - Registros filtrados.
 * @returns {import('react').ReactElement}
 */
function HojaDetalle({ filas }) {
  const { distanciaMedia } = useMemo(() => calcularKPIs(filas), [filas]);
  const visibles = useMemo(
    () => filas.slice(0, MAX_FILAS_TABLA),
    [filas],
  );

  return (
    <div className="hoja__contenido">
      <div className="hoja__kpis">
        <TarjetaKPI
          titulo="Distancia media (millas)"
          valor={formatearNumero(distanciaMedia)}
        />
      </div>
      <section className="hoja__bloque" aria-label="Detalle de viajes">
        <h4 className="hoja__bloque-titulo">Detalle de viajes</h4>
        <div className="hoja__tabla-contenedor">
          <table className="hoja__tabla">
            <thead>
              <tr>
                <th scope="col">Fecha</th>
                <th scope="col">Pasajeros</th>
                <th scope="col">Importe (USD)</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((fila, i) => (
                <tr key={i}>
                  <td>{soloFecha(fila?.tpep_pickup_datetime) || '(sin valor)'}</td>
                  <td>{formatearNumero(fila?.passenger_count)}</td>
                  <td>{formatearNumero(fila?.total_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filas.length > MAX_FILAS_TABLA ? (
          <p className="hoja__nota">
            Mostrando {MAX_FILAS_TABLA} de {formatearNumero(filas.length)}{' '}
            registros filtrados. La distancia media considera el conjunto
            completo filtrado.
          </p>
        ) : null}
      </section>
    </div>
  );
}

/**
 * Hoja "Tendencias" (R11.5): viajes por día (agrupando por fecha) y
 * distribución por hora de recogida (agrupando por la hora de recogida).
 *
 * @param {object} props
 * @param {Array<object>} props.filas - Registros filtrados.
 * @returns {import('react').ReactElement}
 */
function HojaTendencias({ filas }) {
  // Viajes por día: conteo por fecha (YYYY-MM-DD), ordenado cronológicamente.
  const datosPorDia = useMemo(() => {
    const conFecha = filas.map((fila) => ({
      fecha: soloFecha(fila?.tpep_pickup_datetime),
    }));
    const grupos = agruparPor(conFecha, 'fecha', 'count');
    return grupos
      .filter((g) => g.clave !== '')
      .sort((a, b) => String(a.clave).localeCompare(String(b.clave)))
      .map((g) => ({ clave: g.clave, valor: g.valor }));
  }, [filas]);

  // Distribución por hora de recogida: conteo por hora [0,23], ordenado.
  const datosPorHora = useMemo(() => {
    const conHora = filas
      .map((fila) => ({ hora: soloHora(fila?.tpep_pickup_datetime) }))
      .filter((f) => f.hora !== null);
    const grupos = agruparPor(conHora, 'hora', 'count');
    return grupos
      .sort((a, b) => Number(a.clave) - Number(b.clave))
      .map((g) => ({ clave: `${String(g.clave).padStart(2, '0')}:00`, valor: g.valor }));
  }, [filas]);

  return (
    <div className="hoja__contenido">
      <section className="hoja__bloque" aria-label="Viajes por día">
        <h4 className="hoja__bloque-titulo">Viajes por día</h4>
        <GraficoLineas
          datos={datosPorDia}
          nombre="Viajes por día"
          testid="hoja-lineas-por-dia"
        />
      </section>
      <section
        className="hoja__bloque"
        aria-label="Distribución por hora de recogida"
      >
        <h4 className="hoja__bloque-titulo">
          Distribución por hora de recogida
        </h4>
        <GraficoBarras
          datos={datosPorHora}
          nombre="Viajes por hora"
          testid="hoja-barras-por-hora"
        />
      </section>
    </div>
  );
}

/**
 * Las tres hojas de análisis del Simulador_Dashboards.
 *
 * @param {object} [props]
 * @param {Array<object>} [props.registros=REGISTROS] - Conjunto base de
 *        registros (inyectable para pruebas). Por defecto, el Dataset_Ejemplo.
 * @param {{ desde?: (string|null), hasta?: (string|null) }} [props.filtros] -
 *        Filtro de fecha opcional para componer con el Simulador_Dashboards.
 * @param {string} [props.hojaInicial=HOJAS.RESUMEN] - Hoja activa inicial.
 * @param {string} [props.className] - Clases CSS adicionales opcionales.
 * @returns {import('react').ReactElement}
 */
export default function HojaAnalisis({
  registros = REGISTROS,
  filtros = { desde: null, hasta: null },
  hojaInicial = HOJAS.RESUMEN,
  className = '',
}) {
  // Hoja de análisis actualmente seleccionada (R11.2).
  const [hojaActiva, setHojaActiva] = useState(
    ORDEN_HOJAS.includes(hojaInicial) ? hojaInicial : HOJAS.RESUMEN,
  );

  // Conjunto filtrado por fecha; se recalcula al cambiar registros o filtros.
  const filas = useMemo(
    () => filtrarPorFecha(registros, filtros?.desde, filtros?.hasta),
    [registros, filtros?.desde, filtros?.hasta],
  );

  const hayRegistros = filas.length > 0;
  const clases = ['hoja-analisis', className].filter(Boolean).join(' ');

  return (
    <section className={clases} aria-label="Hojas de análisis">
      {/* Control segmentado para seleccionar la hoja (R11.1, R11.2). */}
      <div className="hoja__pestanas" role="tablist" aria-label="Hojas de análisis">
        {ORDEN_HOJAS.map((hoja) => {
          const activa = hoja === hojaActiva;
          return (
            <button
              key={hoja}
              type="button"
              role="tab"
              id={`hoja-tab-${hoja}`}
              aria-selected={activa}
              aria-controls={`hoja-panel-${hoja}`}
              className={
                activa ? 'hoja__pestana hoja__pestana--activa' : 'hoja__pestana'
              }
              onClick={() => setHojaActiva(hoja)}
            >
              {NOMBRES_HOJA[hoja]}
            </button>
          );
        })}
      </div>

      <div
        className="hoja__panel"
        role="tabpanel"
        id={`hoja-panel-${hojaActiva}`}
        aria-labelledby={`hoja-tab-${hojaActiva}`}
      >
        <h3 className="hoja__titulo">{NOMBRES_HOJA[hojaActiva]}</h3>

        {!hayRegistros ? (
          // Estado vacío cuando el filtro no deja registros: se muestra un
          // mensaje claro en lugar de visualizaciones sin datos (coherente R10.5).
          <p className="hoja__vacio" role="status">
            El filtro aplicado no deja ningún registro del Dataset_Ejemplo.
            Ajuste el rango de fechas o restablezca los filtros para volver al
            conjunto completo.
          </p>
        ) : (
          <>
            {hojaActiva === HOJAS.RESUMEN ? (
              <HojaResumen filas={filas} />
            ) : null}
            {hojaActiva === HOJAS.DETALLE ? (
              <HojaDetalle filas={filas} />
            ) : null}
            {hojaActiva === HOJAS.TENDENCIAS ? (
              <HojaTendencias filas={filas} />
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
