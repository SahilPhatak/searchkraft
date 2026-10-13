import { getInitials } from '../../lib/utils';

// Purple-toned palette that works on white backgrounds
const COLORS = [
  { bg: 'bg-brand-100', text: 'text-brand-700' },
  { bg: 'bg-purple-100', text: 'text-purple-700' },
  { bg: 'bg-violet-100', text: 'text-violet-700' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  { bg: 'bg-amber-100', text: 'text-amber-700' },
  { bg: 'bg-rose-100', text: 'text-rose-700' },
  { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700' },
];

function colorForName(name: string) {
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) % COLORS.length;
  return COLORS[hash];
}

interface Props {
  name: string;
  src?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg' };

export default function Avatar({ name, src, size = 'md', className = '' }: Props) {
  const sz = sizes[size];
  const { bg, text } = colorForName(name);
  if (src) return <img src={src} alt={name} className={`${sz} rounded-full object-cover ${className}`} />;
  return (
    <div className={`${sz} ${bg} ${text} rounded-full flex items-center justify-center font-semibold flex-shrink-0 ${className}`}>
      {getInitials(name)}
    </div>
  );
}
