import { Preferences } from '@capacitor/preferences';
import { Ref, ref } from 'vue';
import { ExpenseJSON, createExpenseFromJSON, createExpensesFromJSONs, sortExpenses } from '../lib/expenses';
import { logError, logInfo } from '../lib/logs';
import { retry } from '../lib/utils';
import { Expense, ExpenseSpec } from '../models/expense';

type DbExpensesSyncResult = { expenses: ExpenseJSON[] };

class Store {
  #expensesDB = [] as Expense[];
  #expenses = ref([]) as Ref<Expense[]>;
  #loading = ref(false);
  #version = 1;

  // Accessors
  // ---------------------------------------------------------------------------

  get expensesDB(): Expense[] {
    return this.#expensesDB;
  }

  get expenses(): Ref<Expense[]> {
    return this.#expenses;
  }

  get loading(): Ref<boolean> {
    return this.#loading;
  }

  get version(): number {
    return this.#version;
  }

  // API
  // ---------------------------------------------------------------------------

  addExpense(spec: ExpenseSpec): void {
    const expense = new Expense(spec);
    this.#expensesDB.push(expense);
    this.refreshExpenses();
  }

  refreshExpenses(): void {
    this.#expenses.value = this.#expensesDB.filter((it) => !it.deleted);
  }

  async loadAndSync(): Promise<void> {
    await this.load();
    await this.sync();
  }

  async saveAndSync(): Promise<void> {
    await this.save();
    await this.sync();
  }

  async load(): Promise<void> {
    logInfo('Loading expenses from store...');

    try {
      const { value } = await Preferences.get({ key: 'data' });
      const json = value ? JSON.parse(value) : { expenses: [] };
      const jsonExpenses = json.expenses as ExpenseJSON[];
      this.#setExpensesDB(createExpensesFromJSONs(jsonExpenses));
    } catch (err) {
      logError(err);
      this.#setExpensesDB([]);
    }
  }

  async save(): Promise<void> {
    logInfo('Saving expenses to store...');

    const expensesJsons = this.#expensesDB.map((it) => it.serialize());
    const value = JSON.stringify({ expenses: expensesJsons, version: this.#version });
    await Preferences.set({ key: 'data', value });
  }

  async sync() {
    logInfo('Synchronizing expenses...');

    this.#loading.value = true;

    try {
      const json = await this.#postSync();

      if (json && json.expenses.length > 0) {
        this.#upsertExpenses(json.expenses);
        await this.save();
      }
    } catch (err) {
      logError(err);
    }

    this.#loading.value = false;
  }

  // Internal API
  // ---------------------------------------------------------------------------

  #upsertExpenses(jsons: ExpenseJSON[]): void {
    logInfo(`Creating expenses from ${jsons.length} jsons...`);

    const knownExpensesById = new Map(this.#expensesDB.map((it) => [it.id, it]));

    for (const json of jsons) {
      try {
        const expense = createExpenseFromJSON(json);
        knownExpensesById.set(expense.id, expense);
      } catch (err) {
        logError(err);
      }
    }

    const allExpenses = [...knownExpensesById.values()];
    this.#setExpensesDB(allExpenses);
  }

  #setExpensesDB(expenses: Expense[]): void {
    logInfo(`Setting expensesDB to ${expenses.length} expenses...`);

    sortExpenses(expenses);
    this.#expensesDB = expenses;
    this.refreshExpenses();
  }

  // Server requests
  // ---------------------------------------------------------------------------

  async #postSync(): Promise<DbExpensesSyncResult | undefined> {
    const expensesJsons = this.#expensesDB.map((it) => it.serialize());
    const body = JSON.stringify({ expenses: expensesJsons });

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
    const json = await res.json();
    return json;
  }
}

export const store = new Store();

// @ts-ignore
window.store = store;
