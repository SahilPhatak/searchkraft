import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Briefcase, MapPin, Users, Zap } from 'lucide-react';
import api from '../../lib/api';
import { PageLoader } from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { formatSalary, getStatusBadge } from '../../lib/utils';
import toast from 'react-hot-toast';

const TABS = ['ALL', 'ACTIVE', 'DRAFT', 'PAUSED', 'CLOSED'];

function CreateJobForm({ onSuccess }: { onSuccess: () => void }) {
  const qc = useQueryClient();
  const [jdText, setJdText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', location: '', workMode: 'HYBRID', experienceLevel: 'MID', skills: '' });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const parseJD = async () => {
    if (!jdText.trim()) return;
    setParsing(true);
    try {
      const { data } = await api.post('/ai/parse-jd', { text: jdText });
      const p = data.data;
      setForm(f => ({
        ...f,
        title: p.title || f.title,
        description: jdText,
        location: p.location || f.location,
        skills: (p.skills || []).join(', '),
        experienceLevel: p.experienceYears > 8 ? 'SENIOR' : p.experienceYears > 4 ? 'MID' : 'ENTRY',
      }));
      toast.success('JD parsed!');
    } catch { toast.error('Parse failed'); }
    finally { setParsing(false); }
  };

  const mutation = useMutation({
    mutationFn: () => api.post('/jobs', { ...form, skills: form.skills.split(',').map(s => s.trim()).filter(Boolean) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['jobs'] }); toast.success('Job created'); onSuccess(); },
    onError: () => toast.error('Failed to create job'),
  });

  return (
    <div className="space-y-4">
      <div className="form-group">
        <label className="label">Paste job description (optional AI parse)</label>
        <textarea className="input h-24 resize-none" value={jdText} onChange={e => setJdText(e.target.value)} placeholder="Paste job description to auto-fill…" />
        <button type="button" onClick={parseJD} disabled={parsing || !jdText} className="btn-secondary btn-sm mt-2 gap-1">
          <Zap size={14} /> {parsing ? 'Parsing…' : 'Parse with AI'}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="form-group col-span-2">
          <label className="label">Job title *</label>
          <input className="input" value={form.title} onChange={set('title')} required placeholder="Senior Frontend Engineer" />
        </div>
        <div className="form-group">
          <label className="label">Location</label>
          <input className="input" value={form.location} onChange={set('location')} placeholder="Mumbai / Remote" />
        </div>
        <div className="form-group">
          <label className="label">Work mode</label>
          <select className="input" value={form.workMode} onChange={set('workMode')}>
            {['REMOTE', 'ONSITE', 'HYBRID'].map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div className="form-group col-span-2">
          <label className="label">Description *</label>
          <textarea className="input h-24 resize-none" value={form.description} onChange={set('description') as React.ChangeEventHandler<HTMLTextAreaElement>} placeholder="Role overview…" required />
        </div>
        <div className="form-group col-span-2">
          <label className="label">Skills (comma-separated)</label>
          <input className="input" value={form.skills} onChange={set('skills')} placeholder="React, TypeScript, Node.js" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={onSuccess} className="btn-secondary flex-1">Cancel</button>
        <button onClick={() => mutation.mutate()} disabled={!form.title || !form.description || mutation.isPending} className="btn-primary flex-1">
          {mutation.isPending ? 'Creating…' : 'Create job'}
        </button>
      </div>
    </div>
  );
}

export default function JobsPage() {
  const [tab, setTab] = useState('ALL');
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['jobs', tab],
    queryFn: () => api.get('/jobs', { params: { status: tab === 'ALL' ? undefined : tab, limit: 50 } }).then(r => r.data),
  });

  const jobs = data?.data || [];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Jobs</h1>
          <p className="page-subtitle">{data?.pagination?.total || 0} total positions</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary"><Plus size={16} /> New job</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-navy-800 p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            {t}
          </button>
        ))}
      </div>

      {isLoading && <PageLoader />}
      {!isLoading && jobs.length === 0 && (
        <EmptyState icon={Briefcase} title="No jobs yet" description="Create your first job posting to get started." action={<button onClick={() => setShowCreate(true)} className="btn-primary"><Plus size={16} /> Create job</button>} />
      )}

      <div className="grid gap-3">
        {jobs.map((job: { id: string; title: string; status: string; workMode: string; location?: string; applicationCount: number; skills: string[]; salaryMin?: number; salaryMax?: number; currency: string; client?: { name: string } }) => (
          <Link key={job.id} to={`/jobs/${job.id}`} className="card-hover p-5 block">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-white truncate">{job.title}</h3>
                  <span className={getStatusBadge(job.status)}>{job.status}</span>
                </div>
                {job.client && <div className="text-xs text-slate-500 mb-2">{job.client.name}</div>}
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  {job.location && <span className="flex items-center gap-1"><MapPin size={13} />{job.location}</span>}
                  <span className="flex items-center gap-1"><Users size={13} />{job.applicationCount} applicants</span>
                  <span className="badge-blue">{job.workMode}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-medium text-slate-300">{formatSalary(job.salaryMin, job.salaryMax, job.currency)}</div>
              </div>
            </div>
            {job.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {job.skills.slice(0, 5).map(s => <span key={s} className="badge-gray">{s}</span>)}
                {job.skills.length > 5 && <span className="badge-gray">+{job.skills.length - 5}</span>}
              </div>
            )}
          </Link>
        ))}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create new job" size="lg">
        <CreateJobForm onSuccess={() => setShowCreate(false)} />
      </Modal>
    </div>
  );
}
