import React from "react";
import { Users, Target, Award, LucideIcon } from "lucide-react";
import { useTheme } from "../pages/ThemeContext";
import { motion } from "framer-motion";

interface InfoCardProps {
  Icon: LucideIcon;
  title: string;
  description: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ Icon, title, description }) => {
  const { isDarkMode } = useTheme();
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-[#ff9404] rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3
        className={`text-xl font-bold mb-2 ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}
      >
        {title}
      </h3>
      <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
        {description}
      </p>
    </div>
  );
};

const AboutPage: React.FC = () => {
  const { isDarkMode } = useTheme();

  // Animation variants for container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Animation variants for info cards
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

  const infoCards: InfoCardProps[] = [
    {
      Icon: Target,
      title: "Nuestra Misión",
      description:
        "Facilitar el seguimiento de hábitos saludables con tecnología intuitiva.",
    },
    {
      Icon: Award,
      title: "Nuestros Valores",
      description:
        "Compromiso con la calidad, innovación y bienestar de nuestros usuarios.",
    },
    {
      Icon: Users,
      title: "Nuestro Equipo",
      description: "Expertos en fitness, nutrición y desarrollo de software.",
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`min-h-screen ${
        isDarkMode ? "bg-[#282c3c] text-white" : "bg-gray-100 text-gray-900"
      } transition-colors duration-300`}
    >
      <div className="container mx-auto px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`text-5xl font-bold mb-8 pb-5 text-center ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            ¿Quiénes somos?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
            className={`text-xl text-center mb-12 ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Somos un equipo apasionado por la salud y el bienestar, dedicados a
            crear la mejor herramienta para ayudarte a alcanzar tus objetivos
            fitness.
          </motion.p>
          <div className="grid md:grid-cols-3 gap-8">
            {infoCards.map((card, index) => (
              <motion.div key={index} variants={cardVariants}>
                <InfoCard
                  Icon={card.Icon}
                  title={card.title}
                  description={card.description}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(AboutPage);
