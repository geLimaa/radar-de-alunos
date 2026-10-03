import type { SummaryResponse } from '../api.ts'
import { formatInteger, formatPercent } from '../format.ts'

type SummaryCardsProps = {
  summary: SummaryResponse
}

function SummaryCards({ summary }: SummaryCardsProps){
  let engagedPercentage
  if(summary.totalStudents > 0){
    engagedPercentage = summary.engagement.engaged / summary.totalStudents
  }
  else{
    engagedPercentage = null
  }

  const rates = [
    summary.averages.correctRateLanguages,
    summary.averages.correctRateHuman,
    summary.averages.correctRateNature,
    summary.averages.correctRateMath
  ]
  
  const filteredRates = rates.filter((rate) => {
    return rate !== null
  })

  let averageCorrectRate
  if(filteredRates.length > 0){
    averageCorrectRate = filteredRates.reduce((total, rate) => {
      return total + rate 
    },0) / filteredRates.length
  }
  else{
    averageCorrectRate = null
  }

  return (
    <section className="summary-cards">
      <article className="card">
        <span>Total de alunos</span>
        <strong>{formatInteger(summary.totalStudents)}</strong>
      </article>

      <article className="card">
        <span>Engajados</span>
        <strong>{formatPercent(engagedPercentage)}</strong>
      </article>

      <article className="card">
        <span>Acerto médio</span>
        <strong>{formatPercent(averageCorrectRate)}</strong>
      </article>
    </section>
  )
}

export default SummaryCards;