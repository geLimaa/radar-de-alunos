// URL base da API. Vem de VITE_API_URL (arquivo .env); sem ela, usa a API local.
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/+$/, '')

export type HealthResponse = {
  status: string
}

// Faz um GET na API e devolve o JSON. Lança Error se a API estiver fora do ar
// ou se a resposta não for 2xx. O `signal` (de um AbortController) é opcional:
// busca cancelada rejeita com o AbortError original, não como erro de conexão.
async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, { signal })
  } catch (error) {
    if (signal?.aborted) throw error
    throw new Error(`Não foi possível conectar à API em ${API_URL}`)
  }

  if (!response.ok) {
    throw new Error(`A API respondeu ${response.status} em GET ${path}`)
  }

  return (await response.json()) as T
}

export function getHealth(): Promise<HealthResponse> {
  return getJson<HealthResponse>('/health')
}
