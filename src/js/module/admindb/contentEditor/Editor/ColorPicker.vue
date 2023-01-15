<template>
  <input type="color" class="position-fixed"
         :style="style"
         v-model="value"
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
  emits: ['update:modelValue'],
  data: () => ({
    value,
  }),
  computed: {
    style() {
      const editorSize = this.editor.rootEl.getBoundingClientRect();
      return `top: ${editorSize.top}px; left: ${editorSize.left + editorSize.width / 2 - 50}px; width: 100px`;
    }
  },
  watch: {
    value() {
      this.$emit('update:modelValue', this.value);
    },
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
  created() {
    this.value = this.modelValue;
  },
  mounted() {},
}

</script>
