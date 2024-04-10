<template>
  <div class="row">
    <div class="col-6 p-0">
      <input type="radio" class="btn-check" id="changeTypeS" value="set" v-model="type">
      <label class="btn btn-outline-primary w-100" for="changeTypeS">Установить</label>
    </div>
    <div class="col-6 p-0">
      <input type="radio" class="btn-check" id="changeTypeC" value="change" v-model="type">
      <label class="btn btn-outline-primary w-100" for="changeTypeC">Изменить</label>
    </div>
  </div>
  <div class="row mt-2">
    <div class="col-6 p-0">
      <input type="radio" class="btn-check" id="changeValueA" value="absolute" v-model="valueType">
      <label class="btn btn-outline-primary w-100" for="changeValueA">Значение</label>
    </div>
    <div class="col-6 p-0">
      <input type="radio" class="btn-check" id="changeValueP" value="relative" v-model="valueType">
      <label class="btn btn-outline-primary w-100" for="changeValueP">Проценты</label>
    </div>
  </div>
  <div class="row mt-2">
    <input type="text" class="form-control" v-model="value">
  </div>
  <div class="row mt-2">
    <button type="button" class="col-12 btn btn-primary" @click="applyChange">Применить</button>
  </div>
  <div class="row mt-2">
    <button type="button" class="col-6 btn btn-info" title="Снять выделение" @click="clearSelected">
      <i class="pi pi-times"></i>
    </button>
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
