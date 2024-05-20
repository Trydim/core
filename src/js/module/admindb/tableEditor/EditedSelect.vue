<template>
  <div class="edited-select">
    <div class="edited-select__selected" >
      <input type="text" class="edited-select__text" v-model="inputV">

      <i class="edited-select__icon pi pi-plus-circle" @click="addListItem"></i>
      <i class="edited-select__icon pi" :class="open ? 'pi-chevron-up' : 'pi-chevron-down'"
         @click.stop="openOptions"
      ></i>
    </div>

    <div v-show="open" class="edited-select__options">
      <div v-for="(item, i) of options" :key="i" class="base-select__option" @click="selectV = i">{{ i }}</div>
    </div>
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
  emits: ['update:modelValue'],
  data() {
    return {
      open: false,

      selectV: '',
      inputV : '',
      isNew  : false,
    };
  },
  computed: {},
  watch: {
    selectV() {
      if (this.selectV === 'new') {
        this.isNew  = true;
        this.inputV = '';
      } else {
        this.isNew  = false;
        this.inputV = this.selectV;
      }

      this.$emit('update:modelValue', this.selectV);
    },
  },
  methods: {
    update() {},

    addListItem() {
      if (this.inputV === '') return;

      this.options[this.inputV] = this.options[this.selectV];
      delete this.options[this.selectV];
      this.selectV = this.inputV;
    },

    openOptions() {
      this.open = true;

      document.body.addEventListener('click', () => this.open = false, {once: true});
    },
  },
  mounted() {},
}
</script>
