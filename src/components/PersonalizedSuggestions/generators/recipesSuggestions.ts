import React from 'react';
import { Heart, Target, TrendingUp, CheckCircle, Shield, AlertCircle, Star, Lightbulb } from 'lucide-react';
import { Suggestion, UserData } from '../types';

export const generateRecipesSuggestions = (userData: UserData): Suggestion[] => {
  const suggestions: Suggestion[] = [];
  const profile = userData.profile;

  if (!profile) return suggestions;

  const fitnessLevel = profile.nivel_fitness || 'principiante';
  const age = profile.edad || 25;
  const goal = profile.objetivo_nutricional || 'maintain';
  const restrictions = profile.restricciones_alimentarias || [];
  const allergies = profile.alergias_alimentarias || [];
  const exerciseDays = profile.dias_ejercicio_semana || 0;
  const mealsPerDay = profile.comidas_por_dia || 3;

  // Sugerencias basadas en objetivos nutricionales
  if (goal === 'perder_peso' || goal === 'lose_weight') {
    suggestions.push({
      id: 'recipes-weight-loss-low-cal',
      type: 'idea',
      priority: 'high',
      title: 'Busca recetas bajas en calorías',
      description: 'Prueba buscar "ensaladas proteicas", "sopas de verduras", "pescado al vapor" o "pollo a la plancha" para encontrar opciones saludables y saciantes.',
      context: 'recipes',
      icon: React.createElement(Target, { className: "w-5 h-5" }),
      category: 'nutrition'
    });

    suggestions.push({
      id: 'recipes-weight-loss-volume',
      type: 'support',
      priority: 'medium',
      title: 'Recetas con alto volumen',
      description: 'Busca "ensaladas voluminosas", "caldos de verduras", "verduras asadas" - alimentos que te llenen con pocas calorías.',
      context: 'recipes',
      icon: React.createElement(Heart, { className: "w-5 h-5" }),
      category: 'nutrition'
    });

    suggestions.push({
      id: 'recipes-weight-loss-fiber',
      type: 'idea',
      priority: 'medium',
      title: 'Recetas ricas en fibra',
      description: 'Explora "quinoa con verduras", "lentejas estofadas", "avena overnight" - la fibra te ayuda a sentirte satisfecho por más tiempo.',
      context: 'recipes',
      icon: React.createElement(CheckCircle, { className: "w-5 h-5" }),
      category: 'nutrition'
    });
  }

  if (goal === 'ganar_musculo' || goal === 'gain_muscle') {
    suggestions.push({
      id: 'recipes-muscle-gain-protein',
      type: 'idea',
      priority: 'high',
      title: 'Recetas ricas en proteína',
      description: 'Busca "batidos de proteína", "pollo con quinoa", "salmón con verduras", "huevos revueltos" o "yogur griego" para apoyar tu crecimiento muscular.',
      context: 'recipes',
      icon: React.createElement(TrendingUp, { className: "w-5 h-5" }),
      category: 'nutrition'
    });

    suggestions.push({
      id: 'recipes-muscle-gain-post-workout',
      type: 'support',
      priority: 'high',
      title: 'Recetas post-entreno',
      description: 'Prueba "smoothie de plátano y proteína", "tostadas con pavo", "arroz con pollo" - ideales para la ventana anabólica post-ejercicio.',
      context: 'recipes',
      icon: React.createElement(Star, { className: "w-5 h-5" }),
      category: 'nutrition'
    });

    suggestions.push({
      id: 'recipes-muscle-gain-calorie-dense',
      type: 'idea',
      priority: 'medium',
      title: 'Recetas densas en calorías',
      description: 'Busca "pasta con salsa de nueces", "batidos con mantequilla de maní", "aguacate relleno" para aumentar calorías saludablemente.',
      context: 'recipes',
      icon: React.createElement(TrendingUp, { className: "w-5 h-5" }),
      category: 'nutrition'
    });
  }

  if (goal === 'mantener_peso' || goal === 'maintain') {
    suggestions.push({
      id: 'recipes-maintenance-balanced',
      type: 'idea',
      priority: 'high',
      title: 'Recetas balanceadas',
      description: 'Busca "bowl de quinoa", "salmón con verduras", "pasta integral con pollo" - comidas completas que incluyan todos los macronutrientes.',
      context: 'recipes',
      icon: React.createElement(CheckCircle, { className: "w-5 h-5" }),
      category: 'nutrition'
    });

    suggestions.push({
      id: 'recipes-maintenance-variety',
      type: 'support',
      priority: 'medium',
      title: 'Variedad en tus recetas',
      description: 'Experimenta con diferentes cocinas: "curry de garbanzos", "tacos de pescado", "stir-fry de verduras" para mantener la motivación.',
      context: 'recipes',
      icon: React.createElement(Star, { className: "w-5 h-5" }),
      category: 'lifestyle'
    });
  }

  // Sugerencias basadas en restricciones alimentarias
  if (restrictions.some(r => r.toLowerCase().includes('vegetarian'))) {
    suggestions.push({
      id: 'recipes-vegetarian-protein',
      type: 'support',
      priority: 'high',
      title: 'Recetas vegetarianas proteicas',
      description: 'Busca "lentejas con curry", "tofu salteado", "garbanzos asados", "quinoa con frijoles" para obtener proteína completa sin carne.',
      context: 'recipes',
      icon: React.createElement(Heart, { className: "w-5 h-5" }),
      category: 'nutrition'
    });

    suggestions.push({
      id: 'recipes-vegetarian-iron',
      type: 'idea',
      priority: 'medium',
      title: 'Recetas ricas en hierro vegetal',
      description: 'Prueba "espinacas con garbanzos", "quinoa con semillas", "lentejas con pimientos" - combina con vitamina C para mejor absorción.',
      context: 'recipes',
      icon: React.createElement(Lightbulb, { className: "w-5 h-5" }),
      category: 'nutrition'
    });
  }

  if (restrictions.some(r => r.toLowerCase().includes('vegano'))) {
    suggestions.push({
      id: 'recipes-vegan-complete',
      type: 'support',
      priority: 'high',
      title: 'Recetas veganas completas',
      description: 'Explora "bowl de Buddha", "curry de lentejas", "quinoa con tempeh", "chili de frijoles" para comidas veganas nutritivas y saciantes.',
      context: 'recipes',
      icon: React.createElement(Heart, { className: "w-5 h-5" }),
      category: 'nutrition'
    });

    suggestions.push({
      id: 'recipes-vegan-b12',
      type: 'warning',
      priority: 'medium',
      title: 'Atención a la vitamina B12',
      description: 'Busca recetas con "levadura nutricional", "leche vegetal fortificada" o considera suplementación - la B12 es crucial en dietas veganas.',
      context: 'recipes',
      icon: React.createElement(AlertCircle, { className: "w-5 h-5" }),
      category: 'nutrition'
    });
  }

  if (restrictions.some(r => r.toLowerCase().includes('gluten'))) {
    suggestions.push({
      id: 'recipes-gluten-free',
      type: 'support',
      priority: 'high',
      title: 'Recetas sin gluten',
      description: 'Busca "quinoa", "arroz integral", "patatas asadas", "pescado con verduras" - opciones naturalmente libres de gluten y nutritivas.',
      context: 'recipes',
      icon: React.createElement(Shield, { className: "w-5 h-5" }),
      category: 'nutrition'
    });
  }

  // Sugerencias basadas en alergias
  if (allergies.length > 0) {
    suggestions.push({
      id: 'recipes-allergy-safe',
      type: 'warning',
      priority: 'high',
      title: 'Verifica ingredientes por alergias',
      description: 'Siempre revisa la lista completa de ingredientes en las recetas para evitar alérgenos. Busca alternativas seguras para tus alergias.',
      context: 'recipes',
      icon: React.createElement(AlertCircle, { className: "w-5 h-5" }),
      category: 'health'
    });
  }

  // Sugerencias basadas en nivel de fitness
  if (fitnessLevel === 'principiante') {
    suggestions.push({
      id: 'recipes-beginner-simple',
      type: 'idea',
      priority: 'high',
      title: 'Comienza con recetas simples',
      description: 'Busca recetas con pocos ingredientes como "pasta con tomate", "pollo al horno", "ensalada césar" para empezar gradualmente.',
      context: 'recipes',
      icon: React.createElement(Star, { className: "w-5 h-5" }),
      category: 'lifestyle'
    });

    suggestions.push({
      id: 'recipes-beginner-basics',
      type: 'support',
      priority: 'medium',
      title: 'Aprende técnicas básicas',
      description: 'Busca recetas que enseñen fundamentos: "cómo cocinar arroz", "pollo a la plancha básico", "ensaladas simples" para construir confianza.',
      context: 'recipes',
      icon: React.createElement(Target, { className: "w-5 h-5" }),
      category: 'lifestyle'
    });
  }

  if (fitnessLevel === 'intermedio') {
    suggestions.push({
      id: 'recipes-intermediate-meal-prep',
      type: 'idea',
      priority: 'high',
      title: 'Recetas para meal prep',
      description: 'Busca "bowl de quinoa", "curry de lentejas", "pollo al horno con verduras" - recetas que se conservan bien para preparar varias porciones.',
      context: 'recipes',
      icon: React.createElement(CheckCircle, { className: "w-5 h-5" }),
      category: 'lifestyle'
    });

    suggestions.push({
      id: 'recipes-intermediate-timing',
      type: 'support',
      priority: 'medium',
      title: 'Recetas por timing nutricional',
      description: 'Explora "desayunos ricos en proteína", "snacks pre-entreno", "cenas ligeras" según el momento del día y tus entrenamientos.',
      context: 'recipes',
      icon: React.createElement(TrendingUp, { className: "w-5 h-5" }),
      category: 'nutrition'
    });
  }

  if (fitnessLevel === 'avanzado') {
    suggestions.push({
      id: 'recipes-advanced-precision',
      type: 'idea',
      priority: 'high',
      title: 'Recetas con macros precisos',
      description: 'Busca recetas con información nutricional detallada o aprende a calcular macros para ajustar porciones según tus objetivos específicos.',
      context: 'recipes',
      icon: React.createElement(Star, { className: "w-5 h-5" }),
      category: 'nutrition'
    });

    suggestions.push({
      id: 'recipes-advanced-periodization',
      type: 'support',
      priority: 'medium',
      title: 'Recetas por fase de entrenamiento',
      description: 'Adapta tus recetas: más carbohidratos en fases de volumen, más proteína en definición, comidas de recuperación en deload.',
      context: 'recipes',
      icon: React.createElement(TrendingUp, { className: "w-5 h-5" }),
      category: 'nutrition'
    });
  }

  // Sugerencias basadas en frecuencia de ejercicio
  if (exerciseDays >= 5) {
    suggestions.push({
      id: 'recipes-high-activity-recovery',
      type: 'idea',
      priority: 'high',
      title: 'Recetas para recuperación',
      description: 'Con entrenamientos frecuentes, busca "smoothies antiinflamatorios", "salmón con cúrcuma", "batidos de cereza" para optimizar recuperación.',
      context: 'recipes',
      icon: React.createElement(Heart, { className: "w-5 h-5" }),
      category: 'recovery'
    });

    suggestions.push({
      id: 'recipes-high-activity-energy',
      type: 'support',
      priority: 'medium',
      title: 'Recetas energéticas',
      description: 'Prueba "overnight oats con frutas", "energy balls", "batidos de plátano" para mantener energía durante entrenamientos intensos.',
      context: 'recipes',
      icon: React.createElement(TrendingUp, { className: "w-5 h-5" }),
      category: 'nutrition'
    });
  }

  // Sugerencias basadas en número de comidas
  if (mealsPerDay >= 5) {
    suggestions.push({
      id: 'recipes-frequent-meals-snacks',
      type: 'idea',
      priority: 'medium',
      title: 'Snacks saludables entre comidas',
      description: 'Busca "hummus con verduras", "yogur con nueces", "manzana con mantequilla de almendras" para snacks nutritivos entre comidas principales.',
      context: 'recipes',
      icon: React.createElement(Lightbulb, { className: "w-5 h-5" }),
      category: 'nutrition'
    });
  }

  if (mealsPerDay <= 2) {
    suggestions.push({
      id: 'recipes-few-meals-dense',
      type: 'support',
      priority: 'high',
      title: 'Comidas densas nutricionalmente',
      description: 'Con pocas comidas, busca "bowl completo con quinoa", "salmón con aguacate", "pasta con pollo y verduras" - comidas que aporten todos los nutrientes.',
      context: 'recipes',
      icon: React.createElement(Target, { className: "w-5 h-5" }),
      category: 'nutrition'
    });
  }

  // Sugerencias basadas en edad
  if (age >= 50) {
    suggestions.push({
      id: 'recipes-mature-bone-health',
      type: 'prevention',
      priority: 'medium',
      title: 'Recetas para salud ósea',
      description: 'Busca "sardinas con verduras", "yogur con semillas", "brócoli con sésamo" - alimentos ricos en calcio y vitamina D para huesos fuertes.',
      context: 'recipes',
      icon: React.createElement(Shield, { className: "w-5 h-5" }),
      category: 'health'
    });

    suggestions.push({
      id: 'recipes-mature-heart-health',
      type: 'support',
      priority: 'medium',
      title: 'Recetas cardiosaludables',
      description: 'Explora "pescado azul", "nueces y semillas", "aceite de oliva", "avena" - ingredientes que apoyan la salud cardiovascular.',
      context: 'recipes',
      icon: React.createElement(Heart, { className: "w-5 h-5" }),
      category: 'health'
    });
  }

  // Sugerencias estacionales
  const currentMonth = new Date().getMonth();
  const isSummer = currentMonth >= 5 && currentMonth <= 8;
  const isWinter = currentMonth >= 11 || currentMonth <= 2;

  if (isSummer) {
    suggestions.push({
      id: 'recipes-summer-fresh',
      type: 'idea',
      priority: 'low',
      title: 'Recetas frescas de verano',
      description: 'Aprovecha el verano con "ensaladas frescas", "gazpacho", "smoothie bowls", "pescado a la plancha" - comidas ligeras y refrescantes.',
      context: 'recipes',
      icon: React.createElement(Star, { className: "w-5 h-5" }),
      category: 'lifestyle'
    });
  }

  if (isWinter) {
    suggestions.push({
      id: 'recipes-winter-warming',
      type: 'idea',
      priority: 'low',
      title: 'Recetas reconfortantes de invierno',
      description: 'Busca "sopas nutritivas", "guisos de legumbres", "avena caliente", "té de jengibre" - comidas que te calienten y nutran en invierno.',
      context: 'recipes',
      icon: React.createElement(Heart, { className: "w-5 h-5" }),
      category: 'lifestyle'
    });
  }

  // Sugerencias generales de búsqueda
  suggestions.push({
    id: 'recipes-search-tips',
    type: 'support',
    priority: 'low',
    title: 'Consejos para buscar recetas',
    description: 'Usa términos específicos como "bajo en sodio", "alto en proteína", "sin azúcar añadido" para encontrar recetas que se ajusten a tus necesidades.',
    context: 'recipes',
    icon: React.createElement(Lightbulb, { className: "w-5 h-5" }),
    category: 'lifestyle'
  });

  return suggestions;
}; 