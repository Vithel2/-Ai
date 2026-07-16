"use client"

interface BusinessScreenProps {
  onExit: () => void
}

/**
 * Экран «Решение бизнеса».
 * Пока пустой — фон и кнопки появятся позже (картинки будут заменены,
 * когда пользователь их пришлёт).
 */
export function BusinessScreen({ onExit }: BusinessScreenProps) {
  return (
    <div className="absolute inset-0 overflow-y-auto bg-neutral-900">
      {/* Временный фон — будет заменён картинкой пользователя */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-800 to-neutral-950" aria-hidden="true" />

      {/* Кнопка выхода — слева по центру, как на экране города.
          Картинка будет заменена, когда пользователь пришлёт свою. */}
      <button
        type="button"
        onClick={onExit}
        className="fixed top-1/2 left-3 z-40 w-16 -translate-y-1/2 transition-transform hover:scale-110 active:scale-95 md:w-20 short:left-1 short:w-10"
        aria-label="Выйти из решений бизнеса"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/city-exit.png" alt="Выход" className="h-auto w-full -scale-x-100 drop-shadow-lg" />
      </button>

      <div className="relative mx-auto flex min-h-full w-full max-w-2xl flex-col items-center justify-center gap-6 px-14 py-8 md:px-20 short:gap-3 short:py-3">
        <h2 className="text-center text-3xl font-bold text-white text-balance drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] md:text-4xl short:text-xl">
          Решение бизнеса
        </h2>
        <p className="text-center text-lg text-neutral-400 text-pretty short:text-sm">Скоро здесь появится бизнес...</p>
      </div>
    </div>
  )
}
