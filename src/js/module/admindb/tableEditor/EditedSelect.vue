<template>
  <div class="position-relative bg-white">
    <select class="position-absolute start-0 top-0 m-0 w-100" v-model="selectV">
      <option v-for="(v, k) of showOptions" :key="k" :value="k">{{ v }}</option>
    </select>
    <input type="text" class="position-absolute start-0 top-0 m-0 border-end-0" style="width: 90%" v-model="inputV">
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
      showOptions: {new: 'Новый'},

      selectV: '',
      inputV : '',
      isNew  : false,
    };
  },
  watch: {
    selectV() {
      if (this.selectV === 'new') {
        this.inputV = '';
        this.isNew  = true;
      } else {
        this.isNew  = false;
        this.inputV = this.selectV;
      }

      //this.update();
    },
    inputV() {
      // проверка если инпут пустой
      this.$emit('list', this.showOptions);
      this.$emit('update:modelValue', this.inputV);
    },
  },
  computed: {
  },
  methods: {
    update() {

    },
  },
  mounted() {
    debugger
    const options = Object.keys(this.options).length ? this.options : {v1: 'v1', v2: 'v2'};

    Object.assign(this.showOptions, options);
  },
}
</script>
