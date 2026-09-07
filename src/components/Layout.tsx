import { Link, Outlet, useLocation } from 'react-router-dom';
import { Calendar, BarChart2, LayoutTemplate, Database, History, LogOut } from 'lucide-react';
import { auth } from '../lib/firebase';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const navItems = [
  { path: '/', label: 'Tydzień', icon: Calendar },
  { path: '/history', label: 'Historia', icon: History },
  { path: '/stats', label: 'Statystyki', icon: BarChart2 },
  { path: '/template', label: 'Szablon', icon: LayoutTemplate },
  { path: '/data', label: 'Dane', icon: Database },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-zinc-950 text-zinc-200">
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col w-64 border-r border-zinc-800 bg-zinc-950 p-4">
        <div className="mb-8 px-4 mt-4">
          <h1 className="text-2xl font-bold text-emerald-400">Maturnik</h1>
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
                      ? 'bg-emerald-500/10 text-emerald-400' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  )
                )}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
          
          <div className="pt-4 mt-4 border-t border-zinc-800/50">
            <button
              onClick={() => auth.signOut()}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors w-full text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
            >
              <LogOut size={20} />
              <span className="font-medium">Wyloguj</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-zinc-950 pb-safe z-50">
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
                    'flex flex-col items-center justify-center p-2 rounded-xl min-w-[56px]',
                    isActive 
                      ? 'text-emerald-400' 
                      : 'text-zinc-400'
                  )
                )}
              >
                <Icon size={22} className={isActive ? 'mb-1' : 'mb-1 opacity-70'} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => auth.signOut()}
            className="flex flex-col items-center justify-center p-2 rounded-xl min-w-[56px] text-red-400 opacity-80"
          >
            <LogOut size={22} className="mb-1" />
            <span className="text-[10px] font-medium">Wyloguj</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
