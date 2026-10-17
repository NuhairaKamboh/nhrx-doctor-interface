'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clearSession } from '../lib/api';

export default function Header({ doctor }) {
  const router = useRouter();
  const logout = () => { clearSession(); router.replace('/login'); };

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-brand-900">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">✚</span>
          NHRX
        </Link>
        {doctor && (
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-slate-600 sm:inline">{doctor.doctorName}</span>
            <span className="rounded-full bg-brand-50 px-3 py-1 font-medium text-brand-700 ring-1 ring-brand-100">
              Logged in at: {doctor.hospitalName}
            </span>
            <button onClick={logout} className="text-slate-500 hover:text-slate-800">Logout</button>
          </div>
        )}
      </div>
    </header>
  );
}
