import React, { useState, useEffect } from 'react';
import { useOfflineRequest } from '../hooks/useOfflineRequest';
import { offlineSyncManager } from '../utils/offlineSync';

const OfflineIndicator: React.FC = () => {
  const { isOffline, pendingSyncCount } = useOfflineRequest();
  const [showDetails, setShowDetails] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Escuchar mensajes del service worker para actualizar el último tiempo de sincronización
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SYNC_COMPLETED') {
        const date = new Date(event.data.timestamp);
        setLastSyncTime(
          `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
        );
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, []);

  if (!isOffline && pendingSyncCount === 0) {
    return null; // No mostrar nada si está en línea y no hay sincronizaciones pendientes
  }

  return (
    <div
      className={`fixed bottom-4 right-4 p-3 rounded-lg shadow-lg z-50 ${
        isOffline ? 'bg-red-500' : 'bg-yellow-400'
      }`}
      style={{ maxWidth: '300px' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {isOffline ? (
            <svg
              className="w-5 h-5 mr-2 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 mr-2 text-gray-800"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
          <span className={isOffline ? 'text-white' : 'text-gray-800 font-medium'}>
            {isOffline
              ? 'Modo Offline'
              : `Sincronización pendiente (${pendingSyncCount})`}
          </span>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="ml-2 text-sm focus:outline-none"
        >
          <svg
            className={`w-5 h-5 ${isOffline ? 'text-white' : 'text-gray-800'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={
                showDetails
                  ? 'M5 15l7-7 7 7'
                  : 'M19 9l-7 7-7-7'
              }
            />
          </svg>
        </button>
      </div>

      {showDetails && (
        <div className={`mt-2 text-sm ${isOffline ? 'text-white' : 'text-gray-800'}`}>
          <p>
            {isOffline
              ? 'Estás trabajando sin conexión. Tus cambios se guardarán localmente y se sincronizarán cuando vuelvas a estar en línea.'
              : 'Tienes cambios pendientes de sincronizar con el servidor.'}
          </p>
          {pendingSyncCount > 0 && (
            <div className="mt-1">
              <p>Cambios pendientes: {pendingSyncCount}</p>
            </div>
          )}
          {lastSyncTime && (
            <p className="mt-1">
              Última sincronización: {lastSyncTime}
            </p>
          )}
          {!isOffline && pendingSyncCount > 0 && (
            <button
              onClick={() => {
                if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                  navigator.serviceWorker.controller.postMessage({
                    type: 'TRIGGER_SYNC'
                  });
                }
              }}
              className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
            >
              Sincronizar ahora
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator; 