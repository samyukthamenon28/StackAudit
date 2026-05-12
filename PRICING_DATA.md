# Pricing Data Sources

Every number in the audit engine traces to an official vendor pricing page. Pulled week of May 5–11, 2025.

---

## Cursor

- Hobby: $0/month — https://cursor.sh/pricing — verified 2025-05-08
- Pro: $20/user/month — https://cursor.sh/pricing — verified 2025-05-08
- Business: $40/user/month — https://cursor.sh/pricing — verified 2025-05-08
- Enterprise: ~$60/user/month (estimated; contact sales) — https://cursor.sh/pricing — verified 2025-05-08

**Notes**: Pro includes 500 fast premium requests/month. Business adds SSO, privacy mode, centralized billing. The $40 vs $20 gap is the audit trigger — Business adds administrative features that only matter at scale.

---

## GitHub Copilot

- Individual: $10/user/month (or $100/year) — https://github.com/features/copilot#pricing — verified 2025-05-08
- Business: $19/user/month — https://github.com/features/copilot#pricing — verified 2025-05-08
- Enterprise: $39/user/month — https://github.com/features/copilot#pricing — verified 2025-05-08

**Notes**: Enterprise adds Copilot Knowledge Bases (custom fine-tuning on your codebase). The $39 price is only defensible when you have 20+ engineers and a workflow that actually benefits from custom model training.

---

## Claude (Anthropic)

- Free: $0/month — https://claude.ai/upgrade — verified 2025-05-08
- Pro: $20/user/month — https://claude.ai/upgrade — verified 2025-05-08
- Max (5x usage): $100/user/month — https://claude.ai/upgrade — verified 2025-05-08
- Max (20x usage): $200/user/month — https://claude.ai/upgrade — verified 2025-05-08
- Team: $30/user/month (minimum 5 seats) — https://claude.ai/upgrade — verified 2025-05-08
- Enterprise: custom pricing (~$50/user/month estimated) — https://www.anthropic.com/enterprise — verified 2025-05-08

**Notes**: Team plan 5-seat minimum is the key audit trigger. A 3-person team on Team pays for 2 ghost seats. Max plans are for individual heavy users who hit Pro limits daily.

---

## ChatGPT (OpenAI)

- Free: $0/month — https://openai.com/chatgpt/pricing/ — verified 2025-05-08
- Plus: $20/user/month — https://openai.com/chatgpt/pricing/ — verified 2025-05-08
- Team: $30/user/month (or $25 billed annually, min 2 seats) — https://openai.com/chatgpt/pricing/ — verified 2025-05-08
- Enterprise: custom (~$60/user/month estimated) — https://openai.com/chatgpt/enterprise — verified 2025-05-08

**Notes**: Team adds shared workspaces, admin controls, no data training opt-out enforced. At 2-3 seats, shared workspace value is low; individual Plus plans are more economical.

---

## Anthropic API (Direct)

- Pay-as-you-go: variable per-token billing — https://www.anthropic.com/pricing — verified 2025-05-08
  - Claude 3.7 Sonnet: $3/MTok input, $15/MTok output
  - Claude 3.5 Haiku: $0.80/MTok input, $4/MTok output

**Notes**: API is cost-effective for production workloads. For interactive chat under ~$20/month, the Pro flat rate is cheaper. The audit checks for low API spend as a downgrade signal.

---

## OpenAI API (Direct)

- Pay-as-you-go: variable per-token billing — https://openai.com/api/pricing — verified 2025-05-08
  - GPT-4o: $2.50/MTok input, $10/MTok output
  - GPT-4o mini: $0.15/MTok input, $0.60/MTok output

**Notes**: Same logic as Anthropic API — low spend suggests interactive use where ChatGPT Plus flat rate is more economical.

---

## Gemini (Google)

- Free: $0/month (Gemini 1.5 Pro, limited) — https://gemini.google.com/ — verified 2025-05-08
- Advanced / Google One AI Premium: $22/user/month — https://one.google.com/about/plans — verified 2025-05-08
- Google Workspace Business Starter + Gemini: $24/user/month — https://workspace.google.com/pricing — verified 2025-05-08
- Enterprise: ~$30/user/month — https://workspace.google.com/pricing — verified 2025-05-08

**Notes**: Gemini Advanced is bundled with Google One AI Premium (2TB Drive + other perks). The $22 price is for the whole bundle. For coding use cases, the Drive storage is irrelevant and Claude/ChatGPT have better code models at the same price.

---

## Windsurf (Codeium)

- Free: $0/month (unlimited completions, 10 Flow actions/day) — https://codeium.com/windsurf/pricing — verified 2025-05-08
- Pro: $15/user/month — https://codeium.com/windsurf/pricing — verified 2025-05-08
- Teams: $35/user/month — https://codeium.com/windsurf/pricing — verified 2025-05-08
- Enterprise: ~$60/user/month (contact sales) — https://codeium.com/windsurf/pricing — verified 2025-05-08

**Notes**: Windsurf Pro at $15/seat is $5 cheaper than Cursor Pro ($20). The Teams plan adds admin analytics — not worth the $20/seat premium for teams under 5. Free tier is unusually generous.
