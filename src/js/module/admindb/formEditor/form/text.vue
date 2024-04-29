<template>
  <input type="text"
         class="form-control form-control-sm"
         :disabled="cell.param.disabled"
         v-model="value"
  >
</template>

<script>
export default {
  name: "input-text",
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
