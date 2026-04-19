import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 ${
    isActive 
      ? 'bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)]' 
      : 'text-mist/70 hover:bg-white/5 hover:text-white hover:scale-105'
  }`;

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink-900/70 backdrop-blur-xl transition-all duration-300">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="font-display text-lg font-semibold tracking-tight text-white">
          Stress<span className="text-accent">Scape</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1">
          <NavLink to="/" end className={linkClass}>
            Map
          </NavLink>
          <NavLink to="/analytics" className={linkClass}>
            Analytics
          </NavLink>
          {!user && (
            <>
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>
              <NavLink to="/register" className={linkClass}>
                Sign up
              </NavLink>
            </>
          )}
          {user && (
            <>
              <span className="hidden rounded-lg bg-white/5 px-3 py-2 text-xs text-mist/80 sm:inline">
                {user.name}
                {isAdmin && (
                  <span className="ml-2 rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-accent">
                    Admin
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg px-3 py-2 text-sm font-medium text-mist/80 transition-all duration-300 hover:bg-white/5 hover:text-white hover:scale-105 hover:shadow-[0_0_10px_rgba(255,255,255,0.05)]"
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
