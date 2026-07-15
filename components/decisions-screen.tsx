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
              className="relative w-40 transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed md:w-48 lg:w-56"
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
          className="absolute bottom-8 left-1/2 z-20 w-64 -translate-x-1/4 transition-transform hover:scale-105 active:scale-95 md:w-80 lg:w-96"
          aria-label="Купить улучшение"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={purchase.img || "/placeholder.svg"} alt="Улучшение" className="h-auto w-full drop-shadow-xl" />
          {!canAfford && (
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/80 px-3 py-1 text-sm font-bold whitespace-nowrap text-red-400">
              {`нужно ${purchase.cost}$${purchase.satietyCost ? ` и ${purchase.satietyCost} сытости` : ""}`}
            </span>
          )}
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
