import React from 'react';

export interface UserProfile {
  nivel_fitness?: 'principiante' | 'intermedio' | 'avanzado';
  puntuacion_fitness?: number;
  objetivo_nutricional?: string;
  dias_ejercicio_semana?: number;
  experiencia_ejercicio?: string;
  nivel_actividad?: string;
  condiciones_medicas?: string[];
  lesiones_previas?: string[];
  nivel_estres?: string;
  horas_sueno_promedio?: number;
  edad?: number;
  peso_actual_kg?: number;
  altura_cm?: number;
  peso_objetivo_kg?: number;
  comidas_por_dia?: number;
  restricciones_alimentarias?: string[];
  alergias_alimentarias?: string[];
}

export interface UserData {
  profile: UserProfile | null;
  calorieGoal?: number | null;
  waterGoal?: number | null;
  todayCalories?: number;
  todayWater?: number;
  recentActivity?: {
    lastWorkout?: string;
    workoutFrequency?: number;
    lastMealLogged?: string;
    mealLoggingStreak?: number;
  };
}

export interface Suggestion {
  id: string;
  type: 'prevention' | 'support' | 'idea' | 'warning' | 'achievement';
  title: string;
  description: string;
  icon: React.ReactNode;
  priority: 'high' | 'medium' | 'low';
  category: 'nutrition' | 'exercise' | 'recovery' | 'lifestyle' | 'health';
  context: string;
}

export interface PersonalizedSuggestionsProps {
  userProfile: UserProfile | null;
  context?: 'dashboard' | 'nutrition' | 'exercise' | 'general' | 'water' | 'settings' | 'progress' | 'ai_food' | 'recipes' | 'rm_progress' | 'routines';
  maxSuggestions?: number;
  showCategories?: boolean;
  userData?: UserData;
}

export type SuggestionContext = 
  | 'dashboard' 
  | 'nutrition' 
  | 'exercise' 
  | 'general' 
  | 'water' 
  | 'settings' 
  | 'progress'
  | 'ai_food'
  | 'recipes'
  | 'rm_progress'
  | 'routines';

export type SuggestionType = 'prevention' | 'support' | 'idea' | 'warning' | 'achievement';
export type SuggestionPriority = 'high' | 'medium' | 'low';
export type SuggestionCategory = 'nutrition' | 'exercise' | 'recovery' | 'lifestyle' | 'health';