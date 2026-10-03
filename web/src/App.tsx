import { useEffect, useState } from 'react'
import { getClusters, getStudents, getSummary } from './api.ts'
import type { ClustersResponse, StudentsResponse, SummaryResponse } from './api.ts'
import DashboardHeader from './components/DashboardHeader.tsx'
import ClusterSelector from './components/ClusterSelector.tsx'
import SummaryCard from './components/SummaryCard.tsx'
import EngagementChart from './components/EngagementChart.tsx'
import ClusterCard from './components/ClusterCard.tsx'
import StudentsTable from './components/StudentsTable.tsx'

type ClustersState = { kind: 'loading' } | { kind: 'success'; data: ClustersResponse } | { kind: 'error'; message: string }
type SummaryState = { kind: 'loading' } | { kind: 'success'; data: SummaryResponse } | { kind: 'error'; message: string }
type StudentsState = { kind: 'loading' } | { kind: 'success'; data: StudentsResponse } | { kind: 'error'; message: string }

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Erro desconhecido'
}

function App(){

  const [selectedClusterId, setSelectedClusterId] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20
  const [clustersAttempt, setClustersAttempt] = useState(0)
  const [summaryAttempt, setSummaryAttempt] = useState(0)
  const [studentsAttempt, setStudentsAttempt] = useState(0)

  const [clusters, setClusters] = useState<ClustersState>({
    kind: 'loading',
  })

  const [summary, setSummary] = useState<SummaryState>({
    kind: 'loading',
  })

  const [students, setStudents] = useState<StudentsState>({
    kind: 'loading',
  })

  useEffect(() => {
    let ignore = false

    getClusters().then((data) => {
      if(!ignore){
        setClusters({ kind: 'success', data })
      }
    }).catch((error: unknown) => {
        if(!ignore){
          setClusters({ kind: 'error', message: getErrorMessage(error) })
        }
    })

    return () => {
      ignore = true
    }
  },[clustersAttempt])

  useEffect(() => {
    let ignore = false

    getSummary(selectedClusterId ?? undefined).then((data) => {
      if(!ignore){
        setSummary({ kind: 'success', data })
      }
    }).catch((error: unknown) => {
      if(!ignore){
        setSummary({ kind: 'error', message: getErrorMessage(error) })
      }
    })

    return () => {
      ignore = true
    }
  },[selectedClusterId, summaryAttempt])

  useEffect(() => {
    let ignore = false

    getStudents(currentPage, pageSize, selectedClusterId ?? undefined).then((data) => {
      if(!ignore){
        setStudents({ kind: 'success', data })
      }
    }).catch((error: unknown) => {
      if(!ignore){
        setStudents({ kind: 'error', message: getErrorMessage(error) })
      }
    })

    return () => {
      ignore = true
    }
  },[currentPage, selectedClusterId, studentsAttempt])

  function retryClusters(){
    setClusters({ kind: 'loading' })
    setClustersAttempt((attempt) => attempt + 1)
  }

  function retrySummary(){
    setSummary({ kind: 'loading' })
    setSummaryAttempt((attempt) => attempt + 1)
  }

  function retryStudents(){
    setStudents({ kind: 'loading' })
    setStudentsAttempt((attempt) => attempt + 1)
  }

  function handleClusterChange(value: string | number){
    let clusterId
    if(value === ''){
      clusterId = null
    }
    else{
      clusterId = Number(value)
    }

    setSelectedClusterId(clusterId)
    setCurrentPage(1)
    setSummary({ kind: 'loading' })
    setStudents({ kind: 'loading' })
  }

  function handlePreviousPage(){
    if(currentPage > 1){
      setStudents({ kind: 'loading' })
      setCurrentPage((page) => page - 1)
    }
  }

  function handleNextPage(){
    if(students.kind === 'success' && currentPage < students.data.meta.totalPages){
      setStudents({ kind: 'loading' })
      setCurrentPage((page) => page + 1)
    }
  }

  return (

    <main className="page">
      <DashboardHeader referenceDate={ clusters.kind === 'success' ? clusters.data.referenceDate: null} />


      {clusters.kind === 'loading' && <p>Carregando clusters...</p>}
      {clusters.kind === 'error' && (
        <section>
          <p role="alert">Erro: {clusters.message}</p>
          <button type="button" onClick={retryClusters}>
            Tentar de novo
          </button>
        </section>
      )}
      {
        clusters.kind === 'success' && (
          <>
            {clusters.data.data.length === 0 && <p>Nenhum cluster encontrado.</p>}
            <ClusterSelector clusters={clusters.data.data} selectedClusterId={selectedClusterId} onChange={handleClusterChange} />
          </>
        )
      }

      {summary.kind === 'loading' && <p>Carregando resumo...</p>}
      {summary.kind === 'error' && (
        <section>
          <p role="alert">Erro no resumo: {summary.message}</p>
          <button type="button" onClick={retrySummary}>
            Tentar de novo
          </button>
        </section>
      )}
      {
        summary.kind === 'success' && (
          <section className='summary'>
            <SummaryCard summary={summary.data}/>
            <EngagementChart engagement={summary.data.engagement}/>
          </section>
        )
      }

      {
        clusters.kind === 'success' && (
          <section className='cluster-cards'>
            {
              clusters.data.data.map((cluster) => {
                return <ClusterCard key={cluster.clusterId} cluster={cluster} onSelect={handleClusterChange}/>
              })
            }
          </section>
        )
      }

      {students.kind === 'loading' && <p>Carregando alunos...</p>}
      {students.kind === 'error' && (
        <section>
          <p role="alert">Erro nos alunos: {students.message}</p>
          <button type="button" onClick={retryStudents}>
            Tentar de novo
          </button>
        </section>
      )}
      {
        students.kind === 'success' && (
          <section> 
            <StudentsTable students={students.data} onPreviousPage={handlePreviousPage} onNextPage={handleNextPage}/>
          </section>
        )
      }
    </main>

  );
}

export default App;
