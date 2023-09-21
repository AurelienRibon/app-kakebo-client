<!-- ----------------------------------------------------------------------- -->
<!-- TEMPLATE -->
<!-- ----------------------------------------------------------------------- -->

<template>
  <h1>dépenses fréquentes</h1>
  <section>
    <div v-for="item of categoriesFrequent" :key="item.name" v-ripple v-tap class="item" @tap="done(item.name)">
      <span class="item-icon mdi" :class="item.icon"></span>
      <span class="item-name">{{ item.name }}</span>
    </div>
  </section>

  <h1>dépenses peu fréquentes</h1>
  <section>
    <div v-for="item of categoriesInfrequent" :key="item.name" v-ripple v-tap class="item" @tap="done(item.name)">
      <span class="item-icon mdi" :class="item.icon"></span>
      <span class="item-name">{{ item.name }}</span>
    </div>
  </section>

  <ButtonsGroup class="buttons">
    <button v-ripple v-tap class="btn-flat" @tap="cancel">ANNULER</button>
  </ButtonsGroup>
</template>

<!-- ----------------------------------------------------------------------- -->
<!-- CODE -->
<!-- ----------------------------------------------------------------------- -->

<script lang="ts">
  import { defineComponent } from 'vue';
  import categories from '../meta/categories.json';
  import ButtonsGroup from './ButtonsGroup.vue';

  export default defineComponent({
    components: { ButtonsGroup },

    emits: ['cancel', 'done'],

    setup(props, { emit }) {
      const categoriesFrequent = categories.filter((it) => !it.infrequent);
      const categoriesInfrequent = categories.filter((it) => !!it.infrequent);

      return { categoriesFrequent, categoriesInfrequent, cancel, done };

      function cancel(): void {
        emit('cancel');
      }

      function done(category: string): void {
        emit('done', category);
      }
    },
  });
</script>

<!-- ----------------------------------------------------------------------- -->
<!-- STYLE -->
<!-- ----------------------------------------------------------------------- -->

<style lang="scss" scoped>
  @import '../theme.scss';

  h1 {
    font-weight: 300;
    font-size: 1.5em;
  }

  section {
    display: grid;
    grid-template-columns: repeat(3, 100px);
    grid-auto-flow: row;
    grid-gap: 15px;
    justify-content: center;

    margin-top: 15px;
    margin-bottom: 30px;

    @media #{$media-phone-small} {
      grid-template-columns: repeat(3, 90px);
      grid-gap: 10px;
    }
  }

  .item {
    width: 100px;
    height: 100px;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    background-color: $text;
    color: $background1;
    border-radius: 6px;

    @media #{$media-phone-small} {
      width: 90px;
      height: 90px;
    }
  }

  .item-icon {
    font-size: 36px;
    margin-bottom: 5px;
  }
</style>
