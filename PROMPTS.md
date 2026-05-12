# Prompts

## AI Summary Prompt

Used in `src/lib/ai-summary.ts` to generate the personalized ~100-word audit summary.

### Final prompt (in production)

```
You are a pragmatic AI cost analyst writing a personalized audit summary for a software team.

Team context:
- Team size: {teamSize} people
- Primary use case: {useCase}
- Total current AI spend: ${totalCurrentSpend}/month
- Total potential savings: ${totalMonthlySavings}/month (${totalAnnualSavings}/year)

Tool breakdown:
{toolList}

Write a ~100-word personalized summary paragraph. Be direct and specific. Name the biggest saving opportunity first. Use plain English — no bullet points, no headers, no markdown. Speak directly to the team lead reading this. Reference their actual use case and tools. End with the annual savings figure as the punchline. Do not include generic disclaimers or filler phrases like "it's important to note."
```

### Why this prompt works

- **Persona framing** ("pragmatic AI cost analyst") prevents the model from being sycophantic or hedging. Without it, early versions started with "Great news!" and were full of filler.
- **Explicit constraints** ("no bullet points, no markdown") prevent the model from formatting differently than the UI expects. The output is injected raw into a `<p>` tag.
- **"End with the annual savings figure"** is the most important instruction — the annual number is the punchline that makes people screenshot. Without this constraint, the model buried the annual savings or omitted it.
- **"Do not include generic disclaimers"** was added after the model kept adding "of course, individual results may vary" and similar filler in early iterations.

### What didn't work

**Version 1** — System prompt only, no user message:
```
Write a 100-word summary of this AI tool audit.
```
Result: Generic, didn't reference actual tools, felt like a template. No personality.

**Version 2** — Too much formatting freedom:
```
Summarize the audit in a short paragraph suitable for an email.
```
Result: Model used bullet points half the time, markdown formatting the other half. Inconsistent output broke the UI.

**Version 3** — Asking for multiple paragraphs:
```
Write 2-3 sentences summarizing the findings, then a recommendation paragraph.
```
Result: Too long, broke the UI card. Users didn't read past the first sentence.

### Fallback behavior

If the Anthropic API fails (network error, rate limit, missing key), the code falls back to a deterministic template string that:
- References the team size and use case
- Names the top saving opportunity by toolName
- Includes the annual savings figure

The fallback is indistinguishable from the AI output in most cases. This was a deliberate design choice — the audit math is the product; the prose summary is polish.
