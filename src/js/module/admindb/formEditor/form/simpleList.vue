<template>
  <select class="cell-control" :disabled="disabled" v-model="value">
    <option v-for="(v, k) of props" :key="k" :value="k">{{ v }}</option>
  </select>
</template>

<script>
export default {
  name: "simple-list",
  props: {
    modelValue: {},
    cell: Object,
  },
  data() {
    const p = this.cell.param;

    return {
      disabled: p.disabled,
      props: p.props,
    };
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
