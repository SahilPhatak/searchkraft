export interface ParsedJobDescription {
  title?: string;
  skills: string[];
  experienceYears?: number;
  location?: string;
  workMode?: string;
  salary?: { min?: number; max?: number; currency?: string };
  responsibilities: string[];
  requirements: string[];
  department?: string;
}

export interface CandidateMatch {
  candidateId: string;
  overallScore: number;
  skillsScore: number;
  experienceScore: number;
  locationScore: number;
  availabilityScore: number;
  reasoning: string;
}

export interface ParsedSearchQuery {
  skills?: string[];
  experienceMin?: number;
  experienceMax?: number;
  location?: string;
  workMode?: string;
  availabilityStatus?: string;
  keywords?: string[];
}
