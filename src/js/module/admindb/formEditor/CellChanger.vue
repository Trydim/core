<template>
  <div>
    <div class="radio-group">
      <label class="radio-group__item">
        <input type="radio" hidden value="set" v-model="change.type">
        <span class="radio-group__span">Установить</span>
      </label>
      <label class="radio-group__item">
        <input type="radio" hidden value="change" v-model="change.type">
        <span class="radio-group__span">Изменить</span>
      </label>
    </div>
    <div class="radio-group mt-2">
      <label class="radio-group__item">
        <input type="radio" hidden value="absolute" v-model="change.valueType">
        <span class="radio-group__span">Значение</span>
      </label>
      <label class="radio-group__item">
        <input type="radio" hidden value="relative" v-model="change.valueType">
        <span class="radio-group__span">Проценты</span>
      </label>
    </div>

    <input type="text" class="control-input mt-2" v-model="change.value">

    <div class="d-flex justify-content-between mt-4 gap-4">
      <button type="button" class="col btn btn-white" @click="applyChange">Применить</button>
      <button type="button" class="col btn btn-gray" title="Снять выделение" @click="clearSelected">
        <i class="pi pi-times"></i>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "CellChanger",

  data() {
    return {
      type: 'set',
      valueType: 'absolute', // Значение или проценты
      value: '',
    };
  },
}
</script>
