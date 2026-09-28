// Tipos dos arquivos gerados pelo cluster.py (contrato em docs/01-dados-e-clusters.md, na raiz do repositório).
// São só tipos: em parâmetro ou retorno de método com decorator (controllers),
// importe com `import type { ... }` (veja a dica do erro TS1272 no README).

export type StudyYear =
  'high_school_1' | 'high_school_2' | 'high_school_3' | 'prep';

export type DesiredCourse =
  | 'medicine'
  | 'law'
  | 'engineering'
  | 'dentistry'
  | 'psychology'
  | 'nursing'
  | 'other';

export type SchoolType = 'public' | 'private';

export type Plan = 'standard' | 'premium' | 'elite';

export type MentorshipFrequency = 'monthly' | 'biweekly';

/** Um aluno de `students.json`: os 21 campos do CSV + `tenureDays` + `clusterId`. */
export interface Student {
  id: number;
  name: string;
  state: string;
  studyYear: StudyYear;
  desiredCourse: DesiredCourse;
  schoolType: SchoolType;
  plan: Plan;
  mentorshipFrequency: MentorshipFrequency;
  /** `YYYY-MM-DD` */
  enrolledAt: string;
  /** `null` = nunca teve atividade */
  daysSinceLastActivity: number | null;
  lessonsLast30d: number;
  completedMentorships: number;
  missedMentorships: number;
  avgMentorshipRating: number | null;
  simulationsTaken: number;
  correctRateLanguages: number | null;
  correctRateHuman: number | null;
  correctRateNature: number | null;
  correctRateMath: number | null;
  essaysSubmitted: number;
  avgEssayScore: number | null;
  tenureDays: number;
  clusterId: number;
}

/** As 13 médias de um cluster, em unidades originais; `null` se todos os valores forem nulos. */
export interface FeatureMeans {
  tenureDays: number | null;
  daysSinceLastActivity: number | null;
  lessonsLast30d: number | null;
  completedMentorships: number | null;
  missedMentorships: number | null;
  avgMentorshipRating: number | null;
  simulationsTaken: number | null;
  correctRateLanguages: number | null;
  correctRateHuman: number | null;
  correctRateNature: number | null;
  correctRateMath: number | null;
  essaysSubmitted: number | null;
  avgEssayScore: number | null;
}

export interface KSelectionItem {
  k: number;
  inertia: number;
  silhouette: number;
}

/** Um item da lista `clusters` de `clusters.json`. */
export interface Cluster {
  clusterId: number;
  name: string;
  description: string;
  size: number;
  featureMeans: FeatureMeans;
}

/** Conteúdo de `clusters.json`. */
export interface ClustersFile {
  /** `YYYY-MM-DD` */
  referenceDate: string;
  seed: number;
  studentCount: number;
  k: number;
  features: string[];
  kSelection: KSelectionItem[];
  clusters: Cluster[];
}
