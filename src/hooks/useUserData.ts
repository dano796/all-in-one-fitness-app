import { useState, useEffect, useMemo } from 'react';
import { useUserProfile } from './useUserProfile';
import axios from 'axios';
import { supabase } from '../lib/supabaseClient';

interface UserData {
  profile: any;
  calorieGoal: number | null;
  waterGoal: number | null;
  todayCalories: number;
  todayWater: number;
  recentActivity: {
    lastWorkout?: string;
    workoutFrequency?: number;
    lastMealLogged?: string;
    mealLoggingStreak?: number;
  };
}

export const useUserData = () => {
  const { profile } = useUserProfile();
  const [userData, setUserData] = useState<UserData>({
    profile: null,
    calorieGoal: null,
    waterGoal: null,
    todayCalories: 0,
    todayWater: 0,
    recentActivity: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize profile ID to avoid unnecessary re-fetches
  const profileId = useMemo(() => profile?.id_profile, [profile?.id_profile]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user?.email) {
          setError('Usuario no autenticado');
          return;
        }

        const email = user.email;
        const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });

        // Obtener datos en paralelo
        const [calorieGoalRes, waterGoalRes, foodDataRes, waterDataRes] = await Promise.allSettled([
          // Objetivo de calorías
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/get-calorie-goal`, {
            params: { email }
          }),
          
          // Objetivo de agua
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/water/get-goal`, {
            params: { email }
          }),
          
          // Datos de comida del día
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/foods/user`, {
            params: { email, date: today }
          }),
          
          // Datos de agua del día
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/water/user`, {
            params: { email, date: today }
          })
        ]);

        // Procesar objetivo de calorías
        let calorieGoal = null;
        if (calorieGoalRes.status === 'fulfilled') {
          calorieGoal = calorieGoalRes.value.data.calorieGoal;
        }

        // Procesar objetivo de agua
        let waterGoal = null;
        if (waterGoalRes.status === 'fulfilled') {
          waterGoal = waterGoalRes.value.data.waterGoal;
        }

        // Procesar calorías del día
        let todayCalories = 0;
        if (foodDataRes.status === 'fulfilled') {
          const foodData = foodDataRes.value.data;
          if (foodData.foods) {
            const allFoods = [
              ...(foodData.foods.Desayuno || []),
              ...(foodData.foods.Almuerzo || []),
              ...(foodData.foods.Merienda || []),
              ...(foodData.foods.Cena || [])
            ];
            todayCalories = allFoods.reduce((total, food) => {
              const calories = parseFloat(food.calorias || '0');
              return total + (isNaN(calories) ? 0 : calories);
            }, 0);
          }
        }

        // Procesar agua del día
        let todayWater = 0;
        if (waterDataRes.status === 'fulfilled') {
          const waterData = waterDataRes.value.data;
          if (waterData.waterIntake) {
            todayWater = waterData.waterIntake;
          }
        }

        setUserData(prevData => ({
          ...prevData,
          profile,
          calorieGoal,
          waterGoal,
          todayCalories,
          todayWater,
          recentActivity: {
            // Estos se pueden expandir más tarde con datos de rutinas, etc.
          }
        }));

      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Error al cargar datos del usuario');
      } finally {
        setLoading(false);
      }
    };

    if (profileId || profile !== null) {
      fetchUserData();
    }
  }, [profileId]);

  return { userData, loading, error };
}; 