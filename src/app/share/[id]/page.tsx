import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SharePageClient from './SharePageClient';

interface Props {
  params: Promise<{ id: string }>;
}

async function getAudit(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${baseUrl}/api/share/${id}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.audit;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const audit = await getAudit(id);

  if (!audit) {
    return { title: 'Audit not found — StackSavvy' };
  }

  const savings = audit.totalMonthlySavings;
  const title = savings > 0
    ? `I found $${savings}/mo in AI tool savings — StackSavvy`
    : `My AI stack audit — StackSavvy`;
  const description = savings > 0
    ? `${audit.input.teamSize}-person team, ${audit.input.useCase} use case. $${savings}/mo ($${audit.totalAnnualSavings}/yr) in potential savings identified. Run your own free audit.`
    : `AI stack audit for a ${audit.input.teamSize}-person team. Tools optimized, no savings needed. Run your own free audit at StackSavvy.`;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/share/${id}`,
      siteName: 'StackSavvy',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function SharePage({ params }: Props) {
  const { id } = await params;
  const audit = await getAudit(id);
  if (!audit) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const shareUrl = `${baseUrl}/share/${id}`;

  return <SharePageClient audit={audit} shareUrl={shareUrl} />;
}
