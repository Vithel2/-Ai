"use client"

import { useState, useRef } from "react"

interface FloatText {
  id: number
  x: number
  y: number
}

interface MainScreenProps {
  onSashaClick: () => void
  onOpenDecisions: () => void
}

export function MainScreen({ onSashaClick, onOpenDecisions }: MainScreenProps) {
  const [pressed, setPressed] = useState(false)
  const [floats, setFloats] = useState<FloatText[]>([])
  const nextId = useRef(0)

  function handleSasha(e: React.MouseEvent<HTMLButtonElement>) {
    onSashaClick()
    setPressed(true)
    setTimeout(() => setPressed(false), 150)

    const rect = e.currentTarget.getBoundingClientRect()
    const id = nextId.current++
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setFloats((f) => [...f, { id, x, y }])
    setTimeout(() => setFloats((f) => f.filter((t) => t.id !== id)), 1000)
  }

  return (
    <div className="absolute inset-0">
      {/* Задний фон */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/img/bg-main.jpg" alt="Куча мусора с диваном" className="absolute inset-0 h-full w-full object-cover" />

      {/* Кнопка Решения — левый нижний угол */}
      <button
        type="button"
        onClick={onOpenDecisions}
        className="absolute bottom-6 left-6 z-20 w-36 transition-transform hover:scale-105 active:scale-95 md:w-44"
        aria-label="Открыть решения"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/btn-decisions.png" alt="Решения" className="h-auto w-full drop-shadow-lg" />
      </button>

      {/* Саша — правый нижний угол */}
      <button
        type="button"
        onClick={handleSasha}
        className="absolute right-4 bottom-0 z-20 w-56 cursor-pointer transition-all duration-150 md:w-72"
        style={pressed ? { transform: "scale(0.92)", filter: "brightness(0.55)" } : undefined}
        aria-label="Нажать на Сашу и получить один доллар"
      >
        <span className="relative block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/sasha.png" alt="Саша" className="h-auto w-full" />
          {floats.map((f) => (
            <span
              key={f.id}
              className="float-up pointer-events-none absolute z-30 text-2xl font-bold text-green-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]"
              style={{ left: f.x, top: f.y }}
              aria-hidden="true"
            >
              {"+1$"}
            </span>
          ))}
        </span>
      </button>
    </div>
  )
}
