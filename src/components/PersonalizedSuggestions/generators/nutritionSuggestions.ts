import React from 'react';
import { Target, Heart, Star, Lightbulb, TrendingUp, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import { Suggestion } from '../types';

export const generateNutritionSuggestions = (userData: any): Suggestion[] => {
  const suggestions: Suggestion[] = [];
  
  if (!userData || !userData.profile) return suggestions;

  const profile = userData.profile;
  const fitnessLevel = profile.nivel_fitness || 'principiante';
  const goal = profile.objetivo_nutricional || 'mantener_peso';
  const restrictions = profile.restricciones_alimentarias || [];
  const allergies = profile.alergias_alimentarias || [];
  const exerciseDays = profile.dias_ejercicio_semana || 0;
  const age = profile.edad || 25;
  const mealsPerDay = profile.comidas_por_dia || 3;

  // Sugerencias basadas en nivel de fitness
  if (fitnessLevel === 'principiante') {
    suggestions.push({
      id: 'nutrition-beginner-tracking',
      type: 'idea',
      priority: 'high',
      title: 'Comienza registrando tus comidas',
      description: 'El primer paso es tomar conciencia de lo que comes. Registra todas tus comidas durante una semana para identificar patrones y áreas de mejora.',
      context: 'nutrition',
      icon: React.createElement(Target, { className: "w-5 h-5" }),
      category: 'nutrition'
    });

    suggestions.push({
      id: 'nutrition-beginner-portions',
      type: 'support',
      priority: 'high',
      title: 'Aprende sobre porciones',
      description: 'Usa tu mano como guía: palma = proteína, puño = verduras, cuenco = carbohidratos, pulgar = grasas saludables.',
      context: 'nutrition',
      icon: React.createElement(Lightbulb, { className: "w-5 h-5" }),
      category: 'nutrition'
    });

    suggestions.push({
      id: 'nutrition-beginner-balance',
      type: 'idea',
      priority: 'medium',
      title: 'Equilibra tus comidas',
      description: 'Incluye proteína, carbohidratos complejos, grasas saludables y vegetales en cada comida principal para una nutrición óptima.',
      context: 'nutrition',
      icon: React.createElement(CheckCircle, { className: "w-5 h-5" }),
      category: 'nutrition'
    });
  }

  if (fitnessLevel === 'intermedio') {
    suggestions.push({
      id: 'nutrition-intermediate-macros',
      type: 'idea',
      priority: 'high',
      title: 'Enfócate en macronutrientes',
      description: 'Aprende a balancear proteínas, carbohidratos y grasas según tu objetivo. Considera usar una proporción 40-30-30 como punto de partida.',
      context: 'nutrition',
      icon: React.createElement(TrendingUp, { className: "w-5 h-5" }),
      category: 'nutrition'
    });

    suggestions.push({
      id: 'nutrition-intermediate-timing',
      type: 'support',
      priority: 'medium',
      title: 'Optimiza el timing nutricional',
      description: 'Come proteína y carbohidratos dentro de 2 horas después del ejercicio para maximizar la recuperación y el crecimiento muscular.',
      context: 'nutrition',
      icon: React.createElement(Target, { className: "w-5 h-5" }),
      category: 'nutrition'
    });
  }

  if (fitnessLevel === 'avanzado') {
    suggestions.push({
      id: 'nutrition-advanced-periodization',
      type: 'idea',
      priority: 'high',
      title: 'Periodiza tu nutrición',
      description: 'Ajusta tu ingesta calórica y de macros según tu fase de entrenamiento: más carbohidratos en volumen, más proteína en definición.',
      context: 'nutrition',
      icon: React.createElement(Star, { className: "w-5 h-5" }),
      category: 'nutrition'
    });

    suggestions.push({
      id: 'nutrition-advanced-micronutrients',
      type: 'support',
      priority: 'medium',
      title: 'Optimiza micronutrientes',
      description: 'Asegúrate de obtener vitaminas y minerales esenciales. Considera análisis de sangre para identificar posibles deficiencias.',
      context: 'nutrition',
      icon: React.createElement(Shield, { className: "w-5 h-5" }),
      category: 'health'
    });
  }

  // Sugerencias basadas en objetivos
  if (goal === 'perder_peso' || goal === 'lose_weight') {
    suggestions.push({
      id: 'nutrition-weight-loss-deficit',
      type: 'support',
      priority: 'high',
      title: 'Mantén un déficit calórico moderado',
      description: 'Apunta a un déficit de 300-500 calorías diarias para una pérdida de peso sostenible de 0.5-0.7 kg por semana.',
      context: 'nutrition',
      icon: React.createElement(Target, { className: "w-5 h-5" }),
      category: 'nutrition'
    });

    suggestions.push({
      id: 'nutrition-weight-loss-protein',
      type: 'idea',
      priority: 'high',
      title: 'Prioriza la proteína',
      description: 'Consume 1.6-2.2g de proteína por kg de peso corporal para preservar masa muscular durante la pérdida de peso.',
      context: 'nutrition',
      icon: React.createElement(TrendingUp, { className: "w-5 h-5" }),
      category: 'nutrition'
    });

    suggestions.push({
      id: 'nutrition-weight-loss-fiber',
      type: 'support',
      priority: 'medium',
      title: 'Aumenta la fibra',
      description: 'Los alimentos ricos en fibra te ayudan a sentirte satisfecho con menos calorías. Apunta a 25-35g de fibra diaria.',
      context: 'nutrition',
      icon: React.createElement(Heart, { className: "w-5 h-5" }),
      category: 'nutrition'
    });
  }

  if (goal === 'ganar_musculo' || goal === 'gain_muscle') {
    suggestions.push({
      id: 'nutrition-muscle-gain-surplus',
      type: 'idea',
      priority: 'high',
      title: 'Mantén un superávit calórico',
      description: 'Consume 200-500 calorías por encima de tu mantenimiento para apoyar el crecimiento muscular sin ganar grasa excesiva.',
      context: 'nutrition',
      icon: React.createElement(TrendingUp, { className: "w-5 h-5" }),
      category: 'nutrition'
    });

    suggestions.push({
      id: 'nutrition-muscle-gain-protein-timing',
      type: 'support',
      priority: 'high',
      title: 'Distribuye la proteína',
      description: 'Consume 20-40g de proteína en cada comida para optimizar la síntesis de proteínas musculares a lo largo del día.',
      context: 'nutrition',
      icon: React.createElement(CheckCircle, { className: "w-5 h-5" }),
      category: 'nutrition'
    });

    suggestions.push({
      id: 'nutrition-muscle-gain-carbs',
      type: 'idea',
      priority: 'medium',
      title: 'No temas a los carbohidratos',
      description: 'Los carbohidratos alimentan tus entrenamientos y ayudan en la recuperación. Consume 4-7g por kg de peso corporal.',
      context: 'nutrition',
      icon: React.createElement(Star, { className: "w-5 h-5" }),
      category: 'nutrition'
    });
  }

  if (goal === 'mantener_peso' || goal === 'maintain') {
    suggestions.push({
      id: 'nutrition-maintenance-balance',
      type: 'idea',
      priority: 'high',
      title: 'Mantén el equilibrio',
      description: 'Enfócate en la calidad de los alimentos y mantén un balance entre todos los grupos alimentarios para una salud óptima.',
      context: 'nutrition',
      icon: React.createElement(CheckCircle, { className: "w-5 h-5" }),
      category: 'nutrition'
    });

    suggestions.push({
      id: 'nutrition-maintenance-consistency',
      type: 'support',
      priority: 'medium',
      title: 'Consistencia sobre perfección',
      description: 'Es mejor seguir un plan nutricional bueno de manera consistente que un plan perfecto de manera esporádica.',
      context: 'nutrition',
      icon: React.createElement(Heart, { className: "w-5 h-5" }),
      category: 'lifestyle'
    });
  }

  // Sugerencias basadas en restricciones alimentarias
  if (restrictions.some((r: string) => r.toLowerCase().includes('vegetarian'))) {
    suggestions.push({
      id: 'nutrition-vegetarian-protein',
      type: 'support',
      priority: 'high',
      title: 'Combina proteínas vegetales',
      description: 'Combina legumbres con cereales (arroz + frijoles, hummus + pan) para obtener proteínas completas con todos los aminoácidos esenciales.',
      context: 'nutrition',
      icon: React.createElement(Heart, { className: "w-5 h-5" }),
      category: 'nutrition'
    });

    suggestions.push({
      id: 'nutrition-vegetarian-b12',
      type: 'warning',
      priority: 'medium',
      title: 'Vigila la vitamina B12',
      description: 'La B12 es difícil de obtener en dietas vegetarianas. Considera alimentos fortificados o suplementación.',
      context: 'nutrition',
      icon: React.createElement(AlertCircle, { className: "w-5 h-5" }),
      category: 'health'
    });
  }

  if (restrictions.some((r: string) => r.toLowerCase().includes('gluten'))) {
    suggestions.push({
      id: 'nutrition-gluten-free-grains',
      type: 'support',
      priority: 'medium',
      title: 'Explora granos sin gluten',
      description: 'Quinoa, arroz integral, avena certificada sin gluten, y amaranto son excelentes fuentes de carbohidratos complejos.',
      context: 'nutrition',
      icon: React.createElement(Shield, { className: "w-5 h-5" }),
      category: 'nutrition'
    });
  }

  // Sugerencias basadas en alergias
  if (allergies.length > 0) {
    suggestions.push({
      id: 'nutrition-allergy-alternatives',
      type: 'warning',
      priority: 'high',
      title: 'Encuentra alternativas nutritivas',
      description: 'Asegúrate de reemplazar los nutrientes de los alimentos que no puedes consumir. Consulta con un nutricionista si es necesario.',
      context: 'nutrition',
      icon: React.createElement(AlertCircle, { className: "w-5 h-5" }),
      category: 'health'
    });
  }

  // Sugerencias basadas en frecuencia de ejercicio
  if (exerciseDays >= 5) {
    suggestions.push({
      id: 'nutrition-high-activity-recovery',
      type: 'idea',
      priority: 'high',
      title: 'Prioriza la recuperación',
      description: 'Con entrenamientos frecuentes, incluye alimentos antiinflamatorios como pescado azul, frutos rojos, y verduras de hoja verde.',
      context: 'nutrition',
      icon: React.createElement(Heart, { className: "w-5 h-5" }),
      category: 'recovery'
    });

    suggestions.push({
      id: 'nutrition-high-activity-hydration',
      type: 'support',
      priority: 'medium',
      title: 'Aumenta la hidratación',
      description: 'Con entrenamientos intensos, necesitas más líquidos. Apunta a 35-40ml por kg de peso corporal, más 500-750ml por hora de ejercicio.',
      context: 'nutrition',
      icon: React.createElement(Target, { className: "w-5 h-5" }),
      category: 'health'
    });
  }

  // Sugerencias basadas en número de comidas
  if (mealsPerDay >= 5) {
    suggestions.push({
      id: 'nutrition-frequent-meals-planning',
      type: 'support',
      priority: 'medium',
      title: 'Planifica tus snacks',
      description: 'Con comidas frecuentes, prepara snacks saludables como frutas con nueces, yogur griego, o hummus con verduras.',
      context: 'nutrition',
      icon: React.createElement(Lightbulb, { className: "w-5 h-5" }),
      category: 'lifestyle'
    });
  }

  if (mealsPerDay <= 2) {
    suggestions.push({
      id: 'nutrition-few-meals-density',
      type: 'idea',
      priority: 'high',
      title: 'Maximiza la densidad nutricional',
      description: 'Con pocas comidas, cada una debe ser nutricionalmente densa. Incluye variedad de colores y grupos alimentarios.',
      context: 'nutrition',
      icon: React.createElement(Star, { className: "w-5 h-5" }),
      category: 'nutrition'
    });
  }

  // Sugerencias basadas en edad
  if (age >= 50) {
    suggestions.push({
      id: 'nutrition-mature-calcium',
      type: 'prevention',
      priority: 'medium',
      title: 'Fortalece tus huesos',
      description: 'Aumenta el consumo de calcio y vitamina D con lácteos, sardinas, brócoli, y exposición solar moderada.',
      context: 'nutrition',
      icon: React.createElement(Shield, { className: "w-5 h-5" }),
      category: 'health'
    });

    suggestions.push({
      id: 'nutrition-mature-antioxidants',
      type: 'support',
      priority: 'medium',
      title: 'Aumenta los antioxidantes',
      description: 'Consume más frutas y verduras coloridas para combatir el estrés oxidativo y mantener la salud celular.',
      context: 'nutrition',
      icon: React.createElement(Heart, { className: "w-5 h-5" }),
      category: 'health'
    });
  }

  // Sugerencias generales de nutrición
  suggestions.push({
    id: 'nutrition-meal-prep',
    type: 'idea',
    priority: 'medium',
    title: 'Prepara comidas por adelantado',
    description: 'Dedica 2-3 horas los domingos para preparar comidas de la semana. Esto te ayudará a mantener una alimentación consistente.',
    context: 'nutrition',
    icon: React.createElement(CheckCircle, { className: "w-5 h-5" }),
    category: 'lifestyle'
  });

  suggestions.push({
    id: 'nutrition-mindful-eating',
    type: 'support',
    priority: 'low',
    title: 'Come con atención plena',
    description: 'Come despacio, mastica bien y presta atención a las señales de hambre y saciedad de tu cuerpo.',
    context: 'nutrition',
    icon: React.createElement(Lightbulb, { className: "w-5 h-5" }),
    category: 'lifestyle'
  });

  suggestions.push({
    id: 'nutrition-variety',
    type: 'idea',
    priority: 'low',
    title: 'Varía tu alimentación',
    description: 'Come una variedad de alimentos para asegurar que obtienes todos los nutrientes necesarios. Prueba algo nuevo cada semana.',
    context: 'nutrition',
    icon: React.createElement(Star, { className: "w-5 h-5" }),
    category: 'lifestyle'
  });

  return suggestions;
}; 