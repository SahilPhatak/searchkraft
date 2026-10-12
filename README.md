# SearchKraft

> AI-native recruitment operating system

[![Deploy to GitHub Pages](https://github.com/phataksahil04/searchkraft/actions/workflows/deploy.yml/badge.svg)](https://github.com/phataksahil04/searchkraft/actions/workflows/deploy.yml)

**Live demo:** https://phataksahil04.github.io/searchkraft/

## What is SearchKraft?

SearchKraft combines:
- **Recruiter workspace** — jobs, pipeline, talent pool, analytics
- **AI matching** — 7-dimension candidate scoring via Anthropic Claude
- **NLP search** — natural language talent search
- **Kanban pipeline** — drag-and-drop candidate management
- **Multi-tenant** — manage multiple clients under one agency account
- **Client portal** — branded view for hiring managers
- **Candidate portal** — self-service job seeker experience
- **PWA** — installable, works offline

## Quick start

### Prerequisites
- Node.js 20+
- Docker (for PostgreSQL)

### Run locally

```bash
# 1. Clone
git clone https://github.com/phataksahil04/searchkraft.git
cd searchkraft

# 2. Install dependencies
npm install

# 3. Start PostgreSQL
docker-compose -f infrastructure/docker/docker-compose.yml up -d

# 4. Configure environment
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your DATABASE_URL and JWT_SECRET

# 5. Run database migrations
cd apps/api && npx prisma migrate dev && npx prisma db seed

# 6. Start dev servers (both API + web)
cd ../..
npm run dev
```

- **Web app:** http://localhost:5173
- **API:** http://localhost:4000
- **Health check:** http://localhost:4000/health

### Demo credentials
After seeding:
- **Admin:** admin@demo.searchkraft.com / demo123456
- **Recruiter:** recruiter@demo.searchkraft.com / demo123456

## Architecture

```
searchkraft/
├── apps/
│   ├── api/          # Express.js + Prisma + PostgreSQL
│   └── web/          # React 18 + Vite + Tailwind (PWA)
├── packages/
│   └── types/        # Shared TypeScript types
└── infrastructure/
    └── docker/       # Docker Compose
```

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| State | TanStack Query v5 |
| Backend | Express.js, TypeScript |
| Database | PostgreSQL 16 + Prisma ORM |
| AI | Anthropic Claude (with mock fallback) |
| PWA | vite-plugin-pwa, Workbox |
| Hosting | GitHub Pages (web) |
| CI/CD | GitHub Actions |

## Deployment

The web app auto-deploys to GitHub Pages on every push to `main`.

For the API, deploy to Railway, Render, or any Node.js host:
```bash
cd apps/api
npm run build
npm start
```

Set `VITE_API_URL` in your GitHub repository secrets to point the web app at your deployed API.

## License

MIT
