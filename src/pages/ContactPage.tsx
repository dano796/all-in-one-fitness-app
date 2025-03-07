import React from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';

const ContactPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16 bg-[#1C1C1E] text-white">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-300">Contacto</h1>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-[#FF3B30] rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-1 text-[#FF3B30]">Email</h3>
            <p className="text-gray-300">contacto@allinonefitness.app</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-[#FF9500] rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-1 text-[#FF9500]">Teléfono</h3>
            <p className="text-gray-300">+1 (555) 123-4567</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-[#FFCC00] rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-1 text-[#FFCC00]">Ubicación</h3>
            <p className="text-gray-300">Ciudad de México, México</p>
          </div>
        </div>

        <div className="bg-[#2C2C2E] rounded-xl p-8 shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-gray-300">Envíanos un mensaje</h2>
          
          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Nombre
              </label>
              <input
                type="text"
                id="name"
                className="w-full px-4 py-2 border border-gray-500 rounded-lg bg-[#1C1C1E] text-white focus:ring-2 focus:ring-[#FF3B30] focus:border-transparent"
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-2 border border-gray-500 rounded-lg bg-[#1C1C1E] text-white focus:ring-2 focus:ring-[ ] focus:border-transparent"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                Mensaje
              </label>
              <textarea
                id="message"
                rows={4}
                className="w-full px-4 py-2 border border-gray-500 rounded-lg bg-[#1C1C1E] text-white focus:ring-2 focus:ring-[#FF3B30] focus:border-transparent"
                placeholder="¿En qué podemos ayudarte?"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-[#FF3B30] text-white font-semibold rounded-lg hover:bg-[#FF9500] transition duration-300"
            >
              Enviar Mensaje
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
