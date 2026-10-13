import { useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, Users, MapPin, Zap } from 'lucide-react';
import api from '../../lib/api';
import { PageLoader } from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import Avatar from '../../components/ui/Avatar';
import { getStatusBadge, formatExperience } from '../../lib/utils';

export default function TalentPage() {
  const [nlpQuery, setNlpQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [parsedFilters, setParsedFilters] = useState<Record<string, unknown>>({});
  const [parsing, setParsing] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['talent', submitted],
    queryFn: async () => {
      if (!submitted) return api.get('/candidates', { params: { limit: 50 } }).then(r => r.data.data);
      const res = await api.post('/search/nlp', { query: submitted });
      setParsedFilters(res.data.data.parsedFilters || {});
      return res.data.data.candidates;
    },
    enabled: true,
  });

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!nlpQuery.trim()) return;
    setParsing(true);
    setSubmitted(nlpQuery);
    setParsing(false);
  };

  const candidates = Array.isArray(data) ? data : (data || []);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Talent Pool</h1>
          <p className="page-subtitle">Search and manage your candidate database</p>
        </div>
      </div>

      {/* NLP Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            className="input pl-9"
            value={nlpQuery}
            onChange={e => setNlpQuery(e.target.value)}
            placeholder='Try: "Senior React developer in Bangalore open to remote"'
          />
        </div>
        <button type="submit" disabled={parsing} className="btn-primary gap-1">
          <Zap size={15} /> {parsing ? 'Searching…' : 'Search'}
        </button>
      </form>

      {/* Parsed filters hint */}
      {Object.keys(parsedFilters).length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-400">AI parsed:</span>
          {Object.entries(parsedFilters).map(([k, v]) => v && (
            <span key={k} className="badge-blue">{k}: {String(v)}</span>
          ))}
        </div>
      )}

      {isLoading && <PageLoader />}
      {!isLoading && candidates.length === 0 && (
        <EmptyState icon={Users} title="No candidates found" description="Try a different search or add candidates manually." />
      )}

      <div className="grid gap-3">
        {candidates.map((c: { id: string; name: string; currentTitle?: string; currentCompany?: string; location?: string; skills: string[]; experienceYears?: number; availabilityStatus: string; avatarUrl?: string }) => (
          <Link key={c.id} to={`/candidates/${c.id}`} className="card-hover p-4 block">
            <div className="flex items-start gap-4">
              <Avatar name={c.name} src={c.avatarUrl} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-gray-900">{c.name}</span>
                  <span className={getStatusBadge(c.availabilityStatus)}>{c.availabilityStatus.replace(/_/g, ' ')}</span>
                </div>
                <div className="text-sm text-gray-400">
                  {c.currentTitle}{c.currentCompany && ` @ ${c.currentCompany}`}
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                  {c.location && <span className="flex items-center gap-1"><MapPin size={12} />{c.location}</span>}
                  {c.experienceYears && <span>{formatExperience(c.experienceYears)}</span>}
                </div>
              </div>
            </div>
            {c.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3 ml-14">
                {c.skills.slice(0, 6).map(s => <span key={s} className="badge-gray">{s}</span>)}
                {c.skills.length > 6 && <span className="badge-gray">+{c.skills.length - 6}</span>}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
