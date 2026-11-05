import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

/*
 * «Полка» как МОДУЛЬНЫЙ МОНОЛИТ (урок 6) — из того же самого исходного кода.
 * Никакой федерации: 'catalog/Catalog' и 'cart/mount' — просто алиасы на исходники команд.
 * Границы и контракты (@polka/contracts, props, mount, события) остаются в коде,
 * но деплой один, сборка одна, React и Vue — по одной копии, общий граф модулей.
 */
const here = (rel: string) => fileURLToPath(new URL(rel, import.meta.url))

export default defineConfig({
  root: here('../shell'),
  publicDir: here('../shell/public'),
  plugins: [react(), vue()],
  resolve: {
    alias: {
      'catalog/Catalog': here('../catalog/src/Catalog.tsx'),
      'cart/mount': here('../cart/src/mount.ts'),
    },
  },
  build: { outDir: here('./dist'), emptyOutDir: true, target: 'esnext' },
  preview: { port: 5180, strictPort: true },
})
