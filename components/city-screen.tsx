"use client"

// Вкладка «Город»: стабильность, армия крыс и подавление протестов.
// Открывается с главного экрана после захвата Давлекановки.
// Фон меняется: мирный двор при стабильности, огненный протест при бунте.

export interface CityState {
  stability: number
  rats: number
  /** null — протеста нет; иначе сила протеста 0–100 */
  protest: { strength: number; fastUntil: number } | null
}

export const RAT_UPKEEP_PER_RAT = 0.5

// Баланс города: стабильность падает сама, но её сдерживают крысы-патрули
export const STABILITY_DECAY_PER_SEC = 0.25
/** Каждая крыса замедляет падение стабильности, но не больше чем на 40% суммарно */
export const RAT_PATROL_PER_RAT = 0.02
export const RAT_PATROL_MAX = 0.4

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
  // Сколько репутации приносит спокойный город и насколько крысы тормозят падение
  const fame = city.stability >= 70 ? 2 : city.stability >= 40 ? 1 : 0
  const patrolBonus = Math.min(RAT_PATROL_MAX, city.rats * RAT_PATROL_PER_RAT)
  const decayNow = STABILITY_DECAY_PER_SEC * (1 - patrolBonus)

  return (
    <div className="absolute inset-0 z-30 overflow-y-auto">
      {/* Фон в зависимости от состояния города */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={protest ? "/img/city-bg-protest.png" : "/img/city-bg-stable.png"}
        alt={protest ? "В городе протест" : "В городе стабильность"}
        className="fixed inset-0 h-full w-full object-cover"
      />
      {/* Затемнение, чтобы кнопки читались */}
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

      {/* Кнопка выхода — слева, картинка-стрелка развёрнута влево */}
      <button
        type="button"
        onClick={onExit}
        className="fixed top-1/2 left-3 z-40 w-16 -translate-y-1/2 transition-transform hover:scale-110 active:scale-95 md:w-20 short:left-1 short:w-10"
        aria-label="Выйти из решений стабильности"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/city-exit.png" alt="Выход" className="h-auto w-full -scale-x-100 drop-shadow-lg" />
      </button>

      <div className="relative mx-auto flex w-full max-w-2xl flex-col items-center gap-6 px-14 py-8 md:px-20 short:gap-3 short:py-3">
        <h2
          className={`text-center text-3xl font-bold text-balance drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] md:text-4xl short:text-xl ${
            protest ? "animate-pulse text-red-500" : "text-white"
          }`}
        >
          {protest ? "ПРОТЕСТ!" : "Город"}
        </h2>

        {protest ? (
          /* ПРОТЕСТ: вместо стабильности — сила протеста и подавление */
          <div className="flex w-full flex-col items-center gap-5">
            <div className="w-full rounded-2xl border-2 border-red-800 bg-black/70 p-4 backdrop-blur-sm">
              <div className="mb-2 flex justify-between text-base font-bold text-red-400">
                <span>Сила протеста</span>
                <span>{`${Math.round(protest.strength)}%`}</span>
              </div>
              <div
                className="h-6 w-full overflow-hidden rounded-full border border-red-900 bg-neutral-900"
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
                <p className="mt-2 text-center text-sm font-bold text-red-500">
                  Сила выше 50% — растёт риск переворота!
                </p>
              )}
            </div>

            <div className="grid w-full grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => onSuppress("light")}
                disabled={city.rats < 2 || reputation < 5}
                className="w-full transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:grayscale"
                aria-label="Лёгкое подавление: 2 крысы, минус 5 репутации, минус 8 силы протеста, но дальше протест растёт быстрее"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/img/city-supp-light.png"
                  alt="Лёгкое подавление"
                  className="h-auto w-full rounded-2xl drop-shadow-xl"
                />
              </button>
              <button
                type="button"
                onClick={() => onSuppress("mid")}
                disabled={city.rats < 5 || reputation < 10}
                className="w-full transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:grayscale"
                aria-label="Среднее подавление: 5 крыс, минус 10 репутации, минус 20 силы протеста, риск переворота 5 процентов"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/img/city-supp-mid.png"
                  alt="Среднее подавление"
                  className="h-auto w-full rounded-2xl drop-shadow-xl"
                />
              </button>
              <button
                type="button"
                onClick={() => onSuppress("hard")}
                disabled={city.rats < 10 || reputation < 15}
                className="w-full transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:grayscale"
                aria-label="Сильное подавление: 10 крыс, минус 15 репутации, снимает весь протест"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/img/city-supp-hard.png"
                  alt="Сильное подавление"
                  className="h-auto w-full rounded-2xl drop-shadow-xl"
                />
              </button>
            </div>
          </div>
        ) : (
          /* МИРНОЕ ВРЕМЯ: стабильность и решения на неё */
          <div className="flex w-full flex-col items-center gap-5">
            <div className="w-full rounded-2xl border-2 border-lime-800 bg-black/70 p-4 backdrop-blur-sm">
              <div className="mb-2 flex justify-between text-base font-bold text-lime-400">
                <span>Стабильность</span>
                <span>{`${Math.round(city.stability)}%`}</span>
              </div>
              <div
                className="h-6 w-full overflow-hidden rounded-full border border-lime-900 bg-neutral-900"
                role="progressbar"
                aria-valuenow={Math.round(city.stability)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Стабильность"
              >
                <div
                  className={`h-full rounded-full transition-all ${
                    city.stability < 40 ? "bg-orange-500" : "bg-lime-500"
                  }`}
                  style={{ width: `${Math.min(100, city.stability)}%` }}
                />
              </div>
              {/* Слава: спокойный город сам приносит репутацию — главный её источник в игре */}
              <p className="mt-2 text-center text-sm text-neutral-300">
                {fame > 0
                  ? `Народ доволен: +${fame} репутации каждые 3 сек`
                  : "Репутация не капает: подними стабильность до 40%"}
              </p>
              {city.stability < 30 && (
                <p className="mt-1 text-center text-sm font-bold text-orange-400">
                  Стабильность падает! Ниже 20% начнётся протест.
                </p>
              )}
            </div>

            <div className="grid w-full grid-cols-3 gap-4">
              <button
                type="button"
                onClick={onPropaganda}
                disabled={reputation < 5}
                className="w-full transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:grayscale"
                aria-label="Начать пропаганду: цена 5 репутации, стабильность плюс 4 процента"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/img/city-propaganda.png"
                  alt="Начать пропаганду"
                  className="h-auto w-full rounded-2xl drop-shadow-xl"
                />
              </button>
              <button
                type="button"
                onClick={onBribe}
                disabled={reputation < 15}
                className="w-full transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:grayscale"
                aria-label="Подкупать знаменитостей: цена 15 репутации, стабильность плюс 10 процентов"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/img/city-bribe.png"
                  alt="Подкупать знаменитостей"
                  className="h-auto w-full rounded-2xl drop-shadow-xl"
                />
              </button>
              <button
                type="button"
                onClick={onPrison}
                disabled={reputation < 50}
                className="w-full transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:grayscale"
                aria-label="Всех неугодных за решётку: цена 50 репутации, минус 10 стабильности, через 10 секунд плюс 50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/img/city-prison.png"
                  alt="Всех неугодных за решётку"
                  className="h-auto w-full rounded-2xl drop-shadow-xl"
                />
              </button>
            </div>
          </div>
        )}

        {/* АРМИЯ КРЫС — доступна всегда */}
        <div className="flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-neutral-700 bg-black/70 p-4 backdrop-blur-sm">
          <div className="flex w-full items-center justify-between text-white">
            <span className="text-lg font-bold">{`Армия крыс: ${city.rats}`}</span>
            <span className="text-sm text-neutral-300">{`Содержание: ${upkeep.toFixed(1)}$/сек`}</span>
          </div>
          {/* Крысы не только давят протесты, но и патрулируют улицы */}
          <p className="w-full text-center text-sm text-neutral-300">
            {`Патруль тормозит падение стабильности на ${Math.round(patrolBonus * 100)}% (сейчас −${decayNow.toFixed(2)}%/сек)`}
            {patrolBonus >= RAT_PATROL_MAX ? " — предел" : ""}
          </p>
          <button
            type="button"
            onClick={onHireRat}
            disabled={money < 5}
            className="w-36 transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:grayscale md:w-44 short:w-24"
            aria-label="Нанять в армию крысу: цена 5 долларов плюс содержание"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/city-hire-rat.png"
              alt="Нанять в армию крысу"
              className="h-auto w-full rounded-2xl drop-shadow-xl"
            />
          </button>
        </div>
      </div>
    </div>
  )
}
