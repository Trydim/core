<template>
  <select class="position-fixed form-select" v-model="value" :style="style" @blur="setSize">
    <option v-for="v of sizes" :key="v" :value="v">{{ v }}</option>
  </select>
</template>

<script>

export default {
  name: 'fontSize',
  props: {
    editor: Object,
  },
  data: () => ({
    sizes: [8, 10, 12, 14, 16, 20, 24, 32],
    selectedNode: undefined,
    value: 16,
  }),
  computed: {
    style() {
      const editorSize = this.editor.rootEl.getBoundingClientRect();
      return `top: ${editorSize.top}px; left: ${editorSize.left + editorSize.width / 2 - 50}px; width: 100px`;
    }
  },
  watch: {
    value() {
      this.setSize();
    },
  },
  methods: {
    setSize() {
      let style = this.editor.getAttributes('textStyle');

      if (style.color) {
        let start = style.color.indexOf(';'),
            sfx = start !== -1 ? style.color.slice(start) : '';

        style = style.color.replace(sfx, '');
      } else {
        style = 'initial';
      }

      this.editor.chain().focus().setMark('textStyle', {
        color: style + '; font-size: ' + this.value + 'px'
      }).run();

      this.close();
    },

    close() {
      this.$emit('close');
    },
  },
  mounted() {
    console.log(this.editor.isActive('paragraph'));
  },
}

</script>
