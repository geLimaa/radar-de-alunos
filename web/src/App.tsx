import { useEffect, useState } from 'react'
import { API_URL, getHealth } from './api.ts'

// Ponto de partida: o dashboard descrito em ../docs/03-dashboard.md (caminho a partir de web/)
// deve ser construído aqui. O bloco de status da API é só um exemplo de chamada e pode sair.

type HealthState =
  | { kind: 'loading' }
  | { kind: 'ok'; status: string }
  | { kind: 'error'; message: string }

function App() {
  const [health, setHealth] = useState<HealthState>({ kind: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    // Evita gravar no estado uma resposta que já não interessa (StrictMode ou novo clique).
    let ignore = false

    getHealth()
      .then((data) => {
        if (!ignore) setHealth({ kind: 'ok', status: data.status })
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Erro desconhecido'
        if (!ignore) setHealth({ kind: 'error', message })
      })

    return () => {
      ignore = true
    }
  }, [attempt])

  function retry() {
    setHealth({ kind: 'loading' })
    setAttempt((n) => n + 1)
  }

  return (
    <main className="page">
      <header className="header">
        <h1>Radar de Alunos</h1>
        <span className="badge">Dados fictícios</span>
      </header>

      <section className="card">
        {health.kind === 'loading' && <p className="status">Status da API: carregando…</p>}

        {health.kind === 'ok' && (
          <p className="status">
            Status da API: <strong className="ok">{health.status}</strong>
          </p>
        )}

        {health.kind === 'error' && (
          <div role="alert">
            <p className="status">
              Status da API: <strong className="error">erro</strong>
            </p>
            <p className="muted">{health.message}</p>
            <button type="button" onClick={retry}>
              Tentar de novo
            </button>
          </div>
        )}

        <p className="muted small">
          Endereço da API: <code>{API_URL}</code>
        </p>
      </section>
    </main>
  )
}

export default App
