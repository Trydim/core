<template>
  <select class="w-100" :disabled="cell.param.disabled" v-model="value">
    <option v-for="(v, k) of cell.param.props" :key="k" :value="k">{{ v }}</option>
  </select>
</template>

<script>
export default {
  name: "simple-list",
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
