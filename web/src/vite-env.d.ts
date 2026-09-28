/// <reference types="vite/client" />

// Variáveis de ambiente lidas pelo Vite (só as que começam com VITE_ chegam ao navegador).
interface ImportMetaEnv {
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
