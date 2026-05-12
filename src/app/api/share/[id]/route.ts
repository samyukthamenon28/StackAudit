import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  try {
    const db = getServiceClient();
    const { data, error } = await db
      .from('audits')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
    }

    // Strip PII from public version
    const publicAudit = {
      id: data.id,
      input: {
        tools: data.input.tools,
        teamSize: data.input.teamSize,
        useCase: data.input.useCase,
        // email stripped
      },
      recommendations: data.recommendations,
      totalCurrentSpend: data.total_current_spend,
      totalProjectedSpend: data.total_projected_spend,
      totalMonthlySavings: data.total_monthly_savings,
      totalAnnualSavings: data.total_annual_savings,
      aiSummary: data.ai_summary,
      createdAt: data.created_at,
    };

    return NextResponse.json({ audit: publicAudit });
  } catch (err) {
    console.error('Share fetch error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
