"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { IndicatorPanel } from "@/components/indicator-panel"
import { MainScreen } from "@/components/main-screen"
import { DecisionsScreen, type ActionDef } from "@/components/decisions-screen"
import { SettingsModal } from "@/components/settings-modal"
import { EventModal } from "@/components/event-modal"
import { PURCHASES } from "@/lib/game-data"
import { GAME_EVENTS, type EventOutcome, type GameEvent } from "@/lib/events-data"
import { preloadAssets } from "@/lib/preload"
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
  const [unlocked, setUnlocked] = useState<{ zlata: boolean; pool: boolean; smoke: boolean; emperor: boolean }>({
    zlata: false,
    pool: false,
    smoke: false,
    emperor: false,
  })
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({})
  const [showSettings, setShowSettings] = useState(false)
  const [dead, setDead] = useState(false)

  // Ивенты
  const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null)
  const [ending, setEnding] = useState<"secret" | "final" | null>(null)
  const eventsDone = useRef<Set<string>>(new Set())
  const lampFailed = useRef(false)
  const nextEventAllowedAt = useRef(Date.now() + 20000)

  // Пока открыты настройки, ивент или концовка — игра на паузе
  const pausedRef = useRef(false)
  pausedRef.current = showSettings || dead || !!activeEvent || !!ending

  // Актуальный прогресс покупок для проверки условий ивентов внутри цикла
  const purchaseIndexRef = useRef(0)
  purchaseIndexRef.current = purchaseIndex
  const reputationRef = useRef(0)
  reputationRef.current = stats.reputation

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

  // Тихая предзагрузка всех файлов в фоне
  useEffect(() => {
    preloadAssets()
  }, [])

  // Игровой цикл: 1 тик в секунду
  useEffect(() => {
    const interval = setInterval(() => {
      // В настройках или после смерти все процессы стоят
      if (pausedRef.current) return

      tickCount.current++
      const now = Date.now()
      tempBonuses.current = tempBonuses.current.filter((b) => b.until > now)

      // Проверка ивентов: не чаще, чем раз в ~20-30 сек, по одному, в порядке прогресса
      if (now >= nextEventAllowedAt.current) {
        const purchased = new Set(PURCHASES.slice(0, purchaseIndexRef.current).map((p) => p.id))
        const ctx = {
          purchased,
          reputation: reputationRef.current,
          lampFailed: lampFailed.current,
          eventsDone: eventsDone.current,
        }
        const nextEvent = GAME_EVENTS.find((e) => !eventsDone.current.has(e.id) && e.condition(ctx))
        // Небольшая случайность, чтобы ивент не выскакивал ровно в момент покупки
        if (nextEvent && Math.random() < 0.2) {
          eventsDone.current.add(nextEvent.id)
          setActiveEvent(nextEvent)
        }
      }

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

        // Смерть: любой из показателей (счастье, сытость, вода) упал до нуля
        if (happiness <= 0 || satiety <= 0 || water <= 0) {
          setDead(true)
        }

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

  // Завершение ивента: применяем эффекты выбранного исхода
  const handleEventResolve = useCallback((outcome: EventOutcome) => {
    setActiveEvent(null)
    nextEventAllowedAt.current = Date.now() + 20000 + Math.random() * 15000

    if (outcome.lampFailed) lampFailed.current = true
    if (outcome.effects) {
      const e = outcome.effects
      setStats((s) => ({
        happiness: clamp(s.happiness + (e.happiness ?? 0)),
        satiety: clamp(s.satiety + (e.satiety ?? 0)),
        water: clamp(s.water + (e.water ?? 0)),
        reputation: s.reputation + (e.reputation ?? 0),
        money: infiniteMoney.current ? 999999 : Math.max(0, s.money + (e.money ?? 0)),
      }))
      if ((e.reputation ?? 0) > 0) playSfx("level-up")
    }
    if (outcome.secretEnding) setEnding("secret")
    if (outcome.finalEnding) setEnding("final")
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
      playSfxLimited(
        name,
        maxSec,
        purchase.soundVolume ?? (name === "throw-rats" ? 0.5 : 0.8),
        purchase.soundStartAt ?? 0,
      )
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

    // Разблоки��овки
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
    // Ловить крыс никогда не меняется
    { id: "rats", img: "/img/action-rats.png", label: "Ловить крыс: сытость +20" },
    // После покупки бассейна "купаться в мусорке" меняется на "купаться в мусорном бассейне"
    unlocked.pool
      ? { id: "bath", img: "/img/action-pool.png", label: "Купаться в мусорном бассейне: вода +20, счастье +20" }
      : { id: "bath", img: "/img/action-bath.png", label: "Купаться в мусорке: вода +10, счастье +15" },
    // После прокачки "пердеть по-крупному" кнопка линейки меняется на родительское собрание
    unlocked.smoke
      ? { id: "fart", img: "/img/action-fart-upgraded.png", label: "Пердеть на родительском собрании: счастье +25, +3$" }
      : { id: "fart", img: "/img/action-fart.png", label: "Пердеть на линейке: счастье +20" },
  ]
  // Злата — отдельная кнопка после покупки, остальные не заменяет
  if (unlocked.zlata) {
    actions.push({ id: "zlata", img: "/img/action-zlata.png", label: "Поиграться с Златой: счастье +50" })
  }

  // Секретная концовка: джин услышал
  if (ending === "secret") {
    return (
      <main className="relative flex h-dvh w-full flex-col items-center justify-center gap-6 overflow-hidden bg-black px-8">
        <h1 className="text-center text-4xl font-bold text-yellow-400 text-balance md:text-5xl">
          СЕКРЕТНАЯ КОНЦОВКА
        </h1>
        <p className="text-center text-lg text-yellow-200 text-pretty">
          Джин услышал Сашу. +999 репутации. Саша стал легендой всех помоек мира.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-xl bg-yellow-600 px-8 py-4 text-xl font-bold text-black transition-colors hover:bg-yellow-500"
        >
          Начать заново
        </button>
      </main>
    )
  }

  // Финальная концовка: УЖИВИТИК 666
  if (ending === "final") {
    return (
      <main className="relative flex h-dvh w-full flex-col items-center justify-center gap-6 overflow-hidden bg-black px-8">
        <h1 className="text-center text-4xl font-bold text-red-600 text-balance md:text-5xl">{'УЖИВИТИК 666'}</h1>
        <p className="text-center text-lg text-neutral-400 text-pretty">
          Саша снялся в фильме Арсения. Карьера окончена. Это конец.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-xl bg-red-700 px-8 py-4 text-xl font-bold text-white transition-colors hover:bg-red-600"
        >
          Начать заново
        </button>
      </main>
    )
  }

  // Смерть Саши: один из показателей упал до нуля
  if (dead) {
    return (
      <main className="relative flex h-dvh w-full flex-col items-center justify-center gap-6 overflow-hidden bg-black px-8">
        <h1 className="text-center text-4xl font-bold text-red-600 text-balance md:text-5xl">Саша умер...</h1>
        <p className="text-center text-lg text-neutral-400 text-pretty">
          Один из показателей упал до нуля. Помойка осталась без хозяина.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-xl bg-red-700 px-8 py-4 text-xl font-bold text-white transition-colors hover:bg-red-600"
        >
          Начать заново
        </button>
      </main>
    )
  }

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
          emperor={unlocked.emperor}
        />
      )}

      <IndicatorPanel
        happiness={stats.happiness}
        satiety={stats.satiety}
        water={stats.water}
        reputation={stats.reputation}
        money={stats.money}
      />

      {activeEvent && <EventModal event={activeEvent} onResolve={handleEventResolve} />}

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} onCode={handleCheatCode} />}
    </main>
  )
}
