import { Link, Outlet, useLocation } from 'react-router-dom';
import { Calendar, BarChart2, LayoutTemplate, Database } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const navItems = [
  { path: '/', label: 'Tydzień', icon: Calendar },
  { path: '/stats', label: 'Statystyki', icon: BarChart2 },
  { path: '/template', label: 'Szablon', icon: LayoutTemplate },
  { path: '/data', label: 'Dane', icon: Database },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-950 text-slate-200">
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-slate-950 p-4">
        <div className="mb-8 px-4 mt-4">
          <h1 className="text-2xl font-bold text-indigo-400">Maturnik</h1>
        </div>
        <div className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={twMerge(
                  clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                    isActive 
                      ? 'bg-indigo-500/10 text-indigo-400' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  )
                )}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-slate-800 bg-slate-950 pb-safe z-50">
        <div className="flex justify-around items-center p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={twMerge(
                  clsx(
                    'flex flex-col items-center justify-center p-2 rounded-xl min-w-[64px]',
                    isActive 
                      ? 'text-indigo-400' 
                      : 'text-slate-400'
                  )
                )}
              >
                <Icon size={24} className={isActive ? 'mb-1' : 'mb-1 opacity-70'} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
