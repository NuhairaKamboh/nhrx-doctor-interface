'use client';
import { useCallback, useEffect, useState } from 'react';
import Header from '../../../components/Header';
import SearchBar from '../../../components/SearchBar';
import Timeline from '../../../components/Timeline';
import CaseForm from '../../../components/CaseForm';
import { api } from '../../../lib/api';
import { useDoctor } from '../../../lib/useDoctor';

// Screen B — Patient Profile Timeline
export default function PatientPage({ params }) {
  const cnic = decodeURIComponent(params.cnic);
  const doctor = useDoctor();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setCases(await api.getCases(cnic)); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [cnic]);

  useEffect(() => { if (doctor) load(); }, [doctor, load]);

  const handleCreate = async (payload) => {
    const created = await api.createCase(payload);
    setCases((prev) => [created, ...prev].sort((a, b) => new Date(b.checkupDate) - new Date(a.checkupDate)));
  };

  const handleToggle = async (c) => {
    const next = c.caseStatus === 'PENDING' ? 'COMPLETED' : 'PENDING';
    const updated = await api.updateStatus(c.id, next);
    setCases((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
  };

  if (!doctor) return null;
  const hospitals = [...new Set(cases.map((c) => c.hospitalName))];

  return (
    <>
      <Header doctor={doctor} />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <SearchBar initial={cnic} />
        <div className="mb-6 mt-8">
          <p className="text-sm text-slate-500">Patient CNIC</p>
          <h1 className="text-2xl font-bold">{cnic}</h1>
          {!loading && (
            <p className="text-sm text-slate-500">
              {cases.length} record(s) across {hospitals.length} hospital(s){hospitals.length ? `: ${hospitals.join(', ')}` : ''}
            </p>
          )}
        </div>
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <section>
            <h2 className="mb-4 text-lg font-semibold">Medical History</h2>
            {loading ? <p className="text-slate-500">Loading…</p>
              : error ? <p className="text-red-600">{error}</p>
              : <Timeline cases={cases} doctor={doctor} onToggleStatus={handleToggle} />}
          </section>
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <CaseForm cnic={cnic} doctor={doctor} onSubmit={handleCreate} />
          </aside>
        </div>
      </main>
    </>
  );
}
