import { useState, useCallback } from 'react';
import axios from 'axios';
import { useNotificationStore } from '../store/notificationStore';

// Interfaz para el tipo Exercise
interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  gifUrl: string;
  target: string;
  secondaryMuscles: string[];
  instructions: string[];
}

export const useExercises = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotificationStore();

  const fetchExercises = useCallback(async (bodyPart: string, backendUrl: string) => {
    if (!bodyPart) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Intenta cargar desde la red
      if (navigator.onLine) {
        const response = await axios.get<Exercise[]>(`${backendUrl}/api/exercises`, {
          params: { bodyPart }
        });
        
        // Guarda en localStorage para uso offline
        localStorage.setItem(`exercises-${bodyPart}`, JSON.stringify(response.data));
        
        setExercises(response.data);
        setLoading(false);
        return true;
      } else {
        // Si estamos offline, intenta cargar desde localStorage
        const cachedData = localStorage.getItem(`exercises-${bodyPart}`);
        
        if (cachedData) {
          setExercises(JSON.parse(cachedData));
          setLoading(false);
          
          addNotification(
            "📱 Modo Offline",
            "Mostrando ejercicios guardados localmente. Algunas funciones pueden estar limitadas.",
            "warning"
          );
          
          return true;
        } else {
          throw new Error('No hay datos disponibles offline para esta parte del cuerpo');
        }
      }
    } catch (error) {
      console.error("Error fetching exercises:", error);
      
      // Si hay un error de red, intenta usar datos en caché
      if (!navigator.onLine || (error as any)?.message?.includes('network')) {
        const cachedData = localStorage.getItem(`exercises-${bodyPart}`);
        
        if (cachedData) {
          setExercises(JSON.parse(cachedData));
          setLoading(false);
          
          addNotification(
            "📱 Modo Offline",
            "Mostrando ejercicios guardados localmente. Algunas funciones pueden estar limitadas.",
            "warning"
          );
          
          return true;
        }
      }
      
      setError("Error al cargar los ejercicios. Por favor, intenta de nuevo.");
      setLoading(false);
      return false;
    }
  }, [addNotification]);

  return {
    exercises,
    loading,
    error,
    fetchExercises
  };
}; 