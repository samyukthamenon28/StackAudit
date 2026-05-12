# StackSavvy — AI Cost Intelligence for Dev Teams

StackSavvy is a free web app that audits your AI tool subscriptions and identifies where you're overspending. Enter your tools, plans, and team size; get an instant breakdown of what to keep, downgrade, switch, or cancel — with dollar savings per tool and a shareable public URL.

Built for engineering leads and CTOs at Series A–C startups who suspect they're over-paying for AI tools but don't have time to audit pricing pages manually.

**Live app:** https://stacksavvy.vercel.app

---

## Screenshots

> Add screenshots to `/docs/screenshots/` or link a Loom walkthrough here.

---

## Quick Start

### Prerequisites
- Node.js 18+
- Supabase project (free tier works)
- Resend account for email (optional)
- Anthropic API key for AI summaries (optional — falls back to templates)

### Local development

```bash
git clone https://github.com/your-username/stacksavvy
cd stacksavvy
npm install
cp .env.example .env.local
# Fill in .env.local with your keys
npm run dev
```

### Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ANTHROPIC_API_KEY=sk-ant-...
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com
NEXT_PUBLIC_BASE_URL=https://your-deployment.vercel.app
```

### Supabase setup

```sql
CREATE TABLE audits (
  id TEXT PRIMARY KEY,
  input JSONB NOT NULL,
  recommendations JSONB NOT NULL,
  total_current_spend NUMERIC NOT NULL,
  total_projected_spend NUMERIC NOT NULL,
  total_monthly_savings NUMERIC NOT NULL,
  total_annual_savings NUMERIC NOT NULL,
  ai_summary TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id TEXT REFERENCES audits(id),
  email TEXT NOT NULL,
  company_name TEXT,
  role TEXT,
  team_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Deploy

```bash
npx vercel --prod
```

---

## Decisions

1. **Next.js App Router over plain React SPA** — SSR makes the share page OG tags work without a separate layer. Trade-off: more complexity than Vite SPA, but OG tags are core to the viral mechanic.

2. **Hardcoded audit rules, not LLM logic** — Pricing logic must be auditable by a finance person. LLM could hallucinate plan prices. AI is used only for prose summary, which is subjective and recoverable on failure.

3. **In-memory rate limiting over Redis** — Redis adds infra cost for what is a simple abuse prevention layer. Cold-start resets are acceptable for MVP traffic patterns.

4. **Supabase over Firebase** — Real Postgres backend enables proper relational queries for lead-to-audit conversion analysis later.

5. **Honeypot + rate limit over hCaptcha** — hCaptcha adds 200ms+ render time and hurts Lighthouse. Honeypot + IP rate limit catches 95% of bot abuse with zero UX friction.
