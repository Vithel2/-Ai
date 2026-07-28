// Сервис-воркер игры «Симулятор СашиПораши»
// Стратегия: network-first для навигации, cache-first для статики (картинки/звуки/музыка)

const CACHE_NAME = "sasha-porasha-v1"
const OFFLINE_URL = "/"

// Предкэшируем главную страницу при установке
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([OFFLINE_URL])),
  )
  self.skipWaiting()
})

// Чистим старые кэши при активации
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener("fetch", (event) => {
  const { request } = event

  // Только GET-запросы своего origin
  if (request.method !== "GET" || !request.url.startsWith(self.location.origin)) return

  // Навигация: сеть, при офлайне — кэш главной
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
          return response
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match(OFFLINE_URL))),
    )
    return
  }

  // Статика (картинки, звуки, музыка, иконки, шрифты, скрипты, стили): cache-first
  const dest = request.destination
  if (["image", "audio", "font", "script", "style"].includes(dest)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone()
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
            }
            return response
          }),
      ),
    )
  }
})
