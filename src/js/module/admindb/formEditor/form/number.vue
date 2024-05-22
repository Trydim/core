<template>
  <input type="number" class="cell-control text-end"
         :min="min" :step="step" :max="max"
         :disabled="disabled"
         v-model="value"
         @change="change"
  >
</template>

<script>

export default {
  name: "input-number",
  props: {
    modelValue: {},
    cell: Object,
  },
  emits: ['update:modelValue'],
  data() {
    const p = this.cell.param;

    return {
      min : p.min || 0,
      step: p.step || 1,
      max : p.max || 1e12,
      disabled: p.disabled || 0,
    };
  },
  computed: {
    fraction() { return this.step.toString().split('.')[1].length },

    value: {
      get() { return this.modelValue },
      set(v) { this.$emit('update:modelValue', v) }
    }
  },
  methods: {
    validateValue(value) {
      if (this.min !== null && value < +this.min) return this.min;
      if (this.max !== null && value > +this.max) return this.max;

      return (Math.round(value / this.step) * this.step).toFixed(this.fraction);
    },

    change(e) {
      this.value = e.target.value = this.validateValue(+e.target.value);
    },
  },
}

</script>
