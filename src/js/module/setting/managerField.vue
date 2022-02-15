<template>
  <div class="col-6 border" id="managerForm">
    <h3 class="col-12 text-center">Настройки менеджеров</h3>

    <div class="input-group my-3">
      <span class="input-group-text flex-grow-1">Дополнительные поля менеджеров</span>
      <p-button v-tooltip.bottom="'Добавить новое поле'" icon="pi pi-plus-circle" class="p-button-success"
                @click="addField"></p-button>
    </div>

    <template v-for="(item, key) of managerFields" :key="key">
      <div class="input-group mb-1">
        <p-input-text v-model="item.name" class="form-control"
        ></p-input-text>
        <p-select option-label="name" option-value="id"
                  :options="managerFieldTypes"
                  v-model="item.type"
                  class="col-5"
        ></p-select>
        <p-button v-tooltip.bottom="'Удалить поле'" icon="pi pi-times" class="p-button-danger"
                  @click="removeField(key)"></p-button>
      </div>
    </template>
  </div>
</template>

<script>

export default {
  props: {
    propFields: {
      required: true,
      type: Object,
    },
  },
  emits: ['update'],
  data: () => ({
    managerFields: {},

    managerFieldTypes: [
      {id: 'text', name: 'Текст (~200 символов)'},
      {id: 'textarea', name: 'Текст (много)'},
      {id: 'number', name: 'Число'},
      {id: 'date', name: 'Дата'},
    ],
  }),
  methods: {
    addField() {
      const rand = 'cf' + ((Math.random() * 1e8) | 0);
      this.managerFields[rand] = {name: 'Поле-' + rand, type: 'text'};
    },
    removeField(id) {
      delete this.managerFields[id];
    },
  },
  created() {
    this.managerFields = this.propFields;

    this.$watch('managerFields', {
      deep: true,
      handler() { this.$emit('update', this.managerFields) },
    });
  },
}
</script>
