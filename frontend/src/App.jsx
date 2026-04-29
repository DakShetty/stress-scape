import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import MapDashboard from './pages/MapDashboard.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Analytics from './pages/Analytics.jsx';

export default function App() {
  return (
    <div className="min-h-screen bg-ink-950 relative overflow-x-hidden">
      {/* Ambient background orbs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
        <div className="absolute top-1/3 -right-40 h-80 w-80 rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }} />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 0h1v40H0zm39 0h1v40h-1zM0 0v1h40V0zm0 39v1h40v-1z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
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
        <footer className="border-t border-white/5 py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-accent/30" />
            <span className="font-display text-sm font-bold text-white/40">
              Stress<span className="text-accent-glow">Scape</span>
            </span>
            <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-accent/30" />
          </div>
          <p className="text-xs text-mist/20">Urban Environmental Intelligence · Maharashtra, India · © 2026</p>
        </footer>
      </div>
    </div>
  );
}
