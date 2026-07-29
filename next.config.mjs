/** @type {import('next').NextConfig} */
const nextConfig = {
  // Игра целиком клиентская: серверного кода нет, поэтому её можно собрать
  // в набор статических файлов. Это нужно для APK — Capacitor кладёт папку
  // out/ внутрь приложения, и игра работает офлайн, без обращений к серверу.
  output: "export",

  // В статике нет сервера, который оптимизирует картинки на лету
  images: { unoptimized: true },

  // Каждая страница как /index.html в своей папке: WebView надёжнее открывает
  // такие пути, чем обычные /page без расширения
  trailingSlash: true,
}

export default nextConfig
