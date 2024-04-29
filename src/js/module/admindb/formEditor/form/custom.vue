<template>
  <div></div>
</template>

<script>

const getCellKey = (i, j) => `s${i}x${j}`;

export default {
  name: "custom-event",
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
    setValue(v) { this.value = v },
  },
  created() {
    const instance = window.AdminDbInstance,
          key = getCellKey(this.cell.rowI, this.cell.cellI);

    if (!instance.customComponents) instance.customComponents = {}

    instance.customComponents[key] = {
      self: this,
      param: this.cell.param,
      setValue: this.setValue,
    };
  },
}
</script>
