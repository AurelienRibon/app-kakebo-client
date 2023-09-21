<!-- ----------------------------------------------------------------------- -->
<!-- TEMPLATE -->
<!-- ----------------------------------------------------------------------- -->

<template>
  <div>
    <AddExpenseCategory v-if="index === 1" @done="doneCategory" @cancel="cancel"></AddExpenseCategory>
    <AddExpenseDetails v-if="index === 2" :category="category" @done="done" @cancel="cancel"></AddExpenseDetails>
  </div>
</template>

<!-- ----------------------------------------------------------------------- -->
<!-- CODE -->
<!-- ----------------------------------------------------------------------- -->

<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { ExpenseJSON } from '../lib/expenses';
  import AddExpenseCategory from './AddExpenseCategory.vue';
  import AddExpenseDetails from './AddExpenseDetails.vue';

  export default defineComponent({
    components: { AddExpenseCategory, AddExpenseDetails },
    emits: ['done', 'cancel'],

    setup(props, { emit }) {
      const index = ref(1);
      const category = ref('');

      return { index, category, doneCategory, done, cancel };

      function doneCategory(cat: string): void {
        category.value = cat;
        index.value += 1;
      }

      function done(spec: ExpenseJSON): void {
        emit('done', spec);
      }

      function cancel(): void {
        emit('cancel');
      }
    },
  });
</script>
