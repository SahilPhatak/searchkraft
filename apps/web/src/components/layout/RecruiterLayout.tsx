import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Users, BarChart2, CheckSquare, Building2, Settings, LogOut, Bell, Search, Mail, Video } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import Avatar from '../ui/Avatar';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/talent', icon: Users, label: 'Talent' },
  { to: '/sourcing', icon: Search, label: 'AI Sourcing' },
  { to: '/outreach', icon: Mail, label: 'Outreach' },
  { to: '/interviews', icon: Video, label: 'Interviews' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/clients', icon: Building2, label: 'Clients' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lm" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C084FC"/>
          <stop offset="100%" stopColor="#7C3AED"/>
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#lm)"/>
      <polygon points="4,16 26,6 20,16 26,26" fill="white" opacity="0.25"/>
      <polygon points="4,16 26,6 15,18" fill="white"/>
      <polygon points="15,18 20,16 17,24" fill="white" opacity="0.75"/>
    </svg>
  );
}

export default function RecruiterLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col border-r border-gray-200 bg-white">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
          <LogoMark size={32} />
          <div className="flex flex-col leading-none">
            <span className="font-bold text-gray-900 tracking-tight" style={{ fontSize: 16 }}>
              Search<span className="gradient-text">Kraft</span>
            </span>
            <span className="text-gray-400 text-xs mt-0.5 tracking-wide font-medium">AI Recruiting</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-2.5 px-2 py-2 mb-1 rounded-xl hover:bg-gray-50 transition-colors">
            <Avatar name={user?.name || 'U'} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate">{user?.name}</div>
              <div className="text-xs text-gray-400 truncate">{user?.role}</div>
            </div>
            <button onClick={() => navigate('/notifications')} className="text-gray-400 hover:text-brand-600 transition-colors p-1">
              <Bell size={15} />
            </button>
          </div>
          <button onClick={handleLogout} className="sidebar-link w-full text-red-500 hover:text-red-600 hover:bg-red-50">
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto scrollbar-thin bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
