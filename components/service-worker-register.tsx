"use client"

import { useEffect } from "react"
import { isNativeApp } from "@/lib/platform"

/** Регистрирует сервис-воркер для PWA (офлайн-режим и установка на устройство) */
export function ServiceWorkerRegister() {
  useEffect(() => {
    // В APK все файлы уже лежат внутри приложения, кэшировать их повторно нечего.
    // Больше того: сервис-воркер там может отдать устаревшую страницу и игра
    // откроется белым экраном — поэтому на устройстве его не регистрируем
    if (isNativeApp()) return

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Сервис-воркер недоступен (например, в dev-режиме) — игра работает и без него
      })
    }
  }, [])

  return null
}
