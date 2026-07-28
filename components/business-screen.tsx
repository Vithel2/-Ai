"use client"

import { BUSINESSES, businessIncome, nextLevelCost, totalBusinessIncome } from "@/lib/business-data"

interface BusinessScreenProps {
  money: number
  /** Уровни бизнесов по id */
  levels: Record<string, number>
  /** Сколько прокачек уже куплено — от этого зависит, какие бизнесы открыты */
  purchaseIndex: number
  onExit: () => void
  onUpgrade: (id: string) => void
}

/**
 * Экран «Решение бизнеса».
 * Бизнесы покупаются и улучшаются за деньги и дают пассивный доход,
 * чтобы накопленные деньги было куда вкладывать.
 */
export function BusinessScreen({ money, levels, purchaseIndex, onExit, onUpgrade }: BusinessScreenProps) {
  const income = totalBusinessIncome(levels)

  return (
    <div className="absolute inset-0 z-30 overflow-y-auto">
      {/* Фон экрана бизнеса */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/img/business-bg.png"
        alt="Мусорный бизнес и растущий график"
        className="fixed inset-0 h-full w-full object-cover"
      />
      {/* Затемнение, чтобы карточки читались */}
      <div className="fixed inset-0 bg-black/60" aria-hidden="true" />

      {/* Кнопка выхода — слева по центру, как на экране города */}
      <button
        type="button"
        onClick={onExit}
        className="fixed top-1/2 left-3 z-40 w-16 -translate-y-1/2 transition-transform hover:scale-110 active:scale-95 md:w-20 short:left-1 short:w-10"
        aria-label="Выйти из решений бизнеса"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/city-exit.png" alt="Выход" className="h-auto w-full -scale-x-100 drop-shadow-lg" />
      </button>

      <div className="relative mx-auto flex w-full max-w-2xl flex-col items-center gap-6 px-14 py-8 md:px-20 short:gap-3 short:py-3">
        <h2 className="text-center text-3xl font-bold text-white text-balance drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] md:text-4xl short:text-xl">
          Решение бизнеса
        </h2>

        {/* Сводка: сколько денег и сколько приносит бизнес */}
        <div className="flex w-full items-center justify-between rounded-2xl border-2 border-yellow-700 bg-black/70 p-4 backdrop-blur-sm">
          <span className="text-lg font-bold text-yellow-400">{`${Math.floor(money)}$`}</span>
          <span className="text-sm text-neutral-300">{`Бизнес приносит: ${income.toFixed(1)}$/сек`}</span>
        </div>

        <div className="flex w-full flex-col gap-4">
          {BUSINESSES.map((b) => {
            const level = levels[b.id] ?? 0
            const locked = purchaseIndex < b.unlockAtPurchase
            const maxed = level >= b.maxLevel
            const cost = nextLevelCost(b, level)
            const canBuy = !locked && !maxed && money >= cost
            const gain = businessIncome(b, level)

            return (
              <div
                key={b.id}
                className={`flex w-full flex-col gap-3 rounded-2xl border-2 bg-black/70 p-4 backdrop-blur-sm ${
                  locked ? "border-neutral-800 opacity-60" : "border-neutral-700"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-white text-pretty short:text-base">{b.name}</span>
                    <span className="text-sm text-neutral-400 text-pretty">{b.desc}</span>
                  </div>
                  <span className="shrink-0 rounded-lg bg-neutral-800 px-2 py-1 text-sm font-bold text-lime-400">
                    {`ур. ${level}/${b.maxLevel}`}
                  </span>
                </div>

                {/* Полоса уровня */}
                <div
                  className="h-3 w-full overflow-hidden rounded-full border border-neutral-800 bg-neutral-900"
                  role="progressbar"
                  aria-valuenow={level}
                  aria-valuemin={0}
                  aria-valuemax={b.maxLevel}
                  aria-label={`Уровень ${b.name}`}
                >
                  <div
                    className="h-full rounded-full bg-lime-500 transition-all"
                    style={{ width: `${(level / b.maxLevel) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-neutral-300">
                    {gain > 0 ? `Приносит ${gain.toFixed(1)}$/сек` : "Пока не приносит"}
                  </span>

                  {locked ? (
                    <span className="text-sm font-bold text-neutral-400">
                      {`Откроется после ${b.unlockAtPurchase}-й прокачки`}
                    </span>
                  ) : maxed ? (
                    <span className="text-sm font-bold text-lime-400">Максимум</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onUpgrade(b.id)}
                      disabled={!canBuy}
                      className="rounded-xl border-2 border-yellow-600 bg-yellow-500 px-4 py-2 text-base font-bold text-black transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:grayscale short:text-sm"
                      aria-label={`${level === 0 ? "Открыть" : "Улучшить"} ${b.name}: цена ${cost} долларов, плюс ${b.incomePerLevel} долларов в секунду`}
                    >
                      {`${level === 0 ? "Открыть" : "Улучшить"} — ${cost}$`}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
