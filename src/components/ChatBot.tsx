// src/components/ChatBot.tsx
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Send, X } from 'lucide-react';
import { useTheme } from '../pages/ThemeContext';
import { User } from '@supabase/supabase-js';

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

interface ChatBotProps {
  user: User | null;
}

const ChatBot: React.FC<ChatBotProps> = ({ user }) => {
  const { isDarkMode } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'bot', text: '¡Hola! Soy FitMate, tu asistente de fitness. ¿En qué puedo ayudarte hoy?' },
  ]);
  const [input, setInput] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [idusuario, setIdusuario] = useState<number | null>(null);
  const [isIdLoading, setIsIdLoading] = useState<boolean>(false); // Nuevo estado para manejar la carga de idusuario
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatBotRef = useRef<HTMLDivElement>(null); // Ref para el contenedor del chat

  // Obtener idusuario basado en el usuario autenticado
  useEffect(() => {
    const fetchIdUsuario = async () => {
      if (!user) {
        setIdusuario(null);
        setIsIdLoading(false);
        return;
      }

      setIsIdLoading(true);
      try {
        const { data, error } = await supabase
          .from('Inicio Sesion')
          .select('idusuario')
          .eq('Correo', user.email)
          .single();

        if (error || !data) {
          setMessages((prev) => [
            ...prev,
            { sender: 'bot', text: 'No pude obtener tu información de usuario. Por favor, intenta de nuevo más tarde.' },
          ]);
          setIdusuario(null);
        } else {
          setIdusuario(data.idusuario);
        }
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          { sender: 'bot', text: 'Error al obtener tu información de usuario. Por favor, intenta de nuevo más tarde.' },
        ]);
        setIdusuario(null);
      } finally {
        setIsIdLoading(false);
      }
    };

    fetchIdUsuario();
  }, [user]);

  // Hacer scroll automático al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cerrar el chat al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && chatBotRef.current && !chatBotRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    if (!user || !idusuario) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Por favor, inicia sesión para usar el chat.' },
      ]);
      return;
    }

    if (isIdLoading) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Aún estoy cargando tu información de usuario. Por favor, espera un momento.' },
      ]);
      return;
    }

    // Agregar el mensaje del usuario
    setMessages((prev) => [...prev, { sender: 'user', text: input }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, {
        message: input,
        userId: idusuario,
      });
      const botResponse = response.data.message;

      setMessages((prev) => [...prev, { sender: 'bot', text: botResponse }]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: `Lo siento, ocurrió un error al enviar el mensaje: ${error.response?.data?.error || 'Error desconocido'}. Intenta de nuevo.` },
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
    <div ref={chatBotRef} className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
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
          <div className="w-full h-full bg-[#ff9404] rounded-full flex items-center justify-center">
            <img
              src="https://png.pngtree.com/png-clipart/20230621/original/pngtree-illustration-of-a-standing-cat-png-image_9194368.png"
              alt="FitMate"
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
            />
          </div>
        </motion.button>
      )}

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
          {/* Encabezado del chat */}
          <div
            className={`flex justify-between items-center p-4 sm:p-5 border-b ${
              isDarkMode ? 'border-[#ff9404] bg-[#3B4252]' : 'border-gray-200 bg-white'
            } flex-shrink-0`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#ff9404] rounded-full flex items-center justify-center">
                <img
                  src="https://png.pngtree.com/png-clipart/20230621/original/pngtree-illustration-of-a-standing-cat-png-image_9194368.png"
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
            {!user ? (
              <div className="flex justify-center items-center h-full">
                <div
                  className={`p-3 sm:p-4 rounded-xl text-sm sm:text-base ${
                    isDarkMode ? 'bg-[#4B5563] text-gray-400' : 'bg-gray-100 text-gray-600'
                  } shadow-sm text-center`}
                >
                  Debes iniciar sesión para usar el chat.
                </div>
              </div>
            ) : isIdLoading ? (
              <div className="flex justify-center items-center h-full">
                <div
                  className={`p-3 sm:p-4 rounded-xl text-sm sm:text-base ${
                    isDarkMode ? 'bg-[#4B5563] text-gray-400' : 'bg-gray-100 text-gray-600'
                  } shadow-sm text-center`}
                >
                  Cargando tu información de usuario...
                </div>
              </div>
            ) : (
              <>
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
                      <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#ff9404] rounded-full flex items-center justify-center flex-shrink-0">
                        <img
                          src="https://png.pngtree.com/png-clipart/20230621/original/pngtree-illustration-of-a-standing-cat-png-image_9194368.png"
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
                    <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#ff9404] rounded-full flex items-center justify-center flex-shrink-0">
                      <img
                        src="https://png.pngtree.com/png-clipart/20230621/original/pngtree-illustration-of-a-standing-cat-png-image_9194368.png"
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
              </>
            )}
          </div>

          {/* Área de entrada de texto */}
          {user && !isIdLoading && (
            <div
              className={`flex items-center p-4 sm:p-5 border-t ${
                isDarkMode ? 'border-[#ff9404] bg-[#3B4252]' : 'border-gray-200 bg-white'
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
          )}
        </motion.div>
      )}
    </div>
  );
};

export default ChatBot;