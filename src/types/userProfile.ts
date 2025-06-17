export interface UserProfile {
  id_profile?: number;
  idusuario: number;
  
  // Información básica
  edad?: number;
  genero?: 'masculino' | 'femenino' | 'otro';
  altura_cm?: number;
  peso_actual_kg?: number;
  peso_objetivo_kg?: number;
  
  // Información de actividad física
  nivel_actividad?: 'sedentario' | 'ligero' | 'moderado' | 'activo' | 'muy_activo';
  experiencia_ejercicio?: 'principiante' | 'intermedio' | 'avanzado';
  dias_ejercicio_semana?: number;
  tipos_ejercicio_preferidos?: string[];
  
  // Información nutricional
  objetivo_nutricional?: 'perder_peso' | 'mantener_peso' | 'ganar_peso' | 'ganar_musculo';
  restricciones_alimentarias?: string[];
  alergias_alimentarias?: string[];
  comidas_por_dia?: number;
  
  // Información de salud
  condiciones_medicas?: string[];
  medicamentos?: string[];
  lesiones_previas?: string[];
  
  // Información de estilo de vida
  horas_sueno_promedio?: number;
  nivel_estres?: 'bajo' | 'medio' | 'alto';
  trabajo_tipo?: 'sedentario' | 'activo' | 'muy_activo';
  
  // Clasificación automática
  nivel_fitness?: 'principiante' | 'intermedio' | 'avanzado';
  puntuacion_fitness?: number;
  
  // Metadatos
  created_at?: string;
  updated_at?: string;
  profile_completed?: boolean;
}

export type UserProfileFormData = Omit<UserProfile, 'id_profile' | 'created_at' | 'updated_at' | 'nivel_fitness' | 'puntuacion_fitness'>;

export interface FitnessLevelCalculation {
  previous_level?: string;
  new_level: string;
  previous_score?: number;
  new_score: number;
}

export interface ProfileApiResponse {
  success: boolean;
  message?: string;
  profile?: UserProfile;
  calculation?: FitnessLevelCalculation;
  error?: string;
}

// Opciones para los formularios
export const GENERO_OPTIONS = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' }
];

export const NIVEL_ACTIVIDAD_OPTIONS = [
  { value: 'sedentario', label: 'Sedentario (poco o nada de ejercicio)' },
  { value: 'ligero', label: 'Ligero (ejercicio ligero 1-3 días/semana)' },
  { value: 'moderado', label: 'Moderado (ejercicio moderado 3-5 días/semana)' },
  { value: 'activo', label: 'Activo (ejercicio intenso 6-7 días/semana)' },
  { value: 'muy_activo', label: 'Muy activo (ejercicio muy intenso, trabajo físico)' }
];

export const EXPERIENCIA_EJERCICIO_OPTIONS = [
  { value: 'principiante', label: 'Principiante (menos de 1 año)' },
  { value: 'intermedio', label: 'Intermedio (1-3 años)' },
  { value: 'avanzado', label: 'Avanzado (más de 3 años)' }
];

export const TIPOS_EJERCICIO_OPTIONS = [
  { value: 'cardio', label: 'Cardio (correr, caminar, bicicleta)' },
  { value: 'fuerza', label: 'Entrenamiento de fuerza (pesas, resistencia)' },
  { value: 'flexibilidad', label: 'Flexibilidad (yoga, pilates, estiramientos)' },
  { value: 'deportes', label: 'Deportes (fútbol, tenis, natación, etc.)' },
  { value: 'funcional', label: 'Entrenamiento funcional (crossfit, calistenia)' },
  { value: 'baile', label: 'Baile y actividades rítmicas' }
];

export const OBJETIVO_NUTRICIONAL_OPTIONS = [
  { value: 'perder_peso', label: 'Perder peso' },
  { value: 'mantener_peso', label: 'Mantener peso actual' },
  { value: 'ganar_peso', label: 'Ganar peso' },
  { value: 'ganar_musculo', label: 'Ganar masa muscular' }
];

export const RESTRICCIONES_ALIMENTARIAS_OPTIONS = [
  { value: 'vegetariano', label: 'Vegetariano' },
  { value: 'vegano', label: 'Vegano' },
  { value: 'sin_gluten', label: 'Sin gluten' },
  { value: 'sin_lactosa', label: 'Sin lactosa' },
  { value: 'keto', label: 'Dieta cetogénica' },
  { value: 'paleo', label: 'Dieta paleo' },
  { value: 'mediterranea', label: 'Dieta mediterránea' },
  { value: 'bajo_sodio', label: 'Bajo en sodio' },
  { value: 'diabetico', label: 'Dieta para diabéticos' }
];

export const ALERGIAS_COMUNES_OPTIONS = [
  { value: 'nueces', label: 'Nueces y frutos secos' },
  { value: 'mariscos', label: 'Mariscos' },
  { value: 'huevos', label: 'Huevos' },
  { value: 'soja', label: 'Soja' },
  { value: 'pescado', label: 'Pescado' },
  { value: 'sesamo', label: 'Sésamo' },
  { value: 'sulfitos', label: 'Sulfitos' }
];

export const NIVEL_ESTRES_OPTIONS = [
  { value: 'bajo', label: 'Bajo (raramente me siento estresado)' },
  { value: 'medio', label: 'Medio (ocasionalmente me siento estresado)' },
  { value: 'alto', label: 'Alto (frecuentemente me siento estresado)' }
];

export const TRABAJO_TIPO_OPTIONS = [
  { value: 'sedentario', label: 'Sedentario (oficina, escritorio)' },
  { value: 'activo', label: 'Activo (caminar, estar de pie frecuentemente)' },
  { value: 'muy_activo', label: 'Muy activo (trabajo físico, construcción, etc.)' }
]; 