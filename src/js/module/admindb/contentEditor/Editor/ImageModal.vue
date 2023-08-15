<template>
  <Modal
    title="Вставка картинки"
    @confirm="confirmImage"
    @cancel="$emit('close')"
  >
    <div class="row form-floating">
      <input type="text" id="imgSrc" class="form-control" placeholder="Путь" v-model="src">
      <label for="imgSrc">Путь</label>
    </div>
    <div class="row gap-2 mt-2">
      <input ref="file" hidden type="file" @change="addFile">
      <button type="button" class="col btn btn-light" @click="uploadImage">
        <i class="pi pi-upload"></i>
        Загрузить
      </button>
      <button v-if="false" type="button" class="col btn btn-light" @click="selectImage">
        <i class="pi pi-folder"></i>
        Выбрать
      </button>
    </div>
  </Modal>
</template>

<script>

import Modal from '../Modal.vue';

export default {
  name: 'image-modal',
  props: {},
  components: {Modal},
  emits: ['image', 'close'],
  data: () => ({
    src: '',
    files: undefined,
    queryParam: {
      id: undefined,
      file: undefined,
    },
  }),
  watch: {},
  methods: {
    query() {
      let data = new FormData(),
          fl = this.queryParam;

      data.set('mode', 'DB');
      data.set('dbAction', 'uploadFiles');

      if (fl.file instanceof File) data.append('files' + fl.id, fl.file, fl.name);
      else data.set('files' + fl.id, fl.toString());

      return f.Post({data}).then(async data => {
        if (data.status) {
          delete data.status;
          return Object.values(data)[0]['uri'];
        }
        return 'save file error';
      });
    },
    clearFiles() {
      const input = document.createElement('input');
      input.type = 'file';
      this.$refs.file.files = input.files;
    },

    addFile() {
      Object.values(this.$refs.file.files).forEach(file => {
        let error = file.size > 1024*1024,
            name = f.transLit(file.name.toLowerCase());

        if (!error) this.src = name;

        this.queryParam = {
          id: f.random(),
          file, name, error,
        };
      });
      this.clearFiles();
    },

    uploadImage() {
      this.$refs.file.click();
    },
    selectImage() {

    },

    async confirmImage() {
      if (this.queryParam.id) {
        this.src = await this.query();
      }

      this.$emit('image', this.src);
    }
  },
  mounted() {},
}
</script>
