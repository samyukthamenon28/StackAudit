# Tests

All tests are in `audit-engine.test.ts` at the repo root.

## Running tests

```bash
npm test
# or
npx jest
```

## Test coverage

### `audit-engine.test.ts`

| Test | What it covers |
|------|---------------|
| Cursor Business downgrade for small team | `auditCursor()` recommends downgrade from Business ($40/seat) to Pro ($20/seat) when team < 5. Verifies exact $40 monthly savings on 2 seats. |
| Claude Team minimum seat enforcement | `auditClaude()` flags Team plan when seats < 5, recommends Pro at $20/seat. Verifies $30 savings on 3-seat team. |
| Duplicate chat tool overlap detection | `detectOverlap()` marks the more expensive of two chat tools (Claude + ChatGPT) as `cancel`. Verifies totalMonthlySavings > 0. |
| Well-optimized stack returns zero savings | Single Cursor Pro user gets `keep` recommendation and $0 savings — confirms we don't manufacture false savings. |
| GitHub Copilot Business downgrade for solo user | `auditGithubCopilot()` recommends Individual ($10) over Business ($19) for 1 seat. Verifies $9 savings. |
| Annual savings = 12x monthly | `totalAnnualSavings === totalMonthlySavings * 12` across a multi-tool audit. |
| Dual IDE tools flagged as redundant | `detectOverlap()` catches Cursor + Windsurf running in parallel, marks one as `cancel`. |
| Total current spend sums correctly | Three tools with different spends (20 + 20 + 150) sum to exactly 190. |

## CI

Tests run on every push to `main` via `.github/workflows/ci.yml`.
