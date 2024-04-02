<template>
  <div class="container-fluid row">
    <div class="col-8">
      <!-- Спойлеры -->

      <div class="grid" :style="'--bs-columns: ' + columns">
        <!-- Шапка а наверное и не нужна -->
        <!--<div v-for="(head, k) of header" :key="k">
          {{ head }}
        </div>-->
        <!-- Содержимое -->
        <template v-for="(row, i) of contentData" :key="i">
          <div v-for="(cell, j) of row" :key="j">{{ cell }}</div>
        </template>
      </div>
    </div>
    <div class="col-4">

    </div>
  </div>
</template>

<script>

//import Modal from "../contentEditor/Modal";

export default {
  name: "FormsTable",
  components: {},
  data() {
    return {
      showModal: false,

      contentData: this.$db.contentData,
      contentConfig: this.$db.contentConfig || {},
      contentProperties: this.$db.contentProperties || {},

      selected: {},
      param: {
        type: 'string',
      },
    };
  },
  computed: {
    columns() {
      return 5; // как-то это высчитывать
    },

    header() {
      debugger
      return this.contentData[0]
    },
  },
  watch: {},
}
</script>
