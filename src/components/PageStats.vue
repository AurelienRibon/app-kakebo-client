<!-- ----------------------------------------------------------------------- -->
<!-- TEMPLATE -->
<!-- ----------------------------------------------------------------------- -->

<template>
  <div ref="refRoot" class="stats-container">
    <h1>A propos<br />du mois</h1>

    <div class="card stat">
      <h2>dépenses journalières</h2>
      <canvas id="dailyAmountsByCategory" height="260"></canvas>
    </div>

    <div class="card stat">
      <h2>dépenses récurrentes</h2>
      <canvas id="recurringAmountsByCategory" height="260"></canvas>
    </div>

    <div class="card stat">
      <h2>solde sur le mois</h2>
      <canvas id="balanceByDay" height="260"></canvas>
    </div>

    <h1>A propos<br />de l'année</h1>

    <div class="card stat">
      <h2>économies par mois</h2>
      <canvas id="balanceByMonth" height="260"></canvas>
    </div>

    <div class="card stat">
      <h2>dépenses par mois</h2>
      <canvas id="dailyDebitsByMonth" height="460"></canvas>
    </div>

    <div class="card stat">
      <h2>solde annuel</h2>
      <canvas id="aggregatedBalanceByMonth" height="260"></canvas>
    </div>
  </div>
</template>

<!-- ----------------------------------------------------------------------- -->
<!-- CODE -->
<!-- ----------------------------------------------------------------------- -->

<script lang="ts">
  import { Chart, registerables } from 'chart.js';
  import 'chartjs-adapter-dayjs-3';
  import { defineComponent, onMounted, PropType } from 'vue';
  import { Expense } from '../models/expense';
  import { genColor } from '../lib/dom';
  import { getCategoryDefs } from '../lib/categories';
  import {
    computeAggregatedBalanceByDay,
    computeAggregatedBalanceByMonth,
    computeBalanceByMonth,
    computeDebitsByMonth,
    filterExpensesOfCurrentMonth,
    sumExpensesByCategory,
    sumExpensesByDay,
  } from '../lib/stats';

  const CHART_TEXT_COLOR = '#ededed';
  const CHART_GRID_COLOR = '#555';

  Chart.register(...registerables);
  Chart.defaults.color = CHART_TEXT_COLOR;

  const displayFormats = {
    day: 'DD',
    month: 'YYYY-MM',
  };

  export default defineComponent({
    props: {
      expenses: {
        type: Array as PropType<Expense[]>,
        required: true,
      },
    },

    setup(props) {
      const standardExpenses = props.expenses.filter((it) => !it.isExceptional());
      const dailyExpenses = props.expenses.filter((it) => !it.isRecurring() && !it.isExceptional());

      const monthExpenses = filterExpensesOfCurrentMonth(standardExpenses);
      const monthDebits = monthExpenses.filter((it) => it.amount < 0);
      const monthDailyDebits = monthDebits.filter((it) => !it.isRecurring());
      const monthRecurringDebits = monthDebits.filter((it) => it.isRecurring());

      const recurringAmountsByCategory = sumExpensesByCategory(monthRecurringDebits, 9);
      const dailyAmountsByCategory = sumExpensesByCategory(monthDailyDebits, 9);
      const amountsByDay = sumExpensesByDay(monthDebits);

      const aggregatedBalanceByDay = computeAggregatedBalanceByDay(monthExpenses);
      const aggregatedBalanceByMonth = computeAggregatedBalanceByMonth(standardExpenses);

      const balanceByMonth = computeBalanceByMonth(standardExpenses);
      const dailyDebitsByMonth = computeDebitsByMonth(dailyExpenses);

      onMounted(() => {
        new Chart('dailyAmountsByCategory', {
          type: 'pie',
          data: {
            labels: dailyAmountsByCategory.map((it) => it[0]),
            datasets: [
              {
                data: dailyAmountsByCategory.map((it) => -it[1]),
                backgroundColor: dailyAmountsByCategory.map((it) => genColor(it[0])),
                borderWidth: 0,
              },
            ],
          },
          options: {
            plugins: {
              legend: {
                onClick(evt, item, legend) {
                  const index = legend.chart.data.labels?.findIndex((label) => label === item.text) ?? 0;
                  legend.chart.tooltip?.setActiveElements([{ datasetIndex: 0, index }], { x: 0, y: 0 });
                },
              },
            },
          },
        });

        new Chart('recurringAmountsByCategory', {
          type: 'pie',
          data: {
            labels: recurringAmountsByCategory.map((it) => it[0]),
            datasets: [
              {
                data: recurringAmountsByCategory.map((it) => -it[1]),
                backgroundColor: recurringAmountsByCategory.map((it) => genColor(it[0])),
                borderWidth: 0,
              },
            ],
          },
          options: {
            plugins: {
              legend: {
                onClick(evt, item, legend) {
                  const index = legend.chart.data.labels?.findIndex((label) => label === item.text) ?? 0;
                  legend.chart.tooltip?.setActiveElements([{ datasetIndex: 0, index }], { x: 0, y: 0 });
                },
              },
            },
          },
        });

        new Chart('balanceByDay', {
          type: 'line',
          data: {
            labels: aggregatedBalanceByDay.map((it) => new Date(it[0])),
            datasets: [
              {
                label: 'Dépenses',
                type: 'bar',
                data: amountsByDay.map((it) => -it[1]),
                backgroundColor: '#ff6384',
              },
              {
                label: 'Solde',
                type: 'line',
                data: aggregatedBalanceByDay.map((it) => it[1]),
                backgroundColor: '#4bc0c088',
                borderColor: '#4bc0c0',
                borderWidth: 2,
                pointRadius: 0,
                fill: true,
              },
            ],
          },
          options: {
            scales: {
              x: { type: 'time', time: { round: 'day', displayFormats }, grid: { display: false } },
              y: { beginAtZero: true, grid: { color: CHART_GRID_COLOR } },
            },
          },
        });

        new Chart('balanceByMonth', {
          type: 'bar',
          data: {
            labels: balanceByMonth.map((it) => it[0]),
            datasets: [
              {
                data: balanceByMonth.map((it) => it[1]),
                backgroundColor: balanceByMonth.map((it) => (it[1] >= 0 ? '#4bc0c0' : '#ff6384')),
              },
            ],
          },
          options: {
            plugins: {
              legend: { display: false },
            },
            scales: {
              x: { grid: { display: false } },
              y: { beginAtZero: true, grid: { color: CHART_GRID_COLOR } },
            },
          },
        });

        const categories = getCategoryDefs()
          .filter((def) => !def.exceptional)
          .map((def) => def.name)
          .filter((cat) => dailyDebitsByMonth.some((it) => it[1].has(cat)));

        new Chart('dailyDebitsByMonth', {
          type: 'bar',
          data: {
            labels: dailyDebitsByMonth.map((it) => it[0]),
            datasets: categories.map((cat) => ({
              data: dailyDebitsByMonth.map((it) => -(it[1].get(cat) ?? 0)),
              backgroundColor: genColor(cat),
              label: cat,
            })),
          },
          options: {
            scales: {
              x: { stacked: true, grid: { display: false } },
              y: { stacked: true, beginAtZero: true, grid: { color: CHART_GRID_COLOR } },
            },
            animation: false,
            plugins: {
              legend: {
                onClick(evt, item, legend) {
                  if (item.hidden) {
                    legend.chart.data.datasets.forEach((ds) => (ds.hidden = ds.label !== item.text));
                    legend.chart.update();
                    return;
                  }

                  const allVisible = legend.chart.data.datasets.every((ds) => !ds.hidden);
                  if (allVisible) {
                    legend.chart.data.datasets.forEach((ds) => (ds.hidden = ds.label !== item.text));
                    legend.chart.update();
                  } else {
                    legend.chart.data.datasets.forEach((ds) => (ds.hidden = false));
                    legend.chart.update();
                  }
                },
              },
            },
          },
        });

        new Chart('aggregatedBalanceByMonth', {
          type: 'line',
          data: {
            labels: balanceByMonth.map((it) => it[0]),
            datasets: [
              {
                data: aggregatedBalanceByMonth.map((it) => it[1]),
                backgroundColor: '#4bc0c088',
                borderColor: '#4bc0c0',
                borderWidth: 2,
                pointRadius: 0,
                fill: true,
              },
            ],
          },
          options: {
            plugins: {
              legend: { display: false },
            },
            scales: {
              x: {
                type: 'time',
                time: { round: 'month', displayFormats },
                grid: { display: false },
              },
              y: { grid: { color: CHART_GRID_COLOR } },
            },
          },
        });
      });
    },
  });
</script>

<!-- ----------------------------------------------------------------------- -->
<!-- STYLE -->
<!-- ----------------------------------------------------------------------- -->

<style lang="scss" scoped>
  @import '../theme.scss';

  .stats-container {
    @include padded;
    padding-left: 0 !important;
    padding-right: 0 !important;
    flex: 1;

    .stat {
      margin-left: 20px;
      margin-right: 20px;
      margin-top: 70px;
      margin-bottom: 70px;

      @media #{$media-phone-small} {
        margin-left: 10px;
        margin-right: 10px;
      }
    }

    h1 {
      font-weight: 100;
      font-size: 2.6em;
      color: $text;
      padding-right: 10px;
      padding-bottom: 10px;
      margin-bottom: 10px;
      text-align: right;

      &:not(:first-of-type) {
        margin-top: 50px;
        padding-top: 40px;
        border-top: 140px solid $background2;
      }
    }

    h2 {
      font-weight: 100;
      font-size: 1.6em;
      border-bottom: 1px solid $border1;
      padding-bottom: 10px;
      margin-bottom: 10px;
    }
  }
</style>
