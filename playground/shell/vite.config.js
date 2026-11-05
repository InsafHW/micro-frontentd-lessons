import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { federation } from '@module-federation/vite'

// Команда платформы. Это HOST: знает только адреса remote и их публичные имена.
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'shell',
      dts: false,                          // JS-проект: генерация типов для remote не нужна
      remotes: {
        catalog: { type: 'module', name: 'catalog', entry: 'http://localhost:5171/remoteEntry.js' },
        cart: { type: 'module', name: 'cart', entry: 'http://localhost:5172/remoteEntry.js' },
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],
  server: { port: 5170, strictPort: true },
  preview: { port: 5170, strictPort: true },
  build: { target: 'esnext' },
})
