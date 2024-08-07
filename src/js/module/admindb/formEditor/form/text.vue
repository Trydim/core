<template>
  <input type="text"
         class="cell-control"
         :disabled="cell.param.disabled"
         v-model="value"
  >
</template>

<script>
export default {
  name: "input-text",
  props: {
    modelValue: {},
    cell: Object,
  },
  emits: ['update:cell', 'update:modelValue'],
  computed: {
    value: {
      get() { return this.modelValue },
      set(v) {
        this.$emit('update:cell', v);
        this.$emit('update:modelValue', v);
      }
    }
  },
  methods: {},
}
</script>
