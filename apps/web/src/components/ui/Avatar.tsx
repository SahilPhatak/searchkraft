import { getInitials } from '../../lib/utils';

const COLORS = [
  'bg-brand-700', 'bg-purple-700', 'bg-emerald-700', 'bg-amber-700',
  'bg-red-700', 'bg-cyan-700', 'bg-pink-700', 'bg-violet-700',
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
  if (src) return <img src={src} alt={name} className={`${sz} rounded-full object-cover ${className}`} />;
  return (
    <div className={`${sz} ${colorForName(name)} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 ${className}`}>
      {getInitials(name)}
    </div>
  );
}
