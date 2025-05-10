import { useState, useCallback } from 'react';
import { offlineSyncManager } from '../utils/offlineSync';
import { useNotificationStore } from '../store/notificationStore';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: HeadersInit;
  body?: any;
  offlineKey?: string;
}

export const useOfflineRequest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { addNotification } = useNotificationStore();

  const request = useCallback(async (url: string, options: RequestOptions = {}) => {
    const {
      method = 'GET',
      headers = {},
      body,
      offlineKey = url,
    } = options;

    setIsLoading(true);
    setError(null);

    try {
      // Si estamos offline
      if (!navigator.onLine) {
        // Para peticiones GET, intentar obtener datos offline
        if (method === 'GET') {
          const offlineData = await offlineSyncManager.getData(offlineKey);
          if (offlineData) {
            addNotification(
              '📱 Datos Offline',
              'Se están mostrando los últimos datos guardados localmente.',
              'warning'
            );
            return { success: true, data: offlineData, offline: true };
          }
          throw new Error('No hay datos offline disponibles');
        }
        
        // Para otras peticiones, guardar para sincronización posterior
        if (['POST', 'PUT', 'DELETE'].includes(method)) {
          // Guardar la petición pendiente para sincronizar cuando vuelva la conexión
          const requestId = `${method}-${offlineKey}-${Date.now()}`;
          await offlineSyncManager.storePendingRequest(requestId, {
            url,
            method,
            headers,
            body,
            timestamp: Date.now(),
          });

          addNotification(
            '💾 Datos Guardados Offline',
            'Los cambios se sincronizarán automáticamente cuando vuelvas a estar en línea.',
            'info'
          );

          return { success: true, offline: true, pendingSync: true };
        }
      }

      // Si estamos online, hacer la petición normal
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Guardar datos offline para peticiones GET exitosas
      if (method === 'GET') {
        await offlineSyncManager.storeData(offlineKey, data);
      }

      return { success: true, data, offline: false };
    } catch (error) {
      const typedError = error as Error;
      setError(typedError);
      console.error(`Error en petición ${method} a ${url}:`, typedError);
      
      // Si hay un error de red y no es una petición GET, guardar para sincronización posterior
      if (method !== 'GET' && (error instanceof TypeError || typedError?.message?.includes('network'))) {
        try {
          const requestId = `${method}-${offlineKey}-${Date.now()}`;
          await offlineSyncManager.storePendingRequest(requestId, {
            url,
            method,
            headers,
            body,
            timestamp: Date.now(),
          });

          addNotification(
            '⚠️ Error de Conexión',
            'No se pudo conectar con el servidor, pero los datos se han guardado localmente y se sincronizarán automáticamente más tarde.',
            'warning'
          );

          return { success: true, offline: true, pendingSync: true, error: typedError.message };
        } catch (storageError) {
          console.error('Error al guardar petición para sincronización:', storageError);
        }
      }
      
      // Si hay un error y es una petición GET, intentar obtener datos offline
      if (method === 'GET') {
        const offlineData = await offlineSyncManager.getData(offlineKey);
        if (offlineData) {
          addNotification(
            '📱 Datos Offline',
            'Se están mostrando los últimos datos guardados localmente debido a un error de conexión.',
            'warning'
          );
          return { success: true, data: offlineData, offline: true };
        }
      }

      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  return {
    request,
    isLoading,
    error,
    pendingSyncCount: offlineSyncManager.getPendingSyncRequestsCount(),
  };
}; 