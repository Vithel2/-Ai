// Данные вкладки «Решение бизнеса».
// Бизнесы покупаются за деньги и дают пассивный доход — это способ вложить
// накопленные деньги, чтобы не жать Сашу вручную всю игру.

export interface Business {
  id: string
  name: string
  /** Короткое пояснение в духе игры */
  desc: string
  /** Цена первого уровня */
  baseCost: number
  /** Доход в секунду за каждый уровень */
  incomePerLevel: number
  /** Во сколько раз дорожает следующий уровень */
  costGrowth: number
  /** Максимальный уровень */
  maxLevel: number
  /** Открывается после этого номера прокачки в цепочке решений */
  unlockAtPurchase: number
}

export const BUSINESSES: Business[] = [
  {
    id: "stall",
    name: "Мусорный ларёк",
    desc: "Саша продаёт находки с кучи прохожим",
    baseCost: 25,
    incomePerLevel: 0.4,
    costGrowth: 1.5,
    maxLevel: 10,
    unlockAtPurchase: 0,
  },
  {
    id: "bottles",
    name: "Пункт приёма бутылок",
    desc: "Крысы стаскивают бутылки, Саша считает выручку",
    baseCost: 150,
    incomePerLevel: 1.5,
    costGrowth: 1.55,
    maxLevel: 10,
    unlockAtPurchase: 4,
  },
  {
    id: "plant",
    name: "Завод по переработке вони",
    desc: "Запах Саши разливают по флаконам и продают",
    baseCost: 600,
    incomePerLevel: 5,
    costGrowth: 1.6,
    maxLevel: 10,
    unlockAtPurchase: 8,
  },
  {
    id: "empire",
    name: "Мусорная империя",
    desc: "Свалки по всей Давлекановке платят Саше дань",
    baseCost: 2500,
    incomePerLevel: 18,
    costGrowth: 1.65,
    maxLevel: 10,
    unlockAtPurchase: 16,
  },
]

/** Цена следующего уровня: каждый уровень дорожает в costGrowth раз */
export function nextLevelCost(b: Business, level: number) {
  return Math.round(b.baseCost * Math.pow(b.costGrowth, level))
}

/** Доход одного бизнеса на текущем уровне */
export function businessIncome(b: Business, level: number) {
  return b.incomePerLevel * level
}

/** Суммарный доход всех бизнесов в секунду */
export function totalBusinessIncome(levels: Record<string, number>) {
  return BUSINESSES.reduce((sum, b) => sum + businessIncome(b, levels[b.id] ?? 0), 0)
}
