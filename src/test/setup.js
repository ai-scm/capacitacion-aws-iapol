// Setup global de pruebas para Vitest (entorno jsdom).
// No se depende de @testing-library/jest-dom (no instalado); se usan los matchers
// nativos de Vitest/expect y las utilidades del entorno jsdom.
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Desmonta los árboles de React montados tras cada prueba para evitar fugas entre tests.
afterEach(() => {
  cleanup();
});
