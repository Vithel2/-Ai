"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { IndicatorPanel } from "@/components/indicator-panel"
import { MainScreen } from "@/components/main-screen"
import { DecisionsScreen, type ActionDef } from "@/components/decisions-screen"
import { SettingsModal } from "@/components/settings-modal"
import { EventModal } from "@/components/event-modal"
import { CityScreen, RAT_UPKEEP_PER_RAT, type CityState } from "@/components/city-screen"
import { PURCHASES } from "@/lib/game-data"
import { GAME_EVENTS, type EventOutcome, type GameEvent } from "@/lib/events-data"
import { preloadAssets } from "@/lib/preload"
import { loadSave, writeSave, clearSave } from "@/lib/save"
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
  const [screen, setScreen] = useState<"main" | "decisions" | "city">("main")
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

  // Город: стабильность, армия крыс, протесты (открывается после захвата Давлекановки)
  const [city, setCity] = useState<CityState>({ stability: 100, rats: 0, protest: null })
  const cityRef = useRef(city)
  cityRef.current = city

  // Ивенты
  const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null)
  const [ending, setEnding] = useState<"secret" | "final" | "coup" | null>(null)
  const eventsDone = useRef<Set<string>>(new Set())
  const lampFailed = useRef(false)
  // Задержка только для ивентов без привязки к покупке (ЖОПА ПОЛНАЯ 2 после лампы)
  const nextEventAllowedAt = useRef(Date.now() + 10000)

  // Пока открыты настройки, ивент или концовка — игра на паузе
  const pausedRef = useRef(false)
  pausedRef.current = showSettings || dead || !!activeEvent || !!ending

  // Актуальный прогресс покупок для проверки условий ивентов внутри цикла
  const purchaseIndexRef = useRef(0)
  purchaseIndexRef.current = purchaseIndex
  const reputationRef = useRef(0)
  reputationRef.current = stats.reputation

  // Город открыт после захвата Давлекановки
  const captureIndex = PURCHASES.findIndex((p) => p.id === "capture")
  const cityUnlocked = captureIndex >= 0 && purchaseIndex > captureIndex
  const cityUnlockedRef = useRef(false)
  cityUnlockedRef.current = cityUnlocked

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

  // Восстановление сохранённой игры при запуске.
  // Флаг через state: автосохранение включается только в рендере с уже применёнными данными,
  // иначе первый рендер перезатирает сохранение начальными значениями.
  const [restored, setRestored] = useState(false)
  useEffect(() => {
    const save = loadSave()
    if (save) {
      // Сначала восстанавливаем refs, чтобы эффекты от setState видели актуальные данные
      eventsDone.current = new Set(save.eventsDone)
      lampFailed.current = save.lampFailed
      incomePerSec.current = save.incomePerSec
      happinessPer3Sec.current = save.happinessPer3Sec
      setStats(save.stats)
      setPurchaseIndex(save.purchaseIndex)
      setUnlocked(save.unlocked)
      if (save.city) setCity(save.city)
    }
    setRestored(true)
  }, [])

  // Автосохранение прогресса
  useEffect(() => {
    if (!restored || dead || ending) return
    writeSave({
      stats,
      purchaseIndex,
      unlocked,
      eventsDone: Array.from(eventsDone.current),
      lampFailed: lampFailed.current,
      incomePerSec: incomePerSec.current,
      happinessPer3Sec: happinessPer3Sec.current,
      city,
    })
  }, [restored, stats, purchaseIndex, unlocked, dead, ending, city])

  // Смерть или концовка — сохранение стирается, игра начинается заново
  useEffect(() => {
    if (dead || ending) clearSave()
  }, [dead, ending])

  // Ивенты появляются сразу после нужной покупки (с небольшой паузой на звук покупки)
  useEffect(() => {
    if (!restored || purchaseIndex === 0) return
    const purchased = new Set(PURCHASES.slice(0, purchaseIndex).map((p) => p.id))
    const ctx = {
      purchased,
      reputation: reputationRef.current,
      lampFailed: lampFailed.current,
      eventsDone: eventsDone.current,
    }
    const nextEvent = GAME_EVENTS.find((e) => !eventsDone.current.has(e.id) && e.condition(ctx))
    if (nextEvent) {
      eventsDone.current.add(nextEvent.id)
      const t = setTimeout(() => setActiveEvent(nextEvent), 1200)
      return () => clearTimeout(t)
    }
  }, [purchaseIndex])

  // Игровой цикл: 1 тик в секунду
  useEffect(() => {
    const interval = setInterval(() => {
      // В настройках или после смерти все процессы стоят
      if (pausedRef.current) return

      tickCount.current++
      const now = Date.now()
      tempBonuses.current = tempBonuses.current.filter((b) => b.until > now)

      // Проверка ивентов, не привязанных к покупкам (например, ЖОПА ПОЛНАЯ 2 после лампы)
      if (now >= nextEventAllowedAt.current) {
        const purchased = new Set(PURCHASES.slice(0, purchaseIndexRef.current).map((p) => p.id))
        const ctx = {
          purchased,
          reputation: reputationRef.current,
          lampFailed: lampFailed.current,
          eventsDone: eventsDone.current,
        }
        const nextEvent = GAME_EVENTS.find((e) => !eventsDone.current.has(e.id) && e.condition(ctx))
        if (nextEvent) {
          eventsDone.current.add(nextEvent.id)
          setActiveEvent(nextEvent)
        }
      }

      // Город: стабильность падает, протесты растут, содержание крыс списывается
      if (cityUnlockedRef.current) {
        setCity((c) => {
          if (c.protest) {
            // Протест: сила растёт (быстрее после лёгкого подавления)
            const fast = c.protest.fastUntil > now
            const growth = fast ? 1.2 : 0.5
            const strength = c.protest.strength + growth
            // Сила выше 50% — с каждым приростом растёт шанс переворота
            if (strength > 50 && Math.random() < (strength - 50) / 400) {
              setEnding("coup")
              return c
            }
            if (strength >= 100) {
              setEnding("coup")
              return c
            }
            return { ...c, protest: { ...c.protest, strength } }
          }
          // Мирное время: стабильность постепенно падает сама
          const stability = Math.max(0, c.stability - 0.6)
          if (stability < 20) {
            // Начался протест: стабильность скрывается, сила протеста растёт с малого
            return { ...c, stability, protest: { strength: 5, fastUntil: 0 } }
          }
          return { ...c, stability }
        })
      }

      setStats((s) => {
        let { happiness, satiety, water, reputation, money } = s

        // Пассивный доход
        money += incomePerSec.current

        // Содержание армии крыс
        if (cityUnlockedRef.current && cityRef.current.rats > 0) {
          money -= cityRef.current.rats * RAT_UPKEEP_PER_RAT
        }

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

        // С��ерть: любой из показателей (счастье, сытость, вода) упал до нуля
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
    nextEventAllowedAt.current = Date.now() + 10000

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

  // Действия города
  const spendReputation = useCallback((amount: number): boolean => {
    let ok = false
    setStats((s) => {
      if (s.reputation < amount) return s
      ok = true
      return { ...s, reputation: s.reputation - amount }
    })
    return ok
  }, [])

  const handlePropaganda = useCallback(() => {
    if (reputationRef.current < 5) return
    playSfx("click", 0.8)
    spendReputation(5)
    setCity((c) => ({ ...c, stability: Math.min(100, c.stability + 2) }))
  }, [spendReputation])

  const handleBribe = useCallback(() => {
    if (reputationRef.current < 15) return
    playSfx("click", 0.8)
    spendReputation(15)
    setCity((c) => ({ ...c, stability: Math.min(100, c.stability + 7) }))
  }, [spendReputation])

  const handlePrison = useCallback(() => {
    if (reputationRef.current < 50) return
    playSfx("click", 0.8)
    spendReputation(50)
    // Сразу -10% стабильности, через 10 секунд +50%
    setCity((c) => ({ ...c, stability: Math.max(0, c.stability - 10) }))
    setTimeout(() => {
      setCity((c) => ({ ...c, stability: Math.min(100, c.stability + 50) }))
      playSfx("level-up")
    }, 10000)
  }, [])

  const handleHireRat = useCallback(() => {
    setStats((s) => {
      if (s.money < 5) return s
      setCity((c) => ({ ...c, rats: c.rats + 1 }))
      playSfx("click", 0.8)
      return { ...s, money: infiniteMoney.current ? 999999 : s.money - 5 }
    })
  }, [])

  const handleSuppress = useCallback(
    (level: "light" | "mid" | "hard") => {
      const c = cityRef.current
      if (!c.protest) return
      const cost = { light: { rats: 2, rep: 5 }, mid: { rats: 5, rep: 10 }, hard: { rats: 10, rep: 15 } }[level]
      if (c.rats < cost.rats || reputationRef.current < cost.rep) return
      spendReputation(cost.rep)
      playSfx("click", 0.8)

      // Шанс переворота: лёгкое 0%, среднее 5%, сильное 10%
      const coupChance = level === "mid" ? 0.05 : level === "hard" ? 0.1 : 0
      if (Math.random() < coupChance) {
        setEnding("coup")
        return
      }

      setCity((prev) => {
        if (!prev.protest) return prev
        const rats = prev.rats - cost.rats
        let strength = prev.protest.strength
        let fastUntil = prev.protest.fastUntil
        if (level === "light") {
          strength -= 2
          // Временно сила протеста растёт быстрее
          fastUntil = Date.now() + 15000
        } else if (level === "mid") {
          strength -= 5
        } else {
          strength = 0
        }
        if (strength <= 0) {
          // Протест успешно подавлен — стабильность возвращается на 35%
          playSfx("level-up")
          return { stability: 35, rats, protest: null }
        }
        return { ...prev, rats, protest: { strength, fastUntil } }
      })
    },
    [spendReputation],
  )

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
      setCooldowns((cds) => ({ ...cds, [id]: 8 }))
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
        setCooldowns((cds) => ({ ...cds, zlata: 18 }))
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

    // Звуки покупки: обрезаем по лимиту (по умолчанию 4 сек), "метаться крысами" — п��тише
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
          onClick={() => {
            clearSave()
            window.location.reload()
          }}
          className="rounded-xl bg-yellow-600 px-8 py-4 text-xl font-bold text-black transition-colors hover:bg-yellow-500"
        >
          Начать заново
        </button>
      </main>
    )
  }

  // Финальная концовка: ФИЛЬМ ЖОПА ПОЛНАЯ 2
  if (ending === "final") {
    return (
      <main className="relative flex h-dvh w-full flex-col items-center justify-center gap-6 overflow-hidden bg-black px-8">
        <h1 className="text-center text-4xl font-bold text-red-600 text-balance md:text-5xl">
          {'ФИЛЬМ "ЖОПА ПОЛНАЯ 2"'}
        </h1>
        <p className="text-center text-lg text-neutral-400 text-pretty">
          Саша снялся в фильме Арсения. Карьера окончена. Это конец.
        </p>
        <button
          type="button"
          onClick={() => {
            clearSave()
            window.location.reload()
          }}
          className="rounded-xl bg-red-700 px-8 py-4 text-xl font-bold text-white transition-colors hover:bg-red-600"
        >
          Начать заново
        </button>
      </main>
    )
  }

  // Переворот: протест победил
  if (ending === "coup") {
    return (
      <main className="relative flex h-dvh w-full flex-col items-center justify-center gap-6 overflow-hidden bg-black px-8">
        <h1 className="text-center text-4xl font-bold text-red-600 text-balance md:text-5xl">ПЕРЕВОРОТ!</h1>
        <p className="text-center text-lg text-neutral-400 text-pretty">
          Протест победил. Сашу свергли с трона Крысятиново. Помойка больше не его.
        </p>
        <button
          type="button"
          onClick={() => {
            clearSave()
            window.location.reload()
          }}
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
          onClick={() => {
            clearSave()
            window.location.reload()
          }}
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
          cityUnlocked={cityUnlocked}
          cityDanger={cityUnlocked && (city.protest !== null || city.stability < 40)}
          onOpenCity={() => setScreen("city")}
        />
      ) : screen === "city" ? (
        <CityScreen
          city={city}
          reputation={stats.reputation}
          money={stats.money}
          onExit={() => setScreen("main")}
          onPropaganda={handlePropaganda}
          onBribe={handleBribe}
          onPrison={handlePrison}
          onHireRat={handleHireRat}
          onSuppress={handleSuppress}
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

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onCode={handleCheatCode}
          onResetProgress={() => {
            clearSave()
            window.location.reload()
          }}
        />
      )}
    </main>
  )
}
