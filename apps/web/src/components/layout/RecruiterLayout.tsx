import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Users, BarChart2, CheckSquare, Building2, Settings, Zap, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import Avatar from '../ui/Avatar';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/talent', icon: Users, label: 'Talent' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/clients', icon: Building2, label: 'Clients' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function RecruiterLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen overflow-hidden bg-navy-900">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col bg-navy-800 border-r border-navy-700">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-navy-700">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">SearchKraft</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-navy-700">
          <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
            <Avatar name={user?.name || 'U'} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-200 truncate">{user?.name}</div>
              <div className="text-xs text-slate-500 truncate">{user?.role}</div>
            </div>
            <button onClick={() => navigate('/notifications')} className="btn-ghost p-1">
              <Bell size={16} />
            </button>
          </div>
          <button onClick={handleLogout} className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
