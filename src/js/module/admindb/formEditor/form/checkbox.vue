<template>
  <input type="checkbox" class="cell-control"
         :disabled="cell.param.disabled"
         v-model="value"
  >
</template>

<script>
export default {
  name: "input-checkbox",
  props: {
    modelValue: {},
    cell: Object,
  },
  emits: ['update:modelValue'],
  computed: {
    value: {
      get() { return this.modelValue === '+' },
      set(v) { this.$emit('update:modelValue', v ? '+' : '-' ) }
    },
  },
  methods: {},
}
</script>
