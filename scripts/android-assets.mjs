/**
 * Генерирует иконки и загрузочные экраны Android-приложения из иконки игры.
 *
 * Capacitor создаёт проект со своими логотипами-заглушками. Магазины отклоняют
 * приложения с дефолтными иконками, поэтому перерисовываем их под игру.
 *
 * Запуск: node scripts/android-assets.mjs
 */
import sharp from "sharp"
import { readdir, writeFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import path from "node:path"

const RES = "android/app/src/main/res"
const SOURCE_ICON = "public/icon-512.png"
const BG = { r: 26, g: 26, b: 26, alpha: 1 } // #1a1a1a — фон игры

// Размеры иконки запуска для разных плотностей экрана
const LAUNCHER = {
  "mipmap-mdpi": 48,
  "mipmap-hdpi": 72,
  "mipmap-xhdpi": 96,
  "mipmap-xxhdpi": 144,
  "mipmap-xxxhdpi": 192,
}

// Адаптивная иконка: холст 108dp, а сама картинка занимает центральные ~66%,
// иначе система обрежет её при круглой или скруглённой маске
const FOREGROUND = {
  "mipmap-mdpi": 108,
  "mipmap-hdpi": 162,
  "mipmap-xhdpi": 216,
  "mipmap-xxhdpi": 324,
  "mipmap-xxxhdpi": 432,
}

async function makeLauncherIcons() {
  for (const [dir, size] of Object.entries(LAUNCHER)) {
    const icon = await sharp(SOURCE_ICON).resize(size, size, { fit: "cover" }).png().toBuffer()
    await writeFile(path.join(RES, dir, "ic_launcher.png"), icon)

    // Круглая версия: вырезаем круг маской
    const circle = Buffer.from(
      `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`,
    )
    const round = await sharp(SOURCE_ICON)
      .resize(size, size, { fit: "cover" })
      .composite([{ input: circle, blend: "dest-in" }])
      .png()
      .toBuffer()
    await writeFile(path.join(RES, dir, "ic_launcher_round.png"), round)
  }
}

async function makeForegroundIcons() {
  for (const [dir, canvas] of Object.entries(FOREGROUND)) {
    const inner = Math.round(canvas * 0.66)
    const art = await sharp(SOURCE_ICON).resize(inner, inner, { fit: "cover" }).png().toBuffer()
    const fg = await sharp({
      create: { width: canvas, height: canvas, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    })
      .composite([{ input: art, gravity: "center" }])
      .png()
      .toBuffer()
    await writeFile(path.join(RES, dir, "ic_launcher_foreground.png"), fg)
  }
}

/**
 * Загрузочный экран: тёмный фон и иконка по центру.
 * Перерисовываем каждый существующий splash.png в его же размере,
 * чтобы Android подобрал подходящий под экран телефона.
 */
async function makeSplashScreens() {
  const dirs = (await readdir(RES)).filter((d) => d.startsWith("drawable"))
  for (const dir of dirs) {
    const file = path.join(RES, dir, "splash.png")
    if (!existsSync(file)) continue

    const { width, height } = await sharp(file).metadata()
    const logo = Math.round(Math.min(width, height) * 0.4)
    const art = await sharp(SOURCE_ICON).resize(logo, logo, { fit: "cover" }).png().toBuffer()
    const splash = await sharp({ create: { width, height, channels: 4, background: BG } })
      .composite([{ input: art, gravity: "center" }])
      .png()
      .toBuffer()
    await writeFile(file, splash)
  }
}

await makeLauncherIcons()
await makeForegroundIcons()
await makeSplashScreens()
console.log("[v0] Иконки и загрузочные экраны Android обновлены")
