import React from "react";
import { motion } from "framer-motion";

const word = "ALL    IN    ONE".split("");

const letterVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      repeat: Infinity,
      repeatType: "loop" as const,
      repeatDelay: 1,
    },
  }),
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const AnimatedLetter: React.FC<{ letter: string; index: number }> = ({
  letter,
  index,
}) => (
  <motion.span
    key={index}
    className="text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] font-bold text-[#ff9404] font-sans font-montserrat"
    custom={index}
    initial="hidden"
    animate="visible"
    variants={letterVariants}
  >
    {letter}
  </motion.span>
);

const Loader: React.FC = () => {
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black/60 z-50"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex space-x-1 md:space-x-2">
        {word.map((letter, index) => (
          <AnimatedLetter key={index} letter={letter} index={index} />
        ))}
      </div>
    </motion.div>
  );
};

export default React.memo(Loader);