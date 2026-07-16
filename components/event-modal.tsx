"use client"

import { useState } from "react"
import type { GameEvent, EventOutcome } from "@/lib/events-data"

interface EventModalProps {
  event: GameEvent
  onResolve: (outcome: EventOutcome) => void
}

/** Выбор случайного исхода по вероятностям */
function rollOutcome(outcomes: EventOutcome[]): EventOutcome {
  const r = Math.random()
  let acc = 0
  for (const o of outcomes) {
    acc += o.chance
    if (r < acc) return o
  }
  return outcomes[outcomes.length - 1]
}

export function EventModal({ event, onResolve }: EventModalProps) {
  const [result, setResult] = useState<EventOutcome | null>(null)

  const handleChoice = (choiceIndex: number) => {
    const outcome = rollOutcome(event.choices[choiceIndex].outcomes)
    // Концовки применяем сразу без экрана результата
    if (outcome.finalEnding || !outcome.text) {
      onResolve(outcome)
      return
    }
    setResult(outcome)
  }

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={event.alt}
    >
      <div className="flex w-full max-w-2xl flex-col items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={event.img || "/placeholder.svg"}
          alt={event.alt}
          className="max-h-[60dvh] w-full rounded-xl border-4 border-red-700 object-contain shadow-2xl"
        />

        {result ? (
          <div className="flex w-full flex-col items-center gap-3">
            <p className="text-center text-xl font-bold text-white text-balance drop-shadow-lg">{result.text}</p>
            <button
              type="button"
              onClick={() => onResolve(result)}
              className="rounded-xl bg-red-700 px-10 py-3 text-lg font-bold text-white transition-colors hover:bg-red-600"
            >
              ОК
            </button>
          </div>
        ) : (
          <div className="flex w-full flex-wrap items-center justify-center gap-3">
            {event.choices.map((choice, i) => (
              <button
                key={choice.label}
                type="button"
                onClick={() => handleChoice(i)}
                className="min-w-40 rounded-xl bg-red-700 px-6 py-3 text-lg font-bold text-white transition-transform hover:scale-105 hover:bg-red-600 active:scale-95"
              >
                {choice.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
