export interface Purchase {
  id: string
  img: string
  cost: number
  satietyCost?: number
  /** мгновенные эффекты */
  happiness?: number
  satiety?: number
  reputation?: number
  /** пассивные эффекты */
  incomePerSec?: number
  happinessPer3Sec?: number
  /** временный бонус */
  temp?: { stat: "happiness" | "water"; perSec: number; duration: number }
  /** особые разблокировки */
  unlocks?: "zlata" | "pool" | "smoke" | "emperor"
  sounds: string[]
  /** задержка второго звука, мс */
  soundDelay?: number
  /** максимальная длительность звука покупки, сек (по умолчанию 4) */
  soundMaxSeconds?: number
  /** громкость звука покупки (0..1) */
  soundVolume?: number
  /** остановить этот звук при следующей покупке */
  stopOnNextPurchase?: boolean
  /** начать воспроизведение звука с этой секунды (пропуск тишины в начале) */
  soundStartAt?: number
}

// Цепочка покупок: после удачной покупки кнопка меняется на следующую
export const PURCHASES: Purchase[] = [
  {
    id: "house",
    img: "/img/buy-01-house.png",
    cost: 15,
    satietyCost: 15,
    happinessPer3Sec: 1,
    sounds: ["build"],
  },
  {
    id: "bag",
    img: "/img/buy-02-bag.png",
    cost: 10,
    temp: { stat: "happiness", perSec: 3, duration: 10 },
    sounds: ["trash-bag", "laugh"],
    soundDelay: 500,
  },
  {
    id: "puddle",
    img: "/img/buy-03-puddle.png",
    cost: 10,
    temp: { stat: "water", perSec: 5, duration: 15 },
    sounds: ["swim"],
  },
  {
    id: "sell",
    img: "/img/buy-04-sell.png",
    cost: 20,
    incomePerSec: 1,
    sounds: ["buy-business"],
  },
  {
    id: "desk",
    img: "/img/buy-06-desk.png",
    cost: 25,
    happiness: 15,
    reputation: 3,
    sounds: ["diarrhea"],
  },
  {
    id: "throw",
    img: "/img/buy-07-throw.png",
    cost: 25,
    satiety: 20,
    reputation: 5,
    sounds: ["throw", "throw-rats"],
    soundDelay: 400,
  },
  {
    id: "production",
    img: "/img/buy-08-production.png",
    cost: 50,
    incomePerSec: 5,
    sounds: ["buy-factory"],
  },
  {
    id: "zlata",
    img: "/img/buy-09-zlata.png",
    cost: 50,
    unlocks: "zlata",
    sounds: ["buy-upgrade"],
  },
  {
    id: "pool",
    img: "/img/buy-10-pool.png",
    cost: 60,
    unlocks: "pool",
    sounds: ["pool-splash"],
  },
  {
    id: "rats-school",
    img: "/img/buy-11-rats.png",
    cost: 75,
    reputation: 2,
    sounds: ["rat-squeak"],
  },
  {
    id: "ads",
    img: "/img/buy-12-ads.png",
    cost: 100,
    reputation: 5,
    unlocks: "smoke",
    sounds: ["buy-upgrade"],
  },
  {
    id: "castle",
    img: "/img/buy-13-castle.png",
    cost: 100,
    reputation: 5,
    sounds: ["build"],
  },
  {
    id: "poem",
    img: "/img/buy-14-poem.png",
    cost: 150,
    sounds: ["pencil"],
  },
  {
    id: "rat-gift",
    img: "/img/buy-15-rat-gift.png",
    cost: 100,
    sounds: ["surprise"],
  },
  {
    id: "zlata-site",
    img: "/img/buy-zlata-site.png",
    // На картинке написано «цена 80$» — цена должна совпадать
    cost: 80,
    incomePerSec: 10,
    sounds: ["buy-upgrade"],
  },
  {
    id: "capture",
    img: "/img/buy-16-capture.png",
    // Цена должна совпадать с картинкой — 250$
    cost: 250,
    // Звук войны: до 10 секунд, обрывается при следующей покупке.
    // Первые ~2.8 сек в файле почти тишина — пропускаем их.
    sounds: ["war-shootout"],
    soundMaxSeconds: 10,
    stopOnNextPurchase: true,
    soundStartAt: 2.8,
  },
  {
    id: "rename",
    img: "/img/buy-17-rename.png",
    // На картинке написано «цена=275$» — цена должна совпадать
    cost: 275,
    sounds: ["slide-change"],
  },
  {
    id: "rebuild",
    img: "/img/buy-18-rebuild.png",
    // На картинке написано «цена=300$» — цена должна совпадать
    cost: 300,
    reputation: 5,
    sounds: ["jackhammer"],
  },
  {
    id: "fart-director",
    img: "/img/buy-19-director.png",
    // На картинке написано «цена=250$»
    cost: 250,
    reputation: 7,
    sounds: ["fart-long"],
  },
  {
    id: "ban-hygiene",
    img: "/img/buy-20-hygiene.png",
    // На картинке написано «цена 250$»
    cost: 250,
    reputation: 10,
    sounds: ["court-hammer"],
  },
  {
    id: "ban-washing",
    img: "/img/buy-21-washing.png",
    // На картинке написано «цена 300$»
    cost: 300,
    reputation: 10,
    sounds: ["court-hammer"],
  },
  {
    id: "car-production",
    img: "/img/buy-22-cars.png",
    // На картинке написано «цена=300$»
    cost: 300,
    incomePerSec: 15,
    // Шум завода: пару секунд и негромко
    sounds: ["plant-noise"],
    soundMaxSeconds: 2,
    soundVolume: 0.45,
  },
  {
    id: "emperor",
    img: "/img/buy-23-emperor.png",
    // На картинке написано «цена 650$»
    cost: 650,
    reputation: 35,
    unlocks: "emperor",
    sounds: ["protests"],
  },
  {
    id: "protests",
    img: "/img/buy-24-protests.png",
    // На картинке написано «цена=300$»
    cost: 300,
    reputation: 15,
    sounds: ["huge-fall"],
  },
]
