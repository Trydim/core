<template>
  <div>
    <div class="radio-group">
      <label class="radio-group__item">
        <input type="radio" hidden value="set" v-model="type">
        <span class="radio-group__span">Установить</span>
      </label>
      <label class="radio-group__item">
        <input type="radio" hidden value="change" v-model="type">
        <span class="radio-group__span">Изменить</span>
      </label>
    </div>
    <div class="radio-group mt-2">
      <label class="radio-group__item">
        <input type="radio" hidden value="absolute" v-model="valueType">
        <span class="radio-group__span">Значение</span>
      </label>
      <label class="radio-group__item">
        <input type="radio" hidden value="relative" v-model="valueType">
        <span class="radio-group__span">Проценты</span>
      </label>
    </div>

    <input type="text" class="control-input mt-2" v-model="value">

    <div class="d-flex justify-content-between mt-4 gap-4">
      <button type="button" class="col btn btn-white" @click="applyChange">Применить</button>
      <button type="button" class="col btn btn-white" @click="undoChanges">Отменить</button>
      <button type="button" class="col-2 btn btn-gray" title="Снять выделение" @click="clearSelected">
        <i class="pi pi-times"></i>
      </button>
    </div>
  </div>
</template>

<script>

export default {
  name: "CellChanger",

  emits: ['apply', 'undo', 'clear'],
  data() {
    return {
      type: 'set',
      valueType: 'absolute', // Значение или проценты
      value: '',
    };
  },
  methods: {
    applyChange() {
      this.$emit('apply', {
        type     : this.type,
        valueType: this.valueType,
        value    : this.value,
      });
    },
    undoChanges() { this.$emit('undo') },
    clearSelected() { this.$emit('clear') },
  }
}
</script>
