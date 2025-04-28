// src/pages/ContactPage.tsx
import React from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { useTheme } from "../pages/ThemeContext";

interface ContactCardProps {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  detail: string;
}

const ContactCard: React.FC<ContactCardProps> = ({ Icon, title, detail }) => {
  const { isDarkMode } = useTheme();
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-[#ff9404] rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className={`font-semibold mb-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>{title}</h3>
      <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>{detail}</p>
    </div>
  );
};

interface FormFieldProps {
  id: string;
  label: string;
  type?: "text" | "email" | "textarea";
  placeholder: string;
  rows?: number;
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type = "text",
  placeholder,
  rows,
}) => {
  const { isDarkMode } = useTheme();
  return (
    <div>
      <label htmlFor={id} className={`block text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"} mb-1`}>
        {label}
      </label>
      {type === "textarea" ? (
        <textarea
          id={id}
          rows={rows}
          className={`w-full px-4 py-2 border ${isDarkMode ? "border-gray-500 bg-[#282c3c] text-white" : "border-gray-300 bg-white text-gray-900"} rounded-lg focus:ring-[1.5px] focus:ring-[#ff9404] focus:outline-none focus:border-0`}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          id={id}
          className={`w-full px-4 py-2 border ${isDarkMode ? "border-gray-500 bg-[#282c3c] text-white" : "border-gray-300 bg-white text-gray-900"} rounded-lg focus:ring-[1.5px] focus:ring-[#ff9404] focus:outline-none focus:border-0`}
          placeholder={placeholder}
        />
      )}
    </div>
  );
};

const ContactPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const contactInfo = [
    { Icon: Mail, title: "Email", detail: "contacto@allinonefitness.app" },
    { Icon: Phone, title: "Teléfono", detail: "+1 (555) 123-4567" },
    { Icon: MapPin, title: "Ubicación", detail: "Medellín, Colombia" },
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-[#282c3c] text-white" : "bg-gray-100 text-gray-900"} transition-colors duration-300`}>
      <div className="container mx-auto px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold mb-8 pb-5 text-center">Contacto</h1>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {contactInfo.map((info, index) => (
              <ContactCard
                key={index}
                Icon={info.Icon}
                title={info.title}
                detail={info.detail}
              />
            ))}
          </div>
          <div className={`rounded-xl p-8 shadow-md ${isDarkMode ? "bg-[#3B4252]" : "bg-white"}`}>
            <h2 className="text-2xl font-semibold mb-6">Envíanos un mensaje</h2>
            <form className="space-y-6">
              <FormField id="name" label="Nombre" placeholder="Tu nombre" />
              <FormField
                id="email"
                label="Email"
                type="email"
                placeholder="tu@email.com"
              />
              <FormField
                id="message"
                label="Mensaje"
                type="textarea"
                rows={4}
                placeholder="¿En qué podemos ayudarte?"
              />
              <button
                type="submit"
                className="w-full py-2 px-4 bg-[#ff9404] text-white font-semibold rounded-lg hover:bg-[#e08503] transition duration-300"
              >
                Enviar Mensaje
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ContactPage);