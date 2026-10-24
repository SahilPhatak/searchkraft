import { useState } from 'react';
import { Search, Brain, Plus, Play, Pause, CheckCircle2, Clock, Users, Zap, Filter, ChevronRight } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  query: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  totalFound: number;
  totalReviewed: number;
  lastRunAt: string | null;
  createdAt: string;
}

const mockAgents: Agent[] = [
  { id: '1', name: 'Senior React Engineers — Mumbai', query: 'Senior React developer, 5+ years experience, Mumbai or Pune, open to hybrid', status: 'ACTIVE', totalFound: 142, totalReviewed: 38, lastRunAt: '2024-03-15T10:30:00Z', createdAt: '2024-03-10T09:00:00Z' },
  { id: '2', name: 'Data Scientists — Remote India', query: 'Data scientist with Python and ML experience, remote-friendly, India', status: 'ACTIVE', totalFound: 89, totalReviewed: 22, lastRunAt: '2024-03-15T08:00:00Z', createdAt: '2024-03-12T14:00:00Z' },
  { id: '3', name: 'VP Engineering — Bangalore', query: 'VP of Engineering or Engineering Director, 15+ years, Bangalore, startup experience', status: 'COMPLETED', totalFound: 24, totalReviewed: 24, lastRunAt: '2024-03-14T16:00:00Z', createdAt: '2024-03-08T11:00:00Z' },
];

const statusConfig = {
  ACTIVE: { color: 'text-green-600 bg-green-50', icon: Play, label: 'Active' },
  PAUSED: { color: 'text-yellow-600 bg-yellow-50', icon: Pause, label: 'Paused' },
  COMPLETED: { color: 'text-blue-600 bg-blue-50', icon: CheckCircle2, label: 'Completed' },
};

export default function SourcingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: '', query: '' });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Sourcing</h1>
          <p className="text-gray-500 mt-1">Create AI agents that continuously find and rank candidates for your roles.</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary">
          <Plus size={16} /> New Sourcing Agent
        </button>
      </div>

      {/* AI Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <Brain className="text-brand-500" size={20} />
          <h3 className="font-semibold text-gray-900">Quick AI Search</h3>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-3 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Describe who you're looking for... e.g., 'senior backend engineer with Go experience in Bangalore'"
              className="input pl-11 w-full"
            />
          </div>
          <button className="btn-primary px-6">
            <Zap size={16} /> Search
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          {['React', 'Python', 'DevOps', 'Product Manager', 'Data Engineer'].map(tag => (
            <button key={tag} className="text-xs bg-gray-100 hover:bg-brand-50 hover:text-brand-600 text-gray-600 px-3 py-1.5 rounded-full transition-colors">
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Create Agent Form */}
      {showCreate && (
        <div className="bg-white rounded-2xl border-2 border-brand-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Create Sourcing Agent</h3>
          <div className="space-y-4">
            <div>
              <label className="label">Agent name</label>
              <input
                className="input w-full"
                value={newAgent.name}
                onChange={(e) => setNewAgent(a => ({ ...a, name: e.target.value }))}
                placeholder="e.g., Senior React Engineers — Mumbai"
              />
            </div>
            <div>
              <label className="label">Search description</label>
              <textarea
                className="input w-full min-h-[100px]"
                value={newAgent.query}
                onChange={(e) => setNewAgent(a => ({ ...a, query: e.target.value }))}
                placeholder="Describe the ideal candidate in natural language. Our AI will continuously search and rank matches.&#10;&#10;e.g., Looking for senior React developers with 5+ years experience, familiar with TypeScript and Next.js, based in Mumbai or Pune, open to hybrid work..."
              />
            </div>
            <div className="flex gap-3">
              <button className="btn-primary">
                <Play size={14} /> Launch Agent
              </button>
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Active Agents', value: '2', icon: Brain, color: 'text-brand-600 bg-brand-50' },
          { label: 'Candidates Found', value: '255', icon: Users, color: 'text-green-600 bg-green-50' },
          { label: 'Reviewed', value: '84', icon: CheckCircle2, color: 'text-blue-600 bg-blue-50' },
          { label: 'Avg Match Score', value: '78%', icon: Zap, color: 'text-orange-600 bg-orange-50' },
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

      {/* Agent List */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Sourcing Agents</h3>
          <div className="flex gap-2">
            {['All', 'Active', 'Paused', 'Completed'].map(f => (
              <button key={f} className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-brand-50 hover:text-brand-600 transition-colors">
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {mockAgents.map(agent => {
            const sc = statusConfig[agent.status];
            return (
              <div key={agent.id} className="px-6 py-5 hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sc.color}`}>
                  <Brain size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 truncate">{agent.name}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc.color}`}>
                      {sc.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{agent.query}</p>
                </div>
                <div className="flex items-center gap-6 flex-shrink-0">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{agent.totalFound}</div>
                    <div className="text-xs text-gray-400">Found</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{agent.totalReviewed}</div>
                    <div className="text-xs text-gray-400">Reviewed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold gradient-text">{Math.round((agent.totalReviewed / agent.totalFound) * 100)}%</div>
                    <div className="text-xs text-gray-400">Progress</div>
                  </div>
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
