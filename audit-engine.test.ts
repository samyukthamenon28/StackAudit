import { runAudit } from './src/lib/audit-engine';
import { AuditInput } from './src/types';

// Test 1: Cursor Business downgrade for small team
test('recommends downgrading Cursor Business to Pro for teams under 5', () => {
  const input: AuditInput = {
    tools: [{ toolId: 'cursor', plan: 'business', seats: 2, monthlySpend: 80 }],
    teamSize: 2,
    useCase: 'coding',
  };
  const result = runAudit(input);
  const rec = result.recommendations[0];
  expect(rec.recommendedAction).toBe('downgrade');
  expect(rec.monthlySavings).toBe(40); // $80 - $40 (2 seats * $20)
  expect(rec.recommendedPlan).toBe('Pro');
});

// Test 2: Claude Team minimum seat enforcement
test('flags Claude Team plan when under 5 seats', () => {
  const input: AuditInput = {
    tools: [{ toolId: 'claude', plan: 'team', seats: 3, monthlySpend: 90 }],
    teamSize: 3,
    useCase: 'writing',
  };
  const result = runAudit(input);
  const rec = result.recommendations[0];
  expect(rec.recommendedAction).toBe('downgrade');
  expect(rec.monthlySavings).toBe(30); // $90 - $60 (3 seats * $20 Pro)
});

// Test 3: Duplicate chat tools overlap detection
test('flags redundant chat tool subscriptions', () => {
  const input: AuditInput = {
    tools: [
      { toolId: 'claude', plan: 'pro', seats: 1, monthlySpend: 20 },
      { toolId: 'chatgpt', plan: 'plus', seats: 1, monthlySpend: 20 },
    ],
    teamSize: 1,
    useCase: 'writing',
  };
  const result = runAudit(input);
  const cancelRec = result.recommendations.find(r => r.recommendedAction === 'cancel');
  expect(cancelRec).toBeDefined();
  expect(result.totalMonthlySavings).toBeGreaterThan(0);
});

// Test 4: Well-optimized stack returns zero savings
test('returns zero savings for well-optimized small stack', () => {
  const input: AuditInput = {
    tools: [
      { toolId: 'cursor', plan: 'pro', seats: 1, monthlySpend: 20 },
    ],
    teamSize: 1,
    useCase: 'coding',
  };
  const result = runAudit(input);
  expect(result.totalMonthlySavings).toBe(0);
  expect(result.recommendations[0].recommendedAction).toBe('keep');
});

// Test 5: GitHub Copilot Business downgrade for solo user
test('recommends downgrading Copilot Business to Individual for 1-2 users', () => {
  const input: AuditInput = {
    tools: [{ toolId: 'github-copilot', plan: 'business', seats: 1, monthlySpend: 19 }],
    teamSize: 1,
    useCase: 'coding',
  };
  const result = runAudit(input);
  const rec = result.recommendations[0];
  expect(rec.recommendedAction).toBe('downgrade');
  expect(rec.monthlySavings).toBe(9); // $19 - $10
});

// Test 6: Annual savings = 12x monthly
test('annual savings is exactly 12x monthly savings', () => {
  const input: AuditInput = {
    tools: [
      { toolId: 'cursor', plan: 'business', seats: 2, monthlySpend: 80 },
      { toolId: 'github-copilot', plan: 'business', seats: 1, monthlySpend: 19 },
    ],
    teamSize: 2,
    useCase: 'coding',
  };
  const result = runAudit(input);
  expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12);
});

// Test 7: Dual IDE tools flagged as redundant
test('flags running two IDE tools in parallel', () => {
  const input: AuditInput = {
    tools: [
      { toolId: 'cursor', plan: 'pro', seats: 1, monthlySpend: 20 },
      { toolId: 'windsurf', plan: 'pro', seats: 1, monthlySpend: 15 },
    ],
    teamSize: 1,
    useCase: 'coding',
  };
  const result = runAudit(input);
  const cancelRec = result.recommendations.find(r => r.recommendedAction === 'cancel');
  expect(cancelRec).toBeDefined();
  expect(result.totalMonthlySavings).toBeGreaterThan(0);
});

// Test 8: Total spend calculation is correct
test('total current spend sums all tool spends', () => {
  const input: AuditInput = {
    tools: [
      { toolId: 'cursor', plan: 'pro', seats: 1, monthlySpend: 20 },
      { toolId: 'claude', plan: 'pro', seats: 1, monthlySpend: 20 },
      { toolId: 'anthropic-api', plan: 'payg', seats: 1, monthlySpend: 150 },
    ],
    teamSize: 1,
    useCase: 'coding',
  };
  const result = runAudit(input);
  expect(result.totalCurrentSpend).toBe(190);
});
