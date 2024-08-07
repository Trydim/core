<script>
import InputText from "./text.vue";
import InputNumber from "./number.vue";
import InputCheckbox from "./checkbox.vue";
import InputColor from "./color.vue";
import SimpleList from "./simpleList.vue";
import CustomEvent from "./custom.vue";

export default {
  name: "form-inputs",
  components: {
    InputColor, InputCheckbox, InputText, InputNumber,
    SimpleList, CustomEvent,
  },
  props: {
    component: {
      required: true,
      type: String,
    },
    modelValue: {},
    cell: Object,
  },
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
    }
  }
}

</script>

<template>
  <component :is="componentName" />
</template>
