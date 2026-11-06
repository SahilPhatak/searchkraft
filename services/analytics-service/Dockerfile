# ── Analytics Service ─────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY services/shared ./services/shared
COPY services/analytics-service/package*.json ./services/analytics-service/

WORKDIR /app/services/analytics-service
RUN npm ci

COPY services/analytics-service ./

WORKDIR /app/services/shared
RUN npx prisma generate

WORKDIR /app/services/analytics-service
RUN npm run build

# ── Production image ─────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

COPY --from=builder /app/services/analytics-service/dist ./dist
COPY --from=builder /app/services/analytics-service/node_modules ./node_modules
COPY --from=builder /app/services/shared ./services/shared

USER appuser
EXPOSE 3006

ENV NODE_ENV=production
ENV PORT=3006

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3006/health || exit 1

CMD ["node", "dist/index.js"]
