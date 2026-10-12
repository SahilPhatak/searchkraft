import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Kanban, MapPin, Users, Edit2, Play, Pause } from 'lucide-react';
import api from '../../lib/api';
import { PageLoader } from '../../components/ui/Loading';
import { formatSalary, getStatusBadge } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => api.get(`/jobs/${id}`).then(r => r.data.data),
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => api.patch(`/jobs/${id}`, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['job', id] }); toast.success('Status updated'); },
  });

  if (isLoading) return <PageLoader />;
  if (!job) return <div className="text-slate-400">Job not found</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/jobs" className="btn-ghost p-2"><ArrowLeft size={18} /></Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="page-title">{job.title}</h1>
            <span className={getStatusBadge(job.status)}>{job.status}</span>
          </div>
          {job.client && <p className="page-subtitle">{job.client.name}</p>}
        </div>
        <div className="flex gap-2">
          {job.status === 'DRAFT' && (
            <button onClick={() => statusMutation.mutate('ACTIVE')} className="btn-primary"><Play size={15} /> Publish</button>
          )}
          {job.status === 'ACTIVE' && (
            <button onClick={() => statusMutation.mutate('PAUSED')} className="btn-secondary"><Pause size={15} /> Pause</button>
          )}
          <Link to={`/jobs/${id}/pipeline`} className="btn-primary"><Kanban size={15} /> Pipeline</Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5">
            <h2 className="font-semibold text-white mb-3">Description</h2>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{job.description}</p>
          </div>
          {job.requirements && (
            <div className="card p-5">
              <h2 className="font-semibold text-white mb-3">Requirements</h2>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{job.requirements}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="card p-5 space-y-3">
            <h2 className="font-semibold text-white mb-1">Details</h2>
            <div className="text-sm space-y-2">
              {[
                ['Location', job.location, MapPin],
                ['Work mode', job.workMode],
                ['Experience', job.experienceLevel],
                ['Salary', formatSalary(job.salaryMin, job.salaryMax, job.currency)],
                ['Headcount', job.headcount],
              ].map(([lbl, val, Icon]) => val && (
                <div key={lbl as string} className="flex items-start justify-between gap-2">
                  <span className="text-slate-500">{lbl}</span>
                  <span className="text-slate-200 text-right">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {job.skills?.length > 0 && (
            <div className="card p-5">
              <h2 className="font-semibold text-white mb-3">Skills</h2>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((s: string) => <span key={s} className="badge-blue">{s}</span>)}
              </div>
            </div>
          )}

          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Users size={16} className="text-slate-400" />
              <h2 className="font-semibold text-white">{job.applicationCount} Applications</h2>
            </div>
            <Link to={`/jobs/${id}/pipeline`} className="btn-secondary w-full justify-center text-sm">View pipeline →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
