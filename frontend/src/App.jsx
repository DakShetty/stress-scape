import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import MapDashboard from './pages/MapDashboard.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Analytics from './pages/Analytics.jsx';

export default function App() {
  return (
    <div className="min-h-screen bg-ink-950 bg-[radial-gradient(ellipse_at_top,_rgba(13,148,136,0.12),_transparent_50%)]">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<MapDashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
      <footer className="border-t border-white/5 py-6 text-center text-xs text-mist/40">
        StressScape — FSD project · Data is illustrative
      </footer>
    </div>
  );
}
