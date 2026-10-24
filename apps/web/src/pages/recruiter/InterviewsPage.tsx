import { useState } from 'react';
import { Video, Plus, Play, CheckCircle2, Clock, AlertTriangle, XCircle, Users, Brain, BarChart2, ChevronRight, Code, MessageSquare } from 'lucide-react';

interface Interview {
  id: string;
  candidateName: string;
  jobTitle: string;
  type: 'SCREENING' | 'TECHNICAL' | 'BEHAVIORAL' | 'LIVE_CODING';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  scheduledAt: string;
  overallScore: number | null;
  recommendation: string | null;
  duration: number | null;
}

const mockInterviews: Interview[] = [
  { id: '1', candidateName: 'Priya Sharma', jobTitle: 'Senior React Developer', type: 'TECHNICAL', status: 'COMPLETED', scheduledAt: '2024-03-15T10:00:00Z', overallScore: 85, recommendation: 'STRONG_HIRE', duration: 45 },
  { id: '2', candidateName: 'Rahul Patel', jobTitle: 'Data Scientist', type: 'LIVE_CODING', status: 'COMPLETED', scheduledAt: '2024-03-15T11:00:00Z', overallScore: 72, recommendation: 'HIRE', duration: 60 },
  { id: '3', candidateName: 'Ananya Gupta', jobTitle: 'Product Manager', type: 'BEHAVIORAL', status: 'SCHEDULED', scheduledAt: '2024-03-16T09:00:00Z', overallScore: null, recommendation: null, duration: null },
  { id: '4', candidateName: 'Vikram Singh', jobTitle: 'Senior React Developer', type: 'SCREENING', status: 'IN_PROGRESS', scheduledAt: '2024-03-15T14:00:00Z', overallScore: null, recommendation: null, duration: null },
  { id: '5', candidateName: 'Meera Joshi', jobTitle: 'DevOps Engineer', type: 'TECHNICAL', status: 'NO_SHOW', scheduledAt: '2024-03-14T15:00:00Z', overallScore: null, recommendation: 'NO_SHOW', duration: null },
];

const typeConfig = {
  SCREENING: { icon: MessageSquare, color: 'text-blue-600 bg-blue-50', label: 'Screening' },
  TECHNICAL: { icon: Code, color: 'text-purple-600 bg-purple-50', label: 'Technical' },
  BEHAVIORAL: { icon: Users, color: 'text-green-600 bg-green-50', label: 'Behavioral' },
  LIVE_CODING: { icon: Code, color: 'text-orange-600 bg-orange-50', label: 'Live Coding' },
};

const statusConfig = {
  SCHEDULED: { icon: Clock, color: 'text-blue-600 bg-blue-50', label: 'Scheduled' },
  IN_PROGRESS: { icon: Play, color: 'text-green-600 bg-green-50', label: 'In Progress' },
  COMPLETED: { icon: CheckCircle2, color: 'text-brand-600 bg-brand-50', label: 'Completed' },
  CANCELLED: { icon: XCircle, color: 'text-gray-600 bg-gray-100', label: 'Cancelled' },
  NO_SHOW: { icon: AlertTriangle, color: 'text-red-600 bg-red-50', label: 'No Show' },
};

const recColors: Record<string, string> = {
  STRONG_HIRE: 'text-green-700 bg-green-50 border-green-200',
  HIRE: 'text-green-600 bg-green-50 border-green-100',
  NO_HIRE: 'text-red-600 bg-red-50 border-red-200',
  NO_SHOW: 'text-gray-500 bg-gray-50 border-gray-200',
};

export default function InterviewsPage() {
  const [filter, setFilter] = useState('All');

  const completed = mockInterviews.filter(i => i.status === 'COMPLETED');
  const avgScore = completed.length ? Math.round(completed.reduce((s, i) => s + (i.overallScore || 0), 0) / completed.length) : 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Interviews</h1>
          <p className="text-gray-500 mt-1">AI-powered first-round screening with structured assessments and cheating detection.</p>
        </div>
        <button className="btn-primary">
          <Plus size={16} /> Schedule Interview
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Interviews', value: mockInterviews.length.toString(), icon: Video, color: 'text-brand-600 bg-brand-50' },
          { label: 'Completed', value: completed.length.toString(), icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
          { label: 'Avg Score', value: `${avgScore}/100`, icon: BarChart2, color: 'text-blue-600 bg-blue-50' },
          { label: 'Scheduled', value: mockInterviews.filter(i => i.status === 'SCHEDULED').length.toString(), icon: Clock, color: 'text-orange-600 bg-orange-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">{s.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon size={16} />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Interview Types Quick Stats */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Interview Types</h3>
        <div className="grid grid-cols-4 gap-4">
          {(['SCREENING', 'TECHNICAL', 'BEHAVIORAL', 'LIVE_CODING'] as const).map(type => {
            const tc = typeConfig[type];
            const count = mockInterviews.filter(i => i.type === type).length;
            return (
              <div key={type} className={`rounded-xl p-4 border border-gray-100 ${tc.color.split(' ')[1]}`}>
                <div className="flex items-center gap-2 mb-2">
                  <tc.icon size={16} className={tc.color.split(' ')[0]} />
                  <span className="text-sm font-medium text-gray-700">{tc.label}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{count}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interview List */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">All Interviews</h3>
          <div className="flex gap-2">
            {['All', 'Scheduled', 'In Progress', 'Completed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-full transition-colors ${filter === f ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-600 hover:bg-brand-50 hover:text-brand-600'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {mockInterviews.map(interview => {
            const sc = statusConfig[interview.status];
            const tc = typeConfig[interview.type];
            return (
              <div key={interview.id} className="px-6 py-5 hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tc.color}`}>
                  <tc.icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{interview.candidateName}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc.color}`}>
                      {sc.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>{interview.jobTitle}</span>
                    <span>·</span>
                    <span>{tc.label}</span>
                    <span>·</span>
                    <span>{new Date(interview.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  {interview.overallScore !== null && (
                    <div className="text-center">
                      <div className={`text-lg font-bold ${interview.overallScore >= 80 ? 'text-green-600' : interview.overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {interview.overallScore}
                      </div>
                      <div className="text-xs text-gray-400">Score</div>
                    </div>
                  )}
                  {interview.duration && (
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-700">{interview.duration}m</div>
                      <div className="text-xs text-gray-400">Duration</div>
                    </div>
                  )}
                  {interview.recommendation && interview.recommendation !== 'NO_SHOW' && (
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${recColors[interview.recommendation] || 'text-gray-500 bg-gray-50'}`}>
                      {interview.recommendation.replace('_', ' ')}
                    </span>
                  )}
                  <ChevronRight size={16} className="text-gray-300" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
