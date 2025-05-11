import React, { useState, useEffect } from 'react';
import { offlineSyncManager } from '../utils/offlineSync';

type SyncStatusProps = {
  className?: string;
  compact?: boolean;
};

const SyncStatus: React.FC<SyncStatusProps> = ({ className = '', compact = false }) => {
  const [pendingChanges, setPendingChanges] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Actualizar el estado cuando cambia la conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Obtener la cantidad de cambios pendientes al iniciar
    const updatePendingCount = () => {
      setPendingChanges(offlineSyncManager.getPendingSyncRequestsCount());
    };

    // Actualizar contadores iniciales
    updatePendingCount();

    // Configurar un intervalo para actualizar regularmente
    const interval = setInterval(updatePendingCount, 10000);

    // Escuchar mensajes del service worker (a través del gestor de sincronización)
    const handleSyncMessage = (e: MessageEvent) => {
      if (e.data && e.data.type) {
        switch (e.data.type) {
          case 'SYNC_COMPLETED':
            setIsSyncing(false);
            setPendingChanges(offlineSyncManager.getPendingSyncRequestsCount());
            setLastSyncTime(new Date());
            break;
          case 'SYNC_ERROR':
            setIsSyncing(false);
            break;
          case 'PENDING_CHANGES_COUNT':
            setPendingChanges(e.data.count);
            break;
        }
      }
    };

    // Registrar listener para mensajes de sincronización
    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('message', handleSyncMessage);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
      if (navigator.serviceWorker) {
        navigator.serviceWorker.removeEventListener('message', handleSyncMessage);
      }
    };
  }, []);

  // Función para forzar la sincronización manual
  const handleSync = async () => {
    if (isSyncing || !isOnline) return;

    setIsSyncing(true);
    try {
      await offlineSyncManager.forceSyncData();
    } catch (error) {
      console.error('Error al sincronizar:', error);
      setIsSyncing(false);
    }
  };

  // Si no hay cambios pendientes y está en modo compacto, no mostrar nada
  if (compact && pendingChanges === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Indicador de estado de conexión */}
      <div className="flex items-center gap-1">
        <div 
          className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} 
          title={isOnline ? 'Conectado' : 'Sin conexión'} 
        />
        {!compact && (
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {isOnline ? 'Conectado' : 'Offline'}
          </span>
        )}
      </div>

      {/* Contador de cambios pendientes */}
      {pendingChanges > 0 && (
        <div className="flex items-center gap-1">
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
            {pendingChanges} {!compact && 'cambio(s) pendiente(s)'}
          </span>
        </div>
      )}

      {/* Botón de sincronización manual */}
      {isOnline && pendingChanges > 0 && (
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className={`text-xs ${isSyncing ? 'text-gray-400' : 'text-blue-500 hover:text-blue-700'} flex items-center gap-1`}
          title="Sincronizar cambios pendientes"
        >
          {isSyncing ? (
            <>
              <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {!compact && 'Sincronizando...'}
            </>
          ) : (
            <>
              <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {!compact && 'Sincronizar'}
            </>
          )}
        </button>
      )}

      {/* Tiempo de última sincronización */}
      {lastSyncTime && !compact && (
        <span className="text-xs text-gray-500 ml-2">
          Última sincronización: {lastSyncTime.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};

export default SyncStatus; 