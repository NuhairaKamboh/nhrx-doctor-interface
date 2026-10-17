'use client';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import { useDoctor } from '../lib/useDoctor';

// Screen A — Search View
export default function SearchPage() {
  const doctor = useDoctor();
  if (!doctor) return null;
  return (
    <>
      <Header doctor={doctor} />
      <main className="mx-auto flex max-w-2xl flex-col items-center px-4 pt-28 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Patient Record Lookup</h1>
        <p className="mb-8 mt-2 text-slate-500">
          Search any patient's national medical history across all connected hospitals.
        </p>
        <SearchBar large />
      </main>
    </>
  );
}
