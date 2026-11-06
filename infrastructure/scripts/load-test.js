/**
 * SearchKraft Load Test Script
 * Uses k6 to simulate 100,000 concurrent users
 *
 * Install: https://k6.io/docs/get-started/installation/
 * Run: k6 run --vus 1000 --duration 5m infrastructure/scripts/load-test.js
 * Full load: k6 run infrastructure/scripts/load-test.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');
const jobSearchDuration = new Trend('job_search_duration');
const applyDuration = new Trend('apply_duration');
const dashboardDuration = new Trend('dashboard_duration');
const requestCount = new Counter('total_requests');

// Test configuration
const BASE_URL = __ENV.BASE_URL || 'https://api.searchkraft.com';

export const options = {
  scenarios: {
    // Ramp up to 100K concurrent users over 10 minutes
    load_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 1000 },    // Warm up
        { duration: '3m', target: 10000 },   // Ramp to 10K
        { duration: '5m', target: 50000 },   // Ramp to 50K
        { duration: '10m', target: 100000 }, // Peak at 100K
        { duration: '5m', target: 100000 },  // Hold at 100K
        { duration: '3m', target: 0 },       // Cool down
      ],
    },
    // Spike test
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      startTime: '30m',
      stages: [
        { duration: '10s', target: 50000 },  // Instant spike
        { duration: '1m', target: 50000 },   // Hold spike
        { duration: '10s', target: 0 },      // Drop
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],  // 95% under 500ms, 99% under 1s
    errors: ['rate<0.01'],                             // Less than 1% error rate
    login_duration: ['p(95)<300'],
    job_search_duration: ['p(95)<400'],
    dashboard_duration: ['p(95)<500'],
  },
};

// User personas
const CANDIDATE_RATIO = 0.7;  // 70% candidates
const RECRUITER_RATIO = 0.3;  // 30% recruiters

// Pre-generated test users (create these before running)
function getTestUser(vuId) {
  const isCandidate = Math.random() < CANDIDATE_RATIO;
  return {
    email: `loadtest-${isCandidate ? 'candidate' : 'recruiter'}-${vuId}@test.searchkraft.com`,
    password: 'LoadTest123!',
    role: isCandidate ? 'CANDIDATE' : 'RECRUITER',
  };
}

export function setup() {
  // Create seed test users if needed
  console.log(`Load test targeting: ${BASE_URL}`);
  console.log('Ensure test users are seeded before running at scale.');
  return { baseUrl: BASE_URL };
}

export default function (data) {
  const user = getTestUser(__VU);
  const headers = { 'Content-Type': 'application/json' };

  // ─── Login ───────────────────────────────────────────
  group('Authentication', () => {
    const loginStart = Date.now();
    const loginRes = http.post(`${data.baseUrl}/api/v1/auth/login`, JSON.stringify({
      email: user.email,
      password: user.password,
    }), { headers, tags: { name: 'login' } });

    loginDuration.add(Date.now() - loginStart);
    requestCount.add(1);

    const loginOk = check(loginRes, {
      'login status 200': (r) => r.status === 200,
      'login has token': (r) => {
        try { return JSON.parse(r.body).data?.token !== undefined; } catch { return false; }
      },
    });

    if (!loginOk) {
      errorRate.add(1);
      sleep(1);
      return;
    }
    errorRate.add(0);

    const token = JSON.parse(loginRes.body).data.token;
    const authHeaders = { ...headers, Authorization: `Bearer ${token}` };

    sleep(Math.random() * 2 + 0.5); // Think time

    // ─── Role-specific flows ─────────────────────────────
    if (user.role === 'CANDIDATE') {
      candidateFlow(data.baseUrl, authHeaders);
    } else {
      recruiterFlow(data.baseUrl, authHeaders);
    }
  });

  sleep(Math.random() * 3 + 1); // Between-action think time
}

function candidateFlow(baseUrl, headers) {
  // Browse jobs
  group('Candidate - Browse Jobs', () => {
    const start = Date.now();
    const res = http.get(`${baseUrl}/api/v1/candidate-portal/jobs?page=1&limit=20`, {
      headers, tags: { name: 'browse_jobs' },
    });
    jobSearchDuration.add(Date.now() - start);
    requestCount.add(1);

    check(res, { 'browse jobs 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200 ? 1 : 0);
  });

  sleep(Math.random() * 2 + 1);

  // Search jobs with filter
  group('Candidate - Search Jobs', () => {
    const searches = ['React', 'Python', 'DevOps', 'Data Science', 'Java', 'Frontend'];
    const query = searches[Math.floor(Math.random() * searches.length)];
    const start = Date.now();
    const res = http.get(`${baseUrl}/api/v1/candidate-portal/jobs?search=${query}&workMode=REMOTE`, {
      headers, tags: { name: 'search_jobs' },
    });
    jobSearchDuration.add(Date.now() - start);
    requestCount.add(1);

    check(res, { 'search jobs 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200 ? 1 : 0);
  });

  sleep(Math.random() * 1.5 + 0.5);

  // View profile
  group('Candidate - View Profile', () => {
    const res = http.get(`${baseUrl}/api/v1/candidate-portal/profile`, {
      headers, tags: { name: 'view_profile' },
    });
    requestCount.add(1);
    check(res, { 'profile 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200 ? 1 : 0);
  });

  sleep(Math.random() * 1 + 0.5);

  // View stats
  group('Candidate - Dashboard Stats', () => {
    const start = Date.now();
    const res = http.get(`${baseUrl}/api/v1/candidate-portal/stats`, {
      headers, tags: { name: 'candidate_stats' },
    });
    dashboardDuration.add(Date.now() - start);
    requestCount.add(1);
    check(res, { 'stats 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200 ? 1 : 0);
  });

  // View applications
  group('Candidate - My Applications', () => {
    const res = http.get(`${baseUrl}/api/v1/candidate-portal/applications`, {
      headers, tags: { name: 'my_applications' },
    });
    requestCount.add(1);
    check(res, { 'applications 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200 ? 1 : 0);
  });
}

function recruiterFlow(baseUrl, headers) {
  // Dashboard
  group('Recruiter - Dashboard', () => {
    const start = Date.now();
    const res = http.get(`${baseUrl}/api/v1/analytics/dashboard`, {
      headers, tags: { name: 'recruiter_dashboard' },
    });
    dashboardDuration.add(Date.now() - start);
    requestCount.add(1);
    check(res, { 'dashboard 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200 ? 1 : 0);
  });

  sleep(Math.random() * 2 + 1);

  // List jobs
  group('Recruiter - List Jobs', () => {
    const res = http.get(`${baseUrl}/api/v1/jobs?limit=50`, {
      headers, tags: { name: 'list_jobs' },
    });
    requestCount.add(1);
    check(res, { 'list jobs 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200 ? 1 : 0);
  });

  sleep(Math.random() * 1.5 + 0.5);

  // List candidates
  group('Recruiter - List Candidates', () => {
    const res = http.get(`${baseUrl}/api/v1/candidates?limit=20`, {
      headers, tags: { name: 'list_candidates' },
    });
    requestCount.add(1);
    check(res, { 'list candidates 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200 ? 1 : 0);
  });

  sleep(Math.random() * 1 + 0.5);

  // Notifications
  group('Recruiter - Notifications', () => {
    const res = http.get(`${baseUrl}/api/v1/notifications`, {
      headers, tags: { name: 'notifications' },
    });
    requestCount.add(1);
    check(res, { 'notifications 200': (r) => r.status === 200 || r.status === 404 });
  });
}

export function teardown(data) {
  console.log('Load test completed.');
}
