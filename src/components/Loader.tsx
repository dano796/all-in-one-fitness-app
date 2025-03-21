import React from "react";
import { motion } from "framer-motion";

const Loader: React.FC = () => {
  const word = "ALL    IN    ONE".split("");

  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        repeat: Infinity,
        repeatType: "reverse" as const,
      },
    }),
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black/60 z-50"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex space-x-1">
        {word.map((letter, index) => (
          <motion.span
            key={index}
            className="text-5xl md:text-7xl font-medium Oswald text-[#ff9404]"
            custom={index}
            initial="hidden"
            animate="visible"
            variants={letterVariants}
          >
            {letter}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
};

export default Loader;
