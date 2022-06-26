<template>
  <ul class="nav nav-tabs">
    <li v-for="(item, key) of contentData" :key="key" class="nav-item" style="cursor: pointer"
        @click="selectSection(key)">
      <span class="nav-link" :class="{'active': selected === key}">
        {{ item.name }}
        <i class="ms-3 mt-1 pi pi-cog float-end" @click.stop="toggleSection(key)"></i>

        <span v-if="showSectionEditor(key)">
          <label class="d-flex align-items-center justify-content-around">
            <span>Название</span>
            <input type="text" class="ms-1" v-model="item.name" @blur="changeSection($event.target, key)">
            <i v-if="count > 1" class="ms-3 pi pi-trash" @click.stop="deleteField(key, item)"></i>
            <i class="ms-3 pi"
               :class="{'pi-lock': item.locked, 'pi-lock-open': !item.locked}"
               @click.stop="item.locked = !item.locked"
            ></i>
          </label>
        </span>
      </span>
    </li>
    <li class="nav-item">
      <button class="btn btn-primary" @click="addSection()"><i class="mt-2 pi pi-plus-circle"></i></button>
    </li>
  </ul>
</template>

<script>
export default {
  name: "Section",
  props: {
    modelValue: String,
    contentData: Object
  },
  emits: ['update:modelValue'],
  data: () => ({
    interface: {},

    selected: undefined,
  }),
  watch: {
    selected() {
      this.update();
    },
  },
  computed: {
    keys() {
      return Object.keys(this.contentData);
    },
    count() {
      return this.keys.length;
    }
  },
  methods: {
    setLoadedData() {
      if (this.count === 0) this.addSection();
      else this.selectSection();
    },

    selectSection(key = this.keys[0]) {
      this.selected = key;
    },
    addSection() {
      const name = 'Раздел' + f.random(2),
            code = f.transLit(name);

      this.contentData[code] = {name, fields: {}};
      this.$nextTick(() => this.selectSection(code));
    },
    toggleSection(key) {
      this.interface['sec' + key] = !this.interface['sec' + key];
    },
    showSectionEditor(key) {
      return this.interface['sec' + key];
    },
    changeSection(t, key) {
      const code = f.transLit(t.value);

      if (code === key) return;

      this.contentData[code] = this.contentData[key];
      delete this.contentData[key];

      if (this.selected === key) this.selected = code;
    },
    deleteField(key, item) {
      if (item.locked) {
        f.showMsg('Снимите защиту от удаления', 'error');
        return;
      }

      new f.Toast().confirm('Удалить закладку со всеми значениями?', () => {
        delete this.contentData[key];
        if (this.selected === key) this.selectSection();
      });
    },

    update() {
      this.$emit('update:modelValue', this.selected);
    },
  },
  created() {},
  mounted() {
    this.setLoadedData();
  }
}
</script>
