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
  routeType: string; // Para identificar el tipo de ruta (exercises, food, water, etc.)
  retryCount: number; // Para intentos de sincronización
}

// Definir tipos de rutas soportadas para mejor organización
type RouteType = 'exercises' | 'food' | 'water' | 'profile' | 'goals' | 'workouts' | 'progress' | 'other';

class OfflineSyncManager {
  private static instance: OfflineSyncManager;
  private offlineData: Map<string, OfflineData> = new Map();
  private pendingSyncRequests: Map<string, PendingSyncRequest> = new Map();
  private isOnline: boolean = navigator.onLine;
  private isSyncing: boolean = false;
  private offlineRoutes: Set<string> = new Set([
    '/api/exercises',
    '/api/foods',
    '/api/water',
    '/api/profile',
    '/api/goals',
    '/api/workouts',
    '/api/progress'
  ]);
  
  // Cache para datos frecuentemente usados
  private routeDataCache: Map<string, {data: any, expiresAt: number}> = new Map();
  private cacheExpiryTime = 30 * 60 * 1000; // 30 minutos

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
    
    // Verificar periódicamente la conexión y sincronizar si es necesario
    setInterval(() => {
      if (navigator.onLine && !this.isOnline) {
        this.handleOnline();
      } else if (!navigator.onLine && this.isOnline) {
        this.handleOffline();
      }
      
      // Intentar sincronizar periódicamente si hay solicitudes pendientes
      if (navigator.onLine && this.pendingSyncRequests.size > 0 && !this.isSyncing) {
        this.syncData();
      }
    }, 30000); // Cada 30 segundos
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
    if (this.isOnline) return; // Evitar doble procesamiento
    
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
    if (!this.isOnline) return; // Evitar doble procesamiento
    
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
    
    // Actualizar la caché
    this.routeDataCache.set(key, {
      data,
      expiresAt: Date.now() + this.cacheExpiryTime
    });

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

  public async storePendingRequest(key: string, request: Omit<PendingSyncRequest, 'retryCount' | 'routeType'>) {
    // Determinar el tipo de ruta
    let routeType: RouteType = 'other';
    
    if (request.url.includes('/exercises')) routeType = 'exercises';
    else if (request.url.includes('/foods')) routeType = 'food';
    else if (request.url.includes('/water')) routeType = 'water';
    else if (request.url.includes('/profile')) routeType = 'profile';
    else if (request.url.includes('/goals')) routeType = 'goals';
    else if (request.url.includes('/workouts')) routeType = 'workouts';
    else if (request.url.includes('/progress')) routeType = 'progress';

    const fullRequest: PendingSyncRequest = {
      ...request,
      routeType,
      retryCount: 0
    };
    
    this.pendingSyncRequests.set(key, fullRequest);
    await this.savePendingSyncRequests();
    
    console.log(`[OfflineSync] Petición guardada para sincronización posterior: ${key} (${routeType})`);
  }

  public async getData(key: string): Promise<any | null> {
    // Primero verificar en la caché para respuestas rápidas
    const cachedItem = this.routeDataCache.get(key);
    if (cachedItem && cachedItem.expiresAt > Date.now()) {
      return cachedItem.data;
    }
    
    // Si no está en caché o expiró, buscar en offlineData
    const offlineData = this.offlineData.get(key);
    
    if (offlineData) {
      // Actualizar la caché
      this.routeDataCache.set(key, {
        data: offlineData.data,
        expiresAt: Date.now() + this.cacheExpiryTime
      });
      return offlineData.data;
    }
    
    return null;
  }

  public async prefetchRoute(route: string, params: any = {}) {
    // Prefetch de datos para rutas específicas
    if (!this.isOnline) return;
    
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = `${route}${queryParams ? '?' + queryParams : ''}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        await this.storeData(url, data);
        console.log(`[OfflineSync] Prefetch completado para ruta: ${url}`);
      }
    } catch (error) {
      console.error(`[OfflineSync] Error en prefetch de ruta ${route}:`, error);
    }
  }

  private async syncData() {
    if (!this.isOnline || this.isSyncing) return;
    this.isSyncing = true;

    let notificationStore;
    try {
      notificationStore = useNotificationStore.getState();
    } catch (error) {
      console.error('[OfflineSync] Error obteniendo el store de notificaciones:', error);
    }

    const syncPromises: Promise<void>[] = [];
    const failedSyncs: string[] = [];
    let syncSuccessCount = 0;

    try {
      // Agrupar las solicitudes por tipo para sincronizar en orden correcto
      const requestsByType: Record<RouteType, PendingSyncRequest[]> = {
        profile: [],
        goals: [],
        exercises: [],
        food: [],
        water: [],
        workouts: [],
        progress: [],
        other: []
      };
      
      // Organizar solicitudes por tipo
      for (const [key, request] of this.pendingSyncRequests) {
        requestsByType[request.routeType as RouteType].push({...request, __key: key});
      }
      
      // Orden de sincronización:
      // 1. Datos de perfil primero (son la base)
      // 2. Objetivos y ejercicios
      // 3. Comidas, agua y entrenamientos
      // 4. Progreso (que depende de los anteriores)
      // 5. Otros
      const syncOrder: RouteType[] = ['profile', 'goals', 'exercises', 'food', 'water', 'workouts', 'progress', 'other'];
      
      for (const routeType of syncOrder) {
        const requests = requestsByType[routeType];
        if (requests.length === 0) continue;
        
        console.log(`[OfflineSync] Sincronizando ${requests.length} peticiones de tipo: ${routeType}`);
        
        // Sincronizar cada solicitud de este tipo
        for (const request of requests) {
          const key = (request as any).__key;
          
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
            } else {
              console.error(`[OfflineSync] Error al sincronizar petición ${key}: ${response.status} ${response.statusText}`);
              
              // Incrementar contador de reintentos
              const updatedRequest = {...request};
              updatedRequest.retryCount += 1;
              
              // Si superó el límite de reintentos, marcar como fallido definitivamente
              if (updatedRequest.retryCount > 5) {
                failedSyncs.push(key);
                this.pendingSyncRequests.delete(key);
              } else {
                this.pendingSyncRequests.set(key, updatedRequest);
              }
            }
          } catch (error) {
            console.error(`[OfflineSync] Error sincronizando petición ${key}:`, error);
            
            // Incrementar contador de reintentos
            const updatedRequest = {...request};
            updatedRequest.retryCount += 1;
            
            if (updatedRequest.retryCount > 5) {
              failedSyncs.push(key);
              this.pendingSyncRequests.delete(key);
            } else {
              this.pendingSyncRequests.set(key, updatedRequest);
            }
          }
        }
      }
      
      // Guardar el estado actualizado de peticiones pendientes
      await this.savePendingSyncRequests();
      
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
    } finally {
      this.isSyncing = false;
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
  
  public registerOfflineRoute(route: string): void {
    this.offlineRoutes.add(route);
  }
  
  public isRouteOfflineSupported(route: string): boolean {
    // Comprobar si alguna ruta registrada coincide con la ruta solicitada
    for (const offlineRoute of this.offlineRoutes) {
      if (route.includes(offlineRoute)) {
        return true;
      }
    }
    return false;
  }
  
  public clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.routeDataCache.entries()) {
      if (value.expiresAt < now) {
        this.routeDataCache.delete(key);
      }
    }
  }
}

export const offlineSyncManager = OfflineSyncManager.getInstance(); 