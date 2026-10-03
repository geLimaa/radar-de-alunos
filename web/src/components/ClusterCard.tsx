import type { Cluster } from '../api.ts'
import { formatInteger, formatNumber, formatPercent, formatDays } from '../format.ts'

type ClusterCardProps = {
  cluster: Cluster
  onSelect: (clusterId: number) => void
}

function ClusterCard({ cluster, onSelect }: ClusterCardProps){
  const { featureMeans } = cluster

  const rates = [
    featureMeans.correctRateLanguages,
    featureMeans.correctRateHuman,
    featureMeans.correctRateNature,
    featureMeans.correctRateMath
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
    <button type="button" className="cluster-card" onClick={() => onSelect(cluster.clusterId)}>
      <h3>{cluster.name}</h3>
      <p>{cluster.description}</p>

      <strong>
        {formatInteger(cluster.size)} alunos · {formatPercent(cluster.share)} da base
      </strong>

      <ul>
        <li>
          Tempo de matrícula: {formatDays(featureMeans.tenureDays)} 
        </li>

        <li>
          Dias sem atividade:{' '} {formatDays(featureMeans.daysSinceLastActivity)} 
        </li>

        <li>
          Aulas em 30 dias: {formatNumber(featureMeans.lessonsLast30d)}
        </li>

        <li>
          Acerto médio: {formatPercent(averageCorrectRate)}
        </li>
      </ul>
    </button>
  );
}

export default ClusterCard