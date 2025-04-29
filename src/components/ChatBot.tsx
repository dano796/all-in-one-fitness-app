// src/components/ChatBot.tsx
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient'; // Importa el cliente de Supabase en el frontend
import { motion } from 'framer-motion';
import axios from 'axios';
import { Send, X } from 'lucide-react';
import { useTheme } from '../pages/ThemeContext';
import GalaxyBackground from './GalaxyBackground';

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

const ChatBot: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'bot', text: '¡Hola! Soy FitMate, tu asistente de fitness. ¿En qué puedo ayudarte hoy?' },
  ]);
  const [input, setInput] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Obtener el idusuario del usuario autenticado
  const [idusuario, setIdusuario] = useState<number | null>(null);

// src/components/ChatBot.tsx
useEffect(() => {
  const fetchUser = async () => {
    console.log('Iniciando fetchUser...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('Error al obtener usuario autenticado:', authError);
      setIdusuario(null);
      return;
    }

    if (!user) {
      console.log('No hay usuario autenticado');
      setIdusuario(null);
      return;
    }

    console.log('Usuario autenticado:', { id: user.id, email: user.email });

    // Buscar el idusuario en la tabla Inicio Sesion usando el correo del usuario
    const { data, error } = await supabase
      .from('Inicio Sesion')
      .select('idusuario')
      .eq('Correo', user.email)
      .single();

    if (error || !data) {
      console.error('Error al obtener idusuario:', error);
      setIdusuario(null);
      return;
    }

    console.log('idusuario obtenido:', data.idusuario);
    setIdusuario(data.idusuario);
  };
  fetchUser();
}, []);

  // Hacer scroll automático al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Verificar si hay un idusuario válido
    if (!idusuario) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Por favor, inicia sesión para usar el chat.' },
      ]);
      return;
    }

    // Agregar el mensaje del usuario
    setMessages((prev) => [...prev, { sender: 'user', text: input }]);
    setInput('');
    setIsLoading(true);

    try {
      // Hacer la solicitud al backend
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, {
        message: input,
        userId: idusuario, // Ahora userId es idusuario, un número válido
      });
      const botResponse = response.data.message;

      // Agregar la respuesta del bot
      setMessages((prev) => [...prev, { sender: 'bot', text: botResponse }]);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Lo siento, ocurrió un error. Intenta de nuevo.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {/* Botón para abrir/cerrar el chat */}
      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
            isDarkMode
              ? 'border-[#ff9404] shadow-[0_0_10px_rgba(255,148,4,0.3)] hover:shadow-[0_0_15px_rgba(255,148,4,0.5)]'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          <div className="w-full h-full bg-[#A9D6E5] rounded-full flex items-center justify-center">
            <img
              src="https://static.vecteezy.com/system/resources/previews/008/556/478/non_2x/cute-dog-lifting-barbell-cartoon-icon-illustration-animal-sport-icon-concept-isolated-premium-vector.jpg"
              alt="FitMate"
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
            />
          </div>
        </motion.button>
      )}

      {/* Ventana del chat */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className={`relative w-[90vw] max-w-[400px] sm:w-[400px] h-[500px] sm:h-[550px] rounded-xl shadow-lg overflow-hidden ${
            isDarkMode ? 'bg-[#282c3c]' : 'bg-[#F8F9FA]'
          } transition-colors duration-300 flex flex-col`}
        >
          <GalaxyBackground />

          {/* Encabezado del chat */}
          <div
            className={`flex justify-between items-center p-4 sm:p-5 border-b ${
              isDarkMode ? 'border-[#4B5563] bg-[#3B4252]' : 'border-gray-200 bg-white'
            } flex-shrink-0`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#A9D6E5] rounded-full flex items-center justify-center">
                <img
                  src="https://static.vecteezy.com/system/resources/previews/008/556/478/non_2x/cute-dog-lifting-barbell-cartoon-icon-illustration-animal-sport-icon-concept-isolated-premium-vector.jpg"
                  alt="FitMate"
                  className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
                />
              </div>
              <h3 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                FitMate - Asistente de Fitness
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className={`p-2 rounded-full ${
                isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
              } transition-colors duration-300`}
            >
              <X size={20} />
            </button>
          </div>

          {/* Área de mensajes */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto relative z-10">
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`mb-4 flex items-start gap-3 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#A9D6E5] rounded-full flex items-center justify-center flex-shrink-0">
                    <img
                      src="https://static.vecteezy.com/system/resources/previews/008/556/478/non_2x/cute-dog-lifting-barbell-cartoon-icon-illustration-animal-sport-icon-concept-isolated-premium-vector.jpg"
                      alt="FitMate"
                      className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
                    />
                  </div>
                )}
                <div
                  className={`max-w-[80%] sm:max-w-[85%] p-3 sm:p-4 rounded-xl text-sm sm:text-base leading-relaxed break-words ${
                    msg.sender === 'user'
                      ? isDarkMode
                        ? 'bg-[#ff9404] text-white'
                        : 'bg-orange-500 text-white'
                      : isDarkMode
                      ? 'bg-[#4B5563] text-white'
                      : 'bg-gray-100 text-gray-900'
                  } shadow-sm`}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex justify-start items-start gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#A9D6E5] rounded-full flex items-center justify-center flex-shrink-0">
                  <img
                    src="https://static.vecteezy.com/system/resources/previews/008/556/478/non_2x/cute-dog-lifting-barbell-cartoon-icon-illustration-animal-sport-icon-concept-isolated-premium-vector.jpg"
                    alt="FitMate"
                    className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
                  />
                </div>
                <div
                  className={`p-3 sm:p-4 rounded-xl text-sm sm:text-base ${
                    isDarkMode ? 'bg-[#4B5563] text-gray-400' : 'bg-gray-100 text-gray-600'
                  } shadow-sm`}
                >
                  Escribiendo...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Área de entrada de texto */}
          <div
            className={`flex items-center p-4 sm:p-5 border-t ${
              isDarkMode ? 'border-[#4B5563] bg-[#3B4252]' : 'border-gray-200 bg-white'
            } flex-shrink-0`}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje..."
              className={`flex-1 p-3 sm:p-4 rounded-lg text-sm sm:text-base focus:outline-none break-words ${
                isDarkMode
                  ? 'bg-[#4B5563] text-white placeholder-gray-400'
                  : 'bg-gray-100 text-gray-900 placeholder-gray-500'
              }`}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading}
              className={`ml-3 p-3 sm:p-4 rounded-full ${
                isDarkMode
                  ? 'bg-[#ff9404] text-white hover:bg-[#e08503]'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              } transition-colors duration-300 disabled:opacity-50`}
            >
              <Send size={20} />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ChatBot;