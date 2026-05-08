import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  server: {
    host: true,

    allowedHosts: [
      '6d0a-194-24-236-255.ngrok-free.app',
    ],
  },
})