import Anthropic from '@anthropic-ai/sdk';
import { AuditResult } from '@/types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function buildPrompt(audit: Omit<AuditResult, 'aiSummary'>): string {
  const toolList = audit.recommendations
    .map(r => `- ${r.toolName} (${r.currentPlan}): $${r.currentSpend}/mo → ${r.recommendedAction === 'keep' ? 'keep' : `${r.recommendedAction} → save $${r.monthlySavings}/mo`}`)
    .join('\n');

  return `You are a pragmatic AI cost analyst writing a personalized audit summary for a software team.

Team context:
- Team size: ${audit.input.teamSize} people
- Primary use case: ${audit.input.useCase}
- Total current AI spend: $${audit.totalCurrentSpend}/month
- Total potential savings: $${audit.totalMonthlySavings}/month ($${audit.totalAnnualSavings}/year)

Tool breakdown:
${toolList}

Write a ~100-word personalized summary paragraph. Be direct and specific. Name the biggest saving opportunity first. Use plain English — no bullet points, no headers, no markdown. Speak directly to the team lead reading this. Reference their actual use case and tools. End with the annual savings figure as the punchline. Do not include generic disclaimers or filler phrases like "it's important to note."`;
}

function fallbackSummary(audit: Omit<AuditResult, 'aiSummary'>): string {
  const { totalMonthlySavings, totalAnnualSavings, totalCurrentSpend, input, recommendations } = audit;

  if (totalMonthlySavings === 0) {
    return `Your ${input.teamSize}-person team is spending $${totalCurrentSpend}/month on AI tools and doing it well. The plans you've chosen are well-matched to your ${input.useCase} workflow — no obvious waste detected. As your team grows or usage patterns shift, revisit this audit to catch new optimization opportunities.`;
  }

  const topSaving = [...recommendations].sort((a, b) => b.monthlySavings - a.monthlySavings)[0];
  return `Your ${input.teamSize}-person team is spending $${totalCurrentSpend}/month on AI tools, but $${totalMonthlySavings} of that is recoverable. The biggest opportunity is ${topSaving.toolName}: ${topSaving.reason.split('.')[0]}. Across all your tools, the recommended changes would bring your monthly spend to $${audit.totalProjectedSpend} — that's $${totalAnnualSavings} back in the budget annually without any meaningful capability loss.`;
}

export async function generateAISummary(audit: Omit<AuditResult, 'aiSummary'>): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return fallbackSummary(audit);
  }

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: buildPrompt(audit),
        },
      ],
    });

    const text = message.content[0];
    if (text.type === 'text') {
      return text.text.trim();
    }
    return fallbackSummary(audit);
  } catch (error) {
    console.error('Anthropic API error, using fallback summary:', error);
    return fallbackSummary(audit);
  }
}
