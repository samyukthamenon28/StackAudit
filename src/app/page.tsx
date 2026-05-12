'use client';

import { useState } from 'react';
import { AuditInput, AuditResult } from '@/types';
import SpendForm from '@/components/SpendForm';
import AuditResults from '@/components/AuditResults';
import { AlertCircle, BarChart2, Shield, Zap } from 'lucide-react';

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [error, setError] = useState('');

  async function handleAudit(input: AuditInput) {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Audit failed. Please try again.');
        return;
      }

      setAudit(data.audit);
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }

  const shareUrl = audit
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/share/${audit.id}`
    : '';

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <span className="font-black text-stone-900 text-lg tracking-tight">StackSavvy</span>
            <span className="ml-2 text-xs text-stone-400 font-medium">AI Cost Intelligence</span>
          </div>
          <a href="https://credex.ai" target="_blank" rel="noopener noreferrer" className="text-xs text-stone-400 hover:text-stone-700 transition-colors">
            by Credex →
          </a>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        {!audit && (
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-black tracking-tight text-stone-900 mb-4 leading-tight">
              Find out what your<br />
              <span className="text-stone-400">AI stack is costing you.</span>
            </h1>
            <p className="text-stone-500 text-lg max-w-md mx-auto leading-relaxed">
              Enter your tools and plans. Get an instant audit with defensible savings recommendations. Free, no login.
            </p>
            <div className="flex items-center justify-center gap-6 mt-6 text-xs text-stone-400">
              <span className="flex items-center gap-1.5"><Zap size={12} className="text-amber-400" /> Instant results</span>
              <span className="flex items-center gap-1.5"><Shield size={12} className="text-emerald-400" /> No login required</span>
              <span className="flex items-center gap-1.5"><BarChart2 size={12} className="text-blue-400" /> Defensible math</span>
            </div>
          </div>
        )}

        <div className={`bg-white rounded-xl border border-stone-200 p-6 ${audit ? 'mb-8' : ''}`}>
          {audit && (
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-stone-100">
              <p className="text-sm font-medium text-stone-700">Your stack</p>
              <button onClick={() => setAudit(null)} className="text-xs text-stone-400 hover:text-stone-700 transition-colors">
                Edit inputs
              </button>
            </div>
          )}
          <SpendForm onSubmit={handleAudit} loading={loading} />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {audit && (
          <div id="results">
            <AuditResults audit={audit} shareUrl={shareUrl} showLeadCapture={true} />
          </div>
        )}

        {!audit && (
          <div className="mt-16 pt-12 border-t border-stone-200">
            <p className="text-center text-xs text-stone-400 uppercase tracking-widest mb-8 font-medium">Built on verified pricing data</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { label: 'Tools covered', value: '8+' },
                { label: 'Plans tracked', value: '32+' },
                { label: 'Pricing updated', value: 'Weekly' },
              ].map(s => (
                <div key={s.label} className="bg-white border border-stone-200 rounded-lg px-3 py-4">
                  <p className="text-xl font-black text-stone-900">{s.value}</p>
                  <p className="text-xs text-stone-400 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-stone-200 mt-20">
        <div className="max-w-2xl mx-auto px-4 py-6 flex items-center justify-between text-xs text-stone-400">
          <span>© 2025 StackSavvy by Credex</span>
          <span>Pricing verified from official vendor pages</span>
        </div>
      </footer>
    </div>
  );
}
