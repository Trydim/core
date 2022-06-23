<template>
  <div class="editor" v-if="editor">
    <menu-bar class="editor__header" :editor="editor" />
    <editor-content class="editor__content" :editor="editor" />
  </div>

  {{ content }}
</template>

<script>

//import CharacterCount from '@tiptap/extension-character-count'
//import Collaboration from '@tiptap/extension-collaboration'
//import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
//import Highlight from '@tiptap/extension-highlight'
import StarterKit from '@tiptap/starter-kit';
import { Editor, EditorContent } from '@tiptap/vue-3'

import MenuBar from './MenuBar.vue'

export default {
  name: 'dealer',
  components: {
    EditorContent,
    MenuBar,
  },
  data() {
    return {
      editor: null,
      content: '<p>I’m running Tiptap with Vue.js. </p>',
    }
  },
  mounted() {
    /*this.editor = new Editor({
      extensions: [
        StarterKit,
      ],
      onUpdate: () => {
        // HTML
        this.content = this.editor.getHTML();

        // JSON
        // this.$emit('update:modelValue', this.editor.getJSON())
      },
    })*/

    this.editor = new Editor({
      extensions: [
        StarterKit.configure({
          history: false,
        }),

        /*Collaboration.configure({
          document: ydoc,
        }),
        CollaborationCursor.configure({
          provider: this.provider,
          user: this.currentUser,
        }),
        CharacterCount.configure({
          limit: 10000,
        }),*/
      ],
      onUpdate: () => {
        // HTML
        this.content = this.editor.getHTML();

        // JSON
        // this.$emit('update:modelValue', this.editor.getJSON())
      },
    })
  },
}

</script>

<style lang="scss">
.editor {
  display: flex;
  flex-direction: column;
  max-height: 26rem;
  color: #0D0D0D;
  background-color: #FFF;
  border: 3px solid #0D0D0D;
  border-radius: 0.75rem;

  &__header {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    flex-wrap: wrap;
    padding: 0.25rem;
    border-bottom: 3px solid #0D0D0D;
  }

  &__content {
    padding: 1.25rem 1rem;
    flex: 1 1 auto;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  &__footer {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    white-space: nowrap;
    border-top: 3px solid #0D0D0D;
    font-size: 12px;
    font-weight: 600;
    color: #0D0D0D;
    white-space: nowrap;
    padding: 0.25rem 0.75rem;
  }

  /* Some information about the status */
  &__status {
    display: flex;
    align-items: center;
    border-radius: 5px;

    &::before {
      content: ' ';
      flex: 0 0 auto;
      display: inline-block;
      width: 0.5rem;
      height: 0.5rem;
      background: rgba(#0D0D0D, 0.5);
      border-radius: 50%;
      margin-right: 0.5rem;
    }

    &--connecting::before {
      background: #616161;
    }

    &--connected::before {
      background: #B9F18D;
    }
  }

  &__name {
    button {
      background: none;
      border: none;
      font: inherit;
      font-size: 12px;
      font-weight: 600;
      color: #0D0D0D;
      border-radius: 0.4rem;
      padding: 0.25rem 0.5rem;

      &:hover {
        color: #FFF;
        background-color: #0D0D0D;
      }
    }
  }
}
</style>
