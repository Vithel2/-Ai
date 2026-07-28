// Сервис-воркер игры «Симулятор СашиПораши»
// Стратегия: network-first для навигации, cache-first для статики (картинки/звуки/музыка)

const CACHE_NAME = "sasha-porasha-v2"
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

  // Музыку не кэшируем: треки весят десятки мегабайт и грузятся Range-запросами,
  // а частичные ответы (206) в Cache API кладать нельзя
  const url = new URL(request.url)
  if (url.pathname.startsWith("/music/") || request.headers.has("range")) return

  // Статика (картинки, звуки, иконки, шрифты, скрипты, стили): cache-first
  const dest = request.destination
  if (["image", "audio", "font", "script", "style"].includes(dest)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            // Кладём в кэш только полные успешные ответы
            if (response.ok && response.status === 200) {
              const copy = response.clone()
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
            }
            return response
          }),
      ),
    )
  }
})
