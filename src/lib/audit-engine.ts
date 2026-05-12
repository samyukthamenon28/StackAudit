import { AuditInput, AuditResult, ToolEntry, ToolRecommendation, UseCase } from '@/types';
import { TOOL_PRICING, TOOL_NAMES } from './pricing';
import { nanoid } from 'nanoid';

// ------------------------------------------------------------------
// Per-tool audit logic
// Each function returns a ToolRecommendation with defensible reasoning
// ------------------------------------------------------------------

function auditCursor(entry: ToolEntry, teamSize: number, useCase: UseCase): ToolRecommendation {
  const base: Partial<ToolRecommendation> = {
    toolId: entry.toolId,
    toolName: TOOL_NAMES[entry.toolId],
    currentPlan: entry.plan,
    currentSpend: entry.monthlySpend,
  };

  // Copilot Individual is $10/seat vs Cursor Pro $20/seat; for non-coding use cases Cursor is overkill
  if (useCase !== 'coding' && entry.plan === 'pro') {
    return {
      ...base,
      recommendedAction: 'switch',
      recommendedTool: 'GitHub Copilot Individual',
      projectedSpend: 10 * entry.seats,
      monthlySavings: entry.monthlySpend - 10 * entry.seats,
      reason: `For ${useCase} workflows, GitHub Copilot Individual ($10/seat) provides equivalent in-editor completions at half the cost. Cursor Pro's 500 fast-request budget is optimized for heavy coding iteration loops.`,
    } as ToolRecommendation;
  }

  // Business plan makes sense only at 5+ seats with real admin needs
  if (entry.plan === 'business' && entry.seats < 5) {
    const proSpend = 20 * entry.seats;
    return {
      ...base,
      recommendedAction: 'downgrade',
      recommendedPlan: 'Pro',
      projectedSpend: proSpend,
      monthlySavings: entry.monthlySpend - proSpend,
      reason: `Cursor Business adds SSO and centralized billing — features that matter at 5+ seats. At ${entry.seats} seat(s), Cursor Pro delivers identical AI capability at $20/seat vs $40/seat.`,
    } as ToolRecommendation;
  }

  return {
    ...base,
    recommendedAction: 'keep',
    projectedSpend: entry.monthlySpend,
    monthlySavings: 0,
    reason: `${entry.plan} plan is appropriate for your team size and use case.`,
  } as ToolRecommendation;
}

function auditGithubCopilot(entry: ToolEntry, teamSize: number, useCase: UseCase): ToolRecommendation {
  const base: Partial<ToolRecommendation> = {
    toolId: entry.toolId,
    toolName: TOOL_NAMES[entry.toolId],
    currentPlan: entry.plan,
    currentSpend: entry.monthlySpend,
  };

  // Enterprise at $39/seat is only worth it for fine-tuning custom models — rare need
  if (entry.plan === 'enterprise' && entry.seats < 20) {
    const businessSpend = 19 * entry.seats;
    return {
      ...base,
      recommendedAction: 'downgrade',
      recommendedPlan: 'Business',
      projectedSpend: businessSpend,
      monthlySavings: entry.monthlySpend - businessSpend,
      reason: `Copilot Enterprise's main differentiator is custom model fine-tuning on your codebase — ROI typically requires 20+ engineers and a dedicated MLOps workflow. At ${entry.seats} seats, Business ($19/seat) covers policy management and audit logs.`,
    } as ToolRecommendation;
  }

  // Individual is cheaper than Business for solo/duo — no policy value at <3 seats
  if (entry.plan === 'business' && entry.seats < 3) {
    const indSpend = 10 * entry.seats;
    return {
      ...base,
      recommendedAction: 'downgrade',
      recommendedPlan: 'Individual',
      projectedSpend: indSpend,
      monthlySavings: entry.monthlySpend - indSpend,
      reason: `Copilot Business adds organization-level policy management — irrelevant for teams under 3. Individual at $10/seat saves $9/seat with no capability loss for small teams.`,
    } as ToolRecommendation;
  }

  return {
    ...base,
    recommendedAction: 'keep',
    projectedSpend: entry.monthlySpend,
    monthlySavings: 0,
    reason: `Your Copilot ${entry.plan} plan is well-matched to your team size.`,
  } as ToolRecommendation;
}

function auditClaude(entry: ToolEntry, teamSize: number, useCase: UseCase): ToolRecommendation {
  const base: Partial<ToolRecommendation> = {
    toolId: entry.toolId,
    toolName: TOOL_NAMES[entry.toolId],
    currentPlan: entry.plan,
    currentSpend: entry.monthlySpend,
  };

  // Team plan min 5 seats; if team is small they're paying for empty seats
  if (entry.plan === 'team' && entry.seats < 5) {
    const proSpend = 20 * entry.seats;
    return {
      ...base,
      recommendedAction: 'downgrade',
      recommendedPlan: 'Pro (individual)',
      projectedSpend: proSpend,
      monthlySavings: entry.monthlySpend - proSpend,
      reason: `Claude Team requires a 5-seat minimum at $30/seat. A team of ${entry.seats} pays for ${5 - entry.seats} unused seat(s). Individual Pro plans at $20/seat provide identical model access with no seat floor.`,
    } as ToolRecommendation;
  }

  // Max plans: only justified for extremely heavy usage (daily power users)
  if ((entry.plan === 'max5' || entry.plan === 'max20') && entry.seats > 3) {
    const teamSpend = 30 * entry.seats;
    if (teamSpend < entry.monthlySpend) {
      return {
        ...base,
        recommendedAction: 'switch',
        recommendedPlan: 'Team',
        projectedSpend: teamSpend,
        monthlySavings: entry.monthlySpend - teamSpend,
        reason: `Max plans are designed for individual power users hitting Pro limits daily. At ${entry.seats} seats, Claude Team ($30/seat) with admin controls will serve most team workflows at lower cost.`,
      } as ToolRecommendation;
    }
  }

  // API users: check if a chat plan might be more economical
  if (entry.plan === 'api' && entry.monthlySpend > 40) {
    return {
      ...base,
      recommendedAction: 'keep',
      projectedSpend: entry.monthlySpend,
      monthlySavings: 0,
      reason: `API direct billing is appropriate for programmatic/production usage. If usage is primarily interactive chat, Claude Pro ($20/seat) offers a flat rate that can be cheaper below ~$20/seat API usage.`,
    } as ToolRecommendation;
  }

  return {
    ...base,
    recommendedAction: 'keep',
    projectedSpend: entry.monthlySpend,
    monthlySavings: 0,
    reason: `Claude ${entry.plan} plan is appropriate for your team.`,
  } as ToolRecommendation;
}

function auditChatGPT(entry: ToolEntry, teamSize: number, useCase: UseCase): ToolRecommendation {
  const base: Partial<ToolRecommendation> = {
    toolId: entry.toolId,
    toolName: TOOL_NAMES[entry.toolId],
    currentPlan: entry.plan,
    currentSpend: entry.monthlySpend,
  };

  // Team at $30/seat vs Plus at $20/seat — only value-add is shared workspace & SSO
  if (entry.plan === 'team' && entry.seats < 4) {
    const plusSpend = 20 * entry.seats;
    return {
      ...base,
      recommendedAction: 'downgrade',
      recommendedPlan: 'Plus (individual)',
      projectedSpend: plusSpend,
      monthlySavings: entry.monthlySpend - plusSpend,
      reason: `ChatGPT Team adds shared workspaces and admin controls — genuine value at 5+ people. At ${entry.seats} seats the $10/seat premium buys features you're unlikely to use. Individual Plus provides identical GPT-4o access.`,
    } as ToolRecommendation;
  }

  // If they have both ChatGPT and Claude, suggest consolidating
  return {
    ...base,
    recommendedAction: 'keep',
    projectedSpend: entry.monthlySpend,
    monthlySavings: 0,
    reason: `ChatGPT ${entry.plan} is appropriately sized for your team.`,
  } as ToolRecommendation;
}

function auditAnthropicAPI(entry: ToolEntry, teamSize: number, useCase: UseCase): ToolRecommendation {
  const base: Partial<ToolRecommendation> = {
    toolId: entry.toolId,
    toolName: TOOL_NAMES[entry.toolId],
    currentPlan: entry.plan,
    currentSpend: entry.monthlySpend,
  };

  // Low API spend: might be cheaper on chat plan
  if (entry.monthlySpend < 25 && entry.seats === 1) {
    return {
      ...base,
      recommendedAction: 'switch',
      recommendedTool: 'Claude Pro',
      projectedSpend: 20,
      monthlySavings: entry.monthlySpend - 20,
      reason: `At $${entry.monthlySpend}/mo API spend for one person, Claude Pro ($20 flat) likely provides more total usage. API billing is most efficient for production workloads with predictable, high-volume token usage.`,
    } as ToolRecommendation;
  }

  return {
    ...base,
    recommendedAction: 'keep',
    projectedSpend: entry.monthlySpend,
    monthlySavings: 0,
    reason: `Direct API access is appropriate for your usage volume and programmatic workflow.`,
  } as ToolRecommendation;
}

function auditOpenAIAPI(entry: ToolEntry, teamSize: number, useCase: UseCase): ToolRecommendation {
  const base: Partial<ToolRecommendation> = {
    toolId: entry.toolId,
    toolName: TOOL_NAMES[entry.toolId],
    currentPlan: entry.plan,
    currentSpend: entry.monthlySpend,
  };

  if (entry.monthlySpend < 25 && entry.seats === 1) {
    return {
      ...base,
      recommendedAction: 'switch',
      recommendedTool: 'ChatGPT Plus',
      projectedSpend: 20,
      monthlySavings: entry.monthlySpend - 20,
      reason: `Under $25/mo in API spend suggests interactive rather than production use. ChatGPT Plus ($20 flat) covers the same GPT-4o model with a better UX for non-programmatic workflows.`,
    } as ToolRecommendation;
  }

  return {
    ...base,
    recommendedAction: 'keep',
    projectedSpend: entry.monthlySpend,
    monthlySavings: 0,
    reason: `Direct API access is appropriate for production-level usage at this spend.`,
  } as ToolRecommendation;
}

function auditGemini(entry: ToolEntry, teamSize: number, useCase: UseCase): ToolRecommendation {
  const base: Partial<ToolRecommendation> = {
    toolId: entry.toolId,
    toolName: TOOL_NAMES[entry.toolId],
    currentPlan: entry.plan,
    currentSpend: entry.monthlySpend,
  };

  // Advanced plan: if you don't use Google Workspace, 2TB Drive, or Docs integration, it's overpriced
  if (entry.plan === 'advanced' && useCase === 'coding') {
    return {
      ...base,
      recommendedAction: 'switch',
      recommendedTool: 'Claude Pro or ChatGPT Plus',
      projectedSpend: 20 * entry.seats,
      monthlySavings: entry.monthlySpend - 20 * entry.seats,
      reason: `Gemini Advanced is priced as part of Google One AI Premium ($22/seat) — its bundled 2TB Drive storage and Workspace integration are the value drivers. For coding use cases, Claude Pro or ChatGPT Plus offer stronger code models at similar pricing.`,
    } as ToolRecommendation;
  }

  return {
    ...base,
    recommendedAction: 'keep',
    projectedSpend: entry.monthlySpend,
    monthlySavings: 0,
    reason: `Gemini ${entry.plan} is a reasonable fit for your workflow.`,
  } as ToolRecommendation;
}

function auditWindsurf(entry: ToolEntry, teamSize: number, useCase: UseCase): ToolRecommendation {
  const base: Partial<ToolRecommendation> = {
    toolId: entry.toolId,
    toolName: TOOL_NAMES[entry.toolId],
    currentPlan: entry.plan,
    currentSpend: entry.monthlySpend,
  };

  // Windsurf Pro vs Cursor Pro: Windsurf is $5 cheaper; if they have both, flag redundancy
  if (entry.plan === 'teams' && entry.seats < 5) {
    const proSpend = 15 * entry.seats;
    return {
      ...base,
      recommendedAction: 'downgrade',
      recommendedPlan: 'Pro',
      projectedSpend: proSpend,
      monthlySavings: entry.monthlySpend - proSpend,
      reason: `Windsurf Teams adds admin analytics and controls — useful at 5+ engineers. At ${entry.seats} seat(s), Pro ($15/seat) provides unlimited Flow actions and full model access at less than half the cost.`,
    } as ToolRecommendation;
  }

  return {
    ...base,
    recommendedAction: 'keep',
    projectedSpend: entry.monthlySpend,
    monthlySavings: 0,
    reason: `Windsurf ${entry.plan} is well-priced for your team.`,
  } as ToolRecommendation;
}

// ------------------------------------------------------------------
// Overlap detection: flag if paying for both ChatGPT and Claude chat
// ------------------------------------------------------------------
function detectOverlap(entries: ToolEntry[], recommendations: ToolRecommendation[]): ToolRecommendation[] {
  const chatTools = entries.filter(e => ['claude', 'chatgpt', 'gemini'].includes(e.toolId));
  const ideTools = entries.filter(e => ['cursor', 'github-copilot', 'windsurf'].includes(e.toolId));

  // Flag duplicate chat tools
  if (chatTools.length >= 2) {
    // Find the most expensive chat tool to flag
    const sorted = [...chatTools].sort((a, b) => b.monthlySpend - a.monthlySpend);
    const expensiveTool = sorted[0];
    const rec = recommendations.find(r => r.toolId === expensiveTool.toolId);
    if (rec && rec.recommendedAction === 'keep') {
      const cheaper = sorted[sorted.length - 1];
      rec.recommendedAction = 'cancel';
      rec.recommendedTool = TOOL_NAMES[cheaper.toolId];
      const savings = expensiveTool.monthlySpend;
      rec.monthlySavings = savings;
      rec.projectedSpend = 0;
      rec.reason = `You're paying for ${chatTools.length} general-purpose AI chat tools simultaneously. ${TOOL_NAMES[cheaper.toolId]} covers the same use cases. Consolidating to one chat subscription saves $${savings}/mo with no workflow gap.`;
    }
  }

  // Flag duplicate IDE copilot tools
  if (ideTools.length >= 2) {
    const sorted = [...ideTools].sort((a, b) => b.monthlySpend - a.monthlySpend);
    const expensiveTool = sorted[0];
    const rec = recommendations.find(r => r.toolId === expensiveTool.toolId);
    if (rec && rec.recommendedAction === 'keep') {
      const cheaper = sorted[sorted.length - 1];
      const savings = expensiveTool.monthlySpend;
      rec.recommendedAction = 'cancel';
      rec.recommendedTool = TOOL_NAMES[cheaper.toolId];
      rec.monthlySavings = savings;
      rec.projectedSpend = 0;
      rec.reason = `You're running ${ideTools.length} IDE AI coding tools in parallel — developers can only use one editor extension at a time. ${TOOL_NAMES[cheaper.toolId]} is the lower-cost option. Cut ${TOOL_NAMES[expensiveTool.toolId]} and save $${savings}/mo.`;
    }
  }

  return recommendations;
}

// ------------------------------------------------------------------
// Main audit function
// ------------------------------------------------------------------
export function runAudit(input: AuditInput): Omit<AuditResult, 'id' | 'createdAt' | 'aiSummary'> {
  const recommendations: ToolRecommendation[] = input.tools.map(entry => {
    switch (entry.toolId) {
      case 'cursor': return auditCursor(entry, input.teamSize, input.useCase);
      case 'github-copilot': return auditGithubCopilot(entry, input.teamSize, input.useCase);
      case 'claude': return auditClaude(entry, input.teamSize, input.useCase);
      case 'chatgpt': return auditChatGPT(entry, input.teamSize, input.useCase);
      case 'anthropic-api': return auditAnthropicAPI(entry, input.teamSize, input.useCase);
      case 'openai-api': return auditOpenAIAPI(entry, input.teamSize, input.useCase);
      case 'gemini': return auditGemini(entry, input.teamSize, input.useCase);
      case 'windsurf': return auditWindsurf(entry, input.teamSize, input.useCase);
      default: return {
        toolId: entry.toolId,
        toolName: TOOL_NAMES[entry.toolId] || entry.toolId,
        currentPlan: entry.plan,
        currentSpend: entry.monthlySpend,
        recommendedAction: 'keep' as const,
        projectedSpend: entry.monthlySpend,
        monthlySavings: 0,
        reason: 'No specific optimization found for this plan.',
      };
    }
  });

  const finalRecs = detectOverlap(input.tools, recommendations);

  const totalCurrentSpend = finalRecs.reduce((sum, r) => sum + r.currentSpend, 0);
  const totalProjectedSpend = finalRecs.reduce((sum, r) => sum + r.projectedSpend, 0);
  const totalMonthlySavings = Math.max(0, totalCurrentSpend - totalProjectedSpend);
  const totalAnnualSavings = totalMonthlySavings * 12;

  return {
    input,
    recommendations: finalRecs,
    totalCurrentSpend,
    totalProjectedSpend,
    totalMonthlySavings,
    totalAnnualSavings,
  };
}
