import type { Cluster } from '../api.ts'

type ClusterSelectorProps = {
  clusters: Cluster[]
  selectedClusterId: number | null
  onChange: (value: string) => void
}

function ClusterSelector({ clusters, selectedClusterId, onChange }: ClusterSelectorProps){
  return (
    <section className="cluster-selector">
      <label htmlFor="cluster-select">Cluster:</label>

      <select id="cluster-select" value={selectedClusterId ?? ''} onChange={(event) => onChange(event.target.value)}>
        <option value="">Todos</option>

        {
          clusters.map((cluster) => (
            <option key={cluster.clusterId} value={cluster.clusterId}>
              {cluster.name}
            </option>
          ))
        }
      </select>
    </section>
  );
}

export default ClusterSelector