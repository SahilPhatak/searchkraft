# ── AI Service ────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY services/shared ./services/shared
COPY services/ai-service/package*.json ./services/ai-service/

WORKDIR /app/services/ai-service
RUN npm ci

COPY services/ai-service ./

WORKDIR /app/services/shared
RUN npx prisma generate

WORKDIR /app/services/ai-service
RUN npm run build

# ── Production image ─────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

COPY --from=builder /app/services/ai-service/dist ./dist
COPY --from=builder /app/services/ai-service/node_modules ./node_modules
COPY --from=builder /app/services/shared ./services/shared

USER appuser
EXPOSE 3005

ENV NODE_ENV=production
ENV PORT=3005

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3005/health || exit 1

CMD ["node", "dist/index.js"]
