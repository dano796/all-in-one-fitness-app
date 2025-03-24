import React from "react";
import { Users, Target, Award, LucideIcon } from "lucide-react";

// Definimos una interfaz para los props de InfoCard
interface InfoCardProps {
  Icon: LucideIcon; // Tipo específico de Lucide React para íconos
  title: string;
  description: string;
}

// Componente reutilizable para cada sección
const InfoCard: React.FC<InfoCardProps> = ({ Icon, title, description }) => (
  <div className="text-center">
    <div className="w-16 h-16 bg-[#ff9404] rounded-full flex items-center justify-center mx-auto mb-4">
      <Icon className="w-8 h-8 text-white" />
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

const AboutPage: React.FC = () => {
  // Datos de las tarjetas con tipado implícito
  const infoCards: InfoCardProps[] = [
    {
      Icon: Target,
      title: "Nuestra Misión",
      description: "Facilitar el seguimiento de hábitos saludables con tecnología intuitiva.",
    },
    {
      Icon: Award,
      title: "Nuestros Valores",
      description: "Compromiso con la calidad, innovación y bienestar de nuestros usuarios.",
    },
    {
      Icon: Users,
      title: "Nuestro Equipo",
      description: "Expertos en fitness, nutrición y desarrollo de software.",
    },
  ];

  return (
    <div className="container mx-auto px-8 py-16 bg-[#282c3c] text-white">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold mb-8 pb-5 text-center text-white">
          ¿Quiénes somos?
        </h1>

        <p className="text-xl text-gray-300 mb-12 text-center">
          Somos un equipo apasionado por la salud y el bienestar, dedicados a
          crear la mejor herramienta para ayudarte a alcanzar tus objetivos
          fitness.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {infoCards.map((card, index) => (
            <InfoCard
              key={index}
              Icon={card.Icon}
              title={card.title}
              description={card.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(AboutPage);