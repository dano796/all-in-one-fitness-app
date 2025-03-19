import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabaseClient";

const carouselItemsLeft = [
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300&h=400&fit=crop",
  "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=300&h=300&fit=crop",
  "https://e00-elmundo.uecdn.es/assets/multimedia/imagenes/2024/03/13/17103128329071.jpg?w=300&h=400&fit=crop",
  "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1577221084712-45b0445d2b00?q=80&w=1996&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=300&h=400&fit=crop",
];

const carouselItemsRight = [
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=400&fit=crop",
  "https://static.mujerhoy.com/www/multimedia/202406/26/media/cortadas/cardio-portada-kBvG-U220552748840lPF-1248x1248@MujerHoy.jpg?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=400&fit=crop",
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1535914254981-b5012eebbd15?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=300&h=400&fit=crop",
];

// Variantes para el carrusel izquierdo (arriba -> abajo -> arriba)
const leftCarouselVariants = {
  animate: {
    y: ["0%", "-50%"],
    transition: {
      duration: 55,
      ease: "linear",
      repeat: Infinity,
      repeatType: "reverse" as const,
    },
  },
};

// Variantes para el carrusel derecho (abajo -> arriba -> abajo)
const rightCarouselVariants = {
  animate: {
    y: ["-50%", "0%"],
    transition: {
      duration: 55,
      ease: "linear",
      repeat: Infinity,
      repeatType: "reverse" as const,
    },
  },
};

const HeroSection: React.FC = () => {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);

  // Manejo de autenticación
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(
        data?.user ? { id: data.user.id, email: data.user.email || "" } : null
      );
    };

    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(
          session?.user
            ? { id: session.user.id, email: session.user.email || "" }
            : null
        );
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <section className="container mx-auto px-16 pt-0 md:pt-0 pb-16 md:pb-24 bg-[#282c3c]">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div className="flex flex-col justify-center h-full">
          <h1 className="text-7xl font-bold mb-6 text-white">
            All In One
            <br />
            Fitness App
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Tu compañero integral para un estilo de vida saludable. Monitorea
            calorías, entrenamientos, hidratación y más, todo en un solo lugar.
          </p>
          <Link
            to={user ? "/dashboard" : "/registro"}
            className="text-lg px-8 py-3 w-fit rounded-lg bg-[#ff9404] text-white font-semibold hover:text-[#1C1C1E] transition"
          >
            {user ? "Ir al Dashboard" : "Comienza Ahora"}
          </Link>
        </div>
        <div className="hidden md:block bg-[#282c3c] rounded-xl aspect-square overflow-hidden relative">
          <div className="w-full h-full grid grid-cols-2 gap-4 p-6">
            {/* Carrusel Izquierdo (arriba -> abajo -> arriba) */}
            <motion.div
              variants={leftCarouselVariants}
              animate="animate"
              className="flex flex-col gap-4"
            >
              {carouselItemsLeft.map((image, index) => (
                <motion.img
                  key={`left-${index}`}
                  src={image}
                  alt={`Left carousel image ${index + 1}`}
                  className="w-[80%] aspect-[3/4] object-cover rounded-lg mx-auto"
                  transition={{ duration: 1.5 }}
                />
              ))}
            </motion.div>
            {/* Carrusel Derecho (abajo -> arriba -> abajo) */}
            <motion.div
              variants={rightCarouselVariants}
              animate="animate"
              className="flex flex-col gap-4"
            >
              {carouselItemsRight.map((image, index) => (
                <motion.img
                  key={`right-${index}`}
                  src={image}
                  alt={`Right carousel image ${index + 1}`}
                  className="w-[80%] aspect-[3/4] object-cover rounded-lg mx-auto"
                  transition={{ duration: 1 }}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
