<template>
  <Search :contentData="contentData" v-model:section="selectedSection" v-model:field="selectedField"></Search>

  <Section :contentData="contentData" v-model="selectedSection"></Section>

  <div class="row">
    <div class="col-2">
      <Fields v-if="selectedSection" ref="fields"
              :selectedSection="selectedSection"
              :contentData="contentData"
              v-model="selectedField"
      ></Fields>
    </div>
    <div class="col-5">
      <h5 class="text-center">Редактор</h5>
      <Editor v-if="value" v-model="value" :newValue="newValue"></Editor>
    </div>
    <div class="col-5 d-flex flex-column align-items-center">
      <h5>Предпросмотр</h5>
      <div class="w-100 border bg-white flex-grow-1" v-html="value"></div>
    </div>
  </div>
</template>

<script>

import Search from "./Search.vue";
import Section from "./Section.vue";
import Fields from "./Fields.vue";
import Editor from "./Editor.vue";

export default {
  name: 'app',
  components: {
    Search,
    Section,
    Editor,
    Fields
  },
  data: () => ({
    newValue: 1,
    value: undefined,

    selectedSection: '',
    selectedField: '',
    contentData: {},
  }),
  watch: {
    value() {
      while (this.value.includes('"')) {
        this.value = this.value.replace('"', '«');
        this.value = this.value.replace('"', '»');
      }

      this.fields[this.selectedField].value = this.value;
    },

    selectedField() {
      this.value = this.fields[this.selectedField].value;
      this.newValue = f.random();
    },
  },
  computed: {
    fields() {
      return this.contentData[this.selectedSection].fields;
    },
  },
  methods: {},
  created() {
    this.contentData = this.$db.contentData;
  },
  mounted() {
    this.$watch('value', () => {
      this.$db.enableBtnSave();
    });
  },
}
</script>
