<template>
  <input type="number" class="cell-control text-end"
         :min="cell.param.min || 0"
         :max="cell.param.max || 1e12"
         :step="cell.param.step || 1"
         :disabled="cell.param.disabled"
         :value="cell.value">
</template>

<script>

export default {
  name: "input-number",
  props: {
    cell: Object,
  },
  emits: ['update:modelValue'],
  data() {
    return {
      value: this.cell.value,
    };
  },
  watch: {
    value() {
      this.$emit('update:modelValue', this.value);
    },
  },
  methods: {
  },
}

</script>
