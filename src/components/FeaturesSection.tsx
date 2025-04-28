import React from "react";
import { Utensils, Dumbbell, Activity, Droplets } from "lucide-react";
import { useTheme } from "../pages/ThemeContext";

const features = [
  {
    icon: <Utensils className="w-8 h-8 text-[#ff9404]" />,
    title: "Conteo de Calorías",
    description:
      "Registra tus comidas y monitorea tus macronutrientes diarios de forma sencilla.",
  },
  {
    icon: <Dumbbell className="w-8 h-8 text-[#ff9404]" />,
    title: "Registro de Entrenamientos",
    description:
      "Planifica y registra tus rutinas de ejercicio, series y repeticiones.",
  },
  {
    icon: <Activity className="w-8 h-8 text-[#ff9404]" />,
    title: "Monitoreo de Pasos",
    description:
      "Lleva un registro de tu actividad diaria y calorías quemadas.",
  },
  {
    icon: <Droplets className="w-8 h-8 text-[#ff9404]" />,
    title: "Control de Hidratación",
    description:
      "Mantén un registro de tu consumo diario de agua y alcanza tus metas.",
  },
];

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => {
  const { isDarkMode } = useTheme();
  return (
    <div className={` ${isDarkMode ? 'bg-[#3B4252] text-white' : 'bg-white text-gray-900'} rounded-xl p-6 shadow-lg`}>
      <div className={`border rounded-lg w-16 h-16 flex items-center justify-center mb-4 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{description}</p>
    </div>
  );
};

const FeaturesSection: React.FC = () => {
  const { isDarkMode } = useTheme();
  return (
    <section className={` ${isDarkMode ? 'bg-[#282c3c] border-t border-[#3B4252]' : 'bg-gray-100 border-t border-gray-300'} pt-8 pb-16 px-8 md:px-16`}>
      <div className="container mx-auto px-4">
        <h2 className={`text-5xl pt-10 pb-5 font-bold text-center mb-12 ${isDarkMode ? 'text-[#FFFFFF]' : 'text-gray-900'}`}>
          ¿Por qué usar All In One Fitness App?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default React.memo(FeaturesSection);