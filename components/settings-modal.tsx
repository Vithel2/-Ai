"use client"

import { useState } from "react"
import { getMusicVolume, getSfxVolume, setMusicVolume, setSfxVolume } from "@/lib/audio"

interface SettingsModalProps {
  onClose: () => void
  onCode?: (code: string) => boolean
}

export function SettingsModal({ onClose, onCode }: SettingsModalProps) {
  const [music, setMusic] = useState(() => Math.round(getMusicVolume() * 100))
  const [sfx, setSfx] = useState(() => Math.round(getSfxVolume() * 100))
  const [code, setCode] = useState("")
  const [codeStatus, setCodeStatus] = useState<"idle" | "ok" | "bad">("idle")

  function submitCode() {
    if (!code.trim()) return
    const accepted = onCode?.(code) ?? false
    setCodeStatus(accepted ? "ok" : "bad")
    setCode("")
  }

  function handleMusic(v: number) {
    setMusic(v)
    setMusicVolume(v / 100)
  }

  function handleSfx(v: number) {
    setSfx(v)
    setSfxVolume(v / 100)
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

        <div className="mb-6">
          <label htmlFor="cheat-code" className="mb-2 block font-bold text-white">
            Ввести код
          </label>
          <div className="flex gap-2">
            <input
              id="cheat-code"
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setCodeStatus("idle")
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) submitCode()
              }}
              placeholder="Код..."
              className="min-w-0 flex-1 rounded-lg border-2 border-neutral-600 bg-neutral-900 px-3 py-2 text-white placeholder:text-neutral-500 focus:border-green-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={submitCode}
              className="shrink-0 rounded-lg bg-neutral-600 px-4 py-2 font-bold text-white transition-colors hover:bg-neutral-500"
            >
              ОК
            </button>
          </div>
          {codeStatus === "ok" && <p className="mt-2 text-sm font-bold text-green-400">Код принят!</p>}
          {codeStatus === "bad" && <p className="mt-2 text-sm font-bold text-red-400">Неверный код</p>}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mb-4 w-full rounded-xl bg-green-600 py-3 text-lg font-bold text-white transition-colors hover:bg-green-500"
        >
          Закрыть
        </button>

        <p className="mb-2 text-center text-xs leading-relaxed text-neutral-400 text-pretty">
          Все совпадения случайны и автор игры не берёт ответственность за данную игру.
        </p>
        <p className="text-center text-xs font-bold text-neutral-500">Версия игры: Alpha 1.0</p>
      </div>
    </div>
  )
}
