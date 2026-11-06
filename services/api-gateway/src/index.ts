import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import winston from 'winston';
import {
  SERVICE_ROUTES,
  DOWNSTREAM_SERVICES,
  GATEWAY_PORT,
  CORS_ORIGINS,
  RATE_LIMIT,
} from './config';

// ─── Logger ──────────────────────────────────────────────
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  defaultMeta: { service: 'api-gateway' },
  transports: [new winston.transports.Console()],
});

// ─── Express app ─────────────────────────────────────────
const app = express();

// Trust proxy (behind ALB / Nginx in EKS)
app.set('trust proxy', true);

// Security headers
app.use(helmet());

// CORS — allow configured origins + any *.vercel.app preview URL
app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        CORS_ORIGINS.includes(origin) ||
        /\.vercel\.app$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  }),
);

// Rate limiting
app.use(
  rateLimit({
    windowMs: RATE_LIMIT.windowMs,
    max: RATE_LIMIT.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests, please try again later.' },
  }),
);

// ─── Request logging ─────────────────────────────────────
app.use((req: Request, _res: Response, next) => {
  const start = Date.now();
  _res.on('finish', () => {
    logger.info('request', {
      method: req.method,
      path: req.path,
      status: _res.statusCode,
      durationMs: Date.now() - start,
      ip: req.ip,
    });
  });
  next();
});

// ─── Health check ────────────────────────────────────────
app.get('/health', async (_req: Request, res: Response) => {
  const checks: Record<string, string> = {};
  let allHealthy = true;

  await Promise.all(
    DOWNSTREAM_SERVICES.map(async (svc) => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const response = await fetch(`${svc.url}${svc.healthPath}`, {
          signal: controller.signal,
        });
        clearTimeout(timeout);
        checks[svc.name] = response.ok ? 'healthy' : 'unhealthy';
        if (!response.ok) allHealthy = false;
      } catch {
        checks[svc.name] = 'unreachable';
        allHealthy = false;
      }
    }),
  );

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    gateway: 'healthy',
    services: checks,
  });
});

// Liveness probe (lightweight — just confirms the process is alive)
app.get('/healthz', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Readiness probe (confirms gateway can route)
app.get('/readyz', (_req: Request, res: Response) => {
  res.json({ status: 'ready' });
});

// ─── Proxy routes ────────────────────────────────────────
for (const route of SERVICE_ROUTES) {
  const proxyOptions: Options = {
    target: route.target,
    changeOrigin: true,
    // Preserve the original path — do not rewrite
    pathRewrite: undefined,
    on: {
      proxyReq: (proxyReq, req) => {
        // Forward the original client IP
        const clientIp = (req as Request).ip || req.socket.remoteAddress;
        if (clientIp) {
          proxyReq.setHeader('X-Forwarded-For', clientIp);
        }
        // Forward request ID for distributed tracing
        const requestId =
          (req as Request).headers['x-request-id'] ||
          `gw-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        proxyReq.setHeader('X-Request-Id', requestId as string);
      },
      proxyRes: (_proxyRes, req) => {
        logger.debug('proxy_response', {
          target: route.target,
          path: (req as Request).path,
          status: _proxyRes.statusCode,
        });
      },
      error: (err, req, res) => {
        logger.error('proxy_error', {
          target: route.target,
          path: (req as Request).url,
          error: err.message,
        });
        if ('writeHead' in res && typeof res.writeHead === 'function') {
          (res as any).writeHead(502, { 'Content-Type': 'application/json' });
          (res as any).end(
            JSON.stringify({
              success: false,
              error: 'Service temporarily unavailable',
              service: route.prefix,
            }),
          );
        }
      },
    },
  };

  app.use(route.prefix, createProxyMiddleware(proxyOptions));

  logger.info('route_registered', {
    prefix: route.prefix,
    target: route.target,
  });
}

// ─── Fallback 404 ────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ─── Start ───────────────────────────────────────────────
app.listen(GATEWAY_PORT, '0.0.0.0', () => {
  logger.info(`API Gateway running on port ${GATEWAY_PORT}`);
  logger.info(`Routes registered: ${SERVICE_ROUTES.length}`);
});

export default app;
