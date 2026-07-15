"use client"

import { useState } from "react"
import { getMusicVolume, getSfxVolume, playSfx, setMusicVolume, setSfxVolume } from "@/lib/audio"

interface SettingsModalProps {
  onClose: () => void
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const [music, setMusic] = useState(() => Math.round(getMusicVolume() * 100))
  const [sfx, setSfx] = useState(() => Math.round(getSfxVolume() * 100))

  function handleMusic(v: number) {
    setMusic(v)
    setMusicVolume(v / 100)
  }

  function handleSfx(v: number) {
    setSfx(v)
    setSfxVolume(v / 100)
    playSfx("click")
  }

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/60"
      role="dialog"
      aria-modal="true"
      aria-label="Настройки"
    >
      <div className="w-[min(90vw,420px)] rounded-2xl border-4 border-white bg-neutral-800 p-6 shadow-2xl">
        <h2 className="mb-6 text-center text-2xl font-bold text-white">Настройки</h2>

        <div className="mb-5">
          <label htmlFor="music-volume" className="mb-2 block font-bold text-white">
            {`Музыка: ${music}%`}
          </label>
          <input
            id="music-volume"
            type="range"
            min={0}
            max={100}
            value={music}
            onChange={(e) => handleMusic(Number(e.target.value))}
            className="w-full accent-green-500"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="sfx-volume" className="mb-2 block font-bold text-white">
            {`Звуки: ${sfx}%`}
          </label>
          <input
            id="sfx-volume"
            type="range"
            min={0}
            max={100}
            value={sfx}
            onChange={(e) => handleSfx(Number(e.target.value))}
            className="w-full accent-green-500"
          />
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mb-4 w-full rounded-xl bg-green-600 py-3 text-lg font-bold text-white transition-colors hover:bg-green-500"
        >
          Закрыть
        </button>

        <p className="text-center text-xs leading-relaxed text-neutral-400 text-pretty">
          Все совпадения случайны и автор игры не берёт ответственность за данную игру.
        </p>
      </div>
    </div>
  )
}
