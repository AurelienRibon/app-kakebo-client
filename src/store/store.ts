import { Preferences } from '@capacitor/preferences';
import { Ref, ref } from 'vue';
import { ExpenseJSON, createExpenseFromJSON, createExpensesFromJSONs, sortExpenses } from '../lib/expenses';
import { logError, logInfo } from '../lib/logs';
import { retry } from '../lib/utils';
import { Expense, ExpenseSpec } from '../models/expense';

type DbExpensesSyncResult = { expenses: ExpenseJSON[] };

class Store {
  #expensesAll = ref([]) as Ref<Expense[]>;
  #expenses = ref([]) as Ref<Expense[]>;
  #loading = ref(false);
  #version = 1;

  get expenses(): Ref<Expense[]> {
    return this.#expenses;
  }

  get loading(): Ref<boolean> {
    return this.#loading;
  }

  get version(): number {
    return this.#version;
  }

  addExpense(spec: ExpenseSpec): void {
    const expense = new Expense(spec);
    this.#expensesAll.value.push(expense);
    this.refreshExpenses();
  }

  refreshExpenses(): void {
    this.#expenses.value = this.#expensesAll.value.filter((it) => !it.deleted);
    sortExpenses(this.#expenses.value);
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
      this.#setExpenses(createExpensesFromJSONs(specExpenses));
    } catch (err) {
      logError(err);
      this.#setExpenses([]);
    }
  }

  async save(): Promise<void> {
    const value = JSON.stringify({
      expenses: this.#expensesAll.value.map((it) => it.serialize()),
      version: this.#version,
    });

    await Preferences.set({ key: 'data', value });
  }

  async sync() {
    logInfo('Synchronizing expenses...');

    this.#loading.value = true;

    try {
      const changed = await this.#syncExpenses();
      if (changed) {
        await this.save();
      }
    } catch (err) {
      logError(err);
    }

    this.#loading.value = false;
  }

  // Internal API
  // ---------------------------------------------------------------------------

  async #syncExpenses() {
    const syncResult = await this.#postSync(this.#expensesAll.value);
    if (!syncResult) {
      return;
    }

    let changed = false;

    if (syncResult.expenses.length > 0) {
      this.#upsertExpenseJSONs(syncResult.expenses);
      changed = true;
    }

    return changed;
  }

  #upsertExpenseJSONs(jsons: ExpenseJSON[]): void {
    logInfo('Creating expenses from jsons...');

    const knownExpensesById = new Map(this.#expensesAll.value.map((it) => [it.id, it]));

    for (const json of jsons) {
      try {
        const expense = createExpenseFromJSON(json);
        knownExpensesById.set(expense.id, expense);
      } catch (err) {
        logError(err);
      }
    }

    this.#setExpenses(Array.from(knownExpensesById.values()));
  }

  #setExpenses(expenses: Expense[]): void {
    this.#expensesAll.value = expenses;
    this.refreshExpenses();
  }

  // Server requests
  // ---------------------------------------------------------------------------

  async #postSync(expenses: Expense[]): Promise<DbExpensesSyncResult | undefined> {
    const body = JSON.stringify({
      route: '/expenses/sync',
      expenses: expenses.map((it) => it.serialize()),
    });

    const headers = { 'Content-Type': 'application/json' };
    const prod = process.env.NODE_ENV === 'production';
    const url = prod
      ? 'https://kakebo.aurelienribon.repl.co/expenses/sync'
      : 'https://kakebo.aurelienribon.repl.co/expenses/sync?dev=1';

    logInfo('Fetching remote...');
    const fn = () => fetch(url, { method: 'POST', headers, body });
    const res = await retry(fn);

    if (!res.ok) {
      logInfo(`Request failed with status ${res.status} (${res.statusText}).`);
      logInfo(await res.text());
      return;
    }

    logInfo('Fetch success!');
    return res.json();
  }
}

export const store = new Store();
