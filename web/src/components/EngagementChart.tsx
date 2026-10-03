import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { EngagementBandName, EngagementCounts } from '../api.ts'
import { engagementLabels } from '../labels.ts'

type EngagementChartProps = {
  engagement: EngagementCounts
}

const engagementOrder: EngagementBandName[] = [
  'engaged',
  'slipping',
  'disengaged',
  'never',
]

function EngagementChart({ engagement }: EngagementChartProps){
  const data = engagementOrder.map((key) => ({
    key,
    label: engagementLabels[key],
    value: engagement[key],
  }))

  return (
    <section className="card">
      <h2>Engajamento dos alunos</h2>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>

          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" fill="#2e84b2" minPointSize={2} />

        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}

export default EngagementChart