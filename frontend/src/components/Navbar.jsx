import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  const linkClass = ({ isActive }) =>
    `relative rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 ${
      isActive
        ? 'text-white'
        : 'text-mist/50 hover:text-mist/90 hover:bg-white/5'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-2xl transition-all duration-300"
      style={{ background: 'rgba(7, 9, 15, 0.85)' }}>
      {/* Top accent bar */}
      <div className="h-[2px] w-full" style={{ background: 'linear-gradient(90deg, #7c3aed, #06b6d4, #7c3aed)', backgroundSize: '200% 100%', animation: 'gradientShift 4s ease infinite' }} />

      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-cyan transition-all duration-300 group-hover:shadow-glow-violet">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-white">
            Stress<span className="bg-gradient-to-r from-accent-glow to-cyan-glow bg-clip-text text-transparent">Scape</span>
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-1">
          <NavLink to="/" end className={linkClass}>
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-accent/20 to-cyan/10 border border-accent/30" />
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
                  <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-accent/20 to-cyan/10 border border-accent/30" />
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
                className="ml-1 rounded-lg bg-gradient-to-r from-accent to-accent-dim px-4 py-2 text-sm font-semibold text-white shadow-glow-violet transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95"
              >
                Sign up
              </NavLink>
            </>
          )}

          {user && (
            <>
              <span className="hidden rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-mist/70 sm:inline">
                {user.name}
                {isAdmin && (
                  <span className="ml-2 rounded bg-gradient-to-r from-accent/30 to-cyan/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-glow border border-accent/20">
                    Admin
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg px-3 py-2 text-sm font-medium text-mist/50 transition-all duration-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 border border-transparent"
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
