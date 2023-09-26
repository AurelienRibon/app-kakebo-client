import { formatDateToDay, isDateOnFirstDayOfMonth } from '../lib/dates';
import { ExpensePeriodicity } from '../lib/expense-periodicities';
import { guid } from '../lib/utils';
import { getCategoryDef } from '../lib/categories';

export interface ExpenseSpec {
  _id?: string;
  date?: Date;
  amount?: number;
  category?: string;
  label?: string;
  periodicity?: ExpensePeriodicity;
  deleted?: boolean;
  checked?: boolean;
  updatedAt?: Date;
}

export class Expense {
  private _id: string;
  private _date: Date;
  private _amount: number;
  private _category: string;
  private _label: string;
  private _periodicity: ExpensePeriodicity;
  private _deleted: boolean;
  private _checked: boolean;
  private _updatedAt: Date;
  private _mirror: Expense | undefined;

  constructor(spec: ExpenseSpec = {}) {
    this._id = spec._id ?? guid();
    this._date = spec.date ?? new Date();
    this._amount = spec.amount ?? 0;
    this._category = spec.category ?? 'unknown';
    this._label = spec.label ?? '';
    this._periodicity = spec.periodicity ?? 'one-time';
    this._deleted = spec.deleted ?? false;
    this._checked = spec.checked ?? false;
    this._updatedAt = spec.updatedAt ?? new Date();
  }

  // Getters
  // ---------------------------------------------------------------------------

  get id(): string {
    return this._id;
  }

  get date(): Date {
    return this._date;
  }

  get amount(): number {
    return this._amount;
  }

  get category(): string {
    return this._category;
  }

  get label(): string {
    return this._label;
  }

  get periodicity(): ExpensePeriodicity {
    return this._periodicity;
  }

  get deleted(): boolean {
    return this._deleted;
  }

  get checked(): boolean {
    return this._checked;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Convenience
  // ---------------------------------------------------------------------------

  isMirrorGhost(): boolean {
    return !!this._mirror && isDateOnFirstDayOfMonth(this.date);
  }

  isMirrorOrigin(): boolean {
    return !!this._mirror && !isDateOnFirstDayOfMonth(this.date);
  }

  isRecurring(): boolean {
    return this.periodicity !== 'one-time';
  }

  isExceptional(): boolean {
    return getCategoryDef(this.category).exceptional ?? false;
  }

  getSign(): string {
    return this.amount > 0 ? '+' : '-';
  }

  // Mutations
  // ---------------------------------------------------------------------------

  setMirrorOf(expense: Expense): void {
    this._mirror = expense;
    expense._mirror = this;
  }

  edit(changes: ExpenseSpec): void {
    const target = (this.isMirrorGhost() && this._mirror) || this;

    for (const [key, value] of Object.entries(changes)) {
      // prettier-ignore
      switch (key) {
        case 'date': target._date = value; break;
        case 'amount': target._amount = value; break;
        case 'category': target._category = value; break;
        case 'label': target._label = value; break;
        case 'periodicity': target._periodicity = value; break;
        case 'deleted': target._deleted = value; break;
        case 'checked': target._checked = value; break;
      }

      target._updatedAt = new Date();
    }
  }

  // Misc
  // ---------------------------------------------------------------------------

  duplicate(changes: ExpenseSpec): Expense {
    const expense = new Expense({
      date: this.date,
      amount: this.amount,
      category: this.category,
      label: this.label,
      periodicity: this.periodicity,
      deleted: this.deleted,
      checked: this.checked,
    });

    if (changes) {
      expense.edit(changes);
    }

    return expense;
  }

  serialize(): Record<string, unknown> {
    return {
      _id: this._id,
      date: formatDateToDay(this.date),
      amount: this.amount,
      category: this.category,
      label: this.label,
      periodicity: this.periodicity,
      deleted: this.deleted,
      checked: this.checked,
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
