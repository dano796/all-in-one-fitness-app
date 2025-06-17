import React from 'react';
import { Target, Heart, Star, Lightbulb } from 'lucide-react';
import { Suggestion, SuggestionContext } from '../types';
import { contextCategoryMap } from '../utils';

export const generateBasicSuggestions = (
  context: SuggestionContext,
  maxSuggestions: number,
  dismissedSuggestions: string[]
): Suggestion[] => {
  const basicSuggestions: Suggestion[] = [
    {
      id: 'complete-profile',
      type: 'support',
      title: 'Completa tu perfil de fitness',
      description: 'Para obtener sugerencias personalizadas, completa tu perfil en la sección de Ajustes. Esto nos ayudará a darte consejos específicos para tu nivel y objetivos.',
      icon: React.createElement(Target, { className: "w-5 h-5" }),
      priority: 'high',
      category: 'lifestyle',
      context: 'general'
    },
    {
      id: 'start-tracking',
      type: 'idea',
      title: 'Comienza a registrar tus comidas',
      description: 'El primer paso hacia una vida más saludable es conocer qué comes. Empieza registrando tus comidas diarias para tomar conciencia de tus hábitos.',
      icon: React.createElement(Heart, { className: "w-5 h-5" }),
      priority: 'high',
      category: 'nutrition',
      context: 'nutrition'
    },
    {
      id: 'set-goals',
      type: 'idea',
      title: 'Establece objetivos realistas',
      description: 'Define metas claras y alcanzables. Comienza con pequeños cambios que puedas mantener a largo plazo.',
      icon: React.createElement(Star, { className: "w-5 h-5" }),
      priority: 'medium',
      category: 'lifestyle',
      context: 'general'
    },
    {
      id: 'explore-modules',
      type: 'support',
      title: 'Explora todos los módulos',
      description: 'Descubre todas las herramientas disponibles: seguimiento de calorías, rutinas de ejercicio, hidratación y más.',
      icon: React.createElement(Lightbulb, { className: "w-5 h-5" }),
      priority: 'medium',
      category: 'lifestyle',
      context: 'general'
    },
    // Water-specific suggestions
    {
      id: 'water-importance',
      type: 'idea',
      title: 'La importancia de la hidratación',
      description: 'Mantenerse hidratado es fundamental para tu salud. El agua ayuda a regular la temperatura corporal, transportar nutrientes y eliminar toxinas.',
      icon: React.createElement(Heart, { className: "w-5 h-5" }),
      priority: 'high',
      category: 'health',
      context: 'water'
    },
    {
      id: 'water-goal-basic',
      type: 'support',
      title: 'Establece tu meta de agua',
      description: 'Una buena regla general es beber al menos 8 vasos de agua al día (aproximadamente 2 litros). Ajusta según tu actividad física y clima.',
      icon: React.createElement(Target, { className: "w-5 h-5" }),
      priority: 'high',
      category: 'health',
      context: 'water'
    },
    {
      id: 'water-tracking-tips',
      type: 'idea',
      title: 'Consejos para mantenerte hidratado',
      description: 'Lleva una botella de agua contigo, bebe un vaso al despertar, y consume alimentos ricos en agua como frutas y verduras.',
      icon: React.createElement(Lightbulb, { className: "w-5 h-5" }),
      priority: 'medium',
      category: 'lifestyle',
      context: 'water'
    },
    // Exercise suggestions
    {
      id: 'exercise-start-simple',
      type: 'support',
      title: 'Comienza con ejercicios simples',
      description: 'No necesitas un gimnasio para empezar. Caminar, hacer flexiones, sentadillas y planchas son excelentes ejercicios para comenzar.',
      icon: React.createElement(Star, { className: "w-5 h-5" }),
      priority: 'high',
      category: 'exercise',
      context: 'exercise'
    },
    {
      id: 'exercise-consistency',
      type: 'idea',
      title: 'La consistencia es clave',
      description: 'Es mejor hacer 15 minutos de ejercicio todos los días que 2 horas una vez por semana. Construye el hábito gradualmente.',
      icon: React.createElement(Target, { className: "w-5 h-5" }),
      priority: 'medium',
      category: 'exercise',
      context: 'exercise'
    },
    // Nutrition suggestions
    {
      id: 'nutrition-balanced-meals',
      type: 'idea',
      title: 'Crea comidas balanceadas',
      description: 'Incluye proteína, carbohidratos complejos, grasas saludables y vegetales en cada comida principal para una nutrición óptima.',
      icon: React.createElement(Heart, { className: "w-5 h-5" }),
      priority: 'high',
      category: 'nutrition',
      context: 'nutrition'
    },
    {
      id: 'nutrition-portion-control',
      type: 'support',
      title: 'Aprende sobre porciones',
      description: 'Usa tu mano como guía: palma = proteína, puño = verduras, cuenco = carbohidratos, pulgar = grasas.',
      icon: React.createElement(Target, { className: "w-5 h-5" }),
      priority: 'medium',
      category: 'nutrition',
      context: 'nutrition'
    }
  ];

  // Filter by context
  let filteredSuggestions = basicSuggestions;
  if (context !== 'general') {
    filteredSuggestions = basicSuggestions.filter(s => 
      contextCategoryMap[context]?.includes(s.category) || s.context === context
    );
  }

  // Filter dismissed suggestions
  filteredSuggestions = filteredSuggestions.filter(s => 
    !dismissedSuggestions.includes(s.id)
  );

  return filteredSuggestions.slice(0, maxSuggestions);
};