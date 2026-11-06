// ─── JWT / Auth Types ────────────────────────────────

export type UserRole =
  | 'SUPER_ADMIN' | 'ORG_ADMIN' | 'AGENCY_ADMIN' | 'RECRUITER'
  | 'SENIOR_RECRUITER' | 'HIRING_MANAGER' | 'INTERVIEWER'
  | 'CLIENT_ADMIN' | 'CLIENT_USER' | 'CANDIDATE';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  organizationId: string | null;
}

// ─── Standard API Response Types ─────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: { field: string; message: string }[];
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  pagination: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ─── Inter-Service Communication ─────────────────────

export interface ServiceHealthResponse {
  status: 'ok' | 'degraded' | 'down';
  service: string;
  version: string;
  timestamp: string;
  uptime: number;
  dependencies?: Record<string, 'ok' | 'down'>;
}

/** Event payload for async inter-service messaging (SQS/EventBridge) */
export interface ServiceEvent<T = unknown> {
  eventType: string;
  source: string;
  timestamp: string;
  correlationId: string;
  payload: T;
}

// ─── Common Event Payloads ───────────────────────────

export interface UserCreatedEvent {
  userId: string;
  email: string;
  role: UserRole;
  organizationId: string | null;
}

export interface JobCreatedEvent {
  jobId: string;
  organizationId: string;
  title: string;
  status: string;
}

export interface ApplicationCreatedEvent {
  applicationId: string;
  jobId: string;
  candidateId: string;
  organizationId: string;
}

export interface CandidateProfileUpdatedEvent {
  candidateId: string;
  userId: string;
  fields: string[];
}

// ─── Shared Query Params ─────────────────────────────

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SearchParams extends PaginationParams {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
