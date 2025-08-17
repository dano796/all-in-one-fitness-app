import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserProfile, 
  UserProfileFormData,
  GENERO_OPTIONS,
  NIVEL_ACTIVIDAD_OPTIONS,
  EXPERIENCIA_EJERCICIO_OPTIONS,
  TIPOS_EJERCICIO_OPTIONS,
  OBJETIVO_NUTRICIONAL_OPTIONS,
  RESTRICCIONES_ALIMENTARIAS_OPTIONS,
  ALERGIAS_COMUNES_OPTIONS,
  NIVEL_ESTRES_OPTIONS,
  TRABAJO_TIPO_OPTIONS
} from '../types/userProfile';
import { 
  User, 
  Activity, 
  Heart, 
  Utensils, 
  Shield, 
  Moon, 
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Star
} from 'lucide-react';

interface UserProfileFormProps {
  userId: number;
  existingProfile?: UserProfile;
  onSubmit: (profileData: UserProfileFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  compact?: boolean;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({
  userId,
  existingProfile,
  onSubmit,
  onCancel,
  isLoading = false,
  compact = false
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<UserProfileFormData>({
    idusuario: userId,
    ...existingProfile
  });

  const steps = [
    {
      title: 'Información Básica',
      icon: User,
      description: 'Datos personales fundamentales'
    },
    {
      title: 'Actividad Física',
      icon: Activity,
      description: 'Tu experiencia y preferencias de ejercicio'
    },
    {
      title: 'Objetivos Nutricionales',
      icon: Utensils,
      description: 'Metas y restricciones alimentarias'
    },
    {
      title: 'Información de Salud',
      icon: Shield,
      description: 'Condiciones médicas y medicamentos'
    },
    {
      title: 'Estilo de Vida',
      icon: Moon,
      description: 'Hábitos de sueño y trabajo'
    }
  ];

  const handleInputChange = (field: keyof UserProfileFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: keyof UserProfileFormData, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentArray = (prev[field] as string[]) || [];
      if (checked) {
        return {
          ...prev,
          [field]: [...currentArray, value]
        };
      } else {
        return {
          ...prev,
          [field]: currentArray.filter(item => item !== value)
        };
      }
    });
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0: // Información básica
        return !!(formData.edad && formData.genero && formData.altura_cm && formData.peso_actual_kg);
      case 1: // Actividad física
        return !!(formData.nivel_actividad && formData.experiencia_ejercicio && 
                 formData.dias_ejercicio_semana !== undefined);
      case 2: // Nutricional
        return !!(formData.objetivo_nutricional && formData.comidas_por_dia);
      case 3: // Salud - opcional
        return true;
      case 4: // Estilo de vida
        return !!(formData.horas_sueno_promedio && formData.nivel_estres && formData.trabajo_tipo);
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1 && isStepValid(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Utilidad para limpiar los datos antes de enviar al backend
  function cleanProfileData(data: UserProfileFormData): UserProfileFormData {
    const cleaned: any = { ...data };
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === '' || (Array.isArray(cleaned[key]) && cleaned[key].length === 0)) {
        cleaned[key] = null;
      }
    });
    return cleaned;
  }

  const handleSubmit = async () => {
    if (isStepValid(currentStep)) {
      await onSubmit(cleanProfileData(formData));
    }
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Edad *
          </label>
          <input
            type="number"
            min="13"
            max="120"
            value={formData.edad || ''}
            onChange={(e) => handleInputChange('edad', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#ff9404] dark:bg-gray-700 dark:text-white"
            placeholder="Ej: 25"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Género *
          </label>
          <select
            value={formData.genero || ''}
            onChange={(e) => handleInputChange('genero', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#ff9404] dark:bg-gray-700 dark:text-white"
          >
            <option value="">Seleccionar...</option>
            {GENERO_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Altura (cm) *
          </label>
          <input
            type="number"
            min="100"
            max="250"
            value={formData.altura_cm || ''}
            onChange={(e) => handleInputChange('altura_cm', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#ff9404] dark:bg-gray-700 dark:text-white"
            placeholder="Ej: 170"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Peso Actual (kg) *
          </label>
          <input
            type="number"
            min="30"
            max="300"
            step="0.1"
            value={formData.peso_actual_kg || ''}
            onChange={(e) => handleInputChange('peso_actual_kg', parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#ff9404] dark:bg-gray-700 dark:text-white"
            placeholder="Ej: 70.5"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Peso Objetivo (kg)
          </label>
          <input
            type="number"
            min="30"
            max="300"
            step="0.1"
            value={formData.peso_objetivo_kg || ''}
            onChange={(e) => handleInputChange('peso_objetivo_kg', parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#ff9404] dark:bg-gray-700 dark:text-white"
            placeholder="Ej: 65.0"
          />
        </div>
      </div>
    </div>
  );

  const renderActivityInfo = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Nivel de Actividad *
        </label>
        <select
          value={formData.nivel_actividad || ''}
          onChange={(e) => handleInputChange('nivel_actividad', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#ff9404] dark:bg-gray-700 dark:text-white"
        >
          <option value="">Seleccionar...</option>
          {NIVEL_ACTIVIDAD_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Experiencia en Ejercicio *
        </label>
        <select
          value={formData.experiencia_ejercicio || ''}
          onChange={(e) => handleInputChange('experiencia_ejercicio', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#ff9404] dark:bg-gray-700 dark:text-white"
        >
          <option value="">Seleccionar...</option>
          {EXPERIENCIA_EJERCICIO_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Días de Ejercicio por Semana *
        </label>
        <input
          type="number"
          min="0"
          max="7"
          value={formData.dias_ejercicio_semana || ''}
          onChange={(e) => handleInputChange('dias_ejercicio_semana', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#ff9404] dark:bg-gray-700 dark:text-white"
          placeholder="Ej: 3"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Tipos de Ejercicio Preferidos
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TIPOS_EJERCICIO_OPTIONS.map(option => (
            <label key={option.value} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={(formData.tipos_ejercicio_preferidos || []).includes(option.value)}
                onChange={(e) => handleArrayChange('tipos_ejercicio_preferidos', option.value, e.target.checked)}
                className="w-4 h-4 text-[#ff9404] border-gray-300 rounded focus:ring-[#ff9404]"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNutritionalInfo = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Objetivo Nutricional *
        </label>
        <select
          value={formData.objetivo_nutricional || ''}
          onChange={(e) => handleInputChange('objetivo_nutricional', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#ff9404] dark:bg-gray-700 dark:text-white"
        >
          <option value="">Seleccionar...</option>
          {OBJETIVO_NUTRICIONAL_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Comidas por Día *
        </label>
        <input
          type="number"
          min="1"
          max="8"
          value={formData.comidas_por_dia || ''}
          onChange={(e) => handleInputChange('comidas_por_dia', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#ff9404] dark:bg-gray-700 dark:text-white"
          placeholder="Ej: 3"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Restricciones Alimentarias
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {RESTRICCIONES_ALIMENTARIAS_OPTIONS.map(option => (
            <label key={option.value} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={(formData.restricciones_alimentarias || []).includes(option.value)}
                onChange={(e) => handleArrayChange('restricciones_alimentarias', option.value, e.target.checked)}
                className="w-4 h-4 text-[#ff9404] border-gray-300 rounded focus:ring-[#ff9404]"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Alergias Alimentarias
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ALERGIAS_COMUNES_OPTIONS.map(option => (
            <label key={option.value} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={(formData.alergias_alimentarias || []).includes(option.value)}
                onChange={(e) => handleArrayChange('alergias_alimentarias', option.value, e.target.checked)}
                className="w-4 h-4 text-[#ff9404] border-gray-300 rounded focus:ring-[#ff9404]"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderHealthInfo = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Condiciones Médicas
        </label>
        <textarea
          value={(formData.condiciones_medicas || []).join(', ')}
          onChange={(e) => handleInputChange('condiciones_medicas', e.target.value.split(', ').filter(item => item.trim()))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#ff9404] dark:bg-gray-700 dark:text-white"
          rows={3}
          placeholder="Ej: Diabetes, Hipertensión (separar con comas)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Medicamentos
        </label>
        <textarea
          value={(formData.medicamentos || []).join(', ')}
          onChange={(e) => handleInputChange('medicamentos', e.target.value.split(', ').filter(item => item.trim()))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#ff9404] dark:bg-gray-700 dark:text-white"
          rows={3}
          placeholder="Ej: Metformina, Ibuprofeno (separar con comas)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Lesiones Previas
        </label>
        <textarea
          value={(formData.lesiones_previas || []).join(', ')}
          onChange={(e) => handleInputChange('lesiones_previas', e.target.value.split(', ').filter(item => item.trim()))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#ff9404] dark:bg-gray-700 dark:text-white"
          rows={3}
          placeholder="Ej: Lesión de rodilla, Dolor de espalda (separar con comas)"
        />
      </div>
    </div>
  );

  const renderLifestyleInfo = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Horas de Sueño Promedio *
        </label>
        <input
          type="number"
          min="3"
          max="12"
          step="0.5"
          value={formData.horas_sueno_promedio || ''}
          onChange={(e) => handleInputChange('horas_sueno_promedio', parseFloat(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#ff9404] dark:bg-gray-700 dark:text-white"
          placeholder="Ej: 7.5"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Nivel de Estrés *
        </label>
        <select
          value={formData.nivel_estres || ''}
          onChange={(e) => handleInputChange('nivel_estres', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#ff9404] dark:bg-gray-700 dark:text-white"
        >
          <option value="">Seleccionar...</option>
          {NIVEL_ESTRES_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tipo de Trabajo *
        </label>
        <select
          value={formData.trabajo_tipo || ''}
          onChange={(e) => handleInputChange('trabajo_tipo', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#ff9404] dark:bg-gray-700 dark:text-white"
        >
          <option value="">Seleccionar...</option>
          {TRABAJO_TIPO_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderBasicInfo();
      case 1:
        return renderActivityInfo();
      case 2:
        return renderNutritionalInfo();
      case 3:
        return renderHealthInfo();
      case 4:
        return renderLifestyleInfo();
      default:
        return null;
    }
  };

  return (
    <div className={`${compact ? 'max-w-none p-0' : 'max-w-4xl mx-auto p-6'} ${compact ? '' : 'bg-white dark:bg-gray-800 rounded-xl shadow-lg'}`}>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div key={index} className="flex flex-col items-center">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300
                  ${isActive ? 'bg-[#ff9404] text-white' : 
                    isCompleted ? 'bg-green-500 text-white' : 
                    'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'}
                `}>
                  {isCompleted ? <CheckCircle size={20} /> : <Icon size={20} />}
                </div>
                <span className={`text-xs text-center max-w-20 ${
                  isActive ? 'text-[#ff9404] dark:text-[#ff9404] font-medium' : 
                  'text-gray-500 dark:text-gray-400'
                }`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
          <div 
            className="bg-[#ff9404] h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {steps[currentStep].title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {steps[currentStep].description}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={currentStep === 0 ? onCancel : prevStep}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          disabled={isLoading}
        >
          <ArrowLeft size={20} />
          <span>{currentStep === 0 ? 'Cancelar' : 'Anterior'}</span>
        </button>

        <div className="flex items-center space-x-2">
          {currentStep < steps.length - 1 ? (
            <button
              onClick={nextStep}
              disabled={!isStepValid(currentStep) || isLoading}
              className="flex items-center space-x-2 px-6 py-2 bg-[#ff9404] text-white rounded-lg hover:bg-[#e8850a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span>Siguiente</span>
              <ArrowRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!isStepValid(currentStep) || isLoading}
              className="flex items-center space-x-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Star size={20} />
                  <span>Completar Perfil</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileForm;