import React from 'react';
import { Target, Heart, Star, Lightbulb, Plus } from 'lucide-react';
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
      id: 'dashboard-welcome',
      type: 'support',
      title: '¡Bienvenido a tu dashboard!',
      description: 'Aquí puedes ver un resumen de tu progreso diario. Registra tus comidas y actividad física para obtener información valiosa sobre tu salud.',
      icon: React.createElement(Star, { className: "w-5 h-5" }),
      priority: 'high',
      category: 'lifestyle',
      context: 'dashboard'
    },
    {
      id: 'dashboard-daily-goals',
      type: 'idea',
      title: 'Establece metas diarias',
      description: 'Fija objetivos pequeños y alcanzables cada día. Por ejemplo: beber 8 vasos de agua, caminar 30 minutos o comer 5 porciones de frutas y verduras.',
      icon: React.createElement(Target, { className: "w-5 h-5" }),
      priority: 'high',
      category: 'lifestyle',
      context: 'dashboard'
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
    },
    // Settings-specific suggestions
    {
      id: 'settings-complete-profile',
      type: 'support',
      title: 'Completa tu perfil completo',
      description: 'Un perfil completo nos permite darte recomendaciones más precisas. Incluye tu edad, peso, altura, nivel de actividad y objetivos.',
      icon: React.createElement(Target, { className: "w-5 h-5" }),
      priority: 'high',
      category: 'lifestyle',
      context: 'settings'
    },
    {
      id: 'settings-notifications',
      type: 'idea',
      title: 'Configura tus notificaciones',
      description: 'Activa recordatorios para mantenerte en el camino hacia tus objetivos: recordatorios de comidas, agua, ejercicio y descanso.',
      icon: React.createElement(Heart, { className: "w-5 h-5" }),
      priority: 'medium',
      category: 'lifestyle',
      context: 'settings'
    },
    {
      id: 'settings-goals',
      type: 'idea',
      title: 'Define objetivos específicos',
      description: 'Establece metas claras como "perder 5kg en 3 meses" o "hacer ejercicio 4 veces por semana". Los objetivos específicos son más fáciles de lograr.',
      icon: React.createElement(Star, { className: "w-5 h-5" }),
      priority: 'high',
      category: 'lifestyle',
      context: 'settings'
    },
    // Exercise/Routines suggestions
    {
      id: 'routines-start-simple',
      type: 'support',
      title: 'Comienza con rutinas simples',
      description: 'Si eres nuevo en el ejercicio, empieza con rutinas de cuerpo completo 2-3 veces por semana. Enfócate en movimientos básicos como sentadillas, flexiones y plancha.',
      icon: React.createElement(Star, { className: "w-5 h-5" }),
      priority: 'high',
      category: 'exercise',
      context: 'exercise'
    },
    {
      id: 'routines-progression',
      type: 'idea',
      title: 'Progresión gradual',
      description: 'Aumenta la intensidad gradualmente: primero mejora la técnica, luego incrementa repeticiones, y finalmente añade peso o dificultad.',
      icon: React.createElement(Target, { className: "w-5 h-5" }),
      priority: 'high',
      category: 'exercise',
      context: 'exercise'
    },
    {
      id: 'routines-consistency',
      type: 'idea',
      title: 'La consistencia supera a la intensidad',
      description: 'Es mejor hacer 30 minutos de ejercicio 3 veces por semana que 2 horas una vez al mes. Crea un horario que puedas mantener.',
      icon: React.createElement(Heart, { className: "w-5 h-5" }),
      priority: 'medium',
      category: 'exercise',
      context: 'exercise'
    },
    {
      id: 'routines-rest-days',
      type: 'prevention',
      title: 'Los días de descanso son importantes',
      description: 'Tu cuerpo se fortalece durante el descanso, no durante el entrenamiento. Incluye al menos 1-2 días de descanso completo por semana.',
      icon: React.createElement(Lightbulb, { className: "w-5 h-5" }),
      priority: 'medium',
      category: 'recovery',
      context: 'exercise'
    },
    // Specific routines context suggestions
    {
      id: 'routines-create-first',
      type: 'support',
      title: 'Crea tu primera rutina',
      description: 'Empieza con una rutina simple de cuerpo completo. Incluye un ejercicio para cada grupo muscular principal: piernas, espalda, pecho, hombros y core.',
      icon: React.createElement(Plus, { className: "w-5 h-5" }),
      priority: 'high',
      category: 'exercise',
      context: 'routines'
    },
    {
      id: 'routines-plan-week',
      type: 'idea',
      title: 'Planifica tu semana de entrenamiento',
      description: 'Organiza tus rutinas por días. Por ejemplo: Lunes/Jueves - Cuerpo completo, Martes/Viernes - Cardio, Miércoles/Sábado - Flexibilidad.',
      icon: React.createElement(Target, { className: "w-5 h-5" }),
      priority: 'high',
      category: 'exercise',
      context: 'routines'
    },
    {
      id: 'routines-track-progress',
      type: 'idea',
      title: 'Registra tu progreso',
      description: 'Lleva un registro de pesos, repeticiones y series. Esto te ayudará a ver tu progreso y a planificar incrementos de intensidad.',
      icon: React.createElement(Heart, { className: "w-5 h-5" }),
      priority: 'medium',
      category: 'exercise',
      context: 'routines'
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

  const finalSuggestions = filteredSuggestions.slice(0, maxSuggestions);
  
  // Asegurar que siempre haya al menos una sugerencia fallback
  if (finalSuggestions.length === 0 && context !== 'general') {
    return [{
      id: `fallback-${context}`,
      type: 'support',
      title: 'Explora nuevas posibilidades',
      description: 'Hay muchas formas de mejorar tu salud y fitness. Explora las diferentes secciones de la app para descubrir nuevas herramientas y consejos.',
      icon: React.createElement(Lightbulb, { className: "w-5 h-5" }),
      priority: 'medium',
      category: 'lifestyle',
      context: context
    }];
  }

  return finalSuggestions;
};