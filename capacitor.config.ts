import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  // Уникальный id приложения. Менять после первой публикации нельзя —
  // магазин считает другой id другим приложением
  appId: "ru.sashaporasha.simulator",
  appName: "Симулятор СашиПораши",

  // Папка со статической сборкой Next.js (создаётся командой pnpm build)
  webDir: "out",

  android: {
    // Игра рисует всё сама, тёмный фон, чтобы не мигало белым при запуске
    backgroundColor: "#1a1a1a",
    // Разрешаем звук без предварительного жеста — иначе музыка в APK молчит
    allowMixedContent: false,
  },

  server: {
    // Ассеты лежат внутри APK и отдаются по этой схеме.
    // https нужен, чтобы браузерные API (localStorage, звук) считали
    // страницу защищённой и не отключались
    androidScheme: "https",
  },
}

export default config
