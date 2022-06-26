<template>
  <div class="editor" v-if="editor">
    <menu-bar class="editor__header" :editor="editor"></menu-bar>
    <editor-content ref="editor" class="editor__content" :editor="editor" @click="clickEditor"></editor-content>

    <div v-if="isImage" class="position-fixed" :style="getSizePosition">
      <div class="d-flex justify-content-around w-100">
        <input type="number" class="col-5" v-model="param1" @blur="changeSize()">
        <span>x</span>
        <input type="number" class="col-5" v-model="param2" @blur="changeSize()">
      </div>
    </div>
  </div>
</template>

<script>

import History from '@tiptap/extension-history';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';

import { Color } from '@tiptap/extension-color';
import Image from './tiptap/tiptap-extension-image.esm';
import Link from '@tiptap/extension-link';

import StarterKit from '@tiptap/starter-kit';
import { Editor, EditorContent } from '@tiptap/vue-3';

import MenuBar from './MenuBar.vue';

export default {
  name: 'editor',
  props: {
    modelValue: String,
    newValue: Number,
  },
  emits: ['update:modelValue'],
  components: {
    EditorContent,
    MenuBar,
  },
  data: () => ({
    selectedNode: null,
    editor: null,
    param1: '',
    param2: '',
    rulesCss: [],

    imgSizeModal: false,
  }),
  watch: {
    newValue() {
      this.editor.commands.setContent(this.modelValue);
      this.editor.commands.focus('end');
    },
    param1() {
      this.rulesCss[0] = 'width: ' + this.param1 + 'px';
    },
    param2() {
      this.rulesCss[1] = 'height: ' + this.param2 + 'px';
    },
  },
  computed: {
    isImage() {
      return this.selectedNode && this.selectedNode.tagName === 'IMG';
    },
    getSizePosition() {
      const size = this.selectedNode.getBoundingClientRect();

      this.param1 = size.width;
      this.param2 = size.height;

      return `top: ${size.top}px; left: ${size.left}px; width: 150px`;
    },
  },
  methods: {
    init() {
      this.editor = new Editor({
        content: this.modelValue,
        injectCSS: true,
        extensions: [
          StarterKit.configure({
            history: false,
          }),
          History.configure({
            depth: 10,
          }),
          TextAlign.configure({
            types: ['heading', 'paragraph'],
          }),
          TextStyle,
          Highlight,
          Color,
          Image.configure({
            inline: true,
            HTMLAttributes: {
              class: 'image',
            },
          }),
          Link,
        ],
        onUpdate: () => {
          this.update();
        },
      });
    },
    destroy() {
      this.editor && this.editor.destroy();
    },

    update() {
      this.$emit('update:modelValue', this.editor.getHTML());
    },

    clickEditor() {
      if (this.editor.isActive('image')) {
        //this.rulesCss = [];
        this.selectedNode = this.$refs.editor.rootEl.querySelector('.ProseMirror-selectednode');
      }
      else this.selectedNode = null;
    },

    changeSize() {
      if (this.isImage) this.updateImage();
    },
    updateImage() {
      this.selectedNode.focus();
      console.log(this.rulesCss.join('; '));
      this.editor.chain().focus().setStyle({ style: this.rulesCss.join('; ') }).run();
    }
  },
  mounted() {
    this.init();
  },
}
</script>

<style lang="scss">
.editor {
  display: flex;
  flex-direction: column;
  color: #0D0D0D;
  background-color: #FFF;
  border: 3px solid #343957;
  border-radius: 0.75rem;
  min-height: 25vh;
  max-height: 65vh;

  img, svg {
    vertical-align: initial;
  }

  &__header {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    flex-wrap: wrap;
    padding: 0.25rem;
    border-bottom: 3px solid #343957;
  }

  &__content {
    padding: 1.25rem 1rem;
    flex: 1 1 auto;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;

    img.ProseMirror-selectednode {
      outline: 3px solid #68CEF8;
    }
  }

  &__footer {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    white-space: nowrap;
    border-top: 3px solid #343957;
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
        background-color: #343957;
      }
    }
  }
}
</style>
