"use client"

import { useEffect, useRef, useState } from "react"

// Все файлы игры: картинки, звуки и музыка
const IMAGES = [
  "action-bath.png",
  "action-fart-upgraded.png",
  "action-fart.png",
  "action-pool.png",
  "action-rats.png",
  "action-zlata.png",
  "bg-decisions.png",
  "bg-emperor.jpg",
  "bg-main.jpg",
  "btn-decisions.png",
  "btn-exit.png",
  "btn-settings.png",
  "buy-01-house.png",
  "buy-02-bag.png",
  "buy-03-puddle.png",
  "buy-04-sell.png",
  "buy-06-desk.png",
  "buy-07-throw.png",
  "buy-08-production.png",
  "buy-09-zlata.png",
  "buy-10-pool.png",
  "buy-11-rats.png",
  "buy-12-ads.png",
  "buy-13-castle.png",
  "buy-14-poem.png",
  "buy-15-rat-gift.png",
  "buy-16-capture.png",
  "buy-17-rename.png",
  "buy-18-rebuild.png",
  "buy-19-director.png",
  "buy-20-hygiene.png",
  "buy-21-washing.png",
  "buy-22-cars.png",
  "buy-23-emperor.png",
  "buy-24-protests.png",
  "buy-zlata-site.png",
  "indicator.png",
  "sasha.png",
].map((f) => `/img/${f}`)

const SFX = [
  "build",
  "buy-business",
  "buy-factory",
  "buy-upgrade",
  "click",
  "court-hammer",
  "diarrhea",
  "eat-rats",
  "fart-lineup",
  "fart-long",
  "fart-meeting",
  "huge-fall",
  "jackhammer",
  "laugh",
  "level-up",
  "pencil",
  "plant-noise",
  "pool-splash",
  "protests",
  "rat-squeak",
  "slide-change",
  "surprise",
  "swim",
  "throw-rats",
  "throw",
  "trash-bag",
  "war-shootout",
  "zlata",
].map((f) => `/sfx/${f}.mp3`)

const MUSIC = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => `/music/track-${n}.mp3`)

const ALL_FILES = [...IMAGES, ...SFX, ...MUSIC]

interface LoadingScreenProps {
  onDone: () => void
}

export function LoadingScreen({ onDone }: LoadingScreenProps) {
  const [loaded, setLoaded] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(5)
  const doneRef = useRef(false)
  const startRef = useRef(0)

  const total = ALL_FILES.length
  const percent = Math.round((loaded / total) * 100)
  const canSkip = secondsLeft <= 0

  // Пропуск разрешён только через 5 секунд: отсчёт по реальному времени,
  // чтобы кнопка гарантированно разблокировалась
  useEffect(() => {
    if (startRef.current === 0) startRef.current = Date.now()
    const tick = () => {
      const left = Math.max(0, 5 - Math.floor((Date.now() - startRef.current) / 1000))
      setSecondsLeft(left)
    }
    tick()
    const interval = setInterval(tick, 250)
    return () => clearInterval(interval)
  }, [])

  // Загружаем все файлы в кеш браузера
  useEffect(() => {
    let cancelled = false
    let count = 0

    const bump = () => {
      count++
      if (!cancelled) setLoaded(count)
    }

    for (const url of ALL_FILES) {
      fetch(url)
        .then((res) => res.blob())
        .then(bump)
        .catch(bump) // ошибку тоже считаем, чтобы прогресс не завис
    }

    return () => {
      cancelled = true
    }
  }, [])

  // Когда всё загружено — заходим в игру автоматически
  useEffect(() => {
    if (loaded >= total && !doneRef.current) {
      doneRef.current = true
      // небольшая пауза, чтобы игрок увидел 100%
      const t = setTimeout(onDone, 400)
      return () => clearTimeout(t)
    }
  }, [loaded, total, onDone])

  function handleSkip() {
    if (!canSkip || doneRef.current) return
    doneRef.current = true
    onDone()
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-neutral-950 px-8">
      <h1 className="text-center text-3xl font-bold text-white text-balance md:text-4xl">Симулятор СашиПораши</h1>

      <p className="text-lg text-neutral-300">
        Загрузка файлов: {percent}% ({loaded}/{total})
      </p>

      {/* Полоса прогресса */}
      <div
        className="h-5 w-full max-w-md overflow-hidden rounded-full border-2 border-neutral-700 bg-neutral-800"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Прогресс загрузки"
      >
        <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${percent}%` }} />
      </div>

      <button
        type="button"
        onClick={handleSkip}
        disabled={!canSkip}
        className="rounded-xl bg-green-600 px-8 py-3 text-lg font-bold text-white transition-colors hover:bg-green-500 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
      >
        {canSkip ? "Пропустить" : "Пропустить (через 5 сек)"}
      </button>

      <p className="text-center text-sm text-neutral-500 text-pretty">
        Загрузка нужна, чтобы звуки и картинки в игре не тормозили
      </p>
    </div>
  )
}
