export type JobStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'CLOSED' | 'ARCHIVED';
export type WorkMode = 'REMOTE' | 'ONSITE' | 'HYBRID';
export type ExperienceLevel = 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE';

export interface Job {
  id: string;
  organizationId: string;
  clientId?: string | null;
  title: string;
  slug: string;
  description: string;
  requirements?: string | null;
  responsibilities?: string | null;
  status: JobStatus;
  workMode: WorkMode;
  experienceLevel: ExperienceLevel;
  location?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency: string;
  skills: string[];
  department?: string | null;
  headcount: number;
  applicationCount: number;
  createdAt: string;
  updatedAt: string;
  client?: { name: string; logoUrl?: string | null } | null;
}

export interface CreateJobRequest {
  title: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  workMode?: WorkMode;
  experienceLevel?: ExperienceLevel;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  skills?: string[];
  department?: string;
  headcount?: number;
  clientId?: string;
}
