/**
 * StockPilot POS Service Worker - Powered by Gifted Solutions
 * @version 4.0.0
 */

const CACHE_VERSION = '4.0.0'
const CACHE_NAME = `stockpilot-pos-v${CACHE_VERSION}`
const RUNTIME_CACHE = `stockpilot-runtime-v${CACHE_VERSION}`

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
]

self.addEventListener('install', (event) => {
  console.log('[SW] Installing v' + CACHE_VERSION)
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating v' + CACHE_VERSION)
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('[SW] Clearing cache:', cacheName)
          return caches.delete(cacheName)
        })
      )
    }).then(() => self.clients.claim())
      .then(() => {
        return self.clients.matchAll().then(clients => {
          clients.forEach(client => client.navigate(client.url))
        })
      })
  )
})

self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith(self.location.origin)) {
    event.respondWith(fetch(event.request))
    return
  }

  if (event.request.url.includes('/api/') || event.request.url.includes('supabase')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(event.request, responseClone)
            })
          }
          return response
        })
        .catch(() => caches.match(event.request))
    )
    return
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(event.request).then((response) => {
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

self.addEventListener('message', (event) => {
  if (!event.data) return

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
    return
  }

  if (event.data.type === 'SYNC_MUTATIONS') {
    // Trigger a best-effort sync from the service worker (queue processing added later)
    event.waitUntil(syncMutations())
    return
  }
})

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncTransactions())
  }

  if (event.tag === 'sync-mutations') {
    event.waitUntil(syncMutations())
  }
})

async function syncTransactions() {
  console.log('[SW] Syncing offline transactions')
}


async function syncMutations() {
  console.log('[SW] syncMutations called - no-op placeholder')

  // Notify clients that a sync is starting
  const clientsList = await self.clients.matchAll()
  clientsList.forEach((client) => {
    client.postMessage({ type: 'SYNC_STARTED' })
  })

  // TODO: implement processing of an IndexedDB mutation queue here.
  // For now we simply notify clients the sync completed so the UI can react.
  await new Promise((r) => setTimeout(r, 250))

  const clientsDone = await self.clients.matchAll()
  clientsDone.forEach((client) => {
    client.postMessage({ type: 'SYNC_COMPLETE' })
  })

  return Promise.resolve()
}


