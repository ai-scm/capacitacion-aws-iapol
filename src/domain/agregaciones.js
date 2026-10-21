/**
 * Motor de agregaciones, KPIs y filtro de fecha (lógica pura).
 *
 * Opera sobre registros del Dataset_Ejemplo (NYC Yellow Taxi) con la forma
 * `RegistroViaje`:
 *   {
 *     tpep_pickup_datetime: ISOString,  // fecha/hora de inicio del viaje
 *     payment_type: number,             // tipo de pago codificado
 *     passenger_count: number,          // cantidad de pasajeros
 *     trip_distance: number,            // distancia del viaje
 *     total_amount: number              // importe total
 *   }
 *
 * Todas las funciones son puras: no mutan sus argumentos ni mantienen estado.
 *
 * Requisitos cubiertos: 10.4, 10.5, 12.2.
 * Property 9: El filtro de fecha acota los datos al rango.
 */

/**
 * Convierte un valor de fecha (ISOString, Date o timestamp numérico) a su
 * representación en milisegundos desde época.
 *
 * @param {string | number | Date | null | undefined} valor - Fecha de entrada.
 * @returns {number} Milisegundos desde época, o `NaN` si no es una fecha válida.
 */
function aMilisegundos(valor) {
  if (valor === null || valor === undefined) return NaN;
  if (valor instanceof Date) return valor.getTime();
  if (typeof valor === 'number') return valor;
  return new Date(valor).getTime();
}

/**
 * Filtra las filas cuyo `tpep_pickup_datetime` cae dentro del rango cerrado
 * `[desde, hasta]`.
 *
 * Los límites `desde`/`hasta` son opcionales: si `desde` es nulo/indefinido no
 * se aplica límite inferior y si `hasta` es nulo/indefinido no se aplica límite
 * superior. Cuando el rango no intersecta ningún registro, el resultado es un
 * arreglo vacío (estado vacío). Las filas con fecha inválida se excluyen.
 *
 * @param {Array<object>} filas - Registros del Dataset_Ejemplo.
 * @param {string | number | Date | null | undefined} desde - Límite inferior inclusivo.
 * @param {string | number | Date | null | undefined} hasta - Límite superior inclusivo.
 * @returns {Array<object>} Subconjunto de filas dentro del rango.
 */
export function filtrarPorFecha(filas, desde, hasta) {
  if (!Array.isArray(filas)) return [];

  const desdeMs = aMilisegundos(desde);
  const hastaMs = aMilisegundos(hasta);
  const tieneDesde = !Number.isNaN(desdeMs);
  const tieneHasta = !Number.isNaN(hastaMs);

  return filas.filter((fila) => {
    const fechaMs = aMilisegundos(fila?.tpep_pickup_datetime);
    if (Number.isNaN(fechaMs)) return false;
    if (tieneDesde && fechaMs < desdeMs) return false;
    if (tieneHasta && fechaMs > hastaMs) return false;
    return true;
  });
}

/**
 * Convierte un valor a número finito; devuelve `0` para valores no numéricos.
 *
 * @param {unknown} valor - Valor a normalizar.
 * @returns {number} El número finito, o `0` si no es convertible.
 */
function aNumero(valor) {
  const n = Number(valor);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Calcula los KPIs sobre el subconjunto de filas provisto.
 *
 * - `totalViajes`: cantidad de filas (conteo).
 * - `importeTotal`: suma de `total_amount`.
 * - `distanciaMedia`: promedio de `trip_distance` (0 si el conjunto es vacío).
 *
 * @param {Array<object>} filas - Registros sobre los que calcular los KPIs.
 * @returns {{ totalViajes: number, importeTotal: number, distanciaMedia: number }}
 */
export function calcularKPIs(filas) {
  if (!Array.isArray(filas) || filas.length === 0) {
    return { totalViajes: 0, importeTotal: 0, distanciaMedia: 0 };
  }

  const totalViajes = filas.length;
  const importeTotal = filas.reduce(
    (acc, fila) => acc + aNumero(fila?.total_amount),
    0,
  );
  const distanciaTotal = filas.reduce(
    (acc, fila) => acc + aNumero(fila?.trip_distance),
    0,
  );
  const distanciaMedia = distanciaTotal / totalViajes;

  return { totalViajes, importeTotal, distanciaMedia };
}

/**
 * Aplica una agregación a una lista de valores numéricos.
 *
 * @param {number[]} valores - Valores a agregar.
 * @param {'count' | 'sum' | 'avg'} agregacion - Tipo de agregación.
 * @returns {number} El valor agregado (0 para lista vacía en `sum`/`avg`).
 */
function aplicarAgregacion(valores, agregacion) {
  switch (agregacion) {
    case 'count':
      return valores.length;
    case 'avg': {
      if (valores.length === 0) return 0;
      const suma = valores.reduce((acc, v) => acc + v, 0);
      return suma / valores.length;
    }
    case 'sum':
    default:
      return valores.reduce((acc, v) => acc + v, 0);
  }
}

/**
 * Agrupa las filas por el valor de un campo y aplica una agregación a cada grupo.
 *
 * Para `'count'`, la agregación cuenta las filas de cada grupo. Para `'sum'` y
 * `'avg'`, se agregan los valores numéricos del mismo `campo`. El orden de las
 * claves resultantes respeta el orden de primera aparición en `filas`.
 *
 * @param {Array<object>} filas - Registros a agrupar.
 * @param {string} campo - Nombre del campo por el cual agrupar (y agregar).
 * @param {'count' | 'sum' | 'avg'} [agregacion='count'] - Agregación a aplicar por grupo.
 * @returns {Array<{ clave: (string | number), valor: number }>} Grupos con su valor agregado.
 */
export function agruparPor(filas, campo, agregacion = 'count') {
  if (!Array.isArray(filas) || filas.length === 0) return [];

  const grupos = new Map();

  for (const fila of filas) {
    const clave = fila?.[campo];
    if (!grupos.has(clave)) {
      grupos.set(clave, []);
    }
    grupos.get(clave).push(aNumero(fila?.[campo]));
  }

  const resultado = [];
  for (const [clave, valores] of grupos) {
    resultado.push({ clave, valor: aplicarAgregacion(valores, agregacion) });
  }
  return resultado;
}
