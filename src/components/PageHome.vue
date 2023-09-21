<!-- ----------------------------------------------------------------------- -->
<!-- TEMPLATE -->
<!-- ----------------------------------------------------------------------- -->

<template>
  <div class="home-container">
    <h1>Kakeibo</h1>

    <div class="summary balance">
      <div class="label">mon solde</div>
      <div class="value" :class="{ positive: monthBalance >= 0 }">{{ monthBalanceStr }}€</div>
    </div>

    <div class="summary debits">
      <div class="label">dépenses du mois</div>
      <div class="value">{{ monthBalanceOfDebitsStr }}€</div>
      <div class="details">
        <div>
          <div class="label">ponctuelles</div>
          <div class="value">{{ monthBalanceOfOneTimeDebitsStr }}€</div>
        </div>
        <div>
          <div class="label">récurrentes</div>
          <div class="value">{{ monthBalanceOfRecurringDebitsStr }}€</div>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- ----------------------------------------------------------------------- -->
<!-- CODE -->
<!-- ----------------------------------------------------------------------- -->

<script lang="ts">
  import { computed, defineComponent, PropType, ref, watch } from 'vue';
  import { Expense } from '../models/expense';
  import { formatAmount } from '../lib/amounts';
  import { animateNumber } from '../lib/animations';
  import {
    computeBalance,
    computeBalanceOfDebits,
    computeBalanceOfOneTimeDebits,
    computeBalanceOfRecurringDebits,
    filterExpensesOfCurrentMonth,
  } from '../lib/stats';

  export default defineComponent({
    props: {
      expenses: {
        type: Array as PropType<Expense[]>,
        required: true,
      },
    },

    setup(props) {
      const standardExpenses = computed(() => props.expenses.filter((it) => !it.isExceptional()));
      const currentExpenses = computed(() => filterExpensesOfCurrentMonth(standardExpenses.value));
      const values = computeValues(currentExpenses.value);

      const monthBalance = ref(values.monthBalance);
      const monthBalanceStr = computed(() => formatAmount(monthBalance.value));

      const monthBalanceOfDebits = ref(values.monthBalanceOfDebits);
      const monthBalanceOfDebitsStr = computed(() => formatAmount(monthBalanceOfDebits.value));

      const monthBalanceOfOneTimeDebits = ref(values.monthBalanceOfOneTimeDebits);
      const monthBalanceOfOneTimeDebitsStr = computed(() => formatAmount(monthBalanceOfOneTimeDebits.value));

      const monthBalanceOfRecurringDebits = ref(values.monthBalanceOfRecurringDebits);
      const monthBalanceOfRecurringDebitsStr = computed(() => formatAmount(monthBalanceOfRecurringDebits.value));

      watch(currentExpenses, animateNumbers);
      animateNumbers();

      return {
        monthBalance,
        monthBalanceStr,
        monthBalanceOfDebits,
        monthBalanceOfDebitsStr,
        monthBalanceOfOneTimeDebits,
        monthBalanceOfOneTimeDebitsStr,
        monthBalanceOfRecurringDebits,
        monthBalanceOfRecurringDebitsStr,
      };

      function animateNumbers(): void {
        const values = computeValues(currentExpenses.value);
        animateNumber(monthBalance, values.monthBalance, 2000);
        animateNumber(monthBalanceOfDebits, values.monthBalanceOfDebits, 1800);
        animateNumber(monthBalanceOfOneTimeDebits, values.monthBalanceOfOneTimeDebits, 1600);
        animateNumber(monthBalanceOfRecurringDebits, values.monthBalanceOfRecurringDebits, 1600);
      }

      function computeValues(currentExpenses: Expense[]) {
        return {
          monthBalance: computeBalance(currentExpenses),
          monthBalanceOfDebits: computeBalanceOfDebits(currentExpenses),
          monthBalanceOfOneTimeDebits: computeBalanceOfOneTimeDebits(currentExpenses),
          monthBalanceOfRecurringDebits: computeBalanceOfRecurringDebits(currentExpenses),
        };
      }
    },
  });
</script>

<!-- ----------------------------------------------------------------------- -->
<!-- STYLE -->
<!-- ----------------------------------------------------------------------- -->

<style lang="scss" scoped>
  @import '../theme.scss';

  .home-container {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  h1 {
    font-size: 3em;
    font-weight: 200;
    margin: 30px 20px 10px 20px;

    @media #{$media-phone-small} {
      font-size: 2.4em;
      margin-top: 20px;
    }
  }

  .summary {
    padding-top: 30px;

    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 1.6em;

    &:first-of-type {
      margin-bottom: 30px;
    }

    @media #{$media-phone-small} {
      font-size: 1.4em;
    }

    .label {
      color: $text-faint;
    }

    .value {
      font-size: 1.7em;
      font-weight: 100;

      &.positive {
        color: $accent1;
      }
    }

    .details {
      width: 100%;
      margin-top: 20px;
      display: grid;
      grid-template-columns: 50% 50%;

      & > div {
        text-align: center;
      }

      .label {
        font-size: 0.7em;
      }

      .value {
        font-size: 0.9em;
      }
    }
  }
</style>
