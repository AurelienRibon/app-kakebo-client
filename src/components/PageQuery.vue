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
      <div id="result" ref="refResult" class="input-code result" />
    </div>
  </div>
</template>

<!-- ----------------------------------------------------------------------- -->
<!-- CODE -->
<!-- ----------------------------------------------------------------------- -->

<script lang="ts">
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
      const query = ref('SELECT * FROM %expenses%\nWHERE deleted = False\nORDER BY date\nLIMIT 1') as Ref<string>;

      const refQuery = ref() as Ref<HTMLTextAreaElement>;
      const refQuestion = ref() as Ref<HTMLTextAreaElement>;
      const refResult = ref() as Ref<HTMLDivElement>;

      return { query, question, refQuery, refQuestion, refResult, runQuery, selection, onQuestionFocus, onQueryFocus };

      function onQuestionFocus() {
        refQuestion.value.select();
        selection.value = 'question';
      }

      function onQueryFocus() {
        refQuery.value.select();
        selection.value = 'query';
      }

      async function runQuery() {
        if (selection.value === 'question') {
          refQuery.value.classList.add('progress');

          const categories = props.expenses.map((e) => `'${e.category}'`).join(', ');
          const prompt = prompts.questionToQuery.replace('{{categories}}', categories);
          query.value = await askGPT([prompt, question.value]);

          refQuery.value.classList.remove('progress');
          refQuery.value.focus();
        } else {
          refResult.value.classList.add('progress');

          const query = refQuery.value.value;
          const rows = await postJSON('/expenses/query', { data: { query } });

          refResult.value.innerHTML = JSON.stringify(rows, null, 2);
          refResult.value.classList.remove('progress');
        }
      }
    },
  });
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
