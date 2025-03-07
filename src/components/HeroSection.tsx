import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { supabase } from '../supabaseClient';

const HeroSection: React.FC = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user);
    };

    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
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
          <Link to={user ? "/dashboard" : "/registro"} className="btn btn-primary text-lg px-8 py-3">
            {user ? "Ir al Dashboard" : "Comienza Ahora"}
          </Link>
        </div>
        <div className="bg-gray-100 rounded-xl aspect-square flex items-center justify-center">
          <Activity className="w-32 h-32 text-gray-400" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
