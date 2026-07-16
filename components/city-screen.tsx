"use client"

// Вкладка «Город»: стабильность, армия крыс и подавление протестов.
// Открывается с главного экрана после захвата Давлекановки.

export interface CityState {
  stability: number
  rats: number
  /** null — протеста нет; иначе сила протеста 0–100 */
  protest: { strength: number; fastUntil: number } | null
}

export const RAT_UPKEEP_PER_RAT = 0.5

interface CityScreenProps {
  city: CityState
  reputation: number
  money: number
  onExit: () => void
  onPropaganda: () => void
  onBribe: () => void
  onPrison: () => void
  onHireRat: () => void
  onSuppress: (level: "light" | "mid" | "hard") => void
}

export function CityScreen({
  city,
  reputation,
  money,
  onExit,
  onPropaganda,
  onBribe,
  onPrison,
  onHireRat,
  onSuppress,
}: CityScreenProps) {
  const protest = city.protest
  const upkeep = city.rats * RAT_UPKEEP_PER_RAT

  return (
    <div className="absolute inset-0 z-30 flex flex-col overflow-y-auto bg-black/90 px-4 py-6">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-5">
        <div className="flex w-full items-center justify-between">
          <h2 className="text-2xl font-bold text-white text-balance">{protest ? "ПРОТЕСТ!" : "Город"}</h2>
          <button
            type="button"
            onClick={onExit}
            className="rounded-xl bg-red-700 px-6 py-2 text-lg font-bold text-white transition-colors hover:bg-red-600"
          >
            Назад
          </button>
        </div>

        {protest ? (
          /* ПРОТЕСТ: вместо стабильности — сила протеста и подавление */
          <div className="flex w-full flex-col items-center gap-4">
            <div className="w-full">
              <div className="mb-1 flex justify-between text-sm font-bold text-red-400">
                <span>Сила протеста</span>
                <span>{Math.round(protest.strength)}%</span>
              </div>
              <div
                className="h-5 w-full overflow-hidden rounded-full bg-neutral-800"
                role="progressbar"
                aria-valuenow={Math.round(protest.strength)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Сила протеста"
              >
                <div
                  className="h-full rounded-full bg-red-600 transition-all"
                  style={{ width: `${Math.min(100, protest.strength)}%` }}
                />
              </div>
              {protest.strength > 50 && (
                <p className="mt-1 text-center text-sm font-bold text-red-500">
                  Сила выше 50% — растёт риск переворота!
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => onSuppress("light")}
                disabled={city.rats < 2 || reputation < 5}
                className="w-full transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:grayscale"
                aria-label="Лёгкое подавление: 2 крысы, минус 5 репутации, минус 2 силы протеста"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/img/city-supp-light.png" alt="Лёгкое подавление" className="h-auto w-full drop-shadow-lg" />
              </button>
              <button
                type="button"
                onClick={() => onSuppress("mid")}
                disabled={city.rats < 5 || reputation < 10}
                className="w-full transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:grayscale"
                aria-label="Среднее подавление: 5 крыс, минус 10 репутации, минус 5 сил протеста"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/img/city-supp-mid.png" alt="Среднее подавление" className="h-auto w-full drop-shadow-lg" />
              </button>
              <button
                type="button"
                onClick={() => onSuppress("hard")}
                disabled={city.rats < 10 || reputation < 15}
                className="w-full transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:grayscale"
                aria-label="Сильное подавление: 10 крыс, минус 15 репутации, снимает весь протест"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/img/city-supp-hard.png" alt="Сильное подавление" className="h-auto w-full drop-shadow-lg" />
              </button>
            </div>
          </div>
        ) : (
          /* МИРНОЕ ВРЕМЯ: стабильность и решения на неё */
          <div className="flex w-full flex-col items-center gap-4">
            <div className="w-full">
              <div className="mb-1 flex justify-between text-sm font-bold text-lime-400">
                <span>Стабильность</span>
                <span>{Math.round(city.stability)}%</span>
              </div>
              <div
                className="h-5 w-full overflow-hidden rounded-full bg-neutral-800"
                role="progressbar"
                aria-valuenow={Math.round(city.stability)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Стабильность"
              >
                <div
                  className="h-full rounded-full bg-lime-500 transition-all"
                  style={{ width: `${Math.min(100, city.stability)}%` }}
                />
              </div>
              {city.stability < 30 && (
                <p className="mt-1 text-center text-sm font-bold text-orange-400">
                  Стабильность падает! Ниже 20% начнётся протест.
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={onPropaganda}
                disabled={reputation < 5}
                className="w-full transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:grayscale"
                aria-label="Начать пропаганду: цена 5 репутации, стабильность плюс 2 процента"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/img/city-propaganda.png" alt="Начать пропаганду" className="h-auto w-full drop-shadow-lg" />
              </button>
              <button
                type="button"
                onClick={onBribe}
                disabled={reputation < 15}
                className="w-full transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:grayscale"
                aria-label="Подкупать знаменитостей: цена 15 репутации, стабильность плюс 7 процентов"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/img/city-bribe.png" alt="Подкупать знаменитостей" className="h-auto w-full drop-shadow-lg" />
              </button>
              <button
                type="button"
                onClick={onPrison}
                disabled={reputation < 50}
                className="w-full transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:grayscale"
                aria-label="Всех неугодных за решётку: цена 50 репутации, минус 10 стабильности, через 10 секунд плюс 50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/img/city-prison.png" alt="Всех неугодных за решётку" className="h-auto w-full drop-shadow-lg" />
              </button>
            </div>
          </div>
        )}

        {/* АРМИЯ КРЫС — доступна всегда */}
        <div className="flex w-full flex-col items-center gap-2 rounded-2xl bg-neutral-900/80 p-4">
          <div className="flex w-full items-center justify-between text-white">
            <span className="text-lg font-bold">{`Армия крыс: ${city.rats}`}</span>
            <span className="text-sm text-neutral-400">{`Содержание: ${upkeep.toFixed(1)}$/сек`}</span>
          </div>
          <button
            type="button"
            onClick={onHireRat}
            disabled={money < 5}
            className="w-40 transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:grayscale md:w-48"
            aria-label="Нанять в армию крысу: цена 5 долларов плюс содержание"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/city-hire-rat.png" alt="Нанять в армию крысу" className="h-auto w-full drop-shadow-lg" />
          </button>
        </div>
      </div>
    </div>
  )
}
