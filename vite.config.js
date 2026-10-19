import { defineConfig } from 'vite';

export default defineConfig({
  // ⚠️ ВАЖНО: замени 'titanium-valley-3d' на точное имя твоего GitHub-репозитория!
  // Если репозиторий называется username.github.io — поставь base: '/'
  base: '/Titanium-Valley/',

  server: {
    port: 5173,
    open: true,
  },

  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 2000,
  },

  optimizeDeps: {
    exclude: ['@dimforge/rapier3d-compat'],
  },
});