import React from "react";
import { Mail, MapPin, Phone } from "lucide-react";

// Interfaz para las props de ContactCard
interface ContactCardProps {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  detail: string;
}

// Componente ContactCard
const ContactCard: React.FC<ContactCardProps> = ({ Icon, title, detail }) => (
  <div className="text-center">
    <div className="w-12 h-12 bg-[#ff9404] rounded-full flex items-center justify-center mx-auto mb-4">
      <Icon className="w-6 h-6 text-white" />
    </div>
    <h3 className="font-semibold mb-1 text-[#FFFFFF]">{title}</h3>
    <p className="text-gray-300">{detail}</p>
  </div>
);

// Interfaz para las props de FormField
interface FormFieldProps {
  id: string;
  label: string;
  type?: "text" | "email" | "textarea"; // Tipos específicos
  placeholder: string;
  rows?: number; // Hacer rows opcional
}

// Componente FormField
const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type = "text",
  placeholder,
  rows,
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-white mb-1">
      {label}
    </label>
    {type === "textarea" ? (
      <textarea
        id={id}
        rows={rows}
        className="w-full px-4 py-2 border border-gray-500 rounded-lg bg-[#282c3c] text-white 
        focus:ring-[1.5px] focus:ring-[#ff9404] focus:outline-none focus:border-0"
        placeholder={placeholder}
      />
    ) : (
      <input
        type={type}
        id={id}
        className="w-full px-4 py-2 border border-gray-500 rounded-lg bg-[#282c3c] text-white 
        focus:ring-[1.5px] focus:ring-[#ff9404] focus:outline-none focus:border-0"
        placeholder={placeholder}
      />
    )}
  </div>
);

const ContactPage: React.FC = () => {
  const contactInfo = [
    { Icon: Mail, title: "Email", detail: "contacto@allinonefitness.app" },
    { Icon: Phone, title: "Teléfono", detail: "+1 (555) 123-4567" },
    { Icon: MapPin, title: "Ubicación", detail: "Medellín, Colombia" },
  ];

  return (
    <div className="container mx-auto px-8 py-16 bg-[#282c3c] text-white">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold mb-8 pb-5 text-center text-white">
          Contacto
        </h1>

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

        <div className="bg-[#3B4252] rounded-xl p-8 shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-white">
            Envíanos un mensaje
          </h2>

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
              className="w-full py-2 px-4 bg-[#ff9404] text-white font-semibold rounded-lg hover:text-[#1C1C1E] transition duration-300"
            >
              Enviar Mensaje
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ContactPage);