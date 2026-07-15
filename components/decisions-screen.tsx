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

      {/* Действия — слева снизу */}
      <div className="absolute bottom-4 left-4 z-20 flex items-end gap-3">
        {actions.map((action) => {
          const cd = cooldowns[action.id] ?? 0
          const onCd = cd > 0
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => onAction(action.id)}
              disabled={onCd}
              className="relative w-28 transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed md:w-36"
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
        })}
      </div>

      {/* Текущая покупка — по центру снизу, чуть правее середины */}
      {purchase && (
        <button
          type="button"
          onClick={onBuy}
          className="absolute bottom-6 left-1/2 z-20 w-44 -translate-x-1/4 transition-transform hover:scale-105 active:scale-95 md:w-56"
          style={!canAfford ? { filter: "grayscale(0.7) brightness(0.6)" } : undefined}
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
        className="absolute right-4 bottom-24 z-20 w-32 transition-transform hover:scale-105 active:scale-95 md:w-40"
        aria-label="Вернуться на главный экран"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/btn-exit.png" alt="Выход" className="h-auto w-full drop-shadow-lg" />
      </button>
    </div>
  )
}
