'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, saveSession } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('ayesha@hospital1.pk');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
  try {
  // Mock login authorization token variables for direct browser verification
 const token = 'mock-presentation-token';
let doctor = {};

if (email === 'ayesha@hospital1.pk') {
  // Agar 'ayesha' likhengi toh Hospital 1 active hoga
  doctor = { id: 'demo-uuid-1', doctorName: 'Dr. Ayesha Khan', hospitalName: 'Hospital 1' };
} else {
  // Agar koi bhi doosri email dalingi toh automatic Hospital 2 khul jayega
  doctor = { id: 'demo-uuid-2', doctorName: 'Dr. Bilal Raza', hospitalName: 'Hospital 2' };
}
  
  saveSession(token, doctor);
  window.location.href = '/'; // Forces Next.js routing straight to Screen A (Search View)
} catch (err) {
  setError(err.message);
} finally {
  setLoading(false);
}
  };

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4">
        <div className="text-center">
          <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-xl bg-brand-600 text-xl text-white">✚</div>
          <h1 className="text-xl font-bold">NHRX Doctor Login</h1>
          <p className="text-sm text-slate-500">National Health Record Exchange</p>
        </div>
        <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn w-full" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </main>
  );
}
