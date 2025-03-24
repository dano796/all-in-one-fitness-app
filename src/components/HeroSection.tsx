import React, { useEffect, useState, useCallback } from "react";
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

const Carousel: React.FC<{
  items: string[];
  variants: typeof leftCarouselVariants;
  direction: "left" | "right";
}> = ({ items, variants, direction }) => (
  <motion.div
    variants={variants}
    animate="animate"
    className="flex flex-col gap-4"
  >
    {items.map((image, index) => (
      <motion.img
        key={`${direction}-${index}`}
        src={image}
        alt={`${direction} carousel image ${index + 1}`}
        className="w-[80%] aspect-[3/4] object-cover rounded-lg mx-auto"
        transition={{ duration: direction === "left" ? 1.5 : 1 }}
      />
    ))}
  </motion.div>
);

const HeroSection: React.FC = () => {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);

  const fetchUser = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    setUser(
      data?.user ? { id: data.user.id, email: data.user.email || "" } : null
    );
  }, []);

  useEffect(() => {
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
  }, [fetchUser]);

  return (
    <section className="container mx-auto px-8 mb-12 lg:px-16 lg:mb-0 bg-[#282c3c] text-left">
      <div className="lg:grid lg:grid-cols-2 gap-12 items-start">
        <div className="flex flex-col justify-center h-full">
          <h1 className="text-6xl xl:text-7xl font-bold mt-10 lg:mt-10 xl:mt-12 mb-8 text-white">
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
        <div className="hidden lg:block rounded-xl aspect-square overflow-hidden relative">
          <div className="w-full h-full grid grid-cols-2 gap-4 p-6">
            <Carousel
              items={carouselItemsLeft}
              variants={leftCarouselVariants}
              direction="left"
            />
            <Carousel
              items={carouselItemsRight}
              variants={rightCarouselVariants}
              direction="right"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(HeroSection);