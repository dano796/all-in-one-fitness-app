import React from 'react';
import { Users, Target, Award } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">¿Quiénes somos?</h1>
        
        <div className="prose prose-lg mx-auto">
          <p className="text-xl text-gray-600 mb-12 text-center">
            Somos un equipo apasionado por la salud y el bienestar, dedicados a crear
            la mejor herramienta para ayudarte a alcanzar tus objetivos fitness.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Nuestra Misión</h3>
              <p className="text-gray-600">
                Facilitar el seguimiento de hábitos saludables a través de tecnología intuitiva.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Nuestros Valores</h3>
              <p className="text-gray-600">
                Compromiso con la calidad, innovación y el bienestar de nuestros usuarios.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Nuestro Equipo</h3>
              <p className="text-gray-600">
                Expertos en fitness, nutrición y desarrollo de software.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;