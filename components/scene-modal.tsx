"use client"

import { useEffect, useState } from "react"
import type { SceneButton } from "@/lib/scenes-data"
import { playSfxLimited, stopSfx } from "@/lib/audio"

interface SceneModalProps {
  scene: SceneButton
  onClose: () => void
}

/**
 * Мини-сценка после покупки без ивента: весь экран занимает фон школьного класса,
 * посередине — кнопка-картинка. По нажатию играет звук и, если есть картинка-результат,
 * показывается плашка на 6 секунд; потом возврат в игру. Игра на паузе, пока сценка открыта.
 */
export function SceneModal({ scene, onClose }: SceneModalProps) {
  const [showResult, setShowResult] = useState(false)

  // При появлении сценки — звук двери класса; при закрытии глушим звуки сценки
  useEffect(() => {
    playSfxLimited("class-door", 2, 0.8)
    return () => {
      stopSfx("class-door")
      stopSfx(scene.sfx)
    }
  }, [scene.sfx])

  const handleClick = () => {
    playSfxLimited(scene.sfx, 8, 0.8)
    if (scene.resultImg) {
      setShowResult(true)
      setTimeout(onClose, 6000)
    } else {
      onClose()
    }
  }

  return (
    <div className="absolute inset-0 z-40 overflow-hidden" role="dialog" aria-modal="true" aria-label={scene.label}>
      {/* Фон — школьный класс */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/img/scene-bg.png" alt="Школьный класс" className="absolute inset-0 h-full w-full object-cover" />

      {showResult && scene.resultImg ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 p-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={scene.resultImg}
            alt={scene.label}
            className="max-h-[80dvh] w-auto max-w-[85vw] rounded-xl shadow-2xl"
          />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <button
            type="button"
            onClick={handleClick}
            className="transition-transform hover:scale-105 active:scale-95"
            aria-label={scene.label}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={scene.img} alt={scene.label} className="max-h-[70dvh] w-auto max-w-[70vw] drop-shadow-2xl" />
          </button>
        </div>
      )}
    </div>
  )
}
