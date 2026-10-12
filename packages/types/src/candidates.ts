export type AvailabilityStatus = 'ACTIVELY_LOOKING' | 'OPEN' | 'NOT_LOOKING' | 'EMPLOYED';

export interface Candidate {
  id: string;
  organizationId?: string | null;
  userId?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  location?: string | null;
  currentTitle?: string | null;
  currentCompany?: string | null;
  experienceYears?: number | null;
  skills: string[];
  summary?: string | null;
  resumeUrl?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  availabilityStatus: AvailabilityStatus;
  expectedSalary?: number | null;
  noticePeriodDays?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCandidateRequest {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  currentTitle?: string;
  currentCompany?: string;
  experienceYears?: number;
  skills?: string[];
  summary?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  availabilityStatus?: AvailabilityStatus;
  expectedSalary?: number;
  noticePeriodDays?: number;
}
