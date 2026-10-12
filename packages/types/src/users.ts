export type UserRole =
  | 'SUPER_ADMIN'
  | 'ORG_ADMIN'
  | 'AGENCY_ADMIN'
  | 'RECRUITER'
  | 'SENIOR_RECRUITER'
  | 'HIRING_MANAGER'
  | 'INTERVIEWER'
  | 'CLIENT_ADMIN'
  | 'CLIENT_USER'
  | 'CANDIDATE';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId: string | null;
  avatarUrl?: string | null;
  title?: string | null;
  phone?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
