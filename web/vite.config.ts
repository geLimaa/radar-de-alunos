import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // A API libera CORS só para http://localhost:5173 (CORS_ORIGIN).
    // strictPort faz o Vite falhar se a porta estiver ocupada, em vez de subir em outra.
    port: 5173,
    strictPort: true,
  },
  preview: {
    // O `npm run preview` usa a mesma porta pelo mesmo motivo (o padrão dele seria 4173).
    port: 5173,
    strictPort: true,
  },
  build: {
    // Com o Recharts, o bundle passa de 500 kB (o limite padrão do aviso). Esse tamanho é
    // esperado aqui, então o limite sobe para 1000 kB e o build não avisa à toa.
    chunkSizeWarningLimit: 1000,
  },
})
