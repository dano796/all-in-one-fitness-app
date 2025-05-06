import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Send, X, Menu, Edit, Trash2, Pencil } from 'lucide-react';
import { useTheme } from '../pages/ThemeContext';
import { User } from '@supabase/supabase-js';

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
}

const ChatBot: React.FC<ChatBotProps> = ({ user, initialMessage, isOpen: controlledIsOpen = false, onClose }) => {
  const { isDarkMode } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'bot', text: '¡Hola! Soy FitMate, tu asistente de fitness. ¿En qué puedo ayudarte hoy?' },
  ]);
  const [input, setInput] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(controlledIsOpen);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [idusuario, setIdusuario] = useState<number | null>(null);
  const [isIdLoading, setIsIdLoading] = useState<boolean>(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [editingConversationId, setEditingConversationId] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState<string>('');
  const [animatedTitles, setAnimatedTitles] = useState<{ [key: number]: string }>({});
  const [isFirstUserMessage, setIsFirstUserMessage] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatBotRef = useRef<HTMLDivElement>(null);

  // Sincronizar isOpen con controlledIsOpen
  useEffect(() => {
    setIsOpen(controlledIsOpen);
  }, [controlledIsOpen]);

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

  // Obtener las conversaciones del usuario y manejar el estado inicial
  const fetchConversations = async () => {
    if (!idusuario) return;

    try {
      const { data, error } = await supabase
        .from('Conversaciones')
        .select('id_conversacion, titulo, fecha_creacion')
        .eq('idusuario', idusuario)
        .order('fecha_creacion', { ascending: false });

      if (error) throw error;
      setConversations(data || []);

      // Si no hay conversaciones, crear una nueva automáticamente
      if (data && data.length === 0) {
        await createNewConversation();
      }
    } catch (error) {
      console.error('Error al obtener conversaciones:', error);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [idusuario]);

  // Verificar si es el primer mensaje del usuario en la conversación
  const checkIfFirstUserMessage = async (conversationId: number) => {
    try {
      const { data, error } = await supabase
        .from('Mensajes')
        .select('remitente')
        .eq('id_conversacion', conversationId)
        .eq('remitente', 'user');

      if (error) throw error;

      console.log('checkIfFirstUserMessage - Número de mensajes del usuario encontrados:', data.length);
      return data.length === 0;
    } catch (error) {
      console.error('checkIfFirstUserMessage - Error al verificar mensajes:', error.message);
      return false;
    }
  };

  // Crear una nueva conversación
  const createNewConversation = async (firstWord?: string) => {
    if (!idusuario) return;

    const defaultTitle = ''; // Título inicial vacío, se actualizará con el primer mensaje
    try {
      const { data, error } = await supabase
        .from('Conversaciones')
        .insert([{ idusuario, titulo: defaultTitle, fecha_creacion: new Date().toISOString() }])
        .select()
        .single();

      if (error) throw error;

      setConversations((prev) => [data, ...prev]);
      setCurrentConversationId(data.id_conversacion);
      setMessages([{ sender: 'bot', text: '¡Hola! Soy FitMate, tu asistente de fitness. ¿En qué puedo ayudarte hoy?' }]);
      setIsSidebarOpen(false);
      setIsFirstUserMessage(true);
    } catch (error) {
      console.error('Error al crear nueva conversación:', error);
    }
  };

  // Cargar mensajes de una conversación
  const loadConversationMessages = async (conversationId: number) => {
    try {
      const { data, error } = await supabase
        .from('Mensajes')
        .select('remitente, texto')
        .eq('id_conversacion', conversationId)
        .order('fecha_creacion', { ascending: true });

      if (error) throw error;

      const loadedMessages: ChatMessage[] = data.map((msg: any) => ({
        sender: msg.remitente as 'user' | 'bot',
        text: msg.texto,
        elements: msg.remitente === 'bot' ? parseMarkdownToJSX(msg.texto) : undefined,
      }));

      setMessages(loadedMessages.length > 0 ? loadedMessages : [{ sender: 'bot', text: '¡Hola! Soy FitMate, tu asistente de fitness. ¿En qué puedo ayudarte hoy?' }]);
      setCurrentConversationId(conversationId);
      setIsSidebarOpen(false);

      const isFirst = await checkIfFirstUserMessage(conversationId);
      setIsFirstUserMessage(isFirst);
    } catch (error) {
      console.error('Error al cargar mensajes de la conversación:', error);
    }
  };

  // Eliminar una conversación
  const deleteConversation = async (conversationId: number) => {
    try {
      await supabase.from('Mensajes').delete().eq('id_conversacion', conversationId);
      await supabase.from('Conversaciones').delete().eq('id_conversacion', conversationId);

      setConversations((prev) => prev.filter((conv) => conv.id_conversacion !== conversationId));
      if (currentConversationId === conversationId) {
        setCurrentConversationId(null);
        setMessages([{ sender: 'bot', text: '¡Hola! Soy FitMate, tu asistente de fitness. ¿En qué puedo ayudarte hoy?' }]);
        await createNewConversation();
      }
    } catch (error) {
      console.error('Error al eliminar la conversación:', error);
    }
  };

  // Editar el título de una conversación
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

  // Manejar el mensaje inicial cuando se abre el chat
  useEffect(() => {
    const sendInitialMessage = async () => {
      if (isOpen && initialMessage && messages.length === 1 && currentConversationId) {
        setMessages((prev) => [...prev, { sender: 'user', text: initialMessage }]);
        await handleSendMessage(initialMessage);
      }
    };

    if (currentConversationId) {
      sendInitialMessage();
    }
  }, [isOpen, initialMessage, currentConversationId]);

  // Hacer scroll automático al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cerrar el chat al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && chatBotRef.current && !chatBotRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsSidebarOpen(false);
        if (onClose) onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Función para parsear Markdown y convertirlo a elementos JSX
  const parseMarkdownToJSX = (text: string): JSX.Element[] => {
    const elements: JSX.Element[] = [];
    const lines = text.split('\n');
    let currentList: JSX.Element[] | null = null;
    let listType: 'ul' | 'ol' | null = null;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) {
        if (currentList) {
          elements.push(
            listType === 'ul' ? (
              <ul key={`ul-${index}`} className="ml-4 list-disc">
                {currentList}
              </ul>
            ) : (
              <ol key={`ol-${index}`} className="ml-4 list-decimal">
                {currentList}
              </ol>
            )
          );
          currentList = null;
          listType = null;
        }
        return;
      }

      const titleMatch = trimmedLine.match(/^(#+)\s+(.*)$/);
      if (titleMatch) {
        if (currentList) {
          elements.push(
            listType === 'ul' ? (
              <ul key={`ul-${index}`} className="ml-4 list-disc">
                {currentList}
              </ul>
            ) : (
              <ol key={`ol-${index}`} className="ml-4 list-decimal">
                {currentList}
              </ol>
            )
          );
          currentList = null;
          listType = null;
        }

        const level = titleMatch[1].length;
        const titleText = titleMatch[2];
        const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
        elements.push(
          <HeadingTag key={`heading-${index}`} className="font-bold text-lg mt-2 mb-1">
            {titleText}
          </HeadingTag>
        );
        return;
      }

      const numberedListMatch = trimmedLine.match(/^(\d+)\.\s+(.*)$/);
      if (numberedListMatch) {
        const itemText = numberedListMatch[2];
        if (currentList && listType !== 'ol') {
          elements.push(
            listType === 'ul' ? (
              <ul key={`ul-${index}`} className="ml-4 list-disc">
                {currentList}
              </ul>
            ) : (
              <ol key={`ol-${index}`} className="ml-4 list-decimal">
                {currentList}
              </ol>
            )
          );
          currentList = null;
        }

        if (!currentList) {
          currentList = [];
          listType = 'ol';
        }

        currentList.push(<li key={`ol-item-${index}`}>{itemText}</li>);
        return;
      }

      const bulletListMatch = trimmedLine.match(/^-+\s+(.*)$/);
      if (bulletListMatch) {
        const itemText = bulletListMatch[1];
        if (currentList && listType !== 'ul') {
          elements.push(
            listType === 'ul' ? (
              <ul key={`ul-${index}`} className="ml-4 list-disc">
                {currentList}
              </ul>
            ) : (
              <ol key={`ol-${index}`} className="ml-4 list-decimal">
                {currentList}
              </ol>
            )
          );
          currentList = null;
        }

        if (!currentList) {
          currentList = [];
          listType = 'ul';
        }

        currentList.push(<li key={`ul-item-${index}`}>{itemText}</li>);
        return;
      }

      if (currentList) {
        elements.push(
          listType === 'ul' ? (
            <ul key={`ul-${index}`} className="ml-4 list-disc">
              {currentList}
            </ul>
          ) : (
            <ol key={`ol-${index}`} className="ml-4 list-decimal">
              {currentList}
            </ol>
          )
        );
        currentList = null;
        listType = null;
      }

      let formattedLine: string | JSX.Element = trimmedLine;
      if (formattedLine.includes('**')) {
        const parts = formattedLine.split(/\*\*(.*?)\*\*/g);
        formattedLine = parts.map((part, i) =>
          i % 2 === 1 ? <strong key={`strong-${index}-${i}`}>{part}</strong> : part
        );
      }

      if (typeof formattedLine === 'string' && formattedLine.includes('*')) {
        const parts = formattedLine.split(/\*(.*?)\*/g);
        formattedLine = parts.map((part, i) =>
          i % 2 === 1 ? <em key={`em-${index}-${i}`}>{part}</em> : part
        );
      }

      elements.push(<p key={`p-${index}`}>{formattedLine}</p>);
    });

    if (currentList) {
      elements.push(
        listType === 'ul' ? (
          <ul key={`ul-final`} className="ml-4 list-disc">
            {currentList}
          </ul>
        ) : (
          <ol key={`ol-final`} className="ml-4 list-decimal">
            {currentList}
          </ol>
        )
      );
    }

    return elements;
  };

  const saveMessageToDB = async (conversationId: number, sender: 'user' | 'bot', text: string) => {
    try {
      const { error } = await supabase.from('Mensajes').insert([
        {
          id_conversacion: conversationId,
          remitente: sender,
          texto: text,
          fecha_creacion: new Date().toISOString(),
        },
      ]);

      if (error) throw error;
    } catch (error) {
      console.error('Error al guardar mensaje:', error);
    }
  };

  const handleSendMessage = async (messageToSend?: string) => {
    const message = messageToSend || input;
    if (!message.trim()) return;

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

    if (!currentConversationId) {
      const firstWord = message.split(' ')[0].toLowerCase();
      await createNewConversation(firstWord);
      return;
    }

    setMessages((prev) => [...prev, { sender: 'user', text: message }]);
    await saveMessageToDB(currentConversationId!, 'user', message);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, {
        message,
        userId: idusuario,
        conversationId: currentConversationId,
      });
      const botResponse = response.data.message;

      const parsedElements = parseMarkdownToJSX(botResponse);
      setMessages((prev) => [...prev, { sender: 'bot', text: botResponse, elements: parsedElements }]);
      await saveMessageToDB(currentConversationId!, 'bot', botResponse);

      // Re-fetch conversations to get the updated title
      await fetchConversations();

      // Abrir el sidebar solo si es el primer mensaje del usuario
      if (isFirstUserMessage) {
        setIsSidebarOpen(true);
      }

      // Resetear isFirstUserMessage después de procesar
      if (isFirstUserMessage) {
        setIsFirstUserMessage(false);
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: `Lo siento, ocurrió un error al enviar el mensaje: ${error.response?.data?.error || 'Error desconocido'}. Intenta de nuevo.` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Animar el título letra por letra cuando cambia y cerrar el sidebar al finalizar
  useEffect(() => {
    conversations.forEach((conv) => {
      if (!animatedTitles[conv.id_conversacion] || animatedTitles[conv.id_conversacion] !== conv.titulo) {
        const fullTitle = conv.titulo || ''; // Solo la idea de Open AI, no "FitMate"
        let currentTitle = '';
        let index = 0;

        const interval = setInterval(() => {
          if (index < fullTitle.length) {
            currentTitle += fullTitle[index];
            setAnimatedTitles((prev) => ({
              ...prev,
              [conv.id_conversacion]: currentTitle,
            }));
            index++;
          } else {
            clearInterval(interval);
            // Cerrar el sidebar después de que la animación termine
            if (isSidebarOpen && conv.id_conversacion === currentConversationId) {
              setIsSidebarOpen(false);
            }
          }
        }, 100); // Velocidad de escritura: 100ms por letra

        return () => clearInterval(interval);
      }
    });
  }, [conversations, isSidebarOpen, currentConversationId]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div ref={chatBotRef} className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsOpen(true);
            if (onClose) onClose();
          }}
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
          } transition-colors duration-300 flex flex-col border border-[#ff9404]`}
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
              <span className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>FitMate</span>
              {currentConversationId && (
                <h3 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  - {animatedTitles[currentConversationId] || conversations.find((c) => c.id_conversacion === currentConversationId)?.titulo || 'ChatBot'}
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
              className={`absolute top-0 left-0 w-3/4 h-full bg-[#2D2D2D] text-white p-4 overflow-y-auto border-r border-[#ff9404] z-20`}
            >
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-300">Conversaciones</h4>
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
                        : 'bg-[#3B3B3B] hover:bg-[#4B4B4B]'
                    } transition-colors duration-300`}
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
                      <div className="flex items-center justify-between w-full">
                        <div onClick={() => loadConversationMessages(conv.id_conversacion)} className="flex-1">
                          <p className="text-sm font-medium truncate">
                            {animatedTitles[conv.id_conversacion] || conv.titulo || 'Nueva conversación'}
                          </p>
                          <p className="text-xs text-gray-400">{new Date(conv.fecha_creacion).toLocaleDateString()}</p>
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
                          {msg.elements ? msg.elements : msg.text}
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
                  <div className="flex items-center space-x-2 ml-3">
                    <button
                      onClick={() => handleSendMessage()}
                      disabled={isLoading}
                      className={`p-2 text-[#ff9404] hover:text-[#e08503] transition-colors duration-300 disabled:opacity-50`}
                    >
                      <Send size={20} />
                    </button>
                    <button
                      onClick={() => createNewConversation()}
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
      )}
    </div>
  );
};

export default ChatBot;