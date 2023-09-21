<!-- ----------------------------------------------------------------------- -->
<!-- TEMPLATE -->
<!-- ----------------------------------------------------------------------- -->

<template>
  <section v-if="full">
    <label>catégorie</label>
    <article>
      <select v-model="category" @change="onCategoryChange">
        <option v-for="it of categories" :key="it.name">{{ it.name }}</option>
      </select>
    </article>
  </section>

  <section>
    <label>montant</label>
    <article class="input-amount">
      <div v-ripple v-tap class="sign" @tap="updateSign">
        <span>{{ sign }}</span>
      </div>
      <input ref="refAmount" :value="amount" type="number" inputmode="numeric" @beforeinput="updateAmount" />
    </article>
  </section>

  <section>
    <label>pointage</label>
    <div class="toggle">
      <div v-ripple v-tap :class="{ selected: !checked }" @tap="updateChecked(false)">non pointée</div>
      <div v-ripple v-tap :class="{ selected: checked }" @tap="updateChecked(true)">pointée</div>
    </div>
  </section>

  <section>
    <label v-if="periodicity === 'one-time'">date</label>
    <label v-if="periodicity === 'monthly'">date de prélèvement</label>
    <article>
      <input v-model="date" type="date" />
    </article>
  </section>

  <section v-if="!seeMore" v-ripple v-tap class="see-more" @tap="updateSeeMore()">▼ plus de détails...</section>

  <template v-if="seeMore">
    <section>
      <label>périodicité</label>
      <article>
        <select v-model="periodicity">
          <option value="one-time">ponctuel</option>
          <option value="monthly">une fois par mois</option>
        </select>
      </article>
    </section>

    <section v-if="periodicity !== 'one-time'">
      <label>libellé</label>
      <article>
        <input v-model="label" type="text" list="labels" />
      </article>
      <datalist id="labels">
        <option v-for="it of labels" :key="it" :value="it"></option>
      </datalist>
    </section>
  </template>
</template>

<!-- ----------------------------------------------------------------------- -->
<!-- CODE -->
<!-- ----------------------------------------------------------------------- -->

<script lang="ts">
  import { defineComponent, onMounted, ref, computed } from 'vue';
  import { addDigitToAmount, formatAmount } from '../lib/amounts';
  import { formatDateToDay } from '../lib/dates';
  import { getCategoryDefs } from '../lib/categories';
  import { extractExpensesLabels } from '../lib/expenses';
  import { hideKeyboard } from '../lib/dom';
  import { Expense, ExpenseSpec } from '../models/expense';
  import { store } from '../store/store';

  export default defineComponent({
    props: {
      expense: {
        type: Expense,
        required: true,
      },
      autofocus: {
        type: Boolean,
      },
      full: {
        type: Boolean,
      },
    },

    setup(props) {
      // Expense properties
      const date = ref(formatDateToDay(props.expense.date));
      const periodicity = ref(props.expense.periodicity);
      const label = ref(props.expense.label);
      const amount = ref(formatAmount(props.expense.amount, true));
      const sign = ref(props.expense.getSign());
      const category = ref(props.expense.category);
      const checked = ref(props.expense.checked);

      // Misc values
      const categories = getCategoryDefs();
      const labels = computed(() => extractExpensesLabels(store.expenses.value, category.value));
      const refAmount = ref(null);
      const seeMore = ref(props.full);

      if (props.autofocus) {
        onMounted(focusAmount);
      }

      return {
        amount,
        categories,
        category,
        checked,
        date,
        label,
        labels,
        onCategoryChange,
        periodicity,
        refAmount,
        seeMore,
        sign,
        updateAmount,
        updateChecked,
        updateSeeMore,
        updateSign,
      };

      function onCategoryChange(): void {
        label.value = '';
      }

      function updateSeeMore(): void {
        hideKeyboard();
        seeMore.value = true;
      }

      function updateSign(): void {
        sign.value = sign.value === '-' ? '+' : '-';
        focusAmount();
      }

      function updateChecked(value: boolean): void {
        checked.value = value;
      }

      function updateAmount(event: InputEvent): void {
        event.preventDefault();

        if (event.inputType === 'deleteContentBackward') {
          amount.value = addDigitToAmount(amount.value, null);
        } else if (event.inputType === 'insertText' && !!event.data && /^\d$/.test(event.data)) {
          amount.value = addDigitToAmount(amount.value, event.data);
        }
      }

      function focusAmount() {
        const el = refAmount.value as HTMLElement | null;
        if (el) {
          el.focus();
        }
      }
    },

    methods: {
      bundle(): ExpenseSpec {
        return {
          category: this.category,
          amount: Number(this.amount) * (this.sign === '-' ? -1 : +1),
          date: new Date(this.date),
          label: this.label,
          periodicity: this.periodicity,
          checked: this.checked,
        };
      },
    },
  });
</script>

<!-- ----------------------------------------------------------------------- -->
<!-- STYLE -->
<!-- ----------------------------------------------------------------------- -->

<style lang="scss" scoped>
  @import '../theme.scss';

  section {
    margin-bottom: 14px;
  }

  label {
    display: block;
  }

  article {
    height: 50px;
    display: flex;
    justify-content: stretch;
    border-radius: 6px;
    background-color: $text;
    color: $background1;

    &:focus-within {
      background-color: #ffedcc;
      border: 3px solid #ffa500;
    }

    input,
    select {
      display: flex;
      align-items: center;

      flex: 1;
      width: 100%;
      padding: 0 10px;

      border: 0;
      outline: none;
      font-size: 1.4em;
      background: none;
      color: $background1;

      &[inputmode='numeric'] {
        text-align: right;
        caret-color: $text;
      }
    }
  }

  .see-more {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .sign {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    font-size: 1.6em;
  }

  .toggle {
    display: flex;
    height: 45px;
    border: 1px solid $border1;
    border-radius: 6px;

    & > div {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.3s ease;

      &.selected {
        background-color: $text;
        color: $background1;
      }
    }
  }
</style>
