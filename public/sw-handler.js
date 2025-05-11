/**
 * Manejador del Service Worker
 * Este script se encarga de registrar y gestionar el service worker
 * para la aplicación All-In-One Fitness App
 */

// Estado de la aplicación
const appState = {
  isOnline: navigator.onLine,
  serviceWorkerRegistered: false,
  pendingChanges: 0,
  lastSyncTime: null,
  statusBarTimeoutId: null // Para gestionar el timeout
};

// Elementos UI para mostrar el estado de conexión
let statusBar = null;
let syncButton = null;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  initializeUI();
  registerServiceWorker();
  setupNetworkListeners();
});

// Inicializar elementos de UI
function initializeUI() {
  // Crear barra de estado si no existe
  if (!document.getElementById('connection-status')) {
    statusBar = document.createElement('div');
    statusBar.id = 'connection-status';
    statusBar.style.position = 'fixed';
    statusBar.style.bottom = '0';
    statusBar.style.left = '0';
    statusBar.style.right = '0';
    statusBar.style.padding = '8px 16px';
    statusBar.style.fontSize = '14px';
    statusBar.style.textAlign = 'center';
    statusBar.style.zIndex = '9999';
    statusBar.style.transition = 'all 0.3s ease';
    statusBar.style.transform = 'translateY(100%)'; // Oculto por defecto
    statusBar.style.opacity = '0'; // Asegurar que esté oculto
    
    document.body.appendChild(statusBar);
  } else {
    statusBar = document.getElementById('connection-status');
    statusBar.style.transform = 'translateY(100%)'; // Asegurar que esté oculto
    statusBar.style.opacity = '0';
  }
  
  // Crear botón de sincronización manual
  if (!document.getElementById('sync-button')) {
    syncButton = document.createElement('button');
    syncButton.id = 'sync-button';
    syncButton.textContent = 'Sincronizar datos';
    syncButton.style.position = 'fixed';
    syncButton.style.bottom = '40px';
    syncButton.style.right = '20px';
    syncButton.style.padding = '8px 16px';
    syncButton.style.borderRadius = '20px';
    syncButton.style.backgroundColor = '#282c3c';
    syncButton.style.color = 'white';
    syncButton.style.border = 'none';
    syncButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    syncButton.style.cursor = 'pointer';
    syncButton.style.display = 'none';
    syncButton.style.zIndex = '9999';
    
    syncButton.addEventListener('click', () => {
      if (appState.serviceWorkerRegistered) {
        triggerSync();
      }
    });
    
    document.body.appendChild(syncButton);
  } else {
    syncButton = document.getElementById('sync-button');
  }
  
  updateConnectionStatus();
}

// Registrar el Service Worker
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        //console.log('Service Worker registrado con éxito:', registration.scope);
        appState.serviceWorkerRegistered = true;
        
        // Comprobar si hay actualizaciones
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateNotification();
            }
          });
        });
        
        // Establecer comunicación con el Service Worker
        setupServiceWorkerMessaging();
      })
      .catch(error => {
        console.error('Error al registrar el Service Worker:', error);
        appState.serviceWorkerRegistered = false;
        updateConnectionStatus();
      });
  } else {
    console.warn('Service Worker no es compatible con este navegador');
    updateConnectionStatus();
  }
}

// Configurar listeners de red
function setupNetworkListeners() {
  window.addEventListener('online', () => {
    appState.isOnline = true;
    updateConnectionStatus();
    showTemporaryStatus('🟢 Conexión restablecida');
    triggerSync();
  });
  
  window.addEventListener('offline', () => {
    appState.isOnline = false;
    updateConnectionStatus();
    showTemporaryStatus('🔴 Conexión perdida - Trabajando offline');
  });
  
  // Comprobar si hay cambios al volver a la pestaña
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && appState.isOnline) {
      checkForPendingChanges();
    }
  });
}

// Configurar mensajería con el Service Worker
function setupServiceWorkerMessaging() {
  navigator.serviceWorker.addEventListener('message', event => {
    const message = event.data;
    
    switch (message.type) {
      case 'SYNC_COMPLETED':
        handleSyncCompleted(message);
        break;
      case 'USING_CACHED_DATA':
        showCachedDataNotification();
        break;
      case 'API_DATA_UPDATED':
        // Los datos se han actualizado en segundo plano
        break;
      case 'PENDING_CHANGES_COUNT':
        updatePendingChangesCount(message.count);
        break;
      default:
        console.log('Mensaje no reconocido del Service Worker:', message);
    }
  });
}

// Actualizar estado de conexión en la UI
function updateConnectionStatus() {
  if (!statusBar) return;
  
  // Cancelar cualquier timeout previo para evitar problemas
  if (appState.statusBarTimeoutId) {
    clearTimeout(appState.statusBarTimeoutId);
  }
  
  if (appState.isOnline) {
    statusBar.textContent = 'Conectado';
    statusBar.style.backgroundColor = '#4CAF50';
    statusBar.style.color = 'white';
    
    // Mostrar/ocultar el botón de sincronización
    if (appState.pendingChanges > 0) {
      syncButton.style.display = 'block';
      syncButton.textContent = `Sincronizar datos (${appState.pendingChanges})`;
    } else {
      syncButton.style.display = 'none';
    }
  } else {
    statusBar.textContent = 'Modo Offline - Los cambios se sincronizarán cuando vuelvas a estar en línea';
    statusBar.style.backgroundColor = '#282c3c';
    statusBar.style.color = 'white';
    syncButton.style.display = 'none';
  }
  
  // Mostrar inmediatamente
  statusBar.style.opacity = '1';
  statusBar.style.transform = 'translateY(0)';
  
  // Programar para ocultar después de un tiempo
  appState.statusBarTimeoutId = setTimeout(() => {
    statusBar.style.opacity = '0';
    statusBar.style.transform = 'translateY(100%)';
  }, 3000);
  
  // Interacciones con el ratón
  statusBar.onmouseover = () => { 
    clearTimeout(appState.statusBarTimeoutId);
    statusBar.style.opacity = '1';
    statusBar.style.transform = 'translateY(0)';
  };
  
  statusBar.onmouseout = () => { 
    appState.statusBarTimeoutId = setTimeout(() => {
      statusBar.style.opacity = '0';
      statusBar.style.transform = 'translateY(100%)';
    }, 1000);
  };
}

// Disparar sincronización manual o a través de sync API
function triggerSync() {
  if (appState.isOnline && appState.serviceWorkerRegistered) {
    if ('SyncManager' in window) {
      navigator.serviceWorker.ready
        .then(registration => {
          return registration.sync.register('sync-pending-requests');
        })
        .then(() => {
          console.log('Sincronización background registrada');
        })
        .catch(error => {
          console.error('Error al registrar sincronización background:', error);
          // Fallback - pedir al SW que sincronice
          sendMessageToSW({ type: 'TRIGGER_SYNC' });
        });
    } else {
      // No hay soporte para Sync API, enviar mensaje al SW
      sendMessageToSW({ type: 'TRIGGER_SYNC' });
    }
  }
}

// Enviar mensaje al Service Worker
function sendMessageToSW(message) {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(message);
  }
}

// Manejar sincronización completada
function handleSyncCompleted(message) {
  appState.lastSyncTime = message.timestamp;
  checkForPendingChanges();
  
  showNotification('Sincronización completada', 'Tus datos están actualizados');
}

// Mostrar notificación de datos en caché
function showCachedDataNotification() {
  showToast('Estás viendo datos almacenados en caché', 3000);
}

// Actualizar contador de cambios pendientes
function updatePendingChangesCount(count) {
  appState.pendingChanges = count;
  updateConnectionStatus();
}

// Comprobar si hay cambios pendientes
function checkForPendingChanges() {
  sendMessageToSW({ type: 'GET_PENDING_CHANGES_COUNT' });
}

// Mostrar notificación de actualización disponible
function showUpdateNotification() {
  const updateNotification = document.createElement('div');
  updateNotification.classList.add('update-notification');
  updateNotification.innerHTML = `
    <div style="background-color: #282c3c; color: white; padding: 16px; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: space-between; max-width: 400px; margin: 16px auto;">
      <span>Hay una nueva versión disponible.</span>
      <button id="update-app-button" style="background-color: white; color: #282c3c; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Actualizar</button>
    </div>
  `;
  
  document.body.appendChild(updateNotification);
  
  document.getElementById('update-app-button').addEventListener('click', () => {
    // Recargar para activar el nuevo service worker
    window.location.reload();
  });
}

// Mostrar un toast informativo
function showToast(message, duration = 3000) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.position = 'fixed';
  toast.style.bottom = '80px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.backgroundColor = 'rgba(33, 33, 33, 0.9)';
  toast.style.color = 'white';
  toast.style.padding = '10px 20px';
  toast.style.borderRadius = '20px';
  toast.style.zIndex = '10000';
  toast.style.opacity = '0';
  toast.style.transition = 'opacity 0.3s ease-in-out';
  
  document.body.appendChild(toast);
  
  // Mostrar con animación
  setTimeout(() => {
    toast.style.opacity = '1';
  }, 10);
  
  // Ocultar y eliminar después de duration
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, duration);
}

// Mostrar notificación nativa si está soportado
function showNotification(title, body) {
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: body,
        icon: '/favicon-96x96.png'
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, {
            body: body,
            icon: '/favicon-96x96.png'
          });
        }
      });
    }
  } else {
    // Fallback a toast
    showToast(`${title}: ${body}`);
  }
}

// Guardar datos para uso offline
window.saveOfflineData = function(key, data) {
  if (!appState.serviceWorkerRegistered) return;
  
  sendMessageToSW({
    type: 'STORE_OFFLINE_DATA',
    key: key,
    data: data
  });
};

// Registrar solicitud pendiente para sincronización
window.registerPendingRequest = function(url, method, headers, body) {
  if (!appState.serviceWorkerRegistered) return;
  
  sendMessageToSW({
    type: 'STORE_PENDING_REQUEST',
    url: url,
    method: method,
    headers: headers,
    body: body
  });
  
  appState.pendingChanges++;
  updateConnectionStatus();
};

// Función de ayuda para hacer fetch con soporte offline
window.fetchWithOfflineSupport = async function(url, options = {}) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error en fetchWithOfflineSupport:', error);
    
    if (!navigator.onLine) {
      // Si estamos offline, registrar para sincronización posterior
      if (options.method && options.method !== 'GET') {
        window.registerPendingRequest(
          url,
          options.method,
          options.headers,
          options.body
        );
        
        showToast('Cambios guardados localmente, se sincronizarán cuando vuelvas a estar en línea');
        
        // Devolver respuesta simulada exitosa
        return Promise.resolve({
          success: true,
          offline: true,
          message: 'Datos guardados localmente para sincronización posterior'
        });
      }
    }
    
    return Promise.reject(error);
  }
};

// Función para mostrar un estado temporal en el centro de la pantalla (reemplaza las barras de estado)
function showTemporaryStatus(message) {
  // Si la aplicación acaba de cargar, no mostrar la notificación inicial de "Conectado"
  if (message === '🟢 Conexión restablecida' && !appState.hasLoadedBefore) {
    appState.hasLoadedBefore = true;
    return;
  }
  
  // Ocultar barra de estado si existe
  if (statusBar) {
    statusBar.style.opacity = '0';
    statusBar.style.transform = 'translateY(100%)';
  }
  
  // Crear elemento para el mensaje temporal
  const tempStatus = document.createElement('div');
  tempStatus.textContent = message;
  tempStatus.style.position = 'fixed';
  tempStatus.style.top = '10%';
  tempStatus.style.left = '50%';
  tempStatus.style.transform = 'translateX(-50%)';
  tempStatus.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  tempStatus.style.color = 'white';
  tempStatus.style.padding = '10px 20px';
  tempStatus.style.borderRadius = '20px';
  tempStatus.style.zIndex = '10000';
  tempStatus.style.opacity = '0';
  tempStatus.style.transition = 'opacity 0.3s ease-in-out';
  
  document.body.appendChild(tempStatus);
  
  // Mostrar con animación
  setTimeout(() => {
    tempStatus.style.opacity = '1';
  }, 10);
  
  // Ocultar y eliminar después de 3 segundos
  setTimeout(() => {
    tempStatus.style.opacity = '0';
    setTimeout(() => {
      if (tempStatus.parentNode) {
        document.body.removeChild(tempStatus);
      }
    }, 300);
  }, 3000);
} 