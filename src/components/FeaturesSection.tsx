import React from "react";
import { Utensils, Dumbbell, Activity, Droplets } from "lucide-react";

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
}> = ({ icon, title, description }) => (
  <div className="bg-[#3B4252] text-white rounded-xl p-6 shadow-lg">
    <div className="border rounded-lg w-16 h-16 flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-300">{description}</p>
  </div>
);

const FeaturesSection: React.FC = () => {
  return (
    <section className="bg-[#282c3c] pt-8 pb-16 px-8 md:px-16 border-t border-[#3B4252]">
      <div className="container mx-auto px-4">
        <h2 className="text-5xl pt-10 pb-5 font-bold text-center mb-12 text-[#FFFFFF]">
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