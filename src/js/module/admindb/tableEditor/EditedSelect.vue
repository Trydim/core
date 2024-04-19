<template>
  <div class="position-relative bg-white" style="min-height: 60px">
    <input type="text" class="start-0 top-0 m-0 border-end-0" style="width: 90%" v-model="inputV">
    <button type="button" class="btn btn-sm pi pi-plus-circle" @click="addListItem"></button>
    <select class="start-0 top-0 m-0 w-100" v-model="selectV">
      <option v-for="(v, k) of options" :key="k" :value="k">{{ k }}</option>
    </select>
  </div>
</template>

<script>

export default {
  name: "editedSelect",
  props: {
    options: {
      type: Object,
    },
  },
  data() {
    return {
      selectV: '',
      inputV : '',
      isNew  : false,
    };
  },
  computed: {},
  watch: {
    selectV() {
      /*if (this.selectV === 'new') {
        this.isNew  = true;
        this.inputV = '';
      } else {
        this.isNew  = false;
        this.inputV = this.selectV;
      }*/

      this.$emit('update:modelValue', this.selectV);
    },
    inputV() {
      // проверка если инпут пустой
      //this.$emit('list', this.showOptions);
      //this.$emit('update:modelValue', this.inputV);
    },
  },
  methods: {
    update() {},

    addListItem() {
      this.options[this.inputV] = {};
    },
  },
  mounted() {},
}
</script>
