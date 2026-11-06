# ── Auth Service ──────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copy shared libs first (prisma schema, middleware, utils)
COPY services/shared ./services/shared
COPY services/auth-service/package*.json ./services/auth-service/

WORKDIR /app/services/auth-service
RUN npm ci

COPY services/auth-service ./

# Generate Prisma client from shared schema
WORKDIR /app/services/shared
RUN npx prisma generate

WORKDIR /app/services/auth-service
RUN npm run build

# ── Production image ─────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

COPY --from=builder /app/services/auth-service/dist ./dist
COPY --from=builder /app/services/auth-service/node_modules ./node_modules
COPY --from=builder /app/services/shared ./services/shared

USER appuser
EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "dist/index.js"]
