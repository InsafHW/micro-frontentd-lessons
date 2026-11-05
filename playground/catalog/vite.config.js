import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { federation } from '@module-federation/vite'

// Команда Каталога. Это REMOTE: отдаёт наружу компонент Catalog.
export default defineConfig({
  base: 'http://localhost:5171/',          // чанки грузятся с сервера Каталога, а не Shell
  plugins: [
    react(),
    federation({
      name: 'catalog',
      dts: false,                          // JS-проект: генерация типов для remote не нужна
      filename: 'remoteEntry.js',          // «витрина» remote: точка входа для хостов
      manifest: true,                      // + mf-manifest.json с описанием exposes/shared
      exposes: {
        './mount': './src/mount.jsx',
        './Catalog': './src/Catalog.jsx',  // публичный контракт команды. Всё прочее — внутреннее
      },
      shared: {
        react: { singleton: true },        // один React на страницу — общий с Shell
        'react-dom': { singleton: true },
      },
    }),
  ],
  server: { port: 5171, strictPort: true, origin: 'http://localhost:5171' },
  preview: { port: 5171, strictPort: true },
  build: { target: 'esnext' },
})
