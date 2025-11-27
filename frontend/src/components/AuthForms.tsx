import { FormEvent, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input className="mt-1 w-full rounded border p-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium">Password</label>
        <input className="mt-1 w-full rounded border p-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={loading} className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60">{loading ? 'Logging in...' : 'Login'}</button>
    </form>
  );
}

export function RegisterForm() {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(email, name, password);
    } catch (err: any) {
      setError(err?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input className="mt-1 w-full rounded border p-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input className="mt-1 w-full rounded border p-2" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium">Password</label>
        <input className="mt-1 w-full rounded border p-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={loading} className="rounded bg-green-600 px-4 py-2 text-white disabled:opacity-60">{loading ? 'Registering...' : 'Register'}</button>
    </form>
  );
}


