import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const linkClass = ({ isActive }) =>
    `relative rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 ${
      isActive
        ? 'text-indigo-700 bg-indigo-50/50 dark:text-indigo-300 dark:bg-indigo-500/10'
        : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100/50 dark:text-slate-300 dark:hover:text-indigo-400 dark:hover:bg-slate-800/50'
    }`;

  return (
    <header className={`sticky top-0 z-50 border-b border-slate-200/60 dark:border-slate-800/60 backdrop-blur-2xl transition-all duration-300 ${theme === 'dark' ? 'bg-slate-900/85' : 'bg-white/85'}`}>
      {/* Top accent bar */}
      <div className="h-[3px] w-full" style={{ background: 'linear-gradient(90deg, #4f46e5, #0d9488, #4f46e5)', backgroundSize: '200% 100%', animation: 'gradientShift 4s ease infinite' }} />

      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-teal-500 transition-all duration-300 shadow-sm group-hover:shadow-glow-violet">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 transition-colors">
            Stress<span className="text-indigo-600 dark:text-indigo-400">Scape</span>
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-1">
          <button
            onClick={toggleTheme}
            className="mr-2 p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          <NavLink to="/" end className={linkClass}>
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute inset-0 rounded-lg bg-indigo-50/80 border border-indigo-100 dark:bg-indigo-500/10 dark:border-indigo-500/20" />
                )}
                <span className="relative flex items-center gap-1.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                  </svg>
                  Map
                </span>
              </>
            )}
          </NavLink>

          <NavLink to="/analytics" className={linkClass}>
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute inset-0 rounded-lg bg-indigo-50/80 border border-indigo-100 dark:bg-indigo-500/10 dark:border-indigo-500/20" />
                )}
                <span className="relative flex items-center gap-1.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                  </svg>
                  Analytics
                </span>
              </>
            )}
          </NavLink>

          {!user && (
            <>
              <NavLink to="/login" className={linkClass}>
                {({ isActive }) => (
                  <span className="relative">Login</span>
                )}
              </NavLink>
              <NavLink
                to="/register"
                className="ml-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:shadow-glow-violet hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0"
              >
                Sign up
              </NavLink>
            </>
          )}

          {user && (
            <>
              <span className="hidden rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 sm:inline shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-colors">
                {user.name}
                {isAdmin && (
                  <span className="ml-2 rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 border border-indigo-100 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30">
                    Admin
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-all duration-300 hover:bg-red-50 hover:text-red-600 hover:border-red-100 border border-transparent dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
              >
                Log out
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
