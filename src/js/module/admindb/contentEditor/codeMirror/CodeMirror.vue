<template>
  <textarea ref="area" :value="modelValue"></textarea>
</template>

<script>

import './codemirror.css';
import './show-hint.css';

import {CodeMirror} from './codemirror';

export default {
  name: "CodeMirror",
  props: {
    modelValue: String,
    newValue: Number,
  },
  emits: ['update:modelValue'],
  watch: {
    newValue() { this.editor.setValue(this.modelValue) },
  },
  methods: {
    init() {
      if (this.editor) {
        this.editor.display.wrapper.style.display = 'block';
        return;
      }

      this.editor = CodeMirror.fromTextArea(this.$refs.area, {
        mode: "htmlmixed",
        matchTags: {bothTags: true},
        selectionPointer: true,
        tabSize: 2,
        lineNumbers: true,
        extraKeys: {"Ctrl-Space": "autocomplete"},
      });

      this.editor.on('change', editor => {
        this.$emit('update:modelValue', editor.getValue());
      });

      this.editor.on('keydown', this.keyDown);
    },
    keyDown(editor, e) {
      let k = e.key.toLowerCase();

      if (k === 'tab' && editor.hasFocus()) {
        let cursor = editor.getCursor(),
            line = editor.getLine(cursor.line),
            str = line.substring(0, cursor.ch),
            sl = str.length;

        if (str[sl - 1] && /[a-z]/.test(str[sl - 1])) {
          const word = /[a-z]+$/.exec(str)[0];

          // если перед словом знак открытие тега ничего не делать
          if (str[sl - word.length - 1] !== '<') {
            let data = editor.getValue().split('\n'),
                scroll = editor.getScrollInfo();
            data[cursor.line] = str.substring(0, sl - word.length) + '<' + word + '></' + word + '>' + line.substr(sl + 1);

            editor.setValue(data.join('\n'));
            editor.setCursor(cursor.line, cursor.ch + 1);
            editor.scrollTo(scroll.left, scroll.top);
          }
        }
      }
    },
  },
  mounted() {
    this.init();
  },
  unmounted() {
    this.editor.display.wrapper.style.display = 'none';
  }
}
</script>
