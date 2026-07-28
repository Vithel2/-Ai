// Тихая фоновая предзагрузка файлов игры.
// Порядок важен: сперва то, что видно на первом экране, потом всё остальное.
// Музыка НЕ предзагружается — треки весят десятки мегабайт и стримятся по мере игры.

// Первый экран и первые действия — нужны сразу
const IMAGES_CRITICAL = [
  "bg-main.jpg",
  "sasha.png",
  "indicator.png",
  "btn-settings.png",
  "btn-decisions.png",
  "business-main.png",
  "action-fart.png",
  "action-bath.png",
  "bg-decisions.png",
  "buy-01-house.png",
  "buy-02-bag.png",
  "buy-03-puddle.png",
]

// Всё остальное — можно догрузить спокойно в фоне
const IMAGES_REST = [
  "action-fart-upgraded.png",
  "action-pool.png",
  "action-rats.png",
  "action-zlata.png",
  "bg-emperor.jpg",
  "btn-exit.png",
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
  "buy-zlata-site.png",
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
  "business-bg.png",
]

// Звуки первых действий
const SFX_CRITICAL = ["click", "fart-long", "swim", "buy-upgrade"]

const SFX_REST = [
  "build",
  "buy-business",
  "buy-factory",
  "court-hammer",
  "diarrhea",
  "eat-rats",
  "fart-lineup",
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
  "throw-rats",
  "throw",
  "trash-bag",
  "war-shootout",
  "zlata",
]

let started = false

/** Грузит список файлов пачками, чтобы не душить сеть. Вызывает done по завершении. */
function loadQueue(files: string[], concurrency: number, done?: () => void) {
  let index = 0
  let active = 0

  const next = () => {
    if (index >= files.length) {
      if (active === 0) done?.()
      return
    }
    const url = files[index++]
    active++
    fetch(url)
      .then((res) => res.blob())
      .catch(() => {})
      .finally(() => {
        active--
        next()
      })
  }

  for (let i = 0; i < concurrency; i++) next()
}

export function preloadAssets() {
  if (started || typeof window === "undefined") return
  started = true

  // Уважаем экономию трафика и очень медленные сети — тогда ничего не тянем заранее
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
  if (conn?.saveData || conn?.effectiveType === "slow-2g" || conn?.effectiveType === "2g") return

  const critical = [
    ...IMAGES_CRITICAL.map((f) => `/img/${f}`),
    ...SFX_CRITICAL.map((f) => `/sfx/${f}.mp3`),
  ]
  const rest = [...IMAGES_REST.map((f) => `/img/${f}`), ...SFX_REST.map((f) => `/sfx/${f}.mp3`)]

  // Сначала первый экран, потом в простое — всё остальное
  loadQueue(critical, 4, () => {
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback
    const start = () => loadQueue(rest, 3)
    if (idle) idle(start)
    else setTimeout(start, 1500)
  })
}
