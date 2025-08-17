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
import { generateRoutinesSuggestions } from './generators/routinesSuggestions';
import { generateSettingsSuggestions } from './generators/settingsSuggestions';

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
  const [error, setError] = useState<string | null>(null);

  // Generate context-specific suggestions (memoized)
  const generateContextSpecificSuggestions = useCallback((userData: any, context: SuggestionContext): Suggestion[] => {
    // Si no hay userData o profile, devolver array vacío - las sugerencias básicas se manejan en otro lugar
    if (!userData || !userData.profile) return [];

    try {
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
          return generateRoutinesSuggestions(userData); // Use dedicated routines suggestions
        case 'settings':
          return generateSettingsSuggestions(userData); // Use dedicated settings suggestions
        default:
          return [];
      }
    } catch (error) {
      console.error('Error generating context-specific suggestions:', error);
      return [];
    }
  }, []);

  // Generate general suggestions based on user profile (memoized)
  const generateGeneralSuggestions = useCallback((profile: any): Suggestion[] => {
    try {
      const allSuggestions: Suggestion[] = [];
      const fitnessLevel = profile?.nivel_fitness || 'principiante';
      const age = profile?.edad || 25;
      const objective = profile?.objetivo_nutricional || '';
      
      // Sugerencias basadas en nivel de fitness
      if (fitnessLevel === 'principiante') {
        allSuggestions.push({
          id: 'beginner-start-slow',
          type: 'support',
          title: 'Comienza gradualmente tu viaje fitness',
          description: 'Como principiante, es importante empezar con ejercicios básicos y aumentar la intensidad progresivamente. Enfócate en aprender la técnica correcta antes que en el peso.',
          icon: React.createElement(Lightbulb, { className: "w-5 h-5" }),
          priority: 'high',
          category: 'exercise',
          context: 'general'
        });

        allSuggestions.push({
          id: 'beginner-habits',
          type: 'idea',
          title: 'Construye hábitos saludables',
          description: 'Empieza con pequeños cambios: beber más agua, caminar 20 minutos al día, y registrar tus comidas. La consistencia es más importante que la intensidad.',
          icon: React.createElement(Lightbulb, { className: "w-5 h-5" }),
          priority: 'high',
          category: 'lifestyle',
          context: 'general'
        });
      }

      if (fitnessLevel === 'intermedio') {
        allSuggestions.push({
          id: 'intermediate-progression',
          type: 'idea',
          title: 'Optimiza tu progresión',
          description: 'Con tu nivel intermedio, es momento de implementar periodización en tu entrenamiento y ser más específico con tus objetivos nutricionales.',
          icon: React.createElement(Lightbulb, { className: "w-5 h-5" }),
          priority: 'high',
          category: 'exercise',
          context: 'general'
        });

        allSuggestions.push({
          id: 'intermediate-tracking',
          type: 'support',
          title: 'Monitorea tu progreso detalladamente',
          description: 'Lleva un registro más detallado de tus entrenamientos, medidas corporales y cómo te sientes. Esto te ayudará a ajustar tu plan según sea necesario.',
          icon: React.createElement(Lightbulb, { className: "w-5 h-5" }),
          priority: 'medium',
          category: 'lifestyle',
          context: 'general'
        });
      }

      if (fitnessLevel === 'avanzado') {
        allSuggestions.push({
          id: 'advanced-periodization',
          type: 'idea',
          title: 'Refina tu periodización',
          description: 'Como atleta avanzado, considera ciclos de entrenamiento más complejos y asegúrate de incluir fases de descarga para evitar el sobreentrenamiento.',
          icon: React.createElement(Lightbulb, { className: "w-5 h-5" }),
          priority: 'medium',
          category: 'exercise',
          context: 'general'
        });
      }

      // Sugerencias basadas en objetivos
      if (objective.includes('perder')) {
        allSuggestions.push({
          id: 'weight-loss-mindset',
          type: 'support',
          title: 'Enfoque sostenible para perder peso',
          description: 'Recuerda que la pérdida de peso saludable es gradual. Crea un déficit calórico moderado y combina cardio con entrenamiento de fuerza.',
          icon: React.createElement(Lightbulb, { className: "w-5 h-5" }),
          priority: 'high',
          category: 'nutrition',
          context: 'general'
        });
      }

      if (objective.includes('ganar') || objective.includes('músculo')) {
        allSuggestions.push({
          id: 'muscle-gain-focus',
          type: 'idea',
          title: 'Optimiza tu ganancia muscular',
          description: 'Para ganar músculo, asegúrate de comer suficiente proteína (1.6-2.2g por kg), tener un ligero superávit calórico y priorizar el entrenamiento de fuerza.',
          icon: React.createElement(Lightbulb, { className: "w-5 h-5" }),
          priority: 'high',
          category: 'nutrition',
          context: 'general'
        });
      }

      // Sugerencias basadas en edad
      if (age >= 40) {
        allSuggestions.push({
          id: 'mature-athlete-recovery',
          type: 'prevention',
          title: 'Prioriza la recuperación',
          description: 'A partir de los 40, la recuperación se vuelve crucial. Asegúrate de dormir 7-8 horas, incluir movilidad en tu rutina y no subestimes los días de descanso.',
          icon: React.createElement(Lightbulb, { className: "w-5 h-5" }),
          priority: 'high',
          category: 'recovery',
          context: 'general'
        });
      }
      
      return allSuggestions;
    } catch (error) {
      console.error('Error generating general suggestions:', error);
      return [];
    }
  }, []);

  // Memoize suggestions generation
  const generatedSuggestions = useMemo(() => {
    try {
      setError(null);
      
      let allSuggestions: Suggestion[] = [];

      // 1. PRIORIDAD ALTA: Generar sugerencias contextuales específicas si tenemos userData con profile
      if (userData && userData.profile) {
        const contextSuggestions = generateContextSpecificSuggestions(userData, context as SuggestionContext);
        allSuggestions = [...contextSuggestions];
      }

      // 2. PRIORIDAD MEDIA: Agregar sugerencias generales si tenemos userProfile (sin reemplazar las contextuales)
      if (userProfile && allSuggestions.length < maxSuggestions) {
        const generalSuggestions = generateGeneralSuggestions(userProfile);
        allSuggestions = [...allSuggestions, ...generalSuggestions];
      }

      // 3. PRIORIDAD BAJA: Solo usar sugerencias básicas si no hay suficientes específicas
      if (allSuggestions.length < maxSuggestions) {
        const basicSuggestions = generateBasicSuggestions(
          context as SuggestionContext, 
          maxSuggestions - allSuggestions.length, // Solo las que faltan
          dismissedSuggestions
        );
        allSuggestions = [...allSuggestions, ...basicSuggestions];
      }

      // Filter dismissed suggestions
      allSuggestions = allSuggestions.filter(s => 
        !dismissedSuggestions.includes(s.id)
      );

      // Remove duplicates by id
      const uniqueSuggestions = allSuggestions.filter((suggestion, index, self) => 
        index === self.findIndex((s) => s.id === suggestion.id)
      );

      // Filter by context DESPUÉS de generar, pero más permisivo
      let filteredSuggestions = uniqueSuggestions;
      if (context !== 'general') {
        filteredSuggestions = uniqueSuggestions.filter(s => 
          s.context === context || 
          contextCategoryMap[context]?.includes(s.category) ||
          s.context === 'general' // Permitir sugerencias generales en cualquier contexto
        );
      }

      const sortedSuggestions = sortSuggestionsByPriority(filteredSuggestions);
      const finalSuggestions = sortedSuggestions.slice(0, maxSuggestions);
      
      return finalSuggestions;
    } catch (err) {
      console.error('Error in suggestions generation:', err);
      setError('Error al generar sugerencias');
      return [];
    }
  }, [userProfile, userData, context, maxSuggestions, dismissedSuggestions, generateContextSpecificSuggestions, generateGeneralSuggestions]);

  // Update suggestions when generated suggestions change
  useEffect(() => {
    setIsLoading(true);
    
    // Use a small timeout to batch updates and avoid race conditions
    const timeoutId = setTimeout(() => {
      setSuggestions(generatedSuggestions);
      setIsLoading(false);
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [generatedSuggestions]);

  const dismissSuggestion = useCallback((suggestionId: string) => {
    setDismissedSuggestions(prev => [...prev, suggestionId]);
  }, []);

  // Show loading state or empty state
  if (isLoading) {
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
          <div className="animate-spin w-8 h-8 mx-auto mb-2 border-2 border-[#ff9404] border-t-transparent rounded-full"></div>
          <p className="text-sm">Cargando sugerencias...</p>
        </div>
      </motion.div>
    );
  }

  if (suggestions.length === 0 && !error) {
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
          <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No hay sugerencias disponibles en este momento</p>
          <p className="text-xs mt-2">Completa tu perfil para obtener sugerencias personalizadas</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
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
        </div>
        <div className={`text-center py-4 ${
          isDarkMode ? 'text-red-400' : 'text-red-500'
        }`}>
          <X className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-2">Intenta recargar la página</p>
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