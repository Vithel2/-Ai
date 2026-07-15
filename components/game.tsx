"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { IndicatorPanel } from "@/components/indicator-panel"
import { MainScreen } from "@/components/main-screen"
import { DecisionsScreen, type ActionDef } from "@/components/decisions-screen"
import { SettingsModal } from "@/components/settings-modal"
import { PURCHASES } from "@/lib/game-data"
import { playSfx, playSfxLimited, stopSfx, startMusic } from "@/lib/audio"

interface Stats {
  happiness: number
  satiety: number
  water: number
  reputation: number
  money: number
}

interface TempBonus {
  stat: "happiness" | "water"
  perSec: number
  until: number
}

const clamp = (v: number, min = 0, max = 100) => Math.min(max, Math.max(min, v))

export function Game() {
  const [screen, setScreen] = useState<"main" | "decisions">("main")
  const [stats, setStats] = useState<Stats>({
    happiness: 35,
    satiety: 35,
    water: 35,
    reputation: 0,
    money: 0,
  })
  const [purchaseIndex, setPurchaseIndex] = useState(0)
  const [unlocked, setUnlocked] = useState<{ zlata: boolean; pool: boolean; smoke: boolean }>({
    zlata: false,
    pool: false,
    smoke: false,
  })
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({})
  const [showSettings, setShowSettings] = useState(false)

  const incomePerSec = useRef(0)
  const happinessPer3Sec = useRef(0)
  const tempBonuses = useRef<TempBonus[]>([])
  const tickCount = useRef(0)
  const stopOnNextSound = useRef<string | null>(null)
  const infiniteMoney = useRef(false)

  // Чит-код из настроек
  const handleCheatCode = useCallback((code: string): boolean => {
    if (code.trim() === "Vithel") {
      infiniteMoney.current = true
      setStats((s) => ({ ...s, money: 999999 }))
      return true
    }
    return false
  }, [])

  // Запуск музыки после первого взаимодействия
  useEffect(() => {
    const start = () => startMusic()
    window.addEventListener("pointerdown", start)
    return () => window.removeEventListener("pointerdown", start)
  }, [])

  // Предзагрузка всех картинок при старте, чтобы экраны открывались мгновенно
  useEffect(() => {
    const images = [
      "/img/bg-main.jpg",
      "/img/bg-decisions.png",
      "/img/sasha.png",
      "/img/btn-decisions.png",
      "/img/btn-exit.png",
      "/img/btn-settings.png",
      "/img/indicator.png",
      "/img/action-rats.png",
      "/img/action-bath.png",
      "/img/action-pool.png",
      "/img/action-fart.png",
      "/img/action-fart-upgraded.png",
      "/img/action-zlata.png",
      ...PURCHASES.map((p) => p.img),
    ]
    for (const src of images) {
      const img = new Image()
      img.src = src
    }
  }, [])

  // Игровой цикл: 1 тик в секунду
  useEffect(() => {
    const interval = setInterval(() => {
      tickCount.current++
      const now = Date.now()
      tempBonuses.current = tempBonuses.current.filter((b) => b.until > now)

      setStats((s) => {
        let { happiness, satiety, water, reputation, money } = s

        // Пассивный доход
        money += incomePerSec.current

        // Дом из мусора: +1 счастье каждые 3 секунды
        if (happinessPer3Sec.current > 0 && tickCount.current % 3 === 0) {
          happiness += happinessPer3Sec.current
        }

        // Временные бонусы
        for (const b of tempBonuses.current) {
          if (b.stat === "happiness") happiness += b.perSec
          else water += b.perSec
        }

        // Постепенное снижение потребностей (быстрее)
        satiety -= 0.7
        water -= 0.9
        happiness -= 0.5

        // Если голод или жажда на нуле — счастье стремительно падает
        if (satiety <= 0 || water <= 0) happiness -= 1.5

        return {
          happiness: clamp(happiness),
          satiety: clamp(satiety),
          water: clamp(water),
          reputation,
          money: infiniteMoney.current ? 999999 : Math.max(0, money),
        }
      })

      // Обновление кулдаунов
      setCooldowns((cds) => {
        const next: Record<string, number> = {}
        for (const [k, v] of Object.entries(cds)) {
          if (v > 1) next[k] = v - 1
        }
        return next
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const addReputation = useCallback((amount: number) => {
    playSfx("level-up")
    setStats((s) => ({ ...s, reputation: s.reputation + amount }))
  }, [])

  // Клик по Саше: +1$
  const handleSashaClick = useCallback(() => {
    startMusic()
    playSfx("click", 0.8)
    setStats((s) => ({ ...s, money: s.money + 1 }))
  }, [])

  // Действия в решениях
  const handleAction = useCallback(
    (id: string) => {
      setCooldowns((cds) => ({ ...cds, [id]: 4 }))
      if (id === "rats") {
        playSfx("eat-rats")
        setStats((s) => ({ ...s, satiety: clamp(s.satiety + 20) }))
      } else if (id === "bath") {
        if (unlocked.pool) {
          playSfxLimited("pool-splash", 2)
          setStats((s) => ({ ...s, water: clamp(s.water + 20), happiness: clamp(s.happiness + 20) }))
        } else {
          playSfxLimited("swim", 2)
          setStats((s) => ({ ...s, water: clamp(s.water + 10), happiness: clamp(s.happiness + 15) }))
        }
      } else if (id === "fart") {
        if (unlocked.smoke) {
          playSfx("fart-meeting")
          setTimeout(() => playSfx("fart-long"), 400)
          setStats((s) => ({ ...s, happiness: clamp(s.happiness + 25), money: s.money + 3 }))
        } else {
          playSfx("fart-lineup")
          setStats((s) => ({ ...s, happiness: clamp(s.happiness + 20) }))
        }
      } else if (id === "zlata") {
        playSfx("zlata")
        setCooldowns((cds) => ({ ...cds, zlata: 10 }))
        setStats((s) => ({ ...s, happiness: clamp(s.happiness + 50) }))
      }
    },
    [unlocked],
  )

  // Покупка текущего улучшения в цепочке
  const purchase = purchaseIndex < PURCHASES.length ? PURCHASES[purchaseIndex] : null
  const canAfford =
    !!purchase && stats.money >= purchase.cost && stats.satiety >= (purchase.satietyCost ?? 0)

  const handleBuy = useCallback(() => {
    if (!purchase || !canAfford) return

    // Останавливаем звук предыдущей покупки, если он играет до следующей прокачки
    if (stopOnNextSound.current) {
      stopSfx(stopOnNextSound.current)
      stopOnNextSound.current = null
    }

    // Звуки покупки: обрезаем по лимиту (по умолчанию 4 сек), "метаться крысами" — потише
    const maxSec = purchase.soundMaxSeconds ?? 4
    const playBuySound = (name: string) =>
      playSfxLimited(name, maxSec, purchase.soundVolume ?? (name === "throw-rats" ? 0.5 : 0.8))
    playBuySound(purchase.sounds[0])
    if (purchase.sounds[1]) {
      setTimeout(() => playBuySound(purchase.sounds[1]), purchase.soundDelay ?? 500)
    }
    if (purchase.stopOnNextPurchase) {
      stopOnNextSound.current = purchase.sounds[0]
    }

    // Пассивные эффекты
    if (purchase.incomePerSec) incomePerSec.current += purchase.incomePerSec
    if (purchase.happinessPer3Sec) happinessPer3Sec.current += purchase.happinessPer3Sec

    // Временный бонус
    if (purchase.temp) {
      tempBonuses.current.push({
        stat: purchase.temp.stat,
        perSec: purchase.temp.perSec,
        until: Date.now() + purchase.temp.duration * 1000,
      })
    }

    // Разблокировки
    if (purchase.unlocks) {
      setUnlocked((u) => ({ ...u, [purchase.unlocks as string]: true }))
    }

    // Репутация с звуком нового уровня
    if (purchase.reputation) addReputation(purchase.reputation)

    // Списание и мгновенные эффекты
    setStats((s) => ({
      ...s,
      money: infiniteMoney.current ? 999999 : s.money - purchase.cost,
      satiety: clamp(s.satiety - (purchase.satietyCost ?? 0) + (purchase.satiety ?? 0)),
      happiness: clamp(s.happiness + (purchase.happiness ?? 0)),
    }))

    // Вид кнопки меняется на следующий
    setPurchaseIndex((i) => i + 1)
  }, [purchase, canAfford, addReputation])

  // Набор кнопок действий (меняются от покупок)
  const actions: ActionDef[] = [
    // После покупки Златы кнопка "ловить крыс" заменяется на "поиграться с Златой"
    unlocked.zlata
      ? { id: "zlata", img: "/img/action-zlata.png", label: "Поиграться с Златой: счастье +50" }
      : { id: "rats", img: "/img/action-rats.png", label: "Ловить крыс: сытость +20" },
    unlocked.pool
      ? { id: "bath", img: "/img/action-pool.png", label: "Купаться в мусорном бассейне: вода +20, счастье +20" }
      : { id: "bath", img: "/img/action-bath.png", label: "Купаться в мусорке: вода +10, счастье +15" },
    unlocked.smoke
      ? { id: "fart", img: "/img/action-fart-upgraded.png", label: "Дымовая завеса: счастье +25, +3$" }
      : { id: "fart", img: "/img/action-fart.png", label: "Пердеть на линейке: счастье +20" },
  ]

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-background">
      {screen === "main" ? (
        <MainScreen
          onSashaClick={handleSashaClick}
          onOpenDecisions={() => setScreen("decisions")}
          onOpenSettings={() => setShowSettings(true)}
        />
      ) : (
        <DecisionsScreen
          actions={actions}
          cooldowns={cooldowns}
          purchase={purchase}
          canAfford={canAfford}
          onAction={handleAction}
          onBuy={handleBuy}
          onExit={() => setScreen("main")}
        />
      )}

      <IndicatorPanel
        happiness={stats.happiness}
        satiety={stats.satiety}
        water={stats.water}
        reputation={stats.reputation}
        money={stats.money}
      />

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} onCode={handleCheatCode} />}
    </main>
  )
}
