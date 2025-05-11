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
  routeType: string;
  retryCount: number;
}

// Definir tipos de rutas soportadas para mejor organización
type RouteType = 'exercises' | 'food' | 'water' | 'profile' | 'goals' | 'workouts' | 'progress' | 'other';

class OfflineSyncManager {
  private static instance: OfflineSyncManager;
  private offlineData: Map<string, OfflineData> = new Map();
  private pendingSyncRequests: Map<string, PendingSyncRequest> = new Map();
  private isOnline: boolean = navigator.onLine;
  private isSyncing: boolean = false;
  private isInitialized: boolean = false;
  private offlineRoutes: Set<string> = new Set([
    '/api/exercises',
    '/api/foods',
    '/api/water',
    '/api/profile',
    '/api/goals',
    '/api/workouts',
    '/api/progress',
    '/api/routines',
    '/api/calories',
    '/api/get-calorie-goal'
  ]);
  
  // Cache para datos frecuentemente usados
  private routeDataCache: Map<string, {data: any, expiresAt: number}> = new Map();
  private cacheExpiryTime = 30 * 60 * 1000; // 30 minutos

  private constructor() {
    this.init();
  }

  public static getInstance(): OfflineSyncManager {
    if (!OfflineSyncManager.instance) {
      OfflineSyncManager.instance = new OfflineSyncManager();
    }
    return OfflineSyncManager.instance;
  }

  private async init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    try {
      // Cargar datos guardados
      await this.loadOfflineData();
      await this.loadPendingSyncRequests();
      
      // Inicializar listeners de conexión
      this.initializeEventListeners();
      
      //console.log('[OfflineSync] Inicializado correctamente');
    } catch (error) {
      console.error('[OfflineSync] Error durante la inicialización:', error);
    }
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
      
      // Limpiar caché expirada
      this.clearExpiredCache();
    }, 30000); // Cada 30 segundos
  }

  private async loadOfflineData() {
    try {
      const storedData = localStorage.getItem('offlineData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        this.offlineData = new Map(Object.entries(parsedData));
        //console.log('[OfflineSync] Datos cargados desde localStorage:', this.offlineData.size, 'elementos');
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
        //console.log('[OfflineSync] Peticiones pendientes cargadas:', this.pendingSyncRequests.size, 'elementos');
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
    //console.log('[OfflineSync] Conexión restablecida');
    this.isOnline = true;
    
    if (this.pendingSyncRequests.size > 0) {
      //console.log(`[OfflineSync] Intentando sincronizar ${this.pendingSyncRequests.size} peticiones pendientes`);
      this.syncData();
    }
  }

  private handleOffline() {
    //console.log('[OfflineSync] Conexión perdida');
    this.isOnline = false;
  }

  private showNotification(title: string, message: string, type: 'success' | 'warning' | 'error' | 'info') {
    try {
      const notificationStore = useNotificationStore.getState();
      if (notificationStore && notificationStore.addNotification) {
        notificationStore.addNotification(title, message, type);
      }
    } catch (error) {
      console.error('[OfflineSync] Error mostrando notificación:', error);
    }
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
    }
  }

  public async storePendingRequest(key: string, request: Omit<PendingSyncRequest, 'retryCount' | 'routeType'>) {
    try {
      // Determinar el tipo de ruta
      let routeType: RouteType = 'other';
      
      if (request.url.includes('/exercises')) routeType = 'exercises';
      else if (request.url.includes('/foods') || request.url.includes('/food')) routeType = 'food';
      else if (request.url.includes('/water')) routeType = 'water';
      else if (request.url.includes('/profile')) routeType = 'profile';
      else if (request.url.includes('/goals')) routeType = 'goals';
      else if (request.url.includes('/workout')) routeType = 'workouts';
      else if (request.url.includes('/progress')) routeType = 'progress';

      const fullRequest: PendingSyncRequest = {
        ...request,
        routeType,
        retryCount: 0
      };
      
      // Guardar la petición
      this.pendingSyncRequests.set(key, fullRequest);
      await this.savePendingSyncRequests();
      
      //console.log(`[OfflineSync] Petición guardada para sincronización posterior: ${key} (${routeType})`);
      return true;
    } catch (error) {
      console.error('[OfflineSync] Error guardando petición pendiente:', error);
      return false;
    }
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
    
    // Si no está en nuestro almacén local, intentar obtenerlo del service worker
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      try {
        const cachedData = await this.requestFromServiceWorker(key);
        if (cachedData) {
          //console.log(`[OfflineSync] Datos obtenidos del SW: ${key}`);
          this.routeDataCache.set(key, {
            data: cachedData,
            expiresAt: Date.now() + this.cacheExpiryTime
          });
          return cachedData;
        }
      } catch (error) {
        //console.error(`[OfflineSync] Error al solicitar datos del SW:`, error);
      }
    }
    
    return null;
  }

  private async requestFromServiceWorker(key: string): Promise<any | null> {
    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      let timeoutId: number | undefined;
      
      // Establecer un timeout por si el service worker no responde
      timeoutId = window.setTimeout(() => {
        messageChannel.port1.close();
        reject(new Error('Timeout al esperar respuesta del Service Worker'));
      }, 5000);
      
      // Configurar el puerto para recibir la respuesta
      messageChannel.port1.onmessage = (event) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data.data);
        }
      };
      
      // Enviar solicitud al service worker
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'GET_CACHED_DATA',
          key
        }, [messageChannel.port2]);
      } else {
        reject(new Error('No hay un service worker controlando esta página'));
      }
    });
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
        //console.log(`[OfflineSync] Prefetch completado para ruta: ${url}`);
      }
    } catch (error) {
      console.error(`[OfflineSync] Error en prefetch de ruta ${route}:`, error);
    }
  }

  public async syncData() {
    if (this.isSyncing) {
      //console.log('[OfflineSync] Ya hay una sincronización en curso, ignorando...');
      return;
    }
    
    if (!navigator.onLine) {
      //console.log('[OfflineSync] No hay conexión, ignorando petición de sincronización');
      return;
    }
    
    //console.log('[OfflineSync] Iniciando sincronización de datos offline');
    this.isSyncing = true;
    
    let syncSuccessCount = 0;
    let failedCount = 0;

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
      
      // Copiar las peticiones pendientes para evitar problemas de modificación durante iteración
      const pendingRequests = new Map(this.pendingSyncRequests);
      //console.log(`[OfflineSync] Procesando ${pendingRequests.size} peticiones pendientes`);
      
      // Organizar solicitudes por tipo
      for (const [key, request] of pendingRequests.entries()) {
        requestsByType[request.routeType as RouteType].push({...request, __key: key} as any);
      }
      
      // Orden de sincronización:
      const syncOrder: RouteType[] = ['profile', 'goals', 'exercises', 'food', 'water', 'workouts', 'progress', 'other'];
      
      for (const routeType of syncOrder) {
        const requests = requestsByType[routeType];
        if (requests.length === 0) continue;
        
        //console.log(`[OfflineSync] Sincronizando ${requests.length} peticiones de tipo: ${routeType}`);
        
        // Sincronizar cada solicitud de este tipo
        for (const request of requests) {
          if (!navigator.onLine) {
            //console.log('[OfflineSync] Conexión perdida durante sincronización, abortando...');
            break;
          }
          
          const key = (request as any).__key;
          if (!key) continue;
          
          try {
            //console.log(`[OfflineSync] Sincronizando petición: ${key}`);
            const response = await fetch(request.url, {
              method: request.method,
              headers: {
                'Content-Type': 'application/json',
                ...request.headers,
              },
              body: request.body ? JSON.stringify(request.body) : undefined,
            });

            if (response.ok) {
              //console.log(`[OfflineSync] Petición sincronizada con éxito: ${key}`);
              this.pendingSyncRequests.delete(key);
              syncSuccessCount++;
            } else {
              //console.error(`[OfflineSync] Error al sincronizar petición ${key}: ${response.status} ${response.statusText}`);
              failedCount++;
              
              // Incrementar contador de reintentos
              const updatedRequest = {...request};
              updatedRequest.retryCount = (updatedRequest.retryCount || 0) + 1;
              
              // Si superó el límite de reintentos, eliminar la petición
              if (updatedRequest.retryCount > 3) {
                //console.warn(`[OfflineSync] Petición ${key} ha excedido el número máximo de reintentos, eliminando...`);
                this.pendingSyncRequests.delete(key);
              } else {
                this.pendingSyncRequests.set(key, updatedRequest);
              }
            }
          } catch (error) {
            console.error(`[OfflineSync] Error sincronizando petición ${key}:`, error);
            failedCount++;
            
            // Incrementar contador de reintentos
            const currentRequest = this.pendingSyncRequests.get(key);
            if (currentRequest) {
              const updatedRequest = {...currentRequest};
              updatedRequest.retryCount = (updatedRequest.retryCount || 0) + 1;
              
              // Si superó el límite de reintentos, eliminar la petición
              if (updatedRequest.retryCount > 3) {
                console.warn(`[OfflineSync] Petición ${key} ha excedido el número máximo de reintentos, eliminando...`);
                this.pendingSyncRequests.delete(key);
              } else {
                this.pendingSyncRequests.set(key, updatedRequest);
              }
            }
          }
        }
      }
      
      // Guardar el estado actualizado de peticiones pendientes
      await this.savePendingSyncRequests();
      
      // Mostrar notificación apropiada basada en resultados
      if (syncSuccessCount > 0 && failedCount === 0) {
        this.showNotification(
          '✅ Sincronización Completada',
          `Se han sincronizado ${syncSuccessCount} cambios correctamente.`,
          'success'
        );
      } else if (syncSuccessCount > 0 && failedCount > 0) {
        this.showNotification(
          '⚠️ Sincronización Parcial',
          `Se sincronizaron ${syncSuccessCount} cambios, pero ${failedCount} fallaron.`,
          'warning'
        );
      } else if (syncSuccessCount === 0 && failedCount > 0) {
        this.showNotification(
          '❌ Error de Sincronización',
          'No se pudieron sincronizar los datos. Se intentará más tarde.',
          'error'
        );
      }
      
      //console.log(`[OfflineSync] Sincronización completada: ${syncSuccessCount} exitosos, ${failedCount} fallidos`);
    } catch (error) {
      console.error('[OfflineSync] Error general durante la sincronización:', error);
      this.showNotification(
        '❌ Error de Sincronización',
        'Ocurrió un error durante la sincronización. Se intentará más tarde.',
        'error'
      );
    } finally {
      this.isSyncing = false;
      //console.log('[OfflineSync] Estado de sincronización finalizado');
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
  
  // Método para forzar la sincronización manual
  public async forceSyncData(): Promise<void> {
    if (this.isSyncing) {
      this.showNotification(
        '⏳ Sincronización en Proceso',
        'Ya hay una sincronización en curso. Por favor espera.',
        'info'
      );
      return;
    }
    
    this.showNotification(
      '🔄 Sincronización Iniciada',
      'Iniciando sincronización manual de datos...',
      'info'
    );
    
    await this.syncData();
  }
}

export const offlineSyncManager = OfflineSyncManager.getInstance(); 