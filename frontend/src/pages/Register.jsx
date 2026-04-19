import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await register({ name, email, password });
      nav('/');
    } catch (err) {
      const msg = err.errors?.length ? err.errors.join(', ') : err.message;
      setError(msg || 'Registration failed');
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-2xl font-bold text-white">Create account</h1>
      <p className="mt-1 text-sm text-mist/70">Personalized stress maps and saved places.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-mist/70">Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-ink-900 px-4 py-3 text-white outline-none ring-accent focus:ring-2"
          />
        </div>
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
          <label className="block text-xs font-medium text-mist/70">Password (min 6)</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-ink-900 px-4 py-3 text-white outline-none ring-accent focus:ring-2"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-xl bg-accent py-3 font-semibold text-white hover:bg-accent-dim"
        >
          Sign up
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-mist/60">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
