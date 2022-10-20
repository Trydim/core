<template>
  <Search :contentData="contentData" v-model:section="selectedSection" v-model:field="selectedField"></Search>

  <Section :contentData="contentData" v-model="selectedSection"></Section>

  <div class="row">
    <div class="col-4">
      <Fields v-if="selectedSection" ref="fields"
              :selectedSection="selectedSection"
              :contentData="contentData"
              v-model="selectedField"
      ></Fields>
    </div>
    <div class="col-8">
      <div>
        <h5 class="d-flex justify-content-center">
          <ul class="nav nav-pills" style="cursor: pointer">
            <li class="nav-item">
              <span class="nav-link"
                    :class="{active: !editorTypeHtml}"
                    @click="editorTypeHtml = false">Редактор</span>
            </li>
            <li class="nav-item">
              <span class="nav-link"
                    :class="{active: editorTypeHtml}"
                    @click="editorTypeHtml = true">Разметка</span>
            </li>
          </ul>
        </h5>
        <Editor v-if="editorTypeHtml === false && value" v-model="value" :newValue="newValue"></Editor>
        <keep-alive v-if="editorTypeHtml">
          <CodeMirror v-if="value" v-model="value"></CodeMirror>
        </keep-alive>
      </div>
      <div class="d-flex flex-column align-items-center mt-1">
        <h5 class="nav nav-pills">
          <span class="nav-item">
            <span class="nav-link">Предпросмотр</span>
          </span>
        </h5>
        <Preview :content="value"></Preview>
      </div>
    </div>
  </div>
</template>

<script>

import Search from "./Search.vue";
import Section from "./Section.vue";
import Fields from "./Fields.vue";
import Editor from "./Editor/Editor.vue";
import CodeMirror from "./codeMirror/CodeMirror.vue";
import Preview from "./Preview.vue";

export default {
  name: 'app',
  components: {
    Search,
    Section,
    Editor,
    CodeMirror,
    Fields,
    Preview,
  },
  data: () => ({
    newValue: 1,
    value: undefined,
    editorTypeHtml: false,

    selectedSection: '',
    selectedField: '',
    contentData: {},
  }),
  watch: {
    value() {
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
    this.$nextTick(() => {
      this.$watch('contentData', {deep: true, handler: () => this.$db.enableBtnSave()});
    });
  },
}
</script>

<style>
#preview li {
  list-style: inherit !important;
}
</style>
