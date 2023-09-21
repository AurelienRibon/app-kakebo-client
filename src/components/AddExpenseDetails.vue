<!-- ----------------------------------------------------------------------- -->
<!-- TEMPLATE -->
<!-- ----------------------------------------------------------------------- -->

<template>
  <ExpenseDetails ref="refDetails" autofocus :expense="expense"></ExpenseDetails>
  <ButtonsGroup class="buttons">
    <button v-ripple v-tap class="btn-flat" @tap="cancel">ANNULER</button>
    <button v-ripple v-tap class="btn-primary" @tap="done">AJOUTER</button>
  </ButtonsGroup>
</template>

<!-- ----------------------------------------------------------------------- -->
<!-- CODE -->
<!-- ----------------------------------------------------------------------- -->

<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { config } from '../models/config';
  import { Expense } from '../models/expense';
  import ButtonsGroup from './ButtonsGroup.vue';
  import ExpenseDetails from './ExpenseDetails.vue';

  export default defineComponent({
    components: { ButtonsGroup, ExpenseDetails },

    props: {
      category: {
        type: String,
        required: true,
      },
    },

    emits: ['cancel', 'done'],

    setup(props, { emit }) {
      // If last expense was entered less than 10 minutes ago, we reuse the same date.
      const durationSinceLastInput = Date.now() - config.lastExpenseAt;
      const expenseDate = durationSinceLastInput < 1000 * 60 * 10 ? config.lastExpenseDate : undefined;
      const expense = new Expense({ category: props.category, date: expenseDate });
      const refDetails = ref(null);

      return { cancel, done, expense, refDetails };

      function cancel(): void {
        emit('cancel');
      }

      function done(): void {
        const el = refDetails.value as typeof ExpenseDetails | null;
        const expenseSpec = el?.bundle();
        config.lastExpenseDate = expenseSpec.date;
        config.lastExpenseAt = Date.now();
        emit('done', expenseSpec);
      }
    },
  });
</script>

<!-- ----------------------------------------------------------------------- -->
<!-- STYLE -->
<!-- ----------------------------------------------------------------------- -->

<style lang="scss" scoped>
  .buttons {
    margin-top: 30px;
  }
</style>
