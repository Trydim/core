<template>
  <div class="col-6 border" id="otherForm">
    <h3 class="col text-center">{{ $t('Other') }}</h3>
    <div class="form-floating mb-3" v-tooltip.bottom="this.$t('For the mask, use _. Leave blank to disable')">
      <p-input-text v-model="phoneMask.global" class="form-control" placeholder="_"></p-input-text>
      <label>{{ $t('Phone mask') }}</label>
    </div>
    <!--<div class="form-floating mb-3">
      <p-input-text v-model="phoneMask.Customers" class="form-control" placeholder="_"
      ></p-input-text>
      <label>Шаблон телефона для клиентов</label>
    </div>
    <div class="form-floating mb-3">
      <p-input-text v-model="phoneMask.global" class="form-control" placeholder="_"></p-input-text>
      <label>Шаблон телефона для остальных пользователей</label>
    </div>-->

    <template v-if="haveCatalogPage">
      <div class="input-group mb-3">
        <span class="input-group-text col-8">
          Макс. размер исходного изображения, px (ш*в)
          <i class="ms-1 pi pi-info-circle" v-tooltip.bottom="'При сохранении изображений через каталог, файл будет уменьшен до указанных размеров. По умолчанию: 1000х1000'"></i>
        </span>
        <p-input-text v-model="catalogImageSize.maxHeight" class="form-control"></p-input-text>
        <p-input-text v-model="catalogImageSize.maxWidth" class="form-control"></p-input-text>
      </div>
      <div class="input-group mb-3">
        <div class="input-group-text col-1">
          <p-checkbox id="createMiniImage" v-model="catalogImageSize.createPrev" :binary="true"></p-checkbox>
        </div>
        <label class="input-group-text col" for="createMiniImage">
          Формировать мини-изображение
          <i class="ms-1 pi pi-info-circle" v-tooltip.bottom="'При сохранении изображений через каталог, будет создана миниатюра. По умолчанию: 300x300'"></i>
        </label>
      </div>
      <div v-if="catalogImageSize.createPrev" class="input-group mb-3">
        <span class="input-group-text col-8">Макс. Размер миниаютюры, px (ш*в)</span>
        <p-input-text v-model="catalogImageSize.prevMaxHeight" class="form-control"></p-input-text>
        <p-input-text v-model="catalogImageSize.prevMaxWidth" class="form-control"></p-input-text>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: "other",
  props: {
    propOtherFields: {
      required: true,
      type: Object,
    },
  },
  emits: ['update'],
  data: () => ({
    haveCatalogPage: false,
    phoneMask: undefined,

    catalogImageSize: {
      maxHeight: 1000,
      maxWidth: 1000,
      createPrev: false,
      prevMaxHeight: 300,
      prevMaxWidth: 300,
    },
  }),
  methods: {
    emit() {
      this.$emit('update', {
        phoneMask: this.phoneMask,
        catalogImageSize: this.catalogImageSize,
      });
    },
  },
  created() {
    this.phoneMask = this.propOtherFields.phoneMask || this.phoneMask;
    this.catalogImageSize = this.propOtherFields.catalogImageSize || this.catalogImageSize;

    this.$watch('phoneMask', {
      deep: true,
      handler: this.emit,
    });
    this.$watch('catalogImageSize', {
      deep: true,
      handler: this.emit,
    });
  },
  mounted() {
    this.haveCatalogPage = !!f.qS('[value="catalogPage"]');
  },
}
</script>
