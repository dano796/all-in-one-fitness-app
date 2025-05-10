import { useNotificationStore } from '../store/notificationStore';

interface OfflineData {
  key: string;
  data: any;
  timestamp: number;
}

class OfflineSyncManager {
  private static instance: OfflineSyncManager;
  private offlineData: Map<string, OfflineData> = new Map();
  private isOnline: boolean = navigator.onLine;

  private constructor() {
    this.initializeEventListeners();
    this.loadOfflineData();
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

  private async saveOfflineData() {
    try {
      const dataToStore = Object.fromEntries(this.offlineData);
      localStorage.setItem('offlineData', JSON.stringify(dataToStore));
    } catch (error) {
      console.error('Error saving offline data:', error);
    }
  }

  private handleOnline() {
    this.isOnline = true;
    this.syncData();
  }

  private handleOffline() {
    this.isOnline = false;
    const { addNotification } = useNotificationStore.getState();
    addNotification(
      '⚠️ Modo Offline',
      'Estás trabajando sin conexión. Los cambios se sincronizarán cuando vuelvas a estar en línea.',
      'warning'
    );
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

  public async getData(key: string): Promise<any | null> {
    const offlineData = this.offlineData.get(key);
    return offlineData ? offlineData.data : null;
  }

  private async syncData() {
    if (!this.isOnline) return;

    const { addNotification } = useNotificationStore.getState();
    const syncPromises: Promise<void>[] = [];
    const failedSyncs: string[] = [];

    if (this.offlineData.size > 0) {
      console.log('[OfflineSync] Intentando sincronizar los siguientes datos:');
      for (const [key, offlineData] of this.offlineData) {
        console.log('Clave:', key, 'Datos:', offlineData);
      }
    } else {
      console.log('[OfflineSync] No hay datos pendientes de sincronizar.');
    }

    for (const [key, offlineData] of this.offlineData) {
      try {
        const response = await fetch(key, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(offlineData.data),
        });

        console.log(`[OfflineSync] Respuesta al sincronizar ${key}:`, response.status, response.statusText);

        if (response.ok) {
          this.offlineData.delete(key);
          syncPromises.push(Promise.resolve());
        } else {
          failedSyncs.push(key);
          throw new Error(`Failed to sync data for key: ${key}`);
        }
      } catch (error) {
        console.error(`[OfflineSync] Error sincronizando la clave ${key}:`, error);
        failedSyncs.push(key);
        syncPromises.push(Promise.reject(error));
      }
    }

    try {
      await Promise.all(syncPromises);
      await this.saveOfflineData();
      
      if (this.offlineData.size === 0) {
        addNotification(
          '✅ Sincronización Completada',
          'Todos los datos offline han sido sincronizados correctamente.',
          'success'
        );
      } else if (failedSyncs.length > 0) {
        addNotification(
          '⚠️ Error de Sincronización',
          'Algunos datos no pudieron ser sincronizados. Se intentará nuevamente cuando vuelvas a estar en línea.',
          'error'
        );
      }
    } catch (error) {
      console.error('[OfflineSync] Error general durante la sincronización:', error);
      if (failedSyncs.length > 0) {
        addNotification(
          '⚠️ Error de Sincronización',
          'Algunos datos no pudieron ser sincronizados. Se intentará nuevamente cuando vuelvas a estar en línea.',
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
}

export const offlineSyncManager = OfflineSyncManager.getInstance(); 