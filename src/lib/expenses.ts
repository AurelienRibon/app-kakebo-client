import { isExpensePeriodicityValid } from './expense-periodicities';
import { str } from './utils';
import { Expense } from '../models/expense';
import { formatDateToMonth, getStartOfMonthDate, isDateOnFirstDayOfMonth } from './dates';

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

export type ExpenseJSON = Record<string, unknown>;

// -----------------------------------------------------------------------------
// CRUD
// -----------------------------------------------------------------------------

export function createExpenseFromJSON(spec: ExpenseJSON): Expense {
  const _id = typeof spec._id === 'string' ? spec._id : undefined;
  const date = typeof spec.date === 'string' ? new Date(spec.date) : undefined;
  const amount = typeof spec.amount === 'number' ? spec.amount : undefined;
  const category = typeof spec.category === 'string' ? spec.category : undefined;

  if (date === undefined || !date.toJSON() || amount === undefined || category === undefined) {
    throw new Error(`Invalid expense specification: ${str(spec)}`);
  }

  const label = typeof spec.label === 'string' ? spec.label : undefined;
  const periodicity = isExpensePeriodicityValid(spec.periodicity) ? spec.periodicity : undefined;
  const deleted = typeof spec.deleted === 'boolean' ? spec.deleted : undefined;
  const checked = typeof spec.checked === 'boolean' ? spec.checked : undefined;
  const updatedAt = typeof spec.updatedAt === 'string' ? new Date(spec.updatedAt) : undefined;

  return new Expense({ _id, date, amount, category, label, periodicity, deleted, checked, updatedAt });
}

export function createExpensesFromJSONs(specs: ExpenseJSON[]): Expense[] {
  const expenses = specs.map(createExpenseFromJSON);
  sortExpenses(expenses);
  return expenses;
}

// -----------------------------------------------------------------------------
// MIRRORS
// -----------------------------------------------------------------------------

export function injectExpensesMirrors(expenses: Expense[]): Expense[] {
  const newExpenses = expenses.slice();
  const recurringExpenses = expenses.filter((it) => it.isRecurring());

  for (const expense of recurringExpenses) {
    if (!isDateOnFirstDayOfMonth(expense.date)) {
      const mirrorDate = getStartOfMonthDate(expense.date);
      const mirror = expense.duplicate({ date: mirrorDate });
      mirror.setMirrorOf(expense);

      const index = newExpenses.findIndex((it) => new Date(it.date) > mirrorDate);
      newExpenses.splice(index, 0, mirror);
    }
  }

  sortExpenses(newExpenses);
  return newExpenses;
}

// -----------------------------------------------------------------------------
// MISC
// -----------------------------------------------------------------------------

export function extractExpensesLabels(expenses: Expense[], category: string): string[] {
  const counts = new Map() as Map<string, number>;

  for (const expense of expenses) {
    if (expense.label && expense.category === category) {
      const count = counts.get(expense.label) || 0;
      counts.set(expense.label, count + 1);
    }
  }

  return Array.from(counts.entries())
    .sort((a, b) => a[1] - b[1])
    .map((it) => it[0]);
}

export function extractExpensesMonths(expenses: Expense[]): string[] {
  const months = new Set<string>();

  for (const expense of expenses) {
    months.add(formatDateToMonth(expense.date));
  }

  return [...months].sort((a, b) => b.localeCompare(a));
}

export function sortExpenses(expenses: Expense[]): void {
  expenses.sort(compareExpenses);
}

function compareExpenses(e1: Expense, e2: Expense): number {
  return e2.date.getTime() - e1.date.getTime();
}
