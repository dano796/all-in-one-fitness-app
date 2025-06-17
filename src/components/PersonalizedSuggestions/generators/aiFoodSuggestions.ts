import React from 'react';
import { Heart, Target, TrendingUp, CheckCircle, Shield, AlertCircle, Star, Lightbulb } from 'lucide-react';
import { Suggestion, UserData } from '../types';

export const generateAiFoodSuggestions = (userData: UserData): Suggestion[] => {
  const suggestions: Suggestion[] = [];
  const profile = userData.profile;

  if (!profile) return suggestions;

  const fitnessLevel = profile.nivel_fitness || 'principiante';
  const age = profile.edad || 25;
  const goal = profile.objetivo_nutricional || 'maintain';
  const restrictions = profile.restricciones_alimentarias || [];
  const allergies = profile.alergias_alimentarias || [];
  const exerciseDays = profile.dias_ejercicio_semana || 0;

  // Sugerencias para principiantes
  if (fitnessLevel === 'principiante') {
    suggestions.push({
      id: 'ai-food-beginner-portions',
      type: 'idea',
      priority: 'high',
      title: 'Aprende a identificar porciones',
      description: 'Usa la IA para reconocer alimentos y aprende sobre tamaños de porciones adecuados. Esto te ayudará a desarrollar mejor control sobre tu alimentación.',
      context: 'ai_food',
      icon: React.createElement(Target, { className: "w-5 h-5" }),
      category: 'nutrition'
    });

    suggestions.push({
      id: 'ai-food-beginner-variety',
      type: 'support',
      priority: 'medium',
      title: 'Explora variedad de alimentos',
      description: 'Usa la IA para identificar nuevos alimentos saludables. Fotografía frutas, verduras y proteínas que no conoces para ampliar tu dieta.',
      context: 'ai_food',
      icon: React.createElement(Star, { className: "w-5 h-5" }),
      category: 'lifestyle'
    });

    suggestions.push({
      id: 'ai-food-beginner-tracking',
      type: 'idea',
      priority: 'high',
      title: 'Comienza a registrar tus comidas',
      description: 'La IA hace más fácil el tracking. Fotografía tus platos principales para empezar a tomar conciencia de lo que comes diariamente.',
      context: 'ai_food',
      icon: React.createElement(CheckCircle, { className: "w-5 h-5" }),
      category: 'lifestyle'
    });
  }

  if (fitnessLevel === 'intermedio') {
    suggestions.push({
      id: 'ai-food-intermediate-macros',
      type: 'idea',
      priority: 'high',
      title: 'Identifica macronutrientes',
      description: 'Usa la IA para reconocer alimentos ricos en proteínas, carbohidratos complejos y grasas saludables. Aprende a balancear tus macros visualmente.',
      context: 'ai_food',
      icon: React.createElement(TrendingUp, { className: "w-5 h-5" }),
      category: 'nutrition'
    });

    suggestions.push({
      id: 'ai-food-intermediate-timing',
      type: 'support',
      priority: 'medium',
      title: 'Optimiza el timing nutricional',
      description: 'Fotografía tus comidas pre y post-entreno. La IA te ayudará a identificar si estás consumiendo los nutrientes adecuados en el momento correcto.',
      context: 'ai_food',
      icon: React.createElement(Target, { className: "w-5 h-5" }),
      category: 'nutrition'
    });
  }

  if (fitnessLevel === 'avanzado') {
    suggestions.push({
      id: 'ai-food-advanced-precision',
      type: 'idea',
      priority: 'high',
      title: 'Precisión en el tracking',
      description: 'Usa la IA para identificar ingredientes específicos en platos complejos. Esto te permitirá un tracking más preciso de macros y micronutrientes.',
      context: 'ai_food',
      icon: React.createElement(Star, { className: "w-5 h-5" }),
      category: 'nutrition'
    });

    suggestions.push({
      id: 'ai-food-advanced-analysis',
      type: 'support',
      priority: 'medium',
      title: 'Análisis nutricional detallado',
      description: 'Combina la IA con tu conocimiento para analizar la densidad nutricional de tus comidas y optimizar cada ingesta según tus objetivos.',
      context: 'ai_food',
      icon: React.createElement(CheckCircle, { className: "w-5 h-5" }),
      category: 'nutrition'
    });
  }

  // Sugerencias basadas en objetivos
  if (goal === 'perder_peso' || goal === 'lose_weight') {
    suggestions.push({
      id: 'ai-food-weight-loss-low-cal',
      type: 'support',
      priority: 'high',
      title: 'Enfócate en alimentos bajos en calorías',
      description: 'Usa la IA para identificar verduras, frutas y proteínas magras. Estos alimentos te ayudarán a sentirte satisfecho con menos calorías.',
      context: 'ai_food',
      icon: React.createElement(Heart, { className: "w-5 h-5" }),
      category: 'nutrition'
    });

    suggestions.push({
      id: 'ai-food-weight-loss-portions',
      type: 'idea',
      priority: 'medium',
      title: 'Controla porciones visualmente',
      description: 'Fotografía tus platos antes de comer. La IA te ayudará a reconocer si las porciones son adecuadas para tu objetivo de pérdida de peso.',
      context: 'ai_food',
      icon: React.createElement(Target, { className: "w-5 h-5" }),
      category: 'nutrition'
    });

    suggestions.push({
      id: 'ai-food-weight-loss-hidden-calories',
      type: 'warning',
      priority: 'medium',
      title: 'Identifica calorías ocultas',
      description: 'Usa la IA para reconocer salsas, aderezos y condimentos que pueden agregar calorías inesperadas a tus comidas saludables.',
      context: 'ai_food',
      icon: React.createElement(AlertCircle, { className: "w-5 h-5" }),
      category: 'nutrition'
    });
  }

  if (goal === 'ganar_musculo' || goal === 'gain_muscle') {
    suggestions.push({
      id: 'ai-food-muscle-gain-protein',
      type: 'idea',
      priority: 'high',
      title: 'Identifica fuentes de proteína',
      description: 'Usa la IA para reconocer alimentos ricos en proteína como carnes, huevos, legumbres y lácteos. Necesitas proteína para construir músculo.',
      context: 'ai_food',
      icon: React.createElement(TrendingUp, { className: "w-5 h-5" }),
      category: 'nutrition'
    });

    suggestions.push({
      id: 'ai-food-muscle-gain-complete-meals',
      type: 'support',
      priority: 'medium',
      title: 'Comidas completas para crecimiento',
      description: 'Fotografía tus platos principales. La IA te ayudará a verificar que incluyas proteína, carbohidratos complejos y grasas saludables.',
      context: 'ai_food',
      icon: React.createElement(CheckCircle, { className: "w-5 h-5" }),
      category: 'nutrition'
    });

    suggestions.push({
      id: 'ai-food-muscle-gain-post-workout',
      type: 'idea',
      priority: 'medium',
      title: 'Optimiza comidas post-entreno',
      description: 'Usa la IA para identificar alimentos ideales después del ejercicio: proteínas de rápida absorción y carbohidratos para recuperación.',
      context: 'ai_food',
      icon: React.createElement(Star, { className: "w-5 h-5" }),
      category: 'nutrition'
    });
  }

  // Sugerencias basadas en restricciones alimentarias
  if (restrictions.some(r => r.toLowerCase().includes('vegetarian') || r.toLowerCase().includes('vegano'))) {
    suggestions.push({
      id: 'ai-food-vegetarian-protein',
      type: 'support',
      priority: 'high',
      title: 'Identifica proteínas vegetales',
      description: 'La IA puede ayudarte a reconocer legumbres, quinoa, tofu, tempeh y otros alimentos ricos en proteína vegetal para mantener una dieta balanceada.',
      context: 'ai_food',
      icon: React.createElement(Heart, { className: "w-5 h-5" }),
      category: 'nutrition'
    });

    suggestions.push({
      id: 'ai-food-vegetarian-combinations',
      type: 'idea',
      priority: 'medium',
      title: 'Combinaciones proteicas completas',
      description: 'Usa la IA para identificar combinaciones como arroz+frijoles, hummus+pan integral que forman proteínas completas en tu dieta vegetariana.',
      context: 'ai_food',
      icon: React.createElement(Lightbulb, { className: "w-5 h-5" }),
      category: 'nutrition'
    });
  }

  if (restrictions.some(r => r.toLowerCase().includes('gluten'))) {
    suggestions.push({
      id: 'ai-food-gluten-free-identification',
      type: 'warning',
      priority: 'high',
      title: 'Identifica alimentos sin gluten',
      description: 'Usa la IA para reconocer alimentos naturalmente libres de gluten como quinoa, arroz, patatas, carnes y pescados frescos.',
      context: 'ai_food',
      icon: React.createElement(Shield, { className: "w-5 h-5" }),
      category: 'health'
    });

    suggestions.push({
      id: 'ai-food-gluten-hidden-sources',
      type: 'warning',
      priority: 'medium',
      title: 'Cuidado con fuentes ocultas de gluten',
      description: 'La IA puede ayudarte a identificar alimentos procesados que podrían contener gluten oculto. Siempre verifica etiquetas cuando sea posible.',
      context: 'ai_food',
      icon: React.createElement(AlertCircle, { className: "w-5 h-5" }),
      category: 'health'
    });
  }

  // Sugerencias basadas en alergias
  if (allergies.length > 0) {
    suggestions.push({
      id: 'ai-food-allergy-awareness',
      type: 'warning',
      priority: 'high',
      title: 'Mantén alerta por alérgenos',
      description: 'Aunque la IA es útil, siempre verifica ingredientes específicos si tienes alergias. La tecnología puede no detectar todos los alérgenos ocultos.',
      context: 'ai_food',
      icon: React.createElement(AlertCircle, { className: "w-5 h-5" }),
      category: 'health'
    });

    suggestions.push({
      id: 'ai-food-safe-alternatives',
      type: 'support',
      priority: 'medium',
      title: 'Identifica alternativas seguras',
      description: 'Usa la IA para reconocer alimentos seguros que puedes consumir sin riesgo, y aprende a identificar sustitutos nutritivos.',
      context: 'ai_food',
      icon: React.createElement(Shield, { className: "w-5 h-5" }),
      category: 'health'
    });
  }

  // Sugerencias basadas en frecuencia de ejercicio
  if (exerciseDays >= 5) {
    suggestions.push({
      id: 'ai-food-high-activity-recovery',
      type: 'idea',
      priority: 'high',
      title: 'Identifica alimentos de recuperación',
      description: 'Con entrenamientos frecuentes, usa la IA para reconocer alimentos antiinflamatorios como pescado azul, frutos rojos, verduras de hoja verde.',
      context: 'ai_food',
      icon: React.createElement(Heart, { className: "w-5 h-5" }),
      category: 'recovery'
    });

    suggestions.push({
      id: 'ai-food-high-activity-energy',
      type: 'support',
      priority: 'medium',
      title: 'Combustible para entrenamientos',
      description: 'Fotografía tus comidas pre-entreno. La IA te ayudará a identificar carbohidratos de calidad que te den energía sostenida.',
      context: 'ai_food',
      icon: React.createElement(TrendingUp, { className: "w-5 h-5" }),
      category: 'nutrition'
    });
  }

  // Sugerencias basadas en edad
  if (age >= 50) {
    suggestions.push({
      id: 'ai-food-mature-nutrients',
      type: 'prevention',
      priority: 'medium',
      title: 'Identifica alimentos ricos en nutrientes',
      description: 'Usa la IA para reconocer alimentos densos en nutrientes como sardinas (calcio), espinacas (hierro), nueces (omega-3) importantes después de los 50.',
      context: 'ai_food',
      icon: React.createElement(Shield, { className: "w-5 h-5" }),
      category: 'health'
    });
  }

  if (age < 25) {
    suggestions.push({
      id: 'ai-food-young-habits',
      type: 'idea',
      priority: 'medium',
      title: 'Desarrolla hábitos alimentarios saludables',
      description: 'A tu edad, usar la IA para identificar alimentos saludables te ayudará a desarrollar patrones alimentarios que te beneficiarán toda la vida.',
      context: 'ai_food',
      icon: React.createElement(Star, { className: "w-5 h-5" }),
      category: 'lifestyle'
    });
  }

  // Sugerencias técnicas para mejorar el uso de la IA
  suggestions.push({
    id: 'ai-food-photo-quality',
    type: 'support',
    priority: 'medium',
    title: 'Mejora la calidad de tus fotos',
    description: 'Para mejores resultados, toma fotos con buena iluminación, enfoca bien los alimentos y evita fondos muy complejos que puedan confundir a la IA.',
    context: 'ai_food',
    icon: React.createElement(Lightbulb, { className: "w-5 h-5" }),
    category: 'lifestyle'
  });

  suggestions.push({
    id: 'ai-food-multiple-angles',
    type: 'idea',
    priority: 'low',
    title: 'Fotografía desde diferentes ángulos',
    description: 'Si la IA no reconoce un alimento, prueba tomando la foto desde diferentes ángulos o separando los ingredientes visualmente.',
    context: 'ai_food',
    icon: React.createElement(Target, { className: "w-5 h-5" }),
    category: 'lifestyle'
  });

  suggestions.push({
    id: 'ai-food-verify-results',
    type: 'warning',
    priority: 'medium',
    title: 'Verifica los resultados de la IA',
    description: 'Aunque la IA es muy precisa, siempre revisa que la identificación sea correcta, especialmente para alimentos similares o preparaciones complejas.',
    context: 'ai_food',
    icon: React.createElement(AlertCircle, { className: "w-5 h-5" }),
    category: 'lifestyle'
  });

  // Sugerencias educativas
  suggestions.push({
    id: 'ai-food-learn-nutrition',
    type: 'idea',
    priority: 'low',
    title: 'Aprende mientras usas la IA',
    description: 'Usa la información nutricional que proporciona la IA como oportunidad de aprendizaje sobre calorías, macros y micronutrientes de diferentes alimentos.',
    context: 'ai_food',
    icon: React.createElement(Lightbulb, { className: "w-5 h-5" }),
    category: 'lifestyle'
  });

  suggestions.push({
    id: 'ai-food-portion-awareness',
    type: 'support',
    priority: 'medium',
    title: 'Desarrolla conciencia de porciones',
    description: 'Usa la IA consistentemente para desarrollar tu habilidad visual de estimar porciones, incluso cuando no tengas la app disponible.',
    context: 'ai_food',
    icon: React.createElement(CheckCircle, { className: "w-5 h-5" }),
    category: 'lifestyle'
  });

  // Sugerencias motivacionales
  suggestions.push({
    id: 'ai-food-consistency',
    type: 'achievement',
    priority: 'low',
    title: 'La consistencia es clave',
    description: 'Usar la IA regularmente te ayudará a desarrollar mejores hábitos alimentarios. Cada foto es un paso hacia una mejor relación con la comida.',
    context: 'ai_food',
    icon: React.createElement(Star, { className: "w-5 h-5" }),
    category: 'lifestyle'
  });

  return suggestions;
}; 