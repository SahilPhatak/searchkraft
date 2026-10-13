import type { ReactNode } from 'react';
import { type LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-dark-700 rounded-2xl flex items-center justify-center mb-4">
        <Icon size={28} className="text-dark-500" />
      </div>
      <h3 className="text-lg font-semibold text-dark-200 mb-1">{title}</h3>
      {description && <p className="text-sm text-dark-400 max-w-xs mb-5">{description}</p>}
      {action}
    </div>
  );
}
