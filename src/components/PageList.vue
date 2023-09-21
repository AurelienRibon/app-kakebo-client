<!-- ----------------------------------------------------------------------- -->
<!-- TEMPLATE -->
<!-- ----------------------------------------------------------------------- -->

<template>
  <div class="list-container" :class="{ centered: empty }">
    <div v-if="empty" class="panel-empty">
      <div class="label">Aucune dépense enregistrée</div>
      <div class="symbol mdi mdi-piggy-bank"></div>
    </div>

    <template v-else>
      <header>
        <div class="icon mdi mdi-eye"></div>
        <select v-model="view">
          <option value="last3Months">les 3 derniers mois</option>
          <option value="future">les dépenses à venir</option>
          <option v-for="item in views" :key="item">{{ item }}</option>
        </select>
      </header>

      <header>
        <div class="icon mdi mdi-check"></div>
        <select v-model="showChecked">
          <option :value="true">montrer les valeurs pointées</option>
          <option :value="false">cacher les valeurs pointées</option>
        </select>
      </header>

      <div v-for="group of expensesToShowByDay" :key="group[0]" class="expense-group">
        <div class="expense-group-title">
          <span>{{ formatGroupDate(group[0]) }}</span>
          <span class="spacer"></span>
          <span class="sum">{{ formatExpensesSum(group[1]) }}€</span>
        </div>

        <div
          v-for="expense of group[1]"
          :key="expense.date.toISOString()"
          class="expense-item"
          :class="{ 'expense-item-checked': expense.checked }"
        >
          <div class="expense-item-category">
            <span class="mdi" :class="getExpenseIcon(expense)"></span>
            <span>{{ expense.category }}</span>
            <span v-if="expense.isRecurring()" class="mdi mdi-refresh"></span>
            <span v-if="expense.isMirrorOrigin()" class="mdi mdi-ghost-outline"></span>
          </div>
          <div class="expense-item-label">{{ expense.label }}</div>
          <div class="expense-item-amount" :class="{ 'expense-item-positive': expense.amount >= 0 }">
            {{ formatExpenseAmount(expense) }}€
          </div>
          <div v-ripple v-tap class="expense-item-action" @tap="edit(expense)">
            <i class="mdi mdi-pencil"></i>
          </div>
          <div v-ripple v-tap class="expense-item-action" @tap="check(expense)">
            <i class="mdi mdi-check-bold"></i>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<!-- ----------------------------------------------------------------------- -->
<!-- CODE -->
<!-- ----------------------------------------------------------------------- -->

<script lang="ts">
  import { computed, defineComponent, PropType, Ref, ref, watchEffect } from 'vue';
  import { formatAmount } from '../lib/amounts';
  import { getCategoryDef } from '../lib/categories';
  import { extractExpensesMonths, injectExpensesMirrors } from '../lib/expenses';
  import { formatDateToDayHuman } from '../lib/dates';
  import {
    filterExpensesOfLastMonths,
    filterExpensesOfMonth,
    filterFutureExpenses,
    groupExpensesByDay,
    sumNegativeExpenses,
  } from '../lib/stats';
  import { config } from '../models/config';
  import { Expense } from '../models/expense';

  export default defineComponent({
    props: {
      expenses: {
        type: Array as PropType<Expense[]>,
        required: true,
      },
    },

    emits: ['edit', 'check'],

    setup(props, { emit }) {
      const expensesToShow = ref([]) as Ref<Expense[]>;
      const expensesToShowByDay = computed(() => groupExpensesByDay(injectExpensesMirrors(expensesToShow.value)));
      const empty = computed(() => props.expenses.length === 0);
      const view = ref(config.view);
      const showChecked = ref(true);
      const views = extractExpensesMonths(props.expenses);

      watchEffect(() => {
        config.view = view.value;
      });

      watchEffect(() => {
        const expensesToConsider = showChecked.value ? props.expenses : props.expenses.filter((it) => !it.checked);

        if (view.value === 'last3Months') {
          expensesToShow.value = filterExpensesOfLastMonths(expensesToConsider, 3);
        } else if (view.value === 'future') {
          expensesToShow.value = filterFutureExpenses(expensesToConsider);
        } else {
          expensesToShow.value = filterExpensesOfMonth(expensesToConsider, new Date(view.value));
        }
      });

      return {
        expensesToShowByDay,
        empty,
        view,
        views,
        showChecked,
        edit,
        check,
        formatExpenseAmount,
        formatExpensesSum,
        formatGroupDate,
        getExpenseIcon,
      };

      function edit(expense: Expense): void {
        emit('edit', expense);
      }

      function check(expense: Expense): void {
        emit('check', expense);
      }

      function formatExpenseAmount(expense: Expense): string {
        return formatAmount(expense.amount);
      }

      function formatExpensesSum(expenses: Expense[]): string {
        const expensesToSum = expenses.filter((it) => !it.isMirrorOrigin() || it.isExceptional());
        return formatAmount(sumNegativeExpenses(expensesToSum));
      }

      function formatGroupDate(date: string): string {
        return formatDateToDayHuman(new Date(date));
      }

      function getExpenseIcon(expense: Expense): string {
        return getCategoryDef(expense.category).icon;
      }
    },
  });
</script>

<!-- ----------------------------------------------------------------------- -->
<!-- STYLE -->
<!-- ----------------------------------------------------------------------- -->

<style lang="scss" scoped>
  @import '../theme.scss';

  header {
    display: flex;
    align-items: center;
    margin-bottom: 5px;

    .icon {
      margin-right: 10px;
    }

    select {
      flex: 1;
      padding: 2px 10px;

      border-radius: 6px;
      outline: none;
      font-size: 1em;
      background-color: $text;
      color: $background1;

      &[inputmode='numeric'] {
        text-align: right;
        caret-color: $text;
      }
    }
  }

  .list-container {
    @include padded;

    &.centered {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
  }

  .panel-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #909090;

    .label {
      font-size: 2em;
      text-align: center;
    }

    .symbol {
      font-size: 8em;
    }
  }

  .expense-group {
    margin-bottom: 30px;
    padding-top: 20px;
    border-top: 1px solid $border1;

    &:first-of-type {
      border-top: 0;
    }
  }

  .expense-group-title {
    display: flex;
    align-items: baseline;

    margin-bottom: 10px;
    font-size: 1.8em;
    font-weight: 100;

    .spacer {
      flex: 1;
    }

    .sum {
      font-size: 0.5em;
      color: $text-faint;
    }
  }

  .expense-item {
    display: flex;
    align-items: center;
    margin: 6px 0px;
  }

  .expense-item-data {
    display: flex;
    align-items: center;
    flex: 1;
  }

  .expense-item-actions {
    display: flex;
    align-items: center;
  }

  .expense-item-label {
    flex: 1;
    margin: 0 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .expense-item-amount {
    font-weight: bold;

    &.expense-item-positive {
      color: $accent1;
    }
  }

  .expense-item-action {
    padding: 6px 8px;
    margin: -6px -8px;
    margin-left: 0px;
    color: #a5a5a5;
  }

  .expense-item-category {
    padding: 2px 6px;
    border-radius: 20px;
    font-size: 0.9em;
    color: $background1;
    background-color: $text;

    & > span:first-of-type {
      margin-right: 2px;
    }
  }

  .expense-item-checked {
    background-image: repeating-linear-gradient(45deg, #5d5d5d, #5d5d5d 20px, #4c4c4c 20px, #4c4c4c 40px);
  }
</style>
