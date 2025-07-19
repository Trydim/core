<template>
  <Search :contentData="contentData" v-model:section="selectedSection" v-model:field="selectedField" />

  <Section :contentData="contentData" v-model="selectedSection" />

  <div class="row">
    <div class="col-4">
      <Fields v-if="selectedSection" ref="fields"
              :selectedSection="selectedSection"
              :contentData="contentData"
              v-model="selectedField" />
    </div>
    <div class="col-8">
      <div>
        <h5 class="d-flex justify-content-center">
          <ul class="nav nav-pills" style="cursor: pointer">
            <li class="nav-item">
              <span class="nav-link"
                    :class="{active: !editorTypeHtml}"
                    @click="editorTypeHtml = false">{{ $t('Editor') }}</span>
            </li>
            <li class="nav-item">
              <span class="nav-link"
                    :class="{active: editorTypeHtml}"
                    @click="editorTypeHtml = true">{{ $t('Html') }}</span>
            </li>
          </ul>
        </h5>
        <Editor v-if="editorTypeHtml === false && value" v-model="value" :newValue="newValue" />
        <keep-alive v-if="editorTypeHtml">
          <CodeMirror v-if="value" :newValue="newValue" v-model="value" />
        </keep-alive>
      </div>
      <div class="d-flex flex-column align-items-center mt-1">
        <h5 class="nav nav-pills">
          <span class="nav-item">
            <span class="nav-link">{{ $t('Preview') }}</span>
          </span>
        </h5>
        <Preview :content="value" />
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
    locale: f.cookieGet('lang') || f.BASE_LANG,
    editorTypeHtml: false,

    selectedSection: '',
    selectedField: '',
    contentData: {},
  }),
  watch: {
    value() {
      this.fields[this.selectedField]['value_' + this.locale] = this.value;
    },

    selectedField() {
      const field = this.fields[this.selectedField];

      this.value = field['value_' + this.locale] || field.value; // Support old version
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
