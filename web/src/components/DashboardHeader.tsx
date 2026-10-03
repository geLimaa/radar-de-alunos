import { formatDate } from '../format.ts'

type DashboardHeaderProps = {
  referenceDate: string | null
}

function DashboardHeader({ referenceDate }: DashboardHeaderProps){
  return (
    <header className="header">
      <div>
        <h1>Radar de Alunos</h1>
        <span className="badge">Dados fictícios</span>
      </div>

      <p>
        Data de referência:{' '}
        {referenceDate === null ? '—' : formatDate(referenceDate)}
      </p>
    </header>
  );
}

export default DashboardHeader