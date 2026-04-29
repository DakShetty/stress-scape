import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import MapDashboard from './pages/MapDashboard.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Analytics from './pages/Analytics.jsx';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 relative overflow-x-hidden text-slate-800 dark:text-slate-200 transition-colors duration-300">
      {/* Ambient background orbs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full opacity-30 dark:opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #e0e7ff, transparent)' }} />
        <div className="absolute top-1/3 -right-40 h-80 w-80 rounded-full opacity-30 dark:opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #ccfbf1, transparent)' }} />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full opacity-20 dark:opacity-5 blur-3xl" style={{ background: 'radial-gradient(circle, #e0e7ff, transparent)' }} />
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-10 dark:opacity-[0.03] bg-grid-pattern" />
      </div>

      <div className="relative z-10">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<MapDashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
        <footer className="border-t border-slate-200/60 dark:border-slate-800/60 py-8 text-center bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm mt-12 transition-colors duration-300">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-indigo-300 dark:to-indigo-500/50" />
            <span className="font-display text-sm font-bold text-slate-400 dark:text-slate-500">
              Stress<span className="text-indigo-600 dark:text-indigo-500">Scape</span>
            </span>
            <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-indigo-300 dark:to-indigo-500/50" />
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">Urban Environmental Intelligence · Maharashtra, India · © 2026</p>
        </footer>
      </div>
    </div>
  );
}
