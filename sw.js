// Service Worker para PWA - Calculadora de Gastos
// Versión del cache
const CACHE_NAME = 'calculadora-gastos-v1.0.0';
const CACHE_VERSION = '1.0.0';

// Archivos esenciales que se deben cachear para funcionar offline
const FILES_TO_CACHE = [
  './',
  './index.html',
  './styles/main.css',
  './JS/app.js',
  './styles/Logo/d856f2_cf6bc381d9fb47c6ad407ae5095cc914~mv2.png',
  './styles/tanque/479bf1_05ef7700946d43d7a32166d486d18115f000.avif',
  './styles/tanque completo/1000475288.png',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  './manifest.json'
];

// INSTALACIÓN: Cuando se instala el Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  
  // Esperar hasta que todos los archivos se cacheen
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Cacheando archivos esenciales...');
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(() => {
        console.log('[Service Worker] Instalación completada');
        // Forzar activación inmediata
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Error al cachear archivos:', error);
      })
  );
});

// ACTIVACIÓN: Cuando se activa el Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activando...');
  
  event.waitUntil(
    // Limpiar caches antiguos
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Si el cache es diferente al actual, eliminarlo
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('[Service Worker] Activación completada');
      // Tomar control de todas las páginas inmediatamente
      return self.clients.claim();
    })
  );
});

// FETCH: Interceptar todas las peticiones de red
self.addEventListener('fetch', (event) => {
  // Solo procesar peticiones GET
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    // Primero intentar obtener de la red
    fetch(event.request)
      .then((response) => {
        // Si la respuesta es válida, clonarla y guardarla en cache
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red, intentar obtener del cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log('[Service Worker] Sirviendo desde cache:', event.request.url);
            return cachedResponse;
          }
          // Si no está en cache, devolver una página de error básica
          if (event.request.destination === 'document') {
            return caches.match('./index.html');
          }
        });
      })
  );
});

