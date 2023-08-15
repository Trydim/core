<template>
  <nav class="nav nav-pills flex-column my-1">
    <span v-for="(item, key) of fields" :key="key"
       class="nav-link" style="cursor: pointer"
       :class="{'active': this.selected === key}"
       @click="selectField(key)"
    >
      {{ item.name }}
      <i class="ms-3 mt-1 pi pi-cog float-end" @click.stop="toggleField(key)"></i>

      <template v-if="showFieldEditor(key)">
        <label class="d-flex align-items-center">
          <span class="col-4">Ключ</span>
          <input type="text" class="ms-1 col-6" :value="key"
                 :disabled="item.locked"
                 @blur="changeKey($event.target, key, item)">
          <i class="ms-3 pi pointer"
             :class="{'pi-lock': item.locked, 'pi-lock-open': !item.locked}"
             @click.stop="item.locked = !item.locked"
          ></i>
        </label>

        <label class="d-flex align-items-center">
          <span class="col-4">Название</span>
          <input type="text" class="ms-1 col-6" v-model="item.name" @blur="changeField($event.target, key)">
          <i v-if="count > 1" class="ms-auto pi pi-trash pointer" @click.stop="deleteField(key, item)"></i>
        </label>
      </template>
    </span>
  </nav>
  <button class="btn btn-primary w-100" @click="addField()"><i class="mt-2 pi pi-plus-circle"></i></button>
</template>

<script>
export default {
  name: "Fields",
  props: {
    selectedSection: String,
    modelValue: String,
    contentData: Object
  },
  emits: ['update:modelValue'],
  data: () => ({
    defaultContent: '<p>Content</p>',
    interface: {},

    lastSelected: {},

    selected: undefined,
  }),
  watch: {
    selectedSection: {
      immediate: true,
      handler() {
        if (this.count === 0) this.addField();
        else this.selectField();
      },
    },
    selected: {
      immediate: true,
      handler() {
        this.update();
      },
    },
  },
  computed: {
    fields() {
      return this.contentData[this.selectedSection].fields;
    },
    keys() {
      return Object.keys(this.fields);
    },
    count() {
      return this.keys.length;
    },
  },
  methods: {
    checkNewKey(t) {
      if (Object.keys(this.fields).includes(t.value)) {
        f.showMsg('Key exist!', 'error');
        t.value = key;
        t.focus();
        t.select();
        return true;
      }
      return false;
    },

    selectField(key = this.lastSelected[this.selectedSection] || this.keys[0]) {
      this.lastSelected[this.selectedSection] = this.selected = key;
    },
    addField() {
      const name = 'Значение' + f.random(2),
            code = f.transLit(name);

      this.fields[code] = {name, value: this.defaultContent};
      this.selectField(code);
      this.toggleField(code);
    },
    toggleField(key) {
      this.interface['field' + key] = !this.interface['field' + key];
    },
    showFieldEditor(key) {
      return this.interface['field' + key];
    },
    changeKey(t, key) {
      if (t.value === key || this.checkNewKey(t)) return;

      this.fields[t.value] = this.fields[key];
      this.interface['field' + t.value] = true;
      delete this.fields[key];
      delete this.interface['field' + key];

      if (this.selected === key) this.selected = t.value;
    },
    changeField(t, key) {
      /*const code = f.transLit(t.value);

      if (code === key) return;

      this.fields[code] = this.fields[key];
      delete this.fields[key];

      if (this.selected === key) this.selected = code;*/
    },
    deleteField(key, item) {
      if (item.locked) { f.showMsg('Снимите защиту от удаления', 'error'); return; }

      new f.Toast().confirm('Удалить поле', () => {
        delete this.fields[key];
        if (this.selected === key) this.selectField();
      });
    },

    update() {
      this.$emit('update:modelValue', this.selected);
    },
  },
}
</script>
