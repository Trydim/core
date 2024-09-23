<template>
  <div>
    <template v-if="multiple">
      <input type="text" class="cell-control" :disabled="disabled" :value="value" @click="show = true">

      <Modal v-if="show" :title @confirm="confirm" @cancel="$emit('close')" v-model:show="show">
        <select class="d-block cell-control w-75 mx-auto" multiple v-model="modalValue">
          <option v-for="(v, i) of props" :key="i" :value="v[0]">{{ v[1] }}</option>
        </select>
      </Modal>
    </template>
    <select v-else class="cell-control" :disabled="disabled" v-model="value">
      <option v-for="(v, i) of props" :key="i" :value="v[0]">{{ v[1] }}</option>
    </select>
  </div>
</template>

<script>

import Modal from "../../contentEditor/Modal";

export default {
  name: "simple-list",
  components: {Modal},
  props: {
    modelValue: {},
    cell: Object,
  },
  data() {
    const p = this.cell.param,
          props = new Map();

    props.set('', '');
    Object.entries(p.props).forEach(([k, v]) => {
      props.set(k, v);
    });

    if (!props.has(this.modelValue)) props.set(this.modelValue, this.modelValue);

    return {
      disabled: p.disabled,
      multiple: p.multiple,
      props: [...props.entries()],

      show: false,
      modalValue: this.modelValue.split(',').map(i => i.trim()),
    };
  },
  emits: ['update:modelValue'],
  computed: {
    value: {
      get() { return this.modelValue },
      set(v) { this.$emit('update:modelValue', v) },
    },

    title() { return window._(this.cell.param.list); },
  },
  methods: {
    confirm() {
      this.$emit('update:modelValue', this.modalValue.join(', '));
    },
  },
}
</script>
