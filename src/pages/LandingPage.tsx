import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Utensils, Dumbbell, Droplets } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold mb-6">
              All In One<br />Fitness App
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Tu compañero integral para un estilo de vida saludable. Monitorea calorías,
              entrenamientos, hidratación y más, todo en un solo lugar.
            </p>
            <Link to="/registro" className="btn btn-primary text-lg px-8 py-3">
              Comienza Ahora
            </Link>
          </div>
          <div className="bg-gray-100 rounded-xl aspect-square flex items-center justify-center">
            <Activity className="w-32 h-32 text-gray-400" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            ¿Por qué usar All In One Fitness App?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Utensils className="w-8 h-8" />}
              title="Conteo de Calorías"
              description="Registra tus comidas y monitorea tus macronutrientes diarios de forma sencilla."
            />
            <FeatureCard
              icon={<Dumbbell className="w-8 h-8" />}
              title="Registro de Entrenamientos"
              description="Planifica y registra tus rutinas de ejercicio, series y repeticiones."
            />
            <FeatureCard
              icon={<Activity className="w-8 h-8" />}
              title="Monitoreo de Pasos"
              description="Lleva un registro de tu actividad diaria y calorías quemadas."
            />
            <FeatureCard
              icon={<Droplets className="w-8 h-8" />}
              title="Control de Hidratación"
              description="Mantén un registro de tu consumo diario de agua y alcanza tus metas."
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => {
  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <div className="bg-white rounded-lg w-16 h-16 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default LandingPage;