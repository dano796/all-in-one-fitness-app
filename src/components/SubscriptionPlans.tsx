import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../pages/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useNotificationStore } from '../store/notificationStore';
import GalaxyBackground from '../components/GalaxyBackground';

interface SubscriptionPlansProps {
  user: User | null;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ user }) => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const [idusuario, setIdusuario] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchIdUsuario = async () => {
      if (!user) {
        setIdusuario(null);
        setHasSubscription(null);
        return;
      }

      setIsLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/get-user-subscription`, {
          params: { email: user.email },
        });

        const data = response.data;
        setIdusuario(data.idusuario);
        setHasSubscription(data.Suscripcion);
      } catch (error) {
        console.error('Error al obtener idusuario:', error);
        setIdusuario(null);
        setHasSubscription(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIdUsuario();
  }, [user]);

  const handleUpgradeToPremium = async () => {
    if (!user || !idusuario) {
      addNotification(
        '⚠️ Error',
        'Por favor, inicia sesión para continuar.',
        'error'
      );
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/upgrade-subscription`, {
        idusuario,
      });

      addNotification(
        '✅ Suscripción Activada',
        '¡Has activado la suscripción Premium! Ahora puedes usar el chatbot.',
        'success'
      );
      navigate('/dashboard');
    } catch (error) {
      console.error('Error al activar suscripción:', error);
      addNotification(
        '⚠️ Error',
        'Error al activar la suscripción. Intenta de nuevo.',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 ${isDarkMode ? 'bg-[#282c3c] text-white' : 'bg-[#F8F9FA] text-gray-900'} transition-colors duration-300 relative overflow-hidden`}>
      {/* Galaxy Background */}
      <div className="absolute inset-0 z-0">
        <GalaxyBackground />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl relative z-10"
      >
        <h1 className={`text-3xl sm:text-4xl font-bold text-center mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Transforma tu Fitness con el Plan Perfecto
        </h1>
        <p className={`text-center mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Elige el plan que mejor se adapte a tus objetivos de salud y fitness.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Plan Gratuito */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className={`p-6 rounded-xl shadow-lg flex flex-col items-center relative overflow-hidden ${
              isDarkMode ? 'bg-[#3B4252] border border-gray-500' : 'bg-white border border-gray-300'
            }`}
          >
            <div className="absolute top-0 left-0 w-full h-24">
              <img
                src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop"
                alt="Free Plan Fitness"
                className="w-full h-full object-cover opacity-30"
              />
            </div>
            <div className="relative z-10 w-full text-center">
              <h2 className="text-2xl font-semibold mb-2">Gratuito</h2>
              <p className="text-4xl font-bold mb-4">$0<span className="text-lg font-normal">/mes</span></p>
              <ul className="mb-6 space-y-3">
                <li className="flex items-center justify-center">
                  <CheckCircle size={20} className="text-[#ff9404] mr-2" />
                  Rutinas predefinidas
                </li>
                <li className="flex items-center justify-center">
                  <CheckCircle size={20} className="text-[#ff9404] mr-2" />
                  Seguimiento de calorías
                </li>
                <li className="flex items-center justify-center">
                  <CheckCircle size={20} className="text-[#ff9404] mr-2" />
                  Seguimiento de consumo de agua
                </li>
                <li className="flex items-center justify-center">
                  <CheckCircle size={20} className="text-[#ff9404] mr-2" />
                  Calculadora RM
                </li>
                <li className="flex items-center justify-center">
                  <CheckCircle size={20} className="text-[#ff9404] mr-2" />
                  Progreso RM
                </li>
                <li className="flex items-center justify-center">
                  <CheckCircle size={20} className="text-[#ff9404] mr-2" />
                  Rutinas personalizadas
                </li>
                <li className="flex items-center justify-center">
                  <CheckCircle size={20} className="text-[#ff9404] mr-2" />
                  Recetas
                </li>
                <li className="flex items-center justify-center">
                  <XCircle size={20} className="text-red-500 mr-2" />
                  Búsqueda de comida por imágenes
                </li>
                <li className="flex items-center justify-center">
                  <XCircle size={20} className="text-red-500 mr-2" />
                  Análisis de ejercicios con IA
                </li>
                <li className="flex items-center justify-center">
                  <XCircle size={20} className="text-red-500 mr-2" />
                  Chatbot FitMate
                </li>
                <li className="flex items-center justify-center">
                  <XCircle size={20} className="text-red-500 mr-2" />
                  Soporte prioritario
                </li>
                <li className="flex items-center justify-center">
                  <XCircle size={20} className="text-red-500 mr-2" />
                  Preparación de recetas
                </li>
              </ul>
              <button
                className={`w-full py-3 rounded-lg ${
                  hasSubscription
                    ? isDarkMode
                      ? 'bg-[#4B5563] text-gray-400'
                      : 'bg-gray-200 text-gray-600'
                    : 'bg-[#ff9404] text-white hover:bg-[#e08503]'
                } transition-colors duration-300`}
                disabled={hasSubscription || isLoading}
                onClick={() => navigate('/dashboard')}
              >
                {hasSubscription ? 'No Disponible' : 'Continuar con Gratuito'}
              </button>
            </div>
          </motion.div>

          {/* Plan Premium */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className={`p-6 rounded-xl shadow-lg flex flex-col items-center relative overflow-hidden ${
              isDarkMode ? 'bg-[#3B4252] border border-[#ff9404]' : 'bg-white border border-[#ff9404]'
            }`}
          >
            <div className="absolute top-0 left-0 w-full h-24">
              <img
                src="https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=2070&auto=format&fit=crop"
                alt="Premium Plan Fitness"
                className="w-full h-full object-cover opacity-30"
              />
            </div>
            <div className="absolute top-2 right-2 bg-[#ff9404] text-white text-xs font-bold px-2 py-1 rounded-full">
              Recomendado
            </div>
            <div className="relative z-10 w-full text-center">
              <h2 className="text-2xl font-semibold mb-2">Premium</h2>
              <p className="text-4xl font-bold mb-4">$22.000 COP<span className="text-lg font-normal">/mes</span></p>
              <ul className="mb-6 space-y-3">
                <li className="flex items-center justify-center">
                  <CheckCircle size={20} className="text-[#ff9404] mr-2" />
                  Rutinas predefinidas
                </li>
                <li className="flex items-center justify-center">
                  <CheckCircle size={20} className="text-[#ff9404] mr-2" />
                  Seguimiento de calorías
                </li>
                <li className="flex items-center justify-center">
                  <CheckCircle size={20} className="text-[#ff9404] mr-2" />
                  Seguimiento de consumo de agua
                </li>
                <li className="flex items-center justify-center">
                  <CheckCircle size={20} className="text-[#ff9404] mr-2" />
                  Calculadora RM
                </li>
                <li className="flex items-center justify-center">
                  <CheckCircle size={20} className="text-[#ff9404] mr-2" />
                  Progreso RM
                </li>
                <li className="flex items-center justify-center">
                  <CheckCircle size={20} className="text-[#ff9404] mr-2" />
                  Rutinas personalizadas
                </li>
                <li className="flex items-center justify-center">
                  <CheckCircle size={20} className="text-[#ff9404] mr-2" />
                  Recetas
                </li>
                <li className="flex items-center justify-center">
                  <CheckCircle size={20} className="text-[#ff9404] mr-2" />
                  <span className="flex items-center">
                    Búsqueda de comida por imágenes
                    <ArrowRight size={16} className="ml-1 text-[#ff9404]" />
                  </span>
                </li>
                <li className="flex items-center justify-center">
                  <CheckCircle size={20} className="text-[#ff9404] mr-2" />
                  <span className="flex items-center">
                    Análisis de ejercicios con IA
                    <ArrowRight size={16} className="ml-1 text-[#ff9404]" />
                  </span>
                </li>
                <li className="flex items-center justify-center">
                  <CheckCircle size={20} className="text-[#ff9404] mr-2" />
                  <span className="flex items-center">
                    Chatbot FitMate
                    <ArrowRight size={16} className="ml-1 text-[#ff9404]" />
                  </span>
                </li>
                <li className="flex items-center justify-center">
                  <CheckCircle size={20} className="text-[#ff9404] mr-2" />
                  <span className="flex items-center">
                    Soporte prioritario
                    <ArrowRight size={16} className="ml-1 text-[#ff9404]" />
                  </span>
                </li>
                <li className="flex items-center justify-center">
                  <CheckCircle size={20} className="text-[#ff9404] mr-2" />
                  <span className="flex items-center">
                    Preparación de recetas
                    <ArrowRight size={16} className="ml-1 text-[#ff9404]" />
                  </span>
                </li>
              </ul>
              <button
                onClick={handleUpgradeToPremium}
                disabled={isLoading || hasSubscription === true}
                className={`w-full py-3 rounded-lg bg-[#ff9404] text-white hover:bg-[#e08503] transition-colors duration-300 ${
                  isLoading || hasSubscription === true ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Activando...' : hasSubscription ? 'Plan Actual' : 'Obtener Premium'}
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default SubscriptionPlans;