/**
 * Service Worker for StockPilot POS
 * Provides offline functionality and caching for the PWA
 * Version: 4.0 - Healthcare Images Update - Updated: 2025-10-20 15:05
 */

const CACHE_VERSION = '4.0-healthcare-20251020-1505'
const CACHE_NAME = `stockpilot-pos-v${CACHE_VERSION}`
const RUNTIME_CACHE = `stockpilot-runtime-v${CACHE_VERSION}`

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
]

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...')
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Precaching app shell')
      return cache.addAll(PRECACHE_ASSETS)
    })
  )
  
  // Activate immediately
  self.skipWaiting()
})

// Activate event - clean up ALL old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete ALL caches to force fresh fetch
          console.log('[Service Worker] Deleting cache:', cacheName)
          return caches.delete(cacheName)
        })
      )
    }).then(() => {
      // Take control immediately and reload all clients
      return self.clients.claim()
    }).then(() => {
      // Force reload all clients
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => client.navigate(client.url))
      })
    })
  )
})

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests (including external images from Unsplash, etc.)
  if (!event.request.url.startsWith(self.location.origin)) {
    // For external resources, just fetch them normally without caching
    event.respondWith(fetch(event.request))
    return
  }

  // For API requests, try network first
  if (event.request.url.includes('/api/') || event.request.url.includes('supabase')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(event.request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // Return cached version if available
          return caches.match(event.request)
        })
    )
    return
  }

  // For app resources, cache first, fallback to network
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(event.request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response
        }

        const responseClone = response.clone()
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(event.request, responseClone)
        })

        return response
      })
    })
  )
})

// Handle messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Background sync for offline transactions (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncTransactions())
  }
})

async function syncTransactions() {
  // Placeholder for syncing offline transactions when back online
  console.log('[Service Worker] Syncing offline transactions...')
  // Implementation would retrieve queued transactions from IndexedDB
  // and send them to Supabase
}


