<template>
  <p-panel id="otherForm" class="col-12 col-md-6 mb-3 p-0" :header="$t('Other')">
    <p-float-label variant="on" class="d-block mb-3" v-tooltip.bottom="$t('For the mask, use _. Leave blank to disable')">
      <p-input-text id="phoneMaskGlobal" class="w-100" v-model="phoneMask.global" />
      <label for="phoneMaskGlobal">{{ $t('Phone mask') }}</label>
    </p-float-label>
    <!--<div>
      <p-input-text class="w-100" placeholder="" v-model="phoneMask.Customers" />
      <label>Шаблон телефона для клиентов</label>
    </div>
    <div>
      <p-input-text class="w-100" placeholder="" v-model="phoneMask.global" />
      <label>Шаблон телефона для остальных пользователей</label>
    </div>-->

    <template v-if="haveCatalogPage">
      <div class="row g-2 align-items-center mb-3">
        <span class="col-8">
          Макс. размер исходного изображения, px (ш*в)
          <i class="pi pi-info-circle ms-1" v-tooltip.bottom="'При сохранении изображений через каталог, файл будет уменьшен до указанных размеров. По умолчанию: 1000х1000'"></i>
        </span>
        <p-input-text class="col" v-model="catalogImageSize.maxHeight" />
        <p-input-text class="col" v-model="catalogImageSize.maxWidth" />
      </div>
      <div class="d-flex align-items-center gap-3 mb-3">
        <p-checkbox input-id="createMiniImage" v-model="catalogImageSize.createPrev" :binary="true" />
        <label for="createMiniImage">
          Формировать мини-изображение
          <i class="pi pi-info-circle ms-1" v-tooltip.bottom="'При сохранении изображений через каталог, будет создана миниатюра. По умолчанию: 300x300'"></i>
        </label>
      </div>
      <div v-if="catalogImageSize.createPrev" class="row g-2 align-items-center">
        <span class="col-8">Макс. Размер миниаютюры, px (ш*в)</span>
        <p-input-text class="col" v-model="catalogImageSize.prevMaxHeight" />
        <p-input-text class="col" v-model="catalogImageSize.prevMaxWidth" />
      </div>
    </template>
  </p-panel>
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
