"use client"

import type { Purchase } from "@/lib/game-data"

export interface ActionDef {
  id: string
  img: string
  label: string
}

interface DecisionsScreenProps {
  actions: ActionDef[]
  cooldowns: Record<string, number>
  purchase: Purchase | null
  canAfford: boolean
  onAction: (id: string) => void
  onBuy: () => void
  onExit: () => void
}

export function DecisionsScreen({
  actions,
  cooldowns,
  purchase,
  canAfford,
  onAction,
  onBuy,
  onExit,
}: DecisionsScreenProps) {
  return (
    <div className="absolute inset-0">
      {/* Фон решений */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/img/bg-decisions.png"
        alt="Школьный класс"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Действия — слева, две колонки со смещением как в оригинале */}
      <div className="absolute top-16 left-4 z-20 flex items-start gap-5">
        <div className="flex flex-col gap-8">
          {actions
            .filter((_, i) => i % 2 === 0)
            .map((action) => (
              <ActionButton key={action.id} action={action} cd={cooldowns[action.id] ?? 0} onAction={onAction} />
            ))}
        </div>
        <div className="mt-32 flex flex-col gap-8">
          {actions
            .filter((_, i) => i % 2 === 1)
            .map((action) => (
              <ActionButton key={action.id} action={action} cd={cooldowns[action.id] ?? 0} onAction={onAction} />
            ))}
        </div>
      </div>

      {/* Текущая покупка — по центру почти в самом низу */}
      {purchase && (
        <button
          type="button"
          onClick={onBuy}
          className="absolute bottom-4 left-1/2 z-20 w-64 -translate-x-1/2 transition-transform hover:scale-105 active:scale-95 md:w-80 lg:w-96"
          aria-label="Купить улучшение"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={purchase.img || "/placeholder.svg"} alt="Улучшение" className="h-auto w-full drop-shadow-xl" />
        </button>
      )}

      {/* Кнопка выхода — справа */}
      <button
        type="button"
        onClick={onExit}
        className="absolute right-6 bottom-1/3 z-20 w-40 transition-transform hover:scale-105 active:scale-95 md:w-48 lg:w-56"
        aria-label="Вернуться на главный экран"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/btn-exit.png" alt="Выход" className="h-auto w-full drop-shadow-lg" />
      </button>
    </div>
  )
}

function ActionButton({
  action,
  cd,
  onAction,
}: {
  action: ActionDef
  cd: number
  onAction: (id: string) => void
}) {
  const onCd = cd > 0
  return (
    <button
      type="button"
      onClick={() => onAction(action.id)}
      disabled={onCd}
      className="relative w-48 transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed md:w-56 lg:w-64"
      aria-label={action.label}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={action.img || "/placeholder.svg"}
        alt={action.label}
        className="h-auto w-full drop-shadow-lg"
        style={onCd ? { filter: "brightness(0.4)" } : undefined}
      />
      {onCd && (
        <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]">
          {cd}
        </span>
      )}
    </button>
  )
}
