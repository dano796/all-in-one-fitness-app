import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Utensils, 
  Dumbbell, 
  Activity, 
  Droplets, 
  Calculator, 
  Camera 
} from 'lucide-react';

const ModulesPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8 text-center">Nuestros Módulos</h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <ModuleCard
          icon={<Utensils className="w-8 h-8" />}
          title="Conteo de Calorías"
          description="Registra tu ingesta diaria de alimentos y monitorea tus macronutrientes de forma precisa."
          features={[
            "Registro de comidas diarias",
            "Análisis de macronutrientes",
            "Base de datos de alimentos",
            "Historial y estadísticas"
          ]}
        />

        <ModuleCard
          icon={<Dumbbell className="w-8 h-8" />}
          title="Registro de Entrenamientos"
          description="Mantén un registro detallado de tus rutinas de ejercicio y progreso en el gimnasio."
          features={[
            "Planificador de rutinas",
            "Seguimiento de series y repeticiones",
            "Registro de peso levantado",
            "Historial de entrenamientos"
          ]}
        />

        <ModuleCard
          icon={<Activity className="w-8 h-8" />}
          title="Monitoreo de Pasos"
          description="Realiza un seguimiento de tu actividad diaria y calorías quemadas."
          features={[
            "Contador de pasos diarios",
            "Cálculo de calorías quemadas",
            "Estadísticas semanales",
            "Objetivos personalizados"
          ]}
        />

        <ModuleCard
          icon={<Droplets className="w-8 h-8" />}
          title="Control de Hidratación"
          description="Mantén un registro de tu consumo de agua diario y alcanza tus metas de hidratación."
          features={[
            "Registro de ingesta de agua",
            "Recordatorios personalizables",
            "Objetivos diarios",
            "Estadísticas de consumo"
          ]}
        />

        <ModuleCard
          icon={<Calculator className="w-8 h-8" />}
          title="Calculadora 1RM"
          description="Calcula tu repetición máxima (1RM) para diferentes ejercicios."
          features={[
            "Cálculo preciso de 1RM",
            "Múltiples fórmulas",
            "Historial de cálculos",
            "Recomendaciones de peso"
          ]}
        />

        <ModuleCard
          icon={<Camera className="w-8 h-8" />}
          title="Análisis de Comidas"
          description="Obtén información nutricional a partir de fotos de tus comidas."
          features={[
            "Reconocimiento de alimentos",
            "Estimación de calorías",
            "Análisis de macronutrientes",
            "Historial de fotos"
          ]}
        />
      </div>
    </div>
  );
};

const ModuleCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
}> = ({ icon, title, description, features }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="bg-gray-50 rounded-lg w-16 h-16 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-sm text-gray-600">
            <span className="w-1.5 h-1.5 bg-black rounded-full mr-2" />
            {feature}
          </li>
        ))}
      </ul>
      <Link
        to="/registro"
        className="mt-6 block text-center btn btn-primary w-full"
      >
        Comenzar
      </Link>
    </div>
  );
};

export default ModulesPage;