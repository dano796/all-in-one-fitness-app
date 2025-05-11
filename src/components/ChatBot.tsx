import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Send, X, Menu, Edit, Trash2, Pencil, Lock } from 'lucide-react';
import { useTheme } from '../pages/ThemeContext';
import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import React from 'react';

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  elements?: JSX.Element[];
}

interface Conversation {
  id_conversacion: number;
  titulo: string;
  fecha_creacion: string;
}

interface ChatBotProps {
  user: User | null;
  initialMessage?: string;
  isOpen?: boolean;
  onClose?: () => void;
  selectedConversationId?: number | null;
}

const ChatBot: React.FC<ChatBotProps> = ({ user, initialMessage, isOpen: controlledIsOpen = false, onClose, selectedConversationId }) => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'bot', text: '¡Hola! Soy FitMate, tu asistente de fitness. ¿En qué puedo ayudarte hoy?' },
  ]);
  const [input, setInput] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(controlledIsOpen);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [idusuario, setIdusuario] = useState<number | null>(null);
  const [isIdLoading, setIsIdLoading] = useState<boolean>(false);
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [editingConversationId, setEditingConversationId] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState<string>('');
  const [isFirstUserMessage, setIsFirstUserMessage] = useState<boolean>(true);
  const [initialMessageSent, setInitialMessageSent] = useState<boolean>(false);
  const [lastInitialMessage, setLastInitialMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatBotRef = useRef<HTMLDivElement>(null);

  // Obtener idusuario y Suscripción desde el backend
  useEffect(() => {
    // Referencia para evitar actualizar estado en componentes desmontados
    let isMounted = true;
    
    const fetchUserData = async () => {
      if (!user) {
        if (isMounted) {
          setIdusuario(null);
          setHasSubscription(null);
          setIsIdLoading(false);
        }
        return;
      }

      setIsIdLoading(true);
      try {
        // Obtener datos del usuario y su suscripción
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/get-user-subscription`, {
          params: { email: user.email },
        });
        const { idusuario: id, Suscripcion } = response.data;
        
        if (!isMounted) return;
        
        setIdusuario(id);
        setHasSubscription(Suscripcion);
        
        // Obtener conversaciones si tiene suscripción
        if (id && Suscripcion) {
          try {
            const { data, error } = await supabase
              .from('Conversaciones')
              .select('id_conversacion, titulo, fecha_creacion')
              .eq('idusuario', id)
              .order('fecha_creacion', { ascending: false });
            
            if (!isMounted) return;
            
            if (!error) {
              setConversations(data || []);
              
              // Inicializar conversación apropiada
              if (selectedConversationId) {
                await loadConversationMessages(selectedConversationId);
                
                // Si hay un mensaje inicial, lo enviamos después de cargar la conversación
                if (initialMessage && !initialMessageSent && isMounted) {
                  setTimeout(() => {
                    if (isMounted) handleSendMessage(initialMessage);
                  }, 500); // Pequeño retraso para asegurar que la UI se actualice correctamente
                }
              } else if (data.length > 0) {
                await loadConversationMessages(data[0].id_conversacion);
                
                // Si hay un mensaje inicial, lo enviamos después de cargar la conversación
                if (initialMessage && !initialMessageSent && isMounted) {
                  setTimeout(() => {
                    if (isMounted) handleSendMessage(initialMessage);
                  }, 500);
                }
              } else if (Suscripcion) {
                const newConversationId = await createNewConversation();
                
                // Si hay un mensaje inicial, lo enviamos después de crear la conversación
                if (initialMessage && !initialMessageSent && newConversationId && isMounted) {
                  setTimeout(() => {
                    if (isMounted) handleSendMessage(initialMessage);
                  }, 500);
                }
              }
            }
          } catch (error) {
            console.error('Error al cargar conversaciones:', error);
          }
        }
      } catch (error) {
        console.error('Error al obtener datos de usuario:', error);
        if (isMounted) {
          setMessages(prev => [
            ...prev,
            { sender: 'bot', text: 'Error al obtener tu información. Intenta de nuevo más tarde.' },
          ]);
          setIdusuario(null);
          setHasSubscription(null);
        }
      } finally {
        if (isMounted) setIsIdLoading(false);
      }
    };

    fetchUserData();
    
    // Limpieza
    return () => {
      isMounted = false;
    };
  }, [user, selectedConversationId]);

  // Manejar el estado del chat (apertura/cierre)
  useEffect(() => {
    console.log("Estado del chat actualizado - controlledIsOpen:", controlledIsOpen, "isOpen:", isOpen);
    
    // Si el chat se está abriendo externamente
    if (controlledIsOpen !== isOpen) {
      setIsOpen(controlledIsOpen);
    }
  }, [controlledIsOpen]);

  // Efecto para manejar cambios en el mensaje inicial
  useEffect(() => {
    // Si no hay mensaje inicial o el chat no está abierto, no hacemos nada
    if (!initialMessage || !isOpen) return;
    
    // Si el mensaje inicial ha cambiado, resetear el estado
    if (initialMessage !== lastInitialMessage) {
      console.log("Nuevo mensaje inicial detectado:", initialMessage);
      setInitialMessageSent(false);
      setLastInitialMessage(initialMessage);
    }
    
    // Si ya se envió este mensaje, no hacemos nada
    if (initialMessageSent) {
      console.log("Mensaje inicial ya enviado, no se procesa de nuevo");
      return;
    }
    
    // Procesar el nuevo mensaje inicial
    const handleNewInitialMessage = async () => {
      // Solo proceder si el usuario está autenticado y tiene suscripción
      if (!user || !idusuario || hasSubscription !== true) return;
      
      console.log("Procesando nuevo mensaje inicial:", initialMessage);
      
      try {
        // Limpiar los mensajes actuales
        setMessages([{ sender: 'bot', text: '¡Hola! Soy FitMate, tu asistente de fitness. ¿En qué puedo ayudarte hoy?' }]);
        
        // Crear una nueva conversación
        const newConversationId = await createNewConversation();
        
        // Si se creó correctamente, enviar el mensaje inicial
        if (newConversationId) {
          setTimeout(() => {
            handleSendMessage(initialMessage);
          }, 500);
        }
      } catch (error) {
        console.error("Error al crear nueva conversación para mensaje inicial:", error);
      }
    };
    
    handleNewInitialMessage();
  }, [initialMessage, isOpen, lastInitialMessage, initialMessageSent, user, idusuario, hasSubscription]);

  // Control de apertura/cierre del chat con clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && chatBotRef.current && !chatBotRef.current.contains(event.target as Node)) {
        console.log("Clic fuera del chat detectado, cerrando");
        setIsOpen(false);
        setIsSidebarOpen(false);
        if (onClose) onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Desplazamiento automático a los mensajes nuevos
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Función simplificada de parseado de markdown
  const parseMarkdownToJSX = (text: string): JSX.Element[] => {
    try {
      // Dividir el texto en líneas
      const lines = text.split('\n');
      
      // Mapear cada línea a un elemento JSX
      return lines.map((line, i) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return <br key={`br-${i}`} />;
        
        // Títulos (encabezados)
        if (trimmedLine.startsWith('# ')) {
          return <h1 key={`h1-${i}`} className="text-xl font-bold mt-3 mb-2">{trimmedLine.substring(2)}</h1>;
        }
        
        if (trimmedLine.startsWith('## ')) {
          return <h2 key={`h2-${i}`} className="text-lg font-bold mt-3 mb-2">{trimmedLine.substring(3)}</h2>;
        }
        
        if (trimmedLine.startsWith('### ')) {
          return <h3 key={`h3-${i}`} className="text-base font-bold mt-2 mb-1">{trimmedLine.substring(4)}</h3>;
        }
        
        // Listas con viñetas
        if (trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
          return (
            <div key={`list-${i}`} className="flex ml-4 mb-1">
              <span className="mr-2 ml-2">•</span>
              <span>{formatTextWithAsterisks(trimmedLine.substring(1).trim())}</span>
            </div>
          );
        }
        
        // Listas numeradas
        const numMatch = trimmedLine.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={`numlist-${i}`} className="flex ml-4 mb-1">
              <span className="mr-2 ml-2">{numMatch[1]}.</span>
              <span>{formatTextWithAsterisks(numMatch[2])}</span>
            </div>
          );
        }
        
        // Texto normal (puede contener negritas)
        return <p key={`p-${i}`} className="mb-1">{formatTextWithAsterisks(trimmedLine)}</p>;
      });
    } catch (error) {
      console.error('Error al parsear markdown:', error);
      return [<p key="error">{text}</p>];
    }
  };
  
  // Función auxiliar para procesar texto con negritas (**texto**)
  const formatTextWithAsterisks = (text: string): React.ReactNode => {
    if (!text.includes('**')) return text;
    
    const segments = text.split(/(\*\*.*?\*\*)/g);
    if (segments.length === 1) return segments[0];
    
    return (
      <>
        {segments.map((segment, i) => {
          if (segment.startsWith('**') && segment.endsWith('**')) {
            const content = segment.slice(2, -2);
            return <strong key={`bold-${i}`}>{content}</strong>;
          }
          return <React.Fragment key={`text-${i}`}>{segment}</React.Fragment>;
        })}
      </>
    );
  };
  
  // Funciones básicas simplificadas
  const saveMessageToDB = async (conversationId: number, sender: 'user' | 'bot', text: string) => {
    try {
      await supabase.from('Mensajes').insert([{
        id_conversacion: conversationId,
        remitente: sender,
        texto: text,
        fecha_creacion: new Date().toISOString(),
      }]);
    } catch (error) {
      console.error('Error al guardar mensaje:', error);
    }
  };
  
  // Manejo de mensajes simplificado
  const handleSendMessage = async (messageToSend?: string) => {
    // Verificaciones básicas
    if (isLoading || hasSubscription === false || !user || !idusuario) {
      if (hasSubscription === false) navigate('/subscription-plans');
      return;
    }
    
    const message = messageToSend || input;
    if (!message.trim()) return;
    
    // Crear conversación si es necesario
    if (!currentConversationId) {
      try {
        await createNewConversation();
        if (currentConversationId) {
          handleSendMessage(message);
        }
        return;
      } catch (error) {
        console.error('Error al crear conversación:', error);
        return;
      }
    }
    
    // Verificar si este mensaje ya ha sido procesado (si es un mensaje inicial)
    const isInitialMsg = messageToSend === initialMessage;
    if (isInitialMsg && initialMessageSent) {
      console.log("Mensaje inicial ya procesado, evitando duplicación");
      return;
    }
    
    // Mostrar mensaje del usuario (solo si es mensaje normal, no inicial)
    if (!messageToSend) {
      setMessages(prev => [...prev, { sender: 'user', text: message }]);
    } else if (isInitialMsg && !initialMessageSent) {
      // Si es un mensaje inicial que aún no ha sido mostrado
      setMessages(prev => [...prev, { sender: 'user', text: messageToSend }]);
      setInitialMessageSent(true);
      console.log("Marcando mensaje inicial como enviado:", messageToSend);
    }
    
    // Guardar y procesar mensaje
    try {
      // Limpiamos input independientemente de si es mensaje inicial o no
      if (!messageToSend) setInput('');
      setIsLoading(true);
      
      // Guardar mensaje en la base de datos
      await saveMessageToDB(currentConversationId, 'user', message);
      
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, {
        message,
        userId: idusuario,
        conversationId: currentConversationId,
      });
      
      // Procesar respuesta
      const botResponse = response.data.message;
      const parsedElements = parseMarkdownToJSX(botResponse);
      
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: botResponse, 
        elements: parsedElements 
      }]);
      
      await saveMessageToDB(currentConversationId, 'bot', botResponse);
      if (isFirstUserMessage) setIsFirstUserMessage(false);
      
      // Asegurarnos de que se marca como enviado si es un mensaje inicial
      if (isInitialMsg && !initialMessageSent) {
        setInitialMessageSent(true);
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: `Lo siento, ocurrió un error: ${error.response?.data?.error || 'Error desconocido'}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  // Renderizado simplificado
  const renderMessage = (msg: ChatMessage) => (
    <div className={`max-w-[80%] sm:max-w-[85%] p-3 sm:p-4 rounded-xl text-sm sm:text-base leading-relaxed break-words ${
      msg.sender === 'user'
        ? isDarkMode ? 'bg-[#ff9404] text-white' : 'bg-orange-500 text-white'
        : isDarkMode ? 'bg-[#4B5563] text-white' : 'bg-gray-100 text-gray-900'
    } shadow-sm`}>
      {msg.elements && msg.elements.length > 0 ? msg.elements : msg.text}
    </div>
  );

  const checkIfFirstUserMessage = async (conversationId: number) => {
    try {
      const { data, error } = await supabase
        .from('Mensajes')
        .select('remitente')
        .eq('id_conversacion', conversationId)
        .eq('remitente', 'user');

      if (error) throw error;
      return data.length === 0;
    } catch (error: any) {
      console.error('checkIfFirstUserMessage - Error al verificar mensajes:', error.message);
      return false;
    }
  };

  const createNewConversation = async () => {
    if (!idusuario) {
      console.error('createNewConversation - No hay idusuario disponible');
      return null;
    }

    const defaultTitle = '';
    try {
      const { data, error } = await supabase
        .from('Conversaciones')
        .insert([{ idusuario, titulo: defaultTitle, fecha_creacion: new Date().toISOString() }])
        .select()
        .single();

      if (error) {
        console.error('Error al crear nueva conversación:', error);
        throw error;
      }

      if (!data) {
        console.error('No se recibieron datos al crear la conversación');
        throw new Error('No se recibieron datos al crear la conversación');
      }

      setConversations((prev) => [data, ...prev]);
      setCurrentConversationId(data.id_conversacion);
      setIsSidebarOpen(false);
      setIsFirstUserMessage(true);
      setInitialMessageSent(false);
      
      return data.id_conversacion;
    } catch (error) {
      console.error('Error al crear nueva conversación:', error);
      throw error;
    }
  };

  const loadConversationMessages = async (conversationId: number) => {
    if (!conversationId) {
      console.error('loadConversationMessages - No se proporcionó un ID de conversación válido');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('Mensajes')
        .select('remitente, texto')
        .eq('id_conversacion', conversationId)
        .order('fecha_creacion', { ascending: true });

      if (error) {
        console.error('Error al cargar mensajes:', error);
        throw error;
      }

      const loadedMessages: ChatMessage[] = data.map((msg: any) => ({
        sender: msg.remitente as 'user' | 'bot',
        text: msg.texto,
        elements: msg.remitente === 'bot' ? parseMarkdownToJSX(msg.texto) : undefined,
      }));

      // Si no hay mensajes, inicializamos con un mensaje de bienvenida
      if (loadedMessages.length === 0) {
        setMessages([{ sender: 'bot', text: '¡Hola! Soy FitMate, tu asistente de fitness. ¿En qué puedo ayudarte hoy?' }]);
      } else {
        setMessages(loadedMessages);
      }
      
      setCurrentConversationId(conversationId);
      setIsSidebarOpen(false);

      const isFirst = await checkIfFirstUserMessage(conversationId);
      setIsFirstUserMessage(isFirst);
      setInitialMessageSent(false);
    } catch (error) {
      console.error('Error al cargar mensajes de la conversación:', error);
      // Establecer un mensaje de error que el usuario pueda ver
      setMessages([{ 
        sender: 'bot', 
        text: 'Lo siento, hubo un problema al cargar los mensajes de esta conversación. Por favor, intenta nuevamente.' 
      }]);
    }
  };

  const deleteConversation = async (conversationId: number) => {
    try {
      await supabase.from('Mensajes').delete().eq('id_conversacion', conversationId);
      await supabase.from('Conversaciones').delete().eq('id_conversacion', conversationId);

      setConversations((prev) => prev.filter((conv) => conv.id_conversacion !== conversationId));

      // Si la conversación eliminada es la actual, resetear el estado
      if (currentConversationId === conversationId) {
        setCurrentConversationId(null);
        setMessages([{ sender: 'bot', text: '¡Hola! Soy FitMate, tu asistente de fitness. ¿En qué puedo ayudarte hoy?' }]);
      }

      // Si no hay más conversaciones, crear una nueva
      if (conversations.length <= 1) {
        await createNewConversation();
      } else {
        // Cargar la primera conversación disponible
        const remainingConversations = conversations.filter((conv) => conv.id_conversacion !== conversationId);
        if (remainingConversations.length > 0) {
          await loadConversationMessages(remainingConversations[0].id_conversacion);
        }
      }
    } catch (error) {
      console.error('Error al eliminar la conversación:', error);
    }
  };

  const editConversationTitle = async (conversationId: number, newTitle: string) => {
    try {
      const { error } = await supabase
        .from('Conversaciones')
        .update({ titulo: newTitle })
        .eq('id_conversacion', conversationId);

      if (error) throw error;

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id_conversacion === conversationId ? { ...conv, titulo: newTitle } : conv
        )
      );
      setEditingConversationId(null);
      setNewTitle('');
    } catch (error) {
      console.error('Error al editar el título de la conversación:', error);
    }
  };

  return (
    <div ref={chatBotRef} className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            console.log("Botón del chat clickeado, abriendo chat");
            setIsOpen(true);
          }}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:shadow-xl"
          style={{
            background: isDarkMode ? '#2D3748' : 'white',
            boxShadow: isDarkMode ? '0 0 10px rgba(255,148,4,0.3)' : '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#ff9404] rounded-full flex items-center justify-center">
            <img
              src="https://png.pngtree.com/png-clipart/20230621/original/pngtree-illustration-of-a-standing-cat-png-image_9194368.png"
              alt="FitMate"
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
            />
          </div>
        </motion.button>
      )}

      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className={`relative w-[90vw] max-w-[400px] sm:w-[400px] h-[500px] sm:h-[550px] rounded-xl shadow-lg overflow-hidden ${
              isDarkMode ? 'bg-[#282c3c] border border-gray-500' : 'bg-[#F8F9FA] border border-gray-300'
            } transition-colors duration-300 flex flex-col ${hasSubscription === false ? 'blur-sm' : ''}`}
          >
            {/* Encabezado del chat */}
            <div
              className={`flex justify-between items-center p-4 sm:p-5 border-b ${
                isDarkMode ? 'border-gray-500 bg-[#3B4252]' : 'border-gray-300 bg-white'
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
                <span className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>FitMate</span>
                {currentConversationId && (
                  <h3 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    - {conversations.find((c) => c.id_conversacion === currentConversationId)?.titulo || 'ChatBot'}
                  </h3>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleSidebar}
                  className={`p-2 rounded-full ${
                    isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
                  } transition-colors duration-300`}
                >
                  <Menu size={20} />
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsSidebarOpen(false);
                    if (onClose) onClose();
                  }}
                  className={`p-2 rounded-full ${
                    isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
                  } transition-colors duration-300`}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Contenedor de sidebar y chat */}
            <div className="flex flex-1 overflow-hidden relative">
              {/* Sidebar de conversaciones */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: isSidebarOpen ? 0 : '-100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className={`absolute top-0 left-0 w-3/4 h-full text-white p-4 overflow-y-auto ${
                  isDarkMode ? 'bg-[#282c3c] border-gray-500' : 'bg-[#F8F9FA] border-gray-300'
                } z-20`}
              >
                <div className="mb-4">
                  <h4 className={`font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>Conversaciones</h4>
                </div>
                {conversations.length === 0 ? (
                  <p className="text-sm text-gray-400">No tienes conversaciones.</p>
                ) : (
                  conversations.map((conv) => (
                    <div
                      key={conv.id_conversacion}
                      className={`p-2 mb-2 rounded-lg cursor-pointer group relative ${
                        currentConversationId === conv.id_conversacion
                          ? 'bg-[#ff9404] text-white'
                          : 'bg-[#4B5563] hover:bg-[#3f4853]'
                      } transition-colors duration-200`}
                    >
                      {editingConversationId === conv.id_conversacion ? (
                        <div className="flex items-center space-x-2 w-full">
                          <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="flex-1 p-1 rounded-lg text-sm bg-gray-600 text-white focus:outline-none w-0 min-w-0"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && newTitle.trim()) {
                                editConversationTitle(conv.id_conversacion, newTitle);
                              }
                            }}
                          />
                          <button
                            onClick={() => newTitle.trim() && editConversationTitle(conv.id_conversacion, newTitle)}
                            className="text-gray-400 hover:text-gray-200 flex-shrink-0"
                          >
                            <Send size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full pl-1">
                          <div onClick={() => loadConversationMessages(conv.id_conversacion)} className="flex-1">
                            <p className="text-sm font-medium truncate">
                              {conv.titulo || 'Nueva conversación'}
                            </p>
                            <p className="text-xs text-white">{new Date(conv.fecha_creacion).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0">
                            <button
                              onClick={() => {
                                setEditingConversationId(conv.id_conversacion);
                                setNewTitle(conv.titulo || '');
                              }}
                              className="p-1 text-gray-400 hover:text-gray-200"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => deleteConversation(conv.id_conversacion)}
                              className="p-1 text-gray-400 hover:text-gray-200"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </motion.div>

              {/* Overlay para bloquear solo el chat cuando el sidebar está abierto */}
              {isSidebarOpen && (
                <div
                  className="absolute inset-0 bg-black bg-opacity-50 z-10"
                  onClick={toggleSidebar}
                />
              )}

              {/* Área de mensajes */}
              <div className="flex-1 flex flex-col">
                <div className="flex-1 p-5 sm:p-6 overflow-y-auto relative z-0">
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
                          {renderMessage(msg)}
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
                {user && !isIdLoading && hasSubscription && (
                  <div
                    className={`flex items-center p-4 sm:p-5 border-t ${
                      isDarkMode ? 'border-gray-500 bg-[#3B4252]' : 'border-gray-300 bg-white'
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
                    <div className="flex items-center space-x-2 ml-3">
                      <button
                        onClick={() => handleSendMessage()}
                        disabled={isLoading}
                        className={`p-2 text-[#ff9404] hover:text-[#e08503] transition-colors duration-300 disabled:opacity-50`}
                      >
                        <Send size={20} />
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const newId = await createNewConversation();
                            if (newId) {
                              // Configurar el chat nuevo
                              setMessages([{ sender: 'bot', text: '¡Hola! Soy FitMate, tu asistente de fitness. ¿En qué puedo ayudarte hoy?' }]);
                              setIsOpen(true);
                              setIsSidebarOpen(false);
                            }
                          } catch (error) {
                            console.error('Error al crear nuevo chat:', error);
                          }
                        }}
                        className={`p-2 text-[#ff9404] hover:text-[#e08503] transition-colors duration-300`}
                      >
                        <Edit size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default ChatBot;