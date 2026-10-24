-- Migration: Add new enums and tables for AI Sourcing, Outreach, and Interviews
-- Run this in your Neon SQL Editor AFTER the initial migration (migrate.sql)

-- ─── New Enums ───────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE "AgentStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "OutreachChannel" AS ENUM ('EMAIL', 'WHATSAPP', 'PHONE', 'LINKEDIN');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "OutreachStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "MessageStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'OPENED', 'REPLIED', 'BOUNCED', 'FAILED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "InterviewStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "InterviewType" AS ENUM ('SCREENING', 'TECHNICAL', 'BEHAVIORAL', 'LIVE_CODING', 'CASE_STUDY', 'CULTURE_FIT');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── Add new columns to Candidate ───────────────────

ALTER TABLE "Candidate" ADD COLUMN IF NOT EXISTS "source" TEXT;
ALTER TABLE "Candidate" ADD COLUMN IF NOT EXISTS "sourceDetails" TEXT;
ALTER TABLE "Candidate" ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT '{}';
ALTER TABLE "Candidate" ADD COLUMN IF NOT EXISTS "aiMatchScore" INTEGER;

-- ─── AI Sourcing Tables ─────────────────────────────

CREATE TABLE IF NOT EXISTS "SourcingAgent" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "jobId" TEXT,
    "createdById" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "searchQuery" TEXT NOT NULL,
    "filters" JSONB,
    "status" "AgentStatus" NOT NULL DEFAULT 'ACTIVE',
    "totalFound" INTEGER NOT NULL DEFAULT 0,
    "totalReviewed" INTEGER NOT NULL DEFAULT 0,
    "lastRunAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SourcingAgent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "SourcingResult" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "matchScore" INTEGER NOT NULL,
    "matchReasoning" TEXT,
    "signals" JSONB,
    "isReviewed" BOOLEAN NOT NULL DEFAULT false,
    "isShortlisted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SourcingResult_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "SavedSearch" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "filters" JSONB,
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SavedSearch_pkey" PRIMARY KEY ("id")
);

-- ─── Outreach Tables ────────────────────────────────

CREATE TABLE IF NOT EXISTS "OutreachCampaign" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "jobId" TEXT,
    "createdById" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channel" "OutreachChannel" NOT NULL DEFAULT 'EMAIL',
    "status" "OutreachStatus" NOT NULL DEFAULT 'DRAFT',
    "subject" TEXT,
    "templateBody" TEXT,
    "followUpDays" INTEGER,
    "maxFollowUps" INTEGER NOT NULL DEFAULT 3,
    "totalSent" INTEGER NOT NULL DEFAULT 0,
    "totalOpened" INTEGER NOT NULL DEFAULT 0,
    "totalReplied" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "OutreachCampaign_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "OutreachStep" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "channel" "OutreachChannel" NOT NULL DEFAULT 'EMAIL',
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "delayDays" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OutreachStep_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "OutreachMessage" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "channel" "OutreachChannel" NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "repliedAt" TIMESTAMP(3),
    "replyBody" TEXT,
    "stepNumber" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "OutreachMessage_pkey" PRIMARY KEY ("id")
);

-- ─── AI Interview Tables ────────────────────────────

CREATE TABLE IF NOT EXISTS "AIInterview" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "conductedById" TEXT,
    "type" "InterviewType" NOT NULL DEFAULT 'SCREENING',
    "status" "InterviewStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "overallScore" INTEGER,
    "summary" TEXT,
    "strengths" TEXT[] DEFAULT '{}',
    "concerns" TEXT[] DEFAULT '{}',
    "recommendation" TEXT,
    "recordingUrl" TEXT,
    "transcriptUrl" TEXT,
    "cheatingFlags" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AIInterview_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "InterviewQuestion" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "answerText" TEXT,
    "score" INTEGER,
    "feedback" TEXT,
    "order" INTEGER NOT NULL,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InterviewQuestion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "InterviewSkillScore" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "skillName" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "maxScore" INTEGER NOT NULL DEFAULT 10,
    "notes" TEXT,
    CONSTRAINT "InterviewSkillScore_pkey" PRIMARY KEY ("id")
);

-- ─── Unique Indexes ─────────────────────────────────

CREATE UNIQUE INDEX IF NOT EXISTS "SourcingResult_agentId_candidateId_key" ON "SourcingResult"("agentId", "candidateId");

-- ─── Foreign Keys ───────────────────────────────────

-- SourcingAgent
ALTER TABLE "SourcingAgent" ADD CONSTRAINT "SourcingAgent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SourcingAgent" ADD CONSTRAINT "SourcingAgent_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SourcingAgent" ADD CONSTRAINT "SourcingAgent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SourcingResult
ALTER TABLE "SourcingResult" ADD CONSTRAINT "SourcingResult_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "SourcingAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SourcingResult" ADD CONSTRAINT "SourcingResult_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SavedSearch
ALTER TABLE "SavedSearch" ADD CONSTRAINT "SavedSearch_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SavedSearch" ADD CONSTRAINT "SavedSearch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- OutreachCampaign
ALTER TABLE "OutreachCampaign" ADD CONSTRAINT "OutreachCampaign_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OutreachCampaign" ADD CONSTRAINT "OutreachCampaign_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OutreachCampaign" ADD CONSTRAINT "OutreachCampaign_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- OutreachStep
ALTER TABLE "OutreachStep" ADD CONSTRAINT "OutreachStep_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "OutreachCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- OutreachMessage
ALTER TABLE "OutreachMessage" ADD CONSTRAINT "OutreachMessage_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "OutreachCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OutreachMessage" ADD CONSTRAINT "OutreachMessage_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AIInterview
ALTER TABLE "AIInterview" ADD CONSTRAINT "AIInterview_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AIInterview" ADD CONSTRAINT "AIInterview_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AIInterview" ADD CONSTRAINT "AIInterview_conductedById_fkey" FOREIGN KEY ("conductedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- InterviewQuestion
ALTER TABLE "InterviewQuestion" ADD CONSTRAINT "InterviewQuestion_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "AIInterview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- InterviewSkillScore
ALTER TABLE "InterviewSkillScore" ADD CONSTRAINT "InterviewSkillScore_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "AIInterview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── Record migration ───────────────────────────────

INSERT INTO "_prisma_migrations" ("id", "checksum", "migration_name", "finished_at", "applied_steps_count")
VALUES (gen_random_uuid()::text, 'manual_migration_v2', '20240301000000_add_sourcing_outreach_interviews', now(), 1);
