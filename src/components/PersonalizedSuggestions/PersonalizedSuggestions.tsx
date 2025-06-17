import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, 
  ChevronRight,
  X
} from 'lucide-react';
import { useTheme } from '../../pages/ThemeContext';
import { PersonalizedSuggestionsProps, Suggestion, SuggestionContext } from './types';
import { getTypeColor, getTypeBg, contextCategoryMap, sortSuggestionsByPriority, getCategoryDisplayName } from './utils';
import { generateDashboardSuggestions, generateWaterSuggestions, generateBasicSuggestions, generateRecipesSuggestions, generateAiFoodSuggestions, generateNutritionSuggestions } from './generators';

const PersonalizedSuggestions: React.FC<PersonalizedSuggestionsProps> = ({
  userProfile,
  context = 'general',
  maxSuggestions = 3,
  showCategories = true,
  userData
}) => {
  const { isDarkMode } = useTheme();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([]);
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Generate context-specific suggestions (memoized)
  const generateContextSpecificSuggestions = useCallback((userData: any, context: SuggestionContext): Suggestion[] => {
    if (!userData || !userData.profile) return [];

    switch (context) {
      case 'dashboard':
        return generateDashboardSuggestions(userData);
      case 'water':
        return generateWaterSuggestions(userData);
      case 'recipes':
        return generateRecipesSuggestions(userData);
      case 'ai_food':
        return generateAiFoodSuggestions(userData);
      case 'nutrition':
        return generateNutritionSuggestions(userData);
      case 'rm_progress':
        return generateDashboardSuggestions(userData); // Use dashboard suggestions for RM progress
      case 'routines':
        return generateDashboardSuggestions(userData); // Use dashboard suggestions for routines
      default:
        return [];
    }
  }, []);

  // Generate general suggestions based on user profile (memoized)
  const generateGeneralSuggestions = useCallback((profile: any): Suggestion[] => {
    const allSuggestions: Suggestion[] = [];
    
    // Add general suggestions logic here (simplified version)
    if (profile?.nivel_fitness === 'principiante') {
      allSuggestions.push({
        id: 'beginner-start-slow',
        type: 'prevention',
        title: 'Comienza gradualmente',
        description: 'Como principiante, es importante empezar con ejercicios básicos y aumentar la intensidad progresivamente.',
        icon: React.createElement(Lightbulb, { className: "w-5 h-5" }),
        priority: 'high',
        category: 'exercise',
        context: 'general'
      });
    }

    // Add more general suggestions based on profile...
    
    return allSuggestions;
  }, []);

  // Memoize suggestions generation
  const generatedSuggestions = useMemo(() => {
    if (userProfile && userData) {
      // Generate context-specific suggestions
      const contextSuggestions = generateContextSpecificSuggestions(userData, context as SuggestionContext);
      
      // Generate general suggestions
      const generalSuggestions = generateGeneralSuggestions(userProfile);
      
      // Combine all suggestions
      let allSuggestions = [...contextSuggestions, ...generalSuggestions];
      
      // Filter by context if needed
      if (context !== 'general') {
        allSuggestions = allSuggestions.filter(s => 
          contextCategoryMap[context]?.includes(s.category) || s.context === context
        );
      }

      // Filter dismissed suggestions
      allSuggestions = allSuggestions.filter(s => 
        !dismissedSuggestions.includes(s.id)
      );

      // Sort by priority and limit
      const sortedSuggestions = sortSuggestionsByPriority(allSuggestions);
      return sortedSuggestions.slice(0, maxSuggestions);
    } else {
      // Generate basic suggestions when no profile
      return generateBasicSuggestions(
        context as SuggestionContext, 
        maxSuggestions, 
        dismissedSuggestions
      );
    }
  }, [userProfile, userData, context, maxSuggestions, dismissedSuggestions, generateContextSpecificSuggestions, generateGeneralSuggestions]);

  // Update suggestions when generated suggestions change
  useEffect(() => {
    setIsLoading(true);
    // Set suggestions immediately to avoid animation conflicts
    setSuggestions(generatedSuggestions);
    setIsLoading(false);
  }, [generatedSuggestions]);

  const dismissSuggestion = useCallback((suggestionId: string) => {
    setDismissedSuggestions(prev => [...prev, suggestionId]);
  }, []);

  // Show loading state or empty state
  if (isLoading || suggestions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`rounded-lg p-5 ${
          isDarkMode ? 'bg-[#3B4252]' : 'bg-white'
        } shadow-md`}
      >
        <div className="flex items-center space-x-2 mb-4">
          <Lightbulb className={`w-5 h-5 ${isDarkMode ? 'text-[#ff9404]' : 'text-[#ff9404]'}`} />
          <h3 className={`text-lg font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Sugerencias Personalizadas
          </h3>
          {userProfile && userProfile.nivel_fitness && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              isDarkMode ? 'bg-[#ff9404]/20 text-[#ff9404]' : 'bg-[#ff9404]/10 text-[#ff9404]'
            }`}>
              {userProfile.nivel_fitness.charAt(0).toUpperCase() + userProfile.nivel_fitness.slice(1)}
            </span>
          )}
        </div>
        <div className={`text-center py-4 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {isLoading ? (
            <>
              <div className="animate-spin w-8 h-8 mx-auto mb-2 border-2 border-[#ff9404] border-t-transparent rounded-full"></div>
              <p className="text-sm">Cargando sugerencias...</p>
            </>
          ) : (
            <>
              <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay sugerencias disponibles en este momento</p>
            </>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-lg p-5 ${
        isDarkMode ? 'bg-[#3B4252]' : 'bg-white'
      } shadow-md`}
    >
      <div className="flex items-center space-x-2 mb-4">
        <Lightbulb className={`w-5 h-5 ${isDarkMode ? 'text-[#ff9404]' : 'text-[#ff9404]'}`} />
        <h3 className={`text-lg font-semibold ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Sugerencias Personalizadas
        </h3>
        {userProfile && userProfile.nivel_fitness && (
          <span className={`text-xs px-2 py-1 rounded-full ${
            isDarkMode ? 'bg-[#ff9404]/20 text-[#ff9404]' : 'bg-[#ff9404]/10 text-[#ff9404]'
          }`}>
            {userProfile.nivel_fitness.charAt(0).toUpperCase() + userProfile.nivel_fitness.slice(1)}
          </span>
        )}
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${getTypeBg(suggestion.type, isDarkMode)} ${
                isDarkMode ? 'border-gray-600' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`${getTypeColor(suggestion.type, isDarkMode)} mt-0.5`}>
                    {suggestion.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className={`font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {suggestion.title}
                      </h4>
                      {suggestion.priority === 'high' && (
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      )}
                    </div>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    } ${expandedSuggestion === suggestion.id ? '' : 'line-clamp-2'}`}>
                      {suggestion.description}
                    </p>
                    {suggestion.description.length > 100 && (
                      <button
                        onClick={() => setExpandedSuggestion(
                          expandedSuggestion === suggestion.id ? null : suggestion.id
                        )}
                        className={`text-xs mt-1 ${getTypeColor(suggestion.type, isDarkMode)} hover:underline flex items-center space-x-1`}
                      >
                        <span>{expandedSuggestion === suggestion.id ? 'Ver menos' : 'Ver más'}</span>
                        <ChevronRight className={`w-3 h-3 transition-transform ${
                          expandedSuggestion === suggestion.id ? 'rotate-90' : ''
                        }`} />
                      </button>
                    )}
                    {showCategories && (
                      <span className={`inline-block text-xs px-2 py-1 rounded-full mt-2 ${
                        isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {getCategoryDisplayName(suggestion.category)}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => dismissSuggestion(suggestion.id)}
                  className={`ml-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
                    isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>


    </motion.div>
  );
};

export default PersonalizedSuggestions; 