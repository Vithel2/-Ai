"use client"

import { useEffect } from "react"
import { isNativeApp } from "@/lib/platform"

/**
 * Аппаратная кнопка «Назад» на Android.
 *
 * По умолчанию она мгновенно закрывает приложение — игрок нажимает её,
 * ожидая выхода из экрана города, и вылетает из игры целиком.
 * Поэтому перехватываем нажатие: сначала закрываем открытый экран,
 * и только на главном экране сворачиваем приложение.
 *
 * @param handler вызывается при нажатии; верните true, если нажатие обработано
 *                внутри игры, и false — чтобы свернуть приложение
 */
export function useNativeBackButton(handler: () => boolean) {
  useEffect(() => {
    if (!isNativeApp()) return

    let remove: (() => void) | undefined
    let cancelled = false

    // Плагин подгружаем только на устройстве, чтобы не тащить его в сайт
    import("@capacitor/app")
      .then(async ({ App }) => {
        const listener = await App.addListener("backButton", () => {
          const handled = handler()
          if (!handled) {
            // Сворачиваем, а не закрываем: игра останется в списке
            // недавних приложений и продолжится с того же места
            void App.minimizeApp()
          }
        })
        if (cancelled) {
          void listener.remove()
          return
        }
        remove = () => void listener.remove()
      })
      .catch(() => {
        // Плагин недоступен — остаётся стандартное поведение системы
      })

    return () => {
      cancelled = true
      remove?.()
    }
  }, [handler])
}
