<template>
  <div class="form-editor-changer">
    <div class="col">
      <div class="radio-group mb-2">
        <label class="radio-group__item">
          <input type="radio" hidden value="set" v-model="type">
          <span class="radio-group__span">Установить</span>
        </label>
        <label class="radio-group__item">
          <input type="radio" hidden value="change" v-model="type">
          <span class="radio-group__span">Изменить</span>
        </label>
      </div>
      <div v-show="type === 'change'" class="radio-group mb-2">
        <label class="radio-group__item">
          <input type="radio" hidden value="absolute" v-model="valueType">
          <span class="radio-group__span">Значение</span>
        </label>
        <label class="radio-group__item">
          <input type="radio" hidden value="relative" v-model="valueType">
          <span class="radio-group__span">Проценты</span>
        </label>
        <label class="radio-group__item">
          <input type="radio" hidden value="multi" v-model="valueType">
          <span class="radio-group__span">Умножить</span>
        </label>
      </div>
    </div>

    <div class="col">
      <div v-show="type === 'change' && isFinite(value)" class="radio-group mb-2">
        <span class="radio-group__item">
          <label for="fraction" class="radio-group__span">Округление</label>
        </span>
        <span class="radio-group__item">
          <input type="text" id="fraction" class="radio-group__span" min="0" max="20" v-model.number="fraction">
        </span>
      </div>
      <input type="text" class="control-input mb-2" v-model="value">
    </div>

    <div class="d-flex justify-content-center gap-3 w-100">
      <button type="button" class="col btn btn-white" @click="applyChange">Применить</button>
      <button type="button" class="col btn btn-white" @click="undoChanges">Отменить</button>
      <button type="button" class="col-2 btn btn-gray" title="Снять выделение" @click="clearSelected">
        <i class="pi pi-times"></i>
      </button>
    </div>
  </div>
</template>

<script>

const disabledBtn = (btn) => {
  btn.disabled = true;

  setTimeout(() => btn.disabled = false, 500);
};

export default {
  name: "CellChanger",

  emits: ['apply', 'undo', 'clear'],
  data() {
    return {
      type: 'set',
      valueType: 'absolute', // Значение или проценты
      value: '',
      fraction: 0,
    };
  },
  watch: {
    type() {
      if (this.type === 'set') this.valueType = 'absolute';
    }
  },
  methods: {
    applyChange(e) {
      disabledBtn(e.target);

      this.$emit('apply', {
        type     : this.type,
        valueType: this.valueType,
        value    : this.value,
        fraction : this.fraction,
      });
    },
    undoChanges() { this.$emit('undo') },
    clearSelected() { this.$emit('clear') },
  }
}
</script>
