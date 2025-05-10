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
      // Si estamos offline y es una petición que puede ser guardada
      if (!navigator.onLine && ['POST', 'PUT', 'DELETE'].includes(method)) {
        await offlineSyncManager.storeData(offlineKey, {
          url,
          method,
          headers,
          body,
          timestamp: Date.now(),
        });

        addNotification(
          '💾 Datos Guardados Offline',
          'Los cambios se sincronizarán cuando vuelvas a estar en línea.',
          'info'
        );

        return { success: true, offline: true };
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
      return data;
    } catch (error) {
      setError(error as Error);
      
      // Si hay un error y tenemos datos offline, intentar usarlos
      if (['GET'].includes(method)) {
        const offlineData = await offlineSyncManager.getData(offlineKey);
        if (offlineData) {
          addNotification(
            '📱 Usando Datos Offline',
            'Se están mostrando los últimos datos guardados localmente.',
            'warning'
          );
          return offlineData;
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
  };
}; 