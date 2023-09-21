import { Ref, ref } from 'vue';
import { Preferences } from '@capacitor/preferences';
import { Expense, ExpenseSpec } from '../models/expense';
import { createExpenseFromJSON, createExpensesFromJSONs, ExpenseJSON, sortExpenses } from '../lib/expenses';
import { logError, logInfo } from '../lib/logs';

type DbExpensesSyncResult = { expenses: ExpenseJSON[] };

class Store {
  private _expensesFull = ref([]) as Ref<Expense[]>;
  private _expenses = ref([]) as Ref<Expense[]>;
  private _loading = ref(false);
  private _version = 1;

  get expenses(): Ref<Expense[]> {
    return this._expenses;
  }

  get loading(): Ref<boolean> {
    return this._loading;
  }

  get version(): number {
    return this._version;
  }

  addExpense(spec: ExpenseSpec): void {
    const expense = new Expense(spec);
    this._expensesFull.value.push(expense);
    this.refreshExpenses();
  }

  refreshExpenses(): void {
    this._expenses.value = this._expensesFull.value.filter((it) => !it.deleted);
    sortExpenses(this._expenses.value);
  }

  async loadAndSync(): Promise<void> {
    await this.load();
    this.sync();
  }

  async saveAndSync(): Promise<void> {
    await this.save();
    this.sync();
  }

  async load(): Promise<void> {
    logInfo('Loading expenses from store...');

    try {
      const { value } = await Preferences.get({ key: 'data' });
      const spec = value ? JSON.parse(value) : { expenses: [] };
      const specExpenses = spec.expenses as ExpenseJSON[];
      this._setExpenses(createExpensesFromJSONs(specExpenses));
    } catch (err) {
      logError(err);
      this._setExpenses([]);
    }
  }

  async save(): Promise<void> {
    const value = JSON.stringify({
      expenses: this._expensesFull.value.map((it) => it.serialize()),
      version: this._version,
    });

    await Preferences.set({ key: 'data', value });
  }

  async sync() {
    logInfo('Synchronizing expenses...');

    this._loading.value = true;

    try {
      const changed = await this._syncExpenses();
      if (changed) {
        await this.save();
      }
    } catch (err) {
      logError(err);
    }

    this._loading.value = false;
  }

  // Internal API
  // ---------------------------------------------------------------------------

  private async _syncExpenses() {
    const syncResult = await syncExpensesWithDB(this._expensesFull.value);
    if (!syncResult) {
      return;
    }

    let changed = false;

    if (syncResult.expenses.length > 0) {
      this._upsertExpenseJSONs(syncResult.expenses);
      changed = true;
    }

    return changed;
  }

  private _upsertExpenseJSONs(jsons: ExpenseJSON[]): void {
    logInfo('Creating expenses from jsons...');

    const knownExpensesById = new Map(this._expensesFull.value.map((it) => [it.id, it]));

    for (const json of jsons) {
      try {
        const expense = createExpenseFromJSON(json);
        knownExpensesById.set(expense.id, expense);
      } catch (err) {
        logError(err);
      }
    }

    this._setExpenses(Array.from(knownExpensesById.values()));
  }

  private _setExpenses(expenses: Expense[]): void {
    this._expensesFull.value = expenses;
    this.refreshExpenses();
  }
}

export const store = new Store();

// -----------------------------------------------------------------------------
// DB SYNC
// -----------------------------------------------------------------------------

async function syncExpensesWithDB(expenses: Expense[]): Promise<DbExpensesSyncResult | undefined> {
  const body = JSON.stringify({
    route: '/expenses/sync',
    expenses: expenses.map((it) => it.serialize()),
  });

  const headers = { 'Content-Type': 'application/json' };
  const prod = process.env.NODE_ENV === 'production';
  const url = prod
    ? 'https://gv3on4rtym5vnqsf3tzhehnwtm0mzhjy.lambda-url.eu-west-3.on.aws'
    : 'https://zvpzxxtfmapliyof443jlb7i6a0aqrna.lambda-url.eu-west-3.on.aws';

  logInfo('Fetching remote...');
  const res = await fetch(url, { method: 'POST', headers, body });

  if (!res.ok) {
    logInfo(`Request failed with status ${res.status} (${res.statusText}).`);
    logInfo(await res.text());
    return;
  }

  logInfo('Fetch success!');
  return res.json();
}
