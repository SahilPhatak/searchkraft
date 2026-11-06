export interface ServiceRoute {
  /** Path prefix to match (e.g. '/api/v1/auth') */
  prefix: string;
  /** Target service base URL */
  target: string;
}

export interface ServiceConfig {
  name: string;
  url: string;
  healthPath: string;
}

const env = (key: string, fallback: string): string =>
  process.env[key] || fallback;

// ─── Service URLs ────────────────────────────────────────
export const AUTH_SERVICE_URL     = env('AUTH_SERVICE_URL',     'http://auth-service:3001');
export const JOBS_SERVICE_URL    = env('JOBS_SERVICE_URL',    'http://jobs-service:3002');
export const CANDIDATE_SERVICE_URL = env('CANDIDATE_SERVICE_URL', 'http://candidate-service:3003');
export const NOTIFICATION_SERVICE_URL = env('NOTIFICATION_SERVICE_URL', 'http://notification-service:3004');
export const AI_SERVICE_URL      = env('AI_SERVICE_URL',      'http://ai-service:3005');
export const ANALYTICS_SERVICE_URL = env('ANALYTICS_SERVICE_URL', 'http://analytics-service:3006');

// ─── Route → service mapping ─────────────────────────────
// Order matters: more-specific prefixes must come first.
export const SERVICE_ROUTES: ServiceRoute[] = [
  // Auth service
  { prefix: '/api/v1/auth',   target: AUTH_SERVICE_URL },
  { prefix: '/api/v1/users',  target: AUTH_SERVICE_URL },
  { prefix: '/api/v1/admin',  target: AUTH_SERVICE_URL },

  // Jobs service
  { prefix: '/api/v1/jobs',     target: JOBS_SERVICE_URL },
  { prefix: '/api/v1/pipeline', target: JOBS_SERVICE_URL },
  { prefix: '/api/v1/clients',  target: JOBS_SERVICE_URL },

  // Candidate service
  { prefix: '/api/v1/candidate-portal', target: CANDIDATE_SERVICE_URL },
  { prefix: '/api/v1/candidates',       target: CANDIDATE_SERVICE_URL },
  { prefix: '/api/v1/search',           target: CANDIDATE_SERVICE_URL },
  { prefix: '/api/v1/sourcing',         target: CANDIDATE_SERVICE_URL },

  // Notification service
  { prefix: '/api/v1/notifications', target: NOTIFICATION_SERVICE_URL },
  { prefix: '/api/v1/tasks',        target: NOTIFICATION_SERVICE_URL },

  // AI service
  { prefix: '/api/v1/ai',         target: AI_SERVICE_URL },
  { prefix: '/api/v1/interviews', target: AI_SERVICE_URL },
  { prefix: '/api/v1/outreach',  target: AI_SERVICE_URL },

  // Analytics service
  { prefix: '/api/v1/analytics', target: ANALYTICS_SERVICE_URL },
];

// ─── Downstream services for health checks ───────────────
export const DOWNSTREAM_SERVICES: ServiceConfig[] = [
  { name: 'auth-service',         url: AUTH_SERVICE_URL,         healthPath: '/health' },
  { name: 'jobs-service',         url: JOBS_SERVICE_URL,         healthPath: '/health' },
  { name: 'candidate-service',    url: CANDIDATE_SERVICE_URL,    healthPath: '/health' },
  { name: 'notification-service', url: NOTIFICATION_SERVICE_URL, healthPath: '/health' },
  { name: 'ai-service',           url: AI_SERVICE_URL,           healthPath: '/health' },
  { name: 'analytics-service',    url: ANALYTICS_SERVICE_URL,    healthPath: '/health' },
];

// ─── Gateway settings ────────────────────────────────────
export const GATEWAY_PORT = parseInt(process.env.PORT || '3000', 10);

export const CORS_ORIGINS = process.env.CORS_ORIGIN?.split(',') || [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://searchkraft.vercel.app',
];

export const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '200', 10),
};
