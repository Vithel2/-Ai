"use client"

import { useEffect } from "react"

/** Регистрирует сервис-воркер для PWA (офлайн-режим и установка на устройство) */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Сервис-воркер недоступен (например, в dev-режиме) — игра работает и без него
      })
    }
  }, [])

  return null
}
