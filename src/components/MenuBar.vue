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

    <div v-ripple v-tap class="menu-item" @tap="select('PageQuery')">
      <i class="mdi mdi-database-search"></i>
      <span>requêtes</span>
    </div>

    <div v-ripple v-tap class="btn-action" :class="actionClass" @tap="doAction">
      <i class="mdi" :class="actionIconClass"></i>
    </div>
  </div>
</template>

<!-- ----------------------------------------------------------------------- -->
<!-- CODE -->
<!-- ----------------------------------------------------------------------- -->

<script lang="ts">
  import { computed, defineComponent } from 'vue';

  export default defineComponent({
    props: {
      page: {
        type: String,
        required: true,
      },
    },

    emits: ['select', 'doAction'],

    setup(props, ctx) {
      const actionClass = computed(() => (props.page === 'PageQuery' ? 'action-query' : ''));
      const actionIconClass = computed(() => (props.page === 'PageQuery' ? 'mdi-magnify' : 'mdi-plus'));

      return { actionClass, actionIconClass, doAction, select };

      function doAction(): void {
        ctx.emit('doAction');
      }

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

  .btn-action {
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
    background-color: $accent1;
    border-radius: var(--btn-size);
    box-shadow: 0 0 10px 4px $background2;
    transition: background-color 0.2s ease;

    &.action-query {
      background-color: #b92d99;
    }
  }
</style>
