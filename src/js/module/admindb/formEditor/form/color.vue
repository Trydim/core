<template>
  <input type="color" class="cell-control py-1" style="height: 18px"
         :disabled="cell.param.disabled"
         v-model="value"
  >
</template>

<script>
export default {
  name: "input-color",
  props: {
    modelValue: {},
    cell: Object,
  },
  emits: ['update:modelValue'],
  computed: {
    value: {
      get() { return this.modelValue },
      set(v) { this.$emit('update:modelValue', v) }
    }
  },
  methods: {},
}
</script>
