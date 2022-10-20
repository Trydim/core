<template>
  <input type="color" class="position-fixed"
         :style="style"
         v-model="modelValue"
         @blur="colorPick"
  >
</template>

<script>

export default {
  name: 'colorPicker',
  props: {
    modelValue: String,
    editor: Object,
  },
  data: () => ({}),
  computed: {
    style() {
      const editorSize = this.editor.rootEl.getBoundingClientRect();
      return `top: ${editorSize.top}px; left: ${editorSize.left + editorSize.width / 2 - 50}px; width: 100px`;
    }
  },
  methods: {
    colorPick() {
      this.$emit('update:modelValue', this.modelValue);
      this.close();
    },

    close() {
      this.$emit('close');
    },
  },
  mounted() {},
}

</script>
