"use client"

import { useState } from "react"
import { playSfx } from "@/lib/audio"

// Обучение при первом запуске: несколько шагов, объясняющих как играть

interface TutorialStep {
  title: string
  lines: string[]
  img?: string
}

const STEPS: TutorialStep[] = [
  {
    title: "Добро пожаловать на помойку!",
    lines: [
      "Ты — Саша Пораша, будущий император всех мусорок.",
      "Твоя цель — выжить, разбогатеть и построить ИМПЕРИЮ МУСОРА.",
    ],
    img: "/img/sasha.png",
  },
  {
    title: "Тыкай на Сашу",
    lines: [
      "Каждое нажатие на Сашу на главном экране приносит 1$.",
      "Деньги нужны для покупки улучшений — кликай почаще!",
    ],
    img: "/img/sasha.png",
  },
  {
    title: "Следи за показателями",
    lines: [
      "Сверху — счастье, сытость и вода. Они постоянно падают.",
      "Если любой из них упадёт до нуля — Саша умрёт!",
      "Также есть репутация и деньги — они нужны для развития.",
    ],
    img: "/img/indicator.png",
  },
  {
    title: 'Экран "Решения"',
    lines: [
      "Слева — действия: ловить крыс (сытость), купаться (вода), пердеть (счастье).",
      "У действий есть перезарядка — используй их вовремя!",
      "Внизу по центру — кнопка покупки. Всего 30 улучшений подряд!",
    ],
    img: "/img/btn-decisions.png",
  },
  {
    title: "События и развитие",
    lines: [
      "После покупок случаются события с выбором — выбирай с умом.",
      "Захвати Давлекановку, следи за стабильностью города и подавляй протесты.",
      "Удачи, будущий император мусора!",
    ],
    img: "/img/buy-30-empire.png",
  },
]

export function TutorialModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  const next = () => {
    playSfx("click", 0.8)
    if (isLast) onClose()
    else setStep((s) => s + 1)
  }

  const skip = () => {
    playSfx("click", 0.8)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Обучение"
    >
      <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border-4 border-red-700 bg-neutral-950 p-6 short:max-w-sm short:gap-2 short:p-4">
        {current.img && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current.img || "/placeholder.svg"}
            alt=""
            className="h-24 w-auto object-contain drop-shadow-lg short:h-16"
          />
        )}
        <h2 className="text-center text-2xl font-bold text-red-500 text-balance short:text-xl">{current.title}</h2>
        <div className="flex flex-col gap-1.5">
          {current.lines.map((line) => (
            <p key={line} className="text-center text-sm leading-relaxed text-neutral-200 text-pretty">
              {line}
            </p>
          ))}
        </div>

        {/* Точки прогресса */}
        <div className="flex items-center gap-2" aria-label={`Шаг ${step + 1} из ${STEPS.length}`}>
          {STEPS.map((s, i) => (
            <span
              key={s.title}
              className={`h-2.5 w-2.5 rounded-full ${i === step ? "bg-red-500" : "bg-neutral-700"}`}
            />
          ))}
        </div>

        <div className="flex w-full items-center justify-between gap-3">
          <button
            type="button"
            onClick={skip}
            className="rounded-lg px-4 py-2.5 text-sm font-semibold text-neutral-400 transition-colors hover:text-neutral-200"
          >
            Пропустить
          </button>
          <button
            type="button"
            onClick={next}
            className="rounded-xl bg-red-700 px-6 py-2.5 text-base font-bold text-white transition-colors hover:bg-red-600"
          >
            {isLast ? "Играть!" : "Дальше"}
          </button>
        </div>
      </div>
    </div>
  )
}
