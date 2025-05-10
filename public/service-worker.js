const CACHE_NAME = 'all-in-one-fitness-v1';
const DATA_CACHE_NAME = 'all-in-one-fitness-data-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/web-app-manifest-192x192.png',
  '/web-app-manifest-512x512.png',
  '/manifest.json',
  '/favicon-96x96.png',
  '/favicon.ico',
  '/favicon.svg',
];

// Instalación del service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Cache de recursos abierto');
        return cache.addAll(urlsToCache);
      }),
      caches.open(DATA_CACHE_NAME).then((cache) => {
        console.log('Cache de datos abierto');
        return cache;
      })
    ]).then(() => self.skipWaiting())
  );
});

// Activación del service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
            console.log('Eliminando cache antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
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
        return cache.put(
          event.data.key,
          new Response(JSON.stringify(event.data.data))
        );
      })
    );
  }
});

// Sincronización en segundo plano
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  try {
    const cache = await caches.open(DATA_CACHE_NAME);
    const keys = await cache.keys();
    
    for (const request of keys) {
      const response = await cache.match(request);
      const data = await response.json();
      
      // Intentar sincronizar con el servidor
      try {
        const syncResponse = await fetch(request.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        if (syncResponse.ok) {
          // Si la sincronización fue exitosa, eliminar del caché
          await cache.delete(request);
        }
      } catch (error) {
        console.error('Error al sincronizar datos:', error);
      }
    }
  } catch (error) {
    console.error('Error en la sincronización:', error);
  }
}

// Estrategia de caché: Network First, fallback a cache
self.addEventListener('fetch', (event) => {
  // Si es una petición de datos, usar estrategia diferente
  if (event.request.url.includes('/api/')) {
    event.respondWith(handleApiRequest(event.request));
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('No hay conexión a internet', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      })
  );
});

async function handleApiRequest(request) {
  try {
    // Intentar primero la red
    const response = await fetch(request);
    return response;
  } catch (error) {
    // Si falla la red, buscar en el caché de datos
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Si es una petición POST/PUT/DELETE, guardar para sincronización posterior
    if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
      const data = await request.clone().json();
      const cache = await caches.open(DATA_CACHE_NAME);
      await cache.put(request, new Response(JSON.stringify(data)));
      
      // Programar sincronización cuando vuelva la conexión
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        await self.registration.sync.register('sync-data');
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Datos guardados localmente para sincronización posterior' 
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    throw error;
  }
}
