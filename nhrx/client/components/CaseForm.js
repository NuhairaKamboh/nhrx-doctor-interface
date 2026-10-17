'use client';
import { useState } from 'react';

const empty = { diagnosis: '', treatment: '', medicines: '', caseStatus: 'PENDING', checkupDate: '' };

export default function CaseForm({ cnic, doctor, onSubmit }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const completed = form.caseStatus === 'COMPLETED';

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await onSubmit({ ...form, patientCnic: cnic });
      setForm(empty);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="card space-y-3">
      <div>
        <h2 className="text-lg font-semibold">Log New Case</h2>
        <p className="text-xs text-slate-500">Recorded at {doctor?.hospitalName} · encrypted at rest</p>
      </div>
      <textarea className="input" rows={2} placeholder="Diagnosis *" value={form.diagnosis} onChange={set('diagnosis')} required />
      <textarea className="input" rows={2} placeholder="Treatment *" value={form.treatment} onChange={set('treatment')} required />
      <input className="input" placeholder="Medicines (e.g. Paracetamol 500mg TDS)" value={form.medicines} onChange={set('medicines')} />
      <input className="input" type="date" value={form.checkupDate} onChange={set('checkupDate')} />

      <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
        <span className="text-sm font-medium">Status: {form.caseStatus}</span>
        <button
          type="button"
          role="switch"
          aria-checked={completed}
          onClick={() => setForm({ ...form, caseStatus: completed ? 'PENDING' : 'COMPLETED' })}
          className={`relative h-6 w-11 rounded-full transition ${completed ? 'bg-green-500' : 'bg-amber-400'}`}
        >
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${completed ? 'left-[22px]' : 'left-0.5'}`} />
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button className="btn w-full" disabled={saving}>{saving ? 'Saving…' : 'Save Case'}</button>
    </form>
  );
}
