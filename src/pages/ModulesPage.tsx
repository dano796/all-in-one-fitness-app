import React from "react";
import {
  Utensils,
  Dumbbell,
  Activity,
  Droplets,
  Calculator,
  Camera,
} from "lucide-react";
import ModuleCard from "../components/ModuleCard";
import { useTheme } from "../pages/ThemeContext";
import { motion } from "framer-motion";

const ModulesPage: React.FC = () => {
  const { isDarkMode } = useTheme();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`container mx-auto px-8 py-16 transition-colors duration-300 ${
        isDarkMode ? "bg-[#282c3c] text-white" : "bg-white-100 text-gray-900"
      }`}
    >
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="text-5xl font-bold mb-8 pb-5 text-center"
      >
        Nuestros Módulos
      </motion.h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto text-[#ff9404]">
        <motion.div variants={cardVariants}>
          <ModuleCard
            icon={<Utensils className="w-8 h-8" />}
            title="Conteo de Calorías"
            description="Registra tu ingesta diaria de alimentos y monitorea tus macronutrientes de forma precisa."
            features={[
              "Registro de comidas diarias",
              "Análisis de macronutrientes",
              "Base de datos de alimentos",
              "Historial y estadísticas",
            ]}
          />
        </motion.div>
        <motion.div variants={cardVariants}>
          <ModuleCard
            icon={<Dumbbell className="w-8 h-8" />}
            title="Registro de Entrenamientos"
            description="Mantén un registro detallado de tus rutinas de ejercicio y progreso en el gimnasio."
            features={[
              "Planificador de rutinas",
              "Seguimiento de series y repeticiones",
              "Registro de peso levantado",
              "Historial de entrenamientos",
            ]}
          />
        </motion.div>
        <motion.div variants={cardVariants}>
          <ModuleCard
            icon={<Activity className="w-8 h-8" />}
            title="Monitoreo de Pasos"
            description="Realiza un seguimiento de tu actividad diaria y calorías quemadas."
            features={[
              "Contador de pasos diarios",
              "Cálculo de calorías quemadas",
              "Estadísticas semanales",
              "Objetivos personalizados",
            ]}
          />
        </motion.div>
        <motion.div variants={cardVariants}>
          <ModuleCard
            icon={<Droplets className="w-8 h-8" />}
            title="Control de Hidratación"
            description="Mantén un registro de tu consumo de agua diario y alcanza tus metas de hidratación."
            features={[
              "Registro de ingesta de agua",
              "Recordatorios personalizables",
              "Objetivos diarios",
              "Estadísticas de consumo",
            ]}
          />
        </motion.div>
        <motion.div variants={cardVariants}>
          <ModuleCard
            icon={<Calculator className="w-8 h-8" />}
            title="Calculadora 1RM"
            description="Calcula tu repetición máxima (1RM) para diferentes ejercicios."
            features={[
              "Cálculo preciso de 1RM",
              "Múltiples fórmulas",
              "Historial de cálculos",
              "Recomendaciones de peso",
            ]}
          />
        </motion.div>
        <motion.div variants={cardVariants}>
          <ModuleCard
            icon={<Camera className="w-8 h-8" />}
            title="Análisis de Comidas"
            description="Obtén información nutricional a partir de fotos de tus comidas."
            features={[
              "Reconocimiento de alimentos",
              "Estimación de calorías",
              "Análisis de macronutrientes",
              "Historial de fotos",
            ]}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default React.memo(ModulesPage);
