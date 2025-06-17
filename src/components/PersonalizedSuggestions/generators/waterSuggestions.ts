import React from 'react';
import { Heart, Target, TrendingUp, CheckCircle, Shield, AlertCircle, Star, Lightbulb } from 'lucide-react';
import { Suggestion, UserData } from '../types';

export const generateWaterSuggestions = (userData: UserData): Suggestion[] => {
  const suggestions: Suggestion[] = [];
  const profile = userData.profile;
  const waterGoal = userData.waterGoal;
  const todayWater = userData.todayWater;

  if (!profile) return suggestions;

  const fitnessLevel = profile.nivel_fitness || 'principiante';
  const age = profile.edad || 25;
  const weight = profile.peso_actual_kg || 70;
  const goal = profile.objetivo_nutricional || 'maintain';
  const exerciseDays = profile.dias_ejercicio_semana || 0;

  // Water suggestions based on fitness level
  if (fitnessLevel === 'principiante') {
    suggestions.push({
      id: 'water-beginner-basics',
      type: 'support',
      priority: 'high',
      title: 'Fundamentos de hidratación',
      description: 'Como principiante, establece el hábito de beber agua regularmente. Lleva una botella contigo y bebe pequeños sorbos durante el día.',
      context: 'water',
      icon: React.createElement(Heart, { className: "w-5 h-5" }),
      category: 'health'
    });

    suggestions.push({
      id: 'water-beginner-timing',
      type: 'idea',
      priority: 'medium',
      title: 'Cuándo hidratarse',
      description: 'Bebe un vaso al despertar, antes de cada comida, y especialmente antes, durante y después del ejercicio.',
      context: 'water',
      icon: React.createElement(Target, { className: "w-5 h-5" }),
      category: 'lifestyle'
    });
  }

  if (fitnessLevel === 'intermedio') {
    suggestions.push({
      id: 'water-intermediate-performance',
      type: 'idea',
      priority: 'high',
      title: 'Hidratación para rendimiento',
      description: 'Optimiza tu hidratación: 500ml 2-3 horas antes del ejercicio, 200-300ml cada 15-20 min durante el entrenamiento.',
      context: 'water',
      icon: React.createElement(TrendingUp, { className: "w-5 h-5" }),
      category: 'health'
    });

    suggestions.push({
      id: 'water-intermediate-electrolytes',
      type: 'support',
      priority: 'medium',
      title: 'Electrolitos en entrenamientos largos',
      description: 'Para sesiones >60 min o mucho sudor, considera bebidas con electrolitos para reponer sodio, potasio y magnesio.',
      context: 'water',
      icon: React.createElement(CheckCircle, { className: "w-5 h-5" }),
      category: 'health'
    });
  }

  if (fitnessLevel === 'avanzado') {
    suggestions.push({
      id: 'water-advanced-strategy',
      type: 'idea',
      priority: 'high',
      title: 'Estrategia de hidratación avanzada',
      description: 'Monitorea tu tasa de sudoración (peso antes/después del ejercicio) para personalizar tu estrategia de reposición de fluidos.',
      context: 'water',
      icon: React.createElement(Star, { className: "w-5 h-5" }),
      category: 'health'
    });

    suggestions.push({
      id: 'water-advanced-monitoring',
      type: 'support',
      priority: 'medium',
      title: 'Monitoreo de hidratación',
      description: 'Usa indicadores como color de orina, peso corporal matutino y sensación de sed para evaluar tu estado de hidratación.',
      context: 'water',
      icon: React.createElement(CheckCircle, { className: "w-5 h-5" }),
      category: 'health'
    });
  }

  // Goal-specific suggestions
  if (goal === 'perder_peso' || goal === 'lose_weight') {
    suggestions.push({
      id: 'water-weight-loss-appetite',
      type: 'idea',
      priority: 'high',
      title: 'Agua para control del apetito',
      description: 'Bebe 500ml de agua 30 min antes de las comidas. Puede reducir la ingesta calórica en 13% y aumentar la saciedad.',
      context: 'water',
      icon: React.createElement(Target, { className: "w-5 h-5" }),
      category: 'lifestyle'
    });

    suggestions.push({
      id: 'water-weight-loss-metabolism',
      type: 'support',
      priority: 'medium',
      title: 'Agua fría para metabolismo',
      description: 'Beber agua fría (4°C) puede aumentar el gasto energético en 4.5% durante 60 min. Tu cuerpo gasta energía calentando el agua.',
      context: 'water',
      icon: React.createElement(TrendingUp, { className: "w-5 h-5" }),
      category: 'health'
    });
  }

  if (goal === 'ganar_musculo' || goal === 'gain_muscle') {
    suggestions.push({
      id: 'water-muscle-gain-synthesis',
      type: 'idea',
      priority: 'high',
      title: 'Hidratación para síntesis proteica',
      description: 'La deshidratación reduce la síntesis proteica en 15-20%. Mantén hidratación óptima para maximizar la construcción muscular.',
      context: 'water',
      icon: React.createElement(TrendingUp, { className: "w-5 h-5" }),
      category: 'health'
    });

    suggestions.push({
      id: 'water-muscle-gain-performance',
      type: 'support',
      priority: 'medium',
      title: 'Rendimiento en el gimnasio',
      description: 'Solo 2% de deshidratación reduce la fuerza en 10%. Bebe agua durante entrenamientos largos para mantener el rendimiento.',
      context: 'water',
      icon: React.createElement(CheckCircle, { className: "w-5 h-5" }),
      category: 'health'
    });
  }

  // High activity suggestions
  if (exerciseDays >= 5) {
    suggestions.push({
      id: 'water-active-hydration',
      type: 'warning',
      priority: 'high',
      title: 'Hidratación para atletas',
      description: 'Como persona muy activa, necesitas 500-750ml adicionales por cada hora de ejercicio intenso. Monitorea el color de tu orina como indicador.',
      context: 'water',
      icon: React.createElement(AlertCircle, { className: "w-5 h-5" }),
      category: 'health'
    });

    suggestions.push({
      id: 'water-high-activity-electrolytes',
      type: 'idea',
      priority: 'high',
      title: 'Electrolitos para alta actividad',
      description: 'Con entrenamientos frecuentes, no solo repones agua sino electrolitos: 300-500mg sodio, 150-300mg potasio por hora de ejercicio.',
      context: 'water',
      icon: React.createElement(Star, { className: "w-5 h-5" }),
      category: 'health'
    });
  }

  // Weight-based suggestions
  if (weight > 80) {
    const recommendedWater = Math.round(weight * 35);
    suggestions.push({
      id: 'water-weight-based',
      type: 'idea',
      priority: 'medium',
      title: 'Hidratación según tu peso',
      description: `Con tu peso actual, deberías consumir aproximadamente ${recommendedWater}ml de agua diariamente (35ml por kg de peso corporal).`,
      context: 'water',
      icon: React.createElement(Target, { className: "w-5 h-5" }),
      category: 'health'
    });
  }

  // Age-based suggestions
  if (age > 60) {
    suggestions.push({
      id: 'water-elderly-sensation',
      type: 'warning',
      priority: 'high',
      title: 'Sed disminuye con la edad',
      description: 'Después de los 60, la sensación de sed se reduce. Establece recordatorios para beber agua regularmente, no esperes a tener sed.',
      context: 'water',
      icon: React.createElement(AlertCircle, { className: "w-5 h-5" }),
      category: 'health'
    });
  }

  if (age > 50) {
    suggestions.push({
      id: 'water-age-considerations',
      type: 'prevention',
      priority: 'medium',
      title: 'Hidratación después de los 50',
      description: 'Con la edad, la sensación de sed disminuye. Establece recordatorios regulares para beber agua y monitorea tu hidratación más de cerca.',
      context: 'water',
      icon: React.createElement(Shield, { className: "w-5 h-5" }),
      category: 'health'
    });
  }

  // Seasonal suggestions
  const currentMonth = new Date().getMonth();
  const isSummer = currentMonth >= 5 && currentMonth <= 8;
  const isWinter = currentMonth >= 11 || currentMonth <= 2;

  if (isSummer) {
    suggestions.push({
      id: 'water-summer-heat',
      type: 'warning',
      priority: 'high',
      title: 'Hidratación en verano',
      description: 'En clima caluroso, aumenta tu ingesta base en 500-750ml. El calor aumenta las pérdidas por sudoración incluso en reposo.',
      context: 'water',
      icon: React.createElement(AlertCircle, { className: "w-5 h-5" }),
      category: 'health'
    });
  }

  if (isWinter) {
    suggestions.push({
      id: 'water-winter-indoor',
      type: 'idea',
      priority: 'medium',
      title: 'Hidratación en invierno',
      description: 'La calefacción interior puede deshidratarte. Aunque sudes menos, mantén tu ingesta de agua. El aire seco aumenta las pérdidas respiratorias.',
      context: 'water',
      icon: React.createElement(Lightbulb, { className: "w-5 h-5" }),
      category: 'health'
    });
  }

  // General suggestions
  suggestions.push({
    id: 'water-quality-importance',
    type: 'idea',
    priority: 'medium',
    title: 'Calidad del agua importa',
    description: 'Usa filtros si tu agua tiene cloro/metales pesados. Considera agua mineral natural para obtener electrolitos adicionales de forma natural.',
    context: 'water',
    icon: React.createElement(Lightbulb, { className: "w-5 h-5" }),
    category: 'health'
  });

  suggestions.push({
    id: 'water-habit-formation',
    type: 'support',
    priority: 'medium',
    title: 'Forma el hábito gradualmente',
    description: 'Si bebes poca agua, aumenta gradualmente 250ml cada 3-4 días. Cambios drásticos son difíciles de mantener y pueden causar molestias.',
    context: 'water',
    icon: React.createElement(Heart, { className: "w-5 h-5" }),
    category: 'lifestyle'
  });

  // Water intake suggestions based on current consumption
  if (waterGoal && todayWater !== undefined) {
    const waterPercentage = (todayWater / waterGoal) * 100;
    
    if (waterPercentage < 30) {
      suggestions.push({
        id: 'water-low-intake',
        type: 'warning',
        priority: 'high',
        title: 'Hidratación muy baja',
        description: 'Has consumido menos del 30% de tu objetivo de agua. La deshidratación puede afectar tu rendimiento físico y mental.',
        context: 'water',
        icon: React.createElement(AlertCircle, { className: "w-5 h-5" }),
        category: 'health'
      });
    } else if (waterPercentage >= 100) {
      suggestions.push({
        id: 'water-goal-achieved',
        type: 'achievement',
        priority: 'low',
        title: '¡Objetivo de hidratación alcanzado!',
        description: 'Excelente trabajo manteniendo una hidratación adecuada. Esto beneficia tu metabolismo y rendimiento.',
        context: 'water',
        icon: React.createElement(CheckCircle, { className: "w-5 h-5" }),
        category: 'health'
      });
    }
  }

  return suggestions;
}; 