import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
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

const cardVariants = {
  initial: { y: 50, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
  whileHover: {
    y: -5,
    transition: { duration: 0.3 },
  },
};

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}> = ({ icon, title, description, index }) => {
  const { isDarkMode } = useTheme();
  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="whileHover"
      transition={{ delay: index * 0.1 }}
      className={` ${
        isDarkMode ? "bg-[#3B4252] text-white" : "bg-white text-gray-900"
      } rounded-xl p-6 shadow-lg`}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
        className={`border rounded-lg w-16 h-16 flex items-center justify-center mb-4 ${
          isDarkMode ? "border-gray-600" : "border-gray-300"
        }`}
      >
        {icon}
      </motion.div>
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
        className="text-xl font-semibold mb-2"
      >
        {title}
      </motion.h3>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
        className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
      >
        {description}
      </motion.p>
    </motion.div>
  );
};

const FeaturesSection: React.FC = () => {
  const { isDarkMode } = useTheme();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8 }}
      className={` ${
        isDarkMode
          ? "bg-[#282c3c] border-t border-[#3B4252]"
          : "bg-[#F8F9FA] border-t border-gray-300"
      } pt-8 pb-16 px-8 md:px-16`}
    >
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ y: -30, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: -30, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`text-5xl pt-10 pb-5 font-bold text-center mb-12 ${
            isDarkMode ? "text-[#FFFFFF]" : "text-gray-900"
          }`}
        >
          ¿Por qué usar All In One Fitness App?
        </motion.h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default React.memo(FeaturesSection);
