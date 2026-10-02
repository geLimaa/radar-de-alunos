// URL base da API. Vem de VITE_API_URL (arquivo .env); sem ela, usa a API local.
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/+$/, '')

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

// ENDPOINTS TYPES 
// GET /api/health
export type HealthResponse = {
  status: string
}

// GET /api/clusters
export type FeatureMeans = {
  tenureDays: number | null
  daysSinceLastActivity: number | null
  lessonsLast30d: number | null
  completedMentorships: number | null
  missedMentorships: number | null  
  avgMentorshipRating: number | null
  simulationsTaken: number | null
  correctRateLanguages: number | null
  correctRateHuman: number | null
  correctRateNature: number | null
  correctRateMath: number | null
  essaysSubmitted: number | null
  avgEssayScore: number | null
}

export type Cluster = {
  clusterId: number
  name: string
  description: string 
  size: number 
  featureMeans: FeatureMeans
  share: number
}

export type ClustersResponse = {
  referenceDate: string
  k: number
  studentCount: number
  kSelection: {
    k: number
    inertia: number
    silhouette: number
  }[]
  data: Cluster[]
}

// GET /api/summary
export type EngagementCounts = {
  engaged: number
  slipping: number
  disengaged: number
  never: number
}

export type EngagementBandName = "engaged" | "slipping" | "disengaged" | "never"

export type Averages = {
  correctRateLanguages: number | null
  correctRateHuman: number | null
  correctRateNature: number | null
  correctRateMath: number | null
  avgEssayScore: number | null
  completedMentorships: number | null 
  lessonsLast30d: number | null
}

export type SummaryResponse = {
  referenceDate: string
  clusterId: number | null
  totalStudents: number 
  engagement: EngagementCounts
  averages: Averages
}

// GET /api/students
export type Student = {
  id: number
  name:	string
  studyYear: string 
  plan:	string
  clusterId:	number
  clusterName: string
  engagementBand: EngagementBandName
  daysSinceLastActivity:	number | null
  completedMentorships: number
  avgCorrectRate:	number | null
}

export type Metadata = {
  page: number 
  pageSize: number 
  total: number 
  totalPages: number
}

export type StudentsResponse = {
  data: Student[]
  meta: Metadata   
}

// ENDPOINTS GET FUNCTIONS
// GET /api/health
export function getHealth(): Promise<HealthResponse> {
  return getJson<HealthResponse>('/health')
}

// GET /api/clusters
export function getClusters(signal?: AbortSignal): Promise<ClustersResponse> {
  return getJson<ClustersResponse>('/clusters', signal)
}

// GET /api/summary 
export function getSummary(clusterId?: number, signal?: AbortSignal): Promise<SummaryResponse> {
  let query
  if(clusterId === undefined){
    query = ''
  }
  else{
    query = `?clusterId=${clusterId}`
  }
  return getJson<SummaryResponse>(`/summary${query}`, signal)
}

export function getStudents(page: number, pageSize: number, clusterId?: number, signal?: AbortSignal): Promise<StudentsResponse> {
  let clusterIdQuery
  if(clusterId === undefined){
    clusterIdQuery = ''
  }
  else{
    clusterIdQuery = `?clusterId=${clusterId}`
  }

  if(clusterId !== undefined){
    return getJson<StudentsResponse>(`/students${clusterIdQuery}&page=${page}&pageSize=${pageSize}`, signal)    
  }
  else{
    return getJson<StudentsResponse>(`/students${clusterIdQuery}?page=${page}&pageSize=${pageSize}`, signal)
  }
}