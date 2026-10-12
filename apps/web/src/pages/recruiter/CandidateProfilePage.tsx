import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Linkedin, Globe, Plus, Send } from 'lucide-react';
import api from '../../lib/api';
import { PageLoader } from '../../components/ui/Loading';
import Avatar from '../../components/ui/Avatar';
import { getStatusBadge, formatExperience, timeAgo } from '../../lib/utils';
import toast from 'react-hot-toast';

const TABS = ['Overview', 'Skills', 'Pipeline', 'Notes'];

export default function CandidateProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState('Overview');
  const [noteText, setNoteText] = useState('');
  const qc = useQueryClient();

  const { data: candidate, isLoading } = useQuery({
    queryKey: ['candidate', id],
    queryFn: () => api.get(`/candidates/${id}`).then(r => r.data.data),
  });

  const noteMutation = useMutation({
    mutationFn: () => api.post(`/candidates/${id}/notes`, { content: noteText }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['candidate', id] }); setNoteText(''); toast.success('Note added'); },
  });

  if (isLoading) return <PageLoader />;
  if (!candidate) return <div className="text-slate-400">Candidate not found</div>;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/talent" className="btn-ghost p-2"><ArrowLeft size={18} /></Link>
      </div>

      {/* Profile header */}
      <div className="card p-6">
        <div className="flex items-start gap-5">
          <Avatar name={candidate.name} src={candidate.avatarUrl} size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-white">{candidate.name}</h1>
              <span className={getStatusBadge(candidate.availabilityStatus)}>{candidate.availabilityStatus.replace(/_/g, ' ')}</span>
            </div>
            <div className="text-slate-300 mb-2">
              {candidate.currentTitle}{candidate.currentCompany && ` @ ${candidate.currentCompany}`}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
              {candidate.location && <span className="flex items-center gap-1"><MapPin size={13} />{candidate.location}</span>}
              {candidate.experienceYears && <span>{formatExperience(candidate.experienceYears)} exp</span>}
              {candidate.linkedinUrl && <a href={candidate.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-brand-400"><Linkedin size={13} />LinkedIn</a>}
              {candidate.portfolioUrl && <a href={candidate.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-brand-400"><Globe size={13} />Portfolio</a>}
            </div>
          </div>
        </div>
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

      {tab === 'Overview' && (
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-3">Summary</h3>
          <p className="text-slate-300 text-sm leading-relaxed">{candidate.summary || 'No summary available.'}</p>
        </div>
      )}

      {tab === 'Skills' && (
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-3">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {candidate.skills.map((s: string) => <span key={s} className="badge-blue px-3 py-1 text-sm">{s}</span>)}
          </div>
        </div>
      )}

      {tab === 'Pipeline' && (
        <div className="space-y-3">
          {candidate.applications?.length === 0 && <div className="text-slate-400 text-sm">Not in any pipeline yet.</div>}
          {candidate.applications?.map((app: { id: string; job: { title: string; status: string }; stage: { name: string } }) => (
            <div key={app.id} className="card p-4 flex items-center gap-3">
              <div className="flex-1">
                <div className="font-medium text-white">{app.job.title}</div>
                <div className="text-sm text-slate-400">{app.stage.name}</div>
              </div>
              <span className={getStatusBadge(app.job.status)}>{app.job.status}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'Notes' && (
        <div className="space-y-4">
          <div className="card p-4">
            <textarea
              className="input resize-none mb-3"
              rows={3}
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Add a note about this candidate…"
            />
            <button onClick={() => noteMutation.mutate()} disabled={!noteText || noteMutation.isPending} className="btn-primary btn-sm gap-1">
              <Send size={13} /> Add note
            </button>
          </div>
          {candidate.notes?.map((note: { id: string; content: string; createdAt: string }) => (
            <div key={note.id} className="card p-4">
              <p className="text-slate-200 text-sm leading-relaxed">{note.content}</p>
              <div className="text-xs text-slate-500 mt-2">{timeAgo(note.createdAt)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
