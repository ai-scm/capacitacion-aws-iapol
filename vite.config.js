import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuración de build y servidor de desarrollo (Vite 8) + runner de pruebas (Vitest).
// El código JavaScript se empaqueta y sirve desde recursos locales, sin CDN en runtime (R23.3).
// La pila es React + Vite + JS + HTML5 + CSS3 y funciona sin conexión a AWS/IAPOL (R24.7).
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  test: {
    // Entorno jsdom para pruebas de componentes React.
    environment: 'jsdom',
    // globals:true evita importar describe/it/expect en cada archivo y no requiere
    // dependencias adicionales (p. ej. @testing-library/jest-dom no está instalado).
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    css: false,
  },
});
