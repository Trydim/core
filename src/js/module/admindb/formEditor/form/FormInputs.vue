<script>
import InputText from "./text.vue";
import InputNumber from "./number.vue";
import InputCheckbox from "./checkbox.vue";
import InputColor from "./color.vue";
import SimpleList from "./simpleList.vue";
import CustomEvent from "./custom.vue";

export default {
  name: "FormInputs",
  components: {
    InputColor, InputCheckbox, InputText, InputNumber,
    SimpleList, CustomEvent,
  },
  props: {
    modelValue: {},
    component: {
      required: true,
      type: String,
    },
    cellValue: {},
    cell: Object,
  },
  emits: ['update:cellValue', 'update:modelValue'],
  computed: {
    componentName() {
      switch (this.component) {
        default: case 'string': return 'InputText';
        case 'number':      return 'InputNumber';
        case 'checkbox':    return 'InputCheckbox';
        case 'color':       return 'InputColor';
        case 'simpleList':  return 'SimpleList';
        case 'customEvent': return 'CustomEvent';
      }
    },

    _cellValue: {
      get() { return this.cellValue },
      set(v) { this.$emit('update:cellValue', v) },
    },
    _modelValue: {
      get() { return this.modelValue },
      set(v) { this.$emit('update:modelValue', v) },
    }
  },
}

</script>

<template>
  <component :is="componentName" :cell v-model:cell="_cellValue" v-model="_modelValue"/>
</template>
