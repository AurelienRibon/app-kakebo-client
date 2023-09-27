<!-- ----------------------------------------------------------------------- -->
<!-- TEMPLATE -->
<!-- ----------------------------------------------------------------------- -->

<template>
  <div class="menu-container">
    <div v-ripple v-tap class="menu-item" @tap="select('PageHome')">
      <i class="mdi mdi-home"></i>
      <span>accueil</span>
    </div>

    <div v-ripple v-tap class="menu-item" @tap="select('PageList')">
      <i class="mdi mdi-format-list-bulleted-square"></i>
      <span>liste</span>
    </div>

    <div v-ripple v-tap class="menu-item" @tap="select('PageStats')">
      <i class="mdi mdi-chart-bar"></i>
      <span>stats</span>
    </div>

    <div v-ripple v-tap class="btn-add-expense" @tap="onBtnAddExpenseClick">
      <i class="mdi mdi-plus"></i>
    </div>
  </div>
</template>

<!-- ----------------------------------------------------------------------- -->
<!-- CODE -->
<!-- ----------------------------------------------------------------------- -->

<script lang="ts">
  import { defineComponent } from 'vue';

  export default defineComponent({
    emits: ['select', 'addExpense'],

    setup(props, ctx) {
      return { select, onBtnAddExpenseClick };

      function select(name: string) {
        ctx.emit('select', name);
      }

      function onBtnAddExpenseClick(): void {
        ctx.emit('addExpense');
      }
    },
  });
</script>

<!-- ----------------------------------------------------------------------- -->
<!-- STYLE -->
<!-- ----------------------------------------------------------------------- -->

<style lang="scss" scoped>
  @import '../theme.scss';

  .menu-container {
    display: flex;
    padding-right: 10px;
  }

  .menu-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    i {
      font-size: 34px;
      line-height: 40px;
      height: 40px;
      margin-bottom: -6px;
    }
  }

  .btn-add-expense {
    --btn-size: 80px;

    @media #{$media-phone-small} {
      --btn-size: 70px;
    }

    width: var(--btn-size);
    height: var(--btn-size);
    line-height: var(--btn-size);

    position: relative;
    top: -15px;

    font-size: calc(var(--btn-size) - 20px);
    text-align: center;
    color: $background2;
    background: $accent1;
    border-radius: var(--btn-size);
    box-shadow: 0 0 10px 4px $background2;
  }
</style>
