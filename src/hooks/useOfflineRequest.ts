import { useState, useCallback, useEffect } from 'react';
import { offlineSyncManager } from '../utils/offlineSync';
import { useNotificationStore } from '../store/notificationStore';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: HeadersInit;
  body?: any;
  offlineKey?: string;
  prefetch?: boolean; // Nueva opción para prefetch de datos
  routeType?: string; // Tipo de ruta para organizar la sincronización
}

export const useOfflineRequest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { addNotification } = useNotificationStore();
  const [pendingSyncCount, setPendingSyncCount] = useState(offlineSyncManager.getPendingSyncRequestsCount());

  // Monitorear cambios en el estado de la conexión
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Actualizar el contador de sincronizaciones pendientes periódicamente
    const interval = setInterval(() => {
      setPendingSyncCount(offlineSyncManager.getPendingSyncRequestsCount());
    }, 10000);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const request = useCallback(async (url: string, options: RequestOptions = {}) => {
    const {
      method = 'GET',
      headers = {},
      body,
      offlineKey = url,
      prefetch = false,
      routeType
    } = options;

    setIsLoading(true);
    setError(null);

    try {
      // Verificar si la ruta está soportada para modo offline
      const isOfflineSupported = offlineSyncManager.isRouteOfflineSupported(url);
      
      // Si es una petición GET y se ha solicitado prefetch, intentar precargar
      if (method === 'GET' && prefetch && navigator.onLine) {
        offlineSyncManager.prefetchRoute(url, body);
      }

      // Si estamos offline o la ruta no es soportada en modo offline
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
          
          // Si no hay datos offline para esta ruta específica pero es importante mostrar algo
          if (isOfflineSupported) {
            throw new Error('No hay datos offline disponibles para esta ruta');
          } else {
            // Intentar buscar datos similares por tipo de ruta
            // (este es un ejemplo, habría que implementar la lógica según las necesidades)
            const fallbackData = await getFallbackData(url);
            if (fallbackData) {
              addNotification(
                '📱 Datos Offline Limitados',
                'Se están mostrando datos alternativos en modo offline.',
                'warning'
              );
              return { success: true, data: fallbackData, offline: true, fallback: true };
            }
            throw new Error('Esta funcionalidad requiere conexión a internet');
          }
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

          setPendingSyncCount(offlineSyncManager.getPendingSyncRequestsCount());

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
      if (method === 'GET' && isOfflineSupported) {
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

          setPendingSyncCount(offlineSyncManager.getPendingSyncRequestsCount());

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
        
        // Si no hay datos específicos, intentar buscar datos similares
        const fallbackData = await getFallbackData(url);
        if (fallbackData) {
          addNotification(
            '📱 Datos Alternativos',
            'Se están mostrando datos alternativos debido a un error de conexión.',
            'warning'
          );
          return { success: true, data: fallbackData, offline: true, fallback: true };
        }
      }

      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  // Función para encontrar datos alternativos cuando no hay datos específicos
  const getFallbackData = async (url: string): Promise<any | null> => {
    // Esta función se puede personalizar según las necesidades de la aplicación
    // Por ejemplo, si no hay datos de comidas para una fecha, mostrar datos de otra fecha
    
    try {
      if (url.includes('/api/foods')) {
        // Buscar datos de comidas de cualquier fecha disponible
        const keys = Object.keys(localStorage);
        const foodKeys = keys.filter(key => key.startsWith('food-'));
        
        if (foodKeys.length > 0) {
          // Usar los datos más recientes
          const mostRecentKey = foodKeys.sort().pop();
          if (mostRecentKey) {
            return JSON.parse(localStorage.getItem(mostRecentKey) || '{}');
          }
        }
      } else if (url.includes('/api/exercises')) {
        // Buscar ejercicios de cualquier parte del cuerpo
        const keys = Object.keys(localStorage);
        const exerciseKeys = keys.filter(key => key.startsWith('exercises-'));
        
        if (exerciseKeys.length > 0) {
          // Usar cualquier conjunto de ejercicios disponible
          const anyExerciseKey = exerciseKeys[0];
          return JSON.parse(localStorage.getItem(anyExerciseKey) || '[]');
        }
      } else if (url.includes('/api/water')) {
        // Datos básicos de agua para mostrar algo
        return { history: [], recommendation: 2000 };
      }
      
      return null;
    } catch (error) {
      console.error('Error al buscar datos alternativos:', error);
      return null;
    }
  };

  // Función para marcar una ruta como soportada offline
  const registerOfflineRoute = useCallback((route: string) => {
    offlineSyncManager.registerOfflineRoute(route);
  }, []);

  return {
    request,
    isLoading,
    error,
    isOffline,
    pendingSyncCount,
    registerOfflineRoute
  };
}; 