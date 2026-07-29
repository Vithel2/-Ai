// Тихая фоновая предзагрузка всех файлов игры,
// чтобы звуки и картинки не тормозили при первом использовании

import { isNativeApp } from "@/lib/platform"

const IMAGES = [
  "action-bath.png",
  "action-fart-upgraded.png",
  "action-fart.png",
  "action-pool.png",
  "action-rats.png",
  "action-zlata.png",
  "bg-decisions.png",
  "bg-emperor.jpg",
  "bg-main.jpg",
  "btn-decisions.png",
  "btn-exit.png",
  "btn-settings.png",
  "buy-01-house.png",
  "buy-02-bag.png",
  "buy-03-puddle.png",
  "buy-04-sell.png",
  "buy-06-desk.png",
  "buy-07-throw.png",
  "buy-08-production.png",
  "buy-09-zlata.png",
  "buy-10-pool.png",
  "buy-11-rats.png",
  "buy-12-ads.png",
  "buy-13-castle.png",
  "buy-14-poem.png",
  "buy-15-rat-gift.png",
  "buy-16-capture.png",
  "buy-17-rename.png",
  "buy-18-rebuild.png",
  "buy-19-director.png",
  "buy-20-hygiene.png",
  "buy-21-washing.png",
  "buy-22-cars.png",
  "buy-23-emperor.png",
  "buy-24-protests.png",
  "buy-25-lavrushka.png",
  "buy-26-breakup-zlata.png",
  "buy-27-statue.png",
  "buy-28-date-artem.png",
  "buy-29-sleep-artem.png",
  "buy-30-empire.png",
  "buy-zlata-site.png",
  "invest-sell.png",
  "invest-production.png",
  "invest-cars.png",
  "invest-intim.png",
  "scene-bg.png",
  "scene-english.png",
  "scene-bashkir.png",
  "scene-intim-zlata.png",
  "scene-parasha.png",
  "scene-lonely.png",
  "scene-result-english.png",
  "scene-result-bashkir.png",
  "scene-result-intim-zlata.png",
  "scene-result-parasha.png",
  "scene-result-lonely.png",
  "city-main.png",
  "city-propaganda.png",
  "city-bribe.png",
  "city-prison.png",
  "city-hire-rat.png",
  "city-supp-light.png",
  "city-supp-mid.png",
  "city-supp-hard.png",
  "city-exit.png",
  "city-bg-stable.png",
  "city-bg-protest.png",
  "event-1-timofey.jpg",
  "event-2-parasha.jpg",
  "event-3-dianka.jpg",
  "event-4-rat.jpg",
  "event-5-zlata.jpg",
  "event-6-krysyatinovo.jpg",
  "event-7-uzhivitik.jpg",
  "event-8-castle.jpg",
  "event-9-lamp.jpg",
  "event-10-zhopa.jpg",
  "event-11-ruler.png",
  "event-12-lavrushka.png",
  "event-13-idea.png",
  "event-14-homework.png",
  "event-15-small.png",
  "business-main.png",
  "business-bg.png",
  "indicator.png",
  "sasha.png",
].map((f) => `/img/${f}`)

const SFX = [
  "build",
  "buy-business",
  "buy-factory",
  "buy-upgrade",
  "click",
  "court-hammer",
  "diarrhea",
  "eat-rats",
  "fart-lineup",
  "fart-long",
  "fart-meeting",
  "huge-fall",
  "jackhammer",
  "laugh",
  "level-up",
  "pencil",
  "plant-noise",
  "pool-splash",
  "protests",
  "rat-squeak",
  "slide-change",
  "surprise",
  "swim",
  "throw-rats",
  "throw",
  "trash-bag",
  "war-shootout",
  "zlata",
  "english-two",
  "bashkir-two",
  "zlata-creak",
  "danil-brag",
  "sasha-sigh",
  "class-door",
].map((f) => `/sfx/${f}.mp3`)

const MUSIC = [...[1, 2, 3, 4, 5, 6, 7, 8].map((n) => `/music/track-${n}.mp3`), "/music/school-battle.mp3"]

let started = false

export function preloadAssets() {
  if (started || typeof window === "undefined") return
  started = true

  // В APK все файлы уже лежат внутри приложения и открываются мгновенно.
  // Скачивать их в память незачем: на слабых телефонах 60+ МБ блобов
  // приводили к зависанию и вылету приложения при запуске
  if (isNativeApp()) return

  const files = [...IMAGES, ...SFX, ...MUSIC]
  // Загружаем по несколько файлов за раз, чтобы не душить сеть
  let index = 0
  const CONCURRENCY = 4

  const next = () => {
    if (index >= files.length) return
    const url = files[index++]
    fetch(url)
      .then((res) => res.blob())
      .catch(() => {})
      .finally(next)
  }

  for (let i = 0; i < CONCURRENCY; i++) next()
}
