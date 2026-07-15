"use client"

const MUSIC_TRACKS = [
  "/music/track-1.mp3",
  "/music/track-2.mp3",
  "/music/track-3.mp3",
  "/music/track-4.mp3",
  "/music/track-5.mp3",
]

let musicAudio: HTMLAudioElement | null = null
let musicIndex = 0
let musicStarted = false

export function playSfx(name: string, volume = 0.9) {
  if (typeof window === "undefined") return
  const audio = new Audio(`/sfx/${name}.mp3`)
  audio.volume = volume
  audio.play().catch(() => {
    // автовоспроизведение может быть заблокировано до первого клика
  })
}

// Короткие звуки: один экземпляр на имя, обрывается через maxSeconds,
// при повторном вызове начинается сначала
const limitedAudios: Record<string, HTMLAudioElement> = {}
const limitedTimers: Record<string, ReturnType<typeof setTimeout>> = {}

export function playSfxLimited(name: string, maxSeconds = 2, volume = 0.9) {
  if (typeof window === "undefined") return
  let audio = limitedAudios[name]
  if (!audio) {
    audio = new Audio(`/sfx/${name}.mp3`)
    limitedAudios[name] = audio
  }
  if (limitedTimers[name]) clearTimeout(limitedTimers[name])
  audio.volume = volume
  audio.currentTime = 0
  audio.play().catch(() => {})
  limitedTimers[name] = setTimeout(() => {
    audio.pause()
    audio.currentTime = 0
  }, maxSeconds * 1000)
}

export function startMusic() {
  if (typeof window === "undefined" || musicStarted) return
  musicStarted = true
  musicIndex = Math.floor(Math.random() * MUSIC_TRACKS.length)
  playNextTrack()
}

function playNextTrack() {
  if (musicAudio) {
    musicAudio.pause()
  }
  musicAudio = new Audio(MUSIC_TRACKS[musicIndex])
  musicAudio.volume = 0.35
  musicAudio.addEventListener("ended", () => {
    musicIndex = (musicIndex + 1) % MUSIC_TRACKS.length
    playNextTrack()
  })
  musicAudio.play().catch(() => {
    // если заблокировано — попробуем снова при следующем взаимодействии
    musicStarted = false
  })
}
