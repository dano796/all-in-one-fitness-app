import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";
import { useTheme } from "../pages/ThemeContext";

interface ContactCardProps {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  detail: string;
  index: number;
}

const ContactCard: React.FC<ContactCardProps> = ({
  Icon,
  title,
  detail,
  index,
}) => {
  const { isDarkMode } = useTheme();
  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.3 } }}
      className="text-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
        className="w-12 h-12 bg-[#ff9404] rounded-full flex items-center justify-center mx-auto mb-4"
      >
        <Icon className="w-6 h-6 text-white" />
      </motion.div>
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
        className={`font-semibold mb-1 ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}
      >
        {title}
      </motion.h3>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
        className={isDarkMode ? "text-gray-300" : "text-gray-600"}
      >
        {detail}
      </motion.p>
    </motion.div>
  );
};

interface FormFieldProps {
  id: string;
  label: string;
  type?: "text" | "email" | "textarea";
  placeholder: string;
  rows?: number;
  index: number;
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type = "text",
  placeholder,
  rows,
  index,
}) => {
  const { isDarkMode } = useTheme();
  return (
    <motion.div
      initial={{ x: -30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 + index * 0.1 }}
    >
      <label
        htmlFor={id}
        className={`block text-sm font-medium ${
          isDarkMode ? "text-white" : "text-gray-900"
        } mb-1`}
      >
        {label}
      </label>
      {type === "textarea" ? (
        <textarea
          id={id}
          rows={rows}
          className={`w-full px-4 py-2 border ${
            isDarkMode
              ? "border-gray-500 bg-[#282c3c] text-white"
              : "border-gray-300 bg-white text-gray-900"
          } rounded-lg focus:ring-[1.5px] focus:ring-[#ff9404] focus:outline-none focus:border-0`}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          id={id}
          className={`w-full px-4 py-2 border ${
            isDarkMode
              ? "border-gray-500 bg-[#282c3c] text-white"
              : "border-gray-300 bg-white text-gray-900"
          } rounded-lg focus:ring-[1.5px] focus:ring-[#ff9404] focus:outline-none focus:border-0`}
          placeholder={placeholder}
        />
      )}
    </motion.div>
  );
};

const ContactPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const contactInfo = [
    { Icon: Mail, title: "Email", detail: "contacto@allinonefitness.app" },
    { Icon: Phone, title: "Teléfono", detail: "+1 (555) 123-4567" },
    { Icon: MapPin, title: "Ubicación", detail: "Medellín, Colombia" },
  ];
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8 }}
      className={`min-h-screen ${
        isDarkMode ? "bg-[#282c3c] text-white" : "bg-gray-100 text-gray-900"
      } transition-colors duration-300`}
    >
      <div className="container mx-auto px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <motion.h1
            initial={{ y: -30, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: -30, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-5xl font-bold mb-8 pb-5 text-center"
          >
            Contacto
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid md:grid-cols-3 gap-8 mb-12"
          >
            {contactInfo.map((info, index) => (
              <ContactCard
                key={index}
                Icon={info.Icon}
                title={info.title}
                detail={info.detail}
                index={index}
              />
            ))}
          </motion.div>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={
              isInView ? { scale: 1, opacity: 1 } : { scale: 0.95, opacity: 0 }
            }
            transition={{ duration: 0.6, delay: 0.4 }}
            className={`rounded-xl p-8 shadow-md ${
              isDarkMode ? "bg-[#3B4252]" : "bg-white"
            }`}
          >
            <motion.h2
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="text-2xl font-semibold mb-6"
            >
              Envíanos un mensaje
            </motion.h2>
            <form className="space-y-6">
              <FormField
                id="name"
                label="Nombre"
                placeholder="Tu nombre"
                index={0}
              />
              <FormField
                id="email"
                label="Email"
                type="email"
                placeholder="tu@email.com"
                index={1}
              />
              <FormField
                id="message"
                label="Mensaje"
                type="textarea"
                rows={4}
                placeholder="¿En qué podemos ayudarte?"
                index={2}
              />
              <motion.button
                type="submit"
                initial={{ y: 20, opacity: 0 }}
                animate={
                  isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }
                }
                whileHover={{ scale: 1.025 }}
                whileTap={{ scale: 0.975 }}
                className="w-full py-2 px-4 bg-[#ff9404] text-white font-semibold rounded-lg hover:text-[#2a2e3f] transition duration-300"
              >
                Enviar Mensaje
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(ContactPage);
