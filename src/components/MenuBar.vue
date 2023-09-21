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
  </div>
</template>

<!-- ----------------------------------------------------------------------- -->
<!-- CODE -->
<!-- ----------------------------------------------------------------------- -->

<script lang="ts">
  import { defineComponent } from 'vue';

  export default defineComponent({
    emits: ['select'],

    setup(props, ctx) {
      return { select };

      function select(name: string) {
        ctx.emit('select', name);
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
    padding-right: 100px;
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
</style>
