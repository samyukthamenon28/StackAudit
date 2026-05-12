'use client';

import { useState, useEffect } from 'react';
import { AuditInput, ToolEntry, UseCase, ToolId } from '@/types';
import { TOOL_PRICING } from '@/lib/pricing';
import { Plus, Trash2, ArrowRight, Loader2 } from 'lucide-react';

const STORAGE_KEY = 'stacksavvy_form_state';

const USE_CASES: { value: UseCase; label: string; desc: string }[] = [
  { value: 'coding', label: 'Coding', desc: 'Software development, code review' },
  { value: 'writing', label: 'Writing', desc: 'Content, docs, marketing copy' },
  { value: 'data', label: 'Data', desc: 'Analysis, SQL, spreadsheets' },
  { value: 'research', label: 'Research', desc: 'Synthesis, summarization' },
  { value: 'mixed', label: 'Mixed', desc: 'Variety of tasks' },
];

const ALL_TOOLS = Object.values(TOOL_PRICING);

function emptyEntry(): ToolEntry {
  return { toolId: 'cursor', plan: 'pro', seats: 1, monthlySpend: 20 };
}

interface Props {
  onSubmit: (input: AuditInput) => void;
  loading: boolean;
}

export default function SpendForm({ onSubmit, loading }: Props) {
  const [tools, setTools] = useState<ToolEntry[]>([emptyEntry()]);
  const [teamSize, setTeamSize] = useState(1);
  const [useCase, setUseCase] = useState<UseCase>('coding');

  // Persist form state
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.tools) setTools(parsed.tools);
        if (parsed.teamSize) setTeamSize(parsed.teamSize);
        if (parsed.useCase) setUseCase(parsed.useCase);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ tools, teamSize, useCase }));
    } catch {}
  }, [tools, teamSize, useCase]);

  function updateTool(idx: number, field: keyof ToolEntry, value: string | number) {
    setTools(prev => {
      const next = [...prev];
      const entry = { ...next[idx] };

      if (field === 'toolId') {
        entry.toolId = value as ToolId;
        const pricing = TOOL_PRICING[value as string];
        entry.plan = pricing?.plans[1]?.id || pricing?.plans[0]?.id || '';
        const plan = pricing?.plans.find(p => p.id === entry.plan);
        entry.monthlySpend = (plan?.pricePerSeat || 0) * entry.seats;
      } else if (field === 'plan') {
        entry.plan = value as string;
        const pricing = TOOL_PRICING[entry.toolId];
        const plan = pricing?.plans.find(p => p.id === value);
        if (plan) {
          entry.monthlySpend = plan.pricePerSeat * entry.seats;
        }
      } else if (field === 'seats') {
        const seats = Math.max(1, Number(value));
        entry.seats = seats;
        const pricing = TOOL_PRICING[entry.toolId];
        const plan = pricing?.plans.find(p => p.id === entry.plan);
        if (plan && plan.pricePerSeat > 0) {
          entry.monthlySpend = plan.pricePerSeat * seats;
        }
      } else if (field === 'monthlySpend') {
        entry.monthlySpend = Math.max(0, Number(value));
      }

      next[idx] = entry;
      return next;
    });
  }

  function addTool() {
    const usedIds = new Set(tools.map(t => t.toolId));
    const next = ALL_TOOLS.find(t => !usedIds.has(t.toolId as ToolId));
    if (next) {
      const firstPaidPlan = next.plans.find(p => p.pricePerSeat > 0) || next.plans[0];
      setTools(prev => [...prev, {
        toolId: next.toolId as ToolId,
        plan: firstPaidPlan.id,
        seats: 1,
        monthlySpend: firstPaidPlan.pricePerSeat,
      }]);
    }
  }

  function removeTool(idx: number) {
    setTools(prev => prev.filter((_, i) => i !== idx));
  }

  const totalMonthly = tools.reduce((s, t) => s + t.monthlySpend, 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ tools, teamSize, useCase });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Team Context */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">Team size</label>
          <input
            type="number"
            min={1}
            max={10000}
            value={teamSize}
            onChange={e => setTeamSize(Math.max(1, parseInt(e.target.value) || 1))}
            className="form-input"
            required
          />
        </div>
        <div>
          <label className="form-label">Primary use case</label>
          <select
            value={useCase}
            onChange={e => setUseCase(e.target.value as UseCase)}
            className="form-input"
          >
            {USE_CASES.map(u => (
              <option key={u.value} value={u.value}>{u.label} — {u.desc}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tool Entries */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="form-label mb-0">Your AI tools</label>
          <span className="text-xs text-stone-400 font-mono">${totalMonthly.toFixed(0)}/mo total</span>
        </div>

        <div className="space-y-3">
          {tools.map((tool, idx) => {
            const toolPricing = TOOL_PRICING[tool.toolId];
            const isApi = toolPricing?.category === 'api';
            return (
              <div key={idx} className="tool-row group">
                {/* Tool selector */}
                <select
                  value={tool.toolId}
                  onChange={e => updateTool(idx, 'toolId', e.target.value)}
                  className="form-input flex-1 min-w-0"
                >
                  {ALL_TOOLS.map(t => (
                    <option key={t.toolId} value={t.toolId}>{t.toolName}</option>
                  ))}
                </select>

                {/* Plan */}
                <select
                  value={tool.plan}
                  onChange={e => updateTool(idx, 'plan', e.target.value)}
                  className="form-input w-36"
                >
                  {toolPricing?.plans.map(p => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>

                {/* Seats — hide for API tools */}
                {!isApi && (
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      value={tool.seats}
                      onChange={e => updateTool(idx, 'seats', e.target.value)}
                      className="form-input w-20 pr-8"
                      aria-label="Seats"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-stone-400 pointer-events-none">seats</span>
                  </div>
                )}

                {/* Monthly spend */}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm pointer-events-none">$</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={tool.monthlySpend}
                    onChange={e => updateTool(idx, 'monthlySpend', e.target.value)}
                    className="form-input w-28 pl-6"
                    aria-label="Monthly spend"
                    placeholder="0"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-stone-400 pointer-events-none">/mo</span>
                </div>

                {/* Remove */}
                {tools.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTool(idx)}
                    className="p-1.5 text-stone-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Remove tool"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {tools.length < ALL_TOOLS.length && (
          <button
            type="button"
            onClick={addTool}
            className="mt-3 flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 transition-colors"
          >
            <Plus size={14} />
            Add another tool
          </button>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || tools.length === 0}
        className="submit-btn"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Analyzing your stack...
          </>
        ) : (
          <>
            Run my free audit
            <ArrowRight size={16} />
          </>
        )}
      </button>
    </form>
  );
}
