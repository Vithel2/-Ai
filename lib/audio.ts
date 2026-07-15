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
