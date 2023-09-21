<!-- ----------------------------------------------------------------------- -->
<!-- TEMPLATE -->
<!-- ----------------------------------------------------------------------- -->

<template>
  <div>
    <ExpenseDetails ref="refDetails" full :expense="expense"></ExpenseDetails>
    <ButtonsGroup class="buttons">
      <button v-ripple v-tap class="btn-flat" @tap="cancel">ANNULER</button>
      <button v-ripple v-tap class="btn-danger" @tap="remove">SUPPRIMER</button>
      <button v-ripple v-tap class="btn-primary" @tap="done">MODIFIER</button>
    </ButtonsGroup>
  </div>
</template>

<!-- ----------------------------------------------------------------------- -->
<!-- CODE -->
<!-- ----------------------------------------------------------------------- -->

<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { Expense } from '../models/expense';
  import ButtonsGroup from './ButtonsGroup.vue';
  import ExpenseDetails from './ExpenseDetails.vue';

  export default defineComponent({
    components: { ButtonsGroup, ExpenseDetails },

    props: {
      expense: {
        type: Expense,
        required: true,
      },
    },

    emits: ['cancel', 'remove', 'done'],

    setup(props, { emit }) {
      const refDetails = ref(null);

      return { cancel, remove, done, refDetails };

      function cancel(): void {
        emit('cancel');
      }

      function remove(): void {
        emit('remove');
      }

      function done(): void {
        const el = refDetails.value as typeof ExpenseDetails | null;
        emit('done', el && el.bundle());
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
