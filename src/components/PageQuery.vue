<!-- ----------------------------------------------------------------------- -->
<!-- TEMPLATE -->
<!-- ----------------------------------------------------------------------- -->

<template>
  <div class="question-container">
    <div>
      <label for="question">Question</label>
      <textarea
        id="question"
        ref="refQuestion"
        v-model="question"
        type="text"
        class="input-text"
        :class="{ selected: selection === 'question' }"
        @focus="onQuestionFocus"
      />

      <label for="query">Requête</label>
      <textarea
        id="query"
        ref="refQuery"
        v-model="query"
        type="text"
        class="input-code"
        :class="{ selected: selection === 'query' }"
        @focus="onQueryFocus"
      />

      <label for="result">Résultat</label>
      <div id="result" ref="refResult" class="input-text result">{{ result }}</div>
    </div>
  </div>
</template>

<!-- ----------------------------------------------------------------------- -->
<!-- CODE -->
<!-- ----------------------------------------------------------------------- -->

<script lang="ts">
  import { Keyboard } from '@capacitor/keyboard';
  import { PropType, Ref, defineComponent, ref } from 'vue';
  import { askGPT } from '../ai/api';
  import * as prompts from '../ai/prompts';
  import { postJSON } from '../lib/http';
  import { Expense } from '../models/expense';

  type Selection = 'question' | 'query';

  export default defineComponent({
    props: {
      expenses: {
        type: Array as PropType<Expense[]>,
        required: true,
      },
    },

    setup(props) {
      const selection = ref('question') as Ref<Selection>;
      const question = ref('Quelle est ma dernière dépense ?') as Ref<string>;
      const query = ref('') as Ref<string>;
      const result = ref('') as Ref<string>;

      const refQuery = ref() as Ref<HTMLTextAreaElement>;
      const refQuestion = ref() as Ref<HTMLTextAreaElement>;
      const refResult = ref() as Ref<HTMLDivElement>;

      return {
        query,
        question,
        result,
        refQuery,
        refQuestion,
        refResult,
        runQuery,
        selection,
        onQuestionFocus,
        onQueryFocus,
      };

      function onQuestionFocus() {
        refQuestion.value.select();
        selection.value = 'question';
      }

      function onQueryFocus() {
        refQuery.value.select();
        selection.value = 'query';
      }

      async function runQuery() {
        Keyboard.hide();
        refQuery.value.classList.add('progress');
        refResult.value.classList.add('progress');

        const categories = computeCategoriesList(props.expenses);

        query.value = await executeQuestion(categories, question.value);
        refQuery.value.classList.remove('progress');

        result.value = await executeQuery(categories, question.value, query.value);
        refResult.value.classList.remove('progress');
      }
    },
  });

  // HELPERS
  // ---------------------------------------------------------------------------

  async function executeQuestion(categories: string, question: string) {
    const chat = [...prompts.questionToQuery];
    chat[0] = chat[0].replaceAll('{{categories}}', categories);
    chat[1] = chat[1].replaceAll('{{question}}', question);
    return askGPT(chat);
  }

  async function executeQuery(categories: string, question: string, query: string) {
    const rows = await postJSON('/expenses/query', { data: { query } });
    const chat = [...prompts.rowsToAnswer];
    chat[1] = chat[1].replaceAll('{{categories}}', categories);
    chat[1] = chat[1].replaceAll('{{question}}', question);
    chat[1] = chat[1].replaceAll('{{rows}}', JSON.stringify(rows, null, 2));
    return askGPT(chat);
  }

  function computeCategoriesList(expenses: Expense[]) {
    const categories = [...new Set(expenses.map((e) => e.category))];
    return categories.map((it) => `'${it}'`).join(', ');
  }
</script>

<!-- ----------------------------------------------------------------------- -->
<!-- STYLE -->
<!-- ----------------------------------------------------------------------- -->

<style lang="scss" scoped>
  @import '../theme.scss';

  .question-container {
    @include padded;
  }

  label {
    display: block;

    &:not(:first-child) {
      margin-top: 10px;
    }
  }

  .input-text {
    display: block;
    width: 100%;
    border: 0;
    border-radius: 4px;
    padding: 5px;
    resize: vertical;
    min-height: 70px;
    font-size: 1rem;

    &.selected {
      background-color: $text;
    }

    &:not(.selected) {
      background-color: $text-faint;
    }
  }

  .input-code {
    @extend .input-text;
    font-family: monospace;
    white-space: pre;
    font-size: 0.8rem;
  }

  .result {
    overflow: auto;
    color: white;
    background-color: #b92d99 !important;
  }

  .progress {
    --color: #ffffff6b;
    /* This linear gradient creates a bar that's 30% the width of the textarea */
    background: linear-gradient(
      45deg,
      var(--color) 25%,
      transparent 25%,
      transparent 50%,
      var(--color) 50%,
      var(--color) 75%,
      transparent 75%,
      transparent
    );

    /* set the background-size so we can animate its position */
    background-size: 40px 40px;
    animation: slide 6s infinite linear;

    @keyframes slide {
      from {
        background-position: -100% 0;
      }
      to {
        background-position: 100% 0;
      }
    }
  }
</style>
