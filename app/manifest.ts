import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "СимуляторСашиПораши",
    short_name: "СашаПораша",
    description: "Юмористический кликер-симулятор выживания на куче мусора",
    id: "/",
    start_url: "/",
    scope: "/",
    // fullscreen — прячет системную плашку со временем/уведомлениями в установленном PWA
    display: "fullscreen",
    // Игра горизонтальная — фиксируем ориентацию
    orientation: "landscape",
    background_color: "#1a1a1a",
    theme_color: "#1a1a1a",
    lang: "ru",
    dir: "ltr",
    categories: ["games", "entertainment"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/img/bg-main.jpg",
        sizes: "640x360",
        type: "image/jpeg",
        label: "Главный экран игры",
      },
      {
        src: "/img/bg-decisions.png",
        sizes: "340x227",
        type: "image/png",
        label: "Экран решений",
      },
    ],
  }
}
