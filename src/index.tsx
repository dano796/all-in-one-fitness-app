import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from './pages/ThemeContext';

// Registro del service worker para soporte offline
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registrado con éxito:', registration.scope);
        
        // Comprobar si hay actualizaciones del SW
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // Nueva versión disponible
                  console.log('Nueva versión de la aplicación disponible, recargando...');
                  
                  // Opcionalmente, mostrar una notificación al usuario y recargar
                  if (window.confirm('Hay una nueva versión disponible. ¿Recargar para actualizar?')) {
                    window.location.reload();
                  }
                } else {
                  // Primera instalación
                  console.log('Aplicación instalada para uso offline.');
                }
              }
            };
          }
        };
      })
      .catch(error => {
        console.error('Error al registrar el Service Worker:', error);
      });
      
    // Manejar los eventos de online/offline para informar
    window.addEventListener('online', () => {
      console.log('Conexión recuperada');
      
      // Intentar sincronizar datos pendientes
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'TRIGGER_SYNC'
        });
      }
    });
    
    window.addEventListener('offline', () => {
      console.log('Conexión perdida, entrando en modo offline');
    });
  });
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
); 