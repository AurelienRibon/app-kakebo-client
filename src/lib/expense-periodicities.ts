const PERIODICITIES = ['one-time', 'monthly'] as const;

export type ExpensePeriodicity = (typeof PERIODICITIES)[number];

export function isExpensePeriodicityValid(value: unknown): value is ExpensePeriodicity {
  return typeof value === 'string' && (PERIODICITIES as readonly string[]).includes(value);
}
