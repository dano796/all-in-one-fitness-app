const CACHE_NAME = 'all-in-one-fitness-v3';
const DATA_CACHE_NAME = 'all-in-one-fitness-data-v3';
const PENDING_REQUESTS_STORE = 'all-in-one-fitness-pending-v3';

// Rutas a cachear para soporte offline inmediato
const urlsToCache = [
  '/',
  '/index.html',
  '/web-app-manifest-192x192.png',
  '/web-app-manifest-512x512.png',
  '/manifest.json',
  '/site.webmanifest',
  '/favicon-96x96.png',
  '/favicon.ico',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/sw-handler.js',
  
  // Páginas públicas
  '/login',
  '/registro',
  '/reset-password',
  '/nosotros',
  '/modulos',
  '/contacto',
  
  // Páginas de dashboard y funcionalidades principales
  '/dashboard',
  '/foodDashboard',
  '/food',
  '/foodsearch',
  '/foodsearchia',
  '/food-quantity-adjust',
  '/comidas',
  '/water',
  '/routines',
  '/routine-details',
  '/ejercicios',
  '/exercises',
  '/progress',
  '/workouts',
  '/profile',
  '/goals',
  '/settings',
  '/nutrition',
  '/workout-history',
  '/exercise-details',
  '/rm-progress',
  
  // Calculadoras y herramientas
  '/calorie-calculator',
  '/onerm-calculator',
  '/search-recipes',
  '/subscription-plans',
  
  // Páginas especiales
  '/offline.html',
  
  // Recursos estáticos
  '/static/js/main.bundle.js',
  '/static/js/vendors.bundle.js',
  '/static/css/main.css',
  '/static/css/vendors.css',
  '/static/fonts/**/*',
  '/static/images/**/*',
  '/static/icons/**/*'
];

// Rutas de API que serán manejadas con una estrategia diferente
const apiRoutes = [
  '/api/exercises',
  '/api/foods',
  '/api/water',
  '/api/profile',
  '/api/goals',
  '/api/workouts',
  '/api/progress',
  '/api/nutrition',
  '/api/auth',
  '/api/settings',
  '/api/routines',
  '/api/calories',
  '/api/recipes',
  '/api/get-calorie-goal',
  '/api/subscription'
];

// Instalación del service worker - ahora con precacheo ampliado
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        //console.log('Cache de recursos abierto - precacheando archivos...');
        return cache.addAll(urlsToCache).catch(error => {
          console.error('Error durante el precacheo:', error);
          // Continuar incluso si algunos archivos no se pudieron cachear
          return Promise.resolve();
        });
      }),
      caches.open(DATA_CACHE_NAME).then((cache) => {
        //console.log('Cache de datos abierto');
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
            //console.log('Eliminando cache antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      //console.log('Service Worker activado y controlando la aplicación');
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
        //console.log(`[SW] Guardando datos offline para: ${event.data.key}`);
        return cache.put(
          new Request(event.data.key),
          new Response(JSON.stringify(event.data.data), {
            headers: { 'Content-Type': 'application/json' }
          })
        );
      })
    );
  }
  
  // Limpiar caché de autenticación durante logout
  if (event.data && event.data.type === 'CLEAR_AUTH_CACHE') {
    event.waitUntil(
      Promise.all([
        // Limpiar caché de datos de autenticación
        caches.open(DATA_CACHE_NAME).then(async (cache) => {
          const keys = await cache.keys();
          const authKeys = keys.filter(key => 
            key.url.includes('/api/login') || 
            key.url.includes('/api/auth') ||
            key.url.includes('/user') ||
            key.url.includes('/session')
          );
          
          return Promise.all(authKeys.map(key => cache.delete(key)));
        }),
        // Limpiar solicitudes pendientes relacionadas con autenticación
        caches.open(PENDING_REQUESTS_STORE).then(async (cache) => {
          const keys = await cache.keys();
          const authKeys = keys.filter(key => 
            key.url.includes('/api/login') || 
            key.url.includes('/api/auth') ||
            key.url.includes('/user') ||
            key.url.includes('/session')
          );
          
          return Promise.all(authKeys.map(key => cache.delete(key)));
        })
      ]).then(() => {
        // Notificar a los clientes que la caché de autenticación ha sido limpiada
        if (event.source) {
          event.source.postMessage({
            type: 'AUTH_CACHE_CLEARED',
            timestamp: Date.now()
          });
        }
      })
    );
  }
  
  // Registrar solicitud pendiente
  if (event.data && event.data.type === 'STORE_PENDING_REQUEST') {
    event.waitUntil(
      caches.open(PENDING_REQUESTS_STORE).then((cache) => {
        const requestKey = `${event.data.method}-${event.data.url}-${Date.now()}`;
        //console.log(`[SW] Guardando solicitud pendiente: ${requestKey}`);
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
  
  // Trigger manual de sincronización
  if (event.data && event.data.type === 'TRIGGER_SYNC') {
    event.waitUntil(syncAllData().then(results => {
      // Enviar los resultados de la sincronización al cliente
      if (event.source) {
        event.source.postMessage({
          type: 'SYNC_COMPLETED',
          timestamp: Date.now(),
          results: results
        });
      }
    }));
  }
  
  // Obtener contador de cambios pendientes
  if (event.data && event.data.type === 'GET_PENDING_CHANGES_COUNT') {
    event.waitUntil(
      getPendingChangesCount().then(count => {
        // Enviar el recuento al cliente
        if (event.source) {
          event.source.postMessage({
            type: 'PENDING_CHANGES_COUNT',
            count: count
          });
        }
      })
    );
  }
  
  // Actualizar contador de cambios pendientes desde cliente
  if (event.data && event.data.type === 'UPDATE_PENDING_COUNT') {
    //console.log(`[SW] Contador de cambios pendientes actualizado: ${event.data.count}`);
    // No es necesario hacer nada aquí, solo registrar
  }
  
  // Obtener datos almacenados en caché
  if (event.data && event.data.type === 'GET_CACHED_DATA') {
    const key = event.data.key;
    const port = event.ports && event.ports[0];
    
    if (!port) {
      //console.error('[SW] No se recibió puerto de comunicación para GET_CACHED_DATA');
      return;
    }
    
    event.waitUntil(
      caches.open(DATA_CACHE_NAME).then(async (cache) => {
        try {
          const cachedResponse = await cache.match(new Request(key));
          
          if (cachedResponse) {
            const data = await cachedResponse.json();
            port.postMessage({ data });
          } else {
            port.postMessage({ data: null });
          }
        } catch (error) {
          console.error('[SW] Error obteniendo datos en caché:', error);
          port.postMessage({ error: error.message });
        }
      }).catch(error => {
        console.error('[SW] Error accediendo a la caché:', error);
        port.postMessage({ error: error.message });
      })
    );
  }
});

// Sincronización en segundo plano
self.addEventListener('sync', (event) => {
  //console.log(`[SW] Evento de sincronización recibido: ${event.tag}`);
  
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
    const requestResults = await syncPendingRequests();
    const dataResults = await syncData();
    
    const results = {
      requests: requestResults,
      data: dataResults,
      timestamp: Date.now()
    };
    
    // Notificar a los clientes que la sincronización se completó
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETED',
        timestamp: Date.now(),
        results: results
      });
    });
    
    //console.log('[SW] Sincronización completa realizada con éxito:', results);
    return results;
  } catch (error) {
    console.error('[SW] Error en syncAllData:', error);
    
    // Notificar error a los clientes
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_ERROR',
        timestamp: Date.now(),
        error: error.message
      });
    });
    
    throw error;
  }
}

// Procesamiento de solicitudes pendientes
async function syncPendingRequests() {
  try {
    //console.log('[SW] Iniciando sincronización de solicitudes pendientes');
    const cache = await caches.open(PENDING_REQUESTS_STORE);
    const requests = await cache.keys();
    
    //console.log(`[SW] Encontradas ${requests.length} solicitudes pendientes`);
    
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
    
    // Orden de sincronización según dependencias y prioridad
    const syncOrder = [
      'auth', 
      'profile', 
      'settings',
      'goals', 
      'exercises', 
      'food', 
      'foods',
      'water', 
      'calories',
      'nutrition',
      'workouts', 
      'routines',
      'progress',
      'recipes',
      'subscription',
      'other'
    ];
    
    const results = { success: 0, failure: 0 };
    
    for (const type of syncOrder) {
      if (!requestsByType[type]) continue;
      
      //console.log(`[SW] Sincronizando ${requestsByType[type].length} solicitudes de tipo '${type}'`);
      
      for (const { request, data } of requestsByType[type]) {
        try {
          // Añadir cabeceras para indicar que es una sincronización
          const headers = {
            'Content-Type': 'application/json',
            'X-Offline-Sync': 'true',
            ...data.headers
          };
          
          // Omitir información de caché en las cabeceras
          delete headers['if-none-match'];
          delete headers['if-modified-since'];
          
          // Intentar sincronizar con reintentos
          let syncAttempts = 0;
          let syncSucceeded = false;
          let syncResponse;
          
          while (syncAttempts < 3 && !syncSucceeded) {
            try {
              syncResponse = await fetch(data.url, {
                method: data.method,
                headers: headers,
                body: JSON.stringify(data.body),
                // Añadir timeout para evitar esperas excesivas
                signal: AbortSignal.timeout(10000) // 10 segundos de timeout
              });
              
              if (syncResponse.ok) {
                syncSucceeded = true;
              } else {
                // Esperar antes de reintentar
                await new Promise(resolve => setTimeout(resolve, 1000));
                syncAttempts++;
              }
            } catch (fetchError) {
              console.error(`[SW] Error en intento ${syncAttempts + 1}/3:`, fetchError);
              await new Promise(resolve => setTimeout(resolve, 1000));
              syncAttempts++;
            }
          }
          
          if (syncSucceeded) {
            // Si la sincronización fue exitosa, eliminar del caché
            await cache.delete(request);
            results.success++;
            //console.log(`[SW] Solicitud sincronizada correctamente: ${data.url}`);
            
            // Si es exitoso y hay datos de respuesta, actualizar caché de datos
            try {
              const responseData = await syncResponse.json();
              if (responseData) {
                const dataCache = await caches.open(DATA_CACHE_NAME);
                
                // Crear una clave de caché apropiada basada en la URL original
                const urlObj = new URL(data.url);
                // Eliminar parámetros de timestamp o cache-busting si existen
                urlObj.searchParams.delete('_t');
                urlObj.searchParams.delete('timestamp');
                
                await dataCache.put(
                  new Request(urlObj.toString()),
                  new Response(JSON.stringify(responseData), {
                    headers: { 'Content-Type': 'application/json' }
                  })
                );
                
                //console.log(`[SW] Datos actualizados en caché para: ${data.url}`);
              }
            } catch (cacheError) {
              console.error('[SW] Error actualizando caché tras sincronización:', cacheError);
            }
          } else {
            results.failure++;
            //console.error(`[SW] Error en sincronización después de 3 intentos: ${data.url}`);
          }
        } catch (error) {
          results.failure++;
          //console.error(`[SW] Error al sincronizar solicitud:`, error);
        }
      }
    }
    
    // Notificar a los clientes los resultados de la sincronización
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETED',
        timestamp: Date.now(),
        results: results
      });
    });
    
    //console.log(`[SW] Sincronización completada. Éxitos: ${results.success}, Fallos: ${results.failure}`);
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
    
    //console.log(`[SW] Sincronizando ${apiRequests.length} datos en caché`);
    
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
      event.request.destination === 'image' ||
      event.request.destination === 'font') {
    
    event.respondWith(
      // Estrategia: Cache-First para assets estáticos, Network-First para navegación
      caches.match(event.request).then(cachedResponse => {
        // Para assets estáticos, priorizar caché
        if (event.request.destination === 'style' || 
            event.request.destination === 'script' || 
            event.request.destination === 'image' ||
            event.request.destination === 'font') {
          if (cachedResponse) {
            // Revalidar en segundo plano
            fetch(event.request)
              .then(response => {
                if (response && response.status === 200) {
                  const responseToCache = response.clone();
                  caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseToCache);
                  });
                }
              })
              .catch(error => console.log('[SW] Error actualizando caché:', error));
            
            return cachedResponse;
          }
        }
        
        // Para navegación o assets no encontrados en caché, intentar network primero
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

        // Para navegación, si hay caché la devolvemos mientras se carga la red
        if (event.request.mode === 'navigate' && cachedResponse) {
          return cachedResponse;
        }
        
        return fetchPromise || caches.match('/offline.html');
      }).catch(() => {
        // Fallback a página offline para navegación
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html') || caches.match('/index.html');
        }
        return null;
      })
    );
    return;
  }
  
  // Para cualquier otra solicitud
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request)
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
            // Intentar obtener del caché nuevamente (por si acaso)
            return caches.match(event.request);
          });
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
          
          // Notificar a los clientes que hay nuevos datos
          const clients = await self.clients.matchAll();
          clients.forEach(client => {
            client.postMessage({
              type: 'API_DATA_UPDATED',
              url: request.url,
              timestamp: Date.now()
            });
          });
          
          return response;
        } else {
          throw new Error('Error en respuesta API');
        }
      } catch (networkError) {
        //console.log('[SW] Error de red, buscando en caché:', networkError);
        // Si falla la red, buscar en caché
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          // Notificar que se están usando datos en caché
          const clients = await self.clients.matchAll();
          clients.forEach(client => {
            client.postMessage({
              type: 'USING_CACHED_DATA',
              url: request.url,
              timestamp: Date.now()
            });
          });
          
          return cachedResponse;
        }
        
        // Si no hay caché, intentar un fallback genérico
        return handleApiFallback(request);
      }
    } 
    // Para solicitudes de modificación (POST, PUT, DELETE)
    else if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
      try {
        // Verificar si es una sincronización desde offline (tiene cabecera especial)
        const isOfflineSync = request.headers && request.headers.get('X-Offline-Sync') === 'true';
        
        // Intentar hacer la solicitud a la red
        const response = await fetch(request.clone());
        
        // Si es una sincronización offline y fue exitosa, actualizar los datos en caché
        if (isOfflineSync && response.ok) {
          try {
            const responseData = await response.clone().json();
            const url = new URL(request.url);
            
            // Obtener la ruta base (sin parámetros) para guardar en caché
            const basePath = `${url.origin}${url.pathname}`;
            
            // Guardar en caché para acceso offline futuro
            const dataCache = await caches.open(DATA_CACHE_NAME);
            await dataCache.put(
              new Request(basePath),
              new Response(JSON.stringify(responseData), {
                headers: { 'Content-Type': 'application/json' }
              })
            );
            
            //console.log(`[SW] Datos de sincronización guardados en caché: ${basePath}`);
          } catch (cacheError) {
            console.error('[SW] Error guardando datos sincronizados en caché:', cacheError);
          }
        }
        
        return response;
      } catch (error) {
        //console.log('[SW] Error en solicitud de modificación, guardando para sincronización:', error);
        
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
        
        // Notificar a los clientes que hay solicitudes pendientes
        const pendingCount = await getPendingChangesCount();
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'PENDING_CHANGES_COUNT',
            count: pendingCount,
            timestamp: Date.now()
          });
        });
        
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
    return new Response(JSON.stringify({ 
      exercises: [],
      categories: ["Pecho", "Espalda", "Hombros", "Bíceps", "Tríceps", "Piernas", "Abdominales", "Cardio"],
      success: true,
      offline: true
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } 
  else if (url.pathname.includes('/api/foods')) {
    return new Response(JSON.stringify({
      foods: { Desayuno: [], Almuerzo: [], Merienda: [], Cena: [] },
      currentFoodType: null,
      isToday: true,
      success: true,
      offline: true
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  else if (url.pathname.includes('/api/water')) {
    return new Response(JSON.stringify({
      history: [],
      recommendation: 2000,
      today: { total: 0, goal: 2000, percentage: 0 },
      success: true,
      offline: true
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  else if (url.pathname.includes('/api/profile')) {
    return new Response(JSON.stringify({
      profile: null,
      message: "Datos de perfil no disponibles en modo offline",
      success: true,
      offline: true
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  else if (url.pathname.includes('/api/goals')) {
    return new Response(JSON.stringify({
      goals: [],
      message: "Metas no disponibles en modo offline",
      success: true,
      offline: true
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  else if (url.pathname.includes('/api/workouts')) {
    return new Response(JSON.stringify({
      workouts: [],
      message: "Entrenamientos no disponibles en modo offline",
      success: true,
      offline: true
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  else if (url.pathname.includes('/api/progress')) {
    return new Response(JSON.stringify({
      progress: [],
      message: "Datos de progreso no disponibles en modo offline",
      success: true,
      offline: true
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  else if (url.pathname.includes('/api/routines')) {
    return new Response(JSON.stringify({
      routines: [],
      message: "Rutinas no disponibles en modo offline",
      success: true,
      offline: true
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  else if (url.pathname.includes('/api/get-calorie-goal')) {
    return new Response(JSON.stringify({
      calorieGoal: 2000, // Valor predeterminado
      success: true,
      offline: true
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  else if (url.pathname.includes('/api/calories')) {
    return new Response(JSON.stringify({
      calorieData: {
        consumed: 0,
        goal: 2000,
        remaining: 2000
      },
      success: true,
      offline: true
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  else if (url.pathname.includes('/api/recipes')) {
    return new Response(JSON.stringify({
      recipes: [],
      message: "Recetas no disponibles en modo offline",
      success: true,
      offline: true
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  else if (url.pathname.includes('/api/subscription')) {
    return new Response(JSON.stringify({
      subscription: null,
      isSubscribed: false,
      message: "Información de suscripción no disponible en modo offline",
      success: true,
      offline: true
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  else if (url.pathname.includes('/api/auth')) {
    return new Response(JSON.stringify({
      message: "Operaciones de autenticación no disponibles en modo offline",
      success: false,
      offline: true,
      requiresOnline: true
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

// Obtener el recuento de solicitudes pendientes
async function getPendingChangesCount() {
  try {
    const cache = await caches.open(PENDING_REQUESTS_STORE);
    const requests = await cache.keys();
    return requests.length;
  } catch (error) {
    console.error('[SW] Error al obtener recuento de cambios pendientes:', error);
    return 0;
  }
}
