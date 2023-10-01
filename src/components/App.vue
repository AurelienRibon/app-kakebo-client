<!-- ----------------------------------------------------------------------- -->
<!-- TEMPLATE -->
<!-- ----------------------------------------------------------------------- -->

<template>
  <main>
    <keep-alive>
      <component
        :is="page"
        ref="pageRef"
        class="page"
        :expenses="expenses"
        @check="onExpenseCheck"
        @edit="onExpenseEdit"
      ></component>
    </keep-alive>

    <MenuBar class="menu-bar" :page="page" @select="onMenuSelect" @do-action="onBtnActionClick"></MenuBar>

    <transition name="fade">
      <div v-if="loading" class="loading mdi mdi-loading"></div>
    </transition>

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
  import { SplashScreen } from '@capacitor/splash-screen';
  import { defineComponent, onMounted, Ref, ref } from 'vue';
  import { ExpenseJSON } from '../lib/expenses';
  import { Expense } from '../models/expense';
  import { store } from '../store/store';
  import AddExpense from './AddExpense.vue';
  import EditExpense from './EditExpense.vue';
  import MenuBar from './MenuBar.vue';
  import PageHome from './PageHome.vue';
  import PageList from './PageList.vue';
  import PageQuery from './PageQuery.vue';

  type State = 'idle' | 'addExpense' | 'editExpense';

  export default defineComponent({
    components: { PageHome, PageQuery, PageList, MenuBar, AddExpense, EditExpense },

    setup() {
      const pageRef = ref() as Ref<InstanceType<typeof PageQuery>>;
      const page = ref('PageHome') as Ref<string>;
      const state = ref('idle') as Ref<State>;
      const editedExpense = ref(new Expense()) as Ref<Expense>;
      const expenses = store.expenses;
      const loading = store.loading;

      onMounted(() => {
        SplashScreen.hide();
      });

      return {
        editedExpense,
        expenses,
        loading,
        onBtnActionClick,
        onAddExpenseCancel,
        onAddExpenseDone,
        onEditExpenseCancel,
        onEditExpenseDone,
        onEditExpenseRemove,
        onExpenseCheck,
        onExpenseEdit,
        onMenuSelect,
        page,
        pageRef,
        state,
      };

      function onMenuSelect(choice: string): void {
        page.value = choice;
      }

      function onBtnActionClick(): void {
        if (page.value === 'PageQuery') {
          pageRef.value?.runQuery();
        } else {
          state.value = 'addExpense';
        }
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
    position: relative;
    width: 100dvw;
    height: 100dvh;

    display: flex;
    flex-direction: column;
  }

  .page {
    flex: 1;
    overflow-y: scroll;
    padding-top: calc(env(safe-area-inset-top) + 20px);
  }

  .menu-bar {
    flex: 0;
    flex-basis: calc(70px + env(safe-area-inset-bottom));
    padding-bottom: env(safe-area-inset-bottom);
    background: $background2;
    border-top: 1px solid $border1;
  }

  .panel {
    @include padded;

    position: absolute;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;

    overflow-y: auto;
    background: $background2;
    border-left: 4px solid $accent1;
    border-right: 4px solid $accent1;
  }

  .loading {
    position: absolute;
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
    transform: translateY(100dvh);
  }
</style>
