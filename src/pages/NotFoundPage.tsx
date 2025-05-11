import { FC, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import notFoundImage from '../assets/All-In-One-Fitness-App-Not-Found.jpg';
import { useTheme } from '../pages/ThemeContext';
import GalaxyBackground from '../components/GalaxyBackground';

const NotFoundPage: FC = () => {
  const { isDarkMode } = useTheme();
  
  // Ocultar el chatbot cuando se muestra esta página
  useEffect(() => {
    // Crea un estilo para ocultar el chatbot
    const style = document.createElement('style');
    style.id = 'hide-chatbot-style';
    style.innerHTML = `
      /* Oculta el botón flotante y el chat completo */
      .fixed.bottom-4.right-4.z-50,
      .fixed.bottom-6.right-6.z-50 {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    
    // Limpieza al desmontar el componente
    return () => {
      const styleElement = document.getElementById('hide-chatbot-style');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, []);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${
      isDarkMode ? 'bg-[#282c3c]' : 'bg-[#F8F9FA]'
    } p-6 relative overflow-hidden`}>
      <GalaxyBackground />
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-4xl relative z-10 flex flex-col items-center"
      >
        <div className="flex flex-col md:flex-row items-center mb-8 w-full">
          <div className="w-full md:w-1/2 flex justify-center p-4">
            <motion.img 
              src={notFoundImage} 
              alt="404 - Página no encontrada" 
              className="w-full max-w-md h-auto rounded-2xl shadow-2xl object-cover"
              initial={{ scale: 0.95, rotate: -2 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </div>
          
          <div className="w-full md:w-1/2 flex flex-col items-center md:items-start p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className={`text-8xl font-bold ${isDarkMode ? 'text-[#ff9404]' : 'text-gray-800'} mb-2`}>
                Ups!
              </h1>
              
              <h2 className={`text-3xl font-semibold ${isDarkMode ? 'text-[#ff9404]' : 'text-gray-700'} mb-6`}>
                Página no encontrada
              </h2>
              
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-lg mb-8 max-w-md`}>
                Lo sentimos, la página que estás buscando no existe o no está disponible en este momento.
              </p>
              
              <Link 
                to="/dashboard" 
                className="px-8 py-4 bg-gradient-to-br from-[#ff9404] to-[#e08503] text-white text-lg font-medium rounded-xl hover:bg-gradient-to-br hover:from-[#e08503] hover:to-[#ff9404] transition-all duration-300 flex items-center shadow-lg hover:shadow-[0_0_15px_rgba(255,148,4,0.5)] hover:scale-105"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Volver al Dashboard
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage; 