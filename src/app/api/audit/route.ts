import { NextRequest, NextResponse } from 'next/server';
import { runAudit } from '@/lib/audit-engine';
import { generateAISummary } from '@/lib/ai-summary';
import { getServiceClient } from '@/lib/supabase';
import { AuditInput } from '@/types';
import { nanoid } from 'nanoid';

// Simple in-memory rate limiting (per IP, resets on cold start)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded. Try again in an hour.' }, { status: 429 });
  }

  let body: { input: AuditInput; honeypot?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Honeypot check — bots fill hidden fields
  if (body.honeypot) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  const { input } = body;

  // Validate input
  if (!input || !Array.isArray(input.tools) || input.tools.length === 0) {
    return NextResponse.json({ error: 'Invalid input: must include at least one tool' }, { status: 400 });
  }

  if (input.tools.some(t => t.monthlySpend < 0 || t.seats < 1)) {
    return NextResponse.json({ error: 'Invalid spend or seat values' }, { status: 400 });
  }

  try {
    // Run audit logic
    const auditData = runAudit(input);

    // Generate AI summary
    const aiSummary = await generateAISummary(auditData);

    const id = nanoid(10);
    const createdAt = new Date().toISOString();

    const fullAudit = { ...auditData, id, aiSummary, createdAt };

    // Store in Supabase (non-blocking — don't fail if DB is down)
    try {
      const db = getServiceClient();
      await db.from('audits').insert({
        id,
        input: auditData.input,
        recommendations: auditData.recommendations,
        total_current_spend: auditData.totalCurrentSpend,
        total_projected_spend: auditData.totalProjectedSpend,
        total_monthly_savings: auditData.totalMonthlySavings,
        total_annual_savings: auditData.totalAnnualSavings,
        ai_summary: aiSummary,
        created_at: createdAt,
      });
    } catch (dbError) {
      console.error('DB insert failed (non-fatal):', dbError);
    }

    return NextResponse.json({ audit: fullAudit });
  } catch (error) {
    console.error('Audit error:', error);
    return NextResponse.json({ error: 'Audit failed. Please try again.' }, { status: 500 });
  }
}
