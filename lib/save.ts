"use client"

// Сохранение игры в localStorage: прогресс не теряется при перезагрузке страницы.

export interface SaveData {
  stats: {
    happiness: number
    satiety: number
    water: number
    reputation: number
    money: number
  }
  purchaseIndex: number
  unlocked: { zlata: boolean; pool: boolean; smoke: boolean; emperor: boolean }
  eventsDone: string[]
  lampFailed: boolean
  incomePerSec: number
  happinessPer3Sec: number
  /** Состояние города (стабильность, армия крыс, протест) — есть не во всех сейвах */
  city?: {
    stability: number
    rats: number
    protest: { strength: number; fastUntil: number } | null
  }
}

const KEY = "sasha-porasha-save-v1"

export function loadSave(): SaveData | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as SaveData
    if (typeof data.purchaseIndex !== "number" || !data.stats) return null
    return data
  } catch {
    return null
  }
}

export function writeSave(data: SaveData) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    // хранилище может быть недоступно — игра продолжает работать без сохранений
  }
}

export function clearSave() {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}
