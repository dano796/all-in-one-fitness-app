import { useState, useCallback } from 'react';
import axios from 'axios';
import { useNotificationStore } from '../store/notificationStore';

interface WaterData {
  aguasllenadas: number;
  date: string;
}

export const useWaterTracker = () => {
  const [waterAmount, setWaterAmount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotificationStore();

  const fetchWaterData = useCallback(async (email: string, date: string, backendUrl: string) => {
    if (!email || !date) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Intenta cargar desde la red
      if (navigator.onLine) {
        const response = await axios.get(`${backendUrl}/api/water/user`, {
          params: { email, date }
        });
        
        // Guardar en localStorage para uso offline
        const waterData = response.data;
        localStorage.setItem(`water-${date}-${email}`, JSON.stringify(waterData));
        
        setWaterAmount(waterData.aguasllenadas || 0);
        setLoading(false);
        return true;
      } else {
        // Si estamos offline, intenta cargar desde localStorage
        const cachedData = localStorage.getItem(`water-${date}-${email}`);
        
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          setWaterAmount(parsedData.aguasllenadas || 0);
          setLoading(false);
          
          addNotification(
            "📱 Modo Offline",
            "Mostrando consumo de agua guardado localmente. Algunas funciones pueden estar limitadas.",
            "warning"
          );
          
          return true;
        } else {
          throw new Error('No hay datos disponibles offline para esta fecha');
        }
      }
    } catch (error) {
      console.error("Error fetching water data:", error);
      
      // Si hay un error de red, intenta usar datos en caché
      if (!navigator.onLine || (error as any)?.message?.includes('network')) {
        const cachedData = localStorage.getItem(`water-${date}-${email}`);
        
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          setWaterAmount(parsedData.aguasllenadas || 0);
          setLoading(false);
          
          addNotification(
            "📱 Modo Offline",
            "Mostrando consumo de agua guardado localmente. Algunas funciones pueden estar limitadas.",
            "warning"
          );
          
          return true;
        }
      }
      
      setError("Error al cargar los datos de agua. Por favor, intenta de nuevo.");
      setLoading(false);
      return false;
    }
  }, [addNotification]);

  const updateWaterData = useCallback(async (email: string, date: string, amount: number, backendUrl: string) => {
    if (!email || !date) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (navigator.onLine) {
        // Realizar petición online
        await axios.post(`${backendUrl}/api/water/update`, {
          email,
          date,
          aguasllenadas: amount
        });
        
        // Actualizar datos locales
        setWaterAmount(amount);
        
        // Guardar en localStorage
        const waterData = { aguasllenadas: amount, date };
        localStorage.setItem(`water-${date}-${email}`, JSON.stringify(waterData));
        
        addNotification(
          "💧 Agua registrada",
          "Tu consumo de agua ha sido registrado correctamente.",
          "success"
        );
      } else {
        // Guardar datos offline
        const waterData = { aguasllenadas: amount, date };
        localStorage.setItem(`water-${date}-${email}`, JSON.stringify(waterData));
        
        // Actualizar estado local
        setWaterAmount(amount);
        
        addNotification(
          "📱 Guardado Offline",
          "Tu consumo de agua se ha guardado localmente y se sincronizará cuando vuelvas a estar en línea.",
          "info"
        );
      }
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Error updating water data:", error);
      
      // Intentar guardar localmente si hay error
      const waterData = { aguasllenadas: amount, date };
      localStorage.setItem(`water-${date}-${email}`, JSON.stringify(waterData));
      
      setWaterAmount(amount);
      
      addNotification(
        "⚠️ Error de Conexión",
        "No se pudo conectar con el servidor, pero tus datos se han guardado localmente.",
        "warning"
      );
      
      setLoading(false);
      return false;
    }
  }, [addNotification]);

  return {
    waterAmount,
    loading,
    error,
    fetchWaterData,
    updateWaterData
  };
}; 