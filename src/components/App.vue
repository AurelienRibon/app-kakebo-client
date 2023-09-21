<!-- ----------------------------------------------------------------------- -->
<!-- TEMPLATE -->
<!-- ----------------------------------------------------------------------- -->

<template>
  <main>
    <keep-alive>
      <component :is="page" class="page" :expenses="expenses" @check="onExpenseCheck" @edit="onExpenseEdit"></component>
    </keep-alive>

    <MenuBar class="menu-bar" @select="onMenuSelect"></MenuBar>

    <transition name="fade">
      <div v-if="loading" class="loading mdi mdi-loading"></div>
    </transition>

    <div v-ripple v-tap class="btn-add-expense" @tap="onBtnAddExpenseClick">
      <i class="mdi mdi-plus"></i>
    </div>

    <transition name="slide">
      <AddExpense
        v-if="state === 'addExpense'"
        class="panel"
        @cancel="onAddExpenseCancel"
        @done="onAddExpenseDone"
      ></AddExpense>
    </transition>

    <transition name="slide">
      <EditExpense
        v-if="state === 'editExpense'"
        class="panel"
        :expense="editedExpense"
        @cancel="onEditExpenseCancel"
        @remove="onEditExpenseRemove"
        @done="onEditExpenseDone"
      ></EditExpense>
    </transition>
  </main>
</template>

<!-- ----------------------------------------------------------------------- -->
<!-- CODE -->
<!-- ----------------------------------------------------------------------- -->

<script lang="ts">
  import { defineComponent, Ref, ref } from 'vue';
  import { Expense } from '../models/expense';
  import { ExpenseJSON } from '../lib/expenses';
  import { store } from '../store/store';
  import AddExpense from './AddExpense.vue';
  import EditExpense from './EditExpense.vue';
  import PageHome from './PageHome.vue';
  import PageStats from './PageStats.vue';
  import PageList from './PageList.vue';
  import MenuBar from './MenuBar.vue';

  type State = 'idle' | 'addExpense' | 'editExpense';

  export default defineComponent({
    components: { PageHome, PageStats, PageList, MenuBar, AddExpense, EditExpense },

    setup() {
      const page = ref('PageHome') as Ref<string>;
      const state = ref('idle') as Ref<State>;
      const editedExpense = ref(new Expense()) as Ref<Expense>;
      const expenses = store.expenses;
      const loading = store.loading;

      return {
        editedExpense,
        expenses,
        loading,
        onAddExpenseCancel,
        onAddExpenseDone,
        onBtnAddExpenseClick,
        onEditExpenseCancel,
        onEditExpenseDone,
        onEditExpenseRemove,
        onExpenseCheck,
        onExpenseEdit,
        onMenuSelect,
        page,
        state,
      };

      function onMenuSelect(choice: string): void {
        page.value = choice;
      }

      function onBtnAddExpenseClick(): void {
        state.value = 'addExpense';
      }

      function onAddExpenseCancel(): void {
        state.value = 'idle';
      }

      function onExpenseCheck(expense: Expense): void {
        expense.edit({ checked: !expense.checked });
        store.saveAndSync();
      }

      function onExpenseEdit(expense: Expense): void {
        editedExpense.value = expense;
        state.value = 'editExpense';
      }

      function onEditExpenseCancel(): void {
        state.value = 'idle';
      }

      function onEditExpenseDone(spec: ExpenseJSON): void {
        state.value = 'idle';
        editedExpense.value.edit(spec);
        store.saveAndSync();

        if ('date' in spec) {
          store.refreshExpenses();
        }
      }

      function onEditExpenseRemove(): void {
        state.value = 'idle';
        editedExpense.value.edit({ deleted: true });
        store.saveAndSync();
        store.refreshExpenses();
      }

      function onAddExpenseDone(spec: ExpenseJSON): void {
        state.value = 'idle';
        store.addExpense(spec);
        store.saveAndSync();
      }
    },
  });
</script>

<!-- ----------------------------------------------------------------------- -->
<!-- STYLE -->
<!-- ----------------------------------------------------------------------- -->

<style lang="scss" scoped>
  @import '../theme.scss';

  main {
    height: var(--h);
    padding-top: env(safe-area-inset-top);

    display: flex;
    flex-direction: column;
  }

  .page {
    flex: 1;
    overflow-y: scroll;
  }

  .menu-bar {
    height: calc(70px + env(safe-area-inset-bottom));
    padding-bottom: env(safe-area-inset-bottom);
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: $background2;
    border-top: 1px solid $border1;
  }

  .btn-add-expense {
    --btn-size: 80px;

    @media #{$media-phone-small} {
      --btn-size: 70px;
    }

    position: fixed;
    bottom: calc(15px + env(safe-area-inset-bottom));
    right: 15px;
    width: var(--btn-size);
    height: var(--btn-size);
    line-height: var(--btn-size);

    font-size: calc(var(--btn-size) - 20px);
    text-align: center;
    color: $background2;
    background: $accent1;
    border-radius: var(--btn-size);
    box-shadow: 0 0 10px 4px $background2;
  }

  .panel {
    @include modal;
    @include padded;
    overflow-y: auto;
    background: $background2;
    border-left: 4px solid $accent1;
    border-right: 4px solid $accent1;
  }

  .loading {
    position: fixed;
    top: 0;
    right: 10px;
    font-size: 40px;
    color: #ebebeb;
    animation: spin 0.6s linear infinite;
  }

  // Animations

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  // Transitions

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  .fade-leave-active {
    transition-duration: 0.8s;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .slide-enter-active,
  .slide-leave-active {
    transition: transform 0.3s ease;
  }

  .slide-enter-from,
  .slide-leave-to {
    transform: translateY(var(--h));
  }
</style>
