export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatSalary(min?: number | null, max?: number | null, currency = 'USD') {
  if (!min && !max) return 'Salary not specified';
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 0 }).format(n);
  if (min && max) return `${currency} ${fmt(min)} – ${fmt(max)}`;
  if (min) return `${currency} ${fmt(min)}+`;
  return `Up to ${currency} ${fmt(max!)}`;
}

export function formatExperience(years?: number | null) {
  if (!years) return 'No experience specified';
  if (years === 1) return '1 year';
  return `${years} years`;
}

export function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function getScoreColor(score: number) {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-amber-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-red-400';
}

export function getStatusBadge(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: 'badge-green',
    DRAFT: 'badge-gray',
    PAUSED: 'badge-yellow',
    CLOSED: 'badge-red',
    ARCHIVED: 'badge-gray',
    ACTIVELY_LOOKING: 'badge-green',
    OPEN: 'badge-blue',
    NOT_LOOKING: 'badge-gray',
    EMPLOYED: 'badge-purple',
  };
  return map[status] || 'badge-gray';
}

export function timeAgo(date: string | Date) {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}
