'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface Props {
  auditId: string;
  monthlySavings: number;
  onSuccess: () => void;
}

export default function LeadCaptureForm({ auditId, monthlySavings, onSuccess }: Props) {
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          companyName: companyName || undefined,
          role: role || undefined,
          auditId,
          monthlySavings,
          honeypot: '', // real users leave this as empty string; bot check is server-side
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Something went wrong');
        return;
      }

      onSuccess();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Honeypot — hidden from real users */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, width: 0 }}
        aria-hidden="true"
      />

      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="form-input flex-1"
          required
          autoComplete="email"
        />
        <button
          type="submit"
          disabled={loading || !email}
          className="submit-btn-sm"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : 'Send report'}
        </button>
      </div>

      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
      >
        + Add company info (optional)
      </button>

      {expanded && (
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
            placeholder="Company name"
            className="form-input"
          />
          <input
            type="text"
            value={role}
            onChange={e => setRole(e.target.value)}
            placeholder="Your role"
            className="form-input"
          />
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </form>
  );
}
