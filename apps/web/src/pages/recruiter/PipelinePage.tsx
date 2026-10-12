import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import api from '../../lib/api';
import { PageLoader } from '../../components/ui/Loading';
import Avatar from '../../components/ui/Avatar';
import toast from 'react-hot-toast';

interface AppCard {
  id: string;
  candidate: { id: string; name: string; currentTitle?: string; currentCompany?: string; skills: string[]; avatarUrl?: string };
  aiScore?: number;
  appliedAt: string;
}

interface Stage {
  id: string;
  name: string;
  color?: string;
  applications: AppCard[];
}

function CandidateCard({ app, onDragStart }: { app: AppCard; onDragStart: () => void }) {
  return (
    <Link
      to={`/candidates/${app.candidate.id}`}
      draggable
      onDragStart={onDragStart}
      className="block card p-3 mb-2 hover:border-brand-500/50 cursor-grab active:cursor-grabbing animate-slide-up"
      onClick={e => { /* allow drag without nav */ }}
    >
      <div className="flex items-start gap-2">
        <Avatar name={app.candidate.name} src={app.candidate.avatarUrl} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white truncate">{app.candidate.name}</div>
          <div className="text-xs text-slate-400 truncate">{app.candidate.currentTitle}</div>
          {app.candidate.currentCompany && <div className="text-xs text-slate-500 truncate">{app.candidate.currentCompany}</div>}
        </div>
        {app.aiScore && (
          <div className={`text-xs font-bold px-1.5 py-0.5 rounded ${app.aiScore >= 80 ? 'bg-emerald-500/20 text-emerald-400' : app.aiScore >= 60 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
            {app.aiScore}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function PipelinePage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [dragging, setDragging] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['pipeline', id],
    queryFn: () => api.get(`/pipeline/${id}`).then(r => r.data.data),
  });

  const moveMutation = useMutation({
    mutationFn: ({ appId, stageId }: { appId: string; stageId: string }) =>
      api.patch(`/pipeline/applications/${appId}/move`, { stageId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pipeline', id] }); },
    onError: () => toast.error('Failed to move candidate'),
  });

  const onDrop = (stageId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    if (dragging) moveMutation.mutate({ appId: dragging, stageId });
    setDragging(null);
  };

  if (isLoading) return <PageLoader />;
  if (!data) return null;

  const stages: Stage[] = data.stages || [];
  const job = data.job;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Link to={`/jobs/${id}`} className="btn-ghost p-2"><ArrowLeft size={18} /></Link>
        <div>
          <h1 className="page-title">{job.title}</h1>
          <p className="page-subtitle">Kanban pipeline · {stages.reduce((n: number, s: Stage) => n + s.applications.length, 0)} candidates</p>
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {stages.map((stage: Stage) => (
          <div
            key={stage.id}
            className="flex-shrink-0 w-64 flex flex-col"
            onDragOver={e => e.preventDefault()}
            onDrop={onDrop(stage.id)}
          >
            {/* Stage header */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full" style={{ background: stage.color || '#6B7280' }} />
              <span className="text-sm font-semibold text-slate-200">{stage.name}</span>
              <span className="ml-auto text-xs text-slate-500 bg-navy-700 px-1.5 py-0.5 rounded-full">
                {stage.applications.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex-1 min-h-20 bg-navy-800/50 rounded-xl p-2 border border-navy-700 border-dashed">
              {stage.applications.map(app => (
                <CandidateCard key={app.id} app={app} onDragStart={() => setDragging(app.id)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
