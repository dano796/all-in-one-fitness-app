import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useNotificationStore } from '../store/notificationStore';
import { offlineSyncManager } from '../utils/offlineSync';

interface WaterData {
  amount: number;
  date: string;
}

export const useWaterTracker = () => {
  const [waterAmount, setWaterAmount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const { addNotification } = useNotificationStore();

  // Monitorear el estado de la conexión
  useEffect(() => {
    const handleOnline = () => {
      console.log("[WaterTracker] Conexión restablecida");
      setIsOnline(true);
      // Intentar sincronizar datos pendientes
      offlineSyncManager.syncData().catch(console.error);
    };
    
    const handleOffline = () => {
      console.log("[WaterTracker] Conexión perdida");
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchWaterData = useCallback(async (email: string, date: string, backendUrl: string) => {
    if (!email || !date) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Intenta cargar desde la red
      if (navigator.onLine) {
        try {
          const response = await axios.get(`${backendUrl}/api/water/user`, {
            params: { email, date },
            timeout: 5000 // Timeout de 5 segundos para detectar problemas de conexión
          });
          
          // Guardar en localStorage para uso offline
          const waterData = response.data;
          localStorage.setItem(`water-${date}-${email}`, JSON.stringify(waterData));
          
          setWaterAmount(waterData.aguasllenadas || 0);
          setLoading(false);
          return true;
        } catch (networkError) {
          console.error("Error de red al cargar datos de agua:", networkError);
          throw networkError; // Propagar para intentar usar datos en caché
        }
      } else {
        throw new Error('Offline mode');
      }
    } catch (error) {
      console.error("Error fetching water data:", error);
      
      // Si hay un error de red o estamos offline, intenta cargar datos en caché
      const cachedData = localStorage.getItem(`water-${date}-${email}`);
      
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setWaterAmount(parsedData.aguasllenadas || 0);
        setLoading(false);
        
        addNotification(
          "📱 Modo Offline",
          "Mostrando consumo de agua guardado localmente. Los cambios se sincronizarán cuando vuelvas a estar en línea.",
          "warning"
        );
        
        return true;
      }
      
      setError("No hay datos para esta fecha. Intenta más tarde cuando tengas conexión.");
      setLoading(false);
      return false;
    }
  }, [addNotification]);

  const updateWaterData = useCallback(async (email: string, date: string, amount: number, backendUrl: string) => {
    if (!email || !date) return;
    
    setLoading(true);
    setError(null);
    
    console.log(`[WaterTracker] Actualizando datos de agua: ${amount} unidades, online: ${navigator.onLine}`);
    
    // Preparar los datos para guardar
    const waterData = { 
      aguasllenadas: amount,
      date
    };
    
    // Actualizar el estado de la UI inmediatamente
    setWaterAmount(amount);
    
    // Guardar en localStorage siempre (tanto online como offline)
    localStorage.setItem(`water-${date}-${email}`, JSON.stringify(waterData));
    
    // Verificar el estado de conexión nuevamente justo antes de intentar la solicitud
    const isCurrentlyOnline = navigator.onLine;
    
    try {
      if (isCurrentlyOnline) {
        // Realizar petición online con timeout para detectar problemas de conexión
        try {
          await axios.post(`${backendUrl}/api/water/update`, {
            email,
            date,
            aguasllenadas: amount
          }, { timeout: 5000 });
          
          addNotification(
            "💧 Agua registrada",
            "Tu consumo de agua ha sido registrado correctamente.",
            "success"
          );
        } catch (networkError) {
          console.error("Error en la petición:", networkError);
          // Si hay error de red, guardar para sincronización posterior
          throw networkError;
        }
      } else {
        throw new Error('Offline mode');
      }
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Error updating water data:", error);
      
      // Guardar para sincronización posterior
      try {
        console.log("[WaterTracker] Guardando datos para sincronización posterior");
        const requestId = `WATER-UPDATE-${date}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const storageResult = await offlineSyncManager.storePendingRequest(requestId, {
          url: `${backendUrl}/api/water/update`,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: {
            email,
            date,
            aguasllenadas: amount
          },
          timestamp: Date.now()
        });
        
        if (storageResult) {
          console.log("[WaterTracker] Petición almacenada con ID:", requestId);
          
          addNotification(
            "📱 Guardado Offline",
            "Tu consumo de agua se ha guardado localmente y se sincronizará cuando vuelvas a estar en línea.",
            "info"
          );
        } else {
          console.error("[WaterTracker] Error al almacenar la petición");
        }
      } catch (syncError) {
        console.error("Error preparing offline sync:", syncError);
      }
      
      setLoading(false);
      return true;
    }
  }, [addNotification]);

  const updateWaterGoal = useCallback(async (email: string, goalMl: number, backendUrl: string) => {
    if (!email) return;
    
    setLoading(true);
    setError(null);
    
    // Guardar en localStorage siempre para tener referencia local
    localStorage.setItem(`water-goal-${email}`, JSON.stringify({ waterGoal: goalMl }));
    console.log(`[WaterTracker] Actualizando meta de agua: ${goalMl} ml, online: ${navigator.onLine}`);
    
    try {
      if (navigator.onLine) {
        // Realizar petición online
        await axios.post(`${backendUrl}/api/water/set-goal`, {
          email,
          waterGoal: goalMl
        });
        
        addNotification(
          "🎯 Meta de Agua Actualizada",
          `Tu meta diaria de agua ha sido actualizada a ${goalMl} ml.`,
          "success"
        );
        
        setLoading(false);
        return true;
      } else {
        // Guardar datos offline para sincronización futura
        const requestId = `WATER-GOAL-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        await offlineSyncManager.storePendingRequest(requestId, {
          url: `${backendUrl}/api/water/set-goal`,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: {
            email,
            waterGoal: goalMl
          },
          timestamp: Date.now()
        });
        
        console.log("[WaterTracker] Meta guardada offline con ID:", requestId);
        
        addNotification(
          "📱 Meta Guardada Offline",
          `Tu meta de agua (${goalMl} ml) se ha guardado localmente y se sincronizará cuando vuelvas a estar en línea.`,
          "info"
        );
        
        setLoading(false);
        return true;
      }
    } catch (error) {
      console.error("Error updating water goal:", error);
      
      try {
        // Intentar guardar para sincronización futura
        const requestId = `WATER-GOAL-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        await offlineSyncManager.storePendingRequest(requestId, {
          url: `${backendUrl}/api/water/set-goal`,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: {
            email,
            waterGoal: goalMl
          },
          timestamp: Date.now()
        });
        
        console.log("[WaterTracker] Meta guardada para sincronización con ID:", requestId);
      } catch (syncError) {
        console.error("Error preparing offline sync for water goal:", syncError);
      }
      
      addNotification(
        "⚠️ Error al Actualizar Meta",
        "No se pudo conectar con el servidor, pero tu meta de agua se ha guardado localmente y se sincronizará más tarde.",
        "warning"
      );
      
      setLoading(false);
      return true;
    }
  }, [addNotification]);

  const fetchWaterGoal = useCallback(async (email: string, backendUrl: string) => {
    if (!email) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      if (navigator.onLine) {
        try {
          const response = await axios.get(`${backendUrl}/api/water/get-goal`, {
            params: { email },
            timeout: 5000 
          });
          
          const goalData = response.data;
          
          // Guardar en localStorage para uso offline
          localStorage.setItem(`water-goal-${email}`, JSON.stringify(goalData));
          
          setLoading(false);
          return goalData.waterGoal;
        } catch (networkError) {
          console.error("Error de red al obtener meta de agua:", networkError);
          throw networkError;
        }
      } else {
        throw new Error('Offline mode');
      }
    } catch (error) {
      console.error("Error fetching water goal:", error);
      
      // Si hay error, intentar usar caché
      const cachedData = localStorage.getItem(`water-goal-${email}`);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setLoading(false);
        
        if (!navigator.onLine) {
          addNotification(
            "📱 Datos Offline",
            "Mostrando tu meta de agua guardada localmente.",
            "info"
          );
        }
        
        return parsedData.waterGoal;
      }
      
      setError("No se pudo obtener tu meta de agua. Por favor, intenta más tarde.");
      setLoading(false);
      return null;
    }
  }, [addNotification]);

  return {
    waterAmount,
    loading,
    error,
    isOnline,
    fetchWaterData,
    updateWaterData,
    updateWaterGoal,
    fetchWaterGoal
  };
}; 