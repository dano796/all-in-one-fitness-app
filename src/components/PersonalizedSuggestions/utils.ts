import { SuggestionType, SuggestionPriority, Suggestion } from './types';

export const getTypeColor = (type: SuggestionType, isDarkMode: boolean): string => {
  const colors = {
    prevention: isDarkMode ? 'text-blue-400' : 'text-blue-600',
    support: isDarkMode ? 'text-green-400' : 'text-green-600',
    idea: isDarkMode ? 'text-yellow-400' : 'text-yellow-600',
    warning: isDarkMode ? 'text-red-400' : 'text-red-600',
    achievement: isDarkMode ? 'text-purple-400' : 'text-purple-600'
  };
  return colors[type];
};

export const getTypeBg = (type: SuggestionType, isDarkMode: boolean): string => {
  const colors = {
    prevention: isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50',
    support: isDarkMode ? 'bg-green-500/10' : 'bg-green-50',
    idea: isDarkMode ? 'bg-yellow-500/10' : 'bg-yellow-50',
    warning: isDarkMode ? 'bg-red-500/10' : 'bg-red-50',
    achievement: isDarkMode ? 'bg-purple-500/10' : 'bg-purple-50'
  };
  return colors[type];
};

export const contextCategoryMap: Record<string, string[]> = {
  dashboard: ['exercise', 'nutrition', 'lifestyle', 'recovery'],
  nutrition: ['nutrition'],
  exercise: ['exercise', 'recovery'],
  water: ['lifestyle', 'health'],
  settings: ['lifestyle', 'health', 'recovery'],
  progress: ['exercise', 'nutrition', 'lifestyle', 'health'],
  ai_food: ['nutrition', 'lifestyle'],
  recipes: ['nutrition', 'lifestyle'],
  rm_progress: ['exercise', 'recovery'],
  routines: ['exercise', 'recovery']
};

export const priorityOrder: Record<SuggestionPriority, number> = { high: 3, medium: 2, low: 1 };

export const sortSuggestionsByPriority = (suggestions: Suggestion[]) => {
  return suggestions.sort((a, b) => {
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};

export const getCategoryDisplayName = (category: string): string => {
  const categoryTranslations: Record<string, string> = {
    nutrition: 'Nutrición',
    exercise: 'Ejercicio',
    recovery: 'Recuperación',
    lifestyle: 'Estilo de Vida',
    health: 'Salud'
  };
  return categoryTranslations[category] || category;
}; 