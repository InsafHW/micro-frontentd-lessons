import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { federation } from '@module-federation/vite'

// Команда Корзины. Тоже REMOTE, но на Vue. Наружу отдаёт не компонент, а функцию mount():
// так её может встроить хост на любом фреймворке.
export default defineConfig({
  base: 'http://localhost:5172/',
  plugins: [
    vue(),
    federation({
      name: 'cart',
      dts: false,                          // JS-проект: генерация типов для remote не нужна
      filename: 'remoteEntry.js',
      manifest: true,
      exposes: {
        './mount': './src/mount.js',   // mount (бейдж) и mountPage (страница /cart)
      },
      // Vue никто, кроме Корзины, не использует — делить нечего, shared не нужен.
    }),
  ],
  server: { port: 5172, strictPort: true, origin: 'http://localhost:5172' },
  preview: { port: 5172, strictPort: true },
  build: { target: 'esnext' },
})
