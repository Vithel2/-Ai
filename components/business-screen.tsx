"use client"

import type { Investment } from "@/lib/business-data"

interface BusinessScreenProps {
  onExit: () => void
  investments: Investment[]
  /** Секунды до выплаты по каждому активному вкладу */
  timers: Record<string, number>
  /** Свежие результаты вкладов — бейджи на карточках на несколько секунд */
  results: Record<string, { text: string; ok: boolean }>
  money: number
  onInvest: (id: string) => void
}

/**
 * Экран «Решение бизнеса»: инвестиции.
 * Вкладываешь деньги — через время приходит выплата (кнопка на кулдауне с таймером).
 * «Интим ролики» — рискованный вклад: 50/50 либо ×4, либо бан и потеря репутации.
 */
export function BusinessScreen({ onExit, investments, timers, results, money, onInvest }: BusinessScreenProps) {
  return (
    <div className="absolute inset-0 overflow-y-auto bg-neutral-900">
      {/* Фон экрана бизнеса */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/img/business-bg.png)" }}
        aria-hidden="true"
      />

      {/* Кнопка выхода — слева по центру, как на экране города. */}
      <button
        type="button"
        onClick={onExit}
        className="fixed top-1/2 left-3 z-40 w-16 -translate-y-1/2 transition-transform hover:scale-110 active:scale-95 md:w-20 short:left-1 short:w-10"
        aria-label="Выйти из решений бизнеса"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/city-exit.png" alt="Выход" className="h-auto w-full -scale-x-100 drop-shadow-lg" />
      </button>

      <div className="relative mx-auto flex min-h-full w-full max-w-3xl flex-col items-center justify-center gap-3 px-14 py-6 md:px-16 short:gap-1 short:px-12 short:py-2">
        <h2 className="text-center text-3xl font-bold text-white text-balance drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] md:text-4xl short:text-lg">
          Решение бизнеса
        </h2>
        <div className="grid w-full grid-cols-2 gap-4 short:gap-2">
          {investments.map((inv) => (
            <InvestmentCard
              key={inv.id}
              inv={inv}
              secondsLeft={timers[inv.id] ?? 0}
              result={results[inv.id]}
              affordable={money >= inv.cost}
              onInvest={onInvest}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function InvestmentCard({
  inv,
  secondsLeft,
  result,
  affordable,
  onInvest,
}: {
  inv: Investment
  secondsLeft: number
  result?: { text: string; ok: boolean }
  affordable: boolean
  onInvest: (id: string) => void
}) {
  const active = secondsLeft > 0
  return (
    <div className="flex flex-col items-center gap-1 short:gap-0.5">
      <button
        type="button"
        onClick={() => onInvest(inv.id)}
        disabled={active || !affordable}
        className="relative w-full transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed"
        aria-label={inv.label}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={inv.img}
          alt={inv.label}
          className="h-auto w-full drop-shadow-xl"
          style={active || !affordable ? { filter: "brightness(0.45)" } : undefined}
        />
        {active && (
          <span className="absolute inset-0 flex items-center justify-center text-5xl font-bold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)] short:text-3xl">
            {secondsLeft}
          </span>
        )}
        {result && (
          <span
            className={`absolute inset-x-0 bottom-1 flex items-center justify-center text-xl font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)] short:text-sm ${
              result.ok ? "text-green-400" : "text-red-500"
            }`}
          >
            {result.text}
          </span>
        )}
      </button>
      <p className="text-center text-sm font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] short:text-[10px]">
        {inv.caption}
      </p>
    </div>
  )
}
