import { useState, useCallback } from 'react';
import axios from 'axios';
import { useNotificationStore } from '../store/notificationStore';

// Definir tipos de comidas válidos
type FoodType = 'Desayuno' | 'Almuerzo' | 'Merienda' | 'Cena';

interface Food {
  id_comida: string;
  nombre_comida: string;
  descripcion: string;
  fecha: string;
  calorias: string | null;
  grasas: string | null;
  carbs: string | null;
  proteina: string | null;
  tipo: FoodType;
  isEditable: boolean;
}

interface FoodData {
  foods: {
    Desayuno: Food[];
    Almuerzo: Food[];
    Merienda: Food[];
    Cena: Food[];
  };
  currentFoodType: FoodType | null;
  isToday: boolean;
}

export const useFoodTracker = () => {
  const [foodsData, setFoodsData] = useState<FoodData>({
    foods: { Desayuno: [], Almuerzo: [], Merienda: [], Cena: [] },
    currentFoodType: null,
    isToday: false,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotificationStore();

  const fetchFoodData = useCallback(async (email: string, date: string, backendUrl: string) => {
    if (!email || !date) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Intenta cargar desde la red
      if (navigator.onLine) {
        const response = await axios.get<FoodData>(`${backendUrl}/api/foods/user`, {
          params: { email, date }
        });
        
        // Guardar en localStorage para uso offline
        const data = response.data;
        localStorage.setItem(`food-${date}-${email}`, JSON.stringify(data));
        
        setFoodsData(data);
        setLoading(false);
        return true;
      } else {
        // Si estamos offline, intenta cargar desde localStorage
        const cachedData = localStorage.getItem(`food-${date}-${email}`);
        
        if (cachedData) {
          const parsedData = JSON.parse(cachedData) as FoodData;
          setFoodsData(parsedData);
          setLoading(false);
          
          addNotification(
            "📱 Modo Offline",
            "Mostrando comidas guardadas localmente. Algunas funciones pueden estar limitadas.",
            "warning"
          );
          
          return true;
        } else {
          throw new Error('No hay datos disponibles offline para esta fecha');
        }
      }
    } catch (error) {
      console.error("Error fetching food data:", error);
      
      // Si hay un error de red, intenta usar datos en caché
      if (!navigator.onLine || (error as any)?.message?.includes('network')) {
        const cachedData = localStorage.getItem(`food-${date}-${email}`);
        
        if (cachedData) {
          const parsedData = JSON.parse(cachedData) as FoodData;
          setFoodsData(parsedData);
          setLoading(false);
          
          addNotification(
            "📱 Modo Offline",
            "Mostrando comidas guardadas localmente. Algunas funciones pueden estar limitadas.",
            "warning"
          );
          
          return true;
        }
      }
      
      setError("Error al cargar los datos de comidas. Por favor, intenta de nuevo.");
      setLoading(false);
      return false;
    }
  }, [addNotification]);

  const addFood = useCallback(async (email: string, date: string, foodData: Partial<Food>, backendUrl: string) => {
    if (!email || !date) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (navigator.onLine) {
        // Realizar petición online
        await axios.post(`${backendUrl}/api/foods/add`, {
          ...foodData,
          email,
          date
        });
        
        // Recargar datos actualizados
        await fetchFoodData(email, date, backendUrl);
        
        addNotification(
          "🍽️ Comida registrada",
          "Tu comida ha sido registrada correctamente.",
          "success"
        );
        
        setLoading(false);
        return true;
      } else {
        // En modo offline, intentamos actualizar los datos locales
        const cachedData = localStorage.getItem(`food-${date}-${email}`);
        let updatedData: FoodData;
        
        if (cachedData) {
          updatedData = JSON.parse(cachedData) as FoodData;
          // Añadir la comida al tipo correspondiente
          if (foodData.tipo && updatedData.foods[foodData.tipo]) {
            updatedData.foods[foodData.tipo].push({
              ...foodData,
              id_comida: `offline-${Date.now()}`, // ID temporal para modo offline
              isEditable: true,
              fecha: date,
              nombre_comida: foodData.nombre_comida || '',
              descripcion: foodData.descripcion || '',
              calorias: foodData.calorias || null,
              grasas: foodData.grasas || null,
              carbs: foodData.carbs || null,
              proteina: foodData.proteina || null,
            } as Food);
          }
        } else {
          // Si no hay datos locales, crear estructura básica
          updatedData = {
            foods: { Desayuno: [], Almuerzo: [], Merienda: [], Cena: [] },
            currentFoodType: null,
            isToday: true
          };
          
          if (foodData.tipo) {
            updatedData.foods[foodData.tipo] = [{
              ...foodData,
              id_comida: `offline-${Date.now()}`,
              isEditable: true,
              fecha: date,
              nombre_comida: foodData.nombre_comida || '',
              descripcion: foodData.descripcion || '',
              calorias: foodData.calorias || null,
              grasas: foodData.grasas || null,
              carbs: foodData.carbs || null,
              proteina: foodData.proteina || null,
            } as Food];
          }
        }
        
        // Guardar en localStorage
        localStorage.setItem(`food-${date}-${email}`, JSON.stringify(updatedData));
        
        // Actualizar estado
        setFoodsData(updatedData);
        
        addNotification(
          "📱 Guardado Offline",
          "Tu comida se ha guardado localmente y se sincronizará cuando vuelvas a estar en línea.",
          "info"
        );
        
        setLoading(false);
        return true;
      }
    } catch (error) {
      console.error("Error adding food:", error);
      
      // Intentar guardar localmente si hay error
      try {
        const cachedData = localStorage.getItem(`food-${date}-${email}`);
        let updatedData: FoodData;
        
        if (cachedData) {
          updatedData = JSON.parse(cachedData) as FoodData;
          // Añadir la comida al tipo correspondiente
          if (foodData.tipo && updatedData.foods[foodData.tipo]) {
            updatedData.foods[foodData.tipo].push({
              ...foodData,
              id_comida: `offline-${Date.now()}`,
              isEditable: true,
              fecha: date,
              nombre_comida: foodData.nombre_comida || '',
              descripcion: foodData.descripcion || '',
              calorias: foodData.calorias || null,
              grasas: foodData.grasas || null,
              carbs: foodData.carbs || null,
              proteina: foodData.proteina || null,
            } as Food);
          }
        } else {
          // Si no hay datos locales, crear estructura básica
          updatedData = {
            foods: { Desayuno: [], Almuerzo: [], Merienda: [], Cena: [] },
            currentFoodType: null,
            isToday: true
          };
          
          if (foodData.tipo) {
            updatedData.foods[foodData.tipo] = [{
              ...foodData,
              id_comida: `offline-${Date.now()}`,
              isEditable: true,
              fecha: date,
              nombre_comida: foodData.nombre_comida || '',
              descripcion: foodData.descripcion || '',
              calorias: foodData.calorias || null,
              grasas: foodData.grasas || null,
              carbs: foodData.carbs || null,
              proteina: foodData.proteina || null,
            } as Food];
          }
        }
        
        // Guardar en localStorage
        localStorage.setItem(`food-${date}-${email}`, JSON.stringify(updatedData));
        
        // Actualizar estado
        setFoodsData(updatedData);
        
        addNotification(
          "⚠️ Error de Conexión",
          "No se pudo conectar con el servidor, pero tu comida se ha guardado localmente.",
          "warning"
        );
      } catch (localError) {
        console.error("Error saving food locally:", localError);
        setError("Error al guardar la comida localmente.");
      }
      
      setLoading(false);
      return false;
    }
  }, [addNotification, fetchFoodData]);

  const deleteFood = useCallback(async (email: string, date: string, foodId: string, backendUrl: string) => {
    if (!email || !date || !foodId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (navigator.onLine) {
        // Realizar petición online
        await axios.delete(`${backendUrl}/api/foods/delete`, {
          params: { id: foodId, email }
        });
        
        // Recargar datos actualizados
        await fetchFoodData(email, date, backendUrl);
        
        addNotification(
          "🗑️ Comida eliminada",
          "La comida ha sido eliminada correctamente.",
          "success"
        );
        
        setLoading(false);
        return true;
      } else {
        // En modo offline, actualizamos los datos locales
        const cachedData = localStorage.getItem(`food-${date}-${email}`);
        
        if (cachedData) {
          const updatedData = JSON.parse(cachedData) as FoodData;
          
          // Eliminar la comida de todas las categorías
          for (const type in updatedData.foods) {
            if (Object.prototype.hasOwnProperty.call(updatedData.foods, type)) {
              const foodType = type as FoodType;
              updatedData.foods[foodType] = updatedData.foods[foodType].filter(
                (food) => food.id_comida !== foodId
              );
            }
          }
          
          // Guardar en localStorage
          localStorage.setItem(`food-${date}-${email}`, JSON.stringify(updatedData));
          
          // Actualizar estado
          setFoodsData(updatedData);
          
          addNotification(
            "📱 Eliminado Offline",
            "La comida se ha eliminado localmente y se sincronizará cuando vuelvas a estar en línea.",
            "info"
          );
        }
        
        setLoading(false);
        return true;
      }
    } catch (error) {
      console.error("Error deleting food:", error);
      
      // Intentar actualizar localmente si hay error
      try {
        const cachedData = localStorage.getItem(`food-${date}-${email}`);
        
        if (cachedData) {
          const updatedData = JSON.parse(cachedData) as FoodData;
          
          // Eliminar la comida de todas las categorías
          for (const type in updatedData.foods) {
            if (Object.prototype.hasOwnProperty.call(updatedData.foods, type)) {
              const foodType = type as FoodType;
              updatedData.foods[foodType] = updatedData.foods[foodType].filter(
                (food) => food.id_comida !== foodId
              );
            }
          }
          
          // Guardar en localStorage
          localStorage.setItem(`food-${date}-${email}`, JSON.stringify(updatedData));
          
          // Actualizar estado
          setFoodsData(updatedData);
          
          addNotification(
            "⚠️ Error de Conexión",
            "No se pudo conectar con el servidor, pero la comida se ha eliminado localmente.",
            "warning"
          );
        }
      } catch (localError) {
        console.error("Error deleting food locally:", localError);
        setError("Error al eliminar la comida localmente.");
      }
      
      setLoading(false);
      return false;
    }
  }, [addNotification, fetchFoodData]);

  return {
    foodsData,
    loading,
    error,
    fetchFoodData,
    addFood,
    deleteFood
  };
}; 