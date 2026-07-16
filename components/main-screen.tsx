"use client"

import { useState } from "react"

interface MainScreenProps {
  onSashaClick: () => void
  onOpenDecisions: () => void
  onOpenSettings: () => void
  cityUnlocked: boolean
  onOpenCity: () => void
}

export function MainScreen({ onSashaClick, onOpenDecisions, onOpenSettings, cityUnlocked, onOpenCity }: MainScreenProps) {
  const [pressed, setPressed] = useState(false)

  function handleSasha() {
    if (pressed) return
    onSashaClick()
    // Саша сужается и темнеет на 1 секунду — в это время кликать нельзя
    setPressed(true)
    setTimeout(() => setPressed(false), 1000)
  }

  return (
    <div className="absolute inset-0">
      {/* Задний фон */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/img/bg-main.jpg" alt="Куча мусора с диваном" className="absolute inset-0 h-full w-full object-cover" />

      {/* Кнопка настроек — левый верхний угол */}
      <button
        type="button"
        onClick={onOpenSettings}
        className="absolute top-4 left-4 z-20 w-36 transition-transform hover:scale-105 active:scale-95 md:w-44 lg:w-48"
        aria-label="Открыть настройки"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/btn-settings.png" alt="Настройки" className="h-auto w-full drop-shadow-lg" />
      </button>

      {/* Кнопка Город (стабильность и армия) — над кнопкой Решения.
          Заблокирована до захвата Давлекановки. */}
      <button
        type="button"
        onClick={cityUnlocked ? onOpenCity : undefined}
        disabled={!cityUnlocked}
        className={`absolute bottom-44 left-8 z-20 w-32 transition-transform md:bottom-52 md:w-36 lg:bottom-60 lg:w-40 ${
          cityUnlocked ? "hover:scale-105 active:scale-95" : "cursor-not-allowed opacity-50 grayscale"
        }`}
        aria-label={
          cityUnlocked
            ? "Открыть решения стабильности и армии"
            : "Решения стабильности и армии: откроется после захвата Давлекановки"
        }
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/city-main.png" alt="Решение стабильности и армии" className="h-auto w-full drop-shadow-lg" />
      </button>

      {/* Кнопка Решения — левый нижний угол */}
      <button
        type="button"
        onClick={onOpenDecisions}
        className="absolute bottom-8 left-8 z-20 w-52 transition-transform hover:scale-105 active:scale-95 md:w-64 lg:w-72"
        aria-label="Открыть решения"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/btn-decisions.png" alt="Решения" className="h-auto w-full drop-shadow-lg" />
      </button>

      {/* Саша — правый нижний угол */}
      <button
        type="button"
        onClick={handleSasha}
        disabled={pressed}
        className="absolute right-0 bottom-0 z-20 w-64 cursor-pointer transition-all duration-300 md:w-80 lg:w-96"
        style={pressed ? { transform: "scale(0.92)", filter: "brightness(0.6)" } : undefined}
        aria-label="Нажать на Сашу и получить один доллар"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/sasha.png" alt="Саша" className="h-auto w-full" />
      </button>
    </div>
  )
}
