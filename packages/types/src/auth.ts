export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: 'RECRUITER' | 'CANDIDATE';
  organizationName?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    organizationId: string | null;
  };
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  organizationId: string | null;
  iat: number;
  exp: number;
}
