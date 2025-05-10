import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function ServiceWorkerUpdate() {
  const [showUpdateButton, setShowUpdateButton] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        // Verificar actualizaciones cada 1 hora
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);

        // Escuchar actualizaciones disponibles
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setShowUpdateButton(true);
              }
            });
          }
        });
      });
    }
  }, []);

  const handleUpdate = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        // Forzar la actualización del service worker
        await navigator.serviceWorker.controller?.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    } catch (error) {
      toast.error('Error al actualizar la aplicación');
      console.error('Error updating service worker:', error);
    }
  };

  if (!showUpdateButton) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={handleUpdate}
        className="bg-[#ff9404] text-white px-4 py-2 rounded-lg shadow-lg hover:bg-[#ff9404] transition-colors duration-200 font-medium"
      >
        Actualizar Aplicación
      </button>
    </div>
  );
} 