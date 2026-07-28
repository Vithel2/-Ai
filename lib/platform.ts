/**
 * Определение среды запуска.
 *
 * Игра работает и как сайт, и как приложение в APK. Внутри APK часть
 * браузерных механизмов ведёт себя иначе, поэтому её нужно различать.
 * Проверяем глобальный объект Capacitor, который добавляет обёртка
 * приложения — так не приходится тянуть пакет в бандл сайта.
 */
export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false
  const cap = (window as { Capacitor?: { isNativePlatform?: boolean | (() => boolean) } }).Capacitor
  if (!cap) return false
  // В разных версиях это либо поле, либо функция
  return typeof cap.isNativePlatform === "function" ? cap.isNativePlatform() : cap.isNativePlatform === true
}
