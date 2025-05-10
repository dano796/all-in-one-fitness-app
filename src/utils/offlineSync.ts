import { useNotificationStore } from '../store/notificationStore';

interface OfflineData {
  key: string;
  data: any;
  timestamp: number;
}

interface PendingSyncRequest {
  url: string;
  method: string;
  headers: HeadersInit;
  body: any;
  timestamp: number;
}

class OfflineSyncManager {
  private static instance: OfflineSyncManager;
  private offlineData: Map<string, OfflineData> = new Map();
  private pendingSyncRequests: Map<string, PendingSyncRequest> = new Map();
  private isOnline: boolean = navigator.onLine;

  private constructor() {
    this.initializeEventListeners();
    this.loadOfflineData();
    this.loadPendingSyncRequests();
  }

  public static getInstance(): OfflineSyncManager {
    if (!OfflineSyncManager.instance) {
      OfflineSyncManager.instance = new OfflineSyncManager();
    }
    return OfflineSyncManager.instance;
  }

  private initializeEventListeners() {
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }

  private async loadOfflineData() {
    try {
      const storedData = localStorage.getItem('offlineData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        this.offlineData = new Map(Object.entries(parsedData));
        console.log('[OfflineSync] Datos cargados desde localStorage:', parsedData);
      }
    } catch (error) {
      console.error('Error loading offline data:', error);
    }
  }

  private async loadPendingSyncRequests() {
    try {
      const storedRequests = localStorage.getItem('pendingSyncRequests');
      if (storedRequests) {
        const parsedRequests = JSON.parse(storedRequests);
        this.pendingSyncRequests = new Map(Object.entries(parsedRequests));
        console.log('[OfflineSync] Peticiones pendientes cargadas:', parsedRequests);
      }
    } catch (error) {
      console.error('Error loading pending sync requests:', error);
    }
  }

  private async saveOfflineData() {
    try {
      const dataToStore = Object.fromEntries(this.offlineData);
      localStorage.setItem('offlineData', JSON.stringify(dataToStore));
    } catch (error) {
      console.error('Error saving offline data:', error);
    }
  }

  private async savePendingSyncRequests() {
    try {
      const requestsToStore = Object.fromEntries(this.pendingSyncRequests);
      localStorage.setItem('pendingSyncRequests', JSON.stringify(requestsToStore));
    } catch (error) {
      console.error('Error saving pending sync requests:', error);
    }
  }

  private handleOnline() {
    console.log('[OfflineSync] Conexión recuperada, sincronizando datos...');
    this.isOnline = true;
    
    // Mostrar notificación
    this.showNotification(
      '✅ Conexión restaurada',
      'Estás en línea. Sincronizando datos guardados localmente...',
      'success'
    );
    
    // Iniciar sincronización
    this.syncData();
  }

  private handleOffline() {
    console.log('[OfflineSync] Conexión perdida, entrando en modo offline');
    this.isOnline = false;
    
    // Mostrar notificación
    this.showNotification(
      '⚠️ Modo Offline',
      'Estás trabajando sin conexión. Los cambios se sincronizarán cuando vuelvas a estar en línea.',
      'warning'
    );
  }

  private showNotification(title: string, message: string, type: 'success' | 'warning' | 'error' | 'info') {
    // Usar setTimeout para permitir que el store se inicialice correctamente
    setTimeout(() => {
      try {
        // Asegurar que el store exista antes de usarlo
        if (useNotificationStore && typeof useNotificationStore.getState === 'function') {
          const { addNotification } = useNotificationStore.getState();
          if (typeof addNotification === 'function') {
            addNotification(title, message, type);
          }
        }
      } catch (error) {
        console.error('[OfflineSync] Error mostrando notificación:', error);
      }
    }, 500);
  }

  public async storeData(key: string, data: any) {
    const offlineData: OfflineData = {
      key,
      data,
      timestamp: Date.now()
    };

    this.offlineData.set(key, offlineData);
    await this.saveOfflineData();

    if (this.isOnline) {
      await this.syncData();
    } else {
      // Notificar al service worker para que guarde los datos
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'STORE_OFFLINE_DATA',
          key,
          data
        });
      }
    }
  }

  public async storePendingRequest(key: string, request: PendingSyncRequest) {
    this.pendingSyncRequests.set(key, request);
    await this.savePendingSyncRequests();
    
    console.log(`[OfflineSync] Petición guardada para sincronización posterior: ${key}`);
  }

  public async getData(key: string): Promise<any | null> {
    const offlineData = this.offlineData.get(key);
    return offlineData ? offlineData.data : null;
  }

  private async syncData() {
    if (!this.isOnline) return;

    let notificationStore;
    try {
      notificationStore = useNotificationStore.getState();
    } catch (error) {
      console.error('[OfflineSync] Error obteniendo el store de notificaciones:', error);
      // Continuar sin mostrar notificaciones
    }

    const syncPromises: Promise<void>[] = [];
    const failedSyncs: string[] = [];
    let syncSuccessCount = 0;

    // Primero sincronizamos las peticiones pendientes
    if (this.pendingSyncRequests.size > 0) {
      console.log('[OfflineSync] Sincronizando peticiones pendientes:', this.pendingSyncRequests.size);
      
      for (const [key, request] of this.pendingSyncRequests) {
        try {
          const response = await fetch(request.url, {
            method: request.method,
            headers: {
              'Content-Type': 'application/json',
              ...request.headers,
            },
            body: JSON.stringify(request.body),
          });

          if (response.ok) {
            console.log(`[OfflineSync] Petición sincronizada con éxito: ${key}`);
            this.pendingSyncRequests.delete(key);
            syncSuccessCount++;
            syncPromises.push(Promise.resolve());
          } else {
            console.error(`[OfflineSync] Error al sincronizar petición ${key}: ${response.status} ${response.statusText}`);
            failedSyncs.push(key);
            syncPromises.push(Promise.reject(new Error(`HTTP error: ${response.status}`)));
          }
        } catch (error) {
          console.error(`[OfflineSync] Error sincronizando petición ${key}:`, error);
          failedSyncs.push(key);
          syncPromises.push(Promise.reject(error));
        }
      }
      
      // Guardar el estado actualizado de peticiones pendientes
      await this.savePendingSyncRequests();
    }

    // Sincronizar datos normales si es necesario
    if (this.offlineData.size > 0) {
      console.log('[OfflineSync] Sincronizando datos:', this.offlineData.size);
      
      for (const [key, offlineData] of this.offlineData) {
        // Solo sincronizamos datos que representan llamadas a la API
        if (key.startsWith('http')) {
          try {
            const response = await fetch(key, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(offlineData.data),
            });

            if (response.ok) {
              console.log(`[OfflineSync] Datos sincronizados con éxito: ${key}`);
              syncSuccessCount++;
              syncPromises.push(Promise.resolve());
            } else {
              console.error(`[OfflineSync] Error al sincronizar datos ${key}: ${response.status} ${response.statusText}`);
              failedSyncs.push(key);
              syncPromises.push(Promise.reject(new Error(`HTTP error: ${response.status}`)));
            }
          } catch (error) {
            console.error(`[OfflineSync] Error sincronizando datos ${key}:`, error);
            failedSyncs.push(key);
            syncPromises.push(Promise.reject(error));
          }
        }
      }
    }

    try {
      await Promise.allSettled(syncPromises);
      
      // Mostrar notificación apropiada basada en resultados
      if (notificationStore && notificationStore.addNotification) {
        if (syncSuccessCount > 0) {
          if (failedSyncs.length === 0) {
            notificationStore.addNotification(
              '✅ Sincronización Completada',
              `Se han sincronizado ${syncSuccessCount} elementos correctamente.`,
              'success'
            );
          } else {
            notificationStore.addNotification(
              '⚠️ Sincronización Parcial',
              `Se sincronizaron ${syncSuccessCount} elementos, pero ${failedSyncs.length} fallaron.`,
              'warning'
            );
          }
        } else if (failedSyncs.length > 0) {
          notificationStore.addNotification(
            '❌ Error de Sincronización',
            'No se pudieron sincronizar los datos. Se intentará nuevamente más tarde.',
            'error'
          );
        }
      }
    } catch (error) {
      console.error('[OfflineSync] Error general durante la sincronización:', error);
      if (notificationStore && notificationStore.addNotification) {
        notificationStore.addNotification(
          '❌ Error de Sincronización',
          'Ocurrió un error durante la sincronización. Se intentará nuevamente más tarde.',
          'error'
        );
      }
    }
  }

  public isDataOffline(key: string): boolean {
    return this.offlineData.has(key);
  }

  public getOfflineDataCount(): number {
    return this.offlineData.size;
  }

  public getPendingSyncRequestsCount(): number {
    return this.pendingSyncRequests.size;
  }
}

export const offlineSyncManager = OfflineSyncManager.getInstance(); 