import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'StackSavvy — AI Cost Audit for Dev Teams',
  description: 'Find out what your AI stack is really costing you. Enter your tools, get instant savings recommendations. Free, no login required.',
  openGraph: {
    title: 'StackSavvy — AI Cost Audit for Dev Teams',
    description: 'Find out what your AI stack is really costing you. Free instant audit.',
    siteName: 'StackSavvy',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StackSavvy — AI Cost Audit for Dev Teams',
    description: 'Find out what your AI stack is really costing you. Free instant audit.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
