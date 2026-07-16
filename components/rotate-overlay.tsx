"use client"

// Заглушка для телефонов в вертикальном положении:
// игра играется только горизонтально, поэтому просим перевернуть телефон.
// Показывается только через CSS (portrait-narrow), без JS-логики.
export function RotateOverlay() {
  return (
    <div
      className="rotate-overlay fixed inset-0 z-[100] flex-col items-center justify-center gap-6 bg-black px-8"
      role="alert"
      aria-label="Переверните телефон горизонтально, чтобы играть"
    >
      {/* Иконка телефона, повёрнутая на бок */}
      <svg
        width="96"
        height="96"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-[spin_3s_ease-in-out_infinite] text-lime-400 [animation-direction:alternate]"
        aria-hidden="true"
      >
        <rect x="7" y="2" width="10" height="20" rx="2" />
        <path d="M11 18h2" />
      </svg>
      <p className="text-center text-2xl font-bold text-white text-balance">Переверни телефон!</p>
      <p className="text-center text-base leading-relaxed text-neutral-400 text-pretty">
        В Симулятор СашиПораши можно играть только в горизонтальном положении.
      </p>
    </div>
  )
}
