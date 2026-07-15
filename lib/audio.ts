"use client"

const MUSIC_TRACKS = [
  "/music/track-1.mp3",
  "/music/track-2.mp3",
  "/music/track-3.mp3",
  "/music/track-4.mp3",
  "/music/track-5.mp3",
]

// Трек 5 (6 KLACC.FeatFirst) обрезаем на 2:22 — дальше ИИ-генератор выдал херню
const TRACK_MAX_SECONDS: Record<string, number> = {
  "/music/track-5.mp3": 142,
}

let musicAudio: HTMLAudioElement | null = null
let musicIndex = 0
let musicStarted = false

// Глобальная громкость (0..1), управляется из настроек
let sfxVolume = 0.8
let musicVolume = 0.35

export function getSfxVolume() {
  return sfxVolume
}

export function setSfxVolume(v: number) {
  sfxVolume = Math.min(1, Math.max(0, v))
}

export function getMusicVolume() {
  return musicVolume
}

export function setMusicVolume(v: number) {
  musicVolume = Math.min(1, Math.max(0, v))
  if (musicAudio) musicAudio.volume = musicVolume
}

export function playSfx(name: string, volume = 1) {
  if (typeof window === "undefined") return
  const audio = new Audio(`/sfx/${name}.mp3`)
  audio.volume = Math.min(1, volume * sfxVolume)
  audio.play().catch(() => {
    // автовоспроизведение может быть заблокировано до первого клика
  })
}

// Короткие звуки: один экземпляр на имя, обрывается через maxSeconds,
// при повторном вызове начинается сначала
const limitedAudios: Record<string, HTMLAudioElement> = {}
const limitedTimers: Record<string, ReturnType<typeof setTimeout>> = {}

export function playSfxLimited(name: string, maxSeconds = 2, volume = 1) {
  if (typeof window === "undefined") return
  let audio = limitedAudios[name]
  if (!audio) {
    audio = new Audio(`/sfx/${name}.mp3`)
    limitedAudios[name] = audio
  }
  if (limitedTimers[name]) clearTimeout(limitedTimers[name])
  audio.volume = Math.min(1, volume * sfxVolume)
  audio.currentTime = 0
  audio.play().catch(() => {})
  limitedTimers[name] = setTimeout(() => {
    audio.pause()
    audio.currentTime = 0
  }, maxSeconds * 1000)
}

export function stopSfx(name: string) {
  const audio = limitedAudios[name]
  if (audio) {
    audio.pause()
    audio.currentTime = 0
  }
  if (limitedTimers[name]) clearTimeout(limitedTimers[name])
}

export function startMusic() {
  if (typeof window === "undefined" || musicStarted) return
  musicStarted = true
  musicIndex = Math.floor(Math.random() * MUSIC_TRACKS.length)
  playNextTrack()
}

function advanceTrack() {
  musicIndex = (musicIndex + 1) % MUSIC_TRACKS.length
  playNextTrack()
}

function playNextTrack() {
  if (musicAudio) {
    musicAudio.pause()
    musicAudio = null
  }
  const src = MUSIC_TRACKS[musicIndex]
  const audio = new Audio(src)
  musicAudio = audio
  audio.volume = musicVolume
  audio.addEventListener("ended", () => {
    if (musicAudio === audio) advanceTrack()
  })

  // Обрезка трека по времени, если задан лимит
  const maxSec = TRACK_MAX_SECONDS[src]
  if (maxSec) {
    audio.addEventListener("timeupdate", () => {
      if (musicAudio === audio && audio.currentTime >= maxSec) {
        advanceTrack()
      }
    })
  }

  audio.play().catch(() => {
    // если заблокировано — попробуем снова при следующем взаимодействии
    musicStarted = false
  })
}
