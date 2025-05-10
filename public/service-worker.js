const CACHE_NAME = 'all-in-one-fitness-v2';
const DATA_CACHE_NAME = 'all-in-one-fitness-data-v2';
const PENDING_REQUESTS_STORE = 'all-in-one-fitness-pending-v2';

// Rutas a cachear para soporte offline inmediato
const urlsToCache = [
  '/',
  '/index.html',
  '/web-app-manifest-192x192.png',
  '/web-app-manifest-512x512.png',
  '/manifest.json',
  '/favicon-96x96.png',
  '/favicon.ico',
  '/favicon.svg',
  '/login',
  '/register',
  '/dashboard',
  '/exercises',
  '/food',
  '/water',
  '/progress',
  '/workouts',
  '/profile',
  '/goals',
  '/static/js/main.bundle.js',
  '/static/js/vendors.bundle.js',
  '/static/css/main.css',
];

// Rutas de API que serán manejadas con una estrategia diferente
const apiRoutes = [
  '/api/exercises',
  '/api/foods',
  '/api/water',
  '/api/profile',
  '/api/goals',
  '/api/workouts',
  '/api/progress'
];

// Instalación del service worker - ahora con precacheo ampliado
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Cache de recursos abierto - precacheando archivos...');
        return cache.addAll(urlsToCache);
      }),
      caches.open(DATA_CACHE_NAME).then((cache) => {
        console.log('Cache de datos abierto');
        return cache;
      })
    ]).then(() => self.skipWaiting())
  );
});

// Activación del service worker con limpieza de cachés obsoletos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== CACHE_NAME && 
            cacheName !== DATA_CACHE_NAME && 
            cacheName !== PENDING_REQUESTS_STORE
          ) {
            console.log('Eliminando cache antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activado y controlando la aplicación');
      return self.clients.claim();
    })
  );
});

// Escuchar mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Manejar datos offline
  if (event.data && event.data.type === 'STORE_OFFLINE_DATA') {
    event.waitUntil(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        console.log(`[SW] Guardando datos offline para: ${event.data.key}`);
        return cache.put(
          new Request(event.data.key),
          new Response(JSON.stringify(event.data.data), {
            headers: { 'Content-Type': 'application/json' }
          })
        );
      })
    );
  }
  
  // Registrar solicitud pendiente
  if (event.data && event.data.type === 'STORE_PENDING_REQUEST') {
    event.waitUntil(
      caches.open(PENDING_REQUESTS_STORE).then((cache) => {
        const requestKey = `${event.data.method}-${event.data.url}-${Date.now()}`;
        console.log(`[SW] Guardando solicitud pendiente: ${requestKey}`);
        return cache.put(
          new Request(requestKey),
          new Response(JSON.stringify({
            url: event.data.url,
            method: event.data.method,
            headers: event.data.headers,
            body: event.data.body,
            timestamp: Date.now()
          }), {
            headers: { 'Content-Type': 'application/json' }
          })
        );
      }).then(() => {
        // Registrar para sincronización background cuando sea posible
        if ('SyncManager' in self) {
          return self.registration.sync.register('sync-pending-requests');
        }
      })
    );
  }
});

// Sincronización en segundo plano
self.addEventListener('sync', (event) => {
  console.log(`[SW] Evento de sincronización recibido: ${event.tag}`);
  
  if (event.tag === 'sync-pending-requests') {
    event.waitUntil(syncPendingRequests());
  } else if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// Sincronización periódica
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'sync-content') {
    event.waitUntil(syncAllData());
  }
});

// Función mejorada para sincronizar todos los datos pendientes
async function syncAllData() {
  try {
    await syncPendingRequests();
    await syncData();
    
    // Notificar a los clientes que la sincronización se completó
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETED',
        timestamp: Date.now()
      });
    });
    
    console.log('[SW] Sincronización completa realizada con éxito');
  } catch (error) {
    console.error('[SW] Error en syncAllData:', error);
  }
}

// Procesamiento de solicitudes pendientes
async function syncPendingRequests() {
  try {
    console.log('[SW] Iniciando sincronización de solicitudes pendientes');
    const cache = await caches.open(PENDING_REQUESTS_STORE);
    const requests = await cache.keys();
    
    console.log(`[SW] Encontradas ${requests.length} solicitudes pendientes`);
    
    // Agrupar solicitudes por tipo de ruta
    const requestsByType = {};
    for (const request of requests) {
      const response = await cache.match(request);
      const data = await response.json();
      
      let type = 'other';
      for (const route of apiRoutes) {
        if (data.url.includes(route)) {
          type = route.split('/').pop();
          break;
        }
      }
      
      if (!requestsByType[type]) requestsByType[type] = [];
      requestsByType[type].push({ request, data });
    }
    
    // Orden de procesamiento: profile, goals, exercises, food, water, workouts, progress, other
    const syncOrder = ['profile', 'goals', 'exercises', 'food', 'water', 'workouts', 'progress', 'other'];
    const results = { success: 0, failure: 0 };
    
    for (const type of syncOrder) {
      if (!requestsByType[type]) continue;
      
      console.log(`[SW] Sincronizando ${requestsByType[type].length} solicitudes de tipo '${type}'`);
      
      for (const { request, data } of requestsByType[type]) {
        try {
          const syncResponse = await fetch(data.url, {
            method: data.method,
            headers: {
              'Content-Type': 'application/json',
              ...data.headers
            },
            body: JSON.stringify(data.body)
          });
          
          if (syncResponse.ok) {
            // Si la sincronización fue exitosa, eliminar del caché
            await cache.delete(request);
            results.success++;
            console.log(`[SW] Solicitud sincronizada correctamente: ${data.url}`);
          } else {
            results.failure++;
            console.error(`[SW] Error en sincronización: ${syncResponse.status} ${syncResponse.statusText}`);
          }
        } catch (error) {
          results.failure++;
          console.error(`[SW] Error al sincronizar solicitud:`, error);
        }
      }
    }
    
    console.log(`[SW] Sincronización completada. Éxitos: ${results.success}, Fallos: ${results.failure}`);
    return results;
  } catch (error) {
    console.error('[SW] Error en syncPendingRequests:', error);
    throw error;
  }
}

// Sincronización de datos en caché
async function syncData() {
  try {
    const cache = await caches.open(DATA_CACHE_NAME);
    const keys = await cache.keys();
    const results = { success: 0, failure: 0 };
    
    // Solo procesar keys que son URLs de API
    const apiRequests = keys.filter(request => 
      apiRoutes.some(route => request.url.includes(route))
    );
    
    console.log(`[SW] Sincronizando ${apiRequests.length} datos en caché`);
    
    for (const request of apiRequests) {
      const response = await cache.match(request);
      const data = await response.json();
      
      // Solo sincronizamos datos que tienen marcador especial de sincronización
      if (data && data.__needsSync) {
        try {
          const syncResponse = await fetch(request.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
          });
          
          if (syncResponse.ok) {
            // Actualizar en caché con la versión sincronizada
            const newData = { ...data };
            delete newData.__needsSync;
            
            await cache.put(
              request,
              new Response(JSON.stringify(newData), {
                headers: { 'Content-Type': 'application/json' }
              })
            );
            
            results.success++;
          } else {
            results.failure++;
          }
        } catch (error) {
          console.error('Error al sincronizar datos:', error);
          results.failure++;
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error en syncData:', error);
    throw error;
  }
}

// Estrategia de caché mejorada
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Ignorar solicitudes de chrome-extension
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Para solicitudes de API
  if (apiRoutes.some(route => event.request.url.includes(route))) {
    event.respondWith(handleApiRequest(event.request));
    return;
  }

  // Para navegación y assets estáticos
  if (event.request.mode === 'navigate' || 
      event.request.destination === 'style' || 
      event.request.destination === 'script' || 
      event.request.destination === 'image') {
    
    event.respondWith(
      // Estrategia: Stale-While-Revalidate
      caches.match(event.request).then(cachedResponse => {
        const fetchPromise = fetch(event.request)
          .then(response => {
            // Cachear respuesta válida
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
              });
            }
            return response;
          })
          .catch(error => {
            console.error('[SW] Error fetching:', error);
            return null;
          });

        return cachedResponse || fetchPromise;
      }).catch(() => {
        // Fallback a página offline para navegación
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        return null;
      })
    );
    return;
  }
  
  // Para cualquier otra solicitud
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // No cachear respuestas de error
        if (!response || response.status !== 200) {
          return response;
        }
        
        // Cachear respuesta exitosa
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        // Intentar obtener del caché
        return caches.match(event.request);
      })
  );
});

// Manejador mejorado para solicitudes de API
async function handleApiRequest(request) {
  try {
    // Si es una solicitud GET, intentar primero la red y actualizar caché
    if (request.method === 'GET') {
      try {
        const response = await fetch(request);
        
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          const cache = await caches.open(DATA_CACHE_NAME);
          await cache.put(request, responseToCache);
          return response;
        } else {
          throw new Error('Error en respuesta API');
        }
      } catch (networkError) {
        console.log('[SW] Error de red, buscando en caché:', networkError);
        // Si falla la red, buscar en caché
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Si no hay caché, intentar un fallback genérico
        return handleApiFallback(request);
      }
    } 
    // Para solicitudes de modificación (POST, PUT, DELETE)
    else if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
      try {
        // Intentar hacer la solicitud a la red
        const response = await fetch(request);
        return response;
      } catch (error) {
        console.log('[SW] Error en solicitud de modificación, guardando para sincronización:', error);
        
        // Leer los datos de la solicitud
        const data = await request.clone().json();
        
        // Guardar en el almacén de solicitudes pendientes
        const cache = await caches.open(PENDING_REQUESTS_STORE);
        const requestKey = `${request.method}-${request.url}-${Date.now()}`;
        
        await cache.put(
          new Request(requestKey),
          new Response(JSON.stringify({
            url: request.url,
            method: request.method,
            headers: Object.fromEntries(request.headers.entries()),
            body: data,
            timestamp: Date.now()
          }), {
            headers: { 'Content-Type': 'application/json' }
          })
        );
        
        // Registrar para sincronización background si está disponible
        if ('SyncManager' in self) {
          await self.registration.sync.register('sync-pending-requests');
        }
        
        // Devolver respuesta simulada
        return new Response(JSON.stringify({ 
          success: true, 
          offline: true,
          pendingSync: true,
          message: 'Solicitud guardada para sincronización cuando se restaure la conexión' 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Para otros métodos HTTP
    return fetch(request);
  } catch (error) {
    console.error('[SW] Error en handleApiRequest:', error);
    
    // Último recurso: respuesta de error
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'No se pudo procesar la solicitud en modo offline' 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Función para generar respuestas de fallback para APIs
async function handleApiFallback(request) {
  const url = new URL(request.url);
  
  // Determinar qué tipo de datos está solicitando
  if (url.pathname.includes('/api/exercises')) {
    return new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' }
    });
  } 
  else if (url.pathname.includes('/api/foods')) {
    return new Response(JSON.stringify({
      foods: { Desayuno: [], Almuerzo: [], Merienda: [], Cena: [] },
      currentFoodType: null,
      isToday: true
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  else if (url.pathname.includes('/api/water')) {
    return new Response(JSON.stringify({
      history: [],
      recommendation: 2000
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Fallback genérico para otras APIs
  return new Response(JSON.stringify({ 
    success: false,
    offline: true,
    message: 'No hay datos disponibles offline para esta solicitud'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
