import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      nav('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-2xl font-bold text-white">Welcome back</h1>
      <p className="mt-1 text-sm text-mist/70">Sign in to save locations and sync layer preferences.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-mist/70">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-ink-900 px-4 py-3 text-white outline-none ring-accent focus:ring-2"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-mist/70">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-ink-900 px-4 py-3 text-white outline-none ring-accent focus:ring-2"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-xl bg-accent py-3 font-semibold text-white hover:bg-accent-dim"
        >
          Sign in
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-mist/60">
        No account?{' '}
        <Link to="/register" className="font-medium text-accent hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
