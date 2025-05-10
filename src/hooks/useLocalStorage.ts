import { useState, useEffect, useCallback } from 'react';

type SetValueFunction<T> = (value: T | ((prevValue: T) => T)) => void;

/**
 * Hook personalizado para manejar datos en localStorage con soporte para objetos, 
 * expiración de datos y sincronización entre tabs.
 * 
 * @param key Clave para almacenar en localStorage
 * @param initialValue Valor inicial si no existe en localStorage
 * @param options Configuración adicional como tiempo de expiración
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: {
    expiryMs?: number; // Tiempo de expiración en milisegundos
    namespace?: string; // Espacio de nombres para agrupar datos relacionados
    onError?: (error: Error) => void; // Callback para manejar errores
    syncTabs?: boolean; // Sincronizar entre pestañas
  } = {}
): [T, SetValueFunction<T>, { isError: boolean; isLoading: boolean; remove: () => void }] {
  // Combinar namespace y key para el almacenamiento
  const storageKey = options.namespace ? `${options.namespace}:${key}` : key;
  
  // Estado para rastreo de errores y carga
  const [isError, setIsError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Función para obtener el valor de localStorage
  const getStoredValue = useCallback((): T => {
    try {
      const item = localStorage.getItem(storageKey);
      
      // Si no hay valor almacenado, devolver initialValue
      if (item === null) {
        return initialValue;
      }
      
      // Intentar parsear el valor
      const parsedItem = JSON.parse(item);
      
      // Comprobar si el valor ha expirado
      if (options.expiryMs && parsedItem._timestamp) {
        const now = Date.now();
        if (now - parsedItem._timestamp > options.expiryMs) {
          // Eliminar el valor expirado
          localStorage.removeItem(storageKey);
          return initialValue;
        }
      }
      
      // Devolver el valor real sin los metadatos
      return parsedItem._value !== undefined ? parsedItem._value : parsedItem;
    } catch (error) {
      console.error(`Error al recuperar ${storageKey} de localStorage:`, error);
      setIsError(true);
      if (options.onError) {
        options.onError(error as Error);
      }
      return initialValue;
    }
  }, [storageKey, initialValue, options.expiryMs, options.onError]);
  
  // Estado para el valor actual
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const value = getStoredValue();
      setIsError(false);
      return value;
    } catch (error) {
      console.error(`Error al inicializar ${storageKey}:`, error);
      setIsError(true);
      if (options.onError) {
        options.onError(error as Error);
      }
      return initialValue;
    } finally {
      setIsLoading(false);
    }
  });
  
  // Función para establecer el valor en localStorage
  const setValue: SetValueFunction<T> = useCallback((value) => {
    try {
      setIsLoading(true);
      // Permitir valor de función (como en useState)
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Guardar tanto el valor como metadatos (timestamp para expiración)
      const itemToStore = {
        _value: valueToStore,
        _timestamp: Date.now()
      };
      
      // Actualizar estado
      setStoredValue(valueToStore);
      
      // Guardar en localStorage
      localStorage.setItem(storageKey, JSON.stringify(itemToStore));
      
      // Si syncTabs está habilitado, disparar un evento para otras pestañas
      if (options.syncTabs) {
        window.dispatchEvent(new StorageEvent('storage', {
          key: storageKey, 
          newValue: JSON.stringify(itemToStore)
        }));
      }
      
      setIsError(false);
    } catch (error) {
      console.error(`Error al guardar ${storageKey} en localStorage:`, error);
      setIsError(true);
      if (options.onError) {
        options.onError(error as Error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [storageKey, storedValue, options.syncTabs, options.onError]);
  
  // Función para eliminar el item de localStorage
  const remove = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setStoredValue(initialValue);
      setIsError(false);
    } catch (error) {
      console.error(`Error al eliminar ${storageKey} de localStorage:`, error);
      setIsError(true);
      if (options.onError) {
        options.onError(error as Error);
      }
    }
  }, [storageKey, initialValue, options.onError]);
  
  // Detectar cambios en localStorage de otras pestañas si syncTabs está habilitado
  useEffect(() => {
    if (!options.syncTabs) return;
    
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === storageKey && event.newValue !== null) {
        try {
          const parsedValue = JSON.parse(event.newValue);
          // Actualizar el estado si el valor cambió en otra pestaña
          setStoredValue(parsedValue._value !== undefined ? parsedValue._value : parsedValue);
        } catch (error) {
          console.error(`Error al sincronizar ${storageKey} entre pestañas:`, error);
        }
      } else if (event.key === storageKey && event.newValue === null) {
        // El item fue eliminado, restaurar al valor inicial
        setStoredValue(initialValue);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [storageKey, initialValue, options.syncTabs]);
  
  return [
    storedValue, 
    setValue, 
    { isError, isLoading, remove }
  ];
} 