/**
 * Seed load test users into the database
 * Run: npx tsx infrastructure/scripts/seed-load-test-users.ts
 *
 * Creates test users for k6 load testing.
 * Adjust TOTAL_CANDIDATES and TOTAL_RECRUITERS for your test scale.
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const TOTAL_CANDIDATES = 1000;
const TOTAL_RECRUITERS = 300;
const PASSWORD = 'LoadTest123!';
const BATCH_SIZE = 100;

async function main() {
  console.log('Seeding load test users...');

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  // Create a test organization for recruiters
  const org = await prisma.organization.upsert({
    where: { slug: 'loadtest-org' },
    update: {},
    create: {
      name: 'Load Test Organization',
      slug: 'loadtest-org',
      plan: 'ENTERPRISE',
    },
  });

  // Create test jobs for the org
  const jobSkills = [
    ['React', 'TypeScript', 'Node.js'],
    ['Python', 'Django', 'PostgreSQL'],
    ['Java', 'Spring Boot', 'AWS'],
    ['Go', 'Kubernetes', 'Docker'],
    ['Data Science', 'Python', 'TensorFlow'],
  ];

  const jobs = [];
  for (let i = 0; i < 50; i++) {
    const skills = jobSkills[i % jobSkills.length];
    const job = await prisma.job.upsert({
      where: {
        organizationId_slug: {
          organizationId: org.id,
          slug: `loadtest-job-${i}`,
        },
      },
      update: {},
      create: {
        organizationId: org.id,
        title: `Load Test Job ${i} - ${skills[0]} Developer`,
        slug: `loadtest-job-${i}`,
        description: `Test job for load testing - ${skills.join(', ')}`,
        status: 'ACTIVE',
        workMode: ['REMOTE', 'HYBRID', 'ONSITE'][i % 3] as 'REMOTE' | 'HYBRID' | 'ONSITE',
        experienceLevel: ['ENTRY', 'MID', 'SENIOR'][i % 3] as 'ENTRY' | 'MID' | 'SENIOR',
        location: ['Mumbai', 'Bangalore', 'Remote'][i % 3],
        skills,
        applicationCount: 0,
      },
    });
    jobs.push(job);

    // Create pipeline stages
    const stageCount = await prisma.pipelineStage.count({ where: { jobId: job.id } });
    if (stageCount === 0) {
      await prisma.pipelineStage.createMany({
        data: [
          { jobId: job.id, name: 'Applied', stageType: 'APPLIED', order: 1, color: '#3B82F6' },
          { jobId: job.id, name: 'Screening', stageType: 'SCREENING', order: 2, color: '#F59E0B' },
          { jobId: job.id, name: 'Interview', stageType: 'INTERVIEW', order: 3, color: '#8B5CF6' },
          { jobId: job.id, name: 'Offer', stageType: 'OFFER', order: 4, color: '#10B981' },
          { jobId: job.id, name: 'Hired', stageType: 'HIRED', order: 5, color: '#059669' },
        ],
      });
    }
  }
  console.log(`Created ${jobs.length} test jobs`);

  // Seed candidates in batches
  console.log(`Seeding ${TOTAL_CANDIDATES} candidates...`);
  for (let batch = 0; batch < TOTAL_CANDIDATES; batch += BATCH_SIZE) {
    const end = Math.min(batch + BATCH_SIZE, TOTAL_CANDIDATES);
    const users = [];
    for (let i = batch; i < end; i++) {
      users.push({
        email: `loadtest-candidate-${i + 1}@test.searchkraft.com`,
        passwordHash,
        name: `Test Candidate ${i + 1}`,
        role: 'CANDIDATE' as const,
      });
    }

    // Upsert each user
    for (const u of users) {
      await prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: u,
      });
    }
    console.log(`  Candidates: ${end}/${TOTAL_CANDIDATES}`);
  }

  // Seed recruiters in batches
  console.log(`Seeding ${TOTAL_RECRUITERS} recruiters...`);
  for (let batch = 0; batch < TOTAL_RECRUITERS; batch += BATCH_SIZE) {
    const end = Math.min(batch + BATCH_SIZE, TOTAL_RECRUITERS);
    const users = [];
    for (let i = batch; i < end; i++) {
      users.push({
        email: `loadtest-recruiter-${i + 1}@test.searchkraft.com`,
        passwordHash,
        name: `Test Recruiter ${i + 1}`,
        role: 'RECRUITER' as const,
        organizationId: org.id,
      });
    }

    for (const u of users) {
      await prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: u,
      });
    }
    console.log(`  Recruiters: ${end}/${TOTAL_RECRUITERS}`);
  }

  console.log('\nLoad test seeding complete!');
  console.log(`  Candidates: ${TOTAL_CANDIDATES}`);
  console.log(`  Recruiters: ${TOTAL_RECRUITERS}`);
  console.log(`  Jobs: ${jobs.length}`);
  console.log(`  Password: ${PASSWORD}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
