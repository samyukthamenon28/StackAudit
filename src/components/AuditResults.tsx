'use client';

import { useState } from 'react';
import { AuditResult, ToolRecommendation } from '@/types';
import {
  TrendingDown, Check, ArrowRight, Share2, Mail,
  CheckCircle, AlertCircle, XCircle, ChevronDown, ChevronUp, ExternalLink,
  Sparkles, Copy
} from 'lucide-react';
import LeadCaptureForm from './LeadCaptureForm';

interface Props {
  audit: AuditResult;
  shareUrl: string;
  showLeadCapture?: boolean;
}

const ACTION_CONFIG = {
  keep: { icon: Check, label: 'Keep', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  downgrade: { icon: TrendingDown, label: 'Downgrade', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  switch: { icon: ArrowRight, label: 'Switch', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  cancel: { icon: XCircle, label: 'Cancel', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
};

function RecommendationCard({ rec }: { rec: ToolRecommendation }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = ACTION_CONFIG[rec.recommendedAction];
  const Icon = cfg.icon;
  const hasSavings = rec.monthlySavings > 0;

  return (
    <div className={`rounded-lg border ${hasSavings ? 'border-stone-200' : 'border-stone-100'} bg-white overflow-hidden transition-shadow hover:shadow-sm`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${cfg.bg} ${cfg.color} border ${cfg.border} shrink-0`}>
              <Icon size={11} />
              {cfg.label}
            </span>
            <div className="min-w-0">
              <p className="font-medium text-stone-800 text-sm leading-tight">{rec.toolName}</p>
              <p className="text-xs text-stone-400 mt-0.5">{rec.currentPlan}</p>
            </div>
          </div>

          <div className="text-right shrink-0">
            {hasSavings ? (
              <>
                <p className="text-xs text-stone-400 line-through">${rec.currentSpend}/mo</p>
                <p className="text-sm font-semibold text-emerald-600">save ${rec.monthlySavings}/mo</p>
              </>
            ) : (
              <p className="text-sm text-stone-500">${rec.currentSpend}/mo ✓</p>
            )}
          </div>
        </div>

        {rec.recommendedPlan && (
          <p className="text-xs text-stone-500 mt-2 ml-0">
            → Switch to <span className="font-medium text-stone-700">{rec.recommendedPlan}</span>
          </p>
        )}
        {rec.recommendedTool && (
          <p className="text-xs text-stone-500 mt-2">
            → Replace with <span className="font-medium text-stone-700">{rec.recommendedTool}</span>
          </p>
        )}
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2 border-t border-stone-100 text-xs text-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-colors"
      >
        <span>Why?</span>
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 text-xs text-stone-600 leading-relaxed bg-stone-50 border-t border-stone-100">
          {rec.reason}
        </div>
      )}
    </div>
  );
}

function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(url).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
      className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 transition-colors"
    >
      {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
      {copied ? 'Copied!' : 'Copy link'}
    </button>
  );
}

export default function AuditResults({ audit, shareUrl, showLeadCapture = true }: Props) {
  const [leadCaptured, setLeadCaptured] = useState(false);
  const isHighSavings = audit.totalMonthlySavings >= 500;
  const isOptimal = audit.totalMonthlySavings < 10;

  const savingsRecs = audit.recommendations.filter(r => r.monthlySavings > 0);
  const keepRecs = audit.recommendations.filter(r => r.monthlySavings === 0);

  return (
    <div className="space-y-8">
      {/* Hero savings */}
      <div className={`rounded-xl p-6 ${isOptimal ? 'bg-emerald-50 border border-emerald-200' : 'bg-stone-950 text-white'}`}>
        <div className="flex items-start justify-between">
          <div>
            <p className={`text-xs uppercase tracking-widest font-medium mb-2 ${isOptimal ? 'text-emerald-600' : 'text-stone-400'}`}>
              {isOptimal ? 'Audit complete' : 'Potential savings'}
            </p>
            {isOptimal ? (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle size={24} className="text-emerald-500" />
                  <p className="text-2xl font-bold text-emerald-800">You&apos;re spending well.</p>
                </div>
                <p className="text-sm text-emerald-700 mt-2">
                  ${audit.totalCurrentSpend}/mo across {audit.input.tools.length} tool{audit.input.tools.length !== 1 ? 's' : ''} — no obvious waste found.
                </p>
              </>
            ) : (
              <>
                <p className="text-5xl font-black tracking-tight">
                  ${audit.totalMonthlySavings.toLocaleString()}<span className="text-2xl font-medium text-stone-400">/mo</span>
                </p>
                <p className="text-stone-400 mt-1 text-sm">
                  ${audit.totalAnnualSavings.toLocaleString()} per year · from ${audit.totalCurrentSpend}/mo → ${audit.totalProjectedSpend}/mo
                </p>
              </>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            <CopyButton url={shareUrl} />
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-300 transition-colors"
            >
              <Share2 size={11} />
              Share
            </a>
          </div>
        </div>
      </div>

      {/* AI Summary */}
      <div className="rounded-lg border border-stone-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-stone-400" />
          <span className="text-xs text-stone-400 font-medium uppercase tracking-wider">AI Analysis</span>
        </div>
        <p className="text-sm text-stone-700 leading-relaxed">{audit.aiSummary}</p>
      </div>

      {/* High savings: Credex CTA */}
      {isHighSavings && (
        <div className="rounded-lg border-2 border-stone-900 bg-stone-900 text-white p-5">
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-2">For savings of this size</p>
          <p className="font-bold text-lg mb-1">A Credex consultation could find even more.</p>
          <p className="text-sm text-stone-300 mb-4">
            At ${audit.totalMonthlySavings}/mo in identified savings, there&apos;s likely negotiated enterprise pricing, credit stacks, and vendor alternatives we haven&apos;t surfaced here.
          </p>
          <a
            href="https://credex.ai?ref=stacksavvy&savings=${audit.totalMonthlySavings}"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-stone-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-stone-100 transition-colors"
          >
            Book a free Credex consultation
            <ExternalLink size={13} />
          </a>
        </div>
      )}

      {/* Per-tool breakdown */}
      {savingsRecs.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-widest text-stone-400 font-medium mb-3">
            Optimization opportunities ({savingsRecs.length})
          </h3>
          <div className="space-y-2">
            {savingsRecs.map(rec => (
              <RecommendationCard key={rec.toolId} rec={rec} />
            ))}
          </div>
        </div>
      )}

      {keepRecs.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-widest text-stone-400 font-medium mb-3">
            Already optimized ({keepRecs.length})
          </h3>
          <div className="space-y-2">
            {keepRecs.map(rec => (
              <RecommendationCard key={rec.toolId} rec={rec} />
            ))}
          </div>
        </div>
      )}

      {/* Lead capture */}
      {showLeadCapture && !leadCaptured && (
        <div className="rounded-lg border border-stone-200 p-5">
          <div className="flex items-start gap-3 mb-4">
            <Mail size={16} className="text-stone-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-stone-800 text-sm">
                {isOptimal
                  ? 'Get notified when new optimizations apply to your stack'
                  : 'Get your full report by email'}
              </p>
              <p className="text-xs text-stone-400 mt-0.5">
                {isOptimal
                  ? 'We&apos;ll alert you when pricing changes or better options emerge.'
                  : 'Includes this breakdown, recommended actions, and annual savings summary.'}
              </p>
            </div>
          </div>
          <LeadCaptureForm
            auditId={audit.id}
            monthlySavings={audit.totalMonthlySavings}
            onSuccess={() => setLeadCaptured(true)}
          />
        </div>
      )}

      {leadCaptured && (
        <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
          <CheckCircle size={16} />
          Report sent! Check your inbox.
        </div>
      )}
    </div>
  );
}
