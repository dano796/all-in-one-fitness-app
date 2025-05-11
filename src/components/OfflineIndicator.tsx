import React, { useState, useEffect } from 'react';
import { useOfflineRequest } from '../hooks/useOfflineRequest';
import { offlineSyncManager } from '../utils/offlineSync';

const OfflineIndicator: React.FC = () => {
  const { isOffline, pendingSyncCount } = useOfflineRequest();
  const [showDetails, setShowDetails] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Escuchar mensajes del service worker para actualizar el último tiempo de sincronización
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SYNC_COMPLETED') {
        const date = new Date(event.data.timestamp);
        setLastSyncTime(
          `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
        );
        setIsSyncing(false);
      } else if (event.data && event.data.type === 'SYNC_ERROR') {
        setIsSyncing(false);
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, []);

  // No mostrar si está en línea y no hay cambios pendientes
  if (!isOffline && pendingSyncCount === 0) {
    return null;
  }

  // Manejar la sincronización manual
  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      await offlineSyncManager.forceSyncData();
      // La confirmación de sincronización vendrá a través del evento 'message'
    } catch (error) {
      console.error('Error al sincronizar:', error);
      setIsSyncing(false);
    }
  };

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
              onClick={handleSyncNow}
              disabled={isSyncing}
              className={`mt-2 px-3 py-1 ${
                isSyncing ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-600'
              } text-white rounded text-xs transition-colors flex items-center gap-2`}
            >
              {isSyncing ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sincronizando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Sincronizar ahora
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator; 