import React from 'react';
import { Target, Bell, Shield, CheckCircle, Star, User, TrendingUp, Heart } from 'lucide-react';
import { Suggestion, UserData } from '../types';

export const generateSettingsSuggestions = (userData: UserData): Suggestion[] => {
  const suggestions: Suggestion[] = [];
  const profile = userData.profile;

  if (!profile) return suggestions;

  // Verificar qué campos del perfil están incompletos
  const missingFields = [];
  if (!profile.peso_actual_kg) missingFields.push('peso');
  if (!profile.altura_cm) missingFields.push('altura');
  if (!profile.edad) missingFields.push('edad');
  if (!profile.nivel_actividad) missingFields.push('nivel de actividad');
  if (!profile.objetivo_nutricional) missingFields.push('objetivo nutricional');

  // Sugerencias para completar perfil
  if (missingFields.length > 0) {
    suggestions.push({
      id: 'settings-complete-missing-fields',
      type: 'support',
      priority: 'high',
      title: '¡Completa tu perfil para mejores recomendaciones!',
      description: `Te faltan algunos datos importantes: ${missingFields.join(', ')}. Completar tu perfil nos ayuda a darte consejos más precisos y personalizados.`,
      context: 'settings',
      icon: React.createElement(User, { className: "w-5 h-5" }),
      category: 'lifestyle'
    });
  }

  // Sugerencia para establecer objetivos específicos
  if (!profile.objetivo_nutricional || profile.objetivo_nutricional === 'general') {
    suggestions.push({
      id: 'settings-set-specific-goals',
      type: 'idea',
      priority: 'high',
      title: 'Define objetivos específicos',
      description: 'Establecer metas claras como "perder peso" o "ganar masa muscular" te ayudará a mantenerte motivado y medir tu progreso de manera efectiva.',
      context: 'settings',
      icon: React.createElement(Target, { className: "w-5 h-5" }),
      category: 'lifestyle'
    });
  }

  // Sugerencias basadas en nivel de fitness
  const fitnessLevel = profile.nivel_fitness || 'principiante';
  
  if (fitnessLevel === 'principiante') {
    suggestions.push({
      id: 'settings-beginner-realistic-goals',
      type: 'support',
      priority: 'high',
      title: 'Establece metas realistas para principiantes',
      description: 'Como principiante, enfócate en crear hábitos sostenibles. Metas como "ejercitarme 3 veces por semana" o "caminar 30 minutos diarios" son perfectas para empezar.',
      context: 'settings',
      icon: React.createElement(Star, { className: "w-5 h-5" }),
      category: 'lifestyle'
    });

    suggestions.push({
      id: 'settings-beginner-notifications',
      type: 'idea',
      priority: 'medium',
      title: 'Activa recordatorios útiles',
      description: 'Los recordatorios para beber agua, hacer ejercicio y registrar comidas te ayudarán a formar nuevos hábitos saludables más fácilmente.',
      context: 'settings',
      icon: React.createElement(Bell, { className: "w-5 h-5" }),
      category: 'lifestyle'
    });
  }

  if (fitnessLevel === 'intermedio' || fitnessLevel === 'avanzado') {
    suggestions.push({
      id: 'settings-advanced-metrics',
      type: 'idea',
      priority: 'medium',
      title: 'Ajusta métricas avanzadas',
      description: 'Con tu nivel de experiencia, puedes personalizar el cálculo de calorías, macronutrientes y objetivos de entrenamiento más específicos.',
      context: 'settings',
      icon: React.createElement(TrendingUp, { className: "w-5 h-5" }),
      category: 'nutrition'
    });
  }

  // Sugerencias basadas en objetivos
  const objective = profile.objetivo_nutricional;
  
  if (objective === 'perder_peso') {
    suggestions.push({
      id: 'settings-weight-loss-config',
      type: 'support',
      priority: 'high',
      title: 'Optimiza configuración para pérdida de peso',
      description: 'Configura un déficit calórico moderado (300-500 calorías) y activa recordatorios de comidas para mantener un control constante de tu alimentación.',
      context: 'settings',
      icon: React.createElement(Target, { className: "w-5 h-5" }),
      category: 'nutrition'
    });
  }

  if (objective === 'ganar_musculo') {
    suggestions.push({
      id: 'settings-muscle-gain-config',
      type: 'support',
      priority: 'high',
      title: 'Configura para ganancia muscular',
      description: 'Establece un ligero superávit calórico y asegúrate de configurar una meta de proteína alta (1.6-2.2g por kg de peso corporal).',
      context: 'settings',
      icon: React.createElement(TrendingUp, { className: "w-5 h-5" }),
      category: 'nutrition'
    });
  }

  if (objective === 'mantener_peso') {
    suggestions.push({
      id: 'settings-maintenance-config',
      type: 'idea',
      priority: 'medium',
      title: 'Configuración para mantenimiento',
      description: 'Enfócate en mantener hábitos consistentes. Configura recordatorios suaves y metas de actividad física regular.',
      context: 'settings',
      icon: React.createElement(CheckCircle, { className: "w-5 h-5" }),
      category: 'lifestyle'
    });
  }

  // Sugerencias de privacidad y seguridad
  suggestions.push({
    id: 'settings-privacy-review',
    type: 'prevention',
    priority: 'medium',
    title: 'Revisa tu configuración de privacidad',
    description: 'Asegúrate de que tu información personal esté protegida y que solo compartas los datos que desees con otros usuarios de la app.',
    context: 'settings',
    icon: React.createElement(Shield, { className: "w-5 h-5" }),
    category: 'lifestyle'
  });

  // Sugerencia general de bienestar
  suggestions.push({
    id: 'settings-holistic-approach',
    type: 'idea',
    priority: 'medium',
    title: 'Adopta un enfoque integral',
    description: 'La salud no es solo ejercicio y dieta. Configura recordatorios para dormir bien, manejar el estrés y mantener conexiones sociales.',
    context: 'settings',
    icon: React.createElement(Heart, { className: "w-5 h-5" }),
    category: 'lifestyle'
  });

  // Sugerencias adicionales específicas para settings
  suggestions.push({
    id: 'settings-track-progress',
    type: 'support',
    priority: 'high',
    title: 'Configura seguimiento de progreso',
    description: 'Establece fechas para revisar tu progreso. Programa pesajes semanales, medidas mensuales y evaluaciones de cómo te sientes.',
    context: 'settings',
    icon: React.createElement(CheckCircle, { className: "w-5 h-5" }),
    category: 'lifestyle'
  });

  // Más sugerencias específicas por nivel de fitness
  if (fitnessLevel === 'intermedio') {
    suggestions.push({
      id: 'settings-intermediate-goals',
      type: 'idea',
      priority: 'high',
      title: 'Establece objetivos más específicos',
      description: 'Con tu experiencia intermedia, puedes establecer metas más precisas como "aumentar peso en sentadilla 20kg en 3 meses" o "reducir grasa corporal 2% en 8 semanas".',
      context: 'settings',
      icon: React.createElement(Target, { className: "w-5 h-5" }),
      category: 'exercise'
    });
  }

  if (fitnessLevel === 'avanzado') {
    suggestions.push({
      id: 'settings-advanced-goals',
      type: 'idea',
      priority: 'high',
      title: 'Optimiza configuraciones avanzadas',
      description: 'Como atleta avanzado, considera configurar ciclos de periodización, metas de rendimiento específicas y métricas detalladas de recuperación.',
      context: 'settings',
      icon: React.createElement(TrendingUp, { className: "w-5 h-5" }),
      category: 'exercise'
    });
  }

  return suggestions;
};
