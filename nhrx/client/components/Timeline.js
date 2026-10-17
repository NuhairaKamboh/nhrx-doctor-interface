'use client';
import StatusBadge from './StatusBadge';

const hospitalColor = (name) =>
  name === 'Hospital 1' ? 'bg-sky-100 text-sky-800 ring-sky-200' : 'bg-violet-100 text-violet-800 ring-violet-200';

export default function Timeline({ cases, doctor, onToggleStatus }) {
  if (!cases.length) {
    return <div className="card text-center text-slate-500">No medical history found for this CNIC.</div>;
  }
  return (
    <ol className="relative ml-3 border-l-2 border-slate-200">
      {cases.map((c) => {
        const mine = doctor && c.doctorId === doctor.id;
        return (
          <li key={c.id} className="mb-6 ml-6">
            <span className="absolute -left-[9px] mt-5 h-4 w-4 rounded-full border-2 border-white bg-brand-500" />
            <div className="card">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className={`rounded-md px-2.5 py-1 text-sm font-bold ring-1 ${hospitalColor(c.hospitalName)}`}>
                  🏥 {c.hospitalName}
                </span>
                <StatusBadge status={c.caseStatus} />
                <span className="ml-auto text-sm text-slate-500">
                  {new Date(c.checkupDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{c.diagnosis}</h3>
              <dl className="mt-2 grid gap-1 text-sm">
                <div><dt className="inline font-medium text-slate-600">Treatment: </dt><dd className="inline">{c.treatment}</dd></div>
                <div><dt className="inline font-medium text-slate-600">Medicines: </dt><dd className="inline">{c.medicines || '—'}</dd></div>
                <div><dt className="inline font-medium text-slate-600">Doctor: </dt><dd className="inline">{c.doctor?.doctorName}</dd></div>
              </dl>
              {mine && (
                <button
                  onClick={() => onToggleStatus(c)}
                  className="mt-3 text-sm font-medium text-brand-700 hover:underline"
                >
                  Mark as {c.caseStatus === 'PENDING' ? 'COMPLETED' : 'PENDING'}
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
