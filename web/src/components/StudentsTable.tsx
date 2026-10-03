import type { StudentsResponse } from '../api.ts'
import { engagementLabels, planLabels, studyYearLabels } from '../labels.ts'
import { formatActivityDays, formatInteger, formatPercent } from '../format.ts'

type StudentsTableProps = {
  students: StudentsResponse
  onPreviousPage: () => void
  onNextPage: () => void
}

function StudentsTable({ students, onPreviousPage, onNextPage }: StudentsTableProps){
  const { data, meta } = students

  if(data.length === 0){
    return (
      <section className="card">
        <p>Nenhum aluno encontrado.</p>
      </section>
    );
  }

  return (
    <section className="students-section">
      <table>
        <thead>
          <tr>
            <th>Nome · Cluster</th>
            <th>Série</th>
            <th>Plano</th>
            <th>Engajamento</th>
            <th>Última atividade</th>
            <th>Mentorias</th>
            <th>Acerto médio</th>
          </tr>
        </thead>

        <tbody>
          {
            data.map((student) => (
              <tr key={student.id}>

                <td>
                  <strong>{student.name}</strong>
                  <span>{student.clusterName}</span>
                </td>
                <td>{studyYearLabels[student.studyYear as keyof typeof studyYearLabels]}</td>
                <td>{planLabels[student.plan as keyof typeof planLabels]}</td>
                <td>
                  <span className={`engagement-badge engagement-${student.engagementBand}`}>
                    {engagementLabels[student.engagementBand]}
                  </span>
                </td>
                <td>{formatActivityDays(student.daysSinceLastActivity)}</td>
                <td>{formatInteger(student.completedMentorships)}</td>
                <td>{formatPercent(student.avgCorrectRate)}</td>

              </tr>
            ))
          }
        </tbody>
      </table>

      <footer className="pagination">
        <button type="button" onClick={onPreviousPage} disabled={meta.page === 1}>
          Anterior
        </button>

        <span>
          Página {meta.page} de {meta.totalPages} ·{' '} {formatInteger(meta.total)} alunos
        </span>

        <button type="button" onClick={onNextPage} disabled={meta.page >= meta.totalPages}>
          Próxima
        </button>
      </footer>
    </section>
  );
}

export default StudentsTable
