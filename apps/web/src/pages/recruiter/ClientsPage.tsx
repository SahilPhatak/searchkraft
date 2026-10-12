import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Plus, Globe } from 'lucide-react';
import api from '../../lib/api';
import { PageLoader } from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

export default function ClientsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', industry: '', website: '', contactName: '', contactEmail: '' });
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.get('/clients').then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: () => api.post('/clients', form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); setShowCreate(false); toast.success('Client added'); },
  });

  const clients = data?.data || [];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="page-subtitle">{data?.pagination?.total || 0} clients</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary"><Plus size={16} /> Add client</button>
      </div>

      {isLoading && <PageLoader />}
      {!isLoading && clients.length === 0 && (
        <EmptyState icon={Building2} title="No clients yet" description="Add your first client company to start managing their hiring." />
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((c: { id: string; name: string; industry?: string; website?: string; contactName?: string; _count?: { jobs: number } }) => (
          <div key={c.id} className="card-hover p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-navy-700 rounded-xl flex items-center justify-center text-lg font-bold text-slate-300">
                {c.name[0]}
              </div>
              <div>
                <div className="font-semibold text-white">{c.name}</div>
                {c.industry && <div className="text-xs text-slate-400">{c.industry}</div>}
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              {c.website && <a href={c.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-brand-400 hover:text-brand-300"><Globe size={13} />Website</a>}
              <span className="text-slate-500 ml-auto">{c._count?.jobs || 0} jobs</span>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add client">
        <div className="space-y-4">
          {[['name', 'Company name *', 'Acme Corp'], ['industry', 'Industry', 'Technology'], ['website', 'Website', 'https://acme.com'], ['contactName', 'Contact name', 'John Smith'], ['contactEmail', 'Contact email', 'john@acme.com']].map(([key, label, placeholder]) => (
            <div key={key} className="form-group">
              <label className="label">{label}</label>
              <input className="input" value={form[key as keyof typeof form]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} />
            </div>
          ))}
          <div className="flex gap-3">
            <button onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={() => createMutation.mutate()} disabled={!form.name || createMutation.isPending} className="btn-primary flex-1">Add client</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
