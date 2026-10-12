export type StageType = 'SOURCED' | 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'HIRED' | 'REJECTED' | 'WITHDRAWN';
export type ApplicationStatus = 'ACTIVE' | 'REJECTED' | 'WITHDRAWN' | 'HIRED';

export interface PipelineStage {
  id: string;
  jobId: string;
  name: string;
  stageType: StageType;
  order: number;
  color?: string | null;
  applications?: Application[];
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  stageId: string;
  status: ApplicationStatus;
  aiScore?: number | null;
  aiScoreBreakdown?: Record<string, number> | null;
  aiReasoning?: string | null;
  appliedAt: string;
  updatedAt: string;
  candidate?: {
    id: string;
    name: string;
    currentTitle?: string | null;
    currentCompany?: string | null;
    skills: string[];
    avatarUrl?: string | null;
  };
}

export interface KanbanBoard {
  job: { id: string; title: string; status: string };
  stages: PipelineStage[];
}
