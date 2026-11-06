# ── API Gateway ───────────────────────────────────────
# NOTE: No Prisma needed — gateway only routes requests
FROM node:20-alpine AS builder
WORKDIR /app

COPY services/api-gateway/package*.json ./services/api-gateway/

WORKDIR /app/services/api-gateway
RUN npm ci

COPY services/api-gateway ./
RUN npm run build

# ── Production image ─────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

COPY --from=builder /app/services/api-gateway/dist ./dist
COPY --from=builder /app/services/api-gateway/node_modules ./node_modules

USER appuser
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
