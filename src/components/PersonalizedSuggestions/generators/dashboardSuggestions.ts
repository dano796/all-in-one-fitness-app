import React from 'react';
import { Star, Target, TrendingUp, CheckCircle, Shield, Heart, AlertCircle } from 'lucide-react';
import { Suggestion, UserData } from '../types';

export const generateDashboardSuggestions = (userData: UserData): Suggestion[] => {
  const suggestions: Suggestion[] = [];
  const profile = userData.profile;

  if (!profile) return suggestions;

  const fitnessLevel = profile.nivel_fitness || 'principiante';
  const age = profile.edad || 25;
  const goal = profile.objetivo_nutricional || 'maintain';
  const stressLevel = profile.nivel_estres || 'medio';
  const sleepHours = profile.horas_sueno_promedio || 8;

  // Dashboard - Vista general personalizada
  if (fitnessLevel === 'principiante') {
    suggestions.push({
      id: 'dashboard-beginner-welcome',
      type: 'support',
      priority: 'high',
      title: '¡Bienvenido a tu viaje fitness!',
      description: 'Como principiante, enfócate en crear hábitos consistentes. Comienza con 2-3 días de ejercicio por semana y registra tus comidas diariamente.',
      context: 'dashboard',
      icon: React.createElement(Star, { className: "w-5 h-5" }),
      category: 'lifestyle'
    });

    suggestions.push({
      id: 'dashboard-beginner-basics',
      type: 'idea',
      priority: 'high',
      title: 'Domina los fundamentos',
      description: 'Aprende ejercicios básicos como sentadillas, flexiones y plancha. La técnica correcta es más importante que el peso o la intensidad.',
      context: 'dashboard',
      icon: React.createElement(Target, { className: "w-5 h-5" }),
      category: 'exercise'
    });
  }

  if (fitnessLevel === 'intermedio') {
    suggestions.push({
      id: 'dashboard-intermediate-progression',
      type: 'idea',
      priority: 'high',
      title: 'Optimiza tu progresión',
      description: 'Es momento de implementar periodización en tu entrenamiento. Alterna entre fases de fuerza, hipertrofia y resistencia cada 4-6 semanas.',
      context: 'dashboard',
      icon: React.createElement(TrendingUp, { className: "w-5 h-5" }),
      category: 'exercise'
    });

    suggestions.push({
      id: 'dashboard-intermediate-tracking',
      type: 'support',
      priority: 'medium',
      title: 'Monitorea tu progreso detalladamente',
      description: 'Lleva un registro preciso de tus entrenamientos, pesos y repeticiones. Usa métricas como volumen de entrenamiento y progresión de cargas.',
      context: 'dashboard',
      icon: React.createElement(CheckCircle, { className: "w-5 h-5" }),
      category: 'exercise'
    });
  }

  if (fitnessLevel === 'avanzado') {
    suggestions.push({
      id: 'dashboard-advanced-specialization',
      type: 'idea',
      priority: 'high',
      title: 'Especialización inteligente',
      description: 'Identifica tus puntos débiles y dedica bloques específicos para mejorarlos. Considera técnicas avanzadas como clusters, rest-pause o drop sets.',
      context: 'dashboard',
      icon: React.createElement(Star, { className: "w-5 h-5" }),
      category: 'exercise'
    });

    suggestions.push({
      id: 'dashboard-advanced-recovery',
      type: 'prevention',
      priority: 'high',
      title: 'Recuperación de élite',
      description: 'A tu nivel, la recuperación es crucial. Implementa técnicas como HRV monitoring, terapia de frío/calor, y masajes regulares.',
      context: 'dashboard',
      icon: React.createElement(Shield, { className: "w-5 h-5" }),
      category: 'recovery'
    });
  }

  // Sugerencias basadas en objetivos
  if (goal === 'perder_peso' || goal === 'lose_weight') {
    suggestions.push({
      id: 'dashboard-weight-loss-strategy',
      type: 'idea',
      priority: 'high',
      title: 'Estrategia de pérdida de peso',
      description: 'Mantén un déficit calórico de 300-500 cal/día. Combina cardio moderado con entrenamiento de fuerza para preservar masa muscular.',
      context: 'dashboard',
      icon: React.createElement(Target, { className: "w-5 h-5" }),
      category: 'nutrition'
    });

    suggestions.push({
      id: 'dashboard-weight-loss-mindset',
      type: 'support',
      priority: 'medium',
      title: 'Mentalidad para perder peso',
      description: 'Enfócate en crear hábitos sostenibles, no en dietas extremas. Celebra las victorias no relacionadas con la báscula: más energía, mejor sueño, ropa que queda mejor.',
      context: 'dashboard',
      icon: React.createElement(Heart, { className: "w-5 h-5" }),
      category: 'lifestyle'
    });
  }

  if (goal === 'ganar_musculo' || goal === 'gain_muscle') {
    suggestions.push({
      id: 'dashboard-muscle-gain-strategy',
      type: 'idea',
      priority: 'high',
      title: 'Estrategia de ganancia muscular',
      description: 'Mantén un ligero superávit calórico (200-300 cal/día) y consume 1.6-2.2g de proteína por kg de peso corporal. Entrena con sobrecarga progresiva.',
      context: 'dashboard',
      icon: React.createElement(TrendingUp, { className: "w-5 h-5" }),
      category: 'nutrition'
    });

    suggestions.push({
      id: 'dashboard-muscle-gain-patience',
      type: 'support',
      priority: 'medium',
      title: 'Paciencia en la ganancia muscular',
      description: 'La ganancia muscular es lenta: 0.5-1kg por mes para principiantes, menos para avanzados. Enfócate en el progreso en el gimnasio, no solo en la báscula.',
      context: 'dashboard',
      icon: React.createElement(Star, { className: "w-5 h-5" }),
      category: 'lifestyle'
    });
  }

  // Sugerencias basadas en edad
  if (age < 25) {
    suggestions.push({
      id: 'dashboard-young-advantage',
      type: 'idea',
      priority: 'medium',
      title: 'Aprovecha tu juventud',
      description: 'A tu edad, tienes ventajas metabólicas y de recuperación. Es el momento perfecto para construir una base sólida de fuerza y hábitos saludables.',
      context: 'dashboard',
      icon: React.createElement(Star, { className: "w-5 h-5" }),
      category: 'lifestyle'
    });
  }

  if (age >= 40) {
    suggestions.push({
      id: 'dashboard-mature-wisdom',
      type: 'prevention',
      priority: 'high',
      title: 'Entrenamiento inteligente +40',
      description: 'Prioriza la longevidad: calentamientos más largos, trabajo de movilidad diario, y escucha más a tu cuerpo. La consistencia vence a la intensidad.',
      context: 'dashboard',
      icon: React.createElement(Shield, { className: "w-5 h-5" }),
      category: 'recovery'
    });
  }

  // Sugerencias basadas en estrés
  if (stressLevel === 'alto') {
    suggestions.push({
      id: 'dashboard-stress-exercise',
      type: 'idea',
      priority: 'high',
      title: 'Ejercicio como antiestrés',
      description: 'El ejercicio reduce el cortisol y libera endorfinas. En días estresantes, prefiere entrenamientos moderados o yoga en lugar de sesiones muy intensas.',
      context: 'dashboard',
      icon: React.createElement(Heart, { className: "w-5 h-5" }),
      category: 'lifestyle'
    });
  }

  // Sugerencias basadas en sueño
  if (sleepHours < 7) {
    suggestions.push({
      id: 'dashboard-sleep-performance',
      type: 'warning',
      priority: 'high',
      title: 'El sueño es tu superpoder',
      description: 'Dormir <7h reduce la síntesis proteica en 18% y aumenta el cortisol. Prioriza 7-9h de sueño para maximizar tus resultados fitness.',
      context: 'dashboard',
      icon: React.createElement(AlertCircle, { className: "w-5 h-5" }),
      category: 'recovery'
    });
  }

  return suggestions;
}; 