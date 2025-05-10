export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registrado con éxito:', registration);
      return registration;
    } catch (error) {
      console.error('Error al registrar el Service Worker:', error);
      throw error;
    }
  } else {
    console.warn('Service Workers no están soportados en este navegador');
  }
};