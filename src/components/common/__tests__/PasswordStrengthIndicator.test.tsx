import { evaluatePasswordStrength } from '../PasswordStrengthIndicator';

describe('PasswordStrengthIndicator & Validation Logic', () => {
  test('evaluates empty password as invalid and score 0', () => {
    const res = evaluatePasswordStrength('');
    expect(res.score).toBe(0);
    expect(res.isValid).toBe(false);
  });

  test('evaluates short password as invalid', () => {
    const res = evaluatePasswordStrength('Ab1!');
    expect(res.isValid).toBe(false);
    expect(res.rules.find((r) => r.key === 'minLen')?.valid).toBe(false);
  });

  test('evaluates password without uppercase as invalid', () => {
    const res = evaluatePasswordStrength('shema12345');
    expect(res.isValid).toBe(false);
    expect(res.rules.find((r) => r.key === 'upper')?.valid).toBe(false);
  });

  test('evaluates password without number as invalid', () => {
    const res = evaluatePasswordStrength('ShemaHubert!');
    expect(res.isValid).toBe(false);
    expect(res.rules.find((r) => r.key === 'number')?.valid).toBe(false);
  });

  test('evaluates strong password satisfying all criteria as valid', () => {
    const res = evaluatePasswordStrength('Rwanda2026!');
    expect(res.isValid).toBe(true);
    expect(res.score).toBeGreaterThanOrEqual(3);
    expect(res.rules.every((r) => r.valid)).toBe(true);
  });
});
