// Инвестиции на экране «Решение бизнеса».
// Вкладываешь деньги — через durationSec секунд приходит выплата.
// Рискованные вклады (risky): шанс успеха chance; при провале деньги сгорают и теряется репутация.

export interface Investment {
  id: string
  img: string
  label: string
  /** Подпись с условиями сделки под карточкой */
  caption: string
  cost: number
  durationSec: number
  /** Гарантированная выплата по завершении */
  payout?: number
  /** Рискованный вклад: шанс успеха 0..1, выплата при успехе, потеря репутации при провале */
  risky?: { chance: number; payout: number; failReputation: number }
}

export const INVESTMENTS: Investment[] = [
  {
    id: "invest-sell",
    img: "/img/invest-sell.png",
    label: "Инвестиции в продажи мусора",
    caption: "100$ → 150$ через 30 сек",
    cost: 100,
    durationSec: 30,
    payout: 150,
  },
  {
    id: "invest-production",
    img: "/img/invest-production.png",
    label: "Инвестиции в производство мусора",
    caption: "250$ → 450$ через 60 сек",
    cost: 250,
    durationSec: 60,
    payout: 450,
  },
  {
    id: "invest-cars",
    img: "/img/invest-cars.png",
    label: "Инвестиции в производство мусорных машин",
    caption: "500$ → 1000$ через 90 сек",
    cost: 500,
    durationSec: 90,
    payout: 1000,
  },
  {
    id: "invest-intim",
    img: "/img/invest-intim.png",
    label: "Инвестиции в интим ролики",
    caption: "300$ → 50/50: 1200$ или БАН и −10 репутации",
    cost: 300,
    durationSec: 45,
    risky: { chance: 0.5, payout: 1200, failReputation: 10 },
  },
]
