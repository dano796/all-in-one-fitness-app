import React from 'react';
import { Star, Target, TrendingUp, CheckCircle, Shield, Heart, Calendar, Activity } from 'lucide-react';
import { Suggestion, UserData } from '../types';

export const generateRoutinesSuggestions = (userData: UserData): Suggestion[] => {
  const suggestions: Suggestion[] = [];
  const profile = userData.profile;

  if (!profile) return suggestions;

  const fitnessLevel = profile.nivel_fitness || 'principiante';
  const daysPerWeek = profile.dias_ejercicio_semana || 2;

  // Sugerencias basadas en nivel de fitness
  if (fitnessLevel === 'principiante') {
    suggestions.push({
      id: 'routines-beginner-fullbody',
      type: 'support',
      priority: 'high',
      title: '¡Comienza con rutinas de cuerpo completo!',
      description: 'Como principiante, las rutinas de cuerpo completo 2-3 veces por semana son ideales. Trabajarás todos los grupos musculares y tendrás tiempo suficiente para recuperarte.',
      context: 'routines',
      icon: React.createElement(Star, { className: "w-5 h-5" }),
      category: 'exercise'
    });

    suggestions.push({
      id: 'routines-beginner-basics',
      type: 'idea',
      priority: 'high',
      title: 'Domina los ejercicios básicos',
      description: 'Enfócate en sentadillas, flexiones, planchas y dominadas asistidas. La técnica correcta es más importante que el peso o la intensidad.',
      context: 'routines',
      icon: React.createElement(Target, { className: "w-5 h-5" }),
      category: 'exercise'
    });
  }

  if (fitnessLevel === 'intermedio') {
    suggestions.push({
      id: 'routines-intermediate-split',
      type: 'idea',
      priority: 'high',
      title: 'Considera rutinas divididas',
      description: 'Puedes empezar a dividir tu entrenamiento: Día 1 - Empuje (pecho, hombros, tríceps), Día 2 - Tirón (espalda, bíceps), Día 3 - Piernas.',
      context: 'routines',
      icon: React.createElement(TrendingUp, { className: "w-5 h-5" }),
      category: 'exercise'
    });

    suggestions.push({
      id: 'routines-intermediate-progression',
      type: 'support',
      priority: 'medium',
      title: 'Implementa progresión estructurada',
      description: 'Usa periodización: 3-4 semanas aumentando intensidad, seguidas de 1 semana de descarga para evitar sobreentrenamiento.',
      context: 'routines',
      icon: React.createElement(Calendar, { className: "w-5 h-5" }),
      category: 'exercise'
    });
  }

  if (fitnessLevel === 'avanzado') {
    suggestions.push({
      id: 'routines-advanced-specialization',
      type: 'idea',
      priority: 'high',
      title: 'Especialízate en tus debilidades',
      description: 'Identifica grupos musculares o patrones de movimiento débiles y dedica bloques específicos para mejorarlos.',
      context: 'routines',
      icon: React.createElement(Target, { className: "w-5 h-5" }),
      category: 'exercise'
    });

    suggestions.push({
      id: 'routines-advanced-techniques',
      type: 'idea',
      priority: 'medium',
      title: 'Incorpora técnicas avanzadas',
      description: 'Experimenta con drop sets, rest-pause, clusters o entrenamiento unilateral para romper mesetas.',
      context: 'routines',
      icon: React.createElement(Activity, { className: "w-5 h-5" }),
      category: 'exercise'
    });
  }

  // Sugerencias basadas en días de ejercicio por semana
  if (daysPerWeek <= 2) {
    suggestions.push({
      id: 'routines-low-frequency',
      type: 'support',
      priority: 'high',
      title: 'Maximiza tus 2 días de entrenamiento',
      description: 'Con pocos días disponibles, enfócate en ejercicios compuestos que trabajen múltiples grupos musculares: sentadillas, peso muerto, press de banca, remo.',
      context: 'routines',
      icon: React.createElement(CheckCircle, { className: "w-5 h-5" }),
      category: 'exercise'
    });
  } else if (daysPerWeek >= 5) {
    suggestions.push({
      id: 'routines-high-frequency',
      type: 'prevention',
      priority: 'high',
      title: 'Cuidado con el sobreentrenamiento',
      description: 'Con 5+ días de ejercicio, asegúrate de alternar grupos musculares y incluir días de recuperación activa o completa.',
      context: 'routines',
      icon: React.createElement(Shield, { className: "w-5 h-5" }),
      category: 'recovery'
    });
  }

  // Sugerencias generales para estructurar entrenamientos
  suggestions.push({
    id: 'routines-strength-basics',
    type: 'idea',
    priority: 'medium',
    title: 'Estructura un entrenamiento efectivo',
    description: 'Un buen entrenamiento incluye: calentamiento (5-10 min), ejercicios principales, ejercicios accesorios y enfriamiento/estiramiento.',
    context: 'routines',
    icon: React.createElement(TrendingUp, { className: "w-5 h-5" }),
    category: 'exercise'
  });

  suggestions.push({
    id: 'routines-cardio-integration',
    type: 'idea',
    priority: 'medium',
    title: 'Combina cardio y fuerza inteligentemente',
    description: 'Si haces cardio y fuerza el mismo día, haz fuerza primero. Considera HIIT 2-3 veces por semana para maximizar beneficios en menos tiempo.',
    context: 'routines',
    icon: React.createElement(Heart, { className: "w-5 h-5" }),
    category: 'exercise'
  });

  // Sugerencias generales de organización
  suggestions.push({
    id: 'routines-planning',
    type: 'support',
    priority: 'medium',
    title: 'Planifica tu semana de entrenamiento',
    description: 'Asigna cada rutina a días específicos. Considera tu horario personal y niveles de energía para maximizar la adherencia.',
    context: 'routines',
    icon: React.createElement(Calendar, { className: "w-5 h-5" }),
    category: 'lifestyle'
  });

  suggestions.push({
    id: 'routines-tracking',
    type: 'idea',
    priority: 'medium',
    title: 'Registra tu progreso',
    description: 'Lleva un registro de ejercicios, series, repeticiones y pesos. Esto te permitirá ver tu progreso y planificar incrementos apropiados.',
    context: 'routines',
    icon: React.createElement(CheckCircle, { className: "w-5 h-5" }),
    category: 'exercise'
  });

  // Sugerencias adicionales basadas en días de entrenamiento
  if (daysPerWeek <= 2) {
    suggestions.push({
      id: 'routines-fullbody-focus',
      type: 'support',
      priority: 'high',
      title: 'Optimiza rutinas de cuerpo completo',
      description: 'Con 2 días de entrenamiento, enfócate en ejercicios compuestos: sentadillas, peso muerto, press banca, remo y press militar.',
      context: 'routines',
      icon: React.createElement(Star, { className: "w-5 h-5" }),
      category: 'exercise'
    });
  } else if (daysPerWeek >= 4) {
    suggestions.push({
      id: 'routines-split-optimization',
      type: 'idea',
      priority: 'high',
      title: 'Optimiza tu rutina dividida',
      description: 'Con 4+ días, puedes dedicar sesiones específicas a diferentes grupos musculares o patrones de movimiento para mayor volumen.',
      context: 'routines',
      icon: React.createElement(TrendingUp, { className: "w-5 h-5" }),
      category: 'exercise'
    });
  }

  // Sugerencias específicas para principiantes adicionales
  if (fitnessLevel === 'principiante') {
    suggestions.push({
      id: 'routines-beginner-technique',
      type: 'prevention',
      priority: 'high',
      title: 'La técnica es lo primero',
      description: 'Antes de aumentar peso o intensidad, asegúrate de dominar la técnica correcta. Considera trabajar con un entrenador al principio.',
      context: 'routines',
      icon: React.createElement(Shield, { className: "w-5 h-5" }),
      category: 'exercise'
    });
  }

  return suggestions;
};
