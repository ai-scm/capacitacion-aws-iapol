/**
 * Pruebas unitarias de invariantes de datos (contenido estático del dominio).
 *
 * Verifican propiedades estructurales del contenido empaquetado que el resto de
 * la plataforma asume como ciertas:
 *
 *  - Sesiones: 15–60 diapositivas, duración esperada (180 min cada sesión,
 *    nivel 400), ids de diapositiva únicos (R2.5).
 *  - Catálogo de consultas demo: 5–20 entradas bien formadas (R9.1).
 *  - Rúbrica de evaluación: suma exactamente 100 y coincide con
 *    RUBRICA_POR_DEFECTO del motor de puntuación (R13.1).
 *  - Glosario: presencia de los términos requeridos (R14.1).
 *  - Dataset: descripción de los campos requeridos (R20.2).
 *
 * Además comprueba que el banco de preguntas cubre las seis áreas de la rúbrica
 * (al menos una pregunta por área), pues la puntuación prorratea por área.
 *
 * Framework: Vitest (globals:true). No usa mocks: valida los datos reales.
 *
 * Requirements: 2.5, 9.1, 13.1, 14.1, 20.2
 */

import sesionA from './sesiones/sesionA.js';
import sesionB from './sesiones/sesionB.js';
import { CATALOGO_CONSULTAS } from './consultas/catalogo-consultas.js';
import { RUBRICA } from './evaluacion/rubrica.js';
import { PREGUNTAS } from './evaluacion/preguntas.js';
import { terminos } from './glosario/terminos.js';
import { CAMPOS_DATASET } from './dataset/campos.js';
import { RUBRICA_POR_DEFECTO } from '../domain/puntuacion.js';

const SESIONES = [
  ['sesionA', sesionA],
  ['sesionB', sesionB],
];

/**
 * Duración esperada por sesión (minutos). El programa son dos sesiones
 * prácticas de 3 horas (180 min) de nivel 400.
 * @type {Record<string, number>}
 */
const DURACION_ESPERADA = {
  sesionA: 180,
  sesionB: 180,
};

const AREAS_RUBRICA = [
  'flujo',
  'sql',
  'tres_hojas',
  'filtros',
  'publicacion',
  'iapol',
];

describe('Invariantes de datos', () => {
  // ──────────────────────────────────────────────────────────────────────
  // R2.5 — Sesiones: 15–60 diapositivas, 120 min, ids únicos
  // ──────────────────────────────────────────────────────────────────────
  describe('Sesiones (R2.5)', () => {
    it.each(SESIONES)(
      '%s tiene entre 15 y 60 diapositivas (inclusive)',
      (_nombre, sesion) => {
        expect(Array.isArray(sesion.diapositivas)).toBe(true);
        expect(sesion.diapositivas.length).toBeGreaterThanOrEqual(15);
        expect(sesion.diapositivas.length).toBeLessThanOrEqual(60);
      },
    );

    it.each(SESIONES)(
      '%s dura 180 minutos (sesión práctica de 3 horas, nivel 400)',
      (nombre, sesion) => {
        expect(sesion.duracionMin).toBe(DURACION_ESPERADA[nombre]);
      },
    );

    it.each(SESIONES)(
      '%s tiene ids de diapositiva únicos',
      (_nombre, sesion) => {
        const ids = sesion.diapositivas.map((d) => d.id);
        ids.forEach((id) => expect(typeof id).toBe('string'));
        expect(new Set(ids).size).toBe(ids.length);
      },
    );
  });

  // ──────────────────────────────────────────────────────────────────────
  // R9.1 — Catálogo de consultas demo
  // ──────────────────────────────────────────────────────────────────────
  describe('Catálogo de consultas (R9.1)', () => {
    it('tiene entre 5 y 20 consultas (inclusive)', () => {
      expect(CATALOGO_CONSULTAS.length).toBeGreaterThanOrEqual(5);
      expect(CATALOGO_CONSULTAS.length).toBeLessThanOrEqual(20);
    });

    it('cada consulta tiene id, etiqueta, sql y resultado{columnas,filas}', () => {
      for (const consulta of CATALOGO_CONSULTAS) {
        expect(typeof consulta.id).toBe('string');
        expect(consulta.id.length).toBeGreaterThan(0);
        expect(typeof consulta.etiqueta).toBe('string');
        expect(consulta.etiqueta.length).toBeGreaterThan(0);
        expect(typeof consulta.sql).toBe('string');
        expect(consulta.sql.length).toBeGreaterThan(0);
        expect(consulta.resultado).toBeTruthy();
        expect(Array.isArray(consulta.resultado.columnas)).toBe(true);
        expect(consulta.resultado.columnas.length).toBeGreaterThan(0);
        expect(Array.isArray(consulta.resultado.filas)).toBe(true);
      }
    });

    it('tiene ids de consulta únicos', () => {
      const ids = CATALOGO_CONSULTAS.map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('cada fila de resultado tiene la misma longitud que sus columnas', () => {
      for (const consulta of CATALOGO_CONSULTAS) {
        const anchoColumnas = consulta.resultado.columnas.length;
        for (const fila of consulta.resultado.filas) {
          expect(Array.isArray(fila)).toBe(true);
          expect(fila.length).toBe(anchoColumnas);
        }
      }
    });
  });

  // ──────────────────────────────────────────────────────────────────────
  // R13.1 — Rúbrica: suma 100, seis áreas, alineada con el motor de puntuación
  // ──────────────────────────────────────────────────────────────────────
  describe('Rúbrica de evaluación (R13.1)', () => {
    it('cubre exactamente las seis áreas de contenido', () => {
      expect(Object.keys(RUBRICA).sort()).toEqual([...AREAS_RUBRICA].sort());
    });

    it('la suma de los puntos es exactamente 100', () => {
      const suma = Object.values(RUBRICA).reduce((acc, n) => acc + n, 0);
      expect(suma).toBe(100);
    });

    it('coincide con RUBRICA_POR_DEFECTO del motor de puntuación', () => {
      expect({ ...RUBRICA }).toEqual({ ...RUBRICA_POR_DEFECTO });
    });
  });

  // ──────────────────────────────────────────────────────────────────────
  // R13.1 (apoyo) — El banco de preguntas cubre las seis áreas
  // ──────────────────────────────────────────────────────────────────────
  describe('Banco de preguntas por área (apoyo R13.1)', () => {
    it.each(AREAS_RUBRICA)(
      'tiene al menos una pregunta del área "%s"',
      (area) => {
        const n = PREGUNTAS.filter((p) => p.area === area).length;
        expect(n).toBeGreaterThanOrEqual(1);
      },
    );

    it('no contiene preguntas con un área fuera de la rúbrica', () => {
      for (const pregunta of PREGUNTAS) {
        expect(AREAS_RUBRICA).toContain(pregunta.area);
      }
    });
  });

  // ──────────────────────────────────────────────────────────────────────
  // R14.1 — Glosario: presencia de los términos requeridos
  // ──────────────────────────────────────────────────────────────────────
  describe('Glosario (R14.1)', () => {
    const REQUERIDOS = [
      'S3',
      'Glue Data Catalog',
      'Athena',
      'workgroup',
      'Parquet',
      'dataset',
      'análisis',
      'dashboard',
      'SPICE',
      'Direct Query',
      'IAPOL',
    ];

    const terminosNormalizados = terminos.map((t) => t.termino.toLowerCase());

    it.each(REQUERIDOS)('incluye el término requerido "%s"', (requerido) => {
      expect(terminosNormalizados).toContain(requerido.toLowerCase());
    });

    it('cada término tiene definición no vacía', () => {
      for (const t of terminos) {
        expect(typeof t.termino).toBe('string');
        expect(t.termino.length).toBeGreaterThan(0);
        expect(typeof t.definicion).toBe('string');
        expect(t.definicion.length).toBeGreaterThan(0);
      }
    });
  });

  // ──────────────────────────────────────────────────────────────────────
  // R20.2 — Dataset: descripción de los campos requeridos
  // ──────────────────────────────────────────────────────────────────────
  describe('Campos del dataset (R20.2)', () => {
    const REQUERIDOS = [
      'tpep_pickup_datetime',
      'payment_type',
      'passenger_count',
      'trip_distance',
      'total_amount',
    ];

    const nombres = CAMPOS_DATASET.map((c) => c.nombre);

    it.each(REQUERIDOS)('describe el campo "%s"', (nombre) => {
      expect(nombres).toContain(nombre);
    });

    it('cada campo tiene nombre, tipo y descripción no vacíos', () => {
      for (const campo of CAMPOS_DATASET) {
        expect(typeof campo.nombre).toBe('string');
        expect(campo.nombre.length).toBeGreaterThan(0);
        expect(typeof campo.tipo).toBe('string');
        expect(campo.tipo.length).toBeGreaterThan(0);
        expect(typeof campo.descripcion).toBe('string');
        expect(campo.descripcion.length).toBeGreaterThan(0);
      }
    });
  });
});
