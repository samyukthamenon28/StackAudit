'use client';

import { AuditResult } from '@/types';
import AuditResults from '@/components/AuditResults';
import Link from 'next/link';

interface Props {
  audit: AuditResult;
  shareUrl: string;
}

export default function SharePageClient({ audit, shareUrl }: Props) {
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-black text-stone-900 text-lg tracking-tight hover:opacity-70 transition-opacity">
            StackSavvy
          </Link>
          <Link
            href="/"
            className="text-xs bg-stone-900 text-white px-3 py-1.5 rounded-lg hover:bg-stone-700 transition-colors font-medium"
          >
            Run your own audit →
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-6">
          <p className="text-xs text-stone-400 uppercase tracking-widest font-medium mb-1">Shared audit</p>
          <h1 className="text-2xl font-black text-stone-900">
            {audit.totalMonthlySavings > 0
              ? `$${audit.totalMonthlySavings.toLocaleString()}/mo in potential savings found`
              : 'AI stack is well-optimized'}
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            {audit.input.teamSize}-person team · {audit.input.useCase} use case · {audit.input.tools.length} tool{audit.input.tools.length !== 1 ? 's' : ''}
          </p>
        </div>

        <AuditResults audit={audit} shareUrl={shareUrl} showLeadCapture={true} />

        <div className="mt-10 p-5 bg-stone-900 text-white rounded-xl text-center">
          <p className="font-bold text-lg mb-1">Is your AI stack optimized?</p>
          <p className="text-stone-400 text-sm mb-4">Run a free audit on your own tools in under 2 minutes.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white text-stone-900 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-stone-100 transition-colors"
          >
            Start free audit →
          </Link>
        </div>
      </main>
    </div>
  );
}
