import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const emailRateLimit = new Map<string, number>();

export async function POST(req: NextRequest) {
  let body: {
    email: string;
    companyName?: string;
    role?: string;
    teamSize?: number;
    auditId: string;
    monthlySavings: number;
    honeypot?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (body.honeypot) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  const { email, companyName, role, teamSize, auditId, monthlySavings } = body;

  if (!email || !email.includes('@') || !auditId) {
    return NextResponse.json({ error: 'Valid email and audit ID required' }, { status: 400 });
  }

  // Rate limit per email — 1 capture per audit
  const key = `${email}:${auditId}`;
  if (emailRateLimit.has(key)) {
    return NextResponse.json({ success: true }); // silently succeed (idempotent)
  }
  emailRateLimit.set(key, Date.now());

  try {
    const db = getServiceClient();
    await db.from('leads').insert({
      audit_id: auditId,
      email,
      company_name: companyName || null,
      role: role || null,
      team_size: teamSize || null,
    });
  } catch (err) {
    console.error('Lead storage failed:', err);
  }

  // Send confirmation email
  if (resend && process.env.RESEND_FROM_EMAIL) {
    try {
      const isHighSavings = monthlySavings >= 500;
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
        to: email,
        subject: `Your AI Stack Audit — $${monthlySavings}/mo in potential savings`,
        html: `
<!DOCTYPE html>
<html>
<body style="font-family: 'Georgia', serif; max-width: 580px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a; line-height: 1.7;">
  <div style="border-bottom: 2px solid #1a1a1a; padding-bottom: 20px; margin-bottom: 30px;">
    <h1 style="font-size: 22px; font-weight: 600; margin: 0; letter-spacing: -0.5px;">StackSavvy</h1>
    <p style="font-size: 13px; color: #666; margin: 4px 0 0;">AI Cost Intelligence</p>
  </div>

  <p>Your audit is ready.</p>

  <div style="background: #f5f5f0; border-radius: 8px; padding: 20px 24px; margin: 24px 0;">
    <p style="font-size: 13px; color: #666; margin: 0 0 4px;">Potential monthly savings</p>
    <p style="font-size: 36px; font-weight: 700; margin: 0; letter-spacing: -1px;">$${monthlySavings}</p>
    <p style="font-size: 13px; color: #666; margin: 4px 0 0;">$${monthlySavings * 12}/year</p>
  </div>

  <p>View your full audit with per-tool recommendations at:</p>
  <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/share/${auditId}" style="color: #1a1a1a; font-weight: 600;">${process.env.NEXT_PUBLIC_BASE_URL}/share/${auditId}</a></p>

  ${isHighSavings ? `
  <div style="border: 1.5px solid #1a1a1a; border-radius: 8px; padding: 20px 24px; margin: 24px 0;">
    <p style="font-weight: 600; margin: 0 0 8px;">Your savings are significant.</p>
    <p style="margin: 0; font-size: 14px;">At $${monthlySavings}/mo, a <strong>Credex consultation</strong> could surface even deeper optimization — negotiated enterprise pricing, credit stacks, and vendor alternatives your team hasn't considered. <a href="https://credex.ai?ref=stacksavvy" style="color: #1a1a1a;">Book a free call →</a></p>
  </div>
  ` : ''}

  <p style="font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; margin-top: 40px;">
    Sent by StackSavvy · <a href="https://credex.ai" style="color: #999;">Powered by Credex</a>
  </p>
</body>
</html>`,
      });
    } catch (emailErr) {
      console.error('Email send failed (non-fatal):', emailErr);
    }
  }

  return NextResponse.json({ success: true });
}
