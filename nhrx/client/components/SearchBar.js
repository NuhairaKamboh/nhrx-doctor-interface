'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar({ initial = '', large = false }) {
  const [cnic, setCnic] = useState(initial);
  const router = useRouter();
  const submit = (e) => {
    e.preventDefault();
    if (cnic.trim()) router.push(`/patient/${encodeURIComponent(cnic.trim())}`);
  };
  return (
    <form onSubmit={submit} className="flex w-full gap-2">
      <input
        className={`input ${large ? 'py-3 text-base' : ''}`}
        placeholder="Enter Patient CNIC (e.g. 35202-1234567-1)"
        value={cnic}
        onChange={(e) => setCnic(e.target.value)}
      />
      <button className={`btn ${large ? 'px-6' : ''}`}>Search</button>
    </form>
  );
}
