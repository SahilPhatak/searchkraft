# ── Notification Service ──────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY services/shared ./services/shared
COPY services/notification-service/package*.json ./services/notification-service/

WORKDIR /app/services/notification-service
RUN npm ci

COPY services/notification-service ./

WORKDIR /app/services/shared
RUN npx prisma generate

WORKDIR /app/services/notification-service
RUN npm run build

# ── Production image ─────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

COPY --from=builder /app/services/notification-service/dist ./dist
COPY --from=builder /app/services/notification-service/node_modules ./node_modules
COPY --from=builder /app/services/shared ./services/shared

USER appuser
EXPOSE 3004

ENV NODE_ENV=production
ENV PORT=3004

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3004/health || exit 1

CMD ["node", "dist/index.js"]
