import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckSquare, Plus, Circle, CheckCircle2 } from 'lucide-react';
import api from '../../lib/api';
import { PageLoader } from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

export default function TasksPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM', dueDate: '' });
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.get('/tasks').then(r => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: () => api.post('/tasks', { ...form, dueDate: form.dueDate || undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); setShowCreate(false); toast.success('Task created'); },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.patch(`/tasks/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const tasks = data || [];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">{tasks.filter((t: { status: string }) => t.status !== 'DONE').length} pending</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary"><Plus size={16} /> New task</button>
      </div>

      {isLoading && <PageLoader />}
      {!isLoading && tasks.length === 0 && (
        <EmptyState icon={CheckSquare} title="No tasks" description="Create a task to track your recruitment to-dos." />
      )}

      <div className="space-y-2">
        {tasks.map((task: { id: string; title: string; description?: string; status: string; priority: string; dueDate?: string }) => (
          <div key={task.id} className="card p-4 flex items-start gap-3">
            <button onClick={() => toggleMutation.mutate({ id: task.id, status: task.status === 'DONE' ? 'TODO' : 'DONE' })} className="mt-0.5 text-gray-400 hover:text-emerald-400 transition-colors">
              {task.status === 'DONE' ? <CheckCircle2 size={18} className="text-emerald-400" /> : <Circle size={18} />}
            </button>
            <div className="flex-1 min-w-0">
              <div className={`font-medium ${task.status === 'DONE' ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title}</div>
              {task.description && <div className="text-sm text-gray-400 mt-0.5">{task.description}</div>}
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`badge ${task.priority === 'HIGH' ? 'badge-red' : task.priority === 'URGENT' ? 'badge-red' : task.priority === 'MEDIUM' ? 'badge-yellow' : 'badge-gray'}`}>{task.priority}</span>
                {task.dueDate && <span className="text-xs text-gray-400">Due {new Date(task.dueDate).toLocaleDateString()}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New task">
        <div className="space-y-4">
          <div className="form-group">
            <label className="label">Title</label>
            <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Follow up with candidate" required />
          </div>
          <div className="form-group">
            <label className="label">Description</label>
            <textarea className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional details…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Due date</label>
              <input type="date" className="input" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={() => createMutation.mutate()} disabled={!form.title || createMutation.isPending} className="btn-primary flex-1">Create</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
