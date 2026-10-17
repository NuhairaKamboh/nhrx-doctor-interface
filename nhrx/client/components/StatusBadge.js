export default function StatusBadge({ status }) {
  const done = status === 'COMPLETED';
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${done ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
      {status}
    </span>
  );
}
