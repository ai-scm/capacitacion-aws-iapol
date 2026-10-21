import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Tema AWS-like y estilos globales/responsive (tarea 13.1). Carga local, sin CDN.
import './styles/index.css';

// Cableado final de proveedores y vistas (tarea 14.1). El árbol completo de la
// Plataforma (router por estado, persistencia de progreso y Modo_Presentador)
// vive en `App.jsx`; aquí solo se arranca React sobre el nodo de `index.html`.
// El código se carga desde el bundle local de Vite, sin CDN en runtime (R23.3).
import App from './App.jsx';

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
